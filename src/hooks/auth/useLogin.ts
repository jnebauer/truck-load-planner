'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

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

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = useCallback(async (data: LoginData): Promise<LoginResponse> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
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
        showToast.error('Login Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage) };
      }

      if (!response.ok) {
        const errorMessage = result.error || 'Login failed';
        showToast.error('Login Failed', {
          description: errorMessage
        });
        return { error: new Error(errorMessage) };
      }

      // Store tokens
      if (result.tokens) {
        if (data.rememberMe) {
          localStorage.setItem('trucker_tokens', JSON.stringify(result.tokens));
        } else {
          sessionStorage.setItem('trucker_tokens', JSON.stringify(result.tokens));
        }
      }

      showToast.success('Login Successful', {
        description: `Welcome back, ${result.user?.full_name || result.user?.email}!`
      });

      // Redirect based on role
      const redirectPath = '/dashboard';
      router.push(redirectPath);

      return { error: null, user: result.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast.error('Login Failed', {
        description: errorMessage
      });
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    loading,
    signIn
  };
};
