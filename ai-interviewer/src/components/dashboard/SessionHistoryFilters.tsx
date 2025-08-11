'use client';

import { useState } from 'react';
import { SessionFilters } from '@/lib/services/session-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search, Filter, X } from 'lucide-react';

interface SessionHistoryFiltersProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
}

export function SessionHistoryFilters({ 
  filters, 
  onFiltersChange 
}: SessionHistoryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleFilterChange = (key: keyof SessionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('searchQuery', searchQuery || undefined);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="abandoned">Abandoned</option>
            </Select>
          </div>

          {/* Interview Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Type
            </label>
            <Select
              value={filters.interviewType || ''}
              onValueChange={(value) => handleFilterChange('interviewType', value || undefined)}
            >
              <option value="">All Types</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="case-study">Case Study</option>
            </Select>
          </div>

          {/* Interviewer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interviewer
            </label>
            <Select
              value={filters.interviewer || ''}
              onValueChange={(value) => handleFilterChange('interviewer', value || undefined)}
            >
              <option value="">All Interviewers</option>
              <option value="tech-lead">Tech Lead</option>
              <option value="hr-manager">HR Manager</option>
              <option value="product-manager">Product Manager</option>
              <option value="recruiter">Recruiter</option>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <Select
              value={filters.difficulty || ''}
              onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="moderate">Moderate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <Input
              type="date"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => 
                handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <Input
              type="date"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) => 
                handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = value.toString();
            if (key === 'dateFrom' || key === 'dateTo') {
              displayValue = new Date(value as Date).toLocaleDateString();
            }
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {key}: {displayValue}
                <button
                  onClick={() => handleFilterChange(key as keyof SessionFilters, undefined)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}