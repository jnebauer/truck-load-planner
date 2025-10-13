'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Truck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          </div>
          <div className="relative">
            <Truck className="w-24 h-24 mx-auto text-blue-600 mb-4 animate-bounce" />
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-2">
              404
            </h1>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <p className="text-sm text-gray-500">
            Don&apos;t worry, even the best drivers take a wrong turn sometimes!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-sm text-gray-400">
          Error Code: 404 | Page Not Found
        </p>
      </div>
    </div>
  );
}
