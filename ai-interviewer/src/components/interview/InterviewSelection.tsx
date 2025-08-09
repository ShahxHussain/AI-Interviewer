'use client';

import React, { useState } from 'react';
import { InterviewerType, InterviewType } from '@/types';
import { InterviewerSelection } from './InterviewerSelection';
import { InterviewTypeSelection } from './InterviewTypeSelection';
import { Button } from '@/components/ui/form';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface InterviewSelectionProps {
  onSelectionComplete: (
    interviewer: InterviewerType,
    type: InterviewType
  ) => void;
  onBack?: () => void;
}

export function InterviewSelection({
  onSelectionComplete,
  onBack,
}: InterviewSelectionProps) {
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<InterviewerType | null>(null);
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [step, setStep] = useState<'interviewer' | 'type'>('interviewer');

  const handleInterviewerSelect = (interviewer: InterviewerType) => {
    setSelectedInterviewer(interviewer);
  };

  const handleTypeSelect = (type: InterviewType) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    if (step === 'interviewer' && selectedInterviewer) {
      setStep('type');
    }
  };

  const handleBack = () => {
    if (step === 'type') {
      setStep('interviewer');
    } else if (onBack) {
      onBack();
    }
  };

  const handleComplete = () => {
    if (selectedInterviewer && selectedType) {
      onSelectionComplete(selectedInterviewer, selectedType);
    }
  };

  const canProceed =
    step === 'interviewer' ? selectedInterviewer : selectedType;
  const isComplete = selectedInterviewer && selectedType;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${
              step === 'interviewer' ? 'text-blue-600' : 'text-green-600'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'interviewer'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              1
            </div>
            <span className="font-medium">Choose Interviewer</span>
          </div>

          <div className="w-8 h-px bg-gray-300"></div>

          <div
            className={`flex items-center space-x-2 ${
              step === 'type' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'type'
                  ? 'bg-blue-100 text-blue-600'
                  : selectedType
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              2
            </div>
            <span className="font-medium">Interview Type</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {step === 'interviewer' ? (
          <InterviewerSelection
            selectedInterviewer={selectedInterviewer}
            onSelect={handleInterviewerSelect}
          />
        ) : (
          <InterviewTypeSelection
            selectedType={selectedType}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-3">
            {step === 'interviewer' ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!isComplete}
                className="flex items-center space-x-2"
              >
                <span>Continue to Customization</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedInterviewer || selectedType) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Current Selection:
          </h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {selectedInterviewer && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Interviewer:</span>
                <span className="capitalize">
                  {selectedInterviewer.replace('-', ' ')}
                </span>
              </div>
            )}
            {selectedType && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Type:</span>
                <span className="capitalize">
                  {selectedType.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
