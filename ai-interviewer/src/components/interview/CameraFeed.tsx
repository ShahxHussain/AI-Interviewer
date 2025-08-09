'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
  isEnabled: boolean;
  className?: string;
  onError?: (error: string) => void;
}

export function CameraFeed({
  isEnabled,
  className = '',
  onError,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check if camera is supported
  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices;

  const startCamera = async () => {
    if (!isSupported) {
      const errorMsg = 'Camera is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Front-facing camera
        },
        audio: false, // We handle audio separately
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
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

  // Start/stop camera based on isEnabled prop
  useEffect(() => {
    if (isEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isEnabled]);

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
    <div className={`relative bg-gray-900 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onError={handleVideoError}
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video for a more natural feel
      />

      {/* Camera indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs">Live</span>
        </div>
      </div>
    </div>
  );
}
