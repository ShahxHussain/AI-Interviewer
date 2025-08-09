'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUploadComplete?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export function ProfilePictureUpload({
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  disabled = false,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      onUploadError?.('Image size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file to API
    setUploading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        onUploadError?.('No authentication token found');
        setPreviewUrl(null);
        return;
      }

      const formData = new FormData();
      formData.append('picture', file);

      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete?.(data.pictureUrl);
      } else {
        onUploadError?.(data.message || 'Failed to upload image');
        setPreviewUrl(null);
      }
    } catch (error) {
      onUploadError?.('Network error occurred');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        onUploadError?.('No authentication token found');
        return;
      }

      const response = await fetch('/api/profile/picture', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPreviewUrl(null);
        onUploadComplete?.('');
      } else {
        onUploadError?.(data.message || 'Failed to remove image');
      }
    } catch (error) {
      onUploadError?.('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {displayUrl && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Remove Photo
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}
