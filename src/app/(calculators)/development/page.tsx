'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  FileText,
  Hammer,
  Layers,
  RefreshCw,
  CheckCircle2,
  Calculator,
  TrendingUp,
  Banknote,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Development types that a borrower might use
const developmentTypes = [
  {
    id: 'new-build',
    name: 'New Build',
    description: 'Ground-up construction on land or demolition site',
    icon: Building2,
    examples: ['New houses', 'New flats', 'Demolish & rebuild'],
    typical: {
      timeline: '12-24 months',
      finance: 'Development finance',
      margin: '20%+ profit on cost',
    },
  },
  {
    id: 'permitted-development',
    name: 'Permitted Development',
    description: 'Convert commercial to residential under PD rights',
    icon: FileText,
    examples: ['Office to resi', 'Retail to resi', 'Light industrial'],
    typical: {
      timeline: '6-12 months',
      finance: 'Development/bridging',
      margin: '15-25% profit on cost',
    },
  },
  {
    id: 'full-planning',
    name: 'Full Planning',
    description: 'Traditional planning application for major changes',
    icon: Layers,
    examples: ['Change of use', 'Major extensions', 'Subdivision'],
    typical: {
      timeline: '12-18 months',
      finance: 'Development finance',
      margin: '20%+ profit on cost',
    },
  },
  {
    id: 'conversion',
    name: 'Conversion',
    description: 'Convert existing building to different unit types',
    icon: RefreshCw,
    examples: ['House to flats', 'Barn conversion', 'Church conversion'],
    typical: {
      timeline: '6-12 months',
      finance: 'Development/bridging',
      margin: '15-20% profit on cost',
    },
  },
  {
    id: 'heavy-refurb',
    name: 'Heavy Refurbishment',
    description: 'Substantial works adding significant value',
    icon: Hammer,
    examples: ['Structural changes', 'Extensions', 'Loft conversions'],
    typical: {
      timeline: '3-9 months',
      finance: 'Refurb bridge',
      margin: '15-20% uplift',
    },
  },
  {
    id: 'light-refurb',
    name: 'Light Refurbishment',
    description: 'Cosmetic works and minor improvements',
    icon: Home,
    examples: ['New kitchen/bathroom', 'Redecoration', 'Flooring'],
    typical: {
      timeline: '1-3 months',
      finance: 'Bridge/cash',
      margin: '10-15% uplift',
    },
  },
];

// Workflow steps based on development type
const workflowSteps = [
  {
    step: 1,
    id: 'type',
    name: 'Development Type',
    description: 'Select your development strategy',
    icon: HelpCircle,
    color: '#00C9A7',
  },
  {
    step: 2,
    id: 'gdv',
    name: 'GDV Estimate',
    description: 'Calculate end values',
    icon: TrendingUp,
    href: '/development/gdv-calculator',
    color: '#00C9A7',
  },
  {
    step: 3,
    id: 'costs',
    name: 'Build Costs',
    description: 'Estimate construction costs',
    icon: Calculator,
    href: '/development/build-cost-calculator',
    color: '#00C9A7',
  },
  {
    step: 4,
    id: 'finance',
    name: 'Finance',
    description: 'Structure your funding',
    icon: Banknote,
    href: '/development/development-finance-calculator',
    color: '#00C9A7',
  },
];

export default function DevelopmentPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const selectedDev = developmentTypes.find((t) => t.id === selectedType);

  return (
    <div className="bg-white min-h-screen">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8">
        {/* Back Link */}
        <Link
          href="/calculators"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[var(--pc-blue)] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          All Calculators
        </Link>

        {/* Hero Section */}
        <section className="space-y-4">
          <Badge className="bg-emerald-100 text-emerald-700 border-0">
            Construction Capital Engine
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
            Development Finance Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Calculate your development's viability from GDV through to finance. Works for any
            development type—new builds, PD conversions, refurbs, and more.
          </p>
        </section>

        {/* Workflow Progress */}
        <section className="py-4">
          <div className="flex items-center justify-between max-w-3xl">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                      step.step === 1
                        ? 'bg-[var(--pc-blue)] border-[var(--pc-blue)] text-white'
                        : 'border-slate-200 text-slate-400 bg-white'
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium',
                      step.step === 1 ? 'text-[var(--pc-blue)]' : 'text-slate-400'
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="w-16 h-0.5 bg-slate-200 mx-2 mt-[-20px]" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Step 1: Development Type Selection */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Step 1: What type of development?
            </h2>
            <p className="mt-2 text-slate-600">
              Select your development strategy to get the most accurate calculations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developmentTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <Card
                  key={type.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected
                      ? 'ring-2 ring-[var(--pc-blue)] border-[var(--pc-blue)]'
                      : 'hover:border-slate-300'
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          isSelected ? 'bg-[var(--pc-blue)]' : 'bg-slate-100'
                        )}
                      >
                        <type.icon
                          className={cn('h-5 w-5', isSelected ? 'text-white' : 'text-slate-600')}
                        />
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-[var(--pc-blue)]" />}
                    </div>
                    <CardTitle className="text-lg mt-3">{type.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600 mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map((example) => (
                        <Badge key={example} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Selected Type Details + Next Steps */}
        {selectedDev && (
          <section className="space-y-6">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--pc-blue)]">
                    <selectedDev.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedDev.name}</h3>
                    <p className="mt-1 text-slate-600">{selectedDev.description}</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Typical Timeline
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedDev.typical.timeline}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Finance</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedDev.typical.finance}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Target Margin
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedDev.typical.margin}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Continue */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/development/gdv-calculator?type=${selectedType}`} className="flex-1">
                <Button variant="default" size="lg" className="w-full gap-2">
                  Continue to GDV Calculator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/development/build-cost-calculator" className="flex-1">
                <Button variant="outline" size="lg" className="w-full gap-2">
                  Skip to Build Costs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Quick Access to Individual Calculators */}
        <section className="space-y-6 pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
            Or jump to a specific calculator
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'GDV Calculator',
                description: 'Estimate Gross Development Value',
                href: '/development/gdv-calculator',
                icon: TrendingUp,
                status: 'live',
              },
              {
                name: 'Build Cost Calculator',
                description: 'BCIS-aligned cost estimates',
                href: '/development/build-cost-calculator',
                icon: Calculator,
                status: 'live',
              },
              {
                name: 'Development Finance',
                description: 'Structure senior, mezz & equity',
                href: '/development/development-finance-calculator',
                icon: Banknote,
                status: 'live',
              },
              {
                name: 'Profit on Cost',
                description: 'Developer margin analysis',
                href: '/development/profit-on-cost-calculator',
                icon: TrendingUp,
                status: 'coming-soon',
              },
            ].map((calc) => (
              <Link key={calc.href} href={calc.href} className="group no-underline">
                <Card className="h-full transition-all hover:shadow-md hover:border-[var(--pc-blue)]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <calc.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <Badge
                        variant={calc.status === 'live' ? 'default' : 'secondary'}
                        className={
                          calc.status === 'live'
                            ? 'bg-emerald-100 text-emerald-700 border-0'
                            : ''
                        }
                      >
                        {calc.status === 'live' ? 'Live' : 'Soon'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                      {calc.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{calc.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Additional Calculators */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">More Development Tools</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Residual Land Value', href: '/development/residual-land-value-calculator' },
              { name: 'Loan to Cost', href: '/development/loan-to-cost-calculator' },
              { name: 'Cost to Complete', href: '/development/cost-to-complete-calculator' },
              { name: 'Stretched Senior', href: '/development/stretched-senior-calculator' },
              { name: 'Mezzanine Finance', href: '/development/mezzanine-finance-calculator' },
              { name: 'Equity Waterfall', href: '/development/equity-waterfall-calculator' },
            ].map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[var(--pc-blue)] hover:bg-slate-50 transition-all group"
              >
                <span className="font-medium text-slate-700 group-hover:text-[var(--pc-blue)]">
                  {calc.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Soon
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
