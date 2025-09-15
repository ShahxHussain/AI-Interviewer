'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
  isEnabled: boolean;
  className?: string;
  onError?: (error: string) => void;
  onVideoReady?: (videoElement: HTMLVideoElement) => void;
}

export function CameraFeed({
  isEnabled,
  className = '',
  onError,
  onVideoReady,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Check if camera is supported
  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices;

  const startCamera = async () => {
    console.log('CameraFeed: Starting camera...');
    if (!isSupported) {
      const errorMsg = 'Camera is not supported in this browser';
      console.error('CameraFeed:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('CameraFeed: Requesting camera access...');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Front-facing camera
        },
        audio: false, // We handle audio separately
      });

      console.log('CameraFeed: Camera access granted, stream:', stream);
      console.log('CameraFeed: Video tracks:', stream.getVideoTracks());
      console.log('CameraFeed: Video track settings:', stream.getVideoTracks()[0]?.getSettings());

      streamRef.current = stream;
      setHasPermission(true);

      // Set video source
      if (videoRef.current) {
        console.log('CameraFeed: Setting video source object');
        console.log('CameraFeed: Stream object:', stream);
        console.log('CameraFeed: Video element before:', videoRef.current);
        
        // Clear any existing event listeners
        videoRef.current.onloadedmetadata = null;
        videoRef.current.oncanplay = null;
        videoRef.current.onplaying = null;
        videoRef.current.onerror = null;
        
        // Set the stream
        try {
          // Ensure video element is ready
          if (videoRef.current.readyState === 0) {
            console.log('CameraFeed: Video element not ready, waiting...');
            videoRef.current.load();
          }
          
          videoRef.current.srcObject = stream;
          console.log('CameraFeed: Video srcObject set to:', videoRef.current.srcObject);
          console.log('CameraFeed: Stream tracks:', stream.getTracks().length);
          console.log('CameraFeed: Video tracks in stream:', stream.getVideoTracks().length);
          
          // Verify the stream was set
          if (videoRef.current.srcObject !== stream) {
            console.error('CameraFeed: srcObject not set correctly, retrying...');
            // Force set again
            videoRef.current.srcObject = null;
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                console.log('CameraFeed: Retry - Video srcObject set to:', videoRef.current.srcObject);
              }
            }, 100);
          }
        } catch (error) {
          console.error('CameraFeed: Error setting video source:', error);
        }
        
        console.log('CameraFeed: Video element after:', videoRef.current);
        
        // Wait for the video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('CameraFeed: Video metadata loaded, starting playback');
          videoRef.current?.play().catch(err => {
            console.error('CameraFeed: Error playing video:', err);
          });
        };
        
        videoRef.current.oncanplay = () => {
          console.log('CameraFeed: Video can start playing');
          // Try to play again when it can play
          videoRef.current?.play().catch(err => {
            console.error('CameraFeed: Error playing video (oncanplay):', err);
          });
        };
        
        videoRef.current.onplaying = () => {
          console.log('CameraFeed: Video is now playing');
        };
        
        videoRef.current.onerror = (e) => {
          console.error('CameraFeed: Video error:', e);
        };
        
        // Force play immediately and after a short delay
        const tryPlay = () => {
          if (videoRef.current) {
            console.log('CameraFeed: Attempting to play video, readyState:', videoRef.current.readyState);
            console.log('CameraFeed: Video srcObject before play:', videoRef.current.srcObject);
            videoRef.current.play().catch(err => {
              console.error('CameraFeed: Error playing video (tryPlay):', err);
            });
          }
        };
        
        // Try to play immediately
        tryPlay();
        
        // Try again after a short delay
        setTimeout(tryPlay, 100);
        setTimeout(tryPlay, 500);
        setTimeout(tryPlay, 1000);
        
        // Additional approach: force load and play
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState < 2) {
            console.log('CameraFeed: Forcing video load');
            videoRef.current.load();
            setTimeout(tryPlay, 200);
          }
        }, 200);
        
        // Final fallback: recreate video element if needed
        setTimeout(() => {
          if (videoRef.current && !videoRef.current.srcObject) {
            console.log('CameraFeed: srcObject still not set, trying final approach');
            // Force set the stream again
            videoRef.current.srcObject = stream;
            console.log('CameraFeed: Final attempt - Video srcObject set to:', videoRef.current.srcObject);
            tryPlay();
          }
        }, 1500);
        
      } else {
        console.error('CameraFeed: videoRef.current is null!');
      }
    } catch (err) {
      let errorMsg = 'Failed to access camera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg =
            'Camera access denied. Please allow camera access and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Camera is already in use by another application.';
        } else {
          errorMsg = err.message;
        }
      }

      setError(errorMsg);
      setHasPermission(false);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Video ref callback to ensure proper setup
  const setVideoRef = (element: HTMLVideoElement | null) => {
    if (element) {
      console.log('CameraFeed: Video element ref set, configuring...');
      videoRef.current = element;
      // Ensure video element has proper attributes
      element.autoplay = true;
      element.playsInline = true;
      element.muted = true;
      element.controls = false;
      setVideoReady(true);
      console.log('CameraFeed: Video element configured and ready');
      
      // Notify parent component that video element is ready
      onVideoReady?.(element);
    }
  };

  // Ensure video element is properly configured
  useEffect(() => {
    if (videoRef.current) {
      console.log('CameraFeed: Video element mounted, configuring...');
      // Ensure video element has proper attributes
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;
      videoRef.current.controls = false;
      setVideoReady(true);
    }
  }, []);

  // Start/stop camera based on isEnabled prop
  useEffect(() => {
    console.log('CameraFeed: isEnabled changed to:', isEnabled);
    if (isEnabled && videoReady) {
      startCamera();
    } else if (!isEnabled) {
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isEnabled, videoReady]);

  // Handle video element errors
  const handleVideoError = () => {
    const errorMsg = 'Video playback failed';
    setError(errorMsg);
    onError?.(errorMsg);
  };

  if (!isSupported) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${className}`}
      >
        <div className="text-center text-gray-400">
          <CameraOff className="h-16 w-16 mx-auto mb-4" />
          <p>Camera not supported</p>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${className}`}
      >
        <div className="text-center text-gray-400">
          <CameraOff className="h-16 w-16 mx-auto mb-4" />
          <p>Camera is off</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${className}`}
      >
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Starting camera...</p>
        </div>
      </div>
    );
  }

  if (error || hasPermission === false) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 ${className}`}
      >
        <div className="text-center text-red-400 max-w-sm px-4">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-sm">{error}</p>
          {hasPermission === false && (
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 ${className}`} style={{ minHeight: '200px' }}>
      <video
        ref={setVideoRef}
        autoPlay
        playsInline
        muted
        onError={handleVideoError}
        className="w-full h-full object-cover"
        style={{ 
          transform: 'scaleX(-1)', // Mirror the video for a more natural feel
          minHeight: '200px',
          backgroundColor: '#1f2937', // Fallback background color
          display: 'block',
          width: '100%',
          height: '100%'
        }}
        onLoadStart={() => console.log('CameraFeed: Video load started')}
        onLoadedData={() => console.log('CameraFeed: Video data loaded')}
        onLoadedMetadata={() => console.log('CameraFeed: Video metadata loaded')}
        onCanPlay={() => console.log('CameraFeed: Video can play')}
        onCanPlayThrough={() => console.log('CameraFeed: Video can play through')}
        onPlay={() => console.log('CameraFeed: Video play event')}
        onPlaying={() => console.log('CameraFeed: Video playing event')}
        onPause={() => console.log('CameraFeed: Video pause event')}
        onEnded={() => console.log('CameraFeed: Video ended event')}
        onStalled={() => console.log('CameraFeed: Video stalled event')}
        onSuspend={() => console.log('CameraFeed: Video suspend event')}
        onWaiting={() => console.log('CameraFeed: Video waiting event')}
      />

      {/* Camera indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs">Live</span>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="absolute bottom-4 left-4 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        <div>Stream: {streamRef.current ? 'Active' : 'None'}</div>
        <div>Video: {videoRef.current?.readyState || 'N/A'}</div>
        <div>Playing: {videoRef.current?.paused === false ? 'Yes' : 'No'}</div>
        <div>Src: {videoRef.current?.srcObject ? 'Set' : 'None'}</div>
        <div>Ready: {videoReady ? 'Yes' : 'No'}</div>
        <div>Error: {videoRef.current?.error?.message || 'None'}</div>
      </div>
      
      {/* Manual play button (fallback) */}
      {streamRef.current && videoRef.current?.paused && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => {
              console.log('CameraFeed: Manual play button clicked');
              videoRef.current?.play().catch(err => {
                console.error('CameraFeed: Manual play error:', err);
              });
            }}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            ▶ Play
          </button>
        </div>
      )}
    </div>
  );
}
