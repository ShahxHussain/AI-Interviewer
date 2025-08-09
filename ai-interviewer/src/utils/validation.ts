import { CandidateProfile, RecruiterProfile } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCandidateProfile(
  profile: Partial<CandidateProfile>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!profile.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!profile.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  // Length validation
  if (profile.firstName && profile.firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
    });
  }

  if (profile.firstName && profile.firstName.trim().length > 50) {
    errors.push({
      field: 'firstName',
      message: 'First name must be less than 50 characters',
    });
  }

  if (profile.lastName && profile.lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters',
    });
  }

  if (profile.lastName && profile.lastName.trim().length > 50) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be less than 50 characters',
    });
  }

  // Name format validation
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (profile.firstName && !nameRegex.test(profile.firstName.trim())) {
    errors.push({
      field: 'firstName',
      message:
        'First name can only contain letters, spaces, hyphens, and apostrophes',
    });
  }

  if (profile.lastName && !nameRegex.test(profile.lastName.trim())) {
    errors.push({
      field: 'lastName',
      message:
        'Last name can only contain letters, spaces, hyphens, and apostrophes',
    });
  }

  // Skills validation
  if (profile.skills && profile.skills.length === 0) {
    errors.push({
      field: 'skills',
      message:
        'At least one skill is recommended for better interview personalization',
    });
  }

  if (profile.skills && profile.skills.length > 20) {
    errors.push({ field: 'skills', message: 'Maximum 20 skills allowed' });
  }

  // Experience level validation
  const validExperienceLevels = [
    'Entry Level (0-1 years)',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-8 years)',
    'Lead (8+ years)',
  ];

  if (
    profile.experienceLevel &&
    !validExperienceLevels.includes(profile.experienceLevel)
  ) {
    errors.push({
      field: 'experienceLevel',
      message: 'Please select a valid experience level',
    });
  }

  return errors;
}

export function validateRecruiterProfile(
  profile: Partial<RecruiterProfile>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!profile.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!profile.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!profile.companyName?.trim()) {
    errors.push({ field: 'companyName', message: 'Company name is required' });
  }

  // Length validation
  if (profile.firstName && profile.firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
    });
  }

  if (profile.firstName && profile.firstName.trim().length > 50) {
    errors.push({
      field: 'firstName',
      message: 'First name must be less than 50 characters',
    });
  }

  if (profile.lastName && profile.lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters',
    });
  }

  if (profile.lastName && profile.lastName.trim().length > 50) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be less than 50 characters',
    });
  }

  if (profile.companyName && profile.companyName.trim().length < 2) {
    errors.push({
      field: 'companyName',
      message: 'Company name must be at least 2 characters',
    });
  }

  if (profile.companyName && profile.companyName.trim().length > 100) {
    errors.push({
      field: 'companyName',
      message: 'Company name must be less than 100 characters',
    });
  }

  // Name format validation
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (profile.firstName && !nameRegex.test(profile.firstName.trim())) {
    errors.push({
      field: 'firstName',
      message:
        'First name can only contain letters, spaces, hyphens, and apostrophes',
    });
  }

  if (profile.lastName && !nameRegex.test(profile.lastName.trim())) {
    errors.push({
      field: 'lastName',
      message:
        'Last name can only contain letters, spaces, hyphens, and apostrophes',
    });
  }

  // Company name format validation (more permissive)
  const companyNameRegex = /^[a-zA-Z0-9\s'&.-]+$/;
  if (
    profile.companyName &&
    !companyNameRegex.test(profile.companyName.trim())
  ) {
    errors.push({
      field: 'companyName',
      message: 'Company name contains invalid characters',
    });
  }

  return errors;
}

export function validateFile(file: File): ValidationError[] {
  const errors: ValidationError[] = [];
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: 'Only PDF and DOCX files are allowed',
    });
  }

  if (file.size > maxSize) {
    errors.push({ field: 'file', message: 'File size must be less than 5MB' });
  }

  if (file.name.length > 255) {
    errors.push({ field: 'file', message: 'File name is too long' });
  }

  return errors;
}
