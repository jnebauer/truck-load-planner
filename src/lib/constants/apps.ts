/**
 * Application Names Constants
 * Central source of truth for all application names used across the system
 */
export const APP_NAMES = {
  TRUCK_LOAD_PLANNER: 'Truck Load Planner',
  CAPACITY_PLANNER: 'Capacity Planner',
} as const;

/**
 * Application URLs Constants
 * Central source of truth for all application URLs
 */
export const APP_URLS = {
  TRUCK_LOAD_PLANNER: '/dashboard',
  CAPACITY_PLANNER: process.env.NEXT_PUBLIC_CAPACITY_PLANNER_URL || '/capacity-planner',
  APPS_SELECTION: '/apps',
  LOGIN: '/login',
} as const;

/**
 * Type helper for app names
 */
export type AppName = typeof APP_NAMES[keyof typeof APP_NAMES];

