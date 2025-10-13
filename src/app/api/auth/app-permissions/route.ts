import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import { Database } from '@/lib/supabase/types';

/**
 * Types from Database Schema
 */
type AppPermissionRow = Database['public']['Tables']['app_permissions']['Row'];
type AppPermissionInsert =
  Database['public']['Tables']['app_permissions']['Insert'];

/**
 * App Response Type for API
 */
interface AppResponse {
  id: string;
  name: string;
  description: string;
  app_url: string;
  status: string;
}

/**
 * GET /api/app-permissions
 * Fetch all active apps from app_permissions table
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error: authError } = await authenticateUser(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const supabase = await createClient();

    // Fetch all active apps from database
    const { data: apps, error } = await supabase
      .from('app_permissions' as never)
      .select('id, name, description, app_url, status')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching apps:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Transform to match AppResponse interface
    const transformedApps: AppResponse[] = (
      (apps as unknown as AppPermissionRow[]) || []
    ).map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description || '',
      app_url: app.app_url || '',
      status: app.status,
    }));

    return NextResponse.json({
      apps: transformedApps,
      count: transformedApps.length,
    });
  } catch (error) {
    console.error('Error in GET /api/app-permissions:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Create App Request Body Type
 */
interface CreateAppRequest {
  name: string;
  description?: string;
  app_url?: string;
}

/**
 * POST /api/app-permissions
 * Create a new app (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error: authError } = await authenticateUser(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Check if user is admin
    if (!user.role || user.role !== 'admin') {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const supabase = await createClient();
    const body = (await request.json()) as CreateAppRequest;
    const { name, description, app_url } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'App name is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Insert new app
    const appData: AppPermissionInsert = {
      name,
      description: description || null,
      app_url: app_url || null,
      status: 'active',
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: newApp, error } = await supabase
      .from('app_permissions' as never)
      .insert(appData as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating app:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      {
        message: 'App created successfully',
        app: newApp,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error in POST /api/app-permissions:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
