'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Eye } from 'lucide-react';
import { JobPosting, InterviewFlowConfig, InterviewType, DifficultyLevel, TopicFocus } from '@/types';

interface JobPostingFormProps {
  initialData?: Partial<JobPosting>;
  onSave: (jobData: Omit<JobPosting, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)',
  'Senior Level (5-8 years)',
  'Lead Level (8+ years)',
];

const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical Interview' },
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'case-study', label: 'Case Study Interview' },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'advanced', label: 'Advanced' },
];

const TOPIC_FOCUS_OPTIONS: { value: TopicFocus; label: string }[] = [
  { value: 'dsa', label: 'Data Structures & Algorithms' },
  { value: 'projects', label: 'Projects & Experience' },
  { value: 'fundamentals', label: 'Technical Fundamentals' },
  { value: 'resume', label: 'Resume Discussion' },
  { value: 'mixed', label: 'Mixed Topics' },
];

export default function JobPostingForm({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    responsibilities: initialData?.responsibilities || [''],
    requirements: initialData?.requirements || [''],
    requiredSkills: initialData?.requiredSkills || [],
    experienceLevel: initialData?.experienceLevel || '',
    interviewFlow: initialData?.interviewFlow || {
      interviewTypes: ['technical'] as InterviewType[],
      difficulty: 'moderate' as DifficultyLevel,
      topicFocus: ['mixed'] as TopicFocus[],
      estimatedDuration: 60,
      customQuestions: [],
    },
    status: initialData?.status || 'draft' as const,
    isActive: initialData?.isActive ?? true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterviewFlowChange = (field: keyof InterviewFlowConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      interviewFlow: {
        ...prev.interviewFlow,
        [field]: value,
      },
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ''],
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) => i === index ? value : item),
    }));
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => i === index ? value : item),
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill),
    }));
  };

  const addCustomQuestion = () => {
    if (newCustomQuestion.trim()) {
      handleInterviewFlowChange('customQuestions', [
        ...(formData.interviewFlow.customQuestions || []),
        newCustomQuestion.trim(),
      ]);
      setNewCustomQuestion('');
    }
  };

  const removeCustomQuestion = (index: number) => {
    const updatedQuestions = (formData.interviewFlow.customQuestions || []).filter((_, i) => i !== index);
    handleInterviewFlowChange('customQuestions', updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty responsibilities and requirements
    const cleanedData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      requirements: formData.requirements.filter(r => r.trim()),
    };

    onSave(cleanedData);
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.experienceLevel &&
      formData.responsibilities.some(r => r.trim()) &&
      formData.requirements.some(r => r.trim()) &&
      formData.requiredSkills.length > 0
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      {/* Basic Information */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Job Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              variant="luxury"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Job Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of the role..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Experience Level *</label>
            <Select
              value={formData.experienceLevel}
              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
              variant="luxury"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Responsibilities */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Responsibilities *</h3>
        
        <div className="space-y-3">
          {formData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={responsibility}
                onChange={(e) => updateResponsibility(index, e.target.value)}
                placeholder="Enter a key responsibility..."
                variant="luxury"
                className="flex-1"
              />
              {formData.responsibilities.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeResponsibility(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addResponsibility}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Responsibility
          </Button>
        </div>
      </Card>

      {/* Requirements */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Requirements *</h3>
        
        <div className="space-y-3">
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={requirement}
                onChange={(e) => updateRequirement(index, e.target.value)}
                placeholder="Enter a requirement..."
                variant="luxury"
                className="flex-1"
              />
              {formData.requirements.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addRequirement}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Required Skills *</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a skill..."
              variant="luxury"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} disabled={!newSkill.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Interview Flow Configuration */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Interview Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Interview Types</label>
            <div className="space-y-2">
              {INTERVIEW_TYPES.map((type) => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.interviewFlow.interviewTypes.includes(type.value)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.interviewFlow.interviewTypes, type.value]
                        : formData.interviewFlow.interviewTypes.filter(t => t !== type.value);
                      handleInterviewFlowChange('interviewTypes', types);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-white">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Difficulty Level</label>
            <Select
              value={formData.interviewFlow.difficulty}
              onChange={(e) => handleInterviewFlowChange('difficulty', e.target.value)}
              variant="luxury"
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Topic Focus</label>
            <div className="space-y-2">
              {TOPIC_FOCUS_OPTIONS.map((topic) => (
                <label key={topic.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.interviewFlow.topicFocus.includes(topic.value)}
                    onChange={(e) => {
                      const topics = e.target.checked
                        ? [...formData.interviewFlow.topicFocus, topic.value]
                        : formData.interviewFlow.topicFocus.filter(t => t !== topic.value);
                      handleInterviewFlowChange('topicFocus', topics);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-white">{topic.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Estimated Duration (minutes)</label>
            <Input
              type="number"
              value={formData.interviewFlow.estimatedDuration}
              onChange={(e) => handleInterviewFlowChange('estimatedDuration', parseInt(e.target.value) || 60)}
              min="15"
              max="180"
              step="15"
              variant="luxury"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Custom Questions (Optional)</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newCustomQuestion}
                  onChange={(e) => setNewCustomQuestion(e.target.value)}
                  placeholder="Enter a custom interview question..."
                  variant="luxury"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomQuestion())}
                />
                <Button type="button" onClick={addCustomQuestion} disabled={!newCustomQuestion.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {(formData.interviewFlow.customQuestions || []).map((question, index) => (
                  <div key={index} className="flex gap-2 p-3 bg-gray-700 rounded-md">
                    <span className="flex-1 text-sm text-white">{question}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={!isFormValid() || isLoading}
            onClick={() => handleInputChange('status', 'draft')}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          
          <Button
            type="submit"
            disabled={!isFormValid() || isLoading}
            onClick={() => handleInputChange('status', 'active')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publish Job
          </Button>
        </div>
      </div>
    </form>
  );
}