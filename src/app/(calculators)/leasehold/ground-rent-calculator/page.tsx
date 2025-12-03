"use client";

import { useMemo, useState } from 'react';

import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { AIValidationGate } from '@/components/property-kit/ai-validation-gate';
import { formatCurrency } from '@/lib/calculators/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    TrendingUp,
    AlertTriangle,
    Calendar,
    Coins,
    Sparkles,
    CheckCircle2,
    Info,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';

type GroundRentFormState = {
    currentGroundRent: string;
    escalationType: string;
    escalationRate: string;
    escalationPeriod: string;
    yearsRemaining: string;
    propertyValue: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: GroundRentFormState = {
    currentGroundRent: '300',
    escalationType: 'fixed',
    escalationRate: '0',
    escalationPeriod: '25',
    yearsRemaining: '90',
    propertyValue: '350,000',
    postcode: '',
};

const escalationTypes = [
    { value: 'fixed', label: 'Fixed (no increase)' },
    { value: 'rpi', label: 'RPI linked' },
    { value: 'percentage', label: 'Fixed percentage increase' },
    { value: 'doubling', label: 'Doubling (every X years)' },
    { value: 'market', label: 'Market review' },
];

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveGroundRentMetrics = (form: GroundRentFormState) => {
    const currentRent = parseNumber(form.currentGroundRent);
    const propertyValue = parseNumber(form.propertyValue);
    const yearsRemaining = parseNumber(form.yearsRemaining);
    const escalationPeriod = parseNumber(form.escalationPeriod);
    const escalationRate = parseNumber(form.escalationRate) / 100;

    // Calculate future ground rents based on escalation type
    const projections: { year: number; rent: number }[] = [];
    let totalOver25Years = 0;
    let totalOverLease = 0;

    for (let year = 0; year <= Math.min(yearsRemaining, 99); year++) {
        let rent = currentRent;

        if (form.escalationType === 'fixed') {
            rent = currentRent;
        } else if (form.escalationType === 'rpi') {
            // Assume 3% average RPI
            const periods = Math.floor(year / escalationPeriod);
            rent = currentRent * Math.pow(1.03, periods * escalationPeriod);
        } else if (form.escalationType === 'percentage') {
            const periods = Math.floor(year / escalationPeriod);
            rent = currentRent * Math.pow(1 + escalationRate, periods);
        } else if (form.escalationType === 'doubling') {
            const periods = Math.floor(year / escalationPeriod);
            rent = currentRent * Math.pow(2, periods);
        } else if (form.escalationType === 'market') {
            // Assume 2% average increase per review
            const periods = Math.floor(year / escalationPeriod);
            rent = currentRent * Math.pow(1.02, periods * escalationPeriod);
        }

        projections.push({ year, rent });

        if (year < 25) totalOver25Years += rent;
        if (year < yearsRemaining) totalOverLease += rent;
    }

    // Get rent at key milestones
    const rentIn10Years = projections.find(p => p.year === 10)?.rent || currentRent;
    const rentIn25Years = projections.find(p => p.year === 25)?.rent || currentRent;
    const rentIn50Years = projections.find(p => p.year === 50)?.rent || currentRent;

    // Ground rent as percentage of property value
    const rentAsPercentage = propertyValue > 0 ? (currentRent / propertyValue) * 100 : 0;

    // Capitalised value (NPV of ground rent stream at 5% discount rate)
    let capitalisedValue = 0;
    for (let i = 0; i < Math.min(yearsRemaining, 99); i++) {
        const rent = projections[i]?.rent || currentRent;
        capitalisedValue += rent / Math.pow(1.05, i + 1);
    }

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'onerous' = 'low';
    if (form.escalationType === 'doubling' || rentIn25Years > 500) {
        riskLevel = 'onerous';
    } else if (form.escalationType !== 'fixed' && currentRent > 250) {
        riskLevel = 'high';
    } else if (currentRent > 100 || form.escalationType !== 'fixed') {
        riskLevel = 'medium';
    }

    return {
        currentRent,
        rentIn10Years,
        rentIn25Years,
        rentIn50Years,
        totalOver25Years,
        totalOverLease,
        rentAsPercentage,
        capitalisedValue,
        riskLevel,
        projections: projections.slice(0, 51), // First 50 years for display
        propertyValue,
    };
};

const GroundRentCalculatorPage = () => {
    const [form, setForm] = useState<GroundRentFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveGroundRentMetrics(form), [form]);

    const handleInputChange = (name: keyof GroundRentFormState, value: string) => {
        if (['currentGroundRent', 'propertyValue'].includes(name)) {
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
        setIsValidating(true);

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: `You are an expert UK leasehold property analyst specialising in ground rents.
You understand the Leasehold Reform (Ground Rent) Act 2022 and its implications.
You can identify onerous ground rent terms and advise on risks.`,
                    userPrompt: `Analyse this ground rent situation${form.postcode ? ` for a property in ${form.postcode}` : ''}:

Current ground rent: ${formatCurrency(metrics.currentRent)}/year
Escalation type: ${form.escalationType}
${form.escalationType !== 'fixed' ? `Escalation: ${form.escalationRate}% every ${form.escalationPeriod} years` : ''}
Years remaining on lease: ${form.yearsRemaining}
Property value: ${formatCurrency(metrics.propertyValue)}

Projected rents:
- In 10 years: ${formatCurrency(metrics.rentIn10Years)}/year
- In 25 years: ${formatCurrency(metrics.rentIn25Years)}/year
${parseInt(form.yearsRemaining) >= 50 ? `- In 50 years: ${formatCurrency(metrics.rentIn50Years)}/year` : ''}

Ground rent as % of value: ${metrics.rentAsPercentage.toFixed(3)}%
Risk level assessed: ${metrics.riskLevel}

Please assess:
1. Is this ground rent onerous or problematic?
2. Will it affect mortgage ability?
3. What are the reform implications?

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "ground rent market and reform context"
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

    const getRiskBadge = () => {
        switch (metrics.riskLevel) {
            case 'low': return { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-700' };
            case 'medium': return { label: 'Medium Risk', className: 'bg-amber-100 text-amber-700' };
            case 'high': return { label: 'High Risk', className: 'bg-orange-100 text-orange-700' };
            case 'onerous': return { label: 'Potentially Onerous', className: 'bg-red-100 text-red-700' };
        }
    };

    const getRiskVariant = (): 'success' | 'warning' | 'neutral' => {
        switch (metrics.riskLevel) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'warning';
            case 'onerous': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <CalculatorPageLayout
            title="Ground Rent Calculator"
            description="Calculate ground rent obligations, project future escalations, and assess the impact on your property. Understand if your ground rent is onerous."
            category="Leasehold"
            categorySlug="leasehold"
            categoryColor="#06B6D4"
            badges={[
                { label: getRiskBadge().label, variant: getRiskVariant() },
            ]}
        >

                {/* Reform Notice */}
                <Card className='border-blue-200 bg-blue-50'>
                    <CardContent className='p-4 flex items-start gap-3'>
                        <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                        <div>
                            <p className='font-medium text-blue-900'>Leasehold Reform (Ground Rent) Act 2022</p>
                            <p className='text-sm text-blue-700 mt-1'>
                                Since 30 June 2022, new residential leases must have a peppercorn (zero) ground rent.
                                Existing leases are unaffected but may be reformed in future legislation.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Ground rent terms' description='Enter your lease terms'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Current ground rent'
                                        name='currentGroundRent'
                                        value={form.currentGroundRent}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Annual amount'
                                        onChange={(e) => handleInputChange('currentGroundRent', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Property value'
                                        name='propertyValue'
                                        value={form.propertyValue}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Current market value'
                                        onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='Years remaining'
                                    name='yearsRemaining'
                                    type='number'
                                    value={form.yearsRemaining}
                                    unit='years'
                                    helper='Remaining lease length'
                                    onChange={(e) => handleInputChange('yearsRemaining', e.target.value)}
                                />

                                <div className='space-y-2'>
                                    <label className='text-xs text-muted-foreground'>Escalation type</label>
                                    <Select
                                        value={form.escalationType}
                                        onValueChange={(value) => handleInputChange('escalationType', value)}>
                                        <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {escalationTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {form.escalationType !== 'fixed' && (
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        {form.escalationType === 'percentage' && (
                                            <FloatingField
                                                label='Increase rate'
                                                name='escalationRate'
                                                type='number'
                                                value={form.escalationRate}
                                                unit='%'
                                                helper='Per review period'
                                                onChange={(e) => handleInputChange('escalationRate', e.target.value)}
                                            />
                                        )}
                                        <FloatingField
                                            label='Review period'
                                            name='escalationPeriod'
                                            type='number'
                                            value={form.escalationPeriod}
                                            unit='years'
                                            helper='Years between reviews'
                                            onChange={(e) => handleInputChange('escalationPeriod', e.target.value)}
                                        />
                                    </div>
                                )}

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='Optional, for AI analysis'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Impact
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

                        {/* Projections Table */}
                        {hasCalculated && form.escalationType !== 'fixed' && (
                            <BentoCard variant='secondary' title='Ground rent projections' description='How your rent will change'>
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm'>
                                        <thead>
                                            <tr className='border-b'>
                                                <th className='py-2 text-left font-medium text-slate-600'>Year</th>
                                                <th className='py-2 text-right font-medium text-slate-600'>Annual Rent</th>
                                                <th className='py-2 text-right font-medium text-slate-600'>Increase</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[0, 10, 25, 50].filter(y => y <= parseInt(form.yearsRemaining)).map((year) => {
                                                const rent = metrics.projections.find(p => p.year === year)?.rent || 0;
                                                const increase = ((rent - metrics.currentRent) / metrics.currentRent) * 100;
                                                return (
                                                    <tr key={year} className='border-b border-slate-100'>
                                                        <td className='py-2 text-slate-700'>{year === 0 ? 'Now' : `Year ${year}`}</td>
                                                        <td className='py-2 text-right font-medium'>{formatCurrency(rent)}</td>
                                                        <td className='py-2 text-right'>
                                                            {year === 0 ? '-' : (
                                                                <span className={increase > 100 ? 'text-red-600' : 'text-slate-600'}>
                                                                    +{increase.toFixed(0)}%
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </BentoCard>
                        )}
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        {/* Risk Assessment */}
                        <Card className={`border-2 ${
                            metrics.riskLevel === 'low' ? 'border-emerald-200 bg-emerald-50' :
                            metrics.riskLevel === 'medium' ? 'border-amber-200 bg-amber-50' :
                            metrics.riskLevel === 'high' ? 'border-orange-200 bg-orange-50' :
                            'border-red-200 bg-red-50'
                        }`}>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='font-semibold text-lg text-slate-900'>Risk Assessment</h3>
                                    <Badge className={getRiskBadge().className}>{getRiskBadge().label}</Badge>
                                </div>
                                <div className='space-y-3'>
                                    {metrics.riskLevel === 'onerous' && (
                                        <div className='flex items-start gap-2 text-red-700'>
                                            <AlertCircle className='size-5 shrink-0 mt-0.5' />
                                            <p className='text-sm'>
                                                This ground rent may be considered onerous. Some lenders refuse mortgages on
                                                properties with doubling ground rents or rents exceeding 0.1% of property value.
                                            </p>
                                        </div>
                                    )}
                                    {metrics.riskLevel === 'high' && (
                                        <div className='flex items-start gap-2 text-orange-700'>
                                            <AlertTriangle className='size-5 shrink-0 mt-0.5' />
                                            <p className='text-sm'>
                                                The escalation terms could make this property harder to sell or mortgage in future.
                                                Consider negotiating with the freeholder.
                                            </p>
                                        </div>
                                    )}
                                    {metrics.riskLevel === 'medium' && (
                                        <div className='flex items-start gap-2 text-amber-700'>
                                            <Info className='size-5 shrink-0 mt-0.5' />
                                            <p className='text-sm'>
                                                While not immediately problematic, review the escalation terms carefully before purchase.
                                            </p>
                                        </div>
                                    )}
                                    {metrics.riskLevel === 'low' && (
                                        <div className='flex items-start gap-2 text-emerald-700'>
                                            <CheckCircle2 className='size-5 shrink-0 mt-0.5' />
                                            <p className='text-sm'>
                                                This ground rent appears reasonable and should not cause mortgage or resale issues.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Ground rent analysis' description='Impact assessment'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Current Rent'
                                    value={formatCurrency(metrics.currentRent)}
                                    helper='Per year'
                                />
                                <DealMetric
                                    label='In 25 Years'
                                    value={formatCurrency(metrics.rentIn25Years)}
                                    helper='Projected rent'
                                />
                                <DealMetric
                                    label='Total (25 years)'
                                    value={formatCurrency(metrics.totalOver25Years)}
                                    helper='Cumulative payments'
                                />
                                <DealMetric
                                    label='% of Value'
                                    value={`${metrics.rentAsPercentage.toFixed(3)}%`}
                                    helper='Rent vs property value'
                                />
                            </BentoGrid>

                            {/* Capitalised Value */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm text-slate-600 flex items-center gap-1'>
                                            <Coins className='size-4' />
                                            Capitalised Value (NPV)
                                        </p>
                                        <p className='text-xl font-bold text-slate-900'>{formatCurrency(metrics.capitalisedValue)}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-slate-500'>At 5% discount rate</p>
                                        <p className='text-sm text-slate-600'>Present value of all rent</p>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Lender Thresholds */}
                        <BentoCard variant='secondary' title='Lender considerations' description='Mortgage implications'>
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Ground rent &lt; 0.1% of value</span>
                                    {metrics.rentAsPercentage < 0.1 ? (
                                        <Badge className='bg-emerald-100 text-emerald-700'>Pass</Badge>
                                    ) : (
                                        <Badge className='bg-red-100 text-red-700'>Fail</Badge>
                                    )}
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Ground rent &lt; £250/year</span>
                                    {metrics.currentRent < 250 ? (
                                        <Badge className='bg-emerald-100 text-emerald-700'>Pass</Badge>
                                    ) : (
                                        <Badge className='bg-amber-100 text-amber-700'>Review</Badge>
                                    )}
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>No doubling clause</span>
                                    {form.escalationType !== 'doubling' ? (
                                        <Badge className='bg-emerald-100 text-emerald-700'>Pass</Badge>
                                    ) : (
                                        <Badge className='bg-red-100 text-red-700'>Fail</Badge>
                                    )}
                                </div>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-600'>Rent in 25 years &lt; £500</span>
                                    {metrics.rentIn25Years < 500 ? (
                                        <Badge className='bg-emerald-100 text-emerald-700'>Pass</Badge>
                                    ) : (
                                        <Badge className='bg-red-100 text-red-700'>Fail</Badge>
                                    )}
                                </div>
                            </div>
                        </BentoCard>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='ground rent assessment'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-[var(--pc-blue)] to-blue-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Analysis</span>
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
                                                Reform Context
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
                    </div>
                </div>
        </CalculatorPageLayout>
    );
};

export default GroundRentCalculatorPage;
