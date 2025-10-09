import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';

// GET /api/user/permissions - Get user permissions from database
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get user's role and permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        role_id,
        roles!inner(
          id,
          name,
          role_permissions(
            permission
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract permissions from role_permissions
    const permissions = userData.roles.role_permissions.map((rp: { permission: string }) => rp.permission);

    return NextResponse.json({
      userId: userData.id,
      roleId: userData.role_id,
      roleName: userData.roles.name,
      permissions
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
