'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface ProjectsPageHeaderProps {
  hasPermission: (permission: string) => boolean;
  onCreateProject: () => void;
}

export default function ProjectsPageHeader({ 
  hasPermission,
  onCreateProject 
}: ProjectsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">Manage client projects and site locations</p>
      </div>
      {hasPermission('projects.create') && (
        <button
          onClick={onCreateProject}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      )}
    </div>
  );
}

