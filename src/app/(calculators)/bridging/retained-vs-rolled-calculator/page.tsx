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
    ArrowLeftRight,
    PoundSterling,
    Percent,
    Calendar,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Banknote,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

type FormState = {
    loanAmount: string;
    propertyValue: string;
    monthlyRate: string;
    termMonths: string;
    arrangementFee: string;
    exitFee: string;
    valuationFee: string;
    legalFees: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'retained' | 'rolled' | 'either';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: FormState = {
    loanAmount: '200,000',
    propertyValue: '300,000',
    monthlyRate: '0.85',
    termMonths: '12',
    arrangementFee: '2',
    exitFee: '1',
    valuationFee: '500',
    legalFees: '2,000',
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

    // Fees
    const arrangementFee = loanAmount * arrangementFeePercent;
    const exitFee = loanAmount * exitFeePercent;
    const otherFees = valuationFee + legalFees;

    // RETAINED INTEREST CALCULATION
    // Interest is deducted upfront from the loan advance
    const retainedMonthlyInterest = loanAmount * monthlyRate;
    const retainedTotalInterest = retainedMonthlyInterest * termMonths;
    const retainedNetAdvance = loanAmount - retainedTotalInterest - arrangementFee;
    const retainedGrossRedemption = loanAmount + exitFee;
    const retainedTotalCost = retainedTotalInterest + arrangementFee + exitFee + otherFees;

    // ROLLED INTEREST CALCULATION
    // Interest compounds monthly and is added to the redemption
    let rolledBalance = loanAmount;
    for (let month = 0; month < termMonths; month++) {
        rolledBalance = rolledBalance * (1 + monthlyRate);
    }
    const rolledTotalInterest = rolledBalance - loanAmount;
    const rolledNetAdvance = loanAmount - arrangementFee;
    const rolledGrossRedemption = rolledBalance + exitFee;
    const rolledTotalCost = rolledTotalInterest + arrangementFee + exitFee + otherFees;

    // Difference analysis
    const dayOneDifference = rolledNetAdvance - retainedNetAdvance;
    const redemptionDifference = rolledGrossRedemption - retainedGrossRedemption;
    const totalCostDifference = rolledTotalCost - retainedTotalCost;

    // Which is better?
    // Retained is better if: you have enough equity and want to minimize total cost
    // Rolled is better if: you need maximum cash day 1 and can afford higher exit cost
    const betterOption = totalCostDifference > 0 ? 'retained' : 'rolled';

    return {
        loanAmount,
        propertyValue,
        ltv,
        termMonths,
        monthlyRate: monthlyRate * 100,
        arrangementFee,
        exitFee,
        otherFees,
        // Retained
        retainedTotalInterest,
        retainedNetAdvance,
        retainedGrossRedemption,
        retainedTotalCost,
        // Rolled
        rolledTotalInterest,
        rolledNetAdvance,
        rolledGrossRedemption,
        rolledTotalCost,
        // Comparison
        dayOneDifference,
        redemptionDifference,
        totalCostDifference,
        betterOption,
    };
};

const RetainedVsRolledCalculatorPage = () => {
    const [form, setForm] = useState<FormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveMetrics(form), [form]);

    const handleInputChange = (name: keyof FormState, value: string) => {
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
You help developers and investors choose between retained and rolled-up interest options.
Focus on cash flow requirements, exit strategy timing, and total cost of finance.`,
                    userPrompt: `Compare retained vs rolled interest for this bridging loan in ${form.postcode}:

Loan amount: ${formatCurrency(metrics.loanAmount)}
Property value: ${formatCurrency(metrics.propertyValue)}
LTV: ${metrics.ltv.toFixed(1)}%
Monthly rate: ${form.monthlyRate}%
Term: ${form.termMonths} months

RETAINED INTEREST:
- Net Day 1: ${formatCurrency(metrics.retainedNetAdvance)}
- Gross Redemption: ${formatCurrency(metrics.retainedGrossRedemption)}
- Total Cost: ${formatCurrency(metrics.retainedTotalCost)}

ROLLED INTEREST:
- Net Day 1: ${formatCurrency(metrics.rolledNetAdvance)}
- Gross Redemption: ${formatCurrency(metrics.rolledGrossRedemption)}
- Total Cost: ${formatCurrency(metrics.rolledTotalCost)}

Day 1 difference: ${formatCurrency(metrics.dayOneDifference)} more with rolled
Total cost difference: ${formatCurrency(Math.abs(metrics.totalCostDifference))} ${metrics.betterOption === 'retained' ? 'saved with retained' : 'extra with rolled'}

Please advise which option is better and why.

Respond in JSON:
{
  "summary": "2-3 sentence recommendation",
  "verdict": "retained" | "rolled" | "either",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "when to choose each option"
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
            case 'retained': return 'bg-emerald-100 text-emerald-700';
            case 'rolled': return 'bg-blue-100 text-blue-700';
            case 'either': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <CalculatorPageLayout
            title="Retained vs Rolled Interest Calculator"
            description="Compare retained (deducted upfront) vs rolled (compounded) interest options for bridging loans. See how each affects your Day 1 cash and exit costs."
            category="Bridging"
            categorySlug="bridging"
            categoryColor="#F59E0B"
            badges={[
                { label: 'Live Calculator', variant: 'success' },
                { label: 'Bridging Finance', variant: 'neutral' }
            ]}
        >
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
                                        helper='Typical: 0.55-1.10% pm'
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

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI recommendation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                {/* Info Box */}
                                <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                    <div className='flex items-start gap-3'>
                                        <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                        <div className='space-y-2'>
                                            <p className='font-medium text-blue-900 text-sm'>Understanding Interest Types</p>
                                            <div className='text-xs text-blue-700 space-y-1'>
                                                <p><strong>Retained:</strong> Interest is deducted from your loan on Day 1. You receive less upfront but pay back less at exit.</p>
                                                <p><strong>Rolled:</strong> Interest compounds monthly and is added to redemption. You receive more Day 1 but pay more at exit.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Compare Options
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
                            calculatorType="Retained vs Rolled Calculator"
                            calculatorSlug="retained-vs-rolled-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Comparison Table */}
                        <BentoCard variant='secondary' title='Side-by-side comparison' description='Retained vs Rolled interest'>
                            <div className='overflow-hidden rounded-xl border border-slate-200'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='bg-slate-50'>
                                            <th className='px-4 py-3 text-left font-medium text-slate-600'></th>
                                            <th className='px-4 py-3 text-right font-semibold text-emerald-700'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <TrendingDown className='size-4' />
                                                    Retained
                                                </div>
                                            </th>
                                            <th className='px-4 py-3 text-right font-semibold text-blue-700'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <TrendingUp className='size-4' />
                                                    Rolled
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        <tr>
                                            <td className='px-4 py-3 text-slate-600'>Gross loan</td>
                                            <td className='px-4 py-3 text-right font-medium'>{formatCurrency(metrics.loanAmount)}</td>
                                            <td className='px-4 py-3 text-right font-medium'>{formatCurrency(metrics.loanAmount)}</td>
                                        </tr>
                                        <tr className='bg-emerald-50/50'>
                                            <td className='px-4 py-3 text-slate-600 font-medium'>Net Day 1 Advance</td>
                                            <td className='px-4 py-3 text-right font-bold text-emerald-700'>{formatCurrency(metrics.retainedNetAdvance)}</td>
                                            <td className='px-4 py-3 text-right font-bold text-blue-700'>{formatCurrency(metrics.rolledNetAdvance)}</td>
                                        </tr>
                                        <tr>
                                            <td className='px-4 py-3 text-slate-600'>Total interest</td>
                                            <td className='px-4 py-3 text-right font-medium'>{formatCurrency(metrics.retainedTotalInterest)}</td>
                                            <td className='px-4 py-3 text-right font-medium'>{formatCurrency(metrics.rolledTotalInterest)}</td>
                                        </tr>
                                        <tr className='bg-red-50/50'>
                                            <td className='px-4 py-3 text-slate-600 font-medium'>Gross Redemption</td>
                                            <td className='px-4 py-3 text-right font-bold text-emerald-700'>{formatCurrency(metrics.retainedGrossRedemption)}</td>
                                            <td className='px-4 py-3 text-right font-bold text-blue-700'>{formatCurrency(metrics.rolledGrossRedemption)}</td>
                                        </tr>
                                        <tr className='bg-slate-50'>
                                            <td className='px-4 py-3 text-slate-900 font-semibold'>Total Cost of Finance</td>
                                            <td className='px-4 py-3 text-right font-bold text-slate-900'>{formatCurrency(metrics.retainedTotalCost)}</td>
                                            <td className='px-4 py-3 text-right font-bold text-slate-900'>{formatCurrency(metrics.rolledTotalCost)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Key Differences */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border-2 border-blue-200 bg-blue-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <Banknote className='size-8 text-blue-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Extra Day 1 with Rolled</p>
                                                <p className='text-xl font-bold text-blue-700'>
                                                    +{formatCurrency(metrics.dayOneDifference)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className='border-2 border-red-200 bg-red-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <ArrowLeftRight className='size-8 text-red-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Higher Exit with Rolled</p>
                                                <p className='text-xl font-bold text-red-700'>
                                                    +{formatCurrency(metrics.redemptionDifference)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recommendation Box */}
                            <div className={`mt-6 p-4 rounded-xl border-2 ${
                                metrics.betterOption === 'retained'
                                    ? 'border-emerald-200 bg-emerald-50'
                                    : 'border-blue-200 bg-blue-50'
                            }`}>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle2 className={`size-6 shrink-0 ${
                                        metrics.betterOption === 'retained' ? 'text-emerald-600' : 'text-blue-600'
                                    }`} />
                                    <div>
                                        <h4 className={`font-semibold ${
                                            metrics.betterOption === 'retained' ? 'text-emerald-900' : 'text-blue-900'
                                        }`}>
                                            {metrics.betterOption === 'retained' ? 'Retained' : 'Rolled'} saves {formatCurrency(Math.abs(metrics.totalCostDifference))}
                                        </h4>
                                        <p className='text-sm text-slate-600 mt-1'>
                                            {metrics.betterOption === 'retained'
                                                ? `Retained interest is cheaper overall, but you receive ${formatCurrency(metrics.dayOneDifference)} less on Day 1. Choose retained if you have sufficient equity for your project.`
                                                : `Rolled interest gives you ${formatCurrency(metrics.dayOneDifference)} more on Day 1, but costs more overall due to compounding. Choose rolled if you need maximum cash upfront.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Key Metrics */}
                        <BentoCard variant='glass' title='Loan details' description='Common to both options'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='LTV'
                                    value={`${metrics.ltv.toFixed(1)}%`}
                                    helper='Loan to value'
                                />
                                <DealMetric
                                    label='Monthly rate'
                                    value={`${metrics.monthlyRate.toFixed(2)}%`}
                                    helper='Interest per month'
                                />
                                <DealMetric
                                    label='Arrangement fee'
                                    value={formatCurrency(metrics.arrangementFee)}
                                    helper='Deducted Day 1'
                                />
                                <DealMetric
                                    label='Exit fee'
                                    value={formatCurrency(metrics.exitFee)}
                                    helper='Paid on redemption'
                                />
                            </BentoGrid>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='retained vs rolled comparison'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-red-500 to-red-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Recommendation</span>
                                        </div>
                                        <Badge className={getVerdictColor(aiAnalysis.verdict)}>
                                            {aiAnalysis.verdict === 'either' ? 'Either Option' :
                                             aiAnalysis.verdict.charAt(0).toUpperCase() + aiAnalysis.verdict.slice(1)}
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
                                        <div className='p-4 rounded-lg bg-slate-50 border border-slate-200'>
                                            <h4 className='font-semibold text-slate-900 mb-2'>When to Choose Each</h4>
                                            <p className='text-sm text-slate-600'>{aiAnalysis.marketContext}</p>
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
                        </CalculatorResultsGate>
                    </div>
                </div>

                <CalculatorSEO
                    calculatorName="Retained vs Rolled Interest Calculator"
                    calculatorSlug="retained-vs-rolled-calculator"
                    description="The Retained vs Rolled Interest Calculator helps UK property investors compare bridging loan interest options. See exactly how retained interest (deducted upfront) compares to rolled interest (compounded monthly) for your Day 1 cash and exit costs."
                    howItWorks={`When taking a bridging loan, you have three interest payment options:

Retained Interest:
- Interest for the full term is calculated upfront
- Deducted from your loan advance on Day 1
- You receive less cash initially but owe less at exit
- No monthly payments during term
- Lower total interest cost (simple interest, not compounded)

Rolled Interest:
- Interest compounds monthly during the term
- Added to your loan balance each month
- You receive maximum cash on Day 1
- No monthly payments during term
- Higher total cost due to compounding effect

Serviced Interest:
- Interest paid monthly during the term
- You receive maximum cash on Day 1
- Monthly payment obligation
- Total interest cost between retained and rolled

The calculator compares retained vs rolled options, showing the difference in Day 1 advance, redemption amount, and total cost. Most investors choose retained if they have sufficient equity, as it saves 10-15% on total interest cost.`}
                    whenToUse="Use this calculator when comparing bridging loan quotes or deciding which interest structure works best for your project. Essential when you need to maximize Day 1 cash (choose rolled) or minimize total finance cost (choose retained). Particularly useful when you're tight on equity and need to see if retained interest leaves you enough to complete your project."
                    keyFeatures={[
                        "Side-by-side retained vs rolled comparison",
                        "Day 1 advance difference calculation",
                        "Redemption cost comparison",
                        "Total cost of finance analysis",
                    ]}
                    faqs={[
                        {
                            question: "When should I choose retained interest?",
                            answer: "Choose retained interest when you have sufficient equity to cover the reduced Day 1 advance and want to minimize total cost. Retained saves 10-15% on interest costs compared to rolled. Best for projects where you're not stretched on cash and want to maximize profit margin."
                        },
                        {
                            question: "When should I choose rolled interest?",
                            answer: "Choose rolled interest when you need maximum cash on Day 1 to complete your purchase and start works. This is common for tight deals where every pound counts upfront. You'll pay more overall, but if it means the difference between completing or not, the extra cost is worthwhile."
                        },
                        {
                            question: "How much more does rolled interest cost?",
                            answer: "Rolled interest typically costs 10-20% more than retained due to monthly compounding. For example: £200k loan at 0.85% pm for 12 months = £20,400 retained vs £21,350 rolled (£950 extra). The difference grows with higher rates and longer terms."
                        },
                        {
                            question: "Can I pay off early with rolled interest?",
                            answer: "Yes, most lenders allow early redemption with rolled interest. You only pay interest on the months actually used. However, some lenders charge minimum interest periods (typically 3 months) or exit fees. Always check redemption terms before committing."
                        },
                        {
                            question: "What if I can't decide between retained and rolled?",
                            answer: "Calculate your Day 1 cash requirement including all costs (purchase, refurb, fees). If retained interest leaves you enough to complete comfortably, choose it to save money. If you'd be cutting it too close, choose rolled for the extra cash cushion. Safety margin is more important than saving on interest."
                        },
                    ]}
                    relatedTerms={[
                        "Retained interest bridging",
                        "Rolled interest UK",
                        "Bridging interest options",
                        "Compounded interest",
                        "Day one advance",
                        "Gross redemption",
                        "Bridging finance costs",
                        "Interest structure",
                        "Serviced vs rolled",
                        "Bridge loan comparison",
                    ]}
                    categoryColor="#F59E0B"
                />
        </CalculatorPageLayout>
    );
};

export default RetainedVsRolledCalculatorPage;
