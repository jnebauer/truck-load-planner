import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  FileText,
  Package,
  MapPin,
  Calendar,
  User,
  Ruler,
  Weight,
  Layers,
  Hash,
} from 'lucide-react';
import { DataTable, Column, Action } from '@/components/common';
import type { InventoryUnitType } from './types';

// Status badge configuration
const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  in_storage: {
    label: 'In Storage',
    className: 'bg-blue-100 text-blue-800',
  },
  reserved: {
    label: 'Reserved',
    className: 'bg-yellow-100 text-yellow-800',
  },
  on_truck: {
    label: 'On Truck',
    className: 'bg-purple-100 text-purple-800',
  },
  onsite: {
    label: 'Onsite',
    className: 'bg-green-100 text-green-800',
  },
  returned: {
    label: 'Returned',
    className: 'bg-gray-100 text-gray-800',
  },
};

// Stackability badge configuration
const stackabilityConfig: Record<
  string,
  { label: string; className: string }
> = {
  stackable: {
    label: 'Stackable',
    className: 'bg-green-100 text-green-800',
  },
  non_stackable: {
    label: 'Non-Stackable',
    className: 'bg-red-100 text-red-800',
  },
  top_only: {
    label: 'Top Only',
    className: 'bg-blue-100 text-blue-800',
  },
  bottom_only: {
    label: 'Bottom Only',
    className: 'bg-yellow-100 text-yellow-800',
  },
};

interface InventoryDataTableProps {
  inventory: InventoryUnitType[];
  hasPermission: (permission: string) => boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  paginationLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onEdit: (inventory: InventoryUnitType) => void;
}

export default function InventoryDataTable({
  inventory,
  hasPermission,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  paginationLoading,
  onPageChange,
  onSearch,
  onEdit,
}: InventoryDataTableProps) {
  const router = useRouter();

  // Define columns
  const columns: Column<InventoryUnitType>[] = useMemo(
    () => [
      {
        key: 'pallet_no',
        header: 'Pallet #',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {row.pallet_no || '-'}
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'item_label',
        header: 'Item Label',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                {row.item?.label || '-'}
              </div>
              {row.item?.sku && (
                <div className="text-sm text-gray-500">
                  SKU: {row.item.sku}
                </div>
              )}
            </div>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'client',
        header: 'Client',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">
              {row.client?.company_name || row.client?.full_name || '-'}
            </span>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'dimensions',
        header: 'Dimensions (L×W×H)',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 text-sm">
              {row.item
                ? `${row.item.length_mm}×${row.item.width_mm}×${row.item.height_mm}`
                : '-'}
            </span>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'weight',
        header: 'Weight',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Weight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">
              {row.item ? `${row.item.weight_kg} kg` : '-'}
            </span>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'volume',
        header: 'Volume',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">
              {row.item?.volume_m3 ? `${row.item.volume_m3} m³` : '-'}
            </span>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'stackability',
        header: 'Stacking',
        render: (value, row: InventoryUnitType) => {
          if (!row.item?.stackability) return '-';
          const config = stackabilityConfig[row.item.stackability];
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            >
              <Layers className="h-3 w-3 mr-1" />
              {config.label}
            </span>
          );
        },
        sortable: false,
      },
      {
        key: 'location',
        header: 'Location',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {row.location_site}
              </div>
              {(row.location_aisle || row.location_bay || row.location_level) && (
                <div className="text-gray-500">
                  {[
                    row.location_aisle && `A:${row.location_aisle}`,
                    row.location_bay && `B:${row.location_bay}`,
                    row.location_level && `L:${row.location_level}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'status',
        header: 'Status',
        render: (value, row: InventoryUnitType) => {
          const config = statusConfig[row.status] || statusConfig.in_storage;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            >
              {config.label}
            </span>
          );
        },
        sortable: true,
      },
      {
        key: 'inventory_date',
        header: 'Date',
        render: (value, row: InventoryUnitType) => (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 text-sm">
              {new Date(row.inventory_date).toLocaleDateString()}
            </span>
          </div>
        ),
        sortable: true,
      },
    ],
    []
  );

  // Define actions
  const actions: Action<InventoryUnitType>[] = useMemo(
    () => [
      {
        label: 'View Details',
        icon: <FileText className="h-4 w-4" />,
        onClick: (row) => router.push(`/dashboard/inventory/${row.id}`),
        variant: 'primary',
      },
      {
        label: 'Edit Inventory',
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => onEdit(row),
        variant: 'warning',
        disabled: () => !hasPermission('inventory.update'),
      },
    ],
    [hasPermission, onEdit, router]
  );

  return (
    <DataTable
      data={inventory}
      columns={columns}
      actions={actions}
      searchable={true}
      searchPlaceholder="Search by pallet number, label, SKU..."
      onSearch={onSearch}
      // Server-side pagination props
      serverSidePagination={true}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={itemsPerPage}
      paginationLoading={paginationLoading}
      onPageChange={onPageChange}
      emptyMessage="No inventory found"
      onRowClick={(row) => router.push(`/dashboard/inventory/${row.id}`)}
    />
  );
}

