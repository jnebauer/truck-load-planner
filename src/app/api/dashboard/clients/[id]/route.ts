import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import bcrypt from 'bcryptjs';

/**
 * PUT /api/dashboard/clients/[id]
 * Update an existing client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only admin can update clients
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const supabase = await createClient();
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const {
      email,
      password,
      fullName,
      phone,
      profileImage,
      status,
      appPermissions,
      // Client-specific fields
      companyName,
      billingAddress,
      billingLat,
      billingLng,
      billingPlaceId,
      shippingAddress,
      shippingLat,
      shippingLng,
      shippingPlaceId,
      contactPerson,
      taxId,
      website,
      notes,
      logoImage,
    } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate that user has at least one app permission
    const hasAnyPermission =
      appPermissions && Object.values(appPermissions).some((v) => v === true);

    if (!hasAnyPermission) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.APP_PERMISSION_REQUIRED,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if email already exists for a different user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', clientId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_EMAIL,
        },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Get clients role_id (lowercase as per database)
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'clients')
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'clients role not found' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Prepare update data
    const updateData: {
      email: string;
      full_name: string;
      phone: string | null;
      profile_image: string | null;
      role_id: string;
      status: 'active' | 'inactive' | 'blocked';
      password_hash?: string;
      // Client-specific fields
      company_name: string | null;
      billing_address: string | null;
      billing_lat: number | null;
      billing_lng: number | null;
      billing_place_id: string | null;
      shipping_address: string | null;
      shipping_lat: number | null;
      shipping_lng: number | null;
      shipping_place_id: string | null;
      contact_person: string | null;
      tax_id: string | null;
      website: string | null;
      notes: string | null;
      logo_image: string | null;
    } = {
      email,
      full_name: fullName,
      phone: phone && phone.trim() !== '' ? phone : null,
      profile_image: profileImage && profileImage.trim() !== '' ? profileImage : null,
      role_id: roleData.id,
      status: (status as 'active' | 'inactive' | 'blocked') || 'active',
      // Client-specific fields
      company_name: companyName && companyName.trim() !== '' ? companyName : null,
      billing_address: billingAddress && billingAddress.trim() !== '' ? billingAddress : null,
      billing_lat: billingLat ?? null,
      billing_lng: billingLng ?? null,
      billing_place_id: billingPlaceId && billingPlaceId.trim() !== '' ? billingPlaceId : null,
      shipping_address: shippingAddress && shippingAddress.trim() !== '' ? shippingAddress : null,
      shipping_lat: shippingLat ?? null,
      shipping_lng: shippingLng ?? null,
      shipping_place_id: shippingPlaceId && shippingPlaceId.trim() !== '' ? shippingPlaceId : null,
      contact_person: contactPerson && contactPerson.trim() !== '' ? contactPerson : null,
      tax_id: taxId && taxId.trim() !== '' ? taxId : null,
      website: website && website.trim() !== '' ? website : null,
      notes: notes && notes.trim() !== '' ? notes : null,
      logo_image: logoImage && logoImage.trim() !== '' ? logoImage : null,
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 12);
      updateData.password_hash = passwordHash;
    }

    // Update client
    const { data: updatedClient, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Update app permissions if provided
    if (appPermissions) {
      // First, get current app permissions
      const { data: apps, error: appsError } = await supabase
        .from('app_permissions')
        .select('id, name')
        .eq('status', 'active')
        .is('deleted_at', null);

      if (appsError || !apps || apps.length === 0) {
        console.error('❌ Error fetching apps:', appsError);
        // Don't fail the update if app permissions fetch fails
      } else {
        // Map app display names to IDs
        const appIdMap: Record<string, string> = {};
        apps.forEach((app) => {
          appIdMap[app.name] = app.id;
        });

        // Helper function to convert camelCase to display name
        const toDisplayName = (camelCase: string): string => {
          return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
        };

        // Soft delete existing permissions (set deleted_at and deleted_by)
        const { error: deleteError } = await supabase
          .from('user_app_permissions')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user.id,
          })
          .eq('user_id', clientId)
          .is('deleted_at', null);

        if (deleteError) {
          console.error('❌ Error deleting old app permissions:', deleteError);
        }

        // Build new user_app_permissions records dynamically
        const appPermissionsToInsert: Array<{
          user_id: string;
          app_id: string;
          created_by: string;
          updated_by: string;
        }> = [];
        Object.keys(appPermissions).forEach((key) => {
          if (appPermissions[key] === true) {
            const displayName = toDisplayName(key);

            if (appIdMap[displayName]) {
              appPermissionsToInsert.push({
                user_id: clientId,
                app_id: appIdMap[displayName],
                created_by: user.id,
                updated_by: user.id,
              });
            }
          }
        });

        // Insert new permissions
        if (appPermissionsToInsert.length > 0) {
          const { error: permError } = await supabase
            .from('user_app_permissions')
            .insert(appPermissionsToInsert);

          if (permError) {
            console.error('❌ Error saving app permissions:', permError);
            // Don't fail client update if permissions fail
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Client updated successfully',
      client: updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/dashboard/clients/[id]
 * Delete (soft delete) a client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only admin can delete clients
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const supabase = await createClient();
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if client exists
    const { data: existingClient, error: fetchError } = await supabase
      .from('users')
      .select('id, role_id, roles(name)')
      .eq('id', clientId)
      .single();

    if (fetchError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Verify it's actually a client
    const roles = existingClient.roles as unknown as { name: string } | null;
    if (!roles || roles.name !== 'clients') {
      return NextResponse.json(
        { error: 'User is not a client' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Delete the client (hard delete)
    // Note: You may want to implement soft delete instead
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', clientId);

    if (deleteError) {
      console.error('Error deleting client:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

