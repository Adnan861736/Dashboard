import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-lg',
        'backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 hover:scale-[1.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>;
};
