"use client";

import { useMemo, useState } from 'react';

import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowRight,
    FileText,
    PoundSterling,
    Calendar,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Clock,
    TrendingDown,
    Scale,
} from 'lucide-react';

type LeaseExtensionFormState = {
    flatValue: string;
    currentLeaseYears: string;
    groundRent: string;
    groundRentReviewYears: string;
    groundRentIncrease: string;
    relatedness: 'yes' | 'no';
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: LeaseExtensionFormState = {
    flatValue: '350,000',
    currentLeaseYears: '82',
    groundRent: '250',
    groundRentReviewYears: '25',
    groundRentIncrease: 'double',
    relatedness: 'no',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// Simplified lease extension calculation using relativity graphs and formula
const deriveLeaseExtensionMetrics = (form: LeaseExtensionFormState) => {
    const flatValue = parseNumber(form.flatValue);
    const currentLeaseYears = parseNumber(form.currentLeaseYears);
    const groundRent = parseNumber(form.groundRent);
    const reviewYears = parseNumber(form.groundRentReviewYears);

    // Capitalisation rate for ground rent (typically 6-7%)
    const capRate = 0.065;

    // Deferment rate (typically 5% for flats)
    const defermentRate = 0.05;

    // Calculate years purchase for ground rent term
    const yearsMultiplier = (1 - Math.pow(1 + capRate, -currentLeaseYears)) / capRate;

    // Capitalised ground rent value
    const capitalisedGroundRent = groundRent * yearsMultiplier;

    // Relativity - simplified graph based on Savills/RICS data
    // This is the percentage of freehold value the current lease is worth
    const getRelativity = (years: number): number => {
        if (years >= 100) return 99;
        if (years >= 95) return 97;
        if (years >= 90) return 95;
        if (years >= 85) return 92;
        if (years >= 80) return 88;
        if (years >= 75) return 82;
        if (years >= 70) return 75;
        if (years >= 65) return 68;
        if (years >= 60) return 60;
        if (years >= 55) return 52;
        if (years >= 50) return 45;
        if (years >= 45) return 38;
        if (years >= 40) return 32;
        return 25;
    };

    const currentRelativity = getRelativity(currentLeaseYears);
    const extendedRelativity = 99; // 999-year lease is essentially freehold

    // Value of current lease
    const currentLeaseValue = flatValue * (currentRelativity / 100);

    // Value after extension (999 years)
    const extendedLeaseValue = flatValue * (extendedRelativity / 100);

    // Diminution in freeholder's interest
    const diminution = capitalisedGroundRent;

    // Marriage value (only applies if lease is under 80 years)
    // Under new reform, marriage value is being abolished, but still relevant for now
    let marriageValue = 0;
    if (currentLeaseYears < 80 && form.relatedness === 'no') {
        marriageValue = (extendedLeaseValue - currentLeaseValue - diminution) * 0.5;
    }

    // Total premium
    const premium = diminution + Math.max(0, marriageValue);

    // Professional costs estimate
    const surveyorFees = Math.max(1500, flatValue * 0.003);
    const legalFees = Math.max(1500, flatValue * 0.002);
    const freeholderCosts = Math.max(1000, flatValue * 0.002); // You pay their costs too

    const totalProfessionalCosts = surveyorFees + legalFees + freeholderCosts;
    const totalCost = premium + totalProfessionalCosts;

    // Value uplift from extension
    const valueUplift = extendedLeaseValue - currentLeaseValue;
    const netGain = valueUplift - totalCost;
    const roi = totalCost > 0 ? (netGain / totalCost) * 100 : 0;

    // Urgency assessment
    const yearsTo80 = currentLeaseYears - 80;
    const isMarriageValueZone = currentLeaseYears < 80;
    const isCritical = currentLeaseYears < 70;

    return {
        flatValue,
        currentLeaseYears,
        currentRelativity,
        extendedRelativity,
        currentLeaseValue,
        extendedLeaseValue,
        capitalisedGroundRent,
        diminution,
        marriageValue,
        premium,
        surveyorFees,
        legalFees,
        freeholderCosts,
        totalProfessionalCosts,
        totalCost,
        valueUplift,
        netGain,
        roi,
        yearsTo80,
        isMarriageValueZone,
        isCritical,
    };
};

const LeaseExtensionCalculatorPage = () => {
    const [form, setForm] = useState<LeaseExtensionFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveLeaseExtensionMetrics(form), [form]);

    const handleInputChange = (name: keyof LeaseExtensionFormState, value: string) => {
        if (['flatValue', 'groundRent'].includes(name)) {
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
                    systemPrompt: `You are an expert UK leasehold property specialist and valuation surveyor.
You provide accurate analysis for lease extension calculations.
Be aware of the Leasehold Reform Act and upcoming changes.`,
                    userPrompt: `Analyse this lease extension in ${form.postcode}:

Flat value: ${formatCurrency(metrics.flatValue)}
Current lease: ${metrics.currentLeaseYears} years
Ground rent: ${formatCurrency(parseNumber(form.groundRent))}/year
Estimated premium: ${formatCurrency(metrics.premium)}
Marriage value included: ${metrics.marriageValue > 0 ? 'Yes' : 'No'}
Total cost (inc. fees): ${formatCurrency(metrics.totalCost)}
Value uplift: ${formatCurrency(metrics.valueUplift)}
Net gain: ${formatCurrency(metrics.netGain)}

Please assess:
1. Is this premium estimate reasonable for the area?
2. Key considerations given the current lease length
3. Should they extend now or wait for reforms?
4. Any negotiation strategies

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "leasehold market context"
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

    const getLeaseUrgency = () => {
        if (metrics.currentLeaseYears < 70) return { label: 'Critical', color: 'warning' as const, message: 'Mortgage difficult, act now' };
        if (metrics.currentLeaseYears < 80) return { label: 'Urgent', color: 'warning' as const, message: 'Marriage value applies' };
        if (metrics.currentLeaseYears < 85) return { label: 'Consider Soon', color: 'info' as const, message: 'Approaching 80-year threshold' };
        return { label: 'Not Urgent', color: 'success' as const, message: 'No marriage value payable' };
    };

    const urgency = getLeaseUrgency();

    return (
        <CalculatorPageLayout
            title="Lease Extension Calculator"
            description="Estimate the cost to extend your lease using the statutory formula. Includes marriage value calculation for leases under 80 years."
            category="Leasehold"
            categorySlug="leasehold"
            categoryColor="#06B6D4"
            badges={[
                { label: urgency.label, variant: urgency.color },
            ]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter your leasehold details'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Flat value (with long lease)'
                                    name='flatValue'
                                    value={form.flatValue}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Current market value if lease was 999 years'
                                    onChange={(e) => handleInputChange('flatValue', e.target.value)}
                                />

                                <FloatingField
                                    label='Current lease remaining'
                                    name='currentLeaseYears'
                                    type='number'
                                    value={form.currentLeaseYears}
                                    unit='years'
                                    helper='Check your lease document'
                                    onChange={(e) => handleInputChange('currentLeaseYears', e.target.value)}
                                />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Current ground rent'
                                        name='groundRent'
                                        value={form.groundRent}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Annual amount'
                                        onChange={(e) => handleInputChange('groundRent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Review period'
                                        name='groundRentReviewYears'
                                        type='number'
                                        value={form.groundRentReviewYears}
                                        unit='years'
                                        helper='How often does it increase?'
                                        onChange={(e) => handleInputChange('groundRentReviewYears', e.target.value)}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Ground Rent Increase Type</label>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {[
                                            { value: 'fixed', label: 'Fixed' },
                                            { value: 'double', label: 'Doubling' },
                                            { value: 'rpi', label: 'RPI Linked' },
                                            { value: 'review', label: 'Market Review' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type='button'
                                                onClick={() => handleInputChange('groundRentIncrease', option.value)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                    form.groundRentIncrease === option.value
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Related to freeholder?</label>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <button
                                            type='button'
                                            onClick={() => handleInputChange('relatedness', 'no')}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                form.relatedness === 'no'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            No
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleInputChange('relatedness', 'yes')}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                form.relatedness === 'yes'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Yes
                                        </button>
                                    </div>
                                    <p className='text-xs text-gray-500'>Family connection affects marriage value</p>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                {/* Urgency Warning */}
                                {metrics.currentLeaseYears < 85 && (
                                    <div className={`p-4 rounded-xl border ${
                                        metrics.isCritical ? 'bg-red-50 border-red-200' :
                                        metrics.isMarriageValueZone ? 'bg-amber-50 border-amber-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}>
                                        <div className='flex items-start gap-3'>
                                            <AlertTriangle className={`size-5 shrink-0 mt-0.5 ${
                                                metrics.isCritical ? 'text-red-600' :
                                                metrics.isMarriageValueZone ? 'text-amber-600' :
                                                'text-blue-600'
                                            }`} />
                                            <div>
                                                <p className={`font-medium text-sm ${
                                                    metrics.isCritical ? 'text-red-900' :
                                                    metrics.isMarriageValueZone ? 'text-amber-900' :
                                                    'text-blue-900'
                                                }`}>
                                                    {urgency.label}: {urgency.message}
                                                </p>
                                                <p className='text-xs mt-1 text-slate-600'>
                                                    {metrics.isMarriageValueZone
                                                        ? `Marriage value adds ${formatCurrency(metrics.marriageValue)} to the premium`
                                                        : metrics.yearsTo80 <= 5
                                                            ? `Only ${metrics.yearsTo80} years until marriage value applies`
                                                            : 'Consider extending before reaching 80 years'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Premium
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

                        {/* Lease Length Visual */}
                        <BentoCard variant='secondary' title='Lease position' description='Visual representation'>
                            <div className='space-y-4'>
                                <div>
                                    <div className='flex justify-between text-sm mb-2'>
                                        <span className='text-slate-600'>Current lease: {metrics.currentLeaseYears} years</span>
                                        <span className='text-slate-600'>Relativity: {metrics.currentRelativity}%</span>
                                    </div>
                                    <Progress
                                        value={metrics.currentRelativity}
                                        className='h-4'
                                    />
                                </div>
                                <div className='grid grid-cols-4 gap-2 text-xs'>
                                    <div className={`p-2 rounded text-center ${metrics.currentLeaseYears < 70 ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                                        &lt;70 yrs<br/>Critical
                                    </div>
                                    <div className={`p-2 rounded text-center ${metrics.currentLeaseYears >= 70 && metrics.currentLeaseYears < 80 ? 'bg-amber-100 text-amber-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                                        70-79 yrs<br/>Marriage Value
                                    </div>
                                    <div className={`p-2 rounded text-center ${metrics.currentLeaseYears >= 80 && metrics.currentLeaseYears < 90 ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                                        80-89 yrs<br/>Consider Soon
                                    </div>
                                    <div className={`p-2 rounded text-center ${metrics.currentLeaseYears >= 90 ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                                        90+ yrs<br/>Not Urgent
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Extension cost estimate' description='Based on statutory formula'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Estimated Premium'
                                    value={formatCurrency(metrics.premium)}
                                    helper='Payable to freeholder'
                                />
                                <DealMetric
                                    label='Total Cost'
                                    value={formatCurrency(metrics.totalCost)}
                                    helper='Including professional fees'
                                />
                                <DealMetric
                                    label='Value Uplift'
                                    value={formatCurrency(metrics.valueUplift)}
                                    helper='Increase in flat value'
                                />
                                <DealMetric
                                    label='Net Gain'
                                    value={formatCurrency(metrics.netGain)}
                                    helper='Profit from extending'
                                />
                            </BentoGrid>

                            {/* Summary Cards */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border-2 border-purple-200 bg-purple-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Scale className='size-8 text-purple-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Premium Breakdown</p>
                                                <p className='text-xl font-bold text-purple-700'>
                                                    {formatCurrency(metrics.premium)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='mt-2 text-xs text-slate-500 space-y-1'>
                                            <div className='flex justify-between'>
                                                <span>Capitalised ground rent:</span>
                                                <span>{formatCurrency(metrics.capitalisedGroundRent)}</span>
                                            </div>
                                            {metrics.marriageValue > 0 && (
                                                <div className='flex justify-between text-amber-600'>
                                                    <span>Marriage value (50%):</span>
                                                    <span>{formatCurrency(metrics.marriageValue)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`border-2 ${metrics.roi > 100 ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <TrendingDown className={`size-8 ${metrics.roi > 100 ? 'text-emerald-600' : 'text-blue-600'}`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>Return on Investment</p>
                                                <p className={`text-xl font-bold ${metrics.roi > 100 ? 'text-emerald-700' : 'text-blue-700'}`}>
                                                    {metrics.roi.toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            Value gained per pound spent on extension
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cost Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <FileText className='size-4' />
                                    Full Cost Breakdown
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Premium to freeholder</span>
                                        <span className='font-medium'>{formatCurrency(metrics.premium)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Your surveyor fees</span>
                                        <span className='font-medium'>{formatCurrency(metrics.surveyorFees)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Your legal fees</span>
                                        <span className='font-medium'>{formatCurrency(metrics.legalFees)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Freeholder's costs (you pay)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.freeholderCosts)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Total estimated cost</span>
                                        <span className='text-purple-600'>{formatCurrency(metrics.totalCost)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Value Comparison */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Value Comparison</h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Current lease value ({metrics.currentRelativity}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.currentLeaseValue)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Extended lease value ({metrics.extendedRelativity}%)</span>
                                        <span className='font-medium text-emerald-600'>{formatCurrency(metrics.extendedLeaseValue)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2'>
                                        <span className='text-slate-900 font-medium'>Value uplift</span>
                                        <span className='font-bold text-emerald-600'>+{formatCurrency(metrics.valueUplift)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Important Note */}
                            <div className='mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-amber-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-amber-900 text-sm'>Important Notes</p>
                                        <ul className='text-xs text-amber-700 mt-1 space-y-1'>
                                            <li>• This is an estimate only - get a professional valuation</li>
                                            <li>• Leasehold reform may change how premiums are calculated</li>
                                            <li>• You must have owned the flat for 2+ years to qualify</li>
                                            <li>• The freeholder may challenge with a higher valuation</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='lease extension'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Lease Analysis</span>
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

                                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-2'>Recommendations</h4>
                                            <ul className='space-y-1'>
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <li key={i} className='text-sm text-slate-600 flex items-start gap-2'>
                                                        <ArrowRight className='size-4 text-purple-500 shrink-0 mt-0.5' />
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
        </CalculatorPageLayout>
    );
};

export default LeaseExtensionCalculatorPage;
