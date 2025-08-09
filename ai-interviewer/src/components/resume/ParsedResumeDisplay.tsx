'use client';

import React from 'react';
import { ParsedResumeData } from '@/types';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  ExternalLink,
} from 'lucide-react';

interface ParsedResumeDisplayProps {
  parsedData: ParsedResumeData;
  className?: string;
}

export function ParsedResumeDisplay({
  parsedData,
  className = '',
}: ParsedResumeDisplayProps) {
  if (!parsedData) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 space-y-6 ${className}`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Parsed Resume Data
        </h3>
      </div>

      {/* Skills Section */}
      {parsedData.skills && parsedData.skills.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Code className="h-4 w-4 text-green-600" />
            <h4 className="text-md font-medium text-gray-800">Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsedData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience Section */}
      {parsedData.experience && parsedData.experience.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Briefcase className="h-4 w-4 text-purple-600" />
            <h4 className="text-md font-medium text-gray-800">Experience</h4>
          </div>
          <div className="space-y-4">
            {parsedData.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-purple-200 pl-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {exp.position}
                  </h5>
                  <span className="text-xs text-gray-500">{exp.duration}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {exp.company}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {parsedData.education && parsedData.education.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <h4 className="text-md font-medium text-gray-800">Education</h4>
          </div>
          <div className="space-y-3">
            {parsedData.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-indigo-200 pl-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {edu.degree}
                  </h5>
                  <span className="text-xs text-gray-500">{edu.year}</span>
                </div>
                <p className="text-sm text-gray-700">{edu.field}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {parsedData.projects && parsedData.projects.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Code className="h-4 w-4 text-orange-600" />
            <h4 className="text-md font-medium text-gray-800">Projects</h4>
          </div>
          <div className="space-y-4">
            {parsedData.projects.map((project, index) => (
              <div key={index} className="border-l-2 border-orange-200 pl-4">
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {project.name}
                  </h5>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {project.description}
                  </p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Text Preview */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">
          Raw Text Preview
        </h4>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-600 whitespace-pre-wrap">
            {parsedData.rawText.substring(0, 500)}
            {parsedData.rawText.length > 500 && '...'}
          </p>
        </div>
      </div>
    </div>
  );
}
