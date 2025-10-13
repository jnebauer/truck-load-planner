'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: DrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Allow body scroll when drawer is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden height-100">
      {/* Backdrop with smooth animation */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Drawer with smooth slide animation */}
      <div className="fixed right-0 top-0 h-full w-full max-w-full">
        <div className={`h-full bg-white shadow-xl ${sizeClasses[size]} ml-auto transform transition-transform duration-300 ease-in-out flex flex-col ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleBackdropClick}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
