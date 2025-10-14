import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { HTTP_STATUS, API_RESPONSE_MESSAGES } from '@/lib/backend/constants';

/**
 * GET /api/dashboard/projects/dropdown
 * Lightweight endpoint for project dropdowns with search and infinite scroll
 * Returns only id, name, and code for better performance
 */
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
    const offset = (page - 1) * limit;

    // Build lightweight query - only select id, name, code
    let query = supabase
      .from('projects')
      .select('id, name, code', { count: 'exact' })
      .in('status', ['planning', 'active', 'on_hold']); // Only active/planning/on_hold projects

    // Filter by client if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,code.ilike.%${search}%`
      );
    }

    // Add pagination and ordering
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error fetching projects for dropdown:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: projects || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/projects/dropdown:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

