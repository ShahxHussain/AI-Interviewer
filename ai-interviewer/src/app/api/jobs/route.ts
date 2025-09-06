import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { JobPosting } from '@/types';
import { ObjectId } from 'mongodb';

// GET /api/jobs - Get all active job postings (for job board)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const experienceLevel = searchParams.get('experienceLevel');
    const search = searchParams.get('search');

    // Build query
    const query: any = { 
      isActive: true, 
      status: 'active' 
    };

    if (skills.length > 0) {
      query.requiredSkills = { $in: skills };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get jobs with pagination
    const jobs = await db
      .collection('jobPostings')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await db.collection('jobPostings').countDocuments(query);

    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await db
          .collection('jobApplications')
          .countDocuments({ jobPostingId: job._id.toString() });

        return {
          ...job,
          id: job._id.toString(),
          applicationsCount,
          viewsCount: job.viewsCount || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job posting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Validate required fields
    const requiredFields = ['title', 'description', 'responsibilities', 'requirements', 'requiredSkills', 'experienceLevel', 'recruiterId'];
    for (const field of requiredFields) {
      if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const jobPosting = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewsCount: 0,
      applicationsCount: 0,
    };

    const result = await db.collection('jobPostings').insertOne(jobPosting);

    const createdJob = {
      ...jobPosting,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({
      success: true,
      job: createdJob,
      message: 'Job posting created successfully',
    });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}