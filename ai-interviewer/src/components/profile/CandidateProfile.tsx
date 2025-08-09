'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  AlertCircle,
  CheckCircle,
  Award,
  FileText,
  Briefcase,
} from 'lucide-react';
import { CandidateProfile as CandidateProfileType } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ResumeUpload } from '@/components/resume/ResumeUpload';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { validateCandidateProfile, ValidationError } from '@/utils/validation';

interface CandidateProfileProps {
  profile: CandidateProfileType;
  onProfileUpdate?: (profile: CandidateProfileType) => void;
}

const EXPERIENCE_LEVELS = [
  'Entry Level (0-1 years)',
  'Junior (1-3 years)',
  'Mid-Level (3-5 years)',
  'Senior (5-8 years)',
  'Lead (8+ years)',
];

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Git',
  'HTML/CSS',
  'REST APIs',
  'GraphQL',
  'Machine Learning',
  'Data Structures',
  'Algorithms',
];

export function CandidateProfile({
  profile,
  onProfileUpdate,
}: CandidateProfileProps) {
  const [formData, setFormData] = useState<CandidateProfileType>(profile);
  const [newSkill, setNewSkill] = useState('');
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { updateProfile, loading } = useProfile();
  const { user } = useAuth();

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    // Validate form data whenever it changes
    const errors = validateCandidateProfile(formData);
    setValidationErrors(errors);
  }, [formData]);

  const handleInputChange = (field: keyof CandidateProfileType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field);
  };

  const isFieldInvalid = (field: string) => {
    return touched[field] && getFieldError(field);
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 5; // firstName, lastName, experienceLevel, skills, resumeUrl

    if (formData.firstName?.trim()) completed++;
    if (formData.lastName?.trim()) completed++;
    if (formData.experienceLevel?.trim()) completed++;
    if (formData.skills?.length > 0) completed++;
    if (formData.resumeUrl?.trim()) completed++;

    return Math.round((completed / total) * 100);
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      const updatedSkills = [...formData.skills, skill.trim()];
      handleInputChange('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter(
      skill => skill !== skillToRemove
    );
    handleInputChange('skills', updatedSkills);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveMessage('Saving profile...');

    const success = await updateProfile(formData);

    if (success) {
      setSaveStatus('success');
      setSaveMessage('Profile saved successfully!');
      onProfileUpdate?.(formData);
    } else {
      setSaveStatus('error');
      setSaveMessage('Failed to save profile. Please try again.');
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setSaveStatus('idle');
      setSaveMessage('');
    }, 3000);
  };

  const handleResumeUpload = (resumeUrl: string) => {
    handleInputChange('resumeUrl', resumeUrl);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Candidate Profile
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Profile Completion</p>
              <p className="text-lg font-semibold text-blue-600">
                {profileCompletion}%
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${profileCompletion}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <ProfilePictureUpload
            currentImageUrl={formData.profilePictureUrl}
            onUploadComplete={imageUrl =>
              handleInputChange('profilePictureUrl', imageUrl)
            }
            onUploadError={error => {
              setSaveStatus('error');
              setSaveMessage(error);
              setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage('');
              }, 3000);
            }}
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isFieldInvalid('firstName')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {isFieldInvalid('firstName') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getFieldError('firstName')?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isFieldInvalid('lastName')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {isFieldInvalid('lastName') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getFieldError('lastName')?.message}
              </p>
            )}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={formData.experienceLevel}
            onChange={e => handleInputChange('experienceLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your experience level</option>
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Resume Upload */}
        <ResumeUpload
          currentResumeUrl={formData.resumeUrl}
          onUploadComplete={handleResumeUpload}
        />

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>

          {/* Current Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add New Skill */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkill);
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkill)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>

          {/* Common Skills */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Common skills:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.filter(
                skill => !formData.skills.includes(skill)
              ).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {saveMessage && (
              <>
                {saveStatus === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {saveStatus === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {saveStatus === 'saving' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <span
                  className={`text-sm ${
                    saveStatus === 'success'
                      ? 'text-green-600'
                      : saveStatus === 'error'
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`}
                >
                  {saveMessage}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading || saveStatus === 'saving'}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
