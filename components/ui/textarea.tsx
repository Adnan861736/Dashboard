import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2 transition-colors group-focus-within:text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              'flex min-h-[120px] w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm text-foreground',
              'ring-offset-background',
              'placeholder:text-muted-foreground/60',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:shadow-lg focus-visible:shadow-primary/10',
              'hover:border-primary/50 hover:shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'resize-none',
              error &&
                'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive hover:border-destructive/50',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
