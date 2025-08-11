'use client';

import { InterviewMetrics } from '@/types';
import { RealTimeMetrics, EngagementMetrics } from './metrics-service';

export interface MetricsStorageOptions {
  enableRealTimeSync?: boolean;
  syncInterval?: number;
}

export class MetricsStorageService {
  private static readonly API_BASE = '/api/interview/metrics';
  private eventSource: EventSource | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Store metrics for a session
   */
  static async storeMetrics(sessionId: string, metrics: InterviewMetrics): Promise<void> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          metrics,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store metrics');
      }

      console.log(`Metrics stored for session: ${sessionId}`);
    } catch (error) {
      console.error('Error storing metrics:', error);
      throw error;
    }
  }

  /**
   * Retrieve metrics for a session
   */
  static async getMetrics(sessionId: string): Promise<InterviewMetrics | null> {
    try {
      const response = await fetch(`${this.API_BASE}?sessionId=${sessionId}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retrieve metrics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error retrieving metrics:', error);
      throw error;
    }
  }

  /**
   * Update existing metrics for a session
   */
  static async updateMetrics(
    sessionId: string,
    metrics: Partial<InterviewMetrics>
  ): Promise<InterviewMetrics> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          metrics,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update metrics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating metrics:', error);
      throw error;
    }
  }

  /**
   * Delete metrics for a session
   */
  static async deleteMetrics(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete metrics');
      }

      console.log(`Metrics deleted for session: ${sessionId}`);
    } catch (error) {
      console.error('Error deleting metrics:', error);
      throw error;
    }
  }

  /**
   * Start real-time metrics sync
   */
  startRealTimeSync(
    sessionId: string,
    onMetricsUpdate: (metrics: RealTimeMetrics) => void,
    options: MetricsStorageOptions = {}
  ): void {
    const { enableRealTimeSync = true, syncInterval = 2000 } = options;

    if (!enableRealTimeSync) return;

    // Start Server-Sent Events connection
    this.eventSource = new EventSource(
      `${MetricsStorageService.API_BASE}/realtime?sessionId=${sessionId}`
    );

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'metrics' && data.data) {
          onMetricsUpdate(data.data);
        } else if (data.type === 'connected') {
          console.log(`Connected to real-time metrics for session: ${sessionId}`);
        } else if (data.type === 'session_ended') {
          console.log(`Session ended: ${sessionId}`);
          this.stopRealTimeSync();
        }
      } catch (error) {
        console.error('Error parsing real-time metrics:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('Real-time metrics connection error:', error);
    };

    console.log(`Started real-time metrics sync for session: ${sessionId}`);
  }

  /**
   * Stop real-time metrics sync
   */
  stopRealTimeSync(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log('Stopped real-time metrics sync');
  }

  /**
   * Broadcast real-time metrics update
   */
  static async broadcastMetrics(
    sessionId: string,
    metrics: RealTimeMetrics | EngagementMetrics,
    type: string = 'metrics'
  ): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/realtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          metrics,
          type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to broadcast metrics');
      }
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
      // Don't throw here as this is not critical
    }
  }

  /**
   * Clean up session metrics
   */
  static async cleanupSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_BASE}/realtime?sessionId=${sessionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cleanup session');
      }

      console.log(`Session metrics cleaned up: ${sessionId}`);
    } catch (error) {
      console.error('Error cleaning up session:', error);
      throw error;
    }
  }

  /**
   * Export metrics data as JSON
   */
  static async exportMetricsAsJSON(sessionId: string): Promise<string> {
    try {
      const metrics = await this.getMetrics(sessionId);
      
      if (!metrics) {
        throw new Error('No metrics found for this session');
      }

      return JSON.stringify(metrics, null, 2);
    } catch (error) {
      console.error('Error exporting metrics:', error);
      throw error;
    }
  }

  /**
   * Export metrics data as CSV
   */
  static async exportMetricsAsCSV(sessionId: string): Promise<string> {
    try {
      const metrics = await this.getMetrics(sessionId);
      
      if (!metrics) {
        throw new Error('No metrics found for this session');
      }

      // Create CSV header
      let csv = 'Metric,Value\n';
      
      // Add basic metrics
      csv += `Eye Contact Percentage,${metrics.eyeContactPercentage}\n`;
      csv += `Average Confidence,${metrics.averageConfidence}\n`;
      csv += `Response Quality,${metrics.responseQuality}\n`;
      csv += `Overall Engagement,${metrics.overallEngagement}\n`;
      
      // Add mood timeline data
      csv += '\nTimestamp,Dominant Emotion,Confidence\n';
      metrics.moodTimeline.forEach(point => {
        csv += `${new Date(point.timestamp).toISOString()},${point.dominantEmotion},${point.confidence}\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error exporting metrics as CSV:', error);
      throw error;
    }
  }

  /**
   * Get metrics summary for reporting
   */
  static async getMetricsSummary(sessionId: string) {
    try {
      const metrics = await this.getMetrics(sessionId);
      
      if (!metrics) {
        return null;
      }

      const moodCounts = metrics.moodTimeline.reduce((acc, point) => {
        acc[point.dominantEmotion] = (acc[point.dominantEmotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantMood = Object.entries(moodCounts).reduce(
        (max, [mood, count]) => count > max.count ? { mood, count } : max,
        { mood: 'neutral', count: 0 }
      );

      return {
        sessionId,
        eyeContactPercentage: Math.round(metrics.eyeContactPercentage),
        averageConfidence: Math.round(metrics.averageConfidence * 100),
        responseQuality: Math.round(metrics.responseQuality * 100),
        overallEngagement: Math.round(metrics.overallEngagement * 100),
        dominantMood: dominantMood.mood,
        totalDataPoints: metrics.moodTimeline.length,
        sessionDuration: metrics.moodTimeline.length > 0 
          ? Math.round((metrics.moodTimeline[metrics.moodTimeline.length - 1].timestamp - metrics.moodTimeline[0].timestamp) / 1000)
          : 0,
      };
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      throw error;
    }
  }
}