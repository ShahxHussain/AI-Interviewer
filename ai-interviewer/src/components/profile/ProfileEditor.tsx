'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { User, CandidateProfile, RecruiterProfile } from '@/types';
import { CandidateProfile as CandidateProfileComponent } from './CandidateProfile';
import { RecruiterProfile as RecruiterProfileComponent } from './RecruiterProfile';
import {
  validateCandidateProfile,
  validateRecruiterProfile,
  ValidationError,
} from '@/utils/validation';

interface ProfileEditorProps {
  user: User;
  onProfileUpdate?: (profile: CandidateProfile | RecruiterProfile) => void;
}

export function ProfileEditor({ user, onProfileUpdate }: ProfileEditorProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  useEffect(() => {
    // Validate profile on mount
    const errors =
      user.role === 'candidate'
        ? validateCandidateProfile(user.profile as CandidateProfile)
        : validateRecruiterProfile(user.profile as RecruiterProfile);
    setValidationErrors(errors);
  }, [user]);

  const handleProfileChange = (
    updatedProfile: CandidateProfile | RecruiterProfile
  ) => {
    setHasUnsavedChanges(true);

    // Validate the updated profile
    const errors =
      user.role === 'candidate'
        ? validateCandidateProfile(updatedProfile as CandidateProfile)
        : validateRecruiterProfile(updatedProfile as RecruiterProfile);
    setValidationErrors(errors);
  };

  const handleProfileSave = (
    savedProfile: CandidateProfile | RecruiterProfile
  ) => {
    setHasUnsavedChanges(false);
    onProfileUpdate?.(savedProfile);
  };

  const getProfileCompletionTips = () => {
    if (user.role === 'candidate') {
      const profile = user.profile as CandidateProfile;
      const tips = [];

      if (!profile.firstName?.trim()) tips.push('Add your first name');
      if (!profile.lastName?.trim()) tips.push('Add your last name');
      if (!profile.experienceLevel?.trim())
        tips.push('Select your experience level');
      if (!profile.skills?.length) tips.push('Add your skills');
      if (!profile.resumeUrl?.trim()) tips.push('Upload your resume');

      return tips;
    } else {
      const profile = user.profile as RecruiterProfile;
      const tips = [];

      if (!profile.firstName?.trim()) tips.push('Add your first name');
      if (!profile.lastName?.trim()) tips.push('Add your last name');
      if (!profile.companyName?.trim()) tips.push('Add your company name');

      return tips;
    }
  };

  const completionTips = getProfileCompletionTips();
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <div className="space-y-6">
      {/* Profile Status Banner */}
      {(hasUnsavedChanges ||
        hasValidationErrors ||
        completionTips.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You have unsaved changes
                </span>
              </div>
            )}

            {hasValidationErrors && (
              <div className="flex items-start space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Please fix the following errors:
                  </p>
                  <ul className="text-sm mt-1 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="ml-2">
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {completionTips.length > 0 && !hasValidationErrors && (
              <div className="flex items-start space-x-2 text-blue-600">
                <Info className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Complete your profile:</p>
                  <ul className="text-sm mt-1 space-y-1">
                    {completionTips.map((tip, index) => (
                      <li key={index} className="ml-2">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Component */}
      {user.role === 'candidate' ? (
        <CandidateProfileComponent
          profile={user.profile as CandidateProfile}
          onProfileUpdate={handleProfileSave}
        />
      ) : (
        <RecruiterProfileComponent
          profile={user.profile as RecruiterProfile}
          onProfileUpdate={handleProfileSave}
        />
      )}

      {/* Profile Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Profile Tips</h3>
        <div className="text-sm text-blue-800 space-y-1">
          {user.role === 'candidate' ? (
            <>
              <p>
                • A complete profile helps generate more personalized interview
                questions
              </p>
              <p>
                • Upload your resume to get questions tailored to your
                experience
              </p>
              <p>• Add relevant skills to practice domain-specific questions</p>
              <p>
                • Select the right experience level for appropriate difficulty
              </p>
            </>
          ) : (
            <>
              <p>
                • Complete your profile to create more effective job postings
              </p>
              <p>
                • Your company information helps candidates understand the role
                context
              </p>
              <p>• A complete profile builds trust with potential candidates</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
