'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
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
  ChevronRight,
  Star,
  Users,
  Sparkles,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  },
  {
    step: 2,
    id: 'gdv',
    name: 'GDV Estimate',
    description: 'Calculate end values',
    icon: TrendingUp,
    href: '/development/gdv-calculator',
  },
  {
    step: 3,
    id: 'costs',
    name: 'Build Costs',
    description: 'Estimate construction costs',
    icon: Calculator,
    href: '/development/build-cost-calculator',
  },
  {
    step: 4,
    id: 'finance',
    name: 'Finance',
    description: 'Structure your funding',
    icon: Banknote,
    href: '/development/development-finance-calculator',
  },
];

export default function DevelopmentPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const selectedDev = developmentTypes.find((t) => t.id === selectedType);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li>
                <Link href="/calculators" className="text-slate-500 hover:text-slate-700 transition-colors">
                  Calculators
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li className="font-medium text-slate-900">Development</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                  <Sparkles className="mr-1 size-3" />
                  AI-Powered Workflow
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)]">
                Development Finance Calculator
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                Calculate your development's viability from GDV through to finance. Works for any
                development type—new builds, PD conversions, refurbs, and more.
              </p>

              {/* Trust Signals */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-700">4.9/5</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="size-4" />
                  <span>Used by 3,000+ developers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Workflow Progress */}
        <section className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all',
                      step.step === 1
                        ? 'bg-[var(--pc-blue)] border-[var(--pc-blue)] text-white shadow-lg'
                        : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'
                    )}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span
                    className={cn(
                      'mt-3 text-sm font-medium text-center',
                      step.step === 1 ? 'text-[var(--pc-blue)]' : 'text-slate-400'
                    )}
                  >
                    {step.name}
                  </span>
                  <span className="text-xs text-slate-400 text-center mt-1 hidden sm:block">
                    {step.description}
                  </span>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="w-12 sm:w-20 h-0.5 bg-slate-200 mx-2 mt-[-40px]" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Step 1: Development Type Selection */}
        <section className="mb-12">
          <div className="mb-8">
            <Badge className="mb-3 bg-slate-100 text-slate-700 border-0">Step 1</Badge>
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              What type of development?
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
                    'cursor-pointer transition-all duration-200 hover:shadow-lg',
                    isSelected
                      ? 'ring-2 ring-[var(--pc-blue)] border-[var(--pc-blue)] shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                          isSelected ? 'bg-[var(--pc-blue)]' : 'bg-slate-100'
                        )}
                      >
                        <type.icon
                          className={cn('h-6 w-6', isSelected ? 'text-white' : 'text-slate-600')}
                        />
                      </div>
                      {isSelected && <CheckCircle2 className="h-6 w-6 text-[var(--pc-blue)]" />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mt-4">{type.name}</h3>
                    <p className="text-sm text-slate-600 mt-2">{type.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {type.examples.map((example) => (
                        <Badge key={example} variant="secondary" className="text-xs bg-slate-100">
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
          <section className="mb-12">
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--pc-blue)] shrink-0">
                    <selectedDev.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedDev.name}</h3>
                    <p className="mt-2 text-slate-600">{selectedDev.description}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="size-4 text-slate-400" />
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            Timeline
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {selectedDev.typical.timeline}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="size-4 text-slate-400" />
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            Finance
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {selectedDev.typical.finance}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="size-4 text-slate-400" />
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                            Target Margin
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {selectedDev.typical.margin}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Link href={`/development/gdv-calculator?type=${selectedType}`} className="flex-1">
                        <Button size="lg" className="w-full gap-2 bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Access to Individual Calculators */}
        <section className="pt-8 border-t border-slate-200 mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Or jump to a specific calculator
            </h2>
            <p className="mt-1 text-slate-600">Access any development calculator directly</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'GDV Calculator',
                description: 'Estimate Gross Development Value',
                href: '/development/gdv-calculator',
                icon: TrendingUp,
                status: 'live',
                color: '#10B981',
              },
              {
                name: 'Build Cost Calculator',
                description: 'BCIS-aligned cost estimates',
                href: '/development/build-cost-calculator',
                icon: Calculator,
                status: 'live',
                color: '#3B82F6',
              },
              {
                name: 'Development Finance',
                description: 'Structure senior, mezz & equity',
                href: '/development/development-finance-calculator',
                icon: Banknote,
                status: 'live',
                color: '#8B5CF6',
              },
              {
                name: 'Profit on Cost',
                description: 'Developer margin analysis',
                href: '/development/profit-on-cost-calculator',
                icon: TrendingUp,
                status: 'coming-soon',
                color: '#F59E0B',
              },
            ].map((calc) => (
              <Link key={calc.href} href={calc.href} className="group no-underline">
                <Card className="h-full border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${calc.color}15` }}
                      >
                        <calc.icon className="h-6 w-6" style={{ color: calc.color }} />
                      </div>
                      <Badge
                        className={
                          calc.status === 'live'
                            ? 'bg-emerald-100 text-emerald-700 border-0 text-xs'
                            : 'bg-amber-100 text-amber-700 border-0 text-xs'
                        }
                      >
                        {calc.status === 'live' ? 'Live' : 'Soon'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                      {calc.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{calc.description}</p>
                    <div className="mt-4 flex items-center text-sm font-medium" style={{ color: calc.color }}>
                      Use calculator
                      <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Additional Calculators */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">More Development Tools</h3>
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
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100">
                    <Calculator className="size-5 text-slate-600" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-[var(--pc-blue)] transition-colors">
                    {calc.name}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs bg-slate-100">
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
