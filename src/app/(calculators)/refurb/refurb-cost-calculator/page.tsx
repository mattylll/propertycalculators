"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import {
    Calculator,
    Hammer,
    Home,
    PoundSterling,
    Info,
    CheckCircle2,
} from 'lucide-react';

type RefurbFormState = {
    propertySize: string;
    refurbLevel: 'light' | 'medium' | 'heavy' | 'structural';
    region: 'london' | 'southeast' | 'midlands' | 'north' | 'scotland' | 'wales';
    kitchen: boolean;
    bathroom: boolean;
    bathrooms: string;
    rewire: boolean;
    replumb: boolean;
    heating: boolean;
    windows: boolean;
    roof: boolean;
    extension: boolean;
    extensionSize: string;
    contingencyPercent: string;
};

const initialForm: RefurbFormState = {
    propertySize: '100',
    refurbLevel: 'medium',
    region: 'midlands',
    kitchen: true,
    bathroom: true,
    bathrooms: '1',
    rewire: true,
    replumb: false,
    heating: true,
    windows: false,
    roof: false,
    extension: false,
    extensionSize: '0',
    contingencyPercent: '10',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// Base costs per sqm by refurb level
const BASE_COSTS_PER_SQM = {
    light: 250,    // Cosmetic only - paint, flooring, minor fixes
    medium: 500,   // Full redecoration + some structural
    heavy: 800,    // Major refurb - new kitchen, bathrooms, systems
    structural: 1200, // Structural work, extensions, major changes
};

// Regional multipliers
const REGIONAL_MULTIPLIERS = {
    london: 1.40,
    southeast: 1.20,
    midlands: 1.00,
    north: 0.90,
    scotland: 0.95,
    wales: 0.92,
};

// Individual item costs
const ITEM_COSTS = {
    kitchen: { min: 5000, mid: 12000, max: 25000 },
    bathroom: { min: 3000, mid: 6000, max: 12000 },
    rewire: 4000, // Base + per sqm
    rewirePerSqm: 40,
    replumb: 3000,
    replumbPerSqm: 35,
    heating: 4500,
    heatingPerSqm: 45,
    windows: 500, // Per window, assume 1 per 8sqm
    roof: 80, // Per sqm
    extension: 1800, // Per sqm for extension
};

const deriveRefurbMetrics = (form: RefurbFormState) => {
    const sqm = parseNumber(form.propertySize);
    const contingency = parseNumber(form.contingencyPercent) / 100;
    const extensionSqm = parseNumber(form.extensionSize);
    const numBathrooms = parseNumber(form.bathrooms);
    const regionMultiplier = REGIONAL_MULTIPLIERS[form.region];

    // Base refurb cost
    const baseCostPerSqm = BASE_COSTS_PER_SQM[form.refurbLevel];
    let baseRefurbCost = sqm * baseCostPerSqm * regionMultiplier;

    // Individual items breakdown
    let kitchenCost = 0;
    let bathroomCost = 0;
    let rewireCost = 0;
    let replumbCost = 0;
    let heatingCost = 0;
    let windowsCost = 0;
    let roofCost = 0;
    let extensionCost = 0;

    // Kitchen (if selected and not already in heavy/structural)
    if (form.kitchen) {
        const kitchenTier = form.refurbLevel === 'light' ? 'min' : form.refurbLevel === 'medium' ? 'mid' : 'max';
        kitchenCost = ITEM_COSTS.kitchen[kitchenTier] * regionMultiplier;
    }

    // Bathrooms
    if (form.bathroom) {
        const bathroomTier = form.refurbLevel === 'light' ? 'min' : form.refurbLevel === 'medium' ? 'mid' : 'max';
        bathroomCost = ITEM_COSTS.bathroom[bathroomTier] * numBathrooms * regionMultiplier;
    }

    // Rewire
    if (form.rewire) {
        rewireCost = (ITEM_COSTS.rewire + (sqm * ITEM_COSTS.rewirePerSqm)) * regionMultiplier;
    }

    // Replumb
    if (form.replumb) {
        replumbCost = (ITEM_COSTS.replumb + (sqm * ITEM_COSTS.replumbPerSqm)) * regionMultiplier;
    }

    // Heating
    if (form.heating) {
        heatingCost = (ITEM_COSTS.heating + (sqm * ITEM_COSTS.heatingPerSqm)) * regionMultiplier;
    }

    // Windows (estimate 1 per 8sqm)
    if (form.windows) {
        const windowCount = Math.ceil(sqm / 8);
        windowsCost = windowCount * ITEM_COSTS.windows * regionMultiplier;
    }

    // Roof
    if (form.roof) {
        roofCost = sqm * ITEM_COSTS.roof * regionMultiplier;
    }

    // Extension
    if (form.extension && extensionSqm > 0) {
        extensionCost = extensionSqm * ITEM_COSTS.extension * regionMultiplier;
    }

    // Total before contingency
    // For light refurb, add items on top
    // For heavier refurbs, some items are included in base
    let totalBeforeContingency = baseRefurbCost;

    if (form.refurbLevel === 'light') {
        // Light refurb = cosmetic only, add all items
        totalBeforeContingency = baseRefurbCost + kitchenCost + bathroomCost + rewireCost +
                                  replumbCost + heatingCost + windowsCost + roofCost + extensionCost;
    } else if (form.refurbLevel === 'medium') {
        // Medium includes basic kitchen/bathroom, but add extras
        totalBeforeContingency = baseRefurbCost + (rewireCost * 0.5) + replumbCost +
                                  heatingCost + windowsCost + roofCost + extensionCost;
    } else {
        // Heavy/structural includes most items, just add extension
        totalBeforeContingency = baseRefurbCost + extensionCost;
    }

    // Contingency
    const contingencyAmount = totalBeforeContingency * contingency;
    const totalWithContingency = totalBeforeContingency + contingencyAmount;

    // Cost metrics
    const costPerSqm = sqm > 0 ? totalWithContingency / sqm : 0;
    const costPerSqFt = costPerSqm / 10.764; // Convert to sq ft

    return {
        sqm,
        sqft: sqm * 10.764,
        baseRefurbCost,
        kitchenCost,
        bathroomCost,
        rewireCost,
        replumbCost,
        heatingCost,
        windowsCost,
        roofCost,
        extensionCost,
        totalBeforeContingency,
        contingencyAmount,
        totalWithContingency,
        costPerSqm,
        costPerSqFt,
        regionMultiplier,
        refurbLevel: form.refurbLevel,
    };
};

const RefurbCostCalculatorPage = () => {
    const [form, setForm] = useState<RefurbFormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveRefurbMetrics(form), [form]);

    const handleInputChange = (name: keyof RefurbFormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
    };

    const getRefurbLabel = (level: string) => {
        switch (level) {
            case 'light': return 'Light Cosmetic';
            case 'medium': return 'Medium Refurb';
            case 'heavy': return 'Heavy Refurb';
            case 'structural': return 'Structural';
            default: return level;
        }
    };

    return (
        <CalculatorPageLayout
            title="Refurb Cost Calculator"
            description="Estimate refurbishment costs per square metre with regional adjustments. Select individual works to build your budget."
            category="Refurb"
            categorySlug="refurb"
            categoryColor="#EF4444"
            badges={[{ label: 'Refurb Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter refurb scope'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Property size'
                                    name='propertySize'
                                    type='number'
                                    value={form.propertySize}
                                    unit='sqm'
                                    helper='Internal floor area'
                                    onChange={(e) => handleInputChange('propertySize', e.target.value)}
                                />

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Refurb Level</label>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {(['light', 'medium', 'heavy', 'structural'] as const).map((level) => (
                                            <button
                                                key={level}
                                                type='button'
                                                onClick={() => handleInputChange('refurbLevel', level)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.refurbLevel === level
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {getRefurbLabel(level)}
                                            </button>
                                        ))}
                                    </div>
                                    <p className='text-xs text-gray-500'>
                                        {form.refurbLevel === 'light' && 'Paint, flooring, minor fixes - £250/sqm base'}
                                        {form.refurbLevel === 'medium' && 'Full redeco, kitchen, bathroom - £500/sqm base'}
                                        {form.refurbLevel === 'heavy' && 'Major refurb, all new systems - £800/sqm base'}
                                        {form.refurbLevel === 'structural' && 'Structural work, layout changes - £1,200/sqm base'}
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Region</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {([
                                            { value: 'london', label: 'London (+40%)' },
                                            { value: 'southeast', label: 'South East (+20%)' },
                                            { value: 'midlands', label: 'Midlands (Base)' },
                                            { value: 'north', label: 'North (-10%)' },
                                            { value: 'scotland', label: 'Scotland (-5%)' },
                                            { value: 'wales', label: 'Wales (-8%)' },
                                        ] as const).map((region) => (
                                            <button
                                                key={region.value}
                                                type='button'
                                                onClick={() => handleInputChange('region', region.value)}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                    form.region === region.value
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {region.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Individual Works */}
                                <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                    <h4 className='font-medium text-slate-900 text-sm mb-3'>Include in scope</h4>
                                    <div className='grid grid-cols-2 gap-3'>
                                        {[
                                            { key: 'kitchen', label: 'New Kitchen' },
                                            { key: 'bathroom', label: 'New Bathroom(s)' },
                                            { key: 'rewire', label: 'Full Rewire' },
                                            { key: 'replumb', label: 'New Plumbing' },
                                            { key: 'heating', label: 'New Heating' },
                                            { key: 'windows', label: 'New Windows' },
                                            { key: 'roof', label: 'New Roof' },
                                            { key: 'extension', label: 'Extension' },
                                        ].map((item) => (
                                            <label key={item.key} className='flex items-center gap-2 cursor-pointer'>
                                                <input
                                                    type='checkbox'
                                                    checked={form[item.key as keyof RefurbFormState] as boolean}
                                                    onChange={(e) => handleInputChange(item.key as keyof RefurbFormState, e.target.checked)}
                                                    className='w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500'
                                                />
                                                <span className='text-sm text-slate-700'>{item.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {form.bathroom && (
                                        <div className='mt-3'>
                                            <FloatingField
                                                label='Number of bathrooms'
                                                name='bathrooms'
                                                type='number'
                                                value={form.bathrooms}
                                                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                                                compact
                                            />
                                        </div>
                                    )}

                                    {form.extension && (
                                        <div className='mt-3'>
                                            <FloatingField
                                                label='Extension size'
                                                name='extensionSize'
                                                type='number'
                                                value={form.extensionSize}
                                                unit='sqm'
                                                onChange={(e) => handleInputChange('extensionSize', e.target.value)}
                                                compact
                                            />
                                        </div>
                                    )}
                                </div>

                                <FloatingField
                                    label='Contingency'
                                    name='contingencyPercent'
                                    type='number'
                                    value={form.contingencyPercent}
                                    unit='%'
                                    helper='Typically 10-15%'
                                    onChange={(e) => handleInputChange('contingencyPercent', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Cost
                                    </PropertyButton>
                                    <PropertyButton type='button' variant='ghost' onClick={() => {
                                        setForm(initialForm);
                                        setHasCalculated(false);
                                    }}>
                                        Reset
                                    </PropertyButton>
                                </div>
                            </form>
                        </BentoCard>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Cost estimate' description='Based on your inputs'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Total Cost'
                                    value={formatCurrency(metrics.totalWithContingency)}
                                    helper='Inc. contingency'
                                />
                                <DealMetric
                                    label='Cost per sqm'
                                    value={formatCurrency(metrics.costPerSqm)}
                                    helper={`${metrics.sqm} sqm`}
                                />
                                <DealMetric
                                    label='Cost per sqft'
                                    value={formatCurrency(metrics.costPerSqFt)}
                                    helper={`${metrics.sqft.toFixed(0)} sqft`}
                                />
                                <DealMetric
                                    label='Contingency'
                                    value={formatCurrency(metrics.contingencyAmount)}
                                    helper={`${form.contingencyPercent}%`}
                                />
                            </BentoGrid>

                            {/* Main Summary */}
                            <div className='mt-6'>
                                <Card className='border-2 border-amber-200 bg-amber-50'>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className='p-3 rounded-full bg-amber-100'>
                                                    <Hammer className='size-6 text-amber-600' />
                                                </div>
                                                <div>
                                                    <p className='text-sm text-slate-600'>Estimated Refurb Cost</p>
                                                    <p className='text-3xl font-bold text-amber-700'>
                                                        {formatCurrency(metrics.totalWithContingency)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-slate-600'>Refurb Level</p>
                                                <p className='font-medium text-slate-900'>
                                                    {getRefurbLabel(metrics.refurbLevel)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cost Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Home className='size-4' />
                                    Cost Breakdown
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Base refurb ({getRefurbLabel(metrics.refurbLevel)})</span>
                                        <span className='font-medium'>{formatCurrency(metrics.baseRefurbCost)}</span>
                                    </div>
                                    {metrics.kitchenCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Kitchen</span>
                                            <span className='font-medium'>{formatCurrency(metrics.kitchenCost)}</span>
                                        </div>
                                    )}
                                    {metrics.bathroomCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Bathroom(s)</span>
                                            <span className='font-medium'>{formatCurrency(metrics.bathroomCost)}</span>
                                        </div>
                                    )}
                                    {metrics.rewireCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Rewire</span>
                                            <span className='font-medium'>{formatCurrency(metrics.rewireCost)}</span>
                                        </div>
                                    )}
                                    {metrics.replumbCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Plumbing</span>
                                            <span className='font-medium'>{formatCurrency(metrics.replumbCost)}</span>
                                        </div>
                                    )}
                                    {metrics.heatingCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Heating</span>
                                            <span className='font-medium'>{formatCurrency(metrics.heatingCost)}</span>
                                        </div>
                                    )}
                                    {metrics.windowsCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Windows</span>
                                            <span className='font-medium'>{formatCurrency(metrics.windowsCost)}</span>
                                        </div>
                                    )}
                                    {metrics.roofCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Roof</span>
                                            <span className='font-medium'>{formatCurrency(metrics.roofCost)}</span>
                                        </div>
                                    )}
                                    {metrics.extensionCost > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='text-slate-600'>Extension</span>
                                            <span className='font-medium'>{formatCurrency(metrics.extensionCost)}</span>
                                        </div>
                                    )}
                                    <div className='flex justify-between border-t pt-2'>
                                        <span className='text-slate-900 font-medium'>Subtotal</span>
                                        <span className='font-medium'>{formatCurrency(metrics.totalBeforeContingency)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>+ Contingency ({form.contingencyPercent}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.contingencyAmount)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-bold'>
                                        <span className='text-slate-900'>Total</span>
                                        <span className='text-amber-600'>{formatCurrency(metrics.totalWithContingency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Regional Note */}
                            <div className='mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-blue-900 text-sm'>Regional Adjustment</p>
                                        <p className='text-xs text-blue-700 mt-1'>
                                            Costs adjusted by {((metrics.regionMultiplier - 1) * 100).toFixed(0)}% for {form.region.charAt(0).toUpperCase() + form.region.slice(1)}.
                                            Labour and material costs vary significantly by region.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className='mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200'>
                                <p className='text-xs text-slate-600'>
                                    <span className='font-medium'>Note:</span> These are indicative costs only.
                                    Actual costs vary based on property condition, specification, access, and contractor rates.
                                    Always get multiple quotes for accurate pricing.
                                </p>
                            </div>
                        </BentoCard>
                    </div>
                </div>
        </CalculatorPageLayout>
    );
};

export default RefurbCostCalculatorPage;
