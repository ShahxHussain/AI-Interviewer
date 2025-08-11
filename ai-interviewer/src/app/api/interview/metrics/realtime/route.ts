import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for real-time metrics
const realtimeMetrics = new Map<string, any>();
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

/**
 * GET /api/interview/metrics/realtime?sessionId=xxx
 * Server-Sent Events endpoint for real-time metrics streaming
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to active connections
      if (!activeConnections.has(sessionId)) {
        activeConnections.set(sessionId, new Set());
      }
      activeConnections.get(sessionId)!.add(controller);

      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        sessionId,
        timestamp: Date.now(),
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Send current metrics if available
      const currentMetrics = realtimeMetrics.get(sessionId);
      if (currentMetrics) {
        const metricsMessage = `data: ${JSON.stringify({
          type: 'metrics',
          data: currentMetrics,
          timestamp: Date.now(),
        })}\n\n`;
        
        controller.enqueue(new TextEncoder().encode(metricsMessage));
      }
    },
    cancel() {
      // Remove this connection from active connections
      const connections = activeConnections.get(sessionId);
      if (connections) {
        connections.delete(controller);
        if (connections.size === 0) {
          activeConnections.delete(sessionId);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * POST /api/interview/metrics/realtime
 * Update real-time metrics and broadcast to connected clients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, metrics, type = 'metrics' } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Store the metrics
    realtimeMetrics.set(sessionId, metrics);

    // Broadcast to all connected clients for this session
    const connections = activeConnections.get(sessionId);
    if (connections && connections.size > 0) {
      const message = `data: ${JSON.stringify({
        type,
        data: metrics,
        timestamp: Date.now(),
      })}\n\n`;

      const encodedMessage = new TextEncoder().encode(message);

      // Send to all connected clients
      const disconnectedControllers: ReadableStreamDefaultController[] = [];
      
      connections.forEach(controller => {
        try {
          controller.enqueue(encodedMessage);
        } catch (error) {
          // Connection is closed, mark for removal
          disconnectedControllers.push(controller);
        }
      });

      // Remove disconnected controllers
      disconnectedControllers.forEach(controller => {
        connections.delete(controller);
      });

      // Clean up empty connection sets
      if (connections.size === 0) {
        activeConnections.delete(sessionId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Metrics broadcasted successfully',
      activeConnections: connections?.size || 0,
    });
  } catch (error) {
    console.error('Error broadcasting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast metrics' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interview/metrics/realtime?sessionId=xxx
 * Clean up real-time metrics for a session
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

    // Remove stored metrics
    realtimeMetrics.delete(sessionId);

    // Close all connections for this session
    const connections = activeConnections.get(sessionId);
    if (connections) {
      const closeMessage = `data: ${JSON.stringify({
        type: 'session_ended',
        sessionId,
        timestamp: Date.now(),
      })}\n\n`;

      const encodedMessage = new TextEncoder().encode(closeMessage);

      connections.forEach(controller => {
        try {
          controller.enqueue(encodedMessage);
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });

      activeConnections.delete(sessionId);
    }

    return NextResponse.json({
      success: true,
      message: 'Session metrics cleaned up successfully',
    });
  } catch (error) {
    console.error('Error cleaning up session metrics:', error);
    return NextResponse.json(
      { error: 'Failed to clean up session metrics' },
      { status: 500 }
    );
  }
}