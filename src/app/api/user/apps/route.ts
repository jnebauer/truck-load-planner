import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import { Database } from '@/lib/supabase/types';

type AppPermissionRow = Database['public']['Tables']['app_permissions']['Row'];

interface UserAppResponse {
  id: string;
  name: string;
  description: string;
  app_url: string;
  status: string;
}

interface UserAppPermissionWithApp {
  app_id: string;
  app_permissions: {
    id: string;
    name: string;
    description: string | null;
    app_url: string | null;
    status: string;
  } | null;
}

/**
 * GET /api/user/apps
 * Get apps that the current user has access to
 * Admins get all active apps, regular users get only assigned apps
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const supabase = await createClient();

    // If user is admin, give access to all active apps
    if (user.role === 'admin') {
      const { data: allApps, error: appsError } = await supabase
        .from('app_permissions' as never)
        .select('id, name, description, app_url, status')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (appsError) {
        console.error('Error fetching all apps:', appsError);
        return NextResponse.json({ 
          error: 'Failed to fetch apps' 
        }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
      }

      const transformedApps: UserAppResponse[] = (allApps as unknown as AppPermissionRow[] || []).map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description || '',
        app_url: app.app_url || '',
        status: app.status,
      }));

      return NextResponse.json({
        success: true,
        userId: user.id,
        apps: transformedApps,
        count: transformedApps.length
      });
    }

    // Get user's assigned app permissions from user_app_permissions table
    const { data: userApps, error } = await supabase
      .from('user_app_permissions' as never)
      .select(`
        app_id,
        app_permissions!user_app_permissions_app_id_fkey (
          id,
          name,
          description,
          app_url,
          status
        )
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching user app permissions:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch app permissions' 
      }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Transform and filter active apps
    const accessibleApps: UserAppResponse[] = (userApps as unknown as UserAppPermissionWithApp[] || [])
      .map((item) => item.app_permissions)
      .filter((app): app is NonNullable<typeof app> => app !== null && app.status === 'active')
      .map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description || '',
        app_url: app.app_url || '',
        status: app.status,
      }));

    return NextResponse.json({
      success: true,
      userId: user.id,
      apps: accessibleApps,
      count: accessibleApps.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
