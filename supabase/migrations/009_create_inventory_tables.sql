-- =====================================================
-- Inventory Management Tables
-- Created: October 14, 2025
-- Purpose: Core tables for truck loading & storage tracker
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS stackability CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;
DROP TYPE IF EXISTS media_tag CASCADE;

-- Stackability: how items can be stacked
CREATE TYPE stackability AS ENUM (
  'stackable',      -- Can be both top or bottom
  'non_stackable',  -- Cannot stack at all (floor only)
  'top_only',       -- Can sit on another item but nothing on top
  'bottom_only'     -- Can support another item but cannot sit on another
);

-- Inventory Status: lifecycle of inventory units
CREATE TYPE inventory_status AS ENUM (
  'in_storage',     -- In warehouse
  'reserved',       -- Reserved for a project
  'on_truck',       -- Loaded on truck
  'onsite',         -- Delivered to site
  'returned'        -- Returned to warehouse
);

-- Media Tag: type of photo/file
CREATE TYPE media_tag AS ENUM (
  'pallet',         -- Photo of the pallet itself
  'label',          -- Photo of the label/barcode
  'racking',        -- Photo of location/rack
  'onsite'          -- Photo of item installed onsite
);

-- =====================================================
-- DROP EXISTING TABLES (if they exist)
-- =====================================================
DROP TABLE IF EXISTS movements CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS inventory_units CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- =====================================================
-- ITEMS TABLE (Catalog/Types)
-- =====================================================
-- Items represent a "type" or "catalog entry" of inventory
-- Example: "2.4m Wall Panels" with dimensions 2400×1200×2500mm
-- Multiple physical pallets can reference the same item

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Identification
  label TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  
  -- Physical Dimensions (in millimeters)
  length_mm NUMERIC NOT NULL CHECK (length_mm > 0),
  width_mm NUMERIC NOT NULL CHECK (width_mm > 0),
  height_mm NUMERIC NOT NULL CHECK (height_mm > 0),
  weight_kg NUMERIC NOT NULL CHECK (weight_kg >= 0),
  
  -- Calculated Volume (auto-generated)
  volume_m3 NUMERIC GENERATED ALWAYS AS (
    ROUND((length_mm * width_mm * height_mm) / 1000000000.0, 3)
  ) STORED,
  
  -- Stacking Properties
  stackability stackability NOT NULL DEFAULT 'stackable',
  top_load_rating_kg NUMERIC CHECK (top_load_rating_kg >= 0),
  orientation_locked BOOLEAN DEFAULT false,
  fragile BOOLEAN DEFAULT false,
  keep_upright BOOLEAN DEFAULT true,
  
  -- Truck Loading Priority (lower number = load first, e.g., 1 = floor/rigging)
  priority INTEGER,
  
  -- QR Code Content (unique identifier for labels)
  qr_code TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_items_client_id ON items(client_id);
CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_items_client_project_priority ON items(client_id, project_id, priority);
CREATE INDEX idx_items_sku ON items(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_items_label ON items USING gin(to_tsvector('english', label));
CREATE INDEX idx_items_qr_code ON items(qr_code) WHERE qr_code IS NOT NULL;

-- Comments
COMMENT ON TABLE items IS 'Catalog of item types (pallet/case types) with dimensions and stacking properties';
COMMENT ON COLUMN items.volume_m3 IS 'Auto-calculated volume in cubic meters';
COMMENT ON COLUMN items.priority IS 'Loading priority: 1 = floor/rigging (first), higher = later phases';
COMMENT ON COLUMN items.top_load_rating_kg IS 'Maximum weight this item can support on top (kg)';

-- =====================================================
-- INVENTORY_UNITS TABLE (Physical Stock)
-- =====================================================
-- Each row represents a physical pallet/case in the warehouse
-- 1 item type can have many inventory units

CREATE TABLE inventory_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Identification
  pallet_no TEXT,
  inventory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Location in Warehouse
  location_site TEXT NOT NULL,          -- e.g., "Derrimut"
  location_latitude DECIMAL(10, 8),     -- Latitude from Google Places
  location_longitude DECIMAL(11, 8),    -- Longitude from Google Places
  location_aisle TEXT,                  -- e.g., "A"
  location_bay TEXT,                    -- e.g., "01"
  location_level TEXT,                  -- e.g., "1"
  location_notes TEXT,
  
  -- Quantity (usually 1, but can be multiple units of same item on same pallet)
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  
  -- Status
  status inventory_status NOT NULL DEFAULT 'in_storage',
  
  -- Last Inspection
  last_inspection_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraint: pallet_no must be unique per (client_id, location_site)
  CONSTRAINT unique_pallet_no UNIQUE NULLS NOT DISTINCT (client_id, location_site, pallet_no)
);

-- Indexes for performance
CREATE INDEX idx_inventory_units_item_id ON inventory_units(item_id);
CREATE INDEX idx_inventory_units_client_id ON inventory_units(client_id);
CREATE INDEX idx_inventory_units_project_id ON inventory_units(project_id);
CREATE INDEX idx_inventory_units_client_status ON inventory_units(client_id, status);
CREATE INDEX idx_inventory_units_client_project_status ON inventory_units(client_id, project_id, status);
CREATE INDEX idx_inventory_units_location ON inventory_units(location_site, location_aisle, location_bay, location_level);
CREATE INDEX idx_inventory_units_pallet_no ON inventory_units(pallet_no) WHERE pallet_no IS NOT NULL;
CREATE INDEX idx_inventory_units_created_at ON inventory_units(created_at DESC);

-- Comments
COMMENT ON TABLE inventory_units IS 'Physical inventory instances (1 row per pallet/case in warehouse)';
COMMENT ON COLUMN inventory_units.pallet_no IS 'Physical pallet number/identifier from spreadsheet';
COMMENT ON COLUMN inventory_units.quantity IS 'Number of units on this pallet (usually 1)';

-- =====================================================
-- MEDIA TABLE (Photos/Files)
-- =====================================================
-- Photos and files attached to inventory units

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  inventory_unit_id UUID NOT NULL REFERENCES inventory_units(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  
  -- File Information
  url TEXT NOT NULL,
  tag media_tag NOT NULL,
  content_type TEXT,
  width_px INTEGER,
  height_px INTEGER,
  file_size_bytes BIGINT,
  
  -- Metadata
  taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_media_inventory_unit_id ON media(inventory_unit_id);
CREATE INDEX idx_media_inventory_unit_tag ON media(inventory_unit_id, tag);
CREATE INDEX idx_media_item_id ON media(item_id);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- Comments
COMMENT ON TABLE media IS 'Photos and files attached to inventory units';
COMMENT ON COLUMN media.tag IS 'Type of photo: pallet (item photo), label (barcode), racking (location), onsite (installed)';

-- =====================================================
-- MOVEMENTS TABLE (Audit Trail)
-- =====================================================
-- Track all status changes and location moves

CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  inventory_unit_id UUID NOT NULL REFERENCES inventory_units(id) ON DELETE CASCADE,
  
  -- Status Change
  from_status inventory_status,
  to_status inventory_status NOT NULL,
  
  -- Location Change (stored as JSONB for flexibility)
  from_location JSONB,
  to_location JSONB,
  
  -- Notes
  note TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_movements_inventory_unit_id ON movements(inventory_unit_id);
CREATE INDEX idx_movements_inventory_unit_created ON movements(inventory_unit_id, created_at DESC);
CREATE INDEX idx_movements_created_at ON movements(created_at DESC);
CREATE INDEX idx_movements_from_status ON movements(from_status);
CREATE INDEX idx_movements_to_status ON movements(to_status);

-- Comments
COMMENT ON TABLE movements IS 'Audit trail of all status changes and location moves';
COMMENT ON COLUMN movements.from_location IS 'Previous location as JSON: {site, aisle, bay, level}';
COMMENT ON COLUMN movements.to_location IS 'New location as JSON: {site, aisle, bay, level}';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trigger_items_updated_at ON items;
DROP TRIGGER IF EXISTS trigger_inventory_units_updated_at ON inventory_units;
DROP FUNCTION IF EXISTS update_items_updated_at();
DROP FUNCTION IF EXISTS update_inventory_units_updated_at();

-- Update updated_at timestamp on items
CREATE OR REPLACE FUNCTION update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_items_updated_at();

-- Update updated_at timestamp on inventory_units
CREATE OR REPLACE FUNCTION update_inventory_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_units_updated_at
  BEFORE UPDATE ON inventory_units
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_units_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON SCHEMA public IS 'Inventory Management System for Truck Loading & Storage Tracker';

