import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';

// PUT /api/dashboard/roles-permissions/[id] - Update role (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: 401 });
    }

    // Only admin can update roles
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only administrators can update roles' 
      }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();
    const { name, permissions, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (roleError || !existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing role (excluding current role)
    const { data: conflictingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();

    if (conflictingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        error: authError || 'Unauthorized' 
      }, { status: 401 });
    }

    // Only admin can delete roles
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only administrators can delete roles' 
      }, { status: 403 });
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
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role has users assigned
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (usersError) {
      console.error('Error checking users:', usersError);
      return NextResponse.json({ error: 'Failed to check role usage' }, { status: 500 });
    }

    if (users && users.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role that has users assigned to it' 
      }, { status: 400 });
    }

    // Delete role (permissions will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Role deleted successfully' 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
