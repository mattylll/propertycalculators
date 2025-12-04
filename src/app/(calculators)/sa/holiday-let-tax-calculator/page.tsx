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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Receipt,
    Calculator,
    CheckCircle2,
    AlertTriangle,
    Info,
    Sparkles,
    Percent,
    PoundSterling,
    Calendar,
    FileText,
} from 'lucide-react';

type FormState = {
    grossIncome: string;
    daysAvailable: string;
    daysLet: string;
    mortgageInterest: string;
    insurance: string;
    utilities: string;
    cleaning: string;
    management: string;
    maintenance: string;
    councilTax: string;
    advertising: string;
    otherExpenses: string;
    capitalAllowances: string;
    taxBracket: 'basic' | 'higher' | 'additional';
    otherIncome: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: FormState = {
    grossIncome: '30,000',
    daysAvailable: '220',
    daysLet: '120',
    mortgageInterest: '8,000',
    insurance: '600',
    utilities: '2,400',
    cleaning: '1,500',
    management: '0',
    maintenance: '1,000',
    councilTax: '1,800',
    advertising: '500',
    otherExpenses: '500',
    capitalAllowances: '2,000',
    taxBracket: 'higher',
    otherIncome: '50,000',
    postcode: '',
};

const TAX_RATES = {
    basic: { rate: 0.20, threshold: 50270, label: 'Basic Rate (20%)' },
    higher: { rate: 0.40, threshold: 125140, label: 'Higher Rate (40%)' },
    additional: { rate: 0.45, threshold: Infinity, label: 'Additional Rate (45%)' },
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveMetrics = (form: FormState) => {
    const grossIncome = parseNumber(form.grossIncome);
    const daysAvailable = parseNumber(form.daysAvailable);
    const daysLet = parseNumber(form.daysLet);
    const mortgageInterest = parseNumber(form.mortgageInterest);
    const insurance = parseNumber(form.insurance);
    const utilities = parseNumber(form.utilities);
    const cleaning = parseNumber(form.cleaning);
    const management = parseNumber(form.management);
    const maintenance = parseNumber(form.maintenance);
    const councilTax = parseNumber(form.councilTax);
    const advertising = parseNumber(form.advertising);
    const otherExpenses = parseNumber(form.otherExpenses);
    const capitalAllowances = parseNumber(form.capitalAllowances);
    const otherIncome = parseNumber(form.otherIncome);

    // FHL Qualification Check
    // Must be available for letting 210+ days per year
    // Must be actually let for 105+ days per year
    const qualifiesAsFHL = daysAvailable >= 210 && daysLet >= 105;

    // Total allowable expenses
    const totalExpenses = mortgageInterest + insurance + utilities + cleaning +
                         management + maintenance + councilTax + advertising + otherExpenses;

    // Net profit before capital allowances
    const netProfitBeforeCA = grossIncome - totalExpenses;

    // Taxable profit (after capital allowances)
    const taxableProfit = Math.max(0, netProfitBeforeCA - capitalAllowances);

    // Tax calculation
    const taxRate = TAX_RATES[form.taxBracket].rate;
    const incomeTaxOnProfit = taxableProfit * taxRate;

    // Class 4 NI (if profit > £12,570)
    const niThreshold = 12570;
    const niRate = 0.06; // 6% above threshold (2024/25 rate)
    const niableProfit = Math.max(0, taxableProfit - niThreshold);
    const class4NI = niableProfit * niRate;

    // Total tax liability
    const totalTaxLiability = incomeTaxOnProfit + class4NI;

    // Post-tax profit
    const postTaxProfit = netProfitBeforeCA - totalTaxLiability;

    // Effective tax rate
    const effectiveTaxRate = netProfitBeforeCA > 0 ? (totalTaxLiability / netProfitBeforeCA) * 100 : 0;

    // --- BTL Comparison (Section 24 impact) ---
    // Under Section 24, mortgage interest isn't deductible, only gets 20% credit
    const btlNetProfitBeforeTax = grossIncome - (totalExpenses - mortgageInterest);
    const btlTaxableProfit = btlNetProfitBeforeTax;
    const btlIncomeTax = btlTaxableProfit * taxRate;
    const btlMortgageInterestRelief = mortgageInterest * 0.20; // 20% credit only
    const btlTaxAfterRelief = btlIncomeTax - btlMortgageInterestRelief;
    const btlPostTaxProfit = btlNetProfitBeforeTax - btlTaxAfterRelief - mortgageInterest;

    // FHL vs BTL savings
    const fhlTaxSaving = btlTaxAfterRelief - incomeTaxOnProfit;

    // Revenue per day let
    const revenuePerDayLet = daysLet > 0 ? grossIncome / daysLet : 0;

    // Expense ratio
    const expenseRatio = grossIncome > 0 ? (totalExpenses / grossIncome) * 100 : 0;

    return {
        grossIncome,
        daysAvailable,
        daysLet,
        qualifiesAsFHL,
        mortgageInterest,
        totalExpenses,
        netProfitBeforeCA,
        capitalAllowances,
        taxableProfit,
        incomeTaxOnProfit,
        class4NI,
        totalTaxLiability,
        postTaxProfit,
        effectiveTaxRate,
        btlPostTaxProfit,
        fhlTaxSaving,
        revenuePerDayLet,
        expenseRatio,
        taxBracket: form.taxBracket,
    };
};

const HolidayLetTaxCalculatorPage = () => {
    const [form, setForm] = useState<FormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveMetrics(form), [form]);

    const handleInputChange = (name: keyof FormState, value: string) => {
        if (['grossIncome', 'mortgageInterest', 'insurance', 'utilities', 'cleaning',
             'management', 'maintenance', 'councilTax', 'advertising', 'otherExpenses',
             'capitalAllowances', 'otherIncome'].includes(name)) {
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
                    systemPrompt: `You are an expert UK property tax advisor specialising in Furnished Holiday Lets (FHL).
You provide accurate, data-driven analysis for FHL tax planning.
Focus on FHL qualification rules, tax efficiency, and compliance.`,
                    userPrompt: `Analyse this Furnished Holiday Let in ${form.postcode}:

Gross Income: ${formatCurrency(metrics.grossIncome)}
Days Available: ${metrics.daysAvailable} (needs 210+)
Days Let: ${metrics.daysLet} (needs 105+)
FHL Qualifies: ${metrics.qualifiesAsFHL ? 'Yes' : 'No'}

Total Expenses: ${formatCurrency(metrics.totalExpenses)}
Capital Allowances: ${formatCurrency(metrics.capitalAllowances)}
Taxable Profit: ${formatCurrency(metrics.taxableProfit)}
Tax Bracket: ${TAX_RATES[metrics.taxBracket].label}

Income Tax: ${formatCurrency(metrics.incomeTaxOnProfit)}
Class 4 NI: ${formatCurrency(metrics.class4NI)}
Total Tax: ${formatCurrency(metrics.totalTaxLiability)}
Post-Tax Profit: ${formatCurrency(metrics.postTaxProfit)}

FHL Tax Saving vs BTL: ${formatCurrency(metrics.fhlTaxSaving)}

Please assess:
1. Is the FHL qualification secure with these letting days?
2. Are the claimed expenses and capital allowances reasonable?
3. Tax planning opportunities
4. Risks and compliance considerations

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "FHL market context for this area"
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

    return (
        <CalculatorPageLayout
            title="Holiday Let Tax Calculator"
            description="Calculate tax implications for Furnished Holiday Lets (FHL) including qualification rules, allowable expenses, and comparison with BTL treatment."
            category="Serviced Accommodation"
            categorySlug="sa"
            categoryColor="#F97316"
            badges={[{ label: 'Live Calculator', variant: 'success' }]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='FHL income & letting days' description='Enter your holiday let details'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <FloatingField
                                    label='Gross rental income'
                                    name='grossIncome'
                                    value={form.grossIncome}
                                    unit='£'
                                    unitPosition='prefix'
                                    helper='Total income before expenses'
                                    onChange={(e) => handleInputChange('grossIncome', e.target.value)}
                                />

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FloatingField
                                        label='Days available for letting'
                                        name='daysAvailable'
                                        type='number'
                                        value={form.daysAvailable}
                                        unit='days'
                                        helper='Min 210 days required for FHL'
                                        onChange={(e) => handleInputChange('daysAvailable', e.target.value)}
                                    />
                                    <FloatingField
                                        label='Days actually let'
                                        name='daysLet'
                                        type='number'
                                        value={form.daysLet}
                                        unit='days'
                                        helper='Min 105 days required for FHL'
                                        onChange={(e) => handleInputChange('daysLet', e.target.value)}
                                    />
                                </div>

                                {/* FHL Qualification Status */}
                                <div className={`p-4 rounded-xl border-2 ${
                                    metrics.qualifiesAsFHL
                                        ? 'border-emerald-200 bg-emerald-50'
                                        : 'border-red-200 bg-red-50'
                                }`}>
                                    <div className='flex items-center gap-3'>
                                        {metrics.qualifiesAsFHL ? (
                                            <CheckCircle2 className='size-6 text-emerald-600' />
                                        ) : (
                                            <AlertTriangle className='size-6 text-red-600' />
                                        )}
                                        <div>
                                            <p className={`font-semibold ${metrics.qualifiesAsFHL ? 'text-emerald-900' : 'text-red-900'}`}>
                                                {metrics.qualifiesAsFHL ? 'Qualifies as FHL' : 'Does NOT qualify as FHL'}
                                            </p>
                                            <p className={`text-sm ${metrics.qualifiesAsFHL ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {metrics.qualifiesAsFHL
                                                    ? 'Full mortgage interest deduction available'
                                                    : `Need ${Math.max(0, 210 - metrics.daysAvailable)} more available days and ${Math.max(0, 105 - metrics.daysLet)} more letting days`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-4 rounded-xl bg-pink-50 border border-pink-200'>
                                    <h4 className='font-medium text-pink-900 text-sm mb-3'>Allowable Expenses</h4>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Mortgage interest'
                                            name='mortgageInterest'
                                            value={form.mortgageInterest}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Fully deductible if FHL'
                                            onChange={(e) => handleInputChange('mortgageInterest', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Insurance'
                                            name='insurance'
                                            value={form.insurance}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('insurance', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Utilities'
                                            name='utilities'
                                            value={form.utilities}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('utilities', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Cleaning'
                                            name='cleaning'
                                            value={form.cleaning}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('cleaning', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Management fees'
                                            name='management'
                                            value={form.management}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('management', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Maintenance'
                                            name='maintenance'
                                            value={form.maintenance}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('maintenance', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Council tax / Rates'
                                            name='councilTax'
                                            value={form.councilTax}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('councilTax', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Advertising'
                                            name='advertising'
                                            value={form.advertising}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('advertising', e.target.value)}
                                            compact
                                        />
                                    </div>
                                    <div className='mt-4 grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Other expenses'
                                            name='otherExpenses'
                                            value={form.otherExpenses}
                                            unit='£'
                                            unitPosition='prefix'
                                            onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
                                            compact
                                        />
                                        <FloatingField
                                            label='Capital allowances'
                                            name='capitalAllowances'
                                            value={form.capitalAllowances}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Furniture, equipment etc.'
                                            onChange={(e) => handleInputChange('capitalAllowances', e.target.value)}
                                            compact
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-700'>Your Tax Bracket</label>
                                    <div className='grid grid-cols-3 gap-2'>
                                        {(['basic', 'higher', 'additional'] as const).map((bracket) => (
                                            <button
                                                key={bracket}
                                                type='button'
                                                onClick={() => setForm((prev) => ({ ...prev, taxBracket: bracket }))}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                    form.taxBracket === bracket
                                                        ? 'bg-[var(--pc-blue)] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {bracket === 'basic' ? '20%' : bracket === 'higher' ? '40%' : '45%'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className='text-xs text-gray-500'>
                                        {TAX_RATES[form.taxBracket].label}
                                    </p>
                                </div>

                                <FloatingField
                                    label='Postcode'
                                    name='postcode'
                                    value={form.postcode}
                                    helper='For AI tax planning advice'
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                />

                                <div className='flex flex-wrap gap-3'>
                                    <PropertyButton type='submit' variant='primary' icon={<Calculator className='size-4' />}>
                                        Calculate Tax
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
                            calculatorType="Holiday Let Tax Calculator"
                            calculatorSlug="holiday-let-tax-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Tax calculation' description='Based on FHL rules'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Taxable Profit'
                                    value={formatCurrency(metrics.taxableProfit)}
                                    helper='After all deductions'
                                />
                                <DealMetric
                                    label='Total Tax Due'
                                    value={formatCurrency(metrics.totalTaxLiability)}
                                    helper='Income tax + NI'
                                />
                                <DealMetric
                                    label='Post-Tax Profit'
                                    value={formatCurrency(metrics.postTaxProfit)}
                                    helper='Your take-home'
                                />
                                <DealMetric
                                    label='Effective Tax Rate'
                                    value={`${metrics.effectiveTaxRate.toFixed(1)}%`}
                                    helper='On net profit'
                                />
                            </BentoGrid>

                            {/* Tax Breakdown */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
                                    <Receipt className='size-4' />
                                    Tax Breakdown
                                </h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-600'>Gross income</span>
                                        <span className='font-medium'>{formatCurrency(metrics.grossIncome)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Total expenses</span>
                                        <span>-{formatCurrency(metrics.totalExpenses)}</span>
                                    </div>
                                    <div className='flex justify-between border-t pt-2'>
                                        <span className='text-slate-600'>Net profit before CA</span>
                                        <span className='font-medium'>{formatCurrency(metrics.netProfitBeforeCA)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Capital allowances</span>
                                        <span>-{formatCurrency(metrics.capitalAllowances)}</span>
                                    </div>
                                    <div className='flex justify-between font-medium border-t pt-2'>
                                        <span>Taxable profit</span>
                                        <span>{formatCurrency(metrics.taxableProfit)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Income tax ({TAX_RATES[metrics.taxBracket].label})</span>
                                        <span>-{formatCurrency(metrics.incomeTaxOnProfit)}</span>
                                    </div>
                                    <div className='flex justify-between text-red-600'>
                                        <span>Class 4 NI</span>
                                        <span>-{formatCurrency(metrics.class4NI)}</span>
                                    </div>
                                    <div className='flex justify-between font-bold border-t pt-2'>
                                        <span>Post-tax profit</span>
                                        <span className='text-emerald-600'>{formatCurrency(metrics.postTaxProfit)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* FHL vs BTL Comparison */}
                            <div className='mt-6'>
                                <Card className='border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white'>
                                    <CardContent className='p-4'>
                                        <h4 className='font-semibold text-pink-900 mb-3 flex items-center gap-2'>
                                            <FileText className='size-4' />
                                            FHL vs BTL Tax Comparison
                                        </h4>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200'>
                                                <p className='text-xs text-emerald-600 mb-1'>As FHL</p>
                                                <p className='text-lg font-bold text-emerald-700'>
                                                    {formatCurrency(metrics.postTaxProfit)}
                                                </p>
                                                <p className='text-xs text-emerald-600'>post-tax profit</p>
                                            </div>
                                            <div className='text-center p-3 bg-slate-50 rounded-lg border border-slate-200'>
                                                <p className='text-xs text-slate-600 mb-1'>As BTL (Section 24)</p>
                                                <p className='text-lg font-bold text-slate-700'>
                                                    {formatCurrency(metrics.btlPostTaxProfit)}
                                                </p>
                                                <p className='text-xs text-slate-600'>post-tax profit</p>
                                            </div>
                                        </div>
                                        {metrics.fhlTaxSaving > 0 && (
                                            <div className='mt-3 p-2 bg-emerald-100 rounded-lg text-center'>
                                                <p className='text-sm font-semibold text-emerald-800'>
                                                    FHL saves {formatCurrency(metrics.fhlTaxSaving)}/year in tax
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Key Stats */}
                            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-4 text-center'>
                                        <p className='text-xs text-slate-600'>Revenue per day let</p>
                                        <p className='text-xl font-bold text-slate-900'>{formatCurrency(metrics.revenuePerDayLet)}</p>
                                    </CardContent>
                                </Card>
                                <Card className='border border-slate-200'>
                                    <CardContent className='p-4 text-center'>
                                        <p className='text-xs text-slate-600'>Expense ratio</p>
                                        <p className='text-xl font-bold text-slate-900'>{metrics.expenseRatio.toFixed(0)}%</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* Info Box */}
                        <div className='p-4 rounded-xl bg-blue-50 border border-blue-200'>
                            <div className='flex items-start gap-3'>
                                <Info className='size-5 text-blue-600 shrink-0 mt-0.5' />
                                <div className='space-y-2'>
                                    <p className='font-medium text-blue-900 text-sm'>FHL Tax Benefits</p>
                                    <ul className='text-xs text-blue-700 space-y-1 list-disc list-inside'>
                                        <li>Full mortgage interest deduction (not restricted like BTL)</li>
                                        <li>Capital allowances on furniture and equipment</li>
                                        <li>Business Asset Disposal Relief on sale (10% CGT)</li>
                                        <li>Loss relief against other income in some cases</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='holiday let tax'
                            postcode={form.postcode}
                        />

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                            <Card className='border-slate-200 overflow-hidden'>
                                <div className='bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Sparkles className='size-5 text-white' />
                                            <span className='font-semibold text-white'>AI Tax Analysis</span>
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
                                            <h4 className='font-semibold text-slate-900 mb-2'>Tax Planning Recommendations</h4>
                                            <ul className='space-y-1'>
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <li key={i} className='text-sm text-slate-600 flex items-start gap-2'>
                                                        <ArrowRight className='size-4 text-pink-500 shrink-0 mt-0.5' />
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
                    calculatorName="Holiday Let Tax Calculator"
                    calculatorSlug="holiday-let-tax-calculator"
                    description="The Holiday Let Tax Calculator helps UK serviced accommodation investors understand the tax implications of Furnished Holiday Lets (FHL). Calculate your tax liability, understand FHL qualification rules (210-day availability and 105-day letting test), and compare the significant tax savings versus standard Buy-to-Let properties affected by Section 24."
                    howItWorks={`The FHL tax calculator works by:

1. Checking FHL Qualification - Verify your property meets the 210-day availability test and 105-day letting test required by HMRC
2. Calculating Allowable Expenses - Include all operating costs plus full mortgage interest deduction (unlike BTL)
3. Applying Capital Allowances - Deduct furniture, fixtures, and equipment costs
4. Computing Tax Liability - Calculate income tax at your marginal rate plus Class 4 National Insurance
5. Comparing with BTL Treatment - Show the tax saving from full mortgage interest relief versus Section 24 restrictions

The calculator demonstrates the substantial tax advantages of FHL status, including full mortgage interest deduction (not restricted to 20% tax credit like BTL), capital allowances on furnishings, and potential Business Asset Disposal Relief on sale.`}
                    whenToUse="Use this calculator when evaluating holiday let investments to understand your after-tax returns. Essential for comparing FHL properties with standard BTL investments, planning your SA tax strategy, and ensuring your letting pattern qualifies for FHL status. Particularly valuable for higher-rate taxpayers who benefit most from full mortgage interest relief."
                    keyFeatures={[
                        "FHL qualification checker (210/105-day test)",
                        "Full mortgage interest deduction calculation",
                        "Capital allowances on furniture and equipment",
                        "Side-by-side comparison with BTL Section 24 treatment",
                    ]}
                    faqs={[
                        {
                            question: "What is the 210-day test for FHL status?",
                            answer: "Your property must be available for commercial letting for at least 210 days per year to qualify as an FHL. Personal use doesn't count towards this total. The property must also be actually let for at least 105 days (excluding lettings of more than 31 consecutive days). Meeting both tests qualifies you for FHL tax benefits."
                        },
                        {
                            question: "How much tax do I save with FHL status versus BTL?",
                            answer: "FHL status allows full mortgage interest deduction against rental income, while BTL landlords only get 20% tax credit under Section 24. For a higher-rate (40%) taxpayer with £10,000 mortgage interest, FHL saves £4,000 in tax versus £2,000 BTL relief - a £2,000 annual saving. Additional-rate taxpayers (45%) save even more."
                        },
                        {
                            question: "Can I claim capital allowances on my holiday let?",
                            answer: "Yes, FHL properties qualify for capital allowances on furniture, fixtures, equipment, and white goods. You can typically claim 18% annual writing down allowance or use the Annual Investment Allowance (£1 million limit 2024/25) for immediate relief. This is a major advantage over BTL where these items are revenue expenses."
                        },
                        {
                            question: "Do I need to register as self-employed for my FHL?",
                            answer: "Yes, FHL income is treated as business income, not property income. You'll need to register as self-employed and complete a Self Assessment tax return. You'll also pay Class 2 (£3.45/week if profits exceed £6,725) and Class 4 National Insurance (6% on profits over £12,570), but gain access to business tax reliefs."
                        },
                        {
                            question: "What happens if I don't meet the FHL tests in a year?",
                            answer: "If you fail the 210/105-day tests, you can elect to average over 2-3 years if one year was exceptional. Otherwise, HMRC will treat that year as normal property income under Section 24 rules, losing mortgage interest relief and capital allowances. It's crucial to track lettings carefully and market actively to maintain qualification."
                        },
                    ]}
                    relatedTerms={[
                        "Furnished Holiday Let FHL",
                        "210-day test",
                        "105-day letting requirement",
                        "FHL mortgage interest relief",
                        "Capital allowances holiday let",
                        "Section 24 tax",
                        "Business Asset Disposal Relief",
                        "Holiday let tax planning",
                        "Short-term rental tax UK",
                        "Airbnb tax calculator",
                    ]}
                    categoryColor="#F97316"
                />
        </CalculatorPageLayout>
    );
};

export default HolidayLetTaxCalculatorPage;
