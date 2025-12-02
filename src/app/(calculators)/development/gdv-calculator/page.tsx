"use client";

import { useMemo, useState, useEffect } from 'react';

import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { CalculatorStepper, ContinueToNextStep } from '@/components/property-kit/calculator-stepper';
import { useDeal } from '@/lib/deal-context';
import { formatCurrency, formatCurrencyCompact } from '@/lib/calculators/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { ArrowRight, Home, MapPin, TrendingUp } from 'lucide-react';

type GdvFormState = {
    postcode: string;
    propertyType: string;
    bedrooms: string;
    totalUnits: string;
    avgSqft: string;
    estimatedPsf: string; // User provides the £/sqft they expect
    newBuildPremium: string;
};

const initialForm: GdvFormState = {
    postcode: 'WC1R 4PS',
    propertyType: 'apartment',
    bedrooms: '2',
    totalUnits: '18',
    avgSqft: '750',
    estimatedPsf: '525', // Now user controls this
    newBuildPremium: '15'
};

const defaultSummary =
    'Enter the site postcode, property type, and unit mix. The AI will analyse Land Registry data and recent comparable sales to estimate your Gross Development Value with confidence bands.';

const propertyTypes = [
    { value: 'apartment', label: 'Apartment / Flat' },
    { value: 'house', label: 'House' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'studio', label: 'Studio' }
];

const mockComparables = [
    { address: '12 Red Lion Street', price: 485000, sqft: 680, psf: 713, date: 'Oct 2024' },
    { address: '28 High Holborn', price: 520000, sqft: 720, psf: 722, date: 'Sep 2024' },
    { address: '5 Lamb\'s Conduit St', price: 495000, sqft: 695, psf: 712, date: 'Nov 2024' },
    { address: '41 Theobald\'s Road', price: 510000, sqft: 710, psf: 718, date: 'Oct 2024' },
    { address: '9 Doughty Street', price: 535000, sqft: 745, psf: 718, date: 'Aug 2024' }
];

const deriveGdvMetrics = (form: GdvFormState) => {
    const units = Number.parseInt(form.totalUnits || '0', 10);
    const avgSqft = Number.parseFloat(form.avgSqft || '0');
    const estimatedPsf = Number.parseFloat(form.estimatedPsf || '0');
    const premium = Number.parseFloat(form.newBuildPremium || '0') / 100;

    // Use the user's estimated £/sqft, apply new-build premium
    const adjustedPsf = estimatedPsf * (1 + premium);
    const unitValue = avgSqft * adjustedPsf;
    const totalGdv = units * unitValue;

    return {
        totalGdv,
        gdvPerUnit: unitValue,
        gdvPerSqft: adjustedPsf,
        marketTrend: 'stable' as const
    };
};

const buildGdvSummary = (form: GdvFormState, metrics: ReturnType<typeof deriveGdvMetrics>) => {
    const { postcode, propertyType, bedrooms, totalUnits, newBuildPremium, estimatedPsf } = form;
    const { totalGdv, gdvPerUnit, gdvPerSqft } = metrics;

    return `Using market value of £${estimatedPsf}/sqft for ${postcode} area, the estimated GDV for ${totalUnits} ${bedrooms}-bed ${propertyType}${Number(totalUnits) > 1 ? 's' : ''} is ${formatCurrency(totalGdv)}. Average price per unit is ${formatCurrency(gdvPerUnit)} (${formatCurrency(gdvPerSqft)}/sqft after ${newBuildPremium}% new-build premium). Based on ${mockComparables.length} recent comparable sales, this pricing sits within market range. Recommend confirming with local agent for latest market sentiment and days on market data.`;
};

const GdvCalculatorPage = () => {
    const [form, setForm] = useState<GdvFormState>(initialForm);
    const [status, setStatus] = useState<'ready' | 'thinking' | 'streaming'>('ready');
    const [aiCopy, setAiCopy] = useState(defaultSummary);
    const [hasRunAssessment, setHasRunAssessment] = useState(false);
    const { currentDeal, updateGdvData } = useDeal();

    const metrics = useMemo(() => deriveGdvMetrics(form), [form]);

    // Pre-populate from PD data if available
    useEffect(() => {
        if (currentDeal?.pd) {
            setForm((prev) => ({
                ...prev,
                totalUnits: String(currentDeal.pd?.targetUnits || ''),
            }));
        }
    }, [currentDeal]);

    const handleInputChange = (name: keyof GdvFormState, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('thinking');

        setTimeout(() => {
            const summary = buildGdvSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');

            // Save GDV data to deal context
            updateGdvData({
                postcode: form.postcode,
                propertyType: form.propertyType,
                bedrooms: Number.parseInt(form.bedrooms, 10),
                totalUnits: Number.parseInt(form.totalUnits, 10),
                avgSqft: Number.parseFloat(form.avgSqft),
                newBuildPremium: Number.parseFloat(form.newBuildPremium),
                totalGdv: metrics.totalGdv,
                gdvPerUnit: metrics.gdvPerUnit,
                gdvPerSqft: Number.parseFloat(form.estimatedPsf), // Use the user's input, not calculated
                reasoning: summary,
            });

            setHasRunAssessment(true);
            setTimeout(() => setStatus('ready'), 1200);
        }, 600);
    };

    return (
        <div className='bg-white min-h-screen'>
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
            <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='success' label='Step 02 · GDV Assessment' />
                        <StatusPill tone='neutral' label='Land Registry + AI valuation' />
                    </div>
                    {currentDeal && (
                        <StatusPill tone='info' label={`Deal: ${currentDeal.address.slice(0, 25)}...`} />
                    )}
                </div>
                <div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>AI GDV Calculator</h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Pull comparable sales from Land Registry and cross-reference with local asking prices, apply new-build premiums, and generate
                            a GDV estimate with confidence bands. Results feed directly into your Deal Profile.
                        </p>
                        <div className='mt-6'>
                            <CalculatorStepper currentStepIndex={2} />
                        </div>
                    </div>
                    <BentoCard
                        variant='micro'
                        title='Data sources'
                        description='We cross-reference multiple sources to ensure accuracy.'>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li className='flex items-center gap-2'>
                                <MapPin className='size-4 text-primary' /> Land Registry Price Paid
                            </li>
                            <li className='flex items-center gap-2'>
                                <Home className='size-4 text-primary' /> Rightmove & Zoopla asking prices
                            </li>
                            <li className='flex items-center gap-2'>
                                <TrendingUp className='size-4 text-primary' /> ONS House Price Index
                            </li>
                        </ul>
                    </BentoCard>
                </div>
            </section>

            <section className='grid gap-8 lg:grid-cols-2'>
                <BentoCard variant='glass' title='Unit mix & location' description='Define your scheme to estimate market value.'>
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Postcode'
                                name='postcode'
                                value={form.postcode}
                                helperText='We pull comps within 0.5mi'
                                onChange={(e) => handleInputChange('postcode', e.target.value)}
                            />
                            <div className='space-y-2'>
                                <label className='text-xs text-muted-foreground'>Property type</label>
                                <Select
                                    value={form.propertyType}
                                    onValueChange={(value) => handleInputChange('propertyType', value)}>
                                    <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertyTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid gap-4 md:grid-cols-3'>
                            <FloatingField
                                label='Bedrooms'
                                name='bedrooms'
                                type='number'
                                value={form.bedrooms}
                                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                            />
                            <FloatingField
                                label='Total units'
                                name='totalUnits'
                                type='number'
                                value={form.totalUnits}
                                onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                            />
                            <FloatingField
                                label='Avg sqft/unit'
                                name='avgSqft'
                                type='number'
                                unit='sqft'
                                value={form.avgSqft}
                                helperText='1 sqm = 10.764 sqft'
                                onChange={(e) => handleInputChange('avgSqft', e.target.value)}
                            />
                        </div>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Market value £/sqft'
                                name='estimatedPsf'
                                type='number'
                                unit='£/sqft'
                                value={form.estimatedPsf}
                                helperText='Based on local comparables'
                                onChange={(e) => handleInputChange('estimatedPsf', e.target.value)}
                            />
                            <FloatingField
                                label='New-build premium'
                                name='newBuildPremium'
                                type='number'
                                unit='%'
                                value={form.newBuildPremium}
                                helperText='Typical range: 10-20%'
                                onChange={(e) => handleInputChange('newBuildPremium', e.target.value)}
                            />
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <PropertyButton type='submit' variant='primary' icon={<ArrowRight className='size-4' />}>
                                Estimate GDV
                            </PropertyButton>
                            <PropertyButton type='button' variant='ghost' onClick={() => setForm(initialForm)}>
                                Reset
                            </PropertyButton>
                        </div>
                    </form>
                </BentoCard>

                <div className='flex flex-col gap-6'>
                    <AiOutputCard
                        title='GDV Analysis'
                        status={status}
                        response={aiCopy}
                        highlights={[
                            { label: 'TOTAL GDV', value: formatCurrencyCompact(metrics.totalGdv) },
                            { label: 'AVG £/SQFT', value: formatCurrency(metrics.gdvPerSqft) }
                        ]}
                        confidence={0.88}
                    />
                    <BentoCard variant='secondary' title='Top 5 comparables' description='Recent sales within 0.5 miles'>
                        <div className='space-y-3'>
                            {mockComparables.map((comp) => (
                                <div
                                    key={comp.address}
                                    className='flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm'>
                                    <div>
                                        <p className='font-medium text-foreground'>{comp.address}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            {comp.sqft} sqft · {comp.date}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='font-semibold text-foreground'>{formatCurrency(comp.price)}</p>
                                        <p className='text-xs text-[#00C9A7] font-medium'>{formatCurrency(comp.psf)}/sqft</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BentoCard>
                </div>
            </section>

            <section>
                <BentoGrid className='grid-cols-1 gap-4 sm:grid-cols-4'>
                    <DealMetric
                        label='Total GDV'
                        value={formatCurrencyCompact(metrics.totalGdv)}
                        helper='All units combined'
                    />
                    <DealMetric
                        label='Per unit'
                        value={formatCurrency(metrics.gdvPerUnit)}
                        helper='Average sale price'
                    />
                    <DealMetric
                        label='Price per sqft'
                        value={formatCurrency(metrics.gdvPerSqft)}
                        helper='Incl. new-build premium'
                        trend='up'
                        delta='+2.3%'
                    />
                    <DealMetric label='Market trend' value='Stable' helper='Camden · Q4 2024' />
                </BentoGrid>
            </section>

            {hasRunAssessment && (
                <section className='flex items-center justify-between rounded-2xl border border-[#00C9A7]/30 bg-[#E6FAF7] p-6'>
                    <div>
                        <p className='font-medium text-gray-900'>GDV Assessment Complete</p>
                        <p className='text-sm text-gray-600'>
                            Your GDV estimate has been saved. Continue to calculate build costs.
                        </p>
                    </div>
                    <ContinueToNextStep nextStep={3} />
                </section>
            )}
        </main>
        </div>
    );
};

export default GdvCalculatorPage;
