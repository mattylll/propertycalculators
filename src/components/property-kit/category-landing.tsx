"use client";

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

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
              <li className="font-medium text-slate-900">{category.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              {/* Category Icon & Badge */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex size-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <Calculator className="size-8" style={{ color: category.color }} />
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    <CheckCircle2 className="mr-1 size-3" />
                    {liveCalculators.length} Live
                  </Badge>
                  {comingSoonCalculators.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      <Clock className="mr-1 size-3" />
                      {comingSoonCalculators.length} Coming Soon
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)]">
                {category.name}
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                {category.description}
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
                  <span>Used by 5,000+ professionals</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <Card className="lg:w-80 border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Category Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Calculators</span>
                    <span className="font-semibold text-slate-900">{calculators.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Available Now</span>
                    <span className="font-semibold text-emerald-600">{liveCalculators.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Coming Soon</span>
                    <span className="font-semibold text-amber-600">{comingSoonCalculators.length}</span>
                  </div>
                </div>
                {liveCalculators.length > 0 && (
                  <Link href={liveCalculators[0].href} className="block mt-6">
                    <Button className="w-full gap-2" style={{ backgroundColor: category.color }}>
                      <Sparkles className="size-4" />
                      Start Calculating
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Live Calculators */}
        {liveCalculators.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                  Available Now
                </h2>
                <p className="mt-1 text-slate-600">Ready to use calculators</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                {liveCalculators.length} calculators
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveCalculators.map((calc) => (
                <CalculatorCard key={calc.id} calculator={calc} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Calculators */}
        {comingSoonCalculators.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                  Coming Soon
                </h2>
                <p className="mt-1 text-slate-600">Calculators in development</p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-0">
                {comingSoonCalculators.length} calculators
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoonCalculators.map((calc) => (
                <CalculatorCard key={calc.id} calculator={calc} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="pt-8 border-t border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Explore Other Categories
            </h2>
            <p className="mt-1 text-slate-600">More calculators for your property journey</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCategories.map((cat) => {
              const count = getCalculatorsByCategory(cat.id).length;
              const liveCount = getCalculatorsByCategory(cat.id).filter(c => c.status === 'live').length;
              return (
                <Link key={cat.id} href={`/${cat.slug}`} className="no-underline group">
                  <Card className="h-full border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div
                        className="flex size-12 items-center justify-center rounded-xl mb-4"
                        style={{ backgroundColor: `${cat.color}12` }}
                      >
                        <Calculator className="size-6" style={{ color: cat.color }} />
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {count} calculators · {liveCount} live
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium" style={{ color: cat.color }}>
                        View category
                        <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Back to All */}
        <div className="mt-12 text-center">
          <Link href="/calculators">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to All Calculators
            </Button>
          </Link>
        </div>
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
