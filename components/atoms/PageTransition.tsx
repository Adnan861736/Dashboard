'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out',
        className
      )}
    >
      {children}
    </div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className }) => {
  return (
    <div
      className={cn('animate-in fade-in zoom-in-95 duration-500 ease-out', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'bottom',
  delay = 0,
  className,
}) => {
  const directionClasses = {
    left: 'slide-in-from-left-8',
    right: 'slide-in-from-right-8',
    top: 'slide-in-from-top-8',
    bottom: 'slide-in-from-bottom-8',
  };

  return (
    <div
      className={cn(
        'animate-in fade-in duration-500 ease-out',
        directionClasses[direction],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const StaggerChildren: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="space-y-4">
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * 100}>{child}</FadeIn>
      ))}
    </div>
  );
};
