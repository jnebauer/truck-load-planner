import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * POST /api/dashboard/inventory/:id/media
 * Upload and attach media to an inventory unit
 * 
 * Body:
 * - url: string (URL from Supabase Storage)
 * - tag: 'pallet' | 'label' | 'racking' | 'onsite'
 * - content_type: string (optional)
 * - width_px: number (optional)
 * - height_px: number (optional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { url, tag, content_type, width_px, height_px } = body;

    if (!url || !tag) {
      return NextResponse.json(
        { error: 'URL and tag are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Verify inventory unit exists and user has access
    const { data: inventoryUnit, error: fetchError } = await supabase
      .from('inventory_units')
      .select('id, item_id')
      .eq('id', id)
      .single();

    if (fetchError || !inventoryUnit) {
      return NextResponse.json(
        { error: 'Inventory unit not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Create media record
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        inventory_unit_id: id,
        item_id: inventoryUnit.item_id,
        url,
        tag: tag as 'pallet' | 'label' | 'racking' | 'onsite',
        content_type: content_type || null,
        width_px: width_px || null,
        height_px: height_px || null,
        taken_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (mediaError || !media) {
      console.error('Error creating media record:', mediaError);
      return NextResponse.json(
        { error: 'Failed to attach media' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      {
        message: 'Media attached successfully',
        media,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error in POST /api/dashboard/inventory/:id/media:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * GET /api/dashboard/inventory/:id/media
 * Get all media for an inventory unit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Get all media for this inventory unit
    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('inventory_unit_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      media: media || [],
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/inventory/:id/media:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/dashboard/inventory/:id/media/:mediaId
 * Delete a media file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('media_id');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Delete media record
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId)
      .eq('inventory_unit_id', id);

    if (deleteError) {
      console.error('Error deleting media:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/inventory/:id/media:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

