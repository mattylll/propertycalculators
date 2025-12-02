"use client";

import { useMemo, useState } from 'react';

import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { CalculatorStepper } from '@/components/property-kit/calculator-stepper';
import { formatCurrency, formatCurrencyCompact, formatPercent, formatMonths } from '@/lib/calculators/format';
import { Switch } from '@/registry/new-york-v4/ui/switch';
import { ArrowRight, Banknote, PiggyBank, TrendingUp } from 'lucide-react';

type FinanceFormState = {
    purchasePrice: string;
    buildCost: string;
    gdv: string;
    termMonths: string;
    targetLtc: string;
    requireMezzanine: boolean;
};

const initialForm: FinanceFormState = {
    purchasePrice: '1850000',
    buildCost: '2012000',
    gdv: '6210000',
    termMonths: '18',
    targetLtc: '65',
    requireMezzanine: false
};

const defaultSummary =
    'Input your purchase price, build costs, and GDV. The AI will structure senior debt, mezzanine (if needed), and calculate equity requirements. Results include indicative rates and lender appetite assessment.';

const deriveFinanceMetrics = (form: FinanceFormState) => {
    const purchasePrice = Number.parseFloat(form.purchasePrice || '0');
    const buildCost = Number.parseFloat(form.buildCost || '0');
    const gdv = Number.parseFloat(form.gdv || '0');
    const targetLtc = Number.parseFloat(form.targetLtc || '0') / 100;
    const termMonths = Number.parseInt(form.termMonths || '0', 10);

    const totalCost = purchasePrice + buildCost;
    const seniorDebtAmount = totalCost * targetLtc;
    const seniorLtgdv = (seniorDebtAmount / gdv) * 100;

    let mezzanineAmount = 0;
    let mezzanineRate = 0;
    if (form.requireMezzanine) {
        const additionalLtc = Math.min(0.15, 0.85 - targetLtc);
        mezzanineAmount = totalCost * additionalLtc;
        mezzanineRate = 15 + (additionalLtc > 0.1 ? 3 : 0);
    }

    const totalDebt = seniorDebtAmount + mezzanineAmount;
    const equityRequired = totalCost - totalDebt;
    const totalLtc = (totalDebt / totalCost) * 100;
    const totalLtgdv = (totalDebt / gdv) * 100;

    const profit = gdv - totalCost;
    const profitOnCost = (profit / totalCost) * 100;
    const profitOnGdv = (profit / gdv) * 100;

    const seniorRate = seniorLtgdv > 65 ? 12.5 : seniorLtgdv > 60 ? 11.5 : 10.5;
    const arrangementFee = seniorLtgdv > 65 ? 2.0 : 1.5;

    const lenderAppetite: 'strong' | 'moderate' | 'weak' =
        profitOnCost > 25 && seniorLtgdv < 65 ? 'strong' : profitOnCost > 18 && seniorLtgdv < 70 ? 'moderate' : 'weak';

    return {
        totalCost,
        seniorDebtAmount,
        seniorRate,
        arrangementFee,
        seniorLtgdv,
        mezzanineAmount,
        mezzanineRate,
        equityRequired,
        totalLtc,
        totalLtgdv,
        profit,
        profitOnCost,
        profitOnGdv,
        lenderAppetite,
        termMonths
    };
};

const buildFinanceSummary = (form: FinanceFormState, metrics: ReturnType<typeof deriveFinanceMetrics>) => {
    const { seniorDebtAmount, seniorRate, arrangementFee, mezzanineAmount, mezzanineRate, equityRequired, totalLtc, seniorLtgdv, profitOnCost, lenderAppetite, termMonths } = metrics;
    const targetLtcNum = Number.parseFloat(form.targetLtc);

    let summary = `Recommended structure: Senior debt of ${formatCurrency(seniorDebtAmount)} at ${seniorRate}% with ${arrangementFee}% arrangement fee (${targetLtcNum}% LTC, ${seniorLtgdv.toFixed(1)}% LTGDV). `;

    if (mezzanineAmount > 0) {
        summary += `Mezzanine layer of ${formatCurrency(mezzanineAmount)} at ${mezzanineRate}% to boost total leverage to ${totalLtc.toFixed(1)}% LTC. `;
    }

    summary += `Equity requirement: ${formatCurrency(equityRequired)}. `;
    summary += `Project shows ${profitOnCost.toFixed(1)}% profit on cost over ${formatMonths(termMonths)}. `;

    if (lenderAppetite === 'strong') {
        summary += `Lender appetite is STRONG — expect competitive terms from multiple lenders. Construction Capital can package this for immediate review.`;
    } else if (lenderAppetite === 'moderate') {
        summary += `Lender appetite is MODERATE — solid deal but may need to shop around. Recommend discussing with Construction Capital for best positioning.`;
    } else {
        summary += `Lender appetite is WEAK — margins are tight. Consider value engineering or increased equity to improve terms.`;
    }

    return summary;
};

const FinanceCalculatorPage = () => {
    const [form, setForm] = useState<FinanceFormState>(initialForm);
    const [status, setStatus] = useState<'ready' | 'thinking' | 'streaming'>('ready');
    const [aiCopy, setAiCopy] = useState(defaultSummary);

    const metrics = useMemo(() => deriveFinanceMetrics(form), [form]);

    const handleInputChange = (name: keyof FinanceFormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value as never }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('thinking');

        setTimeout(() => {
            const summary = buildFinanceSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');
            setTimeout(() => setStatus('ready'), 1200);
        }, 700);
    };

    const appetiteColor =
        metrics.lenderAppetite === 'strong'
            ? 'text-[#22C55E]'
            : metrics.lenderAppetite === 'moderate'
              ? 'text-[#F97316]'
              : 'text-red-500';

    return (
        <div className='bg-white min-h-screen'>
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
            <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <div className='flex flex-wrap items-center gap-3'>
                    <StatusPill tone='info' label='Step 04 · Finance Structure' />
                    <StatusPill tone='neutral' label='Construction Capital engine' />
                </div>
                <div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>AI Finance Calculator</h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Structure your development finance with senior debt, mezzanine options, and equity analysis.
                            The AI assesses lender appetite and generates indicative terms for Construction Capital review.
                        </p>
                        <div className='mt-6'>
                            <CalculatorStepper currentStepIndex={4} />
                        </div>
                    </div>
                    <BentoCard
                        variant='micro'
                        title='Finance layers'
                        description='We structure optimal capital stack for your deal.'>
                        <ul className='space-y-2 text-sm text-gray-600'>
                            <li className='flex items-center gap-2'>
                                <Banknote className='size-4 text-[#00C9A7]' /> Senior debt (55-70% LTC)
                            </li>
                            <li className='flex items-center gap-2'>
                                <TrendingUp className='size-4 text-[#00C9A7]' /> Mezzanine (stretch to 80-85%)
                            </li>
                            <li className='flex items-center gap-2'>
                                <PiggyBank className='size-4 text-[#00C9A7]' /> Equity requirement
                            </li>
                        </ul>
                    </BentoCard>
                </div>
            </section>

            <section className='grid gap-8 lg:grid-cols-2'>
                <BentoCard variant='glass' title='Deal economics' description='Core numbers to structure finance.'>
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Purchase price'
                                name='purchasePrice'
                                type='number'
                                value={form.purchasePrice}
                                helperText='Site acquisition cost'
                                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                            />
                            <FloatingField
                                label='Build cost'
                                name='buildCost'
                                type='number'
                                value={form.buildCost}
                                helperText='Total construction budget'
                                onChange={(e) => handleInputChange('buildCost', e.target.value)}
                            />
                        </div>
                        <FloatingField
                            label='Gross development value'
                            name='gdv'
                            type='number'
                            value={form.gdv}
                            helperText='Expected end value'
                            onChange={(e) => handleInputChange('gdv', e.target.value)}
                        />
                        <div className='grid gap-4 md:grid-cols-2'>
                            <FloatingField
                                label='Term'
                                name='termMonths'
                                type='number'
                                unit='months'
                                value={form.termMonths}
                                helperText='Build + sales period'
                                onChange={(e) => handleInputChange('termMonths', e.target.value)}
                            />
                            <FloatingField
                                label='Target LTC'
                                name='targetLtc'
                                type='number'
                                unit='%'
                                value={form.targetLtc}
                                helperText='Senior debt leverage'
                                onChange={(e) => handleInputChange('targetLtc', e.target.value)}
                            />
                        </div>
                        <div className='flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4'>
                            <Switch
                                checked={form.requireMezzanine}
                                onCheckedChange={(value) => handleInputChange('requireMezzanine', value)}
                            />
                            <label className='text-sm text-gray-900 font-medium'>Include mezzanine financing (higher leverage)</label>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <PropertyButton type='submit' variant='primary' icon={<ArrowRight className='size-4' />}>
                                Structure finance
                            </PropertyButton>
                            <PropertyButton type='button' variant='ghost' onClick={() => setForm(initialForm)}>
                                Reset
                            </PropertyButton>
                        </div>
                    </form>
                </BentoCard>

                <div className='flex flex-col gap-6'>
                    <AiOutputCard
                        title='Finance Recommendation'
                        status={status}
                        response={aiCopy}
                        highlights={[
                            { label: 'SENIOR DEBT', value: formatCurrencyCompact(metrics.seniorDebtAmount) },
                            { label: 'EQUITY NEEDED', value: formatCurrencyCompact(metrics.equityRequired) }
                        ]}
                        confidence={0.94}
                    />
                    <BentoCard variant='secondary' title='Capital stack' description='Structured funding breakdown'>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm'>
                                <div>
                                    <p className='font-medium text-gray-900'>Senior debt</p>
                                    <p className='text-xs text-gray-600'>
                                        {metrics.seniorRate}% rate · {metrics.arrangementFee}% arr. fee
                                    </p>
                                </div>
                                <span className='font-semibold text-gray-900'>
                                    {formatCurrency(metrics.seniorDebtAmount)}
                                </span>
                            </div>
                            {metrics.mezzanineAmount > 0 ? (
                                <div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm'>
                                    <div>
                                        <p className='font-medium text-gray-900'>Mezzanine</p>
                                        <p className='text-xs text-gray-600'>{metrics.mezzanineRate}% rate</p>
                                    </div>
                                    <span className='font-semibold text-gray-900'>
                                        {formatCurrency(metrics.mezzanineAmount)}
                                    </span>
                                </div>
                            ) : null}
                            <div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm'>
                                <p className='font-medium text-gray-900'>Equity required</p>
                                <span className='font-semibold text-gray-900'>{formatCurrency(metrics.equityRequired)}</span>
                            </div>
                            <div className='flex items-center justify-between rounded-xl border border-[#00C9A7]/30 bg-[#E6FAF7] px-4 py-3 text-sm'>
                                <p className='font-medium text-gray-900'>Lender appetite</p>
                                <span className={`font-bold uppercase ${appetiteColor}`}>{metrics.lenderAppetite}</span>
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </section>

            <section>
                <BentoGrid className='grid-cols-1 gap-4 sm:grid-cols-4'>
                    <DealMetric
                        label='Total LTC'
                        value={`${metrics.totalLtc.toFixed(1)}%`}
                        helper='Loan to cost ratio'
                    />
                    <DealMetric
                        label='LTGDV'
                        value={`${metrics.totalLtgdv.toFixed(1)}%`}
                        helper='Loan to GDV'
                    />
                    <DealMetric
                        label='Profit on cost'
                        value={`${metrics.profitOnCost.toFixed(1)}%`}
                        helper='Developer margin'
                        trend={metrics.profitOnCost > 20 ? 'up' : 'down'}
                        delta={metrics.profitOnCost > 20 ? 'Healthy' : 'Tight'}
                    />
                    <DealMetric
                        label='Gross profit'
                        value={formatCurrencyCompact(metrics.profit)}
                        helper='Before finance costs'
                    />
                </BentoGrid>
            </section>
        </main>
        </div>
    );
};

export default FinanceCalculatorPage;
