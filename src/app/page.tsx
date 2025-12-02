'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  Building2,
  PoundSterling,
  BarChart3,
  CheckCircle2,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  Brain,
  Database,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const calculatorCategories = [
  {
    title: 'Development Finance',
    description: 'GDV, build costs, development appraisals, and exit strategies',
    href: '/development',
    icon: Building2,
    count: 12,
    color: 'var(--pc-cat-development)',
  },
  {
    title: 'HMO & Conversion',
    description: 'Viability, licensing, fire safety, and Article 4 analysis',
    href: '/hmo',
    icon: Users,
    count: 9,
    color: 'var(--pc-cat-hmo)',
  },
  {
    title: 'Buy-to-Let & Portfolio',
    description: 'DSCR, ICR, BRRR, Section 24, and portfolio optimisation',
    href: '/landlord',
    icon: PoundSterling,
    count: 7,
    color: 'var(--pc-cat-landlord)',
  },
  {
    title: 'Bridging & Specialty',
    description: 'Bridging loans, auction finance, and refurb bridges',
    href: '/bridging',
    icon: Zap,
    count: 5,
    color: 'var(--pc-cat-bridging)',
  },
  {
    title: 'Leasehold & Title',
    description: 'Lease extensions, marriage value, and enfranchisement',
    href: '/leasehold',
    icon: FileText,
    count: 7,
    color: 'var(--pc-cat-leasehold)',
  },
  {
    title: 'Commercial Property',
    description: 'Commercial yields, ERV, FRI leases, and VAT analysis',
    href: '/commercial',
    icon: BarChart3,
    count: 5,
    color: 'var(--pc-cat-commercial)',
  },
];

const stats = [
  { value: '300+', label: 'Free calculators' },
  { value: '10', label: 'Property categories' },
  { value: '£0', label: 'Always free' },
  { value: '24/7', label: 'Instant results' },
];

const platformFeatures = [
  {
    icon: Brain,
    title: 'AI Deal Analysis',
    description:
      'Get instant insights on your calculations. See what works, what doesn\'t, and why.',
  },
  {
    icon: Database,
    title: 'Save Your Deals',
    description:
      'Create an account to save calculations, compare scenarios, and track your portfolio.',
  },
  {
    icon: Layers,
    title: 'Export & Share',
    description:
      'Download professional reports or share results with partners and lenders.',
  },
];

const Page = () => {
  // Interactive calculator state
  const [purchasePrice, setPurchasePrice] = useState(285000);
  const [monthlyRent, setMonthlyRent] = useState(1450);

  // Calculate derived values
  const annualRent = monthlyRent * 12;
  const grossYield = purchasePrice > 0 ? ((annualRent / purchasePrice) * 100) : 0;

  // Determine yield quality
  const yieldQuality = useMemo(() => {
    if (grossYield >= 8) return { label: 'Excellent', color: 'text-emerald-600' };
    if (grossYield >= 6) return { label: 'Good', color: 'text-emerald-600' };
    if (grossYield >= 5) return { label: 'Fair', color: 'text-amber-600' };
    return { label: 'Low', color: 'text-red-600' };
  }, [grossYield]);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Parse currency input
  const parseCurrency = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--pc-navy)]">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pc-navy)] via-slate-900 to-[var(--pc-navy)]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--pc-blue)] rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-10" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <Badge variant="ai" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                300+ Free Calculators
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl font-[family-name:var(--font-space-grotesk)]">
                Run the numbers.
                <br />
                <span className="text-[var(--pc-blue)]">Know the deal.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
                Every property calculator you need—yields, GDV, bridging costs, lease extensions, and more.
                Free tools built for UK property professionals.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/calculators">
                  <Button variant="accent" size="lg" className="gap-2 shadow-lg shadow-blue-500/25">
                    Browse Calculators
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10 border border-white/20"
                  >
                    View Categories
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>UK-focused</span>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Card */}
            <div className="relative lg:ml-8">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--pc-blue)] to-purple-500 rounded-2xl blur-2xl opacity-30 scale-105" />

              {/* Main calculator card */}
              <Card className="relative shadow-2xl border border-slate-200/50 bg-white overflow-hidden">
                {/* Header with gradient accent */}
                <div className="bg-gradient-to-r from-[var(--pc-blue)] to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">BTL Yield Calculator</h3>
                        <p className="text-xs text-blue-100">Try it now — enter your numbers</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                      Live
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {/* Purchase Price Input */}
                  <div className="space-y-2">
                    <Label htmlFor="hero-purchase-price" className="text-sm font-medium text-slate-700">
                      Purchase Price
                    </Label>
                    <Input
                      id="hero-purchase-price"
                      type="text"
                      inputMode="numeric"
                      value={formatCurrency(purchasePrice)}
                      onChange={(e) => setPurchasePrice(parseCurrency(e.target.value))}
                      className="text-lg font-semibold h-12 border-slate-200 focus:border-[var(--pc-blue)] focus:ring-[var(--pc-blue)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Monthly Rent Input */}
                    <div className="space-y-2">
                      <Label htmlFor="hero-monthly-rent" className="text-sm font-medium text-slate-700">
                        Monthly Rent
                      </Label>
                      <Input
                        id="hero-monthly-rent"
                        type="text"
                        inputMode="numeric"
                        value={formatCurrency(monthlyRent)}
                        onChange={(e) => setMonthlyRent(parseCurrency(e.target.value))}
                        className="font-semibold h-11 border-slate-200 focus:border-[var(--pc-blue)] focus:ring-[var(--pc-blue)]"
                      />
                    </div>
                    {/* Annual Rent (calculated) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-500">Annual Rent</Label>
                      <div className="h-11 flex items-center px-3 rounded-md bg-slate-50 border border-slate-200">
                        <span className="font-semibold text-slate-700">{formatCurrency(annualRent)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Results section */}
                  <div className="pt-2">
                    <div className={cn(
                      "rounded-xl p-4 border transition-colors",
                      grossYield >= 5
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200"
                        : "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            grossYield >= 5 ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            grossYield >= 5 ? "text-emerald-800" : "text-amber-800"
                          )}>
                            Gross Yield
                          </span>
                        </div>
                        <span className={cn("text-3xl font-bold", yieldQuality.color)}>
                          {grossYield.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <Link href="/landlord/rental-yield-calculator" className="block">
                    <Button variant="accent" className="w-full gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Full Calculator + AI Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Floating yield quality badge */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-4 w-4", yieldQuality.color)} />
                    <span className={cn("text-sm font-bold", yieldQuality.color)}>{yieldQuality.label}</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 -left-2 z-10">
                <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-slate-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--pc-blue)]">300+</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Calculators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories Section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="info" className="mb-4">
              <Calculator className="w-3 h-3 mr-1" />
              Calculator Library
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Every calculation you need
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              From development appraisals to lease extensions, our calculators cover every aspect of
              UK property finance.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculatorCategories.map((category) => (
              <Link key={category.title} href={category.href} className="group no-underline">
                <div className="h-full rounded-2xl bg-white border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--pc-blue)]">
                  <div className="flex items-start justify-between">
                    <div
                      className="inline-flex size-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <category.icon className="size-6" style={{ color: category.color }} />
                    </div>
                    <Badge variant="neutral">{category.count} calculators</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-[var(--pc-blue)]">
                    View calculators
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/calculators">
              <Button variant="outline" size="lg" className="gap-2">
                View all 300+ calculators
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Platform Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="ai" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
              <h2 className="mt-4 text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                More than numbers.
                <br />
                <span className="text-[var(--pc-blue)]">Smarter decisions.</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Create a free account to unlock AI-powered insights, save your calculations,
                and build your property portfolio tracker.
              </p>

              <div className="mt-10 space-y-6">
                {platformFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--pc-blue-light)]">
                        <feature.icon className="size-5 text-[var(--pc-blue)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Demo Card */}
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-[var(--pc-blue-light)] to-white border border-[var(--pc-blue)]/20 p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[var(--pc-blue)] animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pc-blue)]">
                    AI Insight Preview
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-sm font-medium text-slate-900">Deal Summary</p>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-[var(--pc-success)]">Good</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Strong yield at 7.2%. Cash flow positive after all costs.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">Gross Yield</p>
                      <p className="text-lg font-semibold text-slate-900">7.2%</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">Net Yield</p>
                      <p className="text-lg font-semibold text-slate-900">5.1%</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--pc-success-light)] rounded-lg border border-[var(--pc-success)]/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--pc-success)]" />
                      <span className="text-sm font-medium text-[var(--pc-success)]">
                        Meets typical BTL criteria
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="neutral" className="mb-4">
              How It Works
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Three steps to clarity
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Pick a calculator',
                description:
                  'Browse by category or search for the calculation you need. GDV, yields, bridging, lease extensions—we\'ve got it.',
              },
              {
                step: '02',
                title: 'Enter your numbers',
                description:
                  'Fill in the details. Our calculators guide you through each input with helpful tooltips and examples.',
              },
              {
                step: '03',
                title: 'Get instant results',
                description:
                  'See your results immediately. Download, share, or save to your account for later.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--pc-navy)] text-white text-xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-[var(--pc-navy)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Built for UK property
              </h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Every calculator is designed specifically for UK property transactions.
                Stamp duty, lease extensions, Section 24—we speak your language.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Instant Results',
                  description: 'No waiting. Get your numbers in seconds, not hours.',
                },
                {
                  icon: Shield,
                  title: 'UK-Specific',
                  description: 'Built for UK tax rules, regulations, and market conventions.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Always Free',
                  description: 'Core calculators are free forever. No credit card required.',
                },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--pc-blue)]">
                      <feature.icon className="size-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
            Ready to run the numbers?
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            300+ free calculators for UK property professionals. No signup required.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/calculators">
              <Button variant="default" size="lg" className="gap-2">
                Browse Calculators
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
