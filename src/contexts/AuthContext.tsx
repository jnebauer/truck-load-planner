'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission, canManageUsers, canManageClients, canManageInventory, canManageProjects, canManageLoadPlans } from '@/lib/permissions';

interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  role: 'admin' | 'pm' | 'warehouse' | 'client_viewer';
  status: 'active' | 'inactive' | 'blocked';
  rememberMe: boolean;
  permissions?: string[]; // Database permissions
  accessibleApps?: string[]; // Apps user has access to
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  // Password reset functions
  requestPasswordReset: (email: string) => Promise<{ error: Error | null; message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error: Error | null; message: string }>;
  verifyResetToken: (token: string) => Promise<{ error: Error | null; valid: boolean; email?: string }>;
  isAdmin: boolean;
  isPM: boolean;
  isWarehouse: boolean;
  isClientViewer: boolean;
  // Permission checks
  hasPermission: (permission: string) => boolean;
  canManageUsers: boolean;
  canManageClients: boolean;
  canManageInventory: boolean;
  canManageProjects: boolean;
  canManageLoadPlans: boolean;
  // Authenticated fetch helper
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (from localStorage or sessionStorage)
    let savedUser = localStorage.getItem('trucker_user');
    let savedTokens = localStorage.getItem('trucker_tokens');
    
    // If not in localStorage, check sessionStorage
    if (!savedUser || !savedTokens) {
      savedUser = sessionStorage.getItem('trucker_user');
      savedTokens = sessionStorage.getItem('trucker_tokens');
    }
    
    if (savedUser && savedTokens) {
      try {
        const userData = JSON.parse(savedUser);
        const tokenData = JSON.parse(savedTokens);
        
        setUser(userData);
        setTokens(tokenData);
        
        // Fetch fresh permissions from database
        if (userData.id && tokenData.accessToken) {
          fetchUserPermissions(userData.id, tokenData.accessToken).then(permissions => {
            if (permissions.length > 0) {
              const userWithPermissions = { ...userData, permissions };
              setUser(userWithPermissions);
              
              // Update stored user data
              if (localStorage.getItem('trucker_user')) {
                localStorage.setItem('trucker_user', JSON.stringify(userWithPermissions));
              } else {
                sessionStorage.setItem('trucker_user', JSON.stringify(userWithPermissions));
              }
            }
          });
        }
      } catch (error) {
        console.error('Error parsing saved user/tokens:', error);
        localStorage.removeItem('trucker_user');
        localStorage.removeItem('trucker_tokens');
        sessionStorage.removeItem('trucker_user');
        sessionStorage.removeItem('trucker_tokens');
      }
    }
    setLoading(false);
  }, []);

  // Fetch user permissions from database
  const fetchUserPermissions = async (userId: string, accessToken: string) => {
    try {
      const response = await fetch('/api/user/permissions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.permissions || [];
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
    return [];
  };

  // Fetch user's accessible apps from database
  const fetchUserApps = async (userId: string, accessToken: string) => {
    try {
      const response = await fetch('/api/user/apps', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.accessibleApps || [];
      }
    } catch (error) {
      console.error('Error fetching user apps:', error);
    }
    return [];
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        // Fetch user permissions and accessible apps from database
        const [permissions, accessibleApps] = await Promise.all([
          fetchUserPermissions(data.user.id, data.tokens.accessToken),
          fetchUserApps(data.user.id, data.tokens.accessToken)
        ]);
        
        // Add permissions and accessible apps to user object
        const userWithPermissions = {
          ...data.user,
          permissions,
          accessibleApps
        };
        
        setUser(userWithPermissions);
        setTokens(data.tokens);
        
        // Save to localStorage only if rememberMe is true
        if (rememberMe) {
          localStorage.setItem('trucker_user', JSON.stringify(userWithPermissions));
          localStorage.setItem('trucker_tokens', JSON.stringify(data.tokens));
        } else {
          // For session-only storage, use sessionStorage
          sessionStorage.setItem('trucker_user', JSON.stringify(userWithPermissions));
          sessionStorage.setItem('trucker_tokens', JSON.stringify(data.tokens));
        }
        
        return { error: null };
      } else {
        return { error: new Error(data.error || 'Login failed') };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('trucker_user');
    localStorage.removeItem('trucker_tokens');
    sessionStorage.removeItem('trucker_user');
    sessionStorage.removeItem('trucker_tokens');
    router.push('/login');
  };

  const getAccessToken = () => {
    return tokens?.accessToken || null;
  };

  // Password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return { error: null, message: data.message };
      } else {
        return { error: new Error(data.error || 'Failed to request password reset'), message: '' };
      }
    } catch (error) {
      return { error: error as Error, message: '' };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        return { error: null, message: data.message };
      } else {
        return { error: new Error(data.error || 'Failed to reset password'), message: '' };
      }
    } catch (error) {
      return { error: error as Error, message: '' };
    }
  };

  const verifyResetToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        return { error: null, valid: true, email: data.email };
      } else {
        return { error: new Error(data.error || 'Invalid token'), valid: false };
      }
    } catch (error) {
      return { error: error as Error, valid: false };
    }
  };

  // Role checks
  const isAdmin = user?.role === 'admin';
  const isPM = user?.role === 'pm';
  const isWarehouse = user?.role === 'warehouse';
  const isClientViewer = user?.role === 'client_viewer';

  // Permission checks - Admin gets everything, others follow restrictions
  const hasPermissionCheck = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin role gets ALL permissions - no restrictions
    if (user.role === 'admin') {
      return true;
    }
    
    // If user has database permissions, use them
    if (user.permissions && user.permissions.length > 0) {
      const hasPermission = user.permissions.includes(permission);
      return hasPermission;
    }
    
    // For other roles, check if it's navigation.dashboard and restrict it
    if (permission === 'navigation.dashboard') {
      return false; // Hide Dashboard tab for non-admin roles
    }
    
    // Fallback to static permissions for other roles and permissions
    return hasPermission(user.role, permission);
  };

  const canManageUsersCheck = user ? canManageUsers(user.role) : false;
  const canManageClientsCheck = user ? canManageClients(user.role) : false;
  const canManageInventoryCheck = user ? canManageInventory(user.role) : false;
  const canManageProjectsCheck = user ? canManageProjects(user.role) : false;
  const canManageLoadPlansCheck = user ? canManageLoadPlans(user.role) : false;

  // Authenticated fetch helper
  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getAccessToken();
    
    // Start with custom headers from options
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    // Only set Content-Type if it's not already set and body is not FormData
    // FormData needs browser to set Content-Type with boundary automatically
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    getAccessToken,
    // Password reset functions
    requestPasswordReset,
    resetPassword,
    verifyResetToken,
    isAdmin,
    isPM,
    isWarehouse,
    isClientViewer,
    // Permission checks
    hasPermission: hasPermissionCheck,
    canManageUsers: canManageUsersCheck,
    canManageClients: canManageClientsCheck,
    canManageInventory: canManageInventoryCheck,
    canManageProjects: canManageProjectsCheck,
    canManageLoadPlans: canManageLoadPlansCheck,
    // Authenticated fetch helper
    authenticatedFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}