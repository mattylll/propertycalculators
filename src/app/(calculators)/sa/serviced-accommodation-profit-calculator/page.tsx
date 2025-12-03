"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    BedDouble,
    PoundSterling,
    Percent,
    Calendar,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';

type SaFormState = {
    purchasePrice: string;
    refurbCost: string;
    depositPercent: string;
    interestRate: string;
    averageNightlyRate: string;
    occupancyPercent: string;
    cleaningFee: string;
    cleaningCost: string;
    managementPercent: string;
    platformFees: string;
    utilities: string;
    insurance: string;
    maintenance: string;
    consumables: string;
    councilTax: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: SaFormState = {
    purchasePrice: '250,000',
    refurbCost: '25,000',
    depositPercent: '25',
    interestRate: '6',
    averageNightlyRate: '120',
    occupancyPercent: '65',
    cleaningFee: '50',
    cleaningCost: '35',
    managementPercent: '20',
    platformFees: '15',
    utilities: '250',
    insurance: '100',
    maintenance: '150',
    consumables: '100',
    councilTax: '150',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveSaMetrics = (form: SaFormState) => {
    const purchasePrice = parseNumber(form.purchasePrice);
    const refurbCost = parseNumber(form.refurbCost);
    const depositPercent = parseNumber(form.depositPercent) / 100;
    const interestRate = parseNumber(form.interestRate) / 100;
    const nightlyRate = parseNumber(form.averageNightlyRate);
    const occupancy = parseNumber(form.occupancyPercent) / 100;
    const cleaningFee = parseNumber(form.cleaningFee);
    const cleaningCost = parseNumber(form.cleaningCost);
    const managementPercent = parseNumber(form.managementPercent) / 100;
    const platformFees = parseNumber(form.platformFees) / 100;
    const utilities = parseNumber(form.utilities);
    const insurance = parseNumber(form.insurance);
    const maintenance = parseNumber(form.maintenance);
    const consumables = parseNumber(form.consumables);
    const councilTax = parseNumber(form.councilTax);

    // Investment
    const totalInvestment = purchasePrice + refurbCost;
    const deposit = purchasePrice * depositPercent;
    const mortgageAmount = purchasePrice - deposit;

    // Occupancy metrics (assume 2.5 night average stay)
    const nightsPerYear = 365 * occupancy;
    const averageStayLength = 2.5;
    const bookingsPerYear = nightsPerYear / averageStayLength;

    // Gross income
    const grossAccommodationRevenue = nightlyRate * nightsPerYear;
    const grossCleaningRevenue = cleaningFee * bookingsPerYear;
    const grossRevenue = grossAccommodationRevenue + grossCleaningRevenue;

    // Operating costs
    const platformFeesAmount = grossAccommodationRevenue * platformFees;
    const managementAmount = grossRevenue * managementPercent;
    const cleaningCostsAmount = cleaningCost * bookingsPerYear;
    const annualUtilities = utilities * 12;
    const annualInsurance = insurance * 12;
    const annualMaintenance = maintenance * 12;
    const annualConsumables = consumables * 12;
    const annualCouncilTax = councilTax * 12;

    const totalOperatingCosts = platformFeesAmount + managementAmount + cleaningCostsAmount +
                                 annualUtilities + annualInsurance + annualMaintenance +
                                 annualConsumables + annualCouncilTax;

    // Net Operating Income
    const noi = grossRevenue - totalOperatingCosts;

    // Mortgage
    const annualMortgage = mortgageAmount * interestRate;
    const monthlyMortgage = annualMortgage / 12;

    // Cashflow
    const annualCashflow = noi - annualMortgage;
    const monthlyCashflow = annualCashflow / 12;

    // Returns
    const grossYield = totalInvestment > 0 ? (grossRevenue / totalInvestment) * 100 : 0;
    const netYield = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
    const cashOnCash = deposit > 0 ? (annualCashflow / deposit) * 100 : 0;

    // ADR and RevPAR
    const adr = nightlyRate; // Average Daily Rate
    const revpar = nightlyRate * occupancy; // Revenue Per Available Room

    // Breakeven occupancy
    const fixedCosts = annualUtilities + annualInsurance + annualMaintenance +
                       annualConsumables + annualCouncilTax + annualMortgage;
    const revenuePerNight = nightlyRate * (1 - platformFees - managementPercent) +
                            (cleaningFee - cleaningCost) / averageStayLength;
    const breakevenNights = fixedCosts / revenuePerNight;
    const breakevenOccupancy = (breakevenNights / 365) * 100;

    // SA vs BTL comparison
    const btlEquivalentRent = purchasePrice * 0.05 / 12; // Assume 5% gross yield
    const saVsBtlMultiplier = (grossRevenue / 12) / btlEquivalentRent;

    return {
        purchasePrice,
        refurbCost,
        totalInvestment,
        deposit,
        mortgageAmount,
        nightlyRate,
        occupancy: occupancy * 100,
        nightsPerYear,
        bookingsPerYear,
        grossAccommodationRevenue,
        grossCleaningRevenue,
        grossRevenue,
        platformFeesAmount,
        managementAmount,
        cleaningCostsAmount,
        annualUtilities,
        annualInsurance,
        annualMaintenance,
        annualConsumables,
        annualCouncilTax,
        totalOperatingCosts,
        noi,
        annualMortgage,
        monthlyMortgage,
        annualCashflow,
        monthlyCashflow,
        grossYield,
        netYield,
        cashOnCash,
        adr,
        revpar,
        breakevenOccupancy,
        saVsBtlMultiplier,
    };
};

const SaCalculatorPage = () => {
    const [form, setForm] = useState<SaFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveSaMetrics(form), [form]);

    const handleInputChange = (name: keyof SaFormState, value: string) => {
        if (['purchasePrice', 'refurbCost', 'averageNightlyRate', 'cleaningFee', 'cleaningCost', 'utilities', 'insurance', 'maintenance', 'consumables', 'councilTax'].includes(name)) {
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
                    systemPrompt: `You are an expert UK serviced accommodation analyst.
You provide accurate, data-driven analysis for SA investment decisions.
Focus on ADR realism, occupancy rates, and local competition.`,
                    userPrompt: `Analyse this serviced accommodation in ${form.postcode}:

Purchase price: ${formatCurrency(metrics.purchasePrice)}
Average nightly rate: ${formatCurrency(metrics.nightlyRate)}
Assumed occupancy: ${metrics.occupancy.toFixed(0)}%
Gross revenue: ${formatCurrency(metrics.grossRevenue)}/year
Net Operating Income: ${formatCurrency(metrics.noi)}/year
Annual cashflow: ${formatCurrency(metrics.annualCashflow)}
Cash on cash return: ${metrics.cashOnCash.toFixed(1)}%
RevPAR: ${formatCurrency(metrics.revpar)}
Breakeven occupancy: ${metrics.breakevenOccupancy.toFixed(0)}%

Please assess:
1. Is ${formatCurrency(metrics.nightlyRate)}/night achievable in ${form.postcode}?
2. Is ${metrics.occupancy.toFixed(0)}% occupancy realistic for this area?
3. Competition and demand analysis
4. Key risks and opportunities

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local SA market context"
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
        if (metrics.monthlyCashflow >= 500) return { label: 'Excellent', color: 'success' as const };
        if (metrics.monthlyCashflow >= 250) return { label: 'Good', color: 'info' as const };
        if (metrics.monthlyCashflow >= 0) return { label: 'Marginal', color: 'warning' as const };
        return { label: 'Negative', color: 'danger' as const };
    };

    return (
        <CalculatorPageLayout
            title="Serviced Accommodation Profit Calculator"
            description="Calculate profitability of serviced accommodation properties including ADR, occupancy, RevPAR, and breakeven analysis."
            category="Serviced Accommodation"
            categorySlug="sa"
            categoryColor="#F97316"
            badges={[{ label: 'SA Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter your SA figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Purchase price'
                                        name='purchasePrice'
                                        value={form.purchasePrice}
                                        unit='£'
                                        unitPosition='prefix'
                                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Refurb/setup cost'
                                        name='refurbCost'
                                        value={form.refurbCost}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Inc. furniture & styling'
                                        onChange={(e) => handleInputChange('refurbCost', e.target.value)}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Deposit'
                                        name='depositPercent'
                                        type='number'
                                        value={form.depositPercent}
                                        unit='%'
                                        onChange={(e) => handleInputChange('depositPercent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Interest rate'
                                        name='interestRate'
                                        type='number'
                                        step='0.1'
                                        value={form.interestRate}
                                        unit='%'
                                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                    />
                                </div>

                                <div className='p-4 rounded-xl bg-pink-50 border border-pink-200'>
                                    <h4 className='font-medium text-pink-900 text-sm mb-3'>Revenue Assumptions</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Average nightly rate'
                                            name='averageNightlyRate'
                                            value={form.averageNightlyRate}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='ADR after discounts'
                                            onChange={(e) => handleInputChange('averageNightlyRate', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Occupancy rate'
                                            name='occupancyPercent'
                                            type='number'
                                            value={form.occupancyPercent}
                                            unit='%'
                                            helper='Annual average'
                                            onChange={(e) => handleInputChange('occupancyPercent', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Cleaning fee charged'
                                            name='cleaningFee'
                                            value={form.cleaningFee}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Per booking'
                                            onChange={(e) => handleInputChange('cleaningFee', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Cleaning cost'
                                            name='cleaningCost'
                                            value={form.cleaningCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Your actual cost'
                                            onChange={(e) => handleInputChange('cleaningCost', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                    <h4 className='font-medium text-slate-900 text-sm mb-3'>Operating Costs</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Management fee'
                                            name='managementPercent'
                                            type='number'
                                            value={form.managementPercent}
                                            unit='%'
                                            helper='Of gross revenue'
                                            onChange={(e) => handleInputChange('managementPercent', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Platform fees'
                                            name='platformFees'
                                            type='number'
                                            value={form.platformFees}
                                            unit='%'
                                            helper='Airbnb/Booking etc.'
                                            onChange={(e) => handleInputChange('platformFees', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Monthly utilities'
                                            name='utilities'
                                            value={form.utilities}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('utilities', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Monthly insurance'
                                            name='insurance'
                                            value={form.insurance}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('insurance', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Monthly maintenance'
                                            name='maintenance'
                                            value={form.maintenance}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('maintenance', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Monthly consumables'
                                            name='consumables'
                                            value={form.consumables}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Toiletries, coffee etc.'
                                            onChange={(e) => handleInputChange('consumables', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='mt-4'>
                                        <FloatingField
                                            label='Monthly council tax'
                                            name='councilTax'
                                            value={form.councilTax}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Business rates may apply'
                                            onChange={(e) => handleInputChange('councilTax', e.target.value)}
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
                                        Calculate Profit
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
                        <BentoCard variant='secondary' title='SA profitability' description='Based on your inputs'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Gross Revenue'
                                    value={formatCurrency(metrics.grossRevenue)}
                                    helper='Annual income'
                                />
                                <DealMetric
                                    label='Net Cashflow'
                                    value={formatCurrency(metrics.annualCashflow)}
                                    helper={getCashflowStatus().label}
                                />
                                <DealMetric
                                    label='Cash on Cash'
                                    value={`${metrics.cashOnCash.toFixed(1)}%`}
                                    helper='Return on deposit'
                                />
                                <DealMetric
                                    label='Breakeven'
                                    value={`${metrics.breakevenOccupancy.toFixed(0)}%`}
                                    helper='Min. occupancy needed'
                                />
                            </BentoGrid>

                            {/* Revenue Metrics */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-3'>
                                <Card className='border border-pink-200 bg-pink-50'>
                                    <CardContent className='p-4 text-center'>
                                        <p className='text-xs text-pink-600'>ADR</p>
                                        <p className='text-xl font-bold text-pink-700'>{formatCurrency(metrics.adr)}</p>
                                        <p className='text-xs text-pink-600'>Average Daily Rate</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-pink-200 bg-pink-50'>
                                    <CardContent className='p-4 text-center'>
                                        <p className='text-xs text-pink-600'>RevPAR</p>
                                        <p className='text-xl font-bold text-pink-700'>{formatCurrency(metrics.revpar)}</p>
                                        <p className='text-xs text-pink-600'>Revenue Per Available</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-pink-200 bg-pink-50'>
                                    <CardContent className='p-4 text-center'>
                                        <p className='text-xs text-pink-600'>SA vs BTL</p>
                                        <p className='text-xl font-bold text-pink-700'>{metrics.saVsBtlMultiplier.toFixed(1)}x</p>
                                        <p className='text-xs text-pink-600'>Revenue multiplier</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cashflow Summary */}
                            <div className='mt-6'>
                                <Card className={`border-2 ${metrics.monthlyCashflow >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <TrendingUp className={`size-8 ${metrics.monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                                                <div>
                                                    <p className='text-sm text-slate-600'>Monthly Cashflow</p>
                                                    <p className={`text-2xl font-bold ${metrics.monthlyCashflow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {formatCurrency(metrics.monthlyCashflow)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-slate-600'>{metrics.nightsPerYear.toFixed(0)} nights</p>
                                                <p className='text-sm text-slate-600'>{metrics.bookingsPerYear.toFixed(0)} bookings/yr</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* P&L Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Annual P&L</h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between text-emerald-600'>
                                        <span>Accommodation revenue</span>
                                        <span>+{formatCurrency(metrics.grossAccommodationRevenue)}</span>
                                    </div>
                                    <div className='flex justify-between text-emerald-600'>
                                        <span>Cleaning fees collected</span>
                                        <span>+{formatCurrency(metrics.grossCleaningRevenue)}</span>
                                    </div>
                                    <div className='flex justify-between font-medium border-t pt-2'>
                                        <span>Gross revenue</span>
                                        <span>{formatCurrency(metrics.grossRevenue)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Platform fees</span>
                                        <span>-{formatCurrency(metrics.platformFeesAmount)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Management</span>
                                        <span>-{formatCurrency(metrics.managementAmount)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Cleaning costs</span>
                                        <span>-{formatCurrency(metrics.cleaningCostsAmount)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Utilities</span>
                                        <span>-{formatCurrency(metrics.annualUtilities)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Other costs</span>
                                        <span>-{formatCurrency(metrics.annualInsurance + metrics.annualMaintenance + metrics.annualConsumables + metrics.annualCouncilTax)}</span>
                                    </div>
                                    <div className='flex justify-between font-medium border-t pt-2'>
                                        <span>Net Operating Income</span>
                                        <span>{formatCurrency(metrics.noi)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Mortgage</span>
                                        <span>-{formatCurrency(metrics.annualMortgage)}</span>
                                    </div>
                                    <div className='flex justify-between font-bold border-t pt-2'>
                                        <span>Net Cashflow</span>
                                        <span className={metrics.annualCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                            {formatCurrency(metrics.annualCashflow)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='serviced accommodation'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI SA Analysis</span>
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
                                                        <ArrowRight className='size-4 text-pink-500 shrink-0 mt-0.5' />
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

export default SaCalculatorPage;
