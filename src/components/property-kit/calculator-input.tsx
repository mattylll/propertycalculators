'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BaseInputProps {
  label: string;
  hint?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// Currency Input
interface CurrencyInputProps extends BaseInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function CurrencyInput({
  label,
  hint,
  tooltip,
  error,
  required,
  value,
  onChange,
  currency = '£',
  min,
  max,
  step = 1000,
  className,
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.-]/g, '');
    const numValue = parseFloat(rawValue) || 0;
    onChange(numValue);
  };

  const formatValue = (val: number) => {
    return val.toLocaleString('en-GB');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <LabelWithTooltip label={label} tooltip={tooltip} required={required} hint={hint} />
      <Input
        type="text"
        value={`${currency}${formatValue(value)}`}
        onChange={handleChange}
        error={!!error}
        className="tabular-nums"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Percentage Input
interface PercentageInputProps extends BaseInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
}

export function PercentageInput({
  label,
  hint,
  tooltip,
  error,
  required,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  showSlider = false,
  className,
}: PercentageInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <LabelWithTooltip label={label} tooltip={tooltip} required={required} hint={hint} />
      <div className="space-y-3">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          suffix="%"
          error={!!error}
          className="tabular-nums"
        />
        {showSlider && (
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={min}
            max={max}
            step={step}
          />
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Number Input with formatting
interface NumberInputProps extends BaseInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

export function NumberInput({
  label,
  hint,
  tooltip,
  error,
  required,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
  className,
}: NumberInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <LabelWithTooltip label={label} tooltip={tooltip} required={required} hint={hint} />
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
        icon={prefix ? <span className="text-muted-foreground">{prefix}</span> : undefined}
        error={!!error}
        className="tabular-nums"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Select Input
interface SelectInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectInput({
  label,
  hint,
  tooltip,
  error,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
}: SelectInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <LabelWithTooltip label={label} tooltip={tooltip} required={required} hint={hint} />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger error={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Slider Input with labels
interface SliderInputProps extends BaseInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  showMinMax?: boolean;
}

export function SliderInput({
  label,
  hint,
  tooltip,
  error,
  required,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  showMinMax = true,
  className,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <LabelWithTooltip label={label} tooltip={tooltip} required={required} hint={hint} />
        <span className="text-sm font-semibold text-foreground tabular-nums">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      {showMinMax && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Helper component for label with tooltip
function LabelWithTooltip({
  label,
  tooltip,
  required,
  hint,
}: {
  label: string;
  tooltip?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label required={required} hint={hint}>
        {label}
      </Label>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
