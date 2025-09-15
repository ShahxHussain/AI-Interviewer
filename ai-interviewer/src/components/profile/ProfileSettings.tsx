'use client';

import React, { useState } from 'react';
import { User, Settings, Shield, Download, Trash2 } from 'lucide-react';
import { User as UserType, CandidateProfile, RecruiterProfile } from '@/types';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import { CandidateProfile as CandidateProfileComponent } from './CandidateProfile';
import { RecruiterProfile as RecruiterProfileComponent } from './RecruiterProfile';

interface ProfileSettingsProps {
  user: UserType;
  onProfileUpdate?: (profile: CandidateProfile | RecruiterProfile) => void;
}

type TabType = 'profile' | 'privacy' | 'data';

export function ProfileSettings({
  user,
  onProfileUpdate,
}: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile Information', icon: User },
    { id: 'privacy' as TabType, label: 'Privacy & Security', icon: Shield },
    { id: 'data' as TabType, label: 'Data Management', icon: Settings },
  ];

  const handleDataExport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/profile/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileCompletionCard user={user} />

            {user.role === 'candidate' ? (
              <CandidateProfileComponent
                profile={user.profile as CandidateProfile}
                onProfileUpdate={onProfileUpdate}
              />
            ) : (
              <RecruiterProfileComponent
                profile={user.profile as RecruiterProfile}
                onProfileUpdate={onProfileUpdate}
              />
            )}
          </div>
        );

      case 'privacy':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Privacy & Security Settings
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Account Security
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Email Address
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Password
                      </p>
                      <p className="text-sm text-gray-600">
                        Last updated 30 days ago
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Data Privacy
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Profile Visibility
                      </p>
                      <p className="text-sm text-gray-600">
                        Allow recruiters to find your profile
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Interview Analytics
                      </p>
                      <p className="text-sm text-gray-600">
                        Allow collection of interview performance data
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Data Management
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Export Your Data
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download a copy of all your data including profile
                  information, interview history, and settings.
                </p>
                <button
                  onClick={handleDataExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-red-900 mb-2">
                  Delete Account
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800 mb-4">
                      Are you sure you want to delete your account? This will
                      permanently remove all your data.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAccountDeletion}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Yes, Delete Account
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto luxury-container p-6">
      {/* Tab Navigation */}
      <div className="border-b border-yellow-400/30 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent luxury-text-secondary hover:luxury-text-gold hover:border-yellow-400/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
