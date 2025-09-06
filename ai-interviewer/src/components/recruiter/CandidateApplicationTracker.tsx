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
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { JobApplication, JobPosting, InterviewSession } from '@/types';

interface CandidateApplicationTrackerProps {
  jobId: string;
  jobTitle: string;
}

interface ApplicationWithDetails extends JobApplication {
  candidateName: string;
  candidateEmail: string;
  resumeUrl?: string;
  interviewSession?: InterviewSession;
  lastActivity: Date;
}

export default function CandidateApplicationTracker({ 
  jobId, 
  jobTitle 
}: CandidateApplicationTrackerProps) {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  useEffect(() => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort by application date (newest first)
    filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, notes, lastActivity: new Date() }
            : app
        ));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'applied':
        return 'secondary';
      case 'interview-scheduled':
        return 'default';
      case 'interview-completed':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'hired':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview-scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'interview-completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'hired':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const applied = applications.filter(app => app.status === 'applied').length;
    const scheduled = applications.filter(app => app.status === 'interview-scheduled').length;
    const completed = applications.filter(app => app.status === 'interview-completed').length;
    const hired = applications.filter(app => app.status === 'hired').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, applied, scheduled, completed, hired, rejected };
  };

  const stats = getApplicationStats();

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
      <div>
        <h2 className="text-xl font-semibold mb-2">Applications for {jobTitle}</h2>
        <p className="text-gray-600">Track and manage candidate applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
            <p className="text-sm text-gray-600">Applied</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
            <p className="text-sm text-gray-600">Hired</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by candidate name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="interview-completed">Interview Completed</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </Select>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              {applications.length === 0 ? (
                <>
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p>Applications will appear here once candidates apply for this position.</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No applications match your filters</h3>
                  <p>Try adjusting your search terms or filters.</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{application.candidateName}</h3>
                    <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {application.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{application.candidateEmail}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Last activity {formatDate(application.lastActivity)}</span>
                    </div>
                  </div>

                  {application.notes && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-sm text-gray-700">{application.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {application.resumeUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(application.resumeUrl, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {application.status === 'applied' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'interview-scheduled')}
                      >
                        Schedule Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'interview-completed' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'hired')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Hire
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Candidate Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedApplication.candidateName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedApplication.candidateEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedApplication.appliedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedApplication.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedApplication.interviewSession && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Interview Results</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Overall Score</label>
                      <p className="text-sm text-gray-900">{selectedApplication.interviewSession.feedback?.overallScore || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Interview Date</label>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.interviewSession.completedAt 
                          ? formatDate(selectedApplication.interviewSession.completedAt)
                          : 'In Progress'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {selectedApplication.interviewSession.feedback && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Summary</label>
                      <div className="space-y-2">
                        {selectedApplication.interviewSession.feedback.strengths.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700">Strengths:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                              {selectedApplication.interviewSession.feedback.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedApplication.interviewSession.feedback.weaknesses.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700">Areas for Improvement:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                              {selectedApplication.interviewSession.feedback.weaknesses.map((weakness, index) => (
                                <li key={index}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedApplication.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">{selectedApplication.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedApplication.resumeUrl && (
                <Button onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}