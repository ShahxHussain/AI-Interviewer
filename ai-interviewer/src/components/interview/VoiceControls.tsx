'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipForward,
  Settings,
  TestTube,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';
import { InterviewerType } from '@/types';

interface VoiceControlsProps {
  interviewer: InterviewerType;
  className?: string;
  showQueue?: boolean;
  showSettings?: boolean;
}

export function VoiceControls({
  interviewer,
  className = '',
  showQueue = true,
  showSettings = true,
}: VoiceControlsProps) {
  const {
    isLoading,
    isPlaying,
    error,
    synthesizeAndPlay,
    play,
    pause,
    stop,
    currentAudio,
  } = useVoiceSynthesis({
    interviewer,
    autoPlay: false,
  });

  const handleTestVoice = async () => {
    const sampleText =
      'This is a test of the voice synthesis system. How does it sound?';
    try {
      await synthesizeAndPlay(sampleText);
    } catch (error) {
      console.error('Voice test failed:', error);
    }
  };

  const handleSpeak = async () => {
    const sampleText =
      'This is a test of the voice synthesis system. How does it sound?';
    try {
      await synthesizeAndPlay(sampleText);
    } catch (error) {
      console.error('Voice synthesis failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'synthesizing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'playing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Controls
          </CardTitle>
          <CardDescription>
            Control AI interviewer voice synthesis and playback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Button variant="outline" size="sm" onClick={pause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSpeak}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              disabled={!isPlaying}
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={isLoading}
            >
              <TestTube className="h-4 w-4" />
              Test Voice
            </Button>
          </div>

          {/* Status Display */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={isPlaying ? 'default' : 'secondary'}>
                {isPlaying ? 'Playing' : 'Idle'}
              </Badge>
            </div>
          </div>

          {/* Current Audio Progress */}
          {currentAudio && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>
                  {Math.floor(currentAudio.currentTime)}s /{' '}
                  {Math.floor(currentAudio.duration)}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentAudio.currentTime / currentAudio.duration) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
