import { InterviewSession, InterviewResponse } from '@/types';

export interface SessionStorage {
  saveSession: (session: InterviewSession) => Promise<void>;
  getSession: (sessionId: string) => Promise<InterviewSession | null>;
  updateSession: (
    sessionId: string,
    updates: Partial<InterviewSession>
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<InterviewSession[]>;
}

export class SessionService {
  private static readonly STORAGE_KEY = 'interview_sessions';

  /**
   * Save interview session to localStorage (for demo purposes)
   * In production, this would save to a database
   */
  static async saveSession(session: InterviewSession): Promise<void> {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Failed to save interview session');
    }
  }

  /**
   * Get interview session by ID
   */
  static async getSession(sessionId: string): Promise<InterviewSession | null> {
    try {
      const sessions = this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Update interview session
   */
  static async updateSession(
    sessionId: string,
    updates: Partial<InterviewSession>
  ): Promise<void> {
    try {
      const sessions = this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex >= 0) {
        sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      throw new Error('Failed to update interview session');
    }
  }

  /**
   * Delete interview session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error('Failed to delete interview session');
    }
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string): Promise<InterviewSession[]> {
    try {
      const sessions = this.getAllSessions();
      return sessions.filter(s => s.candidateId === userId);
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Get all sessions from localStorage
   */
  private static getAllSessions(): InterviewSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse stored sessions:', error);
      return [];
    }
  }

  /**
   * Add response to session
   */
  static async addResponse(
    sessionId: string,
    response: InterviewResponse
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const updatedResponses = [...session.responses, response];
      await this.updateSession(sessionId, { responses: updatedResponses });
    } catch (error) {
      console.error('Failed to add response:', error);
      throw new Error('Failed to add response to session');
    }
  }

  /**
   * Update session metrics
   */
  static async updateMetrics(
    sessionId: string,
    metrics: Partial<InterviewSession['metrics']>
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const updatedMetrics = { ...session.metrics, ...metrics };
      await this.updateSession(sessionId, { metrics: updatedMetrics });
    } catch (error) {
      console.error('Failed to update metrics:', error);
      throw new Error('Failed to update session metrics');
    }
  }

  /**
   * Complete session
   */
  static async completeSession(
    sessionId: string,
    feedback: InterviewSession['feedback']
  ): Promise<void> {
    try {
      await this.updateSession(sessionId, {
        status: 'completed',
        completedAt: new Date(),
        feedback,
      });
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw new Error('Failed to complete interview session');
    }
  }

  /**
   * Resume session (change status from paused to in-progress)
   */
  static async resumeSession(sessionId: string): Promise<void> {
    try {
      await this.updateSession(sessionId, { status: 'in-progress' });
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw new Error('Failed to resume interview session');
    }
  }

  /**
   * Pause session
   */
  static async pauseSession(sessionId: string): Promise<void> {
    try {
      await this.updateSession(sessionId, { status: 'in-progress' }); // Keep as in-progress for now
    } catch (error) {
      console.error('Failed to pause session:', error);
      throw new Error('Failed to pause interview session');
    }
  }

  /**
   * Abandon session
   */
  static async abandonSession(sessionId: string): Promise<void> {
    try {
      await this.updateSession(sessionId, {
        status: 'abandoned',
        completedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to abandon session:', error);
      throw new Error('Failed to abandon interview session');
    }
  }

  /**
   * Generate session analytics
   */
  static generateSessionAnalytics(session: InterviewSession) {
    const totalQuestions = session.questions.length;
    const answeredQuestions = session.responses.length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;

    const averageResponseTime =
      session.responses.reduce((sum, response) => sum + response.duration, 0) /
      session.responses.length;

    const averageConfidence =
      session.responses.reduce(
        (sum, response) => sum + response.confidence,
        0
      ) / session.responses.length;

    const sessionDuration = session.completedAt
      ? session.completedAt.getTime() - session.startedAt.getTime()
      : Date.now() - session.startedAt.getTime();

    return {
      totalQuestions,
      answeredQuestions,
      completionRate,
      averageResponseTime,
      averageConfidence,
      sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
      questionsPerMinute: (
        answeredQuestions /
        (sessionDuration / 60000)
      ).toFixed(2),
    };
  }

  /**
   * Export session data for download
   */
  static exportSessionData(session: InterviewSession) {
    const analytics = this.generateSessionAnalytics(session);

    return {
      sessionInfo: {
        id: session.id,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        status: session.status,
        configuration: session.configuration,
      },
      performance: {
        overallScore: session.feedback.overallScore,
        metrics: session.metrics,
        analytics,
      },
      questions: session.questions.map((question, index) => ({
        questionNumber: index + 1,
        question: question.text,
        difficulty: question.difficulty,
        expectedDuration: question.expectedDuration,
        followUpQuestions: question.followUpQuestions,
        response: session.responses.find(r => r.questionId === question.id),
      })),
      feedback: session.feedback,
    };
  }

  /**
   * Generate session report as downloadable content
   */
  static generateSessionReport(session: InterviewSession): string {
    const exportData = this.exportSessionData(session);
    const analytics = this.generateSessionAnalytics(session);

    let report = `INTERVIEW SESSION REPORT\n`;
    report += `========================\n\n`;

    report += `Session ID: ${session.id}\n`;
    report += `Date: ${session.startedAt.toLocaleDateString()}\n`;
    report += `Duration: ${Math.floor(analytics.sessionDuration / 60)}:${(analytics.sessionDuration % 60).toString().padStart(2, '0')}\n`;
    report += `Status: ${session.status.toUpperCase()}\n\n`;

    report += `CONFIGURATION\n`;
    report += `-------------\n`;
    report += `Interviewer: ${session.configuration.interviewer.replace('-', ' ')}\n`;
    report += `Type: ${session.configuration.type}\n`;
    report += `Difficulty: ${session.configuration.settings.difficulty}\n`;
    report += `Focus: ${session.configuration.settings.topicFocus}\n`;
    report += `Purpose: ${session.configuration.settings.purpose}\n\n`;

    report += `PERFORMANCE SUMMARY\n`;
    report += `-------------------\n`;
    report += `Overall Score: ${session.feedback.overallScore}/10\n`;
    report += `Completion Rate: ${analytics.completionRate.toFixed(1)}%\n`;
    report += `Average Confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%\n`;
    report += `Eye Contact: ${session.metrics.eyeContactPercentage}%\n`;
    report += `Response Quality: ${(session.metrics.responseQuality * 100).toFixed(1)}%\n`;
    report += `Overall Engagement: ${(session.metrics.overallEngagement * 100).toFixed(1)}%\n\n`;

    report += `STRENGTHS\n`;
    report += `---------\n`;
    session.feedback.strengths.forEach(strength => {
      report += `• ${strength}\n`;
    });
    report += `\n`;

    report += `AREAS FOR IMPROVEMENT\n`;
    report += `---------------------\n`;
    session.feedback.weaknesses.forEach(weakness => {
      report += `• ${weakness}\n`;
    });
    report += `\n`;

    report += `SUGGESTIONS\n`;
    report += `-----------\n`;
    session.feedback.suggestions.forEach(suggestion => {
      report += `• ${suggestion}\n`;
    });
    report += `\n`;

    report += `QUESTIONS & RESPONSES\n`;
    report += `---------------------\n`;
    session.questions.forEach((question, index) => {
      const response = session.responses.find(
        r => r.questionId === question.id
      );
      report += `${index + 1}. ${question.text}\n`;
      report += `   Difficulty: ${question.difficulty}/10\n`;
      if (response) {
        report += `   Response: ${response.transcription}\n`;
        report += `   Duration: ${Math.floor(response.duration / 1000)}s\n`;
        report += `   Confidence: ${(response.confidence * 100).toFixed(1)}%\n`;
      } else {
        report += `   Response: Not answered\n`;
      }
      report += `\n`;
    });

    return report;
  }
}
