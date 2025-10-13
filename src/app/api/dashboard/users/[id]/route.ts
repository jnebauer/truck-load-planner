import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        {
          error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Only admin can update users
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const supabase = await createClient();
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const {
      email,
      password,
      fullName,
      role,
      phone,
      profileImage,
      status,
      appPermissions,
      // Client-specific fields
    } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate that user has at least one app permission
    const hasAnyPermission =
      appPermissions && Object.values(appPermissions).some((v) => v === true);

    if (!hasAnyPermission) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.APP_PERMISSION_REQUIRED,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if email already exists for a different user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_EMAIL,
        },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Get role_id from role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Prepare update data
    const updateData: {
      email: string;
      full_name: string;
      phone: string | null;
      profile_image: string | null;
      role_id: string;
      status: 'active' | 'inactive' | 'blocked';
      password_hash?: string;
    } = {
      email,
      full_name: fullName,
      phone: phone || null,
      profile_image: profileImage || null,
      role_id: roleData.id,
      status: (status as 'active' | 'inactive' | 'blocked') || 'active',
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 12);
      updateData.password_hash = passwordHash;
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Update app permissions if provided
    if (appPermissions) {
      // First, get current app permissions
      const { data: apps, error: appsError } = await supabase
        .from('app_permissions')
        .select('id, name')
        .eq('status', 'active')
        .is('deleted_at', null);

      if (appsError || !apps || apps.length === 0) {
        console.error('❌ Error fetching apps:', appsError);
        // Don't fail the update if app permissions fetch fails
      } else {
        // Map app display names to IDs
        const appIdMap: Record<string, string> = {};
        apps.forEach((app) => {
          appIdMap[app.name] = app.id;
        });

        // Helper function to convert camelCase to display name
        const toDisplayName = (camelCase: string): string => {
          return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
        };

        // Soft delete existing permissions (set deleted_at and deleted_by)
        const { error: deleteError } = await supabase
          .from('user_app_permissions')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user.id,
          })
          .eq('user_id', userId)
          .is('deleted_at', null);

        if (deleteError) {
          console.error('❌ Error deleting old app permissions:', deleteError);
        }

        // Build new user_app_permissions records dynamically
        const appPermissionsToInsert: Array<{
          user_id: string;
          app_id: string;
          created_by: string;
          updated_by: string;
        }> = [];
        Object.keys(appPermissions).forEach((key) => {
          if (appPermissions[key] === true) {
            const displayName = toDisplayName(key);

            if (appIdMap[displayName]) {
              appPermissionsToInsert.push({
                user_id: userId,
                app_id: appIdMap[displayName],
                created_by: user.id,
                updated_by: user.id,
              });
            }
          }
        });

        // Insert new permissions
        if (appPermissionsToInsert.length > 0) {
          const { error: permError } = await supabase
            .from('user_app_permissions')
            .insert(appPermissionsToInsert);

          if (permError) {
            console.error('❌ Error saving app permissions:', permError);
            // Don't fail user update if permissions fail
          }
        }
      }
    }

    return NextResponse.json({
      message: API_RESPONSE_MESSAGES.SUCCESS.USER_UPDATED,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
