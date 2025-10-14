'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AppsHeader from '@/components/auth/apps/AppsHeader';
import AppsWelcome from '@/components/auth/apps/AppsWelcome';
import AppsFooter from '@/components/auth/apps/AppsFooter';
import { App } from '@/hooks/auth/useApps';

export default function AppsPage() {
  const { user, loading: authLoading, signOut, authenticatedFetch } = useAuth();
  const router = useRouter();

  const [apps, setApps] = useState<App[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch apps only after auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      const fetchApps = async () => {
        try {
          setAppsLoading(true);
          setError(null);

          const response = await authenticatedFetch('/api/user/apps');

          if (!response.ok) {
            throw new Error(
              `Failed to fetch user apps: ${response.statusText}`
            );
          }

          const data = await response.json();
          setApps(data.apps || []);
        } catch (err) {
          console.error('Error fetching user apps:', err);
          setError(
            err instanceof Error ? err.message : 'Failed to fetch user apps'
          );
        } finally {
          setAppsLoading(false);
        }
      };

      fetchApps();
    } else if (!authLoading && !user) {
      // Auth loaded but no user, redirect to login
      router.push('/login');
    }
  }, [authLoading, user, authenticatedFetch, router]);

  const loading = authLoading || appsLoading;

  useEffect(() => {
    // Redirect to dashboard if user has no apps (after loading completes)
    if (!loading && user && !error && apps.length === 0) {
      router.push('/dashboard');
    }
  }, [loading, user, apps.length, error, router]);

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
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Failed to load applications
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppsHeader onBackToLogin={handleBackToLogin} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AppsWelcome userName={user?.full_name || user?.email} apps={apps} />
      </div>

      <AppsFooter />
    </div>
  );
}
