'use client';

import React from 'react';
import {
  Package,
  User,
  FolderKanban,
  Tag,
  Ruler,
  Weight,
  Layers,
  MapPin,
  Calendar,
  Hash,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, Controller, Control } from 'react-hook-form';
import { SearchableSelect, GooglePlacesAutocomplete } from '@/components/common';
import type { InventoryUnitType } from './types';
import type { InventoryFormData } from '@/lib/validations';

interface CheckInFormProps {
  editingInventory: InventoryUnitType | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errors: FieldErrors<InventoryFormData>;
  register: UseFormRegister<InventoryFormData>;
  setValue: UseFormSetValue<InventoryFormData>;
  watch: UseFormWatch<InventoryFormData>;
  control: Control<InventoryFormData>;
}

export default function CheckInForm({
  editingInventory,
  onSubmit,
  onClose,
  isSubmitting,
  errors,
  register,
  setValue,
  watch,
  control,
}: CheckInFormProps) {
  const clientId = watch('clientId');
  const projectId = watch('projectId');

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingInventory ? 'Update Inventory' : 'Check-In New Pallet'}
            </h2>
            <p className="text-sm text-gray-500">
              {editingInventory 
                ? 'Update inventory unit details'
                : 'Register new inventory into warehouse'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Body - Scrollable */}
      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        
        {/* Client Selection */}
        <SearchableSelect
          label="Client"
          value={clientId || ''}
          onChange={(value) => {
            setValue('clientId', value);
            setValue('projectId', ''); // Reset project when client changes
          }}
          placeholder="Search and select client..."
          apiEndpoint="/api/dashboard/clients/dropdown"
          disabled={isSubmitting}
          error={errors.clientId?.message}
          required={true}
          icon={<User className="h-4 w-4" />}
          selectedLabel={
            editingInventory?.client
              ? (editingInventory.client.company_name || 
                 editingInventory.client.full_name || 
                 editingInventory.client.email)
              : undefined
          }
        />

        {/* Project Selection (Optional) */}
        {clientId ? (
          <SearchableSelect
            label="Project (Optional)"
            value={projectId || ''}
            onChange={(value) => {
              setValue('projectId', value);
            }}
            placeholder="Search and select project..."
            apiEndpoint="/api/dashboard/projects/dropdown"
            disabled={isSubmitting || !clientId}
            error={errors.projectId?.message}
            required={false}
            icon={<FolderKanban className="h-4 w-4" />}
            filters={{ clientId: clientId }}
            dataKey="data"
            selectedLabel={
              editingInventory?.project
                ? `${editingInventory.project.name} (${editingInventory.project.code})`
                : undefined
            }
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FolderKanban className="h-4 w-4 inline mr-1" />
              Project (Optional)
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
              Please select a client first
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Projects will be available after selecting a client
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Item Details</h3>
        </div>

        {/* Item Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="h-4 w-4 inline mr-1" />
            Item Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('label')}
            placeholder="e.g., 2.4m Wall Panels"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
          )}
        </div>

        {/* SKU - Full Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="h-4 w-4 inline mr-1" />
            SKU / Item Code
          </label>
          <input
            type="text"
            {...register('sku')}
            placeholder="e.g., WP-2400"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>

        {/* Description - Full Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Description
          </label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Brief description of the item..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Dimensions - Grid (Length, Width, Height) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Ruler className="h-4 w-4 inline mr-1" />
            Dimensions (mm) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                min="1"
                step="0.01"
                {...register('lengthMm', { valueAsNumber: true })}
                placeholder="Length"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.lengthMm && (
                <p className="mt-1 text-sm text-red-600">{errors.lengthMm.message}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                min="1"
                step="0.01"
                {...register('widthMm', { valueAsNumber: true })}
                placeholder="Width"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.widthMm && (
                <p className="mt-1 text-sm text-red-600">{errors.widthMm.message}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                min="1"
                step="0.01"
                {...register('heightMm', { valueAsNumber: true })}
                placeholder="Height"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.heightMm && (
                <p className="mt-1 text-sm text-red-600">{errors.heightMm.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Weight className="h-4 w-4 inline mr-1" />
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            {...register('weightKg', { valueAsNumber: true })}
            placeholder="e.g., 450.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.weightKg && (
            <p className="mt-1 text-sm text-red-600">{errors.weightKg.message}</p>
          )}
        </div>

        {/* Stackability and Top Load Rating - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="h-4 w-4 inline mr-1" />
              Stackability <span className="text-red-500">*</span>
            </label>
            <select
              {...register('stackability')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="stackable">Stackable</option>
              <option value="non_stackable">Non-Stackable</option>
              <option value="top_only">Top Only</option>
              <option value="bottom_only">Bottom Only</option>
            </select>
            {errors.stackability && (
              <p className="mt-1 text-sm text-red-600">{errors.stackability.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Load Rating (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              {...register('topLoadRatingKg', { valueAsNumber: true })}
              placeholder="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Checkboxes - Fragile, Keep Upright, Orientation Locked */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('fragile')}
              id="fragile"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="fragile" className="ml-2 block text-sm text-gray-900">
              Fragile
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('keepUpright')}
              id="keepUpright"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="keepUpright" className="ml-2 block text-sm text-gray-900">
              Keep Upright
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('orientationLocked')}
              id="orientationLocked"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="orientationLocked" className="ml-2 block text-sm text-gray-900">
              Lock Orientation
            </label>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="h-4 w-4 inline mr-1" />
            Loading Priority (1 = first)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            {...register('priority', { valueAsNumber: true })}
            placeholder="e.g., 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers load first (e.g., 1 = floor/rigging, 5 = furniture)
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Warehouse Location</h3>
        </div>

        {/* Pallet Number and Inventory Date - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              Pallet Number
            </label>
            <input
              type="text"
              {...register('palletNo')}
              placeholder="e.g., P-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Inventory Date
            </label>
            <input
              type="date"
              {...register('inventoryDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Location Site with Google Places */}
        <Controller
          name="locationSite"
          control={control}
          render={({ field }) => (
            <GooglePlacesAutocomplete
              label="Warehouse Site / Location"
              value={field.value}
              onChange={(data) => {
                // We only need the address text for location_site
                field.onChange(data.address);
              }}
              placeholder="Enter warehouse location (e.g., Derrimut, Melbourne)"
              error={errors.locationSite?.message}
              required={true}
              icon={<MapPin className="h-4 w-4" />}
            />
          )}
        />

        {/* Location Aisle, Bay, Level - Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aisle
            </label>
            <input
              type="text"
              {...register('locationAisle')}
              placeholder="e.g., A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bay
            </label>
            <input
              type="text"
              {...register('locationBay')}
              placeholder="e.g., 01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <input
              type="text"
              {...register('locationLevel')}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Location Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Location Notes
          </label>
          <textarea
            {...register('locationNotes')}
            rows={2}
            placeholder="Additional location details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Quantity and Status - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              Quantity
            </label>
            <input
              type="number"
              min="1"
              defaultValue={1}
              {...register('quantity', { valueAsNumber: true })}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="in_storage">In Storage</option>
              <option value="reserved">Reserved</option>
              <option value="on_truck">On Truck</option>
              <option value="onsite">Onsite</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {editingInventory ? 'Updating...' : 'Checking In...'}
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {editingInventory ? 'Update Inventory' : 'Check-In Pallet'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

