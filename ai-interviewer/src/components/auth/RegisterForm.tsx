'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/types';
import { Mail, Lock, User, Building, Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    role: 'candidate',
    firstName: '',
    lastName: '',
    companyName: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (formData.role === 'recruiter' && !formData.companyName?.trim()) {
      errors.companyName = 'Company name is required for recruiters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(formData);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold luxury-text-gold font-playfair mb-2">
          Join the Elite
        </h2>
        <p className="luxury-text-secondary text-lg">
          Create your account and elevate your career
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-semibold luxury-text-primary">
            I am a
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="luxury-input w-full appearance-none cursor-pointer"
              disabled={loading}
            >
              <option value="candidate">🎯 Candidate - Looking for opportunities</option>
              <option value="recruiter">🏢 Recruiter - Hiring talent</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-semibold luxury-text-primary">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gold-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`luxury-input w-full pl-12 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                placeholder="John"
                disabled={loading}
              />
            </div>
            {fieldErrors.firstName && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-semibold luxury-text-primary">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gold-400" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`luxury-input w-full pl-12 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                placeholder="Doe"
                disabled={loading}
              />
            </div>
            {fieldErrors.lastName && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Company Name (for recruiters) */}
        {formData.role === 'recruiter' && (
          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-semibold luxury-text-primary">
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gold-400" />
              </div>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`luxury-input w-full pl-12 ${fieldErrors.companyName ? 'border-red-500' : ''}`}
                placeholder="Acme Corporation"
                disabled={loading}
              />
            </div>
            {fieldErrors.companyName && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.companyName}</p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold luxury-text-primary">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gold-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`luxury-input w-full pl-12 ${fieldErrors.email ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold luxury-text-primary">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gold-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              className={`luxury-input w-full pl-12 pr-12 ${fieldErrors.password ? 'border-red-500' : ''}`}
              placeholder="Create a strong password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gold-400 hover:text-gold-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.password}</p>
          )}
          <p className="text-xs luxury-text-secondary">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="luxury-button-primary w-full flex items-center justify-center gap-2 text-lg font-semibold py-4"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              Create Account
            </>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-8 text-center">
          <p className="luxury-text-secondary">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="luxury-text-gold hover:text-gold-300 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
