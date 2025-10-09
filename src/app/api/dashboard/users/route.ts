import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { sendUserCreatedEmail } from '@/lib/email';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/api-constants';
import bcrypt from 'bcryptjs';

interface UserWithClients {
  id: string;
  email: string;
  full_name: string | null;
  role_id: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  roles: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}


export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Check if user has permission to read users
    if (!user.role || !['admin', 'pm'].includes(user.role)) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();

    const usersQuery = supabase
      .from('users')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `);

    const { data: users, error } = await usersQuery;

    if (error) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Transform the data to include role name
    const transformedUsers = users.map((user: UserWithClients) => ({
      ...user,
      role: user.roles?.name || 'client_viewer'
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Only admin can create users
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();

    const { email, password, fullName, role, phone, status } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Only admin can create admin users
    if (role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS }, { status: HTTP_STATUS.FORBIDDEN });
    }

    // Get role_id from role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in our users table
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone: phone || null,
        role_id: roleData.id,
        status: status || 'active'
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Send welcome email to the new user
    try {
      const emailResult = await sendUserCreatedEmail(
        email,
        fullName,
        email,
        password, // Send the plain password for first login
        role
      );

      if (!emailResult.success) {
        console.warn('⚠️ User created but email failed to send:', emailResult.error);
        // Don't fail the user creation if email fails
      }
    } catch (emailError) {
      console.warn('⚠️ User created but email failed to send:', emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json({ message: API_RESPONSE_MESSAGES.SUCCESS.USER_CREATED, userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
