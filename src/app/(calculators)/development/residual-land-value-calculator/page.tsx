"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { formatCurrency } from '@/lib/calculators/format';
import { Card, CardContent } from '@/components/ui/card';
import {
    Calculator,
    Map,
    TrendingUp,
    Building2,
    PoundSterling,
    CheckCircle2,
    AlertTriangle,
    Info,
    ArrowDown,
} from 'lucide-react';

type RlvFormState = {
    gdv: string;
    buildCost: string;
    professionalFees: string;
    financeCosts: string;
    salesCosts: string;
    contingency: string;
    otherCosts: string;
    targetProfitPercent: string;
};

const initialForm: RlvFormState = {
    gdv: '2,500,000',
    buildCost: '1,200,000',
    professionalFees: '10',
    financeCosts: '8',
    salesCosts: '3',
    contingency: '5',
    otherCosts: '50,000',
    targetProfitPercent: '20',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveRlvMetrics = (form: RlvFormState) => {
    const gdv = parseNumber(form.gdv);
    const buildCost = parseNumber(form.buildCost);
    const professionalFeesPercent = parseNumber(form.professionalFees) / 100;
    const financeCostsPercent = parseNumber(form.financeCosts) / 100;
    const salesCostsPercent = parseNumber(form.salesCosts) / 100;
    const contingencyPercent = parseNumber(form.contingency) / 100;
    const otherCosts = parseNumber(form.otherCosts);
    const targetProfitPercent = parseNumber(form.targetProfitPercent) / 100;

    // Calculate costs as percentages
    const professionalFees = buildCost * professionalFeesPercent;
    const contingency = buildCost * contingencyPercent;

    // Finance costs on build (averaged over build period)
    const averageBuildExposure = buildCost * 0.5; // Average exposure during build
    const financeCosts = averageBuildExposure * financeCostsPercent * 1.5; // 18 month build assumed

    // Sales costs on GDV
    const salesCosts = gdv * salesCostsPercent;

    // Total non-land costs
    const totalNonLandCosts = buildCost + professionalFees + financeCosts +
                              salesCosts + contingency + otherCosts;

    // Target profit (on total costs including land)
    // Profit = (GDV - Total Costs) and Profit = Target% × Total Costs
    // So: GDV - Total Costs = Target% × Total Costs
    // GDV = Total Costs × (1 + Target%)
    // Total Costs = GDV / (1 + Target%)
    const maxTotalCosts = gdv / (1 + targetProfitPercent);

    // Residual Land Value = Max Total Costs - Non-Land Costs
    const residualLandValue = maxTotalCosts - totalNonLandCosts;

    // Developer profit at this land value
    const targetProfit = gdv - maxTotalCosts;

    // Land as percentage of GDV
    const landToGdvPercent = gdv > 0 ? (residualLandValue / gdv) * 100 : 0;

    // Land as percentage of total costs
    const landToCostsPercent = maxTotalCosts > 0 ? (residualLandValue / maxTotalCosts) * 100 : 0;

    // Check viability
    const isViable = residualLandValue > 0;

    // Sensitivity - what if profit requirement changes?
    const rlvAt15 = (gdv / 1.15) - totalNonLandCosts;
    const rlvAt25 = (gdv / 1.25) - totalNonLandCosts;

    return {
        gdv,
        buildCost,
        professionalFees,
        financeCosts,
        salesCosts,
        contingency,
        otherCosts,
        totalNonLandCosts,
        maxTotalCosts,
        residualLandValue,
        targetProfit,
        targetProfitPercent: targetProfitPercent * 100,
        landToGdvPercent,
        landToCostsPercent,
        isViable,
        rlvAt15,
        rlvAt25,
    };
};

const ResidualLandValueCalculatorPage = () => {
    const [form, setForm] = useState<RlvFormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveRlvMetrics(form), [form]);

    const handleInputChange = (name: keyof RlvFormState, value: string) => {
        if (['gdv', 'buildCost', 'otherCosts'].includes(name)) {
            const numValue = parseNumber(value);
            setForm((prev) => ({ ...prev, [name]: formatNumber(numValue) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
    };

    return (
        <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                {/* Header */}
                <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='success' label='RLV Calculator' />
                        <StatusPill tone='neutral' label='Development' />
                    </div>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                            Residual Land Value Calculator
                        </h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Work backwards from GDV to determine the maximum you can pay for land
                            while achieving your target profit margin.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Development figures' description='Enter GDV and costs'>
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

                                <FloatingField
                                    label='Build cost'
                                    name='buildCost'
                                    value={form.buildCost}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Total construction costs'
                                    onChange={(e) => handleInputChange('buildCost', e.target.value)}
                                />

                                <div className='p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                    <h4 className='font-medium text-slate-900 text-sm mb-3'>Costs as % of Build</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Professional fees'
                                            name='professionalFees'
                                            type='number'
                                            value={form.professionalFees}
                                            unit='%'
                                            helper='Of build cost'
                                            onChange={(e) => handleInputChange('professionalFees', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Finance costs'
                                            name='financeCosts'
                                            type='number'
                                            value={form.financeCosts}
                                            unit='%'
                                            helper='Annual rate'
                                            onChange={(e) => handleInputChange('financeCosts', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Sales costs'
                                            name='salesCosts'
                                            type='number'
                                            value={form.salesCosts}
                                            unit='%'
                                            helper='Of GDV'
                                            onChange={(e) => handleInputChange('salesCosts', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Contingency'
                                            name='contingency'
                                            type='number'
                                            value={form.contingency}
                                            unit='%'
                                            helper='Of build cost'
                                            onChange={(e) => handleInputChange('contingency', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <FloatingField
                                    label='Other costs'
                                    name='otherCosts'
                                    value={form.otherCosts}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='CIL, S106, utilities, etc.'
                                    onChange={(e) => handleInputChange('otherCosts', e.target.value)}
                                />

                                <div className='p-4 rounded-xl bg-emerald-50 border border-emerald-200'>
                                    <FloatingField
                                        label='Target profit on cost'
                                        name='targetProfitPercent'
                                        type='number'
                                        value={form.targetProfitPercent}
                                        unit='%'
                                        helper='Typically 15-25%'
                                        onChange={(e) => handleInputChange('targetProfitPercent', e.target.value)}
                                    />
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate RLV
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
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Residual land value' description='Maximum land price'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Residual Land Value'
                                    value={formatCurrency(Math.max(0, metrics.residualLandValue))}
                                    helper='Max land price'
                                />
                                <DealMetric
                                    label='Target Profit'
                                    value={formatCurrency(metrics.targetProfit)}
                                    helper={`At ${metrics.targetProfitPercent.toFixed(0)}% POC`}
                                />
                                <DealMetric
                                    label='Non-Land Costs'
                                    value={formatCurrency(metrics.totalNonLandCosts)}
                                    helper='All other costs'
                                />
                                <DealMetric
                                    label='Land to GDV'
                                    value={`${metrics.landToGdvPercent.toFixed(1)}%`}
                                    helper='Land as % of GDV'
                                />
                            </BentoGrid>

                            {/* Main Summary Card */}
                            <div className='mt-6'>
                                <Card className={`border-2 ${metrics.isViable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className={`p-3 rounded-full ${metrics.isViable ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                    <Map className={`size-6 ${metrics.isViable ? 'text-emerald-600' : 'text-red-600'}`} />
                                                </div>
                                                <div>
                                                    <p className='text-sm text-slate-600'>Maximum Land Value</p>
                                                    <p className={`text-3xl font-bold ${metrics.isViable ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {metrics.isViable ? formatCurrency(metrics.residualLandValue) : 'Not Viable'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {metrics.isViable ? (
                                            <div className='mt-4 flex items-center gap-2'>
                                                <CheckCircle2 className='size-4 text-emerald-600' />
                                                <span className='text-sm text-emerald-700'>
                                                    Pay up to this amount for land to achieve {metrics.targetProfitPercent.toFixed(0)}% profit on cost
                                                </span>
                                            </div>
                                        ) : (
                                            <div className='mt-4 flex items-center gap-2'>
                                                <AlertTriangle className='size-4 text-red-600' />
                                                <span className='text-sm text-red-700'>
                                                    Costs exceed GDV at target profit - reduce costs or increase GDV
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Waterfall Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <ArrowDown className='size-4' />
                                    RLV Waterfall
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between font-medium'>
                                        <span className='text-emerald-600'>GDV</span>
                                        <span className='text-emerald-600'>{formatCurrency(metrics.gdv)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Target profit ({metrics.targetProfitPercent.toFixed(0)}%)</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.targetProfit)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Build cost</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.buildCost)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Professional fees</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.professionalFees)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Finance costs</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.financeCosts)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Sales costs</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.salesCosts)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Contingency</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.contingency)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Other costs</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.otherCosts)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-bold'>
                                        <span className='text-slate-900'>= Residual Land Value</span>
                                        <span className={metrics.isViable ? 'text-emerald-600' : 'text-red-600'}>
                                            {formatCurrency(metrics.residualLandValue)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sensitivity Analysis */}
                            <div className='mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200'>
                                <h4 className='font-semibold text-amber-900 mb-3 flex items-center gap-2'>
                                    <TrendingUp className='size-4' />
                                    Profit Sensitivity
                                </h4>
                                <div className='grid grid-cols-3 gap-4 text-center'>
                                    <div className='p-2 rounded-lg bg-white'>
                                        <p className='text-xs text-slate-500'>At 15% POC</p>
                                        <p className='font-bold text-amber-700'>
                                            {metrics.rlvAt15 > 0 ? formatCurrency(metrics.rlvAt15) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className='p-2 rounded-lg bg-amber-100 border border-amber-300'>
                                        <p className='text-xs text-slate-500'>At {metrics.targetProfitPercent.toFixed(0)}% POC</p>
                                        <p className='font-bold text-amber-800'>
                                            {metrics.residualLandValue > 0 ? formatCurrency(metrics.residualLandValue) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className='p-2 rounded-lg bg-white'>
                                        <p className='text-xs text-slate-500'>At 25% POC</p>
                                        <p className='font-bold text-amber-700'>
                                            {metrics.rlvAt25 > 0 ? formatCurrency(metrics.rlvAt25) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className='mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-blue-900 text-sm'>About Residual Land Value</p>
                                        <ul className='text-xs text-blue-700 mt-1 space-y-1'>
                                            <li>• RLV is the maximum you can pay for land while achieving target profit</li>
                                            <li>• This is how professional developers value land</li>
                                            <li>• Remember to deduct SDLT on land from this figure</li>
                                            <li>• Land typically represents 25-40% of GDV in viable schemes</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResidualLandValueCalculatorPage;
