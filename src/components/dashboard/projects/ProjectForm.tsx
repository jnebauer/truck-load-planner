'use client';

import React from 'react';
import {
  Save,
  Building2,
  Code,
  MapPin,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from 'react-hook-form';
import type { Project } from '@/hooks/dashboard/useProjects';
import { GooglePlacesAutocomplete, AddressData, SearchableSelect } from '@/components/common';

export interface ProjectFormType {
  clientId: string;
  name: string;
  code: string;
  siteAddress?: string;
  siteLat?: number | null;
  siteLng?: number | null;
  sitePlaceId?: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted';
  notes?: string;
}

interface ProjectFormProps {
  editingProject: Project | null;
  onSubmit: (e?: React.BaseSyntheticEvent<object, unknown, unknown>) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errors: FieldErrors<ProjectFormType>;
  register: UseFormRegister<ProjectFormType>;
  setValue: UseFormSetValue<ProjectFormType>;
  watch: UseFormWatch<ProjectFormType>;
  control: Control<ProjectFormType>;
}

export default function ProjectForm({
  editingProject,
  onSubmit,
  onClose,
  isSubmitting,
  errors,
  register,
  setValue,
  watch,
}: ProjectFormProps) {
  const clientId = watch('clientId');

  const handleSiteAddressChange = (data: AddressData) => {
    // If address is empty, set all fields to null/empty
    if (!data.address || data.address.trim() === '') {
      setValue('siteAddress', '');
      setValue('siteLat', null);
      setValue('siteLng', null);
      setValue('sitePlaceId', '');
    } else {
      setValue('siteAddress', data.address);
      setValue('siteLat', data.lat || null);
      setValue('siteLng', data.lng || null);
      setValue('sitePlaceId', data.placeId);
    }
  };

  return (
    <form onSubmit={onSubmit} className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-1" />
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Office Fit-out Level 12"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Project Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Code className="inline h-4 w-4 mr-1" />
            Project Code <span className="text-red-500">*</span>
          </label>
          <input
            {...register('code')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="e.g., PROJ-001"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use uppercase letters, numbers, and hyphens only (e.g., PROJ-001)
          </p>
        </div>

        {/* Client Selection - Searchable with Infinite Scroll */}
        <SearchableSelect
          label="Client"
          value={clientId || ''}
          onChange={(value) => setValue('clientId', value)}
          placeholder="Search and select client..."
          apiEndpoint="/api/dashboard/clients/dropdown"
          disabled={isSubmitting}
          error={errors.clientId?.message}
          required={true}
          icon={<User className="h-4 w-4" />}
          selectedLabel={
            editingProject?.client && clientId === editingProject.client_id
              ? (editingProject.client.company_name || editingProject.client.full_name || editingProject.client.email)
              : undefined
          }
        />

        {/* Site Address */}
        <GooglePlacesAutocomplete
          label="Site Address"
          value={watch('siteAddress') || ''}
          onChange={handleSiteAddressChange}
          error={errors.siteAddress?.message}
          icon={<MapPin className="h-4 w-4" />}
        />

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Start Date
          </label>
          <input
            {...register('startDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            End Date
          </label>
          <input
            {...register('endDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any additional notes about this project..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Fixed Footer with Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </form>
  );
}

