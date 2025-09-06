'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  CheckSquare,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { JobPosting } from '@/types';

interface JobStatusManagerProps {
  jobs: JobPosting[];
  onStatusUpdate: (jobId: string, status: string) => Promise<void>;
  onBulkStatusUpdate: (jobIds: string[], status: string) => Promise<void>;
  onDelete: (jobId: string) => Promise<void>;
  onBulkDelete?: (jobIds: string[]) => Promise<void>;
}

export default function JobStatusManager({ 
  jobs, 
  onStatusUpdate, 
  onBulkStatusUpdate, 
  onDelete,
  onBulkDelete
}: JobStatusManagerProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'single' | 'bulk';
    action: string;
    jobId?: string;
    jobIds?: string[];
  } | null>(null);

  const handleJobSelection = (jobId: string, selected: boolean) => {
    if (selected) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  const handleSingleStatusUpdate = async (jobId: string, status: string) => {
    if (status === 'delete') {
      setConfirmAction({ type: 'single', action: 'delete', jobId });
      setShowConfirmModal(true);
    } else {
      setConfirmAction({ type: 'single', action: status, jobId });
      setShowConfirmModal(true);
    }
  };

  const handleBulkAction = async () => {
    if (selectedJobs.length === 0 || !bulkAction) return;

    if (bulkAction === 'delete') {
      setConfirmAction({ type: 'bulk', action: 'delete', jobIds: selectedJobs });
      setShowConfirmModal(true);
    } else {
      setConfirmAction({ type: 'bulk', action: bulkAction, jobIds: selectedJobs });
      setShowConfirmModal(true);
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'single') {
        if (confirmAction.action === 'delete' && confirmAction.jobId) {
          await onDelete(confirmAction.jobId);
        } else if (confirmAction.jobId) {
          await onStatusUpdate(confirmAction.jobId, confirmAction.action);
        }
      } else if (confirmAction.type === 'bulk' && confirmAction.jobIds) {
        if (confirmAction.action === 'delete') {
          // Handle bulk delete
          if (onBulkDelete) {
            await onBulkDelete(confirmAction.jobIds);
          } else {
            await Promise.all(confirmAction.jobIds.map(id => onDelete(id)));
          }
        } else {
          await onBulkStatusUpdate(confirmAction.jobIds, confirmAction.action);
        }
        setSelectedJobs([]);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'closed':
        return <Square className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionConfirmationMessage = () => {
    if (!confirmAction) return '';

    const actionName = confirmAction.action === 'delete' ? 'delete' : `change status to ${confirmAction.action}`;
    const itemCount = confirmAction.type === 'single' ? '1 job' : `${confirmAction.jobIds?.length} jobs`;
    
    return `Are you sure you want to ${actionName} for ${itemCount}? This action ${confirmAction.action === 'delete' ? 'cannot be undone' : 'will update the job status'}.`;
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedJobs.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
              </span>
              <Select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-48"
              >
                <option value="">Select action...</option>
                <option value="active">Activate</option>
                <option value="paused">Pause</option>
                <option value="closed">Close</option>
                <option value="delete">Delete</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply Action
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJobs([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Jobs List with Status Management */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Job Status Management</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {selectedJobs.length === jobs.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.id)}
                  onChange={(e) => handleJobSelection(job.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <Badge variant={getStatusBadgeVariant(job.status)} className="flex items-center gap-1">
                      {getStatusIcon(job.status)}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {new Date(job.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(job.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Action Buttons */}
                {job.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleSingleStatusUpdate(job.id, 'active')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                )}
                
                {job.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSingleStatusUpdate(job.id, 'paused')}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                
                {job.status === 'paused' && (
                  <Button
                    size="sm"
                    onClick={() => handleSingleStatusUpdate(job.id, 'active')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                
                {(job.status === 'active' || job.status === 'paused') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSingleStatusUpdate(job.id, 'closed')}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSingleStatusUpdate(job.id, 'delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <p className="text-gray-700">{getActionConfirmationMessage()}</p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              className={confirmAction?.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}