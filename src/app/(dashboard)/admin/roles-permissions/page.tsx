'use client';

import React, { useState } from 'react';
import { Drawer } from '@/components/ui';
import { RoleForm } from '@/components';
import {
  PermissionCard,
  StatsCard,
} from '@/components/admin/roles-permissions';
import RolesDataTable from '@/components/admin/RolesDataTable';
import { useRolesPermissions } from '@/hooks/admin';
import { Plus, Shield, Users, Settings, Key } from 'lucide-react';

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  const {
    roles,
    loading,
    isDrawerOpen,
    editingRole,
    isPermissionDrawerOpen,
    editingPermission,
    newPermission,
    form,
    groupedPermissions,
    stats,
    saveRole,
    deleteRole,
    openDrawer,
    closeDrawer,
    openPermissionDrawer,
    closePermissionDrawer,
    handlePermissionSubmit,
    deletePermission,
    setNewPermission,
  } = useRolesPermissions();

  const handleRoleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const data = form.getValues();
    await saveRole(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="text-gray-600">
            Manage user roles and system permissions
          </p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'roles' && (
            <button
              onClick={() => openDrawer()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Role
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Shield}
          title="Total Roles"
          value={stats.totalRoles}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          icon={Users}
          title="Active Roles"
          value={stats.activeRoles}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          icon={Settings}
          title="Inactive Roles"
          value={stats.inactiveRoles}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />
        <StatsCard
          icon={Key}
          title="Permissions"
          value={stats.totalPermissions}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Permissions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'roles' && (
          <RolesDataTable
            data={roles}
            onEdit={openDrawer}
            onDelete={deleteRole}
            loading={loading}
          />
        )}

        {activeTab === 'permissions' && (
          <div className="p-6">
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map((permission) => (
                          <PermissionCard
                            key={permission.id}
                            permission={permission}
                            onEdit={() => openPermissionDrawer(permission)}
                            onDelete={deletePermission}
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
      >
        <RoleForm
          onSubmit={handleRoleSubmit}
          register={form.register}
          errors={form.formState.errors}
          isSubmitting={form.formState.isSubmitting}
          editingRole={editingRole}
          permissionsByCategory={groupedPermissions}
          watchedPermissions={form.watch('permissions')}
          onClose={closeDrawer}
          togglePermission={(permissionId: string) => {
            const currentPermissions = form.getValues('permissions');
            const newPermissions = currentPermissions.includes(permissionId)
              ? currentPermissions.filter((p: string) => p !== permissionId)
              : [...currentPermissions, permissionId];
            form.setValue('permissions', newPermissions);
          }}
        />
      </Drawer>

      {/* Permission Drawer */}
      <Drawer
        isOpen={isPermissionDrawerOpen}
        onClose={closePermissionDrawer}
        title={editingPermission ? 'Edit Permission' : 'Create Permission'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Name
            </label>
            <input
              type="text"
              value={newPermission.name}
              onChange={(e) =>
                setNewPermission((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter permission name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newPermission.description}
              onChange={(e) =>
                setNewPermission((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter permission description"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={closePermissionDrawer}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePermissionSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {editingPermission ? 'Update Permission' : 'Create Permission'}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
