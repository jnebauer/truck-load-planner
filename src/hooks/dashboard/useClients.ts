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
import { clientFormSchema } from '@/lib/validations';
import type { ClientFormType } from '@/components/dashboard/clients/ClientForm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * User app permission structure
 */
interface UserAppPermission {
  app_permissions: {
    name: string;
  };
}

/**
 * Client data structure (from users table with role=Client)
 */
export interface Client {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
  user_app_permissions?: UserAppPermission[];
  // Client-specific fields
  company_name?: string | null;
  billing_address?: string | null;
  billing_lat?: number | null;
  billing_lng?: number | null;
  billing_place_id?: string | null;
  shipping_address?: string | null;
  shipping_lat?: number | null;
  shipping_lng?: number | null;
  shipping_place_id?: string | null;
  contact_person?: string | null;
  tax_id?: string | null;
  website?: string | null;
  notes?: string | null;
  logo_url?: string | null;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing clients (users with role=Client)
 * Fetches from users API with role filter
 * @returns Object with clients data, loading states, and pagination
 */
export function useClients() {
  const { authenticatedFetch } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    blockedClients: 0,
  });

  // Form for client creation/editing
  const form = useForm<ClientFormType>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'Client',
      status: 'active',
      appPermissions: {},
      companyName: '',
      billingAddress: '',
      billingLat: null,
      billingLng: null,
      billingPlaceId: '',
      shippingAddress: '',
      shippingLat: null,
      shippingLng: null,
      shippingPlaceId: '',
      contactPerson: '',
      taxId: '',
      website: '',
      notes: '',
      logoUrl: '',
    },
  });

  // Fetch clients with filters (from users table where role=Client)
  const fetchClients = useCallback(async (
    page = currentPage,
    search = searchTerm,
  ) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        role: 'Client', // Filter by Client role
      });

      if (search) {
        params.append('search', search);
      }

      const response = await authenticatedFetch(`/api/dashboard/users?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      const data = await response.json();
      
      setClients(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
      setCurrentPage(data.pagination?.currentPage || 1);
      
      // Calculate client-specific stats
      const allClients = data.users || [];
      setStats({
        totalClients: allClients.length,
        activeClients: allClients.filter((c: Client) => c.status === 'active').length,
        inactiveClients: allClients.filter((c: Client) => c.status === 'inactive').length,
        blockedClients: allClients.filter((c: Client) => c.status === 'blocked').length,
      });

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, currentPage, itemsPerPage, searchTerm]);

  // Fetch clients on mount and when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    fetchClients(newPage, searchTerm);
  }, [fetchClients, searchTerm]);

  // Handle search
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    fetchClients(1, search);
  }, [fetchClients]);

  // Handle create client
  const handleCreateClient = useCallback(() => {
    setEditingClient(null);
    form.reset({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'Client',
      status: 'active',
      appPermissions: {},
      companyName: '',
      billingAddress: '',
      billingLat: null,
      billingLng: null,
      billingPlaceId: '',
      shippingAddress: '',
      shippingLat: null,
      shippingLng: null,
      shippingPlaceId: '',
      contactPerson: '',
      taxId: '',
      website: '',
      notes: '',
      logoUrl: '',
    });
    setIsFormOpen(true);
  }, [form]);

  // Handle edit client
  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    
    // Map user_app_permissions to form field format (if exists)
    const appPermissions: Record<string, boolean> = {};
    if (client.user_app_permissions && Array.isArray(client.user_app_permissions)) {
      client.user_app_permissions.forEach((permission) => {
        if (permission.app_permissions && permission.app_permissions.name) {
          const fieldName = permission.app_permissions.name
            .split(' ')
            .map((word: string, index: number) =>
              index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('');
          appPermissions[fieldName] = true;
        }
      });
    }

    form.reset({
      email: client.email,
      password: '',
      fullName: client.full_name || '',
      phone: client.phone || '',
      role: 'Client',
      status: client.status,
      appPermissions,
      companyName: client.company_name || '',
      billingAddress: client.billing_address || '',
      billingLat: client.billing_lat ?? null,
      billingLng: client.billing_lng ?? null,
      billingPlaceId: client.billing_place_id || '',
      shippingAddress: client.shipping_address || '',
      shippingLat: client.shipping_lat ?? null,
      shippingLng: client.shipping_lng ?? null,
      shippingPlaceId: client.shipping_place_id || '',
      contactPerson: client.contact_person || '',
      taxId: client.tax_id || '',
      website: client.website || '',
      notes: client.notes || '',
      logoUrl: client.logo_url || '',
    });
    setIsFormOpen(true);
  }, [form]);

  // Handle form submit
  const handleFormSubmit = useCallback(async (data: ClientFormType) => {
    try {
      // Password validation for create
      if (!editingClient && (!data.password || data.password.trim() === '')) {
        showToast.error('Password is required when creating a new client');
        return;
      }

      // Validate app permissions
      const hasAnyPermission = data.appPermissions && Object.values(data.appPermissions).some(v => v === true);
      if (!hasAnyPermission) {
        showToast.error(TOAST_MESSAGES.ERROR.APP_PERMISSION_REQUIRED);
        return;
      }

      const payload = {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: 'Client',
        status: data.status,
        appPermissions: data.appPermissions,
        companyName: data.companyName,
        billingAddress: data.billingAddress,
        billingLat: data.billingLat,
        billingLng: data.billingLng,
        billingPlaceId: data.billingPlaceId,
        shippingAddress: data.shippingAddress,
        shippingLat: data.shippingLat,
        shippingLng: data.shippingLng,
        shippingPlaceId: data.shippingPlaceId,
        contactPerson: data.contactPerson,
        taxId: data.taxId,
        website: data.website,
        notes: data.notes,
        logoUrl: data.logoUrl,
        ...(data.password && data.password.trim() !== '' && { password: data.password }),
      };

      const url = editingClient
        ? `/api/dashboard/users/${editingClient.id}`
        : '/api/dashboard/users';
      const method = editingClient ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingClient ? 'update' : 'create'} client`);
      }

      showToast.success(editingClient ? TOAST_MESSAGES.SUCCESS.UPDATED : TOAST_MESSAGES.SUCCESS.CREATED);
      setIsFormOpen(false);
      setEditingClient(null);
      form.reset();
      fetchClients();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(errorMessage);
    }
  }, [editingClient, form, authenticatedFetch, fetchClients]);

  // Handle delete client
  const handleDeleteClient = useCallback(async (clientId: string) => {
    try {
      const response = await authenticatedFetch(`/api/dashboard/users/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      showToast.success(TOAST_MESSAGES.SUCCESS.DELETED);
      fetchClients();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client';
      showToast.error(errorMessage);
    }
  }, [authenticatedFetch, fetchClients]);

  // Handle form close
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingClient(null);
    form.reset();
  }, [form]);

  return {
    // Data
    clients,
    stats,
    
    // Loading states
    loading,
    paginationLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    
    // Search
    searchTerm,
    handleSearch,
    
    // Form state
    form,
    isFormOpen,
    editingClient,
    
    // Client actions
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
    handleFormSubmit,
    handleFormClose,
    
    // Refresh
    fetchClients,
  };
}

