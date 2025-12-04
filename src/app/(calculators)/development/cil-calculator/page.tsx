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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    Building2,
    MapPin,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Info,
    ArrowRight,
    TrendingUp,
    Home,
    FileText,
    PoundSterling,
} from 'lucide-react';

type CilFormState = {
    localAuthority: string;
    developmentType: string;
    chargingZone: string;
    grossFloorArea: string;
    existingFloorArea: string;
    existingUseLawful: string;
    socialHousingRelief: string;
    selfBuildExemption: string;
    indexationYear: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

// Sample CIL rates (these would ideally come from an API)
const cilRates: Record<string, Record<string, number>> = {
    'london-mayoral': {
        'zone-1': 80,
        'zone-2': 60,
        'zone-3': 25,
    },
    'westminster': {
        'residential-prime': 550,
        'residential-core': 400,
        'residential-other': 200,
    },
    'tower-hamlets': {
        'zone-1': 200,
        'zone-2': 120,
        'zone-3': 65,
    },
    'manchester': {
        'city-centre': 50,
        'inner': 30,
        'outer': 10,
    },
    'birmingham': {
        'city-centre': 69,
        'outer': 35,
    },
    'other': {
        'high': 150,
        'medium': 100,
        'low': 50,
    },
};

const localAuthorities = [
    { value: 'london-mayoral', label: 'London (Mayoral CIL only)' },
    { value: 'westminster', label: 'Westminster' },
    { value: 'tower-hamlets', label: 'Tower Hamlets' },
    { value: 'manchester', label: 'Manchester' },
    { value: 'birmingham', label: 'Birmingham' },
    { value: 'other', label: 'Other (enter rate)' },
];

const developmentTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial/Retail' },
    { value: 'office', label: 'Office' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'student', label: 'Student Housing' },
];

const initialForm: CilFormState = {
    localAuthority: 'london-mayoral',
    developmentType: 'residential',
    chargingZone: 'zone-2',
    grossFloorArea: '500',
    existingFloorArea: '0',
    existingUseLawful: 'no',
    socialHousingRelief: '0',
    selfBuildExemption: 'no',
    indexationYear: '2024',
    postcode: '',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// BCIS All-in TPI indices for indexation (sample values)
const bcisIndex: Record<string, number> = {
    '2012': 286,
    '2020': 334,
    '2021': 353,
    '2022': 388,
    '2023': 399,
    '2024': 412,
};

const deriveCilMetrics = (form: CilFormState) => {
    const grossFloorArea = parseNumber(form.grossFloorArea);
    const existingFloorArea = parseNumber(form.existingFloorArea);
    const socialHousingRelief = parseNumber(form.socialHousingRelief) / 100;

    // Get base CIL rate
    const rates = cilRates[form.localAuthority] || cilRates['other'];
    const baseRate = rates[form.chargingZone] || 100;

    // Calculate net additional floor area
    let netFloorArea = grossFloorArea;
    if (form.existingUseLawful === 'yes' && existingFloorArea > 0) {
        netFloorArea = Math.max(0, grossFloorArea - existingFloorArea);
    }

    // Apply social housing relief
    const reliefAmount = netFloorArea * socialHousingRelief;
    const chargeableArea = netFloorArea - reliefAmount;

    // Apply indexation
    const adoptionIndex = bcisIndex['2020'] || 334; // Most charging schedules adopted around 2020
    const currentIndex = bcisIndex[form.indexationYear] || bcisIndex['2024'];
    const indexationMultiplier = currentIndex / adoptionIndex;
    const indexedRate = baseRate * indexationMultiplier;

    // Calculate CIL liability
    let cilLiability = chargeableArea * indexedRate;

    // Self-build exemption (full exemption)
    if (form.selfBuildExemption === 'yes') {
        cilLiability = 0;
    }

    // Calculate per sqm
    const cilPerSqm = grossFloorArea > 0 ? cilLiability / grossFloorArea : 0;

    // Payment schedule (CIL is payable in instalments based on amount)
    let paymentSchedule: { stage: string; percentage: number; amount: number }[] = [];
    if (cilLiability > 0) {
        if (cilLiability < 50000) {
            paymentSchedule = [{ stage: 'On commencement', percentage: 100, amount: cilLiability }];
        } else if (cilLiability < 500000) {
            paymentSchedule = [
                { stage: 'On commencement', percentage: 50, amount: cilLiability * 0.5 },
                { stage: '60 days', percentage: 50, amount: cilLiability * 0.5 },
            ];
        } else {
            paymentSchedule = [
                { stage: 'On commencement', percentage: 25, amount: cilLiability * 0.25 },
                { stage: '60 days', percentage: 25, amount: cilLiability * 0.25 },
                { stage: '120 days', percentage: 25, amount: cilLiability * 0.25 },
                { stage: '180 days', percentage: 25, amount: cilLiability * 0.25 },
            ];
        }
    }

    return {
        grossFloorArea,
        existingFloorArea,
        netFloorArea,
        chargeableArea,
        baseRate,
        indexedRate,
        indexationMultiplier,
        cilLiability,
        cilPerSqm,
        socialHousingRelief: socialHousingRelief * 100,
        selfBuildExemption: form.selfBuildExemption === 'yes',
        paymentSchedule,
    };
};

const CilCalculatorPage = () => {
    const [form, setForm] = useState<CilFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveCilMetrics(form), [form]);

    const handleInputChange = (name: keyof CilFormState, value: string) => {
        if (['grossFloorArea', 'existingFloorArea', 'socialHousingRelief'].includes(name)) {
            const numValue = parseNumber(value);
            setForm((prev) => ({ ...prev, [name]: formatNumber(numValue) }));
        } else if (name === 'postcode') {
            setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }

        // Reset charging zone when local authority changes
        if (name === 'localAuthority') {
            const zones = Object.keys(cilRates[value] || cilRates['other']);
            setForm((prev) => ({ ...prev, [name]: value, chargingZone: zones[0] || 'zone-1' }));
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
                    systemPrompt: `You are an expert UK planning and development analyst specialising in Community Infrastructure Levy (CIL).
You understand CIL regulations, exemptions, and how to minimise liability legally.
You can advise on phasing, relief applications, and payment strategies.`,
                    userPrompt: `Analyse this CIL calculation${form.postcode ? ` for a development in ${form.postcode}` : ''}:

Local Authority: ${localAuthorities.find(la => la.value === form.localAuthority)?.label}
Development Type: ${form.developmentType}
Charging Zone: ${form.chargingZone}
Gross Floor Area: ${formatNumber(metrics.grossFloorArea)} sqm
Net Additional Floor Area: ${formatNumber(metrics.netFloorArea)} sqm
Chargeable Area (after reliefs): ${formatNumber(metrics.chargeableArea)} sqm
Indexed CIL Rate: ${formatCurrency(metrics.indexedRate)}/sqm

Calculated CIL Liability: ${formatCurrency(metrics.cilLiability)}
${metrics.selfBuildExemption ? 'Self-build exemption claimed' : ''}
${metrics.socialHousingRelief > 0 ? `Social housing relief: ${metrics.socialHousingRelief}%` : ''}

Please assess:
1. Is this CIL calculation accurate for the area?
2. Are there any additional reliefs or exemptions that could apply?
3. Strategies to manage CIL liability

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "CIL policy context and trends"
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

    const getChargingZones = () => {
        const rates = cilRates[form.localAuthority] || cilRates['other'];
        return Object.keys(rates).map(zone => ({
            value: zone,
            label: zone.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            rate: rates[zone],
        }));
    };

    return (
        <CalculatorPageLayout
            title="CIL Calculator"
            description="Calculate Community Infrastructure Levy for your development project. Includes indexation, reliefs, and payment schedule."
            category="Development"
            categorySlug="development"
            categoryColor="#8B5CF6"
            badges={[
                { label: 'CIL Calculator', variant: 'success' },
                { label: 'Development Finance', variant: 'neutral' }
            ]}
        >
            <Card className='border-blue-200 bg-blue-50 mb-8'>
                <CardContent className='p-4 flex items-start gap-3'>
                    <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                    <div>
                        <p className='font-medium text-blue-900'>What is CIL?</p>
                        <p className='text-sm text-blue-700 mt-1'>
                            The Community Infrastructure Levy is a charge on new development to fund local infrastructure.
                            It's calculated based on the net additional floor space and the local authority's charging rates.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Development details' description='Enter your scheme information'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='space-y-2'>
                                    <label className='text-xs text-muted-foreground'>Local Authority</label>
                                    <Select
                                        value={form.localAuthority}
                                        onValueChange={(value) => handleInputChange('localAuthority', value)}>
                                        <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {localAuthorities.map((la) => (
                                                <SelectItem key={la.value} value={la.value}>
                                                    {la.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Development Type</label>
                                        <Select
                                            value={form.developmentType}
                                            onValueChange={(value) => handleInputChange('developmentType', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {developmentTypes.map((dt) => (
                                                    <SelectItem key={dt.value} value={dt.value}>
                                                        {dt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Charging Zone</label>
                                        <Select
                                            value={form.chargingZone}
                                            onValueChange={(value) => handleInputChange('chargingZone', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getChargingZones().map((zone) => (
                                                    <SelectItem key={zone.value} value={zone.value}>
                                                        {zone.label} - {formatCurrency(zone.rate)}/sqm
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Gross floor area (GIA)'
                                        name='grossFloorArea'
                                        value={form.grossFloorArea}
                                        unit='sqm'
                                        helper='Total new development'
                                        onChange={(e) => handleInputChange('grossFloorArea', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Existing floor area'
                                        name='existingFloorArea'
                                        value={form.existingFloorArea}
                                        unit='sqm'
                                        helper='Buildings to be demolished'
                                        onChange={(e) => handleInputChange('existingFloorArea', e.target.value)}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-xs text-muted-foreground'>Existing use lawful for 6+ months?</label>
                                    <Select
                                        value={form.existingUseLawful}
                                        onValueChange={(value) => handleInputChange('existingUseLawful', value)}>
                                        <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='yes'>Yes - can deduct existing floor area</SelectItem>
                                            <SelectItem value='no'>No - full floor area charged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='pt-4 border-t'>
                                    <h3 className='text-sm font-semibold text-slate-700 mb-4'>Reliefs & Exemptions</h3>

                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Social housing relief'
                                            name='socialHousingRelief'
                                            type='number'
                                            value={form.socialHousingRelief}
                                            unit='%'
                                            helper='% of affordable units'
                                            onChange={(e) => handleInputChange('socialHousingRelief', e.target.value)}
                                        />
                                        <div className='space-y-2'>
                                            <label className='text-xs text-muted-foreground'>Self-build exemption?</label>
                                            <Select
                                                value={form.selfBuildExemption}
                                                onValueChange={(value) => handleInputChange('selfBuildExemption', value)}>
                                                <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='no'>No</SelectItem>
                                                    <SelectItem value='yes'>Yes (full exemption)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI validation'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate CIL
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
                            calculatorType="CIL Calculator"
                            calculatorSlug="cil-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* CIL Liability */}
                        <Card className={`border-2 ${
                            metrics.selfBuildExemption ? 'border-emerald-200 bg-emerald-50' :
                            metrics.cilLiability > 100000 ? 'border-red-200 bg-red-50' :
                            metrics.cilLiability > 50000 ? 'border-amber-200 bg-amber-50' :
                            'border-emerald-200 bg-emerald-50'
                        }`}>
                            <CardContent className='p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='font-semibold text-lg text-slate-900'>CIL Liability</h3>
                                    {metrics.selfBuildExemption && (
                                        <Badge className='bg-emerald-100 text-emerald-700'>Exempt</Badge>
                                    )}
                                </div>
                                <div className='text-center py-4'>
                                    <p className='text-4xl font-bold text-slate-900'>
                                        {formatCurrency(metrics.cilLiability)}
                                    </p>
                                    <p className='text-sm text-slate-600 mt-2'>
                                        {formatCurrency(metrics.cilPerSqm)}/sqm of gross floor area
                                    </p>
                                </div>
                                {metrics.selfBuildExemption && (
                                    <div className='mt-4 p-3 rounded-lg bg-emerald-100 border border-emerald-200 flex items-start gap-2'>
                                        <CheckCircle2 className='size-5 text-emerald-600 shrink-0 mt-0.5' />
                                        <p className='text-sm text-emerald-800'>
                                            Self-build exemption claimed. You must apply before commencement and
                                            live in the property for 3 years.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Calculation Breakdown */}
                        <BentoCard variant='secondary' title='Calculation breakdown' description='How CIL is calculated'>
                            <div className='space-y-3 text-sm'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-slate-600'>Gross floor area</span>
                                    <span className='font-medium'>{formatNumber(metrics.grossFloorArea)} sqm</span>
                                </div>
                                {metrics.existingFloorArea > 0 && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-slate-600'>Less: Existing floor area</span>
                                        <span className='font-medium'>- {formatNumber(metrics.existingFloorArea)} sqm</span>
                                    </div>
                                )}
                                <div className='flex items-center justify-between'>
                                    <span className='text-slate-600'>Net additional floor area</span>
                                    <span className='font-medium'>{formatNumber(metrics.netFloorArea)} sqm</span>
                                </div>
                                {metrics.socialHousingRelief > 0 && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-slate-600'>Less: Social housing relief ({metrics.socialHousingRelief}%)</span>
                                        <span className='font-medium'>- {formatNumber(metrics.netFloorArea * (metrics.socialHousingRelief / 100))} sqm</span>
                                    </div>
                                )}
                                <div className='border-t pt-3 flex items-center justify-between font-medium'>
                                    <span className='text-slate-900'>Chargeable area</span>
                                    <span className='text-[var(--pc-blue)]'>{formatNumber(metrics.chargeableArea)} sqm</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-slate-600'>Base CIL rate</span>
                                    <span className='font-medium'>{formatCurrency(metrics.baseRate)}/sqm</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-slate-600'>Indexation ({((metrics.indexationMultiplier - 1) * 100).toFixed(1)}%)</span>
                                    <span className='font-medium'>{formatCurrency(metrics.indexedRate)}/sqm</span>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Payment Schedule */}
                        {metrics.paymentSchedule.length > 0 && (
                            <BentoCard variant='secondary' title='Payment schedule' description='When CIL is payable'>
                                <div className='space-y-3'>
                                    {metrics.paymentSchedule.map((payment, i) => (
                                        <div key={i} className='flex items-center justify-between text-sm'>
                                            <div className='flex items-center gap-2'>
                                                <div className={`size-2 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                <span className='text-slate-600'>{payment.stage}</span>
                                            </div>
                                            <span className='font-medium'>{formatCurrency(payment.amount)} ({payment.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                                <div className='mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2'>
                                    <AlertTriangle className='size-4 text-amber-600 shrink-0 mt-0.5' />
                                    <p className='text-xs text-amber-800'>
                                        CIL is payable from commencement of development. Failure to pay incurs surcharges
                                        and can result in a stop notice.
                                    </p>
                                </div>
                            </BentoCard>
                        )}
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='CIL calculation'
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

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="CIL Calculator"
                    calculatorSlug="cil-calculator"
                    description="The CIL Calculator helps UK property developers calculate Community Infrastructure Levy liability for planning applications. Calculate CIL including indexation, reliefs, exemptions, and payment schedules. Essential for development appraisals and cost planning."
                    howItWorks={`The CIL Calculator determines your Community Infrastructure Levy liability:

1. Net Additional Floor Area - Starts with gross internal area (GIA) and deducts existing floor area if the use has been lawful for 6+ months
2. Reliefs & Exemptions - Apply social housing relief (typically 35-50% affordable) and self-build exemptions
3. CIL Rate - Uses the local authority's adopted charging rate for your zone and development type
4. Indexation - Applies BCIS All-in TPI indexation from adoption date to current year (typically adds 10-25% to base rate)
5. Payment Schedule - Calculates instalment schedule based on total liability (£0-50k: 100% on commencement, £50k-500k: 2 instalments, £500k+: 4 instalments)

The calculator provides total CIL liability, CIL per sqm, and detailed payment timeline.`}
                    whenToUse="Use this calculator when preparing development appraisals, evaluating site purchases, or submitting planning applications. CIL is payable on commencement and must be factored into development finance arrangements. Essential for profit on cost calculations and residual land value assessments."
                    keyFeatures={[
                        "Accurate CIL rates for major UK local authorities and charging zones",
                        "BCIS indexation calculator from adoption year to current year",
                        "Social housing relief and self-build exemption calculations",
                        "Payment schedule generator showing instalments and dates",
                    ]}
                    faqs={[
                        {
                            question: "What is CIL and who pays it?",
                            answer: "Community Infrastructure Levy (CIL) is a planning charge on new development to fund local infrastructure like schools, parks, and transport. It's paid by the developer/landowner upon commencement of development. CIL is separate from S106 contributions and applies to most new buildings and extensions. Not all local authorities have adopted CIL - check your council's charging schedule."
                        },
                        {
                            question: "How is the CIL rate determined?",
                            answer: "Each local authority sets CIL rates per square metre (sqm) based on development viability studies. Rates vary by location, use class, and charging zone. For example, Westminster charges £200-550/sqm for residential depending on zone, while some authorities charge £50/sqm or haven't adopted CIL. Rates are indexed annually using BCIS All-in Tender Price Index."
                        },
                        {
                            question: "Can I get existing floor area deducted?",
                            answer: "Yes, if the existing building has been in lawful use for at least 6 months in the 3 years before planning permission, you can deduct that floor area from the CIL calculation. The existing use must be the same as or similar to the proposed use. This can significantly reduce CIL liability for conversions and change of use schemes. Keep evidence of lawful use for at least 6 continuous months."
                        },
                        {
                            question: "What reliefs and exemptions are available?",
                            answer: "Main reliefs include: Social Housing Relief (100% relief for affordable housing provided by registered providers), Self-Build Exemption (100% relief if you build your own home and live in it for 3 years), Charitable Relief (for charitable purposes), and Exceptional Circumstances Relief (discretionary, rarely granted). You must apply BEFORE commencement. Retrospective claims are not accepted."
                        },
                        {
                            question: "What happens if I don't pay CIL on time?",
                            answer: "Late payment attracts serious penalties: 20% surcharge if not paid within 30 days of notice, then 40% surcharge plus 8% annual interest. The local authority can also impose a stop notice preventing further development and can register a local land charge. CIL is recoverable as a civil debt. Always notify the council of commencement date and pay on time."
                        },
                    ]}
                    relatedTerms={[
                        "Community Infrastructure Levy UK",
                        "CIL calculator planning",
                        "CIL rates by local authority",
                        "BCIS indexation CIL",
                        "Social housing relief CIL",
                        "Self-build exemption",
                        "CIL payment schedule",
                        "S106 vs CIL",
                        "Development contributions UK",
                        "CIL liability notice",
                    ]}
                    categoryColor="#8B5CF6"
                />
        </CalculatorPageLayout>
    );
};

export default CilCalculatorPage;
