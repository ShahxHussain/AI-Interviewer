import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/jobs/[jobId]/status - Update job posting status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { jobId } = params;
    const body = await request.json();

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const { status } = body;

    // Validate status
    const validStatuses = ['draft', 'active', 'paused', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update job status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set isActive based on status
    updateData.isActive = status === 'active';

    const result = await db
      .collection('jobPostings')
      .updateOne(
        { _id: new ObjectId(jobId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Job status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}