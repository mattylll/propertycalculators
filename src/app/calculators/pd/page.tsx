"use client";

import { useMemo, useState, useEffect } from 'react';

import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { CalculatorStepper, ContinueToNextStep } from '@/components/property-kit/calculator-stepper';
import { useDeal } from '@/lib/deal-context';
import { Switch } from '@/registry/new-york-v4/ui/switch';
import { ArrowRight, Building2, Compass, Layers, ShieldAlert } from 'lucide-react';

type PdFormState = {
    address: string;
    localAuthority: string;
    existingUse: string;
    proposedUse: string;
    gia: string;
    storeys: string;
    targetUnits: string;
    marketPsf: string;
    articleFour: boolean;
    heritage: boolean;
};

const initialForm: PdFormState = {
    address: '45-53 Red Lion Street, London WC1',
    localAuthority: 'Camden',
    existingUse: 'E (Commercial)',
    proposedUse: 'C3 (Residential)',
    gia: '820',
    storeys: '4',
    targetUnits: '18',
    marketPsf: '715',
    articleFour: false,
    heritage: false
};

const defaultSummary =
    'Provide the site address, current use class, and your conversion target. The PD calculator will layer Article 4 directions, heritage data, and flood zones to recommend the fastest compliant route.';

const formFields: Array<{
    name: keyof PdFormState;
    label: string;
    helper?: string;
    unit?: string;
    type?: string;
}> = [
        { name: 'address', label: 'Site address', helper: 'We map this to local authority data' },
        { name: 'localAuthority', label: 'Local authority', helper: 'Prefills policy guidance' },
        { name: 'existingUse', label: 'Existing use class' },
        { name: 'proposedUse', label: 'Target use class' },
        { name: 'gia', label: 'Gross internal area', unit: 'sqm', type: 'number', helper: '1 sqm = 10.764 sqft' },
        { name: 'storeys', label: 'Storeys', type: 'number' },
        { name: 'targetUnits', label: 'Target units', type: 'number' },
        { name: 'marketPsf', label: 'Market value', unit: '£/sqft', type: 'number', helper: 'Based on local comparables' }
    ];

type MetricSummary = {
    gdv: number;
    buildCost: number;
    leverage: number;
};

const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
});

const buildSummary = (form: PdFormState, metrics: MetricSummary) => {
    const { address, localAuthority, proposedUse, targetUnits } = form;
    const { gdv, buildCost, leverage } = metrics;

    return `Convert ${address || 'the property'} in ${localAuthority || 'the target borough'} into ${targetUnits || 'multiple'
        } ${proposedUse || 'C3'} units. Article 4 ${form.articleFour ? 'is in place, so we will run the scheme via a full planning submission' : 'does not apply'
        }, and heritage ${form.heritage ? 'needs facade retention, so external works stay minimal' : 'does not restrict the envelope'
        }. Expect GDV of ${currencyFormatter.format(gdv)} with build costs near ${currencyFormatter.format(
            buildCost
        )}. Structure finance at roughly ${leverage}% loan-to-cost with mezzanine ready if equity is tight.`;
};

const deriveMetrics = (form: PdFormState): MetricSummary => {
    const units = Number.parseInt(form.targetUnits || '0', 10);
    const gia = Number.parseFloat(form.gia || '0');
    const marketPsf = Number.parseFloat(form.marketPsf || '0');
    const baseCostPerSqm = form.articleFour ? 1950 : 1780;

    // Calculate GDV using user's market £/sqft
    // Convert sqm to sqft: 1 sqm = 10.764 sqft
    const totalSqft = gia * 10.764;
    const gdv = totalSqft * marketPsf;

    const buildCost = gia * baseCostPerSqm;
    const leverageBase = form.articleFour ? 60 : 68;
    const leverage = Math.min(72, leverageBase + (units > 12 ? 4 : 0) - (form.heritage ? 2 : 0));

    return { gdv, buildCost, leverage };
};

const StepBadge = ({ index, label, active }: { index: number; label: string; active?: boolean }) => (
    <div
        className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium ${active ? 'border-[#00C9A7] bg-[#E6FAF7] text-[#00A389]' : 'border-border bg-card text-muted-foreground'
            }`}>
        <span
            className={`inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold ${active ? 'bg-[#00C9A7] text-white' : 'bg-muted text-muted-foreground'
                }`}>
            {index}
        </span>
        {label}
    </div>
);

const PdCalculatorPage = () => {
    const [form, setForm] = useState<PdFormState>(initialForm);
    const [status, setStatus] = useState<'ready' | 'thinking' | 'streaming'>('ready');
    const [aiCopy, setAiCopy] = useState(defaultSummary);
    const [hasRunAssessment, setHasRunAssessment] = useState(false);
    const { currentDeal, startNewDeal, updatePdData } = useDeal();

    const metrics = useMemo(() => deriveMetrics(form), [form]);

    // Initialize deal if not exists
    useEffect(() => {
        if (!currentDeal && form.address) {
            startNewDeal(form.address, form.localAuthority);
        }
    }, []);

    const handleInputChange = (name: keyof PdFormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value as never }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('thinking');

        // Start deal if not already started
        if (!currentDeal) {
            startNewDeal(form.address, form.localAuthority);
        }

        setTimeout(() => {
            const summary = buildSummary(form, metrics);
            setAiCopy(summary);
            setStatus('streaming');

            // Save PD data to deal context
            updatePdData({
                existingUse: form.existingUse,
                proposedUse: form.proposedUse,
                gia: Number.parseFloat(form.gia),
                storeys: Number.parseInt(form.storeys, 10),
                targetUnits: Number.parseInt(form.targetUnits, 10),
                articleFour: form.articleFour,
                heritage: form.heritage,
                pdRoute: form.articleFour ? 'Full planning – PD impacted by Article 4' : 'Class MA permitted',
                reasoning: summary,
            });

            setHasRunAssessment(true);
            setTimeout(() => setStatus('ready'), 1200);
        }, 400);
    };

    const handleContinue = () => {
        // Data is already saved in handleSubmit
    };

    return (
        <div className='bg-white min-h-screen'>
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-8'>
            <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='info' label='Step 01 · Address & PD' />
                        <StatusPill tone='neutral' label='Streaming AI reasoning' />
                    </div>
                    {currentDeal && (
                        <StatusPill tone='success' label={`Deal: ${currentDeal.address.slice(0, 25)}...`} />
                    )}
                </div>
                <div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>AI Permitted Development Calculator</h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Layer national PD rules, Article 4 directions, heritage overlays, and finance hooks in a
                            single guided flow. The output streams straight into your Deal Profile.
                        </p>
                        <div className='mt-6'>
                            <CalculatorStepper currentStepIndex={1} />
                        </div>
                    </div>
                    <BentoCard
                        variant='secondary'
                        eyebrow='Guidance'
                        title='What to prepare'
                        description='We only need a handful of fields to qualify PD routes and trigger Construction Capital review.'>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li className='flex items-center gap-2'>
                                <Building2 className='size-4 text-primary' /> Confirm the current use class + tenancy.
                            </li>
                            <li className='flex items-center gap-2'>
                                <ShieldAlert className='size-4 text-primary' /> Flag Article 4, conservation, or flood zones.
                            </li>
                            <li className='flex items-center gap-2'>
                                <Layers className='size-4 text-primary' /> Provide gross internal area and intended storeys.
                            </li>
                            <li className='flex items-center gap-2'>
                                <Compass className='size-4 text-primary' /> Share your target units for GDV projections.
                            </li>
                        </ul>
                    </BentoCard>
                </div>
            </section>

            <section className='grid gap-8 lg:grid-cols-2'>
                <BentoCard variant='glass' title='Site inputs' description='These values are stored inside the Deal Profile.'>
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div className='grid gap-4 md:grid-cols-2'>
                            {formFields.slice(0, 4).map((field) => (
                                <FloatingField
                                    key={field.name}
                                    label={field.label}
                                    helperText={field.helper}
                                    name={field.name}
                                    value={form[field.name] as string}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                />
                            ))}
                        </div>
                        <div className='grid gap-4 md:grid-cols-3'>
                            {formFields.slice(4, 7).map((field) => (
                                <FloatingField
                                    key={field.name}
                                    label={field.label}
                                    name={field.name}
                                    unit={field.unit}
                                    type={field.type}
                                    helperText={field.helper}
                                    value={form[field.name] as string}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                />
                            ))}
                        </div>
                        <div className='grid gap-4 md:grid-cols-2'>
                            {formFields.slice(7).map((field) => (
                                <FloatingField
                                    key={field.name}
                                    label={field.label}
                                    name={field.name}
                                    unit={field.unit}
                                    type={field.type}
                                    helperText={field.helper}
                                    value={form[field.name] as string}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                />
                            ))}
                        </div>
                        <div className='flex flex-wrap gap-6 rounded-2xl border border-gray-200 bg-gray-50 p-4'>
                            <label className='flex items-center gap-3 text-sm text-gray-900 font-medium'>
                                <Switch
                                    checked={form.articleFour}
                                    onCheckedChange={(value) => handleInputChange('articleFour', value)}
                                />
                                Article 4 direction applies
                            </label>
                            <label className='flex items-center gap-3 text-sm text-gray-900 font-medium'>
                                <Switch
                                    checked={form.heritage}
                                    onCheckedChange={(value) => handleInputChange('heritage', value)}
                                />
                                Heritage / conservation overlay
                            </label>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <PropertyButton type='submit' variant='primary' icon={<ArrowRight className='size-4' />}>
                                Run AI assessment
                            </PropertyButton>
                            <PropertyButton type='button' variant='ghost' onClick={() => setForm(initialForm)}>
                                Reset to example deal
                            </PropertyButton>
                        </div>
                    </form>
                </BentoCard>

                <div className='flex flex-col gap-6'>
                    <AiOutputCard
                        status={status}
                        response={aiCopy}
                        highlights={[
                            {
                                label: 'PD ROUTE',
                                value: form.articleFour ? 'Full planning – PD impacted by Article 4' : 'Class MA permitted'
                            },
                            {
                                label: 'REVIEW SLA',
                                value: form.articleFour ? '72 hours manual review' : 'Instant + auto-send to finance'
                            }
                        ]}
                    />
                    <BentoGrid className='grid-cols-1 gap-4 sm:grid-cols-3'>
                        <DealMetric
                            label='Gross development value'
                            value={currencyFormatter.format(metrics.gdv)}
                            helper='Based on comps & density'
                        />
                        <DealMetric
                            label='Build cost baseline'
                            value={currencyFormatter.format(metrics.buildCost)}
                            helper='QS baseline incl. contingencies'
                            trend='down'
                            delta={form.articleFour ? '+4.2%' : '-2.1%'}
                        />
                        <DealMetric
                            label='Loan-to-cost'
                            value={`${metrics.leverage}%`}
                            helper='Expected senior lending appetite'
                        />
                    </BentoGrid>
                </div>
            </section>

            {hasRunAssessment && (
                <section className='flex items-center justify-between rounded-2xl border border-[#00C9A7]/30 bg-[#E6FAF7] p-6'>
                    <div>
                        <p className='font-medium text-gray-900'>PD Assessment Complete</p>
                        <p className='text-sm text-gray-600'>
                            Your data has been saved. Continue to estimate GDV based on comparable sales.
                        </p>
                    </div>
                    <ContinueToNextStep nextStep={2} onBeforeContinue={handleContinue} />
                </section>
            )}
        </main>
        </div>
    );
};

export default PdCalculatorPage;
