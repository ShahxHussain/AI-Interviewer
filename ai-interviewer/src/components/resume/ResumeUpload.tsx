'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { ParsedResumeData } from '@/types';

interface ResumeUploadProps {
  currentResumeUrl?: string;
  onUploadComplete?: (resumeUrl: string) => void;
  onUploadError?: (error: string) => void;
  onParseComplete?: (parsedData: ParsedResumeData) => void;
  className?: string;
  showParseButton?: boolean;
}

export function ResumeUpload({
  currentResumeUrl,
  onUploadComplete,
  onUploadError,
  onParseComplete,
  className = '',
  showParseButton = false,
}: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error' | 'parsing'
  >('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadResume, deleteResume, loading } = useProfile();

  // Enhanced drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    []
  );

  // Enhanced file validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf('.'));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return { valid: false, error: 'Only PDF and DOCX files are allowed' };
    }

    // Updated to 10MB as per tech.md
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File appears to be empty' };
    }

    return { valid: true };
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Enhanced file handling with progress simulation
  const handleFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadStatus('error');
      setUploadMessage(validation.error!);
      onUploadError?.(validation.error!);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadMessage(`Uploading ${file.name}...`);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const success = await uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (success) {
        setUploadStatus('success');
        setUploadMessage('Resume uploaded successfully!');
        onUploadComplete?.(`/uploads/resumes/${file.name}`);
      } else {
        setUploadStatus('error');
        setUploadMessage('Failed to upload resume. Please try again.');
        onUploadError?.('Failed to upload resume');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setUploadMessage('Upload failed due to network error');
      onUploadError?.('Network error during upload');
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setUploadStatus('idle');
      setUploadMessage('');
      setUploadProgress(0);
      setSelectedFile(null);
    }, 5000);
  };

  const handleRemoveResume = async () => {
    setUploadStatus('uploading');
    setUploadMessage('Removing resume...');

    const success = await deleteResume();

    if (success) {
      setUploadStatus('success');
      setUploadMessage('Resume removed successfully!');
      onUploadComplete?.('');
      setParsedData(null);
    } else {
      setUploadStatus('error');
      setUploadMessage('Failed to remove resume. Please try again.');
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle');
      setUploadMessage('');
    }, 3000);
  };

  const handleParseResume = async () => {
    if (!currentResumeUrl) return;

    setUploadStatus('parsing');
    setUploadMessage('Parsing resume content...');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeUrl: currentResumeUrl }),
      });

      const data = await response.json();

      if (data.success && data.parsedData) {
        setParsedData(data.parsedData);
        setUploadStatus('success');
        setUploadMessage('Resume parsed successfully!');
        onParseComplete?.(data.parsedData);
      } else {
        setUploadStatus('error');
        setUploadMessage(data.message || 'Failed to parse resume');
        onUploadError?.(data.message || 'Failed to parse resume');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to parse resume due to network error');
      onUploadError?.('Network error during parsing');
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle');
      setUploadMessage('');
    }, 3000);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (filename?: string) => {
    if (!filename) return FileText;
    const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    return extension === '.pdf' ? FileText : File;
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resume Upload
      </label>

      {currentResumeUrl ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {React.createElement(getFileIcon(currentResumeUrl), {
                className: 'h-8 w-8 text-blue-600',
              })}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Resume uploaded
                </p>
                <p className="text-xs text-gray-500">
                  {currentResumeUrl.split('/').pop()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showParseButton && (
                <button
                  type="button"
                  onClick={handleParseResume}
                  className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center space-x-1"
                  disabled={loading || uploadStatus === 'parsing'}
                >
                  {uploadStatus === 'parsing' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span>Parse</span>
                </button>
              )}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={loading || uploadStatus === 'uploading'}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveResume}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
                disabled={loading || uploadStatus === 'uploading'}
              >
                Remove
              </button>
            </div>
          </div>

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Parsed Resume Data
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p>
                  <strong>Skills:</strong>{' '}
                  {parsedData.skills.slice(0, 5).join(', ')}
                  {parsedData.skills.length > 5 ? '...' : ''}
                </p>
                <p>
                  <strong>Experience:</strong> {parsedData.experience.length}{' '}
                  positions
                </p>
                <p>
                  <strong>Education:</strong> {parsedData.education.length}{' '}
                  entries
                </p>
                <p>
                  <strong>Projects:</strong> {parsedData.projects.length}{' '}
                  projects
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${loading || uploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={
            !loading && uploadStatus !== 'uploading'
              ? openFileDialog
              : undefined
          }
        >
          <div className="text-center">
            {uploadStatus === 'uploading' ? (
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            ) : (
              <Upload
                className={`mx-auto h-12 w-12 transition-colors ${
                  dragActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
            )}
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop your resume
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF or DOCX files up to 10MB
              </p>
              {selectedFile && (
                <p className="text-xs text-gray-600 mt-2">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {Math.round(uploadProgress)}% uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Status Message */}
      {uploadMessage && (
        <div
          className={`mt-3 p-3 rounded-md flex items-center space-x-2 text-sm ${
            uploadStatus === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : uploadStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : uploadStatus === 'parsing'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {uploadStatus === 'success' && (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {uploadStatus === 'error' && (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {(uploadStatus === 'uploading' || uploadStatus === 'parsing') && (
            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
          )}
          <span className="flex-1">{uploadMessage}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileInput}
        className="hidden"
        disabled={loading || uploadStatus === 'uploading'}
      />
    </div>
  );
}
