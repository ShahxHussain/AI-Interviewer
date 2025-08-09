'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  User,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Building,
  PlayCircle,
  BarChart3,
  Users,
  Menu,
  X,
} from 'lucide-react';

interface NavigationProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Navigation({
  isMobileMenuOpen = false,
  onMobileMenuToggle,
}: NavigationProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const candidateNavItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and quick actions',
    },
    {
      href: '/interview',
      label: 'Start Interview',
      icon: PlayCircle,
      description: 'Begin a new mock interview',
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your profile and resume',
    },
    {
      href: '/jobs',
      label: 'Job Board',
      icon: Briefcase,
      description: 'Browse available positions',
    },
    {
      href: '/history',
      label: 'Interview History',
      icon: FileText,
      description: 'View past interview sessions',
    },
  ];

  const recruiterNavItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and analytics',
    },
    {
      href: '/profile',
      label: 'Company Profile',
      icon: Building,
      description: 'Manage company information',
    },
    {
      href: '/jobs/manage',
      label: 'Manage Jobs',
      icon: Briefcase,
      description: 'Create and manage job postings',
    },
    {
      href: '/candidates',
      label: 'Candidates',
      icon: Users,
      description: 'View candidate applications',
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: BarChart3,
      description: 'Interview reports and analytics',
    },
  ];

  const navItems =
    user.role === 'candidate' ? candidateNavItems : recruiterNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavigationContent = () => (
    <>
      {/* Logo and Brand */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Interviewer</span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Role Badge */}
      <div className="px-6 mb-6">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user.role === 'candidate'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {user.role === 'candidate' ? 'Candidate' : 'Recruiter'}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="px-6 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileMenuToggle}
              className={`group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{item.label}</span>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
              {active && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Settings Section */}
      <div className="mt-8 px-6">
        <div className="border-t border-gray-200 pt-6 space-y-2">
          <Link
            href="/settings"
            onClick={onMobileMenuToggle}
            className={`group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings
              className={`h-5 w-5 transition-colors ${
                isActive('/settings')
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
            <span className="font-medium text-sm">Settings</span>
          </Link>

          {/* Development/Testing Links */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              Testing
            </p>

            <Link
              href="/test-voice"
              onClick={onMobileMenuToggle}
              className="group flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
            >
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm">Voice & Video</span>
            </Link>

            <Link
              href="/test-facial-analysis"
              onClick={onMobileMenuToggle}
              className="group flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Facial Analysis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role === 'recruiter' ? user.companyName : user.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onMobileMenuToggle?.();
            logout();
          }}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-600" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white shadow-sm border-r border-gray-200 w-72 min-h-screen flex-col">
        <NavigationContent />
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onMobileMenuToggle}
          />

          {/* Navigation Panel */}
          <nav className="relative bg-white w-80 max-w-sm min-h-screen flex flex-col shadow-xl">
            <NavigationContent />
          </nav>
        </div>
      )}
    </>
  );
}
