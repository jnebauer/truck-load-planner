-- Database Seeder for Truck Loading & Storage Tracker
-- This script populates the database with sample data for testing

-- Clear existing data (in correct order to avoid foreign key constraints)
-- Only delete if tables exist
DO $$ BEGIN
    DELETE FROM user_app_permissions;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    DELETE FROM app_permissions;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    DELETE FROM role_permissions;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    DELETE FROM users;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    DELETE FROM roles;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Reset sequences
ALTER SEQUENCE IF EXISTS roles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- Insert Roles
INSERT INTO roles (id, name, description, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'System Administrator with full access', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'pm', 'Project Manager with project and load plan access', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'warehouse', 'Warehouse staff with inventory management access', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'client_viewer', 'Client viewer with read-only access to assigned clients', true, NOW(), NOW());

-- Note: Role permissions are now managed through the UI
-- The role_permissions table uses TEXT field instead of enum
-- This allows for flexible permission management without database migrations


-- Insert Users (with hashed passwords)
-- Password for all users is 'password123' (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, full_name, role_id, status, created_at, updated_at, email_verified, phone) VALUES
-- Admin users
('770e8400-e29b-41d4-a716-446655440001', 'joel@xzibit.com.au', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'John Admin', '550e8400-e29b-41d4-a716-446655440001', 'active', NOW(), NOW(), true, '+1-555-0101'),
('770e8400-e29b-41d4-a716-446655440002', 'superadmin@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Sarah SuperAdmin', '550e8400-e29b-41d4-a716-446655440001', 'active', NOW(), NOW(), true, '+1-555-0102'),

-- Project Managers
('770e8400-e29b-41d4-a716-446655440003', 'pm@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Mike ProjectManager', '550e8400-e29b-41d4-a716-446655440002', 'active', NOW(), NOW(), true, '+1-555-0103'),
('770e8400-e29b-41d4-a716-446655440004', 'jane.pm@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Jane ProjectLead', '550e8400-e29b-41d4-a716-446655440002', 'active', NOW(), NOW(), true, '+1-555-0104'),

-- Warehouse Staff
('770e8400-e29b-41d4-a716-446655440005', 'warehouse@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Bob Warehouse', '550e8400-e29b-41d4-a716-446655440003', 'active', NOW(), NOW(), true, '+1-555-0105'),
('770e8400-e29b-41d4-a716-446655440006', 'alice.warehouse@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Alice Inventory', '550e8400-e29b-41d4-a716-446655440003', 'active', NOW(), NOW(), true, '+1-555-0106'),

-- Client Viewers
('770e8400-e29b-41d4-a716-446655440007', 'client@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Tom AcmeClient', '550e8400-e29b-41d4-a716-446655440004', 'active', NOW(), NOW(), true, '+1-555-0107'),
('770e8400-e29b-41d4-a716-446655440008', 'viewer@buildcorp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Lisa BuildCorp', '550e8400-e29b-41d4-a716-446655440004', 'active', NOW(), NOW(), true, '+1-555-0108'),
('770e8400-e29b-41d4-a716-446655440009', 'monitor@megabuild.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'David MegaBuild', '550e8400-e29b-41d4-a716-446655440004', 'active', NOW(), NOW(), true, '+1-555-0109'),

-- Inactive user for testing
('770e8400-e29b-41d4-a716-446655440010', 'inactive@trucker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9yKjK2K', 'Inactive User', '550e8400-e29b-41d4-a716-446655440003', 'inactive', NOW(), NOW(), false, '+1-555-0110');

-- ============================================================================
-- APP_PERMISSIONS - Application Master Data (Apps List)
-- ============================================================================
INSERT INTO app_permissions (id, name, description, app_url, status, created_at, created_by, updated_at, updated_by) VALUES
(
    '990e8400-e29b-41d4-a716-446655440001', 
    'Truck Load Planner', 
    'Advanced truck loading operations management with intelligent storage logistics and route optimization.',
    '/dashboard',
    'active', 
    NOW(), 
    '770e8400-e29b-41d4-a716-446655440001', 
    NOW(), 
    '770e8400-e29b-41d4-a716-446655440001'
),
(
    '990e8400-e29b-41d4-a716-446655440002', 
    'Capacity Planner', 
    'Comprehensive resource planning and workload distribution system for optimal project management and team productivity.',
    '/capacity-planner',
    'active', 
    NOW(), 
    '770e8400-e29b-41d4-a716-446655440001', 
    NOW(), 
    '770e8400-e29b-41d4-a716-446655440001'
);

-- Note: user_app_permissions will be managed through the admin UI
-- Admins can assign apps to users from the /dashboard/users page

-- Update last login times for some users
UPDATE users SET last_login = NOW() - INTERVAL '2 hours' WHERE email = 'admin@trucker.com';
UPDATE users SET last_login = NOW() - INTERVAL '1 day' WHERE email = 'pm@trucker.com';
UPDATE users SET last_login = NOW() - INTERVAL '3 days' WHERE email = 'warehouse@trucker.com';

-- Display summary
SELECT 
    'Roles' as table_name, 
    COUNT(*) as count 
FROM roles
UNION ALL
SELECT 
    'Users' as table_name, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'App Permissions' as table_name, 
    COUNT(*) as count 
FROM app_permissions
UNION ALL
SELECT 
    'User App Permissions' as table_name, 
    COUNT(*) as count 
FROM user_app_permissions;

-- Display login credentials for testing
SELECT 
    '=== LOGIN CREDENTIALS FOR TESTING ===' as info
UNION ALL
SELECT 
    'Email: joel@xzibit.com.au | Password: password123 | Role: Admin' as info
UNION ALL
SELECT 
    'Email: pm@trucker.com | Password: password123 | Role: Project Manager' as info
UNION ALL
SELECT 
    'Email: warehouse@trucker.com | Password: password123 | Role: Warehouse' as info
UNION ALL
SELECT 
    'Email: client@acme.com | Password: password123 | Role: Client Viewer' as info
UNION ALL
SELECT 
    'Email: inactive@trucker.com | Password: password123 | Role: Inactive User' as info;
