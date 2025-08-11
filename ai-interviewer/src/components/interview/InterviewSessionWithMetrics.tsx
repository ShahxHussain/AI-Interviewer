'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  Pause,
  BarChart3,
  Eye,
  Activity,
  Download,
  Settings,
} from 'lucide-react';
import { VideoRecorder } from './VideoRecorder';
import { RealTimeMetricsDashboard } from './RealTimeMetricsDashboard';
import { FacialAnalysisDisplay } from './FacialAnalysisDisplay';
import { useMetricsCollection } from '@/hooks/useMetricsCollection';
import { useFacialAnalysis } from '@/hooks/useFacialAnalysis';
import { InterviewConfiguration, InterviewMetrics } from '@/types';
import { SessionService } from '@/lib/services/session-service';

interface InterviewSessionWithMetricsProps {
  sessionId: string;
  configuration: InterviewConfiguration;
  onSessionComplete?: (metrics: InterviewMetrics) => void;
  onSessionError?: (error: string) => void;
  className?: string;
}

export function InterviewSessionWithMetrics({
  sessionId,
  configuration,
  onSessionComplete,
  onSessionError,
  className = '',
}: InterviewSessionWithMetricsProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showMetricsDashboard, setShowMetricsDashboard] = useState(true);
  const [showFacialAnalysis, setShowFacialAnalysis] = useState(true);

  // Facial analysis hook
  const {
    isInitialized: isFacialAnalysisReady,
    isAnalyzing: isFacialAnalysisRunning,
    currentAnalysis,
    metrics: facialMetrics,
    startAnalysis: startFacialAnalysis,
    stopAnalysis: stopFacialAnalysis,
    reset: resetFacialAnalysis,
  } = useFacialAnalysis({
    analysisInterval: 1000,
    autoStart: true,
    onError: (error) => {
      console.error('Facial analysis error:', error);
      // Don't treat facial analysis errors as critical
    },
  });

  // Metrics collection hook
  const {
    isCollecting: isMetricsCollecting,
    startCollection: startMetricsCollection,
    stopCollection: stopMetricsCollection,
    addFacialData,
    startResponse,
    endResponse,
    getRealTimeMetrics,
    getEngagementMetrics,
    exportMetricsData,
    reset: resetMetrics,
  } = useMetricsCollection({
    sessionId,
    onMetricsUpdate: (metrics) => {
      // Update session metrics in real-time
      SessionService.updateMetrics(sessionId, {
        eyeContactPercentage: metrics.eyeContactPercentage,
        averageConfidence: metrics.averageConfidence,
        responseQuality: metrics.responseQuality,
        overallEngagement: metrics.engagementScore / 100,
      }).catch(console.error);
    },
  });

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  // Connect facial analysis to metrics collection
  useEffect(() => {
    if (currentAnalysis && isMetricsCollecting) {
      addFacialData(currentAnalysis);
    }
  }, [currentAnalysis, isMetricsCollecting, addFacialData]);

  /**
   * Start interview session
   */
  const startSession = useCallback(async () => {
    try {
      setIsSessionActive(true);
      setSessionDuration(0);

      // Start metrics collection
      startMetricsCollection(sessionId);

      console.log(`Interview session started: ${sessionId}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      onSessionError?.('Failed to start interview session');
    }
  }, [sessionId, startMetricsCollection, onSessionError]);

  /**
   * Stop interview session
   */
  const stopSession = useCallback(async () => {
    try {
      setIsSessionActive(false);
      setIsRecording(false);

      // Stop facial analysis
      if (isFacialAnalysisRunning) {
        stopFacialAnalysis();
      }

      // Stop metrics collection and get final metrics
      const finalMetrics = stopMetricsCollection();

      // Update session with final metrics
      await SessionService.updateMetrics(sessionId, finalMetrics);

      console.log('Interview session completed:', finalMetrics);
      onSessionComplete?.(finalMetrics);
    } catch (error) {
      console.error('Failed to stop session:', error);
      onSessionError?.('Failed to complete interview session');
    }
  }, [
    sessionId,
    isFacialAnalysisRunning,
    stopFacialAnalysis,
    stopMetricsCollection,
    onSessionComplete,
    onSessionError,
  ]);

  /**
   * Start recording response
   */
  const startRecordingResponse = useCallback(async () => {
    setIsRecording(true);
    startResponse();

    // Start facial analysis if not already running
    if (!isFacialAnalysisRunning && isFacialAnalysisReady) {
      // This would need a video element reference
      // For now, we assume facial analysis is already running
    }
  }, [startResponse, isFacialAnalysisRunning, isFacialAnalysisReady]);

  /**
   * Stop recording response
   */
  const stopRecordingResponse = useCallback(() => {
    setIsRecording(false);
    endResponse();
  }, [endResponse]);

  /**
   * Export session data
   */
  const exportSessionData = useCallback(() => {
    const metricsData = exportMetricsData();
    const dataStr = JSON.stringify(metricsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-metrics-${sessionId}-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportMetricsData, sessionId]);

  /**
   * Reset session
   */
  const resetSession = useCallback(() => {
    setIsSessionActive(false);
    setIsRecording(false);
    setSessionDuration(0);
    resetFacialAnalysis();
    resetMetrics();
  }, [resetFacialAnalysis, resetMetrics]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Session Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Interview Session</h2>
              <p className="text-sm text-gray-600">
                {configuration.interviewer.replace('-', ' ')} • {configuration.type}
              </p>
            </div>
            
            {isSessionActive && (
              <Badge variant="secondary" className="animate-pulse">
                ACTIVE • {formatTime(sessionDuration)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Buttons */}
            <Button
              onClick={() => setShowMetricsDashboard(!showMetricsDashboard)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Metrics
            </Button>

            <Button
              onClick={() => setShowFacialAnalysis(!showFacialAnalysis)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analysis
            </Button>

            {/* Export Button */}
            {isMetricsCollecting && (
              <Button
                onClick={exportSessionData}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Recording Section */}
        <div className="lg:col-span-2">
          <VideoRecorder
            onRecordingComplete={(videoBlob) => {
              stopRecordingResponse();
              console.log('Recording completed:', videoBlob.size, 'bytes');
            }}
            onError={onSessionError}
            enableFacialAnalysis={true}
            showQuickTest={false}
            className="h-full"
          />
        </div>

        {/* Metrics Dashboard */}
        {showMetricsDashboard && (
          <div className="space-y-4">
            <RealTimeMetricsDashboard
              isActive={isMetricsCollecting}
              compact={false}
            />
          </div>
        )}
      </div>

      {/* Session Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isSessionActive ? (
              <Button
                onClick={startSession}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopSession}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </Button>

                {!isRecording ? (
                  <Button
                    onClick={startRecordingResponse}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Response
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecordingResponse}
                    variant="outline"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Response
                  </Button>
                )}
              </>
            )}

            <Button
              onClick={resetSession}
              variant="outline"
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isMetricsCollecting && (
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1" />
                Collecting Metrics
              </Badge>
            )}
            {isFacialAnalysisRunning && (
              <Badge variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Analyzing Face
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Facial Analysis Display */}
      {showFacialAnalysis && (
        <FacialAnalysisDisplay
          currentAnalysis={currentAnalysis}
          metrics={facialMetrics}
          isAnalyzing={isFacialAnalysisRunning}
        />
      )}

      {/* Status Messages */}
      {!isSessionActive && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Click "Start Session" to begin the interview and start collecting metrics.
          </p>
        </Card>
      )}
    </div>
  );
}