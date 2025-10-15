import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * GET /api/dashboard/inventory/:id
 * Fetch single inventory unit with full details including movements and media
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

    // Fetch inventory unit with all related data
    const { data: inventoryUnit, error } = await supabase
      .from('inventory_units')
      .select(
        `
        *,
        item:items (*),
        client:client_id (id, full_name, company_name, email),
        project:project_id (id, name, code),
        media (*),
        movements (
          *,
          created_by_user:created_by (id, full_name, email)
        )
      `
      )
      .eq('id', id)
      .order('created_at', { foreignTable: 'movements', ascending: false })
      .single();

    if (error) {
      console.error('Error fetching inventory unit:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!inventoryUnit) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVENTORY_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({ inventory: inventoryUnit });
  } catch (error) {
    console.error('Error in GET /api/dashboard/inventory/:id:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/dashboard/inventory/:id
 * Update inventory unit (status, location, notes, etc.)
 * Creates movement record for status/location changes
 */
export async function PATCH(
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
    const supabase = await createClient();

    // Fetch current inventory unit to track changes
    const { data: currentUnit, error: fetchError } = await supabase
      .from('inventory_units')
      .select('*, item:items (*)')
      .eq('id', id)
      .single();

    if (fetchError || !currentUnit) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVENTORY_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Type cast to include new location columns
    const currentUnitWithLocation = currentUnit as typeof currentUnit & {
      location_latitude: number | null;
      location_longitude: number | null;
    };

    const {
      // Inventory unit fields
      client_id,
      project_id,
      status,
      location_site,
      location_latitude,
      location_longitude,
      location_aisle,
      location_bay,
      location_level,
      location_notes,
      quantity,
      last_inspection_at,
      pallet_no,
      inventory_date,
      note, // Note for movement record
      // Item fields
      label,
      sku,
      description,
      length_mm,
      width_mm,
      height_mm,
      weight_kg,
      stackability,
      top_load_rating_kg,
      orientation_locked,
      fragile,
      keep_upright,
      priority,
    } = body;

    // Update item fields if provided
    if (currentUnit.item_id && (client_id !== undefined || project_id !== undefined || 
        label || sku !== undefined || description !== undefined || 
        length_mm !== undefined || width_mm !== undefined || height_mm !== undefined || 
        weight_kg !== undefined || stackability || top_load_rating_kg !== undefined || 
        orientation_locked !== undefined || fragile !== undefined || 
        keep_upright !== undefined || priority !== undefined)) {
      
      const itemUpdates: Record<string, unknown> = {
        updated_by: user.id,
      };

      // Update client and project in item as well
      if (client_id !== undefined) itemUpdates.client_id = client_id;
      if (project_id !== undefined) itemUpdates.project_id = project_id || null;
      
      // Other item fields
      if (label) itemUpdates.label = label;
      if (sku !== undefined) itemUpdates.sku = sku || null;
      if (description !== undefined) itemUpdates.description = description || null;
      if (length_mm !== undefined) itemUpdates.length_mm = parseFloat(length_mm);
      if (width_mm !== undefined) itemUpdates.width_mm = parseFloat(width_mm);
      if (height_mm !== undefined) itemUpdates.height_mm = parseFloat(height_mm);
      if (weight_kg !== undefined) itemUpdates.weight_kg = parseFloat(weight_kg);
      if (stackability) itemUpdates.stackability = stackability;
      if (top_load_rating_kg !== undefined) itemUpdates.top_load_rating_kg = parseFloat(top_load_rating_kg);
      if (orientation_locked !== undefined) itemUpdates.orientation_locked = orientation_locked;
      if (fragile !== undefined) itemUpdates.fragile = fragile;
      if (keep_upright !== undefined) itemUpdates.keep_upright = keep_upright;
      if (priority !== undefined) itemUpdates.priority = priority ? parseInt(priority) : null;

      const { error: itemUpdateError } = await supabase
        .from('items')
        .update(itemUpdates)
        .eq('id', currentUnit.item_id);

      if (itemUpdateError) {
        console.error('Error updating item:', itemUpdateError);
        return NextResponse.json(
          { error: API_RESPONSE_MESSAGES.ERROR.UPDATE_FAILED },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    }

    // Build inventory unit update object
    const updates: Record<string, unknown> = {
      updated_by: user.id,
    };

    // Allow updating client and project
    if (client_id !== undefined) updates.client_id = client_id;
    if (project_id !== undefined) updates.project_id = project_id || null;
    
    // Other inventory unit fields
    if (status) updates.status = status;
    if (location_site) updates.location_site = location_site;
    if (location_latitude !== undefined) updates.location_latitude = location_latitude;
    if (location_longitude !== undefined) updates.location_longitude = location_longitude;
    if (location_aisle !== undefined) updates.location_aisle = location_aisle;
    if (location_bay !== undefined) updates.location_bay = location_bay;
    if (location_level !== undefined) updates.location_level = location_level;
    if (location_notes !== undefined) updates.location_notes = location_notes;
    if (quantity) updates.quantity = quantity;
    if (last_inspection_at !== undefined) updates.last_inspection_at = last_inspection_at;
    if (pallet_no !== undefined) updates.pallet_no = pallet_no || null;
    if (inventory_date) updates.inventory_date = inventory_date;

    // Update inventory unit
    const { data: updatedUnit, error: updateError } = await supabase
      .from('inventory_units')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        item:items (*),
        client:client_id (id, full_name, company_name, email),
        project:project_id (id, name, code)
      `
      )
      .single();

    if (updateError || !updatedUnit) {
      console.error('Error updating inventory unit:', updateError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Create movement record if status or location changed
    const statusChanged = status && status !== currentUnit.status;
    const locationChanged =
      location_site !== currentUnitWithLocation.location_site ||
      location_latitude !== currentUnitWithLocation.location_latitude ||
      location_longitude !== currentUnitWithLocation.location_longitude ||
      location_aisle !== currentUnitWithLocation.location_aisle ||
      location_bay !== currentUnitWithLocation.location_bay ||
      location_level !== currentUnitWithLocation.location_level;

    if (statusChanged || locationChanged) {
      await supabase.from('movements').insert({
        inventory_unit_id: id,
        from_status: statusChanged ? currentUnit.status : null,
        to_status: status || currentUnit.status,
        from_location: locationChanged
          ? {
              site: currentUnit.location_site,
              aisle: currentUnit.location_aisle,
              bay: currentUnit.location_bay,
              level: currentUnit.location_level,
            }
          : null,
        to_location: locationChanged
          ? {
              site: location_site || currentUnit.location_site,
              aisle: location_aisle || currentUnit.location_aisle,
              bay: location_bay || currentUnit.location_bay,
              level: location_level || currentUnit.location_level,
            }
          : null,
        note: note || 'Updated via dashboard',
        created_by: user.id,
      });
    }

    return NextResponse.json({
      message: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_UPDATED,
      inventory: updatedUnit,
    });
  } catch (error) {
    console.error('Error in PATCH /api/dashboard/inventory/:id:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/dashboard/inventory/:id
 * Delete inventory unit (cascades to movements and media)
 * Also deletes associated item if no other inventory units reference it
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
    const supabase = await createClient();

    // Fetch inventory unit to get item_id
    const { data: inventoryUnit, error: fetchError } = await supabase
      .from('inventory_units')
      .select('item_id')
      .eq('id', id)
      .single();

    if (fetchError || !inventoryUnit) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVENTORY_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const itemId = inventoryUnit.item_id;

    // Delete inventory unit (cascades to movements and media)
    const { error: deleteError } = await supabase
      .from('inventory_units')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting inventory unit:', deleteError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Check if item has other inventory units
    const { data: otherUnits } = await supabase
      .from('inventory_units')
      .select('id')
      .eq('item_id', itemId)
      .limit(1);

    // If no other units reference this item, delete the item too
    if (!otherUnits || otherUnits.length === 0) {
      await supabase.from('items').delete().eq('id', itemId);
    }

    return NextResponse.json({
      message: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_DELETED,
    });
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/inventory/:id:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

