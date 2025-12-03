"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Zap,
    PoundSterling,
    Percent,
    Calendar,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Clock,
    Banknote,
} from 'lucide-react';

type BridgingFormState = {
    loanAmount: string;
    propertyValue: string;
    monthlyRate: string;
    termMonths: string;
    arrangementFee: string;
    exitFee: string;
    valuationFee: string;
    legalFees: string;
    interestType: 'retained' | 'rolled' | 'serviced';
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: BridgingFormState = {
    loanAmount: '200,000',
    propertyValue: '300,000',
    monthlyRate: '0.85',
    termMonths: '12',
    arrangementFee: '2',
    exitFee: '1',
    valuationFee: '500',
    legalFees: '2,000',
    interestType: 'retained',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// Indicative bridging rates by LTV
const BRIDGING_RATE_BANDS = [
    { maxLtv: 50, minRate: 0.55, maxRate: 0.75, label: '50% LTV or less' },
    { maxLtv: 60, minRate: 0.65, maxRate: 0.85, label: '51-60% LTV' },
    { maxLtv: 65, minRate: 0.70, maxRate: 0.90, label: '61-65% LTV' },
    { maxLtv: 70, minRate: 0.75, maxRate: 0.95, label: '66-70% LTV' },
    { maxLtv: 75, minRate: 0.85, maxRate: 1.10, label: '71-75% LTV' },
];

const getIndicativeBridgingRate = (ltv: number) => {
    const band = BRIDGING_RATE_BANDS.find(b => ltv <= b.maxLtv);
    if (!band) {
        return { minRate: 0.95, maxRate: 1.25, label: '75%+ LTV' };
    }
    return band;
};

const deriveBridgingMetrics = (form: BridgingFormState) => {
    const loanAmount = parseNumber(form.loanAmount);
    const propertyValue = parseNumber(form.propertyValue);
    const monthlyRate = parseNumber(form.monthlyRate) / 100;
    const termMonths = parseNumber(form.termMonths);
    const arrangementFeePercent = parseNumber(form.arrangementFee) / 100;
    const exitFeePercent = parseNumber(form.exitFee) / 100;
    const valuationFee = parseNumber(form.valuationFee);
    const legalFees = parseNumber(form.legalFees);

    // LTV
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

    // Monthly interest
    const monthlyInterest = loanAmount * monthlyRate;
    const totalInterest = monthlyInterest * termMonths;

    // Fees
    const arrangementFee = loanAmount * arrangementFeePercent;
    const exitFee = loanAmount * exitFeePercent;
    const totalFees = arrangementFee + exitFee + valuationFee + legalFees;

    // Total cost
    const totalCost = totalInterest + totalFees;

    // Net amount received (for retained interest)
    let netAdvance = loanAmount;
    if (form.interestType === 'retained') {
        netAdvance = loanAmount - totalInterest - arrangementFee;
    } else if (form.interestType === 'rolled') {
        netAdvance = loanAmount - arrangementFee;
    } else {
        netAdvance = loanAmount - arrangementFee;
    }

    // Gross redemption (what you pay back)
    let grossRedemption = loanAmount;
    if (form.interestType === 'rolled') {
        grossRedemption = loanAmount + totalInterest + exitFee;
    } else if (form.interestType === 'retained') {
        grossRedemption = loanAmount + exitFee;
    } else {
        grossRedemption = loanAmount + exitFee;
    }

    // Effective annual rate (simple approximation)
    const effectiveAnnualRate = propertyValue > 0 ? ((totalCost / loanAmount) / (termMonths / 12)) * 100 : 0;

    // Daily rate
    const dailyRate = monthlyRate / 30;

    return {
        loanAmount,
        propertyValue,
        ltv,
        monthlyInterest,
        totalInterest,
        arrangementFee,
        exitFee,
        valuationFee,
        legalFees,
        totalFees,
        totalCost,
        netAdvance,
        grossRedemption,
        effectiveAnnualRate,
        dailyRate,
        termMonths,
    };
};

const BridgingLoanCalculatorPage = () => {
    const [form, setForm] = useState<BridgingFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveBridgingMetrics(form), [form]);
    const indicativeRate = useMemo(() => getIndicativeBridgingRate(metrics.ltv), [metrics.ltv]);

    const handleInputChange = (name: keyof BridgingFormState, value: string) => {
        if (['loanAmount', 'propertyValue', 'valuationFee', 'legalFees'].includes(name)) {
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
                    systemPrompt: `You are an expert UK bridging finance advisor.
You provide accurate, data-driven analysis for bridging loan decisions.
Focus on exit strategy viability and market conditions.`,
                    userPrompt: `Analyse this bridging loan in ${form.postcode}:

Loan amount: ${formatCurrency(metrics.loanAmount)}
Property value: ${formatCurrency(metrics.propertyValue)}
LTV: ${metrics.ltv.toFixed(1)}%
Monthly rate: ${form.monthlyRate}%
Term: ${form.termMonths} months
Interest type: ${form.interestType}
Total cost: ${formatCurrency(metrics.totalCost)}
Gross redemption: ${formatCurrency(metrics.grossRedemption)}

Please assess:
1. Is the LTV and rate competitive for current market?
2. Key risks with this bridging strategy
3. Exit strategy considerations

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "current bridging market context"
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

    const getLtvStatus = () => {
        if (metrics.ltv <= 60) return { label: 'Conservative', color: 'success' as const };
        if (metrics.ltv <= 70) return { label: 'Standard', color: 'info' as const };
        if (metrics.ltv <= 75) return { label: 'High', color: 'warning' as const };
        return { label: 'Very High', color: 'danger' as const };
    };

    return (
        <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                {/* Header */}
                <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='success' label='Bridging Calculator' />
                        <StatusPill tone='neutral' label='Bridging Finance' />
                    </div>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                            Bridging Loan Calculator
                        </h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Calculate bridging loan costs including interest, fees, and total repayment.
                            Compare retained vs rolled interest options.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Loan details' description='Enter your bridging requirements'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Loan amount'
                                        name='loanAmount'
                                        value={form.loanAmount}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Amount you need to borrow'
                                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Property value'
                                        name='propertyValue'
                                        value={form.propertyValue}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Current/purchase value'
                                        onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Monthly rate'
                                        name='monthlyRate'
                                        type='number'
                                        step='0.01'
                                        value={form.monthlyRate}
                                        unit='%'
                                        helper={`Indicative: ${indicativeRate.minRate.toFixed(2)}-${indicativeRate.maxRate.toFixed(2)}% at ${metrics.ltv.toFixed(0)}% LTV`}
                                        onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Term'
                                        name='termMonths'
                                        type='number'
                                        value={form.termMonths}
                                        unit='months'
                                        helper='Typically 3-24 months'
                                        onChange={(e) => handleInputChange('termMonths', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Arrangement fee'
                                        name='arrangementFee'
                                        type='number'
                                        step='0.1'
                                        value={form.arrangementFee}
                                        unit='%'
                                        helper='Typically 1-2%'
                                        onChange={(e) => handleInputChange('arrangementFee', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Exit fee'
                                        name='exitFee'
                                        type='number'
                                        step='0.1'
                                        value={form.exitFee}
                                        unit='%'
                                        helper='Typically 0-1%'
                                        onChange={(e) => handleInputChange('exitFee', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Valuation fee'
                                        name='valuationFee'
                                        value={form.valuationFee}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Lender valuation cost'
                                        onChange={(e) => handleInputChange('valuationFee', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Legal fees'
                                        name='legalFees'
                                        value={form.legalFees}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Your + lender legal costs'
                                        onChange={(e) => handleInputChange('legalFees', e.target.value)}
                                    />
                                </div>

                                {/* Interest Type Selector */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Interest Type</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {(['retained', 'rolled', 'serviced'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type='button'
                                                onClick={() => handleInputChange('interestType', type)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.interestType === type
                                                        ? 'bg-[var(--pc-blue)] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <p className='text-xs text-gray-500'>
                                        {form.interestType === 'retained' && 'Interest deducted upfront from loan advance'}
                                        {form.interestType === 'rolled' && 'Interest added to loan balance, paid on exit'}
                                        {form.interestType === 'serviced' && 'Interest paid monthly during the term'}
                                    </p>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI market validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                {/* Rate Guidance */}
                                <div className='p-4 rounded-xl bg-red-50 border border-red-200'>
                                    <div className='flex items-start gap-3'>
                                        <Info className='size-5 text-red-600 shrink-0 mt-0.5' />
                                        <div className='space-y-2'>
                                            <p className='font-medium text-red-900 text-sm'>Indicative Bridging Rates (Dec 2024)</p>
                                            <p className='text-xs text-red-700'>
                                                Your LTV: <span className='font-semibold'>{metrics.ltv.toFixed(0)}%</span> —
                                                Typical rates: <span className='font-semibold'>{indicativeRate.minRate.toFixed(2)}-{indicativeRate.maxRate.toFixed(2)}% pm</span>
                                            </p>
                                            <details className='text-xs'>
                                                <summary className='cursor-pointer text-red-600 hover:text-red-800'>View all rate bands</summary>
                                                <div className='mt-2 space-y-1'>
                                                    {BRIDGING_RATE_BANDS.map((band) => (
                                                        <div
                                                            key={band.maxLtv}
                                                            className={`flex justify-between py-1 px-2 rounded ${metrics.ltv <= band.maxLtv && (BRIDGING_RATE_BANDS.findIndex(b => b.maxLtv === band.maxLtv) === 0 || metrics.ltv > BRIDGING_RATE_BANDS[BRIDGING_RATE_BANDS.findIndex(b => b.maxLtv === band.maxLtv) - 1].maxLtv) ? 'bg-red-100 font-medium' : ''}`}
                                                        >
                                                            <span className='text-red-800'>{band.label}</span>
                                                            <span className='text-red-700'>{band.minRate.toFixed(2)}-{band.maxRate.toFixed(2)}% pm</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                            <p className='text-xs text-red-600 italic'>
                                                Rates vary by lender and deal type. Contact us for personalised quotes.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Costs
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
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Loan costs' description='Total bridging costs breakdown'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='LTV'
                                    value={`${metrics.ltv.toFixed(1)}%`}
                                    helper={getLtvStatus().label}
                                />
                                <DealMetric
                                    label='Monthly Interest'
                                    value={formatCurrency(metrics.monthlyInterest)}
                                    helper='Per month'
                                />
                                <DealMetric
                                    label='Total Interest'
                                    value={formatCurrency(metrics.totalInterest)}
                                    helper={`Over ${metrics.termMonths} months`}
                                />
                                <DealMetric
                                    label='Total Fees'
                                    value={formatCurrency(metrics.totalFees)}
                                    helper='All fees combined'
                                />
                            </BentoGrid>

                            {/* Summary Cards */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border-2 border-red-200 bg-red-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Banknote className='size-8 text-red-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Total Cost of Finance</p>
                                                <p className='text-xl font-bold text-red-700'>
                                                    {formatCurrency(metrics.totalCost)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className='border-2 border-slate-200 bg-slate-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Clock className='size-8 text-slate-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Effective Annual Rate</p>
                                                <p className='text-xl font-bold text-slate-700'>
                                                    {metrics.effectiveAnnualRate.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Finance Summary */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Zap className='size-4' />
                                    Loan Summary ({form.interestType} interest)
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Gross loan</span>
                                        <span className='font-medium'>{formatCurrency(metrics.loanAmount)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Net advance (Day 1)</span>
                                        <span className='font-medium text-emerald-600'>{formatCurrency(metrics.netAdvance)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2'>
                                        <span className='text-slate-600'>Gross redemption</span>
                                        <span className='font-medium text-red-600'>{formatCurrency(metrics.grossRedemption)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Breakdown */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Fee Breakdown</h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Arrangement fee ({form.arrangementFee}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.arrangementFee)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Exit fee ({form.exitFee}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.exitFee)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Valuation</span>
                                        <span className='font-medium'>{formatCurrency(metrics.valuationFee)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Legal fees</span>
                                        <span className='font-medium'>{formatCurrency(metrics.legalFees)}</span>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='bridging loan'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-red-500 to-red-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Bridging Analysis</span>
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
                                                        <ArrowRight className='size-4 text-red-500 shrink-0 mt-0.5' />
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
            </main>
        </div>
    );
};

export default BridgingLoanCalculatorPage;
