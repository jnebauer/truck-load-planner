'use client';

import React from 'react';
import { Shield, Eye, Edit, Trash2, Plus } from 'lucide-react';

interface NavigationPermissionCardProps {
  categoryName: string;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  selectedPermissions: string[];
  onTogglePermission: (permissionId: string) => void;
}

export default function NavigationPermissionCard({
  categoryName,
  permissions,
  selectedPermissions,
  onTogglePermission,
}: NavigationPermissionCardProps) {
  // Group permissions by action type
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const action = permission.id.split('.')[1];
    if (!groups[action]) {
      groups[action] = [];
    }
    groups[action].push(permission);
    return groups;
  }, {} as Record<string, typeof permissions>);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return Eye;
      case 'create':
        return Plus;
      case 'update':
        return Edit;
      case 'delete':
        return Trash2;
      case 'dashboard':
        return Shield;
      default:
        return Shield;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'text-blue-600 bg-blue-100';
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'update':
        return 'text-yellow-600 bg-yellow-100';
      case 'delete':
        return 'text-red-600 bg-red-100';
      case 'dashboard':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read':
        return 'View';
      case 'create':
        return 'Create';
      case 'update':
        return 'Edit';
      case 'delete':
        return 'Delete';
      case 'dashboard':
        return 'Access';
      default:
        return action;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
        <h4 className="text-lg font-semibold text-gray-800">{categoryName}</h4>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedPermissions).map(
          ([action, actionPermissions]) => {
            const ActionIcon = getActionIcon(action);
            const colorClass = getActionColor(action);
            const actionLabel = getActionLabel(action);

            return (
              <div key={action} className="flex items-center space-x-3">
                <div
                  className={`flex items-center px-3 py-2 rounded-lg ${colorClass}`}
                >
                  <ActionIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{actionLabel}</span>
                </div>

                <div className="flex-1">
                  {actionPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => onTogglePermission(permission.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={permission.id}
                        className="text-sm text-gray-700"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
