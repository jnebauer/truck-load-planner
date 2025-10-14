'use client';

import React from 'react';
import { Drawer, LoadingSpinner } from '@/components/common';
import { AccessDenied } from '@/components/ui';
import {
  ProjectForm,
  ProjectsDataTable,
  ProjectsPageHeader,
  ProjectsStatsCards,
} from '@/components/dashboard/projects';
import { useProjects } from '@/hooks/dashboard';

export default function ProjectsPage() {
  const {
    projects,
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
    editingProject,
    handleCreateProject,
    handleEditProject,
    handleFormSubmit,
    handleFormClose,
    hasPermission,
  } = useProjects();

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />;
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
      <ProjectsPageHeader 
        hasPermission={hasPermission}
        onCreateProject={handleCreateProject} 
      />

      {/* Stats Cards */}
      <ProjectsStatsCards stats={stats} />

      {/* Data Table */}
      <div className="space-y-4">
        <ProjectsDataTable
          projects={projects}
          hasPermission={hasPermission}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          paginationLoading={paginationLoading}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onEdit={handleEditProject}
        />
      </div>

      {/* Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="md"
      >
        <ProjectForm
          editingProject={editingProject}
          onSubmit={form.handleSubmit(handleFormSubmit)}
          onClose={handleFormClose}
          isSubmitting={form.formState.isSubmitting}
          errors={form.formState.errors}
          register={form.register}
          setValue={form.setValue}
          watch={form.watch}
          control={form.control}
        />
      </Drawer>
    </div>
  );
}

