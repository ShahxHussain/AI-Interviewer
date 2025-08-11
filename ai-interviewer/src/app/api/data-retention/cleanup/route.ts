import { NextRequest, NextResponse } from 'next/server';
import { DataRetentionService } from '@/lib/services/data-retention-service';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { policy } = body;

    const results = await DataRetentionService.applyRetentionPolicy(
      decoded.userId,
      policy
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const stats = await DataRetentionService.getUserStorageStats(decoded.userId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get storage stats' },
      { status: 500 }
    );
  }
}