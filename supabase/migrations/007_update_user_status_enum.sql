-- ============================================================================
-- Migration: Remove 'pending' from user_status enum
-- Description: Keep only active, inactive, blocked in user_status enum
-- Version: 007
-- Date: 2024-10-13
-- ============================================================================

-- Step 1: Convert column to TEXT (to avoid enum validation errors)
ALTER TABLE users ALTER COLUMN status TYPE TEXT;

-- Step 2: Update any existing 'pending' records to 'active'
UPDATE users 
SET status = 'active' 
WHERE status = 'pending';

-- Step 3: Drop the old enum type
DROP TYPE IF EXISTS user_status;

-- Step 4: Create new enum with only: active, inactive, blocked
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');

-- Step 5: Convert column back to enum type
ALTER TABLE users 
ALTER COLUMN status TYPE user_status 
USING status::user_status;

-- Step 6: Set default value
ALTER TABLE users 
ALTER COLUMN status SET DEFAULT 'active'::user_status;

-- Step 7: Add NOT NULL constraint
ALTER TABLE users 
ALTER COLUMN status SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or blocked (pending removed)';
