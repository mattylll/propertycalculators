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
    Home,
    Building2,
    PoundSterling,
    Percent,
    Info,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';

type StampDutyFormState = {
    purchasePrice: string;
    buyerType: 'first-time' | 'home-mover' | 'additional' | 'non-resident' | 'company';
    propertyType: 'residential' | 'non-residential' | 'mixed';
};

const initialForm: StampDutyFormState = {
    purchasePrice: '350,000',
    buyerType: 'additional',
    propertyType: 'residential',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// SDLT Rates effective from October 2024 - these are the CURRENT rates
// Standard residential rates (home movers)
const STANDARD_BANDS = [
    { threshold: 0, rate: 0 },
    { threshold: 250000, rate: 0.05 },
    { threshold: 925000, rate: 0.10 },
    { threshold: 1500000, rate: 0.12 },
];

// First-time buyer rates (up to £625k property)
const FTB_BANDS = [
    { threshold: 0, rate: 0 },
    { threshold: 425000, rate: 0.05 },
    { threshold: 625000, rate: null }, // Falls back to standard if over £625k
];

// Additional property surcharge
const ADDITIONAL_SURCHARGE = 0.05; // 5% from October 2024

// Non-resident surcharge
const NON_RESIDENT_SURCHARGE = 0.02;

// Non-residential / mixed use rates
const NON_RESIDENTIAL_BANDS = [
    { threshold: 0, rate: 0 },
    { threshold: 150000, rate: 0.02 },
    { threshold: 250000, rate: 0.05 },
];

const calculateSDLT = (price: number, bands: { threshold: number; rate: number | null }[], surcharge: number = 0) => {
    let tax = 0;
    let breakdown: { band: string; taxable: number; rate: number; tax: number }[] = [];

    for (let i = 0; i < bands.length; i++) {
        const currentBand = bands[i];
        const nextThreshold = bands[i + 1]?.threshold ?? Infinity;
        const rate = currentBand.rate;

        if (rate === null) {
            // Falls back to standard rates
            return null;
        }

        if (price > currentBand.threshold) {
            const taxableInBand = Math.min(price, nextThreshold) - currentBand.threshold;
            const effectiveRate = rate + surcharge;
            const taxInBand = taxableInBand * effectiveRate;

            if (taxableInBand > 0) {
                breakdown.push({
                    band: `£${formatNumber(currentBand.threshold)} - £${nextThreshold === Infinity ? '+' : formatNumber(nextThreshold)}`,
                    taxable: taxableInBand,
                    rate: effectiveRate * 100,
                    tax: taxInBand,
                });
            }

            tax += taxInBand;
        }
    }

    // Add surcharge as flat amount if applicable
    if (surcharge > 0) {
        const surchargeTax = price * surcharge;
        tax = 0;
        breakdown = [];

        // Recalculate with surcharge applied to each band
        for (let i = 0; i < bands.length; i++) {
            const currentBand = bands[i];
            const nextThreshold = bands[i + 1]?.threshold ?? Infinity;
            const rate = currentBand.rate;

            if (rate === null) return null;

            if (price > currentBand.threshold) {
                const taxableInBand = Math.min(price, nextThreshold) - currentBand.threshold;
                const effectiveRate = rate + surcharge;
                const taxInBand = taxableInBand * effectiveRate;

                if (taxableInBand > 0) {
                    breakdown.push({
                        band: `£${formatNumber(currentBand.threshold)} - £${nextThreshold === Infinity ? '+' : formatNumber(nextThreshold)}`,
                        taxable: taxableInBand,
                        rate: effectiveRate * 100,
                        tax: taxInBand,
                    });
                }

                tax += taxInBand;
            }
        }
    }

    return { total: tax, breakdown };
};

const deriveStampDutyMetrics = (form: StampDutyFormState) => {
    const price = parseNumber(form.purchasePrice);
    const buyerType = form.buyerType;
    const propertyType = form.propertyType;

    let result: { total: number; breakdown: { band: string; taxable: number; rate: number; tax: number }[] } | null = null;
    let surcharge = 0;
    let explanation = '';
    let warnings: string[] = [];

    if (propertyType === 'non-residential' || propertyType === 'mixed') {
        result = calculateSDLT(price, NON_RESIDENTIAL_BANDS);
        explanation = 'Non-residential/mixed use SDLT rates apply';
    } else {
        // Residential property
        switch (buyerType) {
            case 'first-time':
                if (price <= 625000) {
                    result = calculateSDLT(price, FTB_BANDS);
                    explanation = 'First-time buyer relief applies';
                } else {
                    result = calculateSDLT(price, STANDARD_BANDS);
                    explanation = 'Property over £625k - standard rates apply';
                    warnings.push('First-time buyer relief not available for properties over £625,000');
                }
                break;

            case 'home-mover':
                result = calculateSDLT(price, STANDARD_BANDS);
                explanation = 'Standard residential SDLT rates';
                break;

            case 'additional':
                surcharge = ADDITIONAL_SURCHARGE;
                result = calculateSDLT(price, STANDARD_BANDS, surcharge);
                explanation = 'Additional property 5% surcharge applies (from Oct 2024)';
                warnings.push('This is your second+ property - 5% surcharge applies');
                break;

            case 'non-resident':
                surcharge = ADDITIONAL_SURCHARGE + NON_RESIDENT_SURCHARGE;
                result = calculateSDLT(price, STANDARD_BANDS, surcharge);
                explanation = 'Additional property 5% + non-resident 2% surcharges apply';
                warnings.push('Non-UK resident additional 2% surcharge applies');
                break;

            case 'company':
                surcharge = ADDITIONAL_SURCHARGE;
                result = calculateSDLT(price, STANDARD_BANDS, surcharge);
                if (price > 500000) {
                    // 15% flat rate for enveloped dwellings (simplification)
                    warnings.push('For properties over £500k purchased by companies, consider ATED implications');
                }
                explanation = 'Company purchase - 5% surcharge applies';
                break;
        }
    }

    const effectiveRate = result && price > 0 ? (result.total / price) * 100 : 0;

    return {
        price,
        tax: result?.total ?? 0,
        breakdown: result?.breakdown ?? [],
        effectiveRate,
        surcharge: surcharge * 100,
        explanation,
        warnings,
        buyerType,
        propertyType,
    };
};

const StampDutyCalculatorPage = () => {
    const [form, setForm] = useState<StampDutyFormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveStampDutyMetrics(form), [form]);

    const handleInputChange = (name: keyof StampDutyFormState, value: string) => {
        if (name === 'purchasePrice') {
            const numValue = parseNumber(value);
            setForm((prev) => ({ ...prev, [name]: formatNumber(numValue) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value as never }));
        }
    };

    const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasCalculated(true);
    };

    const getBuyerTypeLabel = (type: string) => {
        switch (type) {
            case 'first-time': return 'First-Time Buyer';
            case 'home-mover': return 'Home Mover';
            case 'additional': return 'Additional Property';
            case 'non-resident': return 'Non-UK Resident';
            case 'company': return 'Company Purchase';
            default: return type;
        }
    };

    return (
        <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                {/* Header */}
                <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='success' label='SDLT Calculator' />
                        <StatusPill tone='warning' label='Updated Oct 2024' />
                    </div>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                            Stamp Duty Calculator
                        </h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Calculate Stamp Duty Land Tax (SDLT) for England and Northern Ireland property purchases.
                            Includes the 5% additional property surcharge effective from October 2024.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter your purchase details'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Purchase price'
                                    name='purchasePrice'
                                    value={form.purchasePrice}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='The agreed purchase price'
                                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                />

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Buyer Type</label>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {[
                                            { value: 'first-time', label: 'First-Time Buyer', icon: Home },
                                            { value: 'home-mover', label: 'Home Mover', icon: Home },
                                            { value: 'additional', label: 'Additional Property', icon: Building2 },
                                            { value: 'non-resident', label: 'Non-UK Resident', icon: Building2 },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type='button'
                                                onClick={() => handleInputChange('buyerType', option.value)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                                    form.buyerType === option.value
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <option.icon className='size-4' />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => handleInputChange('buyerType', 'company')}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                            form.buyerType === 'company'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Building2 className='size-4' />
                                        Company Purchase (Ltd)
                                    </button>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Property Type</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {[
                                            { value: 'residential', label: 'Residential' },
                                            { value: 'non-residential', label: 'Commercial' },
                                            { value: 'mixed', label: 'Mixed Use' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type='button'
                                                onClick={() => handleInputChange('propertyType', option.value)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.propertyType === option.value
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate SDLT
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

                        {/* Rate Information */}
                        <div className='p-4 rounded-xl bg-green-50 border border-green-200'>
                            <div className='flex items-start gap-3'>
                                <Info className='size-5 text-green-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='font-medium text-green-900 text-sm'>October 2024 Changes</p>
                                    <ul className='text-xs text-green-700 mt-1 space-y-1'>
                                        <li>• Additional property surcharge increased from 3% to 5%</li>
                                        <li>• First-time buyer relief: 0% up to £425k, 5% to £625k</li>
                                        <li>• Standard rates: 0% up to £250k, then 5%/10%/12%</li>
                                        <li>• Non-resident surcharge remains 2%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='SDLT calculation' description={metrics.explanation}>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Stamp Duty'
                                    value={formatCurrency(metrics.tax)}
                                    helper='Total SDLT payable'
                                />
                                <DealMetric
                                    label='Effective Rate'
                                    value={`${metrics.effectiveRate.toFixed(2)}%`}
                                    helper='Of purchase price'
                                />
                                <DealMetric
                                    label='Purchase Price'
                                    value={formatCurrency(metrics.price)}
                                    helper='Property value'
                                />
                                <DealMetric
                                    label='Total Cost'
                                    value={formatCurrency(metrics.price + metrics.tax)}
                                    helper='Price + SDLT'
                                />
                            </BentoGrid>

                            {/* Main Summary Card */}
                            <div className='mt-6'>
                                <Card className='border-2 border-green-200 bg-green-50'>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center justify-between'>
                                            <div>
                                                <p className='text-sm text-slate-600'>Stamp Duty Land Tax</p>
                                                <p className='text-3xl font-bold text-green-700'>
                                                    {formatCurrency(metrics.tax)}
                                                </p>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-slate-600'>Buyer Type</p>
                                                <p className='font-medium text-slate-900'>
                                                    {getBuyerTypeLabel(metrics.buyerType)}
                                                </p>
                                            </div>
                                        </div>
                                        {metrics.surcharge > 0 && (
                                            <div className='mt-3 pt-3 border-t border-green-200'>
                                                <p className='text-sm text-green-700'>
                                                    Includes {metrics.surcharge}% surcharge on all bands
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Warnings */}
                            {metrics.warnings.length > 0 && (
                                <div className='mt-4 space-y-2'>
                                    {metrics.warnings.map((warning, i) => (
                                        <div key={i} className='p-3 rounded-lg bg-amber-50 border border-amber-200'>
                                            <div className='flex items-start gap-2'>
                                                <AlertTriangle className='size-4 text-amber-600 shrink-0 mt-0.5' />
                                                <p className='text-sm text-amber-700'>{warning}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Band Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <PoundSterling className='size-4' />
                                    Tax Band Breakdown
                                </h4>
                                <div className='space-y-3'>
                                    {metrics.breakdown.map((band, i) => (
                                        <div key={i} className='flex items-center justify-between text-sm'>
                                            <div>
                                                <p className='font-medium text-slate-900'>{band.band}</p>
                                                <p className='text-xs text-slate-500'>
                                                    {formatCurrency(band.taxable)} @ {band.rate.toFixed(0)}%
                                                </p>
                                            </div>
                                            <p className='font-medium text-slate-900'>{formatCurrency(band.tax)}</p>
                                        </div>
                                    ))}
                                    <div className='flex items-center justify-between pt-3 border-t border-slate-200 font-medium'>
                                        <span className='text-slate-900'>Total SDLT</span>
                                        <span className='text-green-600'>{formatCurrency(metrics.tax)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Reference */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Current SDLT Rates</h4>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2'>Standard Rates</p>
                                        <div className='space-y-1 text-xs'>
                                            <div className='flex justify-between'>
                                                <span>Up to £250k</span>
                                                <span className='font-medium'>0%</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>£250k - £925k</span>
                                                <span className='font-medium'>5%</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>£925k - £1.5m</span>
                                                <span className='font-medium'>10%</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Over £1.5m</span>
                                                <span className='font-medium'>12%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2'>Surcharges</p>
                                        <div className='space-y-1 text-xs'>
                                            <div className='flex justify-between'>
                                                <span>Additional property</span>
                                                <span className='font-medium text-amber-600'>+5%</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span>Non-UK resident</span>
                                                <span className='font-medium text-amber-600'>+2%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className='mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200'>
                                <p className='text-xs text-slate-600'>
                                    <span className='font-medium'>Note:</span> This calculator is for guidance only.
                                    SDLT rules are complex and you should verify calculations with HMRC or a solicitor.
                                    Different rates apply in Scotland (LBTT) and Wales (LTT).
                                </p>
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StampDutyCalculatorPage;
