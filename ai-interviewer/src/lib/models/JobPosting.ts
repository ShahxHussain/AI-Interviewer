import mongoose, { Schema, Document } from 'mongoose';
import { JobPosting as IJobPosting, InterviewFlowConfig } from '@/types';

export interface JobPostingDocument extends IJobPosting, Document {}

const InterviewFlowConfigSchema = new Schema({
  interviewTypes: [{
    type: String,
    enum: ['technical', 'behavioral', 'case-study'],
    required: true,
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'moderate', 'advanced'],
    required: true,
  },
  topicFocus: [{
    type: String,
    enum: ['dsa', 'projects', 'fundamentals', 'resume', 'mixed'],
    required: true,
  }],
  estimatedDuration: {
    type: Number,
    required: true,
    min: 15,
    max: 180,
  },
  customQuestions: [String],
});

const JobPostingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  responsibilities: [{
    type: String,
    required: true,
    trim: true,
  }],
  requirements: [{
    type: String,
    required: true,
    trim: true,
  }],
  requiredSkills: [{
    type: String,
    required: true,
    trim: true,
    index: true,
  }],
  experienceLevel: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  interviewFlow: {
    type: InterviewFlowConfigSchema,
    required: true,
  },
  recruiterId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: false,
    index: true,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create compound indexes for better query performance
JobPostingSchema.index({ recruiterId: 1, createdAt: -1 });
JobPostingSchema.index({ status: 1, isActive: 1 });
JobPostingSchema.index({ requiredSkills: 1, experienceLevel: 1 });
JobPostingSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to update isActive based on status
JobPostingSchema.pre('save', function(next) {
  this.isActive = this.status === 'active';
  next();
});

export const JobPosting = mongoose.models.JobPosting || 
  mongoose.model<JobPostingDocument>('JobPosting', JobPostingSchema);