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
        <h3 className="text-lg font-bold luxury-text-gold mb-2">
          Difficulty Level
        </h3>
        <p className="text-sm luxury-text-secondary">
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
                <div>
                  <h4 className={`font-bold text-lg ${
                    isSelected ? 'luxury-text-gold' : 'luxury-text-primary'
                  }`}>
                    {option.name}
                  </h4>
                  <p className={`text-sm ${
                    isSelected ? 'text-yellow-400' : 'luxury-text-secondary'
                  } font-medium`}>
                    {option.timeEstimate}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm luxury-text-secondary mb-4">{option.description}</p>

              {/* Characteristics */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium luxury-text-primary mb-2">
                    Key Features:
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
                  <p className="text-xs font-medium luxury-text-primary mb-1">
                    Best for:
                  </p>
                  <p className="text-xs luxury-text-secondary">{option.suitableFor}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
