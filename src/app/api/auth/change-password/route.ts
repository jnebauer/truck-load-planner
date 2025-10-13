import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.PASSWORD_TOO_SHORT 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const supabase = await createClient();

    // Get user's current password hash
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND 
      }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
      }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({ 
      message: 'Password changed successfully' 
    }, { status: HTTP_STATUS.OK });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ 
      error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}