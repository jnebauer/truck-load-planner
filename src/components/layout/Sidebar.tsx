'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  Truck, 
  FileText, 
  Upload, 
  Building2, 
  Users, 
  Settings,
  Search,
  Bell,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  user: {
    full_name: string | null;
    role: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Truck Planner', href: '/truck-planner', icon: Truck },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Import', href: '/import', icon: Upload },
    { name: 'Clients', href: '/clients', icon: Building2 },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      submenu: [
        { name: 'Roles', href: '/users/roles' },
        { name: 'Permissions', href: '/users/permissions' },
        { name: 'Users', href: '/users/list' },
      ],
    },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const toggleSubmenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Truck Tracker</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isOpen = openMenu === item.name;

            return (
              <div key={item.name}>
                <button
                  onClick={() =>
                    item.submenu ? toggleSubmenu(item.name) : null
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
                        active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.submenu && (
                    isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && isOpen && (
                  <div className="ml-10 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`block px-2 py-2 rounded-md text-sm ${
                          pathname === sub.href
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="text-center text-gray-500">
            <p>Page content will be rendered here</p>
          </div>
        </main>
      </div>
    </div>
  );
}
