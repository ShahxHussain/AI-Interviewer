import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'luxury-badge',
        secondary: 'bg-dark-700 text-dark-200 border border-dark-600',
        destructive: 'bg-red-900/30 text-red-300 border border-red-500/30',
        outline: 'border border-gold-400/30 text-gold-400 bg-transparent',
        success: 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30',
        warning: 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30',
        luxury: 'bg-gradient-to-r from-gold-400 to-gold-600 text-dark-900 font-bold shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };