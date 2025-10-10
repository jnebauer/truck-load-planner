'use client';

import React, { useMemo } from 'react';
import { Edit, Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { DataTable, Column, Action } from '@/components/ui';
import { User } from './types';

interface UsersDataTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  paginationLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
}

export default function UsersDataTable({
  users,
  onEditUser,
  hasPermission,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  paginationLoading,
  onPageChange,
  onSearch,
}: UsersDataTableProps) {
  // Memoize columns for DataTable
  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{String(value)}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'full_name',
      header: 'Full Name',
      render: (value) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">{String(value) || 'N/A'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">{String(value) || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-gray-400 mr-2" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {String(value)}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const status = String(value);
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
            {status}
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

  // Memoize actions for DataTable
  const actions: Action<User>[] = useMemo(() => [
    {
      label: 'Edit User',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => onEditUser(row),
      variant: 'warning',
      disabled: () => !hasPermission('users.update'),
    },
  ], [hasPermission, onEditUser]);

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      searchPlaceholder="Search users..."
      emptyMessage="No users found"
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
