'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/backend/constants';
import { Role, RoleFormData } from '@/lib/permissions';
import { getAllPermissionsByCategory, validateRolePermissions } from '@/lib/role-utils';

export const useRolesPermissions = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    inactiveRoles: 0,
    totalPermissions: 0
  });

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
  const fetchRoles = useCallback(async (page = currentPage, search = searchTerm, showPaginationLoading = false) => {
    try {
      if (showPaginationLoading) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      
      const tokens = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/dashboard/roles-permissions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const data = await response.json();
      setRoles(data.roles || []);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
      setCurrentPage(data.pagination.currentPage);
      // Update stats from API response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

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
      showToast.success(TOAST_MESSAGES.SUCCESS.ROLE_CREATED);

      setIsFormOpen(false);
      setEditingRole(null);
      form.reset();
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.ROLE_CREATE_FAILED;
      showToast.error(errorMessage);
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
      showToast.success(TOAST_MESSAGES.SUCCESS.ROLE_UPDATED);

      setIsFormOpen(false);
      setEditingRole(null);
      form.reset();
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.ROLE_UPDATE_FAILED;
      showToast.error(errorMessage);
    }
  }, [form]);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      const tokens = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/dashboard/roles-permissions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const data = await response.json();
      setRoles(data.roles || []);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
      setCurrentPage(data.pagination.currentPage);
      // Update stats from API response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page);
    
    try {
      setPaginationLoading(true);
      
      const tokens = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/dashboard/roles-permissions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const data = await response.json();
      setRoles(data.roles || []);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
      setCurrentPage(data.pagination.currentPage);
      // Update stats from API response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
    } finally {
      setPaginationLoading(false);
    }
  }, [itemsPerPage, searchTerm]);

  const handleSearch = useCallback(async (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
    
    try {
      setPaginationLoading(true);
      
      const tokens = getAuthToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: itemsPerPage.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/dashboard/roles-permissions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch roles');
      
      const data = await response.json();
      setRoles(data.roles || []);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
      setCurrentPage(data.pagination.currentPage);
      // Update stats from API response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
    } finally {
      setPaginationLoading(false);
    }
  }, [itemsPerPage]);

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
        const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.SAVE_FAILED;
        showToast.error(errorMessage);
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

  // Memoize role stats (using totalItems from server for accurate counts)
  // Stats are now managed by state and updated from API response

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        
        const tokens = getAuthToken();
        
        // Build query parameters for initial load
        const params = new URLSearchParams({
          page: '1',
          limit: itemsPerPage.toString(),
        });
        
        const response = await fetch(`/api/dashboard/roles-permissions?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${tokens?.accessToken || ''}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch roles');
        
        const data = await response.json();
        setRoles(data.roles || []);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        // Update stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setError(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
        showToast.error(TOAST_MESSAGES.ERROR.ROLE_FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [itemsPerPage]); // Only depend on itemsPerPage

  return {
    // State
    roles,
    loading,
    paginationLoading,
    error,
    isFormOpen,
    editingRole,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    
    // Form
    form,
    
    // Computed values
    filteredRoles,
    permissionsByCategory,
    roleStats: stats,
    
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
    handlePageChange,
    handleSearch,
    hasPermission
  };
};
