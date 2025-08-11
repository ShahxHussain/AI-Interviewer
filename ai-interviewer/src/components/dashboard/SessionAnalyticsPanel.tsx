'use client';

import { SessionAnalytics } from '@/lib/services/session-service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BarChart3,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface SessionAnalyticsPanelProps {
  analytics: SessionAnalytics;
}

export function SessionAnalyticsPanel({ analytics }: SessionAnalyticsPanelProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPercentage = (value: number) => {
    return Math.abs(value).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {analytics.completedSessions} completed
          </p>
        </div>
      </Card>

      {/* Completion Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalSessions > 0 
                ? Math.round((analytics.completedSessions / analytics.totalSessions) * 100)
                : 0}%
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {analytics.completedSessions} of {analytics.totalSessions} sessions
          </p>
        </div>
      </Card>

      {/* Average Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.averageScore.toFixed(1)}/10
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-1">
            {getTrendIcon(analytics.improvementTrend)}
            <span className={`text-sm ${getTrendColor(analytics.improvementTrend)}`}>
              {analytics.improvementTrend > 0 ? '+' : ''}
              {formatPercentage(analytics.improvementTrend)}% trend
            </span>
          </div>
        </div>
      </Card>

      {/* Performance Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Performance Trend</p>
            <p className={`text-2xl font-bold ${getTrendColor(analytics.improvementTrend)}`}>
              {analytics.improvementTrend > 0 ? 'Improving' : 
               analytics.improvementTrend < 0 ? 'Declining' : 'Stable'}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            analytics.improvementTrend > 0 ? 'bg-green-100' :
            analytics.improvementTrend < 0 ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <Target className={`w-6 h-6 ${
              analytics.improvementTrend > 0 ? 'text-green-600' :
              analytics.improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'
            }`} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Based on recent sessions
          </p>
        </div>
      </Card>

      {/* Performance by Type */}
      {Object.keys(analytics.performanceByType).length > 0 && (
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Interview Type
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.performanceByType).map(([type, score]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {type.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance by Difficulty */}
      {Object.keys(analytics.performanceByDifficulty).length > 0 && (
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Difficulty Level
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.performanceByDifficulty).map(([difficulty, score]) => (
              <div key={difficulty} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {difficulty}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        difficulty === 'beginner' ? 'bg-green-600' :
                        difficulty === 'moderate' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Strengths */}
      {analytics.topStrengths.length > 0 && (
        <Card className="p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Strengths
          </h3>
          <div className="space-y-2">
            {analytics.topStrengths.slice(0, 3).map((strength, index) => (
              <Badge
                key={index}
                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
              >
                {strength}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Areas to Improve */}
      {analytics.topWeaknesses.length > 0 && (
        <Card className="p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Areas to Improve
          </h3>
          <div className="space-y-2">
            {analytics.topWeaknesses.slice(0, 3).map((weakness, index) => (
              <Badge
                key={index}
                className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
              >
                {weakness}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}