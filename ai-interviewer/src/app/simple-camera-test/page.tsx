'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SimpleCameraTest() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      setError('');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('Camera stream obtained:', {
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element connected');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access failed';
      setError(errorMsg);
      console.error('Camera error:', err);
    }
  };

  const startRecording = async () => {
    if (!stream) {
      setError('No camera stream available');
      return;
    }

    try {
      console.log('Starting recording with stream:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        streamActive: stream.active,
      });

      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log('Final blob size:', blob.size, 'bytes');
        setRecordedBlob(blob);
        setIsRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log('MediaRecorder started');

      // Auto-stop after 5 seconds for testing
      setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
        }
      }, 5000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Recording failed';
      setError(errorMsg);
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Simple Camera Test</h1>
          <p className="text-gray-600">Basic camera and recording test</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {/* Video Preview */}
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
                <div className="w-full h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p>No camera stream</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!stream ? (
                <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button onClick={stopCamera} variant="outline">
                    Stop Camera
                  </Button>
                  
                  {!isRecording ? (
                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                      Start Recording (5s)
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive">
                      Stop Recording
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
                  Error: {error}
                </div>
              )}
              
              {stream && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800">
                  ✅ Camera is active ({stream.getVideoTracks().length} video, {stream.getAudioTracks().length} audio tracks)
                </div>
              )}
              
              {isRecording && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800">
                  🔴 Recording in progress...
                </div>
              )}
              
              {recordedBlob && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800">
                      📹 Recording complete: {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button onClick={downloadRecording} size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded p-4 text-sm text-gray-600">
              <h3 className="font-medium mb-2">Test Steps:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Start Camera" and allow permissions</li>
                <li>Verify you can see your camera feed</li>
                <li>Click "Start Recording" (will record for 5 seconds)</li>
                <li>Check the file size - should be more than 0 MB</li>
                <li>Download and play the recording to verify it works</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}