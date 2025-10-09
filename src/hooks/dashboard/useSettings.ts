'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES, TOAST_DESCRIPTIONS, VALIDATION_MESSAGES } from '@/constants';
import { z } from 'zod';

// Change Password Schema
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED),
  newPassword: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
});

// Profile Update Schema
const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.NAME_MAX_LENGTH),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export const useSettings = () => {
  const { user, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileUpdate = useCallback(async (data: ProfileUpdateData) => {
    try {
      setLoading(true);
      
      const response = await authenticatedFetch(`/api/dashboard/users/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(TOAST_MESSAGES.SUCCESS.USER_UPDATED, {
          description: TOAST_DESCRIPTIONS.SUCCESS.USER_UPDATED(data.fullName)
        });
      } else {
        showToast.error(TOAST_MESSAGES.ERROR.USER_UPDATE_FAILED, {
          description: result.error || TOAST_DESCRIPTIONS.ERROR.USER_UPDATE_FAILED
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
        description: TOAST_DESCRIPTIONS.ERROR.NETWORK_ERROR
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, authenticatedFetch]);

  const handlePasswordChange = useCallback(async (data: ChangePasswordData) => {
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
        showToast.success('Password Changed Successfully', {
          description: 'Your password has been updated successfully.'
        });
        passwordForm.reset();
      } else {
        showToast.error('Failed to Change Password', {
          description: result.error || 'Please check your current password and try again.'
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
        description: TOAST_DESCRIPTIONS.ERROR.NETWORK_ERROR
      });
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
