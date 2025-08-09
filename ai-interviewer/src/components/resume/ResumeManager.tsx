'use client';

import React, { useState } from 'react';
import { ResumeUpload } from './ResumeUpload';
import { ParsedResumeDisplay } from './ParsedResumeDisplay';
import { ParsedResumeData } from '@/types';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface ResumeManagerProps {
  currentResumeUrl?: string;
  onResumeChange?: (resumeUrl: string) => void;
  onParsedDataChange?: (parsedData: ParsedResumeData | null) => void;
  className?: string;
  showParsedData?: boolean;
}

export function ResumeManager({
  currentResumeUrl,
  onResumeChange,
  onParsedDataChange,
  className = '',
  showParsedData = true,
}: ResumeManagerProps) {
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUploadComplete = (resumeUrl: string) => {
    setError(null);
    setSuccess('Resume uploaded successfully!');
    onResumeChange?.(resumeUrl);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);

    // Clear error message after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleParseComplete = (data: ParsedResumeData) => {
    setParsedData(data);
    setError(null);
    setSuccess('Resume parsed successfully!');
    onParsedDataChange?.(data);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleParseError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
    setParsedData(null);
    onParsedDataChange?.(null);

    // Clear error message after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resume Upload Section */}
      <div>
        <ResumeUpload
          currentResumeUrl={currentResumeUrl}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onParseComplete={handleParseComplete}
          showParseButton={true}
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Parsed Resume Data Display */}
      {showParsedData && parsedData && (
        <div>
          <ParsedResumeDisplay parsedData={parsedData} />
        </div>
      )}

      {/* Instructions */}
      {!currentResumeUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Upload Your Resume
              </h4>
              <p className="text-sm text-blue-700">
                Upload your resume in PDF or DOCX format to get personalized
                interview questions based on your experience and skills. The AI
                will analyze your resume and create tailored questions for your
                interview practice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parsing Instructions */}
      {currentResumeUrl && !parsedData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Parse Your Resume
              </h4>
              <p className="text-sm text-yellow-700">
                Click the &quot;Parse&quot; button to analyze your resume
                content. This will extract your skills, experience, education,
                and projects to create personalized interview questions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
