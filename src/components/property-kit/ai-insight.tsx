'use client';

import * as React from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type InsightSeverity = 'info' | 'success' | 'warning' | 'critical';

interface AIInsightProps {
  title?: string;
  summary: string;
  details?: string;
  severity?: InsightSeverity;
  recommendations?: string[];
  metrics?: { label: string; value: string; change?: string }[];
  expandable?: boolean;
  className?: string;
}

const severityConfig: Record<InsightSeverity, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-[var(--pc-info)]', bgColor: 'bg-[var(--pc-info-light)]' },
  success: { icon: CheckCircle, color: 'text-[var(--pc-success)]', bgColor: 'bg-[var(--pc-success-light)]' },
  warning: { icon: AlertTriangle, color: 'text-[var(--pc-warning)]', bgColor: 'bg-[var(--pc-warning-light)]' },
  critical: { icon: AlertTriangle, color: 'text-[var(--pc-danger)]', bgColor: 'bg-[var(--pc-danger-light)]' },
};

export function AIInsight({
  title = 'AI Analysis',
  summary,
  details,
  severity = 'info',
  recommendations,
  metrics,
  expandable = true,
  className,
}: AIInsightProps) {
  const [expanded, setExpanded] = React.useState(false);
  const config = severityConfig[severity];
  const SeverityIcon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-lg)] border border-[var(--pc-ai-border)] bg-gradient-to-br from-[var(--pc-blue-light)] to-white overflow-hidden',
        className
      )}
    >
      {/* AI Gradient accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--pc-blue)] to-[#7c3aed]" />

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--pc-blue)]/10">
              <Sparkles className="w-3.5 h-3.5 text-[var(--pc-blue)]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pc-blue)]">
              {title}
            </span>
          </div>
          <Badge variant={severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : severity === 'success' ? 'success' : 'info'}>
            <SeverityIcon className="w-3 h-3 mr-1" />
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-base text-foreground leading-relaxed mb-4">{summary}</p>

        {/* Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-white/50 rounded-lg border border-[var(--pc-grey-border)]">
            {metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{metric.label}</p>
                <p className="text-lg font-semibold text-foreground tabular-nums">{metric.value}</p>
                {metric.change && (
                  <p className={cn(
                    'text-xs font-medium',
                    metric.change.startsWith('+') ? 'text-[var(--pc-success)]' : 'text-[var(--pc-danger)]'
                  )}>
                    {metric.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</p>
            <ul className="space-y-1.5">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-[var(--pc-success)] flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable Details */}
        {expandable && details && (
          <>
            {expanded && (
              <div className="mt-4 pt-4 border-t border-[var(--pc-grey-border)]">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{details}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-[var(--pc-blue)] hover:text-[var(--pc-blue-hover)] hover:bg-[var(--pc-blue-light)]"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show detailed analysis
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
