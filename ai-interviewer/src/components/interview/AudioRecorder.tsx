'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  className?: string;
  disabled?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  className = '',
  disabled = false,
}: AudioRecorderProps) {
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);

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
    onRecordingComplete: (blob, recordingDuration) => {
      const audioUrl = URL.createObjectURL(blob);
      setRecordedAudio({
        blob,
        url: audioUrl,
        duration: recordingDuration,
      });
      onRecordingComplete?.(blob, recordingDuration);
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

  const handlePlayRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio.url);
      audio.play();
    }
  };

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

        {/* Recorded Audio Playback */}
        {recordedAudio && !isRecording && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                Recording Complete
              </span>
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(recordedAudio.blob)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlayRecording}
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>

              <span className="text-sm text-green-700">
                Duration: {formatTime(recordedAudio.duration)}
              </span>
            </div>
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
