// ============================================================================
// IMAGE UPLOAD API ROUTE
// ============================================================================
/**
 * Handles image upload and saves to public/images folder
 * 
 * @route POST /api/upload/image
 * @description Uploads and saves image files to public/images directory
 * @returns {object} Response with image URL or error message
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { HTTP_STATUS, API_RESPONSE_MESSAGES } from '@/lib/backend/constants';

/**
 * POST handler for image upload
 */
export async function POST(request: NextRequest) {
  try {
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
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomString}${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
    const filepath = path.join(uploadDir, filename);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await writeFile(filepath, buffer);

    // Generate public URL
    const imageUrl = `/images/${folder}/${filename}`;

    return NextResponse.json(
      {
        success: true,
        message: API_RESPONSE_MESSAGES.SUCCESS.UPLOAD_SUCCESS,
        data: {
          url: imageUrl,
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

