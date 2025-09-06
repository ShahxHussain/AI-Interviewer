import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/jobs/recruiter/[recruiterId] - Get all jobs for a specific recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: { recruiterId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { recruiterId } = params;

    // Get all jobs for the recruiter
    const jobs = await db
      .collection('jobPostings')
      .find({ recruiterId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get application counts and recent applications for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applications = await db
          .collection('jobApplications')
          .find({ jobPostingId: job._id.toString() })
          .sort({ appliedAt: -1 })
          .toArray();

        const recentApplications = applications.slice(0, 5);

        return {
          ...job,
          id: job._id.toString(),
          applicationsCount: applications.length,
          viewsCount: job.viewsCount || 0,
          recentApplications: recentApplications.map(app => ({
            ...app,
            id: app._id.toString(),
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithStats,
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}