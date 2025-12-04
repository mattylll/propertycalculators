"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { formatCurrency, formatCurrencyCompact } from '@/lib/calculators/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calculator,
    Home,
    TrendingUp,
    Ruler,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Info,
    ArrowRight,
    ArrowUp,
    PoundSterling,
    Percent,
} from 'lucide-react';

type LoftConversionFormState = {
    propertyType: string;
    conversionType: string;
    loftSize: string;
    bedroomsAdded: string;
    includeEnSuite: string;
    currentValue: string;
    region: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

// Cost estimates by conversion type (per sqm)
const conversionCosts: Record<string, { low: number; mid: number; high: number; description: string }> = {
    'velux': {
        low: 1100,
        mid: 1300,
        high: 1600,
        description: 'Roof windows only, no structural changes',
    },
    'dormer-rear': {
        low: 1400,
        mid: 1700,
        high: 2100,
        description: 'Single rear dormer extension',
    },
    'dormer-l-shaped': {
        low: 1600,
        mid: 2000,
        high: 2500,
        description: 'L-shaped dormer on rear and side',
    },
    'hip-to-gable': {
        low: 1800,
        mid: 2200,
        high: 2700,
        description: 'Hip roof converted to gable end',
    },
    'mansard': {
        low: 2200,
        mid: 2700,
        high: 3300,
        description: 'Full mansard with new roof structure',
    },
};

// Regional multipliers
const regionMultipliers: Record<string, number> = {
    'london-prime': 1.40,
    'london-outer': 1.25,
    'south-east': 1.10,
    'south-west': 1.00,
    'midlands': 0.90,
    'north-west': 0.85,
    'north-east': 0.80,
    'scotland': 0.85,
    'wales': 0.80,
};

// Value add estimates (% of property value added per bedroom)
const valueAddEstimates: Record<string, number> = {
    'london-prime': 0.12,
    'london-outer': 0.10,
    'south-east': 0.09,
    'south-west': 0.08,
    'midlands': 0.08,
    'north-west': 0.07,
    'north-east': 0.07,
    'scotland': 0.07,
    'wales': 0.07,
};

const propertyTypes = [
    { value: 'semi', label: 'Semi-detached' },
    { value: 'detached', label: 'Detached' },
    { value: 'terraced', label: 'Terraced' },
    { value: 'end-terrace', label: 'End terrace' },
    { value: 'bungalow', label: 'Bungalow' },
];

const conversionTypes = [
    { value: 'velux', label: 'Velux/Rooflight' },
    { value: 'dormer-rear', label: 'Rear Dormer' },
    { value: 'dormer-l-shaped', label: 'L-Shaped Dormer' },
    { value: 'hip-to-gable', label: 'Hip to Gable' },
    { value: 'mansard', label: 'Mansard' },
];

const regions = [
    { value: 'london-prime', label: 'London (Prime/Central)' },
    { value: 'london-outer', label: 'London (Outer)' },
    { value: 'south-east', label: 'South East' },
    { value: 'south-west', label: 'South West' },
    { value: 'midlands', label: 'Midlands' },
    { value: 'north-west', label: 'North West' },
    { value: 'north-east', label: 'North East / Yorkshire' },
    { value: 'scotland', label: 'Scotland' },
    { value: 'wales', label: 'Wales' },
];

const initialForm: LoftConversionFormState = {
    propertyType: 'semi',
    conversionType: 'dormer-rear',
    loftSize: '25',
    bedroomsAdded: '1',
    includeEnSuite: 'yes',
    currentValue: '400,000',
    region: 'south-east',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveLoftMetrics = (form: LoftConversionFormState) => {
    const loftSize = parseNumber(form.loftSize);
    const bedroomsAdded = parseNumber(form.bedroomsAdded);
    const currentValue = parseNumber(form.currentValue);

    const costData = conversionCosts[form.conversionType] || conversionCosts['dormer-rear'];
    const regionMultiplier = regionMultipliers[form.region] || 1.0;
    const valueAddPercent = valueAddEstimates[form.region] || 0.08;

    // Calculate costs
    const baseCostLow = loftSize * costData.low;
    const baseCostMid = loftSize * costData.mid;
    const baseCostHigh = loftSize * costData.high;

    // Apply regional adjustment
    const adjustedCostLow = baseCostLow * regionMultiplier;
    const adjustedCostMid = baseCostMid * regionMultiplier;
    const adjustedCostHigh = baseCostHigh * regionMultiplier;

    // Add en-suite cost if selected
    const enSuiteCost = form.includeEnSuite === 'yes' ? 8000 * regionMultiplier : 0;

    const totalCostLow = adjustedCostLow + enSuiteCost;
    const totalCostMid = adjustedCostMid + enSuiteCost;
    const totalCostHigh = adjustedCostHigh + enSuiteCost;

    // Calculate value add
    const baseValueAdd = currentValue * valueAddPercent * bedroomsAdded;
    const enSuiteValueBonus = form.includeEnSuite === 'yes' ? currentValue * 0.02 : 0;
    const totalValueAdd = baseValueAdd + enSuiteValueBonus;

    // Calculate ROI (using mid-range cost)
    const roi = totalCostMid > 0 ? ((totalValueAdd - totalCostMid) / totalCostMid) * 100 : 0;
    const profitLoss = totalValueAdd - totalCostMid;

    // New property value
    const newValue = currentValue + totalValueAdd;

    // Cost per sqm
    const costPerSqm = loftSize > 0 ? totalCostMid / loftSize : 0;

    // Value add per sqm
    const valuePerSqm = loftSize > 0 ? totalValueAdd / loftSize : 0;

    return {
        loftSize,
        bedroomsAdded,
        currentValue,
        costLow: totalCostLow,
        costMid: totalCostMid,
        costHigh: totalCostHigh,
        valueAdd: totalValueAdd,
        roi,
        profitLoss,
        newValue,
        costPerSqm,
        valuePerSqm,
        conversionDescription: costData.description,
        regionMultiplier,
        enSuiteCost,
    };
};

const LoftConversionCalculatorPage = () => {
    const [form, setForm] = useState<LoftConversionFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveLoftMetrics(form), [form]);

    const handleInputChange = (name: keyof LoftConversionFormState, value: string) => {
        if (['currentValue'].includes(name)) {
            const numValue = parseNumber(value);
            setForm((prev) => ({ ...prev, [name]: formatNumber(numValue) }));
        } else if (name === 'postcode') {
            setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        setAiAnalysis(null);
    };

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
    };

    const handleAIValidation = async () => {
        if (!form.postcode) {
            alert('Please enter a postcode to validate with AI');
            return;
        }

        setIsValidating(true);

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: `You are an expert UK property valuation analyst specialising in home improvements and loft conversions.
You have knowledge of local property values and how loft conversions affect property prices in different areas.
You can advise on planning requirements and build costs.`,
                    userPrompt: `Analyse this loft conversion project in ${form.postcode}:

Property: ${propertyTypes.find(p => p.value === form.propertyType)?.label}
Conversion type: ${conversionTypes.find(c => c.value === form.conversionType)?.label}
Loft size: ${metrics.loftSize} sqm
Bedrooms added: ${metrics.bedroomsAdded}
En-suite included: ${form.includeEnSuite === 'yes' ? 'Yes' : 'No'}

Current property value: ${formatCurrency(metrics.currentValue)}
Estimated cost: ${formatCurrency(metrics.costLow)} - ${formatCurrency(metrics.costHigh)}
Estimated value add: ${formatCurrency(metrics.valueAdd)}
ROI: ${metrics.roi.toFixed(1)}%

Please assess:
1. Is this ROI realistic for the area?
2. Are the cost estimates accurate for ${form.postcode}?
3. Any planning considerations?
4. Market demand for extra bedrooms in this area?

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local market context for loft conversions"
}`,
                }),
            });

            if (!response.ok) throw new Error('AI analysis failed');
            const data = await response.json();
            setAiAnalysis(data);
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

    const getRoiBadge = () => {
        if (metrics.roi >= 50) return { label: 'Excellent ROI', className: 'bg-emerald-100 text-emerald-700' };
        if (metrics.roi >= 25) return { label: 'Good ROI', className: 'bg-emerald-100 text-emerald-700' };
        if (metrics.roi >= 0) return { label: 'Marginal ROI', className: 'bg-amber-100 text-amber-700' };
        return { label: 'Negative ROI', className: 'bg-red-100 text-red-700' };
    };

    return (
        <CalculatorPageLayout
            title="Loft Conversion Calculator"
            description="Calculate the cost, value add, and ROI for your loft conversion project. Compare different conversion types and get AI-powered market validation."
            category="Refurb"
            categorySlug="refurb"
            categoryColor="#EF4444"
            badges={[{ label: 'Loft Conversion Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Project details' description='Configure your loft conversion'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
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
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Conversion type</label>
                                        <Select
                                            value={form.conversionType}
                                            onValueChange={(value) => handleInputChange('conversionType', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {conversionTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600'>
                                    <p>{metrics.conversionDescription}</p>
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Loft size'
                                        name='loftSize'
                                        type='number'
                                        value={form.loftSize}
                                        unit='sqm'
                                        helper='Usable floor area'
                                        onChange={(e) => handleInputChange('loftSize', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Bedrooms added'
                                        name='bedroomsAdded'
                                        type='number'
                                        value={form.bedroomsAdded}
                                        helper='New bedrooms created'
                                        onChange={(e) => handleInputChange('bedroomsAdded', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Include en-suite?</label>
                                        <Select
                                            value={form.includeEnSuite}
                                            onValueChange={(value) => handleInputChange('includeEnSuite', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='yes'>Yes (+approx. {formatCurrency(8000 * (regionMultipliers[form.region] || 1))})</SelectItem>
                                                <SelectItem value='no'>No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Region</label>
                                        <Select
                                            value={form.region}
                                            onValueChange={(value) => handleInputChange('region', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
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
                                </div>

                                <FloatingField
                                    label='Current property value'
                                    name='currentValue'
                                    value={form.currentValue}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Before loft conversion'
                                    onChange={(e) => handleInputChange('currentValue', e.target.value)}
                                />

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI market validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate ROI
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

                        {/* Cost Breakdown */}
                        <BentoCard variant='secondary' title='Cost estimate breakdown' description='How costs are calculated'>
                            <div className='space-y-3 text-sm'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-slate-600'>Base build cost ({metrics.loftSize} sqm)</span>
                                    <span className='font-medium'>{formatCurrency(metrics.costMid - metrics.enSuiteCost)}</span>
                                </div>
                                {form.includeEnSuite === 'yes' && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-slate-600'>En-suite bathroom</span>
                                        <span className='font-medium'>+ {formatCurrency(metrics.enSuiteCost)}</span>
                                    </div>
                                )}
                                <div className='flex items-center justify-between text-xs text-slate-500'>
                                    <span>Regional adjustment ({((metrics.regionMultiplier - 1) * 100).toFixed(0)}%)</span>
                                    <span>Included</span>
                                </div>
                                <div className='border-t pt-3 flex items-center justify-between font-medium'>
                                    <span className='text-slate-900'>Estimated total cost</span>
                                    <span className='text-[var(--pc-blue)]'>{formatCurrency(metrics.costMid)}</span>
                                </div>
                                <div className='text-xs text-slate-500'>
                                    Range: {formatCurrency(metrics.costLow)} - {formatCurrency(metrics.costHigh)}
                                </div>
                            </div>
                        </BentoCard>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        <CalculatorResultsGate
                            calculatorType="Loft Conversion Calculator"
                            calculatorSlug="loft-conversion-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* ROI Card */}
                        <Card className={`border-2 ${
                            metrics.roi >= 25 ? 'border-emerald-200 bg-emerald-50' :
                            metrics.roi >= 0 ? 'border-amber-200 bg-amber-50' :
                            'border-red-200 bg-red-50'
                        }`}>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='font-semibold text-lg text-slate-900'>Return on Investment</h3>
                                    <Badge className={getRoiBadge().className}>{getRoiBadge().label}</Badge>
                                </div>
                                <div className='text-center py-4'>
                                    <p className={`text-5xl font-bold ${metrics.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {metrics.roi >= 0 ? '+' : ''}{metrics.roi.toFixed(1)}%
                                    </p>
                                    <p className='text-sm text-slate-600 mt-2'>
                                        {metrics.profitLoss >= 0 ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(metrics.profitLoss))}
                                    </p>
                                </div>

                                {/* Value comparison */}
                                <div className='mt-4 grid grid-cols-2 gap-4'>
                                    <div className='text-center p-3 rounded-lg bg-white border border-slate-200'>
                                        <p className='text-xs text-slate-500'>Cost</p>
                                        <p className='text-lg font-bold text-slate-900'>{formatCurrencyCompact(metrics.costMid)}</p>
                                    </div>
                                    <div className='text-center p-3 rounded-lg bg-white border border-slate-200'>
                                        <p className='text-xs text-slate-500'>Value Added</p>
                                        <p className='text-lg font-bold text-emerald-600'>{formatCurrencyCompact(metrics.valueAdd)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Project metrics' description='Cost and value analysis'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Build Cost'
                                    value={formatCurrencyCompact(metrics.costMid)}
                                    helper={`${formatCurrency(metrics.costPerSqm)}/sqm`}
                                />
                                <DealMetric
                                    label='Value Add'
                                    value={formatCurrencyCompact(metrics.valueAdd)}
                                    helper={`${formatCurrency(metrics.valuePerSqm)}/sqm`}
                                />
                                <DealMetric
                                    label='Current Value'
                                    value={formatCurrencyCompact(metrics.currentValue)}
                                    helper='Before conversion'
                                />
                                <DealMetric
                                    label='New Value'
                                    value={formatCurrencyCompact(metrics.newValue)}
                                    helper='After conversion'
                                />
                            </BentoGrid>

                            {/* Value uplift bar */}
                            <div className='mt-6'>
                                <div className='flex items-center justify-between text-sm mb-2'>
                                    <span className='text-slate-600'>Property value increase</span>
                                    <span className='font-medium text-emerald-600'>
                                        +{((metrics.valueAdd / metrics.currentValue) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
                                    <div
                                        className='h-full bg-emerald-500 rounded-full transition-all'
                                        style={{ width: `${Math.min((metrics.valueAdd / metrics.currentValue) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </BentoCard>

                        {/* Planning Note */}
                        <Card className='border-blue-200 bg-blue-50'>
                            <CardContent className='p-4 flex items-start gap-3'>
                                <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='font-medium text-blue-900'>Planning Permission</p>
                                    <p className='text-sm text-blue-700 mt-1'>
                                        {form.conversionType === 'velux' ? (
                                            'Velux conversions typically fall under Permitted Development and don\'t require planning permission.'
                                        ) : form.conversionType === 'mansard' ? (
                                            'Mansard conversions usually require full planning permission as they significantly alter the roofline.'
                                        ) : (
                                            'Dormer conversions may be Permitted Development, but check with your local authority as restrictions apply in conservation areas.'
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='loft conversion ROI'
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
                                    <p className='text-slate-700'>{aiAnalysis.summary}</p>

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

                                    {aiAnalysis.marketContext && (
                                        <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                            <h4 className='font-semibold text-slate-900 mb-2 flex items-center gap-2'>
                                                <TrendingUp className='size-4' />
                                                Local Market Context
                                            </h4>
                                            <p className='text-sm text-slate-600'>{aiAnalysis.marketContext}</p>
                                        </div>
                                    )}

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
                        </CalculatorResultsGate>
                    </div>
                </div>

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="Loft Conversion Calculator"
                    calculatorSlug="loft-conversion-calculator"
                    description="The Loft Conversion Calculator helps UK homeowners and property investors estimate the cost and value-add of converting a loft into habitable space. Calculate ROI for different conversion types including Velux, dormer, hip-to-gable, and mansard conversions. Get region-specific costs and understand your potential return on investment."
                    howItWorks={`The calculator analyses loft conversions by:

1. Conversion Type - Choose from Velux, rear dormer, L-shaped dormer, hip-to-gable, or mansard
2. Space Calculation - Enter usable loft area in square metres
3. Regional Costs - Automatic adjustment for your UK region (London +40% to Wales -8%)
4. Value Add - Estimates value increase based on bedrooms added and local market
5. ROI Analysis - Compares total conversion cost against property value increase
6. En-suite Premium - Factors in additional value from en-suite bathrooms

Cost estimates are based on 2024 UK market rates and include all structural work, insulation, electrics, plumbing, finishes, and Building Regulations compliance. Regional multipliers ensure accurate pricing across the UK.`}
                    whenToUse="Use this calculator when considering adding living space to your property through loft conversion. Ideal for homeowners looking to add bedrooms without extending, property developers assessing flip projects, or investors analyzing value-add opportunities. Essential before getting quotes to understand project viability and expected returns."
                    keyFeatures={[
                        "Five conversion types with accurate UK cost per sqm",
                        "Regional cost multipliers across all UK regions",
                        "Value-add calculation based on bedrooms added",
                        "En-suite bathroom cost and value analysis",
                        "Planning permission guidance by conversion type",
                        "ROI and profit/loss projections",
                    ]}
                    faqs={[
                        {
                            question: "Do I need planning permission for a loft conversion?",
                            answer: "Velux conversions typically fall under Permitted Development Rights and don't need planning permission. Dormer conversions may qualify if under 50 cubic metres (40 for terraced houses) and don't exceed the highest point of the roof. Hip-to-gable and mansard conversions usually require full planning permission. Conservation areas and listed buildings have stricter rules."
                        },
                        {
                            question: "How much does a loft conversion cost per square metre?",
                            answer: "UK costs vary by type and region: Velux conversions £1,100-£1,600/sqm, rear dormers £1,400-£2,100/sqm, L-shaped dormers £1,600-£2,500/sqm, hip-to-gable £1,800-£2,700/sqm, and mansard £2,200-£3,300/sqm. London costs are 40% higher, while Wales and North East are 20% lower. A typical 25sqm conversion costs £30,000-£60,000 depending on specification."
                        },
                        {
                            question: "How much value does a loft conversion add?",
                            answer: "A loft conversion typically adds 10-20% to property value, depending on location and quality. In London, adding a bedroom can increase value by 12-15%, while in the Midlands it's around 8%. The conversion should add more value than it costs - aim for an ROI of at least 25% to account for hassle and risk."
                        },
                        {
                            question: "What's the difference between a Velux and dormer conversion?",
                            answer: "A Velux conversion adds roof windows (rooflights) without changing the roofline - it's the cheapest option but provides less headroom and space. A dormer extends through the roof creating additional floor space and full head height. Dormers are more expensive but add significantly more usable space and better suit bedrooms with en-suites."
                        },
                        {
                            question: "Do I need Building Regulations approval for a loft conversion?",
                            answer: "Yes, all loft conversions require Building Regulations approval regardless of whether planning permission is needed. This covers structural calculations, fire safety, stairs, insulation, and ventilation. Your contractor should handle this, but budget £1,000-£2,000 for Building Control fees and structural engineer reports."
                        },
                    ]}
                    relatedTerms={[
                        "Loft conversion cost UK",
                        "Dormer loft conversion",
                        "Velux loft conversion",
                        "Mansard loft conversion",
                        "Hip to gable conversion",
                        "Loft conversion ROI",
                        "Permitted development loft",
                        "Building regulations loft",
                        "Add bedroom loft conversion",
                        "Property value loft conversion",
                    ]}
                    categoryColor="#EF4444"
                />
        </CalculatorPageLayout>
    );
};

export default LoftConversionCalculatorPage;
