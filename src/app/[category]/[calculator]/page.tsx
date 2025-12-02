'use client';

import * as React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
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
  OutputField as OutputFieldType,
  CalculatorDefinition,
} from '@/lib/calculators/calculator-types';
import { evaluateThresholds } from '@/lib/calculators/ai-service';
import { formulas } from '@/lib/calculators/formulas';

export default function CalculatorPage() {
  const params = useParams();
  const calculatorSlug = params.calculator as string;

  const calculator = registry.get(calculatorSlug);

  if (!calculator) {
    // Show coming soon page for unimplemented calculators
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Link
          href={`/${category}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryMeta?.name || category}
        </Link>

        <div className="rounded-2xl bg-white border border-slate-200 p-12 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--pc-blue-light)] mb-6">
            <Calculator className="w-8 h-8 text-[var(--pc-blue)]" />
          </div>

          <Badge variant="ai" className="mb-4">
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
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button variant="default">
              Notify Me
            </Button>
          </div>

          <Separator className="my-8" />

          <p className="text-sm text-slate-500 mb-4">
            In the meantime, try these related calculators:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {registry.getByCategory(category as keyof typeof CATEGORY_META).slice(0, 4).map((calc) => (
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

  // Initialize inputs with defaults
  const [inputs, setInputs] = React.useState<Record<string, number | string | boolean>>(() => {
    const initial: Record<string, number | string | boolean> = {};
    calculator.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    return initial;
  });

  // Calculate outputs
  const outputs = React.useMemo(() => {
    try {
      return calculator.calculate(inputs);
    } catch (e) {
      console.error('Calculation error:', e);
      return {};
    }
  }, [calculator, inputs]);

  // Format outputs
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

  // Get output variants
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

  // Get threshold insights
  const insights = React.useMemo(() => {
    return evaluateThresholds(calculator.ai.thresholds, outputs);
  }, [calculator.ai.thresholds, outputs]);

  // Update input handler
  const updateInput = (id: string, value: number | string | boolean) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Reset handler
  const handleReset = () => {
    const initial: Record<string, number | string | boolean> = {};
    calculator.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    setInputs(initial);
  };

  // Get category meta
  const categoryMeta = CATEGORY_META[calculator.category];
  const primaryOutputs = calculator.outputs.filter((o) => o.isPrimary);
  const secondaryOutputs = calculator.outputs.filter((o) => !o.isPrimary);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href={`/${calculator.category}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {categoryMeta.name}
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <Badge
                className="mb-3"
                style={{
                  backgroundColor: `color-mix(in srgb, ${categoryMeta.color} 15%, transparent)`,
                  color: categoryMeta.color,
                }}
              >
                {categoryMeta.name}
              </Badge>
              <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                {calculator.title}
              </h1>
              <p className="text-slate-600 mt-1 max-w-2xl">{calculator.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Inputs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {calculator.inputs.map((input) => {
                    // Check conditional display
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

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--pc-blue)]" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Primary Results */}
                {primaryOutputs.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {primaryOutputs.map((output) => (
                      <OutputCard
                        key={output.id}
                        label={output.label}
                        value={formattedOutputs[output.id] || '-'}
                        variant={variants[output.id]}
                        isPrimary
                        tooltip={output.tooltip}
                      />
                    ))}
                  </div>
                )}

                {/* Secondary Results */}
                {secondaryOutputs.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid sm:grid-cols-3 gap-4">
                      {secondaryOutputs.map((output) => (
                        <OutputCard
                          key={output.id}
                          label={output.label}
                          value={formattedOutputs[output.id] || '-'}
                          variant={variants[output.id]}
                          tooltip={output.tooltip}
                        />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[var(--pc-blue)]" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Related Calculators */}
            {calculator.connections.downstream.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {calculator.connections.downstream.slice(0, 3).map((slug) => {
                    const related = registry.get(slug);
                    if (!related) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/${related.category}/${related.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-[var(--pc-blue)]">
                            {related.shortTitle}
                          </p>
                          <p className="text-xs text-slate-500">{CATEGORY_META[related.category].name}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--pc-blue)]" />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Save CTA */}
            <Card className="bg-[var(--pc-navy)] text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Save this calculation</p>
                    <p className="text-sm text-slate-300">Create a free account to save and compare deals.</p>
                  </div>
                </div>
                <Button variant="accent" className="w-full">
                  Sign up free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Sections for SEO */}
        {calculator.content && (
          <div className="mt-16 space-y-12 border-t border-slate-200 pt-12">
            {/* Overview Section */}
            <section className="max-w-4xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                About This Calculator
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed">{calculator.content.overview}</p>
              </div>
            </section>

            {/* Methodology Section */}
            <section className="max-w-4xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                How It Works
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{calculator.content.methodology}</p>
              </div>
            </section>

            {/* Assumptions Section */}
            {calculator.content.assumptions.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  Key Assumptions
                </h2>
                <ul className="space-y-3">
                  {calculator.content.assumptions.map((assumption, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--pc-blue-light)] text-[var(--pc-blue)] flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="text-slate-600">{assumption}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Use Cases Section */}
            {calculator.content.useCases.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-space-grotesk)]">
                  When to Use This Calculator
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {calculator.content.useCases.map((useCase, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white border border-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs Section */}
            {calculator.content.faqs.length > 0 && (
              <section className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-space-grotesk)]">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {calculator.content.faqs.map((faq, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                          <h3 className="font-medium text-slate-900 pr-4">{faq.question}</h3>
                          <span className="flex-shrink-0 text-slate-400 group-open:rotate-180 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </summary>
                        <div className="px-4 pb-4">
                          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            {calculator.content.disclaimer && (
              <section className="max-w-4xl">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
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
        )}
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

  // Format number with commas for display
  const formatWithCommas = (num: number | string): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '';
    return n.toLocaleString('en-GB');
  };

  // Parse string with commas back to number
  const parseFromCommas = (str: string): number => {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  return (
    <div className={cn('space-y-2', input.type === 'slider' && 'sm:col-span-2')}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
          <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={formatWithCommas(value as number)}
            onChange={(e) => onChange(parseFromCommas(e.target.value))}
            className="pl-7 tabular-nums"
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
            className="pr-7 tabular-nums"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
        </div>
      )}

      {(input.type === 'number' || input.type === 'integer') && (
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatWithCommas(value as number)}
          onChange={(e) => onChange(parseFromCommas(e.target.value))}
          className="tabular-nums"
        />
      )}

      {input.type === 'select' && (
        <Select
          value={String(value)}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger>
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
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
        />
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
            <span className="font-medium">{formatWithCommas(value as number)}</span>
            <span>{formatWithCommas(input.max || 100)}</span>
          </div>
        </div>
      )}

      {input.hint && (
        <p className="text-xs text-slate-500">{input.hint}</p>
      )}
    </div>
  );
}

// ============================================
// OUTPUT CARD COMPONENT
// ============================================

interface OutputCardProps {
  label: string;
  value: string;
  variant: OutputVariant;
  isPrimary?: boolean;
  tooltip?: string;
}

function OutputCard({ label, value, variant, isPrimary, tooltip }: OutputCardProps) {
  const variantStyles: Record<OutputVariant, string> = {
    default: 'bg-slate-50 border-slate-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const variantTextStyles: Record<OutputVariant, string> = {
    default: 'text-slate-900',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantStyles[variant],
        isPrimary && 'ring-2 ring-offset-2',
        isPrimary && variant === 'success' && 'ring-emerald-500',
        isPrimary && variant === 'warning' && 'ring-amber-500',
        isPrimary && variant === 'danger' && 'ring-red-500',
        isPrimary && variant === 'default' && 'ring-[var(--pc-blue)]'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-slate-600">{label}</p>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className={cn('text-2xl font-bold tabular-nums', variantTextStyles[variant])}>
        {value}
      </p>
    </div>
  );
}

// ============================================
// INSIGHT CARD COMPONENT
// ============================================

interface InsightCardProps {
  insight: {
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    message: string;
  };
}

function InsightCard({ insight }: InsightCardProps) {
  const icons = {
    positive: CheckCircle2,
    negative: AlertTriangle,
    neutral: Info,
    warning: AlertTriangle,
  };

  const styles = {
    positive: 'bg-emerald-50 border-l-emerald-500 text-emerald-700',
    negative: 'bg-red-50 border-l-red-500 text-red-700',
    neutral: 'bg-slate-50 border-l-slate-400 text-slate-700',
    warning: 'bg-amber-50 border-l-amber-500 text-amber-700',
  };

  const Icon = icons[insight.type];

  return (
    <div className={cn('p-3 rounded-lg border-l-4', styles[insight.type])}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{insight.message}</p>
      </div>
    </div>
  );
}
