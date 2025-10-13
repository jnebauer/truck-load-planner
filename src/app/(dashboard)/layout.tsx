'use client';

import React from 'react';
import { Layout } from '@/components';
import { useAppPermissionCheck } from '@/hooks/auth';
import { APP_NAMES, APP_URLS } from '@/lib/constants/apps';

/**
 * Dashboard Layout Component
 * Protects all dashboard routes by checking if the user has "Truck Load Planner" app permission
 * Redirects to /apps if user doesn't have access
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has permission to access Truck Load Planner
  const { hasAccess } = useAppPermissionCheck(
    APP_NAMES.TRUCK_LOAD_PLANNER,
    APP_URLS.APPS_SELECTION
  );

  // // Show loading state while checking permissions
  // if (isChecking) {
  //   return <LoadingSpinner text="Verifying access..." />;
  // }

  // If user doesn't have access, the hook will handle redirect
  // Return null while redirecting
  if (!hasAccess) {
    return null;
  }

  // User has access, render the dashboard
  return <Layout>{children}</Layout>;
}
