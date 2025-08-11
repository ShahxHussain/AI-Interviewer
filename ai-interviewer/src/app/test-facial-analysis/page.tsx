'use client';

import React from 'react';
import { VideoRecorder } from '@/components/interview/VideoRecorder';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Brain, Eye, Smile } from 'lucide-react';

export default function TestFacialAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Compact Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Facial Analysis Test
          </h1>
          <p className="text-sm text-gray-600">
            Real-time emotion detection, eye contact tracking, and mood analysis
          </p>
        </div>

        {/* Main Content - Single Row Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
          {/* Video Recorder - Takes up 2 columns */}
          <div className="xl:col-span-2">
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
              showQuickTest={true} // Enable 20-second quick test
            />
          </div>

          {/* Right Sidebar - Compact Instructions */}
          <div className="xl:col-span-2 space-y-3 overflow-y-auto max-h-full">
            {/* Quick Features Overview */}
            <Card className="p-3 bg-blue-50">
              <h3 className="font-semibold mb-2 text-blue-900 flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                AI Features
              </h3>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">Eye Contact Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Emotion Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="h-3 w-3 text-purple-600" />
                  <span className="font-medium">Head Pose Estimation</span>
                </div>
              </div>
            </Card>

            {/* Quick Test Options */}
            <Card className="p-3 bg-orange-50">
              <h3 className="font-semibold mb-2 text-sm text-orange-900">
                Quick Test
              </h3>
              <div className="space-y-2">
                <p className="text-xs text-orange-700">
                  Try the 20-second analysis test for quick results
                </p>
                <div className="text-xs text-orange-600">
                  <p>• Automatic recording for 20 seconds</p>
                  <p>• Instant analysis summary</p>
                  <p>• Perfect for quick testing</p>
                </div>
              </div>
            </Card>

            {/* Quick Instructions */}
            <Card className="p-3">
              <h3 className="font-semibold mb-2 text-sm">Quick Start</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p>1. Allow camera permissions</p>
                <p>
                  2. Click &quot;Start Recording&quot; or &quot;20s Test&quot;
                </p>
                <p>3. Look at camera & try different expressions</p>
                <p>4. Watch real-time analysis below</p>
              </div>
            </Card>

            {/* Emotions to Test - Compact Grid */}
            <Card className="p-3">
              <h3 className="font-semibold mb-2 text-sm">Test Emotions</h3>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { name: 'Happy', emoji: '😊' },
                  { name: 'Neutral', emoji: '😐' },
                  { name: 'Surprised', emoji: '😮' },
                  { name: 'Sad', emoji: '😢' },
                  { name: 'Angry', emoji: '😠' },
                  { name: 'Fearful', emoji: '😨' },
                ].map(emotion => (
                  <div
                    key={emotion.name}
                    className="text-center p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-lg mb-1">{emotion.emoji}</div>
                    <div className="font-medium">{emotion.name}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Technical Info - Compact */}
            <Card className="p-3 bg-gray-50">
              <h3 className="font-semibold mb-2 text-sm">Technical Info</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">1 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection:</span>
                  <span className="font-medium">TinyFaceDetector</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emotions:</span>
                  <span className="font-medium">7 types</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Landmarks:</span>
                  <span className="font-medium">68 points</span>
                </div>
              </div>
            </Card>

            {/* Status Indicator */}
            <Card className="p-3 bg-green-50">
              <h3 className="font-semibold mb-2 text-sm text-green-900">
                Status
              </h3>
              <div className="text-xs text-green-700">
                <p>✓ Face-api.js models loaded</p>
                <p>✓ Real-time analysis ready</p>
                <p>✓ Camera detection active</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
