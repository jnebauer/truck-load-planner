// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Return type for useAppPermissionCheck hook
 */
interface AppPermissionCheckResult {
  hasAccess: boolean;
  isChecking: boolean;
  error: string | null;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook to check if the current user has permission to access a specific app
 * Verifies app permissions and handles automatic redirection for unauthorized access
 * @param requiredAppName - The name of the app to check permission for (e.g., "Truck Load Planner")
 * @param redirectOnFail - Where to redirect if user doesn't have access (default: '/apps')
 * @returns Object with hasAccess, isChecking, and error states
 */
export function useAppPermissionCheck(
  requiredAppName: string,
  redirectOnFail: string = '/apps'
): AppPermissionCheckResult {
  const { user, loading, authenticatedFetch } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAppPermission() {
      // Wait for auth to load
      if (loading) {
        return;
      }

      // If no user, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setIsChecking(true);
        setError(null);

        // Fetch user's app permissions
        const response = await authenticatedFetch('/api/user/apps');
        
        if (!response.ok) {
          throw new Error('Failed to fetch app permissions');
        }

        const data = await response.json();
        const userApps: Array<{ name: string }> = data.apps || [];

        // Check if user has the required app permission
        const hasRequiredApp = userApps.some(
          (app) => app.name === requiredAppName
        );

        if (!hasRequiredApp) {
          // User doesn't have access, redirect
          router.push(redirectOnFail);
          return;
        }

        // User has access
        setHasAccess(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Permission check failed';
        setError(errorMessage);
        console.error('Error checking app permissions:', err);
        
        // On error, redirect to safe page
        router.push(redirectOnFail);
      } finally {
        setIsChecking(false);
      }
    }

    checkAppPermission();
  }, [user, loading, router, authenticatedFetch, requiredAppName, redirectOnFail]);

  return {
    hasAccess,
    isChecking,
    error,
  };
}

