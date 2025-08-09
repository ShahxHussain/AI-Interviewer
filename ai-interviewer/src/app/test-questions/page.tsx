'use client';

import React from 'react';
import { QuestionGenerator } from '@/components/interview/QuestionGenerator';
import { InterviewConfiguration } from '@/types';

export default function TestQuestionsPage() {
  // Sample configuration for testing
  const sampleConfig: InterviewConfiguration = {
    interviewer: 'tech-lead',
    type: 'technical',
    settings: {
      difficulty: 'moderate',
      topicFocus: 'dsa',
      purpose: 'placement',
    },
    resumeData: {
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      experience: [
        {
          company: 'Tech Corp',
          position: 'Software Engineer',
          duration: '2 years',
          description: 'Developed web applications using React and Node.js',
        },
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          year: '2022',
        },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce application',
          technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
          url: 'https://github.com/user/ecommerce',
        },
      ],
      rawText: 'Sample resume text...',
    },
  };

  const handleQuestionsGenerated = (questions: any[], sessionId: string) => {
    console.log('Questions generated:', questions);
    console.log('Session ID:', sessionId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Question Generation Test</h1>

        <QuestionGenerator
          config={sampleConfig}
          onQuestionsGenerated={handleQuestionsGenerated}
        />
      </div>
    </div>
  );
}
