import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/jobs/bulk - Bulk update job statuses
export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { jobIds, status, recruiterId } = body;

    // Validate input
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job IDs array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['draft', 'active', 'paused', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate job IDs
    const validJobIds = jobIds.filter(id => ObjectId.isValid(id));
    if (validJobIds.length !== jobIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some job IDs are invalid' },
        { status: 400 }
      );
    }

    // Build query - include recruiterId for security
    const query: any = {
      _id: { $in: validJobIds.map(id => new ObjectId(id)) }
    };

    if (recruiterId) {
      query.recruiterId = recruiterId;
    }

    // Update jobs
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set isActive based on status
    updateData.isActive = status === 'active';

    const result = await db
      .collection('jobPostings')
      .updateMany(query, { $set: updateData });

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} job(s) updated to ${status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error bulk updating jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update jobs' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/bulk - Bulk delete jobs
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { jobIds, recruiterId } = body;

    // Validate input
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job IDs array is required' },
        { status: 400 }
      );
    }

    // Validate job IDs
    const validJobIds = jobIds.filter(id => ObjectId.isValid(id));
    if (validJobIds.length !== jobIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some job IDs are invalid' },
        { status: 400 }
      );
    }

    // Build query - include recruiterId for security
    const query: any = {
      _id: { $in: validJobIds.map(id => new ObjectId(id)) }
    };

    if (recruiterId) {
      query.recruiterId = recruiterId;
    }

    // Check for jobs with applications
    const jobsWithApplications = [];
    for (const jobId of validJobIds) {
      const applicationsCount = await db
        .collection('jobApplications')
        .countDocuments({ jobPostingId: jobId });
      
      if (applicationsCount > 0) {
        jobsWithApplications.push(jobId);
      }
    }

    let deletedCount = 0;
    let closedCount = 0;

    if (jobsWithApplications.length > 0) {
      // Close jobs with applications instead of deleting
      const closeResult = await db
        .collection('jobPostings')
        .updateMany(
          { 
            _id: { $in: jobsWithApplications.map(id => new ObjectId(id)) },
            ...(recruiterId && { recruiterId })
          },
          { 
            $set: { 
              status: 'closed',
              isActive: false,
              updatedAt: new Date()
            }
          }
        );
      closedCount = closeResult.modifiedCount;
    }

    // Delete jobs without applications
    const jobsToDelete = validJobIds.filter(id => !jobsWithApplications.includes(id));
    if (jobsToDelete.length > 0) {
      const deleteResult = await db
        .collection('jobPostings')
        .deleteMany({
          _id: { $in: jobsToDelete.map(id => new ObjectId(id)) },
          ...(recruiterId && { recruiterId })
        });
      deletedCount = deleteResult.deletedCount;
    }

    let message = '';
    if (deletedCount > 0 && closedCount > 0) {
      message = `${deletedCount} job(s) deleted and ${closedCount} job(s) closed (due to existing applications)`;
    } else if (deletedCount > 0) {
      message = `${deletedCount} job(s) deleted successfully`;
    } else if (closedCount > 0) {
      message = `${closedCount} job(s) closed (due to existing applications)`;
    } else {
      message = 'No jobs were affected';
    }

    return NextResponse.json({
      success: true,
      message,
      deletedCount,
      closedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete jobs' },
      { status: 500 }
    );
  }
}