import { useState, useCallback } from 'react';
import {
  InterviewConfiguration,
  InterviewQuestion,
  ParsedResumeData,
} from '@/types';

interface UseQuestionGenerationOptions {
  numberOfQuestions?: number;
  includeFollowUps?: boolean;
  customPrompt?: string;
}

interface QuestionGenerationState {
  questions: InterviewQuestion[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface QuestionGenerationResult extends QuestionGenerationState {
  generateQuestions: (
    config: InterviewConfiguration,
    resumeData?: ParsedResumeData,
    options?: UseQuestionGenerationOptions
  ) => Promise<void>;
  clearQuestions: () => void;
  regenerateQuestion: (
    questionId: string,
    config: InterviewConfiguration
  ) => Promise<void>;
}

export function useQuestionGeneration(): QuestionGenerationResult {
  const [state, setState] = useState<QuestionGenerationState>({
    questions: [],
    sessionId: null,
    isLoading: false,
    error: null,
  });

  const generateQuestions = useCallback(
    async (
      config: InterviewConfiguration,
      resumeData?: ParsedResumeData,
      options: UseQuestionGenerationOptions = {}
    ) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/interview/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewConfig: config,
            resumeData,
            numberOfQuestions: options.numberOfQuestions || 5,
            includeFollowUps: options.includeFollowUps ?? true,
            customPrompt: options.customPrompt,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate questions');
        }

        if (!data.success) {
          throw new Error(data.error || 'Question generation failed');
        }

        setState(prev => ({
          ...prev,
          questions: data.questions || [],
          sessionId: data.sessionId || null,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  const regenerateQuestion = useCallback(
    async (questionId: string, config: InterviewConfiguration) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Generate a single replacement question
        const response = await fetch('/api/interview/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewConfig: config,
            numberOfQuestions: 1,
            includeFollowUps: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to regenerate question');
        }

        if (!data.success || !data.questions || data.questions.length === 0) {
          throw new Error('No replacement question generated');
        }

        const newQuestion = data.questions[0];

        setState(prev => ({
          ...prev,
          questions: prev.questions.map(q =>
            q.id === questionId ? { ...newQuestion, id: questionId } : q
          ),
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to regenerate question';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  const clearQuestions = useCallback(() => {
    setState({
      questions: [],
      sessionId: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    generateQuestions,
    clearQuestions,
    regenerateQuestion,
  };
}

// Utility hook for question difficulty analysis
export function useQuestionAnalysis() {
  const analyzeQuestions = useCallback((questions: InterviewQuestion[]) => {
    if (questions.length === 0) {
      return {
        averageDifficulty: 0,
        totalDuration: 0,
        difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
        typeDistribution: { technical: 0, behavioral: 0, 'case-study': 0 },
      };
    }

    const averageDifficulty =
      questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;
    const totalDuration = questions.reduce(
      (sum, q) => sum + q.expectedDuration,
      0
    );

    const difficultyDistribution = questions.reduce(
      (dist, q) => {
        if (q.difficulty <= 3) dist.easy++;
        else if (q.difficulty <= 7) dist.medium++;
        else dist.hard++;
        return dist;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    const typeDistribution = questions.reduce(
      (dist, q) => {
        dist[q.type]++;
        return dist;
      },
      { technical: 0, behavioral: 0, 'case-study': 0 } as Record<string, number>
    );

    return {
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      totalDuration,
      difficultyDistribution,
      typeDistribution,
    };
  }, []);

  return { analyzeQuestions };
}

// Hook for managing question filters and search
export function useQuestionFilters(questions: InterviewQuestion[]) {
  const [filters, setFilters] = useState({
    minDifficulty: 1,
    maxDifficulty: 10,
    types: [] as string[],
    searchTerm: '',
  });

  const filteredQuestions = questions.filter(question => {
    // Difficulty filter
    if (
      question.difficulty < filters.minDifficulty ||
      question.difficulty > filters.maxDifficulty
    ) {
      return false;
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(question.type)) {
      return false;
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const questionText = question.text.toLowerCase();
      const followUps =
        question.followUpQuestions?.join(' ').toLowerCase() || '';

      if (
        !questionText.includes(searchLower) &&
        !followUps.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      minDifficulty: 1,
      maxDifficulty: 10,
      types: [],
      searchTerm: '',
    });
  }, []);

  return {
    filters,
    filteredQuestions,
    updateFilters,
    resetFilters,
  };
}
