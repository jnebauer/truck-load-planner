'use client';

import React from 'react';
import {
  Save,
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Building2,
  Globe,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control, Controller } from 'react-hook-form';
import type { Client } from '@/hooks/dashboard/useClients';
import { generateSecurePassword } from '@/lib/password-utils';
import { useApps } from '@/hooks/auth/useApps';
import { APP_NAMES } from '@/lib/constants/apps';
import { PhoneInput, GooglePlacesAutocomplete, AddressData, ImageUpload } from '@/components/common';

export interface ClientFormType {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  role: string;
  status: 'active' | 'inactive' | 'blocked';
  appPermissions?: Record<string, boolean>;
  // Client-specific fields
  companyName?: string;
  billingAddress?: string;
  billingLat?: number | null;
  billingLng?: number | null;
  billingPlaceId?: string;
  shippingAddress?: string;
  shippingLat?: number | null;
  shippingLng?: number | null;
  shippingPlaceId?: string;
  contactPerson?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  logoImage?: string;
}

interface ClientFormProps {
  editingClient: Client | null;
  onSubmit: (e?: React.BaseSyntheticEvent<object, unknown, unknown>) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errors: FieldErrors<ClientFormType>;
  register: UseFormRegister<ClientFormType>;
  setValue: UseFormSetValue<ClientFormType>;
  watch: UseFormWatch<ClientFormType>;
  control: Control<ClientFormType>;
}

export default function ClientForm({
  editingClient,
  onSubmit,
  onClose,
  isSubmitting,
  errors,
  register,
  setValue,
  watch,
  control,
}: ClientFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { apps, loading: appsLoading } = useApps();
  const appPermissions = watch('appPermissions') || {};
  const phoneValue = watch('phone') || '';

  const handleGeneratePassword = () => {
    const randomPassword = generateSecurePassword();
    setValue('password', randomPassword);
  };

  const handlePhoneChange = (value: string | undefined) => {
    setValue('phone', value || '');
  };

  const handleBillingAddressChange = (data: AddressData) => {
    // If address is empty, set all fields to null/empty
    if (!data.address || data.address.trim() === '') {
      setValue('billingAddress', '');
      setValue('billingLat', null);
      setValue('billingLng', null);
      setValue('billingPlaceId', '');
    } else {
      setValue('billingAddress', data.address);
      setValue('billingLat', data.lat || null);
      setValue('billingLng', data.lng || null);
      setValue('billingPlaceId', data.placeId);
    }
  };

  const handleShippingAddressChange = (data: AddressData) => {
    // If address is empty, set all fields to null/empty
    if (!data.address || data.address.trim() === '') {
      setValue('shippingAddress', '');
      setValue('shippingLat', null);
      setValue('shippingLng', null);
      setValue('shippingPlaceId', '');
    } else {
      setValue('shippingAddress', data.address);
      setValue('shippingLat', data.lat || null);
      setValue('shippingLng', data.lng || null);
      setValue('shippingPlaceId', data.placeId);
    }
  };

  // Helper function to convert app name to form field name
  // "Truck Load Planner" → "truckLoadPlanner"
  const toFormFieldName = (appName: string): string => {
    return appName
      .split(' ')
      .map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  };

  return (
    <form onSubmit={onSubmit} className="h-full flex flex-col">
      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        {/* Full Name / Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Client Name *
          </label>
          <input
            {...register('fullName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter client name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline h-4 w-4 mr-1" />
            Password {!editingClient ? '*' : ''}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                editingClient
                  ? 'Leave blank to keep current password'
                  : 'Enter password'
              }
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="px-2 py-1 mr-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Generate random password"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 py-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          {editingClient && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep current password
            </p>
          )}
        </div>

        {/* Phone */}
        <PhoneInput
          label="Phone Number"
          value={phoneValue}
          onChange={handlePhoneChange}
          placeholder="Enter phone number"
          error={errors.phone?.message}
        />

        {/* Profile Image */}
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ImageUpload
              label="Profile Image"
              value={field.value || ''}
              onChange={field.onChange}
              folder="users"
              error={errors.profileImage?.message}
            />
          )}
        />

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Client Information</h3>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-1" />
            Company Name
          </label>
          <input
            {...register('companyName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        {/* Contact Person */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Contact Person
          </label>
          <input
            {...register('contactPerson')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter contact person name"
          />
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
          )}
        </div> */}

        {/* Billing Address */}
        <GooglePlacesAutocomplete
          label="Billing Address"
          value={watch('billingAddress') || ''}
          onChange={handleBillingAddressChange}
          placeholder="Enter billing address"
          error={errors.billingAddress?.message}
          icon={<MapPin className="h-4 w-4" />}
        />

        {/* Shipping Address */}
        <GooglePlacesAutocomplete
          label="Shipping Address"
          value={watch('shippingAddress') || ''}
          onChange={handleShippingAddressChange}
          placeholder="Enter shipping address"
          error={errors.shippingAddress?.message}
          icon={<MapPin className="h-4 w-4" />}
        />

        {/* Tax ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="inline h-4 w-4 mr-1" />
            Tax ID
          </label>
          <input
            {...register('taxId')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter tax ID"
          />
          {errors.taxId && (
            <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline h-4 w-4 mr-1" />
            Website
          </label>
          <input
            {...register('website')}
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        {/* Logo Image */}
        <Controller
          name="logoImage"
          control={control}
          render={({ field }) => (
            <ImageUpload
              label="Company Logo"
              value={field.value || ''}
              onChange={field.onChange}
              folder="clients"
              error={errors.logoImage?.message}
            />
          )}
        />

        {/* Notes */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any additional notes..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div> */}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* App Permissions - Dynamic from Database */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Shield className="inline h-4 w-4 mr-1" />
            App Permissions *
          </label>
          
          {appsLoading ? (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Loading apps...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">No apps available</p>
            </div>
          ) : (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              {apps.map((app) => {
                const fieldName = toFormFieldName(app.name);
                // Check if this app is already checked (from editing client) or default for new client
                const isChecked = editingClient 
                  ? appPermissions[fieldName] === true 
                  : app.name === APP_NAMES.TRUCK_LOAD_PLANNER;
                const isDefault = app.name === APP_NAMES.TRUCK_LOAD_PLANNER;
                
                return (
                  <div key={app.id} className="flex items-center">
                    <input
                      {...register(`appPermissions.${fieldName}`)}
                      type="checkbox"
                      defaultChecked={isChecked}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 block text-sm text-gray-900">
                      <span className="font-medium">
                        {app.name}
                        {!editingClient && isDefault && <span className="ml-1 text-xs text-gray-500">(Default)</span>}
                      </span>
                      {app.description && (
                        <span className="block text-xs text-gray-500">
                          {app.description}
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}

              <p className="mt-2 text-xs text-gray-500 italic">
                ⚠️ Client must have at least one app permission to access the system
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex-shrink-0 flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {editingClient ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingClient ? 'Update Client' : 'Create Client'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
