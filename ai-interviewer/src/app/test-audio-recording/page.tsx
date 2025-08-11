'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from '@/components/interview/AudioRecorder';
import { AudioAnalysisResult } from '@/lib/services/audio-service';
import {
  Mic,
  CheckCircle,
  AlertTriangle,
  Info,
  Volume2,
  Clock,
  FileAudio,
  Settings,
} from 'lucide-react';

export default function TestAudioRecordingPage() {
  const [lastRecording, setLastRecording] = useState<{
    blob: Blob;
    duration: number;
    analysis?: AudioAnalysisResult;
  } | null>(null);

  const [recordings, setRecordings] = useState<
    Array<{
      id: string;
      timestamp: Date;
      duration: number;
      size: number;
      qualityScore?: number;
      isValid?: boolean;
    }>
  >([]);

  const handleRecordingComplete = (
    audioBlob: Blob,
    duration: number,
    analysis?: AudioAnalysisResult
  ) => {
    console.log('Recording completed:', {
      size: audioBlob.size,
      duration,
      analysis,
    });

    setLastRecording({ blob: audioBlob, duration, analysis });

    // Add to recordings history
    const newRecording = {
      id: Date.now().toString(),
      timestamp: new Date(),
      duration,
      size: audioBlob.size,
      qualityScore: analysis?.quality.qualityScore,
      isValid: analysis?.isValid,
    };

    setRecordings(prev => [newRecording, ...prev.slice(0, 4)]); // Keep last 5
  };

  const handleError = (error: string) => {
    console.error('Recording error:', error);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Audio Recording System
          </h1>
          <p className="text-gray-600">
            Test the new audio recording features with quality analysis,
            compression, and enhanced playback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recording Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Recording */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-blue-600" />
                  Basic Audio Recording
                </CardTitle>
                <CardDescription>
                  Standard recording with quality analysis enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onError={handleError}
                  maxDuration={120}
                  enableQualityAnalysis={true}
                  enableCompression={false}
                  sessionId="test-session-1"
                  questionId="test-question-1"
                />
              </CardContent>
            </Card>

            {/* Advanced Recording with Compression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Advanced Recording with Compression
                </CardTitle>
                <CardDescription>
                  Recording with audio compression and extended analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onError={handleError}
                  maxDuration={180}
                  enableQualityAnalysis={true}
                  enableCompression={true}
                  sessionId="test-session-2"
                  questionId="test-question-2"
                />
              </CardContent>
            </Card>

            {/* Last Recording Analysis */}
            {lastRecording && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5 text-green-600" />
                    Last Recording Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatTime(lastRecording.duration)}
                      </div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatFileSize(lastRecording.blob.size)}
                      </div>
                      <div className="text-sm text-gray-500">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {lastRecording.analysis?.quality.qualityScore
                          ? Math.round(
                              lastRecording.analysis.quality.qualityScore
                            )
                          : 'N/A'}
                        %
                      </div>
                      <div className="text-sm text-gray-500">Quality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {lastRecording.analysis?.quality.averageVolume
                          ? Math.round(
                              lastRecording.analysis.quality.averageVolume * 100
                            )
                          : 'N/A'}
                        %
                      </div>
                      <div className="text-sm text-gray-500">Avg Volume</div>
                    </div>
                  </div>

                  {lastRecording.analysis && (
                    <div className="space-y-3">
                      {/* Quality Status */}
                      <div className="flex items-center gap-2">
                        {lastRecording.analysis.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-medium">
                          {lastRecording.analysis.isValid
                            ? 'Good Quality'
                            : 'Quality Issues Detected'}
                        </span>
                      </div>

                      {/* Technical Details */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-800 mb-2">
                          Technical Details:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            Sample Rate:{' '}
                            {lastRecording.analysis.quality.sampleRate} Hz
                          </div>
                          <div>
                            Bit Rate: {lastRecording.analysis.quality.bitRate}{' '}
                            kbps
                          </div>
                          <div>
                            Silence:{' '}
                            {Math.round(
                              lastRecording.analysis.quality.silencePercentage
                            )}
                            %
                          </div>
                          <div>Channels: Mono</div>
                        </div>
                      </div>

                      {/* Issues */}
                      {lastRecording.analysis.issues.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                              Issues Found:
                            </span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {lastRecording.analysis.issues.map(
                              (issue, index) => (
                                <li key={index}>• {issue}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {lastRecording.analysis.recommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              Recommendations:
                            </span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {lastRecording.analysis.recommendations.map(
                              (rec, index) => (
                                <li key={index}>• {rec}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Real-time quality analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Audio compression options</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Enhanced playback controls</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Download recordings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Quality recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Session-based storage</span>
                </div>
              </CardContent>
            </Card>

            {/* Recording History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Recordings</CardTitle>
                <CardDescription>
                  Last {recordings.length} recordings from this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordings.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No recordings yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map(recording => (
                      <div key={recording.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {recording.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {recording.isValid !== undefined && (
                            <Badge
                              variant={
                                recording.isValid ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {recording.isValid ? 'Valid' : 'Issues'}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Duration: {formatTime(recording.duration)}</div>
                          <div>Size: {formatFileSize(recording.size)}</div>
                          {recording.qualityScore !== undefined && (
                            <>
                              <div>
                                Quality: {Math.round(recording.qualityScore)}%
                              </div>
                              <div>Type: WebM</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>
                  1. <strong>Allow microphone access</strong> when prompted
                </p>
                <p>
                  2. <strong>Record a short response</strong> (10-30 seconds)
                </p>
                <p>
                  3. <strong>Check the quality analysis</strong> results
                </p>
                <p>
                  4. <strong>Try different scenarios:</strong>
                </p>
                <ul className="ml-4 space-y-1 text-xs">
                  <li>• Speak very quietly (low volume test)</li>
                  <li>• Include long pauses (silence test)</li>
                  <li>• Record very short clips (&lt;3 seconds)</li>
                  <li>• Test the download feature</li>
                </ul>
                <p>
                  5. <strong>Compare</strong> basic vs compressed recordings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
