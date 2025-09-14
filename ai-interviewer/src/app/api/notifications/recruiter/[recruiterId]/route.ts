import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// GET /api/notifications/recruiter/[recruiterId] - Get notifications for a recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: { recruiterId: string } }
) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const { recruiterId } = params;

    // Get recruiter's jobs
    const jobs = await db
      .collection('jobPostings')
      .find({ recruiterId })
      .toArray();

    const jobIds = jobs.map(job => job._id.toString());
    const notifications = [];

    // Check for jobs with low application rates
    for (const job of jobs) {
      if (job.status === 'active') {
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        const applicationsCount = await db
          .collection('jobApplications')
          .countDocuments({ jobPostingId: job._id.toString() });

        // Alert if job is active for more than 7 days with no applications
        if (daysSinceCreated > 7 && applicationsCount === 0) {
          notifications.push({
            id: `low-apps-${job._id}`,
            type: 'warning',
            title: 'Low Application Rate',
            message: `"${job.title}" has been active for ${daysSinceCreated} days with no applications. Consider reviewing the job description or requirements.`,
            jobId: job._id.toString(),
            jobTitle: job.title,
            timestamp: new Date(),
            isRead: false,
            actionRequired: true,
          });
        }

        // Alert if job has very low views
        const viewsCount = job.viewsCount || 0;
        if (daysSinceCreated > 3 && viewsCount < 5) {
          notifications.push({
            id: `low-views-${job._id}`,
            type: 'info',
            title: 'Low Visibility',
            message: `"${job.title}" has only ${viewsCount} views in ${daysSinceCreated} days. Consider improving the job title or adding more relevant skills.`,
            jobId: job._id.toString(),
            jobTitle: job.title,
            timestamp: new Date(),
            isRead: false,
            actionRequired: false,
          });
        }
      }
    }

    // Check for pending applications that need attention
    const pendingApplications = await db
      .collection('jobApplications')
      .find({ 
        jobPostingId: { $in: jobIds },
        status: 'applied',
        appliedAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } // 3 days ago
      })
      .toArray();

    if (pendingApplications.length > 0) {
      notifications.push({
        id: `pending-apps-${Date.now()}`,
        type: 'warning',
        title: 'Pending Applications',
        message: `You have ${pendingApplications.length} applications that have been waiting for more than 3 days. Consider reviewing and updating their status.`,
        timestamp: new Date(),
        isRead: false,
        actionRequired: true,
      });
    }

    // Check for completed interviews without status updates
    const completedInterviews = await db
      .collection('interviewSessions')
      .find({
        'configuration.jobPosting.id': { $in: jobIds },
        status: 'completed',
        completedAt: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // 2 days ago
      })
      .toArray();

    for (const interview of completedInterviews) {
      const application = await db
        .collection('jobApplications')
        .findOne({ interviewSessionId: interview._id.toString() });

      if (application && application.status === 'interview-completed') {
        notifications.push({
          id: `interview-followup-${interview._id}`,
          type: 'info',
          title: 'Interview Follow-up Required',
          message: `An interview was completed 2+ days ago but the candidate status hasn't been updated. Consider making a hiring decision.`,
          jobId: interview.configuration?.jobPosting?.id,
          jobTitle: interview.configuration?.jobPosting?.title,
          timestamp: new Date(),
          isRead: false,
          actionRequired: true,
        });
      }
    }

    // Check for jobs with high rejection rates
    for (const job of jobs) {
      if (job.status === 'active') {
        const totalApplications = await db
          .collection('jobApplications')
          .countDocuments({ jobPostingId: job._id.toString() });

        const rejectedApplications = await db
          .collection('jobApplications')
          .countDocuments({ 
            jobPostingId: job._id.toString(),
            status: 'rejected'
          });

        if (totalApplications >= 10 && rejectedApplications / totalApplications > 0.8) {
          notifications.push({
            id: `high-rejection-${job._id}`,
            type: 'warning',
            title: 'High Rejection Rate',
            message: `"${job.title}" has a ${Math.round((rejectedApplications / totalApplications) * 100)}% rejection rate. Consider reviewing job requirements or interview process.`,
            jobId: job._id.toString(),
            jobTitle: job.title,
            timestamp: new Date(),
            isRead: false,
            actionRequired: false,
          });
        }
      }
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 20), // Limit to 20 most recent
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}