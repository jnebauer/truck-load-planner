'use client';

import { Eye, EyeOff, Lock, User, Mail, Save, AlertCircle } from 'lucide-react';
import { useSettings } from '@/hooks/dashboard/useSettings';
import { PhoneInput } from '@/components/common';

export default function SettingsPage() {
  const {
    user,
    activeTab,
    setActiveTab,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    profileForm,
    passwordForm,
    handleProfileUpdate,
    handlePasswordChange,
  } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
                activeTab === 'password'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-600">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none capitalize"
                  />
                  <p className="text-xs text-gray-500 mt-1">Role is managed by administrators</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...profileForm.register('fullName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter your full name"
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <PhoneInput
                  label="Phone Number"
                  value={profileForm.watch('phone') || ''}
                  onChange={(value) => profileForm.setValue('phone', value || '')}
                  placeholder="Enter your phone number"
                  error={profileForm.formState.errors.phone?.message}
                />

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="max-w-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
              </div>

              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                {/* Password Requirements Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements</h3>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains uppercase and lowercase letters</li>
                        <li>• Contains at least one number</li>
                        <li>• Contains at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}