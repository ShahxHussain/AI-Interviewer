import { NextRequest, NextResponse } from 'next/server';
import { InterviewerType, VoiceSynthesisRequest } from '@/types';
import { voiceService } from '@/lib/services/voice-service';

interface APIVoiceSynthesisRequest {
  text: string;
  interviewer: InterviewerType;
  speed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: APIVoiceSynthesisRequest = await request.json();
    const { text, interviewer, speed } = body;

    // Validate required fields
    if (!text || !interviewer) {
      return NextResponse.json(
        { success: false, error: 'Text and interviewer type are required' },
        { status: 400 }
      );
    }

    // Validate text using voice service
    const validation = voiceService.validateText(text);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get voice profile for the interviewer type
    const voiceProfile = voiceService.getVoiceProfile(interviewer);

    // Create synthesis request
    const synthesisRequest: VoiceSynthesisRequest = {
      text,
      voice: voiceProfile,
      speed: speed || 1.0,
    };

    // Synthesize the text
    const result = await voiceService.synthesizeText(synthesisRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice synthesis error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error during voice synthesis' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve voice profiles
export async function GET() {
  try {
    const interviewerTypes: InterviewerType[] = [
      'tech-lead',
      'hr-manager',
      'product-manager',
      'recruiter',
    ];

    const voiceProfiles = interviewerTypes.map(interviewer => ({
      interviewer,
      ...voiceService.getVoiceProfile(interviewer),
    }));

    return NextResponse.json({
      success: true,
      voiceProfiles,
    });
  } catch (error) {
    console.error('Error retrieving voice profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve voice profiles' },
      { status: 500 }
    );
  }
}
