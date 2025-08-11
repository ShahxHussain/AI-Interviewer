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
    const { action, sessionIds } = body;

    let results;
    
    switch (action) {
      case 'restore':
        results = await DataRetentionService.restoreArchivedSessions(
          decoded.userId,
          sessionIds
        );
        break;
        
      case 'delete':
        results = await DataRetentionService.deleteArchivedSessions(
          decoded.userId,
          sessionIds
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "restore" or "delete"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Archive operation failed:', error);
    return NextResponse.json(
      { error: 'Archive operation failed' },
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

    const stats = await DataRetentionService.getArchiveStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get archive stats:', error);
    return NextResponse.json(
      { error: 'Failed to get archive stats' },
      { status: 500 }
    );
  }
}