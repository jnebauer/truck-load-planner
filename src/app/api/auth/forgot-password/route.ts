import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import crypto from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Send password reset email to user
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.INVALID_EMAIL },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const supabase = await createClient();

    // Check if user exists and is active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, status')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'active')
      .single();

    if (error || !user) {
      // Return error for non-existent email
      return NextResponse.json({
        success: false,
        error: API_RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND
      }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating reset token:', updateError);
      return NextResponse.json(
        { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.full_name, resetUrl);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to user for security (don't reveal if email failed)
    }

    return NextResponse.json({
      success: true,
      message: API_RESPONSE_MESSAGES.SUCCESS.EMAIL_SENT,
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl,
        resetToken,
        expiresAt: resetTokenExpiry
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
