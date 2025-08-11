'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  User,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  TrendingUp,
  FileText,
  Bell,
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    { name: 'Profile', href: '/profile', icon: User, current: false },
    { name: 'History', href: '/dashboard/history', icon: History, current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col premium-card rounded-none lg:rounded-r-3xl border-l-0">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-secondary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center animate-glow">
                <Star className="w-6 h-6" style={{ color: 'var(--bg-primary)' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gold font-display">AI Interviewer</h1>
                <p className="text-xs text-secondary">Premium Edition</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden btn-ghost"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="px-6 py-6 border-b border-secondary">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: 'var(--bg-primary)' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-secondary truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                    item.current
                      ? 'bg-glass border border-accent text-gold'
                      : 'text-secondary hover:text-primary hover:bg-tertiary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                  {item.name === 'Analytics' && (
                    <span className="ml-auto badge-premium text-xs">New</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-6 border-t border-secondary">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 text-secondary hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 glass border-b border-primary">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden btn-ghost p-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 input-premium max-w-80">
                <Search className="w-4 h-4 text-tertiary" />
                <input
                  type="text"
                  placeholder="Search interviews, analytics..."
                  className="bg-transparent border-none outline-none text-primary placeholder:text-tertiary flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative btn-ghost p-2">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">2</span>
                </div>
              </button>

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: 'var(--bg-primary)' }}>
                    {user?.firstName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}