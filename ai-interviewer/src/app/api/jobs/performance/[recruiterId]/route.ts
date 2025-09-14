import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/jobs/performance/[recruiterId] - Get job performance metrics for a recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: { recruiterId: string } }
) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const { recruiterId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    // Get all jobs for the recruiter
    const jobs = await db
      .collection('jobPostings')
      .find({ recruiterId })
      .toArray();

    const jobPerformances = await Promise.all(
      jobs.map(async (job) => {
        // Get applications for this job
        const applications = await db
          .collection('jobApplications')
          .find({ 
            jobPostingId: job._id.toString(),
            appliedAt: { $gte: startDate, $lte: endDate }
          })
          .toArray();

        const totalApplications = applications.length;
        const hiredApplications = applications.filter(app => app.status === 'hired');
        const hiredCount = hiredApplications.length;
        const viewsCount = job.viewsCount || 0;

        // Calculate metrics
        const conversionRate = viewsCount > 0 ? totalApplications / viewsCount : 0;
        const hireRate = totalApplications > 0 ? hiredCount / totalApplications : 0;

        // Calculate average time to hire
        const averageTimeToHire = hiredApplications.length > 0
          ? hiredApplications.reduce((sum, app) => {
              const hireTime = app.updatedAt || app.appliedAt;
              const applyTime = app.appliedAt;
              return sum + (new Date(hireTime).getTime() - new Date(applyTime).getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / hiredApplications.length
          : 0;

        // Calculate performance score (0-100)
        let performanceScore = 0;
        
        // Application volume (30 points max)
        const applicationScore = Math.min((totalApplications / 10) * 30, 30);
        
        // Conversion rate (25 points max)
        const conversionScore = Math.min(conversionRate * 100 * 25, 25);
        
        // Hire rate (25 points max)
        const hireScore = Math.min(hireRate * 100 * 25, 25);
        
        // Time efficiency (20 points max) - lower time is better
        const timeScore = averageTimeToHire > 0 
          ? Math.max(20 - (averageTimeToHire / 30) * 20, 0)
          : 0;

        performanceScore = applicationScore + conversionScore + hireScore + timeScore;

        // Determine trend (simplified - in reality you'd compare with previous periods)
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (performanceScore > 70) trend = 'up';
        else if (performanceScore < 40) trend = 'down';

        // Generate recommendations
        const recommendations = [];
        
        if (totalApplications < 5) {
          recommendations.push('Consider improving job title and description to attract more candidates');
        }
        
        if (conversionRate < 0.1 && viewsCount > 20) {
          recommendations.push('Low conversion rate - review job requirements and application process');
        }
        
        if (hireRate < 0.1 && totalApplications > 10) {
          recommendations.push('Low hire rate - consider adjusting candidate criteria or interview process');
        }
        
        if (averageTimeToHire > 21) {
          recommendations.push('Long hiring process - consider streamlining interview and decision process');
        }
        
        if (job.status === 'active' && totalApplications === 0) {
          const daysSinceCreated = Math.floor(
            (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceCreated > 7) {
            recommendations.push('No applications received - consider revising job posting or promoting it');
          }
        }

        // Get last application date
        const lastApplicationDate = applications.length > 0
          ? applications.reduce((latest, app) => 
              new Date(app.appliedAt) > new Date(latest) ? app.appliedAt : latest
            , applications[0].appliedAt)
          : null;

        return {
          job: {
            ...job,
            id: job._id.toString(),
            applicationsCount: totalApplications,
            viewsCount,
            hiredCount,
            averageTimeToHire,
            conversionRate,
            hireRate,
            lastApplicationDate,
            performanceScore,
            trend,
            recommendations,
          }
        };
      })
    );

    // Calculate benchmarks
    const totalJobs = jobPerformances.length;
    const averagePerformanceScore = totalJobs > 0
      ? jobPerformances.reduce((sum, jp) => sum + jp.job.performanceScore, 0) / totalJobs
      : 0;

    const benchmarks = {
      averageApplicationsPerJob: totalJobs > 0
        ? jobPerformances.reduce((sum, jp) => sum + jp.job.applicationsCount, 0) / totalJobs
        : 0,
      averageConversionRate: totalJobs > 0
        ? jobPerformances.reduce((sum, jp) => sum + jp.job.conversionRate, 0) / totalJobs
        : 0,
      averageHireRate: totalJobs > 0
        ? jobPerformances.reduce((sum, jp) => sum + jp.job.hireRate, 0) / totalJobs
        : 0,
      averageTimeToHire: totalJobs > 0
        ? jobPerformances.reduce((sum, jp) => sum + jp.job.averageTimeToHire, 0) / totalJobs
        : 0,
    };

    // Separate top and under performers
    const sortedByScore = jobPerformances.sort((a, b) => b.job.performanceScore - a.job.performanceScore);
    const topPerformers = sortedByScore.filter(jp => jp.job.performanceScore >= 60);
    const underPerformers = sortedByScore.filter(jp => jp.job.performanceScore < 60);

    const metrics = {
      totalJobs,
      averagePerformanceScore,
      topPerformers,
      underPerformers,
      benchmarks,
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching job performance metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}