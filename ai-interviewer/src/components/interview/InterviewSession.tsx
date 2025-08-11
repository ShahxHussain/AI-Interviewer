'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Activity,
  Eye,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  InterviewConfiguration,
  InterviewQuestion,
  InterviewResponse,
  InterviewSession as IInterviewSession,
} from '@/types';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useMetricsCollection } from '@/hooks/useMetricsCollection';
import { VoicePlayer } from './VoicePlayer';
import { AudioRecorder } from './AudioRecorder';
import { CameraFeed } from './CameraFeed';
import { RealTimeMetricsDashboard } from './RealTimeMetricsDashboard';

interface InterviewSessionProps {
  config: InterviewConfiguration;
  onSessionComplete: (session: IInterviewSession) => void;
  onExit: () => void;
}

type SessionState =
  | 'preparing'
  | 'ready'
  | 'in-progress'
  | 'paused'
  | 'completed';

export function InterviewSession({
  config,
  onSessionComplete,
  onExit,
}: InterviewSessionProps) {
  const [sessionState, setSessionState] = useState<SessionState>('preparing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [showMetrics, setShowMetrics] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);

  const {
    questions,
    isLoading: questionsLoading,
    error: questionsError,
    generateQuestions,
  } = useQuestionGeneration();

  // Interview session management
  const {
    session,
    createSession,
    addResponse,
    updateMetrics,
    completeSession: completeInterviewSession,
    pauseSession: pauseInterviewSession,
    resumeSession: resumeInterviewSession,
  } = useInterviewSession();

  // Metrics collection
  const {
    isCollecting: isMetricsCollecting,
    startCollection: startMetricsCollection,
    stopCollection: stopMetricsCollection,
    addFacialData,
    startResponse,
    endResponse,
    getRealTimeMetrics,
  } = useMetricsCollection({
    sessionId,
    onMetricsUpdate: (metrics) => {
      // Only update session metrics if there's an active session
      if (session && sessionState === 'in-progress') {
        try {
          updateMetrics({
            eyeContactPercentage: metrics.eyeContactPercentage,
            averageConfidence: metrics.averageConfidence,
            responseQuality: metrics.responseQuality,
            overallEngagement: metrics.engagementScore / 100,
          });
        } catch (error) {
          console.warn('Failed to update metrics:', error);
        }
      }
    },
  });

  // Generate questions when component mounts
  useEffect(() => {
    if (sessionState === 'preparing') {
      generateQuestions(config, config.resumeData, {
        numberOfQuestions: 5,
        includeFollowUps: true,
      });
    }
  }, [config, generateQuestions, sessionState]);

  // Update session state when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && sessionState === 'preparing') {
      setSessionState('ready');
    }
  }, [questions, sessionState]);

  const startSession = useCallback(async () => {
    try {
      const now = new Date();
      setSessionStartTime(now);
      setQuestionStartTime(now);
      setSessionState('in-progress');
      
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Create session in the database
      await createSession(config);
      
      // Start metrics collection
      startMetricsCollection(newSessionId);
      
      console.log('Interview session started:', newSessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
      // Continue with local session even if database fails
    }
  }, [config, createSession, startMetricsCollection]);

  const pauseSession = useCallback(async () => {
    try {
      const pauseStartTime = Date.now();
      setSessionState('paused');
      setIsRecording(false);
      
      // Pause interview session
      if (session) {
        await pauseInterviewSession();
      }
      
      // Stop response recording if active
      if (isRecording) {
        endResponse();
      }
      
      console.log('Interview session paused');
    } catch (error) {
      console.error('Failed to pause session:', error);
      // Continue with local pause even if database fails
      setSessionState('paused');
      setIsRecording(false);
    }
  }, [session, pauseInterviewSession, isRecording, endResponse]);

  const resumeSession = useCallback(async () => {
    try {
      setSessionState('in-progress');
      
      // Resume interview session
      if (session) {
        await resumeInterviewSession();
      }
      
      // Reset question start time to account for pause
      setQuestionStartTime(new Date());
      
      console.log('Interview session resumed');
    } catch (error) {
      console.error('Failed to resume session:', error);
      // Continue with local resume even if database fails
      setSessionState('in-progress');
    }
  }, [session, resumeInterviewSession]);

  const nextQuestion = useCallback(() => {
    // Save current response
    if (currentResponse.trim() && questionStartTime) {
      const response: InterviewResponse = {
        questionId: questions[currentQuestionIndex].id,
        transcription: currentResponse,
        duration: Date.now() - questionStartTime.getTime(),
        confidence: 0.8, // Mock confidence score
        facialMetrics: {
          emotions: {
            happy: 0.3,
            sad: 0.1,
            angry: 0.05,
            fearful: 0.1,
            disgusted: 0.05,
            surprised: 0.2,
            neutral: 0.3,
          },
          eyeContact: true,
          headPose: { pitch: 0, yaw: 0, roll: 0 },
          timestamp: Date.now(),
        },
      };
      setResponses(prev => [...prev, response]);
    }

    // Move to next question or complete session
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse('');
      setQuestionStartTime(new Date());
    } else {
      completeSession();
    }
  }, [currentResponse, currentQuestionIndex, questions, questionStartTime]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentResponse('');
      setQuestionStartTime(new Date());
    }
  }, [currentQuestionIndex]);

  const completeSession = useCallback(async () => {
    if (!sessionStartTime) return;

    try {
      // Stop metrics collection and get final metrics
      const finalMetrics = stopMetricsCollection();
      
      // Save current response if there is one
      if (currentResponse.trim() && questionStartTime) {
        const response: InterviewResponse = {
          questionId: questions[currentQuestionIndex].id,
          transcription: currentResponse,
          duration: Date.now() - questionStartTime.getTime(),
          confidence: 0.8, // Mock confidence score
          facialMetrics: {
            emotions: {
              happy: 0.3,
              sad: 0.1,
              angry: 0.05,
              fearful: 0.1,
              disgusted: 0.05,
              surprised: 0.2,
              neutral: 0.3,
            },
            eyeContact: true,
            headPose: { pitch: 0, yaw: 0, roll: 0 },
            timestamp: Date.now(),
          },
        };
        
        const updatedResponses = [...responses, response];
        setResponses(updatedResponses);
        
        // Add response to session
        if (session) {
          await addResponse(response);
        }
      }

      // Generate comprehensive feedback using AI
      const comprehensiveFeedback = await import('@/lib/services/feedback-service')
        .then(module => module.FeedbackService.generateComprehensiveFeedback({
          id: sessionId,
          candidateId: 'current-user',
          configuration: config,
          questions,
          responses: [...responses, ...(currentResponse.trim() ? [response] : [])],
          metrics: finalMetrics,
          feedback: {
            strengths: [],
            weaknesses: [],
            suggestions: [],
            overallScore: 0,
          },
          status: 'completed',
          startedAt: sessionStartTime,
          completedAt: new Date(),
        }))
        .catch(error => {
          console.error('Failed to generate comprehensive feedback:', error);
          // Fallback to basic feedback
          return {
            strengths: ['Completed the interview session', 'Engaged with questions'],
            weaknesses: ['Consider more detailed responses'],
            suggestions: ['Practice more mock interviews', 'Prepare specific examples'],
            overallScore: 7.0,
          };
        });

      const completedSession: IInterviewSession = {
        id: sessionId,
        candidateId: 'current-user', // This should come from auth context
        configuration: config,
        questions,
        responses: [...responses, ...(currentResponse.trim() ? [response] : [])],
        metrics: finalMetrics,
        feedback: {
          strengths: comprehensiveFeedback.strengths,
          weaknesses: comprehensiveFeedback.weaknesses,
          suggestions: comprehensiveFeedback.suggestions,
          overallScore: comprehensiveFeedback.overallScore,
        },
        status: 'completed',
        startedAt: sessionStartTime,
        completedAt: new Date(),
      };

      // Complete the session in the database
      if (session) {
        await completeInterviewSession(completedSession.feedback);
      }

      setSessionState('completed');
      onSessionComplete(completedSession);
      
      console.log('Interview session completed successfully');
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Still complete the session locally even if database fails
      const completedSession: IInterviewSession = {
        id: sessionId,
        candidateId: 'current-user',
        configuration: config,
        questions,
        responses,
        metrics: {
          eyeContactPercentage: 75,
          moodTimeline: [],
          averageConfidence: 0.8,
          responseQuality: 0.85,
          overallEngagement: 0.9,
        },
        feedback: {
          strengths: ['Good technical knowledge', 'Clear communication'],
          weaknesses: ['Could improve confidence', 'More specific examples needed'],
          suggestions: ['Practice more behavioral questions', 'Work on eye contact'],
          overallScore: 8.5,
        },
        status: 'completed',
        startedAt: sessionStartTime,
        completedAt: new Date(),
      };
      
      setSessionState('completed');
      onSessionComplete(completedSession);
    }
  }, [
    sessionId,
    config,
    questions,
    responses,
    sessionStartTime,
    currentResponse,
    currentQuestionIndex,
    questionStartTime,
    session,
    stopMetricsCollection,
    addResponse,
    completeInterviewSession,
    onSessionComplete,
  ]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => {
      const newRecordingState = !prev;
      
      if (newRecordingState) {
        // Start recording response
        startResponse();
        console.log('Started recording response');
      } else {
        // Stop recording response
        endResponse();
        console.log('Stopped recording response');
      }
      
      return newRecordingState;
    });
  }, [startResponse, endResponse]);

  const toggleCamera = useCallback(() => {
    setIsCameraOn(prev => !prev);
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicOn(prev => !prev);
  }, []);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => !prev);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = () => {
    if (!sessionStartTime) return 0;
    return Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
  };

  const getQuestionTime = () => {
    if (!questionStartTime) return 0;
    return Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
  };

  // Render loading state
  if (questionsLoading || sessionState === 'preparing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Preparing Your Interview</CardTitle>
            <CardDescription>
              Generating personalized questions based on your profile...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (questionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">
              Failed to Load Interview
            </CardTitle>
            <CardDescription>{questionsError}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onExit} variant="outline">
              Back to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render ready state
  if (sessionState === 'ready') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Interview Ready!</CardTitle>
            <CardDescription>
              We&apos;ve generated {questions.length} personalized questions for
              your {config.type} interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interview Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Interview Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Interviewer:</span>
                  <span className="ml-2 capitalize">
                    {config.interviewer.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2 capitalize">{config.type}</span>
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span>
                  <span className="ml-2 capitalize">
                    {config.settings.difficulty}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Questions:</span>
                  <span className="ml-2">{questions.length}</span>
                </div>
              </div>
            </div>

            {/* Controls Check */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-blue-900">
                Before You Start
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>
                    Make sure your camera is working and positioned well
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span>Test your microphone and speak clearly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span>Ensure your speakers/headphones are working</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onExit}>
                Back to Setup
              </Button>
              <Button onClick={startSession} className="px-8">
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render main interview interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="h-4 w-4" />
              <span>Session: {formatTime(getElapsedTime())}</span>
              <span>•</span>
              <span>Question: {formatTime(getQuestionTime())}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={sessionState === 'paused' ? 'default' : 'outline'}
              size="sm"
              onClick={sessionState === 'paused' ? resumeSession : pauseSession}
            >
              {sessionState === 'paused' ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onExit}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video/Camera Area */}
          <div className="flex-1 bg-gray-800 relative">
            <CameraFeed
              isEnabled={isCameraOn}
              className="w-full h-full"
              onError={error => {
                console.error('Camera error:', error);
                // Optionally show error to user or handle gracefully
              }}
            />

            {/* Real-time Feedback Indicators */}
            <div className="absolute top-4 left-4 space-y-2">
              {/* Session Status */}
              <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      sessionState === 'in-progress'
                        ? 'bg-green-500 animate-pulse'
                        : sessionState === 'paused'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-white capitalize">
                    {sessionState === 'in-progress' ? 'Recording' : sessionState}
                  </span>
                </div>
              </div>

              {/* Metrics Collection Status */}
              {isMetricsCollecting && (
                <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Activity className="h-3 w-3 text-blue-400 animate-pulse" />
                    <span>Analyzing</span>
                  </div>
                </div>
              )}

              {/* Real-time Metrics Display */}
              {isMetricsCollecting && (
                <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <Eye className="h-3 w-3 text-green-400" />
                    <span>Eye Contact: {getRealTimeMetrics().eyeContactPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white">
                    <BarChart3 className="h-3 w-3 text-blue-400" />
                    <span>Engagement: {Math.round(getRealTimeMetrics().engagementScore)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session Controls Toggle */}
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
                className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-black hover:bg-opacity-70"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Pause Overlay */}
            {sessionState === 'paused' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <Pause className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Interview Paused</h3>
                  <p className="text-gray-300 mb-4">Click resume to continue</p>
                  <Button onClick={resumeSession} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Resume Interview
                  </Button>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
                <Button
                  variant={isMicOn ? 'default' : 'destructive'}
                  size="sm"
                  onClick={toggleMic}
                  className="rounded-full"
                  disabled={sessionState === 'paused'}
                >
                  {isMicOn ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={isCameraOn ? 'default' : 'destructive'}
                  size="sm"
                  onClick={toggleCamera}
                  className="rounded-full"
                  disabled={sessionState === 'paused'}
                >
                  {isCameraOn ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <CameraOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={isSpeakerOn ? 'default' : 'destructive'}
                  size="sm"
                  onClick={toggleSpeaker}
                  className="rounded-full"
                >
                  {isSpeakerOn ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={toggleRecording}
                  className="rounded-full"
                  disabled={sessionState === 'paused'}
                >
                  <div
                    className={`h-3 w-3 rounded-full ${
                      isRecording ? 'bg-white animate-pulse' : 'bg-red-500'
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Panel (Optional) */}
        {showMetrics && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Real-time Metrics</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetrics(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4">
              <RealTimeMetricsDashboard
                isActive={isMetricsCollecting}
                compact={true}
              />
            </div>
          </div>
        )}

        {/* Question Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Question</h2>
              <Badge
                className={`${
                  currentQuestion?.difficulty <= 3
                    ? 'bg-green-600'
                    : currentQuestion?.difficulty <= 7
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                }`}
              >
                Difficulty: {currentQuestion?.difficulty}/10
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Voice Player for Current Question */}
              {currentQuestion && isSpeakerOn && (
                <VoicePlayer
                  interviewer={config.interviewer}
                  text={currentQuestion.text}
                  autoPlay={true}
                  showText={false}
                  className="bg-gray-700 border-gray-600"
                  onPlayStart={() => console.log('Question audio started')}
                  onPlayEnd={() => console.log('Question audio ended')}
                  onError={error =>
                    console.error('Voice synthesis error:', error)
                  }
                />
              )}

              <p className="text-gray-100 leading-relaxed">
                {currentQuestion?.text}
              </p>

              {currentQuestion?.followUpQuestions &&
                currentQuestion.followUpQuestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Follow-up Questions:
                    </h4>
                    <ul className="space-y-1">
                      {currentQuestion.followUpQuestions.map(
                        (followUp, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-400 pl-4 border-l-2 border-gray-600"
                          >
                            {followUp}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* Response Area */}
          <div className="flex-1 p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Your Response
            </h3>

            {/* Audio Recorder */}
            <AudioRecorder
              onRecordingComplete={(audioBlob, duration) => {
                console.log('Recording completed:', {
                  duration,
                  size: audioBlob.size,
                });
                // Here you would typically upload the audio or process it
                setCurrentResponse(
                  `[Audio Response - ${Math.round(duration)}s]`
                );
              }}
              onError={error => {
                console.error('Recording error:', error);
              }}
              maxDuration={300} // 5 minutes
              className="bg-gray-700 border-gray-600"
              disabled={sessionState === 'paused'}
            />

            {/* Text Response (Alternative) */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                Or type your response:
              </label>
              <textarea
                value={currentResponse}
                onChange={e => setCurrentResponse(e.target.value)}
                placeholder="Type your response here..."
                className="w-full h-20 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="text-xs text-gray-400">
              Expected duration: ~
              {Math.round(currentQuestion?.expectedDuration / 60)} minutes
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button onClick={nextQuestion} size="sm">
                {currentQuestionIndex === questions.length - 1
                  ? 'Finish'
                  : 'Next'}
                {currentQuestionIndex < questions.length - 1 && (
                  <ArrowRight className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
