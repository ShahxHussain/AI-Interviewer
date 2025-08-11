import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/services/session-service';
import { verifyToken } from '@/lib/auth';

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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const sessionIds = searchParams.get('sessionIds')?.split(',') || [];

    if (sessionIds.length === 0) {
      // Export all user sessions
      const result = await SessionService.getFilteredUserSessions(
        decoded.userId,
        {},
        1,
        1000 // Large limit to get all sessions
      );
      
      if (format === 'csv') {
        const csvData = SessionService.exportSessionsAsCSV(result.sessions);
        
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="interview-sessions.csv"',
          },
        });
      }
      
      return NextResponse.json(result.sessions);
    } else {
      // Export specific sessions
      const sessions = await Promise.all(
        sessionIds.map(id => SessionService.getSession(id))
      );
      
      const validSessions = sessions.filter(
        (session): session is NonNullable<typeof session> => 
          session !== null && session.candidateId === decoded.userId
      );

      if (format === 'csv') {
        const csvData = SessionService.exportSessionsAsCSV(validSessions);
        
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="selected-sessions.csv"',
          },
        });
      }
      
      return NextResponse.json(validSessions);
    }
  } catch (error) {
    console.error('Failed to export sessions:', error);
    return NextResponse.json(
      { error: 'Failed to export sessions' },
      { status: 500 }
    );
  }
}