import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * Type for inventory unit with nested relations
 */
interface InventoryUnitWithRelations {
  id: string;
  pallet_no: string | null;
  location_notes: string | null;
  location_site: string | null;
  item: {
    label: string;
    sku: string | null;
    description: string | null;
  } | null;
  client: {
    company_name: string | null;
    full_name: string | null;
  } | null;
  project: {
    name: string;
    code: string | null;
  } | null;
  [key: string]: unknown;
}

/**
 * GET /api/dashboard/inventory
 * Fetch inventory units with filters and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search by label, SKU, pallet_no
 * - client_id: Filter by client
 * - project_id: Filter by project
 * - status: Filter by status (in_storage, reserved, on_truck, onsite, returned)
 * - location_site: Filter by warehouse site
 * - location_aisle: Filter by aisle
 * - location_bay: Filter by bay
 * - location_level: Filter by level
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
    const clientId = searchParams.get('client_id') || '';
    const projectId = searchParams.get('project_id') || '';
    const status = searchParams.get('status') || '';
    const locationSite = searchParams.get('location_site') || '';
    const locationAisle = searchParams.get('location_aisle') || '';
    const locationBay = searchParams.get('location_bay') || '';
    const locationLevel = searchParams.get('location_level') || '';

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

    // Build query with joins to get item details and client/project info
    let query = supabase
      .from('inventory_units')
      .select(
        `
        *,
        item:items (
          id,
          label,
          sku,
          description,
          length_mm,
          width_mm,
          height_mm,
          weight_kg,
          volume_m3,
          stackability,
          top_load_rating_kg,
          orientation_locked,
          priority,
          fragile,
          keep_upright
        ),
        client:users!inventory_units_client_id_fkey (
          id,
          full_name,
          company_name,
          email
        ),
        project:projects!inventory_units_project_id_fkey (
          id,
          name,
          code
        )
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status as 'in_storage' | 'reserved' | 'on_truck' | 'onsite' | 'returned');
    }

    if (locationSite) {
      query = query.eq('location_site', locationSite);
    }

    if (locationAisle) {
      query = query.eq('location_aisle', locationAisle);
    }

    if (locationBay) {
      query = query.eq('location_bay', locationBay);
    }

    if (locationLevel) {
      query = query.eq('location_level', locationLevel);
    }

    // Apply pagination and ordering BEFORE search filter
    // This is important for performance
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: inventoryUnits, error, count } = await query;
    
    // Client-side search filtering if search term provided
    let filteredUnits = inventoryUnits || [];
    if (search && filteredUnits.length > 0) {
      const searchLower = search.toLowerCase();
      filteredUnits = filteredUnits.filter((unit) => {
        // Type assertion needed due to Supabase's complex nested type inference
        const typedUnit = unit as unknown as InventoryUnitWithRelations;
        return (
          typedUnit.pallet_no?.toLowerCase().includes(searchLower) ||
          typedUnit.location_notes?.toLowerCase().includes(searchLower) ||
          typedUnit.location_site?.toLowerCase().includes(searchLower) ||
          typedUnit.item?.label?.toLowerCase().includes(searchLower) ||
          typedUnit.item?.sku?.toLowerCase().includes(searchLower) ||
          typedUnit.item?.description?.toLowerCase().includes(searchLower) ||
          typedUnit.client?.company_name?.toLowerCase().includes(searchLower) ||
          typedUnit.client?.full_name?.toLowerCase().includes(searchLower) ||
          typedUnit.project?.name?.toLowerCase().includes(searchLower) ||
          typedUnit.project?.code?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Calculate stats manually (independent of search/pagination)
    const statsData = {
      totalUnits: 0,
      inStorage: 0,
      reserved: 0,
      onTruck: 0,
      onsite: 0,
      returned: 0,
      totalVolume: 0,
      totalWeight: 0,
    };

    {
      // Get ALL inventory units for stats calculation (not affected by search/pagination)
      let statusQuery = supabase
        .from('inventory_units')
        .select(
          `
          status,
          quantity,
          item:items (
            volume_m3,
            weight_kg
          )
        `
        );

      // Apply client filter to stats if provided
      if (clientId) {
        statusQuery = statusQuery.eq('client_id', clientId);
      }

      const { data: statusData } = await statusQuery;

      if (statusData) {
        // Set total units to actual count of all units
        statsData.totalUnits = statusData.length;

        statusData.forEach((unit: {
          status: string;
          quantity: number | null;
          item: { volume_m3: number | null; weight_kg: number | null } | null;
        }) => {
          const qty = unit.quantity || 1;
          const volume = (unit.item?.volume_m3 || 0) * qty;
          const weight = (unit.item?.weight_kg || 0) * qty;

          statsData.totalVolume += volume;
          statsData.totalWeight += weight;

          switch (unit.status) {
            case 'in_storage':
              statsData.inStorage++;
              break;
            case 'reserved':
              statsData.reserved++;
              break;
            case 'on_truck':
              statsData.onTruck++;
              break;
            case 'onsite':
              statsData.onsite++;
              break;
            case 'returned':
              statsData.returned++;
              break;
          }
        });
      }
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      inventory: filteredUnits || [],
      stats: statsData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/inventory:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/dashboard/inventory
 * Check-in new inventory (creates item + inventory_unit)
 * 
 * Body:
 * - client_id: string (required)
 * - project_id: string (optional)
 * - label: string (required)
 * - sku: string (optional)
 * - description: string (optional)
 * - length_mm: number (required)
 * - width_mm: number (required)
 * - height_mm: number (required)
 * - weight_kg: number (required)
 * - stackability: enum (required)
 * - top_load_rating_kg: number (optional)
 * - orientation_locked: boolean (optional)
 * - fragile: boolean (optional)
 * - keep_upright: boolean (optional)
 * - priority: number (optional)
 * - pallet_no: string (optional)
 * - inventory_date: string (optional)
 * - location_site: string (required)
 * - location_aisle: string (optional)
 * - location_bay: string (optional)
 * - location_level: string (optional)
 * - location_notes: string (optional)
 * - quantity: number (optional, default: 1)
 * - status: enum (optional, default: in_storage)
 */
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

    const body = await request.json();

    // Validate required fields
    const {
      client_id,
      project_id,
      label,
      sku,
      description,
      length_mm,
      width_mm,
      height_mm,
      weight_kg,
      volume_m3,
      stackability,
      top_load_rating_kg,
      orientation_locked,
      fragile,
      keep_upright,
      priority,
      pallet_no,
      inventory_date,
      location_site,
      location_latitude,
      location_longitude,
      location_aisle,
      location_bay,
      location_level,
      location_notes,
      quantity,
      status,
    } = body;

    if (
      !client_id ||
      !label ||
      !length_mm ||
      !width_mm ||
      !height_mm ||
      weight_kg === undefined ||
      volume_m3 === undefined ||
      !stackability ||
      !location_site
    ) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR,
          details: 'Missing required fields',
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Start transaction by creating item first
    const itemPayload = {
      client_id,
      project_id: project_id || null,
      label,
      sku: sku || null,
      description: description || null,
      length_mm: parseFloat(length_mm),
      width_mm: parseFloat(width_mm),
      height_mm: parseFloat(height_mm),
      weight_kg: parseFloat(weight_kg),
      volume_m3: parseFloat(volume_m3),
      stackability: stackability as
        | 'stackable'
        | 'non_stackable'
        | 'top_only'
        | 'bottom_only',
      top_load_rating_kg: top_load_rating_kg
        ? parseFloat(top_load_rating_kg)
        : 500,
      orientation_locked: orientation_locked || false,
      fragile: fragile || false,
      keep_upright: keep_upright !== undefined ? keep_upright : true,
      priority: priority ? parseInt(priority) : null,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: item, error: itemError } = await supabase
      .from('items')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(itemPayload as any)
      .select()
      .single();

    if (itemError || !item) {
      console.error('Error creating item:', itemError);
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR,
          details: itemError?.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Create inventory unit
    const inventoryUnitData = {
      item_id: item.id,
      client_id,
      project_id: project_id || null,
      pallet_no: pallet_no || null,
      inventory_date: inventory_date || new Date().toISOString().split('T')[0],
      location_site,
      location_latitude: location_latitude || null,
      location_longitude: location_longitude || null,
      location_aisle: location_aisle || null,
      location_bay: location_bay || null,
      location_level: location_level || null,
      location_notes: location_notes || null,
      quantity: quantity || 1,
      status: (status as
        | 'in_storage'
        | 'reserved'
        | 'on_truck'
        | 'onsite'
        | 'returned') || 'in_storage',
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: inventoryUnit, error: unitError } = await supabase
      .from('inventory_units')
      .insert(inventoryUnitData)
      .select(
        `
        *,
        item:items (*),
        client:client_id (id, full_name, company_name, email),
        project:project_id (id, name, code)
      `
      )
      .single();

    if (unitError || !inventoryUnit) {
      console.error('Error creating inventory unit:', unitError);
      // Rollback: delete the item
      await supabase.from('items').delete().eq('id', item.id);
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR,
          details: unitError?.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Create movement record
    await supabase.from('movements').insert({
      inventory_unit_id: inventoryUnit.id,
      from_status: null,
      to_status: inventoryUnit.status,
      to_location: {
        site: location_site,
        aisle: location_aisle,
        bay: location_bay,
        level: location_level,
      },
      note: 'Initial check-in',
      created_by: user.id,
    });

    return NextResponse.json(
      {
        message: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_CHECKIN,
        inventory: inventoryUnit,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error in POST /api/dashboard/inventory:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}


