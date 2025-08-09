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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Interview History
          </h2>
          <p className="text-gray-600">
            Track your progress and review past interviews
          </p>
        </div>
        {onStartNewInterview && (
          <Button onClick={onStartNewInterview}>Start New Interview</Button>
        )}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600">Total Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.completedSessions}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {stats.averageScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalTimeMinutes}m</p>
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No interviews yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your first interview to begin tracking your progress
              </p>
              {onStartNewInterview && (
                <Button onClick={onStartNewInterview}>
                  Start Your First Interview
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(session.status)}
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {session.configuration.interviewer.replace('-', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {session.configuration.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{session.startedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {formatDuration(
                            session.startedAt,
                            session.completedAt
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span>
                          {session.responses.length}/{session.questions.length}{' '}
                          questions
                        </span>
                      </div>
                      {session.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span>
                            Score: {session.feedback.overallScore.toFixed(1)}/10
                          </span>
                        </div>
                      )}
                    </div>

                    {session.status === 'completed' && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Eye Contact:</span>
                          <span className="font-medium">
                            {session.metrics.eyeContactPercentage}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium">
                            {Math.round(
                              session.metrics.averageConfidence * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Engagement:</span>
                          <span className="font-medium">
                            {Math.round(
                              session.metrics.overallEngagement * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {session.status === 'in-progress' && onResumeSession && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResumeSession(session.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}

                    {session.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(session)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
