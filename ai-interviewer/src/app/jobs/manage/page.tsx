'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import JobManagementDashboard from '@/components/recruiter/JobManagementDashboard';
import { redirect } from 'next/navigation';

export default function JobsManagePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    redirect('/auth');
  }

  if (user.role !== 'recruiter') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobManagementDashboard recruiterId={user.id} />
      </div>
    </div>
  );
}