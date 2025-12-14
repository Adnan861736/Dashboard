import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm active:scale-95';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:bg-primary/90 hover:-translate-y-0.5',
    secondary: 'bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/30 hover:bg-secondary/90 hover:-translate-y-0.5',
    destructive: 'bg-destructive text-destructive-foreground hover:shadow-lg hover:shadow-destructive/50 hover:bg-destructive/90 hover:-translate-y-0.5',
    ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-md',
    success: 'bg-success text-success-foreground hover:shadow-lg hover:shadow-success/50 hover:bg-success/90 hover:-translate-y-0.5',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};
