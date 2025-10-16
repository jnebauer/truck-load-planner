'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export interface Column<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface Action<T = Record<string, unknown>> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T, index: number) => void;
  className?: string;
  variant?: 'default' | 'primary' | 'danger' | 'warning';
  disabled?: (row: T) => boolean;
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  onRowClick?: (row: T, index: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  // Server-side pagination props
  serverSidePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  paginationLoading?: boolean;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions = [],
  onRowClick,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  emptyMessage = "No data found",
  emptyIcon,
  className = "",
  loading = false,
  pagination = true,
  pageSize = 10,
  sortable = true,
  selectable = false,
  onSelectionChange,
  rowKey = 'id',
  striped = true,
  hoverable = true,
  compact = false,
  // Server-side pagination props
  serverSidePagination = false,
  currentPage: serverCurrentPage,
  totalPages: serverTotalPages,
  totalItems: serverTotalItems,
  onPageChange,
  onSearch,
  paginationLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Debounce search term for server-side pagination
  useEffect(() => {
    if (serverSidePagination && onSearch) {
      const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [searchTerm, serverSidePagination, onSearch]);

  // Trigger search when debounced term changes (skip initial undefined value)
  useEffect(() => {
    if (serverSidePagination && onSearch && debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, serverSidePagination]);

  // Use server-side pagination values if provided, otherwise use local state
  const effectiveCurrentPage = serverSidePagination ? (serverCurrentPage || 1) : currentPage;
  const effectiveTotalPages = serverSidePagination ? (serverTotalPages || 1) : Math.ceil(data.length / pageSize);
  const effectiveTotalItems = serverSidePagination ? (serverTotalItems || 0) : data.length;

  // Get search keys
  const searchableKeys = searchKeys || columns.map(col => col.key);

  // For server-side pagination, use data as-is. For client-side, filter and sort
  const processedData = useMemo(() => {
    if (serverSidePagination) {
      return data; // Server already handled filtering, sorting, and pagination
    }

    // Client-side filtering
    let filteredData = data;
    if (searchTerm) {
      filteredData = data.filter((row) =>
        searchableKeys.some((key) => {
          const value = String(key).includes('.') 
            ? String(key).split('.').reduce((obj: Record<string, unknown>, k) => obj?.[k] as Record<string, unknown>, row)
            : row[key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Client-side sorting
    if (sortConfig.key && sortable) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = String(sortConfig.key!).includes('.')
          ? String(sortConfig.key!).split('.').reduce((obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>, a)
          : a[sortConfig.key! as keyof T];
        const bValue = String(sortConfig.key!).includes('.')
          ? String(sortConfig.key!).split('.').reduce((obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>, b)
          : b[sortConfig.key! as keyof T];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Client-side pagination
    if (pagination) {
      const startIndex = (currentPage - 1) * pageSize;
      return filteredData.slice(startIndex, startIndex + pageSize);
    }

    return filteredData;
  }, [data, searchTerm, searchableKeys, sortConfig, sortable, pagination, currentPage, pageSize, serverSidePagination]);

  const paginatedData = processedData;

  const handleSort = (key: string) => {
    if (!sortable || serverSidePagination) return; // Disable sorting for server-side pagination
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value); // Always update local state to keep input value
    // For server-side pagination, debouncing is handled by useEffect above
    // For client-side, search is applied immediately in processedData
  };

  const handlePageChange = (page: number) => {
    if (serverSidePagination && onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const getSortIcon = (key: string) => {
    if (!sortable || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    if (!selectable) return;
    
    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter((selectedRow) => {
          const key = typeof rowKey === 'function' ? rowKey(selectedRow) : selectedRow[rowKey];
          const currentKey = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
          return key !== currentKey;
        });
    
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;
    
    const newSelection = checked ? [...paginatedData] : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] as string | number || index;
  };

  const getActionVariantClasses = (variant: Action<T>['variant'] = 'default') => {
    const variants = {
      default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
      primary: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
      danger: 'text-red-600 hover:text-red-900 hover:bg-red-50',
      warning: 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50',
    };
    return variants[variant];
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-100 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && sortable && handleSort(String(column.key))}
                >
                  <div className={`flex items-center ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    <span>{column.header}</span>
                    {column.sortable !== false && sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y' : ''}`}>
            {paginationLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading records...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    {emptyIcon}
                    <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
                      {emptyMessage}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'No results match your search.' : 'No data available.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const key = getRowKey(row, rowIndex);
                const isSelected = selectedRows.some(selectedRow => {
                  const selectedKey = typeof rowKey === 'function' ? rowKey(selectedRow) : selectedRow[rowKey];
                  return selectedKey === key;
                });

                return (
                  <tr
                    key={key}
                    className={`${striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${
                      hoverable ? 'hover:bg-gray-50' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''} transition-colors duration-150`}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(row, e.target.checked);
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={`px-6 py-${compact ? '2' : '4'} whitespace-nowrap text-sm text-gray-900 text-${column.align || 'left'} ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(
                              String(column.key).includes('.')
                                ? String(column.key).split('.').reduce((obj: Record<string, unknown>, k) => obj?.[k] as Record<string, unknown>, row)
                                : row[column.key as keyof T],
                              row,
                              rowIndex
                            )
                          : String(column.key).includes('.')
                          ? String(String(column.key).split('.').reduce((obj: Record<string, unknown>, k) => obj?.[k] as Record<string, unknown>, row) || '')
                          : String(row[column.key as keyof T] || '')}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {actions.map((action, actionIndex) => {
                            const isDisabled = action.disabled?.(row);
                            return (
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isDisabled) action.onClick(row, rowIndex);
                                }}
                                disabled={isDisabled}
                                className={`p-1 rounded-md transition-colors duration-150 ${
                                  isDisabled 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : `${getActionVariantClasses(action.variant)} cursor-pointer`
                                } ${action.className || ''}`}
                                title={action.label}
                              >
                                {action.icon || <MoreHorizontal className="h-4 w-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && effectiveTotalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((effectiveCurrentPage - 1) * pageSize) + 1} to {Math.min(effectiveCurrentPage * pageSize, effectiveTotalItems)} of {effectiveTotalItems} entries
            </div>
            <div className="flex items-center space-x-2">
              {paginationLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading...</span>
                </div>
              )}
              <button
                onClick={() => handlePageChange(effectiveCurrentPage - 1)}
                disabled={effectiveCurrentPage === 1 || paginationLoading}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, effectiveTotalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={paginationLoading}
                      className={`px-3 py-2 text-sm rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        effectiveCurrentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(effectiveCurrentPage + 1)}
                disabled={effectiveCurrentPage === effectiveTotalPages || paginationLoading}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {searchTerm && (
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            Filtered by &quot;{searchTerm}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
