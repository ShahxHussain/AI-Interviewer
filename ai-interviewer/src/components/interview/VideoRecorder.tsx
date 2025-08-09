'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Square,
  Download,
  Trash2,
  Camera,
  Settings,
} from 'lucide-react';
import { useFacialAnalysis } from '@/hooks/useFacialAnalysis';
import { FacialAnalysisDisplay } from './FacialAnalysisDisplay';

interface VideoRecorderProps {
  onRecordingComplete?: (videoBlob: Blob, audioBlob?: Blob) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
  enableFacialAnalysis?: boolean;
}

interface MediaDevices {
  video: MediaDeviceInfo[];
  audio: MediaDeviceInfo[];
}

export function VideoRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes default
  className = '',
  enableFacialAnalysis = true,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [devices, setDevices] = useState<MediaDevices>({
    video: [],
    audio: [],
  });
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Facial analysis hook
  const {
    isInitialized: isFacialAnalysisReady,
    isAnalyzing: isFacialAnalysisRunning,
    currentAnalysis,
    metrics,
    startAnalysis: startFacialAnalysis,
    stopAnalysis: stopFacialAnalysis,
    reset: resetFacialAnalysis,
    getAnalysisSummary,
  } = useFacialAnalysis({
    analysisInterval: 1000,
    autoStart: enableFacialAnalysis,
    onError: error => {
      console.error('Facial analysis error:', error);
      // Don't propagate facial analysis errors as critical errors
    },
  });

  // Get available media devices
  const getMediaDevices = useCallback(async () => {
    try {
      // First request permissions to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === 'videoinput'
      );
      const audioDevices = devices.filter(
        device => device.kind === 'audioinput'
      );

      console.log(
        'Available video devices:',
        videoDevices.map(d => ({
          deviceId: d.deviceId,
          label: d.label,
          groupId: d.groupId,
        }))
      );

      setDevices({ video: videoDevices, audio: audioDevices });

      // Set default devices if none selected
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting media devices:', error);
      // Try without requesting permissions first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          device => device.kind === 'videoinput'
        );
        const audioDevices = devices.filter(
          device => device.kind === 'audioinput'
        );
        setDevices({ video: videoDevices, audio: audioDevices });
      } catch (fallbackError) {
        onError?.('Failed to get media devices');
      }
    }
  }, [selectedVideoDevice, selectedAudioDevice, onError]);

  // Request permissions and start camera preview
  const requestPermissions = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: isVideoEnabled
          ? {
              deviceId: selectedVideoDevice
                ? { exact: selectedVideoDevice }
                : undefined,
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              frameRate: { ideal: 30, min: 15 },
              facingMode: 'user', // Prefer front-facing camera
            }
          : false,
        audio: isAudioEnabled
          ? {
              deviceId: selectedAudioDevice
                ? { exact: selectedAudioDevice }
                : undefined,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100,
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && isVideoEnabled) {
        videoRef.current.srcObject = stream;
      }

      setHasPermissions(true);
      await getMediaDevices();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      onError?.(
        'Failed to access camera/microphone. Please check permissions.'
      );
      setHasPermissions(false);
    }
  }, [
    selectedVideoDevice,
    selectedAudioDevice,
    isVideoEnabled,
    isAudioEnabled,
    getMediaDevices,
    onError,
  ]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await requestPermissions();
      if (!streamRef.current) return;
    }

    try {
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        onRecordingComplete?.(blob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start facial analysis if enabled and video element is available
      if (enableFacialAnalysis && videoRef.current && isFacialAnalysisReady) {
        await startFacialAnalysis(videoRef.current);
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording');
    }
  }, [
    requestPermissions,
    maxDuration,
    onRecordingComplete,
    onError,
    enableFacialAnalysis,
    isFacialAnalysisReady,
    startFacialAnalysis,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop facial analysis
      if (isFacialAnalysisRunning) {
        stopFacialAnalysis();
      }
    }
  }, [isRecording, isFacialAnalysisRunning, stopFacialAnalysis]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  // Download recorded video
  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [recordedBlob]);

  // Clear recording
  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingTime(0);
    resetFacialAnalysis();
  }, [resetFacialAnalysis]);

  // Toggle video/audio
  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => !prev);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  }, [isAudioEnabled]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize on mount
  useEffect(() => {
    requestPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (isFacialAnalysisRunning) {
        stopFacialAnalysis();
      }
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Recording Card */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Video Recording</span>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  REC {formatTime(recordingTime)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {recordedBlob && (
                <Badge variant="secondary">Recording Ready</Badge>
              )}
              {enableFacialAnalysis && isFacialAnalysisReady && (
                <Badge variant="outline">AI Analysis Ready</Badge>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {hasPermissions && isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p>Camera {hasPermissions ? 'disabled' : 'not accessible'}</p>
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC {formatTime(recordingTime)}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Record/Stop Button */}
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={!hasPermissions}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}

              {/* Pause/Resume Button */}
              {isRecording && (
                <Button onClick={togglePause} variant="outline">
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}

              {/* Video Toggle */}
              <Button onClick={toggleVideo} variant="outline" size="sm">
                {isVideoEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>

              {/* Audio Toggle */}
              <Button onClick={toggleAudio} variant="outline" size="sm">
                {isAudioEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Recording Actions */}
            {recordedBlob && (
              <div className="flex items-center gap-2">
                <Button onClick={downloadRecording} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button onClick={clearRecording} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Device Selection */}
          {devices.video.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Camera ({devices.video.length} available):
                  </label>
                  <Button
                    onClick={getMediaDevices}
                    variant="outline"
                    size="sm"
                    disabled={isRecording}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Refresh
                  </Button>
                </div>
                <select
                  value={selectedVideoDevice}
                  onChange={e => setSelectedVideoDevice(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  disabled={isRecording}
                >
                  {devices.video.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Camera ${index + 1} (${device.deviceId.slice(0, 8)}...)`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  USB cameras should appear here automatically. Click refresh if
                  you just connected a camera.
                </p>
              </div>

              {devices.audio.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Microphone:
                  </label>
                  <select
                    value={selectedAudioDevice}
                    onChange={e => setSelectedAudioDevice(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    disabled={isRecording}
                  >
                    {devices.audio.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="text-sm text-gray-600">
            {!hasPermissions && (
              <p className="text-amber-600">
                Please allow camera and microphone access to record your
                responses.
              </p>
            )}
            {hasPermissions && !isRecording && !recordedBlob && (
              <p>
                Ready to record. Click &quot;Start Recording&quot; to begin.
              </p>
            )}
            {recordedBlob && (
              <p className="text-green-600">
                Recording completed! You can download or clear the recording.
              </p>
            )}
            {devices.video.length === 0 && hasPermissions && (
              <p className="text-amber-600">
                No cameras detected. Please connect a camera and click refresh.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Facial Analysis Display */}
      {enableFacialAnalysis && (
        <FacialAnalysisDisplay
          currentAnalysis={currentAnalysis}
          metrics={metrics}
          isAnalyzing={isFacialAnalysisRunning}
        />
      )}
    </div>
  );
}
