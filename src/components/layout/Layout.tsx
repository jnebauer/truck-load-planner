'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children || (
            <div className="text-center text-gray-500">
              <p>Page content will be rendered here</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}