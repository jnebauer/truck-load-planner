'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  blue: 'border-blue-600',
  gray: 'border-gray-600',
  white: 'border-white',
  green: 'border-green-600',
  red: 'border-red-600'
};

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  className = '',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen 
    ? 'flex items-center justify-center h-full w-full' 
    : 'flex items-center justify-center h-full w-full';
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} mx-auto`}></div>
        {text && (
          <p className="mt-2 text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
}
