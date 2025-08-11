'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen luxury-container flex items-center justify-center">
        <div className="text-center luxury-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-6 luxury-glow">
            <svg className="w-10 h-10 text-dark-900 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold luxury-text-gold font-playfair mb-4">
            AI Interviewer
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="mt-4 luxury-text-secondary">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return null;
}
