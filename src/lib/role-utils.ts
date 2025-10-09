// Enhanced role management utilities
import { getNavigationPermissionCategories, availablePermissions } from './permissions';

// Interface for role with enhanced permissions
export interface EnhancedRole {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
  // Enhanced properties
  navigationAccess: Record<string, boolean>;
  actionPermissions: Record<string, {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }>;
}

// Convert role permissions to enhanced format
export const enhanceRole = (role: {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
}): EnhancedRole => {
  const navigationCategories = getNavigationPermissionCategories();
  
  // Calculate navigation access
  const navigationAccess = Object.keys(navigationCategories).reduce((acc, category) => {
    const categoryPermissions = navigationCategories[category as keyof typeof navigationCategories].permissions;
    acc[category] = categoryPermissions.some((permission: string) => 
      role.permissions.includes(permission)
    );
    return acc;
  }, {} as Record<string, boolean>);

  // Calculate action permissions for each category
  const actionPermissions = Object.keys(navigationCategories).reduce((acc, category) => {
    const categoryPermissions = navigationCategories[category as keyof typeof navigationCategories].permissions;
    
    acc[category] = {
      view: categoryPermissions.some((p: string) => 
        role.permissions.includes(p) && (p.includes('.read') || p.includes('.dashboard'))
      ),
      create: categoryPermissions.some((p: string) => 
        role.permissions.includes(p) && p.includes('.create')
      ),
      edit: categoryPermissions.some((p: string) => 
        role.permissions.includes(p) && p.includes('.update')
      ),
      delete: categoryPermissions.some((p: string) => 
        role.permissions.includes(p) && p.includes('.delete')
      )
    };
    
    return acc;
  }, {} as Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>);

  return {
    ...role,
    navigationAccess,
    actionPermissions
  };
};

// Get all possible permissions grouped by navigation categories
export const getAllPermissionsByCategory = () => {
  const navigationCategories = getNavigationPermissionCategories();
  
  const result: Record<string, Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    action: string;
  }>> = {};
  
  Object.entries(navigationCategories).forEach(([categoryName, categoryData]) => {
    result[categoryName] = categoryData.permissions.map(permission => {
      const [module, action] = permission.split('.');
      
      // Simple formatting
      const formattedName = permission
        .replace('.', ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        id: permission,
        name: formattedName,
        description: `${action} permission for ${module}`,
        category: categoryName,
        action: action
      };
    });
  });
  
  return result;
};

// Validate role permissions
export const validateRolePermissions = (permissions: string[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check if all permissions are valid
  const invalidPermissions = permissions.filter(p => !availablePermissions.includes(p as typeof availablePermissions[number]));
  if (invalidPermissions.length > 0) {
    errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
  }
  
  // Check for navigation permissions consistency
  const navigationCategories = getNavigationPermissionCategories();
  Object.entries(navigationCategories).forEach(([categoryName, categoryData]) => {
    const hasNavigationPermission = categoryData.permissions.some(p => 
      p.startsWith('navigation.') && permissions.includes(p)
    );
    
    const hasActionPermissions = categoryData.permissions.some(p => 
      !p.startsWith('navigation.') && permissions.includes(p)
    );
    
    if (hasActionPermissions && !hasNavigationPermission) {
      errors.push(`${categoryName}: Action permissions assigned without navigation access`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate role summary
export const generateRoleSummary = (role: EnhancedRole) => {
  const totalCategories = Object.keys(role.navigationAccess).length;
  const accessibleCategories = Object.values(role.navigationAccess).filter(Boolean).length;
  
  const totalActions = Object.values(role.actionPermissions).reduce((acc, actions) => {
    return acc + Object.values(actions).filter(Boolean).length;
  }, 0);
  
  return {
    totalCategories,
    accessibleCategories,
    totalActions,
    coverage: Math.round((accessibleCategories / totalCategories) * 100)
  };
};
