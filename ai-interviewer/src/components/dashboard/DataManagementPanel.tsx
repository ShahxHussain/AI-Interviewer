'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Download, 
  Trash2, 
  Archive, 
  RefreshCw,
  HardDrive,
  Calendar,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface StorageStats {
  totalSessions: number;
  activeSessions: number;
  archivedSessions: number;
  storageUsed: number;
  oldestSession: Date | null;
  newestSession: Date | null;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeMetrics: boolean;
  includeResponses: boolean;
  includeFeedback: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export function DataManagementPanel() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetrics: true,
    includeResponses: true,
    includeFeedback: true,
  });

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/data-retention/cleanup', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch storage stats');

      const stats = await response.json();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/data-retention/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `interview-data.${exportOptions.format}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/data-retention/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policy: {
            maxAge: 365,
            maxSessions: 100,
            archiveAfter: 90,
            deleteAfter: 730,
          },
        }),
      });

      if (!response.ok) throw new Error('Cleanup failed');

      const result = await response.json();
      
      if (result.success) {
        alert(`Cleanup completed: ${result.results.archived} sessions archived, ${result.results.deleted} sessions deleted`);
        await fetchStorageStats(); // Refresh stats
      } else {
        throw new Error('Cleanup failed');
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Cleanup failed. Please try again.');
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-gray-600">
            Manage your interview data, exports, and storage
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={fetchStorageStats}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Storage Statistics */}
      {storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{storageStats.totalSessions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">Active: {storageStats.activeSessions}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-600">Archived: {storageStats.archivedSessions}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(storageStats.storageUsed)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min((storageStats.storageUsed / (10 * 1024 * 1024)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {((storageStats.storageUsed / (10 * 1024 * 1024)) * 100).toFixed(1)}% of 10MB limit
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(storageStats.oldestSession)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Latest: {formatDate(storageStats.newestSession)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Data Export Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  format: e.target.value as 'json' | 'csv' | 'pdf'
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={exportOptions.dateRange?.from || ''}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: {
                      ...exportOptions.dateRange,
                      from: e.target.value,
                      to: exportOptions.dateRange?.to || '',
                    }
                  })}
                  className="p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  value={exportOptions.dateRange?.to || ''}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: {
                      from: exportOptions.dateRange?.from || '',
                      to: e.target.value,
                    }
                  })}
                  className="p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Data
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetrics}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      includeMetrics: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Performance Metrics
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeResponses}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      includeResponses: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Interview Responses
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFeedback}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      includeFeedback: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Feedback & Scores
                </label>
              </div>
            </div>

            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full flex items-center gap-2"
            >
              {exportLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Cleanup Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Cleanup</h3>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Automatic Cleanup Policy</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Sessions older than 90 days are automatically archived. Sessions older than 2 years are permanently deleted.
                Users are limited to 100 active sessions maximum.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Run Manual Cleanup</h4>
            <p className="text-sm text-gray-600">
              Apply retention policies to your data now
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="flex items-center gap-2"
          >
            {cleanupLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Cleaning...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Run Cleanup
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}