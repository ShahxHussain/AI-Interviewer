'use client';

import React from 'react';
import { InterviewPurpose } from '@/types';
import {
  GraduationCap,
  Building,
  Target,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';

interface PurposeSelectorProps {
  selectedPurpose: InterviewPurpose | null;
  onSelect: (purpose: InterviewPurpose) => void;
}

const purposeOptions = [
  {
    purpose: 'internship' as InterviewPurpose,
    name: 'Internship',
    description:
      'Preparing for internship interviews with entry-level expectations',
    icon: GraduationCap,
    color: 'green',
    characteristics: [
      'Academic project focus',
      'Learning potential assessment',
      'Basic technical skills',
      'Enthusiasm and curiosity',
    ],
    expectations: [
      'Foundational knowledge',
      'Problem-solving approach',
      'Willingness to learn',
      'Communication skills',
    ],
    duration: '30-45 minutes',
    commonQuestions: [
      'Academic projects',
      'Programming fundamentals',
      'Career interests',
      'Learning goals',
    ],
  },
  {
    purpose: 'placement' as InterviewPurpose,
    name: 'Full-time Placement',
    description: 'Comprehensive preparation for full-time job interviews',
    icon: Building,
    color: 'blue',
    characteristics: [
      'Professional experience',
      'Technical depth',
      'System design knowledge',
      'Leadership potential',
    ],
    expectations: [
      'Industry experience',
      'Advanced problem solving',
      'Technical expertise',
      'Team collaboration',
    ],
    duration: '45-90 minutes',
    commonQuestions: [
      'Work experience',
      'Complex algorithms',
      'System architecture',
      'Project leadership',
    ],
  },
  {
    purpose: 'general' as InterviewPurpose,
    name: 'General Practice',
    description:
      'Flexible interview practice for skill improvement and confidence building',
    icon: Target,
    color: 'purple',
    characteristics: [
      'Skill assessment',
      'Confidence building',
      'Interview techniques',
      'Performance feedback',
    ],
    expectations: [
      'Varied difficulty levels',
      'Comprehensive feedback',
      'Skill improvement',
      'Interview readiness',
    ],
    duration: '30-60 minutes',
    commonQuestions: [
      'Mixed difficulty levels',
      'Various topic areas',
      'Behavioral scenarios',
      'Technical challenges',
    ],
  },
];

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBg: 'bg-green-100',
    selectedBorder: 'border-green-500',
    icon: 'text-green-600',
    selectedIcon: 'text-green-700',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
    accent: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-100',
    selectedBorder: 'border-blue-500',
    icon: 'text-blue-600',
    selectedIcon: 'text-blue-700',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    selectedBg: 'bg-purple-100',
    selectedBorder: 'border-purple-500',
    icon: 'text-purple-600',
    selectedIcon: 'text-purple-700',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
    accent: 'text-purple-600',
  },
};

export function PurposeSelector({
  selectedPurpose,
  onSelect,
}: PurposeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Interview Purpose
        </h3>
        <p className="text-sm text-gray-600">
          What type of opportunity are you preparing for?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {purposeOptions.map(option => {
          const isSelected = selectedPurpose === option.purpose;
          const colors =
            colorClasses[option.color as keyof typeof colorClasses];
          const Icon = option.icon;

          return (
            <button
              key={option.purpose}
              onClick={() => onSelect(option.purpose)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? `${colors.selectedBg} ${colors.selectedBorder} shadow-md`
                  : `${colors.bg} ${colors.border} hover:${colors.selectedBorder}`
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon
                    className={`h-6 w-6 ${isSelected ? colors.selectedIcon : colors.icon}`}
                  />
                </div>
                <div>
                  <h4 className={`font-semibold text-lg ${colors.text}`}>
                    {option.name}
                  </h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {option.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {option.description}
              </p>

              {/* Characteristics */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Key Focus Areas:</span>
                  </p>
                  <div className="space-y-1">
                    {option.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${colors.accent.replace('text-', 'bg-')}`}
                        ></div>
                        <span className="text-xs text-gray-600">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
                >
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Expectations:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {option.expectations.map((exp, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-1 h-1 rounded-full ${colors.accent.replace('text-', 'bg-')}`}
                        ></div>
                        <span className="text-xs text-gray-600">{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Common Question Types:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {option.commonQuestions.map((question, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}
                      >
                        {question}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
