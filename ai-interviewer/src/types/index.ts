// Core types for the AI Interviewer application

export type UserRole = 'candidate' | 'recruiter';

export type InterviewerType =
  | 'tech-lead'
  | 'hr-manager'
  | 'product-manager'
  | 'recruiter';

export type InterviewType = 'technical' | 'behavioral' | 'case-study';

export type DifficultyLevel = 'beginner' | 'moderate' | 'advanced';

export type TopicFocus =
  | 'dsa'
  | 'projects'
  | 'fundamentals'
  | 'resume'
  | 'mixed';

export type InterviewPurpose = 'internship' | 'placement' | 'general';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    companyName?: string;
    skills?: string[];
    experienceLevel?: string;
    resumeUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  resumeUrl?: string;
  skills: string[];
  experienceLevel: string;
}

export interface RecruiterProfile {
  companyName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  jobPostings?: JobPosting[];
  interviewReports?: InterviewReport[];
}

export interface InterviewSettings {
  difficulty: DifficultyLevel;
  topicFocus: TopicFocus;
  purpose: InterviewPurpose;
}

export interface ParsedResumeData {
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  rawText: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}
export interface InterviewSession {
  id: string;
  candidateId: string;
  jobPostingId?: string;
  configuration: InterviewConfiguration;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  metrics: InterviewMetrics;
  feedback: InterviewFeedback;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}

export interface InterviewConfiguration {
  interviewer: InterviewerType;
  type: InterviewType;
  settings: InterviewSettings;
  resumeData?: ParsedResumeData;
  jobPosting?: JobPosting;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: InterviewType;
  difficulty: number;
  expectedDuration: number;
  followUpQuestions?: string[];
}

export interface InterviewResponse {
  questionId: string;
  audioUrl?: string;
  transcription: string;
  duration: number;
  confidence: number;
  facialMetrics: FacialAnalysisData;
}

export interface InterviewMetrics {
  eyeContactPercentage: number;
  moodTimeline: MoodDataPoint[];
  averageConfidence: number;
  responseQuality: number;
  overallEngagement: number;
}

export interface InterviewFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallScore: number;
}

export interface FacialAnalysisData {
  emotions: EmotionScores;
  eyeContact: boolean;
  headPose: HeadPoseData;
  timestamp: number;
}

export interface EmotionScores {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
}

export interface HeadPoseData {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface MoodDataPoint {
  timestamp: number;
  mood: string;
  confidence: number;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  experienceLevel: string;
  interviewFlow: InterviewFlowConfig;
  recruiterId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  status: 'draft' | 'active' | 'paused' | 'closed';
  applicationsCount?: number;
  viewsCount?: number;
}

export interface InterviewFlowConfig {
  interviewTypes: InterviewType[];
  difficulty: DifficultyLevel;
  topicFocus: TopicFocus[];
  estimatedDuration: number; // in minutes
  customQuestions?: string[];
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  candidateId: string;
  status: 'applied' | 'interview-scheduled' | 'interview-completed' | 'rejected' | 'hired';
  appliedAt: Date;
  interviewSessionId?: string;
  notes?: string;
}

export interface InterviewReport {
  id: string;
  sessionId: string;
  candidateId: string;
  recruiterId: string;
  overallRating: number;
  detailedFeedback: string;
  recommendation: 'hire' | 'reject' | 'maybe';
  createdAt: Date;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
  message?: string;
}

// Voice Synthesis Types
export interface VoiceProfile {
  gender: 'male' | 'female';
  accent: string;
  tone: 'professional' | 'friendly' | 'authoritative';
  voiceId: string;
}

export interface VoiceSynthesisRequest {
  text: string;
  voice: VoiceProfile;
  speed?: number;
}

export interface VoiceSynthesisResponse {
  success: boolean;
  audioUrl?: string;
  audioData?: string; // Base64 encoded audio
  error?: string;
  duration?: number;
}
