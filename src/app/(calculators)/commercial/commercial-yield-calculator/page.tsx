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
import {
    Calculator,
    Building,
    TrendingUp,
    PoundSterling,
    Info,
    ArrowRight,
} from 'lucide-react';

type CommercialYieldFormState = {
    purchasePrice: string;
    annualRent: string;
    annualRunningCosts: string;
    voidPeriodMonths: string;
    leaseYearsRemaining: string;
    nextRentReview: string;
    targetYield: string;
};

const initialForm: CommercialYieldFormState = {
    purchasePrice: '1,500,000',
    annualRent: '100,000',
    annualRunningCosts: '5,000',
    voidPeriodMonths: '3',
    leaseYearsRemaining: '10',
    nextRentReview: '3',
    targetYield: '7',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveCommercialMetrics = (form: CommercialYieldFormState) => {
    const purchasePrice = parseNumber(form.purchasePrice);
    const annualRent = parseNumber(form.annualRent);
    const runningCosts = parseNumber(form.annualRunningCosts);
    const voidMonths = parseNumber(form.voidPeriodMonths);
    const leaseYears = parseNumber(form.leaseYearsRemaining);
    const targetYield = parseNumber(form.targetYield) / 100;

    // Gross initial yield (NIY)
    const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;

    // Net initial yield (after running costs)
    const netRent = annualRent - runningCosts;
    const netYield = purchasePrice > 0 ? (netRent / purchasePrice) * 100 : 0;

    // Equivalent yield (accounting for voids in lease cycle)
    const effectiveRent = annualRent * ((leaseYears * 12 - voidMonths) / (leaseYears * 12));
    const equivalentYield = purchasePrice > 0 ? (effectiveRent / purchasePrice) * 100 : 0;

    // Cap rate (same as net yield in UK terms)
    const capRate = netYield;

    // Years purchase (multiple of rent)
    const yearsPurchase = annualRent > 0 ? purchasePrice / annualRent : 0;

    // Value at target yield
    const valueAtTargetYield = targetYield > 0 ? annualRent / targetYield : 0;
    const valueDifference = valueAtTargetYield - purchasePrice;

    // WAULT impact (Weighted Average Unexpired Lease Term)
    const waultFactor = Math.min(1, leaseYears / 15); // Properties with longer leases are worth more
    const adjustedValue = purchasePrice * (1 + (waultFactor - 0.67) * 0.1);

    // Monthly rent
    const monthlyRent = annualRent / 12;

    // Rent per sq ft (assume £/sqft pricing)
    const pricePerSqFt = purchasePrice > 0 ? purchasePrice / 2000 : 0; // Assume 2000 sqft
    const rentPerSqFt = annualRent / 2000;

    return {
        purchasePrice,
        annualRent,
        monthlyRent,
        netRent,
        grossYield,
        netYield,
        equivalentYield,
        capRate,
        yearsPurchase,
        valueAtTargetYield,
        valueDifference,
        leaseYears,
        waultFactor,
        adjustedValue,
        pricePerSqFt,
        rentPerSqFt,
        targetYield: targetYield * 100,
    };
};

const CommercialYieldCalculatorPage = () => {
    const [form, setForm] = useState<CommercialYieldFormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveCommercialMetrics(form), [form]);

    const handleInputChange = (name: keyof CommercialYieldFormState, value: string) => {
        if (['purchasePrice', 'annualRent', 'annualRunningCosts'].includes(name)) {
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

    const getYieldStatus = () => {
        if (metrics.netYield >= 8) return { label: 'High Yield', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
        if (metrics.netYield >= 6) return { label: 'Good Yield', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
        if (metrics.netYield >= 4) return { label: 'Standard', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
        return { label: 'Low Yield', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
    };

    const yieldStatus = getYieldStatus();

    return (
        <CalculatorPageLayout
            title="Commercial Yield Calculator"
            description="Calculate commercial property yields including NIY, net yield, and cap rate. Assess investment value based on target yields."
            category="Commercial"
            categorySlug="commercial"
            categoryColor="#6366F1"
            badges={[{ label: 'Live Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Property details' description='Enter commercial property figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Purchase price'
                                    name='purchasePrice'
                                    value={form.purchasePrice}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Agreed price or asking price'
                                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                />

                                <FloatingField
                                    label='Annual rent'
                                    name='annualRent'
                                    value={form.annualRent}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Passing rent per annum'
                                    onChange={(e) => handleInputChange('annualRent', e.target.value)}
                                />

                                <FloatingField
                                    label='Annual running costs'
                                    name='annualRunningCosts'
                                    value={form.annualRunningCosts}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Service charge shortfall, insurance, etc.'
                                    onChange={(e) => handleInputChange('annualRunningCosts', e.target.value)}
                                />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Lease remaining'
                                        name='leaseYearsRemaining'
                                        type='number'
                                        value={form.leaseYearsRemaining}
                                        unit='years'
                                        helper='WAULT'
                                        onChange={(e) => handleInputChange('leaseYearsRemaining', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Next rent review'
                                        name='nextRentReview'
                                        type='number'
                                        value={form.nextRentReview}
                                        unit='years'
                                        onChange={(e) => handleInputChange('nextRentReview', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='Void assumption'
                                    name='voidPeriodMonths'
                                    type='number'
                                    value={form.voidPeriodMonths}
                                    unit='months'
                                    helper='Expected void at lease end'
                                    onChange={(e) => handleInputChange('voidPeriodMonths', e.target.value)}
                                />

                                <div className='p-4 rounded-xl bg-indigo-50 border border-indigo-200'>
                                    <FloatingField
                                        label='Target yield'
                                        name='targetYield'
                                        type='number'
                                        step='0.25'
                                        value={form.targetYield}
                                        unit='%'
                                        helper='Your required return'
                                        onChange={(e) => handleInputChange('targetYield', e.target.value)}
                                    />
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Yields
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
                            calculatorType="Commercial Yield Calculator"
                            calculatorSlug="commercial-yield-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Yield analysis' description='Commercial investment metrics'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Gross Yield (NIY)'
                                    value={`${metrics.grossYield.toFixed(2)}%`}
                                    helper='Net Initial Yield'
                                />
                                <DealMetric
                                    label='Net Yield'
                                    value={`${metrics.netYield.toFixed(2)}%`}
                                    helper='After running costs'
                                />
                                <DealMetric
                                    label='Years Purchase'
                                    value={`${metrics.yearsPurchase.toFixed(1)}x`}
                                    helper='Multiple of rent'
                                />
                                <DealMetric
                                    label='Cap Rate'
                                    value={`${metrics.capRate.toFixed(2)}%`}
                                    helper='Capitalization rate'
                                />
                            </BentoGrid>

                            {/* Yield Card */}
                            <div className='mt-6'>
                                <Card className={`border-2 ${yieldStatus.bg}`}>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className='p-3 rounded-full bg-white'>
                                                    <Building className={`size-6 ${yieldStatus.color}`} />
                                                </div>
                                                <div>
                                                    <p className='text-sm text-slate-600'>Net Initial Yield</p>
                                                    <p className={`text-3xl font-bold ${yieldStatus.color}`}>
                                                        {metrics.grossYield.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-slate-600'>Annual Rent</p>
                                                <p className='text-xl font-bold text-slate-900'>
                                                    {formatCurrency(metrics.annualRent)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-4 text-sm text-slate-600'>
                                            {yieldStatus.label} - {metrics.yearsPurchase.toFixed(1)} years purchase
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Target Yield Comparison */}
                            <div className='mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200'>
                                <h4 className='font-semibold text-indigo-900 mb-3 flex items-center gap-2'>
                                    <TrendingUp className='size-4' />
                                    Value at {metrics.targetYield.toFixed(1)}% Yield
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-indigo-700'>Implied value</span>
                                        <span className='font-bold text-indigo-900'>{formatCurrency(metrics.valueAtTargetYield)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-indigo-700'>vs. purchase price</span>
                                        <span className={`font-bold ${metrics.valueDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {metrics.valueDifference >= 0 ? '+' : ''}{formatCurrency(metrics.valueDifference)}
                                        </span>
                                    </div>
                                </div>
                                {metrics.valueDifference > 0 ? (
                                    <p className='mt-3 text-xs text-indigo-700'>
                                        At your target yield, this property is worth more than the asking price - potential upside.
                                    </p>
                                ) : (
                                    <p className='mt-3 text-xs text-indigo-700'>
                                        At your target yield, you'd pay less than asking price. Negotiate or accept lower return.
                                    </p>
                                )}
                            </div>

                            {/* Rent Analysis */}
                            <div className='mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3'>Rent Analysis</h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Annual rent</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualRent)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Quarterly rent</span>
                                        <span className='font-medium'>{formatCurrency(metrics.annualRent / 4)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Monthly rent</span>
                                        <span className='font-medium'>{formatCurrency(metrics.monthlyRent)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Less: Running costs</span>
                                        <span className='font-medium text-red-600'>-{formatCurrency(parseNumber(form.annualRunningCosts))}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2 font-medium'>
                                        <span className='text-slate-900'>Net rent</span>
                                        <span>{formatCurrency(metrics.netRent)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lease Info */}
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Lease Remaining</p>
                                    <p className='text-lg font-bold text-slate-700'>{metrics.leaseYears} years</p>
                                </div>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Equivalent Yield</p>
                                    <p className='text-lg font-bold text-slate-700'>{metrics.equivalentYield.toFixed(2)}%</p>
                                    <p className='text-xs text-slate-400'>Inc. void allowance</p>
                                </div>
                            </div>

                            {/* Yield Guide */}
                            <div className='mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-amber-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-amber-900 text-sm'>Commercial Yield Guide (UK)</p>
                                        <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-amber-700'>
                                            <div>Prime retail: 4-5%</div>
                                            <div>Secondary retail: 6-8%</div>
                                            <div>Prime offices: 4-6%</div>
                                            <div>Secondary offices: 7-9%</div>
                                            <div>Industrial: 4-6%</div>
                                            <div>Leisure: 6-9%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>
                    </div>
                </div>

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="Commercial Yield Calculator"
                    calculatorSlug="commercial-yield-calculator"
                    description="The Commercial Yield Calculator helps UK commercial property investors calculate key yield metrics including NIY (Net Initial Yield), gross yield, equivalent yield, and cap rate. Understand your commercial property returns and compare against target yields to assess investment value and performance."
                    howItWorks={`The Commercial Yield Calculator analyses commercial property investment returns using standard UK valuation metrics:

1. Net Initial Yield (NIY) - The gross rent as a percentage of purchase price, representing the headline yield
2. Net Yield - The rent after deducting running costs (service charges, insurance) as a percentage of purchase price
3. Equivalent Yield - Adjusts for expected voids and lease events to show true yield over the lease term
4. Cap Rate - The capitalisation rate, representing the net operating income as a percentage of value

The calculator also shows Years Purchase (the multiple of rent paid), and calculates the implied value at your target yield. This helps you assess whether a property is fairly priced for your required return.`}
                    whenToUse="Use this calculator when evaluating commercial property investments to understand your investment yields and compare opportunities. It's essential for assessing retail units, offices, industrial units, and other commercial assets. Use it to determine fair value at your target yield, or to analyse existing holdings and assess yield compression or expansion potential."
                    keyFeatures={[
                        "Calculate NIY, net yield, and equivalent yield",
                        "Assess value at target yield levels",
                        "Account for running costs and void periods",
                        "Analyse years purchase and cap rates",
                    ]}
                    faqs={[
                        {
                            question: "What is a good commercial property yield in the UK?",
                            answer: "Commercial yields vary significantly by asset class and location. Prime retail and offices in London typically yield 4-5% NIY, secondary locations 6-8% NIY. Prime industrial yields 4-6% NIY, while secondary industrial and retail parks may yield 6-9% NIY. Higher yields indicate higher perceived risk or shorter lease terms."
                        },
                        {
                            question: "What is the difference between NIY and net yield?",
                            answer: "Net Initial Yield (NIY) is the gross rent divided by the purchase price. Net yield deducts running costs (such as service charge shortfalls, insurance, void allowances) from the rent before calculating the yield. Net yield is always lower than NIY and represents your true return after property operating costs."
                        },
                        {
                            question: "What does yield compression mean in commercial property?",
                            answer: "Yield compression occurs when property values increase faster than rents, causing yields to fall. For example, if a property worth £1m at 7% yield (£70k rent) increases to £1.2m with the same rent, the yield compresses to 5.8%. This typically happens in improving markets where investors accept lower yields due to strong demand and rental growth expectations."
                        },
                        {
                            question: "How do I calculate equivalent yield?",
                            answer: "Equivalent yield accounts for lease events and voids over the lease term. It's calculated by adjusting the rent for expected vacancy periods and averaging over the full lease term. For example, a 10-year lease with 3 months void at re-letting would use 9.75 years of rent across 10 years when calculating equivalent yield."
                        },
                        {
                            question: "What is a good years purchase multiple?",
                            answer: "Years purchase is the reciprocal of yield (purchase price / annual rent). Lower years purchase indicates higher yield. Typical ranges: prime assets 12-20 years purchase (5-8% yield), secondary assets 10-15 years purchase (6.5-10% yield). Shorter lease terms or higher risk assets trade at lower multiples (higher yields)."
                        },
                    ]}
                    relatedTerms={[
                        "Net Initial Yield",
                        "Commercial property yields",
                        "Cap rate UK",
                        "Equivalent yield",
                        "Years purchase",
                        "Yield compression",
                        "Commercial property valuation",
                        "Investment yield analysis",
                        "NIY calculation",
                        "Commercial property returns",
                    ]}
                    categoryColor="#6366F1"
                />
        </CalculatorPageLayout>
    );
};

export default CommercialYieldCalculatorPage;
