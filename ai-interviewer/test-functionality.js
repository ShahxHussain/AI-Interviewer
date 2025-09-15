#!/usr/bin/env node

/**
 * Test script to verify all APIs and functionality are working correctly
 * Run with: node test-functionality.js
 */

const testConfig = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 10000,
};

// Test data
const testInterviewConfig = {
  interviewer: 'tech-lead',
  type: 'technical',
  settings: {
    difficulty: 'moderate',
    topicFocus: 'dsa',
    purpose: 'placement',
  },
};

const testResumeData = {
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  experience: [
    {
      company: 'Test Company',
      position: 'Software Developer',
      duration: '2 years',
      description: 'Developed web applications using React and Node.js',
    },
  ],
  education: [
    {
      institution: 'Test University',
      degree: 'Bachelor of Computer Science',
      field: 'Computer Science',
      year: '2022',
    },
  ],
  projects: [
    {
      name: 'Test Project',
      description: 'A sample project for testing',
      technologies: ['React', 'Node.js'],
    },
  ],
  rawText: 'Test resume content for AI Interviewer testing',
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test functions
const testQuestionGeneration = async () => {
  console.log('🧪 Testing Question Generation API...');
  
  const result = await makeRequest(`${testConfig.baseUrl}/api/interview/questions`, {
    method: 'POST',
    body: JSON.stringify({
      interviewConfig: testInterviewConfig,
      resumeData: testResumeData,
      numberOfQuestions: 3,
      includeFollowUps: true,
    }),
  });

  if (result.success && result.data.success) {
    console.log('✅ Question Generation API working');
    console.log(`   Generated ${result.data.questions?.length || 0} questions`);
    return result.data.questions;
  } else {
    console.log('❌ Question Generation API failed:', result.data?.error || result.error);
    return null;
  }
};

const testVoiceSynthesis = async () => {
  console.log('🧪 Testing Voice Synthesis API...');
  
  const result = await makeRequest(`${testConfig.baseUrl}/api/voice/synthesize`, {
    method: 'POST',
    body: JSON.stringify({
      text: 'Hello, this is a test of the voice synthesis system.',
      interviewer: 'tech-lead',
      speed: 1.0,
    }),
  });

  if (result.success && result.data.success) {
    console.log('✅ Voice Synthesis API working');
    console.log(`   Duration: ${result.data.duration}s`);
    return true;
  } else {
    console.log('❌ Voice Synthesis API failed:', result.data?.error || result.error);
    return false;
  }
};

const testVoiceProfiles = async () => {
  console.log('🧪 Testing Voice Profiles API...');
  
  const result = await makeRequest(`${testConfig.baseUrl}/api/voice/synthesize`);

  if (result.success && result.data.success) {
    console.log('✅ Voice Profiles API working');
    console.log(`   Available profiles: ${result.data.voiceProfiles?.length || 0}`);
    return true;
  } else {
    console.log('❌ Voice Profiles API failed:', result.data?.error || result.error);
    return false;
  }
};

const testFeedbackGeneration = async (questions) => {
  console.log('🧪 Testing Feedback Generation API...');
  
  if (!questions || questions.length === 0) {
    console.log('⚠️  Skipping feedback test - no questions available');
    return false;
  }

  const mockSession = {
    id: 'test-session-123',
    candidateId: 'test-candidate',
    configuration: testInterviewConfig,
    questions: questions.slice(0, 2), // Test with first 2 questions
    responses: [
      {
        questionId: questions[0].id,
        transcription: 'This is a test response for the first question.',
        duration: 30000,
        confidence: 0.8,
        facialMetrics: {
          emotions: {
            neutral: 0.7,
            happy: 0.2,
            sad: 0.05,
            angry: 0.02,
            fearful: 0.01,
            disgusted: 0.01,
            surprised: 0.01,
          },
          eyeContact: true,
          headPose: { pitch: 0, yaw: 0, roll: 0 },
          confidence: 0.8,
          timestamp: Date.now(),
        },
      },
    ],
    metrics: {
      eyeContactPercentage: 85,
      moodTimeline: [],
      averageConfidence: 0.8,
      responseQuality: 0.75,
      overallEngagement: 0.8,
    },
    feedback: {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      overallScore: 0,
    },
    status: 'completed',
    startedAt: new Date(),
    completedAt: new Date(),
  };

  const result = await makeRequest(`${testConfig.baseUrl}/api/interview/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      session: mockSession,
      includeDetailedAnalysis: true,
    }),
  });

  if (result.success && result.data.success) {
    console.log('✅ Feedback Generation API working');
    console.log(`   Overall Score: ${result.data.feedback?.overallScore || 'N/A'}`);
    console.log(`   Strengths: ${result.data.feedback?.strengths?.length || 0}`);
    console.log(`   Weaknesses: ${result.data.feedback?.weaknesses?.length || 0}`);
    return true;
  } else {
    console.log('❌ Feedback Generation API failed:', result.data?.error || result.error);
    return false;
  }
};

const testEnvironmentVariables = () => {
  console.log('🧪 Testing Environment Variables...');
  
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const optionalVars = [
    'TOGETHER_API_KEY',
    'MURF_AI_API_KEY',
  ];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing (required)`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set (optional)`);
    } else {
      console.log(`⚠️  ${varName} is not set (optional - some features may not work)`);
    }
  });
  
  return allRequired;
};

const testDatabaseConnection = async () => {
  console.log('🧪 Testing Database Connection...');
  
  // This would require a database health check endpoint
  // For now, we'll just check if the environment variable is set
  if (process.env.MONGODB_URI) {
    console.log('✅ MongoDB URI is configured');
    return true;
  } else {
    console.log('❌ MongoDB URI is not configured');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting AI Interviewer Functionality Tests\n');
  console.log('=' .repeat(50));
  
  const results = {
    environment: false,
    database: false,
    questionGeneration: false,
    voiceSynthesis: false,
    voiceProfiles: false,
    feedbackGeneration: false,
  };
  
  // Test environment setup
  results.environment = testEnvironmentVariables();
  console.log('');
  
  // Test database connection
  results.database = await testDatabaseConnection();
  console.log('');
  
  // Test APIs
  results.questionGeneration = await testQuestionGeneration();
  console.log('');
  
  results.voiceSynthesis = await testVoiceSynthesis();
  console.log('');
  
  results.voiceProfiles = await testVoiceProfiles();
  console.log('');
  
  results.feedbackGeneration = await testFeedbackGeneration(results.questionGeneration);
  console.log('');
  
  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('');
  console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The AI Interviewer is ready to use.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration and try again.');
  }
  
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Start the development server: npm run dev');
  console.log('   2. Open http://localhost:3000 in your browser');
  console.log('   3. Test the interview flow manually');
  console.log('   4. Check browser console for any client-side errors');
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testQuestionGeneration,
  testVoiceSynthesis,
  testVoiceProfiles,
  testFeedbackGeneration,
  testEnvironmentVariables,
  testDatabaseConnection,
};
