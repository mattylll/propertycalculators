'use client';

import { useState, useEffect } from 'react';
import {
  Hammer,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';

// Refurbishment bridge rate guidance
const REFURB_BRIDGE_RATES = {
  light: { ltv: 75, rate: { min: 0.75, max: 1.1 }, label: 'Light Refurb' },
  heavy: { ltv: 70, rate: { min: 0.85, max: 1.25 }, label: 'Heavy Refurb' },
};

type RefurbType = 'light' | 'heavy';
type DrawdownStructure = 'upfront' | 'staged' | 'arrears';

export default function RefurbishmentBridgeCalculatorPage() {
  // Property Values
  const [purchasePrice, setPurchasePrice] = useState<string>('200000');
  const [currentValue, setCurrentValue] = useState<string>('200000');
  const [refurbCost, setRefurbCost] = useState<string>('50000');
  const [afterRefurbValue, setAfterRefurbValue] = useState<string>('300000');

  // Loan Details
  const [refurbType, setRefurbType] = useState<RefurbType>('light');
  const [drawdownStructure, setDrawdownStructure] = useState<DrawdownStructure>('staged');
  const [interestRate, setInterestRate] = useState<string>('0.95');
  const [loanTerm, setLoanTerm] = useState<string>('12');
  const [arrangementFee, setArrangementFee] = useState<string>('2');
  const [exitFee, setExitFee] = useState<string>('1');
  const [valuationFee, setValuationFee] = useState<string>('1500');
  const [legalFees, setLegalFees] = useState<string>('2500');

  // Funding Percentages
  const [purchaseLtv, setPurchaseLtv] = useState<string>('75');
  const [refurbFundingPercent, setRefurbFundingPercent] = useState<string>('100');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    purchaseLoanAmount: 0,
    refurbFundingAmount: 0,
    totalFacility: 0,
    dayOneLtv: 0,
    gdltv: 0,
    ltvOnArv: 0,
    monthlyInterestCost: 0,
    totalInterestCost: 0,
    averageInterest: 0,
    arrangementFeeAmount: 0,
    exitFeeAmount: 0,
    totalFees: 0,
    grossCostOfFunds: 0,
    netDayOneAdvance: 0,
    totalProjectCost: 0,
    equityRequired: 0,
    potentialProfit: 0,
    returnOnEquity: 0,
    profitOnCost: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const current = parseFloat(currentValue) || 0;
    const refurb = parseFloat(refurbCost) || 0;
    const arv = parseFloat(afterRefurbValue) || 0;
    const ltv = parseFloat(purchaseLtv) || 0;
    const refurbFunding = parseFloat(refurbFundingPercent) || 0;
    const rate = parseFloat(interestRate) || 0;
    const term = parseFloat(loanTerm) || 0;
    const arrFee = parseFloat(arrangementFee) || 0;
    const extFee = parseFloat(exitFee) || 0;
    const valFee = parseFloat(valuationFee) || 0;
    const legFees = parseFloat(legalFees) || 0;

    // Loan amounts
    const purchaseLoanAmount = purchase * (ltv / 100);
    const refurbFundingAmount = refurb * (refurbFunding / 100);
    const totalFacility = purchaseLoanAmount + refurbFundingAmount;

    // LTV calculations
    const dayOneLtv = current > 0 ? (purchaseLoanAmount / current) * 100 : 0;
    const gdltv = arv > 0 ? (totalFacility / arv) * 100 : 0;
    const ltvOnArv = arv > 0 ? (purchaseLoanAmount / arv) * 100 : 0;

    // Interest calculations
    // For staged drawdown, we assume refurb funds drawn at 50% average over term
    let averageBalance = purchaseLoanAmount;
    if (drawdownStructure === 'staged') {
      averageBalance = purchaseLoanAmount + (refurbFundingAmount * 0.5);
    } else if (drawdownStructure === 'upfront') {
      averageBalance = totalFacility;
    }
    // For arrears, interest is only on purchase amount until works certified

    const monthlyInterestCost = averageBalance * (rate / 100);
    const totalInterestCost = monthlyInterestCost * term;
    const averageInterest = totalFacility > 0 ? (totalInterestCost / totalFacility) * 100 : 0;

    // Fees
    const arrangementFeeAmount = totalFacility * (arrFee / 100);
    const exitFeeAmount = totalFacility * (extFee / 100);
    const totalFees = arrangementFeeAmount + exitFeeAmount + valFee + legFees;

    // Gross cost of funds
    const grossCostOfFunds = totalInterestCost + totalFees;

    // Net day one advance (after retained interest and fees if applicable)
    const retainedInterest = drawdownStructure === 'upfront' ? totalInterestCost : 0;
    const netDayOneAdvance = purchaseLoanAmount - arrangementFeeAmount - valFee - legFees - retainedInterest;

    // Total project cost
    const totalProjectCost = purchase + refurb + grossCostOfFunds;

    // Equity required
    const depositRequired = purchase - purchaseLoanAmount;
    const refurbNotFunded = refurb - refurbFundingAmount;
    const equityRequired = depositRequired + refurbNotFunded + totalFees;

    // Potential profit
    const potentialProfit = arv - totalProjectCost;

    // Return metrics
    const returnOnEquity = equityRequired > 0 ? (potentialProfit / equityRequired) * 100 : 0;
    const profitOnCost = totalProjectCost > 0 ? (potentialProfit / totalProjectCost) * 100 : 0;

    setDerivedMetrics({
      purchaseLoanAmount,
      refurbFundingAmount,
      totalFacility,
      dayOneLtv,
      gdltv,
      ltvOnArv,
      monthlyInterestCost,
      totalInterestCost,
      averageInterest,
      arrangementFeeAmount,
      exitFeeAmount,
      totalFees,
      grossCostOfFunds,
      netDayOneAdvance,
      totalProjectCost,
      equityRequired,
      potentialProfit,
      returnOnEquity,
      profitOnCost,
    });
  }, [purchasePrice, currentValue, refurbCost, afterRefurbValue, purchaseLtv, refurbFundingPercent, interestRate, loanTerm, arrangementFee, exitFee, valuationFee, legalFees, drawdownStructure]);

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

  // GDLTV status
  const getGdltvStatus = () => {
    const maxLtv = refurbType === 'light' ? REFURB_BRIDGE_RATES.light.ltv : REFURB_BRIDGE_RATES.heavy.ltv;
    if (derivedMetrics.gdltv <= maxLtv - 5) {
      return { tone: 'success' as const, accent: 'green' as const, label: 'Low GDLTV' };
    } else if (derivedMetrics.gdltv <= maxLtv) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Near Max' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'Over Max' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      purchasePrice: parseFloat(purchasePrice) || 0,
      currentValue: parseFloat(currentValue) || 0,
      refurbCost: parseFloat(refurbCost) || 0,
      afterRefurbValue: parseFloat(afterRefurbValue) || 0,
      refurbType,
      drawdownStructure,
      purchaseLtv: parseFloat(purchaseLtv) || 0,
      refurbFundingPercent: parseFloat(refurbFundingPercent) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseFloat(loanTerm) || 0,
      arrangementFee: parseFloat(arrangementFee) || 0,
      exitFee: parseFloat(exitFee) || 0,
      valuationFee: parseFloat(valuationFee) || 0,
      legalFees: parseFloat(legalFees) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <CalculatorPageLayout
      title="Refurbishment Bridge Calculator"
      description="Calculate light and heavy refurbishment bridging options. Model staged drawdown and GDLTV analysis."
      category="Bridging"
      categorySlug="bridging"
      categoryColor="#F59E0B"
      badges={[
        { label: getGdltvStatus().label, variant: getGdltvStatus().tone }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Values */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Property Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Purchase Price"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="What you're paying for the property"
                />
                <FloatingField
                  label="Current Value"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Open market value today"
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
                  label="After Refurb Value (ARV)"
                  value={afterRefurbValue}
                  onChange={(e) => setAfterRefurbValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Expected value post-works"
                />
              </div>
            </BentoCard>

            {/* Loan Structure */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-400" />
                Loan Structure
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Refurb Type</label>
                  <select
                    value={refurbType}
                    onChange={(e) => setRefurbType(e.target.value as RefurbType)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="light">Light Refurb (cosmetic)</option>
                    <option value="heavy">Heavy Refurb (structural)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Light: up to {REFURB_BRIDGE_RATES.light.ltv}% LTV | Heavy: up to {REFURB_BRIDGE_RATES.heavy.ltv}% LTV
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Drawdown Structure</label>
                  <select
                    value={drawdownStructure}
                    onChange={(e) => setDrawdownStructure(e.target.value as DrawdownStructure)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="staged">Staged (in tranches)</option>
                    <option value="upfront">All Upfront</option>
                    <option value="arrears">In Arrears</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    How refurb funds are released
                  </p>
                </div>
                <FloatingField
                  label="Loan Term"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  unit="months"
                  helper="6-24 months typical"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Purchase LTV"
                  value={purchaseLtv}
                  onChange={(e) => setPurchaseLtv(e.target.value)}
                  unit="%"
                  helper="LTV on purchase/current value"
                />
                <FloatingField
                  label="Refurb Funding"
                  value={refurbFundingPercent}
                  onChange={(e) => setRefurbFundingPercent(e.target.value)}
                  unit="%"
                  helper="% of works funded (up to 100%)"
                />
              </div>
            </BentoCard>

            {/* Rates & Fees */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Rates & Fees
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Interest Rate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  unit="% pm"
                  helper={`Typical: ${REFURB_BRIDGE_RATES[refurbType].rate.min}% - ${REFURB_BRIDGE_RATES[refurbType].rate.max}% pm`}
                />
                <FloatingField
                  label="Arrangement Fee"
                  value={arrangementFee}
                  onChange={(e) => setArrangementFee(e.target.value)}
                  unit="%"
                  helper="Lender fee (1.5-2.5% typical)"
                />
                <FloatingField
                  label="Exit Fee"
                  value={exitFee}
                  onChange={(e) => setExitFee(e.target.value)}
                  unit="%"
                  helper="Redemption fee (0-1.5%)"
                />
                <FloatingField
                  label="Valuation Fee"
                  value={valuationFee}
                  onChange={(e) => setValuationFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="RICS valuation cost"
                />
                <FloatingField
                  label="Legal Fees"
                  value={legalFees}
                  onChange={(e) => setLegalFees(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Lender's solicitor fees"
                />
              </div>
            </BentoCard>

            {/* Refurb Bridge Info */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Refurbishment Bridge Guide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-amber-400 mb-2">Light Refurb</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Cosmetic works only</li>
                    <li>• No structural changes</li>
                    <li>• Up to {REFURB_BRIDGE_RATES.light.ltv}% LTV</li>
                    <li>• {REFURB_BRIDGE_RATES.light.rate.min}-{REFURB_BRIDGE_RATES.light.rate.max}% pm typical</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-red-400 mb-2">Heavy Refurb</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Structural works allowed</li>
                    <li>• Extensions, conversions</li>
                    <li>• Up to {REFURB_BRIDGE_RATES.heavy.ltv}% LTV</li>
                    <li>• {REFURB_BRIDGE_RATES.heavy.rate.min}-{REFURB_BRIDGE_RATES.heavy.rate.max}% pm typical</li>
                  </ul>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Facility Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Purchase Loan"
                  value={formatCurrency(derivedMetrics.purchaseLoanAmount)}
                  helper={`${purchaseLtv}% LTV`}
                />
                <DealMetric
                  label="Refurb Funding"
                  value={formatCurrency(derivedMetrics.refurbFundingAmount)}
                  helper={`${refurbFundingPercent}% of works`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Facility"
                    value={formatCurrency(derivedMetrics.totalFacility)}
                    accent="teal"
                  />
                </div>
              </div>
            </BentoCard>

            {/* LTV Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">LTV Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Day 1 LTV"
                  value={formatPercent(derivedMetrics.dayOneLtv)}
                  helper="On current value"
                />
                <DealMetric
                  label="GDLTV"
                  value={formatPercent(derivedMetrics.gdltv)}
                  helper="Gross loan to ARV"
                  accent={getGdltvStatus().accent}
                />
                <DealMetric
                  label="Purchase LTV on ARV"
                  value={formatPercent(derivedMetrics.ltvOnArv)}
                  helper="Day 1 loan vs ARV"
                />
              </div>
            </BentoCard>

            {/* Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Finance Costs</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Monthly Interest"
                  value={formatCurrency(derivedMetrics.monthlyInterestCost)}
                  helper="Average monthly cost"
                />
                <DealMetric
                  label="Total Interest"
                  value={formatCurrency(derivedMetrics.totalInterestCost)}
                  helper={`Over ${loanTerm} months`}
                />
                <DealMetric
                  label="Total Fees"
                  value={formatCurrency(derivedMetrics.totalFees)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Gross Cost of Funds"
                    value={formatCurrency(derivedMetrics.grossCostOfFunds)}
                    accent="orange"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Returns */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Project Returns</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Equity Required"
                  value={formatCurrency(derivedMetrics.equityRequired)}
                  helper="Cash needed to complete"
                />
                <DealMetric
                  label="Potential Profit"
                  value={formatCurrency(derivedMetrics.potentialProfit)}
                  accent={derivedMetrics.potentialProfit > 0 ? 'green' : 'orange'}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Return on Equity"
                    value={formatPercent(derivedMetrics.returnOnEquity)}
                    accent={derivedMetrics.returnOnEquity >= 20 ? 'green' : 'orange'}
                  />
                  <DealMetric
                    label="Profit on Cost"
                    value={formatPercent(derivedMetrics.profitOnCost)}
                    accent={derivedMetrics.profitOnCost >= 15 ? 'green' : 'orange'}
                  />
                </div>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Refurbishment Bridge Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your Refurbishment Bridge calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
    </CalculatorPageLayout>
  );
}
