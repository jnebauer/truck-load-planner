'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission, canManageUsers, canManageClients, canManageInventory, canManageProjects, canManageLoadPlans } from '@/lib/permissions';

interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'pm' | 'warehouse' | 'client_viewer';
  status: 'active' | 'inactive' | 'pending';
  rememberMe: boolean;
  clients: Array<{
    id: string;
    name: string;
    logo_url: string | null;
    billing_ref: string | null;
  }>;
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
  // Client access
  canAccessClient: (clientId: string) => boolean;
  getAccessibleClientIds: () => string[];
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
        setUser(JSON.parse(savedUser));
        setTokens(JSON.parse(savedTokens));
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
        setUser(data.user);
        setTokens(data.tokens);
        
        // Save to localStorage only if rememberMe is true
        console.log('rememberMe:', rememberMe);
        if (rememberMe) {
          localStorage.setItem('trucker_user', JSON.stringify(data.user));
          localStorage.setItem('trucker_tokens', JSON.stringify(data.tokens));
        } else {
          // For session-only storage, use sessionStorage
          sessionStorage.setItem('trucker_user', JSON.stringify(data.user));
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

  // Permission checks
  const hasPermissionCheck = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canManageUsersCheck = user ? canManageUsers(user.role) : false;
  const canManageClientsCheck = user ? canManageClients(user.role) : false;
  const canManageInventoryCheck = user ? canManageInventory(user.role) : false;
  const canManageProjectsCheck = user ? canManageProjects(user.role) : false;
  const canManageLoadPlansCheck = user ? canManageLoadPlans(user.role) : false;

  // Client access checks
  const canAccessClientCheck = (clientId: string): boolean => {
    if (!user) return false;
    if (isAdmin) return true; // Admin can access all clients
    return user.clients.some(client => client.id === clientId);
  };

  const getAccessibleClientIds = (): string[] => {
    if (!user) return [];
    if (isAdmin) return []; // Admin can access all clients
    return user.clients.map(client => client.id);
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
    // Client access
    canAccessClient: canAccessClientCheck,
    getAccessibleClientIds,
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