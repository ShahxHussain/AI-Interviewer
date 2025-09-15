'use client';

import React from 'react';
import { TopicFocus } from '@/types';
import {
  Database,
  FolderOpen,
  BookOpen,
  FileText,
  Shuffle,
  CheckCircle,
} from 'lucide-react';

interface TopicFocusSelectorProps {
  selectedFocus: TopicFocus | null;
  onSelect: (focus: TopicFocus) => void;
}

const topicOptions = [
  {
    focus: 'dsa' as TopicFocus,
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    description:
      'Core computer science concepts, coding challenges, and algorithmic thinking',
    icon: Database,
    color: 'blue',
    topics: [
      'Arrays & Strings',
      'Linked Lists',
      'Trees & Graphs',
      'Dynamic Programming',
      'Sorting & Searching',
      'Hash Tables',
    ],
    difficulty: 'Technical',
    timeAllocation: '70% coding, 30% discussion',
  },
  {
    focus: 'projects' as TopicFocus,
    name: 'Project Experience',
    shortName: 'Projects',
    description:
      'Deep dive into your past projects, architecture decisions, and technical challenges',
    icon: FolderOpen,
    color: 'green',
    topics: [
      'Project Architecture',
      'Technical Decisions',
      'Challenges Faced',
      'Team Collaboration',
      'Technology Stack',
      'Performance Optimization',
    ],
    difficulty: 'Experience-based',
    timeAllocation: '40% technical, 60% discussion',
  },
  {
    focus: 'fundamentals' as TopicFocus,
    name: 'CS Fundamentals',
    shortName: 'Fundamentals',
    description:
      'Core computer science principles, system design, and theoretical knowledge',
    icon: BookOpen,
    color: 'purple',
    topics: [
      'Operating Systems',
      'Database Design',
      'Network Protocols',
      'System Architecture',
      'Security Principles',
      'Software Engineering',
    ],
    difficulty: 'Conceptual',
    timeAllocation: '30% coding, 70% concepts',
  },
  {
    focus: 'resume' as TopicFocus,
    name: 'Resume Deep Dive',
    shortName: 'Resume',
    description:
      'Detailed discussion of your background, experiences, and career progression',
    icon: FileText,
    color: 'orange',
    topics: [
      'Work Experience',
      'Technical Skills',
      'Education Background',
      'Achievements',
      'Career Goals',
      'Skill Gaps',
    ],
    difficulty: 'Personal',
    timeAllocation: '20% technical, 80% discussion',
  },
  {
    focus: 'mixed' as TopicFocus,
    name: 'Mixed Topics',
    shortName: 'Mixed',
    description:
      'Balanced combination of coding, concepts, and experience-based questions',
    icon: Shuffle,
    color: 'gray',
    topics: [
      'Coding Problems',
      'System Design',
      'Project Discussion',
      'Technical Concepts',
      'Behavioral Questions',
      'Problem Solving',
    ],
    difficulty: 'Comprehensive',
    timeAllocation: '50% technical, 50% discussion',
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
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    selectedBg: 'bg-orange-100',
    selectedBorder: 'border-orange-500',
    icon: 'text-orange-600',
    selectedIcon: 'text-orange-700',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'text-orange-600',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    selectedBg: 'bg-gray-100',
    selectedBorder: 'border-gray-500',
    icon: 'text-gray-600',
    selectedIcon: 'text-gray-700',
    text: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-800',
    accent: 'text-gray-600',
  },
};

export function TopicFocusSelector({
  selectedFocus,
  onSelect,
}: TopicFocusSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold luxury-text-gold mb-2">
          Topic Focus
        </h3>
        <p className="text-sm luxury-text-secondary">
          Select the primary focus area for your interview questions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topicOptions.map(option => {
          const isSelected = selectedFocus === option.focus;
          const colors =
            colorClasses[option.color as keyof typeof colorClasses];
          const Icon = option.icon;

          return (
            <button
              key={option.focus}
              onClick={() => onSelect(option.focus)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/40 shadow-lg shadow-yellow-400/20'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30 hover:border-yellow-400/40 hover:bg-gradient-to-r hover:from-yellow-400/5 hover:to-yellow-600/5'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-5 w-5 text-yellow-400" />
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-start space-x-3 mb-3">
                <div className={`p-2.5 rounded-lg ${
                  isSelected 
                    ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30' 
                    : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/30'
                } flex-shrink-0`}>
                  <Icon
                    className={`h-5 w-5 ${
                      isSelected ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold ${
                    isSelected ? 'luxury-text-gold' : 'luxury-text-primary'
                  } mb-1`}>
                    {option.name}
                  </h4>
                  <p className={`text-xs ${
                    isSelected ? 'text-yellow-400' : 'luxury-text-secondary'
                  } font-medium`}>
                    {option.difficulty}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm luxury-text-secondary mb-4 leading-relaxed">
                {option.description}
              </p>

              {/* Time Allocation */}
              <div
                className={`p-2.5 rounded-lg ${
                  isSelected 
                    ? 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30' 
                    : 'bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/30'
                } mb-4`}
              >
                <p className="text-xs font-medium luxury-text-primary mb-1">
                  Time Allocation:
                </p>
                <p className="text-xs luxury-text-secondary">{option.timeAllocation}</p>
              </div>

              {/* Topics */}
              <div>
                <p className="text-xs font-medium luxury-text-primary mb-2">
                  Key Topics:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {option.topics.slice(0, 6).map((topic, index) => (
                    <div key={index} className="flex items-center space-x-1.5">
                      <div
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-xs luxury-text-secondary truncate">
                        {topic}
                      </span>
                    </div>
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
