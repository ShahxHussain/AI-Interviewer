'use client';

import React from 'react';
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
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  MessageSquare,
  Star,
  Download,
  Share2,
  RotateCcw,
  Home,
} from 'lucide-react';
import { InterviewSession } from '@/types';

interface InterviewCompleteProps {
  session: InterviewSession;
  onRetakeInterview: () => void;
  onBackToHome: () => void;
  onDownloadReport: () => void;
}

export function InterviewComplete({
  session,
  onRetakeInterview,
  onBackToHome,
  onDownloadReport,
}: InterviewCompleteProps) {
  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return '0:00';
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Completed!
          </h1>
          <p className="text-lg text-gray-600">
            Great job! Here&apos;s your detailed performance analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div
                className={`text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 ${getScoreColor(session.feedback.overallScore)}`}
              >
                {session.feedback.overallScore.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">
                {getPerformanceLevel(session.feedback.overallScore)}
              </p>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatDuration(session.startedAt, session.completedAt)}
              </div>
              <p className="text-sm text-gray-600">
                {session.questions.length} questions answered
              </p>
            </CardContent>
          </Card>

          {/* Questions Completed */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {session.responses.length}/{session.questions.length}
              </div>
              <p className="text-sm text-gray-600">
                {Math.round(
                  (session.responses.length / session.questions.length) * 100
                )}
                % completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Eye Contact</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.eyeContactPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {session.metrics.eyeContactPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.averageConfidence * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(session.metrics.averageConfidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Quality</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.responseQuality * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(session.metrics.responseQuality * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Engagement</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.overallEngagement * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(session.metrics.overallEngagement * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interviewer Type</span>
                <Badge variant="secondary" className="capitalize">
                  {session.configuration.interviewer.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interview Type</span>
                <Badge variant="secondary" className="capitalize">
                  {session.configuration.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Difficulty Level</span>
                <Badge variant="secondary" className="capitalize">
                  {session.configuration.settings.difficulty}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Topic Focus</span>
                <Badge variant="secondary" className="capitalize">
                  {session.configuration.settings.topicFocus === 'dsa'
                    ? 'DSA'
                    : session.configuration.settings.topicFocus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Purpose</span>
                <Badge variant="secondary" className="capitalize">
                  {session.configuration.settings.purpose}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {session.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {session.feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-orange-200 mt-0.5 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-blue-700">
              Suggestions for Next Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {session.feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={onDownloadReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>

          <Button
            onClick={onRetakeInterview}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Interview
          </Button>

          <Button
            variant="outline"
            onClick={onBackToHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
