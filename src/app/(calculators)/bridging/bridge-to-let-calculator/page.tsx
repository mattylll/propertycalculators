'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  TrendingUp,
  Home,
  Info,
  Calculator,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';

export default function BridgeToLetCalculatorPage() {
  const [hasCalculated, setHasCalculated] = useState(false);

  // Property Details
  const [purchasePrice, setPurchasePrice] = useState<string>('250000');
  const [currentValue, setCurrentValue] = useState<string>('250000');
  const [targetValue, setTargetValue] = useState<string>('300000');
  const [refurbCost, setRefurbCost] = useState<string>('30000');
  const [monthlyRent, setMonthlyRent] = useState<string>('1400');

  // Bridging Phase
  const [bridgingLtv, setBridgingLtv] = useState<string>('75');
  const [bridgingRate, setBridgingRate] = useState<string>('0.85');
  const [bridgingTerm, setBridgingTerm] = useState<string>('9');
  const [bridgingArrangementFee, setBridgingArrangementFee] = useState<string>('2');
  const [bridgingExitFee, setBridgingExitFee] = useState<string>('1');
  const [bridgingLegalFees, setBridgingLegalFees] = useState<string>('2500');

  // BTL Refinance Phase
  const [btlLtv, setBtlLtv] = useState<string>('75');
  const [btlRate, setBtlRate] = useState<string>('5.5');
  const [btlArrangementFee, setBtlArrangementFee] = useState<string>('1000');
  const [btlLegalFees, setBtlLegalFees] = useState<string>('1000');
  const [btlValuationFee, setBtlValuationFee] = useState<string>('500');
  const [icrRequirement, setIcrRequirement] = useState<string>('145');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    // Bridging Phase
    bridgingLoanAmount: 0,
    bridgingDayOneLtv: 0,
    bridgingArrangementFeeAmount: 0,
    bridgingExitFeeAmount: 0,
    bridgingTotalInterest: 0,
    bridgingTotalCost: 0,
    // BTL Phase
    btlLoanAmount: 0,
    btlLtvActual: 0,
    btlMonthlyPayment: 0,
    btlAnnualInterest: 0,
    annualRent: 0,
    icr: 0,
    passesIcr: false,
    // Combined
    totalBridgingCost: 0,
    totalBtlSetupCost: 0,
    totalFinanceCost: 0,
    cashReleased: 0,
    moneyLeftInDeal: 0,
    monthlyCashflow: 0,
    annualCashflow: 0,
    cashOnCashReturn: 0,
    totalInvestment: 0,
    capitalRecycled: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const current = parseFloat(currentValue) || 0;
    const target = parseFloat(targetValue) || 0;
    const refurb = parseFloat(refurbCost) || 0;
    const rent = parseFloat(monthlyRent) || 0;

    // Bridging
    const bLtv = parseFloat(bridgingLtv) || 0;
    const bRate = parseFloat(bridgingRate) || 0;
    const bTerm = parseFloat(bridgingTerm) || 0;
    const bArrFee = parseFloat(bridgingArrangementFee) || 0;
    const bExtFee = parseFloat(bridgingExitFee) || 0;
    const bLegal = parseFloat(bridgingLegalFees) || 0;

    // BTL
    const btlLtvPercent = parseFloat(btlLtv) || 0;
    const btlRatePercent = parseFloat(btlRate) || 0;
    const btlArrFee = parseFloat(btlArrangementFee) || 0;
    const btlLegal = parseFloat(btlLegalFees) || 0;
    const btlVal = parseFloat(btlValuationFee) || 0;
    const icrReq = parseFloat(icrRequirement) || 145;

    // === BRIDGING PHASE ===
    const bridgingLoanAmount = current * (bLtv / 100);
    const bridgingDayOneLtv = current > 0 ? (bridgingLoanAmount / current) * 100 : 0;
    const bridgingArrangementFeeAmount = bridgingLoanAmount * (bArrFee / 100);
    const bridgingExitFeeAmount = bridgingLoanAmount * (bExtFee / 100);
    const bridgingMonthlyInterest = bridgingLoanAmount * (bRate / 100);
    const bridgingTotalInterest = bridgingMonthlyInterest * bTerm;
    const bridgingTotalCost = bridgingArrangementFeeAmount + bridgingExitFeeAmount + bridgingTotalInterest + bLegal;

    // === BTL REFINANCE PHASE ===
    const btlLoanAmount = target * (btlLtvPercent / 100);
    const btlLtvActual = target > 0 ? (btlLoanAmount / target) * 100 : 0;
    const btlMonthlyRate = btlRatePercent / 100 / 12;
    const btlMonthlyPayment = btlLoanAmount * btlMonthlyRate; // Interest only
    const btlAnnualInterest = btlMonthlyPayment * 12;
    const btlTotalSetupCost = btlArrFee + btlLegal + btlVal;

    // Rental analysis
    const annualRent = rent * 12;
    const icr = btlAnnualInterest > 0 ? (annualRent / btlAnnualInterest) * 100 : 0;
    const passesIcr = icr >= icrReq;

    // === COMBINED ANALYSIS ===
    const totalBridgingCost = bridgingTotalCost;
    const totalBtlSetupCost = btlTotalSetupCost;
    const totalFinanceCost = totalBridgingCost + totalBtlSetupCost;

    // Total investment = deposit + refurb + finance costs
    const depositPaid = purchase - bridgingLoanAmount;
    const totalInvestment = depositPaid + refurb + totalFinanceCost;

    // Cash released on refinance
    const cashReleased = btlLoanAmount - bridgingLoanAmount;

    // Money left in deal after refinance
    const moneyLeftInDeal = totalInvestment - cashReleased;

    // Capital recycled (percentage of original investment returned)
    const capitalRecycled = totalInvestment > 0 ? (cashReleased / totalInvestment) * 100 : 0;

    // Ongoing cashflow
    const monthlyCashflow = rent - btlMonthlyPayment;
    const annualCashflow = monthlyCashflow * 12;
    const cashOnCashReturn = moneyLeftInDeal > 0 ? (annualCashflow / moneyLeftInDeal) * 100 : 0;

    setDerivedMetrics({
      bridgingLoanAmount,
      bridgingDayOneLtv,
      bridgingArrangementFeeAmount,
      bridgingExitFeeAmount,
      bridgingTotalInterest,
      bridgingTotalCost,
      btlLoanAmount,
      btlLtvActual,
      btlMonthlyPayment,
      btlAnnualInterest,
      annualRent,
      icr,
      passesIcr,
      totalBridgingCost,
      totalBtlSetupCost,
      totalFinanceCost,
      cashReleased,
      moneyLeftInDeal,
      monthlyCashflow,
      annualCashflow,
      cashOnCashReturn,
      totalInvestment,
      capitalRecycled,
    });
  }, [purchasePrice, currentValue, targetValue, refurbCost, monthlyRent, bridgingLtv, bridgingRate, bridgingTerm, bridgingArrangementFee, bridgingExitFee, bridgingLegalFees, btlLtv, btlRate, btlArrangementFee, btlLegalFees, btlValuationFee, icrRequirement]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  // Capital recycled status
  const getRecycleStatus = () => {
    if (derivedMetrics.capitalRecycled >= 100) {
      return { tone: 'success' as const, accent: 'green' as const, label: 'All Money Out' };
    } else if (derivedMetrics.capitalRecycled >= 75) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Most Money Out' };
    }
    return { tone: 'neutral' as const, accent: 'teal' as const, label: 'Money In Deal' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      purchasePrice: parseFloat(purchasePrice) || 0,
      currentValue: parseFloat(currentValue) || 0,
      targetValue: parseFloat(targetValue) || 0,
      refurbCost: parseFloat(refurbCost) || 0,
      monthlyRent: parseFloat(monthlyRent) || 0,
      bridgingLtv: parseFloat(bridgingLtv) || 0,
      bridgingRate: parseFloat(bridgingRate) || 0,
      bridgingTerm: parseFloat(bridgingTerm) || 0,
      btlLtv: parseFloat(btlLtv) || 0,
      btlRate: parseFloat(btlRate) || 0,
      icrRequirement: parseFloat(icrRequirement) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <CalculatorPageLayout
      title="Bridge to Let Calculator"
      description="Model bridge-to-let exit strategies and refinance options. Calculate capital recycling and cash-on-cash returns."
      category="Bridging"
      categorySlug="bridging"
      categoryColor="#F59E0B"
      badges={[
        { label: getRecycleStatus().label, variant: getRecycleStatus().tone }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }} className="space-y-6">
            {/* Property Details */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Purchase Price"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="What you're paying"
                />
                <FloatingField
                  label="Current Value"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="OMV at purchase"
                />
                <FloatingField
                  label="Refurbishment Cost"
                  value={refurbCost}
                  onChange={(e) => setRefurbCost(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Total works budget"
                />
                <FloatingField
                  label="Target Value (Post-Works)"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Expected value after refurb"
                />
                <FloatingField
                  label="Expected Monthly Rent"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Rental income when let"
                />
              </div>
            </BentoCard>

            {/* Bridging Phase */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-red-400" />
                Phase 1: Bridging Loan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Bridging LTV"
                  value={bridgingLtv}
                  onChange={(e) => setBridgingLtv(e.target.value)}
                  unit="%"
                  helper="Typically 70-80%"
                />
                <FloatingField
                  label="Interest Rate"
                  value={bridgingRate}
                  onChange={(e) => setBridgingRate(e.target.value)}
                  unit="% pm"
                  helper="Monthly rate"
                />
                <FloatingField
                  label="Bridge Term"
                  value={bridgingTerm}
                  onChange={(e) => setBridgingTerm(e.target.value)}
                  unit="months"
                  helper="Expected holding period"
                />
                <FloatingField
                  label="Arrangement Fee"
                  value={bridgingArrangementFee}
                  onChange={(e) => setBridgingArrangementFee(e.target.value)}
                  unit="%"
                  helper="1.5-2.5% typical"
                />
                <FloatingField
                  label="Exit Fee"
                  value={bridgingExitFee}
                  onChange={(e) => setBridgingExitFee(e.target.value)}
                  unit="%"
                  helper="0-1.5% typical"
                />
                <FloatingField
                  label="Legal Fees"
                  value={bridgingLegalFees}
                  onChange={(e) => setBridgingLegalFees(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Lender's legal"
                />
              </div>
            </BentoCard>

            {/* BTL Phase */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Phase 2: BTL Refinance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="BTL LTV"
                  value={btlLtv}
                  onChange={(e) => setBtlLtv(e.target.value)}
                  unit="%"
                  helper="Typically 75% max"
                />
                <FloatingField
                  label="BTL Interest Rate"
                  value={btlRate}
                  onChange={(e) => setBtlRate(e.target.value)}
                  unit="% pa"
                  helper="Annual rate"
                />
                <FloatingField
                  label="ICR Requirement"
                  value={icrRequirement}
                  onChange={(e) => setIcrRequirement(e.target.value)}
                  unit="%"
                  helper="Lender's ICR (125-145%)"
                />
                <FloatingField
                  label="Arrangement Fee"
                  value={btlArrangementFee}
                  onChange={(e) => setBtlArrangementFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Lender product fee"
                />
                <FloatingField
                  label="Legal Fees"
                  value={btlLegalFees}
                  onChange={(e) => setBtlLegalFees(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                />
                <FloatingField
                  label="Valuation Fee"
                  value={btlValuationFee}
                  onChange={(e) => setBtlValuationFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                />
              </div>
            </BentoCard>

            {/* Timeline Visualization */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Bridge to Let Journey
              </h2>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-400 font-bold">1</span>
                  </div>
                  <p className="text-sm font-medium">Purchase</p>
                  <p className="text-xs text-slate-500">{formatCurrency(parseFloat(purchasePrice) || 0)}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-slate-600" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-amber-400 font-bold">2</span>
                  </div>
                  <p className="text-sm font-medium">Refurb</p>
                  <p className="text-xs text-slate-500">{formatCurrency(parseFloat(refurbCost) || 0)}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-slate-600" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <p className="text-sm font-medium">Refinance</p>
                  <p className="text-xs text-slate-500">{formatCurrency(parseFloat(targetValue) || 0)}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-slate-600" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400 font-bold">4</span>
                  </div>
                  <p className="text-sm font-medium">Hold & Let</p>
                  <p className="text-xs text-slate-500">{formatCurrency(parseFloat(monthlyRent) || 0)}/mo</p>
                </div>
              </div>
            </BentoCard>

            {/* Calculate Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate Bridge to Let
              </button>
            </div>
            </form>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            <CalculatorResultsGate
              calculatorType="Bridge to Let Calculator"
              calculatorSlug="bridge-to-let-calculator"
              formData={{
                purchasePrice,
                currentValue,
                targetValue,
                refurbCost,
                monthlyRent,
                bridgingLtv,
                bridgingRate,
                bridgingTerm,
                btlLtv,
                btlRate
              }}
              hasCalculated={hasCalculated}
            >
            {/* Bridging Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Bridging Phase</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Bridge Loan"
                  value={formatCurrency(derivedMetrics.bridgingLoanAmount)}
                  helper={`${bridgingLtv}% LTV`}
                />
                <DealMetric
                  label="Total Interest"
                  value={formatCurrency(derivedMetrics.bridgingTotalInterest)}
                  helper={`${bridgingTerm} months`}
                />
                <DealMetric
                  label="Bridging Fees"
                  value={formatCurrency(derivedMetrics.bridgingArrangementFeeAmount + derivedMetrics.bridgingExitFeeAmount)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Bridge Cost"
                    value={formatCurrency(derivedMetrics.bridgingTotalCost)}
                    accent="orange"
                  />
                </div>
              </div>
            </BentoCard>

            {/* BTL Refinance */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">BTL Refinance</h2>
              <div className="space-y-3">
                <DealMetric
                  label="BTL Loan"
                  value={formatCurrency(derivedMetrics.btlLoanAmount)}
                  helper={`${btlLtv}% of ${formatCurrency(parseFloat(targetValue) || 0)}`}
                />
                <DealMetric
                  label="ICR"
                  value={formatPercent(derivedMetrics.icr)}
                  accent={derivedMetrics.passesIcr ? 'green' : 'orange'}
                  helper={derivedMetrics.passesIcr ? 'Passes stress test' : 'Below requirement'}
                />
                <DealMetric
                  label="Monthly Interest"
                  value={formatCurrency(derivedMetrics.btlMonthlyPayment)}
                  helper="Interest only"
                />
              </div>
            </BentoCard>

            {/* Capital Recycling */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Capital Recycling</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Total Investment"
                  value={formatCurrency(derivedMetrics.totalInvestment)}
                  helper="Deposit + refurb + costs"
                />
                <DealMetric
                  label="Cash Released"
                  value={formatCurrency(derivedMetrics.cashReleased)}
                  helper="On refinance"
                  accent={derivedMetrics.cashReleased > 0 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Money Left in Deal"
                  value={formatCurrency(derivedMetrics.moneyLeftInDeal)}
                  helper={formatPercent(100 - derivedMetrics.capitalRecycled) + ' of investment'}
                />
                <DealMetric
                  label="Capital Recycled"
                  value={formatPercent(derivedMetrics.capitalRecycled)}
                  accent={getRecycleStatus().accent}
                />
              </div>
            </BentoCard>

            {/* Ongoing Returns */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Ongoing Returns</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Monthly Cashflow"
                  value={formatCurrency(derivedMetrics.monthlyCashflow)}
                  accent={derivedMetrics.monthlyCashflow > 0 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Annual Cashflow"
                  value={formatCurrency(derivedMetrics.annualCashflow)}
                />
                <DealMetric
                  label="Cash on Cash Return"
                  value={formatPercent(derivedMetrics.cashOnCashReturn)}
                  helper="On money left in deal"
                  accent={derivedMetrics.cashOnCashReturn >= 10 ? 'green' : 'orange'}
                />
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Bridge to Let Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your Bridge to Let calculation."
              highlights={[]}
              confidence={0.85}
            />
            </CalculatorResultsGate>
          </div>
        </div>

        <CalculatorSEO
          calculatorName="Bridge to Let Calculator"
          calculatorSlug="bridge-to-let-calculator"
          description="The Bridge to Let Calculator helps UK property investors model bridge-to-let exit strategies. Calculate capital recycling, refinance options, and ongoing cashflow when transitioning from bridging finance to a buy-to-let mortgage after refurbishment."
          howItWorks={`Bridge to let is a two-phase financing strategy:

Phase 1: Bridging Finance
- Purchase property with bridging loan (typically 70-80% LTV)
- Complete refurbishment works (3-9 months typical)
- Fund works through staged drawdown or upfront facility
- Pay monthly bridging interest during refurb period

Phase 2: BTL Refinance
- Property revalued at higher post-refurb value
- Take out buy-to-let mortgage (typically 75% of new value)
- Use BTL proceeds to repay bridge loan
- Generate monthly rental income going forward

The calculator shows you how much capital you can recycle through refinancing, what cash will be left in the deal, and your ongoing cashflow from rental income after mortgage payments.`}
          whenToUse="Use this calculator when planning value-add property investments where you intend to hold as a rental. It's ideal for properties requiring refurbishment where you want to refinance onto a long-term BTL mortgage rather than selling. Essential for understanding if the refinance will release enough capital and if the rent covers the mortgage."
          keyFeatures={[
            "Two-phase cost modeling (bridge + BTL)",
            "Capital recycling analysis",
            "ICR stress test calculations",
            "Monthly cashflow projections",
          ]}
          faqs={[
            {
              question: "What is bridge to let financing?",
              answer: "Bridge to let is a property investment strategy where you use short-term bridging finance to purchase and refurbish a property, then refinance onto a long-term buy-to-let mortgage once works are complete. This allows you to add value during the bridge period, then refinance at the higher value."
            },
            {
              question: "How much can I recycle with bridge to let?",
              answer: "If you add sufficient value through refurbishment, you can often recycle 75-100% of your initial capital. For example: buy at £200k, spend £30k on refurb, refinance at £300k (75% LTV = £225k advance). This returns most of your £230k investment."
            },
            {
              question: "What is ICR and why does it matter?",
              answer: "Interest Coverage Ratio (ICR) is the rental income divided by the mortgage interest cost. Most BTL lenders require 125-145% ICR, meaning the rent must be 25-45% higher than the mortgage payment. This ensures you can afford the mortgage even if interest rates rise."
            },
            {
              question: "How long does a typical bridge to let take?",
              answer: "Bridge to let projects typically take 6-12 months from purchase to BTL refinance. This includes 3-6 months for refurbishment, plus 2-3 months for tenant placement and BTL mortgage application. Plan for 9-12 months of bridging costs in your budget."
            },
            {
              question: "Can I get 100% of refurb costs from the bridge?",
              answer: "Many bridging lenders will fund up to 100% of refurbishment costs as part of the facility. This is typically drawn in staged payments as works are completed and inspected. Some lenders offer upfront release, while others require works to be certified before releasing funds."
            },
          ]}
          relatedTerms={[
            "Bridge to let UK",
            "Capital recycling property",
            "BTL refinance strategy",
            "Refurbishment bridging",
            "Interest coverage ratio",
            "Staged drawdown",
            "Buy refurbish rent",
            "Value-add property",
            "Bridge to BTL mortgage",
            "Property refinancing UK",
          ]}
          categoryColor="#F59E0B"
        />
    </CalculatorPageLayout>
  );
}
