import { NextRequest, NextResponse } from 'next/server';
import {
  InterviewSession,
  InterviewResponse,
  InterviewQuestion,
  InterviewConfiguration,
} from '@/types';

interface FeedbackRequest {
  session: InterviewSession;
  includeDetailedAnalysis?: boolean;
}

interface FeedbackResponse {
  success: boolean;
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    overallScore: number;
    detailedAnalysis?: {
      communicationSkills: number;
      technicalKnowledge: number;
      problemSolving: number;
      confidence: number;
      engagement: number;
    };
    questionAnalysis?: Array<{
      questionId: string;
      score: number;
      reasoning: string;
      keyPoints: string[];
      missingElements: string[];
    }>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<FeedbackResponse>> {
  try {
    const body: FeedbackRequest = await request.json();
    const { session, includeDetailedAnalysis = true } = body;

    if (!session || !session.questions || !session.responses) {
      return NextResponse.json({
        success: false,
        error: 'Invalid session data provided',
      }, { status: 400 });
    }

    // Generate AI-powered feedback using Together.ai
    const feedback = await generateAIFeedback(session, includeDetailedAnalysis);

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate feedback',
    }, { status: 500 });
  }
}

async function generateAIFeedback(
  session: InterviewSession,
  includeDetailedAnalysis: boolean
) {
  try {
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    
    if (!togetherApiKey) {
      console.warn('Together.ai API key not found, using fallback feedback');
      return generateFallbackFeedback(session);
    }

    // Prepare the prompt for Together.ai
    const prompt = buildFeedbackPrompt(session);

    // Call Together.ai API
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-2-70b-chat-hf',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach and assessor. Analyze interview performance and provide constructive, actionable feedback. Always be encouraging while identifying specific areas for improvement.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const feedbackText = aiResponse.choices[0]?.message?.content;

    if (!feedbackText) {
      throw new Error('No feedback content received from AI');
    }

    // Parse the AI response into structured feedback
    const structuredFeedback = parseAIFeedback(feedbackText, session);

    // Add detailed analysis if requested
    if (includeDetailedAnalysis) {
      structuredFeedback.detailedAnalysis = generateDetailedAnalysis(session);
      structuredFeedback.questionAnalysis = await generateQuestionAnalysis(session);
    }

    return structuredFeedback;
  } catch (error) {
    console.error('AI feedback generation failed:', error);
    return generateFallbackFeedback(session);
  }
}

function buildFeedbackPrompt(session: InterviewSession): string {
  const config = session.configuration;
  const responses = session.responses;
  const questions = session.questions;
  const metrics = session.metrics;

  let prompt = `Please analyze this ${config.type} interview session and provide comprehensive feedback.

INTERVIEW DETAILS:
- Interviewer Type: ${config.interviewer.replace('-', ' ')}
- Interview Type: ${config.type}
- Difficulty Level: ${config.settings.difficulty}
- Topic Focus: ${config.settings.topicFocus}
- Purpose: ${config.settings.purpose}

PERFORMANCE METRICS:
- Eye Contact: ${metrics.eyeContactPercentage}%
- Average Confidence: ${Math.round(metrics.averageConfidence * 100)}%
- Response Quality: ${Math.round(metrics.responseQuality * 100)}%
- Overall Engagement: ${Math.round(metrics.overallEngagement * 100)}%

QUESTIONS AND RESPONSES:
`;

  questions.forEach((question, index) => {
    const response = responses.find(r => r.questionId === question.id);
    prompt += `
${index + 1}. Question: "${question.text}"
   Difficulty: ${question.difficulty}/10
   Expected Duration: ${Math.round(question.expectedDuration / 60)} minutes
   
   Response: ${response ? `"${response.transcription}"` : 'No response provided'}
   ${response ? `Duration: ${Math.round(response.duration / 1000)} seconds` : ''}
   ${response ? `Confidence: ${Math.round(response.confidence * 100)}%` : ''}
`;
  });

  prompt += `
Please provide feedback in the following JSON format:
{
  "overallScore": [number from 1-10],
  "strengths": [array of 3-5 specific strengths],
  "weaknesses": [array of 3-5 areas for improvement],
  "suggestions": [array of 5-7 actionable suggestions],
  "summary": "Brief overall assessment"
}

Focus on:
1. Communication clarity and structure
2. Technical knowledge (if applicable)
3. Problem-solving approach
4. Confidence and engagement
5. Specific examples and evidence provided
6. Areas where responses could be enhanced

Be constructive, specific, and encouraging in your feedback.`;

  return prompt;
}

function parseAIFeedback(feedbackText: string, session: InterviewSession) {
  try {
    // Try to extract JSON from the AI response
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedFeedback = JSON.parse(jsonMatch[0]);
      return {
        strengths: parsedFeedback.strengths || [],
        weaknesses: parsedFeedback.weaknesses || [],
        suggestions: parsedFeedback.suggestions || [],
        overallScore: parsedFeedback.overallScore || 7.0,
      };
    }
  } catch (error) {
    console.error('Failed to parse AI feedback JSON:', error);
  }

  // Fallback: extract feedback from text format
  return extractFeedbackFromText(feedbackText, session);
}

function extractFeedbackFromText(text: string, session: InterviewSession) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  let overallScore = 7.0;

  // Extract strengths
  const strengthsMatch = text.match(/strengths?:?\s*([\s\S]*?)(?=weaknesses?|areas for improvement|suggestions?|$)/i);
  if (strengthsMatch) {
    const strengthsText = strengthsMatch[1];
    const strengthsList = strengthsText.split(/[-•\n]/).filter(s => s.trim().length > 10);
    strengths.push(...strengthsList.slice(0, 5).map(s => s.trim()));
  }

  // Extract weaknesses
  const weaknessesMatch = text.match(/(?:weaknesses?|areas for improvement):?\s*([\s\S]*?)(?=suggestions?|recommendations?|$)/i);
  if (weaknessesMatch) {
    const weaknessesText = weaknessesMatch[1];
    const weaknessesList = weaknessesText.split(/[-•\n]/).filter(s => s.trim().length > 10);
    weaknesses.push(...weaknessesList.slice(0, 5).map(s => s.trim()));
  }

  // Extract suggestions
  const suggestionsMatch = text.match(/(?:suggestions?|recommendations?):?\s*([\s\S]*?)$/i);
  if (suggestionsMatch) {
    const suggestionsText = suggestionsMatch[1];
    const suggestionsList = suggestionsText.split(/[-•\n]/).filter(s => s.trim().length > 10);
    suggestions.push(...suggestionsList.slice(0, 7).map(s => s.trim()));
  }

  // Extract overall score
  const scoreMatch = text.match(/(?:overall score|score|rating):?\s*(\d+(?:\.\d+)?)/i);
  if (scoreMatch) {
    overallScore = Math.min(10, Math.max(1, parseFloat(scoreMatch[1])));
  }

  // Provide defaults if extraction failed
  if (strengths.length === 0) {
    strengths.push('Completed the interview session', 'Engaged with the questions');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Could provide more detailed responses');
  }
  if (suggestions.length === 0) {
    suggestions.push('Practice more mock interviews', 'Prepare specific examples');
  }

  return { strengths, weaknesses, suggestions, overallScore };
}

function generateDetailedAnalysis(session: InterviewSession) {
  const metrics = session.metrics;
  const responses = session.responses;
  const avgResponseLength = responses.reduce((sum, r) => sum + r.transcription.length, 0) / responses.length;
  
  return {
    communicationSkills: Math.min(10, Math.max(1, Math.round(
      (metrics.averageConfidence * 10 + (avgResponseLength > 200 ? 8 : 6)) / 2
    ))),
    technicalKnowledge: Math.min(10, Math.max(1, Math.round(
      metrics.responseQuality * 10
    ))),
    problemSolving: Math.min(10, Math.max(1, Math.round(
      (metrics.responseQuality * 10 + metrics.averageConfidence * 10) / 2
    ))),
    confidence: Math.min(10, Math.max(1, Math.round(
      metrics.averageConfidence * 10
    ))),
    engagement: Math.min(10, Math.max(1, Math.round(
      metrics.overallEngagement * 10
    ))),
  };
}

async function generateQuestionAnalysis(session: InterviewSession) {
  const analysis = [];
  
  for (const response of session.responses) {
    const question = session.questions.find(q => q.id === response.questionId);
    if (!question) continue;

    const wordCount = response.transcription.split(' ').length;
    const hasExamples = /example|instance|case|situation/i.test(response.transcription);
    
    const score = Math.min(10, Math.max(1, Math.round(
      (response.confidence * 10 + 
       Math.min(10, wordCount / 10) + 
       (hasExamples ? 2 : 0)) / 3
    )));

    analysis.push({
      questionId: response.questionId,
      score,
      reasoning: score >= 8 
        ? 'Strong response with good detail and confidence'
        : score >= 6 
        ? 'Adequate response with room for improvement'
        : 'Response could benefit from more detail and examples',
      keyPoints: response.transcription.split('.').slice(0, 2).map(s => s.trim()).filter(s => s.length > 0),
      missingElements: hasExamples ? [] : ['Specific examples or instances'],
    });
  }

  return analysis;
}

function generateFallbackFeedback(session: InterviewSession) {
  const completionRate = session.responses.length / session.questions.length;
  const avgConfidence = session.metrics.averageConfidence;
  
  return {
    strengths: [
      'Completed the interview session',
      completionRate > 0.8 ? 'Answered most questions thoroughly' : 'Engaged with the interview process',
      avgConfidence > 0.7 ? 'Demonstrated good confidence' : 'Showed willingness to participate',
    ],
    weaknesses: [
      completionRate < 0.8 ? 'Could complete more questions' : 'Could provide more detailed responses',
      avgConfidence < 0.6 ? 'Building confidence would be beneficial' : 'Consider more specific examples',
    ],
    suggestions: [
      'Practice more mock interviews to build confidence',
      'Prepare specific examples from your experience',
      'Work on maintaining eye contact and engagement',
      'Structure responses using the STAR method',
      'Research common interview questions for your field',
    ],
    overallScore: Math.min(10, Math.max(4, 
      completionRate * 5 + avgConfidence * 3 + session.metrics.overallEngagement * 2
    )),
  };
}