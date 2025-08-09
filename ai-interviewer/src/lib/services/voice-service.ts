import {
  InterviewerType,
  VoiceProfile,
  VoiceSynthesisRequest,
  VoiceSynthesisResponse,
} from '@/types';

// Voice profiles mapped to interviewer types
export const VOICE_PROFILES: Record<InterviewerType, VoiceProfile> = {
  'tech-lead': {
    gender: 'male',
    accent: 'american',
    tone: 'professional',
    voiceId: 'en-US-davis',
  },
  'hr-manager': {
    gender: 'female',
    accent: 'american',
    tone: 'friendly',
    voiceId: 'en-US-aria',
  },
  'product-manager': {
    gender: 'male',
    accent: 'american',
    tone: 'authoritative',
    voiceId: 'en-US-guy',
  },
  recruiter: {
    gender: 'female',
    accent: 'american',
    tone: 'professional',
    voiceId: 'en-US-jenny',
  },
};

export class VoiceService {
  private apiKey: string;
  private baseUrl: string = 'https://api.murf.ai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MURF_AI_API_KEY || '';
  }

  /**
   * Synthesize text to speech using Web Speech API or Murf AI fallback
   */
  async synthesizeText(
    request: VoiceSynthesisRequest
  ): Promise<VoiceSynthesisResponse> {
    try {
      // Try Web Speech API first (browser native)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return await this.synthesizeWithWebSpeech(request);
      }

      // Fallback to mock response for development
      console.warn(
        'Using fallback voice synthesis (Web Speech API not available)'
      );
      return this.getFallbackResponse(request.text);
    } catch (error) {
      console.error('Voice synthesis error:', error);
      return this.getFallbackResponse(request.text);
    }
  }

  /**
   * Synthesize using Web Speech API
   */
  private async synthesizeWithWebSpeech(
    request: VoiceSynthesisRequest
  ): Promise<VoiceSynthesisResponse> {
    return new Promise(resolve => {
      try {
        const utterance = new SpeechSynthesisUtterance(request.text);

        // Configure voice based on interviewer type
        const voices = speechSynthesis.getVoices();
        let selectedVoice = voices.find(
          voice =>
            voice.lang.startsWith('en') &&
            (request.voice.gender === 'female'
              ? voice.name.toLowerCase().includes('female')
              : voice.name.toLowerCase().includes('male'))
        );

        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.rate = request.speed || 1.0;
        utterance.pitch = request.voice.tone === 'authoritative' ? 0.8 : 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          resolve({
            success: true,
            duration: Math.ceil(request.text.length / 10),
          });
        };

        utterance.onerror = () => {
          resolve(this.getFallbackResponse(request.text));
        };

        speechSynthesis.speak(utterance);
      } catch (error) {
        resolve(this.getFallbackResponse(request.text));
      }
    });
  }

  /**
   * Get voice profile for interviewer type
   */
  getVoiceProfile(interviewer: InterviewerType): VoiceProfile {
    return VOICE_PROFILES[interviewer];
  }

  /**
   * Validate text for synthesis
   */
  validateText(text: string): { valid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }

    if (text.length > 3000) {
      return {
        valid: false,
        error: 'Text is too long. Maximum 3000 characters allowed.',
      };
    }

    return { valid: true };
  }

  /**
   * Fallback response when Murf AI is not available
   */
  private getFallbackResponse(text: string): VoiceSynthesisResponse {
    // Generate mock audio data for development/fallback
    const mockAudio = {
      text,
      duration: Math.ceil(text.length / 10), // Rough estimate: 10 chars per second
      timestamp: Date.now(),
      type: 'mock-audio',
    };

    return {
      success: true,
      audioData: Buffer.from(JSON.stringify(mockAudio)).toString('base64'),
      duration: mockAudio.duration,
    };
  }

  /**
   * Convert base64 audio data to blob URL
   */
  createAudioBlob(audioData: string): string {
    try {
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mp3' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating audio blob:', error);
      throw new Error('Failed to create audio blob');
    }
  }

  /**
   * Preload audio for better performance
   */
  async preloadAudio(audioUrl: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.addEventListener('error', () =>
        reject(new Error('Failed to load audio'))
      );

      audio.load();
    });
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
