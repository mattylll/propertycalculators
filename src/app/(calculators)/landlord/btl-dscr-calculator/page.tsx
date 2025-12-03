'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';

// Common lender requirements
const LENDER_REQUIREMENTS = [
  { name: 'Standard BTL (Basic Rate)', icr: 125, stressRate: 5.5, description: 'Basic rate taxpayers, limited companies' },
  { name: 'Standard BTL (Higher Rate)', icr: 145, stressRate: 5.5, description: 'Higher/additional rate taxpayers' },
  { name: 'Portfolio Landlord (4+ props)', icr: 145, stressRate: 5.5, description: 'Landlords with 4+ mortgaged properties' },
  { name: 'HMO/MUFB', icr: 145, stressRate: 5.5, description: 'HMOs and Multi-Unit Freehold Blocks' },
  { name: 'Holiday Let', icr: 145, stressRate: 5.5, description: 'Furnished Holiday Lets' },
];

export default function BTLDSCRCalculatorPage() {
  // Property & Loan Inputs
  const [propertyValue, setPropertyValue] = useState<string>('300000');
  const [loanAmount, setLoanAmount] = useState<string>('225000');
  const [interestRate, setInterestRate] = useState<string>('5.5');
  const [stressTestRate, setStressTestRate] = useState<string>('5.5');

  // Rental Income
  const [monthlyRent, setMonthlyRent] = useState<string>('1500');
  const [voidAllowance, setVoidAllowance] = useState<string>('0');

  // Requirements
  const [icrRequirement, setIcrRequirement] = useState<string>('145');
  const [isLimitedCompany, setIsLimitedCompany] = useState<boolean>(false);
  const [taxBand, setTaxBand] = useState<'basic' | 'higher' | 'additional'>('higher');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    ltv: 0,
    annualRent: 0,
    netAnnualRent: 0,
    monthlyInterestAtActual: 0,
    annualInterestAtActual: 0,
    monthlyInterestAtStress: 0,
    annualInterestAtStress: 0,
    icrAtActualRate: 0,
    icrAtStressRate: 0,
    dscr: 0,
    passesStressTest: false,
    maxLoanAtIcr: 0,
    shortfallOrSurplus: 0,
    requiredRentAtMaxLoan: 0,
    rentMultiple: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const pv = parseFloat(propertyValue) || 0;
    const loan = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const stressRate = parseFloat(stressTestRate) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const voids = parseFloat(voidAllowance) || 0;
    const icrReq = parseFloat(icrRequirement) || 145;

    // LTV
    const ltv = pv > 0 ? (loan / pv) * 100 : 0;

    // Rental income
    const annualRent = rent * 12;
    const voidDeduction = annualRent * (voids / 100);
    const netAnnualRent = annualRent - voidDeduction;

    // Interest calculations at actual rate
    const annualInterestAtActual = loan * (rate / 100);
    const monthlyInterestAtActual = annualInterestAtActual / 12;

    // Interest calculations at stress rate
    const annualInterestAtStress = loan * (stressRate / 100);
    const monthlyInterestAtStress = annualInterestAtStress / 12;

    // ICR calculations (using gross rent as per most lender requirements)
    // ICR = (Annual Rent / Annual Interest) * 100
    const icrAtActualRate = annualInterestAtActual > 0 ? (annualRent / annualInterestAtActual) * 100 : 0;
    const icrAtStressRate = annualInterestAtStress > 0 ? (annualRent / annualInterestAtStress) * 100 : 0;

    // DSCR (using net rent)
    // DSCR = Net Operating Income / Debt Service
    const dscr = annualInterestAtStress > 0 ? netAnnualRent / annualInterestAtStress : 0;

    // Does it pass?
    const passesStressTest = icrAtStressRate >= icrReq;

    // Max loan at required ICR
    // ICR = (Rent / Interest) * 100
    // Interest = Rent * 100 / ICR
    // Loan = Interest / Rate
    const maxInterest = (annualRent * 100) / icrReq;
    const maxLoanAtIcr = stressRate > 0 ? maxInterest / (stressRate / 100) : 0;

    // Shortfall or surplus
    const shortfallOrSurplus = loan - maxLoanAtIcr;

    // Required rent at current loan amount
    // Rent = (Loan * Rate * ICR) / 100
    const requiredRentAtMaxLoan = (loan * (stressRate / 100) * icrReq) / 100 / 12;

    // Rent multiple (how many times rent covers interest)
    const rentMultiple = monthlyInterestAtStress > 0 ? rent / monthlyInterestAtStress : 0;

    setDerivedMetrics({
      ltv,
      annualRent,
      netAnnualRent,
      monthlyInterestAtActual,
      annualInterestAtActual,
      monthlyInterestAtStress,
      annualInterestAtStress,
      icrAtActualRate,
      icrAtStressRate,
      dscr,
      passesStressTest,
      maxLoanAtIcr,
      shortfallOrSurplus,
      requiredRentAtMaxLoan,
      rentMultiple,
    });
  }, [propertyValue, loanAmount, interestRate, stressTestRate, monthlyRent, voidAllowance, icrRequirement]);

  // Update ICR requirement based on tax band and company status
  useEffect(() => {
    if (isLimitedCompany) {
      setIcrRequirement('125');
    } else if (taxBand === 'basic') {
      setIcrRequirement('125');
    } else {
      setIcrRequirement('145');
    }
  }, [isLimitedCompany, taxBand]);

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
    const icrReq = parseFloat(icrRequirement);
    if (derivedMetrics.icrAtStressRate >= icrReq) {
      return { tone: 'success' as const, accent: 'green' as const, label: 'Passes ICR' };
    } else if (derivedMetrics.icrAtStressRate >= icrReq * 0.9) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Near Threshold' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'Below ICR' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      propertyValue: parseFloat(propertyValue) || 0,
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      stressTestRate: parseFloat(stressTestRate) || 0,
      monthlyRent: parseFloat(monthlyRent) || 0,
      voidAllowance: parseFloat(voidAllowance) || 0,
      icrRequirement: parseFloat(icrRequirement) || 0,
      isLimitedCompany,
      taxBand,
    },
    outputs: derivedMetrics,
  });

  return (
    <CalculatorPageLayout
      title="BTL DSCR Calculator"
      description="Calculate Debt Service Coverage Ratio and Interest Coverage Ratio for BTL mortgages. Check if your rental income meets lender requirements for buy-to-let mortgages."
      category="Landlord"
      categorySlug="landlord"
      categoryColor="#10B981"
    >
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
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper={`LTV: ${formatPercent(derivedMetrics.ltv)}`}
                />
                <FloatingField
                  label="Interest Rate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  unit="%"
                  helper="Current/expected pay rate"
                />
                <FloatingField
                  label="Stress Test Rate"
                  value={stressTestRate}
                  onChange={(e) => setStressTestRate(e.target.value)}
                  unit="%"
                  helper="Rate used for affordability (typically 5.5%)"
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
                  label="Monthly Rent"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Gross monthly rental income"
                />
                <FloatingField
                  label="Void Allowance"
                  value={voidAllowance}
                  onChange={(e) => setVoidAllowance(e.target.value)}
                  unit="%"
                  helper="Empty period allowance (optional)"
                />
              </div>
            </BentoCard>

            {/* Borrower Details */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Borrower Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLimitedCompany}
                      onChange={(e) => setIsLimitedCompany(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500"
                    />
                    <div>
                      <span>Limited Company</span>
                      <p className="text-xs text-slate-500">SPV or trading company</p>
                    </div>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Tax Band (Personal)</label>
                  <select
                    value={taxBand}
                    onChange={(e) => setTaxBand(e.target.value as 'basic' | 'higher' | 'additional')}
                    disabled={isLimitedCompany}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white disabled:opacity-50"
                  >
                    <option value="basic">Basic Rate (20%)</option>
                    <option value="higher">Higher Rate (40%)</option>
                    <option value="additional">Additional Rate (45%)</option>
                  </select>
                </div>
                <FloatingField
                  label="ICR Requirement"
                  value={icrRequirement}
                  onChange={(e) => setIcrRequirement(e.target.value)}
                  unit="%"
                  helper="Lender's minimum ICR"
                />
              </div>
            </BentoCard>

            {/* Stress Test Result */}
            <BentoCard>
              <div className={`p-4 rounded-lg border ${derivedMetrics.passesStressTest ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  {derivedMetrics.passesStressTest ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${derivedMetrics.passesStressTest ? 'text-emerald-400' : 'text-red-400'}`}>
                      {derivedMetrics.passesStressTest ? 'Passes Lender Stress Test' : 'Fails Lender Stress Test'}
                    </p>
                    <p className="text-sm text-slate-400">
                      ICR at {stressTestRate}%: {formatPercent(derivedMetrics.icrAtStressRate)} | Required: {formatPercent(parseFloat(icrRequirement))}
                    </p>
                  </div>
                </div>
                {!derivedMetrics.passesStressTest && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-slate-400">
                      <span className="text-amber-400">Options to pass:</span>
                    </p>
                    <ul className="text-sm text-slate-400 mt-1 space-y-1">
                      <li>• Reduce loan to {formatCurrency(derivedMetrics.maxLoanAtIcr)}</li>
                      <li>• Increase rent to {formatCurrency(derivedMetrics.requiredRentAtMaxLoan)}/month</li>
                      <li>• Add larger deposit ({formatCurrency(Math.abs(derivedMetrics.shortfallOrSurplus))} more)</li>
                    </ul>
                  </div>
                )}
              </div>
            </BentoCard>

            {/* Lender Requirements Reference */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Common Lender Requirements
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-slate-400">Borrower Type</th>
                      <th className="text-center py-2 text-slate-400">ICR</th>
                      <th className="text-center py-2 text-slate-400">Stress Rate</th>
                      <th className="text-left py-2 text-slate-400">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LENDER_REQUIREMENTS.map((req, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-2">{req.name}</td>
                        <td className="text-center py-2 text-green-400">{req.icr}%</td>
                        <td className="text-center py-2 text-blue-400">{req.stressRate}%</td>
                        <td className="py-2 text-slate-500">{req.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Requirements vary by lender. Some lenders may use different stress rates or ICR calculations.
              </p>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Coverage Ratios</h2>
              <div className="space-y-3">
                <DealMetric
                  label="ICR at Pay Rate"
                  value={formatPercent(derivedMetrics.icrAtActualRate)}
                  helper={`At ${interestRate}% rate`}
                  accent={derivedMetrics.icrAtActualRate >= 125 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="ICR at Stress Rate"
                  value={formatPercent(derivedMetrics.icrAtStressRate)}
                  helper={`At ${stressTestRate}% stress rate`}
                  accent={getIcrStatus().accent}
                />
                <DealMetric
                  label="DSCR"
                  value={derivedMetrics.dscr.toFixed(2)}
                  helper="Net rent / debt service"
                  accent={derivedMetrics.dscr >= 1.25 ? 'green' : derivedMetrics.dscr >= 1.0 ? 'orange' : 'orange'}
                />
                <DealMetric
                  label="Rent Multiple"
                  value={`${derivedMetrics.rentMultiple.toFixed(2)}x`}
                  helper="Rent ÷ interest payment"
                />
              </div>
            </BentoCard>

            {/* Loan Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="LTV"
                  value={formatPercent(derivedMetrics.ltv)}
                  accent={derivedMetrics.ltv <= 75 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Annual Rent"
                  value={formatCurrency(derivedMetrics.annualRent)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Monthly Interest (Pay Rate)"
                    value={formatCurrency(derivedMetrics.monthlyInterestAtActual)}
                    helper={`At ${interestRate}%`}
                  />
                  <DealMetric
                    label="Monthly Interest (Stressed)"
                    value={formatCurrency(derivedMetrics.monthlyInterestAtStress)}
                    helper={`At ${stressTestRate}%`}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Max Borrowing */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Maximum Borrowing</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Max Loan at ICR"
                  value={formatCurrency(derivedMetrics.maxLoanAtIcr)}
                  helper={`At ${icrRequirement}% ICR`}
                />
                <DealMetric
                  label={derivedMetrics.shortfallOrSurplus > 0 ? 'Over Maximum By' : 'Headroom'}
                  value={formatCurrency(Math.abs(derivedMetrics.shortfallOrSurplus))}
                  accent={derivedMetrics.shortfallOrSurplus > 0 ? 'orange' : 'green'}
                />
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="BTL DSCR/ICR Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your BTL DSCR/ICR calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
    </CalculatorPageLayout>
  );
}
