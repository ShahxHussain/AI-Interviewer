'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  BarChart3,
  Download,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { InterviewSessionWithMetrics } from '@/components/interview/InterviewSessionWithMetrics';
import { RealTimeMetricsDashboard } from '@/components/interview/RealTimeMetricsDashboard';
import { InterviewConfiguration, InterviewMetrics } from '@/types';

export default function TestMetricsPage() {
  const [sessionId, setSessionId] = useState<string>(`test_session_${Date.now()}`);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState<InterviewMetrics | null>(null);

  // Mock interview configuration
  const mockConfiguration: InterviewConfiguration = {
    interviewer: 'tech-lead',
    type: 'technical',
    settings: {
      difficulty: 'moderate',
      topicFocus: 'dsa',
      purpose: 'placement',
    },
  };

  const handleSessionComplete = (metrics: InterviewMetrics) => {
    setSessionMetrics(metrics);
    setIsSessionActive(false);
    console.log('Session completed with metrics:', metrics);
  };

  const handleSessionError = (error: string) => {
    console.error('Session error:', error);
    alert(`Session Error: ${error}`);
  };

  const startNewSession = () => {
    const newSessionId = `test_session_${Date.now()}`;
    setSessionId(newSessionId);
    setIsSessionActive(true);
    setSessionMetrics(null);
  };

  const downloadMetrics = () => {
    if (sessionMetrics) {
      const dataStr = JSON.stringify(sessionMetrics, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `metrics-${sessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Metrics Collection System Test
          </h1>
          <p className="text-gray-600">
            Test the real-time metrics collection and dashboard functionality
          </p>
        </div>

        {/* Session Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Session Control</h2>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-gray-600">Session ID:</span>
                  <Badge variant="outline" className="ml-2">
                    {sessionId}
                  </Badge>
                </div>
                {isSessionActive && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Activity className="h-3 w-3 mr-1" />
                    ACTIVE
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={startNewSession}
                disabled={isSessionActive}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start New Session
              </Button>

              {sessionMetrics && (
                <Button
                  onClick={downloadMetrics}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Metrics
                </Button>
              )}

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to Test Metrics Collection
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Click "Start New Session" to begin metrics collection</p>
            <p>2. Allow camera access when prompted</p>
            <p>3. The system will start collecting facial analysis data automatically</p>
            <p>4. Watch the real-time metrics dashboard update every second</p>
            <p>5. Try different facial expressions and head movements to see metrics change</p>
            <p>6. End the session to see final metrics and download the data</p>
          </div>
        </Card>

        {/* Main Content */}
        {isSessionActive ? (
          <InterviewSessionWithMetrics
            sessionId={sessionId}
            configuration={mockConfiguration}
            onSessionComplete={handleSessionComplete}
            onSessionError={handleSessionError}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Standalone Metrics Dashboard */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Standalone Metrics Dashboard
              </h3>
              <RealTimeMetricsDashboard
                isActive={false}
                compact={false}
              />
            </Card>

            {/* Session Results */}
            {sessionMetrics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Last Session Results</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Eye Contact:</span>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(sessionMetrics.eyeContactPercentage)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Avg Confidence:</span>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(sessionMetrics.averageConfidence * 100)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Response Quality:</span>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(sessionMetrics.responseQuality * 100)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Engagement:</span>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(sessionMetrics.overallEngagement * 100)}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Mood Timeline:</span>
                    <div className="text-sm text-gray-800">
                      {sessionMetrics.moodTimeline.length} data points collected
                    </div>
                  </div>

                  <Button
                    onClick={downloadMetrics}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Metrics Data
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Feature Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Metrics Collection Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Real-Time Collection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Facial emotion analysis</li>
                <li>• Eye contact tracking</li>
                <li>• Engagement scoring</li>
                <li>• Mood timeline</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Dashboard Display</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live metrics updates</li>
                <li>• Visual progress bars</li>
                <li>• Emotion indicators</li>
                <li>• Timeline visualization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Data Storage</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Session persistence</li>
                <li>• Metrics export</li>
                <li>• API integration</li>
                <li>• Real-time sync</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Technical Implementation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Components Created:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• MetricsCollectionService</li>
                <li>• RealTimeMetricsDashboard</li>
                <li>• InterviewSessionWithMetrics</li>
                <li>• useMetricsCollection hook</li>
                <li>• MetricsStorageService</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Endpoints:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• POST /api/interview/metrics</li>
                <li>• GET /api/interview/metrics</li>
                <li>• PUT /api/interview/metrics</li>
                <li>• GET /api/interview/metrics/realtime</li>
                <li>• POST /api/interview/metrics/realtime</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}