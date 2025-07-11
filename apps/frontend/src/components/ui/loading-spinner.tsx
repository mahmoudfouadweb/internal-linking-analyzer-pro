/**
 * @author Mahmoud & Expert System
 * @description Loading spinner component for error boundaries and suspense
 * @created 2025-07-11
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  message = 'جاري التحميل...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
