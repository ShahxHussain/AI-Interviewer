'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Pause, 
  Play, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  MoreHorizontal,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { JobPosting, JobApplication } from '@/types';
import JobPostingForm from './JobPostingForm';
import CandidateApplicationTracker from './CandidateApplicationTracker';
import JobAnalytics from './JobAnalytics';
import JobStatusManager from './JobStatusManager';

interface JobManagementDashboardProps {
  recruiterId: string;
}

interface JobWithStats extends JobPosting {
  applicationsCount: number;
  viewsCount: number;
  recentApplications: JobApplication[];
}

export default function JobManagementDashboard({ recruiterId }: JobManagementDashboardProps) {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobWithStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<JobWithStats | null>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, [recruiterId]);

  // Filter and sort jobs when filters change
  useEffect(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'applicationsCount':
          return b.applicationsCount - a.applicationsCount;
        case 'viewsCount':
          return b.viewsCount - a.viewsCount;
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/recruiter/${recruiterId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (jobData: Omit<JobPosting, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          recruiterId,
        }),
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob.job, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleUpdateJob = async (jobData: Omit<JobPosting, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingJob) return;

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(prev => prev.map(job => 
          job.id === editingJob.id ? { ...updatedJob.job, applicationsCount: job.applicationsCount, viewsCount: job.viewsCount, recentApplications: job.recentApplications } : job
        ));
        setEditingJob(null);
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus as any } : job
        ));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleStatusUpdate = async (jobId: string, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: status as any, isActive: status === 'active' } : job
        ));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleBulkStatusUpdate = async (jobIds: string[], status: string) => {
    try {
      const response = await fetch('/api/jobs/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobIds,
          status,
          recruiterId,
        }),
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          jobIds.includes(job.id) 
            ? { ...job, status: status as any, isActive: status === 'active' }
            : job
        ));
      }
    } catch (error) {
      console.error('Error bulk updating jobs:', error);
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    try {
      const response = await fetch('/api/jobs/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobIds,
          recruiterId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh jobs list to reflect changes
        fetchJobs();
      }
    } catch (error) {
      console.error('Error bulk deleting jobs:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'closed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-gray-600">Manage your job postings and track applications</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowStatusManager(!showStatusManager)}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            {showStatusManager ? 'Hide Status Manager' : 'Bulk Actions'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Posting
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-6">
          <JobAnalytics recruiterId={recruiterId} />
        </div>
      )}

      {/* Status Manager Section */}
      {showStatusManager && (
        <div className="mb-6">
          <JobStatusManager
            jobs={filteredJobs}
            onStatusUpdate={handleStatusUpdate}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onDelete={handleDeleteJob}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'active').length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.viewsCount, 0)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs by title, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="applicationsCount">Applications</option>
              <option value="viewsCount">Views</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              {jobs.length === 0 ? (
                <>
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
                  <p className="mb-4">Create your first job posting to start attracting candidates.</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job Posting
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No jobs match your filters</h3>
                  <p>Try adjusting your search terms or filters.</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.requiredSkills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requiredSkills.length - 5} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicationsCount} applications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{job.viewsCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedJobForApplications(job);
                      setShowApplicationsModal(true);
                    }}
                    title="View Applications"
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingJob(job)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleJobStatus(job.id, job.status)}
                    disabled={job.status === 'draft' || job.status === 'closed'}
                  >
                    {job.status === 'active' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Recent Applications Preview */}
              {job.recentApplications && job.recentApplications.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Applications</h4>
                  <div className="flex -space-x-2">
                    {job.recentApplications.slice(0, 5).map((application, index) => (
                      <div
                        key={application.id}
                        className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
                        title={`Application ${index + 1}`}
                      >
                        {index + 1}
                      </div>
                    ))}
                    {job.recentApplications.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                        +{job.recentApplications.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job Posting"
        size="lg"
        variant="luxury"
      >
        <div className="p-6">
          <JobPostingForm
            onSave={handleCreateJob}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job Posting"
        size="lg"
        variant="luxury"
      >
        {editingJob && (
          <div className="p-6">
            <JobPostingForm
              initialData={editingJob}
              onSave={handleUpdateJob}
              onCancel={() => setEditingJob(null)}
            />
          </div>
        )}
      </Modal>

      {/* Applications Modal */}
      <Modal
        isOpen={showApplicationsModal}
        onClose={() => setShowApplicationsModal(false)}
        title="Candidate Applications"
        size="xl"
        variant="luxury"
      >
        {selectedJobForApplications && (
          <CandidateApplicationTracker
            jobId={selectedJobForApplications.id}
            jobTitle={selectedJobForApplications.title}
          />
        )}
      </Modal>
    </div>
  );
}