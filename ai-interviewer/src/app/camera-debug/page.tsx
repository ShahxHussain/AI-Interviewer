'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Mic,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
} from 'lucide-react';

export default function CameraDebugPage() {
  const [status, setStatus] = useState<string>('Not started');
  const [permissions, setPermissions] = useState<{
    camera: string;
    microphone: string;
  }>({ camera: 'unknown', microphone: 'unknown' });
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Camera Debug] ${message}`);
  };

  const checkPermissions = async () => {
    try {
      addLog('Checking permissions...');

      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices not available');
      }

      // Check permissions API if available
      if ('permissions' in navigator) {
        try {
          const cameraPermission = await navigator.permissions.query({
            name: 'camera' as PermissionName,
          });
          const micPermission = await navigator.permissions.query({
            name: 'microphone' as PermissionName,
          });

          setPermissions({
            camera: cameraPermission.state,
            microphone: micPermission.state,
          });

          addLog(`Camera permission: ${cameraPermission.state}`);
          addLog(`Microphone permission: ${micPermission.state}`);
        } catch (permError) {
          addLog(`Permission API error: ${permError}`);
        }
      }

      // Get devices (without labels initially)
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);

      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      const audioDevices = deviceList.filter(d => d.kind === 'audioinput');

      addLog(
        `Found ${videoDevices.length} video devices, ${audioDevices.length} audio devices`
      );

      deviceList.forEach((device, index) => {
        addLog(
          `Device ${index}: ${device.kind} - ${device.label || 'No label (need permissions)'} - ID: ${device.deviceId.slice(0, 8)}...`
        );
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addLog(`Error checking permissions: ${errorMsg}`);
    }
  };

  const requestBasicAccess = async () => {
    try {
      addLog('Requesting basic camera and microphone access...');
      setError('');
      setStatus('Requesting permissions...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      addLog('✅ Basic access granted!');
      addLog(`Video tracks: ${mediaStream.getVideoTracks().length}`);
      addLog(`Audio tracks: ${mediaStream.getAudioTracks().length}`);

      // Log track details
      mediaStream.getVideoTracks().forEach((track, index) => {
        addLog(
          `Video track ${index}: ${track.label} - ${track.kind} - enabled: ${track.enabled}`
        );
      });

      mediaStream.getAudioTracks().forEach((track, index) => {
        addLog(
          `Audio track ${index}: ${track.label} - ${track.kind} - enabled: ${track.enabled}`
        );
      });

      setStream(mediaStream);
      setStatus('Stream active');

      // Connect to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        addLog('Video element connected to stream');

        videoRef.current.onloadedmetadata = () => {
          addLog('Video metadata loaded');
          videoRef.current
            ?.play()
            .then(() => {
              addLog('Video playback started');
            })
            .catch(e => {
              addLog(`Video play error: ${e.message}`);
            });
        };
      }

      // Get devices again (now with labels)
      await checkPermissions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setStatus('Error');
      addLog(`❌ Error requesting access: ${errorMsg}`);

      if (err instanceof Error) {
        addLog(`Error name: ${err.name}`);
        addLog(`Error message: ${err.message}`);
      }
    }
  };

  const stopStream = () => {
    if (stream) {
      addLog('Stopping stream...');
      stream.getTracks().forEach(track => {
        track.stop();
        addLog(`Stopped ${track.kind} track: ${track.label}`);
      });
      setStream(null);
      setStatus('Stream stopped');

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog('Camera Debug Tool initialized');
    checkPermissions();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'prompt':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'prompt':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Camera & Microphone Debug Tool
          </h1>
          <p className="text-gray-600">
            Diagnose camera and microphone access issues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls and Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Stream Status:</span>
                  <Badge variant={stream ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Camera Permission:
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(permissions.camera)}
                      <span className={getStatusColor(permissions.camera)}>
                        {permissions.camera}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Microphone Permission:
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(permissions.microphone)}
                      <span className={getStatusColor(permissions.microphone)}>
                        {permissions.microphone}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Error:</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={requestBasicAccess}
                  disabled={!!stream}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Request Camera & Microphone Access
                </Button>

                <Button
                  onClick={stopStream}
                  disabled={!stream}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop Stream
                </Button>

                <Button
                  onClick={checkPermissions}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Device List
                </Button>
              </CardContent>
            </Card>

            {/* Device List */}
            <Card>
              <CardHeader>
                <CardTitle>Available Devices ({devices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No devices found</p>
                ) : (
                  <div className="space-y-2">
                    {devices.map((device, index) => (
                      <div key={device.deviceId} className="border rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          {device.kind === 'videoinput' ? (
                            <Camera className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Mic className="h-4 w-4 text-green-600" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {device.kind}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {device.label ||
                              `Device ${index + 1} (No label - need permissions)`}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ID: {device.deviceId.slice(0, 20)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Video Preview and Logs */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Camera className="h-12 w-12 mx-auto mb-2" />
                        <p>No video stream</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Debug Logs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Debug Logs</CardTitle>
                  <Button onClick={clearLogs} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg h-64 overflow-y-auto font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">No logs yet...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">If camera access fails:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>
                    Check browser permissions (click lock icon in address bar)
                  </li>
                  <li>
                    Close other apps using the camera (Zoom, Skype, Teams)
                  </li>
                  <li>Try a different browser (Chrome, Firefox, Edge)</li>
                  <li>Restart your browser</li>
                  <li>Check if camera is properly connected (USB cameras)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">Common error solutions:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>
                    <strong>NotAllowedError:</strong> Grant permissions in
                    browser
                  </li>
                  <li>
                    <strong>NotFoundError:</strong> Connect camera and refresh
                  </li>
                  <li>
                    <strong>NotReadableError:</strong> Close other apps using
                    camera
                  </li>
                  <li>
                    <strong>OverconstrainedError:</strong> Camera doesn&apos;t
                    support settings
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
