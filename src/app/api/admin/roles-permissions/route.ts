
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-middleware';

// GET /api/admin/roles-permissions - Get all roles (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: authError === 'Admin access required' ? 403 : 401 });
    }

    const supabase = await createClient();

    // Fetch roles from database
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(permission),
        users(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    // Transform data to include user count and permissions
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.role_permissions?.map(rp => rp.permission) || [],
      createdAt: role.created_at,
      userCount: role.users?.[0]?.count || 0,
      isActive: role.is_active
    }));

    // Get available permissions from database enum
    const availablePermissions = [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'clients.create', 'clients.read', 'clients.update', 'clients.delete',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete',
      'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
      'projects.create', 'projects.read', 'projects.update', 'projects.delete',
      'load_plans.create', 'load_plans.read', 'load_plans.update', 'load_plans.delete',
      'reports.generate', 'reports.view'
    ];

    return NextResponse.json({ 
      roles: transformedRoles,
      availablePermissions 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/roles-permissions - Create new role (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { user, error: authError } = await requireAdmin(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || 'Unauthorized' 
      }, { status: authError === 'Admin access required' ? 403 : 401 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const { name, permissions, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if role name already exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }

    // Create new role
    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        name,
        is_active: isActive !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionInserts = permissions.map((permission: string) => ({
        role_id: newRole.id,
        permission
      }));

      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (permissionError) {
        console.error('Error adding permissions:', permissionError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ 
      role: {
        id: newRole.id,
        name: newRole.name,
        permissions: permissions || [],
        createdAt: newRole.created_at,
        userCount: 0,
        isActive: newRole.is_active
      }
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
