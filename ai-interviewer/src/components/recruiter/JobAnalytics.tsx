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
  PieChart
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalJobs)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalApplications)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(analytics.conversionRate)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hire Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(analytics.hireRate)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
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

      {/* Skill Demand */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most In-Demand Skills</h3>
        <div className="space-y-3">
          {analytics.skillDemand.slice(0, 10).map((skill) => (
            <div key={skill.skill} className="flex items-center justify-between">
              <span className="font-medium">{skill.skill}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{skill.jobCount} jobs</span>
                <span className="text-sm text-gray-600">{skill.applicationCount} applications</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
         