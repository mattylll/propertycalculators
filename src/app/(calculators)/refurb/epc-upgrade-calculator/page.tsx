'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Leaf,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

// EPC upgrade measures with costs and SAP point improvements
const EPC_MEASURES = {
  loftInsulation: { name: 'Loft Insulation (300mm)', cost: { min: 300, max: 600 }, sapPoints: 8 },
  cavityWall: { name: 'Cavity Wall Insulation', cost: { min: 800, max: 1500 }, sapPoints: 10 },
  externalWall: { name: 'External Wall Insulation', cost: { min: 8000, max: 15000 }, sapPoints: 15 },
  internalWall: { name: 'Internal Wall Insulation', cost: { min: 5000, max: 10000 }, sapPoints: 12 },
  floorInsulation: { name: 'Floor Insulation', cost: { min: 1000, max: 2500 }, sapPoints: 5 },
  doubleGlazing: { name: 'Double Glazing', cost: { min: 3000, max: 8000 }, sapPoints: 6 },
  tripleGlazing: { name: 'Triple Glazing', cost: { min: 6000, max: 15000 }, sapPoints: 10 },
  condensingBoiler: { name: 'Condensing Boiler', cost: { min: 2000, max: 4000 }, sapPoints: 12 },
  heatPump: { name: 'Air Source Heat Pump', cost: { min: 8000, max: 15000 }, sapPoints: 25 },
  solarPV: { name: 'Solar PV (4kW)', cost: { min: 5000, max: 8000 }, sapPoints: 12 },
  solarThermal: { name: 'Solar Thermal Hot Water', cost: { min: 3000, max: 5000 }, sapPoints: 8 },
  ledLighting: { name: 'LED Lighting Throughout', cost: { min: 200, max: 500 }, sapPoints: 3 },
  heatingControls: { name: 'Smart Heating Controls', cost: { min: 300, max: 600 }, sapPoints: 4 },
  draughtProofing: { name: 'Draught Proofing', cost: { min: 150, max: 400 }, sapPoints: 2 },
};

type EpcRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

const EPC_BANDS: Record<EpcRating, { min: number; max: number; color: string }> = {
  A: { min: 92, max: 100, color: '#00C49F' },
  B: { min: 81, max: 91, color: '#3CB371' },
  C: { min: 69, max: 80, color: '#90EE90' },
  D: { min: 55, max: 68, color: '#FFD700' },
  E: { min: 39, max: 54, color: '#FFA500' },
  F: { min: 21, max: 38, color: '#FF6347' },
  G: { min: 1, max: 20, color: '#DC143C' },
};

function getSapFromRating(rating: EpcRating): number {
  return (EPC_BANDS[rating].min + EPC_BANDS[rating].max) / 2;
}

function getRatingFromSap(sap: number): EpcRating {
  for (const [rating, band] of Object.entries(EPC_BANDS)) {
    if (sap >= band.min && sap <= band.max) {
      return rating as EpcRating;
    }
  }
  return sap > 92 ? 'A' : 'G';
}

export default function EPCUpgradeCalculatorPage() {
  // Property Details
  const [currentRating, setCurrentRating] = useState<EpcRating>('E');
  const [targetRating, setTargetRating] = useState<EpcRating>('C');
  const [propertyType, setPropertyType] = useState<'house' | 'flat' | 'bungalow'>('house');
  const [propertyAge, setPropertyAge] = useState<'pre-1930' | '1930-1980' | '1980-2000' | 'post-2000'>('1930-1980');

  // Selected Measures
  const [selectedMeasures, setSelectedMeasures] = useState<Set<string>>(new Set());

  // Costs
  const [useHighEstimates, setUseHighEstimates] = useState<boolean>(false);

  // Grants
  const [hasGrantFunding, setHasGrantFunding] = useState<boolean>(false);
  const [grantAmount, setGrantAmount] = useState<string>('5000');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    currentSap: 0,
    targetSap: 0,
    estimatedNewSap: 0,
    estimatedNewRating: 'E' as EpcRating,
    sapImprovement: 0,
    totalCost: 0,
    netCost: 0,
    meetsTarget: false,
    annualEnergySavings: 0,
    paybackYears: 0,
    co2Reduction: 0,
    recommendedMeasures: [] as string[],
  });

  // Calculate derived metrics
  useEffect(() => {
    const currentSap = getSapFromRating(currentRating);
    const targetSap = EPC_BANDS[targetRating].min;
    const costKey = useHighEstimates ? 'max' : 'min';

    // Calculate total SAP improvement and cost from selected measures
    let sapImprovement = 0;
    let totalCost = 0;

    selectedMeasures.forEach((measureId) => {
      const measure = EPC_MEASURES[measureId as keyof typeof EPC_MEASURES];
      if (measure) {
        sapImprovement += measure.sapPoints;
        totalCost += measure.cost[costKey];
      }
    });

    // Estimated new SAP (capped at 100)
    const estimatedNewSap = Math.min(100, currentSap + sapImprovement);
    const estimatedNewRating = getRatingFromSap(estimatedNewSap);
    const meetsTarget = estimatedNewSap >= targetSap;

    // Net cost after grants
    const grant = hasGrantFunding ? parseFloat(grantAmount) || 0 : 0;
    const netCost = Math.max(0, totalCost - grant);

    // Rough energy savings calculation
    // Assume average annual energy spend of £1,800 for a D-rated home
    // Each SAP point improvement saves roughly £25-40 per year
    const annualEnergySavings = sapImprovement * 30;
    const paybackYears = netCost > 0 && annualEnergySavings > 0 ? netCost / annualEnergySavings : 0;

    // CO2 reduction (rough estimate: each SAP point = ~200kg CO2/year)
    const co2Reduction = sapImprovement * 200;

    // Recommend measures if target not met
    const recommendedMeasures: string[] = [];
    if (!meetsTarget) {
      const sapNeeded = targetSap - estimatedNewSap;
      // Find measures not selected, sorted by SAP points per pound
      const unselectedMeasures = Object.entries(EPC_MEASURES)
        .filter(([id]) => !selectedMeasures.has(id))
        .map(([id, measure]) => ({
          id,
          name: measure.name,
          efficiency: measure.sapPoints / measure.cost[costKey],
          sapPoints: measure.sapPoints,
        }))
        .sort((a, b) => b.efficiency - a.efficiency);

      let remainingSap = sapNeeded;
      for (const measure of unselectedMeasures) {
        if (remainingSap <= 0) break;
        recommendedMeasures.push(measure.name);
        remainingSap -= measure.sapPoints;
      }
    }

    setDerivedMetrics({
      currentSap,
      targetSap,
      estimatedNewSap,
      estimatedNewRating,
      sapImprovement,
      totalCost,
      netCost,
      meetsTarget,
      annualEnergySavings,
      paybackYears,
      co2Reduction,
      recommendedMeasures,
    });
  }, [currentRating, targetRating, selectedMeasures, useHighEstimates, hasGrantFunding, grantAmount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleMeasure = (measureId: string) => {
    const newSelected = new Set(selectedMeasures);
    if (newSelected.has(measureId)) {
      newSelected.delete(measureId);
    } else {
      newSelected.add(measureId);
    }
    setSelectedMeasures(newSelected);
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      currentRating,
      targetRating,
      propertyType,
      propertyAge,
      selectedMeasures: Array.from(selectedMeasures),
      useHighEstimates,
      hasGrantFunding,
      grantAmount: parseFloat(grantAmount) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/refurb"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Refurb</span>
          </Link>
          <StatusPill
            accent={derivedMetrics.meetsTarget ? 'green' : 'orange'}
            label={derivedMetrics.meetsTarget ? 'Target Met' : 'Below Target'}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">EPC Upgrade Calculator</h1>
              <p className="text-slate-400">
                Calculate costs to improve your EPC rating
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current & Target Rating */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                EPC Rating
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Current Rating</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(EPC_BANDS) as EpcRating[]).map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setCurrentRating(rating)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${currentRating === rating ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: EPC_BANDS[rating].color }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">SAP: {derivedMetrics.currentSap}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Target Rating</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(EPC_BANDS) as EpcRating[]).map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setTargetRating(rating)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${targetRating === rating ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: EPC_BANDS[rating].color }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Minimum SAP: {derivedMetrics.targetSap}</p>
                </div>
              </div>
            </BentoCard>

            {/* Upgrade Measures */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Select Upgrade Measures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(EPC_MEASURES).map(([id, measure]) => (
                  <button
                    key={id}
                    onClick={() => toggleMeasure(id)}
                    className={`p-3 rounded-lg border text-left transition-all ${selectedMeasures.has(id) ? 'bg-green-500/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{measure.name}</span>
                      {selectedMeasures.has(id) && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-slate-400">
                        {formatCurrency(measure.cost.min)} - {formatCurrency(measure.cost.max)}
                      </span>
                      <span className="text-green-400">+{measure.sapPoints} SAP</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useHighEstimates}
                    onChange={(e) => setUseHighEstimates(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500"
                  />
                  <span className="text-sm">Use higher cost estimates</span>
                </label>
              </div>
            </BentoCard>

            {/* Grants & Funding */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Grants & Funding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGrantFunding}
                      onChange={(e) => setHasGrantFunding(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500"
                    />
                    <div>
                      <span>Grant Funding Available</span>
                      <p className="text-xs text-slate-500">e.g., ECO4, BUS, Local schemes</p>
                    </div>
                  </label>
                </div>
                {hasGrantFunding && (
                  <FloatingField
                    label="Grant Amount"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    unit="£"
                    unitPosition="prefix"
                    helper="Expected grant funding"
                  />
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-slate-400">
                  <span className="text-blue-400 font-medium">Available Schemes:</span>
                  {' '}ECO4 (cavity/loft insulation), Boiler Upgrade Scheme (£7,500 for heat pumps),
                  Local Authority grants (varies by area).
                </p>
              </div>
            </BentoCard>

            {/* MEES Warning */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                MEES Regulations
              </h2>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-slate-300 mb-3">
                  <strong>Minimum Energy Efficiency Standards (MEES)</strong> require rental properties to have an EPC rating of at least E.
                  The government has proposed increasing this to C by 2028.
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Current requirement: EPC E or above for rentals</li>
                  <li>• Proposed 2028: EPC C for new tenancies</li>
                  <li>• Non-compliance: up to £30,000 fine</li>
                  <li>• Spending cap: £3,500 (current rules)</li>
                </ul>
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Rating Progress */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Projected Rating</h2>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: EPC_BANDS[currentRating].color }}
                  >
                    {currentRating}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Current</p>
                </div>
                <TrendingUp className="w-6 h-6 text-slate-500" />
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: EPC_BANDS[derivedMetrics.estimatedNewRating].color }}
                  >
                    {derivedMetrics.estimatedNewRating}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Projected</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  SAP: {derivedMetrics.currentSap} → {derivedMetrics.estimatedNewSap}
                  <span className="text-green-400 ml-2">+{derivedMetrics.sapImprovement}</span>
                </p>
              </div>
            </BentoCard>

            {/* Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Costs</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Total Cost"
                  value={formatCurrency(derivedMetrics.totalCost)}
                />
                {hasGrantFunding && (
                  <DealMetric
                    label="Grant Funding"
                    value={`-${formatCurrency(parseFloat(grantAmount) || 0)}`}
                    accent="green"
                  />
                )}
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Net Cost"
                    value={formatCurrency(derivedMetrics.netCost)}
                    accent="teal"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Savings & Payback */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Savings & Payback</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Est. Annual Savings"
                  value={formatCurrency(derivedMetrics.annualEnergySavings)}
                  helper="On energy bills"
                />
                <DealMetric
                  label="Payback Period"
                  value={derivedMetrics.paybackYears > 0 ? `${derivedMetrics.paybackYears.toFixed(1)} years` : 'N/A'}
                />
                <DealMetric
                  label="CO2 Reduction"
                  value={`${(derivedMetrics.co2Reduction / 1000).toFixed(1)} tonnes/year`}
                  helper="Annual CO2 savings"
                />
              </div>
            </BentoCard>

            {/* Recommendations */}
            {!derivedMetrics.meetsTarget && derivedMetrics.recommendedMeasures.length > 0 && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Recommended Measures</h2>
                <p className="text-sm text-slate-400 mb-3">
                  Add these to reach target:
                </p>
                <ul className="space-y-2">
                  {derivedMetrics.recommendedMeasures.slice(0, 3).map((measure, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {measure}
                    </li>
                  ))}
                </ul>
              </BentoCard>
            )}

            {/* AI Validation */}
            <AiOutputCard
              title="EPC Upgrade Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your EPC Upgrade calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
