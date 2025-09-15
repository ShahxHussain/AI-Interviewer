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
        <h3 className="text-lg font-bold luxury-text-gold mb-2">
          Interview Type
        </h3>
        <p className="text-sm luxury-text-secondary">
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
              className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/40 shadow-lg shadow-yellow-400/20'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30 hover:border-yellow-400/40 hover:bg-gradient-to-r hover:from-yellow-400/5 hover:to-yellow-600/5'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-6 w-6 text-yellow-400" />
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-lg ${
                  isSelected 
                    ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30' 
                    : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/30'
                }`}>
                  <Icon
                    className={`h-6 w-6 ${
                      isSelected ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${
                    isSelected ? 'luxury-text-gold' : 'luxury-text-primary'
                  }`}>
                    {interview.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm luxury-text-secondary mb-4">
                {interview.description}
              </p>

              {/* Duration and Difficulty */}
              <div className="flex items-center justify-between mb-4 text-xs luxury-text-secondary">
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
                <p className="text-xs font-medium luxury-text-primary">
                  Focus Areas:
                </p>
                <div className="flex flex-wrap gap-1">
                  {interview.focus.map(area => (
                    <span
                      key={area}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isSelected
                          ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                          : 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 text-gray-300 border border-gray-600/30'
                      }`}
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
