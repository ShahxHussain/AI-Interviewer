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
          <div className="max-w-4xl mx-auto text-center luxury-container p-6">
            <div className="luxury-card p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
                  <svg
                    className="w-8 h-8 text-yellow-400"
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
                <h2 className="text-2xl font-bold luxury-text-gold mb-2">
                  Ready to Start!
                </h2>
                <p className="luxury-text-secondary">
                  Your interview has been configured. Review your settings below
                  and start when ready.
                </p>
              </div>

              {/* Configuration Summary */}
              <div className="rounded-xl p-6 mb-6 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20">
                <h3 className="text-lg font-bold luxury-text-gold mb-4">
                  Interview Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium luxury-text-primary">
                        Interviewer:
                      </span>
                      <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30">
                        {selectedInterviewer?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium luxury-text-primary">Type:</span>
                      <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30">
                        {selectedType?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium luxury-text-primary">
                        Difficulty:
                      </span>
                      <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-400 border border-blue-400/30">
                        {interviewSettings?.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium luxury-text-primary">Focus:</span>
                      <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-purple-400/20 to-purple-600/20 text-purple-400 border border-purple-400/30">
                        {interviewSettings?.topicFocus === 'dsa'
                          ? 'DSA'
                          : interviewSettings?.topicFocus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium luxury-text-primary">
                        Purpose:
                      </span>
                      <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 text-orange-400 border border-orange-400/30">
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
                  className="luxury-button-secondary px-6 py-2"
                >
                  Modify Settings
                </button>
                <button
                  onClick={handleStartInterview}
                  className="luxury-button-primary px-8 py-2 font-medium"
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
