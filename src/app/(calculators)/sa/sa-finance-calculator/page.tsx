'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

// SA mortgage rate guidance (2024)
const SA_RATE_BANDS = [
  { maxLtv: 60, minRate: 5.29, maxRate: 6.19, label: '60% LTV or less' },
  { maxLtv: 65, minRate: 5.49, maxRate: 6.49, label: '61-65% LTV' },
  { maxLtv: 70, minRate: 5.79, maxRate: 6.79, label: '66-70% LTV' },
  { maxLtv: 75, minRate: 6.29, maxRate: 7.49, label: '71-75% LTV' },
];

type SAType = 'holiday-let' | 'short-term' | 'serviced-accommodation';

export default function SAFinanceCalculatorPage() {
  // Property Details
  const [propertyValue, setPropertyValue] = useState<string>('350000');
  const [deposit, setDeposit] = useState<string>('87500');
  const [saType, setSaType] = useState<SAType>('holiday-let');

  // Income Projections
  const [averageDailyRate, setAverageDailyRate] = useState<string>('150');
  const [occupancyRate, setOccupancyRate] = useState<string>('65');
  const [seasonalVariation, setSeasonalVariation] = useState<string>('20');

  // Finance Terms
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [loanTerm, setLoanTerm] = useState<string>('25');
  const [productFee, setProductFee] = useState<string>('1500');

  // Stress Test
  const [stressTestRate, setStressTestRate] = useState<string>('7.5');
  const [icrRequirement, setIcrRequirement] = useState<string>('145');
  const [occupancyStressTest, setOccupancyStressTest] = useState<string>('50');

  // Operating Costs (% of gross income)
  const [platformFees, setPlatformFees] = useState<string>('15');
  const [managementFee, setManagementFee] = useState<string>('20');
  const [cleaningPerNight, setCleaningPerNight] = useState<string>('50');
  const [utilities, setUtilities] = useState<string>('300');
  const [insurance, setInsurance] = useState<string>('150');
  const [maintenance, setMaintenance] = useState<string>('5');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    loanAmount: 0,
    ltv: 0,
    monthlyPayment: 0,
    annualInterest: 0,
    grossAnnualIncome: 0,
    bookedNights: 0,
    platformFeeAmount: 0,
    managementFeeAmount: 0,
    cleaningCosts: 0,
    totalOperatingCosts: 0,
    netOperatingIncome: 0,
    icr: 0,
    stressedIcr: 0,
    passesStressTest: false,
    maxLoanByIcr: 0,
    monthlyCashflow: 0,
    annualCashflow: 0,
    cashOnCashReturn: 0,
    breakEvenOccupancy: 0,
    effectiveYield: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const pv = parseFloat(propertyValue) || 0;
    const dep = parseFloat(deposit) || 0;
    const adr = parseFloat(averageDailyRate) || 0;
    const occ = parseFloat(occupancyRate) || 0;
    const rate = parseFloat(interestRate) || 0;
    const stressRate = parseFloat(stressTestRate) || 0;
    const icrReq = parseFloat(icrRequirement) || 145;
    const platFee = parseFloat(platformFees) || 0;
    const mgmtFee = parseFloat(managementFee) || 0;
    const cleanPerNight = parseFloat(cleaningPerNight) || 0;
    const utils = parseFloat(utilities) || 0;
    const ins = parseFloat(insurance) || 0;
    const maint = parseFloat(maintenance) || 0;

    // Loan calculations
    const loanAmount = pv - dep;
    const ltv = pv > 0 ? (loanAmount / pv) * 100 : 0;

    // Interest calculations
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = loanAmount * monthlyRate; // Interest only
    const annualInterest = monthlyPayment * 12;

    // Income calculations
    const bookedNights = Math.round(365 * (occ / 100));
    const grossAnnualIncome = adr * bookedNights;

    // Operating costs
    const platformFeeAmount = grossAnnualIncome * (platFee / 100);
    const managementFeeAmount = grossAnnualIncome * (mgmtFee / 100);
    const cleaningCosts = cleanPerNight * bookedNights;
    const maintenanceCost = grossAnnualIncome * (maint / 100);
    const annualUtils = utils * 12;
    const annualIns = ins * 12;
    const totalOperatingCosts = platformFeeAmount + managementFeeAmount + cleaningCosts + maintenanceCost + annualUtils + annualIns;

    // Net operating income
    const netOperatingIncome = grossAnnualIncome - totalOperatingCosts;

    // ICR calculations (using gross income as per lender requirements)
    const icr = annualInterest > 0 ? (grossAnnualIncome / annualInterest) * 100 : 0;

    // Stressed ICR
    const stressedAnnualInterest = loanAmount * (stressRate / 100);
    const stressedIcr = stressedAnnualInterest > 0 ? (grossAnnualIncome / stressedAnnualInterest) * 100 : 0;

    // Pass test?
    const passesStressTest = stressedIcr >= icrReq;

    // Max loan
    const maxInterest = (grossAnnualIncome * 100) / icrReq;
    const maxLoanByIcr = stressRate > 0 ? maxInterest / (stressRate / 100) : 0;

    // Cashflow
    const monthlyCashflow = (netOperatingIncome - annualInterest) / 12;
    const annualCashflow = monthlyCashflow * 12;

    // Cash on cash return
    const cashOnCashReturn = dep > 0 ? (annualCashflow / dep) * 100 : 0;

    // Break-even occupancy
    // At what occupancy does income = costs + mortgage?
    const fixedCosts = annualUtils + annualIns + annualInterest;
    const variableCostPerNight = cleanPerNight + (adr * (platFee + mgmtFee + maint) / 100);
    const revenuePerNight = adr - variableCostPerNight;
    const nightsToBreakEven = revenuePerNight > 0 ? fixedCosts / revenuePerNight : 365;
    const breakEvenOccupancy = (nightsToBreakEven / 365) * 100;

    // Effective yield (net income / property value)
    const effectiveYield = pv > 0 ? (netOperatingIncome / pv) * 100 : 0;

    setDerivedMetrics({
      loanAmount,
      ltv,
      monthlyPayment,
      annualInterest,
      grossAnnualIncome,
      bookedNights,
      platformFeeAmount,
      managementFeeAmount,
      cleaningCosts,
      totalOperatingCosts,
      netOperatingIncome,
      icr,
      stressedIcr,
      passesStressTest,
      maxLoanByIcr,
      monthlyCashflow,
      annualCashflow,
      cashOnCashReturn,
      breakEvenOccupancy,
      effectiveYield,
    });
  }, [propertyValue, deposit, averageDailyRate, occupancyRate, interestRate, stressTestRate, icrRequirement, platformFees, managementFee, cleaningPerNight, utilities, insurance, maintenance]);

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

  const getIcrStatus = () => {
    if (derivedMetrics.stressedIcr >= parseFloat(icrRequirement)) {
      return { tone: 'success', accent: 'green' as const, label: 'Passes ICR' };
    } else if (derivedMetrics.stressedIcr >= parseFloat(icrRequirement) * 0.9) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Near Threshold' };
    }
    return { tone: 'warning', accent: 'orange' as const, label: 'Below ICR' };
  };

  const getIndicativeRate = (ltv: number) => {
    const band = SA_RATE_BANDS.find(b => ltv <= b.maxLtv);
    if (band) {
      return `${band.minRate}% - ${band.maxRate}%`;
    }
    return '7.5%+ (specialist)';
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      propertyValue: parseFloat(propertyValue) || 0,
      deposit: parseFloat(deposit) || 0,
      saType,
      averageDailyRate: parseFloat(averageDailyRate) || 0,
      occupancyRate: parseFloat(occupancyRate) || 0,
      interestRate: parseFloat(interestRate) || 0,
      stressTestRate: parseFloat(stressTestRate) || 0,
      icrRequirement: parseFloat(icrRequirement) || 0,
      platformFees: parseFloat(platformFees) || 0,
      managementFee: parseFloat(managementFee) || 0,
      cleaningPerNight: parseFloat(cleaningPerNight) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/sa"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SA</span>
          </Link>
          <StatusPill tone={getIcrStatus().tone} label={getIcrStatus().label} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SA Finance Calculator</h1>
              <p className="text-slate-400">
                Calculate finance options for serviced accommodation properties
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
                  helper="Current market value"
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
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">SA Type</label>
                  <select
                    value={saType}
                    onChange={(e) => setSaType(e.target.value as SAType)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="holiday-let">Holiday Let (FHL)</option>
                    <option value="short-term">Short-Term Let (Airbnb)</option>
                    <option value="serviced-accommodation">Serviced Accommodation</option>
                  </select>
                </div>
              </div>
            </BentoCard>

            {/* Income Projections */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Income Projections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Average Daily Rate"
                  value={averageDailyRate}
                  onChange={(e) => setAverageDailyRate(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="ADR per night"
                />
                <FloatingField
                  label="Occupancy Rate"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(e.target.value)}
                  unit="%"
                  helper={`${derivedMetrics.bookedNights} nights/year`}
                />
                <FloatingField
                  label="Seasonal Variation"
                  value={seasonalVariation}
                  onChange={(e) => setSeasonalVariation(e.target.value)}
                  unit="%"
                  helper="Income variation ±"
                />
              </div>
            </BentoCard>

            {/* Operating Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Operating Costs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Platform Fees"
                  value={platformFees}
                  onChange={(e) => setPlatformFees(e.target.value)}
                  unit="%"
                  helper="Airbnb/Booking.com (12-20%)"
                />
                <FloatingField
                  label="Management Fee"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  unit="%"
                  helper="If using SA manager"
                />
                <FloatingField
                  label="Cleaning Per Stay"
                  value={cleaningPerNight}
                  onChange={(e) => setCleaningPerNight(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Changeover cost"
                />
                <FloatingField
                  label="Monthly Utilities"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Bills you pay"
                />
                <FloatingField
                  label="Monthly Insurance"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="SA-specific cover"
                />
                <FloatingField
                  label="Maintenance"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  unit="%"
                  helper="% of gross income"
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
                  helper="Rate for affordability"
                />
                <FloatingField
                  label="ICR Requirement"
                  value={icrRequirement}
                  onChange={(e) => setIcrRequirement(e.target.value)}
                  unit="%"
                  helper="Interest Cover (125-145%)"
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
                      ICR: {formatPercent(derivedMetrics.stressedIcr)} | Required: {formatPercent(parseFloat(icrRequirement))}
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* SA Rate Guidance */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                SA Mortgage Rate Guidance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SA_RATE_BANDS.map((band) => (
                  <div
                    key={band.maxLtv}
                    className={`p-3 rounded-lg border ${derivedMetrics.ltv <= band.maxLtv && derivedMetrics.ltv > (SA_RATE_BANDS[SA_RATE_BANDS.indexOf(band) - 1]?.maxLtv || 0) ? 'bg-pink-500/20 border-pink-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}
                  >
                    <p className="text-xs text-slate-400">{band.label}</p>
                    <p className="font-semibold text-pink-400">{band.minRate}% - {band.maxRate}%</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                SA/Holiday Let mortgages typically have higher rates than BTL. FHL status may provide tax benefits.
              </p>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Loan Amount"
                  value={formatCurrency(derivedMetrics.loanAmount)}
                />
                <DealMetric
                  label="LTV"
                  value={formatPercent(derivedMetrics.ltv)}
                  accent={derivedMetrics.ltv <= 70 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Monthly Interest"
                  value={formatCurrency(derivedMetrics.monthlyPayment)}
                  helper="Interest only"
                />
              </div>
            </BentoCard>

            {/* Income Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Income Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Gross Annual Income"
                  value={formatCurrency(derivedMetrics.grossAnnualIncome)}
                  helper={`${derivedMetrics.bookedNights} nights @ ${formatCurrency(parseFloat(averageDailyRate) || 0)}`}
                />
                <DealMetric
                  label="Operating Costs"
                  value={formatCurrency(derivedMetrics.totalOperatingCosts)}
                  accent="orange"
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Net Operating Income"
                    value={formatCurrency(derivedMetrics.netOperatingIncome)}
                    accent={derivedMetrics.netOperatingIncome > 0 ? 'green' : 'orange'}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Affordability */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Affordability</h2>
              <div className="space-y-3">
                <DealMetric
                  label="ICR (Current Rate)"
                  value={formatPercent(derivedMetrics.icr)}
                />
                <DealMetric
                  label="ICR (Stressed)"
                  value={formatPercent(derivedMetrics.stressedIcr)}
                  accent={getIcrStatus().accent}
                />
                <DealMetric
                  label="Max Loan at ICR"
                  value={formatCurrency(derivedMetrics.maxLoanByIcr)}
                />
              </div>
            </BentoCard>

            {/* Returns */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Returns</h2>
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
                  accent={derivedMetrics.cashOnCashReturn >= 8 ? 'green' : 'orange'}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Break-Even Occupancy"
                    value={formatPercent(derivedMetrics.breakEvenOccupancy)}
                    helper="To cover all costs"
                  />
                  <DealMetric
                    label="Effective Yield"
                    value={formatPercent(derivedMetrics.effectiveYield)}
                    helper="NOI / Property Value"
                  />
                </div>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="SA Finance Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your SA Finance calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
