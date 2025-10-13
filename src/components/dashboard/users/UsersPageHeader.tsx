'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface UsersPageHeaderProps {
  hasPermission: (permission: string) => boolean;
  onCreateUser: () => void;
}

export default function UsersPageHeader({ 
  hasPermission, 
  onCreateUser 
}: UsersPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage system employees and their roles</p>
      </div>
      {hasPermission('users.create') && (
        <button
          onClick={onCreateUser}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Employee
        </button>
      )}
    </div>
  );
}
