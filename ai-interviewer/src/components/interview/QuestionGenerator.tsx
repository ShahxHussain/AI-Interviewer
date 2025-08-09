'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import {
  useQuestionGeneration,
  useQuestionAnalysis,
} from '@/hooks/useQuestionGeneration';
import { InterviewConfiguration, InterviewQuestion } from '@/types';

interface QuestionGeneratorProps {
  config: InterviewConfiguration;
  onQuestionsGenerated?: (
    questions: InterviewQuestion[],
    sessionId: string
  ) => void;
  className?: string;
}

export function QuestionGenerator({
  config,
  onQuestionsGenerated,
  className = '',
}: QuestionGeneratorProps) {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const {
    questions,
    sessionId,
    isLoading,
    error,
    generateQuestions,
    clearQuestions,
    regenerateQuestion,
  } = useQuestionGeneration();

  const { analyzeQuestions } = useQuestionAnalysis();

  const handleGenerateQuestions = async () => {
    await generateQuestions(config, config.resumeData, {
      numberOfQuestions,
      includeFollowUps: true,
    });
  };

  const handleRegenerateQuestion = async (questionId: string) => {
    await regenerateQuestion(questionId, config);
  };

  // Notify parent component when questions are generated
  React.useEffect(() => {
    if (questions.length > 0 && sessionId && onQuestionsGenerated) {
      onQuestionsGenerated(questions, sessionId);
    }
  }, [questions, sessionId, onQuestionsGenerated]);

  const analysis = analyzeQuestions(questions);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Question Generation</CardTitle>
          <CardDescription>
            Generate AI-powered interview questions based on your configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="questionCount" className="text-sm font-medium">
                Number of Questions:
              </label>
              <select
                id="questionCount"
                value={numberOfQuestions}
                onChange={e => setNumberOfQuestions(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
                disabled={isLoading}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={7}>7 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <Button
              onClick={handleGenerateQuestions}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isLoading ? 'Generating...' : 'Generate Questions'}
            </Button>

            {questions.length > 0 && (
              <Button
                variant="outline"
                onClick={clearQuestions}
                disabled={isLoading}
              >
                Clear Questions
              </Button>
            )}
          </div>

          {/* Configuration Summary */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {config.interviewer.replace('-', ' ')}
            </Badge>
            <Badge variant="secondary">{config.type}</Badge>
            <Badge variant="secondary">{config.settings.difficulty}</Badge>
            <Badge variant="secondary">{config.settings.topicFocus}</Badge>
            <Badge variant="secondary">{config.settings.purpose}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Error generating questions:
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions Analysis */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.averageDifficulty}
                </div>
                <div className="text-sm text-gray-600">Avg Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(analysis.totalDuration / 60)}m
                </div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    questions.filter(
                      q => q.followUpQuestions && q.followUpQuestions.length > 0
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">With Follow-ups</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Questions</h3>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index + 1}
              onRegenerate={() => handleRegenerateQuestion(question.id)}
              isRegenerating={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function QuestionCard({
  question,
  index,
  onRegenerate,
  isRegenerating,
}: QuestionCardProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'bg-green-100 text-green-800';
    if (difficulty <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 7) return 'Medium';
    return 'Hard';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Q{index}</Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {getDifficultyLabel(question.difficulty)} ({question.difficulty}
              /10)
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {Math.round(question.expectedDuration / 60)}m
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1"
          >
            {isRegenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-900 mb-4">{question.text}</p>

        {question.followUpQuestions &&
          question.followUpQuestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Follow-up Questions:
              </h4>
              <ul className="space-y-1">
                {question.followUpQuestions.map((followUp, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200"
                  >
                    {followUp}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
