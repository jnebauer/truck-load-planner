// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '@/lib/toast';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { TOAST_MESSAGES } from '@/lib/backend/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Request data for password reset
 */
interface ForgotPasswordData {
  email: string;
}

/**
 * Response from password reset request
 */
interface ForgotPasswordResponse {
  error: Error | null;
  message: string;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for handling forgot password functionality
 * Manages password reset request flow and email sending
 * @returns Object with loading state, success state, form handlers, and reset request function
 */
export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Form setup
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const requestPasswordReset = useCallback(async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        const errorMessage = TOAST_MESSAGES.ERROR.NETWORK_ERROR;
        showToast.error(errorMessage);
        return { error: new Error(errorMessage), message: '' };
      }

      if (!response.ok) {
        // Use the specific error message from the API
        const errorMessage = result.error || TOAST_MESSAGES.ERROR.NETWORK_ERROR;
        
        showToast.error(errorMessage);
        return { error: new Error(errorMessage), message: '' };
      }

      showToast.success(TOAST_MESSAGES.SUCCESS.EMAIL_SENT);

      setSuccess(true);
      setMessage(result.message || 'Reset email sent successfully');

      return { error: null, message: result.message || 'Reset email sent successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.SERVER_ERROR;
      showToast.error(errorMessage);
      return { error: new Error(errorMessage), message: '' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    setSuccess(false);
    setMessage('');

    const { error, message } = await requestPasswordReset({ email: data.email });
    if (!error) {
      setSuccess(true);
      setMessage(message);
    }
  }, [requestPasswordReset]);

  return {
    loading,
    success,
    message,
    form,
    handleSubmit,
    requestPasswordReset
  };
};
