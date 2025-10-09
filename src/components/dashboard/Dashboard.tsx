'use client';

import React from 'react';
import { 
  Package, 
  Truck, 
  FileText, 
  Users,
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';

interface DashboardProps {
  user: {
    full_name: string | null;
    role: string;
  } | null;
}

export default function Dashboard({ user }: DashboardProps) {
  // Use user in the component
  const displayName = user?.full_name || 'User';
  const metrics = [
    {
      title: 'Total Items',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Trucks',
      value: '3',
      change: '+2',
      changeType: 'positive',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: 'Reports Generated',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Users',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Item',
      description: 'Add inventory items',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: '/inventory/add'
    },
    {
      title: 'Plan Truck Load',
      description: 'Create load plans',
      icon: Truck,
      color: 'bg-green-600 hover:bg-green-700',
      href: '/truck-planner'
    },
    {
      title: 'Generate Report',
      description: 'Create reports',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      href: '/reports'
    }
  ];

  const recentActivity = [
    {
      action: 'New item added: 2.4m Wall Panels',
      time: '2 hours ago',
      icon: Package
    },
    {
      action: 'Truck load planned: Truck #3',
      time: '4 hours ago',
      icon: Truck
    },
    {
      action: 'Report generated: Monthly Inventory Summary',
      time: '1 day ago',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Truck Loading & Storage Tracker, {displayName}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{metric.change}</span>
                  </div>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`${action.color} text-white rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex items-center mb-3">
                  <Icon className="h-6 w-6 mr-3" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                </div>
                <p className="text-blue-100">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
