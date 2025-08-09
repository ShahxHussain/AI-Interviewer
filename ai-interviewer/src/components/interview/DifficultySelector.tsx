'use client';

import React from 'react';
import { DifficultyLevel } from '@/types';
import { TrendingUp, BarChart3, Activity, CheckCircle } from 'lucide-react';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel | null;
  onSelect: (difficulty: DifficultyLevel) => void;
}

const difficultyOptions = [
  {
    level: 'beginner' as DifficultyLevel,
    name: 'Beginner',
    description: 'Entry-level questions, basic concepts and fundamentals',
    icon: TrendingUp,
    color: 'green',
    characteristics: [
      'Basic syntax and concepts',
      'Simple problem solving',
      'Fundamental algorithms',
      'Entry-level expectations',
    ],
    timeEstimate: '20-30 min',
    suitableFor: 'New graduates, career changers, junior roles',
  },
  {
    level: 'moderate' as DifficultyLevel,
    name: 'Moderate',
    description: 'Mid-level complexity with practical problem solving',
    icon: BarChart3,
    color: 'blue',
    characteristics: [
      'Intermediate algorithms',
      'System design basics',
      'Code optimization',
      'Real-world scenarios',
    ],
    timeEstimate: '30-45 min',
    suitableFor: 'Mid-level developers, 2-5 years experience',
  },
  {
    level: 'advanced' as DifficultyLevel,
    name: 'Advanced',
    description: 'Complex problems requiring deep technical knowledge',
    icon: Activity,
    color: 'red',
    characteristics: [
      'Complex algorithms',
      'System architecture',
      'Performance optimization',
      'Leadership scenarios',
    ],
    timeEstimate: '45-60 min',
    suitableFor: 'Senior developers, tech leads, architects',
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
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    selectedBg: 'bg-red-100',
    selectedBorder: 'border-red-500',
    icon: 'text-red-600',
    selectedIcon: 'text-red-700',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-800',
    accent: 'text-red-600',
  },
};

export function DifficultySelector({
  selectedDifficulty,
  onSelect,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Difficulty Level
        </h3>
        <p className="text-sm text-gray-600">
          Choose the complexity level that matches your experience and goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {difficultyOptions.map(option => {
          const isSelected = selectedDifficulty === option.level;
          const colors =
            colorClasses[option.color as keyof typeof colorClasses];
          const Icon = option.icon;

          return (
            <button
              key={option.level}
              onClick={() => onSelect(option.level)}
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
                  <h4 className={`font-semibold text-lg ${colors.text}`}>
                    {option.name}
                  </h4>
                  <p className={`text-sm ${colors.accent} font-medium`}>
                    {option.timeEstimate}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>

              {/* Characteristics */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Key Features:
                  </p>
                  <div className="space-y-1">
                    {option.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}
                        ></div>
                        <span className="text-xs text-gray-600">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
                >
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Best for:
                  </p>
                  <p className="text-xs text-gray-600">{option.suitableFor}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
