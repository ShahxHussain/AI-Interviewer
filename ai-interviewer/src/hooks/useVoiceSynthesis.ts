import { useState, useCallback, useRef, useEffect } from 'react';
import { InterviewerType, VoiceSynthesisResponse } from '@/types';
import { voiceService } from '@/lib/services/voice-service';

interface UseVoiceSynthesisOptions {
  interviewer: InterviewerType;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceSynthesisReturn {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  synthesizeAndPlay: (text: string, speed?: number) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  currentAudio: HTMLAudioElement | null;
}

export function useVoiceSynthesis(
  options: UseVoiceSynthesisOptions
): UseVoiceSynthesisReturn {
  const {
    interviewer,
    autoPlay = false,
    onPlayStart,
    onPlayEnd,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const synthesizeAndPlay = useCallback(
    async (text: string, speed: number = 1.0) => {
      try {
        setIsLoading(true);
        setError(null);

        // Use Web Speech API directly in the browser
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);

          // Configure voice based on interviewer type
          const voices = speechSynthesis.getVoices();
          let selectedVoice = voices.find(
            voice =>
              voice.lang.startsWith('en') &&
              (interviewer === 'hr-manager' || interviewer === 'recruiter'
                ? voice.name.toLowerCase().includes('female')
                : voice.name.toLowerCase().includes('male'))
          );

          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.rate = speed;
          utterance.pitch = interviewer === 'product-manager' ? 0.8 : 1.0;
          utterance.volume = 1.0;

          utterance.onstart = () => {
            setIsLoading(false);
            setIsPlaying(true);
            onPlayStart?.();
          };

          utterance.onend = () => {
            setIsPlaying(false);
            onPlayEnd?.();
          };

          utterance.onerror = () => {
            const errorMsg = 'Speech synthesis failed';
            setError(errorMsg);
            setIsPlaying(false);
            setIsLoading(false);
            onError?.(errorMsg);
          };

          // Stop any current speech
          speechSynthesis.cancel();

          // Start speaking
          speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported');
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Voice synthesis not available';
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
      }
    },
    [interviewer, autoPlay, onPlayStart, onPlayEnd, onError]
  );

  const play = useCallback(() => {
    // Web Speech API doesn't support resume, so we can't implement play
    if (!isPlaying) {
      const errorMsg = 'Cannot resume speech synthesis';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isPlaying, onError]);

  const pause = useCallback(() => {
    if (
      isPlaying &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return {
    isLoading,
    isPlaying,
    error,
    synthesizeAndPlay,
    play,
    pause,
    stop,
    currentAudio,
  };
}
