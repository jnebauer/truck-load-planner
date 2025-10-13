-- ============================================================================
-- Migration: Add Profile Image Column to Users Table
-- Description: Adds profile_image field to store user profile pictures
-- Version: 006
-- Date: 2024-10-13
-- ============================================================================

-- Add profile_image column to users table
ALTER TABLE users
ADD COLUMN profile_image TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_image IS 'URL path to user profile image stored in public/images/users folder';

