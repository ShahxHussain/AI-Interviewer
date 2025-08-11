'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InterviewHistory } from '@/components/interview/InterviewHistory';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, User, Settings, FileText, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartInterview = () => {
    router.push('/interview');
  };

  const handleResumeSession = (sessionId: string) => {
    router.push(`/interview?resume=${sessionId}`);
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  return (
    <DashboardLayout>
      <div className="w-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-12 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 animate-glow" style={{ background: 'var(--gradient-primary)' }}>
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--bg-primary)' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h1 className="text-5xl mb-4 font-bold" style={{ 
              fontFamily: 'var(--font-display)', 
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome Back, {user?.firstName}
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Continue your journey to interview excellence with our AI-powered platform
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
            <div className="p-6 cursor-pointer rounded-lg border transition-all duration-300 hover:transform hover:scale-105" 
                 style={{ 
                   background: 'var(--bg-card)', 
                   backdropFilter: 'blur(20px)', 
                   border: '1px solid var(--border-primary)',
                   boxShadow: 'var(--shadow-premium)'
                 }} 
                 onClick={handleStartInterview}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full" style={{ background: 'var(--gradient-primary)' }}>
                  <Play className="h-6 w-6" style={{ color: 'var(--bg-primary)' }} />
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ 
                  background: 'rgba(212, 175, 55, 0.2)', 
                  color: 'var(--text-gold)', 
                  border: '1px solid var(--border-accent)' 
                }}>New</div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Start Interview</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Begin a new AI-powered interview session
              </p>
              <button className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:translateY(-2px)" 
                      style={{ 
                        background: 'var(--gradient-primary)', 
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-gold)'
                      }}>
                Start Now
              </button>
            </div>

            <div className="p-6 cursor-pointer rounded-lg border transition-all duration-300 hover:transform hover:scale-105" 
                 style={{ 
                   background: 'var(--bg-card)', 
                   backdropFilter: 'blur(20px)', 
                   border: '1px solid var(--border-primary)',
                   boxShadow: 'var(--shadow-premium)'
                 }} 
                 onClick={handleViewProfile}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Profile</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Update your profile and resume
              </p>
              <button className="w-full py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-300 hover:transform hover:translateY(-2px)" 
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--text-gold)',
                        borderColor: 'var(--border-accent)'
                      }}>
                View Profile
              </button>
            </div>

            <div className="p-6 cursor-pointer rounded-lg border transition-all duration-300 hover:transform hover:scale-105" 
                 style={{ 
                   background: 'var(--bg-card)', 
                   backdropFilter: 'blur(20px)', 
                   border: '1px solid var(--border-primary)',
                   boxShadow: 'var(--shadow-premium)'
                 }} 
                 onClick={() => router.push('/dashboard/history')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ 
                  background: 'rgba(212, 175, 55, 0.2)', 
                  color: 'var(--text-gold)', 
                  border: '1px solid var(--border-accent)' 
                }}>Analytics</div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>History & Analytics</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                View detailed interview history and performance trends
              </p>
              <button className="w-full py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-300 hover:transform hover:translateY(-2px)" 
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--text-gold)',
                        borderColor: 'var(--border-accent)'
                      }}>
                View History
              </button>
            </div>

            <div className="p-6 opacity-75 rounded-lg border" 
                 style={{ 
                   background: 'var(--bg-card)', 
                   backdropFilter: 'blur(20px)', 
                   border: '1px solid var(--border-primary)',
                   boxShadow: 'var(--shadow-premium)'
                 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ 
                  background: 'rgba(212, 175, 55, 0.2)', 
                  color: 'var(--text-gold)', 
                  border: '1px solid var(--border-accent)' 
                }}>Soon</div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Settings</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Configure your preferences
              </p>
              <button className="w-full py-3 px-6 rounded-lg font-semibold border-2 opacity-50" 
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--text-gold)',
                        borderColor: 'var(--border-accent)'
                      }} 
                      disabled>
                Coming Soon
              </button>
            </div>
          </div>

          {/* User Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-lg border" style={{ 
              background: 'var(--bg-card)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-primary)' }}>
                  <User className="h-5 w-5" style={{ color: 'var(--bg-primary)' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>User Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Role:</span>
                  <span className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{user?.role}</span>
                </div>
                {user?.role === 'recruiter' && user.companyName && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>Company:</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.companyName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-medium text-sm">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border" style={{ 
              background: 'var(--bg-card)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Interviews Completed:</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-gold)' }}>-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Average Score:</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-gold)' }}>-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Practice Time:</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-gold)' }}>-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Last Interview:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Never</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview History */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ 
                  fontFamily: 'var(--font-display)', 
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Interview History
                </h2>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Track your progress and review past interviews
                </p>
              </div>
              <button 
                onClick={handleStartInterview}
                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:translateY(-2px)"
                style={{ 
                  background: 'var(--gradient-primary)', 
                  color: 'var(--bg-primary)',
                  boxShadow: 'var(--shadow-gold)'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Start New Interview
              </button>
            </div>

            {/* No interviews message */}
            <div className="p-12 text-center rounded-lg border" style={{ 
              background: 'var(--bg-card)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ 
                background: 'rgba(212, 175, 55, 0.2)' 
              }}>
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-gold)' }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                No interviews yet
              </h3>
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Start your first interview to begin tracking your progress and unlock powerful analytics
              </p>
              <button 
                onClick={handleStartInterview}
                className="py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:translateY(-2px)"
                style={{ 
                  background: 'var(--gradient-primary)', 
                  color: 'var(--bg-primary)',
                  boxShadow: 'var(--shadow-gold)'
                }}
              >
                Start Your First Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
