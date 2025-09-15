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
    <div className="min-h-screen luxury-container py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
            <CheckCircle className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold luxury-text-gold mb-2">
            Interview Completed!
          </h1>
          <p className="text-lg luxury-text-secondary">
            Great job! Here&apos;s your detailed performance analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <div className="luxury-card p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold luxury-text-gold mb-4">Overall Score</h3>
              <div
                className={`text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 ${
                  session.feedback.overallScore >= 8 
                    ? 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30' 
                    : session.feedback.overallScore >= 6 
                    ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                    : 'bg-gradient-to-r from-red-400/20 to-red-600/20 text-red-400 border border-red-400/30'
                }`}
              >
                {session.feedback.overallScore.toFixed(1)}
              </div>
              <p className="text-sm luxury-text-secondary">
                {getPerformanceLevel(session.feedback.overallScore)}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="luxury-card p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold luxury-text-gold mb-4 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Duration
              </h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatDuration(session.startedAt, session.completedAt)}
              </div>
              <p className="text-sm luxury-text-secondary">
                {session.questions.length} questions answered
              </p>
            </div>
          </div>

          {/* Questions Completed */}
          <div className="luxury-card p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold luxury-text-gold mb-4 flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Completion
              </h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {session.responses.length}/{session.questions.length}
              </div>
              <p className="text-sm luxury-text-secondary">
                {Math.round(
                  (session.responses.length / session.questions.length) * 100
                )}
                % completed
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="luxury-card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold luxury-text-gold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Eye Contact</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.eyeContactPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm luxury-text-secondary">
                    {session.metrics.eyeContactPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.averageConfidence * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm luxury-text-secondary">
                    {Math.round(session.metrics.averageConfidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Response Quality</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.responseQuality * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm luxury-text-secondary">
                    {Math.round(session.metrics.responseQuality * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Overall Engagement</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                      style={{
                        width: `${session.metrics.overallEngagement * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm luxury-text-secondary">
                    {Math.round(session.metrics.overallEngagement * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Configuration */}
          <div className="luxury-card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold luxury-text-gold">Interview Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Interviewer Type</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30 text-xs font-medium capitalize">
                  {session.configuration.interviewer.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Interview Type</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30 text-xs font-medium capitalize">
                  {session.configuration.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Difficulty Level</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-400 border border-blue-400/30 text-xs font-medium capitalize">
                  {session.configuration.settings.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Topic Focus</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-400/20 to-purple-600/20 text-purple-400 border border-purple-400/30 text-xs font-medium capitalize">
                  {session.configuration.settings.topicFocus === 'dsa'
                    ? 'DSA'
                    : session.configuration.settings.topicFocus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium luxury-text-primary">Purpose</span>
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 text-orange-400 border border-orange-400/30 text-xs font-medium capitalize">
                  {session.configuration.settings.purpose}
                </span>
              </div>
            </div>
          </div>
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
          <button
            onClick={onDownloadReport}
            className="luxury-button-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>

          <button className="luxury-button-secondary flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </button>

          <button
            onClick={onRetakeInterview}
            className="luxury-button-primary flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Interview
          </button>

          <button
            onClick={onBackToHome}
            className="luxury-button-secondary flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
