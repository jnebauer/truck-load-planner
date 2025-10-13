// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '@/lib/toast';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { TOAST_MESSAGES } from '@/lib/backend/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Request data for password reset
 */
interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * Response from password reset request
 */
interface ResetPasswordResponse {
  error: Error | null;
  message: string;
}

/**
 * Response from token verification
 */
interface VerifyTokenResponse {
  error: Error | null;
  valid: boolean;
  email?: string;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for handling password reset functionality
 * Manages token verification and password reset flow
 * @returns Object with loading states, form handlers, token verification, and password reset function
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();

  // Form setup
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const verifyResetToken = useCallback(async (token: string): Promise<VerifyTokenResponse> => {
    try {
      setVerifying(true);
      
      const response = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return { error: new Error(TOAST_MESSAGES.ERROR.NETWORK_ERROR), valid: false };
      }

      if (!response.ok) {
        const errorMessage = result.error || TOAST_MESSAGES.ERROR.UNAUTHORIZED;
        return { error: new Error(errorMessage), valid: false };
      }

      return { 
        error: null, 
        valid: result.success || false, 
        email: result.email 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.SERVER_ERROR;
      return { error: new Error(errorMessage), valid: false };
    } finally {
      setVerifying(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/reset-password', {
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
        showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      if (!response.ok) {
        const errorMessage = result.error || TOAST_MESSAGES.ERROR.NETWORK_ERROR;
        showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      showToast.success(TOAST_MESSAGES.SUCCESS.PASSWORD_RESET, {
        description: result.message || 'Your password has been updated successfully.'
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

      return { error: null, message: result.message || 'Password reset successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.SERVER_ERROR;
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR, {
        description: errorMessage
      });
      return { error: new Error(errorMessage), message: '' };
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initialize token from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      
      if (!tokenParam) {
        setError(TOAST_MESSAGES.ERROR.NOT_FOUND);
        return;
      }

      setToken(tokenParam);

      // Verify token
      const verifyToken = async () => {
        const { error, valid, email } = await verifyResetToken(tokenParam);
        if (error || !valid) {
          setError(error?.message || TOAST_MESSAGES.ERROR.UNAUTHORIZED);
        } else {
          setUserEmail(email || '');
        }
      };

      verifyToken();
    }
  }, [verifyResetToken]);

  // Handle form submission
  const handleSubmit = useCallback(async (data: ResetPasswordFormData) => {
    setError('');

    try {
      const { error } = await resetPassword({ token, password: data.password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(TOAST_MESSAGES.ERROR.SERVER_ERROR);
    }
  }, [resetPassword, token]);

  return {
    loading,
    verifying,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    success,
    userEmail,
    token,
    form,
    handleSubmit,
    verifyResetToken,
    resetPassword
  };
};
