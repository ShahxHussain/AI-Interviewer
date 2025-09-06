import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[jobId]/analytics - Get analytics data for a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { jobId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Get job details
    const job = await db
      .collection('jobPostings')
      .findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const timeRangeDate = new Date();
    timeRangeDate.setDate(timeRangeDate.getDate() - parseInt(timeRange));

    // Get applications data
    const applications = await db
      .collection('jobApplications')
      .find({ 
        jobPostingId: jobId,
        appliedAt: { $gte: timeRangeDate }
      })
      .toArray();

    // Calculate application metrics
    const totalApplications = applications.length;
    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate applications over time (daily)
    const applicationsOverTime = [];
    const days = parseInt(timeRange);
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = applications.filter(app => {
        const appDate = new Date(app.appliedAt);
        return appDate >= date && appDate < nextDate;
      }).length;
      
      applicationsOverTime.push({
        date: date.toISOString().split('T')[0],
        applications: count,
      });
    }

    // Get interview completion rate
    const interviewScheduled = applicationsByStatus['interview-scheduled'] || 0;
    const interviewCompleted = applicationsByStatus['interview-completed'] || 0;
    const hired = applicationsByStatus['hired'] || 0;
    const rejected = applicationsByStatus['rejected'] || 0;

    const interviewCompletionRate = interviewScheduled > 0 
      ? ((interviewCompleted + hired + rejected) / (interviewScheduled + interviewCompleted + hired + rejected)) * 100
      : 0;

    const hireRate = totalApplications > 0 
      ? (hired / totalApplications) * 100
      : 0;

    // Get top skills from applications (based on candidate profiles)
    const candidateIds = applications.map(app => new ObjectId(app.candidateId));
    const candidates = await db
      .collection('users')
      .find({ _id: { $in: candidateIds } })
      .toArray();

    const skillsCount = {};
    candidates.forEach(candidate => {
      if (candidate.profile?.skills) {
        candidate.profile.skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Calculate average time to hire
    const hiredApplications = applications.filter(app => app.status === 'hired');
    const averageTimeToHire = hiredApplications.length > 0
      ? hiredApplications.reduce((sum, app) => {
          const timeToHire = new Date(app.updatedAt).getTime() - new Date(app.appliedAt).getTime();
          return sum + timeToHire;
        }, 0) / hiredApplications.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get recent activity
    const recentActivity = applications
      .sort((a, b) => new Date(b.updatedAt || b.appliedAt).getTime() - new Date(a.updatedAt || a.appliedAt).getTime())
      .slice(0, 10)
      .map(app => {
        const candidate = candidates.find(c => c._id.toString() === app.candidateId);
        return {
          id: app._id.toString(),
          candidateName: candidate 
            ? `${candidate.profile.firstName} ${candidate.profile.lastName}`
            : 'Unknown Candidate',
          action: app.status,
          timestamp: app.updatedAt || app.appliedAt,
        };
      });

    const analytics = {
      jobTitle: job.title,
      totalViews: job.viewsCount || 0,
      totalApplications,
      applicationsByStatus,
      applicationsOverTime,
      interviewCompletionRate: Math.round(interviewCompletionRate * 100) / 100,
      hireRate: Math.round(hireRate * 100) / 100,
      averageTimeToHire: Math.round(averageTimeToHire * 100) / 100,
      topSkills,
      recentActivity,
      conversionFunnel: {
        views: job.viewsCount || 0,
        applications: totalApplications,
        interviews: (applicationsByStatus['interview-scheduled'] || 0) + (applicationsByStatus['interview-completed'] || 0) + hired + rejected,
        hired: hired,
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}