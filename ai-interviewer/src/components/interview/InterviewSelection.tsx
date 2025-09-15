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
    <div className="max-w-6xl mx-auto luxury-container p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${
              step === 'interviewer' ? 'luxury-text-gold' : 'text-green-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'interviewer'
                  ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                  : 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30'
              }`}
            >
              1
            </div>
            <span className="font-medium">Choose Interviewer</span>
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-yellow-400/30 to-yellow-600/30"></div>

          <div
            className={`flex items-center space-x-2 ${
              step === 'type' ? 'luxury-text-gold' : 'luxury-text-secondary'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'type'
                  ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                  : selectedType
                    ? 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30'
                    : 'bg-gray-600 text-gray-400'
              }`}
            >
              2
            </div>
            <span className="font-medium">Interview Type</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="luxury-card p-8">
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
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-yellow-400/30">
          <button
            onClick={handleBack}
            className="luxury-button-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {step === 'interviewer' ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="luxury-button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!isComplete}
                className="luxury-button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Customization</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedInterviewer || selectedType) && (
        <div className="mt-6 rounded-xl p-4 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20">
          <h4 className="text-sm font-bold luxury-text-gold mb-2">
            Current Selection:
          </h4>
          <div className="flex items-center space-x-4 text-sm luxury-text-secondary">
            {selectedInterviewer && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Interviewer:</span>
                <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30">
                  {selectedInterviewer.replace('-', ' ')}
                </span>
              </div>
            )}
            {selectedType && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Type:</span>
                <span className="capitalize px-2 py-1 rounded-full bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30">
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
