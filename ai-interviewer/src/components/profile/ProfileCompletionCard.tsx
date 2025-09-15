'use client';

import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Award,
  Building,
} from 'lucide-react';
import { User as UserType, CandidateProfile, RecruiterProfile } from '@/types';

interface ProfileCompletionCardProps {
  user: UserType;
}

export function ProfileCompletionCard({ user }: ProfileCompletionCardProps) {
  const calculateCompletion = () => {
    if (user.role === 'candidate') {
      const profile = user.profile as CandidateProfile;
      const checks = [
        {
          key: 'firstName',
          value: profile.firstName?.trim(),
          label: 'First Name',
        },
        {
          key: 'lastName',
          value: profile.lastName?.trim(),
          label: 'Last Name',
        },
        {
          key: 'profilePicture',
          value: profile.profilePictureUrl?.trim(),
          label: 'Profile Picture',
        },
        {
          key: 'experienceLevel',
          value: profile.experienceLevel?.trim(),
          label: 'Experience Level',
        },
        { key: 'skills', value: profile.skills?.length > 0, label: 'Skills' },
        { key: 'resume', value: profile.resumeUrl?.trim(), label: 'Resume' },
      ];

      const completed = checks.filter(check => check.value).length;
      const total = checks.length;
      const percentage = Math.round((completed / total) * 100);

      return { completed, total, percentage, checks };
    } else {
      const profile = user.profile as RecruiterProfile;
      const checks = [
        {
          key: 'firstName',
          value: profile.firstName?.trim(),
          label: 'First Name',
        },
        {
          key: 'lastName',
          value: profile.lastName?.trim(),
          label: 'Last Name',
        },
        {
          key: 'profilePicture',
          value: profile.profilePictureUrl?.trim(),
          label: 'Profile Picture',
        },
        {
          key: 'companyName',
          value: profile.companyName?.trim(),
          label: 'Company Name',
        },
      ];

      const completed = checks.filter(check => check.value).length;
      const total = checks.length;
      const percentage = Math.round((completed / total) * 100);

      return { completed, total, percentage, checks };
    }
  };

  const { completed, total, percentage, checks } = calculateCompletion();

  const getCompletionColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = () => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="luxury-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-yellow-400" />
          <div>
            <h3 className="text-lg font-bold luxury-text-gold">
              Profile Completion
            </h3>
            <p className="text-sm luxury-text-secondary">
              {completed} of {total} sections completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold luxury-text-gold">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <div
          className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-yellow-600"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Completion Checklist */}
      <div className="space-y-2">
        {checks.map(check => (
          <div key={check.key} className="flex items-center space-x-2">
            {check.value ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`text-sm ${
                check.value ? 'luxury-text-primary' : 'luxury-text-secondary'
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Completion Tips */}
      {percentage < 100 && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20">
          <h4 className="text-sm font-bold luxury-text-gold mb-2">
            Complete your profile to:
          </h4>
          <ul className="text-sm luxury-text-secondary space-y-1">
            {user.role === 'candidate' ? (
              <>
                <li>• Get more personalized interview questions</li>
                <li>• Improve your visibility to recruiters</li>
                <li>• Access advanced interview features</li>
              </>
            ) : (
              <>
                <li>• Build trust with potential candidates</li>
                <li>• Create more effective job postings</li>
                <li>• Access advanced recruiter features</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
