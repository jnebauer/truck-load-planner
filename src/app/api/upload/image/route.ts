// ============================================================================
// IMAGE UPLOAD API ROUTE - Supabase Storage
// ============================================================================
/**
 * Handles image upload and saves to Supabase Storage
 * 
 * @route POST /api/upload/image
 * @description Uploads and saves image files to Supabase Storage bucket
 * @returns {object} Response with image URL or error message
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { HTTP_STATUS, API_RESPONSE_MESSAGES } from '@/lib/backend/constants';

/**
 * POST handler for image upload
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, error: authError } = await authenticateUser(request);
    if (authError || !user) {
      return NextResponse.json(
        {
          error: authError || 'Unauthorized',
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'users';

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Create storage path
    const storagePath = `${folder}/${filename}`;

    // Convert file to array buffer
    const bytes = await file.arrayBuffer();

    // Initialize Supabase client with service role for storage operations
    // We've already authenticated the user above, so it's safe to use service role
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images') // Bucket name
      .upload(storagePath, bytes, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true, // Allow overwrite if file exists
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'Failed to upload image',
          message: uploadError.message,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        success: true,
        message: API_RESPONSE_MESSAGES.SUCCESS.UPLOAD_SUCCESS,
        data: {
          url: urlData.publicUrl,
          path: storagePath,
          filename: filename,
        },
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        error: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
