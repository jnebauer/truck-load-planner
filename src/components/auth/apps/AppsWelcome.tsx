import React from 'react';
import { App } from '@/hooks/auth/useApps';
import AppCard from './AppCard';

interface AppsWelcomeProps {
  userName?: string;
  apps: App[];
}

export default function AppsWelcome({ userName, apps }: AppsWelcomeProps) {
  return (
    <div className="text-center pt-4 sm:pt-6 lg:pt-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
        Welcome back,{' '}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {userName}
        </span>
        !
      </h2>
      <p className="text-gray-600 text-base sm:text-lg font-medium mb-6 sm:mb-8 px-4 sm:px-0">
        Select an application to continue your work and access powerful tools for your projects
      </p>

      {/* Apps Container */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

