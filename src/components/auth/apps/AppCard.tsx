import React from 'react';
import {
  BarChart3,
  Truck,
  Package,
  Calculator,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { App } from '@/hooks/auth/useApps';
import { getAppUIMetadata } from './appMetadata';

const iconMap = {
  BarChart3,
  Truck,
  Package,
  Calculator,
};

interface AppCardProps {
  app: App;
}

export default function AppCard({ app }: AppCardProps) {
  const { getAccessToken } = useAuth();

  const uiMetadata = getAppUIMetadata(app.name);
  const IconComponent =
    iconMap[uiMetadata.icon as keyof typeof iconMap] || Package;

  const handleAppClick = () => {
    if (uiMetadata.isExternal) {
      const token = getAccessToken();

      if (!token) {
        alert('No access token available. Please login again.');
        return;
      }

      const urlWithToken = `${app.app_url}?access_token=${token}`;
      window.open(urlWithToken, '_blank');
    } else {
      window.location.href = app.app_url;
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 w-full sm:w-96 flex-shrink-0 border border-gray-100 hover:border-gray-200 hover:-translate-y-2">
      {/* App Icon */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 ${
          uiMetadata.color === 'blue'
            ? 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300'
            : uiMetadata.color === 'green'
            ? 'bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300'
            : uiMetadata.color === 'purple'
            ? 'bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300'
        }`}
      >
        <IconComponent
          className={`w-8 h-8 sm:w-10 sm:h-10 ${
            uiMetadata.color === 'blue'
              ? 'text-blue-600'
              : uiMetadata.color === 'green'
              ? 'text-green-600'
              : uiMetadata.color === 'purple'
              ? 'text-purple-600'
              : 'text-gray-600'
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
          className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
            uiMetadata.color === 'blue'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              : uiMetadata.color === 'green'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              : uiMetadata.color === 'purple'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
          }`}
        >
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />

          <span>Open App</span>
        </button>
      </div>
    </div>
  );
}
