'use client';

import React, { useMemo } from 'react';
import { Mail, Phone, Building2, User as UserIcon, MapPin, Edit } from 'lucide-react';
import { DataTable, Column, Action } from '@/components/common';
import type { Client } from '@/hooks/dashboard/useClients';

interface ClientsDataTableProps {
  clients: Client[];
  hasPermission: (permission: string) => boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  paginationLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onEdit: (client: Client) => void;
}

export default function ClientsDataTable({
  clients,
  hasPermission,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  paginationLoading,
  onPageChange,
  onSearch,
  onEdit,
}: ClientsDataTableProps) {

  // Memoize columns for DataTable
  const columns: Column<Client>[] = useMemo(() => [
    {
      key: 'full_name',
      header: 'Client Name',
      render: (value, row) => {
        const nameValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        const contactPerson = row.contact_person && row.contact_person !== 'null' && String(row.contact_person).trim() !== ''
          ? String(row.contact_person)
          : null;
        return (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <div className="font-medium text-gray-900">{nameValue}</div>
              {contactPerson && (
                <div className="text-sm text-gray-500">{contactPerson}</div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => {
        const emailValue = value && String(value).trim() !== '' && value !== 'null'
          ? String(value)
          : '-';
        return (
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{emailValue}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value) => {
        const phoneValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        return (
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{phoneValue}</span>
          </div>
        );
      },
    },
    {
      key: 'company_name',
      header: 'Company',
      render: (value) => {
        const companyValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        return (
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{companyValue}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'billing_address',
      header: 'Billing Address',
      render: (value) => {
        const addressValue = value && value !== 'null' && String(value).trim() !== ''
          ? String(value)
          : '-';
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600 truncate max-w-xs">{addressValue}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const status = String(value);
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          blocked: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
            {status}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <div className="text-gray-500">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      ),
      sortable: true,
    }
  ], []);

  // Memoize actions for DataTable
  const actions: Action<Client>[] = useMemo(() => [
    {
      label: 'Edit Client',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => onEdit(row),
      variant: 'warning',
      disabled: () => !hasPermission('clients.update'),
    },
  ], [hasPermission, onEdit]);

  return (
    <DataTable
      data={clients}
      columns={columns}
      actions={actions}
      searchPlaceholder="Search clients..."
      emptyMessage="No clients found"
      // Server-side pagination props
      serverSidePagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={itemsPerPage}
      paginationLoading={paginationLoading}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
