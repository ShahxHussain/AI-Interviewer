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
} from 'lucide-react';
import {
  InterviewConfiguration,
  InterviewQuestion,
  InterviewResponse,
  InterviewSession as IInterviewSession,
} from '@/types';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';
import { VoicePlayer } from './VoicePlayer';
import { AudioRecorder } from './AudioRecorder';
import { CameraFeed } from './CameraFeed';

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

  const {
    questions,
    isLoading: questionsLoading,
    error: questionsError,
    generateQuestions,
  } = useQuestionGeneration();

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

  const startSession = useCallback(() => {
    const now = new Date();
    setSessionStartTime(now);
    setQuestionStartTime(now);
    setSessionState('in-progress');
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  }, []);

  const pauseSession = useCallback(() => {
    setSessionState('paused');
    setIsRecording(false);
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState('in-progress');
  }, []);

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

  const completeSession = useCallback(() => {
    if (!sessionStartTime) return;

    const session: IInterviewSession = {
      id: sessionId,
      candidateId: 'current-user', // This should come from auth context
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
        weaknesses: [
          'Could improve confidence',
          'More specific examples needed',
        ],
        suggestions: [
          'Practice more behavioral questions',
          'Work on eye contact',
        ],
        overallScore: 8.5,
      },
      status: 'completed',
      startedAt: sessionStartTime,
      completedAt: new Date(),
    };

    setSessionState('completed');
    onSessionComplete(session);
  }, [
    sessionId,
    config,
    questions,
    responses,
    sessionStartTime,
    onSessionComplete,
  ]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

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

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
                <Button
                  variant={isMicOn ? 'default' : 'destructive'}
                  size="sm"
                  onClick={toggleMic}
                  className="rounded-full"
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
                >
                  <div
                    className={`h-3 w-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

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
