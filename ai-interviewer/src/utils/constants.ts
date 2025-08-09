// Application constants

export const APP_CONFIG = {
  name: 'AI Interviewer',
  description: 'AI-powered interview practice platform',
  version: '1.0.0',
} as const;

export const FILE_UPLOAD = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,docx').split(','),
} as const;

export const INTERVIEW_CONFIG = {
  maxDuration: 60, // minutes
  questionsPerSession: 10,
  defaultDifficulty: 'moderate' as const,
} as const;

export const API_ENDPOINTS = {
  auth: '/api/auth',
  interviews: '/api/interviews',
  resume: '/api/resume',
  jobs: '/api/jobs',
} as const;
