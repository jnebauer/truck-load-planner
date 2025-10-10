import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { API_RESPONSE_MESSAGES, HTTP_STATUS } from '@/lib/backend/constants';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const supabase = await createClient();

    // Get the latest user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        status,
        role_id,
        roles!inner(name)
      `)
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
      }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    // Transform the data to match the expected format
    const transformedUser = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone,
      role: userData.roles.name,
      status: userData.status,
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError || API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED 
      }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const supabase = await createClient();
    const { fullName, phone } = await request.json();

    // Validate required fields
    if (!fullName) {
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.MISSING_REQUIRED_FIELDS 
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Prepare update data - only allow updating name and phone
    const updateData = {
      full_name: fullName,
      phone: phone && phone.trim() !== '' ? phone : null,
    };

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ 
        error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
      }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    return NextResponse.json({ 
      message: API_RESPONSE_MESSAGES.SUCCESS.PROFILE_UPDATED, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR 
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}