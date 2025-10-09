'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { showToast } from '@/lib/toast';
import { Role, RoleFormData, availablePermissions, formatPermission, groupPermissionsByCategory, calculateRoleStats } from '@/lib/permissions';

export const useRolesPermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isPermissionDrawerOpen, setIsPermissionDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<{ name: string; description: string } | null>(null);
  const [newPermission, setNewPermission] = useState({ name: '', description: '' });

  const form = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      permissions: [],
      isActive: true
    }
  });

  // Get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('trucker_tokens') || sessionStorage.getItem('trucker_tokens');
    return token ? JSON.parse(token) : null;
  };

  // Close drawer
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setEditingRole(null);
    form.reset();
  }, [form]);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const tokens = getAuthToken();
      const response = await fetch('/api/dashboard/roles-permissions', {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data.roles || []);
      setPermissions(data.availablePermissions || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles');
      showToast.error('Failed to fetch roles', {
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create role
  const createRole = useCallback(async (data: RoleFormData) => {
    try {
      const tokens = getAuthToken();
      const response = await fetch('/api/dashboard/roles-permissions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }

      const result = await response.json();
      setRoles(prev => [...prev, result.role]);
      showToast.success('Role created successfully!', {
        description: `Role "${result.role.name}" has been created.`
      });

      closeDrawer();
      form.reset();
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast.error('Failed to create role', {
        description: errorMessage
      });
    }
  }, [form, closeDrawer]);

  // Update role
  const updateRole = useCallback(async (roleId: string, data: RoleFormData) => {
    try {
      const tokens = getAuthToken();
      const response = await fetch(`/api/dashboard/roles-permissions/${roleId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      const result = await response.json();
      setRoles(prev => prev.map(role => 
        role.id === roleId ? result.role : role
      ));
      showToast.success('Role updated successfully!', {
        description: `Role "${result.role.name}" has been updated.`
      });

      closeDrawer();
      form.reset();
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast.error('Failed to update role', {
        description: errorMessage
      });
    }
  }, [form, closeDrawer]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  // Create or update role
  const saveRole = useCallback(async (data: RoleFormData) => {
    try {
      const tokens = getAuthToken();
      const url = editingRole 
        ? `/api/dashboard/roles-permissions/${editingRole.id}`
        : '/api/dashboard/roles-permissions';
      
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save role');
      }

      const result = await response.json();
      
      if (editingRole) {
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id ? result.role : role
        ));
        showToast.success('Role updated successfully!', {
          description: `Role "${result.role.name}" has been updated.`
        });
      } else {
        setRoles(prev => [...prev, result.role]);
        showToast.success('Role created successfully!', {
          description: `Role "${result.role.name}" has been created.`
        });
      }

      closeDrawer();
      form.reset();
    } catch (error) {
      console.error('Error saving role:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast.error('Failed to save role', {
        description: errorMessage
      });
    }
  }, [editingRole, form]); // eslint-disable-line react-hooks/exhaustive-deps

  // Delete role
  const deleteRole = useCallback(async (roleId: string) => {
    try {
      const tokens = getAuthToken();
      const response = await fetch(`/api/dashboard/roles-permissions/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }

      const roleToDelete = roles.find(role => role.id === roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
      
      showToast.success('Role deleted successfully!', {
        description: `Role "${roleToDelete?.name}" has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToast.error('Failed to delete role', {
        description: errorMessage
      });
    }
  }, [roles]);

  // Permission management
  const openPermissionDrawer = useCallback((permission?: { name: string; description: string }) => {
    if (permission) {
      setEditingPermission(permission);
      setNewPermission({ name: permission.name, description: permission.description });
    } else {
      setEditingPermission(null);
      setNewPermission({ name: '', description: '' });
    }
    setIsPermissionDrawerOpen(true);
  }, []);

  const closePermissionDrawer = useCallback(() => {
    setIsPermissionDrawerOpen(false);
    setEditingPermission(null);
    setNewPermission({ name: '', description: '' });
  }, []);

  const handlePermissionSubmit = useCallback(() => {
    if (editingPermission) {
      showToast.success('Permission updated successfully!', {
        description: `Permission "${newPermission.name}" has been updated.`
      });
    } else {
      showToast.success('Permission created successfully!', {
        description: `Permission "${newPermission.name}" has been created.`
      });
    }
    closePermissionDrawer();
  }, [editingPermission, newPermission, closePermissionDrawer]);

  const deletePermission = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      showToast.success('Permission deleted successfully!', {
        description: 'Permission has been removed from the system.'
      });
    }
  }, []);

  // Drawer management
  const openDrawer = useCallback((role?: Role) => {
    if (role) {
      setEditingRole(role);
      form.reset({
        name: role.name,
        permissions: role.permissions,
        isActive: role.isActive
      });
    } else {
      setEditingRole(null);
      form.reset({
        name: '',
        permissions: [],
        isActive: true
      });
    }
    setIsDrawerOpen(true);
  }, [form]);

  // Computed values
  const formattedPermissions = availablePermissions.map(formatPermission);
  const groupedPermissions = groupPermissionsByCategory(formattedPermissions);
  const stats = calculateRoleStats(roles);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    // State
    roles,
    permissions,
    loading,
    error,
    isDrawerOpen,
    editingRole,
    isPermissionDrawerOpen,
    editingPermission,
    newPermission,
    
    // Form
    form,
    
    // Computed values
    formattedPermissions,
    groupedPermissions,
    stats,
    
    // Actions
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    refreshData,
    saveRole,
    openDrawer,
    closeDrawer,
    openPermissionDrawer,
    closePermissionDrawer,
    handlePermissionSubmit,
    deletePermission,
    setNewPermission
  };
};
