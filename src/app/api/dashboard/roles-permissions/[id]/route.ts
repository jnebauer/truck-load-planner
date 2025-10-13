import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * PUT /api/dashboard/roles-permissions/[id]
 * Update role details and permissions (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Only admin can update roles
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();
    const { name, permissions, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (roleError || !existingRole) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.ROLE_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if new name conflicts with existing role (excluding current role)
    const { data: conflictingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();

    if (conflictingRole) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_ROLE },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update role
    const { data: updatedRole, error: updateError } = await supabase
      .from('roles')
      .update({
        name,
        is_active: isActive !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Update permissions
    if (permissions !== undefined) {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
      }

      // Add new permissions
      if (permissions.length > 0) {
        const permissionInserts = permissions.map((permission: string) => ({
          role_id: id,
          permission
        }));

        const { error: permissionError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts);

        if (permissionError) {
          console.error('Error adding permissions:', permissionError);
        }
      }
    }

    return NextResponse.json({ 
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        permissions: permissions || [],
        createdAt: updatedRole.created_at,
        userCount: 0, // This would need to be fetched separately
        isActive: updatedRole.is_active
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/dashboard/roles-permissions/[id] - Delete role (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Only admin can delete roles
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Check if role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (roleError || !existingRole) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.ROLE_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if role has users assigned
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (usersError) {
      console.error('Error checking users:', usersError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (users && users.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role that has users assigned to it' 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Delete role (permissions will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ 
      message: API_RESPONSE_MESSAGES.SUCCESS.ROLE_DELETED 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
