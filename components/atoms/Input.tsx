import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2 transition-colors group-focus-within:text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm text-foreground',
              'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground/60',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:shadow-lg focus-visible:shadow-primary/10',
              'hover:border-primary/50 hover:shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive hover:border-destructive/50',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
            <span className="inline-block">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
