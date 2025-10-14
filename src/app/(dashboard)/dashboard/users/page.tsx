'use client';

import {
  UsersDataTable,
  UsersStatsCards,
  UsersPageHeader,
  UserForm,
} from '@/components/dashboard/users';
import { AccessDenied } from '@/components/ui';
import { LoadingSpinner, Drawer } from '@/components/common';
import { useUsers } from '@/hooks/dashboard';
import { UserFormType } from '@/components/dashboard/users/formTypes';
import { UseFormReturn } from 'react-hook-form';

export default function UsersPage() {
  const {
    users,
    roles,
    stats,
    loading,
    paginationLoading,
    error,
    isFormOpen,
    editingUser,
    form: formRaw,
    handleCreateUser,
    handleEditUser,
    handleFormSubmit,
    handleFormClose,
    hasPermission,
    // Pagination props
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleSearch,
  } = useUsers();

  // Type assertion for form
  const form = formRaw as unknown as UseFormReturn<UserFormType>;

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

      {/* Stats Cards */}~
      <UsersStatsCards stats={stats} />

      <div className="space-y-4">
        <UsersDataTable
          users={users}
          onEditUser={handleEditUser}
          hasPermission={hasPermission}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          paginationLoading={paginationLoading}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
        />
      </div>

      {/* Employee Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingUser ? 'Edit Employee' : 'Create New Employee'}
        size="md"
      >
        <UserForm
          editingUser={editingUser}
          roles={roles}
          onSubmit={form.handleSubmit(handleFormSubmit)}
          onClose={handleFormClose}
          isSubmitting={form.formState.isSubmitting}
          errors={form.formState.errors}
          register={form.register}
          setValue={form.setValue}
          watch={form.watch}
        />
      </Drawer>
    </div>
  );
}
