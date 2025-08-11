'use client';

import { FacialAnalysisData, MoodDataPoint } from './facial-analysis-service';
import { InterviewMetrics, InterviewResponse } from '@/types';

export interface RealTimeMetrics {
  eyeContactPercentage: number;
  currentMood: string;
  moodConfidence: number;
  engagementScore: number;
  responseQuality: number;
  averageConfidence: number;
  sessionDuration: number;
  totalDataPoints: number;
}

export interface MetricsSnapshot {
  timestamp: number;
  eyeContact: boolean;
  dominantEmotion: string;
  emotionConfidence: number;
  engagementLevel: number;
  responseInProgress: boolean;
}

export interface EngagementMetrics {
  eyeContactScore: number;
  emotionalStability: number;
  responseConsistency: number;
  overallEngagement: number;
}

export class MetricsCollectionService {
  private facialDataHistory: FacialAnalysisData[] = [];
  private metricsSnapshots: MetricsSnapshot[] = [];
  private sessionStartTime: number | null = null;
  private currentResponseStartTime: number | null = null;
  private isCollecting = false;

  /**
   * Start metrics collection for a session
   */
  startCollection(sessionId: string): void {
    this.sessionStartTime = Date.now();
    this.isCollecting = true;
    this.facialDataHistory = [];
    this.metricsSnapshots = [];
    console.log(`Metrics collection started for session: ${sessionId}`);
  }

  /**
   * Stop metrics collection
   */
  stopCollection(): InterviewMetrics {
    this.isCollecting = false;
    const finalMetrics = this.calculateFinalMetrics();
    console.log('Metrics collection stopped. Final metrics:', finalMetrics);
    return finalMetrics;
  }

  /**
   * Add facial analysis data point
   */
  addFacialData(data: FacialAnalysisData): void {
    if (!this.isCollecting) return;

    this.facialDataHistory.push(data);

    // Create metrics snapshot
    const snapshot: MetricsSnapshot = {
      timestamp: data.timestamp,
      eyeContact: data.eyeContact,
      dominantEmotion: this.getDominantEmotion(data.emotions),
      emotionConfidence: data.confidence,
      engagementLevel: this.calculateEngagementLevel(data),
      responseInProgress: this.currentResponseStartTime !== null,
    };

    this.metricsSnapshots.push(snapshot);

    // Keep only last 1000 snapshots to prevent memory issues
    if (this.metricsSnapshots.length > 1000) {
      this.metricsSnapshots = this.metricsSnapshots.slice(-1000);
    }
  }

  /**
   * Mark start of response recording
   */
  startResponse(): void {
    this.currentResponseStartTime = Date.now();
  }

  /**
   * Mark end of response recording
   */
  endResponse(): void {
    this.currentResponseStartTime = null;
  }

  /**
   * Get real-time metrics for dashboard display
   */
  getRealTimeMetrics(): RealTimeMetrics {
    if (this.facialDataHistory.length === 0) {
      return {
        eyeContactPercentage: 0,
        currentMood: 'neutral',
        moodConfidence: 0,
        engagementScore: 0,
        responseQuality: 0,
        averageConfidence: 0,
        sessionDuration: this.getSessionDuration(),
        totalDataPoints: 0,
      };
    }

    const recentData = this.facialDataHistory.slice(-10); // Last 10 data points
    const allData = this.facialDataHistory;

    return {
      eyeContactPercentage: this.calculateEyeContactPercentage(allData),
      currentMood: this.getCurrentMood(recentData),
      moodConfidence: this.getCurrentMoodConfidence(recentData),
      engagementScore: this.calculateEngagementScore(allData),
      responseQuality: this.calculateResponseQuality(allData),
      averageConfidence: this.calculateAverageConfidence(allData),
      sessionDuration: this.getSessionDuration(),
      totalDataPoints: allData.length,
    };
  }

  /**
   * Get mood timeline for visualization
   */
  getMoodTimeline(): MoodDataPoint[] {
    return this.facialDataHistory.map(data => ({
      timestamp: data.timestamp,
      dominantEmotion: this.getDominantEmotion(data.emotions),
      confidence: data.confidence,
      emotions: data.emotions,
    }));
  }

  /**
   * Get engagement metrics breakdown
   */
  getEngagementMetrics(): EngagementMetrics {
    if (this.facialDataHistory.length === 0) {
      return {
        eyeContactScore: 0,
        emotionalStability: 0,
        responseConsistency: 0,
        overallEngagement: 0,
      };
    }

    const eyeContactScore = this.calculateEyeContactPercentage(this.facialDataHistory);
    const emotionalStability = this.calculateEmotionalStability();
    const responseConsistency = this.calculateResponseConsistency();
    const overallEngagement = (eyeContactScore + emotionalStability * 100 + responseConsistency * 100) / 3;

    return {
      eyeContactScore,
      emotionalStability,
      responseConsistency,
      overallEngagement,
    };
  }

  /**
   * Calculate final metrics for session completion
   */
  private calculateFinalMetrics(): InterviewMetrics {
    if (this.facialDataHistory.length === 0) {
      return {
        eyeContactPercentage: 0,
        moodTimeline: [],
        averageConfidence: 0,
        responseQuality: 0,
        overallEngagement: 0,
      };
    }

    const moodTimeline = this.getMoodTimeline();
    const engagementMetrics = this.getEngagementMetrics();

    return {
      eyeContactPercentage: engagementMetrics.eyeContactScore,
      moodTimeline,
      averageConfidence: this.calculateAverageConfidence(this.facialDataHistory),
      responseQuality: this.calculateResponseQuality(this.facialDataHistory),
      overallEngagement: engagementMetrics.overallEngagement / 100,
    };
  }

  /**
   * Calculate eye contact percentage
   */
  private calculateEyeContactPercentage(data: FacialAnalysisData[]): number {
    if (data.length === 0) return 0;
    const eyeContactCount = data.filter(d => d.eyeContact).length;
    return (eyeContactCount / data.length) * 100;
  }

  /**
   * Get current mood from recent data
   */
  private getCurrentMood(recentData: FacialAnalysisData[]): string {
    if (recentData.length === 0) return 'neutral';
    
    // Average emotions over recent data points
    const avgEmotions = recentData.reduce((acc, data) => {
      Object.keys(data.emotions).forEach(emotion => {
        acc[emotion] = (acc[emotion] || 0) + data.emotions[emotion as keyof typeof data.emotions];
      });
      return acc;
    }, {} as Record<string, number>);

    // Normalize by count
    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion] /= recentData.length;
    });

    return this.getDominantEmotion(avgEmotions as any);
  }

  /**
   * Get current mood confidence
   */
  private getCurrentMoodConfidence(recentData: FacialAnalysisData[]): number {
    if (recentData.length === 0) return 0;
    return recentData.reduce((sum, data) => sum + data.confidence, 0) / recentData.length;
  }

  /**
   * Calculate engagement score based on multiple factors
   */
  private calculateEngagementScore(data: FacialAnalysisData[]): number {
    if (data.length === 0) return 0;

    const eyeContactScore = this.calculateEyeContactPercentage(data) / 100;
    const confidenceScore = this.calculateAverageConfidence(data);
    const emotionalStabilityScore = this.calculateEmotionalStability();

    // Weighted average
    return (eyeContactScore * 0.4 + confidenceScore * 0.4 + emotionalStabilityScore * 0.2) * 100;
  }

  /**
   * Calculate response quality based on facial analysis during responses
   */
  private calculateResponseQuality(data: FacialAnalysisData[]): number {
    if (data.length === 0) return 0;

    // For now, use confidence as a proxy for response quality
    // In a full implementation, this would correlate with actual response analysis
    const avgConfidence = this.calculateAverageConfidence(data);
    const eyeContactScore = this.calculateEyeContactPercentage(data) / 100;
    const emotionalStability = this.calculateEmotionalStability();

    return (avgConfidence * 0.5 + eyeContactScore * 0.3 + emotionalStability * 0.2);
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(data: FacialAnalysisData[]): number {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.confidence, 0) / data.length;
  }

  /**
   * Calculate emotional stability (lower variance = more stable)
   */
  private calculateEmotionalStability(): number {
    if (this.facialDataHistory.length < 2) return 1;

    // Calculate variance in dominant emotion confidence
    const confidences = this.facialDataHistory.map(d => d.confidence);
    const mean = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    
    // Convert variance to stability score (0-1, where 1 is most stable)
    return Math.max(0, 1 - variance * 2);
  }

  /**
   * Calculate response consistency
   */
  private calculateResponseConsistency(): number {
    // For now, return a placeholder based on emotional stability
    // In a full implementation, this would analyze consistency across responses
    return this.calculateEmotionalStability();
  }

  /**
   * Get dominant emotion from emotion scores
   */
  private getDominantEmotion(emotions: any): string {
    return Object.entries(emotions).reduce((max, [emotion, value]) =>
      (value as number) > (max.value as number) ? { emotion, value } : max,
      { emotion: 'neutral', value: 0 }
    ).emotion;
  }

  /**
   * Calculate engagement level for a single data point
   */
  private calculateEngagementLevel(data: FacialAnalysisData): number {
    // Combine eye contact, confidence, and positive emotions
    const eyeContactScore = data.eyeContact ? 1 : 0;
    const confidenceScore = data.confidence;
    const positiveEmotions = data.emotions.happy + data.emotions.surprised;
    const negativeEmotions = data.emotions.sad + data.emotions.angry + data.emotions.fearful;
    
    const emotionalScore = Math.max(0, positiveEmotions - negativeEmotions);
    
    return (eyeContactScore * 0.4 + confidenceScore * 0.4 + emotionalScore * 0.2);
  }

  /**
   * Get session duration in seconds
   */
  private getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Reset all collected data
   */
  reset(): void {
    this.facialDataHistory = [];
    this.metricsSnapshots = [];
    this.sessionStartTime = null;
    this.currentResponseStartTime = null;
    this.isCollecting = false;
  }

  /**
   * Export metrics data for analysis
   */
  exportMetricsData() {
    return {
      facialDataHistory: this.facialDataHistory,
      metricsSnapshots: this.metricsSnapshots,
      sessionDuration: this.getSessionDuration(),
      finalMetrics: this.calculateFinalMetrics(),
      engagementMetrics: this.getEngagementMetrics(),
      moodTimeline: this.getMoodTimeline(),
    };
  }
}

// Export singleton instance
export const metricsCollectionService = new MetricsCollectionService();