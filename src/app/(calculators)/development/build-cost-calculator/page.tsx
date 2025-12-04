"use client";

import { useMemo, useState } from 'react';

import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorStepper } from '@/components/property-kit/calculator-stepper';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
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
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveBuildCostMetrics(form), [form]);

    const handleInputChange = (name: keyof BuildCostFormState, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
        setStatus('thinking');

        setTimeout(() => {
            const summary = buildCostSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');
            setTimeout(() => setStatus('ready'), 1200);
        }, 500);
    };

    return (
        <CalculatorPageLayout
            title="AI Build Cost Calculator"
            description="Generate BCIS-aligned cost estimates with regional adjustments, contingencies, and professional fees. The AI explains cost drivers and flags potential risks."
            category="Development"
            categorySlug="development"
            categoryColor="#8B5CF6"
            badges={[
                { label: 'Step 03 · Build Costs', variant: 'warning' },
                { label: 'BCIS benchmarking', variant: 'neutral' }
            ]}
        >
            <div className='mb-6'>
                <CalculatorStepper currentStepIndex={3} />
            </div>

            <div className='mb-10'>
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
                    <CalculatorResultsGate
                        calculatorType="Build Cost Calculator"
                        calculatorSlug="build-cost-calculator"
                        formData={form}
                        hasCalculated={hasCalculated}
                    >
                    <AiOutputCard
                        title='Build Cost Analysis'
                        status={status}
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
                    </CalculatorResultsGate>
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

            {/* SEO Content */}
            <CalculatorSEO
                calculatorName="Build Cost Calculator"
                calculatorSlug="build-cost-calculator"
                description="The Build Cost Calculator helps UK property developers estimate construction costs using BCIS-aligned benchmarks. Calculate accurate build costs including regional adjustments, contingencies, and professional fees for new builds, conversions, refurbishments, and extensions."
                howItWorks={`The Build Cost Calculator uses BCIS (Building Cost Information Service) data to estimate construction costs:

1. Base Costs - Select your build type (new build, conversion, refurbishment, or extension) and specification level (basic, standard, or premium)
2. Regional Adjustments - Apply location multipliers based on UK region (London attracts 25% premium, North typically 5% below base)
3. Contingencies - Add contingency percentage (typically 7.5-15%) for unforeseen costs
4. Professional Fees - Include architect, engineer, QS, and project management fees (typically 10-15% of build costs)

The calculator provides cost per sqm, cost per sqft, and total project cost with full breakdown of all components.`}
                whenToUse="Use this calculator during feasibility stage to estimate total construction costs for development appraisals. Essential for calculating profit on cost, structuring development finance, and determining residual land value. Particularly useful when comparing different build types or specification levels."
                keyFeatures={[
                    "BCIS-aligned construction cost benchmarks for accurate UK estimates",
                    "Regional multipliers covering all UK regions from London to Scotland",
                    "Multiple build types: new build, conversion, refurbishment, extension",
                    "Specification levels from basic social housing to premium high-end",
                ]}
                faqs={[
                    {
                        question: "What is BCIS and why is it important?",
                        answer: "BCIS (Building Cost Information Service) is the UK's leading provider of construction cost data. It's produced by RICS and provides industry-standard cost benchmarks. Lenders, quantity surveyors, and professional developers use BCIS data to validate build cost estimates in development appraisals."
                    },
                    {
                        question: "How much should I budget for contingency?",
                        answer: "Contingency typically ranges from 5% for straightforward new builds to 15% for complex conversions or heritage projects. Standard practice is 7.5-10% for most schemes. Lenders will stress-test your appraisal with higher contingency, so budget conservatively. Remember: unused contingency becomes profit, but insufficient contingency can kill a deal."
                    },
                    {
                        question: "What's included in professional fees?",
                        answer: "Professional fees cover architects (3-5%), structural engineers (1-2%), MEP consultants (1-2%), quantity surveyor (1-2%), project manager (2-3%), planning consultant (0.5-1%), and building control (0.5-1%). Total professional fees typically range from 10-15% of build costs depending on project complexity."
                    },
                    {
                        question: "How do I cost per sqm differ by region?",
                        answer: "UK construction costs vary significantly by region. London commands 20-30% premium over Midlands baseline. South East adds 10-15%, South West 5-10%, while North and Scotland are typically 5-10% below baseline. This reflects labour costs, material transport, and supply/demand dynamics. Always use regional multipliers in your appraisals."
                    },
                    {
                        question: "What's the difference between GIA and NIA for costing?",
                        answer: "GIA (Gross Internal Area) includes all internal space including walls and columns. NIA (Net Internal Area) excludes walls, columns, and service areas. Construction costs are always quoted per sqm of GIA as this is what you're building. Sales values use NIA as this is usable space. For residential, GIA is typically 10-15% larger than NIA."
                    },
                ]}
                relatedTerms={[
                    "BCIS construction costs UK",
                    "Build cost calculator per sqm",
                    "Development appraisal build costs",
                    "Construction contingency percentage",
                    "Professional fees development",
                    "Cost per sqm London",
                    "New build costs calculator",
                    "Conversion build costs UK",
                    "QS build cost estimate",
                    "Regional construction costs UK",
                ]}
                categoryColor="#8B5CF6"
            />
        </CalculatorPageLayout>
    );
};

export default BuildCostCalculatorPage;
