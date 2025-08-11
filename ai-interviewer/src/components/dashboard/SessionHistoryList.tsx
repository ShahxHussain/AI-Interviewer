'use client';

import { InterviewSession } from '@/types';
import { SessionService } from '@/lib/services/session-service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Play, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Target,
  TrendingUp,
  Eye,
  MessageSquare
} from 'lucide-react';

interface SessionHistoryListProps {
  sessions: InterviewSession[];
  onSessionReplay: (session: InterviewSession) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

export function SessionHistoryList({
  sessions,
  onSessionReplay,
  onLoadMore,
  hasMore,
  loadingMore,
}: SessionHistoryListProps) {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (startedAt: Date, completedAt?: Date) => {
    const end = completedAt || new Date();
    const duration = Math.floor((end.getTime() - startedAt.getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  const handleDownloadReport = async (session: InterviewSession) => {
    try {
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
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No interview sessions found
        </h3>
        <p className="text-gray-600">
          Start your first interview to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const analytics = SessionService.generateSessionAnalytics(session);
        
        return (
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Session Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.replace('-', ' ')}
                  </Badge>
                  
                  <Badge className={getDifficultyColor(session.configuration.settings.difficulty)}>
                    {session.configuration.settings.difficulty}
                  </Badge>
                  
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {session.configuration.interviewer.replace('-', ' ')}
                  </span>
                  
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {session.configuration.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(session.startedAt).toLocaleDateString()}
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(session.startedAt, session.completedAt)}
                  </span>
                </div>

                {/* Performance Metrics */}
                {session.status === 'completed' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {session.feedback.overallScore}/10
                      </div>
                      <div className="text-xs text-gray-600">Overall Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {analytics.completionRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Completion</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4" />
                        {session.metrics.eyeContactPercentage}%
                      </div>
                      <div className="text-xs text-gray-600">Eye Contact</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {(analytics.averageConfidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Confidence</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onSessionReplay(session)}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Replay
                </Button>
                
                {session.status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadReport(session)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Report
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Feedback Preview */}
            {session.status === 'completed' && session.feedback.strengths.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      Top Strengths
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {session.feedback.strengths.slice(0, 2).map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {session.feedback.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Areas to Improve
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {session.feedback.weaknesses.slice(0, 2).map((weakness, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <LoadingSpinner size="sm" />
                Loading...
              </>
            ) : (
              'Load More Sessions'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}