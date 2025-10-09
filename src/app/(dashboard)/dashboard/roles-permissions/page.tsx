'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Shield, Users, Settings, BarChart3 } from 'lucide-react';
import RoleCard from '@/components/dashboard/roles-permissions/RoleCard';
import PermissionCard from '@/components/dashboard/roles-permissions/PermissionCard';
import RoleForm from '@/components/forms/RoleForm';
import StatsCard from '@/components/dashboard/roles-permissions/StatsCard';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useConfirmationDialog } from '@/hooks/ui/useConfirmationDialog';
import { useRolesPermissions } from '@/hooks/dashboard/useRolesPermissions';
import { calculateRoleStats, formatPermission, Role, RoleFormData, getNavigationPermissionCategories } from '@/lib/permissions';
import { useForm } from 'react-hook-form';

export default function RolesPermissionsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refreshData
  } = useRolesPermissions();

  // Form for role creation/editing
  const form = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      permissions: [],
      isActive: true
    }
  });

  const { 
    isOpen: isDeleteDialogOpen, 
    showConfirmation: openDeleteDialog, 
    hideConfirmation: closeDeleteDialog,
    title: deleteTitle,
    message: deleteMessage,
    confirmText: deleteConfirmText,
    handleConfirm: deleteConfirm
  } = useConfirmationDialog();

  // Check if user has permission to access this page
  if (!hasPermission('roles.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view roles and permissions.</p>
        </div>
      </div>
    );
  }

  const handleCreateRole = () => {
    setEditingRole(null);
    form.reset({
      name: '',
      permissions: [],
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      permissions: role.permissions,
      isActive: role.isActive
    });
    setIsFormOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    openDeleteDialog({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRole(roleId);
        closeDeleteDialog();
      }
    });
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, data);
      } else {
        await createRole(data);
      }
      setIsFormOpen(false);
      setEditingRole(null);
      form.reset();
      await refreshData();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRole(null);
    form.reset();
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = form.getValues('permissions');
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    
    form.setValue('permissions', updatedPermissions);
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by navigation categories (sidebar tabs)
  const navigationCategories = getNavigationPermissionCategories();
  const permissionsByCategory = Object.entries(navigationCategories).reduce((acc, [categoryName, categoryData]) => {
    acc[categoryName] = categoryData.permissions.map(formatPermission);
    return acc;
  }, {} as Record<string, ReturnType<typeof formatPermission>[]>);
  
  const roleStats = calculateRoleStats(roles);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading data: {error}</div>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and system permissions</p>
        </div>
        {hasPermission('roles.create') && (
          <button
            onClick={handleCreateRole}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Role
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Roles"
          value={roleStats.totalRoles}
          icon={Shield}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Active Roles"
          value={roleStats.activeRoles}
          icon={Users}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Inactive Roles"
          value={roleStats.inactiveRoles}
          icon={Settings}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />
        <StatsCard
          title="Permissions"
          value={roleStats.totalPermissions}
          icon={BarChart3}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
      {activeTab === 'roles' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Roles Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={hasPermission('roles.update') ? handleEditRole : undefined}
                    onDelete={hasPermission('roles.delete') ? handleDeleteRole : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPermissions.map((permission) => (
                  <PermissionCard
                    key={permission.id}
                    permission={permission}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Form Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleFormClose} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <RoleForm
              editingRole={editingRole}
              permissionsByCategory={permissionsByCategory}
              watchedPermissions={form.watch('permissions') || []}
              onSubmit={form.handleSubmit(handleFormSubmit)}
              onClose={handleFormClose}
              isSubmitting={form.formState.isSubmitting}
              errors={form.formState.errors}
              register={form.register}
              togglePermission={togglePermission}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title={deleteTitle}
        message={deleteMessage}
        confirmText={deleteConfirmText}
        onConfirm={deleteConfirm}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}
