'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useFacialAnalysis } from '@/hooks/useFacialAnalysis';

export default function TestFacialAnalysisPage() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const {
    isInitialized,
    isAnalyzing,
    isLoading,
    error,
    initialize,
    startAnalysis,
    stopAnalysis,
    currentAnalysis,
    metrics,
  } = useFacialAnalysis({
    analysisInterval: 1000,
    autoStart: false,
    onError: (error) => {
      console.error('Facial analysis error:', error);
    },
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const handleStartAnalysis = async () => {
    if (videoRef.current) {
      await startAnalysis(videoRef.current);
    }
  };

  const handleStopAnalysis = () => {
    stopAnalysis();
  };

  useEffect(() => {
    if (!isInitialized && !isLoading && !error) {
      console.log('Initializing facial analysis...');
      initialize();
    }
  }, [isInitialized, isLoading, error, initialize]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Facial Analysis Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-300">Initialized</div>
                <div className={`font-bold ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
                  {isInitialized ? 'YES' : 'NO'}
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-300">Loading</div>
                <div className={`font-bold ${isLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {isLoading ? 'YES' : 'NO'}
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-300">Analyzing</div>
                <div className={`font-bold ${isAnalyzing ? 'text-green-400' : 'text-red-400'}`}>
                  {isAnalyzing ? 'YES' : 'NO'}
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-300">Error</div>
                <div className={`font-bold ${error ? 'text-red-400' : 'text-gray-400'}`}>
                  {error ? 'YES' : 'NO'}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900 border border-red-700 p-4 rounded text-red-200">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
              <Button
                onClick={isCameraOn ? stopCamera : startCamera}
                className={isCameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {isCameraOn ? 'Stop Camera' : 'Start Camera'}
              </Button>
              
              <Button
                onClick={isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                disabled={!isCameraOn || !isInitialized}
                className={isAnalyzing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
              </Button>
            </div>

            {/* Video */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto bg-gray-800 rounded"
                style={{ transform: 'scaleX(-1)' }}
              />
              {isCameraOn && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                  LIVE
                </div>
              )}
            </div>

            {/* Current Analysis */}
            {currentAnalysis && (
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Current Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-300">Eye Contact</div>
                      <div className={`font-bold ${currentAnalysis.eyeContact ? 'text-green-400' : 'text-red-400'}`}>
                        {currentAnalysis.eyeContact ? 'YES' : 'NO'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Confidence</div>
                      <div className="text-white font-bold">
                        {(currentAnalysis.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Emotions</div>
                      <div className="text-white text-xs">
                        {Object.entries(currentAnalysis.emotions)
                          .filter(([_, value]) => value > 0.1)
                          .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
                          .join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Head Pose</div>
                      <div className="text-white text-xs">
                        P: {currentAnalysis.headPose.pitch.toFixed(2)}<br/>
                        Y: {currentAnalysis.headPose.yaw.toFixed(2)}<br/>
                        R: {currentAnalysis.headPose.roll.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metrics */}
            {metrics.totalAnalysisTime > 0 && (
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-300">Eye Contact %</div>
                      <div className="text-white font-bold">
                        {metrics.eyeContactPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Avg Confidence</div>
                      <div className="text-white font-bold">
                        {(metrics.averageConfidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Dominant Emotion</div>
                      <div className="text-white font-bold capitalize">
                        {metrics.dominantEmotion}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-300">Analysis Time</div>
                      <div className="text-white font-bold">
                        {(metrics.totalAnalysisTime / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}