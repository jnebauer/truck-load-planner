// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/backend/constants';
import { userFormSchema } from '@/lib/validations';
import { User, Role } from '@/components/dashboard/users';
import { UserFormType } from '@/components/dashboard/users/formTypes';

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing users in the dashboard
 * Handles user CRUD operations, pagination, search, and role management
 * @returns Object with users data, loading states, form handlers, and user management functions
 */
export function useUsers() {
  const { hasPermission, authenticatedFetch } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    blockedUsers: 0
  });

  // Form for user creation/editing
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      profileImage: '',
      role: '',
      status: 'active',
      appPermissions: {},
    },
  });

  const fetchRoles = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        '/api/dashboard/roles-permissions'
      );
      const data = await response.json();

      if (response.ok) {
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for initial load
        const params = new URLSearchParams({
          page: '1',
          limit: itemsPerPage.toString(),
        });
        
        const response = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setCurrentPage(data.pagination.currentPage);
          // Update stats from API response
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          setError(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
          showToast.error(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
        }
      } catch {
        setError(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
        showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
    fetchRoles();
  }, [authenticatedFetch, itemsPerPage, fetchRoles]); // Only depend on authenticatedFetch and itemsPerPage

  const handleCreateUser = useCallback(() => {
    setEditingUser(null);
    form.reset({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      profileImage: '',
      role: '',
      status: 'active',
      appPermissions: {},
    });
    setIsFormOpen(true);
  }, [form]);

  const handleEditUser = useCallback(
    (user: User) => {
      setEditingUser(user);
      
      // Helper function to convert app name to form field name
      // "Truck Load Planner" → "truckLoadPlanner"
      const toFormFieldName = (appName: string): string => {
        return appName
          .split(' ')
          .map((word, index) => 
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join('');
      };
      
      // Map user_app_permissions to form field format
      const appPermissions: Record<string, boolean> = {};
      if (user.user_app_permissions && Array.isArray(user.user_app_permissions)) {
        user.user_app_permissions.forEach((permission) => {
          if (permission.app_permissions && permission.app_permissions.name) {
            const fieldName = toFormFieldName(permission.app_permissions.name);
            appPermissions[fieldName] = true;
          }
        });
      }
      
      form.reset({
        email: user.email,
        password: '',
        fullName: user.full_name || '',
        phone: user.phone || '',
        profileImage: user.profile_image || '',
        role: user.role,
        status: user.status,
        appPermissions: appPermissions,
      });
      setIsFormOpen(true);
    },
    [form]
  );

  const handleFormSubmit = useCallback(
    async (data: UserFormType) => {
      try {
        // Custom validation: Password is required for create, optional for update
        if (!editingUser && (!data.password || data.password.trim() === '')) {
          showToast.error(TOAST_MESSAGES.ERROR.PASSWORD_REQUIRED_FOR_NEW_USER);
          return;
        }
        
        // For updates, remove password if empty
        if (editingUser && (!data.password || data.password.trim() === '')) {
          delete data.password;
        }
        
        // Validate data with userFormSchema
        const validatedData = userFormSchema.parse(data);
        
        const url = editingUser
          ? `/api/dashboard/users/${editingUser.id}`
          : '/api/dashboard/users';
        const method = editingUser ? 'PUT' : 'POST';

        const response = await authenticatedFetch(url, {
          method,
          body: JSON.stringify(validatedData),
        });

        const result = await response.json();

        if (response.ok) {
          setIsFormOpen(false);
          setEditingUser(null);
          form.reset();
          
          // Refresh the users list
          try {
            setLoading(true);
            
            const params = new URLSearchParams({
              page: currentPage.toString(),
              limit: itemsPerPage.toString(),
            });
            
            if (searchTerm) {
              params.append('search', searchTerm);
            }
            
            const refreshResponse = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);
            const refreshData = await refreshResponse.json();

            if (refreshResponse.ok) {
              setUsers(refreshData.users);
              setTotalPages(refreshData.pagination.totalPages);
              setTotalItems(refreshData.pagination.totalItems);
              setCurrentPage(refreshData.pagination.currentPage);
            }
          } catch {
            // If refresh fails, just show success message
            console.warn('Failed to refresh users list after form submission');
          } finally {
            setLoading(false);
          }
          
          // Show success toast
          if (editingUser) {
              showToast.success(TOAST_MESSAGES.SUCCESS.USER_UPDATED);
          } else {
            showToast.success(TOAST_MESSAGES.SUCCESS.USER_CREATED);
          }
        } else {
          // Handle different types of errors
          let errorMessage = editingUser ? TOAST_MESSAGES.ERROR.USER_UPDATE_FAILED : TOAST_MESSAGES.ERROR.USER_CREATE_FAILED;
          
          if (result.error) {
            if (typeof result.error === 'string') {
              errorMessage = result.error;
            } else if (result.error.message) {
              errorMessage = result.error.message;
            }
          }
          
          if (result.details) {
            errorMessage = result.details;
          }
          
          showToast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error saving user:', error);
        
        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
          showToast.error(TOAST_MESSAGES.ERROR.VALIDATION_FAILED);
        } else {
          showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
        }
      }
    },
    [editingUser, form, authenticatedFetch, currentPage, itemsPerPage, searchTerm]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingUser(null);
    form.reset();
  }, [form]);

  // Pagination handlers
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page);
    
    try {
      setPaginationLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        // Update stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
        showToast.error(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
      }
    } catch {
      setError(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    } finally {
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage, searchTerm]);

  const handleSearch = useCallback(async (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
    
    try {
      setPaginationLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: itemsPerPage.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        // Update stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
        showToast.error(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
      }
    } catch {
      setError(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    } finally {
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage]);

  const refreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
        setCurrentPage(data.pagination.currentPage);
        // Update stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
        showToast.error(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
      }
    } catch {
      setError(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage, searchTerm, currentPage]);

  // Stats are now managed by state and updated from API response

  return {
    // Data
    users,
    roles,
    stats,
    
    // State
    loading,
    paginationLoading,
    error,
    isFormOpen,
    editingUser,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    
    // Form
    form,
    
    // Actions
    handleCreateUser,
    handleEditUser,
    handleFormSubmit,
    handleFormClose,
    handlePageChange,
    handleSearch,
    refreshUsers,
    
    // Permissions
    hasPermission,
  };
}
