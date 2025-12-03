'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Split,
  TrendingUp,
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

// Title split cost estimates
const TITLE_SPLIT_COSTS = {
  legalFees: { min: 2000, max: 4000 },
  landRegistryFees: { min: 300, max: 600 },
  planningConsultant: { min: 500, max: 1500 },
  surveyorFees: { min: 400, max: 800 },
  leaseCreation: { min: 1500, max: 3000 },
};

export default function TitleSplitCalculatorPage() {
  // Property Details
  const [currentValue, setCurrentValue] = useState<string>('600000');
  const [numberOfUnits, setNumberOfUnits] = useState<string>('2');
  const [existingLeases, setExistingLeases] = useState<boolean>(false);

  // Unit Values (after split)
  const [unit1Value, setUnit1Value] = useState<string>('350000');
  const [unit2Value, setUnit2Value] = useState<string>('320000');
  const [unit3Value, setUnit3Value] = useState<string>('0');
  const [unit4Value, setUnit4Value] = useState<string>('0');

  // Costs
  const [conversionCosts, setConversionCosts] = useState<string>('30000');
  const [useHighEstimates, setUseHighEstimates] = useState<boolean>(false);
  const [hasPlanning, setHasPlanning] = useState<boolean>(true);
  const [planningCosts, setPlanningCosts] = useState<string>('2000');

  // Finance
  const [purchasePrice, setPurchasePrice] = useState<string>('550000');
  const [stampDuty, setStampDuty] = useState<string>('33750');
  const [financeCosts, setFinanceCosts] = useState<string>('25000');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    totalUnitValues: 0,
    valueUplift: 0,
    upliftPercent: 0,
    legalAndProfFees: 0,
    totalConversionCosts: 0,
    totalProjectCost: 0,
    grossProfit: 0,
    netProfit: 0,
    profitOnCost: 0,
    returnOnInvestment: 0,
    isViable: false,
    costPerUnit: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const current = parseFloat(currentValue) || 0;
    const units = parseInt(numberOfUnits) || 2;
    const u1 = parseFloat(unit1Value) || 0;
    const u2 = parseFloat(unit2Value) || 0;
    const u3 = parseFloat(unit3Value) || 0;
    const u4 = parseFloat(unit4Value) || 0;
    const conversion = parseFloat(conversionCosts) || 0;
    const purchase = parseFloat(purchasePrice) || 0;
    const sdlt = parseFloat(stampDuty) || 0;
    const finance = parseFloat(financeCosts) || 0;
    const planning = hasPlanning ? 0 : parseFloat(planningCosts) || 0;
    const costKey = useHighEstimates ? 'max' : 'min';

    // Total unit values
    const totalUnitValues = u1 + u2 + u3 + u4;

    // Value uplift
    const valueUplift = totalUnitValues - current;
    const upliftPercent = current > 0 ? (valueUplift / current) * 100 : 0;

    // Legal and professional fees
    const legalFees = TITLE_SPLIT_COSTS.legalFees[costKey];
    const landRegistry = TITLE_SPLIT_COSTS.landRegistryFees[costKey] * units;
    const surveyor = TITLE_SPLIT_COSTS.surveyorFees[costKey];
    const leaseCreation = existingLeases ? 0 : TITLE_SPLIT_COSTS.leaseCreation[costKey] * units;
    const planningConsultant = hasPlanning ? 0 : TITLE_SPLIT_COSTS.planningConsultant[costKey];

    const legalAndProfFees = legalFees + landRegistry + surveyor + leaseCreation + planningConsultant + planning;

    // Total conversion costs
    const totalConversionCosts = conversion + legalAndProfFees;

    // Total project cost
    const totalProjectCost = purchase + sdlt + totalConversionCosts + finance;

    // Profits
    const grossProfit = totalUnitValues - totalProjectCost;
    const netProfit = grossProfit; // Before tax

    // Returns
    const profitOnCost = totalProjectCost > 0 ? (netProfit / totalProjectCost) * 100 : 0;

    // Equity required (simplified)
    const equityRequired = purchase * 0.25 + totalConversionCosts; // Assume 75% LTV
    const returnOnInvestment = equityRequired > 0 ? (netProfit / equityRequired) * 100 : 0;

    // Is it viable?
    const isViable = netProfit > 0 && profitOnCost >= 15;

    // Cost per unit
    const costPerUnit = units > 0 ? totalProjectCost / units : 0;

    setDerivedMetrics({
      totalUnitValues,
      valueUplift,
      upliftPercent,
      legalAndProfFees,
      totalConversionCosts,
      totalProjectCost,
      grossProfit,
      netProfit,
      profitOnCost,
      returnOnInvestment,
      isViable,
      costPerUnit,
    });
  }, [currentValue, numberOfUnits, unit1Value, unit2Value, unit3Value, unit4Value, conversionCosts, useHighEstimates, hasPlanning, planningCosts, purchasePrice, stampDuty, financeCosts, existingLeases]);

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

  // Viability status
  const getViabilityStatus = () => {
    if (derivedMetrics.profitOnCost >= 20) {
      return { tone: 'success', accent: 'green' as const, label: 'Strong Deal' };
    } else if (derivedMetrics.profitOnCost >= 15) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Viable' };
    }
    return { tone: 'warning', accent: 'orange' as const, label: 'Marginal' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      currentValue: parseFloat(currentValue) || 0,
      numberOfUnits: parseInt(numberOfUnits) || 0,
      unit1Value: parseFloat(unit1Value) || 0,
      unit2Value: parseFloat(unit2Value) || 0,
      unit3Value: parseFloat(unit3Value) || 0,
      unit4Value: parseFloat(unit4Value) || 0,
      conversionCosts: parseFloat(conversionCosts) || 0,
      purchasePrice: parseFloat(purchasePrice) || 0,
      stampDuty: parseFloat(stampDuty) || 0,
      financeCosts: parseFloat(financeCosts) || 0,
      hasPlanning,
      existingLeases,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/titlesplit"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Title Split</span>
          </Link>
          <StatusPill tone={getViabilityStatus().tone} label={getViabilityStatus().label} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Split className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Title Split Calculator</h1>
              <p className="text-slate-400">
                Determine if splitting a property title adds value
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
                  label="Current Value (Single Title)"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Value as one property"
                />
                <FloatingField
                  label="Number of Units"
                  value={numberOfUnits}
                  onChange={(e) => setNumberOfUnits(e.target.value)}
                  helper="Units to create (2-4)"
                />
                <FloatingField
                  label="Purchase Price"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="What you're paying"
                />
                <FloatingField
                  label="Stamp Duty"
                  value={stampDuty}
                  onChange={(e) => setStampDuty(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="SDLT payable"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={existingLeases}
                      onChange={(e) => setExistingLeases(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500"
                    />
                    <div>
                      <span>Existing Leases</span>
                      <p className="text-xs text-slate-500">Already has separate leases</p>
                    </div>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPlanning}
                      onChange={(e) => setHasPlanning(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500"
                    />
                    <div>
                      <span>Has Planning/PD Rights</span>
                      <p className="text-xs text-slate-500">No planning needed</p>
                    </div>
                  </label>
                </div>
              </div>
            </BentoCard>

            {/* Unit Values */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Individual Unit Values (After Split)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Unit 1 Value"
                  value={unit1Value}
                  onChange={setUnit1Value}
                  unit="£"
                  unitPosition="prefix"
                  helper="e.g., Ground floor flat"
                />
                <FloatingField
                  label="Unit 2 Value"
                  value={unit2Value}
                  onChange={setUnit2Value}
                  unit="£"
                  unitPosition="prefix"
                  helper="e.g., First floor flat"
                />
                {parseInt(numberOfUnits) >= 3 && (
                  <FloatingField
                    label="Unit 3 Value"
                    value={unit3Value}
                    onChange={setUnit3Value}
                    unit="£"
                    unitPosition="prefix"
                  />
                )}
                {parseInt(numberOfUnits) >= 4 && (
                  <FloatingField
                    label="Unit 4 Value"
                    value={unit4Value}
                    onChange={setUnit4Value}
                    unit="£"
                    unitPosition="prefix"
                  />
                )}
              </div>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Unit Values:</span>
                  <span className="font-bold text-green-400">{formatCurrency(derivedMetrics.totalUnitValues)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-400">Value Uplift:</span>
                  <span className="font-bold text-green-400">+{formatCurrency(derivedMetrics.valueUplift)} ({formatPercent(derivedMetrics.upliftPercent)})</span>
                </div>
              </div>
            </BentoCard>

            {/* Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Project Costs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Conversion Costs"
                  value={conversionCosts}
                  onChange={(e) => setConversionCosts(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Works to create separate units"
                />
                <FloatingField
                  label="Finance Costs"
                  value={financeCosts}
                  onChange={(e) => setFinanceCosts(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Interest, fees etc."
                />
                {!hasPlanning && (
                  <FloatingField
                    label="Planning Costs"
                    value={planningCosts}
                    onChange={(e) => setPlanningCosts(e.target.value)}
                    unit="£"
                    unitPosition="prefix"
                    helper="Application and consultant fees"
                  />
                )}
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useHighEstimates}
                      onChange={(e) => setUseHighEstimates(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500"
                    />
                    <span>Use higher cost estimates</span>
                  </label>
                </div>
              </div>
            </BentoCard>

            {/* Title Split Info */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Title Split Considerations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-green-400 mb-2">Benefits</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Unlock hidden value in property</li>
                    <li>• Sell units individually</li>
                    <li>• Easier to finance separately</li>
                    <li>• Flexible exit options</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-amber-400 mb-2">Requirements</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Planning permission or PD rights</li>
                    <li>• Separate access to each unit</li>
                    <li>• Meeting building regulations</li>
                    <li>• Creating new leases (if freehold)</li>
                  </ul>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Value Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Value Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Current Value"
                  value={formatCurrency(parseFloat(currentValue) || 0)}
                  helper="As single title"
                />
                <DealMetric
                  label="Split Value"
                  value={formatCurrency(derivedMetrics.totalUnitValues)}
                  helper={`${numberOfUnits} separate units`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Value Uplift"
                    value={formatCurrency(derivedMetrics.valueUplift)}
                    accent={derivedMetrics.valueUplift > 0 ? 'green' : 'orange'}
                  />
                  <DealMetric
                    label="Uplift %"
                    value={formatPercent(derivedMetrics.upliftPercent)}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Costs Breakdown */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Costs Breakdown</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Purchase Price"
                  value={formatCurrency(parseFloat(purchasePrice) || 0)}
                />
                <DealMetric
                  label="Stamp Duty"
                  value={formatCurrency(parseFloat(stampDuty) || 0)}
                />
                <DealMetric
                  label="Conversion Costs"
                  value={formatCurrency(parseFloat(conversionCosts) || 0)}
                />
                <DealMetric
                  label="Legal & Prof Fees"
                  value={formatCurrency(derivedMetrics.legalAndProfFees)}
                />
                <DealMetric
                  label="Finance Costs"
                  value={formatCurrency(parseFloat(financeCosts) || 0)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Total Project Cost"
                    value={formatCurrency(derivedMetrics.totalProjectCost)}
                    accent="teal"
                  />
                  <DealMetric
                    label="Cost Per Unit"
                    value={formatCurrency(derivedMetrics.costPerUnit)}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Profit Analysis */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Profit Analysis</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Gross Profit"
                  value={formatCurrency(derivedMetrics.grossProfit)}
                  accent={derivedMetrics.grossProfit > 0 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Profit on Cost"
                  value={formatPercent(derivedMetrics.profitOnCost)}
                  accent={derivedMetrics.profitOnCost >= 20 ? 'green' : derivedMetrics.profitOnCost >= 15 ? 'orange' : 'orange'}
                  helper="Target: 15-20%+"
                />
                <DealMetric
                  label="ROI"
                  value={formatPercent(derivedMetrics.returnOnInvestment)}
                  helper="On equity invested"
                />
              </div>
            </BentoCard>

            {/* Viability Check */}
            <BentoCard>
              <div className={`p-4 rounded-lg border ${derivedMetrics.isViable ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex items-center gap-3">
                  {derivedMetrics.isViable ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  )}
                  <div>
                    <p className={`font-semibold ${derivedMetrics.isViable ? 'text-green-400' : 'text-amber-400'}`}>
                      {derivedMetrics.isViable ? 'Deal Looks Viable' : 'Review Required'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {derivedMetrics.isViable
                        ? 'Profit on cost exceeds 15%'
                        : 'Consider negotiating purchase price or reducing costs'}
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Title Split Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your Title Split calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
