"use client";

import { useState } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  calculators,
  categories,
  workflows,
  type CalculatorCategory,
  type CalculatorConfig,
} from '@/lib/calculators/config';
import {
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  Home,
  FileText,
  Split,
  Wallet,
  Zap,
  BedDouble,
  Building,
  Hammer,
  HelpCircle,
  Star,
  Users,
  CheckCircle2,
  TrendingUp,
  Shield,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Home,
  FileText,
  Split,
  Wallet,
  Zap,
  BedDouble,
  Building,
  Hammer,
  Search: HelpCircle,
};

export default function CalculatorsIndexPage() {
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = calculators.filter((calc) => {
    const matchesCategory = activeCategory === 'all' || calc.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.keywords?.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);
    return matchesCategory && matchesSearch;
  });

  const liveCount = calculators.filter((c) => c.status === 'live').length;
  const comingSoonCount = calculators.filter((c) => c.status === 'coming-soon').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Trust Signals */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm font-medium text-slate-700">4.9/5 rating</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="size-4" />
              <span>Trusted by 10,000+ property professionals</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)]">
              Property Calculators
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Free property calculators for UK developers and investors.
              Yields, GDV, ROI, bridging costs, lease extensions, title splits and more.
            </p>

            {/* Stats Bar */}
            <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{liveCount}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Live Now</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{comingSoonCount}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Coming Soon</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{categories.length}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Categories</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search calculators by name, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-xl border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm focus:border-[var(--pc-blue)] focus:ring-2 focus:ring-[var(--pc-blue)]/20"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Category Tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Calculators ({calculators.length})
          </button>
          {categories.map((category) => {
            const count = calculators.filter((c) => c.category === category.id).length;
            const Icon = iconMap[category.icon] || Calculator;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: category.color }
                    : undefined
                }
              >
                <Icon className="size-4" />
                {category.name.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Workflows Banner */}
        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: `${workflow.color}08` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${workflow.color}15` }}
                  >
                    <Sparkles className="size-5" style={{ color: workflow.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{workflow.description}</p>
                    <div className="mt-3 flex items-center text-xs font-medium" style={{ color: workflow.color }}>
                      <span>{workflow.steps.length} step workflow</span>
                      <ArrowRight className="ml-1 size-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Calculator Grid */}
        {activeCategory === 'all' ? (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryCalcs = filteredCalculators.filter(
                (c) => c.category === category.id
              );
              if (categoryCalcs.length === 0) return null;

              const Icon = iconMap[category.icon] || Calculator;

              return (
                <section key={category.id}>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex size-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <span style={{ color: category.color }}>
                          <Icon className="size-6" />
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                          {category.name}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {categoryCalcs.length} calculators
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/${category.slug}`}
                      className="flex items-center gap-1 text-sm font-medium hover:underline"
                      style={{ color: category.color }}
                    >
                      View all
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryCalcs.map((calc) => (
                      <CalculatorCard key={calc.id} calculator={calc} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCalculators.map((calc) => (
              <CalculatorCard key={calc.id} calculator={calc} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCalculators.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
              <Calculator className="size-8 text-slate-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-900">No calculators found</h3>
            <p className="mt-2 text-slate-600">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--pc-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--pc-blue)]/90 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Trust Section */}
        <section className="mt-20 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Built for UK Property Professionals
            </h2>
            <p className="mt-3 text-slate-600">
              Every calculation uses UK-specific formulas, tax rates, and industry standards
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="size-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">UK Tax Compliant</h3>
              <p className="mt-2 text-sm text-slate-600">
                SDLT, CGT, Section 24, and all UK-specific calculations
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-100">
                <TrendingUp className="size-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">BCIS Aligned</h3>
              <p className="mt-2 text-sm text-slate-600">
                Build costs based on BCIS data and regional adjustments
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-purple-100">
                <Shield className="size-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Lender Ready</h3>
              <p className="mt-2 text-sm text-slate-600">
                DSCR, ICR, and LTV calculations matching lender requirements
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CalculatorCard({ calculator }: { calculator: CalculatorConfig }) {
  const isLive = calculator.status === 'live';

  return (
    <Link href={calculator.href} className="no-underline group">
      <Card className="h-full border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div
              className="flex size-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${calculator.color}12` }}
            >
              <Calculator className="size-5" style={{ color: calculator.color }} />
            </div>
            <Badge
              variant={isLive ? 'default' : 'secondary'}
              className={isLive
                ? 'bg-emerald-100 text-emerald-700 border-0 text-xs'
                : 'bg-amber-100 text-amber-700 border-0 text-xs'
              }
            >
              {isLive ? 'Live' : 'Soon'}
            </Badge>
          </div>

          <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
            {calculator.name}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {calculator.description}
          </p>

          <div className="mt-4 flex items-center text-sm font-medium" style={{ color: calculator.color }}>
            {isLive ? 'Use calculator' : 'Get notified'}
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
