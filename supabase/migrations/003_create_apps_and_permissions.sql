-- Create App Permissions and User App Permissions Tables
-- This migration creates a normalized structure for app management

-- ============================================================================
-- 1. APP_PERMISSIONS TABLE (Master Data - All Available Apps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL, -- Display name: e.g., 'Truck Load Planner', 'Capacity Planner'
    description TEXT, -- App description for display
    app_url VARCHAR(500), -- App URL (external or internal route)
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for app_permissions table
CREATE INDEX IF NOT EXISTS idx_app_permissions_name ON app_permissions(name);
CREATE INDEX IF NOT EXISTS idx_app_permissions_status ON app_permissions(status);
CREATE INDEX IF NOT EXISTS idx_app_permissions_deleted_at ON app_permissions(deleted_at);

-- Create trigger for updated_at on app_permissions
DO $$ BEGIN
    CREATE TRIGGER update_app_permissions_updated_at 
    BEFORE UPDATE ON app_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. USER_APP_PERMISSIONS TABLE (Junction Table - User to App mapping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES app_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, app_id)
);

-- Create indexes for user_app_permissions table
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_user_id ON user_app_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_app_id ON user_app_permissions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_deleted_at ON user_app_permissions(deleted_at);

-- Create trigger for updated_at on user_app_permissions
DO $$ BEGIN
    CREATE TRIGGER update_user_app_permissions_updated_at 
    BEFORE UPDATE ON user_app_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. SEED INITIAL APPS DATA
-- ============================================================================

-- Insert default apps (these will be referenced by user_app_permissions)
-- Note: User app assignments will be managed through the admin UI
INSERT INTO app_permissions (name, description, app_url, status) VALUES
(
    'Truck Load Planner', 
    'Advanced truck loading operations management with intelligent storage logistics and route optimization.',
    '/dashboard',
    'active'
),
(
    'Capacity Planner', 
    'Comprehensive resource planning and workload distribution system for optimal project management and team productivity.',
    '/capacity-planner',
    'active'
)
ON CONFLICT DO NOTHING;

