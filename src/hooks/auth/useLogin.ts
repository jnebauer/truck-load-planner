// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { TOAST_MESSAGES } from '@/lib/backend/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * Login request data
 */
interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response data
 */
interface LoginResponse {
  error: Error | null;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    status: string;
  };
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for handling user login functionality
 * Manages authentication, form state, and navigation after login
 * @returns Object with loading state, form handlers, and sign-in function
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn: authSignIn } = useAuth();
  const router = useRouter();

  // Form setup
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signIn = useCallback(async (data: LoginData): Promise<LoginResponse> => {
    try {
      setLoading(true);
      
      const { error } = await authSignIn(data.email, data.password, data.rememberMe || false);
      
      if (error) {
        // Use the specific error message from the API
        const errorMessage = error.message || TOAST_MESSAGES.ERROR.INVALID_CREDENTIALS;
        
        showToast.error(errorMessage);
        return { error };
      }

      // showToast.success(TOAST_MESSAGES.SUCCESS.LOGIN_SUCCESS);

      // Redirect to apps dashboard instead of regular dashboard
      router.push('/apps');

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.SERVER_ERROR;
      showToast.error(errorMessage);
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  }, [authSignIn, router]);

  // Handle form submission
  const handleSubmit = useCallback(async (data: LoginFormData) => {
    await signIn({
      email: data.email,
      password: data.password,
      rememberMe: false, // You can add remember me checkbox if needed
    });
  }, [signIn]);

  return {
    loading,
    signIn,
    form,
    handleSubmit,
    showPassword,
    setShowPassword
  };
};
