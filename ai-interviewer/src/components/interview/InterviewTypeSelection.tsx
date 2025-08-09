'use client';

import React from 'react';
import { InterviewType } from '@/types';
import {
  Code2,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';

interface InterviewTypeSelectionProps {
  selectedType: InterviewType | null;
  onSelect: (type: InterviewType) => void;
}

const interviewTypeOptions = [
  {
    type: 'technical' as InterviewType,
    name: 'Technical Interview',
    description:
      'Coding problems, algorithms, and technical knowledge assessment',
    icon: Code2,
    color: 'blue',
    duration: '45-60 min',
    focus: ['Data Structures', 'Algorithms', 'System Design', 'Code Quality'],
    difficulty: 'Varies by level',
  },
  {
    type: 'behavioral' as InterviewType,
    name: 'Behavioral Interview',
    description: 'Soft skills, past experiences, and cultural fit evaluation',
    icon: MessageCircle,
    color: 'green',
    duration: '30-45 min',
    focus: ['Communication', 'Leadership', 'Problem Solving', 'Team Work'],
    difficulty: 'Moderate',
  },
  {
    type: 'case-study' as InterviewType,
    name: 'Case Study',
    description: 'Real-world problem solving and analytical thinking',
    icon: BarChart3,
    color: 'purple',
    duration: '60-90 min',
    focus: ['Analysis', 'Strategy', 'Presentation', 'Business Acumen'],
    difficulty: 'Advanced',
  },
];

const colorClasses = {
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

export function InterviewTypeSelection({
  selectedType,
  onSelect,
}: InterviewTypeSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Interview Type
        </h3>
        <p className="text-sm text-gray-600">
          Choose the type of interview you want to practice
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {interviewTypeOptions.map(interview => {
          const isSelected = selectedType === interview.type;
          const colors =
            colorClasses[interview.color as keyof typeof colorClasses];
          const Icon = interview.icon;

          return (
            <button
              key={interview.type}
              onClick={() => onSelect(interview.type)}
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
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon
                    className={`h-6 w-6 ${isSelected ? colors.selectedIcon : colors.icon}`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${colors.text}`}>
                    {interview.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {interview.description}
              </p>

              {/* Duration and Difficulty */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{interview.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>{interview.difficulty}</span>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Focus Areas:
                </p>
                <div className="flex flex-wrap gap-1">
                  {interview.focus.map(area => (
                    <span
                      key={area}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
