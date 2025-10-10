-- Add new app-specific permissions to the database
-- This script adds the new permissions for the apps dashboard system

-- Admin role gets all app permissions
INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.capacity_planner'
FROM roles r 
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission) DO NOTHING;

INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.truck_planner'
FROM roles r 
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission) DO NOTHING;

-- PM role gets capacity planner and truck planner access
INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.capacity_planner'
FROM roles r 
WHERE r.name = 'pm'
ON CONFLICT (role_id, permission) DO NOTHING;

INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.truck_planner'
FROM roles r 
WHERE r.name = 'pm'
ON CONFLICT (role_id, permission) DO NOTHING;

-- Warehouse role gets only truck planner access
INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.truck_planner'
FROM roles r 
WHERE r.name = 'warehouse'
ON CONFLICT (role_id, permission) DO NOTHING;

-- Client viewer role gets only capacity planner access (read-only)
INSERT INTO role_permissions (role_id, permission) 
SELECT r.id, 'apps.capacity_planner'
FROM roles r 
WHERE r.name = 'client_viewer'
ON CONFLICT (role_id, permission) DO NOTHING;

-- Verify the permissions were added correctly
SELECT 
    r.name as role_name,
    rp.permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
WHERE rp.permission LIKE 'apps.%'
ORDER BY r.name, rp.permission;
