'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen luxury-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-gold-500/20 to-gold-700/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 luxury-fade-in">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-4 luxury-glow">
            <svg className="w-8 h-8 text-dark-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold luxury-text-gold font-playfair">
            AI Interviewer
          </h1>
          <p className="mt-2 text-lg luxury-text-secondary">
            Master your interview skills with AI-powered practice
          </p>
        </div>

        {/* Auth Forms */}
        <div className="luxury-card p-8">
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm luxury-text-secondary">
            © 2024 AI Interviewer. Elevating your career potential.
          </p>
        </div>
      </div>
    </div>
  );
}
