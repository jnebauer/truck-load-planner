import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { sendUserCreatedEmail } from '@/lib/email';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import bcrypt from 'bcryptjs';

/**
 * GET /api/dashboard/clients
 * Fetch all clients (users with role=Client) with pagination and search
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

    // Check if user has permission to read clients
    if (!user.role || !['admin', 'pm'].includes(user.role)) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 10000) {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Get clients role ID (lowercase as per database)
    const { data: clientRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'clients')
      .single();

    if (roleError || !clientRole) {
      console.error('clients role fetch error:', roleError);
      return NextResponse.json(
        {
          error: 'clients role not found in database. Please ensure "clients" role exists.',
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with pagination
    let clientsQuery = supabase
      .from('users')
      .select(
        `
        *,
        roles (
          id,
          name,
          description
        ),
        user_app_permissions!user_app_permissions_user_id_fkey (
          id,
          app_id,
          app_permissions!user_app_permissions_app_id_fkey (
            id,
            name,
            description,
            app_url
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('role_id', clientRole.id);

    // Add search filter if provided
    if (search) {
      clientsQuery = clientsQuery.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`
      );
    }

    // Add pagination
    clientsQuery = clientsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: clients, error, count } = await clientsQuery;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Get total counts by status for clients only (without search filter)
    const { data: statusCounts, error: statusError, count: totalCount } = await supabase
      .from('users')
      .select('status', { count: 'exact' })
      .eq('role_id', clientRole.id);

    if (statusError) {
      console.error('Error getting status counts:', statusError);
    }

    // Calculate status counts
    const stats = {
      totalClients: totalCount || 0, // Use total count, not filtered count
      activeClients: 0,
      inactiveClients: 0,
      blockedClients: 0,
    };

    if (statusCounts) {
      statusCounts.forEach((item: { status: string }) => {
        switch (item.status) {
          case 'active':
            stats.activeClients++;
            break;
          case 'inactive':
            stats.inactiveClients++;
            break;
          case 'blocked':
            stats.blockedClients++;
            break;
        }
      });
    }

    // Transform the data to include role name
    const transformedClients = clients.map((client) => ({
      ...client,
      role: client.roles?.name || 'clients',
    }));

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      clients: transformedClients,
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
    console.error('Error in GET /api/dashboard/clients:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/dashboard/clients
 * Create a new client (user with role=Client)
 */
export async function POST(request: NextRequest) {
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

    // Only admin can create clients
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const supabase = await createClient();

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

    // Validate required fields
    if (!email || !password || !fullName) {
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

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
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
      console.error('clients role fetch error:', roleError);
      return NextResponse.json(
        {
          error: 'clients role not found in database',
          details: roleError?.message,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Create client in users table
    const { data: newClient, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone: phone && phone.trim() !== '' ? phone : null,
        profile_image: profileImage && profileImage.trim() !== '' ? profileImage : null,
        role_id: roleData.id,
        status: status || 'active',
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
      })
      .select()
      .single();

    if (createError) {
      console.error('Client creation error:', createError);
      return NextResponse.json(
        {
          error: 'Failed to create client',
          details: createError.message,
          code: createError.code,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Save app permissions to database
    const { data: apps, error: appsError } = await supabase
      .from('app_permissions')
      .select('id, name, description, app_url')
      .eq('status', 'active')
      .is('deleted_at', null);

    if (appsError || !apps || apps.length === 0) {
      console.error('Error fetching apps:', appsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch application list',
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Map app display names to IDs
    const appIdMap: Record<string, string> = {};
    apps.forEach((app) => {
      appIdMap[app.name] = app.id;
    });

    // Build user_app_permissions records dynamically
    const appPermissionsToInsert: Array<{
      user_id: string;
      app_id: string;
      created_by: string;
      updated_by: string;
    }> = [];

    // Helper function to convert camelCase to display name
    const toDisplayName = (camelCase: string): string => {
      return camelCase
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    // Dynamically map app permissions
    if (appPermissions) {
      Object.keys(appPermissions).forEach((key) => {
        if (appPermissions[key] === true) {
          const displayName = toDisplayName(key);

          if (appIdMap[displayName]) {
            appPermissionsToInsert.push({
              user_id: newClient.id,
              app_id: appIdMap[displayName],
              created_by: user.id,
              updated_by: user.id,
            });
          }
        }
      });
    }

    if (appPermissionsToInsert.length > 0) {
      const { error: permError } = await supabase
        .from('user_app_permissions')
        .insert(appPermissionsToInsert);

      if (permError) {
        console.error('❌ Error saving app permissions:', permError);
        // Don't fail client creation if permissions fail, just log it
      }
    }

    // Send welcome email to the new client
    try {
      const emailResult = await sendUserCreatedEmail(
        email,
        fullName,
        email,
        password, // Send the plain password for first login
        'clients'
      );

      if (!emailResult.success) {
        console.warn(
          '⚠️ Client created but email failed to send:',
          emailResult.error
        );
        // Don't fail the client creation if email fails
      }
    } catch (emailError) {
      console.warn(
        '⚠️ Client created but email failed to send:',
        emailError
      );
      // Don't fail the client creation if email fails
    }

    return NextResponse.json({
      message: 'Client created successfully',
      clientId: newClient.id,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      {
        error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR,
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : ''
            : undefined,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

