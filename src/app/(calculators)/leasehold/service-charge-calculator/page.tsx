"use client";

import { useMemo, useState } from 'react';

import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard, BentoGrid } from '@/components/property-kit/bento-card';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { FloatingField } from '@/components/property-kit/floating-field';
import { PropertyButton } from '@/components/property-kit/property-button';
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
    Wrench,
    Shield,
    Users,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Info,
    ArrowRight,
    TrendingUp,
    Banknote,
    PieChart,
} from 'lucide-react';

type ServiceChargeFormState = {
    propertyType: string;
    numberOfUnits: string;
    yourShare: string;
    buildingInsurance: string;
    managementFees: string;
    cleaningGardening: string;
    liftMaintenance: string;
    communalElectricity: string;
    repairsReserve: string;
    majorWorksReserve: string;
    otherCosts: string;
    postcode: string;
};

type AIAnalysis = {
    summary: string;
    verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
    insights: Array<{ type: 'positive' | 'negative' | 'warning' | 'neutral'; title: string; message: string }>;
    recommendations: string[];
    marketContext: string;
};

const initialForm: ServiceChargeFormState = {
    propertyType: 'purpose-built',
    numberOfUnits: '12',
    yourShare: '8.33',
    buildingInsurance: '15,000',
    managementFees: '8,000',
    cleaningGardening: '3,000',
    liftMaintenance: '2,500',
    communalElectricity: '1,500',
    repairsReserve: '5,000',
    majorWorksReserve: '10,000',
    otherCosts: '0',
    postcode: '',
};

const propertyTypes = [
    { value: 'purpose-built', label: 'Purpose-built block' },
    { value: 'converted', label: 'Converted house' },
    { value: 'mansion', label: 'Mansion block' },
    { value: 'high-rise', label: 'High-rise (10+ floors)' },
    { value: 'new-build', label: 'New build development' },
];

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
};

const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const deriveServiceChargeMetrics = (form: ServiceChargeFormState) => {
    const yourShare = parseNumber(form.yourShare) / 100;
    const buildingInsurance = parseNumber(form.buildingInsurance);
    const managementFees = parseNumber(form.managementFees);
    const cleaningGardening = parseNumber(form.cleaningGardening);
    const liftMaintenance = parseNumber(form.liftMaintenance);
    const communalElectricity = parseNumber(form.communalElectricity);
    const repairsReserve = parseNumber(form.repairsReserve);
    const majorWorksReserve = parseNumber(form.majorWorksReserve);
    const otherCosts = parseNumber(form.otherCosts);

    // Total building costs
    const totalBuildingCosts = buildingInsurance + managementFees + cleaningGardening +
        liftMaintenance + communalElectricity + repairsReserve + majorWorksReserve + otherCosts;

    // Your share
    const yourAnnualCharge = totalBuildingCosts * yourShare;
    const yourMonthlyCharge = yourAnnualCharge / 12;
    const yourQuarterlyCharge = yourAnnualCharge / 4;

    // Breakdown per category (your share)
    const breakdown = {
        insurance: buildingInsurance * yourShare,
        management: managementFees * yourShare,
        cleaning: cleaningGardening * yourShare,
        lift: liftMaintenance * yourShare,
        electricity: communalElectricity * yourShare,
        repairs: repairsReserve * yourShare,
        majorWorks: majorWorksReserve * yourShare,
        other: otherCosts * yourShare,
    };

    // Reserves as percentage
    const reservePercentage = totalBuildingCosts > 0
        ? ((repairsReserve + majorWorksReserve) / totalBuildingCosts) * 100
        : 0;

    return {
        totalBuildingCosts,
        yourAnnualCharge,
        yourMonthlyCharge,
        yourQuarterlyCharge,
        breakdown,
        reservePercentage,
        yourSharePercent: yourShare * 100,
    };
};

const ServiceChargeCalculatorPage = () => {
    const [form, setForm] = useState<ServiceChargeFormState>(initialForm);
    const [isValidating, setIsValidating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [hasCalculated, setHasCalculated] = useState(false);

    const metrics = useMemo(() => deriveServiceChargeMetrics(form), [form]);

    const handleInputChange = (name: keyof ServiceChargeFormState, value: string) => {
        if (['buildingInsurance', 'managementFees', 'cleaningGardening', 'liftMaintenance',
             'communalElectricity', 'repairsReserve', 'majorWorksReserve', 'otherCosts'].includes(name)) {
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
                    systemPrompt: `You are an expert UK leasehold property analyst specialising in service charges.
You have knowledge of typical service charge ranges for different property types and locations.
Provide practical advice on whether charges are reasonable and what to look out for.`,
                    userPrompt: `Analyse this service charge estimate for a ${form.propertyType} in ${form.postcode}:

Building: ${form.numberOfUnits} units
Your share: ${form.yourShare}%
Your annual service charge: ${formatCurrency(metrics.yourAnnualCharge)}
Monthly equivalent: ${formatCurrency(metrics.yourMonthlyCharge)}

Breakdown (total building costs):
- Building insurance: ${formatCurrency(parseNumber(form.buildingInsurance))}
- Management fees: ${formatCurrency(parseNumber(form.managementFees))}
- Cleaning/gardening: ${formatCurrency(parseNumber(form.cleaningGardening))}
- Lift maintenance: ${formatCurrency(parseNumber(form.liftMaintenance))}
- Communal electricity: ${formatCurrency(parseNumber(form.communalElectricity))}
- Repairs reserve: ${formatCurrency(parseNumber(form.repairsReserve))}
- Major works reserve: ${formatCurrency(parseNumber(form.majorWorksReserve))}

Please assess:
1. Is this service charge reasonable for a ${form.propertyType}?
2. Are any costs unusually high or low?
3. Is the reserve fund adequate?

Respond in JSON:
{
  "summary": "2-3 sentence assessment",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec1", "rec2"],
  "marketContext": "typical service charges for this property type"
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

    const breakdownItems = [
        { key: 'insurance', label: 'Building Insurance', icon: Shield, value: metrics.breakdown.insurance },
        { key: 'management', label: 'Management Fees', icon: Users, value: metrics.breakdown.management },
        { key: 'cleaning', label: 'Cleaning & Gardening', icon: Wrench, value: metrics.breakdown.cleaning },
        { key: 'lift', label: 'Lift Maintenance', icon: Building2, value: metrics.breakdown.lift },
        { key: 'electricity', label: 'Communal Electricity', icon: Banknote, value: metrics.breakdown.electricity },
        { key: 'repairs', label: 'Repairs Reserve', icon: Wrench, value: metrics.breakdown.repairs },
        { key: 'majorWorks', label: 'Major Works Reserve', icon: Building2, value: metrics.breakdown.majorWorks },
    ].filter(item => item.value > 0);

    return (
        <CalculatorPageLayout
            title="Service Charge Calculator"
            description="Calculate your share of annual service charges for a leasehold property. Understand the breakdown and validate costs with AI analysis."
            category="Leasehold"
            categorySlug="leasehold"
            categoryColor="#06B6D4"
            badges={[
                { label: metrics.reservePercentage >= 20 ? 'Good Reserves' : 'Low Reserves', variant: metrics.reservePercentage >= 20 ? 'success' : 'warning' },
            ]}
        >
            <div className='grid gap-8 lg:grid-cols-2'>
                    {/* Left: Inputs */}
                    <div className='space-y-6'>
                        <BentoCard variant='glass' title='Building details' description='Enter the building service charge budget'>
                            <form className='space-y-5' onSubmit={handleCalculate}>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <label className='text-xs text-muted-foreground'>Property type</label>
                                        <Select
                                            value={form.propertyType}
                                            onValueChange={(value) => handleInputChange('propertyType', value)}>
                                            <SelectTrigger className='h-14 rounded-2xl border-gray-200 bg-white shadow-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {propertyTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FloatingField
                                        label='Number of units'
                                        name='numberOfUnits'
                                        type='number'
                                        value={form.numberOfUnits}
                                        helper='Total flats in building'
                                        onChange={(e) => handleInputChange('numberOfUnits', e.target.value)}
                                    />
                                </div>

                                <FloatingField
                                    label='Your share'
                                    name='yourShare'
                                    type='number'
                                    step='0.01'
                                    value={form.yourShare}
                                    unit='%'
                                    helper='Your percentage of total costs (check lease)'
                                    onChange={(e) => handleInputChange('yourShare', e.target.value)}
                                />

                                <div className='pt-4 border-t'>
                                    <h3 className='text-sm font-semibold text-slate-700 mb-4'>Annual Building Costs (Total)</h3>

                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <FloatingField
                                            label='Building insurance'
                                            name='buildingInsurance'
                                            value={form.buildingInsurance}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Total building insurance'
                                            onChange={(e) => handleInputChange('buildingInsurance', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Management fees'
                                            name='managementFees'
                                            value={form.managementFees}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Managing agent fees'
                                            onChange={(e) => handleInputChange('managementFees', e.target.value)}
                                        />
                                    </div>

                                    <div className='grid gap-4 md:grid-cols-2 mt-4'>
                                        <FloatingField
                                            label='Cleaning & gardening'
                                            name='cleaningGardening'
                                            value={form.cleaningGardening}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Communal area maintenance'
                                            onChange={(e) => handleInputChange('cleaningGardening', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Lift maintenance'
                                            name='liftMaintenance'
                                            value={form.liftMaintenance}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Leave 0 if no lift'
                                            onChange={(e) => handleInputChange('liftMaintenance', e.target.value)}
                                        />
                                    </div>

                                    <div className='grid gap-4 md:grid-cols-2 mt-4'>
                                        <FloatingField
                                            label='Communal electricity'
                                            name='communalElectricity'
                                            value={form.communalElectricity}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Lighting, entry systems, etc.'
                                            onChange={(e) => handleInputChange('communalElectricity', e.target.value)}
                                        />
                                        <FloatingField
                                            label='Repairs reserve'
                                            name='repairsReserve'
                                            value={form.repairsReserve}
                                            unit='£'
                                            unitPosition='prefix'
                                            helper='Day-to-day repairs fund'
                                            onChange={(e) => handleInputChange('repairsReserve', e.target.value)}
                                        />
                                    </div>

                                    <FloatingField
                                        label='Major works reserve'
                                        name='majorWorksReserve'
                                        value={form.majorWorksReserve}
                                        unit='£'
                                        unitPosition='prefix'
                                        helper='Sinking fund for major works'
                                        onChange={(e) => handleInputChange('majorWorksReserve', e.target.value)}
                                    />
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
                                        Calculate Charges
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
                            calculatorType="Service Charge Calculator"
                            calculatorSlug="service-charge-calculator"
                            formData={form}
                            hasCalculated={hasCalculated}
                        >
                        {/* Key Metrics */}
                        <BentoCard variant='secondary' title='Your service charge' description='Based on your share'>
                            <BentoGrid className='grid-cols-2 gap-4'>
                                <DealMetric
                                    label='Annual Charge'
                                    value={formatCurrency(metrics.yourAnnualCharge)}
                                    helper='Your total yearly cost'
                                />
                                <DealMetric
                                    label='Monthly'
                                    value={formatCurrency(metrics.yourMonthlyCharge)}
                                    helper='Monthly equivalent'
                                />
                                <DealMetric
                                    label='Quarterly'
                                    value={formatCurrency(metrics.yourQuarterlyCharge)}
                                    helper='If paid quarterly'
                                />
                                <DealMetric
                                    label='Your Share'
                                    value={`${metrics.yourSharePercent.toFixed(2)}%`}
                                    helper='Of building costs'
                                />
                            </BentoGrid>

                            {/* Building Total */}
                            <div className='mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm text-slate-600'>Total Building Costs</p>
                                        <p className='text-xl font-bold text-slate-900'>{formatCurrency(metrics.totalBuildingCosts)}/yr</p>
                                    </div>
                                    <Badge className={metrics.reservePercentage >= 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                        {metrics.reservePercentage.toFixed(0)}% in reserves
                                    </Badge>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Breakdown */}
                        <BentoCard variant='secondary' title='Your cost breakdown' description='How your charge is split'>
                            <div className='space-y-3'>
                                {breakdownItems.map((item) => (
                                    <div key={item.key} className='flex items-center justify-between text-sm'>
                                        <div className='flex items-center gap-2'>
                                            <item.icon className='size-4 text-slate-400' />
                                            <span className='text-slate-600'>{item.label}</span>
                                        </div>
                                        <span className='font-medium'>{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                                <div className='border-t pt-3 flex items-center justify-between font-medium'>
                                    <span className='text-slate-900'>Total (your share)</span>
                                    <span className='text-[var(--pc-blue)]'>{formatCurrency(metrics.yourAnnualCharge)}</span>
                                </div>
                            </div>

                            {/* Visual breakdown */}
                            <div className='mt-4 pt-4 border-t'>
                                <div className='flex h-4 rounded-full overflow-hidden'>
                                    {breakdownItems.map((item, index) => {
                                        const percentage = (item.value / metrics.yourAnnualCharge) * 100;
                                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];
                                        return (
                                            <div
                                                key={item.key}
                                                className={`${colors[index % colors.length]} transition-all`}
                                                style={{ width: `${percentage}%` }}
                                                title={`${item.label}: ${formatCurrency(item.value)} (${percentage.toFixed(1)}%)`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                                    {breakdownItems.slice(0, 4).map((item, index) => {
                                        const colors = ['text-blue-600', 'text-emerald-600', 'text-amber-600', 'text-purple-600'];
                                        return (
                                            <span key={item.key} className={`${colors[index]}`}>
                                                {item.label}: {((item.value / metrics.yourAnnualCharge) * 100).toFixed(0)}%
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </BentoCard>
                        </CalculatorResultsGate>

                        {/* AI Validation Gate */}
                        <AIValidationGate
                            onValidate={handleAIValidation}
                            isLoading={isValidating}
                            calculatorType='service charge estimate'
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
                                                Market Context
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

                {/* SEO Content */}
                <CalculatorSEO
                    calculatorName="Service Charge Calculator"
                    calculatorSlug="service-charge-calculator"
                    description="The Service Charge Calculator helps UK leaseholders understand and validate their annual service charge obligations. Service charges cover the cost of maintaining communal areas, buildings insurance, management fees, and reserve funds. This calculator breaks down your share of total building costs, identifies whether charges are reasonable, and checks if adequate reserves are maintained for major works to avoid unexpected Section 20 demands."
                    howItWorks={`The calculator analyses service charges through the following components:

1. Building Costs - Aggregates all annual costs including insurance, management fees, cleaning, repairs, utilities, and reserve contributions
2. Your Share Calculation - Applies your percentage share (as defined in your lease) to determine your personal liability
3. Breakdown Analysis - Shows how your charge is distributed across different cost categories
4. Reserve Assessment - Evaluates whether the building maintains adequate reserves (typically 20%+ of total costs) to avoid large Section 20 major works bills
5. Benchmarking - Compares costs against typical ranges for your property type

The calculator identifies whether charges are reasonable and if the freeholder/management company is adequately funding reserves.`}
                    whenToUse="Use this calculator when purchasing a leasehold property to understand ongoing costs, when reviewing annual service charge budgets from your management company, or when challenging unreasonable charges through the First-tier Tribunal. Essential for budgeting rental yields on buy-to-let flats, assessing affordability before purchase, and identifying potentially excessive management fees or inadequate reserve contributions."
                    keyFeatures={[
                        "Calculate your annual service charge liability",
                        "Break down costs by category with visual analysis",
                        "Assess adequacy of reserve funds",
                        "Identify unreasonable or excessive charges",
                    ]}
                    faqs={[
                        {
                            question: "What is a typical service charge for a flat?",
                            answer: "Service charges vary widely by property type and location. Purpose-built blocks typically charge £1,000-£2,500/year for a 2-bed flat. Mansion blocks with porters can reach £3,000-£5,000+. High-rise towers with lifts may be £2,000-£4,000. New-build developments often have higher charges (£2,500-£4,000) due to managing agent fees and reserve requirements. Always request 3 years of service charge accounts before purchasing."
                        },
                        {
                            question: "Can I challenge unreasonable service charges?",
                            answer: "Yes - you can challenge service charges through the First-tier Tribunal (Property Chamber) if you believe they're unreasonable or unnecessary. Common grounds include excessive management fees (typically should be £150-£300 per flat), lack of competitive tendering, charges for improvements rather than repairs, or unreasonable reserve demands. You must follow the Section 27A process for determination."
                        },
                        {
                            question: "What are reserve funds and why are they important?",
                            answer: "Reserve funds (or sinking funds) are money set aside annually for major future works like roof replacement, lift renewal, or external decorations. Buildings should maintain reserves of 15-25% of annual service charges. Adequate reserves avoid large Section 20 bills when major works arise. Buildings with poor reserves may hit leaseholders with £10,000-£30,000+ bills for major works."
                        },
                        {
                            question: "What is a Section 20 consultation?",
                            answer: "Section 20 of the Landlord and Tenant Act 1985 requires freeholders to consult leaseholders before carrying out major works costing over £250 per leaseholder. The consultation involves notices explaining the works, opportunity to nominate contractors, and reviewing estimates. Without proper consultation, your liability is capped at £250. Section 20 works typically include roof repairs, external redecoration, lift replacement, or window renewal."
                        },
                        {
                            question: "How are service charge shares calculated?",
                            answer: "Your share is defined in your lease, typically as a percentage or fraction. In blocks with identical flats, it's usually equal shares (e.g., 8.33% for 12 flats). In mixed blocks, it may be based on floor area, bedrooms, or rateable values. Some leases have weighted shares where larger flats pay more. Always check your lease Schedule to confirm your exact share percentage."
                        },
                    ]}
                    relatedTerms={[
                        "Leasehold service charge",
                        "Service charge reasonableness",
                        "Section 20 major works",
                        "Reserve fund sinking fund",
                        "First-tier Tribunal service charge",
                        "Management company fees",
                        "Buildings insurance leasehold",
                        "Section 27A service charge",
                        "Right to manage RTM",
                        "Service charge consultation",
                    ]}
                    categoryColor="#06B6D4"
                />
        </CalculatorPageLayout>
    );
};

export default ServiceChargeCalculatorPage;
