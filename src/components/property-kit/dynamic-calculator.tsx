'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Sparkles, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  type CalculatorSchema,
  type OutputVariant,
  runCalculations,
  generateInsightThresholds,
  getCalculatorSchema,
} from '@/lib/calculators/calculator-factory';
import {
  CurrencyInput,
  PercentageInput,
  NumberInput,
  SelectInput,
  SliderInput,
} from './calculator-input';
import { AIInsight } from './ai-insight';
import { MetricCard } from './metric-card';

interface DynamicCalculatorProps {
  calculatorId: string;
  onSave?: (inputs: Record<string, unknown>, outputs: Record<string, unknown>) => void;
  className?: string;
}

export function DynamicCalculator({
  calculatorId,
  onSave,
  className,
}: DynamicCalculatorProps) {
  const schema = getCalculatorSchema(calculatorId);

  if (!schema) {
    return (
      <Card className="p-8 text-center">
        <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Calculator Not Found</h2>
        <p className="text-muted-foreground">The calculator "{calculatorId}" doesn't exist.</p>
      </Card>
    );
  }

  return <CalculatorRenderer schema={schema} onSave={onSave} className={className} />;
}

interface CalculatorRendererProps {
  schema: CalculatorSchema;
  onSave?: (inputs: Record<string, unknown>, outputs: Record<string, unknown>) => void;
  className?: string;
}

function CalculatorRenderer({ schema, onSave, className }: CalculatorRendererProps) {
  // Initialize inputs with defaults
  const [inputs, setInputs] = React.useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    schema.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    return initial;
  });

  // Calculate outputs
  const outputs = React.useMemo(() => runCalculations(schema, inputs), [schema, inputs]);

  // Generate threshold-based insights
  const thresholdInsights = React.useMemo(
    () => generateInsightThresholds(schema, outputs),
    [schema, outputs]
  );

  // Update input handler
  const updateInput = (id: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Reset to defaults
  const handleReset = () => {
    const initial: Record<string, unknown> = {};
    schema.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    setInputs(initial);
  };

  // Save handler
  const handleSave = () => {
    onSave?.(inputs, outputs);
  };

  // Get primary outputs
  const primaryOutputs = schema.outputs.filter((o) => o.isPrimary);
  const secondaryOutputs = schema.outputs.filter((o) => !o.isPrimary);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge variant={schema.category as any} className="mb-2">
            {schema.category}
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">{schema.name}</h1>
          <p className="text-muted-foreground mt-1">{schema.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          {onSave && (
            <Button variant="accent" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pc-blue-light)]">
                <Calculator className="w-5 h-5 text-[var(--pc-blue)]" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Inputs</h2>
                <p className="text-sm text-muted-foreground">Enter your property details</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {schema.inputs.map((input) => {
                // Check conditional display
                if (input.showIf && !input.showIf(inputs)) {
                  return null;
                }

                // Render appropriate input type
                switch (input.type) {
                  case 'currency':
                    return (
                      <CurrencyInput
                        key={input.id}
                        label={input.label}
                        value={Number(inputs[input.id]) || 0}
                        onChange={(v) => updateInput(input.id, v)}
                        hint={input.hint}
                        tooltip={input.tooltip}
                        required={input.required}
                        currency={input.currency}
                      />
                    );

                  case 'percentage':
                    return (
                      <PercentageInput
                        key={input.id}
                        label={input.label}
                        value={Number(inputs[input.id]) || 0}
                        onChange={(v) => updateInput(input.id, v)}
                        hint={input.hint}
                        tooltip={input.tooltip}
                        required={input.required}
                        min={input.min}
                        max={input.max}
                        step={input.step}
                      />
                    );

                  case 'number':
                    return (
                      <NumberInput
                        key={input.id}
                        label={input.label}
                        value={Number(inputs[input.id]) || 0}
                        onChange={(v) => updateInput(input.id, v)}
                        hint={input.hint}
                        tooltip={input.tooltip}
                        required={input.required}
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        suffix={input.suffix}
                        prefix={input.prefix}
                      />
                    );

                  case 'select':
                    return (
                      <SelectInput
                        key={input.id}
                        label={input.label}
                        value={String(inputs[input.id] || '')}
                        onChange={(v) => updateInput(input.id, v)}
                        options={input.options || []}
                        hint={input.hint}
                        tooltip={input.tooltip}
                        required={input.required}
                      />
                    );

                  case 'slider':
                    return (
                      <SliderInput
                        key={input.id}
                        label={input.label}
                        value={Number(inputs[input.id]) || 0}
                        onChange={(v) => updateInput(input.id, v)}
                        min={input.min || 0}
                        max={input.max || 100}
                        step={input.step}
                        hint={input.hint}
                        tooltip={input.tooltip}
                        required={input.required}
                        className="sm:col-span-2"
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pc-success-light)]">
                <Calculator className="w-5 h-5 text-[var(--pc-success)]" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Results</h2>
                <p className="text-sm text-muted-foreground">Calculated metrics</p>
              </div>
            </div>

            {/* Primary Results */}
            {primaryOutputs.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {primaryOutputs.map((output) => {
                  const value = outputs[output.id];
                  const formatted = outputs[`${output.id}_formatted`] || value;
                  const variant = outputs[`${output.id}_variant`] as OutputVariant | undefined;

                  return (
                    <MetricCard
                      key={output.id}
                      label={output.label}
                      value={String(formatted)}
                      variant={variant === 'success' ? 'success' : variant === 'warning' ? 'warning' : variant === 'danger' ? 'danger' : 'primary'}
                      size="lg"
                    />
                  );
                })}
              </div>
            )}

            {/* Secondary Results */}
            {secondaryOutputs.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="grid sm:grid-cols-3 gap-4">
                  {secondaryOutputs.map((output) => {
                    const value = outputs[output.id];
                    const formatted = outputs[`${output.id}_formatted`] || value;

                    return (
                      <div key={output.id} className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {output.label}
                        </p>
                        <p className="text-lg font-semibold text-foreground tabular-nums">
                          {String(formatted)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          {thresholdInsights.length > 0 && (
            <AIInsight
              title="AI Analysis"
              summary={thresholdInsights[0].message}
              severity={thresholdInsights[0].severity as any}
              recommendations={thresholdInsights.slice(1).map((i) => i.message)}
            />
          )}

          {/* Next Calculators */}
          {schema.nextCalculators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--pc-blue)]" />
                <h3 className="font-semibold text-foreground">Recommended Next</h3>
              </div>
              <div className="space-y-3">
                {schema.nextCalculators.map((calcId) => {
                  const nextSchema = getCalculatorSchema(calcId);
                  if (!nextSchema) return null;

                  return (
                    <Link key={calcId} href={`/${nextSchema.category}/${nextSchema.slug}`} className="block group">
                      <Card interactive className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant={nextSchema.category as any} className="mb-1">
                              {nextSchema.category}
                            </Badge>
                            <h4 className="font-medium text-foreground group-hover:text-[var(--pc-blue)] transition-colors">
                              {nextSchema.shortName}
                            </h4>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[var(--pc-blue)] transition-colors" />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
