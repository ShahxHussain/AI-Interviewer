import { useState, useCallback, useEffect } from 'react';
import {
  InterviewSession,
  InterviewResponse,
  InterviewConfiguration,
} from '@/types';
import { SessionService } from '@/lib/services/session-service';

interface UseInterviewSessionOptions {
  autoSave?: boolean;
  saveInterval?: number; // in milliseconds
}

interface InterviewSessionState {
  session: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

interface InterviewSessionActions {
  createSession: (config: InterviewConfiguration) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  saveSession: () => Promise<void>;
  addResponse: (response: InterviewResponse) => Promise<void>;
  updateMetrics: (
    metrics: Partial<InterviewSession['metrics']>
  ) => Promise<void>;
  completeSession: (feedback: InterviewSession['feedback']) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  abandonSession: () => Promise<void>;
  clearSession: () => void;
}

export function useInterviewSession(
  options: UseInterviewSessionOptions = {}
): InterviewSessionState & InterviewSessionActions {
  const { autoSave = true, saveInterval = 30000 } = options;

  const [state, setState] = useState<InterviewSessionState>({
    session: null,
    isLoading: false,
    error: null,
    isSaving: false,
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !state.session) return;

    const interval = setInterval(async () => {
      if (state.session && state.session.status === 'in-progress') {
        try {
          await SessionService.saveSession(state.session);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, saveInterval);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, state.session]);

  const createSession = useCallback(
    async (config: InterviewConfiguration): Promise<string> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newSession: InterviewSession = {
          id: sessionId,
          candidateId: 'current-user', // This should come from auth context
          configuration: config,
          questions: [], // Will be populated when questions are generated
          responses: [],
          metrics: {
            eyeContactPercentage: 0,
            moodTimeline: [],
            averageConfidence: 0,
            responseQuality: 0,
            overallEngagement: 0,
          },
          feedback: {
            strengths: [],
            weaknesses: [],
            suggestions: [],
            overallScore: 0,
          },
          status: 'in-progress',
          startedAt: new Date(),
        };

        await SessionService.saveSession(newSession);

        setState(prev => ({
          ...prev,
          session: newSession,
          isLoading: false,
        }));

        return sessionId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create session';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await SessionService.getSession(sessionId);

      if (!session) {
        throw new Error('Session not found');
      }

      setState(prev => ({
        ...prev,
        session,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load session';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const saveSession = useCallback(async (): Promise<void> => {
    if (!state.session) {
      throw new Error('No session to save');
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await SessionService.saveSession(state.session);
      setState(prev => ({ ...prev, isSaving: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save session';
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.session]);

  const addResponse = useCallback(
    async (response: InterviewResponse): Promise<void> => {
      if (!state.session) {
        throw new Error('No active session');
      }

      try {
        const updatedSession = {
          ...state.session,
          responses: [...state.session.responses, response],
        };

        setState(prev => ({ ...prev, session: updatedSession }));

        if (autoSave) {
          await SessionService.saveSession(updatedSession);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add response';
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    [state.session, autoSave]
  );

  const updateMetrics = useCallback(
    async (metrics: Partial<InterviewSession['metrics']>): Promise<void> => {
      if (!state.session) {
        throw new Error('No active session');
      }

      try {
        const updatedSession = {
          ...state.session,
          metrics: { ...state.session.metrics, ...metrics },
        };

        setState(prev => ({ ...prev, session: updatedSession }));

        if (autoSave) {
          await SessionService.saveSession(updatedSession);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update metrics';
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    [state.session, autoSave]
  );

  const completeSession = useCallback(
    async (feedback: InterviewSession['feedback']): Promise<void> => {
      if (!state.session) {
        throw new Error('No active session');
      }

      try {
        const updatedSession = {
          ...state.session,
          status: 'completed' as const,
          completedAt: new Date(),
          feedback,
        };

        setState(prev => ({ ...prev, session: updatedSession }));
        await SessionService.saveSession(updatedSession);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to complete session';
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    [state.session]
  );

  const pauseSession = useCallback(async (): Promise<void> => {
    if (!state.session) {
      throw new Error('No active session');
    }

    try {
      await SessionService.pauseSession(state.session.id);
      // Note: SessionService.pauseSession doesn't actually change status to paused
      // This is intentional to keep the session as in-progress
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to pause session';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.session]);

  const resumeSession = useCallback(async (): Promise<void> => {
    if (!state.session) {
      throw new Error('No active session');
    }

    try {
      await SessionService.resumeSession(state.session.id);
      const updatedSession = {
        ...state.session,
        status: 'in-progress' as const,
      };
      setState(prev => ({ ...prev, session: updatedSession }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resume session';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.session]);

  const abandonSession = useCallback(async (): Promise<void> => {
    if (!state.session) {
      throw new Error('No active session');
    }

    try {
      await SessionService.abandonSession(state.session.id);
      const updatedSession = {
        ...state.session,
        status: 'abandoned' as const,
        completedAt: new Date(),
      };
      setState(prev => ({ ...prev, session: updatedSession }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to abandon session';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.session]);

  const clearSession = useCallback((): void => {
    setState(prev => ({
      ...prev,
      session: null,
      error: null,
    }));
  }, []);

  return {
    ...state,
    createSession,
    loadSession,
    saveSession,
    addResponse,
    updateMetrics,
    completeSession,
    pauseSession,
    resumeSession,
    abandonSession,
    clearSession,
  };
}

// Hook for managing multiple sessions (for history/dashboard)
export function useInterviewHistory() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserSessions = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userSessions = await SessionService.getUserSessions(userId);
      setSessions(userSessions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load sessions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await SessionService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete session';
      setError(errorMessage);
      throw error;
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    loadUserSessions,
    deleteSession,
  };
}
