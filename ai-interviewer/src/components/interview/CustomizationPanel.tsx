'use client';

import React, { useState } from 'react';
import {
  DifficultyLevel,
  TopicFocus,
  InterviewPurpose,
  InterviewSettings,
} from '@/types';
import { DifficultySelector } from './DifficultySelector';
import { TopicFocusSelector } from './TopicFocusSelector';
import { PurposeSelector } from './PurposeSelector';
import { Button } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, Settings, CheckCircle } from 'lucide-react';

interface CustomizationPanelProps {
  onCustomizationComplete: (settings: InterviewSettings) => void;
  onBack?: () => void;
}

export function CustomizationPanel({
  onCustomizationComplete,
  onBack,
}: CustomizationPanelProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<TopicFocus | null>(null);
  const [selectedPurpose, setSelectedPurpose] =
    useState<InterviewPurpose | null>(null);
  const [currentStep, setCurrentStep] = useState<
    'difficulty' | 'focus' | 'purpose'
  >('difficulty');

  const steps = [
    {
      key: 'difficulty',
      label: 'Difficulty Level',
      completed: !!selectedDifficulty,
    },
    { key: 'focus', label: 'Topic Focus', completed: !!selectedFocus },
    {
      key: 'purpose',
      label: 'Interview Purpose',
      completed: !!selectedPurpose,
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const canProceed = getCurrentStepSelection();
  const isComplete = selectedDifficulty && selectedFocus && selectedPurpose;

  function getCurrentStepSelection() {
    switch (currentStep) {
      case 'difficulty':
        return selectedDifficulty;
      case 'focus':
        return selectedFocus;
      case 'purpose':
        return selectedPurpose;
      default:
        return false;
    }
  }

  const handleNext = () => {
    if (currentStep === 'difficulty' && selectedDifficulty) {
      setCurrentStep('focus');
    } else if (currentStep === 'focus' && selectedFocus) {
      setCurrentStep('purpose');
    }
  };

  const handleBack = () => {
    if (currentStep === 'purpose') {
      setCurrentStep('focus');
    } else if (currentStep === 'focus') {
      setCurrentStep('difficulty');
    } else if (onBack) {
      onBack();
    }
  };

  const handleComplete = () => {
    if (isComplete) {
      onCustomizationComplete({
        difficulty: selectedDifficulty!,
        topicFocus: selectedFocus!,
        purpose: selectedPurpose!,
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'difficulty':
        return (
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />
        );
      case 'focus':
        return (
          <TopicFocusSelector
            selectedFocus={selectedFocus}
            onSelect={setSelectedFocus}
          />
        );
      case 'purpose':
        return (
          <PurposeSelector
            selectedPurpose={selectedPurpose}
            onSelect={setSelectedPurpose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto luxury-container p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Settings className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold luxury-text-gold">
            Customize Your Interview
          </h2>
        </div>
        <p className="luxury-text-secondary max-w-2xl mx-auto">
          Tailor your interview experience by selecting your preferred
          difficulty level, topic focus, and interview purpose to get the most
          relevant practice.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = step.completed;
            const isPast = index < currentStepIndex;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center space-x-2 ${isActive
                    ? 'luxury-text-gold'
                    : isCompleted
                      ? 'text-green-400'
                      : 'luxury-text-secondary'
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isActive
                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                      : isCompleted
                        ? 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30'
                        : 'bg-gray-600 text-gray-400'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="font-medium text-sm hidden sm:block">
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-px ${isPast ? 'bg-gradient-to-r from-green-400/50 to-green-600/50' : 'bg-gradient-to-r from-yellow-400/30 to-yellow-600/30'}`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="luxury-card p-8">
        {renderCurrentStep()}

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
            {currentStep !== 'purpose' ? (
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
                <span>Start Interview</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      {(selectedDifficulty || selectedFocus || selectedPurpose) && (
        <div className="mt-6 rounded-xl p-6 bg-gradient-to-r from-yellow-400/5 to-yellow-600/5 border border-yellow-400/20">
          <h4 className="text-sm font-bold luxury-text-gold mb-4 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Current Configuration:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {selectedDifficulty && (
              <div className="flex items-center space-x-2">
                <span className="font-medium luxury-text-primary">Difficulty:</span>
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30">
                  {selectedDifficulty}
                </span>
              </div>
            )}
            {selectedFocus && (
              <div className="flex items-center space-x-2">
                <span className="font-medium luxury-text-primary">Focus:</span>
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-400 border border-green-400/30">
                  {selectedFocus === 'dsa'
                    ? 'DSA'
                    : selectedFocus.replace('-', ' ')}
                </span>
              </div>
            )}
            {selectedPurpose && (
              <div className="flex items-center space-x-2">
                <span className="font-medium luxury-text-primary">Purpose:</span>
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-400 border border-blue-400/30">
                  {selectedPurpose}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
