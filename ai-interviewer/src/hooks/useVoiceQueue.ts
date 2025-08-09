import { useState, useCallback } from 'react';
import { InterviewerType } from '@/types';

interface QueueItem {
  id: string;
  text: string;
  interviewer: InterviewerType;
  speed?: number;
}

interface UseVoiceQueueOptions {
  onItemComplete?: (item: QueueItem) => void;
  onQueueComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceQueueReturn {
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  addToQueue: (
    text: string,
    interviewer: InterviewerType,
    speed?: number
  ) => string;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  jumpToItem: (index: number) => void;
  getQueueLength: () => number;
  getCurrentItem: () => QueueItem | null;
  getNextItem: () => QueueItem | null;
  addQuestionSequence: (
    questions: string[],
    interviewer: InterviewerType,
    speed?: number
  ) => string[];
  addInterviewIntro: (
    interviewer: InterviewerType,
    candidateName?: string
  ) => string;
  addInterviewClosing: (interviewer: InterviewerType) => string;
}

export function useVoiceQueue(
  options: UseVoiceQueueOptions = {}
): UseVoiceQueueReturn {
  const { onItemComplete, onQueueComplete, onError } = options;

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const addToQueue = useCallback(
    (text: string, interviewer: InterviewerType, speed?: number): string => {
      const id = `queue-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: QueueItem = {
        id,
        text: text.trim(),
        interviewer,
        speed,
      };

      setQueue(prev => [...prev, newItem]);
      return id;
    },
    []
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      setQueue(prev => {
        const newQueue = prev.filter(item => item.id !== id);
        const removedIndex = prev.findIndex(item => item.id === id);

        // Adjust current index if necessary
        if (
          removedIndex !== -1 &&
          removedIndex <= currentIndex &&
          currentIndex > 0
        ) {
          setCurrentIndex(currentIndex - 1);
        } else if (newQueue.length === 0) {
          setCurrentIndex(0);
          setIsPlaying(false);
        }

        return newQueue;
      });
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      setQueue(prev => {
        const newQueue = [...prev];
        const [movedItem] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, movedItem);

        // Adjust current index if necessary
        if (fromIndex === currentIndex) {
          setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          setCurrentIndex(currentIndex - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          setCurrentIndex(currentIndex + 1);
        }

        return newQueue;
      });
    },
    [currentIndex]
  );

  const jumpToItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) {
        setCurrentIndex(index);
      }
    },
    [queue.length]
  );

  const getQueueLength = useCallback(() => queue.length, [queue.length]);

  const getCurrentItem = useCallback((): QueueItem | null => {
    return queue[currentIndex] || null;
  }, [queue, currentIndex]);

  const getNextItem = useCallback((): QueueItem | null => {
    return queue[currentIndex + 1] || null;
  }, [queue, currentIndex]);

  // Batch operations for interview scenarios
  const addQuestionSequence = useCallback(
    (
      questions: string[],
      interviewer: InterviewerType,
      speed?: number
    ): string[] => {
      const ids: string[] = [];
      questions.forEach(question => {
        const id = addToQueue(question, interviewer, speed);
        ids.push(id);
      });
      return ids;
    },
    [addToQueue]
  );

  const addInterviewIntro = useCallback(
    (interviewer: InterviewerType, candidateName?: string): string => {
      const intros = {
        'tech-lead': `Hello${candidateName ? ` ${candidateName}` : ''}! I'm excited to discuss your technical background and experience with you today. Let's dive into some questions about your skills and projects.`,
        'hr-manager': `Hi${candidateName ? ` ${candidateName}` : ''}! Welcome to our interview today. I'm looking forward to learning more about you and discussing how you might fit with our team culture.`,
        'product-manager': `Good to meet you${candidateName ? `, ${candidateName}` : ''}! Today we'll explore your problem-solving approach and how you think about product challenges. Ready to get started?`,
        recruiter: `Hello${candidateName ? ` ${candidateName}` : ''}! Thank you for your interest in this position. I'm here to learn about your background and see if this role aligns with your career goals.`,
      };

      return addToQueue(intros[interviewer], interviewer, 0.95);
    },
    [addToQueue]
  );

  const addInterviewClosing = useCallback(
    (interviewer: InterviewerType): string => {
      const closings = {
        'tech-lead':
          'That concludes our technical discussion. Thank you for sharing your insights and walking through those problems with me. Do you have any questions about the technical aspects of this role?',
        'hr-manager':
          'Thank you for sharing so openly about your experiences and goals. This gives me a great sense of who you are as a person and professional. Any final questions for me?',
        'product-manager':
          'Excellent! I appreciate how you approached those product scenarios. Your thinking process really came through clearly. What questions do you have about our product or this role?',
        recruiter:
          'Thank you for taking the time to speak with me today. I have a good understanding of your background now. Are there any questions about the company or position that I can answer for you?',
      };

      return addToQueue(closings[interviewer], interviewer, 0.9);
    },
    [addToQueue]
  );

  return {
    queue,
    currentIndex,
    isPlaying,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveItem,
    jumpToItem,
    getQueueLength,
    getCurrentItem,
    getNextItem,
    // Extended methods for interview scenarios
    addQuestionSequence,
    addInterviewIntro,
    addInterviewClosing,
  };
}
