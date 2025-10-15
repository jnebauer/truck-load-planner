import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import { generateSecurePassword } from '@/lib/password-utils';
import bcrypt from 'bcryptjs';

interface ImportRow {
  // Client & Project (Required)
  client_name: string;
  client_email: string;
  project_name: string;
  
  // Item fields
  label: string;
  sku?: string;
  description?: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
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
  location_aisle?: string;
  location_bay?: string;
  location_level?: string;
  location_notes?: string;
  quantity?: number;
  status?: 'in_storage' | 'reserved' | 'on_truck' | 'onsite' | 'returned';
  
  // Photo URLs (Optional)
  pallet_photo_url?: string;
  label_photo_url?: string;
  racking_photo_url?: string;
  onsite_photo_url?: string;
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

    // Client and project caches
    const clientCache = new Map<string, string>();
    const projectCache = new Map<string, string>();

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
        const location_site = String(row.location_site || '').trim();
        const client_name = String(row.client_name || '').trim();
        const client_email = String(row.client_email || '').trim();
        const project_name = String(row.project_name || '').trim();

        // Validate required fields
        if (!label || !length_mm || !width_mm || !height_mm || !weight_kg || !location_site) {
          throw new Error(`Missing required fields: ${!label ? 'label, ' : ''}${!length_mm ? 'length, ' : ''}${!width_mm ? 'width, ' : ''}${!height_mm ? 'height, ' : ''}${!weight_kg ? 'weight, ' : ''}${!location_site ? 'location_site' : ''}`);
        }

        if (!client_name || !client_email) {
          throw new Error('Client name and email are required');
        }

        if (!project_name) {
          throw new Error('Project name is required');
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

        // Get or create project (search by name for this client)
        let projectId: string;
        const projectKey = `${clientId}-${project_name}`;
        
        if (projectCache.has(projectKey)) {
          projectId = projectCache.get(projectKey)!;
        } else {
          // Check if project exists for this client
          const { data: existingProject } = await supabase
            .from('projects')
            .select('id')
            .eq('client_id', clientId)
            .ilike('name', project_name)
            .single();

          if (existingProject) {
            projectId = existingProject.id;
            projectCache.set(projectKey, projectId);
          } else {
            // Create new project with unique code
            // Generate base code from project name
            const baseCode = project_name
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '_')
              .substring(0, 20);
            
            // Check if code exists and make it unique by adding timestamp suffix if needed
            let projectCode = baseCode;
            let codeExists = true;
            let attempt = 0;
            
            while (codeExists && attempt < 10) {
              const { data: existingCode } = await supabase
                .from('projects')
                .select('id')
                .eq('code', projectCode)
                .single();
              
              if (!existingCode) {
                codeExists = false;
              } else {
                // Add timestamp-based suffix to make it unique
                const suffix = Date.now().toString().slice(-6);
                projectCode = `${baseCode.substring(0, 14)}_${suffix}`;
                attempt++;
              }
            }

            const { data: newProject, error: projectError } = await supabase
              .from('projects')
              .insert({
                client_id: clientId,
                name: project_name,
                code: projectCode,
                status: 'active',
                created_by: user.id,
                updated_by: user.id,
              })
              .select('id')
              .single();

            if (projectError || !newProject) {
              throw new Error(`Failed to create project: ${projectError?.message}`);
            }

            projectId = newProject.id;
            projectCache.set(projectKey, projectId);
          }
        }

        // Create item
        const { data: newItem, error: itemError } = await supabase
          .from('items')
          .insert({
            client_id: clientId,
            project_id: projectId,
            label: label,
            sku: row.sku || null,
            description: row.description || null,
            length_mm: length_mm,
            width_mm: width_mm,
            height_mm: height_mm,
            weight_kg: weight_kg,
            stackability: row.stackability || 'stackable',
            top_load_rating_kg: row.top_load_rating_kg ? parseFloat(String(row.top_load_rating_kg)) : 500,
            orientation_locked: row.orientation_locked || false,
            fragile: row.fragile || false,
            keep_upright: row.keep_upright !== undefined ? row.keep_upright : true,
            priority: row.priority ? parseInt(String(row.priority)) : null,
            created_by: user.id,
            updated_by: user.id,
          })
          .select('id')
          .single();

        if (itemError || !newItem) {
          throw new Error(`Failed to create item: ${itemError?.message}`);
        }

        // Create inventory unit
        const inventoryDate = row.inventory_date || new Date().toISOString().split('T')[0];
        
        const { data: newInventoryUnit, error: inventoryError } = await supabase
          .from('inventory_units')
          .insert({
            item_id: newItem.id,
            client_id: clientId,
            project_id: projectId,
            pallet_no: row.pallet_no || null,
            inventory_date: inventoryDate,
            location_site: location_site,
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
          { url: row.pallet_photo_url, tag: 'pallet' as const },
          { url: row.label_photo_url, tag: 'label' as const },
          { url: row.racking_photo_url, tag: 'racking' as const },
          { url: row.onsite_photo_url, tag: 'onsite' as const },
        ];

        for (const photoMapping of photoMappings) {
          if (photoMapping.url && photoMapping.url.trim()) {
            try {
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
                console.error(`Failed to add ${photoMapping.tag} photo for row ${rowNumber}:`, mediaError);
              }
            } catch (photoError) {
              // Log photo error but don't fail the entire import
              console.error(`Failed to add ${photoMapping.tag} photo for row ${rowNumber}:`, photoError);
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

