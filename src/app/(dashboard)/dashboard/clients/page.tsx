'use client';

import {
  ClientsPageHeader,
  ClientsStatsCards,
  ClientsDataTable,
  ClientForm,
} from '@/components/dashboard/clients';
import { AccessDenied } from '@/components/ui';
import { LoadingSpinner, Drawer } from '@/components/common';
import { useClients } from '@/hooks/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { ClientFormType } from '@/components/dashboard/clients/ClientForm';
import { UseFormReturn } from 'react-hook-form';

export default function ClientsPage() {
  const { hasPermission } = useAuth();
  const {
    clients,
    stats,
    loading,
    paginationLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleSearch,
    form: formRaw,
    isFormOpen,
    editingClient,
    handleCreateClient,
    handleEditClient,
    handleDeleteClient,
    handleFormSubmit,
    handleFormClose,
  } = useClients();

  // Type assertion for form
  const form = formRaw as unknown as UseFormReturn<ClientFormType>;

  // Check if user has permission to access this page
  if (!hasPermission('clients.read')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to view clients."
      />
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading clients..." />;
  }

  if (error) {
    return (
      <AccessDenied
        title="Error Loading Data"
        message={`Failed to load clients: ${error}`}
        className="h-64"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ClientsPageHeader onCreateClient={handleCreateClient} />

      {/* Stats Cards */}
      <ClientsStatsCards stats={stats} />

      {/* Data Table */}
      <div className="space-y-4">
        <ClientsDataTable
          clients={clients}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          paginationLoading={paginationLoading}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      </div>

      {/* Client Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingClient ? 'Edit Client' : 'Create New Client'}
        size="md"
      >
        <ClientForm
          editingClient={editingClient}
          onSubmit={form.handleSubmit((data) => handleFormSubmit(data))}
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
