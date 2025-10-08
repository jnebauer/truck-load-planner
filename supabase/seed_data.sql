-- Database Seeder for Truck Loading & Storage Tracker
-- This script populates the database with sample data for testing

-- Clear existing data (in correct order to avoid foreign key constraints)
-- Only delete if tables exist
DO $$ BEGIN
    DELETE FROM user_permissions;
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

-- Insert Role Permissions
INSERT INTO role_permissions (role_id, permission, created_at) VALUES
-- Admin permissions (all permissions)
('550e8400-e29b-41d4-a716-446655440001', 'users.create', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'users.read', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'users.update', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'users.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'clients.create', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'clients.read', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'clients.update', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'clients.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'inventory.create', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'inventory.read', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'inventory.update', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'inventory.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'projects.create', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'projects.read', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'projects.update', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'projects.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'load_plans.create', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'load_plans.read', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'load_plans.update', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'load_plans.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'reports.generate', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'reports.view', NOW()),

-- Project Manager permissions
('550e8400-e29b-41d4-a716-446655440002', 'clients.read', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'inventory.read', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'inventory.update', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'projects.create', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'projects.read', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'projects.update', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'projects.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'load_plans.create', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'load_plans.read', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'load_plans.update', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'load_plans.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'reports.generate', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'reports.view', NOW()),

-- Warehouse permissions
('550e8400-e29b-41d4-a716-446655440003', 'clients.read', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'inventory.create', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'inventory.read', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'inventory.update', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'inventory.delete', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'projects.read', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'reports.view', NOW()),

-- Client Viewer permissions
('550e8400-e29b-41d4-a716-446655440004', 'clients.read', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'inventory.read', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'projects.read', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'reports.view', NOW());


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


-- Insert some user-specific permissions (overrides)
INSERT INTO user_permissions (user_id, permission, granted, created_at) VALUES
-- Give Mike PM additional inventory delete permission
('770e8400-e29b-41d4-a716-446655440003', 'inventory.delete', true, NOW()),
-- Give Alice warehouse additional project create permission
('770e8400-e29b-41d4-a716-446655440006', 'projects.create', true, NOW()),
-- Revoke reports view from David (client viewer)
('770e8400-e29b-41d4-a716-446655440009', 'reports.view', false, NOW());

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
    'Role Permissions' as table_name, 
    COUNT(*) as count 
FROM role_permissions
UNION ALL
SELECT 
    'User Permissions' as table_name, 
    COUNT(*) as count 
FROM user_permissions;

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
