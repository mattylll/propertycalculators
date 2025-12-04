"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency, formatCurrencyCompact } from '@/lib/calculators/format';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowRight,
    Home,
    PoundSterling,
    Percent,
    TrendingUp,
    TrendingDown,
    Wallet,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    PieChart,
} from 'lucide-react';

type BtlFormState = {
    purchasePrice: string;
    monthlyRent: string;
    depositPercent: string;
    interestRate: string;
    mortgageTerm: string;
    managementFee: string;
    insuranceCost: string;
    maintenancePercent: string;
    voidPercent: string;
    otherCosts: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
    comparableRents?: Array<{ address: string; rent: number; bedrooms: number }>;
};

const initialForm: BtlFormState = {
    purchasePrice: '250,000',
    monthlyRent: '1,200',
    depositPercent: '25',
    interestRate: '5.5',
    mortgageTerm: '25',
    managementFee: '10',
    insuranceCost: '300',
    maintenancePercent: '5',
    voidPercent: '4',
    otherCosts: '0',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// Indicative BTL mortgage rates by LTV (December 2024)
// These are guidance rates and will vary by lender, credit score, and product type
const BTL_RATE_BANDS = [
    { maxLtv: 50, minRate: 4.29, maxRate: 4.99, label: '50% LTV or less' },
    { maxLtv: 60, minRate: 4.49, maxRate: 5.29, label: '51-60% LTV' },
    { maxLtv: 65, minRate: 4.69, maxRate: 5.49, label: '61-65% LTV' },
    { maxLtv: 70, minRate: 4.89, maxRate: 5.69, label: '66-70% LTV' },
    { maxLtv: 75, minRate: 5.09, maxRate: 5.99, label: '71-75% LTV' },
    { maxLtv: 80, minRate: 5.49, maxRate: 6.49, label: '76-80% LTV' },
    { maxLtv: 85, minRate: 5.99, maxRate: 6.99, label: '81-85% LTV' },
];

const getIndicativeRate = (ltv: number) => {
    const band = BTL_RATE_BANDS.find(b => ltv <= b.maxLtv);
    if (!band) {
        return { minRate: 6.49, maxRate: 7.49, label: '85%+ LTV (limited availability)' };
    }
    return band;
};

const deriveBtlMetrics = (form: BtlFormState) => {
    const purchasePrice = parseNumber(form.purchasePrice);
    const monthlyRent = parseNumber(form.monthlyRent);
    const depositPercent = parseNumber(form.depositPercent) / 100;
    const interestRate = parseNumber(form.interestRate) / 100;
    const managementFee = parseNumber(form.managementFee) / 100;
    const insuranceCost = parseNumber(form.insuranceCost);
    const maintenancePercent = parseNumber(form.maintenancePercent) / 100;
    const voidPercent = parseNumber(form.voidPercent) / 100;
    const otherCosts = parseNumber(form.otherCosts);

    // Core calculations
    const annualRent = monthlyRent * 12;
    const deposit = purchasePrice * depositPercent;
    const mortgageAmount = purchasePrice - deposit;

    // Monthly mortgage payment (interest only)
    const monthlyMortgage = (mortgageAmount * interestRate) / 12;
    const annualMortgage = monthlyMortgage * 12;

    // Operating costs
    const annualManagement = annualRent * managementFee;
    const annualMaintenance = annualRent * maintenancePercent;
    const annualVoidLoss = annualRent * voidPercent;
    const annualOtherCosts = otherCosts * 12;

    const totalOperatingCosts = annualManagement + insuranceCost + annualMaintenance + annualVoidLoss + annualOtherCosts;
    const netOperatingIncome = annualRent - totalOperatingCosts;

    // Yields
    const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
    const netYield = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;

    // Cashflow
    const annualCashflow = netOperatingIncome - annualMortgage;
    const monthlyCashflow = annualCashflow / 12;

    // ROI (Cash on cash return)
    const cashOnCash = deposit > 0 ? (annualCashflow / deposit) * 100 : 0;

    // DSCR (Debt Service Coverage Ratio)
    const dscr = annualMortgage > 0 ? netOperatingIncome / annualMortgage : 0;

    // ICR (Interest Coverage Ratio) at 5.5% stress
    const stressedMortgage = (mortgageAmount * 0.055) / 12 * 12;
    const icr = stressedMortgage > 0 ? annualRent / stressedMortgage : 0;

    return {
        purchasePrice,
        deposit,
        mortgageAmount,
        monthlyRent,
        annualRent,
        monthlyMortgage,
        annualMortgage,
        totalOperatingCosts,
        netOperatingIncome,
        grossYield,
        netYield,
        monthlyCashflow,
        annualCashflow,
        cashOnCash,
        dscr,
        icr,
        // Breakdown
        annualManagement,
        insuranceCost,
        annualMaintenance,
        annualVoidLoss,
    };
};

const BuyToLetCalculatorPage = () => {
    const [form, setForm] = useState<BtlFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveBtlMetrics(form), [form]);

    // Calculate LTV and get indicative rate
    const ltv = 100 - parseNumber(form.depositPercent);
    const indicativeRate = useMemo(() => getIndicativeRate(ltv), [ltv]);

    const handleInputChange = (name: keyof BtlFormState, value: string) => {
        // Handle number formatting for currency fields
        if (['purchasePrice', 'monthlyRent', 'insuranceCost', 'otherCosts'].includes(name)) {
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
                    systemPrompt: `You are an expert UK buy-to-let property analyst with access to rental market data.
You provide accurate, data-driven analysis for BTL investment decisions.
Always cite local market rents and trends where possible.`,
                    userPrompt: `Analyse this buy-to-let investment in ${form.postcode}:

Purchase price: ${formatCurrency(metrics.purchasePrice)}
Monthly rent: ${formatCurrency(metrics.monthlyRent)}
Gross yield: ${metrics.grossYield.toFixed(2)}%
Net yield: ${metrics.netYield.toFixed(2)}%
Monthly cashflow: ${formatCurrency(metrics.monthlyCashflow)}
Cash-on-cash return: ${metrics.cashOnCash.toFixed(2)}%
DSCR: ${metrics.dscr.toFixed(2)}
LTV: ${(100 - parseNumber(form.depositPercent)).toFixed(0)}%

Please assess:
1. Is ${formatCurrency(metrics.monthlyRent)}/month achievable for ${form.postcode}?
2. Is the yield competitive for this area?
3. Key risks and opportunities

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local rental market context",
  "comparableRents": [{"address": "area/street", "rent": number, "bedrooms": number}]
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

    const getCashflowStatus = () => {
        if (metrics.monthlyCashflow >= 200) return { label: 'Strong', color: 'success' as const };
        if (metrics.monthlyCashflow >= 0) return { label: 'Positive', color: 'info' as const };
        return { label: 'Negative', color: 'warning' as const };
    };

    const getDscrStatus = () => {
        if (metrics.dscr >= 1.45) return { label: 'Excellent', color: 'success' as const };
        if (metrics.dscr >= 1.25) return { label: 'Good', color: 'info' as const };
        if (metrics.dscr >= 1.0) return { label: 'Marginal', color: 'warning' as const };
        return { label: 'Under 1.0', color: 'danger' as const };
    };

    return (
        <CalculatorPageLayout
            title="Buy to Let Calculator"
            description="Calculate rental yield, monthly cashflow, and ROI for your buy-to-let investment property. Validate your figures with AI-powered market analysis."
            category="Landlord"
            categorySlug="landlord"
            categoryColor="#10B981"
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter your investment figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Purchase price'
                                        name='purchasePrice'
                                        value={form.purchasePrice}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Total purchase price'
                                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Monthly rent'
                                        name='monthlyRent'
                                        value={form.monthlyRent}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Expected monthly rent'
                                        onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Deposit'
                                        name='depositPercent'
                                        type='number'
                                        value={form.depositPercent}
                                        unit='%'
                                        helper='Typically 25% for BTL'
                                        onChange={(e) => handleInputChange('depositPercent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Interest rate'
                                        name='interestRate'
                                        type='number'
                                        step='0.1'
                                        value={form.interestRate}
                                        unit='%'
                                        helper={`Indicative: ${indicativeRate.minRate.toFixed(2)}-${indicativeRate.maxRate.toFixed(2)}% at ${ltv.toFixed(0)}% LTV`}
                                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Management fee'
                                        name='managementFee'
                                        type='number'
                                        value={form.managementFee}
                                        unit='%'
                                        helper='Of gross rent (0% if self-managed)'
                                        onChange={(e) => handleInputChange('managementFee', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Annual insurance'
                                        name='insuranceCost'
                                        value={form.insuranceCost}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Landlord insurance'
                                        onChange={(e) => handleInputChange('insuranceCost', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Maintenance allowance'
                                        name='maintenancePercent'
                                        type='number'
                                        value={form.maintenancePercent}
                                        unit='%'
                                        helper='Of gross rent (typically 5-10%)'
                                        onChange={(e) => handleInputChange('maintenancePercent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Void periods'
                                        name='voidPercent'
                                        type='number'
                                        value={form.voidPercent}
                                        unit='%'
                                        helper='Expected void rate (typically 4-8%)'
                                        onChange={(e) => handleInputChange('voidPercent', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI market validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                {/* Indicative Rate Guidance */}
                                <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                    <div className='flex items-start gap-3'>
                                        <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                        <div className='space-y-2'>
                                            <p className='font-medium text-blue-900 text-sm'>Indicative BTL Rates (Dec 2024)</p>
                                            <p className='text-xs text-blue-700'>
                                                Your LTV: <span className='font-semibold'>{ltv.toFixed(0)}%</span> —
                                                Typical rates: <span className='font-semibold'>{indicativeRate.minRate.toFixed(2)}-{indicativeRate.maxRate.toFixed(2)}%</span>
                                            </p>
                                            <details className='text-xs'>
                                                <summary className='cursor-pointer text-blue-600 hover:text-blue-800'>View all rate bands</summary>
                                                <div className='mt-2 space-y-1'>
                                                    {BTL_RATE_BANDS.map((band) => (
                                                        <div
                                                            key={band.maxLtv}
                                                            className={`flex justify-between py-1 px-2 rounded ${ltv <= band.maxLtv && (BTL_RATE_BANDS.findIndex(b => b.maxLtv === band.maxLtv) === 0 || ltv > BTL_RATE_BANDS[BTL_RATE_BANDS.findIndex(b => b.maxLtv === band.maxLtv) - 1].maxLtv) ? 'bg-blue-100 font-medium' : ''}`}
                                                        >
                                                            <span className='text-blue-800'>{band.label}</span>
                                                            <span className='text-blue-700'>{band.minRate.toFixed(2)}-{band.maxRate.toFixed(2)}%</span>
                                                        </div>
                                                    ))}
                                                    <div className='flex justify-between py-1 px-2 rounded'>
                                                        <span className='text-blue-800'>85%+ LTV</span>
                                                        <span className='text-blue-700'>6.49%+ (limited)</span>
                                                    </div>
                                                </div>
                                            </details>
                                            <p className='text-xs text-blue-600 italic'>
                                                Rates vary by lender, credit score, and product. Contact us for personalised quotes.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Returns
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
                        <BentoCard variant='secondary' title='Cost breakdown' description='Annual operating costs'>
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Management fees</span>
                                    <span className='font-medium'>{formatCurrency(metrics.annualManagement)}/yr</span>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Insurance</span>
                                    <span className='font-medium'>{formatCurrency(metrics.insuranceCost)}/yr</span>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Maintenance allowance</span>
                                    <span className='font-medium'>{formatCurrency(metrics.annualMaintenance)}/yr</span>
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Void allowance</span>
                                    <span className='font-medium'>{formatCurrency(metrics.annualVoidLoss)}/yr</span>
                                </div>
                                <div className='border-t pt-3 flex items-center justify-between font-medium'>
                                    <span className='text-slate-900'>Total operating costs</span>
                                    <span className='text-[var(--pc-blue)]'>{formatCurrency(metrics.totalOperatingCosts)}/yr</span>
                                </div>
                            </div>
                        </BentoCard>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        <CalculatorResultsGate
                            calculatorType="Buy to Let Calculator"
                            calculatorSlug="buy-to-let-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Investment returns' description='Based on your inputs'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Gross Yield'
                                    value={`${metrics.grossYield.toFixed(2)}%`}
                                    helper='Before costs'
                                />
                                <DealMetric
                                    label='Net Yield'
                                    value={`${metrics.netYield.toFixed(2)}%`}
                                    helper='After costs'
                                />
                                <DealMetric
                                    label='Monthly Cashflow'
                                    value={formatCurrency(metrics.monthlyCashflow)}
                                    helper={getCashflowStatus().label}
                                />
                                <DealMetric
                                    label='Cash on Cash'
                                    value={`${metrics.cashOnCash.toFixed(2)}%`}
                                    helper='ROI on deposit'
                                />
                            </BentoGrid>

                            {/* Summary Cards */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className={`border-2 ${metrics.monthlyCashflow >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            {metrics.monthlyCashflow >= 0 ? (
                                                <TrendingUp className='size-8 text-emerald-600' />
                                            ) : (
                                                <TrendingDown className='size-8 text-red-600' />
                                            )}
                                            <div>
                                                <p className='text-sm text-slate-600'>Annual Cashflow</p>
                                                <p className={`text-xl font-bold ${metrics.monthlyCashflow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {formatCurrency(metrics.annualCashflow)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`border-2 ${metrics.dscr >= 1.25 ? 'border-emerald-200 bg-emerald-50' : metrics.dscr >= 1.0 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <PieChart className={`size-8 ${metrics.dscr >= 1.25 ? 'text-emerald-600' : metrics.dscr >= 1.0 ? 'text-amber-600' : 'text-red-600'}`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>DSCR</p>
                                                <p className={`text-xl font-bold ${metrics.dscr >= 1.25 ? 'text-emerald-700' : metrics.dscr >= 1.0 ? 'text-amber-700' : 'text-red-700'}`}>
                                                    {metrics.dscr.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            {metrics.dscr >= 1.45 ? 'Exceeds most lender requirements' :
                                             metrics.dscr >= 1.25 ? 'Meets standard BTL requirements' :
                                             metrics.dscr >= 1.0 ? 'May struggle to secure finance' :
                                             'Below minimum requirements'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Finance Summary */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Wallet className='size-4' />
                                    Finance Summary
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Deposit required</span>
                                        <span className='font-medium'>{formatCurrency(metrics.deposit)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Mortgage amount</span>
                                        <span className='font-medium'>{formatCurrency(metrics.mortgageAmount)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Monthly mortgage (interest only)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.monthlyMortgage)}</span>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='BTL investment'
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

                                    {/* Comparable Rents */}
                                    {aiAnalysis.comparableRents && aiAnalysis.comparableRents.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3'>Comparable Rents</h4>
                                            <div className='space-y-2'>
                                                {aiAnalysis.comparableRents.map((comp, i) => (
                                                    <div key={i} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm'>
                                                        <div>
                                                            <p className='font-medium text-slate-900'>{comp.address}</p>
                                                            <p className='text-xs text-slate-500'>{comp.bedrooms} bed</p>
                                                        </div>
                                                        <p className='font-semibold text-slate-900'>{formatCurrency(comp.rent)}/mo</p>
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

                <CalculatorSEO
                    calculatorName="Buy to Let Calculator"
                    calculatorSlug="buy-to-let-calculator"
                    description="The Buy to Let Calculator helps UK landlords calculate rental yield, monthly cashflow, and return on investment for BTL properties. Input your purchase price, expected rent, mortgage details, and operating costs to see comprehensive investment returns including gross yield, net yield, DSCR, and cash-on-cash return."
                    howItWorks={`The BTL calculator analyses investment returns across multiple metrics:

**Gross Yield**: (Annual Rent ÷ Purchase Price) × 100. This is the headline yield before costs.

**Net Yield**: ((Annual Rent - Operating Costs) ÷ Purchase Price) × 100. Shows yield after all costs except mortgage.

**Monthly Cashflow**: (Monthly Rent - Mortgage Payment - Operating Costs ÷ 12). This is your actual monthly profit or loss.

**Cash on Cash Return**: (Annual Cashflow ÷ Deposit) × 100. Shows ROI on your invested capital.

**DSCR**: (Net Operating Income ÷ Annual Debt Service). Lenders require DSCR of 1.25+ for most BTL mortgages.

The calculator includes realistic operating costs: management fees (typically 8-12%), insurance, maintenance allowance, void periods, and other expenses to give accurate net returns.`}
                    whenToUse="Use this calculator when evaluating BTL purchase opportunities, comparing properties, or assessing whether a property meets your investment criteria. It's essential for understanding true profitability after all costs and whether the property meets lender DSCR requirements."
                    keyFeatures={[
                        "Calculate gross and net rental yields",
                        "Forecast monthly and annual cashflow",
                        "Assess DSCR for lender requirements",
                        "Compare returns across different deposit sizes and interest rates",
                    ]}
                    faqs={[
                        {
                            question: "What is a good rental yield for BTL?",
                            answer: "In the UK, gross yields vary by region. London averages 3-5%, while Northern cities like Manchester or Liverpool can achieve 6-8%. A good net yield (after all costs) is 4%+ in London, 5-7% elsewhere. However, yield alone doesn't tell the full story—also consider capital growth potential and cashflow."
                        },
                        {
                            question: "What is the minimum deposit for a BTL mortgage?",
                            answer: "Most UK BTL lenders require a minimum 25% deposit (75% LTV). Some specialist lenders offer 80-85% LTV but with higher rates and stricter criteria. Portfolio landlords and first-time BTL investors may face higher deposit requirements of 30-40%. Larger deposits secure better interest rates."
                        },
                        {
                            question: "How much should I budget for BTL operating costs?",
                            answer: "Budget 25-35% of gross rent for operating costs: management fees (8-12%), insurance (£200-500/year), maintenance (5-10% of rent), void periods (4-8% allowance), and other costs. Properties in poorer condition or problematic tenants can push costs higher. Always stress test your numbers."
                        },
                        {
                            question: "What DSCR do I need for a BTL mortgage?",
                            answer: "Most UK lenders require DSCR of 1.25-1.45, meaning your net operating income must be 125-145% of your mortgage payment at the stress test rate (typically 5.5%). Higher rate taxpayers face 1.45 requirements due to Section 24. Below 1.25, you'll struggle to secure finance."
                        },
                        {
                            question: "Should I use interest-only or repayment for BTL?",
                            answer: "Most BTL investors choose interest-only mortgages to maximize cashflow, planning to repay capital from property sale or refinancing. Interest-only keeps monthly payments low but requires an exit strategy. Repayment mortgages build equity faster but significantly reduce monthly cashflow, often making properties cashflow negative."
                        },
                    ]}
                    relatedTerms={[
                        "BTL calculator UK",
                        "Rental yield calculator",
                        "Buy-to-let investment",
                        "BTL mortgage calculator",
                        "Rental property ROI",
                        "Gross rental yield",
                        "Net rental yield",
                        "BTL cashflow",
                        "Landlord profit calculator",
                        "Property investment returns",
                    ]}
                    categoryColor="#10B981"
                />
        </CalculatorPageLayout>
    );
};

export default BuyToLetCalculatorPage;
