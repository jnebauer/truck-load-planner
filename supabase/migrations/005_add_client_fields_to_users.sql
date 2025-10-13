-- ============================================================================
-- Migration: Add Client Fields to Users Table
-- Description: Add client-specific fields to users table for unified user management
-- Version: 005
-- Date: 2025-10-13
-- ============================================================================

-- Add client-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_lat DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_lng DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_place_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_lat DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_lng DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_place_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_tax_id ON users(tax_id) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.company_name IS 'Company name for client users';
COMMENT ON COLUMN users.billing_address IS 'Billing address for client users';
COMMENT ON COLUMN users.billing_lat IS 'Billing address latitude from Google Maps';
COMMENT ON COLUMN users.billing_lng IS 'Billing address longitude from Google Maps';
COMMENT ON COLUMN users.billing_place_id IS 'Google Maps Place ID for billing address';
COMMENT ON COLUMN users.shipping_address IS 'Shipping/delivery address for client users';
COMMENT ON COLUMN users.shipping_lat IS 'Shipping address latitude from Google Maps';
COMMENT ON COLUMN users.shipping_lng IS 'Shipping address longitude from Google Maps';
COMMENT ON COLUMN users.shipping_place_id IS 'Google Maps Place ID for shipping address';
COMMENT ON COLUMN users.contact_person IS 'Primary contact person name for client users';
COMMENT ON COLUMN users.tax_id IS 'Tax identification number for client users';
COMMENT ON COLUMN users.website IS 'Website URL for client users';
COMMENT ON COLUMN users.notes IS 'Additional notes for client users';
COMMENT ON COLUMN users.logo_url IS 'Logo URL for client users';

