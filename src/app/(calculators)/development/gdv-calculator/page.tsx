"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorStepper, ContinueToNextStep } from '@/components/property-kit/calculator-stepper';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { useDeal } from '@/lib/deal-context';
import { formatCurrency, formatCurrencyCompact } from '@/lib/calculators/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowRight,
    Home,
    MapPin,
    TrendingUp,
    Plus,
    Trash2,
    BedDouble,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Info,
} from 'lucide-react';

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

type Comparable = {
    address: string;
    price: number;
    sqft: number;
    psf: number;
    date: string;
    bedrooms?: number;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    suggestedPsf: number;
    comparables: Comparable[];
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const createUnit = (bedrooms: number = 2): UnitType => ({
    id: Math.random().toString(36).substr(2, 9),
    bedrooms,
    quantity: 1,
    avgSqft: bedrooms === 0 ? 400 : bedrooms === 1 ? 550 : bedrooms === 2 ? 750 : bedrooms === 3 ? 950 : 1200,
    pricePerSqft: 500,
});

const initialForm: GdvFormState = {
    postcode: '',
    propertyType: 'apartment',
    newBuildPremium: '15',
    units: [
        { id: '1', bedrooms: 2, quantity: 1, avgSqft: 750, pricePerSqft: 500 },
    ],
};

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
    };
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
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);
    const { currentDeal, updateGdvData } = useDeal();

    const metrics = useMemo(() => deriveGdvMetrics(form), [form]);

    const handleInputChange = (name: keyof Omit<GdvFormState, 'units'>, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setAiAnalysis(null); // Clear AI analysis when inputs change
    };

    const handleUnitChange = (unitId: string, field: keyof UnitType, value: number) => {
        setForm((prev) => ({
            ...prev,
            units: prev.units.map((unit) =>
                unit.id === unitId ? { ...unit, [field]: value } : unit
            ),
        }));
        setAiAnalysis(null);
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

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);

        // Save to deal context (basic calculation, no AI)
        const totalUnits = form.units.reduce((sum, u) => sum + u.quantity, 0);
        const weightedBedrooms = totalUnits > 0
            ? form.units.reduce((sum, u) => sum + (u.bedrooms * u.quantity), 0) / totalUnits
            : 2;
        const avgSqft = totalUnits > 0
            ? form.units.reduce((sum, u) => sum + (u.avgSqft * u.quantity), 0) / totalUnits
            : 750;

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
            reasoning: '',
        });
    };

    const handleAIValidation = async () => {
        if (!form.postcode) {
            alert('Please enter a postcode first');
            return;
        }

        setIsValidating(true);

        try {
            const unitMixDescription = form.units
                .filter(u => u.quantity > 0)
                .map(u => `${u.quantity}x ${u.bedrooms === 0 ? 'studio' : `${u.bedrooms}-bed`} (${u.avgSqft} sqft each)`)
                .join(', ');

            const userPsf = form.units.length > 0
                ? form.units.reduce((sum, u) => sum + u.pricePerSqft * u.quantity, 0) /
                  form.units.reduce((sum, u) => sum + u.quantity, 0)
                : 500;

            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: `You are an expert UK property valuer with access to Land Registry sold price data.
You provide accurate, data-driven GDV (Gross Development Value) analysis for property developments.
Always cite specific comparable sales with real addresses, prices, sizes, and dates where possible.
Be direct about whether the user's assumptions are realistic for the location.`,
                    userPrompt: `Analyse this GDV estimate for ${form.postcode}:

Property type: ${form.propertyType}
Unit mix: ${unitMixDescription}
Total units: ${metrics.totalUnits}
Total sqft: ${formatNumber(metrics.totalSqft)}
User's estimated £/sqft: £${formatNumber(userPsf)}
New build premium: ${form.newBuildPremium}%
User's estimated total GDV: ${formatCurrency(metrics.totalGdv)}

Please provide:
1. Is £${formatNumber(userPsf)}/sqft realistic for ${form.postcode}? What should it be?
2. 5 real comparable sales from this area (address, price, sqft, £/sqft, date)
3. Is the total GDV realistic?
4. Key risks and recommendations

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "suggestedPsf": number (your recommended £/sqft for this area),
  "comparables": [{"address": "full address", "price": number, "sqft": number, "psf": number, "date": "Mon YYYY", "bedrooms": number}],
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "current market conditions for this area"
}`,
                }),
            });

            if (!response.ok) {
                throw new Error('AI analysis failed');
            }

            const data = await response.json();
            setAiAnalysis(data);

            // Update deal context with AI reasoning
            updateGdvData({
                postcode: form.postcode,
                propertyType: form.propertyType,
                bedrooms: Math.round(form.units.reduce((sum, u) => sum + (u.bedrooms * u.quantity), 0) / metrics.totalUnits),
                totalUnits: metrics.totalUnits,
                avgSqft: metrics.totalSqft / metrics.totalUnits,
                newBuildPremium: Number.parseFloat(form.newBuildPremium),
                totalGdv: metrics.totalGdv,
                gdvPerUnit: metrics.gdvPerUnit,
                gdvPerSqft: metrics.gdvPerSqft,
                reasoning: data.summary,
            });
        } catch (error) {
            console.error('AI validation failed:', error);
            alert('AI validation failed. Please try again.');
        } finally {
            setIsValidating(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'strong': return 'bg-emerald-100 text-emerald-700';
            case 'good': return 'bg-emerald-100 text-emerald-700';
            case 'marginal': return 'bg-amber-100 text-amber-700';
            case 'weak': return 'bg-orange-100 text-orange-700';
            case 'poor': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <CalculatorPageLayout
            title="GDV Calculator"
            description="Estimate your Gross Development Value based on unit mix and local market pricing. Validate your assumptions with AI-powered market analysis."
            category="Development"
            categorySlug="development"
            categoryColor="#8B5CF6"
            badges={[
                { label: 'Development Finance', variant: 'neutral' },
                ...(currentDeal ? [{ label: `Deal: ${currentDeal.address.slice(0, 25)}...`, variant: 'info' as const }] : [])
            ]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Unit mix & location' description='Define your scheme'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Postcode'
                                        name='postcode'
                                        value={form.postcode}
                                        helper='e.g. WC1R 4PS, M1 1AA'
                                        onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                                    />
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Property type</label>
                                        <Select
                                            value={form.propertyType}
                                            onValueChange={(value) => handleInputChange('propertyType', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
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

                                {/* Unit Mix */}
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <label className='text-sm font-medium text-slate-700'>Unit Mix</label>
                                        <Button type='button' variant='outline' size='sm' onClick={addUnit} className='gap-1.5'>
                                            <Plus className='size-4' />
                                            Add Unit Type
                                        </Button>
                                    </div>

                                    <div className='space-y-3'>
                                        {form.units.map((unit) => (
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
                                                                <label className='text-xs text-slate-500'>Qty</label>
                                                                <input
                                                                    type='number'
                                                                    min='1'
                                                                    value={unit.quantity}
                                                                    onChange={(e) => handleUnitChange(unit.id, 'quantity', parseInt(e.target.value) || 1)}
                                                                    className='w-full h-10 rounded-md border border-slate-200 px-3 text-sm font-medium focus:border-[var(--pc-blue)] focus:ring-1 focus:ring-[var(--pc-blue)] outline-none'
                                                                />
                                                            </div>
                                                            <div className='space-y-1'>
                                                                <label className='text-xs text-slate-500'>Sqft</label>
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
                                                    <div className='mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm'>
                                                        <span className='text-slate-500'>
                                                            {unit.quantity}x {unit.bedrooms === 0 ? 'studio' : `${unit.bedrooms}-bed`} @ {formatNumber(unit.avgSqft)} sqft
                                                        </span>
                                                        <span className='font-semibold text-slate-900'>
                                                            {formatCurrency(unit.quantity * unit.avgSqft * unit.pricePerSqft * (1 + parseFloat(form.newBuildPremium) / 100))}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Summary badges */}
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

                                <FloatingField
                                    label='New-build premium'
                                    name='newBuildPremium'
                                    type='number'
                                    unit='%'
                                    value={form.newBuildPremium}
                                    helper='Typical range: 10-20%'
                                    onChange={(e) => handleInputChange('newBuildPremium', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<ArrowRight className='size-4' />}>
                                        Calculate GDV
                                    </PropertyButton>
                                    <PropertyButton type='button' variant='ghost' onClick={() => {
                                        setForm(initialForm);
                                        setAiAnalysis(null);
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
                        <CalculatorResultsGate
                            calculatorType="GDV Calculator"
                            calculatorSlug="gdv-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Basic Results */}
                        <BentoCard variant='secondary' title='Your GDV Estimate' description='Based on your inputs'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Total GDV'
                                    value={formatCurrencyCompact(metrics.totalGdv)}
                                    helper='All units'
                                />
                                <DealMetric
                                    label='Per unit'
                                    value={formatCurrency(metrics.gdvPerUnit)}
                                    helper='Average'
                                />
                                <DealMetric
                                    label='£/sqft'
                                    value={formatCurrency(metrics.gdvPerSqft)}
                                    helper='After premium'
                                />
                                <DealMetric
                                    label='Total sqft'
                                    value={formatNumber(metrics.totalSqft)}
                                    helper='Combined'
                                />
                            </BentoGrid>

                            {!form.postcode && hasCalculated && (
                                <div className='mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2'>
                                    <AlertTriangle className='size-4 text-amber-600 shrink-0 mt-0.5' />
                                    <p className='text-sm text-amber-800'>
                                        Enter a postcode to validate these figures with AI market analysis.
                                    </p>
                                </div>
                            )}
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='GDV estimate'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-[var(--pc-blue)] to-blue-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Market Analysis</span>
                                        </div>
                                        <Badge className={getVerdictColor(aiAnalysis.verdict)}>
                                            {aiAnalysis.verdict.charAt(0).toUpperCase() + aiAnalysis.verdict.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className='p-6 space-y-6'>
                                    {/* Summary */}
                                    <div>
                                        <p className='text-slate-700'>{aiAnalysis.summary}</p>
                                    </div>

                                    {/* Suggested pricing */}
                                    {aiAnalysis.suggestedPsf && (
                                        <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <p className='text-sm text-blue-600 font-medium'>AI Suggested £/sqft</p>
                                                    <p className='text-2xl font-bold text-blue-900'>
                                                        {formatCurrency(aiAnalysis.suggestedPsf)}
                                                    </p>
                                                </div>
                                                <div className='text-right'>
                                                    <p className='text-sm text-blue-600'>Your estimate</p>
                                                    <p className='text-lg font-semibold text-blue-700'>
                                                        {formatCurrency(metrics.gdvPerSqft)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comparables */}
                                    {aiAnalysis.comparables && aiAnalysis.comparables.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                                <MapPin className='size-4' />
                                                Market Comparables
                                            </h4>
                                            <div className='space-y-2'>
                                                {aiAnalysis.comparables.map((comp, i) => (
                                                    <div
                                                        key={i}
                                                        className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm'
                                                    >
                                                        <div>
                                                            <p className='font-medium text-slate-900'>{comp.address}</p>
                                                            <p className='text-xs text-slate-500'>
                                                                {comp.bedrooms && `${comp.bedrooms} bed · `}{comp.sqft} sqft · {comp.date}
                                                            </p>
                                                        </div>
                                                        <div className='text-right'>
                                                            <p className='font-semibold text-slate-900'>{formatCurrency(comp.price)}</p>
                                                            <p className='text-xs text-emerald-600 font-medium'>{formatCurrency(comp.psf)}/sqft</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Insights */}
                                    {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3'>Key Insights</h4>
                                            <div className='space-y-2'>
                                                {aiAnalysis.insights.map((insight, i) => (
                                                    <div
                                                        key={i}
                                                        className={`p-3 rounded-lg border ${
                                                            insight.type === 'positive' ? 'bg-emerald-50 border-emerald-200' :
                                                            insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                                            insight.type === 'negative' ? 'bg-red-50 border-red-200' :
                                                            'bg-slate-50 border-slate-200'
                                                        }`}
                                                    >
                                                        <div className='flex items-start gap-2'>
                                                            {insight.type === 'positive' && <CheckCircle2 className='size-4 text-emerald-600 shrink-0 mt-0.5' />}
                                                            {insight.type === 'warning' && <AlertTriangle className='size-4 text-amber-600 shrink-0 mt-0.5' />}
                                                            {insight.type === 'negative' && <AlertTriangle className='size-4 text-red-600 shrink-0 mt-0.5' />}
                                                            {insight.type === 'neutral' && <Info className='size-4 text-slate-600 shrink-0 mt-0.5' />}
                                                            <div>
                                                                <p className='font-medium text-slate-900 text-sm'>{insight.title}</p>
                                                                <p className='text-sm text-slate-600'>{insight.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Market Context */}
                                    {aiAnalysis.marketContext && (
                                        <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                            <h4 className='font-semibold text-slate-900 mb-2 flex items-center gap-2'>
                                                <TrendingUp className='size-4' />
                                                Market Context
                                            </h4>
                                            <p className='text-sm text-slate-600'>{aiAnalysis.marketContext}</p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-2'>Recommendations</h4>
                                            <ul className='space-y-1'>
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <li key={i} className='text-sm text-slate-600 flex items-start gap-2'>
                                                        <ArrowRight className='size-4 text-[var(--pc-blue)] shrink-0 mt-0.5' />
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Continue CTA */}
            {hasCalculated && (
                <section className='flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-6'>
                    <div>
                        <p className='font-medium text-gray-900'>GDV Estimate Complete</p>
                        <p className='text-sm text-gray-600'>
                            Continue to calculate build costs for your development.
                        </p>
                    </div>
                    <ContinueToNextStep nextStep={3} />
                </section>
            )}

            {/* SEO Content */}
            <CalculatorSEO
                calculatorName="GDV Calculator"
                calculatorSlug="gdv-calculator"
                description="The GDV Calculator helps UK property developers estimate Gross Development Value for residential schemes. Calculate total sales value based on unit mix, comparable sales, and market pricing with AI-powered validation using Land Registry data."
                howItWorks={`The GDV Calculator estimates total development value:

1. Unit Mix - Define your scheme by bedroom types (studio to 5+ bed), quantity of each type, and typical sizes (sqft)
2. Price per Sqft - Enter estimated sales price per sqft for each unit type based on local comparables
3. New Build Premium - Apply 10-20% premium that new builds typically command over second-hand stock
4. Total GDV - Calculates total sales value across all units
5. AI Validation - Optionally validate assumptions with AI analysis using Land Registry data and local market comparables

The calculator provides GDV per unit, GDV per sqft, and total scheme value with full unit mix breakdown.`}
                whenToUse="Use this calculator during site appraisal and feasibility stage to estimate total sales value. Essential for calculating profit on cost, residual land value, and structuring development finance. Use before acquiring sites to determine maximum viable bid price."
                keyFeatures={[
                    "Flexible unit mix configuration for multi-unit schemes",
                    "Price per sqft calculation for accurate valuations",
                    "New build premium adjustment (typically 10-20%)",
                    "AI validation with Land Registry comparables and market context",
                ]}
                faqs={[
                    {
                        question: "What is GDV and why is it important?",
                        answer: "GDV (Gross Development Value) is the total sales value of a completed development before any costs are deducted. It's the foundation of every development appraisal - you work backwards from GDV to calculate profit on cost, residual land value, and assess viability. Lenders use GDV to determine maximum loan size (typically 65-70% LTGDV). Accurate GDV is critical - overestimate by 10% and your land bid could be 30%+ too high."
                    },
                    {
                        question: "How do I estimate price per sqft accurately?",
                        answer: "Use Land Registry sold price data for recent comparables (last 6-12 months) in your postcode area. Filter by property type and bedrooms. Calculate £/sqft from sale price ÷ property size. New builds command 10-20% premium over second-hand. Prime locations (zones 1-2, city centres) achieve higher £/sqft. Remember: sales values fall during build, so use conservative assumptions. It's better to underestimate GDV than overestimate."
                    },
                    {
                        question: "What new build premium should I use?",
                        answer: "New build premium varies by location and market: Prime London 15-20%, Provincial cities 10-15%, Suburban areas 8-12%. Premium reflects buyers paying for modern spec, warranties, Help to Buy eligibility, and no chain. However, premiums compress in weaker markets. Use conservative assumptions - factor in sales incentives (3-5% of GDV for agents, Help to Buy, stamp duty contributions)."
                    },
                    {
                        question: "How should I plan unit mix?",
                        answer: "Research local demand using agents and Rightmove data. Most schemes need balanced mix: 1-beds for investors/FTBs (25-35%), 2-beds as core offering (40-50%), 3-beds for families (15-25%). Avoid heavy weighting to one type - market absorption is slower. Consider: local demographics, commuter patterns, school quality (for 3-beds), investor vs owner-occupier split. Speak to 3-5 local agents before finalising unit mix."
                    },
                    {
                        question: "Should I use GIA or NIA for GDV calculations?",
                        answer: "Use NIA (Net Internal Area) for sales values as this is what buyers see on particulars and rightmove. NIA excludes walls, columns, and service ducts. For flats, NIA is typically 85-90% of GIA. Marketing agents measure using RICS guidance which effectively means NIA. Don't confuse this with build costs which use GIA. Converting: roughly, NIA = GIA × 0.87 for apartments."
                    },
                ]}
                relatedTerms={[
                    "Gross Development Value calculator",
                    "GDV calculator UK",
                    "Property development appraisal",
                    "Price per sqft calculator",
                    "New build premium UK",
                    "Unit mix calculator",
                    "Land Registry comparables",
                    "Development valuation",
                    "Sales value calculator",
                    "Residential development GDV",
                ]}
                categoryColor="#8B5CF6"
            />
        </CalculatorPageLayout>
    );
};

export default GdvCalculatorPage;
