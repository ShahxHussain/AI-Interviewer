import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[jobId] - Get a specific job posting
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { jobId } = params;

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const job = await db
      .collection('jobPostings')
      .findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .collection('jobPostings')
      .updateOne(
        { _id: new ObjectId(jobId) },
        { $inc: { viewsCount: 1 } }
      );

    // Get application count
    const applicationsCount = await db
      .collection('jobApplications')
      .countDocuments({ jobPostingId: jobId });

    const jobWithStats = {
      ...job,
      id: job._id.toString(),
      applicationsCount,
      viewsCount: (job.viewsCount || 0) + 1,
    };

    return NextResponse.json({
      success: true,
      job: jobWithStats,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[jobId] - Update a job posting
export async function PUT(
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

    // Validate required fields
    const requiredFields = ['title', 'description', 'responsibilities', 'requirements', 'requiredSkills', 'experienceLevel'];
    for (const field of requiredFields) {
      if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

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

    const updatedJob = await db
      .collection('jobPostings')
      .findOne({ _id: new ObjectId(jobId) });

    return NextResponse.json({
      success: true,
      job: {
        ...updatedJob,
        id: updatedJob._id.toString(),
      },
      message: 'Job posting updated successfully',
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job posting' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[jobId] - Delete a job posting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { jobId } = params;

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Check if job has applications
    const applicationsCount = await db
      .collection('jobApplications')
      .countDocuments({ jobPostingId: jobId });

    if (applicationsCount > 0) {
      // Instead of deleting, mark as closed
      await db
        .collection('jobPostings')
        .updateOne(
          { _id: new ObjectId(jobId) },
          { 
            $set: { 
              status: 'closed',
              isActive: false,
              updatedAt: new Date()
            }
          }
        );

      return NextResponse.json({
        success: true,
        message: 'Job posting closed due to existing applications',
      });
    } else {
      // Safe to delete if no applications
      const result = await db
        .collection('jobPostings')
        .deleteOne({ _id: new ObjectId(jobId) });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Job posting deleted successfully',
      });
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}