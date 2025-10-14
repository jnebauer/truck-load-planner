import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { HTTP_STATUS, API_RESPONSE_MESSAGES, TOAST_MESSAGES } from '@/lib/backend/constants';

// GET /api/dashboard/projects - List all projects with pagination
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        {
          error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const clientId = searchParams.get('clientId') || ''; // Filter by client

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with pagination
    let projectsQuery = supabase
      .from('projects')
      .select(
        `
        *,
        client:users!projects_client_id_fkey (
          id,
          full_name,
          email,
          company_name
        ),
        creator:users!projects_created_by_fkey (
          id,
          full_name,
          email
        ),
        updater:users!projects_updated_by_fkey (
          id,
          full_name,
          email
        )
      `,
        { count: 'exact' }
      );

    // Add client filter if provided
    if (clientId) {
      projectsQuery = projectsQuery.eq('client_id', clientId);
    }

    // Add search filter if provided
    if (search) {
      projectsQuery = projectsQuery.or(
        `name.ilike.%${search}%,code.ilike.%${search}%,site_address.ilike.%${search}%`
      );
    }

    // Add pagination
    projectsQuery = projectsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: projects, error, count } = await projectsQuery;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Get total counts by status (without search filter)
    let statusQuery = supabase
      .from('projects')
      .select('status', { count: 'exact' });

    // Apply client filter to stats too
    if (clientId) {
      statusQuery = statusQuery.eq('client_id', clientId);
    }

    const { data: statusCounts, error: statusError, count: totalCount } = await statusQuery;

    if (statusError) {
      console.error('Error getting status counts:', statusError);
    }

    // Get clients role ID to count total active clients
    const { data: clientRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'clients')
      .single();

    // Get total active clients count
    let totalClientsCount = 0;
    if (clientRole) {
      const { count: clientsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', clientRole.id)
        .eq('status', 'active');
      
      totalClientsCount = clientsCount || 0;
    }

    // Calculate status counts (only active and on_hold)
    const stats = {
      totalProjects: totalCount || 0,
      totalClients: totalClientsCount,
      activeProjects: 0,
      onHoldProjects: 0,
    };

    if (statusCounts) {
      statusCounts.forEach((item: { status: string }) => {
        switch (item.status) {
          case 'active':
            stats.activeProjects++;
            break;
          case 'on_hold':
            stats.onHoldProjects++;
            break;
        }
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/projects:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/dashboard/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        {
          error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Parse request body
    const {
      clientId,
      name,
      code,
      siteAddress,
      siteLat,
      siteLng,
      sitePlaceId,
      startDate,
      endDate,
      status,
      notes,
    } = await request.json();

    // Validate required fields
    if (!clientId || !name || !code) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Check if project code already exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existingProject) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_PROJECT_CODE,
        },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Create project
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        client_id: clientId,
        name,
        code,
        site_address: siteAddress && siteAddress.trim() !== '' ? siteAddress : null,
        site_lat: siteLat ?? null,
        site_lng: siteLng ?? null,
        site_place_id: sitePlaceId && sitePlaceId.trim() !== '' ? sitePlaceId : null,
        start_date: startDate && startDate.trim() !== '' ? startDate : null,
        end_date: endDate && endDate.trim() !== '' ? endDate : null,
        status: (status as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted') || 'planning',
        notes: notes && notes.trim() !== '' ? notes : null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        client:users!projects_client_id_fkey (
          id,
          full_name,
          email,
          company_name
        ),
        creator:users!projects_created_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating project:', createError);
      return NextResponse.json(
        { error: TOAST_MESSAGES.ERROR.PROJECT_CREATE_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      {
        message: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_CREATED,
        data: newProject,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error in POST /api/dashboard/projects:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

