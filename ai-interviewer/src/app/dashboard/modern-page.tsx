'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ModernDashboardLayout } from '@/components/layout/ModernDashboardLayout';
import { 
  Play, 
  User, 
  Settings, 
  FileText, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  Award,
  BookOpen,
  Zap,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ModernDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartInterview = () => {
    router.push('/interview');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const stats = [
    {
      name: 'Interviews Completed',
      value: '12',
      change: '+2 this week',
      changeType: 'positive',
      icon: Target,
      color: 'var(--success)'
    },
    {
      name: 'Average Score',
      value: '8.4',
      change: '+0.3 from last month',
      changeType: 'positive',
      icon: Award,
      color: 'var(--primary)'
    },
    {
      name: 'Practice Time',
      value: '24h',
      change: '+4h this week',
      changeType: 'positive',
      icon: Clock,
      color: 'var(--accent)'
    },
    {
      name: 'Skills Improved',
      value: '8',
      change: '+2 new skills',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'var(--success)'
    }
  ];

  const quickActions = [
    {
      name: 'Start Interview',
      description: 'Begin a new AI-powered interview session',
      icon: Play,
      color: 'var(--primary)',
      action: handleStartInterview,
      primary: true
    },
    {
      name: 'Update Profile',
      description: 'Manage your profile and resume',
      icon: User,
      color: 'var(--secondary)',
      action: handleViewProfile,
      primary: false
    },
    {
      name: 'View History',
      description: 'Review past interviews and progress',
      icon: FileText,
      color: 'var(--accent)',
      action: () => router.push('/dashboard/history'),
      primary: false
    },
    {
      name: 'Analytics',
      description: 'Detailed performance insights',
      icon: BarChart3,
      color: 'var(--success)',
      action: () => router.push('/dashboard/analytics'),
      primary: false,
      badge: 'New'
    }
  ];

  const recentActivity = [
    {
      type: 'interview',
      title: 'Technical Interview - Software Engineer',
      time: '2 hours ago',
      score: 8.5,
      status: 'completed'
    },
    {
      type: 'profile',
      title: 'Updated resume with new project',
      time: '1 day ago',
      status: 'updated'
    },
    {
      type: 'interview',
      title: 'Behavioral Interview - Product Manager',
      time: '3 days ago',
      score: 7.8,
      status: 'completed'
    }
  ];

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                Ready to ace your next interview? Let's continue your journey to success.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={handleStartInterview}
                className="dashboard-button-primary"
              >
                <Play className="w-4 h-4" />
                Start Interview
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
          {stats.map((stat, index) => (
            <div key={stat.name} className="dashboard-stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                  <p className="text-sm mt-1" style={{ color: stat.color }}>
                    {stat.change}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={action.name}
                className="dashboard-card p-6 cursor-pointer group"
                onClick={action.action}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  {action.badge && (
                    <span className="dashboard-badge dashboard-badge-primary">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {action.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {action.description}
                </p>
                <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: action.color }}>
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Recent Activity */}
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Activity
              </h2>
              <button className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary)20' }}
                  >
                    {activity.type === 'interview' ? (
                      <Play className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    ) : (
                      <User className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {activity.time}
                      </p>
                      {activity.score && (
                        <span className="dashboard-badge dashboard-badge-success">
                          Score: {activity.score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Your Progress
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Interview Skills
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    85%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: '85%',
                      background: 'var(--gradient-primary)'
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Communication
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    78%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: '78%',
                      background: 'var(--gradient-success)'
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Technical Knowledge
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    92%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: '92%',
                      background: 'var(--gradient-warning)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--success)20' }}
                >
                  <Zap className="w-4 h-4" style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Keep it up!
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    You're improving faster than 80% of users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="dashboard-card p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Interview Library</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Practice with real questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--success)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Mock Interviews</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Schedule with experts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Award className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Certifications</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Earn skill badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}