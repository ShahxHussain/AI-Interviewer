import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/applications/[applicationId]/status - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { applicationId } = params;
    const body = await request.json();

    if (!ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const { status, notes } = body;

    // Validate status
    const validStatuses = ['applied', 'interview-scheduled', 'interview-completed', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update application status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const result = await db
      .collection('jobApplications')
      .updateOne(
        { _id: new ObjectId(applicationId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get updated application
    const updatedApplication = await db
      .collection('jobApplications')
      .findOne({ _id: new ObjectId(applicationId) });

    return NextResponse.json({
      success: true,
      application: {
        ...updatedApplication,
        id: updatedApplication._id.toString(),
      },
      message: `Application status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}