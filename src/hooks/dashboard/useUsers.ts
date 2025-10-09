'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES, TOAST_DESCRIPTIONS } from '@/constants';
import { userSchema, userCreateSchema, userUpdateSchema, UserFormData } from '@/lib/validations';
import { User, Role } from '@/components/dashboard/users';

export function useUsers() {
  const { hasPermission, authenticatedFetch } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form for user creation/editing
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: '',
      status: 'active',
    },
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/dashboard/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || TOAST_MESSAGES.ERROR.USER_FETCH_FAILED);
        showToast.error(TOAST_MESSAGES.ERROR.USER_FETCH_FAILED, {
          description: data.error || TOAST_DESCRIPTIONS.ERROR.USER_FETCH_FAILED
        });
      }
    } catch {
      setError(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
        description: TOAST_DESCRIPTIONS.ERROR.NETWORK_ERROR
      });
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

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
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleCreateUser = useCallback(() => {
    setEditingUser(null);
    form.reset({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: '',
      status: 'active',
    });
    setIsFormOpen(true);
  }, [form]);

  const handleEditUser = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.reset({
        email: user.email,
        password: '',
        fullName: user.full_name || '',
        phone: user.phone || '',
        role: user.role,
        status: user.status,
      });
      setIsFormOpen(true);
    },
    [form]
  );

  const handleFormSubmit = useCallback(
    async (data: UserFormData) => {
      try {
        // Choose validation schema based on whether we're editing or creating
        const validationSchema = editingUser ? userUpdateSchema : userCreateSchema;
        
        // For updates, remove password if empty
        if (editingUser && (!data.password || data.password.trim() === '')) {
          delete data.password;
        }
        
        // Validate data with appropriate schema
        const validatedData = validationSchema.parse(data);
        
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
          await fetchUsers();
          
          // Show success toast
          if (editingUser) {
            showToast.success(TOAST_MESSAGES.SUCCESS.USER_UPDATED, {
              description: TOAST_DESCRIPTIONS.SUCCESS.USER_UPDATED(validatedData.fullName)
            });
          } else {
            showToast.success(TOAST_MESSAGES.SUCCESS.USER_CREATED, {
              description: TOAST_DESCRIPTIONS.SUCCESS.USER_CREATED(validatedData.fullName)
            });
          }
        } else {
          // Handle different types of errors
          let errorMessage = editingUser ? TOAST_MESSAGES.ERROR.USER_UPDATE_FAILED : TOAST_MESSAGES.ERROR.USER_CREATE_FAILED;
          let errorDescription = editingUser ? TOAST_DESCRIPTIONS.ERROR.USER_UPDATE_FAILED : TOAST_DESCRIPTIONS.ERROR.USER_CREATE_FAILED;
          
          if (result.error) {
            if (typeof result.error === 'string') {
              errorMessage = result.error;
            } else if (result.error.message) {
              errorMessage = result.error.message;
            }
          }
          
          if (result.details) {
            errorDescription = result.details;
          }
          
          showToast.error(errorMessage, {
            description: errorDescription
          });
        }
      } catch (error) {
        console.error('Error saving user:', error);
        
        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
          showToast.error(TOAST_MESSAGES.ERROR.VALIDATION_FAILED, {
            description: TOAST_DESCRIPTIONS.ERROR.VALIDATION_FAILED
          });
        } else {
          showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
            description: TOAST_DESCRIPTIONS.ERROR.NETWORK_ERROR
          });
        }
      }
    },
    [editingUser, form, fetchUsers, authenticatedFetch]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingUser(null);
    form.reset();
  }, [form]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const inactiveUsers = users.filter((u) => u.status === 'inactive').length;
    const pendingUsers = users.filter((u) => u.status === 'pending').length;

    return { totalUsers, activeUsers, inactiveUsers, pendingUsers };
  }, [users]);

  return {
    // Data
    users,
    roles,
    stats,
    
    // State
    loading,
    error,
    isFormOpen,
    editingUser,
    
    // Form
    form,
    
    // Actions
    handleCreateUser,
    handleEditUser,
    handleFormSubmit,
    handleFormClose,
    fetchUsers,
    
    // Permissions
    hasPermission,
  };
}
