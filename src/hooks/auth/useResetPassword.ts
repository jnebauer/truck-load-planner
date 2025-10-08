'use client';

import { useState, useCallback } from 'react';
import { showToast } from '@/lib/toast';

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  error: Error | null;
  message: string;
}

interface VerifyTokenResponse {
  error: Error | null;
  valid: boolean;
  email?: string;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
        return { error: new Error('Invalid response from server'), valid: false };
      }

      if (!response.ok) {
        const errorMessage = result.error || 'Invalid or expired reset token';
        return { error: new Error(errorMessage), valid: false };
      }

      return { 
        error: null, 
        valid: result.success || false, 
        email: result.email 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify reset token';
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
        const errorMessage = 'Invalid response from server';
        showToast.error('Password Reset Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to reset password';
        showToast.error('Password Reset Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      showToast.success('Password Reset Successfully', {
        description: result.message || 'Your password has been updated successfully.'
      });

      return { error: null, message: result.message || 'Password reset successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast.error('Password Reset Failed', {
        description: errorMessage
      });
      return { error: new Error(errorMessage), message: '' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    verifying,
    verifyResetToken,
    resetPassword
  };
};
