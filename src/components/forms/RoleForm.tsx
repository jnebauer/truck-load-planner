'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userCount: number;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}


interface RoleFormProps {
  editingRole: Role | null;
  permissionsByCategory: Record<string, Permission[]>;
  watchedPermissions: string[];
  onSubmit: (e?: React.BaseSyntheticEvent<object, unknown, unknown>) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errors: {
    name?: { message?: string };
    description?: { message?: string };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  togglePermission: (permissionId: string) => void;
}

export default function RoleForm({
  editingRole,
  permissionsByCategory,
  watchedPermissions,
  onSubmit,
  onClose,
  isSubmitting,
  errors,
  register,
  togglePermission
}: RoleFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col">
      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        {/* Role Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role Name *
          </label>
          <input
            {...register('name', { required: 'Role name is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter role name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center">
            <input
              {...register('isActive')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Active Role</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Inactive roles cannot be assigned to new users
          </p>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Permissions
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Select permissions for each sidebar section. Users will only see tabs they have navigation permissions for.
          </p>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {category}
                </h4>
                <div className="space-y-2 ml-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={watchedPermissions?.includes(permission.id) || false}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={permission.id} className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.description}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editingRole ? 'Update Role' : 'Create Role'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
