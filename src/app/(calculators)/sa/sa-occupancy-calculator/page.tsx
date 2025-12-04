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
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Calendar,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Percent,
    PoundSterling,
    TrendingUp,
    Target,
    BarChart3,
} from 'lucide-react';

type FormState = {
    adr: string;
    fixedCostsMonthly: string;
    variableCostPerNight: string;
    mortgageMonthly: string;
    targetMonthlyProfit: string;
    cleaningFee: string;
    cleaningCost: string;
    platformFeePercent: string;
    averageStayLength: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: FormState = {
    adr: '120',
    fixedCostsMonthly: '800',
    variableCostPerNight: '15',
    mortgageMonthly: '1,200',
    targetMonthlyProfit: '500',
    cleaningFee: '50',
    cleaningCost: '35',
    platformFeePercent: '15',
    averageStayLength: '2.5',
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
    const adr = parseNumber(form.adr);
    const fixedCostsMonthly = parseNumber(form.fixedCostsMonthly);
    const variableCostPerNight = parseNumber(form.variableCostPerNight);
    const mortgageMonthly = parseNumber(form.mortgageMonthly);
    const targetMonthlyProfit = parseNumber(form.targetMonthlyProfit);
    const cleaningFee = parseNumber(form.cleaningFee);
    const cleaningCost = parseNumber(form.cleaningCost);
    const platformFeePercent = parseNumber(form.platformFeePercent) / 100;
    const averageStayLength = parseNumber(form.averageStayLength);

    // Calculate net revenue per night
    // Platform fee is taken from ADR only (not cleaning fee typically)
    const netAdrAfterPlatform = adr * (1 - platformFeePercent);

    // Cleaning profit per booking
    const cleaningProfit = cleaningFee - cleaningCost;
    // Cleaning profit per night (spread across average stay)
    const cleaningProfitPerNight = averageStayLength > 0 ? cleaningProfit / averageStayLength : 0;

    // Net revenue per night
    const netRevenuePerNight = netAdrAfterPlatform + cleaningProfitPerNight - variableCostPerNight;

    // Total fixed costs (including mortgage)
    const totalFixedCostsMonthly = fixedCostsMonthly + mortgageMonthly;
    const totalFixedCostsAnnual = totalFixedCostsMonthly * 12;

    // BREAKEVEN OCCUPANCY (to cover fixed costs only)
    const breakevenNightsMonthly = netRevenuePerNight > 0 ? totalFixedCostsMonthly / netRevenuePerNight : 0;
    const breakevenOccupancyMonthly = (breakevenNightsMonthly / 30) * 100;
    const breakevenNightsAnnual = netRevenuePerNight > 0 ? totalFixedCostsAnnual / netRevenuePerNight : 0;
    const breakevenOccupancyAnnual = (breakevenNightsAnnual / 365) * 100;

    // TARGET PROFIT OCCUPANCY
    const targetTotalMonthly = totalFixedCostsMonthly + targetMonthlyProfit;
    const targetNightsMonthly = netRevenuePerNight > 0 ? targetTotalMonthly / netRevenuePerNight : 0;
    const targetOccupancy = (targetNightsMonthly / 30) * 100;

    // SCENARIO MODELLING: Calculate profit at different occupancy levels
    const scenarios = [40, 50, 60, 70, 80].map(occupancy => {
        const nightsPerMonth = 30 * (occupancy / 100);
        const nightsPerYear = 365 * (occupancy / 100);
        const grossRevenueMonthly = adr * nightsPerMonth + (cleaningFee * nightsPerMonth / averageStayLength);
        const platformFeesMonthly = adr * nightsPerMonth * platformFeePercent;
        const variableCostsMonthly = variableCostPerNight * nightsPerMonth;
        const cleaningCostsMonthly = cleaningCost * (nightsPerMonth / averageStayLength);
        const netRevenueMonthly = grossRevenueMonthly - platformFeesMonthly - variableCostsMonthly - cleaningCostsMonthly;
        const cashflowMonthly = netRevenueMonthly - totalFixedCostsMonthly;
        const cashflowAnnual = cashflowMonthly * 12;

        return {
            occupancy,
            nightsPerMonth: Math.round(nightsPerMonth),
            nightsPerYear: Math.round(nightsPerYear),
            grossRevenueMonthly,
            netRevenueMonthly,
            cashflowMonthly,
            cashflowAnnual,
        };
    });

    // RevPAR at different occupancy levels
    const revparAt50 = adr * 0.5;
    const revparAt65 = adr * 0.65;
    const revparAt80 = adr * 0.8;

    // Safety margin (how much above breakeven are they at 65% occupancy)
    const safetyMarginNights = (0.65 * 30) - breakevenNightsMonthly;
    const safetyMarginDays = Math.max(0, safetyMarginNights);

    return {
        adr,
        netRevenuePerNight,
        totalFixedCostsMonthly,
        breakevenNightsMonthly,
        breakevenOccupancyMonthly,
        breakevenOccupancyAnnual,
        targetOccupancy,
        targetNightsMonthly,
        scenarios,
        revparAt50,
        revparAt65,
        revparAt80,
        safetyMarginDays,
        averageStayLength,
    };
};

const SaOccupancyCalculatorPage = () => {
    const [form, setForm] = useState<FormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveMetrics(form), [form]);

    const handleInputChange = (name: keyof FormState, value: string) => {
        if (['adr', 'fixedCostsMonthly', 'variableCostPerNight', 'mortgageMonthly',
             'targetMonthlyProfit', 'cleaningFee', 'cleaningCost'].includes(name)) {
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
You provide accurate, data-driven analysis for SA occupancy and profitability.
Focus on realistic occupancy rates for the area and seasonality factors.`,
                    userPrompt: `Analyse this SA occupancy model in ${form.postcode}:

ADR: ${formatCurrency(metrics.adr)}
Breakeven Occupancy: ${metrics.breakevenOccupancyAnnual.toFixed(0)}%
Target Occupancy (for ${formatCurrency(parseNumber(form.targetMonthlyProfit))}/month): ${metrics.targetOccupancy.toFixed(0)}%
Net Revenue Per Night: ${formatCurrency(metrics.netRevenuePerNight)}
Monthly Fixed Costs: ${formatCurrency(metrics.totalFixedCostsMonthly)}

Profit at different occupancy levels:
${metrics.scenarios.map(s => `- ${s.occupancy}%: ${formatCurrency(s.cashflowMonthly)}/month`).join('\n')}

Safety margin at 65% occupancy: ${metrics.safetyMarginDays.toFixed(0)} nights above breakeven

Please assess:
1. Is ${metrics.breakevenOccupancyAnnual.toFixed(0)}% breakeven achievable in ${form.postcode}?
2. What occupancy is realistic for this area?
3. Seasonality considerations
4. Recommendations for improving occupancy

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "local SA market occupancy context"
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

    const getBreakevenStatus = () => {
        if (metrics.breakevenOccupancyAnnual < 40) return { label: 'Very Achievable', tone: 'success' as const };
        if (metrics.breakevenOccupancyAnnual < 50) return { label: 'Achievable', tone: 'success' as const };
        if (metrics.breakevenOccupancyAnnual < 60) return { label: 'Moderate', tone: 'warning' as const };
        return { label: 'Challenging', tone: 'warning' as const };
    };

    return (
        <CalculatorPageLayout
            title="SA Occupancy Calculator"
            description="Model occupancy rates and breakeven analysis for serviced accommodation. See how different occupancy levels affect your monthly cashflow."
            category="Serviced Accommodation"
            categorySlug="sa"
            categoryColor="#F97316"
            badges={[{ label: 'Live Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Revenue & costs' description='Enter your SA financials'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='p-4 rounded-xl bg-pink-50 border border-pink-200'>
                                    <h4 className='font-medium text-pink-900 text-sm mb-3'>Revenue</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Average Daily Rate (ADR)'
                                            name='adr'
                                            value={form.adr}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Net after discounts'
                                            onChange={(e) => handleInputChange('adr', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Avg stay length'
                                            name='averageStayLength'
                                            type='number'
                                            step='0.1'
                                            value={form.averageStayLength}
                                            unit='nights'
                                            helper='Typical: 2-3 nights'
                                            onChange={(e) => handleInputChange('averageStayLength', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Cleaning fee charged'
                                            name='cleaningFee'
                                            value={form.cleaningFee}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Per booking'
                                            onChange={(e) => handleInputChange('cleaningFee', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Platform fee'
                                            name='platformFeePercent'
                                            type='number'
                                            value={form.platformFeePercent}
                                            unit='%'
                                            helper='Airbnb/Booking etc.'
                                            onChange={(e) => handleInputChange('platformFeePercent', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                    <h4 className='font-medium text-slate-900 text-sm mb-3'>Costs</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Monthly fixed costs'
                                            name='fixedCostsMonthly'
                                            value={form.fixedCostsMonthly}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Utilities, insurance, rates'
                                            onChange={(e) => handleInputChange('fixedCostsMonthly', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Monthly mortgage'
                                            name='mortgageMonthly'
                                            value={form.mortgageMonthly}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('mortgageMonthly', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Variable cost per night'
                                            name='variableCostPerNight'
                                            value={form.variableCostPerNight}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Laundry, consumables'
                                            onChange={(e) => handleInputChange('variableCostPerNight', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Cleaning cost'
                                            name='cleaningCost'
                                            value={form.cleaningCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Your actual cost'
                                            onChange={(e) => handleInputChange('cleaningCost', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <FloatingField
                                    label='Target monthly profit'
                                    name='targetMonthlyProfit'
                                    value={form.targetMonthlyProfit}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='What you want to make'
                                    onChange={(e) => handleInputChange('targetMonthlyProfit', e.target.value)}
                                />

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI market analysis'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Breakeven
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
                            calculatorType="SA Occupancy Calculator"
                            calculatorSlug="sa-occupancy-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Occupancy analysis' description='Breakeven and profit targets'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Breakeven Occupancy'
                                    value={`${metrics.breakevenOccupancyAnnual.toFixed(0)}%`}
                                    helper={getBreakevenStatus().label}
                                />
                                <DealMetric
                                    label='Target Occupancy'
                                    value={`${metrics.targetOccupancy.toFixed(0)}%`}
                                    helper={`For ${formatCurrency(parseNumber(form.targetMonthlyProfit))}/mo profit`}
                                />
                                <DealMetric
                                    label='Breakeven Nights'
                                    value={`${metrics.breakevenNightsMonthly.toFixed(0)}/mo`}
                                    helper='To cover all costs'
                                />
                                <DealMetric
                                    label='Net Per Night'
                                    value={formatCurrency(metrics.netRevenuePerNight)}
                                    helper='After variable costs'
                                />
                            </BentoGrid>

                            {/* Breakeven Visual */}
                            <div className='mt-6'>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm text-slate-600'>Breakeven threshold</span>
                                    <span className='text-sm font-medium'>{metrics.breakevenOccupancyAnnual.toFixed(0)}%</span>
                                </div>
                                <div className='h-4 bg-slate-100 rounded-full overflow-hidden'>
                                    <div
                                        className={`h-full transition-all ${
                                            metrics.breakevenOccupancyAnnual < 50 ? 'bg-emerald-500' :
                                            metrics.breakevenOccupancyAnnual < 60 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(100, metrics.breakevenOccupancyAnnual)}%` }}
                                    />
                                </div>
                                <div className='flex justify-between text-xs text-slate-400 mt-1'>
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Scenario Table */}
                            <div className='mt-6'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <BarChart3 className='size-4' />
                                    Profit at Different Occupancy Levels
                                </h4>
                                <div className='overflow-hidden rounded-xl border border-slate-200'>
                                    <table className='w-full text-sm'>
                                        <thead>
                                            <tr className='bg-slate-50'>
                                                <th className='px-3 py-2 text-left font-medium text-slate-600'>Occupancy</th>
                                                <th className='px-3 py-2 text-right font-medium text-slate-600'>Nights/mo</th>
                                                <th className='px-3 py-2 text-right font-medium text-slate-600'>Cashflow/mo</th>
                                                <th className='px-3 py-2 text-right font-medium text-slate-600'>Annual</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100'>
                                            {metrics.scenarios.map((scenario) => (
                                                <tr
                                                    key={scenario.occupancy}
                                                    className={scenario.occupancy === 60 ? 'bg-pink-50' : ''}
                                                >
                                                    <td className='px-3 py-2 font-medium'>{scenario.occupancy}%</td>
                                                    <td className='px-3 py-2 text-right'>{scenario.nightsPerMonth}</td>
                                                    <td className={`px-3 py-2 text-right font-medium ${
                                                        scenario.cashflowMonthly >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                        {formatCurrency(scenario.cashflowMonthly)}
                                                    </td>
                                                    <td className={`px-3 py-2 text-right ${
                                                        scenario.cashflowAnnual >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                    }`}>
                                                        {formatCurrency(scenario.cashflowAnnual)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* RevPAR */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-3'>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-3 text-center'>
                                        <p className='text-xs text-slate-500'>RevPAR @ 50%</p>
                                        <p className='text-lg font-bold text-slate-900'>{formatCurrency(metrics.revparAt50)}</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-pink-200 bg-pink-50'>
                                    <CardContent className='p-3 text-center'>
                                        <p className='text-xs text-pink-600'>RevPAR @ 65%</p>
                                        <p className='text-lg font-bold text-pink-700'>{formatCurrency(metrics.revparAt65)}</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-3 text-center'>
                                        <p className='text-xs text-slate-500'>RevPAR @ 80%</p>
                                        <p className='text-lg font-bold text-slate-900'>{formatCurrency(metrics.revparAt80)}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Safety Margin */}
                            <div className='mt-6'>
                                <Card className={`border-2 ${
                                    metrics.safetyMarginDays > 5 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                                }`}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Target className={`size-8 ${
                                                metrics.safetyMarginDays > 5 ? 'text-emerald-600' : 'text-amber-600'
                                            }`} />
                                            <div>
                                                <p className='text-sm text-slate-600'>Safety Margin @ 65% Occupancy</p>
                                                <p className={`text-xl font-bold ${
                                                    metrics.safetyMarginDays > 5 ? 'text-emerald-700' : 'text-amber-700'
                                                }`}>
                                                    {metrics.safetyMarginDays.toFixed(0)} nights above breakeven
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* Info Box */}
                        <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                            <div className='flex items-start gap-3'>
                                <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                <div className='space-y-2'>
                                    <p className='font-medium text-blue-900 text-sm'>UK SA Occupancy Benchmarks</p>
                                    <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                                        <li>Tourist hotspots (Cornwall, Lake District): 60-75% annual</li>
                                        <li>City centres (Manchester, Bristol): 55-70% annual</li>
                                        <li>Contractor accommodation: 70-85% annual</li>
                                        <li>Seasonal variation: Winter can drop 20-30%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='SA occupancy model'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Occupancy Analysis</span>
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

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="SA Occupancy Calculator"
                    calculatorSlug="sa-occupancy-calculator"
                    description="The SA Occupancy Calculator helps UK serviced accommodation operators model occupancy rates and understand breakeven thresholds. Calculate the minimum occupancy needed to cover costs, project cashflow at different booking levels, and understand your safety margin. Essential for pricing strategy, market assessment, and stress-testing your SA business model."
                    howItWorks={`The SA Occupancy Calculator works by:

1. Revenue Modeling - Enter your Average Daily Rate (ADR), platform fees (Airbnb/Booking.com), and cleaning fees to calculate net revenue per night
2. Cost Structure - Split costs into fixed (utilities, insurance, mortgage) and variable (cleaning, consumables) for accurate breakeven analysis
3. Breakeven Calculation - Determine the exact occupancy percentage needed to cover all operating costs and mortgage payments
4. Scenario Modeling - View cashflow projections at 40%, 50%, 60%, 70%, and 80% occupancy to understand profit potential
5. RevPAR Analysis - Calculate Revenue Per Available Room at different occupancy levels to benchmark against market

The calculator accounts for the unique cost structure of SA properties, including per-booking cleaning costs, platform commission on gross revenue, and the importance of average stay length in spreading fixed costs.`}
                    whenToUse="Use this calculator when setting initial ADR and assessing market viability, comparing different properties' breakeven requirements, stress-testing against seasonal downturns, planning budget for low-season sustainability, and optimizing pricing to maximize profit above breakeven. Critical for understanding the relationship between ADR, occupancy, and profitability."
                    keyFeatures={[
                        "Breakeven occupancy calculation accounting for all costs",
                        "Profit scenarios at 40%, 50%, 60%, 70%, 80% occupancy",
                        "RevPAR analysis at different occupancy levels",
                        "Safety margin calculation showing buffer above breakeven",
                    ]}
                    faqs={[
                        {
                            question: "What's a realistic occupancy rate for serviced accommodation?",
                            answer: "UK SA occupancy varies significantly by location and type. City centres (Manchester, Bristol) achieve 55-70% annual average, tourist hotspots (Cornwall, Lake District) reach 60-75% but with high seasonality, and contractor accommodation can hit 70-85% year-round. Urban Airbnbs typically see 50-65%, while professional SA with multi-OTA strategy achieves higher. Always factor in seasonal variation - winter can drop 20-30% below summer peaks."
                        },
                        {
                            question: "What breakeven occupancy should I aim for?",
                            answer: "Target breakeven occupancy below 50% for sustainable operation. Under 40% is excellent, giving strong margin for market fluctuations. 40-50% is acceptable with solid cash reserves. Above 50% breakeven is risky, leaving little room for seasonal dips, maintenance periods, or market softening. Your breakeven should be significantly below your realistic occupancy projection."
                        },
                        {
                            question: "How do I calculate my actual net revenue per night?",
                            answer: "Net revenue per night = ADR after discounts - platform fees (15-20% of ADR) - management fees (if applicable) - variable costs per night (laundry, consumables) + cleaning profit spread across average stay. For example: £120 ADR - £18 platform fee (15%) - £15 variable costs + £6 cleaning profit (£15 profit on 2.5-night stay) = £93 net per night."
                        },
                        {
                            question: "What's RevPAR and why does it matter for SA?",
                            answer: "RevPAR (Revenue Per Available Room) = ADR x Occupancy. It measures revenue efficiency across all days, not just booked nights. A £150 ADR at 60% occupancy = £90 RevPAR. This is more meaningful than ADR alone for comparing properties or tracking performance. You can increase RevPAR by raising ADR (premium strategy) or increasing occupancy (volume strategy) - most successful SAs optimize both."
                        },
                        {
                            question: "How much safety margin should I have above breakeven?",
                            answer: "Aim for at least 5-10 nights per month above breakeven at typical occupancy. This safety margin cushions against cancellations, low seasons, unexpected maintenance, or market changes. If you project 65% occupancy (19.5 nights) with 45% breakeven (13.5 nights), you have 6 nights buffer - acceptable but not generous. More than 10 nights margin provides comfortable security for sustainable operation."
                        },
                    ]}
                    relatedTerms={[
                        "SA occupancy rate",
                        "Breakeven occupancy",
                        "RevPAR calculation",
                        "Average Daily Rate ADR",
                        "Serviced accommodation bookings",
                        "Airbnb occupancy",
                        "Holiday let occupancy",
                        "OTA platform fees",
                        "SA cashflow modeling",
                        "Seasonal occupancy variation",
                    ]}
                    categoryColor="#F97316"
                />
        </CalculatorPageLayout>
    );
};

export default SaOccupancyCalculatorPage;
