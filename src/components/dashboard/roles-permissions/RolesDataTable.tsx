'use client';

import React, { useMemo } from 'react';
import { Plus, Shield, BarChart3, Edit, Minus } from 'lucide-react';
import { DataTable, Column, Action } from '@/components/ui';
import { Role } from '@/lib/permissions';
import { enhanceRole, generateRoleSummary } from '@/lib/role-utils';

interface RolesDataTableProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
  hasPermission: (permission: string) => boolean;
}

export default function RolesDataTable({
  roles,
  onEditRole,
  hasPermission,
}: RolesDataTableProps) {
  // Memoize columns for DataTable
  const columns: Column<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Role',
        render: (value, row) => {
          const enhancedRole = enhanceRole(row);
          const summary = generateRoleSummary(enhancedRole);
          return (
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {row.name}
                </div>
                <div className="text-sm text-gray-500">
                  {summary.coverage}% coverage
                </div>
              </div>
            </div>
          );
        },
        sortable: true,
      },
      {
        key: 'navigationAccess',
        header: 'Navigation Access',
        render: (value, row) => {
          const enhancedRole = enhanceRole(row);
          return (
            <div className="flex space-x-1">
              {Object.entries(enhancedRole.navigationAccess).map(
                ([category, hasAccess]) => (
                  <div
                    key={category}
                    className={`w-3 h-3 rounded-full ${
                      hasAccess ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={`${category}: ${hasAccess ? 'Access' : 'No Access'}`}
                  />
                )
              )}
            </div>
          );
        },
      },
      {
        key: 'actionPermissions',
        header: 'Action Permissions',
        render: (value, row) => {
          const enhancedRole = enhanceRole(row);
          const actions = [
            { icon: BarChart3, color: 'text-blue-500', key: 'view' },
            { icon: Plus, color: 'text-green-500', key: 'create' },
            { icon: Edit, color: 'text-yellow-500', key: 'edit' },
            { icon: Minus, color: 'text-red-500', key: 'delete' },
          ];
          return (
            <div className="flex space-x-2">
              {actions.map(({ icon: Icon, color, key }) => (
                <div
                  key={key}
                  title={`${key} permissions`}
                  className="flex items-center"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="ml-1 text-sm text-gray-600">
                    {
                      Object.values(enhancedRole.actionPermissions).filter(
                        (a) => a[key as keyof typeof a]
                      ).length
                    }
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        key: 'userCount',
        header: 'Users',
        render: (value) => (
          <span className="text-sm text-gray-900">{String(value)}</span>
        ),
        sortable: true,
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (value) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
        ),
        sortable: true,
      },
    ],
    []
  );

  // Memoize actions for DataTable
  const actions: Action<Role>[] = useMemo(
    () => [
      {
        label: 'Edit Role',
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => onEditRole(row),
        variant: 'warning',
        disabled: () => !hasPermission('roles.update'),
      },
    ],
    [hasPermission, onEditRole]
  );

  return (
    <DataTable
      data={roles}
      columns={columns}
      actions={actions}
      searchPlaceholder="Search roles..."
      emptyMessage="No roles found"
    />
  );
}
