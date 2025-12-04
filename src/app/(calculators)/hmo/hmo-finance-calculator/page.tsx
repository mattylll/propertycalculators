'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calculator,
  XCircle,
} from 'lucide-react';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';

export default function HMOFinanceCalculatorPage() {
  const [hasCalculated, setHasCalculated] = useState(false);

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
      return { tone: 'success' as const, accent: 'green' as const, label: 'Passes ICR' };
    } else if (derivedMetrics.stressedIcr >= parseFloat(icrRequirement) * 0.9) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Near Threshold' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'Below ICR' };
  };

  // LTV status
  const getLtvStatus = () => {
    if (derivedMetrics.ltv <= 65) {
      return { tone: 'success' as const, accent: 'green' as const, label: 'Low LTV' };
    } else if (derivedMetrics.ltv <= 75) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Standard LTV' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'High LTV' };
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
    <CalculatorPageLayout
      title="HMO Finance Calculator"
      description="Calculate HMO mortgage options and stress test affordability"
      category="HMO"
      categorySlug="hmo"
      categoryColor="#EC4899"
      badges={[
        { label: getIcrStatus().label, variant: getIcrStatus().tone === 'success' ? 'success' : 'warning' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }}>
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

            {/* Calculate Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate Finance
              </button>
              <button
                type="button"
                onClick={() => {
                  setPropertyValue('350000');
                  setDeposit('87500');
                  setNumberOfRooms('5');
                  setRentPerRoom('650');
                  setInterestRate('6.5');
                  setLoanTerm('25');
                  setStressTestRate('8.5');
                  setIcrRequirement('145');
                  setManagementFee('15');
                  setVoidAllowance('8');
                  setHasCalculated(false);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Reset
              </button>
            </div>
            </form>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            <CalculatorResultsGate
              calculatorType="HMO Finance Calculator"
              calculatorSlug="hmo-finance-calculator"
              formData={{
                propertyValue,
                deposit,
                numberOfRooms,
                rentPerRoom,
                interestRate,
                loanTerm,
                stressTestRate,
                icrRequirement,
                managementFee,
                voidAllowance
              }}
              hasCalculated={hasCalculated}
            >
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
            </CalculatorResultsGate>
          </div>
        </div>

        {/* SEO Content */}
        <CalculatorSEO
          calculatorName="HMO Finance Calculator"
          calculatorSlug="hmo-finance-calculator"
          description="The HMO Finance Calculator helps UK landlords calculate mortgage affordability and stress test requirements for House in Multiple Occupation properties. Model different interest rates, loan-to-value ratios, and lender ICR requirements to understand your borrowing capacity and monthly payments for multi-let properties."
          howItWorks={`The HMO Finance Calculator analyses your HMO mortgage options in detail:

1. Property & Loan Details - Enter your property value, deposit, and proposed interest rate
2. Rental Income - Input number of rooms and expected rent per room to calculate gross rental income
3. Operating Costs - Factor in HMO-specific costs like management fees (typically 12-18%), voids, and other expenses
4. Lender Stress Testing - Apply the lender's stress test interest rate (typically 7-9%) to calculate stressed ICR
5. Affordability Assessment - Calculate whether your rental income meets the lender's ICR requirement (usually 125-145%)

The calculator shows both interest-only and repayment mortgage costs, helping you understand monthly commitments and whether your HMO passes lender affordability criteria. HMO mortgages typically require higher deposits (25%+) and attract higher interest rates than standard BTL mortgages.`}
          whenToUse="Use this calculator when planning HMO finance, comparing different mortgage products, or stress testing affordability. Essential for understanding whether lenders will approve your HMO mortgage application. Particularly useful when evaluating whether room rents will generate sufficient income to meet ICR requirements at stressed rates."
          keyFeatures={[
            "Calculate HMO mortgage affordability with stress testing",
            "Model different LTV ratios and interest rate scenarios",
            "Assess ICR compliance at lender stress test rates",
            "Compare interest-only vs repayment mortgage costs",
          ]}
          faqs={[
            {
              question: "What is a typical HMO mortgage interest rate?",
              answer: "HMO mortgage rates typically range from 5.5% to 7.5%, depending on your LTV ratio, experience, and the lender. Rates are usually 0.5-1.5% higher than standard BTL mortgages due to the increased complexity and perceived risk of multi-let properties. Lower LTV ratios (60-65%) attract the best rates."
            },
            {
              question: "What deposit do I need for an HMO mortgage?",
              answer: "Most HMO lenders require a minimum 25% deposit (75% LTV), though some offer up to 80% LTV for experienced HMO landlords. Lower LTV ratios like 65% or 70% typically attract better interest rates and more lender choice. First-time HMO landlords may need larger deposits."
            },
            {
              question: "What is ICR and why do lenders stress test it?",
              answer: "Interest Coverage Ratio (ICR) measures whether your rental income covers the mortgage interest. Lenders stress test by calculating ICR at a higher rate (typically 5.5-9%) to ensure you can still afford payments if rates rise. Most HMO lenders require ICR of 125-145% at the stressed rate."
            },
            {
              question: "How does HMO mortgage affordability differ from BTL?",
              answer: "HMO mortgages use gross room rents (not net) for affordability calculations, which helps as HMO rental income is typically 30-70% higher than single-let. However, lenders apply higher ICR requirements (125-145% vs 125% for BTL) and use higher stress test rates to account for the increased management complexity and void risks."
            },
            {
              question: "Can I get an HMO mortgage with no HMO experience?",
              answer: "Yes, but it's more challenging. Many specialist HMO lenders require at least one year of BTL experience. First-time HMO landlords may face higher rates, larger deposit requirements (30%+), or need to demonstrate completion of HMO-specific training courses. Some lenders offer 'first-time HMO' products specifically designed for this market."
            },
          ]}
          relatedTerms={[
            "HMO mortgage rates UK",
            "HMO finance calculator",
            "Interest Coverage Ratio HMO",
            "HMO mortgage stress test",
            "HMO loan to value",
            "Multi-let mortgage affordability",
            "HMO BTL mortgage",
            "Mandatory HMO licensing finance",
            "Room rent mortgage calculation",
            "HMO mortgage lenders UK",
          ]}
          categoryColor="#EC4899"
        />
    </CalculatorPageLayout>
  );
}
