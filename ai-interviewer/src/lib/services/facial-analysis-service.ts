'use client';

import * as faceapi from 'face-api.js';

export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

export interface FacialAnalysisData {
  emotions: EmotionScores;
  eyeContact: boolean;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  confidence: number;
  timestamp: number;
}

export interface MoodDataPoint {
  timestamp: number;
  dominantEmotion: string;
  confidence: number;
  emotions: EmotionScores;
}

export class FacialAnalysisService {
  private isInitialized = false;
  private isAnalyzing = false;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private onAnalysisCallback: ((data: FacialAnalysisData) => void) | null =
    null;

  /**
   * Initialize face-api.js with required models
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Loading face-api.js models...');

      // Load required models (only the ones we have)
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        // Note: ageGenderNet is not needed for our core functionality
      ]);

      this.isInitialized = true;
      console.log('Face-api.js models loaded successfully');
    } catch (error) {
      console.error('Failed to initialize face-api.js:', error);
      throw new Error('Failed to load facial analysis models');
    }
  }

  /**
   * Start facial analysis on a video element
   */
  async startAnalysis(
    videoElement: HTMLVideoElement,
    onAnalysis: (data: FacialAnalysisData) => void,
    intervalMs: number = 1000
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isAnalyzing) {
      this.stopAnalysis();
    }

    this.videoElement = videoElement;
    this.onAnalysisCallback = onAnalysis;
    this.isAnalyzing = true;

    // Create canvas for drawing (optional, for debugging)
    this.canvas = document.createElement('canvas');
    this.canvas.width = videoElement.videoWidth || 640;
    this.canvas.height = videoElement.videoHeight || 480;

    // Start analysis loop
    this.analysisInterval = setInterval(async () => {
      await this.performAnalysis();
    }, intervalMs);

    console.log('Facial analysis started');
  }

  /**
   * Stop facial analysis
   */
  stopAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    this.isAnalyzing = false;
    this.videoElement = null;
    this.onAnalysisCallback = null;
    this.canvas = null;

    console.log('Facial analysis stopped');
  }

  /**
   * Perform single frame analysis
   */
  private async performAnalysis(): Promise<void> {
    if (!this.videoElement || !this.onAnalysisCallback || !this.isAnalyzing) {
      return;
    }

    try {
      // Detect faces with expressions and landmarks
      const detections = await faceapi
        .detectAllFaces(
          this.videoElement,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length === 0) {
        // No face detected
        return;
      }

      // Use the first detected face
      const detection = detections[0];
      const expressions = detection.expressions;
      const landmarks = detection.landmarks;

      // Calculate eye contact based on eye landmarks and head pose
      const eyeContact = this.calculateEyeContact(landmarks);

      // Calculate head pose
      const headPose = this.calculateHeadPose(landmarks);

      // Get dominant emotion and confidence
      const dominantEmotion = this.getDominantEmotion(expressions);

      // Create analysis data
      const analysisData: FacialAnalysisData = {
        emotions: {
          neutral: expressions.neutral,
          happy: expressions.happy,
          sad: expressions.sad,
          angry: expressions.angry,
          fearful: expressions.fearful,
          disgusted: expressions.disgusted,
          surprised: expressions.surprised,
        },
        eyeContact,
        headPose,
        confidence: dominantEmotion.confidence,
        timestamp: Date.now(),
      };

      // Call the callback with analysis data
      this.onAnalysisCallback(analysisData);
    } catch (error) {
      console.error('Error during facial analysis:', error);
    }
  }

  /**
   * Calculate eye contact based on eye landmarks
   */
  private calculateEyeContact(landmarks: faceapi.FaceLandmarks68): boolean {
    // Get eye landmarks
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    // Calculate eye aspect ratio (EAR) to determine if eyes are open
    const leftEAR = this.calculateEyeAspectRatio(leftEye);
    const rightEAR = this.calculateEyeAspectRatio(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Eyes are considered open if EAR is above threshold
    const eyesOpen = avgEAR > 0.2;

    // Simple heuristic: if eyes are open and face is relatively frontal, assume eye contact
    // In a real implementation, you might use gaze estimation
    return eyesOpen;
  }

  /**
   * Calculate eye aspect ratio
   */
  private calculateEyeAspectRatio(eyePoints: faceapi.Point[]): number {
    if (eyePoints.length < 6) return 0;

    // Calculate distances between eye landmarks
    const p1 = eyePoints[1];
    const p2 = eyePoints[5];
    const p3 = eyePoints[2];
    const p4 = eyePoints[4];
    const p5 = eyePoints[0];
    const p6 = eyePoints[3];

    // Vertical distances
    const d1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
    const d2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));

    // Horizontal distance
    const d3 = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

    // Eye aspect ratio
    return (d1 + d2) / (2 * d3);
  }

  /**
   * Calculate head pose from landmarks
   */
  private calculateHeadPose(landmarks: faceapi.FaceLandmarks68): {
    pitch: number;
    yaw: number;
    roll: number;
  } {
    // Get key facial points
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const mouth = landmarks.getMouth();

    // Calculate center points
    const leftEyeCenter = this.getCenterPoint(leftEye);
    const rightEyeCenter = this.getCenterPoint(rightEye);
    const noseCenter = this.getCenterPoint(nose);
    const mouthCenter = this.getCenterPoint(mouth);

    // Calculate angles (simplified estimation)
    const eyeDistance = Math.sqrt(
      Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) +
        Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    );

    // Roll: rotation around z-axis (head tilt)
    const roll =
      Math.atan2(
        rightEyeCenter.y - leftEyeCenter.y,
        rightEyeCenter.x - leftEyeCenter.x
      ) *
      (180 / Math.PI);

    // Yaw: rotation around y-axis (left/right turn)
    const eyeMidpoint = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
    };
    const yaw = ((noseCenter.x - eyeMidpoint.x) / eyeDistance) * 45; // Simplified

    // Pitch: rotation around x-axis (up/down nod)
    const pitch = ((mouthCenter.y - eyeMidpoint.y) / eyeDistance) * 30; // Simplified

    return { pitch, yaw, roll };
  }

  /**
   * Get center point of a set of landmarks
   */
  private getCenterPoint(points: faceapi.Point[]): { x: number; y: number } {
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  /**
   * Get dominant emotion and its confidence
   */
  private getDominantEmotion(expressions: faceapi.FaceExpressions): {
    emotion: string;
    confidence: number;
  } {
    const emotions = [
      { name: 'neutral', value: expressions.neutral },
      { name: 'happy', value: expressions.happy },
      { name: 'sad', value: expressions.sad },
      { name: 'angry', value: expressions.angry },
      { name: 'fearful', value: expressions.fearful },
      { name: 'disgusted', value: expressions.disgusted },
      { name: 'surprised', value: expressions.surprised },
    ];

    const dominant = emotions.reduce((max, current) =>
      current.value > max.value ? current : max
    );

    return { emotion: dominant.name, confidence: dominant.value };
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if analysis is running
   */
  isRunning(): boolean {
    return this.isAnalyzing;
  }
}

// Export singleton instance
export const facialAnalysisService = new FacialAnalysisService();
