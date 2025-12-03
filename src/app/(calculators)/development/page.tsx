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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200/60">
        {/* Animated Background */}
        <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
        <div
          className="hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
        />
        <div
          className="hero-orb-2 absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          {/* Breadcrumb */}
          <nav className="hero-fade-up mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li>
                <Link href="/calculators" className="text-slate-500 hover:text-emerald-600 transition-colors">
                  Calculators
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li className="font-medium text-slate-900">Development</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 max-w-3xl">
              <div className="hero-fade-up flex items-center gap-3 mb-6">
                <span className="section-badge">
                  <Sparkles className="mr-1.5 size-3.5" />
                  AI-Powered Workflow
                </span>
              </div>
              <h1 className="hero-fade-up-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-[family-name:var(--font-space-grotesk)]">
                Development Finance{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Calculator
                </span>
              </h1>
              <p className="hero-fade-up-3 mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
                Calculate your development's viability from GDV through to finance. Works for any
                development type—new builds, PD conversions, refurbs, and more.
              </p>

              {/* Trust Signals */}
              <div className="hero-fade-up-4 mt-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-700">4.9/5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  <Users className="size-4 text-emerald-600" />
                  <span className="font-medium">3,000+ developers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  <Zap className="size-4 text-amber-500" />
                  <span className="font-medium">Instant results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Workflow Progress */}
        <section className="mb-16">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/60 shadow-lg shadow-slate-200/50">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />

            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center group">
                    <div
                      className={cn(
                        'relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-300',
                        step.step === 1
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                          : 'border-slate-200 text-slate-400 bg-white hover:border-emerald-300 hover:shadow-md group-hover:scale-105'
                      )}
                    >
                      {step.step === 1 && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                      )}
                      <step.icon className="h-7 w-7 relative z-10" />
                    </div>
                    <span
                      className={cn(
                        'mt-4 text-sm font-semibold text-center transition-colors',
                        step.step === 1 ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    >
                      {step.name}
                    </span>
                    <span className="text-xs text-slate-400 text-center mt-1 hidden sm:block max-w-[100px]">
                      {step.description}
                    </span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="relative w-16 sm:w-24 h-0.5 mx-3 mt-[-50px]">
                      <div className="absolute inset-0 bg-slate-200 rounded-full" />
                      {step.step === 1 && (
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step 1: Development Type Selection */}
        <section className="mb-16">
          <div className="mb-10 text-center">
            <span className="section-badge mb-4">
              Step 1
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              What type of development?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Select your development strategy to get the most accurate calculations.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {developmentTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <div
                  key={type.id}
                  className={cn(
                    'group relative cursor-pointer rounded-2xl p-6 transition-all duration-300',
                    'bg-white border-2 hover:shadow-xl hover:-translate-y-1',
                    isSelected
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-emerald-300'
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  {/* Selected glow effect */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-transparent" />
                  )}

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-100 group-hover:bg-emerald-50 group-hover:scale-110'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-7 w-7 transition-colors',
                            isSelected ? 'text-white' : 'text-slate-600 group-hover:text-emerald-600'
                          )}
                        />
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Selected
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-5">{type.name}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{type.description}</p>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {type.examples.map((example) => (
                        <Badge
                          key={example}
                          variant="secondary"
                          className={cn(
                            'text-xs px-2.5 py-1 transition-colors',
                            isSelected
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Type Details + Next Steps */}
        {selectedDev && (
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1px]">
              <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 p-8 lg:p-10">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl" />

                <div className="relative flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30 shrink-0">
                    <selectedDev.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1">
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        Selected Strategy
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                      {selectedDev.name}
                    </h3>
                    <p className="mt-3 text-lg text-slate-600">{selectedDev.description}</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50">
                            <Clock className="size-5 text-blue-600" />
                          </div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                            Timeline
                          </p>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedDev.typical.timeline}
                        </p>
                      </div>
                      <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50">
                            <Banknote className="size-5 text-purple-600" />
                          </div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                            Finance
                          </p>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedDev.typical.finance}
                        </p>
                      </div>
                      <div className="group bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50">
                            <TrendingUp className="size-5 text-emerald-600" />
                          </div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                            Target Margin
                          </p>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedDev.typical.margin}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                      <Link href={`/development/gdv-calculator?type=${selectedType}`} className="flex-1">
                        <Button
                          size="lg"
                          className="w-full gap-2 h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
                        >
                          Continue to GDV Calculator
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/development/build-cost-calculator" className="flex-1">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full gap-2 h-14 text-base font-semibold border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                        >
                          Skip to Build Costs
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Access to Individual Calculators */}
        <section className="mb-16">
          <div className="mb-10 text-center">
            <span className="section-badge mb-4">
              Quick Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Or jump to a specific calculator
            </h2>
            <p className="mt-4 text-lg text-slate-600">Access any development calculator directly</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1">
                  {/* Hover gradient border effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${calc.color}20 0%, transparent 50%)`,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        style={{
                          backgroundColor: `${calc.color}15`,
                          boxShadow: `0 4px 20px ${calc.color}00`,
                        }}
                      >
                        <calc.icon className="h-7 w-7" style={{ color: calc.color }} />
                      </div>
                      <Badge
                        className={
                          calc.status === 'live'
                            ? 'bg-emerald-100 text-emerald-700 border-0 text-xs font-semibold px-2.5 py-1'
                            : 'bg-amber-100 text-amber-700 border-0 text-xs font-semibold px-2.5 py-1'
                        }
                      >
                        {calc.status === 'live' ? 'Live' : 'Soon'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {calc.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{calc.description}</p>
                    <div
                      className="mt-5 flex items-center text-sm font-semibold transition-all group-hover:gap-2"
                      style={{ color: calc.color }}
                    >
                      Use calculator
                      <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Additional Calculators */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-12">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-sm mb-4">
                Coming Soon
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                More Development Tools
              </h3>
              <p className="mt-2 text-slate-400">Advanced calculators launching soon</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Residual Land Value', href: '/development/residual-land-value-calculator', icon: Layers },
                { name: 'Loan to Cost', href: '/development/loan-to-cost-calculator', icon: Calculator },
                { name: 'Cost to Complete', href: '/development/cost-to-complete-calculator', icon: TrendingUp },
                { name: 'Stretched Senior', href: '/development/stretched-senior-calculator', icon: Banknote },
                { name: 'Mezzanine Finance', href: '/development/mezzanine-finance-calculator', icon: Building2 },
                { name: 'Equity Waterfall', href: '/development/equity-waterfall-calculator', icon: TrendingUp },
              ].map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 group-hover:bg-emerald-500/20 transition-colors">
                      <calc.icon className="size-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {calc.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                      Soon
                    </Badge>
                    <ArrowRight className="size-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
