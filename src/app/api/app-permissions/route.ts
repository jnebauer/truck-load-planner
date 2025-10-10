import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

// GET /api/app-permissions - Get all app permissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const supabase = await createClient();

    // Get all app permissions with user details
    const { data: permissions, error } = await supabase
      .from('app_permissions')
      .select(`
        id,
        user_id,
        app_id,
        granted_by,
        granted_at,
        expires_at,
        is_active,
        created_at,
        updated_at,
        users!app_permissions_user_id_fkey (
          id,
          email,
          full_name,
          roles (
            name
          )
        ),
        granted_by_user:users!app_permissions_granted_by_fkey (
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching app permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch app permissions' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// POST /api/app-permissions - Grant app permission to user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { userId, appId, expiresAt } = await request.json();

    if (!userId || !appId) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // Check if permission already exists
    const { data: existingPermission } = await supabase
      .from('app_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .single();

    if (existingPermission) {
      return NextResponse.json({ error: 'Permission already exists' }, { status: HTTP_STATUS.CONFLICT });
    }

    // Create new permission
    const { data: permission, error } = await supabase
      .from('app_permissions')
      .insert({
        user_id: userId,
        app_id: appId,
        granted_by: user.id,
        expires_at: expiresAt || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating app permission:', error);
      return NextResponse.json({ error: 'Failed to create app permission' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({
      success: true,
      permission: {
        ...permission,
        user: targetUser
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// PUT /api/app-permissions - Update app permission (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { id, isActive, expiresAt } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Update permission
    const { data: permission, error } = await supabase
      .from('app_permissions')
      .update({
        is_active: isActive,
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        users!app_permissions_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating app permission:', error);
      return NextResponse.json({ error: 'Failed to update app permission' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({
      success: true,
      permission
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// DELETE /api/app-permissions - Revoke app permission (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Delete permission
    const { error } = await supabase
      .from('app_permissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting app permission:', error);
      return NextResponse.json({ error: 'Failed to delete app permission' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({
      success: true,
      message: 'App permission revoked successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
