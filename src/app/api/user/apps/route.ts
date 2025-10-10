import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import { getAllActiveAppIds } from '@/components/apps/AppsConfig';

// GET /api/user/apps - Get user's accessible apps
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const supabase = await createClient();

    // If user is admin, give access to all apps
    if (user.role === 'admin') {
      const allApps = getAllActiveAppIds();
      return NextResponse.json({
        success: true,
        userId: user.id,
        accessibleApps: allApps,
        permissions: allApps.map(appId => ({
          app_id: appId,
          granted_at: new Date().toISOString(),
          expires_at: null,
          is_active: true
        }))
      });
    }

    // Get user's app permissions for non-admin users
    const { data: permissions, error } = await supabase
      .from('app_permissions')
      .select(`
        app_id,
        granted_at,
        expires_at,
        is_active
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString()) // Only non-expired permissions
      .or('expires_at.is.null'); // Include permissions without expiration

    if (error) {
      console.error('Error fetching user app permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch app permissions' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Filter out expired permissions
    const validPermissions = permissions?.filter(permission => {
      if (!permission.expires_at) return true;
      return new Date(permission.expires_at) > new Date();
    }) || [];

    // Extract app IDs
    const accessibleApps = validPermissions.map(p => p.app_id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      accessibleApps,
      permissions: validPermissions
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
