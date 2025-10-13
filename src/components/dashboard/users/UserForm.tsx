'use client';

import React from 'react';
import {
  Save,
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { User, Role } from './types';
import { UserFormType } from './formTypes';
import { generateSecurePassword } from '@/lib/password-utils';
import { useApps } from '@/hooks/auth/useApps';
import { APP_NAMES } from '@/lib/constants/apps';
import { PhoneInput, ImageUpload } from '@/components/common';

interface UserFormProps {
  editingUser: User | null;
  roles: Role[];
  onSubmit: (
    e?: React.BaseSyntheticEvent<object, unknown, unknown>
  ) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errors: FieldErrors<UserFormType>;
  register: UseFormRegister<UserFormType>;
  setValue: UseFormSetValue<UserFormType>;
  watch: UseFormWatch<UserFormType>;
}

export default function UserForm({
  editingUser,
  roles,
  onSubmit,
  onClose,
  isSubmitting,
  errors,
  register,
  setValue,
  watch,
}: UserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { apps, loading: appsLoading } = useApps();
  const appPermissions = watch('appPermissions') || {};
  const phoneValue = watch('phone') || '';
  const profileImageValue = watch('profileImage') || '';

  const handleGeneratePassword = () => {
    const randomPassword = generateSecurePassword();
    setValue('password', randomPassword);
  };

  const handlePhoneChange = (value: string | undefined) => {
    setValue('phone', value || '');
  };

  const handleImageChange = (url: string) => {
    setValue('profileImage', url);
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
            Password {!editingUser ? '*' : ''}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                editingUser
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
          {editingUser && (
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
        <ImageUpload
          label="Profile Image"
          value={profileImageValue}
          onChange={handleImageChange}
          folder="users"
          error={errors.profileImage?.message}
        />

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="inline h-4 w-4 mr-1" />
            Role *
          </label>
          <select
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a role</option>
            {roles
              .filter((role) => role.name.toLowerCase() !== 'client')
              .map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </option>
              ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

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
            App Permissions
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
                // Check if this app is already checked (from editing user) or default for new user
                const isChecked = editingUser 
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
                        {!editingUser && isDefault && <span className="ml-1 text-xs text-gray-500">(Default)</span>}
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
                ⚠️ User must have at least one app permission to access the system
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
              {editingUser ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingUser ? 'Update Employee' : 'Create Employee'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
