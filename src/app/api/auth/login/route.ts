import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { generateTokenPair, JWTPayload } from '@/lib/jwt';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.INVALID_EMAIL }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.PASSWORD_TOO_SHORT }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const supabase = await createClient();

    // Get user from database with role information
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
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Get role information from roles table
    const roleName = user.roles?.name || 'client_viewer';
    
    // Ensure role is one of the valid types
    const validRole = ['admin', 'pm', 'warehouse', 'client_viewer'].includes(roleName) 
      ? roleName as 'admin' | 'pm' | 'warehouse' | 'client_viewer'
      : 'client_viewer';

    // Generate JWT tokens
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: validRole,
      clientIds: []
    };

    const tokens = generateTokenPair(tokenPayload, rememberMe);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || '',
        role: roleName,
        status: user.status
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}