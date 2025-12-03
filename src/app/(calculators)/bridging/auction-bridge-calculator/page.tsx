'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gavel,
  Clock,
  AlertTriangle,
  Info,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

export default function AuctionBridgeCalculatorPage() {
  // Auction Details
  const [winningBid, setWinningBid] = useState<string>('180000');
  const [auctionFees, setAuctionFees] = useState<string>('2');
  const [currentValue, setCurrentValue] = useState<string>('200000');
  const [completionDays, setCompletionDays] = useState<string>('28');

  // Strategy
  const [exitStrategy, setExitStrategy] = useState<'sell' | 'refinance' | 'hold'>('refinance');
  const [plannedRefurb, setPlannedRefurb] = useState<string>('20000');
  const [exitValue, setExitValue] = useState<string>('260000');
  const [expectedHoldingPeriod, setExpectedHoldingPeriod] = useState<string>('6');

  // Bridge Finance
  const [bridgingLtv, setBridgingLtv] = useState<string>('75');
  const [interestRate, setInterestRate] = useState<string>('0.95');
  const [arrangementFee, setArrangementFee] = useState<string>('2');
  const [exitFee, setExitFee] = useState<string>('1');
  const [valuationFee, setValuationFee] = useState<string>('1200');
  const [legalFees, setLegalFees] = useState<string>('2000');
  const [interestRetention, setInterestRetention] = useState<string>('6');

  // Deposit
  const [depositPaid, setDepositPaid] = useState<string>('18000');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    totalPurchaseCost: 0,
    auctionFeeAmount: 0,
    bridgeLoanAmount: 0,
    dayOneLtv: 0,
    gdltv: 0,
    arrangementFeeAmount: 0,
    exitFeeAmount: 0,
    monthlyInterest: 0,
    retainedInterest: 0,
    totalInterestCost: 0,
    totalFinanceCost: 0,
    netDayOneAdvance: 0,
    cashRequired: 0,
    totalProjectCost: 0,
    expectedProfit: 0,
    profitOnCost: 0,
    returnOnCash: 0,
    daysToComplete: 0,
    isViable: false,
  });

  // Calculate derived metrics
  useEffect(() => {
    const bid = parseFloat(winningBid) || 0;
    const auctFeePercent = parseFloat(auctionFees) || 0;
    const current = parseFloat(currentValue) || 0;
    const completeDays = parseFloat(completionDays) || 28;
    const refurb = parseFloat(plannedRefurb) || 0;
    const exit = parseFloat(exitValue) || 0;
    const holdPeriod = parseFloat(expectedHoldingPeriod) || 0;
    const ltv = parseFloat(bridgingLtv) || 0;
    const rate = parseFloat(interestRate) || 0;
    const arrFee = parseFloat(arrangementFee) || 0;
    const extFee = parseFloat(exitFee) || 0;
    const valFee = parseFloat(valuationFee) || 0;
    const legFees = parseFloat(legalFees) || 0;
    const retainedMonths = parseFloat(interestRetention) || 0;
    const deposit = parseFloat(depositPaid) || 0;

    // Auction fees
    const auctionFeeAmount = bid * (auctFeePercent / 100);
    const totalPurchaseCost = bid + auctionFeeAmount;

    // Bridge loan amount (based on current value)
    const bridgeLoanAmount = current * (ltv / 100);

    // LTV calculations
    const dayOneLtv = current > 0 ? (bridgeLoanAmount / current) * 100 : 0;
    const totalFacility = bridgeLoanAmount; // For auction bridge, typically just purchase
    const gdltv = exit > 0 ? ((bridgeLoanAmount + refurb) / exit) * 100 : 0;

    // Fees
    const arrangementFeeAmount = bridgeLoanAmount * (arrFee / 100);
    const exitFeeAmount = bridgeLoanAmount * (extFee / 100);

    // Interest
    const monthlyInterest = bridgeLoanAmount * (rate / 100);
    const retainedInterest = monthlyInterest * retainedMonths;
    const totalInterestCost = monthlyInterest * holdPeriod;

    // Total finance cost
    const totalFinanceCost = arrangementFeeAmount + exitFeeAmount + totalInterestCost + valFee + legFees;

    // Net day one advance (what you actually receive)
    const netDayOneAdvance = bridgeLoanAmount - arrangementFeeAmount - valFee - legFees - retainedInterest;

    // Cash required to complete
    // Need to pay: total purchase cost - deposit already paid - net advance
    const balanceToPay = totalPurchaseCost - deposit;
    const cashRequired = Math.max(0, balanceToPay - netDayOneAdvance + refurb);

    // Total project cost
    const totalProjectCost = totalPurchaseCost + refurb + totalFinanceCost;

    // Expected profit
    const expectedProfit = exit - totalProjectCost;

    // Returns
    const profitOnCost = totalProjectCost > 0 ? (expectedProfit / totalProjectCost) * 100 : 0;
    const returnOnCash = cashRequired > 0 ? (expectedProfit / cashRequired) * 100 : 0;

    // Days to complete
    const daysToComplete = completeDays;

    // Is it viable?
    const isViable = expectedProfit > 0 && dayOneLtv <= 80 && cashRequired <= (deposit + refurb);

    setDerivedMetrics({
      totalPurchaseCost,
      auctionFeeAmount,
      bridgeLoanAmount,
      dayOneLtv,
      gdltv,
      arrangementFeeAmount,
      exitFeeAmount,
      monthlyInterest,
      retainedInterest,
      totalInterestCost,
      totalFinanceCost,
      netDayOneAdvance,
      cashRequired,
      totalProjectCost,
      expectedProfit,
      profitOnCost,
      returnOnCash,
      daysToComplete,
      isViable,
    });
  }, [winningBid, auctionFees, currentValue, completionDays, plannedRefurb, exitValue, expectedHoldingPeriod, bridgingLtv, interestRate, arrangementFee, exitFee, valuationFee, legalFees, interestRetention, depositPaid]);

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

  // Get completion urgency status
  const getCompletionStatus = (): { tone: 'warning' | 'success' | 'info' | 'neutral'; label: string } => {
    const days = parseFloat(completionDays) || 0;
    if (days <= 20) {
      return { tone: 'warning', label: 'Very Tight' };
    } else if (days <= 28) {
      return { tone: 'info', label: 'Standard' };
    }
    return { tone: 'success', label: 'Comfortable' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      winningBid: parseFloat(winningBid) || 0,
      auctionFees: parseFloat(auctionFees) || 0,
      currentValue: parseFloat(currentValue) || 0,
      completionDays: parseFloat(completionDays) || 0,
      exitStrategy,
      plannedRefurb: parseFloat(plannedRefurb) || 0,
      exitValue: parseFloat(exitValue) || 0,
      expectedHoldingPeriod: parseFloat(expectedHoldingPeriod) || 0,
      bridgingLtv: parseFloat(bridgingLtv) || 0,
      interestRate: parseFloat(interestRate) || 0,
      depositPaid: parseFloat(depositPaid) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/bridging"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bridging</span>
          </Link>
          <div className="flex items-center gap-2">
            <StatusPill tone={getCompletionStatus().tone} label={`${completionDays} Days`} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Gavel className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Auction Bridge Calculator</h1>
              <p className="text-slate-400">
                Calculate bridging for auction purchases with 28-day completion
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Details */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                Auction Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Winning Bid"
                  value={winningBid}
                  onChange={(e) => setWinningBid(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Hammer price"
                />
                <FloatingField
                  label="Auction Fees"
                  value={auctionFees}
                  onChange={(e) => setAuctionFees(e.target.value)}
                  unit="%"
                  helper="Buyer's premium (typically 2%)"
                />
                <FloatingField
                  label="Current Market Value"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="OMV for lending purposes"
                />
                <FloatingField
                  label="Completion Deadline"
                  value={completionDays}
                  onChange={(e) => setCompletionDays(e.target.value)}
                  unit="days"
                  helper="Typically 28 days from auction"
                />
              </div>
              <div className="mt-4">
                <FloatingField
                  label="Deposit Already Paid"
                  value={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="10% paid at auction (non-refundable)"
                />
              </div>
            </BentoCard>

            {/* Exit Strategy */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-400" />
                Exit Strategy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {(['sell', 'refinance', 'hold'] as const).map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => setExitStrategy(strategy)}
                    className={`p-4 rounded-lg border transition-all ${exitStrategy === strategy ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    <p className="font-medium capitalize">{strategy}</p>
                    <p className="text-xs mt-1">
                      {strategy === 'sell' && 'Flip for profit'}
                      {strategy === 'refinance' && 'BTL mortgage exit'}
                      {strategy === 'hold' && 'Keep as rental'}
                    </p>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Planned Refurb"
                  value={plannedRefurb}
                  onChange={(e) => setPlannedRefurb(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Works budget"
                />
                <FloatingField
                  label="Exit Value"
                  value={exitValue}
                  onChange={(e) => setExitValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper={exitStrategy === 'sell' ? 'Sale price' : 'Refinance value'}
                />
                <FloatingField
                  label="Holding Period"
                  value={expectedHoldingPeriod}
                  onChange={(e) => setExpectedHoldingPeriod(e.target.value)}
                  unit="months"
                  helper="Time until exit"
                />
              </div>
            </BentoCard>

            {/* Bridge Finance */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Bridge Finance Terms
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
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  unit="% pm"
                  helper="Monthly rate"
                />
                <FloatingField
                  label="Interest Retention"
                  value={interestRetention}
                  onChange={(e) => setInterestRetention(e.target.value)}
                  unit="months"
                  helper="Months retained upfront"
                />
                <FloatingField
                  label="Arrangement Fee"
                  value={arrangementFee}
                  onChange={(e) => setArrangementFee(e.target.value)}
                  unit="%"
                  helper="1.5-2.5% typical"
                />
                <FloatingField
                  label="Exit Fee"
                  value={exitFee}
                  onChange={(e) => setExitFee(e.target.value)}
                  unit="%"
                  helper="0-1.5% typical"
                />
                <FloatingField
                  label="Valuation Fee"
                  value={valuationFee}
                  onChange={(e) => setValuationFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                />
                <FloatingField
                  label="Legal Fees"
                  value={legalFees}
                  onChange={(e) => setLegalFees(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                />
              </div>
            </BentoCard>

            {/* Auction Timeline Warning */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Auction Timeline Checklist
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Day 0: Pay 10% deposit at auction</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Day 1-3: Submit bridging application</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Day 3-7: Valuation instructed</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Day 7-14: Legal due diligence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Day 14-21: Offer issued</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Day 28: MUST complete (or lose deposit)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Critical:</strong> If you fail to complete within {completionDays} days, you will lose your {formatCurrency(parseFloat(depositPaid) || 0)} deposit and may face additional penalties.
                </p>
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Purchase Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Purchase Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Winning Bid"
                  value={formatCurrency(parseFloat(winningBid) || 0)}
                />
                <DealMetric
                  label="Auction Fees"
                  value={formatCurrency(derivedMetrics.auctionFeeAmount)}
                  helper={`${auctionFees}% buyer's premium`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Purchase Cost"
                    value={formatCurrency(derivedMetrics.totalPurchaseCost)}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Finance Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Bridge Finance</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Bridge Loan"
                  value={formatCurrency(derivedMetrics.bridgeLoanAmount)}
                  helper={`${bridgingLtv}% LTV`}
                />
                <DealMetric
                  label="Day 1 LTV"
                  value={formatPercent(derivedMetrics.dayOneLtv)}
                  accent={derivedMetrics.dayOneLtv <= 75 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Net Day 1 Advance"
                  value={formatCurrency(derivedMetrics.netDayOneAdvance)}
                  helper="After fees & retained interest"
                />
              </div>
            </BentoCard>

            {/* Cash Required */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Cash Required</h2>
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {formatCurrency(derivedMetrics.cashRequired)}
              </div>
              <p className="text-sm text-slate-400 mb-4">
                To complete purchase + refurb
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit paid:</span>
                  <span className="text-green-400">-{formatCurrency(parseFloat(depositPaid) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bridge advance:</span>
                  <span className="text-green-400">-{formatCurrency(derivedMetrics.netDayOneAdvance)}</span>
                </div>
              </div>
            </BentoCard>

            {/* Finance Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Finance Costs</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Arrangement Fee"
                  value={formatCurrency(derivedMetrics.arrangementFeeAmount)}
                />
                <DealMetric
                  label="Total Interest"
                  value={formatCurrency(derivedMetrics.totalInterestCost)}
                  helper={`${expectedHoldingPeriod} months`}
                />
                <DealMetric
                  label="Exit Fee"
                  value={formatCurrency(derivedMetrics.exitFeeAmount)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Finance Cost"
                    value={formatCurrency(derivedMetrics.totalFinanceCost)}
                    accent="orange"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Profit Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Profit Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Total Project Cost"
                  value={formatCurrency(derivedMetrics.totalProjectCost)}
                />
                <DealMetric
                  label="Expected Profit"
                  value={formatCurrency(derivedMetrics.expectedProfit)}
                  accent={derivedMetrics.expectedProfit > 0 ? 'green' : 'orange'}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Profit on Cost"
                    value={formatPercent(derivedMetrics.profitOnCost)}
                    accent={derivedMetrics.profitOnCost >= 15 ? 'green' : 'orange'}
                  />
                  <DealMetric
                    label="Return on Cash"
                    value={formatPercent(derivedMetrics.returnOnCash)}
                    helper="On cash invested"
                  />
                </div>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Auction Bridge Analysis"
              status="ready"
              response={`Based on your inputs, this auction purchase ${derivedMetrics.isViable ? 'appears viable' : 'needs review'}. You're bidding ${formatCurrency(parseFloat(winningBid) || 0)} with a ${formatPercent(derivedMetrics.dayOneLtv)} LTV bridge. The expected profit is ${formatCurrency(derivedMetrics.expectedProfit)} (${formatPercent(derivedMetrics.profitOnCost)} return on cost). You'll need ${formatCurrency(derivedMetrics.cashRequired)} cash to complete. Remember: with only ${completionDays} days to complete, speed is critical.`}
              highlights={[
                { label: 'CASH REQUIRED', value: formatCurrency(derivedMetrics.cashRequired) },
                { label: 'EXPECTED PROFIT', value: formatCurrency(derivedMetrics.expectedProfit) }
              ]}
              confidence={derivedMetrics.isViable ? 0.88 : 0.65}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
