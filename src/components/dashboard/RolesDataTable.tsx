'use client';

import React from 'react';
import { Shield, Users, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable, Column, Action, ConfirmationDialog } from '@/components/ui';
import { useConfirmationDialog } from '@/hooks';

interface Role extends Record<string, unknown> {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
}

interface RolesDataTableProps {
  data: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onView?: (role: Role) => void;
  loading?: boolean;
}

export default function RolesDataTable({ 
  data, 
  onEdit, 
  onDelete, 
  onView,
  loading = false 
}: RolesDataTableProps) {
  const confirmationDialog = useConfirmationDialog();

  const handleDeleteClick = (role: Role) => {
    confirmationDialog.showConfirmation({
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${role.name}"? This action cannot be undone and will remove all associated permissions.`,
      confirmText: 'Delete Role',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => onDelete(role.id)
    });
  };

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Role',
      sortable: true,
      render: (value: unknown, row: Role) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{String(value)}</div>
            <div className="text-sm text-gray-500">
              {row.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (permissions: unknown) => {
        const perms = permissions as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, 3).map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {permission.replace('_', ' ')}
              </span>
            ))}
            {perms.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{perms.length - 3} more
              </span>
            )}
            {perms.length === 0 && (
              <span className="text-sm text-gray-400 italic">No permissions</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'userCount',
      header: 'Users',
      sortable: true,
      align: 'center',
      render: (value: unknown) => (
        <div className="flex items-center justify-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{String(value)}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (value: unknown) => {
        const isActive = value as boolean;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value: unknown) => {
        const date = new Date(value as string);
        return (
          <div className="text-sm text-gray-900">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  const actions: Action<Role>[] = [
    ...(onView ? [{
      label: 'View Role',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Role) => onView(row),
      variant: 'default' as const,
    }] : []),
    {
      label: 'Edit Role',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Role) => onEdit(row),
      variant: 'primary' as const,
    },
    {
      label: 'Delete Role',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Role) => handleDeleteClick(row),
      variant: 'danger' as const,
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search roles..."
        searchKeys={['name', 'permissions']}
        emptyMessage="No roles found"
        emptyIcon={<Shield className="h-12 w-12 text-gray-300" />}
        loading={loading}
        pagination={true}
        pageSize={10}
        sortable={true}
        striped={true}
        hoverable={true}
        compact={false}
      />
      
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={confirmationDialog.hideConfirmation}
        onConfirm={confirmationDialog.handleConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.confirmText}
        cancelText={confirmationDialog.cancelText}
        variant={confirmationDialog.variant}
        loading={confirmationDialog.loading}
      />
    </>
  );
}
