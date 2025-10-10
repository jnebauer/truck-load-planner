-- Create app_permissions table for granular user-app access control
-- This allows admins to assign specific apps to specific users

-- Create app_permissions table
CREATE TABLE IF NOT EXISTS app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id VARCHAR(100) NOT NULL, -- e.g., 'capacity-planner', 'truck-load-planner'
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who granted permission
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_permissions_user_id ON app_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_permissions_app_id ON app_permissions(app_id);
CREATE INDEX IF NOT EXISTS idx_app_permissions_is_active ON app_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_app_permissions_expires_at ON app_permissions(expires_at);

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_app_permissions_updated_at 
    BEFORE UPDATE ON app_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert default app permissions for existing roles
-- Admin gets access to all apps
INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'capacity-planner', u.id
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'admin'
ON CONFLICT (user_id, app_id) DO NOTHING;

INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'truck-load-planner', u.id
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'admin'
ON CONFLICT (user_id, app_id) DO NOTHING;

-- PM gets access to both apps
INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'capacity-planner', (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1)
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'pm'
ON CONFLICT (user_id, app_id) DO NOTHING;

INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'truck-load-planner', (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1)
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'pm'
ON CONFLICT (user_id, app_id) DO NOTHING;

-- Warehouse gets access to truck-load-planner only
INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'truck-load-planner', (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1)
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'warehouse'
ON CONFLICT (user_id, app_id) DO NOTHING;

-- Client viewer gets access to capacity-planner only
INSERT INTO app_permissions (user_id, app_id, granted_by)
SELECT u.id, 'capacity-planner', (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1)
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'client_viewer'
ON CONFLICT (user_id, app_id) DO NOTHING;

-- Verify the app permissions were created correctly
SELECT 
    u.email,
    r.name as role_name,
    ap.app_id,
    ap.is_active,
    ap.granted_at
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN app_permissions ap ON u.id = ap.user_id
ORDER BY u.email, ap.app_id;
