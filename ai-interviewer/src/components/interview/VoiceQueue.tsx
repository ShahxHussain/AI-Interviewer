'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  List,
  Trash2,
  Volume2,
  Loader2,
} from 'lucide-react';
import { InterviewerType } from '@/types';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';

interface QueueItem {
  id: string;
  text: string;
  interviewer: InterviewerType;
  speed?: number;
}

interface VoiceQueueProps {
  items: QueueItem[];
  autoPlay?: boolean;
  onItemComplete?: (item: QueueItem) => void;
  onQueueComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function VoiceQueue({
  items,
  autoPlay = false,
  onItemComplete,
  onQueueComplete,
  onError,
  className = '',
}: VoiceQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQueuePlaying, setIsQueuePlaying] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const currentItem = items[currentIndex];

  const { isLoading, isPlaying, error, synthesizeAndPlay, play, pause, stop } =
    useVoiceSynthesis({
      interviewer: currentItem?.interviewer || 'tech-lead',
      autoPlay: false,
      onPlayStart: () => {
        setIsQueuePlaying(true);
      },
      onPlayEnd: () => {
        handleItemComplete();
      },
      onError: err => {
        setIsQueuePlaying(false);
        onError?.(err);
      },
    });

  const handleItemComplete = useCallback(() => {
    if (currentItem) {
      onItemComplete?.(currentItem);
    }

    // Move to next item or complete queue
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsQueuePlaying(false);
      setCurrentIndex(0);
      onQueueComplete?.();
    }
  }, [
    currentItem,
    currentIndex,
    items.length,
    onItemComplete,
    onQueueComplete,
  ]);

  // Auto-play next item when queue is playing
  useEffect(() => {
    if (isQueuePlaying && currentItem && !isPlaying && !isLoading) {
      synthesizeAndPlay(currentItem.text, currentItem.speed);
    }
  }, [
    currentIndex,
    isQueuePlaying,
    currentItem,
    isPlaying,
    isLoading,
    synthesizeAndPlay,
  ]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      setIsQueuePlaying(false);
    } else if (currentItem) {
      if (isQueuePlaying) {
        play();
      } else {
        setIsQueuePlaying(true);
        synthesizeAndPlay(currentItem.text, currentItem.speed);
      }
    }
  };

  const handleStop = () => {
    stop();
    setIsQueuePlaying(false);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      stop();
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      stop();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToItem = (index: number) => {
    stop();
    setCurrentIndex(index);
    setShowQueue(false);
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

  if (!items.length) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No audio items in queue</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Voice Queue</span>
            <Badge variant="secondary">
              {currentIndex + 1} of {items.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {error && (
              <Badge variant="destructive" className="text-xs">
                {error}
              </Badge>
            )}

            <Button
              onClick={() => setShowQueue(!showQueue)}
              size="sm"
              variant="ghost"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Item */}
        {currentItem && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {getInterviewerDisplayName(currentItem.interviewer)}
              </Badge>
              {currentItem.speed && currentItem.speed !== 1.0 && (
                <Badge variant="secondary" className="text-xs">
                  {currentItem.speed}x speed
                </Badge>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentItem.text}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="sm"
              variant="outline"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Play/Pause Button */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
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

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={currentIndex === items.length - 1}
              size="sm"
              variant="outline"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Stop Button */}
            <Button
              onClick={handleStop}
              disabled={!isQueuePlaying && !isPlaying}
              size="sm"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Stop
            </Button>
          </div>

          {/* Progress */}
          <div className="text-sm text-gray-500">
            {isQueuePlaying && (
              <Badge variant="secondary" className="animate-pulse">
                Playing Queue
              </Badge>
            )}
          </div>
        </div>

        {/* Queue List */}
        {showQueue && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Queue Items</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    index === currentIndex
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleJumpToItem(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getInterviewerDisplayName(item.interviewer)}
                      </Badge>
                    </div>
                    {index === currentIndex && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
