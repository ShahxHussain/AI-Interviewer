'use client';

import { useEffect, useCallback, useRef } from 'react';
import { metricsCollectionService, RealTimeMetrics, EngagementMetrics } from '@/lib/services/metrics-service';
import { FacialAnalysisData, MoodDataPoint } from '@/lib/services/facial-analysis-service';
import { InterviewMetrics } from '@/types';

export interface UseMetricsCollectionOptions {
  sessionId?: string;
  autoStart?: boolean;
  onMetricsUpdate?: (metrics: RealTimeMetrics) => void;
  onEngagementUpdate?: (engagement: EngagementMetrics) => void;
}

export function useMetricsCollection(options: UseMetricsCollectionOptions = {}) {
  const { sessionId, autoStart = false, onMetricsUpdate, onEngagementUpdate } = options;
  
  const isCollectingRef = useRef(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start metrics collection
   */
  const startCollection = useCallback((id?: string) => {
    const targetSessionId = id || sessionId || `session_${Date.now()}`;
    
    if (isCollectingRef.current) {
      console.warn('Metrics collection already active');
      return;
    }

    metricsCollectionService.startCollection(targetSessionId);
    isCollectingRef.current = true;

    // Start periodic updates for callbacks
    if (onMetricsUpdate || onEngagementUpdate) {
      updateIntervalRef.current = setInterval(() => {
        if (onMetricsUpdate) {
          const metrics = metricsCollectionService.getRealTimeMetrics();
          onMetricsUpdate(metrics);
        }
        
        if (onEngagementUpdate) {
          const engagement = metricsCollectionService.getEngagementMetrics();
          onEngagementUpdate(engagement);
        }
      }, 1000);
    }

    console.log(`Metrics collection started for session: ${targetSessionId}`);
  }, [sessionId, onMetricsUpdate, onEngagementUpdate]);

  /**
   * Stop metrics collection and return final metrics
   */
  const stopCollection = useCallback((): InterviewMetrics => {
    if (!isCollectingRef.current) {
      console.warn('Metrics collection not active');
      return {
        eyeContactPercentage: 0,
        moodTimeline: [],
        averageConfidence: 0,
        responseQuality: 0,
        overallEngagement: 0,
      };
    }

    const finalMetrics = metricsCollectionService.stopCollection();
    isCollectingRef.current = false;

    // Clear update interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    console.log('Metrics collection stopped');
    return finalMetrics;
  }, []);

  /**
   * Add facial analysis data to metrics collection
   */
  const addFacialData = useCallback((data: FacialAnalysisData) => {
    if (!isCollectingRef.current) {
      console.warn('Metrics collection not active, ignoring facial data');
      return;
    }

    console.log('useMetricsCollection: Adding facial data:', {
      eyeContact: data.eyeContact,
      confidence: data.confidence,
      emotions: data.emotions,
      timestamp: data.timestamp
    });
    
    metricsCollectionService.addFacialData(data);
  }, []);

  /**
   * Mark start of response recording
   */
  const startResponse = useCallback(() => {
    if (isCollectingRef.current) {
      metricsCollectionService.startResponse();
    }
  }, []);

  /**
   * Mark end of response recording
   */
  const endResponse = useCallback(() => {
    if (isCollectingRef.current) {
      metricsCollectionService.endResponse();
    }
  }, []);

  /**
   * Get current real-time metrics
   */
  const getRealTimeMetrics = useCallback((): RealTimeMetrics => {
    return metricsCollectionService.getRealTimeMetrics();
  }, []);

  /**
   * Get current engagement metrics
   */
  const getEngagementMetrics = useCallback((): EngagementMetrics => {
    return metricsCollectionService.getEngagementMetrics();
  }, []);

  /**
   * Get mood timeline
   */
  const getMoodTimeline = useCallback((): MoodDataPoint[] => {
    return metricsCollectionService.getMoodTimeline();
  }, []);

  /**
   * Reset all metrics data
   */
  const reset = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    metricsCollectionService.reset();
    isCollectingRef.current = false;
    
    console.log('Metrics collection reset');
  }, []);

  /**
   * Export metrics data for analysis
   */
  const exportMetricsData = useCallback(() => {
    return metricsCollectionService.exportMetricsData();
  }, []);

  /**
   * Check if collection is active
   */
  const isCollecting = useCallback(() => {
    return isCollectingRef.current;
  }, []);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && sessionId && !isCollectingRef.current) {
      startCollection(sessionId);
    }
  }, [autoStart, sessionId, startCollection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCollectingRef.current) {
        stopCollection();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [stopCollection]);

  return {
    // State
    isCollecting: isCollectingRef.current,

    // Actions
    startCollection,
    stopCollection,
    addFacialData,
    startResponse,
    endResponse,
    reset,

    // Data access
    getRealTimeMetrics,
    getEngagementMetrics,
    getMoodTimeline,
    exportMetricsData,
  };
}