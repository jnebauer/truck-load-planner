import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-middleware';

// PUT /api/admin/roles-permissions/[id] - Update role (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: authError === 'Admin access required' ? 403 : 401 });
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
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role name already exists (excluding current role)
    const { data: duplicateRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();

    if (duplicateRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }

    // Update role
    const { data: updatedRole, error } = await supabase
      .from('roles')
      .update({
        name,
        is_active: isActive !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    // Update permissions
    // First, delete existing permissions
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    // Then add new permissions
    if (permissions && permissions.length > 0) {
      const permissionInserts = permissions.map((permission: string) => ({
        role_id: id,
        permission
      }));

      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (permissionError) {
        console.error('Error updating permissions:', permissionError);
      }
    }

    // Get user count for this role
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    return NextResponse.json({ 
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        permissions: permissions || [],
        createdAt: updatedRole.created_at,
        userCount: userCount || 0,
        isActive: updatedRole.is_active
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/roles-permissions/[id] - Delete role (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: authError === 'Admin access required' ? 403 : 401 });
    }

    const supabase = await createClient();

    const { id } = await params;

    // Check if role exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role has users assigned
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    if (userCount && userCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role with assigned users. Please reassign users first.' 
      }, { status: 400 });
    }

    // Delete role (permissions will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
