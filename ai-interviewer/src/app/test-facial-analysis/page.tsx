'use client';

import React from 'react';
import { VideoRecorder } from '@/components/interview/VideoRecorder';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Brain, Eye, Smile } from 'lucide-react';

export default function TestFacialAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Facial Analysis Test
          </h1>
          <p className="text-gray-600">
            Test the real-time facial analysis system with emotion detection,
            eye contact tracking, and mood analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Recorder */}
          <div className="lg:col-span-2">
            <VideoRecorder
              onRecordingComplete={videoBlob => {
                console.log('Video recording completed:', videoBlob);
                alert(
                  `Video recorded successfully! Size: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`
                );
              }}
              onError={error => {
                console.error('Video recording error:', error);
                alert(`Video recording error: ${error}`);
              }}
              maxDuration={120} // 2 minutes for testing
              enableFacialAnalysis={true}
            />
          </div>

          {/* Instructions and Features */}
          <div className="space-y-6">
            {/* Features Card */}
            <Card className="p-6 bg-blue-50">
              <h2 className="text-xl font-semibold mb-4 text-blue-900 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Features
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Eye Contact Tracking</p>
                    <p className="text-xs text-gray-600">
                      Monitors gaze direction and engagement
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Smile className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Emotion Detection</p>
                    <p className="text-xs text-gray-600">
                      Real-time facial expression analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Camera className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Head Pose Estimation</p>
                    <p className="text-xs text-gray-600">
                      Tracks head position and orientation
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Testing Instructions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Testing Instructions
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">1. Setup</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Allow camera and microphone permissions</li>
                    <li>• Ensure good lighting on your face</li>
                    <li>• Position camera at eye level</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">2. Recording</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Click &quot;Start Recording&quot; to begin</li>
                    <li>• Look directly at the camera</li>
                    <li>• Try different facial expressions</li>
                    <li>• Move your head slightly to test pose detection</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">3. Analysis</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Watch real-time emotion scores</li>
                    <li>• Monitor eye contact percentage</li>
                    <li>• Observe mood timeline changes</li>
                    <li>• Check overall performance metrics</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Emotions to Test */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Emotions to Test</h2>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: 'Happy',
                    emoji: '😊',
                    color: 'bg-green-100 text-green-800',
                  },
                  {
                    name: 'Neutral',
                    emoji: '😐',
                    color: 'bg-gray-100 text-gray-800',
                  },
                  {
                    name: 'Surprised',
                    emoji: '😮',
                    color: 'bg-yellow-100 text-yellow-800',
                  },
                  {
                    name: 'Sad',
                    emoji: '😢',
                    color: 'bg-blue-100 text-blue-800',
                  },
                  {
                    name: 'Angry',
                    emoji: '😠',
                    color: 'bg-red-100 text-red-800',
                  },
                  {
                    name: 'Fearful',
                    emoji: '😨',
                    color: 'bg-purple-100 text-purple-800',
                  },
                ].map(emotion => (
                  <Badge
                    key={emotion.name}
                    variant="outline"
                    className={`${emotion.color} justify-center py-2`}
                  >
                    <span className="mr-2">{emotion.emoji}</span>
                    {emotion.name}
                  </Badge>
                ))}
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Try expressing these emotions during recording to test the
                detection accuracy.
              </p>
            </Card>

            {/* Technical Info */}
            <Card className="p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Technical Details</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Frequency:</span>
                  <span className="font-medium">1 Hz (every second)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Face Detection:</span>
                  <span className="font-medium">TinyFaceDetector</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emotion Model:</span>
                  <span className="font-medium">FaceExpressionNet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Landmarks:</span>
                  <span className="font-medium">68-point model</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
