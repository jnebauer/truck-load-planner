'use client';

import React from 'react';
import { Edit, Trash2, Key } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionCardProps {
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onDelete: () => void;
}

const PermissionCard = React.memo(({ permission, onEdit, onDelete }: PermissionCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
            <Key className="h-3 w-3 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
              {permission.id}
            </span>
          </div>
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={() => onEdit(permission)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="Edit Permission"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete Permission"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
});

PermissionCard.displayName = 'PermissionCard';

export default PermissionCard;
