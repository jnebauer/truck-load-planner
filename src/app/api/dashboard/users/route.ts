import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { sendUserCreatedEmail } from '@/lib/email';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
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

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const supabase = await createClient();

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with pagination
    let usersQuery = supabase
      .from('users')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `, { count: 'exact' });

    // Add search filter if provided
    if (search) {
      usersQuery = usersQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add pagination
    usersQuery = usersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await usersQuery;

    if (error) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Get total counts by status (without search filter)
    const { data: statusCounts, error: statusError, count: totalCount } = await supabase
      .from('users')
      .select('status', { count: 'exact' });

    if (statusError) {
      console.error('Error getting status counts:', statusError);
    }

    // Calculate status counts
    const stats = {
      totalUsers: totalCount || 0, // Use total count, not filtered count
      activeUsers: 0,
      inactiveUsers: 0,
      pendingUsers: 0
    };

    if (statusCounts) {
      statusCounts.forEach((item: { status: string }) => {
        switch (item.status) {
          case 'active':
            stats.activeUsers++;
            break;
          case 'inactive':
            stats.inactiveUsers++;
            break;
          case 'pending':
            stats.pendingUsers++;
            break;
        }
      });
    }

    // Transform the data to include role name
    const transformedUsers = users.map((user: UserWithClients) => ({
      ...user,
      role: user.roles?.name || 'client_viewer'
    }));

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({ 
      users: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      stats
    });
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

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_EMAIL 
      }, { status: HTTP_STATUS.CONFLICT });
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
