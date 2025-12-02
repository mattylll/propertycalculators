'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Sparkles,
  Save,
  RotateCcw,
  Share2,
  Download,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  User,
  Star,
  TrendingUp,
  Building2,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { registry } from '@/lib/calculators/registry';
import {
  CATEGORY_META,
  OutputVariant,
  InputField as InputFieldType,
  CalculatorDefinition,
} from '@/lib/calculators/calculator-types';
import { evaluateThresholds } from '@/lib/calculators/ai-service';
import { formulas } from '@/lib/calculators/formulas';

export default function CalculatorPage() {
  const params = useParams();
  const calculatorSlug = params.calculator as string;

  const calculator = registry.get(calculatorSlug);

  if (!calculator) {
    return <ComingSoonPage slug={calculatorSlug} category={params.category as string} />;
  }

  return <CalculatorRenderer calculator={calculator} />;
}

// ============================================
// COMING SOON PAGE
// ============================================

function ComingSoonPage({ slug, category }: { slug: string; category: string }) {
  const categoryMeta = CATEGORY_META[category as keyof typeof CATEGORY_META];
  const title = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace('Calculator', '')
    .trim();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Link
          href={`/${category}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryMeta?.name || category}
        </Link>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--pc-blue-light)] mb-6">
            <Calculator className="w-8 h-8 text-[var(--pc-blue)]" />
          </div>

          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>

          <h1 className="text-3xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
            {title} Calculator
          </h1>

          <p className="text-lg text-slate-600 max-w-md mx-auto mb-8">
            This calculator is currently being built. Enter your email to be notified when it&apos;s ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="flex-1" />
            <Button variant="default">Notify Me</Button>
          </div>

          <Separator className="my-8" />

          <p className="text-sm text-slate-500 mb-4">In the meantime, try these related calculators:</p>

          <div className="flex flex-wrap justify-center gap-2">
            {registry
              .getByCategory(category as keyof typeof CATEGORY_META)
              .slice(0, 4)
              .map((calc) => (
                <Link key={calc.slug} href={`/${category}/${calc.slug}`}>
                  <Button variant="outline" size="sm">
                    {calc.shortTitle}
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CALCULATOR RENDERER
// ============================================

function CalculatorRenderer({ calculator }: { calculator: CalculatorDefinition }) {
  if (!calculator) return null;

  const [inputs, setInputs] = React.useState<Record<string, number | string | boolean>>(() => {
    const initial: Record<string, number | string | boolean> = {};
    calculator.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    return initial;
  });

  const outputs = React.useMemo(() => {
    try {
      return calculator.calculate(inputs);
    } catch (e) {
      console.error('Calculation error:', e);
      return {};
    }
  }, [calculator, inputs]);

  const formattedOutputs = React.useMemo(() => {
    const formatted: Record<string, string> = {};
    calculator.outputs.forEach((output) => {
      const value = outputs[output.id];
      if (value === undefined) return;

      switch (output.format) {
        case 'currency':
          formatted[output.id] = formulas.utils.formatCurrency(Number(value));
          break;
        case 'percentage':
          formatted[output.id] = formulas.utils.formatPercent(Number(value), output.decimals ?? 2);
          break;
        case 'ratio':
          formatted[output.id] = formulas.utils.formatRatio(Number(value));
          break;
        case 'number':
          formatted[output.id] = Number(value).toLocaleString('en-GB', {
            maximumFractionDigits: output.decimals ?? 0,
          });
          break;
        default:
          formatted[output.id] = String(value);
      }
    });
    return formatted;
  }, [calculator.outputs, outputs]);

  const variants = React.useMemo(() => {
    const v: Record<string, OutputVariant> = {};
    calculator.outputs.forEach((output) => {
      const value = outputs[output.id];
      if (value === undefined || !output.variant) {
        v[output.id] = 'default';
        return;
      }
      if (typeof output.variant === 'function') {
        v[output.id] = output.variant(value);
      } else {
        v[output.id] = output.variant;
      }
    });
    return v;
  }, [calculator.outputs, outputs]);

  const insights = React.useMemo(() => {
    return evaluateThresholds(calculator.ai.thresholds, outputs);
  }, [calculator.ai.thresholds, outputs]);

  const updateInput = (id: string, value: number | string | boolean) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    const initial: Record<string, number | string | boolean> = {};
    calculator.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    setInputs(initial);
  };

  const categoryMeta = CATEGORY_META[calculator.category];
  const primaryOutputs = calculator.outputs.filter((o) => o.isPrimary);
  const secondaryOutputs = calculator.outputs.filter((o) => !o.isPrimary);

  // Get related calculators
  const relatedCalculators = React.useMemo(() => {
    const related = [
      ...calculator.connections.downstream,
      ...calculator.connections.related,
    ].slice(0, 6);
    return related.map((slug) => registry.get(slug)).filter(Boolean) as CalculatorDefinition[];
  }, [calculator.connections]);

  // Get all calculators for the "All calculators" section
  const allCalculators = React.useMemo(() => {
    return registry.all().filter((c) => c.status === 'live' && c.id !== calculator.id).slice(0, 12);
  }, [calculator.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${calculator.category}`} className="hover:text-slate-900">
              {categoryMeta.name}
            </Link>
            <span>/</span>
            <span className="text-slate-900">{calculator.shortTitle}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Title & Meta */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                {calculator.title}
              </h1>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">{calculator.description}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>PropertyCalculators.ai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Updated Dec 2024</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="ml-1">4.9</span>
                </div>
              </div>

              {/* Category Badge & Difficulty */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className="px-3 py-1"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${categoryMeta.color} 15%, transparent)`,
                    color: categoryMeta.color,
                  }}
                >
                  {categoryMeta.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Intermediate
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Clock className="w-3 h-3 mr-1" />2 min
                </Badge>
              </div>
            </div>

            {/* Right: Illustration placeholder */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--pc-blue-light)] to-[var(--pc-blue)]/20 rounded-3xl" />
                <div className="absolute inset-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <Calculator className="w-24 h-24 text-[var(--pc-blue)]/30" />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-slate-900">Live Results</p>
                      <p className="text-slate-500">Real-time</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--pc-blue-light)] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[var(--pc-blue)]" />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-slate-900">AI Analysis</p>
                      <p className="text-slate-500">Included</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Inputs - Left Column */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[var(--pc-blue)]" />
                    Enter Your Details
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {calculator.inputs.map((input) => {
                    if (input.showIf && !input.showIf(inputs)) {
                      return null;
                    }
                    return (
                      <InputField
                        key={input.id}
                        input={input}
                        value={inputs[input.id]}
                        onChange={(value) => updateInput(input.id, value)}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results - Right Column (Sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Results Card */}
              <Card className="shadow-sm border-2 border-[var(--pc-blue)]/20">
                <CardHeader className="border-b border-slate-100 bg-[var(--pc-blue-light)]/30">
                  <CardTitle className="flex items-center gap-2 text-[var(--pc-blue)]">
                    <Sparkles className="w-5 h-5" />
                    Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Primary Results */}
                  {primaryOutputs.map((output) => (
                    <div
                      key={output.id}
                      className={cn(
                        'rounded-xl p-4 border-2',
                        variants[output.id] === 'success' && 'bg-emerald-50 border-emerald-200',
                        variants[output.id] === 'warning' && 'bg-amber-50 border-amber-200',
                        variants[output.id] === 'danger' && 'bg-red-50 border-red-200',
                        variants[output.id] === 'default' && 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <p className="text-sm text-slate-600 mb-1">{output.label}</p>
                      <p
                        className={cn(
                          'text-3xl font-bold tabular-nums',
                          variants[output.id] === 'success' && 'text-emerald-700',
                          variants[output.id] === 'warning' && 'text-amber-700',
                          variants[output.id] === 'danger' && 'text-red-700',
                          variants[output.id] === 'default' && 'text-slate-900'
                        )}
                      >
                        {formattedOutputs[output.id] || '£0.00'}
                      </p>
                    </div>
                  ))}

                  {/* Secondary Results */}
                  {secondaryOutputs.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {secondaryOutputs.map((output) => (
                          <div key={output.id} className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-600">{output.label}</span>
                            <span
                              className={cn(
                                'font-semibold tabular-nums',
                                variants[output.id] === 'success' && 'text-emerald-600',
                                variants[output.id] === 'warning' && 'text-amber-600',
                                variants[output.id] === 'danger' && 'text-red-600',
                                variants[output.id] === 'default' && 'text-slate-900'
                              )}
                            >
                              {formattedOutputs[output.id] || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* CTA Button */}
                  <Button className="w-full mt-4" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Insights */}
              {insights.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {insights.map((insight, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-lg text-sm',
                          insight.type === 'positive' && 'bg-emerald-50 text-emerald-700',
                          insight.type === 'warning' && 'bg-amber-50 text-amber-700',
                          insight.type === 'negative' && 'bg-red-50 text-red-700',
                          insight.type === 'neutral' && 'bg-slate-50 text-slate-700'
                        )}
                      >
                        {insight.message}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Save CTA */}
              <Card className="bg-[var(--pc-navy)] text-white shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Save className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Save this calculation</p>
                      <p className="text-sm text-slate-300">Create a free account to save and compare.</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full bg-white text-[var(--pc-navy)] hover:bg-slate-100">
                    Sign up free
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {calculator.content && (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-16 space-y-16">
            {/* Overview */}
            <section className="max-w-4xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                What is {calculator.shortTitle}?
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">{calculator.content.overview}</p>
            </section>

            {/* How it works */}
            <section className="max-w-4xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                How do I calculate {calculator.shortTitle.toLowerCase()}?
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{calculator.content.methodology}</p>
              </div>
            </section>

            {/* Key Assumptions */}
            {calculator.content.assumptions.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-space-grotesk)]">
                  Key assumptions in this calculation
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {calculator.content.assumptions.map((assumption, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--pc-blue)] text-white flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-slate-600 text-sm">{assumption}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Use Cases */}
            {calculator.content.useCases.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-space-grotesk)]">
                  When to use this calculator
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {calculator.content.useCases.map((useCase, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {calculator.content.faqs.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-space-grotesk)]">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {calculator.content.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium text-slate-900 pr-4">{faq.question}</h3>
                        <span className="flex-shrink-0 text-slate-400 group-open:rotate-180 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-5 pb-5">
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            {calculator.content.disclaimer && (
              <section className="max-w-4xl">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 mb-1">Important Disclaimer</p>
                      <p className="text-sm text-amber-700">{calculator.content.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* All Calculators Section */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center font-[family-name:var(--font-space-grotesk)]">
            All calculators
          </h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {allCalculators.map((calc) => (
              <Link
                key={calc.slug}
                href={`/${calc.category}/${calc.slug}`}
                className="text-sm text-[var(--pc-blue)] hover:underline"
              >
                {calc.shortTitle}
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/calculators">
              <Button variant="outline">See more</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-[var(--pc-navy)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
            Ready to grow your property portfolio?
          </h2>
          <p className="text-slate-300 mb-8">
            Get expert property investment tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            />
            <Button variant="secondary" className="bg-white text-[var(--pc-navy)] hover:bg-slate-100">
              Get started
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Logos */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-center text-sm text-slate-500 mb-6">
            Trusted by property investors across the UK
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">RICS</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">NLA</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">ARLA</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-8 h-8" />
              <span className="font-semibold">Property Investor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INPUT FIELD COMPONENT
// ============================================

interface InputFieldProps {
  input: InputFieldType;
  value: number | string | boolean | undefined;
  onChange: (value: number | string | boolean) => void;
}

function InputField({ input, value, onChange }: InputFieldProps) {
  const id = `input-${input.id}`;

  const formatWithCommas = (num: number | string): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '';
    return n.toLocaleString('en-GB');
  };

  const parseFromCommas = (str: string): number => {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  return (
    <div className={cn('space-y-2', input.type === 'slider' && 'sm:col-span-2')}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-slate-700">
          {input.label}
          {input.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {input.tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{input.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {input.type === 'currency' && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">£</span>
          <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={formatWithCommas(value as number)}
            onChange={(e) => onChange(parseFromCommas(e.target.value))}
            className="pl-8 tabular-nums h-12 text-lg"
          />
        </div>
      )}

      {input.type === 'percentage' && (
        <div className="relative">
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            value={value as number}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9.-]/g, '');
              onChange(parseFloat(cleaned) || 0);
            }}
            className="pr-8 tabular-nums h-12 text-lg"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
        </div>
      )}

      {(input.type === 'number' || input.type === 'integer') && (
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatWithCommas(value as number)}
          onChange={(e) => onChange(parseFromCommas(e.target.value))}
          className="tabular-nums h-12 text-lg"
        />
      )}

      {input.type === 'select' && (
        <Select value={String(value)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {input.options?.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {input.type === 'toggle' && (
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
      )}

      {input.type === 'slider' && (
        <div className="pt-2">
          <Slider
            value={[Number(value) || 0]}
            onValueChange={([v]) => onChange(v)}
            min={input.min || 0}
            max={input.max || 100}
            step={input.step || 1}
          />
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>{formatWithCommas(input.min || 0)}</span>
            <span className="font-medium text-slate-900">{formatWithCommas(value as number)}</span>
            <span>{formatWithCommas(input.max || 100)}</span>
          </div>
        </div>
      )}

      {input.hint && <p className="text-xs text-slate-500">{input.hint}</p>}
    </div>
  );
}
