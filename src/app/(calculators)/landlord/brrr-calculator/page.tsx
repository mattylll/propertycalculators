"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    RefreshCw,
    TrendingUp,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Home,
    Banknote,
} from 'lucide-react';

type BrrrFormState = {
    purchasePrice: string;
    refurbCost: string;
    afterRepairValue: string;
    monthlyRent: string;
    refinanceLtv: string;
    refinanceRate: string;
    bridgingRate: string;
    bridgingTerm: string;
    stampDuty: string;
    legalFees: string;
    surveyFees: string;
    managementFee: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: BrrrFormState = {
    purchasePrice: '150,000',
    refurbCost: '30,000',
    afterRepairValue: '220,000',
    monthlyRent: '950',
    refinanceLtv: '75',
    refinanceRate: '5.5',
    bridgingRate: '0.85',
    bridgingTerm: '6',
    stampDuty: '5,000',
    legalFees: '2,500',
    surveyFees: '500',
    managementFee: '10',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveBrrrMetrics = (form: BrrrFormState) => {
    const purchasePrice = parseNumber(form.purchasePrice);
    const refurbCost = parseNumber(form.refurbCost);
    const arv = parseNumber(form.afterRepairValue);
    const monthlyRent = parseNumber(form.monthlyRent);
    const refinanceLtv = parseNumber(form.refinanceLtv) / 100;
    const refinanceRate = parseNumber(form.refinanceRate) / 100;
    const bridgingRate = parseNumber(form.bridgingRate) / 100;
    const bridgingTerm = parseNumber(form.bridgingTerm);
    const stampDuty = parseNumber(form.stampDuty);
    const legalFees = parseNumber(form.legalFees);
    const surveyFees = parseNumber(form.surveyFees);
    const managementFee = parseNumber(form.managementFee) / 100;

    // Total investment
    const totalInvestment = purchasePrice + refurbCost + stampDuty + legalFees + surveyFees;

    // Bridging costs
    const bridgingInterest = (purchasePrice + refurbCost) * bridgingRate * bridgingTerm;
    const totalWithBridging = totalInvestment + bridgingInterest;

    // Refinance
    const refinanceAmount = arv * refinanceLtv;
    const monthlyMortgage = (refinanceAmount * refinanceRate) / 12;
    const annualMortgage = monthlyMortgage * 12;

    // Money left in deal
    const moneyLeftIn = totalWithBridging - refinanceAmount;
    const recycledCapital = refinanceAmount - totalWithBridging;

    // Value added
    const valueAdded = arv - purchasePrice;
    const equityGain = arv - refinanceAmount;

    // Rental income
    const annualRent = monthlyRent * 12;
    const effectiveRent = annualRent * (1 - managementFee);

    // Cashflow
    const annualCashflow = effectiveRent - annualMortgage;
    const monthlyCashflow = annualCashflow / 12;

    // Returns
    const grossYield = arv > 0 ? (annualRent / arv) * 100 : 0;
    const cashOnCash = moneyLeftIn > 0 ? (annualCashflow / moneyLeftIn) * 100 : Infinity;
    const returnOnInvestment = totalWithBridging > 0 ? ((valueAdded + annualCashflow) / totalWithBridging) * 100 : 0;

    // DSCR
    const dscr = annualMortgage > 0 ? effectiveRent / annualMortgage : 0;

    return {
        purchasePrice,
        refurbCost,
        arv,
        totalInvestment,
        bridgingInterest,
        totalWithBridging,
        refinanceAmount,
        monthlyMortgage,
        annualMortgage,
        moneyLeftIn,
        recycledCapital,
        valueAdded,
        equityGain,
        monthlyRent,
        annualRent,
        monthlyCashflow,
        annualCashflow,
        grossYield,
        cashOnCash,
        returnOnInvestment,
        dscr,
    };
};

const BrrrCalculatorPage = () => {
    const [form, setForm] = useState<BrrrFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveBrrrMetrics(form), [form]);

    const handleInputChange = (name: keyof BrrrFormState, value: string) => {
        if (['purchasePrice', 'refurbCost', 'afterRepairValue', 'monthlyRent', 'stampDuty', 'legalFees', 'surveyFees'].includes(name)) {
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
                    systemPrompt: `You are an expert UK property investment analyst specializing in BRRR strategies.
You provide accurate, data-driven analysis for Buy-Refurbish-Refinance-Rent deals.
Focus on ARV realism, refurb costs, and refinance viability.`,
                    userPrompt: `Analyse this BRRR deal in ${form.postcode}:

Purchase price: ${formatCurrency(metrics.purchasePrice)}
Refurb cost: ${formatCurrency(metrics.refurbCost)}
After Repair Value (ARV): ${formatCurrency(metrics.arv)}
Value added: ${formatCurrency(metrics.valueAdded)}
Total investment: ${formatCurrency(metrics.totalWithBridging)}
Refinance amount (${form.refinanceLtv}% LTV): ${formatCurrency(metrics.refinanceAmount)}
Money left in deal: ${formatCurrency(metrics.moneyLeftIn)}
Monthly rent: ${formatCurrency(metrics.monthlyRent)}
Monthly cashflow: ${formatCurrency(metrics.monthlyCashflow)}
Cash on cash return: ${metrics.cashOnCash === Infinity ? 'Infinite (no money left in)' : metrics.cashOnCash.toFixed(1) + '%'}
DSCR: ${metrics.dscr.toFixed(2)}

Please assess:
1. Is the ARV realistic for ${form.postcode}?
2. Is the refurb budget realistic?
3. Will this refinance successfully?
4. Key risks with this BRRR strategy

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local market context"
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

    const getRecycleStatus = () => {
        if (metrics.recycledCapital > 0) return { label: 'Full Recycle', color: 'success' as const };
        if (metrics.moneyLeftIn < metrics.totalInvestment * 0.2) return { label: 'Good Recycle', color: 'info' as const };
        return { label: 'Capital Trapped', color: 'warning' as const };
    };

    return (
        <CalculatorPageLayout
            title="BRRR Calculator"
            description="Buy-Refurbish-Refinance-Rent strategy calculator. Model value-add deals and calculate how much capital you can recycle through refinancing."
            category="Landlord"
            categorySlug="landlord"
            categoryColor="#10B981"
            badges={[{ label: 'Value-Add', variant: 'success' }]}
        >
            {/* Main Content */}
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Deal details' description='Enter your BRRR deal figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Purchase price'
                                        name='purchasePrice'
                                        value={form.purchasePrice}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Agreed purchase price'
                                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Refurb cost'
                                        name='refurbCost'
                                        value={form.refurbCost}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Total renovation budget'
                                        onChange={(e) => handleInputChange('refurbCost', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='After Repair Value (ARV)'
                                    name='afterRepairValue'
                                    value={form.afterRepairValue}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Expected value after refurb'
                                    onChange={(e) => handleInputChange('afterRepairValue', e.target.value)}
                                />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Monthly rent'
                                        name='monthlyRent'
                                        value={form.monthlyRent}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Expected rental income'
                                        onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Management fee'
                                        name='managementFee'
                                        type='number'
                                        value={form.managementFee}
                                        unit='%'
                                        helper='Of gross rent'
                                        onChange={(e) => handleInputChange('managementFee', e.target.value)}
                                    />
                                </div>

                                <div className='p-4 rounded-xl bg-green-50 border border-green-200'>
                                    <h4 className='font-medium text-green-900 text-sm mb-3'>Refinance Terms</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Refinance LTV'
                                            name='refinanceLtv'
                                            type='number'
                                            value={form.refinanceLtv}
                                            unit='%'
                                            helper='Typically 75% BTL'
                                            onChange={(e) => handleInputChange('refinanceLtv', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='BTL interest rate'
                                            name='refinanceRate'
                                            type='number'
                                            step='0.1'
                                            value={form.refinanceRate}
                                            unit='%'
                                            helper='Annual rate'
                                            onChange={(e) => handleInputChange('refinanceRate', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-amber-50 border border-amber-200'>
                                    <h4 className='font-medium text-amber-900 text-sm mb-3'>Bridging Finance</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Bridging rate'
                                            name='bridgingRate'
                                            type='number'
                                            step='0.01'
                                            value={form.bridgingRate}
                                            unit='% pm'
                                            helper='Monthly rate'
                                            onChange={(e) => handleInputChange('bridgingRate', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Bridging term'
                                            name='bridgingTerm'
                                            type='number'
                                            value={form.bridgingTerm}
                                            unit='months'
                                            helper='Expected duration'
                                            onChange={(e) => handleInputChange('bridgingTerm', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='grid gap-4 md:grid-cols-3'>
                                    <FloatingField
                                        label='Stamp duty'
                                        name='stampDuty'
                                        value={form.stampDuty}
                                        unit='£'
                                        unitPosition='prefix'
                                        onChange={(e) => handleInputChange('stampDuty', e.target.value)}
                                        compact
                                    />
                                    <FloatingField
                                        label='Legal fees'
                                        name='legalFees'
                                        value={form.legalFees}
                                        unit='£'
                                        unitPosition='prefix'
                                        onChange={(e) => handleInputChange('legalFees', e.target.value)}
                                        compact
                                    />
                                    <FloatingField
                                        label='Survey fees'
                                        name='surveyFees'
                                        value={form.surveyFees}
                                        unit='£'
                                        unitPosition='prefix'
                                        onChange={(e) => handleInputChange('surveyFees', e.target.value)}
                                        compact
                                    />
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate BRRR
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
                            calculatorType="BRRR Calculator"
                            calculatorSlug="brrr-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='BRRR analysis' description='Value-add and refinance metrics'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Value Added'
                                    value={formatCurrency(metrics.valueAdded)}
                                    helper='ARV - Purchase'
                                />
                                <DealMetric
                                    label='Total Investment'
                                    value={formatCurrency(metrics.totalWithBridging)}
                                    helper='Inc. bridging costs'
                                />
                                <DealMetric
                                    label='Refinance Amount'
                                    value={formatCurrency(metrics.refinanceAmount)}
                                    helper={`${form.refinanceLtv}% of ARV`}
                                />
                                <DealMetric
                                    label='Money Left In'
                                    value={formatCurrency(Math.max(0, metrics.moneyLeftIn))}
                                    helper={getRecycleStatus().label}
                                />
                            </BentoGrid>

                            {/* Capital Recycle Summary */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className={`border-2 ${metrics.recycledCapital >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <RefreshCw className={`size-8 ${metrics.recycledCapital >= 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>Capital Recycled</p>
                                                <p className={`text-xl font-bold ${metrics.recycledCapital >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                    {metrics.recycledCapital >= 0 ? formatCurrency(metrics.recycledCapital) : formatCurrency(Math.abs(metrics.recycledCapital)) + ' short'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            {metrics.recycledCapital >= 0
                                                ? 'You get all your capital back plus profit!'
                                                : `You'll have ${formatCurrency(metrics.moneyLeftIn)} trapped in the deal`}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className={`border-2 ${metrics.cashOnCash === Infinity || metrics.cashOnCash > 20 ? 'border-emerald-200 bg-emerald-50' : metrics.cashOnCash > 10 ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <TrendingUp className={`size-8 ${metrics.cashOnCash === Infinity || metrics.cashOnCash > 20 ? 'text-emerald-600' : metrics.cashOnCash > 10 ? 'text-blue-600' : 'text-amber-600'}`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>Cash on Cash Return</p>
                                                <p className={`text-xl font-bold ${metrics.cashOnCash === Infinity || metrics.cashOnCash > 20 ? 'text-emerald-700' : metrics.cashOnCash > 10 ? 'text-blue-700' : 'text-amber-700'}`}>
                                                    {metrics.cashOnCash === Infinity ? '∞' : `${metrics.cashOnCash.toFixed(1)}%`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            {metrics.cashOnCash === Infinity ? 'Infinite return - no money left in!' : 'Annual return on capital left in'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cashflow Summary */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Banknote className='size-4' />
                                    Rental Cashflow (Post-Refinance)
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Monthly rent</span>
                                        <span className='font-medium'>{formatCurrency(metrics.monthlyRent)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Monthly mortgage (interest only)</span>
                                        <span className='font-medium text-red-600'>-{formatCurrency(metrics.monthlyMortgage)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2'>
                                        <span className='text-slate-900 font-medium'>Monthly cashflow</span>
                                        <span className={`font-bold ${metrics.monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(metrics.monthlyCashflow)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Deal Stack */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Home className='size-4' />
                                    Deal Stack
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Purchase price</span>
                                        <span className='font-medium'>{formatCurrency(metrics.purchasePrice)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>+ Refurb cost</span>
                                        <span className='font-medium'>{formatCurrency(metrics.refurbCost)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>+ Stamp duty & fees</span>
                                        <span className='font-medium'>{formatCurrency(metrics.totalInvestment - metrics.purchasePrice - metrics.refurbCost)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>+ Bridging interest</span>
                                        <span className='font-medium'>{formatCurrency(metrics.bridgingInterest)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Total investment</span>
                                        <span>{formatCurrency(metrics.totalWithBridging)}</span>
                                    </div>
                                    <div className='flex justify-between text-emerald-600'>
                                        <span>After Repair Value (ARV)</span>
                                        <span className='font-bold'>{formatCurrency(metrics.arv)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Equity in property</span>
                                        <span className='font-medium'>{formatCurrency(metrics.equityGain)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Gross Yield</p>
                                    <p className='text-lg font-bold text-slate-900'>{metrics.grossYield.toFixed(2)}%</p>
                                </div>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>DSCR</p>
                                    <p className={`text-lg font-bold ${metrics.dscr >= 1.25 ? 'text-emerald-600' : metrics.dscr >= 1.0 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {metrics.dscr.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='BRRR deal'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI BRRR Analysis</span>
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
                                                        <ArrowRight className='size-4 text-green-500 shrink-0 mt-0.5' />
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

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="BRRR Calculator"
                    calculatorSlug="brrr-calculator"
                    description="The BRRR Calculator helps UK property investors model Buy-Refurbish-Refinance-Rent strategies. This value-add investment approach allows you to purchase undervalued properties, add value through renovation, refinance to release capital, and generate rental income. Our calculator shows you exactly how much capital you can recycle and your expected returns."
                    howItWorks={`The BRRR strategy works in four stages:

1. Buy - Purchase a property below market value, typically one that needs work
2. Refurbish - Renovate the property to increase its value (ARV - After Repair Value)
3. Refinance - Take out a buy-to-let mortgage against the new higher value
4. Rent - Let the property to generate monthly cashflow

The calculator analyses your total investment (purchase + refurb + costs + bridging interest) against your refinance amount (typically 75% of ARV) to show how much capital you recover. The goal is to recycle all or most of your investment while retaining equity and cashflow.`}
                    whenToUse="Use this calculator when evaluating value-add property opportunities. It's ideal for properties requiring renovation where you can add significant value. The BRRR strategy works best when you can purchase at least 20-25% below the ARV to cover refurb costs and still refinance out your capital."
                    keyFeatures={[
                        "Calculate capital recycled through refinancing",
                        "Model bridging finance costs during refurb period",
                        "Analyse post-refinance cashflow and yields",
                        "Assess DSCR for lender requirements",
                    ]}
                    faqs={[
                        {
                            question: "What is a good BRRR deal?",
                            answer: "A good BRRR deal typically allows you to recycle 75-100% of your capital through refinancing while maintaining positive cashflow. Ideally, you want a purchase price that's 20-30% below the After Repair Value (ARV), realistic refurb costs, and rent that covers the mortgage with comfortable margin (DSCR of 1.25+)."
                        },
                        {
                            question: "How much deposit do I need for a BRRR?",
                            answer: "Initially, you'll need funds for the full purchase (often via bridging finance at 70-75% LTV), refurb costs, and all associated fees. After refinancing, most BTL lenders offer 75% LTV, meaning you'll have 25% equity remaining in the property. The goal is for the refinance to return your initial cash investment."
                        },
                        {
                            question: "What is a typical bridging rate for BRRR?",
                            answer: "Bridging rates in the UK typically range from 0.55% to 1.5% per month, depending on the lender, loan-to-value, and your experience. Most BRRR investors budget around 0.75-0.95% per month. Remember to factor in arrangement fees (typically 1-2%) and exit fees."
                        },
                        {
                            question: "How long does a typical BRRR project take?",
                            answer: "A typical BRRR project takes 3-9 months from purchase to refinance. Light refurbishments might complete in 3-4 months, while more extensive renovations can take 6-9 months. It's important to factor in realistic timescales when calculating bridging costs."
                        },
                        {
                            question: "What ARV should I aim for compared to purchase price?",
                            answer: "Aim for an ARV that's at least 125-135% of your total investment (purchase + refurb + costs). This typically means buying at 70-75% of the end value to ensure you can refinance out most or all of your capital at 75% LTV."
                        },
                    ]}
                    relatedTerms={[
                        "Buy Refurbish Refinance Rent",
                        "Value-add property investment",
                        "Property flipping UK",
                        "Bridging finance",
                        "BTL refinance",
                        "After Repair Value",
                        "Capital recycling",
                        "Property renovation",
                        "Cash on cash return",
                        "Property investment strategy",
                    ]}
                    categoryColor="#10B981"
                />
        </CalculatorPageLayout>
    );
};

export default BrrrCalculatorPage;
