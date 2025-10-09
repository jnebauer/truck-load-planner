'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, UserCheck, Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { Column, Action } from '@/components/ui/DataTable';

interface User extends Record<string, unknown> {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check if user has permission to access this page
  if (!hasPermission('users.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view users.</p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    // Implement edit functionality
  };

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user);
    // Implement delete functionality
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <div className="font-medium text-gray-900">{value as string}</div>
      )
    },
    {
      key: 'full_name',
      header: 'Full Name',
      render: (value) => (
        <div className="text-gray-900">{value as string || 'N/A'}</div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value as string}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const status = value as string;
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <div className="text-gray-500">
          {new Date(value as string).toLocaleDateString()}
        </div>
      )
    }
  ];

  const actions: Action<User>[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditUser,
      variant: 'primary',
      disabled: () => !hasPermission('users.update')
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteUser,
      variant: 'danger',
      disabled: () => !hasPermission('users.delete')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        {hasPermission('users.create') && (
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable<User>
        data={users}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Search users..."
        searchKeys={['email', 'full_name', 'role']}
        emptyMessage="No users found"
        emptyIcon={<Users className="h-12 w-12 text-gray-400 mx-auto" />}
        loading={loading}
        pagination={true}
        pageSize={10}
        striped={true}
        hoverable={true}
      />
    </div>
  );
}
