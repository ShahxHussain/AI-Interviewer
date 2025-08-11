import { NextRequest, NextResponse } from 'next/server';
import { DataRetentionService, DataExportOptions } from '@/lib/services/data-retention-service';
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
    const options: DataExportOptions = {
      format: body.format || 'json',
      includeMetrics: body.includeMetrics !== false,
      includeResponses: body.includeResponses !== false,
      includeFeedback: body.includeFeedback !== false,
      dateRange: body.dateRange ? {
        from: new Date(body.dateRange.from),
        to: new Date(body.dateRange.to),
      } : undefined,
    };

    const exportResult = await DataRetentionService.exportUserData(
      decoded.userId,
      options
    );

    return new NextResponse(exportResult.data, {
      headers: {
        'Content-Type': exportResult.mimeType,
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}