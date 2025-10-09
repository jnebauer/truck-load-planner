'use client';

import React from 'react';
import { Shield, Users, Settings, BarChart3 } from 'lucide-react';

interface RolesStatsCardsProps {
  stats: {
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    totalPermissions: number;
  };
}

export default function RolesStatsCards({ stats }: RolesStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Roles</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalRoles}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Roles</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.activeRoles}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Inactive Roles</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.inactiveRoles}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Permissions</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalPermissions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
