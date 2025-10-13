import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyRefreshToken, generateTokenPair, JWTPayload } from '@/lib/jwt';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.TOKEN_REQUIRED },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVALID_TOKEN },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const supabase = await createClient();

    // Get user data from database with role information
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('id', decoded.userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // No client assignments for now
    const clientIds: string[] = [];

    // Get role information from roles table
    const roleName = user.roles?.name || 'client_viewer';
    
    // Ensure role is one of the valid types
    const validRole = ['admin', 'pm', 'warehouse', 'client_viewer'].includes(roleName) 
      ? roleName as 'admin' | 'pm' | 'warehouse' | 'client_viewer'
      : 'client_viewer';

    // Generate new access token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: validRole,
      clientIds: clientIds
    };

    const tokens = generateTokenPair(tokenPayload);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || '',
        role: validRole,
        status: user.status
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
