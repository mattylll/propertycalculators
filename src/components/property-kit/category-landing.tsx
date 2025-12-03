"use client";

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  type CategoryConfig,
  type CalculatorConfig,
  getCalculatorsByCategory,
  categories as allCategories,
} from '@/lib/calculators/config';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Star,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CategoryLandingProps = {
  category: CategoryConfig;
};

export function CategoryLanding({ category }: CategoryLandingProps) {
  const calculators = getCalculatorsByCategory(category.id);
  const liveCalculators = calculators.filter((c) => c.status === 'live');
  const comingSoonCalculators = calculators.filter((c) => c.status === 'coming-soon');

  // Get related categories
  const relatedCategories = allCategories
    .filter((c) => c.id !== category.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{ background: `radial-gradient(circle, ${category.color}20 0%, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${category.color}15 0%, transparent 70%)` }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10">
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
              <li className="font-medium text-slate-900">{category.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1fr,380px] gap-12 items-start">
            <div className="hero-fade-up">
              {/* Category Icon & Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div
                  className="flex size-20 items-center justify-center rounded-3xl shadow-lg"
                  style={{
                    backgroundColor: `${category.color}15`,
                    boxShadow: `0 10px 40px -10px ${category.color}30`
                  }}
                >
                  <Calculator className="size-10" style={{ color: category.color }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1.5 text-sm font-semibold">
                    <CheckCircle2 className="mr-1.5 size-3.5" />
                    {liveCalculators.length} Live
                  </Badge>
                  {comingSoonCalculators.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 px-3 py-1.5 text-sm font-semibold">
                      <Clock className="mr-1.5 size-3.5" />
                      {comingSoonCalculators.length} Coming Soon
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-space-grotesk)] leading-[1.1]">
                {category.name}
                <span style={{ color: category.color }}>.</span>
              </h1>
              <p className="mt-6 text-xl text-slate-600 max-w-2xl leading-relaxed">
                {category.description}
              </p>

              {/* Trust Signals */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-800">4.9/5</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                    <Users className="size-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium">Used by 5,000+ professionals</span>
                </div>
              </div>

              {/* CTA Buttons */}
              {liveCalculators.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href={liveCalculators[0].href}>
                    <Button
                      size="lg"
                      className="hero-btn-primary gap-3 h-14 px-8 text-base font-semibold shadow-xl rounded-xl"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 10px 40px -10px ${category.color}50`
                      }}
                    >
                      <Sparkles className="size-5" />
                      Start Calculating
                      <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                  <Link href="/calculators">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 h-14 px-8 text-base font-semibold bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white rounded-xl"
                    >
                      Browse All
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Stats Card - Premium */}
            <div className="hero-fade-up hero-fade-up-delay-2">
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${category.color}08 0%, white 50%, ${category.color}05 100%)`,
                  border: `1px solid ${category.color}20`
                }}
              >
                {/* Card glow */}
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${category.color}10 0%, transparent 60%)`
                  }}
                />

                <div className="relative p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Zap className="size-5" style={{ color: category.color }} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Category Overview</h3>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: 'Total Calculators', value: calculators.length, color: 'text-slate-900' },
                      { label: 'Available Now', value: liveCalculators.length, color: 'text-emerald-600' },
                      { label: 'Coming Soon', value: comingSoonCalculators.length, color: 'text-amber-600' },
                    ].map((stat, i) => (
                      <div key={stat.label}>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">{stat.label}</span>
                          <span className={cn("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</span>
                        </div>
                        {i < 2 && <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />}
                      </div>
                    ))}
                  </div>

                  {/* Featured calculator */}
                  {liveCalculators.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200/50">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Most Popular</p>
                      <Link href={liveCalculators[0].href} className="group flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white/80 transition-all">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${category.color}15` }}
                        >
                          <Calculator className="size-5" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-[var(--pc-blue)] transition-colors">
                            {liveCalculators[0].name}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Live Calculators */}
        {liveCalculators.length > 0 && (
          <section className="mb-20">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="section-badge mb-4 inline-flex">
                  <CheckCircle2 className="size-3.5" />
                  Available Now
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                  Ready to use
                  <span style={{ color: category.color }}>.</span>
                </h2>
                <p className="mt-2 text-lg text-slate-600">Start calculating in seconds</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 px-4 py-2 text-sm font-semibold">
                {liveCalculators.length} calculators
              </Badge>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {liveCalculators.map((calc, i) => (
                <CalculatorCard key={calc.id} calculator={calc} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Calculators */}
        {comingSoonCalculators.length > 0 && (
          <section className="mb-20">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="section-badge mb-4 inline-flex">
                  <Clock className="size-3.5" />
                  Coming Soon
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                  In development
                  <span className="text-amber-500">.</span>
                </h2>
                <p className="mt-2 text-lg text-slate-600">Get notified when these launch</p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-0 px-4 py-2 text-sm font-semibold">
                {comingSoonCalculators.length} calculators
              </Badge>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoonCalculators.map((calc, i) => (
                <CalculatorCard key={calc.id} calculator={calc} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="pt-12 border-t border-slate-200">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Explore other categories
              <span className="text-[var(--pc-blue)]">.</span>
            </h2>
            <p className="mt-2 text-lg text-slate-600">More calculators for your property journey</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCategories.map((cat) => {
              const count = getCalculatorsByCategory(cat.id).length;
              const liveCount = getCalculatorsByCategory(cat.id).filter(c => c.status === 'live').length;
              return (
                <Link key={cat.id} href={`/${cat.slug}`} className="no-underline group">
                  <div
                    className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(135deg, white 0%, ${cat.color}05 100%)`,
                      border: '1px solid',
                      borderColor: 'rgb(226 232 240)'
                    }}
                  >
                    {/* Bottom accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      style={{ backgroundColor: cat.color }}
                    />

                    <div className="p-6">
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl mb-5 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <Calculator className="size-7" style={{ color: cat.color }} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {count} calculators · {liveCount} live
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold" style={{ color: cat.color }}>
                        View category
                        <div
                          className="flex items-center justify-center w-6 h-6 rounded-full group-hover:translate-x-1 transition-transform"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <ArrowRight className="size-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Back to All */}
        <div className="mt-16 text-center">
          <Link href="/calculators">
            <Button variant="outline" size="lg" className="gap-3 h-14 px-8 text-base font-semibold rounded-xl">
              <ArrowLeft className="size-5" />
              Back to All Calculators
            </Button>
          </Link>
        </div>
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
