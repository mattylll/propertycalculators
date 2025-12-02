'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator, Sparkles, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type CalculatorCategory = 'development' | 'hmo' | 'leasehold' | 'titlesplit' | 'landlord' | 'bridging' | 'sa' | 'commercial' | 'refurb' | 'niche';

interface CalculatorStep {
  id: string;
  title: string;
  description?: string;
}

interface CalculatorLayoutProps {
  // Metadata
  title: string;
  shortTitle?: string;
  description: string;
  category: CalculatorCategory;
  categoryLabel: string;

  // Steps
  steps: CalculatorStep[];
  currentStep: number;
  onStepChange?: (step: number) => void;

  // Content slots
  inputSection: React.ReactNode;
  insightSection?: React.ReactNode;
  resultsSection?: React.ReactNode;

  // Next calculators
  nextCalculators?: {
    id: string;
    title: string;
    description: string;
    href: string;
    category: CalculatorCategory;
  }[];

  // Actions
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;

  // Back link
  backHref?: string;
  backLabel?: string;
}

export function CalculatorLayout({
  title,
  shortTitle,
  description,
  category,
  categoryLabel,
  steps,
  currentStep,
  onStepChange,
  inputSection,
  insightSection,
  resultsSection,
  nextCalculators,
  onSave,
  onReset,
  isSaving,
  backHref = '/calculators',
  backLabel = 'All Calculators',
}: CalculatorLayoutProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--pc-grey-light)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--pc-grey-border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={backHref}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{backLabel}</span>
              </Link>
              <div className="h-6 w-px bg-[var(--pc-grey-border)]" />
              <div className="flex items-center gap-2">
                <Badge variant={category}>{categoryLabel}</Badge>
                <h1 className="font-semibold text-foreground hidden md:block">{shortTitle || title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onReset && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  Reset
                </Button>
              )}
              {onSave && (
                <Button variant="accent" size="sm" onClick={onSave} loading={isSaving}>
                  <Save className="w-4 h-4 mr-1" />
                  Save to Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        </div>

        {/* Step Progress */}
        {steps.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  — {steps[currentStep].title}
                </span>
              </div>
              <span className="text-sm font-medium text-[var(--pc-blue)]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between mt-2">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => onStepChange?.(idx)}
                  className={cn(
                    'flex items-center gap-2 text-xs font-medium transition-colors',
                    idx === currentStep ? 'text-[var(--pc-blue)]' : 'text-muted-foreground hover:text-foreground',
                    idx > currentStep && 'opacity-50'
                  )}
                  disabled={idx > currentStep}
                >
                  <span className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full text-xs',
                    idx < currentStep && 'bg-[var(--pc-success)] text-white',
                    idx === currentStep && 'bg-[var(--pc-blue)] text-white',
                    idx > currentStep && 'bg-muted text-muted-foreground'
                  )}>
                    {idx < currentStep ? '✓' : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pc-blue-light)]">
                  <Calculator className="w-5 h-5 text-[var(--pc-blue)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {steps[currentStep]?.title || 'Calculator Input'}
                  </h2>
                  {steps[currentStep]?.description && (
                    <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                  )}
                </div>
              </div>
              {inputSection}
            </Card>

            {/* Results Section */}
            {resultsSection && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pc-success-light)]">
                    <Calculator className="w-5 h-5 text-[var(--pc-success)]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Results</h2>
                    <p className="text-sm text-muted-foreground">Your calculated outputs</p>
                  </div>
                </div>
                {resultsSection}
              </Card>
            )}
          </div>

          {/* AI Insight Sidebar */}
          <div className="space-y-6">
            {insightSection && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[var(--pc-blue)]" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-[var(--pc-blue)]">
                    AI Insights
                  </span>
                </div>
                {insightSection}
              </div>
            )}

            {/* Next Calculators */}
            {nextCalculators && nextCalculators.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Recommended Next
                </h3>
                <div className="space-y-3">
                  {nextCalculators.map((calc) => (
                    <Link key={calc.id} href={calc.href} className="block group">
                      <Card interactive className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant={calc.category} className="mb-2">{calc.category}</Badge>
                            <h4 className="font-medium text-foreground group-hover:text-[var(--pc-blue)] transition-colors">
                              {calc.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {calc.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[var(--pc-blue)] transition-colors flex-shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
