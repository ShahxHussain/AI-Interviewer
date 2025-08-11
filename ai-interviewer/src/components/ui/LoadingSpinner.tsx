'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gold' | 'pulse' | 'dots';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'gold',
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <span className={cn('luxury-text-secondary ml-2', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <div className={cn(
          'rounded-full bg-gradient-to-r from-gold-400 to-gold-600 luxury-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <span className={cn('luxury-text-secondary', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  const spinnerVariants = {
    default: 'border-2 border-dark-600 border-t-gold-400',
    gold: 'border-2 border-dark-600 border-t-gold-400 border-r-gold-500',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full transition-all duration-300',
          sizeClasses[size],
          spinnerVariants[variant === 'default' ? 'default' : 'gold']
        )}
      />
      {text && (
        <span className={cn('luxury-text-secondary font-medium', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}