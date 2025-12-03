"use client";

import { useState } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
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
      {/* Hero Section - Premium */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-[var(--pc-blue)]/30 to-purple-500/20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/15" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 lg:px-8">
          {/* Trust Signals */}
          <div className="hero-fade-up hero-fade-up-delay-1 mb-10 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-800">4.9/5 rating</span>
            </div>
            <span className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2.5 text-slate-600">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                <Users className="size-4" />
              </div>
              <span className="text-sm font-medium">Trusted by 10,000+ property professionals</span>
            </div>
          </div>

          <div className="text-center">
            <div className="hero-fade-up hero-fade-up-delay-2">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-space-grotesk)] leading-[1.1]">
                Property
                <br />
                <span className="text-[var(--pc-blue)]">Calculators</span>
                <span className="text-[var(--pc-navy)]">.</span>
              </h1>
            </div>

            <div className="hero-fade-up hero-fade-up-delay-3">
              <p className="mx-auto mt-8 max-w-2xl text-xl text-slate-600 leading-relaxed">
                Free property calculators for UK developers and investors.
                <span className="text-slate-800 font-medium"> Yields, GDV, ROI, bridging costs, lease extensions, title splits</span> and more.
              </p>
            </div>

            {/* Stats Bar - Premium */}
            <div className="hero-fade-up hero-fade-up-delay-4 mx-auto mt-12 max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/50">
                <div className="grid grid-cols-3 divide-x divide-slate-200/80">
                  {[
                    { value: liveCount, label: 'Live Now', color: 'text-emerald-600' },
                    { value: comingSoonCount, label: 'Coming Soon', color: 'text-amber-600' },
                    { value: categories.length, label: 'Categories', color: 'text-[var(--pc-blue)]' },
                  ].map((stat) => (
                    <div key={stat.label} className="py-6 px-4">
                      <div className={cn("text-3xl font-bold tabular-nums", stat.color)}>{stat.value}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search - Premium */}
          <div className="hero-fade-up hero-fade-up-delay-5 relative mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search calculators by name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 rounded-2xl border-slate-200/80 bg-white pl-14 pr-5 text-base shadow-lg shadow-slate-200/50 focus:border-[var(--pc-blue)] focus:ring-4 focus:ring-[var(--pc-blue)]/10 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Category Tabs - Premium */}
        <div className="mb-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold transition-all",
              activeCategory === 'all'
                ? 'bg-[var(--pc-navy)] text-white shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
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
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
                  activeCategory === category.id
                    ? 'text-white shadow-lg'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: category.color, boxShadow: `0 10px 30px -10px ${category.color}50` }
                    : undefined
                }
              >
                <Icon className="size-4" />
                {category.name.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Workflows Banner - Premium */}
        <section className="mb-16">
          <div className="section-badge mb-6 inline-flex">
            <Sparkles className="size-3.5" />
            AI Workflows
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${workflow.color}08 0%, white 50%, ${workflow.color}05 100%)`,
                  border: `1px solid ${workflow.color}20`
                }}
              >
                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                  style={{ backgroundColor: workflow.color }}
                />

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${workflow.color}15` }}
                    >
                      <Sparkles className="size-6" style={{ color: workflow.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{workflow.name}</h3>
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs font-semibold">
                          Coming Soon
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{workflow.description}</p>
                      <div className="mt-4 flex items-center text-sm font-semibold" style={{ color: workflow.color }}>
                        <span>{workflow.steps.length} step workflow</span>
                        <ArrowRight className="ml-2 size-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator Grid */}
        {activeCategory === 'all' ? (
          <div className="space-y-20">
            {categories.map((category) => {
              const categoryCalcs = filteredCalculators.filter(
                (c) => c.category === category.id
              );
              if (categoryCalcs.length === 0) return null;

              const Icon = iconMap[category.icon] || Calculator;

              return (
                <section key={category.id}>
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div
                        className="flex size-16 items-center justify-center rounded-2xl shadow-lg"
                        style={{
                          backgroundColor: `${category.color}15`,
                          boxShadow: `0 10px 30px -10px ${category.color}30`
                        }}
                      >
                        <Icon className="size-8" color={category.color} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                          {category.name}
                          <span style={{ color: category.color }}>.</span>
                        </h2>
                        <p className="text-slate-500 mt-1">
                          {categoryCalcs.length} calculators
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/${category.slug}`}
                      className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: category.color }}
                    >
                      View all
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-full"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <ArrowRight className="size-3.5" />
                      </div>
                    </Link>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryCalcs.map((calc, i) => (
                      <CalculatorCard key={calc.id} calculator={calc} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCalculators.map((calc, i) => (
              <CalculatorCard key={calc.id} calculator={calc} index={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCalculators.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-20 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-slate-100">
              <Calculator className="size-10 text-slate-400" />
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-900">No calculators found</h3>
            <p className="mt-3 text-lg text-slate-600">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--pc-blue)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--pc-blue)]/90 transition-colors shadow-lg shadow-[var(--pc-blue)]/20"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Trust Section - Premium */}
        <section className="mt-24 relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--pc-blue)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl" />

          <div className="relative border border-slate-200 rounded-3xl p-12 lg:p-16">
            <div className="text-center max-w-2xl mx-auto">
              <div className="section-badge mb-6 mx-auto w-fit">
                <Shield className="size-3.5" />
                Built for UK
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                Built for UK Property
                <br />
                <span className="text-[var(--pc-blue)]">Professionals.</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600">
                Every calculation uses UK-specific formulas, tax rates, and industry standards
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: CheckCircle2,
                  title: 'UK Tax Compliant',
                  description: 'SDLT, CGT, Section 24, and all UK-specific calculations',
                  color: '#059669'
                },
                {
                  icon: TrendingUp,
                  title: 'BCIS Aligned',
                  description: 'Build costs based on BCIS data and regional adjustments',
                  color: '#2563eb'
                },
                {
                  icon: Shield,
                  title: 'Lender Ready',
                  description: 'DSCR, ICR, and LTV calculations matching lender requirements',
                  color: '#7c3aed'
                }
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div
                    className="mx-auto flex size-16 items-center justify-center rounded-2xl mb-6"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="size-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CalculatorCard({ calculator, index }: { calculator: CalculatorConfig; index: number }) {
  const isLive = calculator.status === 'live';

  return (
    <Link href={calculator.href} className="no-underline group">
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border border-slate-200/80 hover:border-transparent"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${calculator.color}05 0%, ${calculator.color}10 100%)` }}
        />

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ backgroundColor: calculator.color }}
        />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-5">
            <div
              className="flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${calculator.color}12` }}
            >
              <Calculator className="size-6" style={{ color: calculator.color }} />
            </div>
            <Badge
              className={cn(
                "text-xs font-semibold px-2.5 py-1",
                isLive
                  ? 'bg-emerald-100 text-emerald-700 border-0'
                  : 'bg-amber-100 text-amber-700 border-0'
              )}
            >
              {isLive ? 'Live' : 'Soon'}
            </Badge>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
            {calculator.name}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {calculator.description}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm font-semibold" style={{ color: calculator.color }}>
            {isLive ? 'Use calculator' : 'Get notified'}
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full group-hover:translate-x-1 transition-transform"
              style={{ backgroundColor: `${calculator.color}15` }}
            >
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
