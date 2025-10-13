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
 * App permission data structure
 */
export interface AppPermission {
  id: string;
  user_id: string;
  app_id: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    roles: {
      name: string;
    };
  };
  granted_by_user: {
    id: string;
    email: string;
    full_name: string;
  };
}

/**
 * User data structure for app permissions
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: {
    name: string;
  };
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing app permissions
 * Handles fetching, granting, updating, and revoking app access for users
 * @returns Object with permissions data, loading state, error state, and permission management functions
 */
export const useAppPermissions = () => {
  const { getAccessToken } = useAuth();
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/app-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch app permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/dashboard/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [getAccessToken]);

  const grantPermission = async (userId: string, appId: string, expiresAt?: string) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/app-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          appId,
          expiresAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to grant permission');
      }

      const data = await response.json();
      setPermissions(prev => [data.permission, ...prev]);
      return data.permission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updatePermission = async (id: string, isActive: boolean, expiresAt?: string) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/app-permissions', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive,
          expiresAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update permission');
      }

      const data = await response.json();
      setPermissions(prev => 
        prev.map(p => p.id === id ? data.permission : p)
      );
      return data.permission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const revokePermission = async (id: string) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/app-permissions?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke permission');
      }

      setPermissions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchUsers();
  }, [fetchPermissions, fetchUsers]);

  return {
    permissions,
    users,
    loading,
    error,
    fetchPermissions,
    fetchUsers,
    grantPermission,
    updatePermission,
    revokePermission,
  };
};
