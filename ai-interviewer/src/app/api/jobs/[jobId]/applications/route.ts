import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[jobId]/applications - Get all applications for a specific job
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

    // Get all applications for the job
    const applications = await db
      .collection('jobApplications')
      .find({ jobPostingId: jobId })
      .sort({ appliedAt: -1 })
      .toArray();

    // Get candidate details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        // Get candidate profile
        const candidate = await db
          .collection('users')
          .findOne({ _id: new ObjectId(application.candidateId) });

        // Get interview session if exists
        let interviewSession = null;
        if (application.interviewSessionId) {
          interviewSession = await db
            .collection('interviewSessions')
            .findOne({ _id: new ObjectId(application.interviewSessionId) });
        }

        return {
          ...application,
          id: application._id.toString(),
          candidateName: candidate 
            ? `${candidate.profile.firstName} ${candidate.profile.lastName}`
            : 'Unknown Candidate',
          candidateEmail: candidate?.email || 'unknown@email.com',
          resumeUrl: candidate?.profile.resumeUrl,
          interviewSession: interviewSession ? {
            ...interviewSession,
            id: interviewSession._id.toString(),
          } : null,
          lastActivity: application.updatedAt || application.appliedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      applications: applicationsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}