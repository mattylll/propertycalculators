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
  Zap,
  Sparkles,
  Users,
  FileText,
  Brain,
  Database,
  Layers,
  Star,
  Play,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SchemaScript } from '@/components/schema-script';
import { generateWebsiteSchema, generateOrganizationSchema, generateFAQSchema } from '@/lib/schema';

const calculatorCategories = [
  {
    title: 'Development Finance',
    description: 'GDV, build costs, development appraisals, and exit strategies',
    href: '/development',
    icon: Building2,
    count: 12,
    color: '#2563eb',
  },
  {
    title: 'HMO & Conversion',
    description: 'Viability, licensing, fire safety, and Article 4 analysis',
    href: '/hmo',
    icon: Users,
    count: 9,
    color: '#7c3aed',
  },
  {
    title: 'Bridging & Specialty',
    description: 'Bridging loans, auction finance, and refurb bridges',
    href: '/bridging',
    icon: Zap,
    count: 5,
    color: '#ea580c',
  },
  {
    title: 'Leasehold & Title',
    description: 'Lease extensions, marriage value, and enfranchisement',
    href: '/leasehold',
    icon: FileText,
    count: 7,
    color: '#0891b2',
  },
  {
    title: 'Portfolio & Tax',
    description: 'DSCR, ICR, BRRR, Section 24, and portfolio optimisation',
    href: '/portfolio',
    icon: PoundSterling,
    count: 7,
    color: '#059669',
  },
  {
    title: 'Valuation & Analysis',
    description: 'Rental yields, cap rates, and comparable analysis',
    href: '/valuation',
    icon: BarChart3,
    count: 8,
    color: '#dc2626',
  },
];

const testimonials = [
  {
    quote: "Finally, a calculator that understands UK property. The lease extension calculator alone saved me hours of back-and-forth with solicitors.",
    author: "James H.",
    role: "Property Developer, London",
    rating: 5,
  },
  {
    quote: "I use the development appraisal calculator for every deal now. The AI insights are surprisingly accurate.",
    author: "Sarah M.",
    role: "Portfolio Landlord, Manchester",
    rating: 5,
  },
  {
    quote: "The BRRR calculator helped me understand if a deal would actually work before I committed. Essential tool.",
    author: "David P.",
    role: "HMO Investor, Birmingham",
    rating: 5,
  },
];

const popularCalculators = [
  { name: 'BRRR Calculator', href: '/landlord/brrr-calculator', category: 'Landlord' },
  { name: 'GDV Calculator', href: '/development/gdv-calculator', category: 'Development' },
  { name: 'Bridging Loan Calculator', href: '/bridging/bridging-loan-calculator', category: 'Bridging' },
  { name: 'HMO Viability', href: '/hmo/hmo-viability-calculator', category: 'HMO' },
  { name: 'Lease Extension', href: '/leasehold/lease-extension-calculator', category: 'Leasehold' },
  { name: 'Section 24 Tax', href: '/landlord/section-24-tax-impact-calculator', category: 'Landlord' },
  { name: 'BTL DSCR Calculator', href: '/landlord/btl-dscr-calculator', category: 'Landlord' },
  { name: 'Build Cost Calculator', href: '/development/build-cost-calculator', category: 'Development' },
];

const Page = () => {
  const [purchasePrice, setPurchasePrice] = useState(285000);
  const [monthlyRent, setMonthlyRent] = useState(1450);

  const annualRent = monthlyRent * 12;
  const grossYield = purchasePrice > 0 ? ((annualRent / purchasePrice) * 100) : 0;

  const yieldQuality = useMemo(() => {
    if (grossYield >= 8) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (grossYield >= 6) return { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (grossYield >= 5) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
  }, [grossYield]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseCurrency = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // FAQ Schema data
  const faqSchema = generateFAQSchema([
    {
      question: "What property calculators are available?",
      answer: "We offer 30+ free calculators including GDV, build cost, rental yield, lease extension, BRRR, bridging loan, HMO viability, and many more specialist UK property calculators."
    },
    {
      question: "Are the calculators free to use?",
      answer: "Yes, all our property calculators are completely free to use. Some advanced AI-powered analysis features require a free account."
    },
    {
      question: "Are the calculators accurate for UK property?",
      answer: "Yes, all calculators are specifically designed for UK property using BCIS data, Land Registry information, and current market rates."
    },
    {
      question: "Can I save my calculations?",
      answer: "Yes, create a free account to save your calculations, track multiple deals, and access AI-powered market validation."
    }
  ]);

  return (
    <div className="bg-white">
      {/* Schema Markup */}
      <SchemaScript schema={[
        generateWebsiteSchema(),
        generateOrganizationSchema(),
        faqSchema
      ]} />

      {/* Hero Section - Premium Redesign */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Layers */}
        <div className="hero-gradient-mesh" />
        <div className="hero-grid-overlay" />

        {/* Floating Orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Corner Accents */}
        <div className="hero-corner-accent hero-corner-accent-tl" />
        <div className="hero-corner-accent hero-corner-accent-br" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 lg:px-8 w-full">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left: Content */}
            <div className="max-w-2xl">
              {/* Trust Badge */}
              <div className="hero-fade-up hero-fade-up-delay-1">
                <div className="trust-badge-glow inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-sm mb-8">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">4.9/5</span>
                  <span className="w-px h-4 bg-slate-200" />
                  <span className="text-sm text-slate-600">10,000+ UK investors</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="hero-fade-up hero-fade-up-delay-2">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight font-[family-name:var(--font-space-grotesk)]">
                  <span className="text-[var(--pc-navy)]">Property</span>
                  <br />
                  <span className="text-[var(--pc-navy)]">Calculators</span>
                  <span className="text-[var(--pc-blue)]">.</span>
                </h1>
              </div>

              {/* AI Badge */}
              <div className="hero-fade-up hero-fade-up-delay-3 mt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--pc-blue-light)] border border-[var(--pc-blue)]/20">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--pc-blue)]">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[var(--pc-blue)]">AI-Powered Analysis</span>
                </div>
              </div>

              {/* Subheadline */}
              <div className="hero-fade-up hero-fade-up-delay-3">
                <p className="mt-6 text-xl lg:text-2xl text-slate-600 leading-relaxed font-light">
                  Free calculators built for UK property professionals.
                  <span className="text-slate-800 font-normal"> Yields, GDV, bridging, lease extensions</span> and more.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="hero-fade-up hero-fade-up-delay-4 mt-10 flex flex-wrap gap-4">
                <Link href="/calculators">
                  <Button size="lg" className="hero-btn-primary gap-3 h-14 px-8 text-base font-semibold shadow-xl shadow-[var(--pc-blue)]/20">
                    Browse all calculators
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/development">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-3 h-14 px-8 text-base font-semibold bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Start a deal
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="hero-fade-up hero-fade-up-delay-5 mt-12 flex flex-wrap items-center gap-8">
                {[
                  { icon: CheckCircle2, text: 'No signup required' },
                  { icon: CheckCircle2, text: '100% free' },
                  { icon: CheckCircle2, text: 'UK tax rules built-in' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-slate-600">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                      <item.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Premium Calculator Card */}
            <div className="relative hero-fade-up hero-fade-up-delay-3 lg:hero-fade-up-delay-4">
              {/* Card with glow effect */}
              <div className="hero-card-float hero-card-glow relative z-10">
                <div className="hero-glass-card rounded-2xl overflow-hidden">
                  {/* Premium Header */}
                  <div className="hero-card-header px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                          <Calculator className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white tracking-tight">Rental Yield</h3>
                          <p className="text-sm text-slate-300">Try it live</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse" />
                        <span className="text-sm font-medium text-white">Live</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5 bg-white">
                    {/* Purchase Price */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-[11px]">Purchase Price</Label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">£</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={purchasePrice.toLocaleString('en-GB')}
                          onChange={(e) => setPurchasePrice(parseCurrency(e.target.value))}
                          className="pl-10 h-14 text-xl font-bold tabular-nums bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[var(--pc-blue)] focus:ring-[var(--pc-blue)]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Rent inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-[11px]">Monthly Rent</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">£</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={monthlyRent.toLocaleString('en-GB')}
                            onChange={(e) => setMonthlyRent(parseCurrency(e.target.value))}
                            className="pl-10 h-12 text-lg font-bold tabular-nums bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[var(--pc-blue)] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-500 tracking-wide uppercase text-[11px]">Annual</Label>
                        <div className="h-12 flex items-center px-4 rounded-lg bg-slate-100 border border-slate-200">
                          <span className="font-bold text-slate-600 tabular-nums">{formatCurrency(annualRent)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Result - Premium Treatment */}
                    <div className={cn(
                      "yield-result-glow rounded-xl p-5 border-2 transition-all duration-300",
                      grossYield >= 5
                        ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300"
                        : "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300"
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gross Yield</p>
                          <p className={cn("text-4xl font-black tabular-nums tracking-tight", yieldQuality.color)}>
                            {grossYield.toFixed(2)}%
                          </p>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold shadow-sm",
                          grossYield >= 5
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        )}>
                          {yieldQuality.label}
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href="/valuation/rental-yield-calculator" className="block">
                      <Button className="w-full h-14 gap-3 text-base font-semibold bg-[var(--pc-navy)] hover:bg-[var(--pc-navy-light)] shadow-lg shadow-slate-900/10 transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5">
                        <Sparkles className="w-5 h-5" />
                        Full Calculator + AI Analysis
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-[var(--pc-blue)]/10 backdrop-blur-sm border border-[var(--pc-blue)]/20 flex items-center justify-center hero-fade-up hero-fade-up-delay-5">
                <BarChart3 className="w-8 h-8 text-[var(--pc-blue)]" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center hero-fade-up hero-fade-up-delay-5">
                <PoundSterling className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* Stats Bar - Premium */}
      <section className="relative bg-gradient-to-r from-[var(--pc-navy)] via-[var(--pc-navy-light)] to-[var(--pc-navy)] py-8 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: '30+', label: 'Free calculators', icon: Calculator },
              { value: '10', label: 'Property categories', icon: Layers },
              { value: '10K+', label: 'Monthly users', icon: Users },
              { value: '4.9', label: 'Average rating', icon: Star, suffix: '★' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 mb-3 group-hover:bg-white/20 transition-colors">
                  <stat.icon className="w-5 h-5 text-white/80" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight font-[family-name:var(--font-space-grotesk)]">
                  {stat.value}
                  {stat.suffix && <span className="text-amber-400">{stat.suffix}</span>}
                </p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Calculators - Premium */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--pc-blue)]/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="section-badge mb-4">
                <Zap className="w-3.5 h-3.5" />
                Most Popular
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                Popular calculators
              </h2>
              <p className="text-lg text-slate-600 mt-2">Most used by UK property investors</p>
            </div>
            <Link href="/calculators">
              <Button variant="outline" className="gap-2 h-12 px-6 bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-[var(--pc-blue)] transition-all group">
                View all calculators
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCalculators.map((calc, i) => (
              <Link
                key={calc.name}
                href={calc.href}
                className="group relative p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 hover:border-[var(--pc-blue)] hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] transition-colors">{calc.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1.5 px-2 py-0.5 bg-slate-100 rounded-full inline-block">{calc.category}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[var(--pc-blue)] transition-all">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Categories - Bento Grid */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-badge mb-6 mx-auto w-fit">
              <Calculator className="w-3.5 h-3.5" />
              Calculator Library
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Every calculation
              <br />
              <span className="text-[var(--pc-blue)]">you need.</span>
            </h2>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From development appraisals to lease extensions, our calculators cover every aspect of UK property finance.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {calculatorCategories.map((category, i) => (
              <Link
                key={category.title}
                href={category.href}
                className={cn(
                  "group relative overflow-hidden rounded-3xl transition-all duration-500",
                  "bg-white border border-slate-200/80 hover:border-transparent",
                  "hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2",
                  // Make first two items larger on desktop
                  i === 0 && "lg:col-span-2 lg:row-span-1",
                  i === 3 && "lg:col-span-2 lg:row-span-1"
                )}
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${category.color}08 0%, ${category.color}15 100%)` }}
                />

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: category.color }}
                />

                <div className={cn(
                  "relative p-8",
                  (i === 0 || i === 3) && "lg:p-10"
                )}>
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <category.icon className="h-7 w-7" style={{ color: category.color }} />
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      {category.count} calculators
                    </div>
                  </div>

                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-slate-800 font-[family-name:var(--font-space-grotesk)] mb-3">
                    {category.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    {category.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: category.color }}>
                    <span>Explore calculators</span>
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-full group-hover:translate-x-1 transition-transform"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Premium */}
      <section className="relative py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--pc-blue)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="section-badge mb-6 mx-auto w-fit">
              <Play className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Three steps to
              <br />
              <span className="text-[var(--pc-blue)]">clarity.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-24 left-[20%] right-[20%] h-0.5">
              <div className="h-full bg-gradient-to-r from-[var(--pc-blue)] via-purple-500 to-emerald-500 rounded-full opacity-20" />
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--pc-blue)]/30" />
              <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500/30" />
            </div>

            <div className="grid gap-8 lg:gap-12 md:grid-cols-3">
              {[
                {
                  step: '01',
                  icon: Calculator,
                  title: 'Pick a calculator',
                  description: 'Browse by category or search. GDV, yields, bridging, lease extensions—we\'ve got it.',
                  color: 'var(--pc-blue)',
                  gradient: 'from-blue-500 to-blue-600',
                },
                {
                  step: '02',
                  icon: FileText,
                  title: 'Enter your numbers',
                  description: 'Fill in the details. Our calculators guide you through each input with helpful tooltips.',
                  color: '#7c3aed',
                  gradient: 'from-purple-500 to-purple-600',
                },
                {
                  step: '03',
                  icon: Sparkles,
                  title: 'Get instant results',
                  description: 'See your results immediately with AI-powered insights and recommendations.',
                  color: '#059669',
                  gradient: 'from-emerald-500 to-emerald-600',
                },
              ].map((item, i) => (
                <div key={item.step} className="relative group">
                  <div className="step-card h-full text-center p-10 lg:p-12">
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${item.color}15 0%, transparent 70%)`
                      }}
                    />

                    {/* Step number */}
                    <div className="relative inline-block mb-8">
                      <div className={cn(
                        "step-number bg-gradient-to-br",
                        item.gradient
                      )}>
                        {item.step}
                      </div>
                      {/* Icon floating beside */}
                      <div
                        className="absolute -right-3 -top-3 w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-lg border border-slate-100 group-hover:scale-110 transition-transform"
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-lg leading-relaxed">{item.description}</p>

                    {/* Mobile connector */}
                    {i < 2 && (
                      <div className="md:hidden flex justify-center mt-8">
                        <div className="w-0.5 h-8 bg-gradient-to-b from-slate-200 to-transparent" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Platform Preview - Premium */}
      <section className="relative py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--pc-blue)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <div className="section-badge mb-6 inline-flex">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] tracking-tight leading-[1.1]">
                More than numbers.
                <br />
                <span className="text-[var(--pc-blue)]">Smarter decisions.</span>
              </h2>

              <p className="mt-8 text-xl text-slate-600 leading-relaxed">
                Every calculator includes AI-powered analysis. Get instant insights on deal viability,
                risk factors, and recommendations.
              </p>

              <div className="mt-12 space-y-6">
                {[
                  { icon: Brain, title: 'AI Deal Analysis', desc: 'Instant insights on every calculation', color: 'var(--pc-blue)' },
                  { icon: Database, title: 'Save Your Deals', desc: 'Track and compare scenarios', color: '#7c3aed' },
                  { icon: Layers, title: 'Export & Share', desc: 'Download professional reports', color: '#059669' },
                ].map((feature, i) => (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-5 p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50 -ml-4"
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Preview Card - Premium */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 ai-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--pc-blue)]/20 to-purple-500/20 rounded-3xl blur-3xl transform scale-110" />
              </div>

              <div className="ai-preview-card relative">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[var(--pc-navy)] to-slate-800 px-8 py-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">AI Analysis</p>
                      <p className="text-slate-400 text-sm">Powered by Claude</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-400">Live</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-5 bg-gradient-to-br from-white to-slate-50">
                  {/* Main verdict */}
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deal Verdict</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tight">Strong Buy</p>
                        <p className="text-sm text-slate-600 mt-2">7.2% yield exceeds area average of 5.8%</p>
                      </div>
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Gross Yield', value: '7.2%', color: 'text-slate-900' },
                      { label: 'Cash Flow', value: '+£287/mo', color: 'text-emerald-600' },
                    ].map((metric) => (
                      <div key={metric.label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{metric.label}</p>
                        <p className={cn("text-2xl font-bold tabular-nums", metric.color)}>{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2.5">
                    {['Passes all BTL criteria', 'DSCR: 1.45 (min 1.25)', 'Area demand: High'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Premium */}
      <section className="relative py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/30 to-white" />

        {/* Decorations */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[var(--pc-blue)]/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-badge mb-6 mx-auto w-fit">
              <Star className="w-3.5 h-3.5 fill-current" />
              Testimonials
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Trusted by UK
              <br />
              <span className="text-[var(--pc-blue)]">property professionals.</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="group testimonial-card p-8 lg:p-10">
                {/* Quote decoration */}
                <div className="quote-decoration" />

                {/* Stars */}
                <div className="relative flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-10 h-10 text-slate-100 -z-10" />
                  <p className="text-lg text-slate-700 leading-relaxed mb-8">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-slate-600">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Verified reviews</span>
            </div>
            <span className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-medium">4.9 average rating</span>
            </div>
            <span className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--pc-blue)]" />
              <span className="font-medium">10,000+ users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA - Premium */}
      <section className="newsletter-gradient py-24">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Zap className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Ready to grow your
              <br />
              <span className="text-[var(--pc-blue-muted)]">property portfolio?</span>
            </h2>

            <p className="mt-6 text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
              Get expert property investment tips and new calculator alerts delivered to your inbox.
            </p>

            {/* Email form */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 pl-5 pr-4 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20 focus:border-white/40 transition-all text-base"
                />
              </div>
              <Button className="h-14 px-8 bg-white text-[var(--pc-navy)] hover:bg-slate-100 rounded-xl font-semibold text-base shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all hover:-translate-y-0.5">
                Subscribe
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Privacy note */}
            <p className="mt-6 text-sm text-slate-400">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Logos - Premium */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 mb-10">
            Built for property professionals across the UK
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            {[
              { name: 'RICS', icon: Building2 },
              { name: 'NLA', icon: Users },
              { name: 'ARLA', icon: FileText },
              { name: 'Property Week', icon: BarChart3 },
              { name: 'Landlord Today', icon: PoundSterling },
            ].map((item) => (
              <div key={item.name} className="trust-logo flex items-center gap-3 text-slate-400 hover:text-[var(--pc-blue)] cursor-pointer transition-all duration-300">
                <item.icon className="w-6 h-6" />
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Premium */}
      <section className="final-cta-bg relative py-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--pc-blue)]/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pc-blue)]/10 border border-[var(--pc-blue)]/20 mb-8">
            <Calculator className="w-4 h-4 text-[var(--pc-blue)]" />
            <span className="text-sm font-semibold text-[var(--pc-blue)]">30+ Free Calculators</span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] tracking-tight leading-[1.1]">
            Ready to run
            <br />
            <span className="text-[var(--pc-blue)]">the numbers?</span>
          </h2>

          <p className="mt-8 text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Free calculators for UK property professionals. No signup required.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/calculators">
              <Button size="lg" className="hero-btn-primary gap-3 h-16 px-10 text-lg font-semibold shadow-xl shadow-[var(--pc-blue)]/20 rounded-2xl">
                Browse all calculators
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/development">
              <Button variant="outline" size="lg" className="gap-3 h-16 px-10 text-lg font-semibold bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all">
                <Play className="w-5 h-5" />
                Start a deal appraisal
              </Button>
            </Link>
          </div>

          {/* Bottom trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: CheckCircle2, text: 'No signup required', color: 'emerald' },
              { icon: CheckCircle2, text: '100% free', color: 'emerald' },
              { icon: CheckCircle2, text: 'UK tax rules built-in', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-600">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                  <item.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
