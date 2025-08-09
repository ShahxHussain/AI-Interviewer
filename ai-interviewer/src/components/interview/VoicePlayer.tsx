'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { InterviewerType } from '@/types';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';

interface VoicePlayerProps {
  interviewer: InterviewerType;
  text: string;
  autoPlay?: boolean;
  showText?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export function VoicePlayer({
  interviewer,
  text,
  autoPlay = false,
  showText = true,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError,
}: VoicePlayerProps) {
  const [speed, setSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

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
    autoPlay,
    onPlayStart,
    onPlayEnd,
    onError,
  });

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentAudio) {
      play();
    } else {
      synthesizeAndPlay(text, speed);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (currentAudio) {
      currentAudio.playbackRate = newSpeed;
    }
  };

  const handleMuteToggle = () => {
    if (currentAudio) {
      currentAudio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getInterviewerDisplayName = (type: InterviewerType): string => {
    const names = {
      'tech-lead': 'Tech Lead',
      'hr-manager': 'HR Manager',
      'product-manager': 'Product Manager',
      recruiter: 'Recruiter',
    };
    return names[type];
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Voice Playback</span>
            <Badge variant="secondary">
              {getInterviewerDisplayName(interviewer)}
            </Badge>
          </div>

          {error && (
            <Badge variant="destructive" className="text-xs">
              {error}
            </Badge>
          )}
        </div>

        {/* Text Display */}
        {showText && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading || !text.trim()}
              size="sm"
              variant={isPlaying ? 'secondary' : 'default'}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
            </Button>

            {/* Stop Button */}
            <Button
              onClick={handleStop}
              disabled={
                !currentAudio || (!isPlaying && currentAudio?.currentTime === 0)
              }
              size="sm"
              variant="outline"
            >
              <Square className="h-4 w-4" />
            </Button>

            {/* Mute Button */}
            <Button
              onClick={handleMuteToggle}
              disabled={!currentAudio}
              size="sm"
              variant="ghost"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Speed:</span>
            {[0.75, 1.0, 1.25, 1.5].map(speedOption => (
              <Button
                key={speedOption}
                onClick={() => handleSpeedChange(speedOption)}
                size="sm"
                variant={speed === speedOption ? 'default' : 'ghost'}
                className="text-xs px-2 py-1 h-6"
              >
                {speedOption}x
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        {currentAudio && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {Math.floor((currentAudio.currentTime || 0) / 60)}:
                {Math.floor((currentAudio.currentTime || 0) % 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
              <span>
                {Math.floor((currentAudio.duration || 0) / 60)}:
                {Math.floor((currentAudio.duration || 0) % 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    currentAudio.duration
                      ? (currentAudio.currentTime / currentAudio.duration) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
