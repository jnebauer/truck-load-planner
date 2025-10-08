'use client';

import React from 'react';
import { Edit, Trash2, Shield } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
}

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

const RoleCard = React.memo(({ role, onEdit, onDelete }: RoleCardProps) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{role.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((permission) => (
            <span
              key={permission}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {permission.replace('_', ' ')}
            </span>
          ))}
          {role.permissions.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{role.permissions.length - 3} more
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{role.userCount}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(role)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Role"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(role.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Role"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

RoleCard.displayName = 'RoleCard';

export default RoleCard;
