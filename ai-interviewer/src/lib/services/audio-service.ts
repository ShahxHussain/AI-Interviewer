import { InterviewResponse } from '@/types';

export interface AudioQualityMetrics {
  sampleRate: number;
  bitRate: number;
  duration: number;
  fileSize: number;
  averageVolume: number;
  silencePercentage: number;
  qualityScore: number; // 0-100
}

export interface AudioCompressionOptions {
  targetBitRate?: number; // kbps
  targetSampleRate?: number; // Hz
  format?: 'webm' | 'mp4' | 'wav';
  quality?: 'low' | 'medium' | 'high';
}

export interface AudioAnalysisResult {
  isValid: boolean;
  quality: AudioQualityMetrics;
  issues: string[];
  recommendations: string[];
}

export class AudioService {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  /**
   * Validate audio quality and detect issues
   */
  async validateAudioQuality(audioBlob: Blob): Promise<AudioAnalysisResult> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext?.decodeAudioData(arrayBuffer);

      if (!audioBuffer) {
        return {
          isValid: false,
          quality: this.getDefaultQualityMetrics(),
          issues: ['Failed to decode audio'],
          recommendations: [
            'Try recording again with better microphone settings',
          ],
        };
      }

      const quality = await this.analyzeAudioBuffer(audioBuffer);
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check for common issues
      if (quality.averageVolume < 0.1) {
        issues.push('Audio volume is too low');
        recommendations.push('Speak louder or move closer to the microphone');
      }

      if (quality.silencePercentage > 50) {
        issues.push('Too much silence detected');
        recommendations.push(
          'Ensure you are speaking clearly throughout the recording'
        );
      }

      if (quality.duration < 2) {
        issues.push('Recording is too short');
        recommendations.push('Provide a more detailed response');
      }

      if (quality.qualityScore < 60) {
        issues.push('Overall audio quality is poor');
        recommendations.push('Check your microphone settings and try again');
      }

      return {
        isValid: issues.length === 0 || quality.qualityScore >= 50,
        quality,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Audio validation error:', error);
      return {
        isValid: false,
        quality: this.getDefaultQualityMetrics(),
        issues: ['Failed to analyze audio'],
        recommendations: ['Try recording again'],
      };
    }
  }

  /**
   * Compress audio blob with specified options
   */
  async compressAudio(
    audioBlob: Blob,
    options: AudioCompressionOptions = {}
  ): Promise<Blob> {
    const {
      targetBitRate = 128,
      targetSampleRate = 44100,
      format = 'webm',
      quality = 'medium',
    } = options;

    try {
      // For now, return the original blob as compression requires more complex processing
      // In a production environment, you might use libraries like lamejs for MP3 compression
      // or implement WebAssembly-based compression

      // Simple size-based compression by adjusting quality
      if (audioBlob.size > 5 * 1024 * 1024) {
        // 5MB
        console.warn(
          'Audio file is large, consider implementing proper compression'
        );
      }

      return audioBlob;
    } catch (error) {
      console.error('Audio compression error:', error);
      return audioBlob; // Return original on error
    }
  }

  /**
   * Create enhanced audio playback with controls
   */
  createAudioPlayer(audioBlob: Blob): AudioPlayer {
    return new AudioPlayer(audioBlob);
  }

  /**
   * Convert audio blob to different formats (basic implementation)
   */
  async convertAudioFormat(
    audioBlob: Blob,
    targetFormat: 'webm' | 'mp4' | 'wav'
  ): Promise<Blob> {
    // Basic format conversion - in production, use proper audio conversion libraries
    const arrayBuffer = await audioBlob.arrayBuffer();

    // For now, just change the MIME type (not actual conversion)
    const mimeType = this.getMimeTypeForFormat(targetFormat);
    return new Blob([arrayBuffer], { type: mimeType });
  }

  /**
   * Extract audio features for analysis
   */
  private async analyzeAudioBuffer(
    audioBuffer: AudioBuffer
  ): Promise<AudioQualityMetrics> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // Calculate average volume
    let sum = 0;
    let silentSamples = 0;
    const silenceThreshold = 0.01;

    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      sum += sample;

      if (sample < silenceThreshold) {
        silentSamples++;
      }
    }

    const averageVolume = sum / channelData.length;
    const silencePercentage = (silentSamples / channelData.length) * 100;

    // Calculate quality score based on various factors
    let qualityScore = 100;

    if (averageVolume < 0.05) qualityScore -= 30;
    if (silencePercentage > 40) qualityScore -= 20;
    if (duration < 3) qualityScore -= 15;
    if (sampleRate < 22050) qualityScore -= 10;

    qualityScore = Math.max(0, qualityScore);

    return {
      sampleRate,
      bitRate: this.estimateBitRate(audioBuffer),
      duration,
      fileSize: channelData.length * 4, // Rough estimate
      averageVolume,
      silencePercentage,
      qualityScore,
    };
  }

  private estimateBitRate(audioBuffer: AudioBuffer): number {
    // Rough estimation based on sample rate and channels
    return Math.round(
      (audioBuffer.sampleRate * audioBuffer.numberOfChannels * 16) / 1000
    );
  }

  private getMimeTypeForFormat(format: string): string {
    const mimeTypes = {
      webm: 'audio/webm',
      mp4: 'audio/mp4',
      wav: 'audio/wav',
    };
    return mimeTypes[format as keyof typeof mimeTypes] || 'audio/webm';
  }

  private getDefaultQualityMetrics(): AudioQualityMetrics {
    return {
      sampleRate: 0,
      bitRate: 0,
      duration: 0,
      fileSize: 0,
      averageVolume: 0,
      silencePercentage: 100,
      qualityScore: 0,
    };
  }

  /**
   * Save audio response to storage (mock implementation)
   */
  async saveAudioResponse(
    audioBlob: Blob,
    sessionId: string,
    questionId: string
  ): Promise<string> {
    // In production, this would upload to cloud storage
    const audioUrl = URL.createObjectURL(audioBlob);

    // Store metadata in localStorage for demo purposes
    const responseData = {
      sessionId,
      questionId,
      audioUrl,
      timestamp: Date.now(),
      size: audioBlob.size,
      type: audioBlob.type,
    };

    const storageKey = `audio_response_${sessionId}_${questionId}`;
    localStorage.setItem(storageKey, JSON.stringify(responseData));

    return audioUrl;
  }

  /**
   * Retrieve saved audio response
   */
  async getAudioResponse(
    sessionId: string,
    questionId: string
  ): Promise<string | null> {
    const storageKey = `audio_response_${sessionId}_${questionId}`;
    const data = localStorage.getItem(storageKey);

    if (data) {
      const responseData = JSON.parse(data);
      return responseData.audioUrl;
    }

    return null;
  }

  /**
   * Clean up audio resources
   */
  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

/**
 * Enhanced audio player with advanced controls
 */
export class AudioPlayer {
  private audio: HTMLAudioElement;
  private audioUrl: string;
  private onPlayCallback?: () => void;
  private onPauseCallback?: () => void;
  private onEndCallback?: () => void;
  private onTimeUpdateCallback?: (
    currentTime: number,
    duration: number
  ) => void;

  constructor(audioBlob: Blob) {
    this.audioUrl = URL.createObjectURL(audioBlob);
    this.audio = new Audio(this.audioUrl);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.audio.addEventListener('play', () => this.onPlayCallback?.());
    this.audio.addEventListener('pause', () => this.onPauseCallback?.());
    this.audio.addEventListener('ended', () => this.onEndCallback?.());
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdateCallback?.(this.audio.currentTime, this.audio.duration);
    });
  }

  async play(): Promise<void> {
    try {
      await this.audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      throw new Error('Failed to play audio');
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.25, Math.min(4, rate));
  }

  seekTo(time: number): void {
    this.audio.currentTime = Math.max(
      0,
      Math.min(this.audio.duration || 0, time)
    );
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended;
  }

  onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  onPause(callback: () => void): void {
    this.onPauseCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onTimeUpdate(
    callback: (currentTime: number, duration: number) => void
  ): void {
    this.onTimeUpdateCallback = callback;
  }

  destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    URL.revokeObjectURL(this.audioUrl);
  }
}

// Export singleton instance
export const audioService = new AudioService();
