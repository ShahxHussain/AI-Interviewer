'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Play, Square } from 'lucide-react';

export default function CameraDebugPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const startCamera = async () => {
    console.log('Starting camera...');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      if (stream.getVideoTracks().length > 0) {
        const track = stream.getVideoTracks()[0];
        console.log('Video track settings:', track.getSettings());
        console.log('Video track constraints:', track.getConstraints());
        console.log('Video track capabilities:', track.getCapabilities());
      }

      streamRef.current = stream;
      setIsCameraOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play().catch(err => {
            console.error('Error playing video:', err);
            });
        };

        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };

        videoRef.current.onplaying = () => {
          console.log('Video is playing');
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
        };

        // Update debug info
        setDebugInfo({
          streamActive: !!stream,
          videoTracks: stream.getVideoTracks().length,
          videoReadyState: videoRef.current.readyState,
          videoPaused: videoRef.current.paused,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMsg = 'Failed to access camera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Camera access denied. Please allow camera access.';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No camera found. Please connect a camera.';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Camera is already in use by another application.';
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

    setIsCameraOn(false);
    setDebugInfo({});
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Update debug info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        setDebugInfo(prev => ({
          ...prev,
          videoReadyState: videoRef.current?.readyState,
          videoPaused: videoRef.current?.paused,
          videoWidth: videoRef.current?.videoWidth,
          videoHeight: videoRef.current?.videoHeight,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Camera Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Camera Feed</h2>
            
            <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Starting camera...</p>
        </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-red-400">
                    <CameraOff className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {!isLoading && !error && !isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <CameraOff className="h-16 w-16 mx-auto mb-4" />
                    <p>Camera is off</p>
                  </div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ 
                  transform: 'scaleX(-1)',
                  display: isCameraOn && !isLoading && !error ? 'block' : 'none'
                }}
              />
              
              {/* Status indicator */}
              {isCameraOn && !isLoading && !error && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs">Live</span>
                  </div>
                  </div>
                )}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={toggleCamera}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCameraOn
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : isCameraOn ? (
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Stop Camera
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Camera
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Debug Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Debug Information</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Camera Status:</span>
                  <span className={`ml-2 ${isCameraOn ? 'text-green-400' : 'text-red-400'}`}>
                    {isCameraOn ? 'ON' : 'OFF'}
                  </span>
                      </div>
                
                <div>
                  <span className="text-gray-400">Loading:</span>
                  <span className={`ml-2 ${isLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {isLoading ? 'YES' : 'NO'}
                  </span>
                    </div>
                
                <div>
                  <span className="text-gray-400">Stream Active:</span>
                  <span className={`ml-2 ${debugInfo.streamActive ? 'text-green-400' : 'text-red-400'}`}>
                    {debugInfo.streamActive ? 'YES' : 'NO'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Video Tracks:</span>
                  <span className="ml-2 text-white">{debugInfo.videoTracks || 0}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Video Ready State:</span>
                  <span className="ml-2 text-white">
                    {debugInfo.videoReadyState === 0 ? 'HAVE_NOTHING' :
                     debugInfo.videoReadyState === 1 ? 'HAVE_METADATA' :
                     debugInfo.videoReadyState === 2 ? 'HAVE_CURRENT_DATA' :
                     debugInfo.videoReadyState === 3 ? 'HAVE_FUTURE_DATA' :
                     debugInfo.videoReadyState === 4 ? 'HAVE_ENOUGH_DATA' :
                     debugInfo.videoReadyState || 'N/A'}
                  </span>
                      </div>
                
                <div>
                  <span className="text-gray-400">Video Playing:</span>
                  <span className={`ml-2 ${debugInfo.videoPaused === false ? 'text-green-400' : 'text-red-400'}`}>
                    {debugInfo.videoPaused === false ? 'YES' : 'NO'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Video Size:</span>
                  <span className="ml-2 text-white">
                    {debugInfo.videoWidth && debugInfo.videoHeight 
                      ? `${debugInfo.videoWidth}x${debugInfo.videoHeight}`
                      : 'N/A'
                    }
                  </span>
          </div>
                
                <div>
                  <span className="text-gray-400">Src Object:</span>
                  <span className={`ml-2 ${videoRef.current?.srcObject ? 'text-green-400' : 'text-red-400'}`}>
                    {videoRef.current?.srcObject ? 'SET' : 'NONE'}
                  </span>
        </div>

              <div>
                  <span className="text-gray-400">Video Error:</span>
                  <span className={`ml-2 ${videoRef.current?.error ? 'text-red-400' : 'text-green-400'}`}>
                    {videoRef.current?.error?.message || 'NONE'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Browser Support</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-400">MediaDevices:</span>
                  <span className={`ml-2 ${'mediaDevices' in navigator ? 'text-green-400' : 'text-red-400'}`}>
                    {('mediaDevices' in navigator) ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">getUserMedia:</span>
                  <span className={`ml-2 ${navigator.mediaDevices?.getUserMedia ? 'text-green-400' : 'text-red-400'}`}>
                    {navigator.mediaDevices?.getUserMedia ? 'YES' : 'NO'}
                  </span>
              </div>
              <div>
                  <span className="text-gray-400">HTTPS:</span>
                  <span className={`ml-2 ${location.protocol === 'https:' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {location.protocol === 'https:' ? 'YES' : 'NO (Required for camera access)'}
                  </span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}