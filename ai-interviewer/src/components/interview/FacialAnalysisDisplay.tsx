'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  TrendingUp,
  Activity,
  Camera,
} from 'lucide-react';
import {
  FacialAnalysisData,
  EmotionScores,
} from '@/lib/services/facial-analysis-service';
import { FacialAnalysisMetrics } from '@/hooks/useFacialAnalysis';

interface FacialAnalysisDisplayProps {
  currentAnalysis: FacialAnalysisData | null;
  metrics: FacialAnalysisMetrics;
  isAnalyzing: boolean;
  className?: string;
}

export function FacialAnalysisDisplay({
  currentAnalysis,
  metrics,
  isAnalyzing,
  className = '',
}: FacialAnalysisDisplayProps) {
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

  const formatPercentage = (value: number) => `${Math.round(value)}%`;
  const formatConfidence = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Facial Analysis</h3>
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              Analyzing
            </Badge>
          )}
        </div>

        {!isAnalyzing && metrics.totalAnalysisTime > 0 && (
          <Badge variant="outline">
            {Math.round(metrics.totalAnalysisTime / 1000)}s analyzed
          </Badge>
        )}
      </div>

      {/* Current Analysis */}
      {currentAnalysis && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time Analysis
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Eye Contact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Eye Contact</span>
              </div>
              <Badge
                variant={currentAnalysis.eyeContact ? 'default' : 'secondary'}
              >
                {currentAnalysis.eyeContact ? 'Good' : 'Poor'}
              </Badge>
            </div>

            {/* Current Emotion */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getEmotionIcon(
                  Object.entries(currentAnalysis.emotions).reduce(
                    (max, [emotion, value]) =>
                      value > max.value ? { emotion, value } : max,
                    { emotion: 'neutral', value: 0 }
                  ).emotion
                )}
                <span className="text-sm font-medium">Current Mood</span>
              </div>
              <Badge variant="outline">
                {
                  Object.entries(currentAnalysis.emotions).reduce(
                    (max, [emotion, value]) =>
                      value > max.value ? { emotion, value } : max,
                    { emotion: 'neutral', value: 0 }
                  ).emotion
                }
              </Badge>
            </div>
          </div>

          {/* Emotion Bars */}
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium">Current Emotions</h5>
            {Object.entries(currentAnalysis.emotions).map(
              ([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xs w-16 capitalize">{emotion}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getEmotionColor(emotion)}`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-8">{Math.round(value * 100)}</span>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Overall Metrics */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Overall Performance
        </h4>

        <div className="space-y-4">
          {/* Eye Contact Percentage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Eye Contact
              </span>
              <span className="text-sm">
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
          </div>

          {/* Average Confidence */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Average Confidence</span>
              <span className="text-sm">
                {formatConfidence(metrics.averageConfidence)}
              </span>
            </div>
            <Progress value={metrics.averageConfidence * 100} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              {metrics.averageConfidence >= 0.8
                ? 'Very confident'
                : metrics.averageConfidence >= 0.6
                  ? 'Confident'
                  : 'Could be more confident'}
            </p>
          </div>

          {/* Dominant Emotion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Dominant Emotion</span>
              <div className="flex items-center gap-2">
                {getEmotionIcon(metrics.dominantEmotion)}
                <span className="text-sm capitalize">
                  {metrics.dominantEmotion}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Most frequently displayed emotion during the session
            </p>
          </div>
        </div>
      </Card>

      {/* Emotion Distribution */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Emotion Distribution</h4>

        <div className="space-y-2">
          {Object.entries(metrics.emotionDistribution)
            .sort(([, a], [, b]) => b - a)
            .map(([emotion, value]) => (
              <div key={emotion} className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-20">
                  {getEmotionIcon(emotion)}
                  <span className="text-xs capitalize">{emotion}</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getEmotionColor(emotion)}`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="text-xs w-8">{Math.round(value * 100)}</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Mood Timeline Preview */}
      {metrics.moodTimeline.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Recent Mood Changes</h4>

          <div className="flex gap-1 h-8 bg-gray-100 rounded overflow-hidden">
            {metrics.moodTimeline.slice(-20).map((point, index) => (
              <div
                key={index}
                className={`flex-1 ${getEmotionColor(point.dominantEmotion)} opacity-80`}
                title={`${point.dominantEmotion} (${formatConfidence(point.confidence)})`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-2">
            Color timeline showing mood changes over the last 20 data points
          </p>
        </Card>
      )}

      {/* Status Messages */}
      {!isAnalyzing && metrics.totalAnalysisTime === 0 && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Start video recording to begin facial analysis
          </p>
        </Card>
      )}
    </div>
  );
}
