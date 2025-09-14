'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { JobPosting } from '@/types';

interface JobPerformanceTrackerProps {
  recruiterId: string;
}

interface JobPerformance {
  job: JobPosting & {
    applicationsCount: number;
    viewsCount: number;
    hiredCount: number;
    averageTimeToHire: number;
    conversionRate: number;
    hireRate: number;
    lastApplicationDate?: Date;
    performanceScore: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  };
}

interface PerformanceMetrics {
  totalJobs: number;
  averagePerformanceScore: number;
  topPerformers: JobPerformance[];
  underPerformers: JobPerformance[];
  benchmarks: {
    averageApplicationsPerJob: number;
    averageConversionRate: number;
    averageHireRate: number;
    averageTimeToHire: number;
  };
}

export default function JobPerformanceTracker({ recruiterId }: JobPerformanceTrackerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [sortBy, setSortBy] = useState('performanceScore');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPerformanceMetrics();
  }, [recruiterId, timeRange]);

  const fetchPerformanceMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/performance/${recruiterId}?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDays = (days: number) => {
    return `${days.toFixed(1)} days`;
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
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No performance data available</h3>
          <p>Performance metrics will appear here once you have active job postings.</p>
        </div>
      </Card>
    );
  }

  const allJobs = [...metrics.topPerformers, ...metrics.underPerformers];
  const filteredJobs = allJobs.filter(jobPerf => 
    filterStatus === 'all' || jobPerf.job.status === filterStatus
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'performanceScore':
        return b.job.performanceScore - a.job.performanceScore;
      case 'applications':
        return b.job.applicationsCount - a.job.applicationsCount;
      case 'hireRate':
        return b.job.hireRate - a.job.hireRate;
      case 'createdAt':
        return new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Job Performance Tracker</h2>
          <p className="text-gray-600">Monitor and optimize your job posting performance</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="performanceScore">Performance Score</option>
            <option value="applications">Applications</option>
            <option value="hireRate">Hire Rate</option>
            <option value="createdAt">Created Date</option>
          </Select>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Performance</p>
              <p className="text-2xl font-bold">{metrics.averagePerformanceScore.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Applications</p>
              <p className="text-2xl font-bold">{metrics.benchmarks.averageApplicationsPerJob.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Hire Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(metrics.benchmarks.averageHireRate)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold">{formatDays(metrics.benchmarks.averageTimeToHire)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Job Performance List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Job Performance Details</h3>
        <div className="space-y-4">
          {sortedJobs.map((jobPerf) => (
            <div key={jobPerf.job.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{jobPerf.job.title}</h4>
                    <Badge variant={jobPerf.job.status === 'active' ? 'default' : 'secondary'}>
                      {jobPerf.job.status}
                    </Badge>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(jobPerf.job.performanceScore)}`}>
                      {getPerformanceBadge(jobPerf.job.performanceScore)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Performance Score</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{jobPerf.job.performanceScore.toFixed(1)}</span>
                        {getTrendIcon(jobPerf.job.trend)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Applications</p>
                      <p className="font-semibold">{jobPerf.job.applicationsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Views</p>
                      <p className="font-semibold">{jobPerf.job.viewsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hires</p>
                      <p className="font-semibold">{jobPerf.job.hiredCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hire Rate</p>
                      <p className="font-semibold">{formatPercentage(jobPerf.job.hireRate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Conversion</p>
                      <p className="font-semibold">{formatPercentage(jobPerf.job.conversionRate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {jobPerf.job.recommendations.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Recommendations:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {jobPerf.job.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Activity */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {new Date(jobPerf.job.createdAt).toLocaleDateString()}</span>
                </div>
                {jobPerf.job.lastApplicationDate && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Last application: {new Date(jobPerf.job.lastApplicationDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}