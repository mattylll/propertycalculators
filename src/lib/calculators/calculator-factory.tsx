/**
 * Calculator Factory
 *
 * A scalable pattern for generating 300+ calculators from configuration.
 * Each calculator is defined by a schema that specifies inputs, calculations,
 * outputs, AI prompts, and recommended next calculators.
 */

import * as React from 'react';
import type { CalculatorCategory } from './config';

// ============================================
// INPUT FIELD TYPES
// ============================================

export type InputType =
  | 'currency'
  | 'percentage'
  | 'number'
  | 'select'
  | 'slider'
  | 'text'
  | 'toggle'
  | 'date';

export interface InputOption {
  value: string;
  label: string;
}

export interface CalculatorInput {
  id: string;
  label: string;
  type: InputType;
  defaultValue?: string | number | boolean;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  tooltip?: string;

  // Validation
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;

  // Select/Slider specific
  options?: InputOption[];

  // Conditional display
  showIf?: (values: Record<string, unknown>) => boolean;

  // Currency specific
  currency?: string;

  // Suffix/Prefix
  suffix?: string;
  prefix?: string;
}

// ============================================
// OUTPUT FIELD TYPES
// ============================================

export type OutputType =
  | 'currency'
  | 'percentage'
  | 'number'
  | 'ratio'
  | 'text'
  | 'status';

export type OutputVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export interface CalculatorOutput {
  id: string;
  label: string;
  type: OutputType;
  calculation: (inputs: Record<string, unknown>) => number | string;
  format?: (value: number | string) => string;
  variant?: OutputVariant | ((value: number | string) => OutputVariant);
  tooltip?: string;
  showIf?: (inputs: Record<string, unknown>) => boolean;
  isPrimary?: boolean; // Highlight as main result
}

// ============================================
// AI INSIGHT CONFIGURATION
// ============================================

export interface AIInsightConfig {
  // System prompt for generating insights
  systemPrompt: string;

  // Template for user message (uses {{inputId}} for interpolation)
  userPromptTemplate: string;

  // Thresholds for automatic insights
  thresholds?: {
    metric: string;
    operator: '<' | '>' | '==' | '<=' | '>=';
    value: number;
    severity: 'info' | 'success' | 'warning' | 'critical';
    message: string;
  }[];
}

// ============================================
// CALCULATOR SCHEMA
// ============================================

export interface CalculatorSchema {
  // Identity
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: CalculatorCategory;

  // SEO
  keywords: string[];
  metaTitle: string;
  metaDescription: string;

  // Configuration
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  steps?: {
    id: string;
    title: string;
    description?: string;
    inputIds: string[];
  }[];

  // AI Integration
  aiInsight?: AIInsightConfig;

  // Recommendations
  nextCalculators: string[]; // Calculator IDs

  // Workflows this calculator belongs to
  workflows?: string[];

  // Feature flags
  features?: {
    saveToDealProfile?: boolean;
    exportPDF?: boolean;
    shareLink?: boolean;
  };
}

// ============================================
// CALCULATOR REGISTRY
// ============================================

const calculatorRegistry = new Map<string, CalculatorSchema>();

export function registerCalculator(schema: CalculatorSchema): void {
  calculatorRegistry.set(schema.id, schema);
}

export function getCalculatorSchema(id: string): CalculatorSchema | undefined {
  return calculatorRegistry.get(id);
}

export function getAllCalculatorSchemas(): CalculatorSchema[] {
  return Array.from(calculatorRegistry.values());
}

export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorSchema[] {
  return getAllCalculatorSchemas().filter((s) => s.category === category);
}

// ============================================
// CALCULATION ENGINE
// ============================================

export function runCalculations(
  schema: CalculatorSchema,
  inputs: Record<string, unknown>
): Record<string, unknown> {
  const results: Record<string, unknown> = {};

  for (const output of schema.outputs) {
    try {
      if (output.showIf && !output.showIf(inputs)) {
        continue;
      }

      const value = output.calculation(inputs);
      results[output.id] = value;

      if (output.format) {
        results[`${output.id}_formatted`] = output.format(value);
      }

      if (typeof output.variant === 'function') {
        results[`${output.id}_variant`] = output.variant(value);
      } else if (output.variant) {
        results[`${output.id}_variant`] = output.variant;
      }
    } catch (error) {
      console.error(`Error calculating ${output.id}:`, error);
      results[output.id] = null;
    }
  }

  return results;
}

// ============================================
// AI INSIGHT GENERATION
// ============================================

export function generateInsightThresholds(
  schema: CalculatorSchema,
  outputs: Record<string, unknown>
): { severity: string; message: string }[] {
  if (!schema.aiInsight?.thresholds) return [];

  const insights: { severity: string; message: string }[] = [];

  for (const threshold of schema.aiInsight.thresholds) {
    const value = outputs[threshold.metric];
    if (typeof value !== 'number') continue;

    let triggered = false;
    switch (threshold.operator) {
      case '<':
        triggered = value < threshold.value;
        break;
      case '>':
        triggered = value > threshold.value;
        break;
      case '<=':
        triggered = value <= threshold.value;
        break;
      case '>=':
        triggered = value >= threshold.value;
        break;
      case '==':
        triggered = value === threshold.value;
        break;
    }

    if (triggered) {
      insights.push({
        severity: threshold.severity,
        message: threshold.message.replace('{{value}}', String(value)),
      });
    }
  }

  return insights;
}

// ============================================
// FORMAT HELPERS
// ============================================

export const formatters = {
  currency: (value: number, currency = '£'): string => {
    return `${currency}${value.toLocaleString('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  },

  currencyWithPence: (value: number, currency = '£'): string => {
    return `${currency}${value.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

  percentage: (value: number, decimals = 2): string => {
    return `${value.toFixed(decimals)}%`;
  },

  ratio: (value: number, decimals = 2): string => {
    return `${value.toFixed(decimals)}x`;
  },

  number: (value: number, decimals = 0): string => {
    return value.toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  sqft: (value: number): string => {
    return `${value.toLocaleString('en-GB')} sq ft`;
  },

  months: (value: number): string => {
    return `${value} months`;
  },

  years: (value: number): string => {
    return `${value} years`;
  },
};

// ============================================
// VARIANT HELPERS
// ============================================

export const variantRules = {
  // LTV: Lower is better
  ltv: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v <= 60) return 'success';
    if (v <= 75) return 'default';
    if (v <= 85) return 'warning';
    return 'danger';
  },

  // DSCR: Higher is better
  dscr: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v >= 1.45) return 'success';
    if (v >= 1.25) return 'default';
    if (v >= 1.0) return 'warning';
    return 'danger';
  },

  // ICR: Higher is better
  icr: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v >= 145) return 'success';
    if (v >= 125) return 'default';
    if (v >= 100) return 'warning';
    return 'danger';
  },

  // Yield: Higher is better
  yield: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v >= 8) return 'success';
    if (v >= 6) return 'default';
    if (v >= 4) return 'warning';
    return 'danger';
  },

  // Profit on cost: Higher is better
  profitOnCost: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v >= 25) return 'success';
    if (v >= 20) return 'default';
    if (v >= 15) return 'warning';
    return 'danger';
  },

  // Cash flow: Positive is good
  cashFlow: (value: number | string): OutputVariant => {
    const v = Number(value);
    if (v >= 500) return 'success';
    if (v >= 200) return 'default';
    if (v >= 0) return 'warning';
    return 'danger';
  },
};

// ============================================
// EXAMPLE CALCULATOR SCHEMAS
// ============================================

// These would typically be loaded from a database or config files
export const exampleSchemas: CalculatorSchema[] = [
  {
    id: 'btl-yield',
    slug: 'btl-yield-calculator',
    name: 'Buy-to-Let Yield Calculator',
    shortName: 'BTL Yield',
    description: 'Calculate gross and net yields for buy-to-let investments',
    category: 'landlord',
    keywords: ['BTL yield', 'rental yield calculator', 'buy to let return'],
    metaTitle: 'BTL Yield Calculator | PropertyCalculators.ai',
    metaDescription: 'Calculate gross and net rental yields for your buy-to-let property investment.',
    inputs: [
      {
        id: 'purchasePrice',
        label: 'Purchase Price',
        type: 'currency',
        required: true,
        defaultValue: 250000,
        tooltip: 'The total purchase price of the property',
      },
      {
        id: 'monthlyRent',
        label: 'Monthly Rent',
        type: 'currency',
        required: true,
        defaultValue: 1200,
        tooltip: 'Expected monthly rental income',
      },
      {
        id: 'annualCosts',
        label: 'Annual Running Costs',
        type: 'currency',
        defaultValue: 2400,
        hint: 'Insurance, maintenance, management fees, etc.',
      },
      {
        id: 'voidWeeks',
        label: 'Void Weeks per Year',
        type: 'slider',
        min: 0,
        max: 12,
        defaultValue: 2,
        hint: 'Expected empty periods between tenants',
      },
    ],
    outputs: [
      {
        id: 'annualRent',
        label: 'Annual Rent',
        type: 'currency',
        calculation: (inputs) => {
          const monthlyRent = Number(inputs.monthlyRent) || 0;
          const voidWeeks = Number(inputs.voidWeeks) || 0;
          return monthlyRent * 12 * ((52 - voidWeeks) / 52);
        },
        format: (v) => formatters.currency(Number(v)),
      },
      {
        id: 'grossYield',
        label: 'Gross Yield',
        type: 'percentage',
        isPrimary: true,
        calculation: (inputs) => {
          const purchasePrice = Number(inputs.purchasePrice) || 1;
          const monthlyRent = Number(inputs.monthlyRent) || 0;
          return ((monthlyRent * 12) / purchasePrice) * 100;
        },
        format: (v) => formatters.percentage(Number(v)),
        variant: variantRules.yield,
      },
      {
        id: 'netYield',
        label: 'Net Yield',
        type: 'percentage',
        isPrimary: true,
        calculation: (inputs) => {
          const purchasePrice = Number(inputs.purchasePrice) || 1;
          const monthlyRent = Number(inputs.monthlyRent) || 0;
          const annualCosts = Number(inputs.annualCosts) || 0;
          const voidWeeks = Number(inputs.voidWeeks) || 0;
          const effectiveRent = monthlyRent * 12 * ((52 - voidWeeks) / 52);
          return ((effectiveRent - annualCosts) / purchasePrice) * 100;
        },
        format: (v) => formatters.percentage(Number(v)),
        variant: variantRules.yield,
      },
    ],
    aiInsight: {
      systemPrompt: 'You are a property investment analyst. Analyze yield metrics.',
      userPromptTemplate: 'The property has a gross yield of {{grossYield}}% and net yield of {{netYield}}%. Purchase price is {{purchasePrice}}.',
      thresholds: [
        {
          metric: 'grossYield',
          operator: '<',
          value: 5,
          severity: 'warning',
          message: 'Gross yield below 5% may not cover financing costs in a high-rate environment.',
        },
        {
          metric: 'netYield',
          operator: '>=',
          value: 7,
          severity: 'success',
          message: 'Strong net yield of {{value}}% suggests good cash flow potential.',
        },
      ],
    },
    nextCalculators: ['btl-dscr', 'btl-icr', 'section-24'],
    features: {
      saveToDealProfile: true,
      exportPDF: true,
      shareLink: true,
    },
  },
];

// Register example schemas
exampleSchemas.forEach(registerCalculator);
