'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Option {
  value: string;
  label: string;
}

interface ClientItem {
  id: string;
  full_name?: string | null;
  company_name?: string | null;
  name?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  apiEndpoint: string; // e.g., '/api/dashboard/clients/dropdown'
  disabled?: boolean;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  selectedLabel?: string; // Optional: Display label when editing
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  placeholder = 'Select...',
  apiEndpoint,
  disabled = false,
  error,
  required = false,
  icon,
  selectedLabel,
}: SearchableSelectProps) {
  const { authenticatedFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch options with search and pagination
  const fetchOptions = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${apiEndpoint}?page=${pageNum}&limit=5&search=${encodeURIComponent(search)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedOptions = (data.clients || []).map((item: ClientItem) => ({
          value: item.id,
          label: item.company_name || item.full_name || item.name || 'Unnamed',
        }));

        if (append) {
          setOptions((prev) => [...prev, ...formattedOptions]);
        } else {
          setOptions(formattedOptions);
        }
        
        setPage(pageNum);
        setHasMore(data.pagination?.hasNextPage || false);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, authenticatedFetch]);

  // Fetch all clients initially if a value is provided (for edit mode)
  useEffect(() => {
    const fetchInitialOptions = async () => {
      if (value && options.length === 0 && !initialFetchDone) {
        try {
          const response = await authenticatedFetch(
            `${apiEndpoint}?page=1&limit=1000&search=`
          );
          if (response.ok) {
            const data = await response.json();
            const formattedOptions = (data.clients || []).map((item: ClientItem) => ({
              value: item.id,
              label: item.company_name || item.full_name || item.name || 'Unnamed',
            }));
            setOptions(formattedOptions);
            setInitialFetchDone(true);
          }
        } catch (error) {
          console.error('Error fetching initial options:', error);
        }
      }
    };

    fetchInitialOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, apiEndpoint, authenticatedFetch]);

  // Initial fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions(1, '', false);
    }
  }, [isOpen, fetchOptions]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const handler = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchOptions(1, searchTerm, false);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, isOpen, fetchOptions]);

  // Load more on scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    console.log('🔄 Scroll Event:', { scrollTop, scrollHeight, clientHeight, hasMore, loading });
    
    // Trigger when near bottom (50px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      console.log('✅ Loading more options...');
      fetchOptions(page + 1, searchTerm, true);
    }
  }, [loading, hasMore, page, searchTerm, fetchOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  
  // Display label: use selectedLabel prop (for edit mode) or found option or placeholder
  const displayLabel = selectedLabel || (selectedOption ? selectedOption.label : placeholder);
  const hasSelection = !!selectedLabel || !!selectedOption;

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon && <span className="inline-block mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-white hover:border-blue-500 cursor-pointer'
        } ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
      >
        <span className={hasSelection ? 'text-gray-900' : 'text-gray-500'}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-32 overflow-y-auto"
          >
            {!loading && options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              <>
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                      option.value === value ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                
                {/* Loading Indicator */}
                {loading && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

