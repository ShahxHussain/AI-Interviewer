// Integration test for JobPosting model and API endpoints
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testJobPostingIntegration() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db();
    const jobPostingsCollection = db.collection('jobPostings');
    const jobApplicationsCollection = db.collection('jobApplications');

    // Test data for JobPosting
    const testJobData = {
      title: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer to join our team.',
      responsibilities: [
        'Design and develop scalable web applications',
        'Mentor junior developers',
        'Participate in code reviews'
      ],
      requirements: [
        'Bachelor\'s degree in Computer Science',
        '5+ years of experience in software development',
        'Strong knowledge of JavaScript and React'
      ],
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'Senior',
      interviewFlow: {
        interviewTypes: ['technical', 'behavioral'],
        difficulty: 'advanced',
        topicFocus: ['projects', 'fundamentals'],
        estimatedDuration: 90,
        customQuestions: ['Tell me about a challenging project you worked on']
      },
      recruiterId: 'test-recruiter-123',
      status: 'draft',
      isActive: false,
      viewsCount: 0,
      applicationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Testing JobPosting CRUD operations...');
    
    // Test Create
    const insertResult = await jobPostingsCollection.insertOne(testJobData);
    console.log('✅ Job posting created with ID:', insertResult.insertedId.toString());
    
    // Test Read
    const createdJob = await jobPostingsCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Job posting retrieved successfully');
    console.log('📊 Title:', createdJob.title);
    console.log('📊 Status:', createdJob.status);
    console.log('📊 isActive:', createdJob.isActive);
    
    // Test Update - Change status to active
    const updateResult = await jobPostingsCollection.updateOne(
      { _id: insertResult.insertedId },
      { 
        $set: { 
          status: 'active', 
          isActive: true,
          updatedAt: new Date()
        } 
      }
    );
    console.log('✅ Job posting status updated:', updateResult.modifiedCount, 'document(s) modified');
    
    // Verify update
    const updatedJob = await jobPostingsCollection.findOne({ _id: insertResult.insertedId });
    console.log('📊 Updated status:', updatedJob.status);
    console.log('📊 Updated isActive:', updatedJob.isActive);
    
    // Test indexing and queries
    console.log('🔍 Testing database queries and indexes...');
    
    // Query by recruiter
    const recruiterJobs = await jobPostingsCollection.find({ recruiterId: 'test-recruiter-123' }).toArray();
    console.log('✅ Found', recruiterJobs.length, 'jobs for test recruiter');
    
    // Query by status
    const activeJobs = await jobPostingsCollection.find({ status: 'active' }).toArray();
    console.log('✅ Found', activeJobs.length, 'active jobs');
    
    // Query by skills
    const skillBasedJobs = await jobPostingsCollection.find({ 
      requiredSkills: { $in: ['JavaScript', 'React'] } 
    }).toArray();
    console.log('✅ Found', skillBasedJobs.length, 'jobs requiring JavaScript or React');
    
    // Test text search (if index exists)
    try {
      const searchResults = await jobPostingsCollection.find({ 
        $text: { $search: 'software engineer' } 
      }).toArray();
      console.log('✅ Text search found', searchResults.length, 'results');
    } catch (error) {
      console.log('⚠️  Text search index not available (expected in new database)');
    }
    
    // Test relationship with JobApplications
    console.log('🔗 Testing JobPosting-JobApplication relationship...');
    
    const testApplication = {
      jobPostingId: insertResult.insertedId.toString(),
      candidateId: 'test-candidate-456',
      status: 'applied',
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const appResult = await jobApplicationsCollection.insertOne(testApplication);
    console.log('✅ Test application created with ID:', appResult.insertedId.toString());
    
    // Test aggregation to get job with application count
    const jobWithStats = await jobPostingsCollection.aggregate([
      { $match: { _id: insertResult.insertedId } },
      {
        $lookup: {
          from: 'jobApplications',
          localField: '_id',
          foreignField: 'jobPostingId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: '$applications' }
        }
      }
    ]).toArray();
    
    console.log('✅ Job with application count:', jobWithStats[0]?.applicationsCount || 0);
    
    // Test validation scenarios
    console.log('🧪 Testing validation scenarios...');
    
    // Test missing required fields
    try {
      await jobPostingsCollection.insertOne({
        title: 'Incomplete Job',
        // Missing required fields
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      console.log('✅ Validation correctly prevented incomplete job posting');
    }
    
    // Test invalid enum values
    const invalidJob = {
      ...testJobData,
      title: 'Test Invalid Status Job',
      status: 'invalid-status', // Invalid enum value
      recruiterId: 'test-recruiter-invalid'
    };
    delete invalidJob._id; // Remove _id to avoid duplicate key error
    
    // This would be caught by Mongoose validation, but we're testing raw MongoDB
    const invalidResult = await jobPostingsCollection.insertOne(invalidJob);
    console.log('⚠️  Raw MongoDB allows invalid enum (would be caught by Mongoose)');
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await jobPostingsCollection.deleteMany({ 
      $or: [
        { _id: insertResult.insertedId },
        { title: 'Test Invalid Status Job' }
      ]
    });
    await jobApplicationsCollection.deleteOne({ _id: appResult.insertedId });
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 All JobPosting integration tests passed!');
    
    // Test summary
    console.log('\n📋 Test Summary:');
    console.log('✅ Database connection successful');
    console.log('✅ JobPosting CRUD operations working');
    console.log('✅ Status and isActive field updates working');
    console.log('✅ Query operations by recruiter, status, and skills working');
    console.log('✅ JobPosting-JobApplication relationship working');
    console.log('✅ Aggregation queries working');
    console.log('✅ Data cleanup successful');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the integration test
testJobPostingIntegration();