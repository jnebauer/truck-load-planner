// Apps Configuration Component - Centralized app management
export interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  url: string; // External URL or internal route
  color: string; // Theme color
  permission: string; // Required permission to access
  isExternal: boolean; // Whether it's external app or internal
  isActive: boolean; // Whether app is available
}

// Available Apps Configuration
export const APPS_CONFIG: AppConfig[] = [
  {
    id: 'capacity-planner',
    name: 'Capacity Planner',
    description: 'Comprehensive resource planning and workload distribution system for optimal project management and team productivity.',
    icon: 'BarChart3',
    url: 'http://localhost:3001', // Capacity planner URL
    color: 'blue',
    permission: 'apps.capacity_planner',
    isExternal: true,
    isActive: true
  },
  {
    id: 'truck-load-planner',
    name: 'Truck Load Planner',
    description: 'Advanced truck loading operations management with intelligent storage logistics and route optimization.',
    icon: 'Truck',
    url: '/dashboard', // Internal route
    color: 'green',
    permission: 'apps.truck_planner',
    isExternal: false,
    isActive: true
  }
];

// Get all active app IDs (for admin access)
export const getAllActiveAppIds = (): string[] => {
  return APPS_CONFIG.filter(app => app.isActive).map(app => app.id);
};

// Get apps accessible by user based on app permissions
export const getAccessibleApps = (accessibleAppIds: string[]): AppConfig[] => {
  return APPS_CONFIG.filter(app => {
    // Always show truck-load-planner for all users
    if (app.id === 'truck-load-planner') {
      return app.isActive;
    }
    // For other apps, check permissions
    return app.isActive && accessibleAppIds.includes(app.id);
  });
};

// Check if user has access to specific app
export const hasAppAccess = (appId: string, accessibleAppIds: string[]): boolean => {
  const app = APPS_CONFIG.find(a => a.id === appId);
  if (!app || !app.isActive) return false;
  
  return accessibleAppIds.includes(appId);
};

// Get app by ID
export const getAppById = (appId: string): AppConfig | undefined => {
  return APPS_CONFIG.find(app => app.id === appId);
};
