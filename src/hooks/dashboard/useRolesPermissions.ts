'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES, TOAST_DESCRIPTIONS } from '@/constants';
import { Role, RoleFormData, calculateRoleStats } from '@/lib/permissions';
import { getAllPermissionsByCategory, validateRolePermissions } from '@/lib/role-utils';

export const useRolesPermissions = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const form = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      permissions: [],
      isActive: true,
    },
  });

  // Get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('trucker_tokens') || sessionStorage.getItem('trucker_tokens');
    return token ? JSON.parse(token) : null;
  };

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
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED, {
        description: TOAST_DESCRIPTIONS.ERROR.ROLE_FETCH_FAILED
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
      showToast.success(TOAST_MESSAGES.SUCCESS.ROLE_CREATED, {
        description: TOAST_DESCRIPTIONS.SUCCESS.ROLE_CREATED(result.role.name)
      });

      setIsFormOpen(false);
      setEditingRole(null);
      form.reset();
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error instanceof Error ? error.message : TOAST_DESCRIPTIONS.ERROR.ROLE_CREATE_FAILED;
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_CREATE_FAILED, {
        description: errorMessage
      });
    }
  }, [form]);

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
      showToast.success(TOAST_MESSAGES.SUCCESS.ROLE_UPDATED, {
        description: TOAST_DESCRIPTIONS.SUCCESS.ROLE_UPDATED(result.role.name)
      });

      setIsFormOpen(false);
      setEditingRole(null);
      form.reset();
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error instanceof Error ? error.message : TOAST_DESCRIPTIONS.ERROR.ROLE_UPDATE_FAILED;
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_UPDATE_FAILED, {
        description: errorMessage
      });
    }
  }, [form]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  // Handle create role
  const handleCreateRole = useCallback(() => {
    setEditingRole(null);
    form.reset({ name: '', permissions: [], isActive: true });
    setIsFormOpen(true);
  }, [form]);

  // Handle edit role
  const handleEditRole = useCallback(
    (role: Role) => {
      setEditingRole(role);
      form.reset({
        name: role.name,
        permissions: role.permissions,
        isActive: role.isActive,
      });
      setIsFormOpen(true);
    },
    [form]
  );

  // Handle form submit
  const handleFormSubmit = useCallback(
    async (data: RoleFormData) => {
      try {
        const validation = validateRolePermissions(data.permissions);
        if (!validation.isValid) {
          showToast.error(TOAST_MESSAGES.ERROR.VALIDATION_FAILED, {
            description: validation.errors.join(', ')
          });
          return;
        }

        if (editingRole) {
          await updateRole(editingRole.id, data);
        } else {
          await createRole(data);
        }

        setIsFormOpen(false);
        setEditingRole(null);
        form.reset();
        await refreshData();
      } catch (error) {
        console.error('Error saving role:', error);
        const errorMessage = error instanceof Error ? error.message : TOAST_DESCRIPTIONS.ERROR.SAVE_FAILED;
        showToast.error(TOAST_MESSAGES.ERROR.SAVE_FAILED, {
          description: errorMessage
        });
      }
    },
    [editingRole, form, createRole, updateRole, refreshData]
  );

  // Handle form close
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingRole(null);
    form.reset();
  }, [form]);

  // Toggle permission
  const togglePermission = useCallback(
    (permissionId: string) => {
      const currentPermissions = form.getValues('permissions');
      const updatedPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter((p) => p !== permissionId)
        : [...currentPermissions, permissionId];
      form.setValue('permissions', updatedPermissions);
    },
    [form]
  );

  // Memoize filtered roles excluding admin role
  const filteredRoles = useMemo(
    () => roles.filter((role) => role.name.toLowerCase() !== 'admin'),
    [roles]
  );

  // Memoize permissions by category for the form
  const permissionsByCategory = useMemo(
    () => getAllPermissionsByCategory(),
    []
  );

  // Memoize role stats
  const roleStats = useMemo(
    () => calculateRoleStats(filteredRoles),
    [filteredRoles]
  );

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    // State
    roles,
    loading,
    error,
    isFormOpen,
    editingRole,
    
    // Form
    form,
    
    // Computed values
    filteredRoles,
    permissionsByCategory,
    roleStats,
    
    // Actions
    fetchRoles,
    createRole,
    updateRole,
    refreshData,
    handleCreateRole,
    handleEditRole,
    handleFormSubmit,
    handleFormClose,
    togglePermission,
    hasPermission
  };
};
