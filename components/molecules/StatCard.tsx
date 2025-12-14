import React from 'react';
import { Card, CardContent } from '@/components/atoms/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = 'text-primary',
}) => {
  return (
    <Card hover className="overflow-hidden relative group">
      {/* Background hover effect */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <h3 className="text-4xl font-bold text-foreground mt-3 group-hover:scale-105 transition-transform duration-300">
              {value}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-3">
                <span
                  className={cn(
                    'text-sm font-bold px-2 py-1 rounded-md',
                    trend.isPositive
                      ? 'text-success bg-success/10'
                      : 'text-destructive bg-destructive/10'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'h-16 w-16 rounded-2xl bg-primary/20',
              'flex items-center justify-center',
              'shadow-lg shadow-primary/20',
              'group-hover:scale-110 group-hover:rotate-6 transition-all duration-300',
              iconColor
            )}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
