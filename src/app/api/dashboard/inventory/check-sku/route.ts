import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * POST /api/dashboard/inventory/check-sku
 * Check which SKUs already exist in the database
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
    const { skus } = body as { skus: string[] };

    if (!skus || !Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Query database for existing SKUs
    const { data: existingSkus, error } = await supabase
      .from('items')
      .select('sku')
      .in('sku', skus)
      .not('sku', 'is', null);

    if (error) {
      console.error('Error checking SKUs:', error);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.FETCH_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Extract existing SKUs
    const existing = existingSkus?.map(s => s.sku) || [];

    return NextResponse.json({
      success: true,
      existing_skus: existing,
    });

  } catch (error) {
    console.error('Error in POST /api/dashboard/inventory/check-sku:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

