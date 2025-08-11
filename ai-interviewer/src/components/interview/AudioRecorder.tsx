'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  AlertCircle,
  Volume2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Download,
  Settings,
} from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import {
  audioService,
  AudioQualityMetrics,
  AudioAnalysisResult,
  AudioPlayer,
} from '@/lib/services/audio-service';

interface AudioRecorderProps {
  onRecordingComplete?: (
    audioBlob: Blob,
    duration: number,
    analysis?: AudioAnalysisResult
  ) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  className?: string;
  disabled?: boolean;
  enableQualityAnalysis?: boolean;
  enableCompression?: boolean;
  sessionId?: string;
  questionId?: string;
}

export function AudioRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  className = '',
  disabled = false,
  enableQualityAnalysis = true,
  enableCompression = false,
  sessionId,
  questionId,
}: AudioRecorderProps) {
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
    analysis?: AudioAnalysisResult;
    player?: AudioPlayer;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  const {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
    isSupported,
  } = useAudioRecording({
    onRecordingComplete: async (blob, recordingDuration) => {
      setIsAnalyzing(true);

      try {
        let processedBlob = blob;
        let analysis: AudioAnalysisResult | undefined;

        // Apply compression if enabled
        if (enableCompression) {
          processedBlob = await audioService.compressAudio(blob, {
            quality: 'medium',
            targetBitRate: 128,
          });
        }

        // Analyze audio quality if enabled
        if (enableQualityAnalysis) {
          analysis = await audioService.validateAudioQuality(processedBlob);
        }

        // Create enhanced audio player
        const player = audioService.createAudioPlayer(processedBlob);
        const audioUrl = URL.createObjectURL(processedBlob);

        // Save audio response if session info provided
        if (sessionId && questionId) {
          await audioService.saveAudioResponse(
            processedBlob,
            sessionId,
            questionId
          );
        }

        setRecordedAudio({
          blob: processedBlob,
          url: audioUrl,
          duration: recordingDuration,
          analysis,
          player,
        });

        onRecordingComplete?.(processedBlob, recordingDuration, analysis);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to process audio';
        onError?.(errorMsg);
      } finally {
        setIsAnalyzing(false);
      }
    },
    onError,
    maxDuration,
  });

  const handleStartRecording = async () => {
    // Clear any previous recording
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
    }
    await startRecording();
  };

  const handlePlayRecording = useCallback(async () => {
    if (recordedAudio?.player) {
      try {
        await recordedAudio.player.play();
      } catch (error) {
        onError?.('Failed to play audio');
      }
    }
  }, [recordedAudio, onError]);

  const handleDownloadRecording = useCallback(() => {
    if (recordedAudio) {
      const link = document.createElement('a');
      link.href = recordedAudio.url;
      link.download = `recording_${Date.now()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [recordedAudio]);

  const handleRetryRecording = useCallback(async () => {
    if (recordedAudio) {
      recordedAudio.player?.destroy();
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
    }
    await handleStartRecording();
  }, [recordedAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordedAudio) {
        recordedAudio.player?.destroy();
        URL.revokeObjectURL(recordedAudio.url);
      }
    };
  }, [recordedAudio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (blob: Blob) => {
    const bytes = blob.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Audio recording is not supported in this browser
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Voice Response</span>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
          </div>

          {error && (
            <Badge variant="destructive" className="text-xs">
              {error}
            </Badge>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              disabled={disabled}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button onClick={pauseRecording} size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeRecording}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}

              <Button onClick={stopRecording} size="sm" variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Duration: {formatTime(duration)}</span>
              <span>Max: {formatTime(maxDuration)}</span>
            </div>

            {/* Audio Level Visualization */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Volume2 className="h-3 w-3" />
                <span>Audio Level</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-red-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(duration / maxDuration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Analysis Loading */}
        {isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">
                Analyzing audio quality...
              </span>
            </div>
          </div>
        )}

        {/* Recorded Audio Playback */}
        {recordedAudio && !isRecording && !isAnalyzing && (
          <div
            className={`border rounded-lg p-3 ${
              recordedAudio.analysis?.isValid === false
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-800">
                  Recording Complete
                </span>
                {recordedAudio.analysis &&
                  (recordedAudio.analysis.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ))}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(recordedAudio.blob)}
                </Badge>
                {recordedAudio.analysis && (
                  <Badge
                    variant={
                      recordedAudio.analysis.quality.qualityScore >= 70
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    Quality:{' '}
                    {Math.round(recordedAudio.analysis.quality.qualityScore)}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                onClick={handlePlayRecording}
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>

              <Button
                onClick={handleDownloadRecording}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>

              <Button
                onClick={handleRetryRecording}
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>

              {recordedAudio.analysis && (
                <Button
                  onClick={() => setShowQualityDetails(!showQualityDetails)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Details
                </Button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex items-center justify-between text-sm text-green-700 mb-2">
              <span>Duration: {formatTime(recordedAudio.duration)}</span>
              {recordedAudio.analysis && (
                <span>
                  Avg Volume:{' '}
                  {Math.round(
                    recordedAudio.analysis.quality.averageVolume * 100
                  )}
                  %
                </span>
              )}
            </div>

            {/* Quality Issues */}
            {recordedAudio.analysis &&
              recordedAudio.analysis.issues.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-800">
                      Quality Issues:
                    </span>
                  </div>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {recordedAudio.analysis.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Recommendations */}
            {recordedAudio.analysis &&
              recordedAudio.analysis.recommendations.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 rounded p-2 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">
                      Recommendations:
                    </span>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {recordedAudio.analysis.recommendations.map(
                      (rec, index) => (
                        <li key={index}>• {rec}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Detailed Quality Metrics */}
            {showQualityDetails && recordedAudio.analysis && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                <div className="text-xs font-medium text-gray-800 mb-2">
                  Audio Analysis Details:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    Sample Rate: {recordedAudio.analysis.quality.sampleRate} Hz
                  </div>
                  <div>
                    Bit Rate: {recordedAudio.analysis.quality.bitRate} kbps
                  </div>
                  <div>
                    Silence:{' '}
                    {Math.round(
                      recordedAudio.analysis.quality.silencePercentage
                    )}
                    %
                  </div>
                  <div>File Size: {formatFileSize(recordedAudio.blob)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !recordedAudio && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Click &quot;Start Recording&quot; to record your response. You can
            pause and resume as needed.
          </div>
        )}
      </div>
    </Card>
  );
}
