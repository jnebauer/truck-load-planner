'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserApps } from '@/hooks/auth/useApps';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppsHeader from '@/components/auth/apps/AppsHeader';
import AppsWelcome from '@/components/auth/apps/AppsWelcome';
import AppsFooter from '@/components/auth/apps/AppsFooter';

export default function AppsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const { apps: accessibleApps, loading: appsLoading, error } = useUserApps();
  const loading = authLoading || appsLoading;

  useEffect(() => {
    if (!loading && user && accessibleApps.length === 0) {
      router.push('/dashboard');
    }
  }, [loading, user, accessibleApps.length, router]);

  const handleBackToLogin = () => router.push('/login');
  const handleLogout = async () => await signOut();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" text="Loading apps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Failed to load applications
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppsHeader onBackToLogin={handleBackToLogin} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AppsWelcome
          userName={user?.full_name || user?.email}
          apps={accessibleApps}
        />
      </div>

      <AppsFooter />
    </div>
  );
}
