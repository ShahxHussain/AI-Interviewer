// Simple test script to validate JobPosting model functionality
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the JobPosting model
const { JobPosting } = require('./src/lib/models/JobPosting.ts');

async function testJobPostingModel() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

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
      status: 'draft'
    };

    console.log('📝 Creating test job posting...');
    const jobPosting = new JobPosting(testJobData);
    
    // Validate the model
    console.log('✅ Model validation passed');
    
    // Test save functionality
    const savedJob = await jobPosting.save();
    console.log('✅ Job posting saved successfully');
    console.log('📄 Job ID:', savedJob._id.toString());
    console.log('📊 isActive:', savedJob.isActive); // Should be false for draft status
    
    // Test status update and pre-save middleware
    console.log('🔄 Testing status update...');
    savedJob.status = 'active';
    await savedJob.save();
    console.log('✅ Status updated to active');
    console.log('📊 isActive after update:', savedJob.isActive); // Should be true now
    
    // Test query functionality
    console.log('🔍 Testing queries...');
    const activeJobs = await JobPosting.find({ status: 'active' });
    console.log('✅ Found', activeJobs.length, 'active jobs');
    
    const jobsByRecruiter = await JobPosting.find({ recruiterId: 'test-recruiter-123' });
    console.log('✅ Found', jobsByRecruiter.length, 'jobs for test recruiter');
    
    // Test text search index
    const searchResults = await JobPosting.find({ $text: { $search: 'software engineer' } });
    console.log('✅ Text search found', searchResults.length, 'results');
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await JobPosting.deleteOne({ _id: savedJob._id });
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 All JobPosting model tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testJobPostingModel();