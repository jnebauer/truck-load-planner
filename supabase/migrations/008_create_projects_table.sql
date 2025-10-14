-- Migration: Create projects table
-- Description: Projects table with site address (lat/lng), audit fields (created_by, updated_by)
-- Date: 2025-10-14

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  
  -- Site Address with Geo coordinates
  site_address TEXT,
  site_lat NUMERIC,
  site_lng NUMERIC,
  site_place_id TEXT,
  
  -- Project dates
  start_date DATE,
  end_date DATE,
  
  -- Status: planning -> active -> completed/cancelled/inactive/deleted
  status TEXT NOT NULL DEFAULT 'planning' 
    CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'inactive', 'deleted')),
  
  notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Trigger for updated_at (reuse existing function if available)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE projects IS 'Client projects with site locations and audit trail';
COMMENT ON COLUMN projects.client_id IS 'Reference to client (users table with role=clients)';
COMMENT ON COLUMN projects.code IS 'Unique project code (e.g., PROJ-001)';
COMMENT ON COLUMN projects.site_address IS 'Project site address from Google Places';
COMMENT ON COLUMN projects.site_lat IS 'Site latitude for mapping';
COMMENT ON COLUMN projects.site_lng IS 'Site longitude for mapping';
COMMENT ON COLUMN projects.site_place_id IS 'Google Place ID for reference';
COMMENT ON COLUMN projects.status IS 'Project status: planning, active, on_hold, completed, cancelled, inactive, deleted';
COMMENT ON COLUMN projects.created_by IS 'User who created this project';
COMMENT ON COLUMN projects.updated_by IS 'User who last updated this project';

