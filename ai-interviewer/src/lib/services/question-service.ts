import {
  InterviewConfiguration,
  InterviewQuestion,
  ParsedResumeData,
  DifficultyLevel,
  TopicFocus,
} from '@/types';

export interface QuestionGenerationOptions {
  numberOfQuestions?: number;
  includeFollowUps?: boolean;
  customPrompt?: string;
}

export class QuestionService {
  private static readonly DIFFICULTY_MULTIPLIERS = {
    beginner: 0.3,
    moderate: 0.6,
    advanced: 1.0,
  };

  private static readonly TOPIC_WEIGHTS = {
    dsa: { algorithms: 0.6, dataStructures: 0.4 },
    projects: { implementation: 0.5, architecture: 0.3, debugging: 0.2 },
    fundamentals: { concepts: 0.4, theory: 0.3, principles: 0.3 },
    resume: { experience: 0.5, skills: 0.3, projects: 0.2 },
    mixed: { balanced: 1.0 },
  };

  /**
   * Generate questions based on interview configuration and resume data
   */
  static async generateQuestions(
    config: InterviewConfiguration,
    resumeData?: ParsedResumeData,
    options: QuestionGenerationOptions = {}
  ): Promise<InterviewQuestion[]> {
    const {
      numberOfQuestions = 5,
      includeFollowUps = true,
      customPrompt,
    } = options;

    try {
      // Build context for question generation
      const context = this.buildQuestionContext(config, resumeData);

      // Generate base questions
      const baseQuestions = await this.callTogetherAI(
        context,
        numberOfQuestions,
        customPrompt
      );

      // Apply difficulty scaling
      const scaledQuestions = this.scaleDifficulty(
        baseQuestions,
        config.settings.difficulty
      );

      // Filter by topic focus
      const filteredQuestions = this.filterByTopic(
        scaledQuestions,
        config.settings.topicFocus
      );

      // Add follow-up questions if requested
      if (includeFollowUps) {
        return this.addFollowUpQuestions(filteredQuestions, config);
      }

      return filteredQuestions;
    } catch (error) {
      console.error('Error in question generation:', error);
      return this.getFallbackQuestions(config);
    }
  }

  /**
   * Build context object for question generation
   */
  private static buildQuestionContext(
    config: InterviewConfiguration,
    resumeData?: ParsedResumeData
  ) {
    return {
      interviewer: config.interviewer,
      type: config.type,
      settings: config.settings,
      candidateProfile: resumeData
        ? {
            skills: resumeData.skills,
            experience: resumeData.experience.map(exp => ({
              role: exp.position,
              company: exp.company,
              duration: exp.duration,
            })),
            projects: resumeData.projects.map(proj => ({
              name: proj.name,
              technologies: proj.technologies,
            })),
            education: resumeData.education,
          }
        : null,
      jobContext: config.jobPosting
        ? {
            title: config.jobPosting.title,
            requiredSkills: config.jobPosting.requiredSkills,
            experienceLevel: config.jobPosting.experienceLevel,
          }
        : null,
    };
  }

  /**
   * Call Together.ai API for question generation
   */
  private static async callTogetherAI(
    context: any,
    numberOfQuestions: number,
    customPrompt?: string
  ): Promise<InterviewQuestion[]> {
    const apiKey = process.env.TOGETHER_AI_API_KEY;

    if (!apiKey) {
      throw new Error('Together.ai API key not configured');
    }

    const prompt = customPrompt || this.buildPrompt(context, numberOfQuestions);

    const response = await fetch(
      'https://api.together.xyz/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(context.type, context.interviewer),
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Together.ai API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Together.ai');
    }

    return this.parseAIResponse(content, context.type);
  }

  /**
   * Build the prompt for AI question generation
   */
  private static buildPrompt(context: any, numberOfQuestions: number): string {
    let prompt = `Generate ${numberOfQuestions} ${context.type} interview questions for a ${context.interviewer}.\n\n`;

    // Add interview settings
    prompt += `Interview Settings:\n`;
    prompt += `- Difficulty: ${context.settings.difficulty}\n`;
    prompt += `- Topic Focus: ${context.settings.topicFocus}\n`;
    prompt += `- Purpose: ${context.settings.purpose}\n\n`;

    // Add candidate context if available
    if (context.candidateProfile) {
      prompt += `Candidate Profile:\n`;
      if (context.candidateProfile.skills?.length > 0) {
        prompt += `- Skills: ${context.candidateProfile.skills.join(', ')}\n`;
      }
      if (context.candidateProfile.experience?.length > 0) {
        prompt += `- Experience: ${context.candidateProfile.experience
          .map((exp: any) => `${exp.role} at ${exp.company} (${exp.duration})`)
          .join(', ')}\n`;
      }
      if (context.candidateProfile.projects?.length > 0) {
        prompt += `- Projects: ${context.candidateProfile.projects
          .map((proj: any) => `${proj.name} (${proj.technologies.join(', ')})`)
          .join(', ')}\n`;
      }
      prompt += '\n';
    }

    // Add job context if available
    if (context.jobContext) {
      prompt += `Job Context:\n`;
      prompt += `- Position: ${context.jobContext.title}\n`;
      prompt += `- Required Skills: ${context.jobContext.requiredSkills.join(', ')}\n`;
      prompt += `- Experience Level: ${context.jobContext.experienceLevel}\n\n`;
    }

    // Add specific instructions
    prompt += this.getTypeSpecificInstructions(context.type, context.settings);

    prompt += `\nRespond with a JSON array in this exact format:
[
  {
    "text": "Your question here",
    "difficulty": 1-10,
    "expectedDuration": 120,
    "followUpQuestions": ["Optional follow-up 1", "Optional follow-up 2"]
  }
]

Requirements:
- Questions must be relevant and engaging
- Difficulty should match the ${context.settings.difficulty} level
- Focus on ${context.settings.topicFocus} topics
- Appropriate for ${context.settings.purpose} interviews`;

    return prompt;
  }

  /**
   * Get system prompt based on interview type and interviewer
   */
  private static getSystemPrompt(type: string, interviewer: string): string {
    const basePrompt =
      'You are an expert interviewer who generates relevant, engaging interview questions. Always respond with valid JSON format.';

    const roleContext = {
      'tech-lead':
        'You focus on technical depth, system design, and leadership potential.',
      'hr-manager':
        'You emphasize cultural fit, communication skills, and behavioral aspects.',
      'product-manager':
        'You focus on product thinking, user empathy, and strategic reasoning.',
      recruiter:
        'You balance technical assessment with cultural fit and career goals.',
    };

    return `${basePrompt} As a ${interviewer}, ${roleContext[interviewer as keyof typeof roleContext] || roleContext.recruiter}`;
  }

  /**
   * Get type-specific instructions for question generation
   */
  private static getTypeSpecificInstructions(
    type: string,
    settings: any
  ): string {
    switch (type) {
      case 'technical':
        return this.getTechnicalInstructions(settings);
      case 'behavioral':
        return this.getBehavioralInstructions(settings);
      case 'case-study':
        return this.getCaseStudyInstructions(settings);
      default:
        return 'Generate appropriate interview questions for the given context.';
    }
  }

  private static getTechnicalInstructions(settings: any): string {
    let instructions = 'Technical Interview Focus:\n';

    switch (settings.topicFocus) {
      case 'dsa':
        instructions +=
          '- Emphasize algorithms, data structures, and problem-solving\n';
        instructions += '- Include coding challenges and complexity analysis\n';
        break;
      case 'projects':
        instructions += '- Focus on technical implementation details\n';
        instructions += '- Ask about architecture decisions and trade-offs\n';
        break;
      case 'fundamentals':
        instructions += '- Cover computer science fundamentals\n';
        instructions += '- Include system design and theoretical concepts\n';
        break;
      case 'resume':
        instructions +=
          "- Base questions on candidate's technical experience\n";
        instructions +=
          '- Dive deep into mentioned technologies and projects\n';
        break;
      case 'mixed':
        instructions += '- Balance between DSA, projects, and fundamentals\n';
        instructions += '- Vary question types for comprehensive assessment\n';
        break;
    }

    return instructions;
  }

  private static getBehavioralInstructions(settings: any): string {
    let instructions = 'Behavioral Interview Focus:\n';
    instructions += '- Use STAR method (Situation, Task, Action, Result)\n';
    instructions += '- Focus on past experiences and decision-making\n';

    switch (settings.purpose) {
      case 'internship':
        instructions +=
          '- Tailor for students with limited professional experience\n';
        instructions +=
          '- Include academic projects and extracurricular activities\n';
        break;
      case 'placement':
        instructions += '- Focus on career goals and long-term thinking\n';
        instructions += '- Assess cultural fit and growth potential\n';
        break;
      case 'general':
        instructions += '- Include universal behavioral competencies\n';
        instructions += '- Balance personal and professional scenarios\n';
        break;
    }

    return instructions;
  }

  private static getCaseStudyInstructions(settings: any): string {
    return `Case Study Interview Focus:
- Present realistic business or technical scenarios
- Test analytical thinking and problem-solving approach
- Include system design or strategic thinking exercises
- Encourage structured thinking and clear communication`;
  }

  /**
   * Parse AI response and convert to InterviewQuestion format
   */
  private static parseAIResponse(
    content: string,
    type: string
  ): InterviewQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const questionsData = JSON.parse(jsonMatch[0]);

      return questionsData.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.text || '',
        type: type as any,
        difficulty: Math.max(1, Math.min(10, q.difficulty || 5)),
        expectedDuration: Math.max(30, q.expectedDuration || 120),
        followUpQuestions: Array.isArray(q.followUpQuestions)
          ? q.followUpQuestions
          : [],
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Scale question difficulty based on settings
   */
  private static scaleDifficulty(
    questions: InterviewQuestion[],
    difficulty: DifficultyLevel
  ): InterviewQuestion[] {
    const multiplier = this.DIFFICULTY_MULTIPLIERS[difficulty];

    return questions.map(question => ({
      ...question,
      difficulty: Math.round(question.difficulty * multiplier * 10) / 10,
    }));
  }

  /**
   * Filter questions by topic focus
   */
  private static filterByTopic(
    questions: InterviewQuestion[],
    topicFocus: TopicFocus
  ): InterviewQuestion[] {
    // For now, return all questions as filtering logic would require
    // more sophisticated NLP analysis of question content
    // This can be enhanced in future iterations
    return questions;
  }

  /**
   * Add follow-up questions based on interview configuration
   */
  private static addFollowUpQuestions(
    questions: InterviewQuestion[],
    config: InterviewConfiguration
  ): InterviewQuestion[] {
    return questions.map(question => {
      if (question.followUpQuestions && question.followUpQuestions.length > 0) {
        return question;
      }

      // Generate default follow-ups based on question type
      const followUps = this.generateDefaultFollowUps(question, config);

      return {
        ...question,
        followUpQuestions: followUps,
      };
    });
  }

  /**
   * Generate default follow-up questions
   */
  private static generateDefaultFollowUps(
    question: InterviewQuestion,
    config: InterviewConfiguration
  ): string[] {
    const followUps: string[] = [];

    switch (config.type) {
      case 'technical':
        followUps.push('Can you explain your approach step by step?');
        followUps.push('What would be the time and space complexity?');
        break;
      case 'behavioral':
        followUps.push('What would you do differently next time?');
        followUps.push('How did this experience change your approach?');
        break;
      case 'case-study':
        followUps.push('What assumptions are you making?');
        followUps.push('How would you validate this solution?');
        break;
    }

    return followUps.slice(0, 2); // Limit to 2 follow-ups
  }

  /**
   * Get fallback questions when AI generation fails
   */
  private static getFallbackQuestions(
    config: InterviewConfiguration
  ): InterviewQuestion[] {
    const fallbackQuestions = {
      technical: [
        {
          id: `fallback_tech_${Date.now()}_1`,
          text: 'Explain the difference between a stack and a queue, and when you would use each.',
          type: 'technical' as const,
          difficulty: 4,
          expectedDuration: 180,
          followUpQuestions: ['Can you implement a stack using queues?'],
        },
        {
          id: `fallback_tech_${Date.now()}_2`,
          text: 'How would you find the middle element of a linked list in one pass?',
          type: 'technical' as const,
          difficulty: 5,
          expectedDuration: 240,
          followUpQuestions: ['What if the linked list is very large?'],
        },
      ],
      behavioral: [
        {
          id: `fallback_behavioral_${Date.now()}_1`,
          text: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
          type: 'behavioral' as const,
          difficulty: 4,
          expectedDuration: 300,
          followUpQuestions: ['What did you learn from this experience?'],
        },
        {
          id: `fallback_behavioral_${Date.now()}_2`,
          text: 'Describe a project where you had to learn a new technology quickly. How did you approach it?',
          type: 'behavioral' as const,
          difficulty: 5,
          expectedDuration: 240,
          followUpQuestions: ['How do you stay updated with new technologies?'],
        },
      ],
      'case-study': [
        {
          id: `fallback_case_${Date.now()}_1`,
          text: 'Design a system to handle file uploads for a social media platform with millions of users.',
          type: 'case-study' as const,
          difficulty: 7,
          expectedDuration: 600,
          followUpQuestions: [
            'How would you handle different file types?',
            'What about security concerns?',
          ],
        },
      ],
    };

    const questions =
      fallbackQuestions[config.type] || fallbackQuestions.technical;

    // Apply difficulty scaling to fallback questions
    return this.scaleDifficulty(questions, config.settings.difficulty);
  }
}
