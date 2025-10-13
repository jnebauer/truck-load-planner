'use client';

import React from 'react';
import {
  Save,
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Building2,
  FileText,
  Globe,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { Client } from '@/hooks/dashboard/useClients';
import { generateSecurePassword } from '@/lib/password-utils';
import { useApps } from '@/hooks/auth/useApps';
import { PhoneInput, GooglePlacesAutocomplete, AddressData } from '@/components/common';

export interface ClientFormType {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
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
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  errors: FieldErrors<ClientFormType>;
  register: UseFormRegister<ClientFormType>;
  setValue: UseFormSetValue<ClientFormType>;
  watch: UseFormWatch<ClientFormType>;
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
}: ClientFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { apps } = useApps();

  // Watch form values
  const phoneValue = watch('phone');

  // Handle password generation
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setValue('password', newPassword);
  };

  // Handle phone change
  const handlePhoneChange = (value: string | undefined) => {
    setValue('phone', value || '');
  };

  // Handle billing address change
  const handleBillingAddressChange = (data: AddressData) => {
    setValue('billingAddress', data.address);
    setValue('billingLat', data.lat);
    setValue('billingLng', data.lng);
    setValue('billingPlaceId', data.placeId);
  };

  // Handle shipping address change
  const handleShippingAddressChange = (data: AddressData) => {
    setValue('shippingAddress', data.address);
    setValue('shippingLat', data.lat);
    setValue('shippingLng', data.lng);
    setValue('shippingPlaceId', data.placeId);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          Password {!editingClient && '*'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={editingClient ? 'Leave blank to keep current' : 'Enter password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Generate secure password"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        {editingClient && (
          <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserIcon className="inline h-4 w-4 mr-1" />
          Full Name *
        </label>
        <input
          {...register('fullName')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter full name"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <PhoneInput
        label="Phone Number"
        value={phoneValue || ''}
        onChange={handlePhoneChange}
        placeholder="Enter phone number"
        error={errors.phone?.message}
      />

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
      <div>
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
      </div>

      {/* Billing Address */}
      <GooglePlacesAutocomplete
        label="Billing Address"
        value={watch('billingAddress') || ''}
        onChange={handleBillingAddressChange}
        placeholder="Enter billing address"
        error={errors.billingAddress?.message}
      />

      {/* Shipping Address */}
      <GooglePlacesAutocomplete
        label="Shipping Address"
        value={watch('shippingAddress') || ''}
        onChange={handleShippingAddressChange}
        placeholder="Enter shipping address"
        error={errors.shippingAddress?.message}
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
          placeholder="Enter any additional notes..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      {/* App Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Shield className="inline h-4 w-4 mr-1" />
          App Permissions *
        </label>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {apps.map((app) => {
            const fieldName = app.name
              .split(' ')
              .map((word, index) =>
                index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join('');

            return (
              <label key={app.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`appPermissions.${fieldName}` as const)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{app.name}</span>
              </label>
            );
          })}
        </div>
        {errors.appPermissions && typeof errors.appPermissions.message === 'string' && (
          <p className="mt-1 text-sm text-red-600">{errors.appPermissions.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Saving...
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

