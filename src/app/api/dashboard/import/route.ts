import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import { generateSecurePassword } from '@/lib/password-utils';
import bcrypt from 'bcryptjs';

// Helper function to geocode address using Google Maps API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('Geocoding API request failed:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.warn(`Geocoding failed for address: ${address}, Status: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

interface ImportRow {
  // Client (Required)
  client_name: string;
  client_email: string;
  
  // Item fields
  label: string;
  description?: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  volume_m3: number;
  weight_kg: number;
  stackability?: 'stackable' | 'non_stackable' | 'top_only' | 'bottom_only';
  top_load_rating_kg?: number;
  orientation_locked?: boolean;
  fragile?: boolean;
  keep_upright?: boolean;
  priority?: number;
  
  // Inventory unit fields
  pallet_no?: string;
  inventory_date?: string;
  location_site: string;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_aisle?: string;
  location_bay?: string;
  location_level?: string;
  location_notes?: string;
  quantity?: number;
  status?: 'in_storage' | 'reserved' | 'on_truck' | 'onsite' | 'returned';
  
  // Photo URLs (Optional) - CSV field names
  pallet_photo?: string;
  label_photo?: string;
  racking_photo?: string;
  onsite_photo?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * POST /api/dashboard/import
 * Import CSV data into inventory
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Parse request body
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.CSV_EMPTY },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();
    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Client cache
    const clientCache = new Map<string, string>();

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as ImportRow;
      const rowNumber = i + 1;

      try {
        // Debug: Log first row data
        if (i === 0) {
          console.log('🔍 Backend received first row:', row);
          console.log('🔍 Field types:', {
            label: typeof row.label,
            length_mm: typeof row.length_mm,
            client_name: typeof row.client_name,
          });
        }

        // Validate and convert required fields
        const label = String(row.label || '').trim();
        const length_mm = Number(row.length_mm);
        const width_mm = Number(row.width_mm);
        const height_mm = Number(row.height_mm);
        const weight_kg = Number(row.weight_kg);
        const volume_m3 = Number(row.volume_m3);
        const location_site = String(row.location_site || '').trim();
        const client_name = String(row.client_name || '').trim();
        const client_email = String(row.client_email || '').trim();

        // Validate required fields
        if (!label || !length_mm || !width_mm || !height_mm || !volume_m3 || !weight_kg || !location_site) {
          throw new Error(`Missing required fields: ${!label ? 'label, ' : ''}${!length_mm ? 'length, ' : ''}${!width_mm ? 'width, ' : ''}${!height_mm ? 'height, ' : ''}${!volume_m3 ? 'volume, ' : ''}${!weight_kg ? 'weight, ' : ''}${!location_site ? 'location_site' : ''}`);
        }

        if (!client_name || !client_email) {
          throw new Error('Client name and email are required');
        }

        if (client_name.length < 2) {
          throw new Error('Client name must be at least 2 characters');
        }

        // Get clients role (fetch once, cache for all rows)
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'clients')
          .single();

        if (!roleData) {
          throw new Error('Clients role not found in system');
        }

        // Get or create client (search by email)
        let clientId: string;
        const clientEmail = client_email.toLowerCase();
        
        // Check cache first
        if (clientCache.has(clientEmail)) {
          clientId = clientCache.get(clientEmail)!;
        } else {
          // Search for existing client by email
          const { data: existingClient } = await supabase
            .from('users')
            .select('id')
            .eq('role_id', roleData.id)
            .eq('email', clientEmail)
            .single();

          if (existingClient) {
            clientId = existingClient.id;
            clientCache.set(clientEmail, clientId);
          } else {
            // Create new client with provided email
            // Generate secure random password and hash it
            const randomPassword = generateSecurePassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const clientData = {
              email: clientEmail,
              password_hash: hashedPassword,
              full_name: client_name, // Required field
              company_name: client_name,
              role_id: roleData.id,
              status: 'active' as const,
            };
            
            const { data: newClient, error: clientError } = await supabase
              .from('users')
              .insert(clientData as never)
              .select('id')
              .single();

            if (clientError || !newClient) {
              throw new Error(`Failed to create client: ${clientError?.message}`);
            }

            clientId = newClient.id;
            clientCache.set(clientEmail, clientId);
          }
        }

        // Assign "Truck Load Planner" app permission to client (new or existing)
        try {
          // Get Truck Load Planner app ID
          const { data: truckPlannerApp } = await supabase
            .from('app_permissions')
            .select('id')
            .eq('name', 'Truck Load Planner')
            .single();

          if (truckPlannerApp) {
            // Check if permission already exists
            const { data: existingPermission } = await supabase
              .from('user_app_permissions')
              .select('id')
              .eq('user_id', clientId)
              .eq('app_id', truckPlannerApp.id)
              .is('deleted_at', null)
              .single();

            // Only insert if permission doesn't exist
            if (!existingPermission) {
              await supabase
                .from('user_app_permissions')
                .insert({
                  user_id: clientId,
                  app_id: truckPlannerApp.id,
                  created_by: user.id,
                  updated_by: user.id,
                });
            }
          }
        } catch (permError) {
          // Log error but don't fail the import
          console.error('Failed to assign app permission to client:', permError);
        }

        // Create item
        const itemPayload = {
          client_id: clientId,
          label: label,
          description: row.description || null,
          length_mm: length_mm,
          width_mm: width_mm,
          height_mm: height_mm,
          volume_m3: volume_m3,
          weight_kg: weight_kg,
          stackability: row.stackability || 'stackable',
          top_load_rating_kg: row.top_load_rating_kg ? parseFloat(String(row.top_load_rating_kg)) : 500,
          orientation_locked: String(row.orientation_locked).toUpperCase() === 'TRUE',
          fragile: String(row.fragile).toUpperCase() === 'TRUE',
          keep_upright: String(row.keep_upright).toUpperCase() === 'TRUE',
          priority: row.priority ? parseInt(String(row.priority)) : null,
          created_by: user.id,
          updated_by: user.id,
        };

        const { data: newItem, error: itemError } = await supabase
          .from('items')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(itemPayload as any)
          .select('id')
          .single();

        if (itemError || !newItem) {
          throw new Error(`Failed to create item: ${itemError?.message}`);
        }

        // Create inventory unit
        const inventoryDate = row.inventory_date || new Date().toISOString().split('T')[0];
        
        // Geocode address if coordinates not provided in CSV
        let locationLatitude = row.location_latitude || null;
        let locationLongitude = row.location_longitude || null;
        
        if (!locationLatitude || !locationLongitude) {
          console.log(`Geocoding address for row ${rowNumber}: ${location_site}`);
          const coords = await geocodeAddress(location_site);
          if (coords) {
            locationLatitude = coords.lat;
            locationLongitude = coords.lng;
            console.log(`✅ Geocoded successfully: ${coords.lat}, ${coords.lng}`);
          } else {
            console.warn(`⚠️ Failed to geocode address: ${location_site}`);
          }
        }
        
        const { data: newInventoryUnit, error: inventoryError} = await supabase
          .from('inventory_units')
          .insert({
            item_id: newItem.id,
            client_id: clientId,
            pallet_no: row.pallet_no || null,
            inventory_date: inventoryDate,
            location_site: location_site,
            location_latitude: locationLatitude,
            location_longitude: locationLongitude,
            location_aisle: row.location_aisle || null,
            location_bay: row.location_bay || null,
            location_level: row.location_level || null,
            location_notes: row.location_notes || null,
            quantity: row.quantity ? parseInt(String(row.quantity)) : 1,
            status: row.status || 'in_storage',
            created_by: user.id,
            updated_by: user.id,
          })
          .select('id')
          .single();

        if (inventoryError || !newInventoryUnit) {
          throw new Error(`Failed to create inventory unit: ${inventoryError?.message}`);
        }

        // Handle photo URLs if provided
        const photoMappings: Array<{ url?: string; tag: 'pallet' | 'label' | 'racking' | 'onsite' }> = [
          { url: row.pallet_photo, tag: 'pallet' as const },
          { url: row.label_photo, tag: 'label' as const },
          { url: row.racking_photo, tag: 'racking' as const },
          { url: row.onsite_photo, tag: 'onsite' as const },
        ];

        for (const photoMapping of photoMappings) {
          if (photoMapping.url && photoMapping.url.trim()) {
            try {
              console.log(`📸 Saving ${photoMapping.tag} photo for row ${rowNumber}:`, photoMapping.url.trim());
              // Insert photo record with URL
              const { error: mediaError } = await supabase.from('media').insert({
                inventory_unit_id: newInventoryUnit.id,
                item_id: newItem.id,
                url: photoMapping.url.trim(),
                tag: photoMapping.tag,
                content_type: 'image/jpeg', // Default, can be updated later
                created_by: user.id,
              });
              
              if (mediaError) {
                console.error(`❌ Failed to add ${photoMapping.tag} photo for row ${rowNumber}:`, mediaError);
              } else {
                console.log(`✅ Successfully saved ${photoMapping.tag} photo for row ${rowNumber}`);
              }
            } catch (photoError) {
              // Log photo error but don't fail the entire import
              console.error(`❌ Exception adding ${photoMapping.tag} photo for row ${rowNumber}:`, photoError);
            }
          }
        }

        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          row: rowNumber,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `${API_RESPONSE_MESSAGES.SUCCESS.IMPORT_COMPLETED}: ${results.success} successful, ${results.failed} failed`,
    });

  } catch (error) {
    console.error('Error in POST /api/dashboard/import:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

