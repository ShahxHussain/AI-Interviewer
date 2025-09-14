import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[jobId]/analytics - Get detailed analytics for a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const { jobId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    // Get all applications for this job
    const applications = await db
      .collection('jobApplications')
      .find({ 
        jobPostingId: jobId,
        appliedAt: { $gte: startDate, $lte: endDate }
      })
      .toArray();

    // Get interview sessions for these applications
    const applicationIds = applications.map(app => app._id.toString());
    const interviewSessions = await db
      .collection('interviewSessions')
      .find({ 
        'configuration.jobPosting.id': jobId,
        startedAt: { $gte: startDate, $lte: endDate }
      })
      .toArray();

    // Calculate basic metrics
    const totalApplications = applications.length;
    
    const statusBreakdown = {
      applied: applications.filter(app => app.status === 'applied').length,
      'interview-scheduled': applications.filter(app => app.status === 'interview-scheduled').length,
      'interview-completed': applications.filter(app => app.status === 'interview-completed').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      hired: applications.filter(app => app.status === 'hired').length,
    };

    // Calculate time metrics
    const hiredApplications = applications.filter(app => app.status === 'hired');
    const rejectedApplications = applications.filter(app => app.status === 'rejected');

    const averageTimeToHire = hiredApplications.length > 0 
      ? hiredApplications.reduce((sum, app) => {
          const hireTime = app.updatedAt || app.appliedAt;
          const applyTime = app.appliedAt;
          return sum + (new Date(hireTime).getTime() - new Date(applyTime).getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / hiredApplications.length
      : 0;

    const averageTimeToReject = rejectedApplications.length > 0
      ? rejectedApplications.reduce((sum, app) => {
          const rejectTime = app.updatedAt || app.appliedAt;
          const applyTime = app.appliedAt;
          return sum + (new Date(rejectTime).getTime() - new Date(applyTime).getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / rejectedApplications.length
      : 0;

    // Calculate conversion rates
    const interviewedCount = statusBreakdown['interview-scheduled'] + statusBreakdown['interview-completed'];
    const hiredCount = statusBreakdown.hired;

    const conversionRates = {
      applicationToInterview: totalApplications > 0 ? interviewedCount / totalApplications : 0,
      interviewToHire: interviewedCount > 0 ? hiredCount / interviewedCount : 0,
      overallHireRate: totalApplications > 0 ? hiredCount / totalApplications : 0,
    };

    // Calculate application trends (daily data)
    const applicationTrends = [];
    for (let i = Math.min(timeRange - 1, 13); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayApplications = applications.filter(app => 
        app.appliedAt >= dayStart && app.appliedAt < dayEnd
      ).length;

      const dayInterviews = applications.filter(app => 
        app.status === 'interview-scheduled' || app.status === 'interview-completed'
      ).filter(app => {
        const statusChangeDate = app.updatedAt || app.appliedAt;
        return statusChangeDate >= dayStart && statusChangeDate < dayEnd;
      }).length;

      const dayHires = applications.filter(app => 
        app.status === 'hired'
      ).filter(app => {
        const hireDate = app.updatedAt || app.appliedAt;
        return hireDate >= dayStart && hireDate < dayEnd;
      }).length;

      applicationTrends.push({
        date: dayStart.toISOString().split('T')[0],
        applications: dayApplications,
        interviews: dayInterviews,
        hires: dayHires,
      });
    }

    // Get candidate skills from user profiles
    const candidateIds = applications.map(app => app.candidateId);
    const candidates = await db
      .collection('users')
      .find({ _id: { $in: candidateIds.map(id => new ObjectId(id)) } })
      .toArray();

    // Calculate top candidate skills
    const skillCounts = new Map<string, { count: number; hired: number }>();
    
    candidates.forEach(candidate => {
      const application = applications.find(app => app.candidateId === candidate._id.toString());
      const isHired = application?.status === 'hired';
      
      candidate.profile?.skills?.forEach((skill: string) => {
        const current = skillCounts.get(skill) || { count: 0, hired: 0 };
        current.count += 1;
        if (isHired) current.hired += 1;
        skillCounts.set(skill, current);
      });
    });

    const topCandidateSkills = Array.from(skillCounts.entries())
      .map(([skill, counts]) => ({
        skill,
        count: counts.count,
        hireRate: counts.count > 0 ? counts.hired / counts.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate interview performance
    const completedInterviews = interviewSessions.filter(session => 
      session.status === 'completed' && session.feedback?.overallScore
    );

    const averageScore = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, session) => sum + session.feedback.overallScore, 0) / completedInterviews.length
      : 0;

    // Score distribution
    const scoreRanges = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10 },
    ];

    const scoreDistribution = scoreRanges.map(range => ({
      range: range.range,
      count: completedInterviews.filter(session => 
        session.feedback.overallScore >= range.min && session.feedback.overallScore < range.max
      ).length,
    }));

    const metrics = {
      totalApplications,
      statusBreakdown,
      averageTimeToHire,
      averageTimeToReject,
      conversionRates,
      applicationTrends,
      topCandidateSkills,
      interviewPerformance: {
        averageScore,
        scoreDistribution,
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job analytics' },
      { status: 500 }
    );
  }
}