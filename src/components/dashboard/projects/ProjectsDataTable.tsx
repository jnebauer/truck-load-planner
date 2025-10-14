'use client';

import React, { useMemo } from 'react';
import { Edit, Building2, Code, MapPin, Calendar, User } from 'lucide-react';
import { DataTable, Column, Action } from '@/components/common';
import type { Project } from '@/hooks/dashboard/useProjects';

interface ProjectsDataTableProps {
  projects: Project[];
  hasPermission: (permission: string) => boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  paginationLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectsDataTable({
  projects,
  hasPermission,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  paginationLoading,
  onPageChange,
  onSearch,
  onEdit,
}: ProjectsDataTableProps) {

  const columns: Column<Project>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Project Name',
      render: (value, row) => {
        const nameValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        const codeValue = row.code && row.code !== 'null' && String(row.code).trim() !== ''
          ? String(row.code)
          : null;
        return (
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <div className="font-medium text-gray-900">{nameValue}</div>
              {codeValue && (
                <div className="flex items-center text-sm text-gray-500">
                  <Code className="h-3 w-3 mr-1" />
                  {codeValue}
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'client',
      header: 'Client',
      render: (value) => {
        const client = value as Project['client'];
        if (!client) return '-';
        const displayName = client.company_name || client.full_name || client.email;
        return (
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{displayName}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'site_address',
      header: 'Site Address',
      render: (value) => {
        const addressValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600 truncate max-w-xs">{addressValue}</span>
          </div>
        );
      },
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (value) => {
        if (!value || value === 'null') return '-';
        return (
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            {new Date(String(value)).toLocaleDateString()}
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (value) => {
        if (!value || value === 'null') return '-';
        return (
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            {new Date(String(value)).toLocaleDateString()}
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const status = String(value);
        const statusConfig = {
          planning: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Planning' },
          active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
          on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'On Hold' },
          completed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completed' },
          cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
          inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
          deleted: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Deleted' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <div className="text-gray-500">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      ),
      sortable: true,
    }
  ], []);

  const actions: Action<Project>[] = useMemo(() => [
    {
      label: 'Edit Project',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => onEdit(row),
      variant: 'warning',
      disabled: () => !hasPermission('projects.update'),
    },
  ], [hasPermission, onEdit]);

  return (
    <DataTable
      data={projects}
      columns={columns}
      actions={actions}
      searchPlaceholder="Search projects..."
      emptyMessage="No projects found"
      // Server-side pagination props
      serverSidePagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={itemsPerPage}
      paginationLoading={paginationLoading}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}

