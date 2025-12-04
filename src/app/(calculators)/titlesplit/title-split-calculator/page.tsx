'use client';

import { useState, useEffect } from 'react';
import {
  Split,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';

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

  const [hasCalculated, setHasCalculated] = useState(false);

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
    setHasCalculated(true);
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
      return { tone: 'success' as const, accent: 'green' as const, label: 'Strong Deal' };
    } else if (derivedMetrics.profitOnCost >= 15) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Viable' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'Marginal' };
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
    <CalculatorPageLayout
      title="Title Split Calculator"
      description="Determine if splitting a property title adds value by analyzing costs, unit values, and profit potential."
      category="Title Split"
      categorySlug="titlesplit"
      categoryColor="#14B8A6"
      badges={[
        { label: 'Live Calculator', variant: 'success' },
        { label: getViabilityStatus().label, variant: getViabilityStatus().tone }
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
                  onChange={(e) => setUnit1Value(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="e.g., Ground floor flat"
                />
                <FloatingField
                  label="Unit 2 Value"
                  value={unit2Value}
                  onChange={(e) => setUnit2Value(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="e.g., First floor flat"
                />
                {parseInt(numberOfUnits) >= 3 && (
                  <FloatingField
                    label="Unit 3 Value"
                    value={unit3Value}
                    onChange={(e) => setUnit3Value(e.target.value)}
                    unit="£"
                    unitPosition="prefix"
                  />
                )}
                {parseInt(numberOfUnits) >= 4 && (
                  <FloatingField
                    label="Unit 4 Value"
                    value={unit4Value}
                    onChange={(e) => setUnit4Value(e.target.value)}
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
            <CalculatorResultsGate
              calculatorType="Title Split Calculator"
              calculatorSlug="title-split-calculator"
              formData={{
                currentValue,
                numberOfUnits,
                unit1Value,
                unit2Value,
                unit3Value,
                unit4Value,
                conversionCosts,
                purchasePrice,
                stampDuty,
                financeCosts,
                hasPlanning,
                existingLeases,
              }}
              hasCalculated={hasCalculated}
            >
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
            </CalculatorResultsGate>
          </div>
        </div>

        {/* SEO Content */}
        <CalculatorSEO
          calculatorName="Title Split Calculator"
          calculatorSlug="title-split-calculator"
          description="The Title Split Calculator helps UK property investors and developers analyze the profitability of splitting a single property title into multiple units. Calculate value uplift, conversion costs, legal fees, and ROI for converting houses into flats or creating separate freehold titles. Essential for analyzing title split and freehold purchase opportunities."
          howItWorks={`The calculator analyzes title splits by:

1. Current vs Split Value - Compare single-title value against sum of individual unit values
2. Unit Valuation - Enter estimated value for each separate unit after split
3. Conversion Costs - Factor in physical works to create separate dwellings
4. Legal Costs - Calculate solicitor fees, Land Registry, lease creation, and professional fees
5. Planning - Account for planning permission costs if not using Permitted Development
6. ROI Analysis - Calculate profit on cost and return on equity invested
7. Viability Check - Assess if value uplift justifies costs and effort

The calculator includes all costs: purchase, SDLT, conversion, legal fees, Land Registry, lease creation, surveyor fees, and finance costs to give a complete picture of the project.`}
          whenToUse="Use this calculator when evaluating properties that could be split into multiple units (e.g., large houses into flats, semi-detached into two freeholds). Essential before purchasing conversion opportunities, when analyzing value-add strategies, or when tenants want to buy their freehold separately. Particularly useful for properties with existing HMO licenses or separate entrances."
          keyFeatures={[
            "Value uplift calculation for 2-4 unit splits",
            "Comprehensive cost breakdown including all legal fees",
            "Lease creation cost calculation for freehold properties",
            "Planning permission cost estimation",
            "ROI and profit on cost analysis",
            "Viability assessment with minimum 15% profit target",
          ]}
          faqs={[
            {
              question: "What is a title split and when is it profitable?",
              answer: "A title split (or freehold severance) divides a single property title into multiple separate legal titles. It's profitable when the combined value of separate units exceeds the single-title value by at least 20% to cover costs and provide profit. Common scenarios include splitting semi-detached houses, converting houses into flats, or creating separate maisonettes. Aim for 15-20% profit on cost minimum."
            },
            {
              question: "What are the legal costs for splitting a property title?",
              answer: "Legal costs typically include: solicitor fees (£2,000-£4,000), Land Registry fees (£300-£600 per unit), surveyor fees (£400-£800), and lease creation if converting a freehold (£1,500-£3,000 per unit). Total professional fees for a 2-unit split typically range from £5,000-£10,000. Costs increase with more units and complexity."
            },
            {
              question: "Do I need planning permission to split a property title?",
              answer: "You need planning permission if creating new separate dwellings or materially changing the use. Converting a house into flats requires planning permission and Building Regulations approval. However, if the property already operates as separate units (e.g., existing HMO or conversion), you may only need legal title work. Splitting a semi-detached into two freeholds usually doesn't need planning if no physical changes are made."
            },
            {
              question: "Can I split a property title if it has a mortgage?",
              answer: "Yes, but you need lender consent before proceeding. Most lenders require you to refinance or pay off the existing mortgage before splitting. The property typically needs bridging finance during conversion, then separate mortgages on each unit after split. Some specialist lenders offer products for title splits, but rates are higher than standard BTL mortgages."
            },
            {
              question: "What's the difference between title split and freehold purchase?",
              answer: "A title split creates multiple freehold titles from one property (e.g., house into flats). A freehold purchase is when existing leaseholders buy the freehold from the freeholder under the Leasehold Reform Act. Both create separate titles, but freehold purchase has statutory rights and set processes. Title splits require planning consent, separate access, building regulations, and lease creation if going from freehold to leasehold."
            },
          ]}
          relatedTerms={[
            "Title split property UK",
            "Freehold severance",
            "Convert house into flats",
            "Split property title",
            "Freehold purchase calculator",
            "Property title division",
            "House to flats conversion",
            "Leasehold enfranchisement",
            "Title split legal costs",
            "Multi-unit property conversion",
          ]}
          categoryColor="#14B8A6"
        />
    </CalculatorPageLayout>
  );
}
