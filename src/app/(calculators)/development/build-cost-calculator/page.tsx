"use client";

import { useMemo, useState } from 'react';

import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { CalculatorStepper } from '@/components/property-kit/calculator-stepper';
import { formatCurrency, formatCurrencyCompact, formatPercent } from '@/lib/calculators/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { ArrowRight, HardHat, Ruler, Wrench } from 'lucide-react';

type BuildCostFormState = {
    totalGia: string;
    buildType: string;
    specLevel: string;
    region: string;
    storeys: string;
    contingency: string;
    professionalFees: string;
};

const initialForm: BuildCostFormState = {
    totalGia: '820',
    buildType: 'conversion',
    specLevel: 'standard',
    region: 'london',
    storeys: '4',
    contingency: '10',
    professionalFees: '12'
};

const defaultSummary =
    'Input your gross internal area, build type, and specification level. The AI will reference BCIS data and regional adjustments to produce a detailed cost estimate with contingencies.';

const buildTypes = [
    { value: 'new_build', label: 'New Build' },
    { value: 'conversion', label: 'Conversion' },
    { value: 'refurbishment', label: 'Refurbishment' },
    { value: 'extension', label: 'Extension' }
];

const specLevels = [
    { value: 'basic', label: 'Basic (social housing)' },
    { value: 'standard', label: 'Standard (mid-market)' },
    { value: 'premium', label: 'Premium (high-end)' }
];

const regions = [
    { value: 'london', label: 'Greater London' },
    { value: 'south_east', label: 'South East' },
    { value: 'south_west', label: 'South West' },
    { value: 'midlands', label: 'Midlands' },
    { value: 'north', label: 'North' },
    { value: 'scotland', label: 'Scotland' }
];

const deriveBuildCostMetrics = (form: BuildCostFormState) => {
    const gia = Number.parseFloat(form.totalGia || '0');
    const contingency = Number.parseFloat(form.contingency || '0') / 100;
    const profFees = Number.parseFloat(form.professionalFees || '0') / 100;

    const baseCosts: Record<string, Record<string, number>> = {
        new_build: { basic: 1650, standard: 2100, premium: 2850 },
        conversion: { basic: 1450, standard: 1780, premium: 2350 },
        refurbishment: { basic: 1200, standard: 1550, premium: 2100 },
        extension: { basic: 1800, standard: 2250, premium: 3000 }
    };

    const regionMultipliers: Record<string, number> = {
        london: 1.25,
        south_east: 1.1,
        south_west: 1.05,
        midlands: 1.0,
        north: 0.95,
        scotland: 0.98
    };

    const baseCostPerSqm = baseCosts[form.buildType]?.[form.specLevel] || 1780;
    const regionMultiplier = regionMultipliers[form.region] || 1.0;
    const adjustedCostPerSqm = baseCostPerSqm * regionMultiplier;

    const baseBuildCost = gia * adjustedCostPerSqm;
    const contingencyAmount = baseBuildCost * contingency;
    const profFeesAmount = (baseBuildCost + contingencyAmount) * profFees;
    const totalCost = baseBuildCost + contingencyAmount + profFeesAmount;

    return {
        baseBuildCost,
        contingencyAmount,
        profFeesAmount,
        totalCost,
        costPerSqm: totalCost / gia,
        costPerSqft: totalCost / gia / 10.764
    };
};

const buildCostSummary = (form: BuildCostFormState, metrics: ReturnType<typeof deriveBuildCostMetrics>) => {
    const { totalGia, buildType, specLevel, region, contingency, professionalFees } = form;
    const { baseBuildCost, totalCost, costPerSqm } = metrics;

    const buildTypeLabel = buildTypes.find((t) => t.value === buildType)?.label || buildType;
    const specLabel = specLevels.find((s) => s.value === specLevel)?.label || specLevel;
    const regionLabel = regions.find((r) => r.value === region)?.label || region;

    return `For a ${totalGia} sqm ${buildTypeLabel.toLowerCase()} to ${specLabel.toLowerCase()} specification in ${regionLabel}, the estimated build cost is ${formatCurrency(totalCost)}. Base construction costs are ${formatCurrency(baseBuildCost)} (${formatCurrency(costPerSqm)}/sqm). This includes ${contingency}% contingency and ${professionalFees}% professional fees covering architects, engineers, and project management. BCIS Q4 2024 data shows ${regionLabel} costs trending +3.2% YoY. Recommend budgeting for potential inflation adjustments over a 12-18 month build programme.`;
};

const BuildCostCalculatorPage = () => {
    const [form, setForm] = useState<BuildCostFormState>(initialForm);
    const [status, setStatus] = useState<'ready' | 'thinking' | 'streaming'>('ready');
    const [aiCopy, setAiCopy] = useState(defaultSummary);

    const metrics = useMemo(() => deriveBuildCostMetrics(form), [form]);

    const handleInputChange = (name: keyof BuildCostFormState, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('thinking');

        setTimeout(() => {
            const summary = buildCostSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');
            setTimeout(() => setStatus('ready'), 1200);
        }, 500);
    };

    return (
        <div className='bg-white min-h-screen'>
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
            <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <div className='flex flex-wrap items-center gap-3'>
                    <StatusPill tone='warning' label='Step 03 · Build Costs' />
                    <StatusPill tone='neutral' label='BCIS benchmarking' />
                </div>
                <div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>AI Build Cost Calculator</h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Generate BCIS-aligned cost estimates with regional adjustments, contingencies, and professional
                            fees. The AI explains cost drivers and flags potential risks.
                        </p>
                        <div className='mt-6'>
                            <CalculatorStepper currentStepIndex={3} />
                        </div>
                    </div>
                    <BentoCard
                        variant='micro'
                        title='Cost breakdown'
                        description='We itemise major cost categories for transparency.'>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li className='flex items-center gap-2'>
                                <HardHat className='size-4 text-primary' /> Base construction (shell & core)
                            </li>
                            <li className='flex items-center gap-2'>
                                <Wrench className='size-4 text-primary' /> M&E and internal finishes
                            </li>
                            <li className='flex items-center gap-2'>
                                <Ruler className='size-4 text-primary' /> Professional fees & contingency
                            </li>
                        </ul>
                    </BentoCard>
                </div>
            </section>

            <section className='grid gap-8 lg:grid-cols-2'>
                <BentoCard variant='glass' title='Project specification' description='Define scope to estimate total build cost.'>
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Total GIA'
                                name='totalGia'
                                type='number'
                                unit='sqm'
                                value={form.totalGia}
                                helper='Gross internal area'
                                onChange={(e) => handleInputChange('totalGia', e.target.value)}
                            />
                            <FloatingField
                                label='Storeys'
                                name='storeys'
                                type='number'
                                value={form.storeys}
                                onChange={(e) => handleInputChange('storeys', e.target.value)}
                            />
                        </div>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <label className='text-xs text-gray-500'>Build type</label>
                                <Select value={form.buildType} onValueChange={(v) => handleInputChange('buildType', v)}>
                                    <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <label className='text-xs text-gray-500'>Specification</label>
                                <Select value={form.specLevel} onValueChange={(v) => handleInputChange('specLevel', v)}>
                                    <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specLevels.map((spec) => (
                                            <SelectItem key={spec.value} value={spec.value}>
                                                {spec.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-xs text-gray-500'>Region</label>
                            <Select value={form.region} onValueChange={(v) => handleInputChange('region', v)}>
                                <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((region) => (
                                        <SelectItem key={region.value} value={region.value}>
                                            {region.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Contingency'
                                name='contingency'
                                type='number'
                                unit='%'
                                value={form.contingency}
                                helper='Typical: 7.5-15%'
                                onChange={(e) => handleInputChange('contingency', e.target.value)}
                            />
                            <FloatingField
                                label='Professional fees'
                                name='professionalFees'
                                type='number'
                                unit='%'
                                value={form.professionalFees}
                                helper='Architects, engineers, PM'
                                onChange={(e) => handleInputChange('professionalFees', e.target.value)}
                            />
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <PropertyButton type='submit' variant='primary' icon={<ArrowRight className='size-4' />}>
                                Calculate costs
                            </PropertyButton>
                            <PropertyButton type='button' variant='ghost' onClick={() => setForm(initialForm)}>
                                Reset
                            </PropertyButton>
                        </div>
                    </form>
                </BentoCard>

                <div className='flex flex-col gap-6'>
                    <AiOutputCard
                        title='Build Cost Analysis'
                        accent={status}
                        response={aiCopy}
                        highlights={[
                            { label: 'TOTAL COST', value: formatCurrencyCompact(metrics.totalCost) },
                            { label: 'COST/SQM', value: formatCurrency(metrics.costPerSqm) }
                        ]}
                        confidence={0.91}
                    />
                    <BentoCard variant='secondary' title='Cost breakdown' description='Major cost categories'>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm'>
                                <span className='text-muted-foreground'>Base construction</span>
                                <span className='font-semibold text-foreground'>{formatCurrency(metrics.baseBuildCost)}</span>
                            </div>
                            <div className='flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm'>
                                <span className='text-muted-foreground'>Contingency ({form.contingency}%)</span>
                                <span className='font-semibold text-foreground'>{formatCurrency(metrics.contingencyAmount)}</span>
                            </div>
                            <div className='flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm'>
                                <span className='text-muted-foreground'>Professional fees ({form.professionalFees}%)</span>
                                <span className='font-semibold text-foreground'>{formatCurrency(metrics.profFeesAmount)}</span>
                            </div>
                            <div className='flex items-center justify-between rounded-xl border border-[#00C9A7]/30 bg-[#E6FAF7] px-4 py-3 text-sm'>
                                <span className='font-medium text-foreground'>Total build cost</span>
                                <span className='font-bold text-[#00C9A7]'>{formatCurrency(metrics.totalCost)}</span>
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </section>

            <section>
                <BentoGrid className='grid-cols-1 gap-4 sm:grid-cols-4'>
                    <DealMetric
                        label='Total cost'
                        value={formatCurrencyCompact(metrics.totalCost)}
                        helper='All-in budget'
                    />
                    <DealMetric
                        label='Cost per sqm'
                        value={formatCurrency(metrics.costPerSqm)}
                        helper='BCIS-aligned'
                        trend='up'
                        delta='+3.2%'
                    />
                    <DealMetric
                        label='Cost per sqft'
                        value={formatCurrency(metrics.costPerSqft)}
                        helper='For UK/US comparison'
                    />
                    <DealMetric
                        label='Risk buffer'
                        value={formatPercent(Number.parseFloat(form.contingency))}
                        helper='Contingency allocated'
                    />
                </BentoGrid>
            </section>
        </main>
        </div>
    );
};

export default BuildCostCalculatorPage;
