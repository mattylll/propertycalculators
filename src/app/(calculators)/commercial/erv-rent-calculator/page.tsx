'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PoundSterling,
  TrendingUp,
  Building,
  Info,
  Calculator,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

// Typical ERV ranges by property type (£ per sq ft per annum)
const ERV_BENCHMARKS = {
  'retail-high-street': { min: 40, max: 150, label: 'High Street Retail' },
  'retail-secondary': { min: 15, max: 40, label: 'Secondary Retail' },
  'office-prime': { min: 35, max: 80, label: 'Prime Office' },
  'office-secondary': { min: 15, max: 35, label: 'Secondary Office' },
  'industrial-prime': { min: 8, max: 15, label: 'Prime Industrial' },
  'industrial-secondary': { min: 5, max: 10, label: 'Secondary Industrial' },
  'warehouse': { min: 5, max: 12, label: 'Warehouse/Distribution' },
  'leisure': { min: 15, max: 40, label: 'Leisure' },
};

type PropertyType = keyof typeof ERV_BENCHMARKS;

export default function ERVRentCalculatorPage() {
  // Property Details
  const [propertyType, setPropertyType] = useState<PropertyType>('office-secondary');
  const [totalSqFt, setTotalSqFt] = useState<string>('2500');
  const [netToGrossRatio, setNetToGrossRatio] = useState<string>('85');
  const [currentRentPsf, setCurrentRentPsf] = useState<string>('22');
  const [location, setLocation] = useState<'prime' | 'secondary' | 'tertiary'>('secondary');

  // Comparable Evidence
  const [comp1RentPsf, setComp1RentPsf] = useState<string>('25');
  const [comp2RentPsf, setComp2RentPsf] = useState<string>('23');
  const [comp3RentPsf, setComp3RentPsf] = useState<string>('24');

  // Adjustments
  const [qualityAdjustment, setQualityAdjustment] = useState<string>('0');
  const [sizeAdjustment, setSizeAdjustment] = useState<string>('0');
  const [termsAdjustment, setTermsAdjustment] = useState<string>('0');

  // Lease Terms
  const [leaseLength, setLeaseLength] = useState<string>('10');
  const [breakClause, setBreakClause] = useState<string>('5');
  const [rentFreeMonths, setRentFreeMonths] = useState<string>('6');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    netLettableArea: 0,
    benchmarkRangeLow: 0,
    benchmarkRangeHigh: 0,
    averageCompRent: 0,
    adjustedCompRent: 0,
    estimatedErv: 0,
    annualRentAtErv: 0,
    currentAnnualRent: 0,
    rentReversionary: 0,
    reversePotentialPercent: 0,
    effectiveRentAfterFree: 0,
    rentFreeValue: 0,
    isUnderRented: false,
    isOverRented: false,
  });

  // Calculate derived metrics
  useEffect(() => {
    const sqft = parseFloat(totalSqFt) || 0;
    const ntg = parseFloat(netToGrossRatio) || 85;
    const currentRent = parseFloat(currentRentPsf) || 0;
    const comp1 = parseFloat(comp1RentPsf) || 0;
    const comp2 = parseFloat(comp2RentPsf) || 0;
    const comp3 = parseFloat(comp3RentPsf) || 0;
    const qualityAdj = parseFloat(qualityAdjustment) || 0;
    const sizeAdj = parseFloat(sizeAdjustment) || 0;
    const termsAdj = parseFloat(termsAdjustment) || 0;
    const rentFree = parseFloat(rentFreeMonths) || 0;
    const lease = parseFloat(leaseLength) || 10;

    // Net lettable area
    const netLettableArea = sqft * (ntg / 100);

    // Benchmark range
    const benchmark = ERV_BENCHMARKS[propertyType];
    const benchmarkRangeLow = benchmark.min;
    const benchmarkRangeHigh = benchmark.max;

    // Location adjustment to benchmarks
    let locationMultiplier = 1;
    if (location === 'prime') locationMultiplier = 1.2;
    if (location === 'tertiary') locationMultiplier = 0.75;

    // Average comparable rent
    const comps = [comp1, comp2, comp3].filter(c => c > 0);
    const averageCompRent = comps.length > 0 ? comps.reduce((a, b) => a + b, 0) / comps.length : 0;

    // Apply adjustments
    const totalAdjustment = qualityAdj + sizeAdj + termsAdj;
    const adjustedCompRent = averageCompRent * (1 + totalAdjustment / 100);

    // Estimated ERV (weighted average of adjusted comps and benchmark midpoint)
    const benchmarkMid = ((benchmarkRangeLow + benchmarkRangeHigh) / 2) * locationMultiplier;
    let estimatedErv = adjustedCompRent;
    if (adjustedCompRent === 0) {
      estimatedErv = benchmarkMid;
    } else {
      // Weight: 70% comparables, 30% benchmark if we have comps
      estimatedErv = adjustedCompRent * 0.7 + benchmarkMid * 0.3;
    }

    // Annual rents
    const annualRentAtErv = estimatedErv * netLettableArea;
    const currentAnnualRent = currentRent * netLettableArea;

    // Reversionary potential
    const rentReversionary = annualRentAtErv - currentAnnualRent;
    const reversePotentialPercent = currentAnnualRent > 0 ? (rentReversionary / currentAnnualRent) * 100 : 0;

    // Effective rent after rent-free period
    // Spread rent-free over lease term
    const totalLeaseMonths = lease * 12;
    const effectiveMonths = totalLeaseMonths - rentFree;
    const effectiveRentMultiplier = totalLeaseMonths > 0 ? effectiveMonths / totalLeaseMonths : 1;
    const effectiveRentAfterFree = estimatedErv * effectiveRentMultiplier;

    // Value of rent-free incentive
    const rentFreeValue = (estimatedErv * netLettableArea / 12) * rentFree;

    // Under/over rented status
    const isUnderRented = currentRent > 0 && currentRent < estimatedErv * 0.95;
    const isOverRented = currentRent > estimatedErv * 1.05;

    setDerivedMetrics({
      netLettableArea,
      benchmarkRangeLow,
      benchmarkRangeHigh,
      averageCompRent,
      adjustedCompRent,
      estimatedErv,
      annualRentAtErv,
      currentAnnualRent,
      rentReversionary,
      reversePotentialPercent,
      effectiveRentAfterFree,
      rentFreeValue,
      isUnderRented,
      isOverRented,
    });
  }, [propertyType, totalSqFt, netToGrossRatio, currentRentPsf, location, comp1RentPsf, comp2RentPsf, comp3RentPsf, qualityAdjustment, sizeAdjustment, termsAdjustment, rentFreeMonths, leaseLength]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPercent = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  // ERV status
  const getErvStatus = () => {
    if (derivedMetrics.isUnderRented) {
      return { tone: 'success', accent: 'green' as const, label: 'Under-Rented' };
    } else if (derivedMetrics.isOverRented) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Over-Rented' };
    }
    return { tone: 'neutral', accent: 'teal' as const, label: 'At Market' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      propertyType,
      totalSqFt: parseFloat(totalSqFt) || 0,
      netToGrossRatio: parseFloat(netToGrossRatio) || 0,
      currentRentPsf: parseFloat(currentRentPsf) || 0,
      location,
      comparables: [
        parseFloat(comp1RentPsf) || 0,
        parseFloat(comp2RentPsf) || 0,
        parseFloat(comp3RentPsf) || 0,
      ],
      adjustments: {
        quality: parseFloat(qualityAdjustment) || 0,
        size: parseFloat(sizeAdjustment) || 0,
        terms: parseFloat(termsAdjustment) || 0,
      },
      leaseLength: parseFloat(leaseLength) || 0,
      rentFreeMonths: parseFloat(rentFreeMonths) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/commercial"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Commercial</span>
          </Link>
          <StatusPill tone={getErvStatus().tone} label={getErvStatus().label} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ERV Rent Calculator</h1>
              <p className="text-slate-400">
                Estimate Estimated Rental Value for commercial property
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    {Object.entries(ERV_BENCHMARKS).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Location Quality</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as 'prime' | 'secondary' | 'tertiary')}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="prime">Prime</option>
                    <option value="secondary">Secondary</option>
                    <option value="tertiary">Tertiary</option>
                  </select>
                </div>
                <FloatingField
                  label="Total Area"
                  value={totalSqFt}
                  onChange={(e) => setTotalSqFt(e.target.value)}
                  unit="sq ft"
                  helper="Gross internal area"
                />
                <FloatingField
                  label="Net to Gross Ratio"
                  value={netToGrossRatio}
                  onChange={(e) => setNetToGrossRatio(e.target.value)}
                  unit="%"
                  helper="NLA as % of GIA (typically 80-90%)"
                />
                <FloatingField
                  label="Current Rent (if let)"
                  value={currentRentPsf}
                  onChange={(e) => setCurrentRentPsf(e.target.value)}
                  unit="£ psf"
                  helper="Current passing rent per sq ft"
                />
              </div>
              <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-sm text-slate-400">
                  <span className="text-indigo-400 font-medium">Benchmark Range:</span>{' '}
                  £{derivedMetrics.benchmarkRangeLow} - £{derivedMetrics.benchmarkRangeHigh} psf for {ERV_BENCHMARKS[propertyType].label}
                </p>
              </div>
            </BentoCard>

            {/* Comparable Evidence */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Comparable Evidence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Comparable 1"
                  value={comp1RentPsf}
                  onChange={setComp1RentPsf}
                  unit="£ psf"
                  helper="Most similar property"
                />
                <FloatingField
                  label="Comparable 2"
                  value={comp2RentPsf}
                  onChange={setComp2RentPsf}
                  unit="£ psf"
                  helper="Second comparable"
                />
                <FloatingField
                  label="Comparable 3"
                  value={comp3RentPsf}
                  onChange={setComp3RentPsf}
                  unit="£ psf"
                  helper="Third comparable"
                />
              </div>
              {derivedMetrics.averageCompRent > 0 && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Average Comparable Rent:</span>
                    <span className="font-bold">£{formatNumber(derivedMetrics.averageCompRent, 2)} psf</span>
                  </div>
                </div>
              )}
            </BentoCard>

            {/* Adjustments */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Adjustments to Comparables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Quality Adjustment"
                  value={qualityAdjustment}
                  onChange={(e) => setQualityAdjustment(e.target.value)}
                  unit="%"
                  helper="Better (+) or worse (-) spec"
                />
                <FloatingField
                  label="Size Adjustment"
                  value={sizeAdjustment}
                  onChange={(e) => setSizeAdjustment(e.target.value)}
                  unit="%"
                  helper="Quantum discount/premium"
                />
                <FloatingField
                  label="Terms Adjustment"
                  value={termsAdjustment}
                  onChange={(e) => setTermsAdjustment(e.target.value)}
                  unit="%"
                  helper="Lease terms difference"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Positive % increases ERV, negative % decreases ERV relative to comparables
              </p>
            </BentoCard>

            {/* Lease Terms */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Lease Terms (for incentive analysis)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Lease Length"
                  value={leaseLength}
                  onChange={(e) => setLeaseLength(e.target.value)}
                  unit="years"
                  helper="Proposed lease term"
                />
                <FloatingField
                  label="Break Clause"
                  value={breakClause}
                  onChange={(e) => setBreakClause(e.target.value)}
                  unit="years"
                  helper="Tenant break option"
                />
                <FloatingField
                  label="Rent-Free Period"
                  value={rentFreeMonths}
                  onChange={(e) => setRentFreeMonths(e.target.value)}
                  unit="months"
                  helper="Initial rent-free"
                />
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* ERV Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Estimated Rental Value</h2>
              <div className="text-4xl font-bold text-indigo-400 mb-2">
                £{formatNumber(derivedMetrics.estimatedErv, 2)} psf
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Net Lettable Area: {formatNumber(derivedMetrics.netLettableArea)} sq ft
              </p>
              <div className="border-t border-white/10 pt-4">
                <DealMetric
                  label="Annual Rent at ERV"
                  value={formatCurrency(derivedMetrics.annualRentAtErv)}
                />
              </div>
            </BentoCard>

            {/* Reversionary Analysis */}
            {parseFloat(currentRentPsf) > 0 && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Reversionary Analysis</h2>
                <div className="space-y-3">
                  <DealMetric
                    label="Current Passing Rent"
                    value={formatCurrency(derivedMetrics.currentAnnualRent)}
                    helper={`£${currentRentPsf} psf`}
                  />
                  <DealMetric
                    label="ERV"
                    value={formatCurrency(derivedMetrics.annualRentAtErv)}
                    helper={`£${formatNumber(derivedMetrics.estimatedErv, 2)} psf`}
                  />
                  <div className="border-t border-white/10 pt-3">
                    <DealMetric
                      label="Reversionary Potential"
                      value={formatCurrency(derivedMetrics.rentReversionary)}
                      accent={derivedMetrics.rentReversionary > 0 ? 'green' : 'orange'}
                    />
                    <DealMetric
                      label="Reversion %"
                      value={formatPercent(derivedMetrics.reversePotentialPercent)}
                      accent={getErvStatus().accent}
                    />
                  </div>
                </div>
              </BentoCard>
            )}

            {/* Incentive Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Incentive Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Headline Rent"
                  value={`£${formatNumber(derivedMetrics.estimatedErv, 2)} psf`}
                />
                <DealMetric
                  label="Effective Rent"
                  value={`£${formatNumber(derivedMetrics.effectiveRentAfterFree, 2)} psf`}
                  helper="After rent-free amortised"
                />
                <DealMetric
                  label="Rent-Free Value"
                  value={formatCurrency(derivedMetrics.rentFreeValue)}
                  helper={`${rentFreeMonths} months incentive`}
                />
              </div>
            </BentoCard>

            {/* Quick Reference */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Market Context</h2>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• Prime: +10-20% over secondary</p>
                <p>• Tertiary: -20-30% under secondary</p>
                <p>• Large units: -5-15% quantum discount</p>
                <p>• New fit-out: +5-10% premium</p>
                <p>• Poor condition: -10-20% discount</p>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="ERV Rent Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your ERV Rent calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
