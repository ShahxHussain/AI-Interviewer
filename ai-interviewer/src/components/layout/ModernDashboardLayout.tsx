'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  BarChart3,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function ModernDashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, badge: 'New' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const isCurrentPath = (href: string) => pathname === href;

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      margin: '0',
      padding: '0'
    }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            zIndex: '40',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: sidebarOpen ? 'block' : 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '256px',
          height: '100vh',
          zIndex: '50',
          transform: 'translateX(0)', // Always visible on desktop
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-light)'
        }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            height: '64px', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0 24px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--gradient-primary)'
              }}>
                <Zap style={{ width: '20px', height: '20px', color: 'var(--text-white)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>AI Interviewer</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ 
                padding: '8px', 
                borderRadius: '6px', 
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'none'
              }}
              className="lg:hidden"
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* User Profile */}
          <div style={{ 
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--gradient-primary)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-white)' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
              <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: '1', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPath(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: current ? 'var(--primary)' : 'transparent',
                    color: current ? 'var(--text-white)' : 'var(--text-secondary)'
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px' }} />
                  {item.name}
                  {item.badge && (
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--primary)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: 'var(--error)'
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ 
        flex: '1',
        marginLeft: '256px', // Always 256px margin to account for sidebar
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Top bar */}
        <header style={{ 
          position: 'sticky',
          top: '0',
          zIndex: '30',
          height: '64px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{ 
            display: 'flex', 
            height: '64px', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'none'
                }}
                className="lg:hidden"
              >
                <Menu style={{ width: '20px', height: '20px' }} />
              </button>
              
              {/* Search */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)',
                minWidth: '320px'
              }} className="hidden md:flex">
                <Search style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search interviews, analytics..."
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    flex: '1',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Dark mode toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {darkMode ? <Sun style={{ width: '20px', height: '20px' }} /> : <Moon style={{ width: '20px', height: '20px' }} />}
              </button>

              {/* Notifications */}
              <button style={{ 
                position: 'relative', 
                padding: '8px', 
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                <Bell style={{ width: '20px', height: '20px' }} />
                <div style={{ 
                  position: 'absolute', 
                  top: '-4px', 
                  right: '-4px', 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'var(--error)'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-white)' }}>2</span>
                </div>
              </button>

              {/* User menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--gradient-primary)'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-white)' }}>
                    {user?.firstName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - STARTS IMMEDIATELY AFTER HEADER */}
        <main style={{ 
          flex: '1',
          padding: '0',
          margin: '0'
        }}>
          <div style={{ 
            padding: '24px',
            margin: '0'
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}