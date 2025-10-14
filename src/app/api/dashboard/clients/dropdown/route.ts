import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * GET /api/dashboard/clients/dropdown
 * Ultra-lightweight endpoint for fetching active clients for dropdown
 * Supports pagination and search
 * Returns only: id, full_name (or company_name as fallback)
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Get clients role ID
    const { data: clientRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'clients')
      .single();

    if (roleError || !clientRole) {
      console.error('Error fetching client role:', roleError);
      return NextResponse.json(
        { error: 'Client role not found in database' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query with pagination and search
    let query = supabase
      .from('users')
      .select('id, full_name, company_name', { count: 'exact' })
      .eq('role_id', clientRole.id)
      .eq('status', 'active');

    // Add search filter if provided
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,company_name.ilike.%${search}%`
      );
    }

    // Add ordering and pagination
    query = query
      .order('company_name', { ascending: true, nullsFirst: false })
      .order('full_name', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data: clients, error, count } = await query;

    if (error) {
      console.error('Error fetching clients for dropdown:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;

    return NextResponse.json({
      clients: clients || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/clients/dropdown:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

