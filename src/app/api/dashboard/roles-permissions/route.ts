import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

// GET /api/dashboard/roles-permissions - Get all roles (with proper permissions)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Check if user has permission to read roles
    if (!user.role || !['admin', 'pm'].includes(user.role)) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const supabase = await createClient();

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with pagination
    let rolesQuery = supabase
      .from('roles')
      .select(`
        *,
        role_permissions(permission),
        users(count)
      `, { count: 'exact' });

    // Add search filter if provided
    if (search) {
      rolesQuery = rolesQuery.ilike('name', `%${search}%`);
    }

    // Add pagination
    rolesQuery = rolesQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: roles, error, count } = await rolesQuery;

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Get total counts by status (without search filter)
    const { data: allRoles, error: allRolesError, count: totalCount } = await supabase
      .from('roles')
      .select('is_active', { count: 'exact' });

    if (allRolesError) {
      console.error('Error getting total role counts:', allRolesError);
    }

    // Calculate stats
    const stats = {
      totalRoles: totalCount || 0,
      activeRoles: 0,
      inactiveRoles: 0,
      totalPermissions: 0
    };

    if (allRoles) {
      allRoles.forEach((role: { is_active: boolean }) => {
        if (role.is_active) {
          stats.activeRoles++;
        } else {
          stats.inactiveRoles++;
        }
      });
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

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Import available permissions from the permissions file
    const { availablePermissions } = await import('@/lib/permissions');
    
    // Set total permissions count
    stats.totalPermissions = availablePermissions.length;

    return NextResponse.json({ 
      roles: transformedRoles,
      availablePermissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      stats
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// POST /api/dashboard/roles-permissions - Create new role (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Only admin can create roles
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();

    const body = await request.json();
    const { name, permissions, isActive } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Check if role name already exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_ROLE }, { status: HTTP_STATUS.BAD_REQUEST });
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
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionInserts = permissions.map((permission: string) => ({
        role_id: newRole.id,
        permission: permission.trim() // Ensure no extra whitespace
      }));

      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (permissionError) {
        console.error('❌ Error adding permissions:', permissionError);
        return NextResponse.json({ 
          error: API_RESPONSE_MESSAGES.ERROR.INVALID_PERMISSIONS, 
          details: permissionError.message 
        }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
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
    }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// PUT method for updating roles
export async function PUT(request: Request) {
  try {
    const { id, name, permissions, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Update role
    const { data: updatedRole, error: roleError } = await supabase
      .from('roles')
      .update({ 
        name, 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (roleError) {
      console.error('Error updating role:', roleError);
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Delete existing permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError);
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.INVALID_PERMISSIONS }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Add new permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionInserts = permissions.map((permission: string) => ({
        role_id: id,
        permission: permission.trim()
      }));

      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(permissionInserts);

      if (permissionError) {
        console.error('Error adding permissions:', permissionError);
        return NextResponse.json({ 
          error: API_RESPONSE_MESSAGES.ERROR.INVALID_PERMISSIONS, 
          details: permissionError.message 
        }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
      }
    }

    return NextResponse.json({ 
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        permissions: permissions || [],
        createdAt: updatedRole.created_at,
        userCount: 0,
        isActive: updatedRole.is_active
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
