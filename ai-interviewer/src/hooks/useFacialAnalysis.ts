'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  facialAnalysisService,
  FacialAnalysisData,
  MoodDataPoint,
  EmotionScores,
} from '@/lib/services/facial-analysis-service';

export interface FacialAnalysisMetrics {
  eyeContactPercentage: number;
  moodTimeline: MoodDataPoint[];
  averageConfidence: number;
  totalAnalysisTime: number;
  dominantEmotion: string;
  emotionDistribution: EmotionScores;
}

export interface UseFacialAnalysisOptions {
  analysisInterval?: number; // milliseconds between analyses
  autoStart?: boolean;
  onError?: (error: string) => void;
}

export function useFacialAnalysis(options: UseFacialAnalysisOptions = {}) {
  const { analysisInterval = 1000, autoStart = false, onError } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<FacialAnalysisData | null>(null);
  const [metrics, setMetrics] = useState<FacialAnalysisMetrics>({
    eyeContactPercentage: 0,
    moodTimeline: [],
    averageConfidence: 0,
    totalAnalysisTime: 0,
    dominantEmotion: 'neutral',
    emotionDistribution: {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
    },
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisDataRef = useRef<FacialAnalysisData[]>([]);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Initialize the facial analysis service
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await facialAnalysisService.initialize();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to initialize facial analysis';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, onError]);

  /**
   * Start facial analysis on a video element
   */
  const startAnalysis = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!isInitialized) {
        await initialize();
      }

      if (isAnalyzing) {
        stopAnalysis();
      }

      try {
        videoRef.current = videoElement;
        analysisDataRef.current = [];
        startTimeRef.current = Date.now();

        setIsAnalyzing(true);
        setError(null);

        await facialAnalysisService.startAnalysis(
          videoElement,
          handleAnalysisData,
          analysisInterval
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to start facial analysis';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsAnalyzing(false);
      }
    },
    [isInitialized, isAnalyzing, analysisInterval, initialize, onError]
  );

  /**
   * Stop facial analysis
   */
  const stopAnalysis = useCallback(() => {
    facialAnalysisService.stopAnalysis();
    setIsAnalyzing(false);

    // Calculate final metrics
    if (startTimeRef.current) {
      const totalTime = Date.now() - startTimeRef.current;
      updateMetrics(totalTime);
    }
  }, []);

  /**
   * Handle new analysis data
   */
  const handleAnalysisData = useCallback((data: FacialAnalysisData) => {
    setCurrentAnalysis(data);
    analysisDataRef.current.push(data);

    // Update metrics in real-time
    if (startTimeRef.current) {
      const currentTime = Date.now() - startTimeRef.current;
      updateMetrics(currentTime);
    }
  }, []);

  /**
   * Update metrics based on collected analysis data
   */
  const updateMetrics = useCallback((totalTime: number) => {
    const data = analysisDataRef.current;
    if (data.length === 0) return;

    // Calculate eye contact percentage
    const eyeContactCount = data.filter(d => d.eyeContact).length;
    const eyeContactPercentage = (eyeContactCount / data.length) * 100;

    // Build mood timeline
    const moodTimeline: MoodDataPoint[] = data.map(d => {
      const dominantEmotion = Object.entries(d.emotions).reduce(
        (max, [emotion, value]) =>
          value > max.value ? { emotion, value } : max,
        { emotion: 'neutral', value: 0 }
      );

      return {
        timestamp: d.timestamp,
        dominantEmotion: dominantEmotion.emotion,
        confidence: dominantEmotion.value,
        emotions: d.emotions,
      };
    });

    // Calculate average confidence
    const averageConfidence =
      data.reduce((sum, d) => sum + d.confidence, 0) / data.length;

    // Calculate emotion distribution (average over time)
    const emotionDistribution: EmotionScores = {
      neutral:
        data.reduce((sum, d) => sum + d.emotions.neutral, 0) / data.length,
      happy: data.reduce((sum, d) => sum + d.emotions.happy, 0) / data.length,
      sad: data.reduce((sum, d) => sum + d.emotions.sad, 0) / data.length,
      angry: data.reduce((sum, d) => sum + d.emotions.angry, 0) / data.length,
      fearful:
        data.reduce((sum, d) => sum + d.emotions.fearful, 0) / data.length,
      disgusted:
        data.reduce((sum, d) => sum + d.emotions.disgusted, 0) / data.length,
      surprised:
        data.reduce((sum, d) => sum + d.emotions.surprised, 0) / data.length,
    };

    // Find dominant emotion overall
    const dominantEmotion = Object.entries(emotionDistribution).reduce(
      (max, [emotion, value]) => (value > max.value ? { emotion, value } : max),
      { emotion: 'neutral', value: 0 }
    ).emotion;

    setMetrics({
      eyeContactPercentage,
      moodTimeline,
      averageConfidence,
      totalAnalysisTime: totalTime,
      dominantEmotion,
      emotionDistribution,
    });
  }, []);

  /**
   * Reset all analysis data and metrics
   */
  const reset = useCallback(() => {
    stopAnalysis();
    analysisDataRef.current = [];
    startTimeRef.current = null;
    setCurrentAnalysis(null);
    setMetrics({
      eyeContactPercentage: 0,
      moodTimeline: [],
      averageConfidence: 0,
      totalAnalysisTime: 0,
      dominantEmotion: 'neutral',
      emotionDistribution: {
        neutral: 0,
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
      },
    });
  }, [stopAnalysis]);

  /**
   * Get analysis summary for reporting
   */
  const getAnalysisSummary = useCallback(() => {
    return {
      ...metrics,
      totalDataPoints: analysisDataRef.current.length,
      analysisQuality: analysisDataRef.current.length > 0 ? 'good' : 'no-data',
      recommendations: generateRecommendations(metrics),
    };
  }, [metrics]);

  /**
   * Generate recommendations based on analysis
   */
  const generateRecommendations = (
    metrics: FacialAnalysisMetrics
  ): string[] => {
    const recommendations: string[] = [];

    if (metrics.eyeContactPercentage < 60) {
      recommendations.push(
        'Try to maintain more eye contact with the camera to appear more engaged.'
      );
    }

    if (metrics.averageConfidence < 0.7) {
      recommendations.push(
        'Work on speaking with more confidence and clarity.'
      );
    }

    if (metrics.emotionDistribution.sad > 0.3) {
      recommendations.push(
        'Try to maintain a more positive facial expression during interviews.'
      );
    }

    if (metrics.emotionDistribution.angry > 0.2) {
      recommendations.push(
        'Focus on staying calm and composed throughout the interview.'
      );
    }

    if (metrics.emotionDistribution.happy > 0.6) {
      recommendations.push('Great job maintaining a positive demeanor!');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Overall good performance! Keep practicing to maintain consistency.'
      );
    }

    return recommendations;
  };

  // Auto-initialize if requested
  useEffect(() => {
    if (autoStart && !isInitialized && !isLoading) {
      initialize();
    }
  }, [autoStart, isInitialized, isLoading, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAnalyzing) {
        stopAnalysis();
      }
    };
  }, [isAnalyzing, stopAnalysis]);

  return {
    // State
    isInitialized,
    isAnalyzing,
    isLoading,
    error,
    currentAnalysis,
    metrics,

    // Actions
    initialize,
    startAnalysis,
    stopAnalysis,
    reset,
    getAnalysisSummary,
  };
}
