import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { HTTP_STATUS, API_RESPONSE_MESSAGES, TOAST_MESSAGES } from '@/lib/backend/constants';

// GET /api/dashboard/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const supabase = await createClient();

    // Fetch project with relations
    const { data: project, error } = await supabase
      .from('projects')
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
        ),
        updater:users!projects_updated_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.PROJECT_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('Error in GET /api/dashboard/projects/[id]:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PATCH /api/dashboard/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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

    // Check if project exists
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, code')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching project:', fetchError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!existingProject) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.PROJECT_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if project code is being changed and if it already exists
    if (code !== existingProject.code) {
      const { data: duplicateProject } = await supabase
        .from('projects')
        .select('id')
        .eq('code', code)
        .neq('id', id)
        .maybeSingle();

      if (duplicateProject) {
        return NextResponse.json(
          {
            error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_PROJECT_CODE,
          },
          { status: HTTP_STATUS.CONFLICT }
        );
      }
    }

    // Update project
    const updateData: {
      client_id: string;
      name: string;
      code: string;
      site_address: string | null;
      site_lat: number | null;
      site_lng: number | null;
      site_place_id: string | null;
      start_date: string | null;
      end_date: string | null;
      status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted';
      notes: string | null;
      updated_by: string;
    } = {
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
      updated_by: user.id,
    };

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
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
        ),
        updater:users!projects_updated_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json(
        { error: TOAST_MESSAGES.ERROR.PROJECT_UPDATE_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      message: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_UPDATED,
      data: updatedProject,
    });
  } catch (error) {
    console.error('Error in PATCH /api/dashboard/projects/[id]:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/dashboard/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const supabase = await createClient();

    // Check if project exists
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching project:', fetchError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!existingProject) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.PROJECT_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Delete project (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json(
        { error: TOAST_MESSAGES.ERROR.PROJECT_DELETE_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      message: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_DELETED,
    });
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/projects/[id]:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

