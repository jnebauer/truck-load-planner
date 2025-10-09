'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFilteredNavigation } from '@/lib/navigation';
import { User, ChevronDown, ChevronRight, LogOut } from 'lucide-react';

interface SidebarProps {
  user: {
    full_name: string | null;
    role: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { signOut, hasPermission } = useAuth();

  // Debug: Check what permissions user has
  console.log('🔍 Sidebar Debug - User:', user);
  console.log('🔍 Sidebar Debug - hasPermission("navigation.dashboard"):', hasPermission('navigation.dashboard'));
  console.log('🔍 Sidebar Debug - hasPermission("navigation.inventory"):', hasPermission('navigation.inventory'));

  // Get filtered navigation items based on user permissions
  const navigationItems = getFilteredNavigation(hasPermission);
  
  console.log('🔍 Sidebar Debug - Filtered navigation items:', navigationItems.map(item => item.name));
  
  // Force remove Dashboard if user doesn't have navigation.dashboard permission
  const filteredItems = navigationItems.filter(item => {
    if (item.id === 'dashboard') {
      const hasDashboardPermission = hasPermission('navigation.dashboard');
      console.log('🔍 Dashboard permission check:', hasDashboardPermission);
      return hasDashboardPermission;
    }
    return true;
  });
  
  console.log('🔍 Final filtered items:', filteredItems.map(item => item.name));

  const isActive = (href: string) => pathname.startsWith(href);

  const toggleSubmenu = (name: string | undefined) => {
    if (name) {
      setOpenMenu(openMenu === name ? null : name);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Truck Tracker</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = item.href ? isActive(item.href) : false;
          const isOpen = openMenu === item.name && item.submenu;

          return (
            <div key={item.id}>
              {item.href && !item.submenu ? (
                // Direct link for items without submenu
                <Link
                  href={''}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-gray-100 text-gray-900 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      active
                        ? 'text-gray-900'
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  {item.name}
                </Link>
              ) : (
                // Button for items with submenu or no href
                <button
                  onClick={() =>
                    toggleSubmenu(item.submenu ? item.name : undefined)
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-gray-100 text-gray-900 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        active
                          ? 'text-gray-900'
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.submenu &&
                    (isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    ))}
                </button>
              )}

              {/* Submenu */}
              {item.submenu && isOpen && (
                <div className="ml-10 mt-1 space-y-1">
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className={`flex items-center px-2 py-2 rounded-md text-sm ${
                          pathname === sub.href
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <SubIcon className="mr-2 h-4 w-4" />
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role || 'Role'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
