import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SessionFilters } from '@/lib/services/session-service';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filters: SessionFilters = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any;
    }
    if (searchParams.get('interviewType')) {
      filters.interviewType = searchParams.get('interviewType') as any;
    }
    if (searchParams.get('interviewer')) {
      filters.interviewer = searchParams.get('interviewer') as any;
    }
    if (searchParams.get('difficulty')) {
      filters.difficulty = searchParams.get('difficulty') as any;
    }
    if (searchParams.get('dateFrom')) {
      filters.dateFrom = new Date(searchParams.get('dateFrom')!);
    }
    if (searchParams.get('dateTo')) {
      filters.dateTo = new Date(searchParams.get('dateTo')!);
    }
    if (searchParams.get('search')) {
      filters.searchQuery = searchParams.get('search')!;
    }

    const result = await SessionService.getFilteredUserSessions(
      decoded.userId,
      filters,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}