'use client';

import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  TrendingUp,
  Download,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Pause,
  BarChart3,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { InterviewSession } from '@/types';
import { useInterviewHistory } from '@/hooks/useInterviewSession';
import { SessionService } from '@/lib/services/session-service';

interface InterviewHistoryProps {
  userId: string;
  onResumeSession?: (sessionId: string) => void;
  onStartNewInterview?: () => void;
}

export function InterviewHistory({
  userId,
  onResumeSession,
  onStartNewInterview,
}: InterviewHistoryProps) {
  const { sessions, isLoading, error, loadUserSessions, deleteSession } =
    useInterviewHistory();

  useEffect(() => {
    loadUserSessions(userId);
  }, [userId, loadUserSessions]);

  const handleDownloadReport = (session: InterviewSession) => {
    const report = SessionService.generateSessionReport(session);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${session.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (
      window.confirm('Are you sure you want to delete this interview session?')
    ) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const getStatusIcon = (status: InterviewSession['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'abandoned':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Pause className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: InterviewSession['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return 'In progress';
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getOverallStats = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalSessions = sessions.length;
    const averageScore =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (sum, s) => sum + s.feedback.overallScore,
            0
          ) / completedSessions.length
        : 0;
    const totalTime = completedSessions.reduce((sum, s) => {
      if (s.completedAt) {
        return sum + (s.completedAt.getTime() - s.startedAt.getTime());
      }
      return sum;
    }, 0);

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      averageScore,
      totalTimeMinutes: Math.floor(totalTime / 60000),
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Failed to load interview history: {error}</p>
            <Button
              variant="outline"
              onClick={() => loadUserSessions(userId)}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between luxury-fade-in">
        <div>
          <h2 className="text-3xl font-bold luxury-text-gold font-luxury">
            Interview History
          </h2>
          <p className="luxury-text-secondary text-lg mt-2">
            Track your progress and review past interviews
          </p>
        </div>
        {onStartNewInterview && (
          <button 
            onClick={onStartNewInterview}
            className="luxury-button-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start New Interview
          </button>
        )}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 luxury-slide-up">
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium luxury-text-secondary">Total Sessions</p>
              <p className="text-3xl font-bold luxury-text-primary">{stats.totalSessions}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-sapphire-400 to-sapphire-600 rounded-full">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm luxury-text-secondary">
              {stats.completedSessions} completed
            </p>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium luxury-text-secondary">Completion Rate</p>
              <p className="text-3xl font-bold luxury-text-primary">
                {stats.totalSessions > 0 
                  ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm luxury-text-secondary">
              {stats.completedSessions} of {stats.totalSessions} sessions
            </p>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium luxury-text-secondary">Average Score</p>
              <p className="text-3xl font-bold luxury-text-gold">
                {stats.averageScore.toFixed(1)}/10
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amethyst-400 to-amethyst-600 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              <span className="text-sm luxury-text-secondary">Performance trend</span>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium luxury-text-secondary">Total Time</p>
              <p className="text-3xl font-bold luxury-text-primary">{stats.totalTimeMinutes}m</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full">
              <Clock className="w-6 h-6 text-dark-900" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm luxury-text-secondary">
              Practice sessions
            </p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="luxury-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gold-400" />
          </div>
          <h3 className="text-2xl font-bold luxury-text-primary mb-3">
            No interviews yet
          </h3>
          <p className="luxury-text-secondary text-lg mb-8 max-w-md mx-auto">
            Start your first interview to begin tracking your progress and unlock powerful analytics
          </p>
          {onStartNewInterview && (
            <button 
              onClick={onStartNewInterview}
              className="luxury-button-primary"
            >
              Start Your First Interview
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session, index) => (
            <div 
              key={session.id} 
              className="luxury-card p-6 hover:transform hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(session.status)}
                    <div className={`luxury-badge ${getStatusColor(session.status).includes('green') ? 'luxury-badge-success' : getStatusColor(session.status).includes('blue') ? 'luxury-badge-info' : 'luxury-badge-error'}`}>
                      {session.status.replace('-', ' ')}
                    </div>
                    <div className="luxury-badge">
                      {session.configuration.interviewer.replace('-', ' ')}
                    </div>
                    <div className="luxury-badge">
                      {session.configuration.type}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sapphire-500/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-sapphire-400" />
                      </div>
                      <div>
                        <p className="text-xs luxury-text-secondary">Date</p>
                        <p className="text-sm font-medium luxury-text-primary">
                          {session.startedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Clock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs luxury-text-secondary">Duration</p>
                        <p className="text-sm font-medium luxury-text-primary">
                          {formatDuration(session.startedAt, session.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amethyst-500/20 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-amethyst-400" />
                      </div>
                      <div>
                        <p className="text-xs luxury-text-secondary">Progress</p>
                        <p className="text-sm font-medium luxury-text-primary">
                          {session.responses.length}/{session.questions.length} questions
                        </p>
                      </div>
                    </div>
                    {session.status === 'completed' && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-500/20 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-gold-400" />
                        </div>
                        <div>
                          <p className="text-xs luxury-text-secondary">Score</p>
                          <p className="text-sm font-bold luxury-text-gold">
                            {session.feedback.overallScore.toFixed(1)}/10
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {session.status === 'completed' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gold-400/10">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-emerald-400" />
                          <span className="text-lg font-bold luxury-text-primary">
                            {session.metrics.eyeContactPercentage}%
                          </span>
                        </div>
                        <p className="text-xs luxury-text-secondary">Eye Contact</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-sapphire-400" />
                          <span className="text-lg font-bold luxury-text-primary">
                            {Math.round(session.metrics.averageConfidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs luxury-text-secondary">Confidence</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-amethyst-400" />
                          <span className="text-lg font-bold luxury-text-primary">
                            {Math.round(session.metrics.overallEngagement * 100)}%
                          </span>
                        </div>
                        <p className="text-xs luxury-text-secondary">Engagement</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-6">
                  {session.status === 'in-progress' && onResumeSession && (
                    <button
                      onClick={() => onResumeSession(session.id)}
                      className="luxury-button-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}

                  {session.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadReport(session)}
                      className="luxury-button-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <Download className="w-4 h-4" />
                      Report
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
