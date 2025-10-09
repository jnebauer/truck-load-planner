'use client';

import React from 'react';
import { Shield } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function AccessDenied({
  title = 'Access Denied',
  message = "You don't have permission to access this resource.",
  icon: Icon = Shield,
  className = '',
}: AccessDeniedProps) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <Icon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          {message}
        </p>
      </div>
    </div>
  );
}
