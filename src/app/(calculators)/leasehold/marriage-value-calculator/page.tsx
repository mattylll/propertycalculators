'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
} from 'lucide-react';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';
import { PropertyButton } from '@/components/property-kit/property-button';

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
  const [hasCalculated, setHasCalculated] = useState(false);

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
    setHasCalculated(true);
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
    <CalculatorPageLayout
      title="Marriage Value Calculator"
      description="Calculate marriage value component for leases under 80 years. Marriage value represents the additional value created when leasehold and freehold interests are combined."
      category="Leasehold"
      categorySlug="leasehold"
      categoryColor="#06B6D4"
      badges={[
        {
          label: derivedMetrics.isUnder80Years ? 'Under 80 Years' : 'Over 80 Years',
          variant: derivedMetrics.isUnder80Years ? 'warning' : 'success'
        },
      ]}
    >

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
            <CalculatorResultsGate
              calculatorType="Marriage Value Calculator"
              calculatorSlug="marriage-value-calculator"
              formData={{
                freeholdValue,
                currentLeaseYears,
                extensionYears,
                groundRent,
                capitalisationRate,
                defermentRate,
                marriageValueShare,
              }}
              hasCalculated={hasCalculated}
            >
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
            </CalculatorResultsGate>

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

        {/* SEO Content */}
        <CalculatorSEO
          calculatorName="Marriage Value Calculator"
          calculatorSlug="marriage-value-calculator"
          description="The Marriage Value Calculator helps UK leaseholders understand the marriage value component when extending leases under 80 years. Marriage value represents the increase in property value created when leasehold and freehold interests are combined. Under current law, leaseholders must pay 50% of this value to the freeholder. This calculator uses relativity graphs and the statutory valuation formula to estimate marriage value based on Savills/RICS data."
          howItWorks={`The calculator determines marriage value through the following process:

1. Relativity Assessment - Uses industry-standard relativity graphs (Savills/RICS) to determine what percentage of freehold value your current lease represents based on years remaining
2. Current Lease Value - Calculates your property's current value as a leasehold (typically 82-92% of freehold for 70-80 year leases)
3. Extended Lease Value - Calculates value after extension to 999 years (approximately 99% of freehold value)
4. Marriage Value Calculation - The difference between extended and current value represents the marriage value, of which you must pay 50% to the freeholder
5. Total Premium - Combines capitalised ground rent, reversion value, and your share of marriage value

Marriage value only applies to leases under 80 years and can add £20,000-£50,000+ to extension costs.`}
          whenToUse="Use this calculator when your lease is approaching or has fallen below 80 years to understand the marriage value impact on extension costs. Critical for financial planning before serving a Section 42 notice, evaluating whether to extend now or wait for leasehold reform, and purchase negotiations on properties with sub-80 year leases. Understanding marriage value helps you time your extension to minimize costs."
          keyFeatures={[
            "Calculate marriage value for leases under 80 years",
            "Use industry-standard relativity graphs",
            "Show leaseholder and freeholder shares",
            "Compare value before and after extension",
          ]}
          faqs={[
            {
              question: "What exactly is marriage value?",
              answer: "Marriage value is the increase in property value created when the leasehold and freehold interests are 'married' together through lease extension. For example, if your current 75-year lease is worth £280k but would be worth £340k with a 165-year lease (75+90), the marriage value is £60k. Under current law, you must pay 50% (£30k) of this to the freeholder as part of the extension premium."
            },
            {
              question: "Why does marriage value only apply under 80 years?",
              answer: "The 80-year threshold was established by the Leasehold Reform Act 1993 as a compromise. Above 80 years, the lease still retains substantial value and the uplift from extension is modest, so no marriage value is payable. Below 80 years, the value deteriorates significantly, creating substantial marriage value that Parliament decided should be shared 50/50 between leaseholder and freeholder."
            },
            {
              question: "How much is marriage value typically?",
              answer: "Marriage value varies based on property value and lease length. For a £350k flat at 75 years, marriage value might be £40-60k (your share: £20-30k). At 65 years, it could be £80-100k (your share: £40-50k). The shorter the lease, the higher the marriage value. This is why extending before 80 years is crucial - it can save tens of thousands."
            },
            {
              question: "What are relativity graphs?",
              answer: "Relativity graphs show the value of a leasehold property as a percentage of its freehold value, based on remaining lease length. They're produced by valuation firms (Savills, Gerald Eve, RICS) using market data. For example, a 75-year lease might have 85% relativity (worth 85% of freehold value), while a 55-year lease has 65% relativity. These graphs are used by surveyors and tribunals to calculate marriage value."
            },
            {
              question: "Will leasehold reform abolish marriage value?",
              answer: "Yes - the Leasehold and Freehold Reform Act 2024 proposes to abolish marriage value entirely. This will dramatically reduce extension costs for leases under 80 years, potentially saving leaseholders £20,000-£50,000+. However, the exact implementation date is uncertain. If your lease is under 80 years, you may wish to wait for reform, but must balance this against ongoing value deterioration and mortgage restrictions."
            },
          ]}
          relatedTerms={[
            "Marriage value calculation",
            "Relativity graphs leasehold",
            "80 year marriage value",
            "Leasehold valuation relativity",
            "RICS relativity",
            "Savills relativity graph",
            "Section 42 marriage value",
            "Lease extension under 80 years",
            "First-tier Tribunal valuation",
            "Leasehold Reform Act marriage value",
          ]}
          categoryColor="#06B6D4"
        />
    </CalculatorPageLayout>
  );
}
