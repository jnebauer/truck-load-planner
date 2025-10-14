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
import { projectFormSchema } from '@/lib/validations';
import type { ProjectFormType } from '@/components/dashboard/projects/ProjectForm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Project data structure
 */
export interface Project extends Record<string, unknown> {
  id: string;
  client_id: string;
  name: string;
  code: string;
  site_address: string | null;
  site_lat: number | null;
  site_lng: number | null;
  site_place_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted';
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  
  // Relations
  client?: {
    id: string;
    full_name: string;
    email: string;
    company_name: string | null;
  };
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
  updater?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing projects
 * @returns Object with projects data, loading states, and CRUD operations
 */
export function useProjects() {
  const { authenticatedFetch, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalClients: 0,
    activeProjects: 0,
    onHoldProjects: 0,
  });

  // Form for project creation/editing
  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: '',
      name: '',
      code: '',
      siteAddress: '',
      siteLat: null,
      siteLng: null,
      sitePlaceId: '',
      startDate: '' as string | undefined,
      endDate: '' as string | undefined,
      status: 'active' as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted',
      notes: '',
    },
  });

  // Fetch projects with filters
  const fetchProjects = useCallback(async (
    page: number,
    search: string,
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
      });

      if (search) {
        params.append('search', search);
      }

      const response = await authenticatedFetch(`/api/dashboard/projects?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }

      const data = await response.json();
      
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
      setCurrentPage(data.pagination?.currentPage || 1);
      
      // Use stats from API response
      if (data.stats) {
        setStats(data.stats);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage]);

  // Initial load only - don't refetch on searchTerm change
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for initial load
        const params = new URLSearchParams({
          page: '1',
          limit: itemsPerPage.toString(),
        });
        
        const response = await authenticatedFetch(`/api/dashboard/projects?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch projects');
        }

        const data = await response.json();
        
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setCurrentPage(data.pagination?.currentPage || 1);
        
        // Use stats from API response
        if (data.stats) {
          setStats(data.stats);
        }

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [authenticatedFetch, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    fetchProjects(newPage, searchTerm);
  }, [fetchProjects, searchTerm]);

  // Handle search
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
      
      const response = await authenticatedFetch(`/api/dashboard/projects?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setCurrentPage(data.pagination?.currentPage || 1);
        
        // Update stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.error || 'Failed to fetch projects');
        showToast.error(data.error || 'Failed to fetch projects');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage]);

  // Handle create project
  const handleCreateProject = useCallback(() => {
    setEditingProject(null);
    form.reset({
      clientId: '',
      name: '',
      code: '',
      siteAddress: '',
      siteLat: null,
      siteLng: null,
      sitePlaceId: '',
      startDate: '',
      endDate: '',
      status: 'active',
      notes: '',
    });
    setIsFormOpen(true);
  }, [form]);

  // Handle edit project
  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    form.reset({
      clientId: project.client_id,
      name: project.name,
      code: project.code,
      siteAddress: project.site_address || '',
      siteLat: project.site_lat,
      siteLng: project.site_lng,
      sitePlaceId: project.site_place_id || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      status: project.status,
      notes: project.notes || '',
    });
    setIsFormOpen(true);
  }, [form]);

  // Handle form submit (create or update)
  const handleFormSubmit = useCallback(async (data: ProjectFormType) => {
    try {
      const payload = {
        clientId: data.clientId,
        name: data.name,
        code: data.code,
        siteAddress: data.siteAddress || '',
        siteLat: data.siteLat ?? null,
        siteLng: data.siteLng ?? null,
        sitePlaceId: data.sitePlaceId || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: data.status,
        notes: data.notes || '',
      };

      const url = editingProject
        ? `/api/dashboard/projects/${editingProject.id}`
        : `/api/dashboard/projects`;

      const method = editingProject ? 'PATCH' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingProject ? 'update' : 'create'} project`);
      }

      showToast.success(editingProject ? TOAST_MESSAGES.SUCCESS.PROJECT_UPDATED : TOAST_MESSAGES.SUCCESS.PROJECT_CREATED);
      setIsFormOpen(false);
      setEditingProject(null);
      form.reset();
      fetchProjects(currentPage, searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      showToast.error(errorMessage);
    }
  }, [editingProject, form, authenticatedFetch, fetchProjects, currentPage, searchTerm]);

  // Handle delete project
  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await authenticatedFetch(`/api/dashboard/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete project');
      }

      showToast.success(TOAST_MESSAGES.SUCCESS.PROJECT_DELETED);
      fetchProjects(currentPage, searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      showToast.error(errorMessage);
    }
  }, [authenticatedFetch, fetchProjects, currentPage, searchTerm]);

  // Handle form close
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingProject(null);
    form.reset();
  }, [form]);

  return {
    // Data
    projects,
    stats,
    
    // State
    loading,
    paginationLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleSearch,
    
    // Form state
    form,
    isFormOpen,
    editingProject,
    
    // Project actions
    handleCreateProject,
    handleEditProject,
    handleFormSubmit,
    handleDeleteProject,
    handleFormClose,
    
    // Refresh
    fetchProjects,
    
    // Permissions
    hasPermission,
  };
}

