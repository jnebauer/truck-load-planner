-- ============================================================================
-- Migration: Remove 'pending' from user_status enum
-- Description: Keep only active, inactive, blocked in user_status enum
-- Version: 007
-- Date: 2024-10-13
-- ============================================================================

-- Step 1: Drop default value first (required before dropping enum)
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;

-- Step 2: Convert column to TEXT (to avoid enum validation errors)
ALTER TABLE users ALTER COLUMN status TYPE TEXT;

-- Step 3: Update any existing 'pending' records to 'active'
UPDATE users 
SET status = 'active' 
WHERE status = 'pending';

-- Step 4: Drop the old enum type
DROP TYPE IF EXISTS user_status;

-- Step 5: Create new enum with only: active, inactive, blocked
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');

-- Step 6: Convert column back to enum type
ALTER TABLE users 
ALTER COLUMN status TYPE user_status 
USING status::user_status;

-- Step 7: Set default value
ALTER TABLE users 
ALTER COLUMN status SET DEFAULT 'active'::user_status;

-- Step 8: Add NOT NULL constraint
ALTER TABLE users 
ALTER COLUMN status SET NOT NULL;

-- Step 9: Add comment for documentation
COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or blocked (pending removed)';
