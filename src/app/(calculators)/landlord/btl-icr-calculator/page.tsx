"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency } from '@/lib/calculators/format';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Percent,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Sparkles,
    TrendingUp,
    Building2,
    Briefcase,
    Scale,
} from 'lucide-react';

type FormState = {
    propertyValue: string;
    loanAmount: string;
    monthlyRent: string;
    actualRate: string;
    stressTestRate: string;
    ownershipType: 'personal-basic' | 'personal-higher' | 'limited-company';
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

// Lender ICR requirements
const LENDER_REQUIREMENTS = [
    { name: 'Basic Rate Taxpayer', icr: 125, stressRate: 5.5, type: 'personal-basic' },
    { name: 'Higher Rate Taxpayer', icr: 145, stressRate: 5.5, type: 'personal-higher' },
    { name: 'Limited Company', icr: 125, stressRate: 5.5, type: 'limited-company' },
    { name: 'Portfolio Landlord (4+)', icr: 145, stressRate: 5.5, type: 'portfolio' },
];

const initialForm: FormState = {
    propertyValue: '300,000',
    loanAmount: '225,000',
    monthlyRent: '1,500',
    actualRate: '5.5',
    stressTestRate: '5.5',
    ownershipType: 'personal-higher',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveMetrics = (form: FormState) => {
    const propertyValue = parseNumber(form.propertyValue);
    const loanAmount = parseNumber(form.loanAmount);
    const monthlyRent = parseNumber(form.monthlyRent);
    const actualRate = parseNumber(form.actualRate) / 100;
    const stressTestRate = parseNumber(form.stressTestRate) / 100;

    // LTV
    const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

    // Annual rent
    const annualRent = monthlyRent * 12;

    // Interest at actual rate
    const annualInterestActual = loanAmount * actualRate;
    const monthlyInterestActual = annualInterestActual / 12;

    // Interest at stress test rate
    const annualInterestStress = loanAmount * stressTestRate;
    const monthlyInterestStress = annualInterestStress / 12;

    // ICR calculations
    // ICR = (Annual Rent / Annual Interest) * 100
    const icrAtActualRate = annualInterestActual > 0 ? (annualRent / annualInterestActual) * 100 : 0;
    const icrAtStressRate = annualInterestStress > 0 ? (annualRent / annualInterestStress) * 100 : 0;

    // Required ICR based on ownership type
    let requiredIcr = 145;
    if (form.ownershipType === 'personal-basic' || form.ownershipType === 'limited-company') {
        requiredIcr = 125;
    }

    // Pass/fail status
    const passesStressTest = icrAtStressRate >= requiredIcr;

    // Max loan at required ICR
    // ICR = (Rent / Interest) * 100
    // Interest = Rent * 100 / ICR
    // Loan = Interest / Rate
    const maxInterestAllowed = (annualRent * 100) / requiredIcr;
    const maxLoanAtIcr = stressTestRate > 0 ? maxInterestAllowed / stressTestRate : 0;

    // Shortfall or headroom
    const loanHeadroom = maxLoanAtIcr - loanAmount;

    // Required rent to pass at current loan
    const requiredRentMonthly = stressTestRate > 0
        ? ((loanAmount * stressTestRate * requiredIcr) / 100) / 12
        : 0;

    // Rent shortfall or surplus
    const rentHeadroom = monthlyRent - requiredRentMonthly;

    // Rental coverage ratio (how many times rent covers interest)
    const rentalCoverageRatio = monthlyInterestStress > 0 ? monthlyRent / monthlyInterestStress : 0;

    // Margin of safety (% above required ICR)
    const marginOfSafety = requiredIcr > 0 ? ((icrAtStressRate - requiredIcr) / requiredIcr) * 100 : 0;

    return {
        propertyValue,
        loanAmount,
        ltv,
        monthlyRent,
        annualRent,
        annualInterestActual,
        monthlyInterestActual,
        annualInterestStress,
        monthlyInterestStress,
        icrAtActualRate,
        icrAtStressRate,
        requiredIcr,
        passesStressTest,
        maxLoanAtIcr,
        loanHeadroom,
        requiredRentMonthly,
        rentHeadroom,
        rentalCoverageRatio,
        marginOfSafety,
        ownershipType: form.ownershipType,
    };
};

const BtlIcrCalculatorPage = () => {
    const [form, setForm] = useState<FormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveMetrics(form), [form]);

    const handleInputChange = (name: keyof FormState, value: string) => {
        if (['propertyValue', 'loanAmount', 'monthlyRent'].includes(name)) {
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
                    systemPrompt: `You are an expert UK BTL mortgage advisor.
You provide accurate analysis of Interest Coverage Ratio (ICR) for BTL mortgages.
Focus on lender requirements, stress testing, and affordability.`,
                    userPrompt: `Analyse this BTL ICR calculation in ${form.postcode}:

Property Value: ${formatCurrency(metrics.propertyValue)}
Loan Amount: ${formatCurrency(metrics.loanAmount)}
LTV: ${metrics.ltv.toFixed(1)}%
Monthly Rent: ${formatCurrency(metrics.monthlyRent)}

Stress Test Rate: ${form.stressTestRate}%
Ownership: ${form.ownershipType === 'limited-company' ? 'Limited Company' :
              form.ownershipType === 'personal-basic' ? 'Personal (Basic Rate)' : 'Personal (Higher Rate)'}

ICR at Stress Rate: ${metrics.icrAtStressRate.toFixed(0)}%
Required ICR: ${metrics.requiredIcr}%
Status: ${metrics.passesStressTest ? 'PASSES' : 'FAILS'}

Max Loan at ${metrics.requiredIcr}% ICR: ${formatCurrency(metrics.maxLoanAtIcr)}
Loan Headroom: ${formatCurrency(metrics.loanHeadroom)}
Required Rent to Pass: ${formatCurrency(metrics.requiredRentMonthly)}/month
Rent Headroom: ${formatCurrency(metrics.rentHeadroom)}/month

Please assess:
1. Is the rental achievable for ${form.postcode}?
2. Lender appetite at this ICR level
3. Options if it fails the stress test
4. Risk factors

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "current BTL lending market context"
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

    return (
        <CalculatorPageLayout
            title="BTL ICR Calculator"
            description="Calculate Interest Coverage Ratio for Buy-to-Let mortgage stress testing. Check if your rental income meets lender requirements."
            category="Landlord"
            categorySlug="landlord"
            categoryColor="#10B981"
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property & loan details' description='Enter your BTL figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Property value'
                                        name='propertyValue'
                                        value={form.propertyValue}
                                        unit='£'
                                        unitPosition='prefix'
                                        onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Loan amount'
                                        name='loanAmount'
                                        value={form.loanAmount}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper={`LTV: ${metrics.ltv.toFixed(0)}%`}
                                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='Monthly rent'
                                    name='monthlyRent'
                                    value={form.monthlyRent}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Gross rent before costs'
                                    onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                                />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Actual interest rate'
                                        name='actualRate'
                                        type='number'
                                        step='0.01'
                                        value={form.actualRate}
                                        unit='%'
                                        helper='Your quoted rate'
                                        onChange={(e) => handleInputChange('actualRate', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Stress test rate'
                                        name='stressTestRate'
                                        type='number'
                                        step='0.01'
                                        value={form.stressTestRate}
                                        unit='%'
                                        helper='Typically 5.5%'
                                        onChange={(e) => handleInputChange('stressTestRate', e.target.value)}
                                    />
                                </div>

                                {/* Ownership Type */}
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Ownership Structure</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {[
                                            { type: 'personal-basic' as const, label: 'Basic Rate', icr: '125%' },
                                            { type: 'personal-higher' as const, label: 'Higher Rate', icr: '145%' },
                                            { type: 'limited-company' as const, label: 'Ltd Company', icr: '125%' },
                                        ].map((option) => (
                                            <button
                                                key={option.type}
                                                type='button'
                                                onClick={() => setForm((prev) => ({ ...prev, ownershipType: option.type }))}
                                                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.ownershipType === option.type
                                                        ? 'bg-[var(--pc-blue)] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <div>{option.label}</div>
                                                <div className='text-xs opacity-75'>{option.icr} ICR</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI rent validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                {/* Info Box */}
                                <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                    <div className='flex items-start gap-3'>
                                        <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                        <div className='space-y-2'>
                                            <p className='font-medium text-blue-900 text-sm'>ICR Stress Test Explained</p>
                                            <p className='text-xs text-blue-700'>
                                                Lenders calculate ICR as: <strong>(Annual Rent ÷ Annual Interest) × 100</strong>.
                                                Most require 125-145% at a 5.5% stress test rate. This ensures rent covers interest
                                                if rates rise.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate ICR
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
                            calculatorType="BTL ICR Calculator"
                            calculatorSlug="btl-icr-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Pass/Fail Status */}
                        <Card className={`border-2 ${
                            metrics.passesStressTest
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-red-200 bg-red-50'
                        }`}>
                            <CardContent className='p-6'>
                                <div className='flex items-center gap-4'>
                                    {metrics.passesStressTest ? (
                                        <CheckCircle2 className='size-12 text-emerald-600' />
                                    ) : (
                                        <XCircle className='size-12 text-red-600' />
                                    )}
                                    <div>
                                        <h3 className={`text-2xl font-bold ${
                                            metrics.passesStressTest ? 'text-emerald-900' : 'text-red-900'
                                        }`}>
                                            {metrics.passesStressTest ? 'PASSES ICR Test' : 'FAILS ICR Test'}
                                        </h3>
                                        <p className={`text-sm ${
                                            metrics.passesStressTest ? 'text-emerald-700' : 'text-red-700'
                                        }`}>
                                            ICR: {metrics.icrAtStressRate.toFixed(0)}% vs Required: {metrics.requiredIcr}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='ICR analysis' description='Stress test results'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='ICR at Stress Rate'
                                    value={`${metrics.icrAtStressRate.toFixed(0)}%`}
                                    helper={`Needed: ${metrics.requiredIcr}%`}
                                />
                                <DealMetric
                                    label='ICR at Actual Rate'
                                    value={`${metrics.icrAtActualRate.toFixed(0)}%`}
                                    helper='Current rate'
                                />
                                <DealMetric
                                    label='Rental Coverage'
                                    value={`${metrics.rentalCoverageRatio.toFixed(2)}x`}
                                    helper='Rent ÷ Interest'
                                />
                                <DealMetric
                                    label='Margin of Safety'
                                    value={`${metrics.marginOfSafety >= 0 ? '+' : ''}${metrics.marginOfSafety.toFixed(0)}%`}
                                    helper='Above/below required'
                                />
                            </BentoGrid>

                            {/* What You Need to Pass */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Scale className='size-4' />
                                    {metrics.passesStressTest ? 'Your Headroom' : 'What You Need'}
                                </h4>
                                <div className='space-y-3'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-slate-600'>Max loan at {metrics.requiredIcr}% ICR</span>
                                        <span className='font-medium'>{formatCurrency(metrics.maxLoanAtIcr)}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-slate-600'>
                                            {metrics.loanHeadroom >= 0 ? 'Loan headroom' : 'Reduce loan by'}
                                        </span>
                                        <span className={`font-medium ${
                                            metrics.loanHeadroom >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {metrics.loanHeadroom >= 0 ? '+' : ''}{formatCurrency(metrics.loanHeadroom)}
                                        </span>
                                    </div>
                                    <div className='border-t pt-3'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-slate-600'>Rent needed to pass</span>
                                            <span className='font-medium'>{formatCurrency(metrics.requiredRentMonthly)}/mo</span>
                                        </div>
                                        <div className='flex justify-between items-center mt-2'>
                                            <span className='text-sm text-slate-600'>
                                                {metrics.rentHeadroom >= 0 ? 'Rent headroom' : 'Increase rent by'}
                                            </span>
                                            <span className={`font-medium ${
                                                metrics.rentHeadroom >= 0 ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {metrics.rentHeadroom >= 0 ? '+' : ''}{formatCurrency(metrics.rentHeadroom)}/mo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interest Summary */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-4'>
                                        <p className='text-xs text-slate-500 mb-1'>Monthly Interest (Actual)</p>
                                        <p className='text-xl font-bold text-slate-900'>
                                            {formatCurrency(metrics.monthlyInterestActual)}
                                        </p>
                                        <p className='text-xs text-slate-500'>at {form.actualRate}%</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-4'>
                                        <p className='text-xs text-slate-500 mb-1'>Monthly Interest (Stress)</p>
                                        <p className='text-xl font-bold text-slate-900'>
                                            {formatCurrency(metrics.monthlyInterestStress)}
                                        </p>
                                        <p className='text-xs text-slate-500'>at {form.stressTestRate}%</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </BentoCard>

                        {/* Lender Requirements Table */}
                        <BentoCard variant='glass' title='Lender ICR requirements' description='Common stress test criteria'>
                            <div className='overflow-hidden rounded-xl border border-slate-200'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='bg-slate-50'>
                                            <th className='px-3 py-2 text-left font-medium text-slate-600'>Borrower Type</th>
                                            <th className='px-3 py-2 text-center font-medium text-slate-600'>ICR</th>
                                            <th className='px-3 py-2 text-center font-medium text-slate-600'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {LENDER_REQUIREMENTS.map((req) => {
                                            const passes = metrics.icrAtStressRate >= req.icr;
                                            return (
                                                <tr key={req.type} className={req.type === form.ownershipType ? 'bg-emerald-50' : ''}>
                                                    <td className='px-3 py-2'>
                                                        <div className='flex items-center gap-2'>
                                                            {req.type === 'limited-company' ? (
                                                                <Briefcase className='size-4 text-slate-400' />
                                                            ) : (
                                                                <Building2 className='size-4 text-slate-400' />
                                                            )}
                                                            {req.name}
                                                        </div>
                                                    </td>
                                                    <td className='px-3 py-2 text-center font-medium'>{req.icr}%</td>
                                                    <td className='px-3 py-2 text-center'>
                                                        {passes ? (
                                                            <Badge className='bg-emerald-100 text-emerald-700 border-0'>Pass</Badge>
                                                        ) : (
                                                            <Badge className='bg-red-100 text-red-700 border-0'>Fail</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='BTL ICR assessment'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI ICR Analysis</span>
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
                                                        <ArrowRight className='size-4 text-emerald-500 shrink-0 mt-0.5' />
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

                <CalculatorSEO
                    calculatorName="BTL ICR Calculator"
                    calculatorSlug="btl-icr-calculator"
                    description="The BTL ICR Calculator helps UK landlords calculate Interest Coverage Ratio for buy-to-let mortgage applications. ICR is the key metric lenders use to assess BTL affordability, requiring your rental income to be 125-145% of mortgage interest at stress test rates. Our calculator shows whether you meet lender requirements and how much you can borrow based on rental income."
                    howItWorks={`Interest Coverage Ratio (ICR) is calculated as: (Annual Rent ÷ Annual Interest) × 100

Most UK BTL lenders assess ICR using a stress test rate (typically 5.5%) rather than your actual mortgage rate. This ensures you can still afford payments if rates rise. The required ICR varies by borrower:

- Basic rate taxpayers: 125% ICR
- Higher/additional rate taxpayers: 145% ICR
- Limited companies: 125% ICR
- Portfolio landlords (4+ properties): Usually 145% ICR

If your rent is £1,500/month and the stressed annual interest is £15,000, your ICR would be (£18,000 ÷ £15,000) × 100 = 120%, which would fail the 125% requirement.`}
                    whenToUse="Use this calculator before applying for BTL mortgages, when comparing properties to assess which you can finance, or when calculating maximum borrowing. It's essential for understanding if lenders will approve your application based on rental income stress testing."
                    keyFeatures={[
                        "Calculate ICR at actual and stress test rates",
                        "See maximum loan amount based on rental income",
                        "Compare personal vs limited company ICR requirements",
                        "Identify rental income needed to pass stress tests",
                    ]}
                    faqs={[
                        {
                            question: "What ICR do I need to pass BTL lending criteria?",
                            answer: "Most UK lenders require 125% ICR for basic rate taxpayers and limited companies, or 145% for higher/additional rate taxpayers. Portfolio landlords typically need 145% regardless. The ICR must be met at the lender's stress test rate (usually 5.5%), not your actual mortgage rate."
                        },
                        {
                            question: "Why do higher rate taxpayers need 145% ICR?",
                            answer: "Section 24 restricts mortgage interest tax relief for personal landlords to 20%, meaning higher rate taxpayers lose more income to tax. Lenders compensate by requiring higher ICR (145% vs 125%) to ensure affordability after tax. Limited companies avoid Section 24, so they only need 125%."
                        },
                        {
                            question: "How is the stress test rate applied?",
                            answer: "Even if your actual mortgage rate is 4.5%, lenders assess ICR at around 5.5% (varies by lender). This stress test ensures you can afford payments if rates rise. Your rent must cover 125-145% of the interest at this stressed rate, not your actual rate."
                        },
                        {
                            question: "Can I use a limited company to get better ICR terms?",
                            answer: "Yes. Limited companies only need 125% ICR vs 145% for higher rate personal landlords. However, BTL mortgages for companies often have higher rates, lower LTV, and you'll face corporation tax on profits. There are also costs to set up and run a company. Seek professional advice before switching."
                        },
                        {
                            question: "What if I'm just short of the ICR requirement?",
                            answer: "Options include: reducing your loan amount, increasing your deposit, finding a property with higher rent, using a limited company structure (if personal higher rate), or seeking specialist lenders with more flexible criteria. Even a small deposit increase can significantly improve ICR."
                        },
                    ]}
                    relatedTerms={[
                        "BTL ICR calculator",
                        "Interest Coverage Ratio UK",
                        "BTL stress test calculator",
                        "Buy-to-let affordability",
                        "125% ICR requirement",
                        "145% ICR higher rate",
                        "BTL mortgage calculator",
                        "Rental income stress test",
                        "Limited company BTL",
                        "Section 24 ICR impact",
                    ]}
                    categoryColor="#10B981"
                />
        </CalculatorPageLayout>
    );
};

export default BtlIcrCalculatorPage;
