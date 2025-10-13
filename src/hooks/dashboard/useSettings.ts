// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/backend/constants';
import { changePasswordSchema, profileUpdateSchema, ChangePasswordFormData, ProfileUpdateFormData } from '@/lib/validations';

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing user settings (profile and password)
 * Handles profile updates and password changes for authenticated users
 * @returns Object with form states, handlers, and user data
 */
export const useSettings = () => {
  const { user, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Fetch latest user data and update form
  const fetchLatestUserData = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/user/profile');
      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          profileForm.setValue('fullName', result.user.full_name || '');
          profileForm.setValue('phone', result.user.phone || '');
        }
      }
    } catch (error) {
      console.error('Error fetching latest user data:', error);
    }
  }, [authenticatedFetch, profileForm]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.setValue('fullName', user.full_name || '');
      profileForm.setValue('phone', user.phone || '');
    }
  }, [user, profileForm]);

  // Fetch latest data on component mount
  useEffect(() => {
    fetchLatestUserData();
  }, [fetchLatestUserData]);

  const handleProfileUpdate = useCallback(async (data: ProfileUpdateFormData) => {
    try {
      setLoading(true);
      
      const response = await authenticatedFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(TOAST_MESSAGES.SUCCESS.PROFILE_UPDATED);
        
        // Update form with the latest data from API response
        if (result.user) {
          profileForm.setValue('fullName', result.user.full_name || '');
          profileForm.setValue('phone', result.user.phone || '');
        }
      } else {
        showToast.error(result.error || TOAST_MESSAGES.ERROR.USER_UPDATE_FAILED);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, profileForm]);

  const handlePasswordChange = useCallback(async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);
      
      const response = await authenticatedFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(TOAST_MESSAGES.SUCCESS.PASSWORD_CHANGED);
        passwordForm.reset();
      } else {
        showToast.error(result.error || TOAST_MESSAGES.ERROR.PASSWORD_CHANGE_FAILED);
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, passwordForm]);

  return {
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
  };
};
