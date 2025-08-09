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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Customize Your Interview
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
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
                  className={`flex items-center space-x-2 ${
                    isActive
                      ? 'text-blue-600'
                      : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
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
                    className={`w-8 h-px ${isPast ? 'bg-green-300' : 'bg-gray-300'}`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {renderCurrentStep()}

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
            {currentStep !== 'purpose' ? (
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
                <span>Start Interview</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      {(selectedDifficulty || selectedFocus || selectedPurpose) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Current Configuration:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {selectedDifficulty && (
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Difficulty:</span>
                <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {selectedDifficulty}
                </span>
              </div>
            )}
            {selectedFocus && (
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Focus:</span>
                <span className="capitalize px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {selectedFocus === 'dsa'
                    ? 'DSA'
                    : selectedFocus.replace('-', ' ')}
                </span>
              </div>
            )}
            {selectedPurpose && (
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Purpose:</span>
                <span className="capitalize px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
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
