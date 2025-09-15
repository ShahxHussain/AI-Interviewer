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
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect recruiters to their specific dashboard
  React.useEffect(() => {
    if (user && user.role === 'recruiter') {
      router.push('/recruiter/dashboard');
    }
  }, [user, router]);

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
      <div className="luxury-container min-h-screen p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold luxury-text-gold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-lg luxury-text-secondary">
                Ready to ace your next interview? Let's continue your journey to success.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={handleStartInterview}
                className="luxury-button-primary flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Interview
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={stat.name} className="luxury-card p-6 hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium luxury-text-secondary">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold mt-1 luxury-text-gold">
                    {stat.value}
                  </p>
                  <p className="text-sm mt-1 luxury-text-accent">
                    {stat.change}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30">
                  <stat.icon className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold luxury-text-gold mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={action.name}
                className="luxury-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300"
                onClick={action.action}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 group-hover:scale-110 transition-transform">
                    <action.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  {action.badge && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold mb-2 luxury-text-primary text-lg">
                  {action.name}
                </h3>
                <p className="text-sm mb-4 luxury-text-secondary">
                  {action.description}
                </p>
                <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform luxury-text-gold">
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold luxury-text-gold">
                Recent Activity
              </h2>
              <button className="text-sm font-medium luxury-text-gold hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30">
                    {activity.type === 'interview' ? (
                      <Play className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <User className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold luxury-text-primary">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm luxury-text-secondary">
                        {activity.time}
                      </p>
                      {activity.score && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white">
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
          <div className="luxury-card p-6">
            <h2 className="text-xl font-bold luxury-text-gold mb-6">
              Your Progress
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium luxury-text-secondary">
                    Interview Skills
                  </span>
                  <span className="text-sm font-bold luxury-text-gold">
                    85%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-400 to-yellow-600"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium luxury-text-secondary">
                    Communication
                  </span>
                  <span className="text-sm font-bold luxury-text-gold">
                    78%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: '78%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium luxury-text-secondary">
                    Technical Knowledge
                  </span>
                  <span className="text-sm font-bold luxury-text-gold">
                    92%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{ width: '92%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-400/30">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold luxury-text-primary">
                    Keep it up!
                  </p>
                  <p className="text-sm luxury-text-secondary">
                    You're improving faster than 80% of users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="luxury-card p-6">
          <h2 className="text-xl font-bold luxury-text-gold mb-4">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
              <BookOpen className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="font-semibold luxury-text-primary">Interview Library</p>
                <p className="text-sm luxury-text-secondary">Practice with real questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-400/5 to-green-600/5 border border-green-400/20 hover:border-green-400/40 transition-all duration-300">
              <Calendar className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold luxury-text-primary">Mock Interviews</p>
                <p className="text-sm luxury-text-secondary">Schedule with experts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-400/5 to-blue-600/5 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
              <Award className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-semibold luxury-text-primary">Certifications</p>
                <p className="text-sm luxury-text-secondary">Earn skill badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}
