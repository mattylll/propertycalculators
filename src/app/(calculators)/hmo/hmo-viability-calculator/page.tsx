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
import {
    ArrowRight,
    Home,
    PoundSterling,
    Percent,
    TrendingUp,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Users,
    Flame,
    FileCheck,
    Banknote,
} from 'lucide-react';

type HmoFormState = {
    purchasePrice: string;
    refurbCost: string;
    numberOfRooms: string;
    averageRoomRent: string;
    depositPercent: string;
    interestRate: string;
    managementFee: string;
    licenseCost: string;
    insuranceCost: string;
    utilitiesCost: string;
    cleaningCost: string;
    maintenancePercent: string;
    voidPercent: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: HmoFormState = {
    purchasePrice: '250,000',
    refurbCost: '40,000',
    numberOfRooms: '6',
    averageRoomRent: '550',
    depositPercent: '25',
    interestRate: '6.5',
    managementFee: '12',
    licenseCost: '1,200',
    insuranceCost: '1,500',
    utilitiesCost: '400',
    cleaningCost: '200',
    maintenancePercent: '8',
    voidPercent: '6',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveHmoMetrics = (form: HmoFormState) => {
    const purchasePrice = parseNumber(form.purchasePrice);
    const refurbCost = parseNumber(form.refurbCost);
    const numberOfRooms = parseNumber(form.numberOfRooms);
    const averageRoomRent = parseNumber(form.averageRoomRent);
    const depositPercent = parseNumber(form.depositPercent) / 100;
    const interestRate = parseNumber(form.interestRate) / 100;
    const managementFee = parseNumber(form.managementFee) / 100;
    const licenseCost = parseNumber(form.licenseCost);
    const insuranceCost = parseNumber(form.insuranceCost);
    const utilitiesCost = parseNumber(form.utilitiesCost);
    const cleaningCost = parseNumber(form.cleaningCost);
    const maintenancePercent = parseNumber(form.maintenancePercent) / 100;
    const voidPercent = parseNumber(form.voidPercent) / 100;

    // Total investment
    const totalInvestment = purchasePrice + refurbCost;
    const deposit = purchasePrice * depositPercent;
    const mortgageAmount = purchasePrice - deposit;

    // Gross rent
    const monthlyGrossRent = numberOfRooms * averageRoomRent;
    const annualGrossRent = monthlyGrossRent * 12;

    // Effective rent after voids
    const effectiveRent = annualGrossRent * (1 - voidPercent);

    // Operating costs
    const annualManagement = effectiveRent * managementFee;
    const annualMaintenance = effectiveRent * maintenancePercent;
    const annualUtilities = utilitiesCost * 12;
    const annualCleaning = cleaningCost * 12;
    const annualLicence = licenseCost / 5; // Amortized over 5 years

    const totalOperatingCosts = annualManagement + insuranceCost + annualMaintenance +
                                 annualUtilities + annualCleaning + annualLicence;

    // Net Operating Income
    const noi = effectiveRent - totalOperatingCosts;

    // Mortgage
    const annualMortgage = mortgageAmount * interestRate;
    const monthlyMortgage = annualMortgage / 12;

    // Cashflow
    const annualCashflow = noi - annualMortgage;
    const monthlyCashflow = annualCashflow / 12;
    const perRoomCashflow = monthlyCashflow / numberOfRooms;

    // Yields and Returns
    const grossYield = totalInvestment > 0 ? (annualGrossRent / totalInvestment) * 100 : 0;
    const netYield = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
    const cashOnCash = deposit > 0 ? (annualCashflow / deposit) * 100 : 0;

    // DSCR
    const dscr = annualMortgage > 0 ? noi / annualMortgage : 0;

    // ICR at 5.5% stress
    const stressedMortgage = mortgageAmount * 0.055;
    const icr = stressedMortgage > 0 ? annualGrossRent / stressedMortgage : 0;

    // Cost per room
    const costPerRoom = totalInvestment / numberOfRooms;

    // Comparison to BTL
    const btlEquivalentRent = purchasePrice * 0.05 / 12; // Assume 5% gross yield
    const hmoVsBtlMultiplier = monthlyGrossRent / btlEquivalentRent;

    return {
        purchasePrice,
        refurbCost,
        totalInvestment,
        deposit,
        mortgageAmount,
        numberOfRooms,
        averageRoomRent,
        monthlyGrossRent,
        annualGrossRent,
        effectiveRent,
        totalOperatingCosts,
        noi,
        monthlyMortgage,
        annualMortgage,
        monthlyCashflow,
        annualCashflow,
        perRoomCashflow,
        grossYield,
        netYield,
        cashOnCash,
        dscr,
        icr,
        costPerRoom,
        hmoVsBtlMultiplier,
        // Cost breakdown
        annualManagement,
        insuranceCost,
        annualMaintenance,
        annualUtilities,
        annualCleaning,
        annualLicence,
    };
};

const HmoViabilityCalculatorPage = () => {
    const [form, setForm] = useState<HmoFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveHmoMetrics(form), [form]);

    const handleInputChange = (name: keyof HmoFormState, value: string) => {
        if (['purchasePrice', 'refurbCost', 'averageRoomRent', 'licenseCost', 'insuranceCost', 'utilitiesCost', 'cleaningCost'].includes(name)) {
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
                    systemPrompt: `You are an expert UK HMO property investment analyst.
You provide accurate, data-driven analysis for HMO viability assessments.
Focus on room rents, Article 4, licensing, and local HMO market conditions.`,
                    userPrompt: `Analyse this HMO investment in ${form.postcode}:

Purchase price: ${formatCurrency(metrics.purchasePrice)}
Refurb cost: ${formatCurrency(metrics.refurbCost)}
Number of rooms: ${metrics.numberOfRooms}
Average room rent: ${formatCurrency(metrics.averageRoomRent)}/month
Monthly gross rent: ${formatCurrency(metrics.monthlyGrossRent)}
Gross yield: ${metrics.grossYield.toFixed(2)}%
Net yield: ${metrics.netYield.toFixed(2)}%
Monthly cashflow: ${formatCurrency(metrics.monthlyCashflow)}
Cash on cash return: ${metrics.cashOnCash.toFixed(2)}%
DSCR: ${metrics.dscr.toFixed(2)}
Cost per room: ${formatCurrency(metrics.costPerRoom)}

Please assess:
1. Are room rents of ${formatCurrency(metrics.averageRoomRent)} achievable in ${form.postcode}?
2. Is this area subject to Article 4 direction for HMOs?
3. Licensing requirements for a ${metrics.numberOfRooms}-bed HMO
4. Key risks and opportunities

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local HMO market context"
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
        const perRoom = metrics.perRoomCashflow;
        if (perRoom >= 150) return { label: 'Excellent', color: 'success' as const };
        if (perRoom >= 100) return { label: 'Good', color: 'info' as const };
        if (perRoom >= 50) return { label: 'Marginal', color: 'warning' as const };
        return { label: 'Poor', color: 'danger' as const };
    };

    const getDscrStatus = () => {
        if (metrics.dscr >= 1.45) return { label: 'Excellent', color: 'success' as const };
        if (metrics.dscr >= 1.25) return { label: 'Good', color: 'info' as const };
        if (metrics.dscr >= 1.0) return { label: 'Marginal', color: 'warning' as const };
        return { label: 'Under 1.0', color: 'danger' as const };
    };

    return (
        <CalculatorPageLayout
            title="HMO Viability Calculator"
            description="Assess whether your HMO conversion or purchase stacks financially. Calculate room rents, yields, and cashflow per room."
            category="HMO"
            categorySlug="hmo"
            categoryColor="#EC4899"
            badges={[
                { label: 'Multi-Let', variant: 'neutral' },
            ]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter your HMO figures'>
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
                                        label='Refurb/conversion cost'
                                        name='refurbCost'
                                        value={form.refurbCost}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Inc. fire safety, ensuite etc'
                                        onChange={(e) => handleInputChange('refurbCost', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Number of lettable rooms'
                                        name='numberOfRooms'
                                        type='number'
                                        value={form.numberOfRooms}
                                        unit='rooms'
                                        helper='Excluding communal areas'
                                        onChange={(e) => handleInputChange('numberOfRooms', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Average room rent'
                                        name='averageRoomRent'
                                        value={form.averageRoomRent}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Per room per month'
                                        onChange={(e) => handleInputChange('averageRoomRent', e.target.value)}
                                    />
                                </div>

                                <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                    <h4 className='font-medium text-blue-900 text-sm mb-3'>Finance</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Deposit'
                                            name='depositPercent'
                                            type='number'
                                            value={form.depositPercent}
                                            unit='%'
                                            helper='Typically 25%+ for HMO'
                                            onChange={(e) => handleInputChange('depositPercent', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Interest rate'
                                            name='interestRate'
                                            type='number'
                                            step='0.1'
                                            value={form.interestRate}
                                            unit='%'
                                            helper='HMO rates typically higher'
                                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-amber-50 border border-amber-200'>
                                    <h4 className='font-medium text-amber-900 text-sm mb-3'>HMO Operating Costs</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Management fee'
                                            name='managementFee'
                                            type='number'
                                            value={form.managementFee}
                                            unit='%'
                                            helper='Typically 10-15% for HMO'
                                            onChange={(e) => handleInputChange('managementFee', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='HMO licence (5yr)'
                                            name='licenseCost'
                                            value={form.licenseCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Varies by council'
                                            onChange={(e) => handleInputChange('licenseCost', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='grid gap-4 md:grid-cols-2 mt-4'>
                                        <FloatingField
                                            label='Annual insurance'
                                            name='insuranceCost'
                                            value={form.insuranceCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('insuranceCost', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Monthly utilities'
                                            name='utilitiesCost'
                                            value={form.utilitiesCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='If bills included'
                                            onChange={(e) => handleInputChange('utilitiesCost', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='grid gap-4 md:grid-cols-2 mt-4'>
                                        <FloatingField
                                            label='Monthly cleaning'
                                            name='cleaningCost'
                                            value={form.cleaningCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Communal areas'
                                            onChange={(e) => handleInputChange('cleaningCost', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Maintenance'
                                            name='maintenancePercent'
                                            type='number'
                                            value={form.maintenancePercent}
                                            unit='%'
                                            helper='Higher for HMOs'
                                            onChange={(e) => handleInputChange('maintenancePercent', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='mt-4'>
                                        <FloatingField
                                            label='Void rate'
                                            name='voidPercent'
                                            type='number'
                                            value={form.voidPercent}
                                            unit='%'
                                            helper='Expected vacancy rate'
                                            onChange={(e) => handleInputChange('voidPercent', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI market validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Viability
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
                        <BentoCard variant='secondary' title='HMO viability analysis' description='Based on your inputs'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Gross Yield'
                                    value={`${metrics.grossYield.toFixed(2)}%`}
                                    helper='Before all costs'
                                />
                                <DealMetric
                                    label='Net Yield'
                                    value={`${metrics.netYield.toFixed(2)}%`}
                                    helper='After operating costs'
                                />
                                <DealMetric
                                    label='Monthly Cashflow'
                                    value={formatCurrency(metrics.monthlyCashflow)}
                                    helper={getCashflowStatus().label}
                                />
                                <DealMetric
                                    label='Per Room Cashflow'
                                    value={formatCurrency(metrics.perRoomCashflow)}
                                    helper='Per room per month'
                                />
                            </BentoGrid>

                            {/* Summary Cards */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className={`border-2 ${metrics.monthlyCashflow >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Users className='size-8 text-blue-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Monthly Gross Rent</p>
                                                <p className='text-xl font-bold text-blue-700'>
                                                    {formatCurrency(metrics.monthlyGrossRent)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            {metrics.numberOfRooms} rooms × {formatCurrency(metrics.averageRoomRent)}/room
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className={`border-2 ${metrics.cashOnCash >= 15 ? 'border-emerald-200 bg-emerald-50' : metrics.cashOnCash >= 10 ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <TrendingUp className={`size-8 ${metrics.cashOnCash >= 15 ? 'text-emerald-600' : metrics.cashOnCash >= 10 ? 'text-blue-600' : 'text-amber-600'}`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>Cash on Cash Return</p>
                                                <p className={`text-xl font-bold ${metrics.cashOnCash >= 15 ? 'text-emerald-700' : metrics.cashOnCash >= 10 ? 'text-blue-700' : 'text-amber-700'}`}>
                                                    {metrics.cashOnCash.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            Annual return on {formatCurrency(metrics.deposit)} deposit
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* HMO vs BTL Comparison */}
                            <div className='mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <Home className='size-6 text-indigo-600' />
                                        <div>
                                            <p className='font-medium text-indigo-900'>HMO vs BTL Comparison</p>
                                            <p className='text-xs text-indigo-700'>Rent multiplier vs single-let</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-2xl font-bold text-indigo-700'>{metrics.hmoVsBtlMultiplier.toFixed(1)}x</p>
                                        <p className='text-xs text-indigo-600'>vs BTL rent</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lending Metrics */}
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className={`p-3 rounded-lg border text-center ${metrics.dscr >= 1.25 ? 'bg-emerald-50 border-emerald-200' : metrics.dscr >= 1.0 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className='text-xs text-slate-500'>DSCR</p>
                                    <p className={`text-lg font-bold ${metrics.dscr >= 1.25 ? 'text-emerald-600' : metrics.dscr >= 1.0 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {metrics.dscr.toFixed(2)}
                                    </p>
                                    <p className='text-xs text-slate-500'>{getDscrStatus().label}</p>
                                </div>
                                <div className={`p-3 rounded-lg border text-center ${metrics.icr >= 1.45 ? 'bg-emerald-50 border-emerald-200' : metrics.icr >= 1.25 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className='text-xs text-slate-500'>ICR @ 5.5%</p>
                                    <p className={`text-lg font-bold ${metrics.icr >= 1.45 ? 'text-emerald-600' : metrics.icr >= 1.25 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {metrics.icr.toFixed(2)}
                                    </p>
                                    <p className='text-xs text-slate-500'>{metrics.icr >= 1.45 ? 'Passes stress' : 'Check lender'}</p>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className='mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Banknote className='size-4' />
                                    Annual Cost Breakdown
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Management ({form.managementFee}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualManagement)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Insurance</span>
                                        <span className='font-medium'>{formatCurrency(metrics.insuranceCost)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Maintenance ({form.maintenancePercent}%)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualMaintenance)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Utilities</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualUtilities)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Cleaning</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualCleaning)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>HMO licence (amortized)</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualLicence)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Total operating costs</span>
                                        <span className='text-red-600'>{formatCurrency(metrics.totalOperatingCosts)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Mortgage interest</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualMortgage)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Annual cashflow</span>
                                        <span className={metrics.annualCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                            {formatCurrency(metrics.annualCashflow)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Investment Summary */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Investment Summary</h4>
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <p className='text-slate-500'>Total investment</p>
                                        <p className='font-bold text-lg'>{formatCurrency(metrics.totalInvestment)}</p>
                                    </div>
                                    <div>
                                        <p className='text-slate-500'>Cost per room</p>
                                        <p className='font-bold text-lg'>{formatCurrency(metrics.costPerRoom)}</p>
                                    </div>
                                    <div>
                                        <p className='text-slate-500'>Deposit required</p>
                                        <p className='font-bold text-lg'>{formatCurrency(metrics.deposit)}</p>
                                    </div>
                                    <div>
                                        <p className='text-slate-500'>Mortgage amount</p>
                                        <p className='font-bold text-lg'>{formatCurrency(metrics.mortgageAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='HMO viability'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI HMO Analysis</span>
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
                                                        <ArrowRight className='size-4 text-blue-500 shrink-0 mt-0.5' />
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

export default HmoViabilityCalculatorPage;
