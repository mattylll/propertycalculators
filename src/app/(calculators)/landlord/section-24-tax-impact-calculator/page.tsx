"use client";

import { useMemo, useState } from 'react';

import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
import { formatCurrency } from '@/lib/calculators/format';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowRight,
    FileWarning,
    PoundSterling,
    Percent,
    TrendingDown,
    Calculator,
    AlertTriangle,
    Info,
    Building,
    User,
    Briefcase,
} from 'lucide-react';

type Section24FormState = {
    annualRent: string;
    mortgageInterest: string;
    otherExpenses: string;
    otherIncome: string;
    taxBand: '20' | '40' | '45';
    ownershipType: 'personal' | 'ltd';
};

const initialForm: Section24FormState = {
    annualRent: '24,000',
    mortgageInterest: '12,000',
    otherExpenses: '3,000',
    otherIncome: '50,000',
    taxBand: '40',
    ownershipType: 'personal',
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

// UK Tax Bands 2024/25
const TAX_BANDS = {
    personalAllowance: 12570,
    basicRateLimit: 50270,
    higherRateLimit: 125140,
    basicRate: 0.20,
    higherRate: 0.40,
    additionalRate: 0.45,
    corporationTax: 0.25,
    corporationTaxSmall: 0.19,
};

const deriveSection24Metrics = (form: Section24FormState) => {
    const annualRent = parseNumber(form.annualRent);
    const mortgageInterest = parseNumber(form.mortgageInterest);
    const otherExpenses = parseNumber(form.otherExpenses);
    const otherIncome = parseNumber(form.otherIncome);
    const taxRate = parseNumber(form.taxBand) / 100;

    // === PRE-SECTION 24 (Old Rules) ===
    // Mortgage interest was fully deductible
    const oldNetProfit = annualRent - mortgageInterest - otherExpenses;
    const oldTaxableIncome = Math.max(0, oldNetProfit);
    const oldTaxDue = oldTaxableIncome * taxRate;
    const oldNetIncome = oldNetProfit - oldTaxDue;

    // === POST-SECTION 24 (Current Rules) ===
    // Mortgage interest NOT deductible, but 20% tax credit given
    const newNetProfit = annualRent - otherExpenses; // No mortgage deduction
    const newTaxableIncome = Math.max(0, newNetProfit);
    const newTaxDue = newTaxableIncome * taxRate;
    const taxCredit = mortgageInterest * 0.20; // 20% tax credit
    const newActualTax = Math.max(0, newTaxDue - taxCredit);
    const newNetIncome = annualRent - otherExpenses - mortgageInterest - newActualTax;

    // === IMPACT ===
    const additionalTax = newActualTax - oldTaxDue;
    const percentageIncrease = oldTaxDue > 0 ? (additionalTax / oldTaxDue) * 100 : 0;
    const incomeReduction = oldNetIncome - newNetIncome;

    // === LIMITED COMPANY COMPARISON ===
    const ltdProfit = annualRent - mortgageInterest - otherExpenses;
    const corpTaxRate = ltdProfit > 50000 ? TAX_BANDS.corporationTax : TAX_BANDS.corporationTaxSmall;
    const corpTax = Math.max(0, ltdProfit * corpTaxRate);
    const ltdRetainedProfit = ltdProfit - corpTax;

    // If you want to extract as dividends
    const dividendAllowance = 500;
    const dividendToExtract = ltdRetainedProfit;
    const taxableDividend = Math.max(0, dividendToExtract - dividendAllowance);
    const dividendTaxRate = taxRate === 0.45 ? 0.3916 : taxRate === 0.40 ? 0.3375 : 0.0875;
    const dividendTax = taxableDividend * dividendTaxRate;
    const ltdNetAfterDividend = dividendToExtract - dividendTax;

    // Effective tax rate comparison
    const personalEffectiveRate = annualRent > 0 ? (newActualTax / (annualRent - otherExpenses - mortgageInterest)) * 100 : 0;
    const ltdEffectiveRate = ltdProfit > 0 ? ((corpTax + dividendTax) / ltdProfit) * 100 : 0;

    // Potential savings
    const ltdSavings = newNetIncome - ltdNetAfterDividend;

    return {
        annualRent,
        mortgageInterest,
        otherExpenses,
        // Old rules
        oldNetProfit,
        oldTaxableIncome,
        oldTaxDue,
        oldNetIncome,
        // New rules
        newNetProfit,
        newTaxableIncome,
        newTaxDue,
        taxCredit,
        newActualTax,
        newNetIncome,
        // Impact
        additionalTax,
        percentageIncrease,
        incomeReduction,
        // Ltd comparison
        ltdProfit,
        corpTax,
        ltdRetainedProfit,
        dividendTax,
        ltdNetAfterDividend,
        personalEffectiveRate,
        ltdEffectiveRate,
        ltdSavings,
        taxRate,
    };
};

const Section24CalculatorPage = () => {
    const [form, setForm] = useState<Section24FormState>(initialForm);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveSection24Metrics(form), [form]);

    const handleInputChange = (name: keyof Section24FormState, value: string) => {
        if (['annualRent', 'mortgageInterest', 'otherExpenses', 'otherIncome'].includes(name)) {
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

    return (
        <CalculatorPageLayout
            title="Section 24 Tax Impact Calculator"
            description="Calculate how Section 24 mortgage interest relief restrictions affect your rental income tax. Compare personal ownership vs limited company structures."
            category="Landlord"
            categorySlug="landlord"
            categoryColor="#10B981"
            badges={[{ label: 'Tax Planning', variant: 'warning' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Rental income details' description='Enter your annual figures'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Annual rental income'
                                    name='annualRent'
                                    value={form.annualRent}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Total rent received per year'
                                    onChange={(e) => handleInputChange('annualRent', e.target.value)}
                                />

                                <FloatingField
                                    label='Annual mortgage interest'
                                    name='mortgageInterest'
                                    value={form.mortgageInterest}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Interest portion only (not capital)'
                                    onChange={(e) => handleInputChange('mortgageInterest', e.target.value)}
                                />

                                <FloatingField
                                    label='Other allowable expenses'
                                    name='otherExpenses'
                                    value={form.otherExpenses}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Insurance, repairs, management, etc.'
                                    onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
                                />

                                <FloatingField
                                    label='Other taxable income'
                                    name='otherIncome'
                                    value={form.otherIncome}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Salary, pension, other income'
                                    onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                                />

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Your Tax Band</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {([
                                            { value: '20', label: 'Basic (20%)' },
                                            { value: '40', label: 'Higher (40%)' },
                                            { value: '45', label: 'Additional (45%)' },
                                        ] as const).map((band) => (
                                            <button
                                                key={band.value}
                                                type='button'
                                                onClick={() => handleInputChange('taxBand', band.value)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.taxBand === band.value
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {band.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className='text-xs text-gray-500'>
                                        Based on your total income including rental profit
                                    </p>
                                </div>

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Impact
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

                        {/* Warning Box */}
                        <div className='p-4 rounded-xl bg-amber-50 border border-amber-200'>
                            <div className='flex items-start gap-3'>
                                <AlertTriangle className='size-5 text-amber-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='font-medium text-amber-900 text-sm'>What is Section 24?</p>
                                    <p className='text-xs text-amber-700 mt-1'>
                                        Section 24 of the Finance Act 2015 changed how landlords can claim mortgage interest relief.
                                        Previously, mortgage interest was fully deductible from rental income.
                                        Now, you can only claim a 20% tax credit, which significantly affects higher-rate taxpayers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className='space-y-6'>
                        <CalculatorResultsGate
                            calculatorType="Section 24 Tax Impact Calculator"
                            calculatorSlug="section-24-tax-impact-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Impact Summary */}
                        <BentoCard variant='secondary' title='Section 24 impact' description='Before vs after comparison'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Additional Tax'
                                    value={formatCurrency(metrics.additionalTax)}
                                    helper='Extra tax due to S24'
                                />
                                <DealMetric
                                    label='Income Reduction'
                                    value={formatCurrency(metrics.incomeReduction)}
                                    helper='Net income lost'
                                />
                                <DealMetric
                                    label='Old Tax Due'
                                    value={formatCurrency(metrics.oldTaxDue)}
                                    helper='Pre-Section 24'
                                />
                                <DealMetric
                                    label='New Tax Due'
                                    value={formatCurrency(metrics.newActualTax)}
                                    helper='Post-Section 24'
                                />
                            </BentoGrid>

                            {/* Comparison Cards */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border-2 border-green-200 bg-green-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <User className='size-8 text-green-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>Old Net Income</p>
                                                <p className='text-xl font-bold text-green-700'>
                                                    {formatCurrency(metrics.oldNetIncome)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            When mortgage interest was fully deductible
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className='border-2 border-red-200 bg-red-50'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <TrendingDown className='size-8 text-red-600' />
                                            <div>
                                                <p className='text-sm text-slate-600'>New Net Income</p>
                                                <p className='text-xl font-bold text-red-700'>
                                                    {formatCurrency(metrics.newNetIncome)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className='mt-2 text-xs text-slate-500'>
                                            With Section 24 restrictions applied
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <FileWarning className='size-4' />
                                    Tax Calculation Breakdown
                                </h4>
                                <div className='space-y-4'>
                                    {/* Old Rules */}
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2'>Old Rules (Pre-2017)</p>
                                        <div className='space-y-1 text-sm'>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Rental income</span>
                                                <span>{formatCurrency(metrics.annualRent)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Less: Mortgage interest</span>
                                                <span className='text-red-600'>-{formatCurrency(metrics.mortgageInterest)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Less: Other expenses</span>
                                                <span className='text-red-600'>-{formatCurrency(metrics.otherExpenses)}</span>
                                            </div>
                                            <div className='flex justify-between font-medium pt-1 border-t'>
                                                <span>Taxable profit</span>
                                                <span>{formatCurrency(metrics.oldNetProfit)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Tax @ {form.taxBand}%</span>
                                                <span className='text-red-600'>{formatCurrency(metrics.oldTaxDue)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Rules */}
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2'>New Rules (Section 24)</p>
                                        <div className='space-y-1 text-sm'>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Rental income</span>
                                                <span>{formatCurrency(metrics.annualRent)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Less: Other expenses only</span>
                                                <span className='text-red-600'>-{formatCurrency(metrics.otherExpenses)}</span>
                                            </div>
                                            <div className='flex justify-between font-medium pt-1 border-t'>
                                                <span>Taxable profit</span>
                                                <span>{formatCurrency(metrics.newNetProfit)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Tax @ {form.taxBand}%</span>
                                                <span className='text-red-600'>{formatCurrency(metrics.newTaxDue)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-slate-600'>Less: 20% tax credit</span>
                                                <span className='text-green-600'>-{formatCurrency(metrics.taxCredit)}</span>
                                            </div>
                                            <div className='flex justify-between font-medium pt-1 border-t'>
                                                <span>Final tax due</span>
                                                <span className='text-red-600'>{formatCurrency(metrics.newActualTax)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Ltd Company Comparison */}
                        <BentoCard variant='secondary' title='Limited company alternative' description='Would a Ltd structure save tax?'>
                            <div className='p-4 rounded-xl bg-indigo-50 border border-indigo-200'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <Building className='size-8 text-indigo-600' />
                                    <div>
                                        <p className='font-medium text-indigo-900'>Ltd Company Structure</p>
                                        <p className='text-xs text-indigo-700'>If property was held in a company</p>
                                    </div>
                                </div>

                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Company profit</span>
                                        <span>{formatCurrency(metrics.ltdProfit)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Corporation tax</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.corpTax)}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Dividend tax (to extract)</span>
                                        <span className='text-red-600'>-{formatCurrency(metrics.dividendTax)}</span>
                                    </div>
                                    <div className='flex justify-between font-medium pt-2 border-t'>
                                        <span>Net after all taxes</span>
                                        <span className='text-indigo-700'>{formatCurrency(metrics.ltdNetAfterDividend)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison */}
                            <div className='mt-4 grid grid-cols-2 gap-4'>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Personal Effective Rate</p>
                                    <p className='text-lg font-bold text-red-600'>
                                        {isFinite(metrics.personalEffectiveRate) ? `${metrics.personalEffectiveRate.toFixed(1)}%` : 'N/A'}
                                    </p>
                                </div>
                                <div className='p-3 rounded-lg bg-white border border-slate-200 text-center'>
                                    <p className='text-xs text-slate-500'>Ltd Effective Rate</p>
                                    <p className='text-lg font-bold text-indigo-600'>
                                        {isFinite(metrics.ltdEffectiveRate) ? `${metrics.ltdEffectiveRate.toFixed(1)}%` : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {metrics.ltdSavings < 0 && (
                                <div className='mt-4 p-3 rounded-lg bg-green-50 border border-green-200'>
                                    <p className='text-sm text-green-800'>
                                        <span className='font-medium'>Potential Ltd savings: </span>
                                        {formatCurrency(Math.abs(metrics.ltdSavings))}/year
                                    </p>
                                </div>
                            )}

                            {metrics.ltdSavings >= 0 && (
                                <div className='mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200'>
                                    <p className='text-sm text-amber-800'>
                                        Personal ownership may be more tax-efficient in your situation.
                                        Consider other factors like mortgage availability and SDLT.
                                    </p>
                                </div>
                            )}

                            {/* Important Notes */}
                            <div className='mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200'>
                                <div className='flex items-start gap-3'>
                                    <Info className='size-5 text-gray-600 shrink-0 mt-0.5' />
                                    <div>
                                        <p className='font-medium text-gray-900 text-sm'>Important Considerations</p>
                                        <ul className='text-xs text-gray-600 mt-1 space-y-1'>
                                            <li>• Transferring existing properties to a Ltd triggers SDLT and CGT</li>
                                            <li>• Ltd mortgages often have higher rates and lower LTV</li>
                                            <li>• Company accounts and filing have ongoing costs</li>
                                            <li>• Retained profits in company grow tax-efficiently</li>
                                            <li>• Always seek professional tax advice</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>
                    </div>
                </div>

                <CalculatorSEO
                    calculatorName="Section 24 Tax Impact Calculator"
                    calculatorSlug="section-24-tax-impact-calculator"
                    description="The Section 24 Tax Impact Calculator shows UK landlords how mortgage interest relief restrictions affect their rental income tax. Section 24 phased out the ability to deduct mortgage interest as an expense, replacing it with a 20% tax credit. Our calculator compares old vs new rules and shows potential savings through limited company ownership."
                    howItWorks={`Section 24 (Finance Act 2015) changed mortgage interest tax relief for UK landlords:

**Old Rules (Pre-2017)**: Mortgage interest was fully deductible from rental income before calculating tax. If you earned £20,000 rent with £12,000 interest and £3,000 other costs, your taxable profit was £5,000.

**New Rules (Section 24)**: Mortgage interest is NO LONGER deductible. Instead, you get a 20% tax credit on the interest. Using the same example, your taxable profit is now £17,000 (rent minus other costs only), taxed at your marginal rate, then you claim back 20% of the £12,000 interest (£2,400 credit).

**Impact**: Higher and additional rate taxpayers lose significantly because they're taxed at 40-45% on the full profit but only get 20% relief. This can push landlords into higher tax bands and make previously profitable properties cashflow negative.

**Limited Company Alternative**: Properties held in limited companies avoid Section 24 entirely, as companies can still fully deduct mortgage interest. However, you'll pay corporation tax and potentially dividend tax when extracting profits.`}
                    whenToUse="Use this calculator when assessing the true tax impact of your rental portfolio, deciding whether to transfer properties to a limited company, or evaluating new purchases under personal or company ownership. Essential for tax planning and understanding your real after-tax returns."
                    keyFeatures={[
                        "Calculate additional tax due to Section 24 restrictions",
                        "Compare before and after Section 24 implementation",
                        "Model limited company alternative with corporation and dividend tax",
                        "See effective tax rates for personal vs company ownership",
                    ]}
                    faqs={[
                        {
                            question: "What is Section 24 and how does it affect landlords?",
                            answer: "Section 24 restricts tax relief on mortgage interest for personal landlords to 20%, regardless of your tax band. Previously, interest was fully deductible. Now, you're taxed on rental income minus only allowable expenses (not interest), at your marginal rate (20/40/45%), then get a 20% tax credit on interest. Higher rate taxpayers effectively lose 20-25% of interest relief, significantly increasing tax bills."
                        },
                        {
                            question: "Should I transfer my properties to a limited company?",
                            answer: "It depends. Limited companies avoid Section 24 and can deduct full mortgage interest, paying only 19-25% corporation tax. However, transferring triggers SDLT (potentially 5% surcharge) and capital gains tax. Company mortgages often have higher rates and lower LTV. It's typically beneficial for higher rate taxpayers with substantial portfolios, but seek professional advice—each situation differs."
                        },
                        {
                            question: "How much extra tax will Section 24 cost me?",
                            answer: "The impact varies by your tax band and mortgage interest. Higher rate (40%) taxpayers with large mortgages suffer most. Example: £20k rent, £12k interest, £3k costs. Old rules: tax on £5k profit = £2k. New rules: tax on £17k profit (£6,800) minus 20% interest credit (£2,400) = £4,400 tax. That's £2,400 extra tax annually."
                        },
                        {
                            question: "Can Section 24 push me into a higher tax band?",
                            answer: "Yes! Because mortgage interest is no longer deductible before calculating taxable profit, your reported income increases dramatically. This can push basic rate taxpayers into higher rate (40%) or higher rate into additional rate (45%), compounding the Section 24 impact. You're taxed at a higher rate on artificially inflated profits."
                        },
                        {
                            question: "Are there any alternatives to limited companies?",
                            answer: "Limited options exist: use offset mortgages to reduce interest, maximise other allowable expenses, ensure rent increases keep pace with tax rises, consider selling loss-making properties, or incorporate spouse/family in ownership if they're lower rate taxpayers. However, for higher rate landlords with mortgages, limited companies remain the most effective Section 24 mitigation."
                        },
                    ]}
                    relatedTerms={[
                        "Section 24 calculator",
                        "Mortgage interest tax relief",
                        "Landlord tax calculator UK",
                        "Section 24 impact",
                        "BTL limited company",
                        "Finance Act 2015 landlords",
                        "20% mortgage tax credit",
                        "Landlord tax planning",
                        "Property company tax",
                        "Higher rate taxpayer landlord",
                    ]}
                    categoryColor="#10B981"
                />
        </CalculatorPageLayout>
    );
};

export default Section24CalculatorPage;
