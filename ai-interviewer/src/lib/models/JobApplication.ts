import mongoose, { Schema, Document } from 'mongoose';
import { JobApplication as IJobApplication } from '@/types';

export interface JobApplicationDocument extends IJobApplication, Document {}

const JobApplicationSchema = new Schema({
  jobPostingId: {
    type: String,
    required: true,
    index: true,
  },
  candidateId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['applied', 'interview-scheduled', 'interview-completed', 'rejected', 'hired'],
    default: 'applied',
    index: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  interviewSessionId: {
    type: String,
    index: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Create compound indexes for better query performance
JobApplicationSchema.index({ jobPostingId: 1, appliedAt: -1 });
JobApplicationSchema.index({ candidateId: 1, appliedAt: -1 });
JobApplicationSchema.index({ status: 1, appliedAt: -1 });

// Ensure unique application per candidate per job
JobApplicationSchema.index({ jobPostingId: 1, candidateId: 1 }, { unique: true });

export const JobApplication = mongoose.models.JobApplication || 
  mongoose.model<JobApplicationDocument>('JobApplication', JobApplicationSchema);