import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-4 w-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={cn('relative', sizes[size], className)}>
        {/* Spinning Ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-4 border-primary/30',
            'border-t-primary border-r-primary',
            'animate-spin'
          )}
          style={{ animationDuration: '1s' }}
        />

        {/* Inner Pulsing Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'rounded-full bg-primary animate-pulse',
              dotSizes[size]
            )}
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>
    </div>
  );
};

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Logo or Icon Container */}
        <div className="relative">
          <LoadingSpinner size="lg" />

          {/* Animated Rings Around Spinner */}
          <div className="absolute inset-0 -m-8">
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary">
            جاري التحميل
          </h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            الرجاء الانتظار...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
