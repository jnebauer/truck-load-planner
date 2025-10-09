'use client';

import {
  UsersDataTable,
  UsersStatsCards,
  UsersPageHeader,
  UserForm,
} from '@/components/dashboard/users';
import { AccessDenied, LoadingSpinner, Drawer } from '@/components/ui';
import { useUsers } from '@/hooks/dashboard';

export default function UsersPage() {
  const {
    users,
    roles,
    stats,
    loading,
    error,
    isFormOpen,
    editingUser,
    form,
    handleCreateUser,
    handleEditUser,
    handleFormSubmit,
    handleFormClose,
    hasPermission,
  } = useUsers();

  // Check if user has permission to access this page
  if (!hasPermission('users.read')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to view users."
      />
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (error) {
    return (
      <AccessDenied
        title="Error Loading Data"
        message={`Failed to load users: ${error}`}
        className="h-64"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <UsersPageHeader
        hasPermission={hasPermission}
        onCreateUser={handleCreateUser}
      />

      {/* Stats Cards */}
      <UsersStatsCards stats={stats} />

      <div className="space-y-4">
        <UsersDataTable
          users={users}
          onEditUser={handleEditUser}
          hasPermission={hasPermission}
        />
      </div>

      {/* User Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <UserForm
          editingUser={editingUser}
          roles={roles}
          onSubmit={form.handleSubmit(handleFormSubmit as (data: any) => Promise<void>)} // eslint-disable-line @typescript-eslint/no-explicit-any
          onClose={handleFormClose}
          isSubmitting={form.formState.isSubmitting}
          errors={form.formState.errors}
          register={form.register as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        />
      </Drawer>
    </div>
  );
}
