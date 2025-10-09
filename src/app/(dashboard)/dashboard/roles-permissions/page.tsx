'use client';

import {
  RolesDataTable,
  RolesStatsCards,
  RolesPageHeader,
  RoleForm,
} from '@/components/dashboard/roles-permissions';
import { AccessDenied, LoadingSpinner, Drawer } from '@/components/ui';
import { useRolesPermissions } from '@/hooks/dashboard';

export default function RolesPermissionsPage() {
  const {
    loading,
    error,
    isFormOpen,
    editingRole,
    form,
    handleCreateRole,
    handleEditRole,
    handleFormSubmit,
    handleFormClose,
    togglePermission,
    permissionsByCategory,
    filteredRoles,
    roleStats,
    hasPermission,
  } = useRolesPermissions();

  // Check if user has permission to access this page
  if (!hasPermission('roles.read')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to view roles and permissions."
      />
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading roles and permissions..." />;
  }

  if (error) {
    return (
      <AccessDenied
        title="Error Loading Data"
        message={`Failed to load roles and permissions: ${error}`}
        className="h-64"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <RolesPageHeader 
        hasPermission={hasPermission}
        onCreateRole={handleCreateRole}
      />

      {/* Enhanced Stats Cards */}
      <RolesStatsCards stats={roleStats} />

      {/* Roles Content */}
      <div className="space-y-4">
        <RolesDataTable
          roles={filteredRoles}
          onEditRole={handleEditRole}
          hasPermission={hasPermission}
        />
      </div>

      {/* Role Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="md"
      >
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
      </Drawer>
    </div>
  );
}
