import mongoose, { Schema, Document } from 'mongoose';
import {
  InterviewSession as IInterviewSession,
  InterviewConfiguration,
  InterviewQuestion,
  InterviewResponse,
  InterviewMetrics,
  InterviewFeedback,
} from '@/types';

export interface InterviewSessionDocument extends IInterviewSession, Document {}

const InterviewConfigurationSchema = new Schema({
  interviewer: {
    type: String,
    enum: ['tech-lead', 'hr-manager', 'product-manager', 'recruiter'],
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'case-study'],
    required: true,
  },
  settings: {
    difficulty: {
      type: String,
      enum: ['beginner', 'moderate', 'advanced'],
      required: true,
    },
    topicFocus: {
      type: String,
      enum: ['dsa', 'projects', 'fundamentals', 'resume', 'mixed'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['internship', 'placement', 'general'],
      required: true,
    },
  },
  resumeData: {
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: String,
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String,
    }],
    rawText: String,
  },
  jobPosting: {
    id: String,
    title: String,
    description: String,
    requiredSkills: [String],
    experienceLevel: String,
    recruiterId: String,
    createdAt: Date,
    isActive: Boolean,
  },
});

const InterviewQuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'case-study'],
    required: true,
  },
  difficulty: { type: Number, required: true },
  expectedDuration: { type: Number, required: true },
  followUpQuestions: [String],
});

const InterviewResponseSchema = new Schema({
  questionId: { type: String, required: true },
  audioUrl: String,
  transcription: { type: String, required: true },
  duration: { type: Number, required: true },
  confidence: { type: Number, required: true },
  facialMetrics: {
    emotions: {
      happy: Number,
      sad: Number,
      angry: Number,
      fearful: Number,
      disgusted: Number,
      surprised: Number,
      neutral: Number,
    },
    eyeContact: Boolean,
    headPose: {
      pitch: Number,
      yaw: Number,
      roll: Number,
    },
    timestamp: Number,
  },
});

const InterviewMetricsSchema = new Schema({
  eyeContactPercentage: { type: Number, required: true },
  moodTimeline: [{
    timestamp: Number,
    mood: String,
    confidence: Number,
  }],
  averageConfidence: { type: Number, required: true },
  responseQuality: { type: Number, required: true },
  overallEngagement: { type: Number, required: true },
});

const InterviewFeedbackSchema = new Schema({
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  overallScore: { type: Number, required: true },
});

const InterviewSessionSchema = new Schema({
  candidateId: { type: String, required: true },
  jobPostingId: String,
  configuration: { type: InterviewConfigurationSchema, required: true },
  questions: [InterviewQuestionSchema],
  responses: [InterviewResponseSchema],
  metrics: { type: InterviewMetricsSchema, required: true },
  feedback: { type: InterviewFeedbackSchema, required: true },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    required: true,
  },
  startedAt: { type: Date, required: true },
  completedAt: Date,
}, {
  timestamps: true,
});

// Add indexes for better query performance
InterviewSessionSchema.index({ candidateId: 1, startedAt: -1 });
InterviewSessionSchema.index({ status: 1 });
InterviewSessionSchema.index({ 'configuration.type': 1 });
InterviewSessionSchema.index({ 'configuration.interviewer': 1 });

export const InterviewSession = mongoose.models.InterviewSession || 
  mongoose.model<InterviewSessionDocument>('InterviewSession', InterviewSessionSchema);