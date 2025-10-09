'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface RolesPageHeaderProps {
  hasPermission: (permission: string) => boolean;
  onCreateRole: () => void;
}

export default function RolesPageHeader({ 
  hasPermission, 
  onCreateRole 
}: RolesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Enhanced Roles & Permissions
        </h1>
        <p className="text-gray-600">
          Manage user roles and sidebar navigation permissions
        </p>
      </div>
      {hasPermission('roles.create') && (
        <button
          onClick={onCreateRole}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Role
        </button>
      )}
    </div>
  );
}
