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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Home, MapPin, TrendingUp, Plus, Trash2, BedDouble } from 'lucide-react';

type UnitType = {
    id: string;
    bedrooms: number;
    quantity: number;
    avgSqft: number;
    pricePerSqft: number;
};

type GdvFormState = {
    postcode: string;
    propertyType: string;
    newBuildPremium: string;
    units: UnitType[];
};

const createUnit = (bedrooms: number = 2): UnitType => ({
    id: Math.random().toString(36).substr(2, 9),
    bedrooms,
    quantity: 1,
    avgSqft: bedrooms === 0 ? 400 : bedrooms === 1 ? 550 : bedrooms === 2 ? 750 : bedrooms === 3 ? 950 : 1200,
    pricePerSqft: 525,
});

const initialForm: GdvFormState = {
    postcode: 'WC1R 4PS',
    propertyType: 'apartment',
    newBuildPremium: '15',
    units: [
        { id: '1', bedrooms: 1, quantity: 3, avgSqft: 550, pricePerSqft: 550 },
        { id: '2', bedrooms: 2, quantity: 6, avgSqft: 750, pricePerSqft: 525 },
        { id: '3', bedrooms: 3, quantity: 4, avgSqft: 950, pricePerSqft: 500 },
    ],
};

const defaultSummary =
    'Enter the site postcode, property type, and unit mix. The AI will analyse Land Registry data and recent comparable sales to estimate your Gross Development Value with confidence bands.';

const propertyTypes = [
    { value: 'apartment', label: 'Apartment / Flat' },
    { value: 'house', label: 'House' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'studio', label: 'Studio' }
];

const bedroomOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1 Bed' },
    { value: 2, label: '2 Bed' },
    { value: 3, label: '3 Bed' },
    { value: 4, label: '4 Bed' },
    { value: 5, label: '5+ Bed' },
];

const mockComparables = [
    { address: '12 Red Lion Street', price: 485000, sqft: 680, psf: 713, date: 'Oct 2024' },
    { address: '28 High Holborn', price: 520000, sqft: 720, psf: 722, date: 'Sep 2024' },
    { address: '5 Lamb\'s Conduit St', price: 495000, sqft: 695, psf: 712, date: 'Nov 2024' },
    { address: '41 Theobald\'s Road', price: 510000, sqft: 710, psf: 718, date: 'Oct 2024' },
    { address: '9 Doughty Street', price: 535000, sqft: 745, psf: 718, date: 'Aug 2024' }
];

const deriveGdvMetrics = (form: GdvFormState) => {
    const premium = Number.parseFloat(form.newBuildPremium || '0') / 100;

    let totalGdv = 0;
    let totalUnits = 0;
    let totalSqft = 0;

    for (const unit of form.units) {
        const adjustedPsf = unit.pricePerSqft * (1 + premium);
        const unitValue = unit.avgSqft * adjustedPsf;
        totalGdv += unitValue * unit.quantity;
        totalUnits += unit.quantity;
        totalSqft += unit.avgSqft * unit.quantity;
    }

    const avgPricePerUnit = totalUnits > 0 ? totalGdv / totalUnits : 0;
    const avgPricePerSqft = totalSqft > 0 ? totalGdv / totalSqft : 0;

    return {
        totalGdv,
        totalUnits,
        totalSqft,
        gdvPerUnit: avgPricePerUnit,
        gdvPerSqft: avgPricePerSqft,
        marketTrend: 'stable' as const
    };
};

const buildGdvSummary = (form: GdvFormState, metrics: ReturnType<typeof deriveGdvMetrics>) => {
    const { postcode, propertyType, newBuildPremium, units } = form;
    const { totalGdv, gdvPerUnit, gdvPerSqft, totalUnits } = metrics;

    const unitMixDescription = units
        .filter(u => u.quantity > 0)
        .map(u => `${u.quantity}x ${u.bedrooms === 0 ? 'studio' : `${u.bedrooms}-bed`}`)
        .join(', ');

    return `Based on the unit mix (${unitMixDescription}) in ${postcode}, the estimated GDV is ${formatCurrency(totalGdv)}. Average price per unit is ${formatCurrency(gdvPerUnit)} (${formatCurrency(gdvPerSqft)}/sqft after ${newBuildPremium}% new-build premium). Total scheme: ${totalUnits} ${propertyType}${totalUnits > 1 ? 's' : ''}. Based on ${mockComparables.length} recent comparable sales, this pricing sits within market range. Recommend confirming with local agent for latest market sentiment.`;
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const GdvCalculatorPage = () => {
    const [form, setForm] = useState<GdvFormState>(initialForm);
    const [status, setStatus] = useState<'ready' | 'thinking' | 'streaming'>('ready');
    const [aiCopy, setAiCopy] = useState(defaultSummary);
    const [hasRunAssessment, setHasRunAssessment] = useState(false);
    const { currentDeal, updateGdvData } = useDeal();

    const metrics = useMemo(() => deriveGdvMetrics(form), [form]);

    const handleInputChange = (name: keyof Omit<GdvFormState, 'units'>, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUnitChange = (unitId: string, field: keyof UnitType, value: number) => {
        setForm((prev) => ({
            ...prev,
            units: prev.units.map((unit) =>
                unit.id === unitId ? { ...unit, [field]: value } : unit
            ),
        }));
    };

    const addUnit = () => {
        setForm((prev) => ({
            ...prev,
            units: [...prev.units, createUnit()],
        }));
    };

    const removeUnit = (unitId: string) => {
        setForm((prev) => ({
            ...prev,
            units: prev.units.filter((unit) => unit.id !== unitId),
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('thinking');

        setTimeout(() => {
            const summary = buildGdvSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');

            // Calculate weighted average bedrooms
            const totalUnits = form.units.reduce((sum, u) => sum + u.quantity, 0);
            const weightedBedrooms = totalUnits > 0
                ? form.units.reduce((sum, u) => sum + (u.bedrooms * u.quantity), 0) / totalUnits
                : 2;
            const avgSqft = totalUnits > 0
                ? form.units.reduce((sum, u) => sum + (u.avgSqft * u.quantity), 0) / totalUnits
                : 750;

            // Save GDV data to deal context
            updateGdvData({
                postcode: form.postcode,
                propertyType: form.propertyType,
                bedrooms: Math.round(weightedBedrooms),
                totalUnits: metrics.totalUnits,
                avgSqft: avgSqft,
                newBuildPremium: Number.parseFloat(form.newBuildPremium),
                totalGdv: metrics.totalGdv,
                gdvPerUnit: metrics.gdvPerUnit,
                gdvPerSqft: metrics.gdvPerSqft,
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

                        {/* Unit Mix Section */}
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <label className='text-sm font-medium text-slate-700'>Unit Mix</label>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={addUnit}
                                    className='gap-1.5'
                                >
                                    <Plus className='size-4' />
                                    Add Unit Type
                                </Button>
                            </div>

                            <div className='space-y-3'>
                                {form.units.map((unit, index) => (
                                    <Card key={unit.id} className='border-slate-200'>
                                        <CardContent className='p-4'>
                                            <div className='flex items-start gap-3'>
                                                <div className='flex size-10 items-center justify-center rounded-lg bg-slate-100 shrink-0'>
                                                    <BedDouble className='size-5 text-slate-600' />
                                                </div>
                                                <div className='flex-1 grid gap-3 sm:grid-cols-4'>
                                                    <div className='space-y-1'>
                                                        <label className='text-xs text-slate-500'>Type</label>
                                                        <Select
                                                            value={String(unit.bedrooms)}
                                                            onValueChange={(value) => handleUnitChange(unit.id, 'bedrooms', parseInt(value))}
                                                        >
                                                            <SelectTrigger className='h-10'>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {bedroomOptions.map((opt) => (
                                                                    <SelectItem key={opt.value} value={String(opt.value)}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className='text-xs text-slate-500'>Quantity</label>
                                                        <input
                                                            type='number'
                                                            min='1'
                                                            value={unit.quantity}
                                                            onChange={(e) => handleUnitChange(unit.id, 'quantity', parseInt(e.target.value) || 1)}
                                                            className='w-full h-10 rounded-md border border-slate-200 px-3 text-sm font-medium focus:border-[var(--pc-blue)] focus:ring-1 focus:ring-[var(--pc-blue)] outline-none'
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className='text-xs text-slate-500'>Avg sqft</label>
                                                        <input
                                                            type='text'
                                                            inputMode='numeric'
                                                            value={formatNumber(unit.avgSqft)}
                                                            onChange={(e) => handleUnitChange(unit.id, 'avgSqft', parseNumber(e.target.value))}
                                                            className='w-full h-10 rounded-md border border-slate-200 px-3 text-sm font-medium focus:border-[var(--pc-blue)] focus:ring-1 focus:ring-[var(--pc-blue)] outline-none'
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className='text-xs text-slate-500'>£/sqft</label>
                                                        <input
                                                            type='text'
                                                            inputMode='numeric'
                                                            value={formatNumber(unit.pricePerSqft)}
                                                            onChange={(e) => handleUnitChange(unit.id, 'pricePerSqft', parseNumber(e.target.value))}
                                                            className='w-full h-10 rounded-md border border-slate-200 px-3 text-sm font-medium focus:border-[var(--pc-blue)] focus:ring-1 focus:ring-[var(--pc-blue)] outline-none'
                                                        />
                                                    </div>
                                                </div>
                                                {form.units.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => removeUnit(unit.id)}
                                                        className='shrink-0 text-slate-400 hover:text-red-500'
                                                    >
                                                        <Trash2 className='size-4' />
                                                    </Button>
                                                )}
                                            </div>
                                            {/* Unit subtotal */}
                                            <div className='mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm'>
                                                <span className='text-slate-500'>
                                                    {unit.quantity}x {unit.bedrooms === 0 ? 'studio' : `${unit.bedrooms}-bed`} @ {unit.avgSqft} sqft
                                                </span>
                                                <span className='font-semibold text-slate-900'>
                                                    {formatCurrency(unit.quantity * unit.avgSqft * unit.pricePerSqft * (1 + parseFloat(form.newBuildPremium) / 100))}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Unit Mix Summary */}
                            <div className='rounded-xl bg-slate-50 p-4 border border-slate-200'>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm font-medium text-slate-700'>Total Units</span>
                                    <Badge variant='secondary'>{metrics.totalUnits} units</Badge>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {form.units.filter(u => u.quantity > 0).map((unit) => (
                                        <Badge key={unit.id} className='bg-white border border-slate-200 text-slate-700'>
                                            {unit.quantity}x {unit.bedrooms === 0 ? 'studio' : `${unit.bedrooms}-bed`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='grid gap-4 md:grid-cols-1'>
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
                    <DealMetric label='Total sqft' value={formatNumber(metrics.totalSqft)} helper='Combined floor area' />
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
