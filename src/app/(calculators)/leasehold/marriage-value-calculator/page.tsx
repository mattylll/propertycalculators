'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

// Relativity rates based on Savills/RICS graphs (approximate)
// These show the value of a lease as % of freehold value
const RELATIVITY_RATES: Record<number, number> = {
  100: 99.5,
  95: 98.5,
  90: 97.0,
  85: 95.0,
  80: 92.5,
  79: 91.5, // Marriage value kicks in below 80
  78: 90.5,
  77: 89.5,
  76: 88.0,
  75: 86.5,
  70: 82.0,
  65: 77.0,
  60: 72.0,
  55: 66.0,
  50: 60.0,
  45: 53.0,
  40: 46.0,
  35: 38.0,
  30: 30.0,
  25: 22.0,
  20: 15.0,
};

function getRelativity(years: number): number {
  if (years >= 100) return RELATIVITY_RATES[100];
  if (years <= 20) return RELATIVITY_RATES[20];

  // Find closest values and interpolate
  const sortedYears = Object.keys(RELATIVITY_RATES).map(Number).sort((a, b) => b - a);
  for (let i = 0; i < sortedYears.length - 1; i++) {
    const higher = sortedYears[i];
    const lower = sortedYears[i + 1];
    if (years <= higher && years >= lower) {
      const ratio = (years - lower) / (higher - lower);
      return RELATIVITY_RATES[lower] + ratio * (RELATIVITY_RATES[higher] - RELATIVITY_RATES[lower]);
    }
  }
  return 90; // Default fallback
}

export default function MarriageValueCalculatorPage() {
  // Property Details
  const [freeholdValue, setFreeholdValue] = useState<string>('400000');
  const [currentLeaseYears, setCurrentLeaseYears] = useState<string>('72');
  const [extensionYears, setExtensionYears] = useState<string>('90');
  const [groundRent, setGroundRent] = useState<string>('250');
  const [groundRentEscalation, setGroundRentEscalation] = useState<string>('fixed');

  // Valuation Parameters
  const [capitalisationRate, setCapitalisationRate] = useState<string>('5');
  const [defermentRate, setDefermentRate] = useState<string>('5');
  const [marriageValueShare, setMarriageValueShare] = useState<string>('50');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    currentLeaseRelativity: 0,
    extendedLeaseRelativity: 0,
    currentLeaseValue: 0,
    extendedLeaseValue: 0,
    valueUplift: 0,
    marriageValueTotal: 0,
    landlordMarriageShare: 0,
    capitalisedGroundRent: 0,
    presentValueReversion: 0,
    totalPremium: 0,
    valueGainToLeaseholder: 0,
    isUnder80Years: false,
    yearsUntil80: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const freehold = parseFloat(freeholdValue) || 0;
    const currentYears = parseFloat(currentLeaseYears) || 0;
    const extYears = parseFloat(extensionYears) || 90;
    const gr = parseFloat(groundRent) || 0;
    const capRate = parseFloat(capitalisationRate) || 5;
    const defRate = parseFloat(defermentRate) || 5;
    const mvShare = parseFloat(marriageValueShare) || 50;

    // Calculate extended lease length
    const newLeaseYears = currentYears + extYears;

    // Get relativity percentages
    const currentLeaseRelativity = getRelativity(currentYears);
    const extendedLeaseRelativity = getRelativity(newLeaseYears);

    // Calculate lease values
    const currentLeaseValue = freehold * (currentLeaseRelativity / 100);
    const extendedLeaseValue = freehold * (extendedLeaseRelativity / 100);

    // Value uplift
    const valueUplift = extendedLeaseValue - currentLeaseValue;

    // Marriage value (only applies if under 80 years)
    const isUnder80Years = currentYears < 80;
    const yearsUntil80 = Math.max(0, 80 - currentYears);

    // Marriage value = (Extended Value - Current Value) - Premium
    // But we need to calculate the premium components first

    // Capitalised ground rent (Years Purchase)
    // YP = (1 - (1 + rate)^-n) / rate
    const ypCurrent = capRate > 0 ? (1 - Math.pow(1 + capRate / 100, -currentYears)) / (capRate / 100) : 0;
    const capitalisedGroundRent = gr * ypCurrent;

    // Present value of reversion (deferred to end of current lease)
    // PV = Freehold Value / (1 + rate)^n
    const presentValueReversion = freehold / Math.pow(1 + defRate / 100, currentYears);

    // Marriage value (if under 80 years)
    // This is the gain from marriage of interests
    let marriageValueTotal = 0;
    let landlordMarriageShare = 0;

    if (isUnder80Years) {
      // Marriage value = Extended Value - Current Value - (Ground Rent Cap + Reversion)
      // Simplified: the uplift minus what the landlord is giving up
      marriageValueTotal = valueUplift;
      landlordMarriageShare = marriageValueTotal * (mvShare / 100);
    }

    // Total premium
    // Premium = Capitalised Ground Rent + Diminution in Reversion + Landlord's Share of Marriage Value
    // For simplicity, we're using: Ground Rent Cap + Marriage Value Share
    const totalPremium = capitalisedGroundRent + presentValueReversion + landlordMarriageShare;

    // Value gain to leaseholder after paying premium
    const valueGainToLeaseholder = valueUplift - totalPremium;

    setDerivedMetrics({
      currentLeaseRelativity,
      extendedLeaseRelativity,
      currentLeaseValue,
      extendedLeaseValue,
      valueUplift,
      marriageValueTotal,
      landlordMarriageShare,
      capitalisedGroundRent,
      presentValueReversion,
      totalPremium,
      valueGainToLeaseholder,
      isUnder80Years,
      yearsUntil80,
    });
  }, [freeholdValue, currentLeaseYears, extensionYears, groundRent, capitalisationRate, defermentRate, marriageValueShare]);

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

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      freeholdValue: parseFloat(freeholdValue) || 0,
      currentLeaseYears: parseFloat(currentLeaseYears) || 0,
      extensionYears: parseFloat(extensionYears) || 0,
      groundRent: parseFloat(groundRent) || 0,
      capitalisationRate: parseFloat(capitalisationRate) || 0,
      defermentRate: parseFloat(defermentRate) || 0,
      marriageValueShare: parseFloat(marriageValueShare) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/leasehold"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leasehold</span>
          </Link>
          <StatusPill
            tone={derivedMetrics.isUnder80Years ? 'warning' : 'success'}
            label={derivedMetrics.isUnder80Years ? 'Under 80 Years' : 'Over 80 Years'}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Marriage Value Calculator</h1>
              <p className="text-slate-400">
                Calculate marriage value component for leases under 80 years
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
                <Calculator className="w-5 h-5 text-blue-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Freehold Value"
                  value={freeholdValue}
                  onChange={(e) => setFreeholdValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Unencumbered freehold value"
                />
                <FloatingField
                  label="Current Lease Years"
                  value={currentLeaseYears}
                  onChange={(e) => setCurrentLeaseYears(e.target.value)}
                  unit="years"
                  helper={derivedMetrics.isUnder80Years ? `${derivedMetrics.yearsUntil80.toFixed(0)} years until 80` : 'Above 80 years'}
                />
                <FloatingField
                  label="Extension Length"
                  value={extensionYears}
                  onChange={(e) => setExtensionYears(e.target.value)}
                  unit="years"
                  helper="Statutory: 90 years added"
                />
                <FloatingField
                  label="Current Ground Rent"
                  value={groundRent}
                  onChange={(e) => setGroundRent(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Annual ground rent"
                />
              </div>
            </BentoCard>

            {/* Valuation Parameters */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Valuation Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Capitalisation Rate"
                  value={capitalisationRate}
                  onChange={(e) => setCapitalisationRate(e.target.value)}
                  unit="%"
                  helper="For ground rent (5-7%)"
                />
                <FloatingField
                  label="Deferment Rate"
                  value={defermentRate}
                  onChange={(e) => setDefermentRate(e.target.value)}
                  unit="%"
                  helper="Sportelli rate: 5%"
                />
                <FloatingField
                  label="Marriage Value Share"
                  value={marriageValueShare}
                  onChange={(e) => setMarriageValueShare(e.target.value)}
                  unit="%"
                  helper="Landlord's share (50%)"
                />
              </div>
            </BentoCard>

            {/* Relativity Visualization */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Relativity Comparison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Current Lease ({currentLeaseYears} years)</p>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${derivedMetrics.currentLeaseRelativity}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold mt-2">{formatPercent(derivedMetrics.currentLeaseRelativity)} of freehold</p>
                  <p className="text-sm text-slate-500">{formatCurrency(derivedMetrics.currentLeaseValue)}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Extended Lease ({parseFloat(currentLeaseYears) + parseFloat(extensionYears)} years)</p>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${derivedMetrics.extendedLeaseRelativity}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold mt-2">{formatPercent(derivedMetrics.extendedLeaseRelativity)} of freehold</p>
                  <p className="text-sm text-slate-500">{formatCurrency(derivedMetrics.extendedLeaseValue)}</p>
                </div>
              </div>
            </BentoCard>

            {/* Marriage Value Explanation */}
            {derivedMetrics.isUnder80Years && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Marriage Value Explained
                </h2>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-slate-300 mb-3">
                    <strong>Marriage value</strong> applies to leases under 80 years. It represents the value created when the leasehold and freehold interests are "married" together.
                  </p>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Under the current law, leaseholders must pay 50% of the marriage value to the freeholder</li>
                    <li>• The shorter the lease, the higher the marriage value</li>
                    <li>• Act quickly - once below 80 years, costs increase significantly</li>
                    <li>• Leasehold reform may eliminate marriage value in future</li>
                  </ul>
                </div>
              </BentoCard>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Value Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Value Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Current Lease Value"
                  value={formatCurrency(derivedMetrics.currentLeaseValue)}
                  helper={`${formatPercent(derivedMetrics.currentLeaseRelativity)} relativity`}
                />
                <DealMetric
                  label="Extended Lease Value"
                  value={formatCurrency(derivedMetrics.extendedLeaseValue)}
                  helper={`${formatPercent(derivedMetrics.extendedLeaseRelativity)} relativity`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Value Uplift"
                    value={formatCurrency(derivedMetrics.valueUplift)}
                    accent="green"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Premium Breakdown */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Premium Breakdown</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Capitalised Ground Rent"
                  value={formatCurrency(derivedMetrics.capitalisedGroundRent)}
                  helper="Present value of GR payments"
                />
                <DealMetric
                  label="Reversion Value"
                  value={formatCurrency(derivedMetrics.presentValueReversion)}
                  helper="Deferred freehold value"
                />
                {derivedMetrics.isUnder80Years && (
                  <DealMetric
                    label="Marriage Value (50%)"
                    value={formatCurrency(derivedMetrics.landlordMarriageShare)}
                    helper="Landlord's share"
                    accent="orange"
                  />
                )}
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Premium"
                    value={formatCurrency(derivedMetrics.totalPremium)}
                    accent="teal"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Net Benefit */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Net Benefit</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Value Gain After Premium"
                  value={formatCurrency(derivedMetrics.valueGainToLeaseholder)}
                  accent={derivedMetrics.valueGainToLeaseholder > 0 ? 'green' : 'orange'}
                  helper="Increase in your property value"
                />
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">
                    This is the net increase in your property value after paying the premium. Even if this seems high, extending protects long-term value.
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Marriage Value Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your Marriage Value calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
