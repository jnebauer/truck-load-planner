import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

interface AppsHeaderProps {
  onBackToLogin: () => void;
  onLogout: () => void;
}

export default function AppsHeader({ onBackToLogin, onLogout }: AppsHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Left side - Back button */}
          <button
            onClick={onBackToLogin}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="font-medium hidden sm:inline">Back to Login</span>
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
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="font-medium hidden sm:inline">Logout</span>
            <span className="font-medium sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

