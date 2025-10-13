// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Application data structure
 */
export interface App {
  id: string;
  name: string;
  description: string;
  app_url: string;
  status: string;
}

/**
 * Return type for useApps and useUserApps hooks
 */
interface UseAppsReturn {
  apps: App[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOKS
// ============================================================================
/**
 * Hook to fetch all active apps from database
 * Fetches complete list of applications available in the system
 * @returns Object with apps array, loading state, error state, and refetch function
 */
export function useApps(): UseAppsReturn {
  const { authenticatedFetch } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/auth/app-permissions');

      if (!response.ok) {
        throw new Error(`Failed to fetch apps: ${response.statusText}`);
      }

      const data = await response.json();
      setApps(data.apps || []);
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    apps,
    loading,
    error,
    refetch: fetchApps,
  };
}

/**
 * Hook to fetch user's accessible apps based on permissions
 * Returns only apps that the user has been granted access to
 * @param userId - Optional user ID to fetch apps for specific user (defaults to current user)
 * @returns Object with apps array, loading state, error state, and refetch function
 */
export function useUserApps(userId?: string): UseAppsReturn {
  const { authenticatedFetch } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = userId 
        ? `/api/users/${userId}/apps`
        : '/api/user/apps';

      const response = await authenticatedFetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch user apps: ${response.statusText}`);
      }

      const data = await response.json();
      setApps(data.apps || []);
    } catch (err) {
      console.error('Error fetching user apps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user apps');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchUserApps();
  }, [fetchUserApps]);

  return {
    apps,
    loading,
    error,
    refetch: fetchUserApps,
  };
}

