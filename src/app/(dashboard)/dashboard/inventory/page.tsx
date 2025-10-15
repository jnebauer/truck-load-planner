'use client';

import React from 'react';
import { Drawer, LoadingSpinner } from '@/components/common';
import { AccessDenied } from '@/components/ui';
import {
  CheckInForm,
  InventoryDataTable,
  InventoryPageHeader,
  InventoryStatsCards,
} from '@/components/dashboard/inventory';
import { useInventory } from '@/hooks/dashboard';

export default function InventoryPage() {
  const {
    inventory,
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
    form,
    isFormOpen,
    editingInventory,
    palletValidation,
    skuValidation,
    showPalletSuccess,
    showSkuSuccess,
    handleCheckIn,
    handleEditInventory,
    handleFormSubmit,
    handleFormClose,
    hasPermission,
  } = useInventory();

  // Check if user has permission to access this page
  if (!hasPermission('inventory.read')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to view inventory."
      />
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading inventory..." />;
  }

  if (error) {
    return (
      <AccessDenied
        title="Error Loading Data"
        message={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <InventoryPageHeader 
        hasPermission={hasPermission}
        onCheckIn={handleCheckIn}
      />

      {/* Stats Cards */}
      <InventoryStatsCards stats={stats} />

      {/* Inventory Data Table */}
      <InventoryDataTable
        inventory={inventory}
        hasPermission={hasPermission}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        paginationLoading={paginationLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEditInventory}
      />

      {/* Check-In Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingInventory ? 'Update Inventory' : 'Check-In New Pallet'}
        size="md"
      >
        <CheckInForm
          editingInventory={editingInventory}
          onSubmit={form.handleSubmit(handleFormSubmit as never)}
          onClose={handleFormClose}
          isSubmitting={form.formState.isSubmitting}
          errors={form.formState.errors}
          register={form.register}
          setValue={form.setValue}
          watch={form.watch}
          control={form.control}
          palletValidation={palletValidation}
          skuValidation={skuValidation}
          showPalletSuccess={showPalletSuccess}
          showSkuSuccess={showSkuSuccess}
        />
      </Drawer>
    </div>
  );
}

