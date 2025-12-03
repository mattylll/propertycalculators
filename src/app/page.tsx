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
import { Separator } from '@/components/ui/separator';
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
  { name: 'Rental Yield Calculator', href: '/valuation/rental-yield-calculator', category: 'Valuation' },
  { name: 'BRRR Calculator', href: '/creative/brrr', category: 'Creative' },
  { name: 'Development Appraisal', href: '/development/development-appraisal', category: 'Development' },
  { name: 'Bridging Loan Calculator', href: '/bridging/bridging-loan-calculator', category: 'Bridging' },
  { name: 'HMO Viability', href: '/hmo/hmo-viability-calculator', category: 'HMO' },
  { name: 'Lease Extension', href: '/leasehold/lease-extension-calculator', category: 'Leasehold' },
  { name: 'Section 24 Tax', href: '/portfolio/section-24-tax', category: 'Tax' },
  { name: 'DSCR/ICR Calculator', href: '/bridging/dscr-icr-btl', category: 'Finance' },
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

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--pc-blue)]/5 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Content */}
            <div>
              {/* Trust Badge */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-700">4.9/5</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-slate-600">Trusted by 10,000+ UK investors</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight font-[family-name:var(--font-space-grotesk)]">
                Property calculators
                <br />
                <span className="text-[var(--pc-blue)]">that actually work.</span>
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                Free property calculators for UK developers and investors.
                Yields, GDV, ROI, bridging costs, lease extensions, title splits and more.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/calculators">
                  <Button size="lg" className="gap-2 h-12 px-6 text-base shadow-lg">
                    Browse all calculators
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/development">
                  <Button variant="outline" size="lg" className="gap-2 h-12 px-6 text-base">
                    <Play className="w-4 h-4" />
                    Start a deal
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>UK tax rules built-in</span>
                </div>
              </div>
            </div>

            {/* Right: Calculator Card */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[var(--pc-blue)]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              <Card className="relative shadow-2xl border-slate-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--pc-blue)] to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Rental Yield Calculator</h3>
                        <p className="text-xs text-blue-100">Try it now — live results</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Purchase Price */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Purchase Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">£</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={purchasePrice.toLocaleString('en-GB')}
                        onChange={(e) => setPurchasePrice(parseCurrency(e.target.value))}
                        className="pl-8 h-12 text-lg font-semibold tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Rent inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Monthly Rent</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">£</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={monthlyRent.toLocaleString('en-GB')}
                          onChange={(e) => setMonthlyRent(parseCurrency(e.target.value))}
                          className="pl-8 h-11 font-semibold tabular-nums"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-500">Annual Rent</Label>
                      <div className="h-11 flex items-center px-3 rounded-md bg-slate-50 border border-slate-200">
                        <span className="font-semibold text-slate-700 tabular-nums">{formatCurrency(annualRent)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Result */}
                  <div className={cn(
                    "rounded-xl p-4 border-2 transition-all",
                    grossYield >= 5 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Gross Yield</p>
                        <p className={cn("text-3xl font-bold tabular-nums", yieldQuality.color)}>
                          {grossYield.toFixed(2)}%
                        </p>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-semibold",
                        yieldQuality.bg, yieldQuality.color
                      )}>
                        {yieldQuality.label}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href="/valuation/rental-yield-calculator" className="block">
                    <Button className="w-full h-12 gap-2 text-base">
                      <Sparkles className="w-4 h-4" />
                      Full Calculator + AI Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[var(--pc-navy)] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '30+', label: 'Free calculators' },
              { value: '10', label: 'Property categories' },
              { value: '10K+', label: 'Monthly users' },
              { value: '4.9★', label: 'Average rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Calculators */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                Popular calculators
              </h2>
              <p className="text-slate-600 mt-1">Most used by UK property investors</p>
            </div>
            <Link href="/calculators">
              <Button variant="outline" className="gap-2">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCalculators.map((calc) => (
              <Link
                key={calc.name}
                href={calc.href}
                className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-[var(--pc-blue)] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-[var(--pc-blue)]">{calc.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{calc.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--pc-blue)] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Calculator className="w-3 h-3 mr-1" />
              Calculator Library
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Every calculation you need
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              From development appraisals to lease extensions, our calculators cover every aspect of UK property finance.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculatorCategories.map((category) => (
              <Link key={category.title} href={category.href} className="group">
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200 hover:border-[var(--pc-blue)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <category.icon className="h-6 w-6" style={{ color: category.color }} />
                      </div>
                      <Badge variant="secondary">{category.count} calculators</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[var(--pc-blue)] font-[family-name:var(--font-space-grotesk)]">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-[var(--pc-blue)]">
                      View calculators
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Calculator,
                title: 'Pick a calculator',
                description: 'Browse by category or search. GDV, yields, bridging, lease extensions—we\'ve got it.',
              },
              {
                step: '02',
                icon: FileText,
                title: 'Enter your numbers',
                description: 'Fill in the details. Our calculators guide you through each input with helpful tooltips.',
              },
              {
                step: '03',
                icon: Sparkles,
                title: 'Get instant results',
                description: 'See your results immediately with AI-powered insights and recommendations.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card className="h-full text-center p-8">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--pc-blue)] text-white text-xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 font-[family-name:var(--font-space-grotesk)]">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Platform Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                More than numbers.
                <br />
                <span className="text-[var(--pc-blue)]">Smarter decisions.</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Every calculator includes AI-powered analysis. Get instant insights on deal viability,
                risk factors, and recommendations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Brain, title: 'AI Deal Analysis', desc: 'Instant insights on every calculation' },
                  { icon: Database, title: 'Save Your Deals', desc: 'Track and compare scenarios' },
                  { icon: Layers, title: 'Export & Share', desc: 'Download professional reports' },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pc-blue-light)] flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-[var(--pc-blue)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Preview Card */}
            <div className="relative">
              <Card className="shadow-xl border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--pc-blue-light)] to-blue-50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[var(--pc-blue)]" />
                    <span className="text-sm font-semibold text-[var(--pc-blue)]">AI Analysis</span>
                  </div>

                  <div className="space-y-4">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-slate-600 mb-2">Deal Verdict</p>
                        <p className="text-2xl font-bold text-emerald-600">Strong Buy</p>
                        <p className="text-sm text-slate-500 mt-1">7.2% yield exceeds area average of 5.8%</p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                      <Card className="shadow-sm">
                        <CardContent className="p-3 text-center">
                          <p className="text-xs text-slate-500">Gross Yield</p>
                          <p className="text-lg font-bold text-slate-900">7.2%</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardContent className="p-3 text-center">
                          <p className="text-xs text-slate-500">Cash Flow</p>
                          <p className="text-lg font-bold text-emerald-600">+£287/mo</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Passes all BTL criteria</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              Trusted by UK property professionals
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-slate-200 mb-4" />
                  <p className="text-slate-700 mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-[var(--pc-navy)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
              Ready to grow your property portfolio?
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Get expert property investment tips and new calculator alerts delivered to your inbox.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button variant="secondary" className="h-12 bg-white text-[var(--pc-navy)] hover:bg-slate-100">
                Get started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8">
            Built for property professionals across the UK
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-50">
            {['RICS', 'NLA', 'ARLA', 'Property Week', 'Landlord Today'].map((name) => (
              <div key={name} className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-6 h-6" />
                <span className="font-semibold text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
            Ready to run the numbers?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Free calculators for UK property professionals. No signup required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/calculators">
              <Button size="lg" className="gap-2 h-12 px-8">
                Browse all calculators
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/development">
              <Button variant="outline" size="lg" className="gap-2 h-12 px-8">
                Start a deal appraisal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
