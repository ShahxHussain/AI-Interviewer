import {
  InterviewSession,
  InterviewResponse,
  InterviewFeedback,
  InterviewConfiguration,
  InterviewQuestion,
  InterviewMetrics,
} from '@/types';

export interface AnswerQualityAssessment {
  score: number; // 0-10
  relevance: number; // 0-10
  completeness: number; // 0-10
  clarity: number; // 0-10
  technicalAccuracy?: number; // 0-10 (for technical questions)
  behavioralInsight?: number; // 0-10 (for behavioral questions)
  reasoning: string;
  keyPoints: string[];
  missingElements: string[];
}

export interface ComprehensiveFeedback extends InterviewFeedback {
  detailedAnalysis: {
    communicationSkills: number; // 0-10
    technicalKnowledge: number; // 0-10
    problemSolving: number; // 0-10
    confidence: number; // 0-10
    engagement: number; // 0-10
  };
  questionAnalysis: Array<{
    questionId: string;
    assessment: AnswerQualityAssessment;
  }>;
  improvementPlan: {
    shortTerm: string[];
    longTerm: string[];
    resources: string[];
  };
  benchmarkComparison: {
    percentile: number;
    similarProfiles: number;
    industryAverage: number;
  };
}

export class FeedbackService {
  /**
   * Generate comprehensive AI-powered feedback for an interview session
   */
  static async generateComprehensiveFeedback(
    session: InterviewSession
  ): Promise<ComprehensiveFeedback> {
    try {
      // First, try to get AI-powered feedback from the API
      const aiFeedback = await this.getAIFeedback(session);
      
      // Analyze each response for detailed assessment
      const questionAnalysis = await Promise.all(
        session.responses.map(async (response) => {
          const question = session.questions.find(q => q.id === response.questionId);
          if (!question) {
            throw new Error(`Question not found for response: ${response.questionId}`);
          }
          
          const assessment = await this.assessAnswerQuality(
            question,
            response,
            session.configuration
          );
          
          return {
            questionId: response.questionId,
            assessment,
          };
        })
      );

      // Use AI feedback if available, otherwise generate locally
      const detailedAnalysis = aiFeedback?.detailedAnalysis || this.generateDetailedAnalysis(
        session.metrics,
        questionAnalysis,
        session.configuration
      );

      const strengths = aiFeedback?.strengths || this.identifyStrengths(detailedAnalysis, questionAnalysis, session.metrics);
      const weaknesses = aiFeedback?.weaknesses || this.identifyWeaknesses(detailedAnalysis, questionAnalysis, session.metrics);
      const suggestions = aiFeedback?.suggestions || this.generateActionableSuggestions(
        weaknesses,
        detailedAnalysis,
        session.configuration
      );
      const overallScore = aiFeedback?.overallScore || this.calculateOverallScore(detailedAnalysis, session.metrics);

      // Create improvement plan
      const improvementPlan = this.createImprovementPlan(
        weaknesses,
        detailedAnalysis,
        session.configuration
      );

      // Generate benchmark comparison
      const benchmarkComparison = this.generateBenchmarkComparison(
        overallScore,
        session.configuration
      );

      return {
        strengths,
        weaknesses,
        suggestions,
        overallScore,
        detailedAnalysis,
        questionAnalysis,
        improvementPlan,
        benchmarkComparison,
      };
    } catch (error) {
      console.error('Failed to generate comprehensive feedback:', error);
      
      // Fallback to basic feedback
      return this.generateBasicFeedback(session);
    }
  }

  /**
   * Get AI-powered feedback from the API
   */
  private static async getAIFeedback(session: InterviewSession) {
    try {
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          includeDetailedAnalysis: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.feedback;
    } catch (error) {
      console.error('Failed to get AI feedback:', error);
      return null;
    }
  }

  /**
   * Assess the quality of a single answer using AI analysis
   */
  private static async assessAnswerQuality(
    question: InterviewQuestion,
    response: InterviewResponse,
    config: InterviewConfiguration
  ): Promise<AnswerQualityAssessment> {
    try {
      // In a real implementation, this would call Together.ai or another AI service
      // For now, we'll use rule-based assessment with some randomization for demo
      
      const wordCount = response.transcription.split(' ').length;
      const hasSpecificExamples = /example|instance|case|situation|time when/i.test(response.transcription);
      const hasTechnicalTerms = this.containsTechnicalTerms(response.transcription, config.type);
      const responseLength = response.transcription.length;
      
      // Base scoring
      let relevance = Math.min(10, Math.max(3, wordCount / 10 + (hasSpecificExamples ? 2 : 0)));
      let completeness = Math.min(10, Math.max(2, responseLength / 50));
      let clarity = Math.min(10, Math.max(3, 10 - (response.transcription.split('.').length > 10 ? 2 : 0)));
      
      // Adjust based on question type
      let technicalAccuracy: number | undefined;
      let behavioralInsight: number | undefined;
      
      if (config.type === 'technical') {
        technicalAccuracy = Math.min(10, Math.max(2, (hasTechnicalTerms ? 7 : 4) + Math.random() * 2));
        relevance += hasTechnicalTerms ? 1 : -1;
      } else if (config.type === 'behavioral') {
        behavioralInsight = Math.min(10, Math.max(3, (hasSpecificExamples ? 8 : 5) + Math.random() * 2));
        completeness += hasSpecificExamples ? 2 : -1;
      }
      
      // Adjust for confidence and duration
      const confidenceBonus = response.confidence > 0.7 ? 1 : response.confidence < 0.4 ? -1 : 0;
      const durationPenalty = response.duration < 30000 ? -1 : response.duration > 300000 ? -1 : 0;
      
      relevance = Math.max(0, Math.min(10, relevance + confidenceBonus));
      completeness = Math.max(0, Math.min(10, completeness + durationPenalty));
      
      const score = Math.round((relevance + completeness + clarity + (technicalAccuracy || 0) + (behavioralInsight || 0)) / (technicalAccuracy || behavioralInsight ? 5 : 3));
      
      // Generate reasoning and feedback
      const reasoning = this.generateAnswerReasoning(
        score,
        { relevance, completeness, clarity, technicalAccuracy, behavioralInsight },
        question.type
      );
      
      const keyPoints = this.extractKeyPoints(response.transcription);
      const missingElements = this.identifyMissingElements(question, response, config);
      
      return {
        score: Math.max(0, Math.min(10, score)),
        relevance: Math.max(0, Math.min(10, relevance)),
        completeness: Math.max(0, Math.min(10, completeness)),
        clarity: Math.max(0, Math.min(10, clarity)),
        technicalAccuracy,
        behavioralInsight,
        reasoning,
        keyPoints,
        missingElements,
      };
    } catch (error) {
      console.error('Failed to assess answer quality:', error);
      
      // Fallback assessment
      return {
        score: 6,
        relevance: 6,
        completeness: 6,
        clarity: 6,
        reasoning: 'Unable to perform detailed analysis. Basic assessment provided.',
        keyPoints: ['Response provided'],
        missingElements: ['Detailed analysis unavailable'],
      };
    }
  }

  /**
   * Generate detailed analysis of interview performance
   */
  private static generateDetailedAnalysis(
    metrics: InterviewMetrics,
    questionAnalysis: Array<{ questionId: string; assessment: AnswerQualityAssessment }>,
    config: InterviewConfiguration
  ) {
    const avgScore = questionAnalysis.reduce((sum, qa) => sum + qa.assessment.score, 0) / questionAnalysis.length;
    const avgRelevance = questionAnalysis.reduce((sum, qa) => sum + qa.assessment.relevance, 0) / questionAnalysis.length;
    const avgClarity = questionAnalysis.reduce((sum, qa) => sum + qa.assessment.clarity, 0) / questionAnalysis.length;
    
    return {
      communicationSkills: Math.round((avgClarity + metrics.averageConfidence * 10) / 2),
      technicalKnowledge: config.type === 'technical' 
        ? Math.round(questionAnalysis
            .filter(qa => qa.assessment.technicalAccuracy)
            .reduce((sum, qa) => sum + (qa.assessment.technicalAccuracy || 0), 0) / 
          Math.max(1, questionAnalysis.filter(qa => qa.assessment.technicalAccuracy).length))
        : Math.round(avgScore * 0.8),
      problemSolving: Math.round((avgRelevance + metrics.responseQuality * 10) / 2),
      confidence: Math.round(metrics.averageConfidence * 10),
      engagement: Math.round(metrics.overallEngagement * 10),
    };
  }

  /**
   * Identify strengths based on performance analysis
   */
  private static identifyStrengths(
    analysis: any,
    questionAnalysis: Array<{ questionId: string; assessment: AnswerQualityAssessment }>,
    metrics: InterviewMetrics
  ): string[] {
    const strengths: string[] = [];
    
    if (analysis.communicationSkills >= 8) {
      strengths.push('Excellent communication skills and clear articulation');
    }
    
    if (analysis.confidence >= 8) {
      strengths.push('High confidence level throughout the interview');
    }
    
    if (analysis.technicalKnowledge >= 8) {
      strengths.push('Strong technical knowledge and understanding');
    }
    
    if (analysis.problemSolving >= 8) {
      strengths.push('Effective problem-solving approach');
    }
    
    if (metrics.eyeContactPercentage >= 80) {
      strengths.push('Maintained good eye contact and engagement');
    }
    
    if (analysis.engagement >= 8) {
      strengths.push('High level of engagement and enthusiasm');
    }
    
    // Analyze specific question performance
    const highScoringQuestions = questionAnalysis.filter(qa => qa.assessment.score >= 8);
    if (highScoringQuestions.length > questionAnalysis.length * 0.6) {
      strengths.push('Consistently provided high-quality responses');
    }
    
    // If no specific strengths identified, provide general positive feedback
    if (strengths.length === 0) {
      strengths.push('Completed the interview with dedication');
      strengths.push('Showed willingness to engage with challenging questions');
    }
    
    return strengths;
  }

  /**
   * Identify weaknesses and areas for improvement
   */
  private static identifyWeaknesses(
    analysis: any,
    questionAnalysis: Array<{ questionId: string; assessment: AnswerQualityAssessment }>,
    metrics: InterviewMetrics
  ): string[] {
    const weaknesses: string[] = [];
    
    if (analysis.communicationSkills < 6) {
      weaknesses.push('Communication clarity could be improved');
    }
    
    if (analysis.confidence < 6) {
      weaknesses.push('Building confidence in responses would be beneficial');
    }
    
    if (analysis.technicalKnowledge < 6) {
      weaknesses.push('Technical knowledge needs strengthening');
    }
    
    if (analysis.problemSolving < 6) {
      weaknesses.push('Problem-solving approach could be more structured');
    }
    
    if (metrics.eyeContactPercentage < 60) {
      weaknesses.push('Maintaining eye contact throughout the interview');
    }
    
    if (analysis.engagement < 6) {
      weaknesses.push('Showing more enthusiasm and engagement');
    }
    
    // Analyze response completeness
    const incompleteResponses = questionAnalysis.filter(qa => qa.assessment.completeness < 6);
    if (incompleteResponses.length > questionAnalysis.length * 0.4) {
      weaknesses.push('Providing more comprehensive and detailed responses');
    }
    
    // Analyze response relevance
    const irrelevantResponses = questionAnalysis.filter(qa => qa.assessment.relevance < 6);
    if (irrelevantResponses.length > questionAnalysis.length * 0.3) {
      weaknesses.push('Ensuring responses directly address the questions asked');
    }
    
    return weaknesses;
  }

  /**
   * Generate actionable improvement suggestions
   */
  private static generateActionableSuggestions(
    weaknesses: string[],
    analysis: any,
    config: InterviewConfiguration
  ): string[] {
    const suggestions: string[] = [];
    
    if (analysis.communicationSkills < 7) {
      suggestions.push('Practice speaking clearly and at a moderate pace');
      suggestions.push('Use the STAR method (Situation, Task, Action, Result) for structured responses');
    }
    
    if (analysis.confidence < 7) {
      suggestions.push('Practice mock interviews to build confidence');
      suggestions.push('Prepare specific examples from your experience beforehand');
    }
    
    if (config.type === 'technical' && analysis.technicalKnowledge < 7) {
      suggestions.push('Review fundamental concepts in your field');
      suggestions.push('Practice coding problems and system design questions');
    }
    
    if (config.type === 'behavioral' && analysis.problemSolving < 7) {
      suggestions.push('Prepare stories that demonstrate problem-solving skills');
      suggestions.push('Focus on quantifiable results and impact in your examples');
    }
    
    if (analysis.engagement < 7) {
      suggestions.push('Show enthusiasm by asking thoughtful questions');
      suggestions.push('Maintain good posture and active body language');
    }
    
    // General suggestions
    suggestions.push('Record yourself practicing to identify areas for improvement');
    suggestions.push('Research the company and role thoroughly before interviews');
    
    return suggestions;
  }

  /**
   * Create a structured improvement plan
   */
  private static createImprovementPlan(
    weaknesses: string[],
    analysis: any,
    config: InterviewConfiguration
  ) {
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const resources: string[] = [];
    
    // Short-term improvements (1-2 weeks)
    if (analysis.communicationSkills < 7) {
      shortTerm.push('Practice daily speaking exercises for 15 minutes');
      shortTerm.push('Record and review your responses to common interview questions');
    }
    
    if (analysis.confidence < 7) {
      shortTerm.push('Conduct 3-5 mock interviews with friends or online platforms');
      shortTerm.push('Prepare and memorize 5-7 key stories from your experience');
    }
    
    // Long-term improvements (1-3 months)
    if (analysis.technicalKnowledge < 7) {
      longTerm.push('Complete relevant online courses or certifications');
      longTerm.push('Build portfolio projects demonstrating key skills');
    }
    
    if (analysis.problemSolving < 7) {
      longTerm.push('Practice system design and case study problems regularly');
      longTerm.push('Join professional groups or forums in your field');
    }
    
    // Resources
    resources.push('Glassdoor for company-specific interview questions');
    resources.push('LeetCode or HackerRank for technical practice');
    resources.push('Pramp or InterviewBuddy for mock interviews');
    resources.push('YouTube channels focused on interview preparation');
    resources.push('LinkedIn Learning courses on interview skills');
    
    return { shortTerm, longTerm, resources };
  }

  /**
   * Calculate overall interview score
   */
  private static calculateOverallScore(analysis: any, metrics: InterviewMetrics): number {
    const weights = {
      communicationSkills: 0.25,
      technicalKnowledge: 0.25,
      problemSolving: 0.20,
      confidence: 0.15,
      engagement: 0.15,
    };
    
    const weightedScore = 
      analysis.communicationSkills * weights.communicationSkills +
      analysis.technicalKnowledge * weights.technicalKnowledge +
      analysis.problemSolving * weights.problemSolving +
      analysis.confidence * weights.confidence +
      analysis.engagement * weights.engagement;
    
    return Math.round(weightedScore * 10) / 10;
  }

  /**
   * Generate benchmark comparison
   */
  private static generateBenchmarkComparison(
    overallScore: number,
    config: InterviewConfiguration
  ) {
    // Mock benchmark data - in production, this would come from actual data
    const basePercentile = Math.min(95, Math.max(5, overallScore * 10 + Math.random() * 10));
    
    return {
      percentile: Math.round(basePercentile),
      similarProfiles: Math.floor(Math.random() * 1000) + 100,
      industryAverage: 6.8 + Math.random() * 0.8,
    };
  }

  /**
   * Generate basic feedback as fallback
   */
  private static generateBasicFeedback(session: InterviewSession): ComprehensiveFeedback {
    return {
      strengths: [
        'Completed the interview session',
        'Engaged with the questions presented',
        'Demonstrated willingness to participate',
      ],
      weaknesses: [
        'Detailed analysis unavailable',
        'Consider retaking for more comprehensive feedback',
      ],
      suggestions: [
        'Practice more mock interviews',
        'Prepare specific examples from your experience',
        'Work on maintaining eye contact',
      ],
      overallScore: 6.5,
      detailedAnalysis: {
        communicationSkills: 6,
        technicalKnowledge: 6,
        problemSolving: 6,
        confidence: 6,
        engagement: 6,
      },
      questionAnalysis: [],
      improvementPlan: {
        shortTerm: ['Practice daily interview questions'],
        longTerm: ['Build relevant skills and experience'],
        resources: ['Online interview preparation platforms'],
      },
      benchmarkComparison: {
        percentile: 50,
        similarProfiles: 500,
        industryAverage: 6.5,
      },
    };
  }

  // Helper methods
  private static containsTechnicalTerms(text: string, type: string): boolean {
    const technicalTerms = [
      'algorithm', 'data structure', 'complexity', 'optimization', 'database',
      'api', 'framework', 'architecture', 'scalability', 'performance',
      'security', 'testing', 'deployment', 'version control', 'debugging'
    ];
    
    if (type !== 'technical') return false;
    
    const lowerText = text.toLowerCase();
    return technicalTerms.some(term => lowerText.includes(term));
  }

  private static generateAnswerReasoning(
    score: number,
    components: any,
    questionType: string
  ): string {
    if (score >= 8) {
      return `Excellent response with strong ${questionType === 'technical' ? 'technical depth' : 'behavioral insights'} and clear communication.`;
    } else if (score >= 6) {
      return `Good response that addresses the question adequately with room for more detail and examples.`;
    } else {
      return `Response could be improved with more specific examples, clearer structure, and deeper analysis.`;
    }
  }

  private static extractKeyPoints(text: string): string[] {
    // Simple extraction - in production, this would use NLP
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private static identifyMissingElements(
    question: InterviewQuestion,
    response: InterviewResponse,
    config: InterviewConfiguration
  ): string[] {
    const missing: string[] = [];
    
    if (response.transcription.length < 100) {
      missing.push('More detailed explanation');
    }
    
    if (!response.transcription.includes('example') && !response.transcription.includes('instance')) {
      missing.push('Specific examples or instances');
    }
    
    if (config.type === 'behavioral' && !response.transcription.includes('result')) {
      missing.push('Quantifiable results or outcomes');
    }
    
    return missing;
  }
}