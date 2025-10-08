export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role extends Record<string, unknown> {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
}

export interface RoleFormData {
  name: string;
  permissions: string[];
  isActive: boolean;
}

// Helper function to format permission for display
export const formatPermission = (permission: string): Permission => {
  const [module, action] = permission.split('.');
  
  const moduleNames: Record<string, string> = {
    'users': 'User Management',
    'clients': 'Client Management', 
    'roles': 'Role Management',
    'inventory': 'Inventory Management',
    'projects': 'Project Management',
    'load_plans': 'Load Planning',
    'reports': 'Reports'
  };
  
  const actionNames: Record<string, string> = {
    'create': 'Create',
    'read': 'View',
    'update': 'Edit',
    'delete': 'Delete',
    'manage': 'Manage'
  };
  
  return {
    id: permission,
    name: `${actionNames[action] || action} ${moduleNames[module] || module}`,
    description: `${actionNames[action] || action} permissions for ${moduleNames[module] || module}`,
    category: moduleNames[module] || module
  };
};

// Available permissions list
export const availablePermissions = [
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'clients.create',
  'clients.read',
  'clients.update',
  'clients.delete',
  'roles.create',
  'roles.read',
  'roles.update',
  'roles.delete',
  'inventory.create',
  'inventory.read',
  'inventory.update',
  'inventory.delete',
  'projects.create',
  'projects.read',
  'projects.update',
  'projects.delete',
  'load_plans.create',
  'load_plans.read',
  'load_plans.update',
  'load_plans.delete',
  'reports.create',
  'reports.read',
  'reports.update',
  'reports.delete'
];

// Group permissions by category
export const groupPermissionsByCategory = (permissions: Permission[]) => {
  return permissions.reduce((groups, permission) => {
    const category = permission.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);
};

// Calculate role statistics
export const calculateRoleStats = (roles: Role[]) => {
  const totalRoles = roles.length;
  const activeRoles = roles.filter(role => role.isActive).length;
  const inactiveRoles = totalRoles - activeRoles;
  const totalPermissions = availablePermissions.length;
  
  return {
    totalRoles,
    activeRoles,
    inactiveRoles,
    totalPermissions
  };
};

// Role to permissions mapping
export const rolePermissions: Record<string, string[]> = {
  'admin': [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'clients.create', 'clients.read', 'clients.update', 'clients.delete',
    'roles.create', 'roles.read', 'roles.update', 'roles.delete',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
    'projects.create', 'projects.read', 'projects.update', 'projects.delete',
    'load_plans.create', 'load_plans.read', 'load_plans.update', 'load_plans.delete',
    'reports.create', 'reports.read', 'reports.update', 'reports.delete'
  ],
  'pm': [
    'users.read',
    'clients.read',
    'inventory.read', 'inventory.update',
    'projects.create', 'projects.read', 'projects.update', 'projects.delete',
    'load_plans.create', 'load_plans.read', 'load_plans.update', 'load_plans.delete',
    'reports.read'
  ],
  'warehouse': [
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
    'projects.read',
    'load_plans.read'
  ],
  'client_viewer': [
    'clients.read',
    'projects.read',
    'load_plans.read',
    'reports.read'
  ]
};

// Get permissions for a role
export const getRolePermissions = (role: string): string[] => {
  return rolePermissions[role] || [];
};

// Permission checking functions
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const userPermissions = getRolePermissions(userRole);
  return userPermissions.includes(requiredPermission);
};

export const canManageUsers = (userRole: string): boolean => {
  return hasPermission(userRole, 'users.manage') || 
         hasPermission(userRole, 'users.create') ||
         hasPermission(userRole, 'users.update') ||
         hasPermission(userRole, 'users.delete');
};

export const canManageClients = (userRole: string): boolean => {
  return hasPermission(userRole, 'clients.manage') || 
         hasPermission(userRole, 'clients.create') ||
         hasPermission(userRole, 'clients.update') ||
         hasPermission(userRole, 'clients.delete');
};

export const canManageInventory = (userRole: string): boolean => {
  return hasPermission(userRole, 'inventory.manage') || 
         hasPermission(userRole, 'inventory.create') ||
         hasPermission(userRole, 'inventory.update') ||
         hasPermission(userRole, 'inventory.delete');
};

export const canManageProjects = (userRole: string): boolean => {
  return hasPermission(userRole, 'projects.manage') || 
         hasPermission(userRole, 'projects.create') ||
         hasPermission(userRole, 'projects.update') ||
         hasPermission(userRole, 'projects.delete');
};

export const canManageLoadPlans = (userRole: string): boolean => {
  return hasPermission(userRole, 'load_plans.manage') || 
         hasPermission(userRole, 'load_plans.create') ||
         hasPermission(userRole, 'load_plans.update') ||
         hasPermission(userRole, 'load_plans.delete');
};