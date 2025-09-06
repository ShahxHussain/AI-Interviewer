'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import JobPostingForm from '@/components/recruiter/JobPostingForm';
import JobManagementDashboard from '@/components/recruiter/JobManagementDashboard';
import { Plus } from 'lucide-react';

export default function TestJobPostingPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testRecruiterId] = useState('test-recruiter-123');

  const handleCreateJob = async (jobData: any) => {
    console.log('Creating job:', jobData);
    // Mock job creation for testing
    alert('Job would be created: ' + jobData.title);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Test Header */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Job Posting UI Test</h1>
          <p className="text-gray-600 mb-4">
            This page tests the job posting functionality for recruiters.
          </p>
          
          <div className="flex gap-4">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Test Create Job Modal
            </Button>
          </div>
        </Card>

        {/* Job Management Dashboard */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Full Job Management Dashboard</h2>
          <JobManagementDashboard recruiterId={testRecruiterId} />
        </Card>

        {/* Test Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Test Job Creation"
          size="lg"
        >
          <div className="p-6">
            <JobPostingForm
              onSave={handleCreateJob}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}