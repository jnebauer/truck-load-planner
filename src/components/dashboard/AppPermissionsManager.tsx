'use client';

import React, { useState } from 'react';
import { useAppPermissions } from '@/hooks/dashboard/useAppPermissions';
import { showToast } from '@/lib/toast';

export default function AppPermissionsManager() {
  const { permissions, users, loading, error, grantPermission, updatePermission, revokePermission } = useAppPermissions();
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const apps = [
    { id: 'capacity-planner', name: 'Capacity Planner' },
    { id: 'truck-load-planner', name: 'Truck Load Planner' }
  ];

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedApp) {
      showToast.error('Please select both user and app');
      return;
    }

    try {
      await grantPermission(selectedUser, selectedApp, expiresAt || undefined);
      showToast.success('Permission granted successfully');
      setShowGrantForm(false);
      setSelectedUser('');
      setSelectedApp('');
      setExpiresAt('');
    } catch {
      showToast.error('Failed to grant permission');
    }
  };

  const handleTogglePermission = async (id: string, isActive: boolean) => {
    try {
      await updatePermission(id, isActive);
      showToast.success(`Permission ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch {
      showToast.error('Failed to update permission');
    }
  };

  const handleRevokePermission = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) {
      return;
    }

    try {
      await revokePermission(id);
      showToast.success('Permission revoked successfully');
    } catch {
      showToast.error('Failed to revoke permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">App Permissions</h2>
          <p className="text-gray-600">Manage user access to different applications</p>
        </div>
        <button
          onClick={() => setShowGrantForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Grant Permission
        </button>
      </div>

      {/* Grant Permission Form */}
      {showGrantForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Grant New Permission</h3>
          <form onSubmit={handleGrantPermission} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.roles.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App
                </label>
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an app</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Grant Permission
              </button>
              <button
                type="button"
                onClick={() => setShowGrantForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Granted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {permission.users.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {permission.users.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {permission.users.roles.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {permission.app_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      permission.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {permission.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.granted_by_user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.expires_at 
                      ? new Date(permission.expires_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleTogglePermission(permission.id, !permission.is_active)}
                      className={`${
                        permission.is_active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {permission.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleRevokePermission(permission.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {permissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No app permissions found.
          </div>
        )}
      </div>
    </div>
  );
}
