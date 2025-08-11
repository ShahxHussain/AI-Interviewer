'use client';

import { useState, useEffect } from 'react';
import { InterviewSession } from '@/types';
import { SessionFilters, SessionAnalytics } from '@/lib/services/session-service';
import { SessionHistoryFilters } from './SessionHistoryFilters';
import { SessionHistoryList } from './SessionHistoryList';
import { SessionAnalyticsPanel } from './SessionAnalyticsPanel';
import { SessionReplayModal } from './SessionReplayModal';
import { DataManagementPanel } from './DataManagementPanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Download, RefreshCw } from 'lucide-react';

interface SessionHistoryData {
  sessions: InterviewSession[];
  total: number;
  hasMore: boolean;
}

export function SessionHistoryDashboard() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<SessionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [showReplay, setShowReplay] = useState(false);

  const fetchSessions = async (page: number = 1, newFilters?: SessionFilters) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(
          Object.entries(newFilters || filters).filter(([_, value]) => value != null)
        ),
      });

      const response = await fetch(`/api/sessions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data: SessionHistoryData = await response.json();
      
      if (page === 1) {
        setSessions(data.sessions);
      } else {
        setSessions(prev => [...prev, ...data.sessions]);
      }
      
      setHasMore(data.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/sessions/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data: SessionAnalytics = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleFilterChange = (newFilters: SessionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchSessions(1, newFilters);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchSessions(currentPage + 1);
    setLoadingMore(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchSessions(1),
      fetchAnalytics(),
    ]);
    setLoading(false);
  };

  const handleSessionReplay = (session: InterviewSession) => {
    setSelectedSession(session);
    setShowReplay(true);
  };

  const handleExportSessions = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/sessions/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export sessions');

      if (format === 'csv') {
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-sessions.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const jsonData = await response.json();
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-sessions.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export sessions:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSessions(1),
        fetchAnalytics(),
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Panel */}
      {analytics && (
        <SessionAnalyticsPanel analytics={analytics} />
      )}

      {/* Tabs for History and Data Management */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="management">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SessionHistoryFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleExportSessions('csv')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Session List */}
          <SessionHistoryList
            sessions={sessions}
            onSessionReplay={handleSessionReplay}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        </TabsContent>

        <TabsContent value="management">
          <DataManagementPanel />
        </TabsContent>
      </Tabs>

      {/* Session Replay Modal */}
      {showReplay && selectedSession && (
        <SessionReplayModal
          session={selectedSession}
          onClose={() => {
            setShowReplay(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
}