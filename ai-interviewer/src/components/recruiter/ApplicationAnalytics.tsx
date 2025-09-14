'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target
} from 'lucide-react';

interface ApplicationAnalyticsProps {
  jobId: string;
  jobTitle: string;
}

interface ApplicationMetrics {
  totalApplications: number;
  statusBreakdown: {
    applied: number;
    'interview-scheduled': number;
    'interview-completed': number;
    rejected: number;
    hired: number;
  };
  averageTimeToHire: number; // in days
  averageTimeToReject: number; // in days
  conversionRates: {
    applicationToInterview: number;
    interviewToHire: number;
    overallHireRate: number;
  };
  applicationTrends: Array<{
    date: string;
    applications: number;
    interviews: number;
    hires: number;
  }>;
  topCandidateSkills: Array<{
    skill: string;
    count: number;
    hireRate: number;
  }>;
  interviewPerformance: {
    averageScore: number;
    scoreDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
}

export default function ApplicationAnalytics({ jobId, jobTitle }: ApplicationAnalyticsProps) {
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchMetrics();
  }, [jobId, timeRange]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching application metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDays = (days: number) => {
    return `${days.toFixed(1)} days`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview-scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'interview-completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'text-blue-600 bg-blue-100';
      case 'interview-scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'interview-completed':
        return 'text-purple-600 bg-purple-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'hired':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No application data available</h3>
          <p>Application analytics will appear here once candidates start applying.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Application Analytics</h2>
          <p className="text-gray-600">Detailed insights for {jobTitle}</p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">All time</option>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold">{metrics.totalApplications}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hire Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(metrics.conversionRates.overallHireRate)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold">{formatDays(metrics.averageTimeToHire)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interview Score</p>
              <p className="text-2xl font-bold">{metrics.interviewPerformance.averageScore.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Application Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(metrics.statusBreakdown).map(([status, count]) => {
            const percentage = metrics.totalApplications > 0 ? (count / metrics.totalApplications) * 100 : 0;
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</p>
                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Applications</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{metrics.totalApplications}</span>
              <p className="text-sm text-gray-600">100%</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="h-6 w-6 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 mt-1">
                {formatPercentage(metrics.conversionRates.applicationToInterview)} conversion
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Interviews</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-yellow-600">
                {metrics.statusBreakdown['interview-scheduled'] + metrics.statusBreakdown['interview-completed']}
              </span>
              <p className="text-sm text-gray-600">
                {formatPercentage(
                  (metrics.statusBreakdown['interview-scheduled'] + metrics.statusBreakdown['interview-completed']) / 
                  metrics.totalApplications
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="h-6 w-6 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 mt-1">
                {formatPercentage(metrics.conversionRates.interviewToHire)} conversion
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Hires</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">{metrics.statusBreakdown.hired}</span>
              <p className="text-sm text-gray-600">
                {formatPercentage(metrics.statusBreakdown.hired / metrics.totalApplications)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Candidate Skills */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Candidate Skills</h3>
        <div className="space-y-3">
          {metrics.topCandidateSkills.slice(0, 8).map((skill) => (
            <div key={skill.skill} className="flex items-center justify-between">
              <span className="font-medium">{skill.skill}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{skill.count} candidates</span>
                <Badge variant={skill.hireRate > 0.2 ? 'default' : 'secondary'}>
                  {formatPercentage(skill.hireRate)} hire rate
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interview Performance Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interview Score Distribution</h3>
        <div className="space-y-3">
          {metrics.interviewPerformance.scoreDistribution.map((range) => {
            const percentage = metrics.statusBreakdown['interview-completed'] > 0 
              ? (range.count / metrics.statusBreakdown['interview-completed']) * 100 
              : 0;
            return (
              <div key={range.range} className="flex items-center justify-between">
                <span className="font-medium">{range.range}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{range.count} candidates</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}