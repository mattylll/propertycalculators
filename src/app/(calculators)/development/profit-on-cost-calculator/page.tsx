"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Calculator,
    Percent,
    TrendingUp,
    Building2,
    PoundSterling,
    CheckCircle2,
    AlertTriangle,
    Info,
} from 'lucide-react';

type PocFormState = {
    gdv: string;
    landCost: string;
    buildCost: string;
    professionalFees: string;
    financeCosts: string;
    salesCosts: string;
    contingency: string;
    otherCosts: string;
};

const initialForm: PocFormState = {
    gdv: '2,500,000',
    landCost: '500,000',
    buildCost: '1,200,000',
    professionalFees: '120,000',
    financeCosts: '150,000',
    salesCosts: '50,000',
    contingency: '60,000',
    otherCosts: '20,000',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const derivePocMetrics = (form: PocFormState) => {
    const gdv = parseNumber(form.gdv);
    const landCost = parseNumber(form.landCost);
    const buildCost = parseNumber(form.buildCost);
    const professionalFees = parseNumber(form.professionalFees);
    const financeCosts = parseNumber(form.financeCosts);
    const salesCosts = parseNumber(form.salesCosts);
    const contingency = parseNumber(form.contingency);
    const otherCosts = parseNumber(form.otherCosts);

    // Total costs
    const totalCosts = landCost + buildCost + professionalFees + financeCosts +
                       salesCosts + contingency + otherCosts;

    // Profit
    const grossProfit = gdv - totalCosts;

    // Profit on Cost (POC) - the key metric
    const profitOnCost = totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;

    // Profit on GDV (alternative metric)
    const profitOnGdv = gdv > 0 ? (grossProfit / gdv) * 100 : 0;

    // Return on equity (assuming 30% equity required)
    const equityRequired = totalCosts * 0.30;
    const returnOnEquity = equityRequired > 0 ? (grossProfit / equityRequired) * 100 : 0;

    // Cost breakdown percentages
    const landPercent = totalCosts > 0 ? (landCost / totalCosts) * 100 : 0;
    const buildPercent = totalCosts > 0 ? (buildCost / totalCosts) * 100 : 0;
    const otherPercent = totalCosts > 0 ? ((professionalFees + financeCosts + salesCosts + contingency + otherCosts) / totalCosts) * 100 : 0;

    return {
        gdv,
        totalCosts,
        grossProfit,
        profitOnCost,
        profitOnGdv,
        returnOnEquity,
        equityRequired,
        landCost,
        buildCost,
        professionalFees,
        financeCosts,
        salesCosts,
        contingency,
        otherCosts,
        landPercent,
        buildPercent,
        otherPercent,
    };
};

const ProfitOnCostCalculatorPage = () => {
    const [form, setForm] = useState<PocFormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => derivePocMetrics(form), [form]);

    const handleInputChange = (name: keyof PocFormState, value: string) => {
        const numValue = parseNumber(value);
        setForm((prev) => ({ ...prev, [name]: formatNumber(numValue) }));
    };

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
    };

    const getPocStatus = () => {
        if (metrics.profitOnCost >= 25) return { label: 'Excellent', color: 'success' as const, bg: 'bg-emerald-50 border-emerald-200' };
        if (metrics.profitOnCost >= 20) return { label: 'Good', color: 'info' as const, bg: 'bg-blue-50 border-blue-200' };
        if (metrics.profitOnCost >= 15) return { label: 'Acceptable', color: 'warning' as const, bg: 'bg-amber-50 border-amber-200' };
        return { label: 'Marginal', color: 'danger' as const, bg: 'bg-red-50 border-red-200' };
    };

    const pocStatus = getPocStatus();

    return (
        <CalculatorPageLayout
            title="Profit on Cost Calculator"
            description="Calculate developer profit on cost percentage to assess deal viability. Most lenders require 15-20% POC for development finance."
            category="Development"
            categorySlug="development"
            categoryColor="#8B5CF6"
            badges={[
                { label: 'POC Calculator', variant: 'success' },
                { label: 'Development', variant: 'neutral' }
            ]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Development figures' description='Enter project costs and GDV'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Gross Development Value (GDV)'
                                    name='gdv'
                                    value={form.gdv}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Total sales value of completed development'
                                    onChange={(e) => handleInputChange('gdv', e.target.value)}
                                />

                                <div className='p-4 rounded-xl bg-emerald-50 border border-emerald-200'>
                                    <h4 className='font-medium text-emerald-900 text-sm mb-3'>Core Costs</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Land cost'
                                            name='landCost'
                                            value={form.landCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Inc. SDLT & legals'
                                            onChange={(e) => handleInputChange('landCost', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Build cost'
                                            name='buildCost'
                                            value={form.buildCost}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Construction costs'
                                            onChange={(e) => handleInputChange('buildCost', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                    <h4 className='font-medium text-slate-900 text-sm mb-3'>Other Costs</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Professional fees'
                                            name='professionalFees'
                                            value={form.professionalFees}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Architect, QS, PM, etc.'
                                            onChange={(e) => handleInputChange('professionalFees', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Finance costs'
                                            name='financeCosts'
                                            value={form.financeCosts}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Interest + fees'
                                            onChange={(e) => handleInputChange('financeCosts', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Sales costs'
                                            name='salesCosts'
                                            value={form.salesCosts}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Agent & marketing'
                                            onChange={(e) => handleInputChange('salesCosts', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Contingency'
                                            name='contingency'
                                            value={form.contingency}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Typically 5-10%'
                                            onChange={(e) => handleInputChange('contingency', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='mt-4'>
                                        <FloatingField
                                            label='Other costs'
                                            name='otherCosts'
                                            value={form.otherCosts}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='CIL, S106, utilities, etc.'
                                            onChange={(e) => handleInputChange('otherCosts', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate POC
                                    </PropertyButton>
                                    <PropertyButton type='button' variant='ghost' onClick={() => {
                                        setForm(initialForm);
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
                            calculatorType="Profit on Cost Calculator"
                            calculatorSlug="profit-on-cost-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Profit analysis' description='Key development metrics'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Profit on Cost'
                                    value={`${metrics.profitOnCost.toFixed(1)}%`}
                                    helper={pocStatus.label}
                                />
                                <DealMetric
                                    label='Profit on GDV'
                                    value={`${metrics.profitOnGdv.toFixed(1)}%`}
                                    helper='Margin on sales'
                                />
                                <DealMetric
                                    label='Gross Profit'
                                    value={formatCurrency(metrics.grossProfit)}
                                    helper='GDV minus all costs'
                                />
                                <DealMetric
                                    label='Total Costs'
                                    value={formatCurrency(metrics.totalCosts)}
                                    helper='All project costs'
                                />
                            </BentoGrid>

                            {/* Main Summary Card */}
                            <div className='mt-6'>
                                <Card className={`border-2 ${pocStatus.bg}`}>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className={`p-3 rounded-full ${metrics.profitOnCost >= 20 ? 'bg-emerald-100' : metrics.profitOnCost >= 15 ? 'bg-amber-100' : 'bg-red-100'}`}>
                                                    <Percent className={`size-6 ${metrics.profitOnCost >= 20 ? 'text-emerald-600' : metrics.profitOnCost >= 15 ? 'text-amber-600' : 'text-red-600'}`} />
                                                </div>
                                                <div>
                                                    <p className='text-sm text-slate-600'>Profit on Cost</p>
                                                    <p className={`text-3xl font-bold ${metrics.profitOnCost >= 20 ? 'text-emerald-700' : metrics.profitOnCost >= 15 ? 'text-amber-700' : 'text-red-700'}`}>
                                                        {metrics.profitOnCost.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-slate-600'>Developer Profit</p>
                                                <p className='text-xl font-bold text-slate-900'>
                                                    {formatCurrency(metrics.grossProfit)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='mt-4'>
                                            <div className='flex justify-between text-xs text-slate-500 mb-1'>
                                                <span>0%</span>
                                                <span>15%</span>
                                                <span>20%</span>
                                                <span>25%+</span>
                                            </div>
                                            <Progress
                                                value={Math.min(100, (metrics.profitOnCost / 25) * 100)}
                                                className='h-3'
                                            />
                                        </div>

                                        <div className='mt-4 flex items-center gap-2'>
                                            {metrics.profitOnCost >= 20 ? (
                                                <>
                                                    <CheckCircle2 className='size-4 text-emerald-600' />
                                                    <span className='text-sm text-emerald-700'>Meets lender requirements (20%+)</span>
                                                </>
                                            ) : metrics.profitOnCost >= 15 ? (
                                                <>
                                                    <AlertTriangle className='size-4 text-amber-600' />
                                                    <span className='text-sm text-amber-700'>Marginal - some lenders may accept</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className='size-4 text-red-600' />
                                                    <span className='text-sm text-red-700'>Below typical lender requirements</span>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cost Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Building2 className='size-4' />
                                    Cost Breakdown
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Land cost</span>
                                        <span className='font-medium'>{formatCurrency(metrics.landCost)} ({metrics.landPercent.toFixed(0)}%)</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Build cost</span>
                                        <span className='font-medium'>{formatCurrency(metrics.buildCost)} ({metrics.buildPercent.toFixed(0)}%)</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Professional fees</span>
                                        <span className='font-medium'>{formatCurrency(metrics.professionalFees)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Finance costs</span>
                                        <span className='font-medium'>{formatCurrency(metrics.financeCosts)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Sales costs</span>
                                        <span className='font-medium'>{formatCurrency(metrics.salesCosts)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Contingency</span>
                                        <span className='font-medium'>{formatCurrency(metrics.contingency)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Other costs</span>
                                        <span className='font-medium'>{formatCurrency(metrics.otherCosts)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Total costs</span>
                                        <span>{formatCurrency(metrics.totalCosts)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Return Metrics */}
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Return on Equity</p>
                                    <p className='text-lg font-bold text-indigo-600'>
                                        {metrics.returnOnEquity.toFixed(1)}%
                                    </p>
                                    <p className='text-xs text-slate-400'>Based on 30% equity</p>
                                </div>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Equity Required</p>
                                    <p className='text-lg font-bold text-slate-700'>
                                        {formatCurrency(metrics.equityRequired)}
                                    </p>
                                    <p className='text-xs text-slate-400'>Est. 30% of costs</p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className='mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-blue-900 text-sm'>Lender Requirements</p>
                                        <ul className='text-xs text-blue-700 mt-1 space-y-1'>
                                            <li>• Most lenders require minimum 15-20% profit on cost</li>
                                            <li>• Higher risk projects may need 25%+ POC</li>
                                            <li>• POC is calculated as: (GDV - Total Costs) ÷ Total Costs × 100</li>
                                            <li>• This is the primary metric used by development lenders</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>
                    </div>
                </div>

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="Profit on Cost Calculator"
                    calculatorSlug="profit-on-cost-calculator"
                    description="The Profit on Cost Calculator helps UK property developers assess development viability and lender requirements. Calculate profit on cost (POC), profit on GDV, and return on equity to determine if your scheme meets lender criteria for development finance."
                    howItWorks={`The Profit on Cost Calculator measures developer profit:

1. Gross Development Value (GDV) - Total sales value of completed scheme
2. Total Development Costs - Sum of land, build costs, professional fees, finance costs, sales costs, contingency, and other costs
3. Gross Profit - GDV minus total costs (before tax)
4. Profit on Cost (POC) - (Gross Profit ÷ Total Costs) × 100 - the key metric lenders use
5. Profit on GDV - (Gross Profit ÷ GDV) × 100 - alternative margin measure
6. Return on Equity - (Gross Profit ÷ Equity Required) × 100 - investor return metric

The calculator assesses if POC meets typical lender requirements (15-20% minimum, preferably 20%+).`}
                    whenToUse="Use this calculator during feasibility stage to check if development meets lender profit requirements before approaching lenders. Essential for development appraisals, assessing deal viability, and determining if scheme will secure development finance. Most lenders require 15-20% POC minimum."
                    keyFeatures={[
                        "Profit on Cost calculation - the primary metric lenders assess",
                        "Profit on GDV and margin analysis for developer returns",
                        "Return on equity calculation based on 30% equity assumption",
                        "Visual POC gauge showing lender acceptance thresholds",
                    ]}
                    faqs={[
                        {
                            question: "What is a good profit on cost percentage?",
                            answer: "Most development lenders require minimum 15-20% profit on cost, with 20%+ preferred. Strong schemes achieve 25%+. POC below 15% is typically rejected or requires increased equity. Higher risk schemes (complex builds, untested locations, first-time developers) need higher POC (20-25%) to secure finance. Remember: POC is before tax and doesn't include holding costs or developer time."
                        },
                        {
                            question: "How is profit on cost different from profit on GDV?",
                            answer: "Profit on Cost = (GDV - Costs) ÷ Costs × 100. Profit on GDV = (GDV - Costs) ÷ GDV × 100. Lenders prefer POC as it measures return on capital invested. 20% POC equals 16.7% profit on GDV. POC is unlimited (can exceed 100%), while profit on GDV caps at 100%. Example: £2.5m GDV, £2m costs = 25% POC or 20% on GDV. Always quote POC to lenders, not profit on GDV."
                        },
                        {
                            question: "What costs should I include in total development cost?",
                            answer: "Include everything: 1) Land (inc. SDLT), 2) Build costs (inc. prelims, overheads, profit), 3) Professional fees (architect, engineer, QS, PM, planning - typically 10-15%), 4) Finance costs (interest + arrangement fees), 5) Sales/marketing (agents, legals - 3% GDV), 6) CIL/S106, 7) Contingency (5-10%), 8) Other costs (utilities, enabling works). DO NOT include developer profit in costs - profit is what's left after all costs."
                        },
                        {
                            question: "Why do lenders care about profit on cost?",
                            answer: "POC indicates safety buffer. 20% POC means costs can overrun by 20% or sales can fall by 16.7% before lender loses money. High POC = strong deal, easier approval, better rates. Low POC means tight margins, higher lender risk, harder to secure finance. Lenders stress-test POC by increasing costs 10-15% and reducing GDV 10% - scheme must still show acceptable profit after stress."
                        },
                        {
                            question: "Can I still get finance with 15% profit on cost?",
                            answer: "Possibly, but challenging. 15-20% POC is marginal - some lenders accept for experienced developers on prime locations with pre-sales. You'll need: strong track record, higher equity (30-35%), pre-sold units reducing risk, conservative GDV with evidenced comparables, and tight cost control. Expect higher rates (12-14%) and lower LTC (60-65%). Better to improve scheme viability - reduce land cost, increase GDV, or reduce build costs to achieve 20%+ POC."
                        },
                    ]}
                    relatedTerms={[
                        "Profit on cost calculator",
                        "Development profit margin UK",
                        "POC calculator development",
                        "Development finance requirements",
                        "Lender profit requirements",
                        "Development viability calculator",
                        "Profit on GDV calculator",
                        "Return on equity property",
                        "Development appraisal profit",
                        "Developer margin calculator",
                    ]}
                    categoryColor="#8B5CF6"
                />
        </CalculatorPageLayout>
    );
};

export default ProfitOnCostCalculatorPage;
