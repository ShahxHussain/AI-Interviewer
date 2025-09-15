'use client';

import React, { useState, useEffect } from 'react';
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
  Brain,
  Target,
  BookOpen,
  Users,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InterviewSession } from '@/types';
import { FeedbackService, ComprehensiveFeedback } from '@/lib/services/feedback-service';

interface ComprehensiveFeedbackProps {
  session: InterviewSession;
  onRetakeInterview: () => void;
  onBackToHome: () => void;
  onDownloadReport: () => void;
}

export function ComprehensiveFeedbackComponent({
  session,
  onRetakeInterview,
  onBackToHome,
  onDownloadReport,
}: ComprehensiveFeedbackProps) {
  const [feedback, setFeedback] = useState<ComprehensiveFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        setIsLoading(true);
        const comprehensiveFeedback = await FeedbackService.generateComprehensiveFeedback(session);
        setFeedback(comprehensiveFeedback);
      } catch (err) {
        console.error('Failed to generate comprehensive feedback:', err);
        setError('Failed to generate detailed feedback. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateFeedback();
  }, [session]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return '0:00';
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Generating Comprehensive Feedback</CardTitle>
            <CardDescription>
              Analyzing your interview performance with AI...
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

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Feedback Generation Failed</CardTitle>
            <CardDescription>{error || 'Unable to generate feedback'}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onBackToHome} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen luxury-container py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
            <CheckCircle className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold luxury-text-gold mb-2">
            Interview Analysis Complete!
          </h1>
          <p className="text-lg luxury-text-secondary">
            Here&apos;s your comprehensive AI-powered performance analysis.
          </p>
        </div>

        {/* Overview Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('overview')}
              >
                {expandedSections.has('overview') ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('overview') && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 ${getScoreColor(feedback.overallScore)}`}
                  >
                    {feedback.overallScore.toFixed(1)}
                  </div>
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-xs text-gray-600">
                    {getPerformanceLevel(feedback.overallScore)}
                  </p>
                </div>

                {/* Duration */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatDuration(session.startedAt, session.completedAt)}
                  </div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-xs text-gray-600">
                    {session.questions.length} questions
                  </p>
                </div>

                {/* Completion Rate */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round((session.responses.length / session.questions.length) * 100)}%
                  </div>
                  <p className="text-sm font-medium">Completion</p>
                  <p className="text-xs text-gray-600">
                    {session.responses.length}/{session.questions.length} answered
                  </p>
                </div>

                {/* Percentile */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {feedback.benchmarkComparison.percentile}th
                  </div>
                  <p className="text-sm font-medium">Percentile</p>
                  <p className="text-xs text-gray-600">
                    vs {feedback.benchmarkComparison.similarProfiles} similar profiles
                  </p>
                </div>
              </div>

              {/* Detailed Analysis Bars */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Skill Breakdown</h4>
                {Object.entries(feedback.detailedAnalysis).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-600">{score}/10</span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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
                <Target className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-200 mt-0.5 flex-shrink-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                    </div>
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Question Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Question-by-Question Analysis
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('questions')}
              >
                {expandedSections.has('questions') ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('questions') && (
            <CardContent>
              <div className="space-y-4">
                {feedback.questionAnalysis.map((qa, index) => {
                  const question = session.questions.find(q => q.id === qa.questionId);
                  const response = session.responses.find(r => r.questionId === qa.questionId);
                  
                  if (!question || !response) return null;
                  
                  return (
                    <div key={qa.questionId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Question {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{question.text}</p>
                        </div>
                        <Badge className={getScoreColor(qa.assessment.score)}>
                          {qa.assessment.score}/10
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{qa.assessment.relevance}</div>
                          <div className="text-xs text-gray-600">Relevance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{qa.assessment.completeness}</div>
                          <div className="text-xs text-gray-600">Completeness</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{qa.assessment.clarity}</div>
                          <div className="text-xs text-gray-600">Clarity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {Math.round(response.confidence * 100)}%
                          </div>
                          <div className="text-xs text-gray-600">Confidence</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{qa.assessment.reasoning}</p>
                      
                      {qa.assessment.missingElements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Could be enhanced with:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {qa.assessment.missingElements.map((element, idx) => (
                              <li key={idx}>{element}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Improvement Plan */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Improvement Plan
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('improvement')}
              >
                {expandedSections.has('improvement') ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('improvement') && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Short-term Goals */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Short-term Goals (1-2 weeks)
                  </h4>
                  <ul className="space-y-2">
                    {feedback.improvementPlan.shortTerm.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long-term Goals */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Long-term Goals (1-3 months)
                  </h4>
                  <ul className="space-y-2">
                    {feedback.improvementPlan.longTerm.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resources */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Recommended Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {feedback.improvementPlan.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <BookOpen className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Actionable Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Actionable Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                  </div>
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
            Download Detailed Report
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
            Practice Again
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