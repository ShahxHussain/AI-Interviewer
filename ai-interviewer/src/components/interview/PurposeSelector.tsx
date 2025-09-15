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
        <h3 className="text-lg font-bold luxury-text-gold mb-2">
          Interview Purpose
        </h3>
        <p className="text-sm luxury-text-secondary">
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
              <div className="flex items-center space-x-3 mb-4">
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
                <div>
                  <h4 className={`font-bold text-lg ${
                    isSelected ? 'luxury-text-gold' : 'luxury-text-primary'
                  }`}>
                    {option.name}
                  </h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 luxury-text-secondary" />
                    <span className="text-xs luxury-text-secondary">
                      {option.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm luxury-text-secondary mb-4 leading-relaxed">
                {option.description}
              </p>

              {/* Characteristics */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium luxury-text-primary mb-2 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Key Focus Areas:</span>
                  </p>
                  <div className="space-y-1">
                    {option.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="text-xs luxury-text-secondary">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    isSelected 
                      ? 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30' 
                      : 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/30'
                  }`}
                >
                  <p className="text-xs font-medium luxury-text-primary mb-2">
                    Expectations:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {option.expectations.map((exp, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="text-xs luxury-text-secondary">{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium luxury-text-primary mb-2">
                    Common Question Types:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {option.commonQuestions.map((question, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isSelected
                            ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/30'
                            : 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 text-gray-300 border border-gray-600/30'
                        }`}
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
