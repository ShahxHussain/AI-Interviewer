import { NextRequest, NextResponse } from 'next/server';
import {
  InterviewConfiguration,
  InterviewQuestion,
  ParsedResumeData,
} from '@/types';
import {
  QuestionService,
  QuestionGenerationOptions,
} from '@/lib/services/question-service';

interface QuestionGenerationRequest {
  interviewConfig: InterviewConfiguration;
  resumeData?: ParsedResumeData;
  numberOfQuestions?: number;
  includeFollowUps?: boolean;
  customPrompt?: string;
}

interface QuestionGenerationResponse {
  success: boolean;
  questions?: InterviewQuestion[];
  sessionId?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionGenerationRequest = await request.json();
    const {
      interviewConfig,
      resumeData,
      numberOfQuestions = 5,
      includeFollowUps = true,
      customPrompt,
    } = body;

    // Validate required fields
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: 'Interview configuration is required' },
        { status: 400 }
      );
    }

    // Validate interview configuration structure
    if (
      !interviewConfig.interviewer ||
      !interviewConfig.type ||
      !interviewConfig.settings
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid interview configuration structure' },
        { status: 400 }
      );
    }

    // Generate questions using the QuestionService
    const options: QuestionGenerationOptions = {
      numberOfQuestions,
      includeFollowUps,
      customPrompt,
    };

    const questions = await QuestionService.generateQuestions(
      interviewConfig,
      resumeData,
      options
    );

    // Generate session ID
    const sessionId = generateSessionId();

    return NextResponse.json({
      success: true,
      questions,
      sessionId,
    });
  } catch (error) {
    console.error('Error generating questions:', error);

    // Return more specific error messages
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate questions';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
