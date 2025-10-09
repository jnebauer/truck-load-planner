'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Truck, Package } from 'lucide-react';
import { UI_TRANSLATIONS } from '@/lib/translations';
import { showToast } from '@/lib/toast';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });


  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
  
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        showToast.error('Login Failed', { description: 'Invalid email or password' });
      } else {
        showToast.success('Login Successful', { description: 'Login successful' });
        router.push('/dashboard');
      }
    } catch {
      const errorMsg = 'An error occurred during login';
      showToast.error('Login Error', { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <div className="bg-green-600 p-2 rounded-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Truck Loading & Storage Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`appearance-none block w-full px-3 py-2 border text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-none transform-none ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`appearance-none block w-full px-3 py-2 border text-black rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 transition-none transform-none ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ 
                    transition: 'none',
                    transform: 'none',
                    filter: 'none',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>


            {/* Forgot password */}
            <div className="flex justify-end">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {UI_TRANSLATIONS.LOGIN.FORGOT_PASSWORD}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? UI_TRANSLATIONS.LOGIN.SIGNING_IN : UI_TRANSLATIONS.LOGIN.SIGN_IN}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}