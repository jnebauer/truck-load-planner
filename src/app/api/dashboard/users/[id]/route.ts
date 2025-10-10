import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    // Only admin can update users
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS 
      }, { status: HTTP_STATUS.FORBIDDEN });
    }

    const supabase = await createClient();
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const { email, password, fullName, role, phone, status } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Check if email already exists for a different user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_EMAIL 
      }, { status: HTTP_STATUS.CONFLICT });
    }

    // Get role_id from role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Prepare update data
    const updateData: {
      email: string;
      full_name: string;
      phone: string | null;
      role_id: string;
      status: 'active' | 'inactive' | 'pending';
      password_hash?: string;
    } = {
      email,
      full_name: fullName,
      phone: phone || null,
      role_id: roleData.id,
      status: (status as 'active' | 'inactive' | 'pending') || 'active'
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 12);
      updateData.password_hash = passwordHash;
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({ message: API_RESPONSE_MESSAGES.SUCCESS.USER_UPDATED, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
