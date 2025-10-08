import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { generateTokenPair, JWTPayload } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
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
      .eq('status', 'active')
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}