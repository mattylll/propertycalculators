'use client';

import Link from 'next/link';
import { ChevronRight, Sparkles, Calculator, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalculatorPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  categoryColor?: string;
  badges?: Array<{ label: string; variant?: 'success' | 'info' | 'warning' | 'neutral' }>;
  showTrustSignals?: boolean;
}

export function CalculatorPageLayout({
  children,
  title,
  description,
  category,
  categorySlug,
  categoryColor = '#3B82F6',
  badges = [],
  showTrustSignals = true,
}: CalculatorPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200/60">
        {/* Animated Background */}
        <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
        <div
          className="hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}80 100%)` }}
        />
        <div
          className="hero-orb-2 absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: `linear-gradient(135deg, ${categoryColor}60 0%, ${categoryColor}30 100%)` }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          {/* Breadcrumb */}
          <nav className="hero-fade-up mb-6">
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
              <li>
                <Link
                  href={`/${categorySlug}`}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {category}
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li className="font-medium text-slate-900 truncate max-w-[200px]">{title}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 max-w-3xl">
              {/* Badges */}
              <div className="hero-fade-up flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${categoryColor}15`,
                    color: categoryColor,
                  }}
                >
                  <Calculator className="size-3.5" />
                  {category}
                </span>
                {badges.map((badge, i) => (
                  <Badge
                    key={i}
                    className={cn(
                      'text-xs font-semibold border-0',
                      badge.variant === 'success' && 'bg-emerald-100 text-emerald-700',
                      badge.variant === 'info' && 'bg-blue-100 text-blue-700',
                      badge.variant === 'warning' && 'bg-amber-100 text-amber-700',
                      (!badge.variant || badge.variant === 'neutral') && 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="hero-fade-up-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                {title}
              </h1>

              {/* Description */}
              <p className="hero-fade-up-3 mt-4 text-lg text-slate-600 leading-relaxed">
                {description}
              </p>

              {/* Trust Signals */}
              {showTrustSignals && (
                <div className="hero-fade-up-4 mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm text-sm">
                    <Sparkles className="size-4 text-amber-500" />
                    <span className="font-medium text-slate-700">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm text-sm">
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-slate-700">Free to use</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
