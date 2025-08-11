'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Activity,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
} from 'lucide-react';
import {
  RealTimeMetrics,
  EngagementMetrics,
  metricsCollectionService,
} from '@/lib/services/metrics-service';
import { MoodDataPoint } from '@/lib/services/facial-analysis-service';

interface RealTimeMetricsDashboardProps {
  isActive: boolean;
  className?: string;
  compact?: boolean;
}

export function RealTimeMetricsDashboard({
  isActive,
  className = '',
  compact = false,
}: RealTimeMetricsDashboardProps) {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    eyeContactPercentage: 0,
    currentMood: 'neutral',
    moodConfidence: 0,
    engagementScore: 0,
    responseQuality: 0,
    averageConfidence: 0,
    sessionDuration: 0,
    totalDataPoints: 0,
  });

  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    eyeContactScore: 0,
    emotionalStability: 0,
    responseConsistency: 0,
    overallEngagement: 0,
  });

  const [moodTimeline, setMoodTimeline] = useState<MoodDataPoint[]>([]);

  // Update metrics every second when active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const currentMetrics = metricsCollectionService.getRealTimeMetrics();
      const currentEngagement = metricsCollectionService.getEngagementMetrics();
      const currentMoodTimeline = metricsCollectionService.getMoodTimeline();

      setMetrics(currentMetrics);
      setEngagementMetrics(currentEngagement);
      setMoodTimeline(currentMoodTimeline);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad':
        return <Frown className="h-4 w-4 text-blue-500" />;
      case 'angry':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'surprised':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return 'bg-green-500';
      case 'sad':
        return 'bg-blue-500';
      case 'angry':
        return 'bg-red-500';
      case 'surprised':
        return 'bg-yellow-500';
      case 'fearful':
        return 'bg-purple-500';
      case 'disgusted':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Live Metrics</span>
            {isActive && (
              <Badge variant="secondary" className="animate-pulse text-xs">
                LIVE
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(metrics.sessionDuration)}
          </div>
        </div>

        {/* Compact Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.eyeContactPercentage)}`}>
              {formatPercentage(metrics.eyeContactPercentage)}
            </div>
            <div className="text-xs text-gray-600">Eye Contact</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.engagementScore)}`}>
              {formatPercentage(metrics.engagementScore)}
            </div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
          <div className="text-center flex flex-col items-center">
            {getEmotionIcon(metrics.currentMood)}
            <div className="text-xs text-gray-600 capitalize">{metrics.currentMood}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Real-Time Metrics</h3>
          {isActive && (
            <Badge variant="secondary" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {formatTime(metrics.sessionDuration)}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Eye Contact */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Eye Contact</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(metrics.eyeContactPercentage)}`}>
              {formatPercentage(metrics.eyeContactPercentage)}
            </span>
          </div>
          <Progress value={metrics.eyeContactPercentage} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            {metrics.eyeContactPercentage >= 70
              ? 'Excellent'
              : metrics.eyeContactPercentage >= 50
                ? 'Good'
                : 'Needs improvement'}
          </p>
        </Card>

        {/* Engagement Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(metrics.engagementScore)}`}>
              {formatPercentage(metrics.engagementScore)}
            </span>
          </div>
          <Progress value={metrics.engagementScore} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            {metrics.engagementScore >= 80
              ? 'Highly engaged'
              : metrics.engagementScore >= 60
                ? 'Well engaged'
                : 'Could be more engaged'}
          </p>
        </Card>

        {/* Current Mood */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Current Mood</span>
            </div>
            <div className="flex items-center gap-2">
              {getEmotionIcon(metrics.currentMood)}
              <span className="text-sm font-medium capitalize">
                {metrics.currentMood}
              </span>
            </div>
          </div>
          <Progress value={metrics.moodConfidence * 100} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            Confidence: {formatPercentage(metrics.moodConfidence * 100)}
          </p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Response Quality */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Response Quality</span>
            </div>
            <span className={`text-sm font-bold ${getScoreColor(metrics.responseQuality * 100)}`}>
              {formatPercentage(metrics.responseQuality * 100)}
            </span>
          </div>
          <Progress value={metrics.responseQuality * 100} className="h-2" />
        </Card>

        {/* Average Confidence */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Avg Confidence</span>
            </div>
            <span className={`text-sm font-bold ${getScoreColor(metrics.averageConfidence * 100)}`}>
              {formatPercentage(metrics.averageConfidence * 100)}
            </span>
          </div>
          <Progress value={metrics.averageConfidence * 100} className="h-2" />
        </Card>
      </div>

      {/* Detailed Engagement Breakdown */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Engagement Breakdown
        </h4>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Eye Contact Score</span>
              <span className="text-sm font-medium">
                {formatPercentage(engagementMetrics.eyeContactScore)}
              </span>
            </div>
            <Progress value={engagementMetrics.eyeContactScore} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Emotional Stability</span>
              <span className="text-sm font-medium">
                {formatPercentage(engagementMetrics.emotionalStability * 100)}
              </span>
            </div>
            <Progress value={engagementMetrics.emotionalStability * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Response Consistency</span>
              <span className="text-sm font-medium">
                {formatPercentage(engagementMetrics.responseConsistency * 100)}
              </span>
            </div>
            <Progress value={engagementMetrics.responseConsistency * 100} className="h-1.5" />
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Engagement</span>
              <span className={`text-sm font-bold ${getScoreColor(engagementMetrics.overallEngagement)}`}>
                {formatPercentage(engagementMetrics.overallEngagement)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Mood Timeline Visualization */}
      {moodTimeline.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Mood Timeline</h4>
          
          <div className="flex gap-1 h-8 bg-gray-100 rounded overflow-hidden">
            {moodTimeline.slice(-50).map((point, index) => (
              <div
                key={index}
                className={`flex-1 ${getEmotionColor(point.dominantEmotion)} opacity-80`}
                title={`${point.dominantEmotion} (${formatPercentage(point.confidence * 100)})`}
              />
            ))}
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            Color timeline showing mood changes over the last 50 data points
          </p>
        </Card>
      )}

      {/* Status */}
      {!isActive && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Metrics collection is not active. Start an interview session to see real-time data.
          </p>
        </Card>
      )}

      {isActive && metrics.totalDataPoints === 0 && (
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-blue-700 text-center">
            Collecting data... Make sure your camera is enabled for facial analysis.
          </p>
        </Card>
      )}

      {/* Data Points Info */}
      {metrics.totalDataPoints > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {metrics.totalDataPoints} data points collected
        </div>
      )}
    </div>
  );
}