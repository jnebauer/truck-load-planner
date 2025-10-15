import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * POST /api/dashboard/inventory/check-pallets
 * Check which pallet numbers already exist in the database
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
    const { pallet_numbers } = body as { pallet_numbers: string[] };

    if (!pallet_numbers || !Array.isArray(pallet_numbers) || pallet_numbers.length === 0) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Query database for existing pallet numbers
    const { data: existingPallets, error } = await supabase
      .from('inventory_units')
      .select('pallet_no')
      .in('pallet_no', pallet_numbers)
      .not('pallet_no', 'is', null);

    if (error) {
      console.error('Error checking pallet numbers:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.FETCH_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Extract existing pallet numbers
    const existing = existingPallets?.map(p => p.pallet_no) || [];

    return NextResponse.json({
      success: true,
      existing_pallets: existing,
    });

  } catch (error) {
    console.error('Error in POST /api/dashboard/inventory/check-pallets:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

