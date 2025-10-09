import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
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
        error: authError || 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user has permission to read users
    if (!user.role || !['admin', 'pm'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to view users' 
      }, { status: 403 });
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
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform the data to include role name
    const transformedUsers = users.map((user: UserWithClients) => ({
      ...user,
      role: user.roles?.name || 'client_viewer'
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: 401 });
    }

    // Only admin can create users
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only administrators can create users' 
      }, { status: 403 });
    }

    const supabase = await createClient();

    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only admin can create admin users
    if (role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create admin users' }, { status: 403 });
    }

    // Get role_id from role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
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
        role_id: roleData.id,
        status: 'active'
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}