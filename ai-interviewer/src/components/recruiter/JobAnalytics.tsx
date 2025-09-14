'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Calendar, 
  Target,
  BarChart3,
  PieChart,
  CheckCircle
} from 'lucide-react';

interface JobAnalyticsProps {
  recruiterId: string;
}

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  totalHires: number;
  averageApplicationsPerJob: number;
  conversionRate: number; // views to applications
  hireRate: number; // applications to hires
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    hires: number;
    status: string;
    createdAt: Date;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
    views: number;
  }>;
  skillDemand: Array<{
    skill: string;
    jobCount: number;
    applicationCount: number;
  }>;
  statusDistribution: {
    applied: number;
    'interview-scheduled': number;
    'interview-completed': number;
    rejected: number;
    hired: number;
  };
  jobStatusDistribution: {
    draft: number;
    active: number;
    paused: number;
    closed: number;
  };
  timeRange: number;
}

export default function JobAnalytics({ recruiterId }: JobAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [recruiterId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/recruiter/${recruiterId}?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
          <p>Create some job postings to see analytics data.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Job Analytics</h2>
          <p className="text-gray-600">Track your job posting performance</p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalJobs)}</p>
              <p className="text-xs text-gray-500">{analytics.activeJobs} active</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalApplications)}</p>
              <p className="text-xs text-gray-500">Avg: {analytics.averageApplicationsPerJob.toFixed(1)}/job</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</p>
              <p className="text-xs text-gray-500">{formatPercentage(analytics.conversionRate)} conversion</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hires</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalHires)}</p>
              <p className="text-xs text-gray-500">{formatPercentage(analytics.hireRate)} hire rate</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">
                {analytics.totalViews > 0 ? formatPercentage(analytics.totalHires / analytics.totalViews) : '0%'}
              </p>
              <p className="text-xs text-gray-500">Views to hires</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Jobs</h3>
        <div className="space-y-3">
          {analytics.topPerformingJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{job.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{job.applications} applications</span>
                  <span>{job.views} views</span>
                  <span>{job.hires} hires</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {job.applications > 0 ? formatPercentage(job.hires / job.applications) : '0%'} hire rate
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Application Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const percentage = analytics.totalApplications > 0 ? (count / analytics.totalApplications) * 100 : 0;
              const statusColors = {
                applied: 'bg-blue-500',
                'interview-scheduled': 'bg-yellow-500',
                'interview-completed': 'bg-purple-500',
                rejected: 'bg-red-500',
                hired: 'bg-green-500',
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                    <span className="font-medium capitalize">{status.replace('-', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{count}</span>
                    <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.jobStatusDistribution).map(([status, count]) => {
              const percentage = analytics.totalJobs > 0 ? (count / analytics.totalJobs) * 100 : 0;
              const statusColors = {
                draft: 'bg-gray-500',
                active: 'bg-green-500',
                paused: 'bg-yellow-500',
                closed: 'bg-red-500',
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                    <span className="font-medium capitalize">{status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{count}</span>
                    <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Application Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Application Trends (Last {analytics.timeRange} days)</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
            <span>Date</span>
            <span>Applications</span>
            <span>Views</span>
            <span>Conversion</span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {analytics.applicationTrends.slice(-14).map((trend) => {
              const conversionRate = trend.views > 0 ? (trend.applications / trend.views) * 100 : 0;
              return (
                <div key={trend.date} className="grid grid-cols-7 gap-2 text-sm py-2 border-b border-gray-100">
                  <span className="font-medium">{new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-green-600 font-semibold">{trend.applications}</span>
                  <span className="text-blue-600">{trend.views}</span>
                  <span className="text-purple-600">{conversionRate.toFixed(1)}%</span>
                  <div className="col-span-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Skill Demand */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most In-Demand Skills</h3>
        <div className="space-y-3">
          {analytics.skillDemand.slice(0, 10).map((skill) => (
            <div key={skill.skill} className="flex items-center justify-between">
              <span className="font-medium">{skill.skill}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{skill.jobCount} jobs</span>
                <span className="text-sm text-blue-600 font-semibold">{skill.applicationCount} applications</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((skill.applicationCount / Math.max(...analytics.skillDemand.map(s => s.applicationCount))) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
         