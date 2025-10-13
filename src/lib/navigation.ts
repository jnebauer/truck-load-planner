// Navigation Configuration with Role-Based Access Control
export interface NavigationItem {
  id: string;
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string; // Required permission to see this tab
  submenu?: NavigationSubItem[];
  // Action permissions for this navigation item
  actions?: {
    view: string; // Permission to view this section
    create?: string; // Permission to create items
    edit?: string; // Permission to edit items
    delete?: string; // Permission to delete items
  };
}

export interface NavigationSubItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string; // Required permission to see this submenu item
  actions?: {
    view: string; // Permission to view this section
    create?: string; // Permission to create items
    edit?: string; // Permission to edit items
    delete?: string; // Permission to delete items
  };
}

// Import icons
import {
  BarChart3,
  Package,
  Truck,
  FileText,
  Upload,
  Building2,
  Users,
  Settings,
  Shield,
  UserCheck,
} from 'lucide-react';

// Main Navigation Items Configuration
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    permission: 'apps.truck_planner',
    actions: {
      view: 'apps.truck_planner',
    },
  },
  {
    id: 'inventory',
    name: 'Inventory',
    href: '',
    icon: Package,
    permission: 'navigation.inventory',
    actions: {
      view: 'inventory.read',
      create: 'inventory.create',
      edit: 'inventory.update',
      delete: 'inventory.delete',
    },
  },
  {
    id: 'truck_planner',
    name: 'Truck Planner',
    href: '',
    icon: Truck,
    permission: 'navigation.truck_planner',
    actions: {
      view: 'load_plans.read',
      create: 'load_plans.create',
      edit: 'load_plans.update',
      delete: 'load_plans.delete',
    },
  },
  {
    id: 'reports',
    name: 'Reports',
    href: '',
    icon: FileText,
    permission: 'navigation.reports',
    actions: {
      view: 'reports.read',
      create: 'reports.create',
      edit: 'reports.update',
      delete: 'reports.delete',
    },
  },
  {
    id: 'import',
    name: 'Import',
    href: '',
    icon: Upload,
    permission: 'navigation.import',
    actions: {
      view: 'navigation.import',
    },
  },
  {
    id: 'clients',
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Building2,
    permission: 'navigation.clients',
    actions: {
      view: 'clients.read',
      create: 'clients.create',
      edit: 'clients.update',
      delete: 'clients.delete',
    },
  },
  {
    id: 'user_management',
    name: 'User Management',
    icon: Users,
    permission: 'navigation.user_management',
    actions: {
      view: 'navigation.user_management',
    },
    submenu: [
      {
        id: 'roles_permissions',
        name: 'Roles & Permissions',
        href: '/dashboard/roles-permissions',
        icon: Shield,
        permission: 'roles.read',
        actions: {
          view: 'roles.read',
          create: 'roles.create',
          edit: 'roles.update',
          delete: 'roles.delete',
        },
      },
      {
        id: 'users',
        name: 'Employees',
        href: '/dashboard/users',
        icon: UserCheck,
        permission: 'users.read',
        actions: {
          view: 'users.read',
          create: 'users.create',
          edit: 'users.update',
          delete: 'users.delete',
        },
      },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'navigation.settings',
    actions: {
      view: 'navigation.settings',
    },
  },
];

// Helper function to filter navigation items based on user permissions
export const getFilteredNavigation = (
  hasPermission: (permission: string) => boolean
): NavigationItem[] => {
  return NAVIGATION_ITEMS.filter((item) => {
    // Check if user has permission for main item
    if (!hasPermission(item.permission)) {
      return false;
    }

    // If item has submenu, filter submenu items based on permissions
    if (item.submenu) {
      item.submenu = item.submenu.filter((subItem) =>
        hasPermission(subItem.permission)
      );

      // Only show main item if it has at least one visible submenu item
      return item.submenu.length > 0;
    }

    return true;
  });
};

// Helper function to check if user can perform specific actions
export const canPerformAction = (
  hasPermission: (permission: string) => boolean,
  item: NavigationItem | NavigationSubItem,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  if (!item.actions) return false;

  const permission = item.actions[action];
  return permission ? hasPermission(permission) : false;
};

// Get action permissions for a navigation item
export const getActionPermissions = (
  hasPermission: (permission: string) => boolean,
  item: NavigationItem | NavigationSubItem
) => {
  if (!item.actions)
    return { view: false, create: false, edit: false, delete: false };

  return {
    view: hasPermission(item.actions.view),
    create: item.actions.create ? hasPermission(item.actions.create) : false,
    edit: item.actions.edit ? hasPermission(item.actions.edit) : false,
    delete: item.actions.delete ? hasPermission(item.actions.delete) : false,
  };
};
