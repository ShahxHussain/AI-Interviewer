import { NextRequest, NextResponse } from 'next/server';
import { InterviewMetrics } from '@/types';

// In-memory storage for demo purposes
// In production, this would use a database
const metricsStorage = new Map<string, InterviewMetrics>();

/**
 * GET /api/interview/metrics?sessionId=xxx
 * Retrieve metrics for a specific session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const metrics = metricsStorage.get(sessionId);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics not found for this session' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview/metrics
 * Store metrics for a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, metrics } = body;

    if (!sessionId || !metrics) {
      return NextResponse.json(
        { error: 'Session ID and metrics are required' },
        { status: 400 }
      );
    }

    // Validate metrics structure
    const requiredFields = [
      'eyeContactPercentage',
      'moodTimeline',
      'averageConfidence',
      'responseQuality',
      'overallEngagement',
    ];

    for (const field of requiredFields) {
      if (!(field in metrics)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Store metrics
    metricsStorage.set(sessionId, metrics);

    return NextResponse.json({
      success: true,
      message: 'Metrics stored successfully',
    });
  } catch (error) {
    console.error('Error storing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to store metrics' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/interview/metrics
 * Update existing metrics for a session
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, metrics } = body;

    if (!sessionId || !metrics) {
      return NextResponse.json(
        { error: 'Session ID and metrics are required' },
        { status: 400 }
      );
    }

    const existingMetrics = metricsStorage.get(sessionId);

    if (!existingMetrics) {
      return NextResponse.json(
        { error: 'Metrics not found for this session' },
        { status: 404 }
      );
    }

    // Merge with existing metrics
    const updatedMetrics = { ...existingMetrics, ...metrics };
    metricsStorage.set(sessionId, updatedMetrics);

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully',
      data: updatedMetrics,
    });
  } catch (error) {
    console.error('Error updating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interview/metrics?sessionId=xxx
 * Delete metrics for a specific session
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const deleted = metricsStorage.delete(sessionId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Metrics not found for this session' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Metrics deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to delete metrics' },
      { status: 500 }
    );
  }
}