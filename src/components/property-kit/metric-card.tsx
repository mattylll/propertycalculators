import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: '',
  primary: 'border-l-[3px] border-l-[var(--pc-blue)]',
  success: 'border-l-[3px] border-l-[var(--pc-success)]',
  warning: 'border-l-[3px] border-l-[var(--pc-warning)]',
  danger: 'border-l-[3px] border-l-[var(--pc-danger)]',
};

const sizeStyles = {
  sm: { value: 'text-xl', label: 'text-xs' },
  md: { value: 'text-2xl', label: 'text-sm' },
  lg: { value: 'text-3xl', label: 'text-base' },
};

export function MetricCard({
  label,
  value,
  change,
  icon,
  variant = 'default',
  size = 'md',
  className,
}: MetricCardProps) {
  const TrendIcon = change?.type === 'increase' ? TrendingUp : change?.type === 'decrease' ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        'p-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            'font-medium text-muted-foreground uppercase tracking-wider',
            sizeStyles[size].label
          )}>
            {label}
          </p>
          <p className={cn(
            'font-bold text-foreground tabular-nums',
            sizeStyles[size].value
          )}>
            {value}
          </p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              change.type === 'increase' && 'text-[var(--pc-success)]',
              change.type === 'decrease' && 'text-[var(--pc-danger)]',
              change.type === 'neutral' && 'text-muted-foreground'
            )}>
              <TrendIcon className="w-3 h-3" />
              <span>{change.value}</span>
              {change.period && (
                <span className="text-muted-foreground">vs {change.period}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
