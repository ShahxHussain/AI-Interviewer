'use client';

import React from 'react';
import { InterviewerType } from '@/types';
import { Code, Users, Target, Briefcase, CheckCircle } from 'lucide-react';

interface InterviewerSelectionProps {
  selectedInterviewer: InterviewerType | null;
  onSelect: (interviewer: InterviewerType) => void;
}

const interviewerOptions = [
  {
    type: 'tech-lead' as InterviewerType,
    name: 'Tech Lead',
    description: 'Technical expertise and system design focus',
    icon: Code,
    color: 'blue',
    expertise: [
      'System Design',
      'Code Review',
      'Architecture',
      'Best Practices',
    ],
  },
  {
    type: 'hr-manager' as InterviewerType,
    name: 'HR Manager',
    description: 'Behavioral questions and cultural fit assessment',
    icon: Users,
    color: 'green',
    expertise: [
      'Cultural Fit',
      'Soft Skills',
      'Team Dynamics',
      'Communication',
    ],
  },
  {
    type: 'product-manager' as InterviewerType,
    name: 'Product Manager',
    description: 'Product thinking and strategic problem solving',
    icon: Target,
    color: 'purple',
    expertise: [
      'Product Strategy',
      'User Experience',
      'Analytics',
      'Prioritization',
    ],
  },
  {
    type: 'recruiter' as InterviewerType,
    name: 'Recruiter',
    description: 'General screening and role-specific questions',
    icon: Briefcase,
    color: 'orange',
    expertise: [
      'Role Screening',
      'Experience Review',
      'Motivation',
      'Expectations',
    ],
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
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    selectedBg: 'bg-orange-100',
    selectedBorder: 'border-orange-500',
    icon: 'text-orange-600',
    selectedIcon: 'text-orange-700',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
  },
};

export function InterviewerSelection({
  selectedInterviewer,
  onSelect,
}: InterviewerSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Interviewer
        </h3>
        <p className="text-sm text-gray-600">
          Select the type of interviewer that matches your interview focus
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviewerOptions.map(interviewer => {
          const isSelected = selectedInterviewer === interviewer.type;
          const colors =
            colorClasses[interviewer.color as keyof typeof colorClasses];
          const Icon = interviewer.icon;

          return (
            <button
              key={interviewer.type}
              onClick={() => onSelect(interviewer.type)}
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
                <div>
                  <h4 className={`font-semibold ${colors.text}`}>
                    {interviewer.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {interviewer.description}
              </p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2">
                {interviewer.expertise.map(skill => (
                  <span
                    key={skill}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
