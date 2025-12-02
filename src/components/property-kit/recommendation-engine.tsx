'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Calculator, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type CalculatorCategory = 'development' | 'hmo' | 'leasehold' | 'titlesplit' | 'landlord' | 'bridging' | 'sa' | 'commercial' | 'refurb' | 'niche';

interface RecommendedCalculator {
  id: string;
  title: string;
  description: string;
  href: string;
  category: CalculatorCategory;
  relevanceScore?: number;
  reason?: string;
}

interface RecommendationEngineProps {
  title?: string;
  subtitle?: string;
  recommendations: RecommendedCalculator[];
  context?: string;
  showReasons?: boolean;
  maxItems?: number;
  layout?: 'grid' | 'list' | 'compact';
  className?: string;
}

export function RecommendationEngine({
  title = 'Recommended Next Steps',
  subtitle,
  recommendations,
  context,
  showReasons = true,
  maxItems = 4,
  layout = 'grid',
  className,
}: RecommendationEngineProps) {
  const displayedRecs = recommendations.slice(0, maxItems);

  if (displayedRecs.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--pc-blue)]" />
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {/* Context message from AI */}
      {context && (
        <div className="flex items-start gap-3 p-4 bg-[var(--pc-blue-light)] rounded-lg border border-[var(--pc-blue-muted)]">
          <Lightbulb className="w-5 h-5 text-[var(--pc-blue)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{context}</p>
        </div>
      )}

      {/* Recommendations */}
      {layout === 'grid' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayedRecs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} showReason={showReasons} />
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="space-y-3">
          {displayedRecs.map((rec) => (
            <RecommendationListItem key={rec.id} recommendation={rec} showReason={showReasons} />
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div className="flex flex-wrap gap-2">
          {displayedRecs.map((rec) => (
            <RecommendationChip key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

// Card style recommendation
function RecommendationCard({
  recommendation,
  showReason,
}: {
  recommendation: RecommendedCalculator;
  showReason: boolean;
}) {
  return (
    <Link href={recommendation.href} className="block group">
      <Card interactive className="h-full p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <Badge variant={recommendation.category}>{recommendation.category}</Badge>
            {recommendation.relevanceScore && (
              <span className="flex items-center gap-1 text-xs text-[var(--pc-success)]">
                <TrendingUp className="w-3 h-3" />
                {recommendation.relevanceScore}%
              </span>
            )}
          </div>
          <h4 className="font-medium text-foreground group-hover:text-[var(--pc-blue)] transition-colors mb-2">
            {recommendation.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
            {recommendation.description}
          </p>
          {showReason && recommendation.reason && (
            <p className="text-xs text-[var(--pc-blue)] italic mb-3">
              {recommendation.reason}
            </p>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-[var(--pc-blue-light)]">
            Open calculator
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </Link>
  );
}

// List style recommendation
function RecommendationListItem({
  recommendation,
  showReason,
}: {
  recommendation: RecommendedCalculator;
  showReason: boolean;
}) {
  return (
    <Link href={recommendation.href} className="block group">
      <Card interactive className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pc-blue-light)] flex-shrink-0">
            <Calculator className="w-5 h-5 text-[var(--pc-blue)]" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground group-hover:text-[var(--pc-blue)] transition-colors truncate">
                {recommendation.title}
              </h4>
              <Badge variant={recommendation.category} className="flex-shrink-0">
                {recommendation.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {showReason && recommendation.reason ? recommendation.reason : recommendation.description}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[var(--pc-blue)] transition-colors flex-shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

// Compact chip style
function RecommendationChip({ recommendation }: { recommendation: RecommendedCalculator }) {
  return (
    <Link href={recommendation.href}>
      <Badge
        variant="outline"
        className="px-3 py-1.5 cursor-pointer hover:bg-[var(--pc-blue-light)] hover:border-[var(--pc-blue)] hover:text-[var(--pc-blue)] transition-colors"
      >
        <Calculator className="w-3 h-3 mr-1.5" />
        {recommendation.title}
        <ArrowRight className="w-3 h-3 ml-1.5" />
      </Badge>
    </Link>
  );
}

// Quick Action component for immediate next steps
interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success';
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const variantStyles = {
    default: 'border-[var(--pc-grey-border)] hover:border-[var(--pc-blue)]',
    primary: 'border-[var(--pc-blue)] bg-[var(--pc-blue-light)]',
    success: 'border-[var(--pc-success)] bg-[var(--pc-success-light)]',
  };

  return (
    <div className={cn('grid sm:grid-cols-3 gap-3', className)}>
      {actions.map((action, idx) => (
        <Link key={idx} href={action.href} className="block group">
          <Card
            className={cn(
              'p-4 text-center transition-all hover:shadow-md',
              variantStyles[action.variant || 'default']
            )}
            interactive
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-[var(--pc-blue)]">{action.icon}</div>
              <span className="font-medium text-foreground group-hover:text-[var(--pc-blue)]">
                {action.label}
              </span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
