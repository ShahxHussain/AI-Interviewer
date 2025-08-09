'use client';

import { useState, useCallback } from 'react';
import { User, CandidateProfile, RecruiterProfile } from '@/types';

interface UseProfileReturn {
  loading: boolean;
  error: string | null;
  updateProfile: (
    profileData: Partial<CandidateProfile | RecruiterProfile>
  ) => Promise<boolean>;
  uploadResume: (file: File) => Promise<boolean>;
  deleteResume: () => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  deleteProfilePicture: () => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const updateProfile = useCallback(
    async (
      profileData: Partial<CandidateProfile | RecruiterProfile>
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          setError('No authentication token found');
          return false;
        }

        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile: profileData }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Failed to update profile');
          return false;
        }

        // Update stored user data
        if (data.user) {
          const authUser = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.profile.firstName,
            lastName: data.user.profile.lastName,
            companyName:
              data.user.role === 'recruiter'
                ? data.user.profile.companyName
                : undefined,
          };
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }

        return true;
      } catch (err) {
        setError('Network error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadResume = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return false;
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/profile/resume', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to upload resume');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResume = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return false;
      }

      const response = await fetch('/api/profile/resume', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to delete resume');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfilePicture = useCallback(
    async (file: File): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          setError('No authentication token found');
          return false;
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

        if (!data.success) {
          setError(data.message || 'Failed to upload profile picture');
          return false;
        }

        return true;
      } catch (err) {
        setError('Network error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProfilePicture = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return false;
      }

      const response = await fetch('/api/profile/picture', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to delete profile picture');
        return false;
      }

      return true;
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateProfile,
    uploadResume,
    deleteResume,
    uploadProfilePicture,
    deleteProfilePicture,
  };
}
