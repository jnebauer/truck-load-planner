/**
 * UI metadata for apps (icon, color, isExternal)
 * Add new apps here as they are created in the database
 */
export const APP_UI_METADATA: Record<string, { icon: string; color: string; isExternal: boolean }> = {
  'Capacity Planner': {
    icon: 'BarChart3',
    color: 'blue',
    isExternal: true,
  },
  'Truck Load Planner': {
    icon: 'Truck',
    color: 'green',
    isExternal: false,
  },
  'LED Screen Calculator': {
    icon: 'Monitor',
    color: 'gray',
    isExternal: true,
  },
};

/**
 * Get UI metadata for an app by name
 * Returns default values if app not found in metadata
 */
export const getAppUIMetadata = (appName: string) => {
  return APP_UI_METADATA[appName] || {
    icon: 'Package',
    color: 'gray',
    isExternal: false,
  };
};

