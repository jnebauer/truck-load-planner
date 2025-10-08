'use client';

import { useState, useCallback } from 'react';
import { showToast } from '@/lib/toast';

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  error: Error | null;
  message: string;
}

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);

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
        const errorMessage = 'Invalid response from server';
        showToast.error('Password Reset Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to send reset email';
        showToast.error('Password Reset Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage), message: '' };
      }

      showToast.success('Reset Email Sent', {
        description: result.message || 'Please check your email for reset instructions.'
      });

      return { error: null, message: result.message || 'Reset email sent successfully' };
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
    requestPasswordReset
  };
};
