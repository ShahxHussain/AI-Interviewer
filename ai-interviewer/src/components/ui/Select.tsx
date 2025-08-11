'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'luxury' | 'glass';
  selectSize?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, variant = 'default', selectSize = 'md', ...props }, ref) => {
    const baseClasses = 'flex w-full font-body transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer';
    
    const variantClasses = {
      default: 'luxury-select',
      luxury: 'luxury-select border-gold-400/30 focus:border-gold-500 focus:shadow-gold-sm',
      glass: 'bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-dark-100 focus:border-gold-400/50 focus:bg-white/10'
    };
    
    const sizeClasses = {
      sm: 'h-10 px-3 py-2 text-sm rounded-lg',
      md: 'h-12 px-4 py-3 text-base rounded-xl',
      lg: 'h-14 px-5 py-4 text-lg rounded-2xl'
    };

    return (
      <div className="relative">
        <select
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[selectSize],
            'pr-10',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gold-400" />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };