'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'luxury' | 'glass';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', inputSize = 'md', ...props }, ref) => {
    const baseClasses = 'flex w-full font-body transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
    
    const variantClasses = {
      default: 'luxury-input',
      luxury: 'luxury-input border-gold-400/30 focus:border-gold-500 focus:shadow-gold-sm',
      glass: 'bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-dark-100 placeholder:text-dark-400 focus:border-gold-400/50 focus:bg-white/10'
    };
    
    const sizeClasses = {
      sm: 'h-10 px-3 py-2 text-sm rounded-lg',
      md: 'h-12 px-4 py-3 text-base rounded-xl',
      lg: 'h-14 px-5 py-4 text-lg rounded-2xl'
    };

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };