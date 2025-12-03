'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calculator,
  XCircle,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

export default function HMOFinanceCalculatorPage() {
  // Property & Loan Inputs
  const [propertyValue, setPropertyValue] = useState<string>('350000');
  const [deposit, setDeposit] = useState<string>('87500');
  const [numberOfRooms, setNumberOfRooms] = useState<string>('5');
  const [rentPerRoom, setRentPerRoom] = useState<string>('650');
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [loanTerm, setLoanTerm] = useState<string>('25');
  const [stressTestRate, setStressTestRate] = useState<string>('8.5');
  const [icrRequirement, setIcrRequirement] = useState<string>('145');
  const [managementFee, setManagementFee] = useState<string>('15');
  const [voidAllowance, setVoidAllowance] = useState<string>('8');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    loanAmount: 0,
    ltv: 0,
    grossRent: 0,
    netRent: 0,
    monthlyInterest: 0,
    monthlyCapitalRepayment: 0,
    monthlyPayment: 0,
    icr: 0,
    stressedIcr: 0,
    maxLoanByIcr: 0,
    passesStressTest: false,
    monthlyCashflow: 0,
    annualCashflow: 0,
    cashOnCashReturn: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const pv = parseFloat(propertyValue) || 0;
    const dep = parseFloat(deposit) || 0;
    const rooms = parseFloat(numberOfRooms) || 0;
    const rpr = parseFloat(rentPerRoom) || 0;
    const rate = parseFloat(interestRate) || 0;
    const term = parseFloat(loanTerm) || 25;
    const stressRate = parseFloat(stressTestRate) || 8.5;
    const icrReq = parseFloat(icrRequirement) || 145;
    const mgmtFee = parseFloat(managementFee) || 0;
    const voids = parseFloat(voidAllowance) || 0;

    const loanAmount = pv - dep;
    const ltv = pv > 0 ? (loanAmount / pv) * 100 : 0;

    // Gross and net rent
    const grossRent = rooms * rpr * 12;
    const voidDeduction = grossRent * (voids / 100);
    const managementCost = grossRent * (mgmtFee / 100);
    const netRent = grossRent - voidDeduction - managementCost;

    // Monthly interest only payment
    const monthlyRate = rate / 100 / 12;
    const monthlyInterest = loanAmount * monthlyRate;

    // Monthly capital repayment (for repayment mortgage)
    const totalMonths = term * 12;
    let monthlyPayment = 0;
    if (monthlyRate > 0 && totalMonths > 0) {
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    const monthlyCapitalRepayment = monthlyPayment - monthlyInterest;

    // ICR at current rate
    const annualInterest = monthlyInterest * 12;
    const icr = annualInterest > 0 ? (grossRent / annualInterest) * 100 : 0;

    // ICR at stressed rate
    const stressedMonthlyRate = stressRate / 100 / 12;
    const stressedMonthlyInterest = loanAmount * stressedMonthlyRate;
    const stressedAnnualInterest = stressedMonthlyInterest * 12;
    const stressedIcr = stressedAnnualInterest > 0 ? (grossRent / stressedAnnualInterest) * 100 : 0;

    // Does it pass the stress test?
    const passesStressTest = stressedIcr >= icrReq;

    // Max loan by ICR
    // ICR = (Gross Rent / Annual Interest) * 100
    // Annual Interest = Gross Rent * 100 / ICR
    // Loan = Annual Interest / Rate
    const maxAnnualInterest = (grossRent * 100) / icrReq;
    const maxLoanByIcr = (maxAnnualInterest / (stressRate / 100));

    // Cashflow (using interest only)
    const monthlyCashflow = (netRent / 12) - monthlyInterest;
    const annualCashflow = monthlyCashflow * 12;

    // Cash on cash return
    const cashOnCashReturn = dep > 0 ? (annualCashflow / dep) * 100 : 0;

    setDerivedMetrics({
      loanAmount,
      ltv,
      grossRent,
      netRent,
      monthlyInterest,
      monthlyCapitalRepayment,
      monthlyPayment,
      icr,
      stressedIcr,
      maxLoanByIcr,
      passesStressTest,
      monthlyCashflow,
      annualCashflow,
      cashOnCashReturn,
    });
  }, [propertyValue, deposit, numberOfRooms, rentPerRoom, interestRate, loanTerm, stressTestRate, icrRequirement, managementFee, voidAllowance]);

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

  // ICR status
  const getIcrStatus = () => {
    if (derivedMetrics.stressedIcr >= parseFloat(icrRequirement)) {
      return { tone: 'success', accent: 'green' as const, label: 'Passes ICR' };
    } else if (derivedMetrics.stressedIcr >= parseFloat(icrRequirement) * 0.9) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Near Threshold' };
    }
    return { tone: 'warning', accent: 'orange' as const, label: 'Below ICR' };
  };

  // LTV status
  const getLtvStatus = () => {
    if (derivedMetrics.ltv <= 65) {
      return { tone: 'success', accent: 'green' as const, label: 'Low LTV' };
    } else if (derivedMetrics.ltv <= 75) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Standard LTV' };
    }
    return { tone: 'warning', accent: 'orange' as const, label: 'High LTV' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      propertyValue: parseFloat(propertyValue) || 0,
      deposit: parseFloat(deposit) || 0,
      numberOfRooms: parseFloat(numberOfRooms) || 0,
      rentPerRoom: parseFloat(rentPerRoom) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseFloat(loanTerm) || 0,
      stressTestRate: parseFloat(stressTestRate) || 0,
      icrRequirement: parseFloat(icrRequirement) || 0,
      managementFee: parseFloat(managementFee) || 0,
      voidAllowance: parseFloat(voidAllowance) || 0,
    },
    outputs: {
      loanAmount: derivedMetrics.loanAmount,
      ltv: derivedMetrics.ltv,
      grossRent: derivedMetrics.grossRent,
      netRent: derivedMetrics.netRent,
      monthlyInterest: derivedMetrics.monthlyInterest,
      icr: derivedMetrics.icr,
      stressedIcr: derivedMetrics.stressedIcr,
      maxLoanByIcr: derivedMetrics.maxLoanByIcr,
      passesStressTest: derivedMetrics.passesStressTest,
      monthlyCashflow: derivedMetrics.monthlyCashflow,
      annualCashflow: derivedMetrics.annualCashflow,
      cashOnCashReturn: derivedMetrics.cashOnCashReturn,
    },
  });

  // HMO rate guidance
  const HMO_RATE_BANDS = [
    { maxLtv: 60, minRate: 5.49, maxRate: 6.29, label: '60% LTV or less' },
    { maxLtv: 65, minRate: 5.79, maxRate: 6.49, label: '61-65% LTV' },
    { maxLtv: 70, minRate: 5.99, maxRate: 6.79, label: '66-70% LTV' },
    { maxLtv: 75, minRate: 6.29, maxRate: 7.29, label: '71-75% LTV' },
  ];

  const getIndicativeRate = (ltv: number) => {
    const band = HMO_RATE_BANDS.find(b => ltv <= b.maxLtv);
    if (band) {
      return `${band.minRate}% - ${band.maxRate}%`;
    }
    return '7.5%+ (specialist products)';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/hmo"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to HMO</span>
          </Link>
          <StatusPill tone={getIcrStatus().tone} label={getIcrStatus().label} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HMO Finance Calculator</h1>
              <p className="text-slate-400">
                Calculate HMO mortgage options and stress test affordability
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property & Loan */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                Property & Loan Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Property Value"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Current market value or purchase price"
                />
                <FloatingField
                  label="Deposit / Equity"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper={`LTV: ${formatPercent(derivedMetrics.ltv)}`}
                />
                <FloatingField
                  label="Interest Rate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  unit="%"
                  helper={`Indicative: ${getIndicativeRate(derivedMetrics.ltv)}`}
                />
                <FloatingField
                  label="Loan Term"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  unit="years"
                  helper="Typical: 20-30 years"
                />
              </div>
            </BentoCard>

            {/* Rental Income */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Rental Income
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Number of Rooms"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  helper="Lettable rooms in HMO"
                />
                <FloatingField
                  label="Rent Per Room"
                  value={rentPerRoom}
                  onChange={(e) => setRentPerRoom(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Average rent per room per month"
                />
                <FloatingField
                  label="Management Fee"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  unit="%"
                  helper="HMO management typically 12-18%"
                />
                <FloatingField
                  label="Void Allowance"
                  value={voidAllowance}
                  onChange={(e) => setVoidAllowance(e.target.value)}
                  unit="%"
                  helper="Allowance for empty rooms (4-10%)"
                />
              </div>
            </BentoCard>

            {/* Stress Testing */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Lender Stress Test
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Stress Test Rate"
                  value={stressTestRate}
                  onChange={(e) => setStressTestRate(e.target.value)}
                  unit="%"
                  helper="Rate lenders use for affordability (7-9%)"
                />
                <FloatingField
                  label="ICR Requirement"
                  value={icrRequirement}
                  onChange={(e) => setIcrRequirement(e.target.value)}
                  unit="%"
                  helper="Interest Cover Ratio (125-145% typical)"
                />
              </div>

              {/* Stress Test Result */}
              <div className={`mt-4 p-4 rounded-lg border ${derivedMetrics.passesStressTest ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  {derivedMetrics.passesStressTest ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <p className={`font-semibold ${derivedMetrics.passesStressTest ? 'text-emerald-400' : 'text-red-400'}`}>
                      {derivedMetrics.passesStressTest ? 'Passes Stress Test' : 'Fails Stress Test'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Stressed ICR: {formatPercent(derivedMetrics.stressedIcr)} | Required: {formatPercent(parseFloat(icrRequirement))}
                    </p>
                  </div>
                </div>
                {!derivedMetrics.passesStressTest && derivedMetrics.maxLoanByIcr > 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    Max loan at {formatPercent(parseFloat(icrRequirement))} ICR: {formatCurrency(derivedMetrics.maxLoanByIcr)}
                  </p>
                )}
              </div>
            </BentoCard>

            {/* HMO Rate Guidance */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                HMO Mortgage Rate Guidance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HMO_RATE_BANDS.map((band) => (
                  <div
                    key={band.maxLtv}
                    className={`p-3 rounded-lg border ${derivedMetrics.ltv <= band.maxLtv && derivedMetrics.ltv > (HMO_RATE_BANDS[HMO_RATE_BANDS.indexOf(band) - 1]?.maxLtv || 0) ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}
                  >
                    <p className="text-xs text-slate-400">{band.label}</p>
                    <p className="font-semibold text-blue-400">{band.minRate}% - {band.maxRate}%</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                HMO mortgages typically carry a 0.5-1.5% premium over standard BTL rates. Rates are indicative only.
              </p>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Loan Amount"
                  value={formatCurrency(derivedMetrics.loanAmount)}
                  accent={getLtvStatus().accent}
                />
                <DealMetric
                  label="LTV"
                  value={formatPercent(derivedMetrics.ltv)}
                  accent={getLtvStatus().accent}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Gross Annual Rent"
                    value={formatCurrency(derivedMetrics.grossRent)}
                  />
                  <DealMetric
                    label="Net Annual Rent"
                    value={formatCurrency(derivedMetrics.netRent)}
                    helper="After voids & management"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Affordability */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Affordability</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Monthly Interest (IO)"
                  value={formatCurrency(derivedMetrics.monthlyInterest)}
                  helper="Interest-only payment"
                />
                <DealMetric
                  label="Monthly Payment (Rep)"
                  value={formatCurrency(derivedMetrics.monthlyPayment)}
                  helper="Full repayment mortgage"
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="ICR (Current Rate)"
                    value={formatPercent(derivedMetrics.icr)}
                    accent={derivedMetrics.icr >= 125 ? 'green' : 'orange'}
                  />
                  <DealMetric
                    label="ICR (Stressed)"
                    value={formatPercent(derivedMetrics.stressedIcr)}
                    accent={getIcrStatus().accent}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Cashflow */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Cashflow Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Monthly Cashflow"
                  value={formatCurrency(derivedMetrics.monthlyCashflow)}
                  accent={derivedMetrics.monthlyCashflow > 0 ? 'green' : 'orange'}
                  helper="After mortgage (IO) & costs"
                />
                <DealMetric
                  label="Annual Cashflow"
                  value={formatCurrency(derivedMetrics.annualCashflow)}
                  accent={derivedMetrics.annualCashflow > 0 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Cash on Cash Return"
                  value={formatPercent(derivedMetrics.cashOnCashReturn)}
                  accent={derivedMetrics.cashOnCashReturn >= 8 ? 'green' : derivedMetrics.cashOnCashReturn >= 5 ? 'orange' : 'orange'}
                />
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="HMO Finance Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your HMO Finance calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
