'use client';

import React, { useState } from 'react';
import { ModernDashboardLayout } from '@/components/layout/ModernDashboardLayout';
import { InterviewSelection } from '@/components/interview/InterviewSelection';
import { CustomizationPanel } from '@/components/interview/CustomizationPanel';
import { InterviewSession } from '@/components/interview/InterviewSession';
import { InterviewComplete } from '@/components/interview/InterviewComplete';
import { ComprehensiveFeedbackComponent } from '@/components/interview/ComprehensiveFeedback';
import {
  InterviewerType,
  InterviewType,
  InterviewSettings,
  InterviewConfiguration,
  InterviewSession as IInterviewSession,
  ParsedResumeData,
} from '@/types';
import { SessionService } from '@/lib/services/session-service';
import { useRouter } from 'next/navigation';

type InterviewSetupStep =
  | 'selection'
  | 'customization'
  | 'ready'
  | 'session'
  | 'complete';

export default function InterviewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] =
    useState<InterviewSetupStep>('selection');
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<InterviewerType | null>(null);
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [interviewSettings, setInterviewSettings] =
    useState<InterviewSettings | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [completedSession, setCompletedSession] =
    useState<IInterviewSession | null>(null);

  const handleSelectionComplete = (
    interviewer: InterviewerType,
    type: InterviewType
  ) => {
    setSelectedInterviewer(interviewer);
    setSelectedType(type);
    setCurrentStep('customization');
  };

  const handleCustomizationComplete = (settings: InterviewSettings) => {
    setInterviewSettings(settings);
    setCurrentStep('ready');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
  };

  const handleBackToCustomization = () => {
    setCurrentStep('customization');
  };

  const handleStartInterview = () => {
    setCurrentStep('session');
  };

  const handleSessionComplete = async (session: IInterviewSession) => {
    try {
      await SessionService.saveSession(session);
      setCompletedSession(session);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save session:', error);
      // Still show completion screen even if save fails
      setCompletedSession(session);
      setCurrentStep('complete');
    }
  };

  const handleExitSession = () => {
    setCurrentStep('ready');
  };

  const handleRetakeInterview = () => {
    setCurrentStep('ready');
    setCompletedSession(null);
  };

  const handleBackToHome = () => {
    router.push('/dashboard');
  };

  const handleDownloadReport = () => {
    if (!completedSession) return;

    const report = SessionService.generateSessionReport(completedSession);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${completedSession.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const buildInterviewConfiguration = (): InterviewConfiguration => {
    if (!selectedInterviewer || !selectedType || !interviewSettings) {
      throw new Error('Interview configuration is incomplete');
    }

    return {
      interviewer: selectedInterviewer,
      type: selectedType,
      settings: interviewSettings,
      resumeData: resumeData || undefined,
    };
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <InterviewSelection onSelectionComplete={handleSelectionComplete} />
        );
      case 'customization':
        return (
          <CustomizationPanel
            onCustomizationComplete={handleCustomizationComplete}
            onBack={handleBackToSelection}
          />
        );
      case 'ready':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Start!
                </h2>
                <p className="text-gray-600">
                  Your interview has been configured. Review your settings below
                  and start when ready.
                </p>
              </div>

              {/* Configuration Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Interview Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Interviewer:
                      </span>
                      <span className="capitalize">
                        {selectedInterviewer?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="capitalize">
                        {selectedType?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Difficulty:
                      </span>
                      <span className="capitalize">
                        {interviewSettings?.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Focus:</span>
                      <span className="capitalize">
                        {interviewSettings?.topicFocus === 'dsa'
                          ? 'DSA'
                          : interviewSettings?.topicFocus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Purpose:
                      </span>
                      <span className="capitalize">
                        {interviewSettings?.purpose}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleBackToCustomization}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Modify Settings
                </button>
                <button
                  onClick={handleStartInterview}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        );
      case 'session':
        try {
          const config = buildInterviewConfiguration();
          return (
            <InterviewSession
              config={config}
              onSessionComplete={handleSessionComplete}
              onExit={handleExitSession}
            />
          );
        } catch (error) {
          console.error('Failed to build interview configuration:', error);
          setCurrentStep('ready');
          return null;
        }
      case 'complete':
        if (!completedSession) {
          setCurrentStep('ready');
          return null;
        }
        return (
          <ComprehensiveFeedbackComponent
            session={completedSession}
            onRetakeInterview={handleRetakeInterview}
            onBackToHome={handleBackToHome}
            onDownloadReport={handleDownloadReport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModernDashboardLayout>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {renderCurrentStep()}
      </div>
    </ModernDashboardLayout>
  );
}
