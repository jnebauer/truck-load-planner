import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * GET /api/user/permissions
 * Get user permissions from database based on their role
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
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
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
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
    console.error('Error in GET /api/user/permissions:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
