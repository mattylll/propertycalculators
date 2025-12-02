import * as React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskIndicatorProps {
  level: RiskLevel;
  title: string;
  description?: string;
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
}

const riskConfig: Record<RiskLevel, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  low: {
    icon: CheckCircle,
    color: 'text-[var(--pc-success)]',
    bgColor: 'bg-[var(--pc-success-light)]',
    borderColor: 'border-l-[var(--pc-success)]',
    label: 'Low Risk',
  },
  medium: {
    icon: Info,
    color: 'text-[var(--pc-warning)]',
    bgColor: 'bg-[var(--pc-warning-light)]',
    borderColor: 'border-l-[var(--pc-warning)]',
    label: 'Medium Risk',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-[var(--pc-danger)]',
    bgColor: 'bg-[var(--pc-danger-light)]',
    borderColor: 'border-l-[var(--pc-danger)]',
    label: 'High Risk',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-[var(--pc-danger)]',
    bgColor: 'bg-[var(--pc-danger)]',
    borderColor: 'border-l-[var(--pc-danger)]',
    label: 'Critical',
  },
};

export function RiskIndicator({
  level,
  title,
  description,
  showIcon = true,
  compact = false,
  className,
}: RiskIndicatorProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && <Icon className={cn('w-4 h-4', config.color)} />}
        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-[var(--radius)] border-l-[3px]',
        config.bgColor,
        config.borderColor,
        level === 'critical' && 'text-white',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          level === 'critical' ? 'text-white' : config.color
        )} />
      )}
      <div className="space-y-1">
        <p className={cn(
          'font-medium',
          level === 'critical' ? 'text-white' : 'text-foreground'
        )}>
          {title}
        </p>
        {description && (
          <p className={cn(
            'text-sm',
            level === 'critical' ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Gauge-style risk indicator
interface RiskGaugeProps {
  score: number; // 0-100
  label?: string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RiskGauge({
  score,
  label = 'Risk Score',
  showScore = true,
  size = 'md',
  className,
}: RiskGaugeProps) {
  const level: RiskLevel = score < 25 ? 'low' : score < 50 ? 'medium' : score < 75 ? 'high' : 'critical';
  const config = riskConfig[level];

  const sizeStyles = {
    sm: { container: 'w-24 h-24', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-40 h-40', text: 'text-3xl', label: 'text-base' },
  };

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 40 : size === 'md' ? 52 : 64;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative', sizeStyles[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={`var(--pc-${level === 'low' ? 'success' : level === 'medium' ? 'warning' : 'danger'})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-500"
          />
        </svg>
        {showScore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold tabular-nums', config.color, sizeStyles[size].text)}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        )}
      </div>
      <p className={cn('mt-2 font-medium text-muted-foreground', sizeStyles[size].label)}>{label}</p>
      <p className={cn('font-semibold', config.color)}>{config.label}</p>
    </div>
  );
}
