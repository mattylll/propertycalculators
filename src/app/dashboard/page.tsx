"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Plus,
  Sparkles,
  Calculator,
  TrendingUp,
  Wallet,
  FileText,
  LayoutDashboard,
  Target,
  Clock,
  ChevronRight,
  Building2,
  Briefcase,
  PieChart,
} from 'lucide-react';

const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <li className="font-medium text-slate-900">Dashboard</li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--pc-blue)]/10">
                  <LayoutDashboard className="size-6 text-[var(--pc-blue)]" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  <Clock className="mr-1 size-3" />
                  Coming Soon
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-[family-name:var(--font-space-grotesk)]">
                Deal Dashboard
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Track your property deals, AI summaries, and finance application status.
              </p>
            </div>
            <Link href="/development">
              <Button size="lg" className="gap-2 bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90">
                <Plus className="size-4" />
                New Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100">
                  <Briefcase className="size-5 text-slate-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Deals</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-500 mt-1">Active deals</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
                  <TrendingUp className="size-5 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">GDV</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">£0</p>
                <p className="text-sm text-slate-500 mt-1">Total GDV</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <PieChart className="size-5 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Margin</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">0%</p>
                <p className="text-sm text-slate-500 mt-1">Avg profit on cost</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                  <FileText className="size-5 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Ready</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-500 mt-1">Finance ready</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Your Deals
            </h2>
          </div>

          {/* Empty State */}
          <Card className="border-slate-200 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 mb-6">
                <Building2 className="size-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No deals yet</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                Start by creating a new deal with a development appraisal. We'll guide you through
                GDV, build costs, and finance structuring.
              </p>
              <Link href="/development">
                <Button size="lg" className="gap-2 bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90">
                  <Plus className="size-4" />
                  Create Your First Deal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] mb-6">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/development" className="group no-underline">
              <Card className="h-full border-slate-200 hover:border-[var(--pc-blue)] hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--pc-blue)]/10 mb-4">
                    <Target className="size-6 text-[var(--pc-blue)]" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                    Start New Deal
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Begin with development type selection and flow through all calculators.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-[var(--pc-blue)]">
                    Get started
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/calculators" className="group no-underline">
              <Card className="h-full border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 mb-4">
                    <Calculator className="size-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Browse Calculators
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Access 300+ property calculators for any analysis you need.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
                    Browse all
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full border-slate-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100">
                    <Sparkles className="size-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Soon</Badge>
                </div>
                <h3 className="font-semibold text-slate-900">
                  AI Insights
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Get AI-powered recommendations and analysis for your deals.
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-purple-600">
                  Coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Popular Calculators */}
        <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Popular Calculators
            </h2>
            <Link href="/calculators" className="text-sm font-medium text-[var(--pc-blue)] hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Rental Yield', href: '/valuation/rental-yield-calculator', color: '#10B981' },
              { name: 'DSCR Calculator', href: '/bridging/dscr-icr-btl-calculator', color: '#3B82F6' },
              { name: 'GDV Calculator', href: '/development/gdv-calculator', color: '#8B5CF6' },
              { name: 'Build Cost', href: '/development/build-cost-calculator', color: '#F59E0B' },
            ].map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${calc.color}15` }}
                >
                  <Calculator className="size-5" style={{ color: calc.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">
                    {calc.name}
                  </p>
                  <p className="text-xs text-slate-500">Calculator</p>
                </div>
                <ArrowRight className="size-4 text-slate-400 group-hover:text-[var(--pc-blue)] transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
