'use client';

import { useState } from 'react';
import { InterviewSession } from '@/types';
import { SessionService } from '@/lib/services/session-service';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Download,
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Eye,
  MessageSquare,
  Award
} from 'lucide-react';

interface SessionReplayModalProps {
  session: InterviewSession;
  onClose: () => void;
}

export function SessionReplayModal({ session, onClose }: SessionReplayModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const analytics = SessionService.generateSessionAnalytics(session);
  const currentQuestion = session.questions[currentQuestionIndex];
  const currentResponse = session.responses.find(r => r.questionId === currentQuestion?.id);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsPlaying(false);
    }
  };

  const handleDownloadReport = () => {
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Session Replay
            </h2>
            <Badge className={getStatusColor(session.status)}>
              {session.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="replay" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="replay">Question Replay</TabsTrigger>
              <TabsTrigger value="overview">Session Overview</TabsTrigger>
              <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="replay" className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Question Navigation */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Question</div>
                      <div className="font-semibold">
                        {currentQuestionIndex + 1} of {session.questions.length}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentQuestionIndex === session.questions.length - 1}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {currentResponse && (
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center gap-2"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'Pause' : 'Play'} Response
                      </Button>
                    </div>
                  )}
                </div>

                {/* Current Question */}
                {currentQuestion && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Question</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          Difficulty: {currentQuestion.difficulty}/10
                        </Badge>
                      </div>
                      <p className="text-gray-900">{currentQuestion.text}</p>
                      <div className="mt-2 text-sm text-blue-700">
                        Expected duration: {formatDuration(currentQuestion.expectedDuration)}
                      </div>
                    </div>

                    {/* Response */}
                    {currentResponse ? (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">Your Response</span>
                          <Badge className="bg-green-100 text-green-800">
                            {formatDuration(Math.floor(currentResponse.duration / 1000))}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            Confidence: {(currentResponse.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-gray-900 mb-3">{currentResponse.transcription}</p>
                        
                        {/* Facial Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-green-200">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-900">
                              {currentResponse.facialMetrics.eyeContact ? 'Yes' : 'No'}
                            </div>
                            <div className="text-xs text-green-700">Eye Contact</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-900">
                              {Object.entries(currentResponse.facialMetrics.emotions)
                                .reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                            </div>
                            <div className="text-xs text-green-700">Dominant Emotion</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-900">
                              {currentResponse.facialMetrics.headPose.yaw.toFixed(1)}°
                            </div>
                            <div className="text-xs text-green-700">Head Yaw</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-900">
                              {currentResponse.facialMetrics.headPose.pitch.toFixed(1)}°
                            </div>
                            <div className="text-xs text-green-700">Head Pitch</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-gray-600">No response recorded for this question</p>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {currentQuestion.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium text-yellow-900">Follow-up Questions</span>
                        </div>
                        <ul className="space-y-1">
                          {currentQuestion.followUpQuestions.map((followUp, index) => (
                            <li key={index} className="text-gray-900 text-sm">
                              • {followUp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="overview" className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Started:</span>
                        <span className="text-sm font-medium">
                          {new Date(session.startedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {session.completedAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="text-sm font-medium">
                            {Math.floor(analytics.sessionDuration / 60)} minutes
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Interviewer:</span>
                        <span className="text-sm font-medium capitalize">
                          {session.configuration.interviewer.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium capitalize">
                          {session.configuration.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {session.feedback.overallScore}/10
                        </div>
                        <div className="text-xs text-gray-600">Overall Score</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {analytics.completionRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Completion</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {session.metrics.eyeContactPercentage}%
                        </div>
                        <div className="text-xs text-gray-600">Eye Contact</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {(analytics.averageConfidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions Summary</h3>
                  <div className="space-y-2">
                    {session.questions.map((question, index) => {
                      const response = session.responses.find(r => r.questionId === question.id);
                      return (
                        <div
                          key={question.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              Q{index + 1}: {question.text.substring(0, 80)}...
                            </div>
                            <div className="text-xs text-gray-600">
                              Difficulty: {question.difficulty}/10
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {response ? (
                              <>
                                <Badge className="bg-green-100 text-green-800">
                                  Answered
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {(response.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                Skipped
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-semibold text-gray-900">Overall Score</span>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {session.feedback.overallScore}/10
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on your performance across all areas
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Strengths</h3>
                  <div className="space-y-2">
                    {session.feedback.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-900">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Areas for Improvement</h3>
                  <div className="space-y-2">
                    {session.feedback.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-900">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Suggestions for Next Time</h3>
                  <div className="space-y-2">
                    {session.feedback.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-900">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Modal>
  );
}