'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  AlertCircle,
  CheckCircle,
  Award,
  Users,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { RecruiterProfile as RecruiterProfileType } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { validateRecruiterProfile, ValidationError } from '@/utils/validation';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface RecruiterProfileProps {
  profile: RecruiterProfileType;
  onProfileUpdate?: (profile: RecruiterProfileType) => void;
}

export function RecruiterProfile({
  profile,
  onProfileUpdate,
}: RecruiterProfileProps) {
  const [formData, setFormData] = useState<RecruiterProfileType>(profile);
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
    const errors = validateRecruiterProfile(formData);
    setValidationErrors(errors);
  }, [formData]);

  const handleInputChange = (field: keyof RecruiterProfileType, value: any) => {
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
    const total = 3; // firstName, lastName, companyName

    if (formData.firstName?.trim()) completed++;
    if (formData.lastName?.trim()) completed++;
    if (formData.companyName?.trim()) completed++;

    return Math.round((completed / total) * 100);
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

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="max-w-2xl mx-auto luxury-card">
      <div className="px-6 py-4 border-b border-yellow-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold luxury-text-gold">
              Recruiter Profile
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm luxury-text-secondary">Profile Completion</p>
              <p className="text-lg font-bold luxury-text-gold">
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

        {/* Company Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={e => handleInputChange('companyName', e.target.value)}
            onBlur={() => handleBlur('companyName')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isFieldInvalid('companyName')
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter your company name"
          />
          {isFieldInvalid('companyName') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {getFieldError('companyName')?.message}
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Active Job Postings
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {profile.jobPostings?.filter(job => job.isActive).length || 0}
                </p>
              </div>
              <div className="text-blue-400">
                <Building className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Interview Reports
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {profile.interviewReports?.length || 0}
                </p>
              </div>
              <div className="text-green-400">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>

          {profile.jobPostings && profile.jobPostings.length > 0 ? (
            <div className="space-y-3">
              {profile.jobPostings.slice(0, 3).map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No job postings yet</p>
              <p className="text-sm">
                Create your first job posting to get started
              </p>
            </div>
          )}
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
