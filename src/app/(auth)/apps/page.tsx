'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleApps, AppConfig } from '@/components/apps/AppsConfig';
import {
  BarChart3,
  Truck,
  ExternalLink,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Icon mapping
const iconMap = {
  BarChart3,
  Truck,
};

// App Card Component
function AppCard({ app }: { app: AppConfig }) {
  const { getAccessToken } = useAuth();

  const handleAppClick = () => {
    if (app.isExternal) {
      // For external apps, add token to URL
      const token = getAccessToken();

      if (!token) {
        alert('No access token available. Please login again.');
        return;
      }

      const urlWithToken = `${app.url}?access_token=${token}`;

      window.open(urlWithToken, '_blank');
    } else {
      // Navigate to internal route
      window.location.href = app.url;
    }
  };

  const IconComponent = iconMap[app.icon as keyof typeof iconMap];

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 w-full sm:w-96 flex-shrink-0 border border-gray-100 hover:border-gray-200 hover:-translate-y-2">
      {/* App Icon */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 ${
          app.color === 'blue'
            ? 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300'
            : 'bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300'
        }`}
      >
        <IconComponent
          className={`w-8 h-8 sm:w-10 sm:h-10 ${
            app.color === 'blue' ? 'text-blue-600' : 'text-green-600'
          }`}
        />
      </div>

      {/* App Name */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors">
        {app.name}
      </h3>

      {/* App Description */}
      <p className="text-xs sm:text-sm text-gray-600 text-center mb-4 sm:mb-6 leading-relaxed">
        {app.description}
      </p>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={handleAppClick}
          className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
            app.isExternal
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {app.isExternal ? (
            <>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span>Open App</span>
            </>
          ) : (
            <>
              <span>Launch App</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main Apps Page Component
export default function AppsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Get user's accessible apps
  const accessibleApps = getAccessibleApps(user?.accessibleApps || []);

  // Auto-redirect to dashboard if no apps available
  useEffect(() => {
    if (!loading && user && accessibleApps.length === 0) {
      router.push('/dashboard');
    }
  }, [loading, user, accessibleApps.length, router]);

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" text="Loading apps..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Left side - Back button */}
            <button
              onClick={handleBackToLogin}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="font-medium hidden sm:inline">
                Back to Login
              </span>
              <span className="font-medium sm:hidden">Back</span>
            </button>

            {/* Center - Title */}
            <div className="text-center">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Application Hub
              </h1>
            </div>

            {/* Right side - Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="font-medium hidden sm:inline">Logout</span>
              <span className="font-medium sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Message and Apps */}
        <div className="text-center pt-4 sm:pt-6 lg:pt-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {user?.full_name || user?.email}
            </span>
            !
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-medium mb-6 sm:mb-8 px-4 sm:px-0">
            Select an application to continue your work and access powerful
            tools for your projects
          </p>

          {/* Apps Container - Below text */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
            {accessibleApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info - Bottom */}
      <div className="bg-white border-t py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Secure Connection</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
