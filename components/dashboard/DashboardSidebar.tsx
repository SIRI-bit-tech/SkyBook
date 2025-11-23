'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/lib/auth';
import { Plane, User as UserIcon, History } from 'lucide-react';

interface DashboardSidebarProps {
  user: User | null;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'My Bookings',
      href: '/bookings',
      icon: Plane,
      active: pathname === '/bookings',
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      active: pathname === '/dashboard/profile',
    },
    {
      label: 'Check-in',
      href: '/dashboard/check-in',
      icon: Plane,
      active: pathname === '/dashboard/check-in',
    },
    {
      label: 'Travel History',
      href: '/dashboard/history',
      icon: History,
      active: pathname === '/dashboard/history',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      {/* User Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-semibold text-lg">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || 'User'}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-[#E8EEF5] text-[#1E3A5F] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
