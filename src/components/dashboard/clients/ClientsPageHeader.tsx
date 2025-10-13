'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface ClientsPageHeaderProps {
  onCreateClient: () => void;
}

export default function ClientsPageHeader({ onCreateClient }: ClientsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600">Manage your client users and their information</p>
      </div>
      <button
        onClick={onCreateClient}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Client
      </button>
    </div>
  );
}
