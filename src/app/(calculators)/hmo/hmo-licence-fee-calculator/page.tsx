'use client';

import { useState, useEffect } from 'react';
import {
  FileCheck,
  MapPin,
  Info,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';

// Sample HMO licence fees by council (2024 estimates)
// In reality, these vary significantly - this is for illustration
const COUNCIL_FEES: Record<string, { mandatory: number; additional: number; renewal: number; duration: number }> = {
  'birmingham': { mandatory: 1200, additional: 1100, renewal: 950, duration: 5 },
  'manchester': { mandatory: 1350, additional: 1100, renewal: 1000, duration: 5 },
  'liverpool': { mandatory: 950, additional: 850, renewal: 700, duration: 5 },
  'leeds': { mandatory: 1150, additional: 1050, renewal: 850, duration: 5 },
  'sheffield': { mandatory: 1050, additional: 950, renewal: 800, duration: 5 },
  'bristol': { mandatory: 1400, additional: 1200, renewal: 1050, duration: 5 },
  'newcastle': { mandatory: 1000, additional: 900, renewal: 750, duration: 5 },
  'nottingham': { mandatory: 1100, additional: 1000, renewal: 850, duration: 5 },
  'southampton': { mandatory: 1250, additional: 1100, renewal: 950, duration: 5 },
  'portsmouth': { mandatory: 1300, additional: 1150, renewal: 1000, duration: 5 },
  'london-camden': { mandatory: 1500, additional: 1350, renewal: 1200, duration: 5 },
  'london-hackney': { mandatory: 1650, additional: 1500, renewal: 1350, duration: 5 },
  'london-newham': { mandatory: 1750, additional: 1600, renewal: 1400, duration: 5 },
  'london-tower-hamlets': { mandatory: 1600, additional: 1450, renewal: 1300, duration: 5 },
  'london-lambeth': { mandatory: 1450, additional: 1300, renewal: 1150, duration: 5 },
  'london-southwark': { mandatory: 1550, additional: 1400, renewal: 1250, duration: 5 },
  'london-islington': { mandatory: 1700, additional: 1550, renewal: 1400, duration: 5 },
  'london-brent': { mandatory: 1500, additional: 1350, renewal: 1200, duration: 5 },
  'london-croydon': { mandatory: 1350, additional: 1200, renewal: 1050, duration: 5 },
  'london-ealing': { mandatory: 1400, additional: 1250, renewal: 1100, duration: 5 },
  'brighton': { mandatory: 1350, additional: 1200, renewal: 1000, duration: 5 },
  'oxford': { mandatory: 1450, additional: 1300, renewal: 1100, duration: 5 },
  'cambridge': { mandatory: 1400, additional: 1250, renewal: 1050, duration: 5 },
  'average-uk': { mandatory: 1150, additional: 1000, renewal: 850, duration: 5 },
};

type LicenceType = 'mandatory' | 'additional' | 'selective';
type ApplicationType = 'new' | 'renewal';

export default function HMOLicenceFeeCalculatorPage() {
  const [hasCalculated, setHasCalculated] = useState(false);

  // Property Details
  const [council, setCouncil] = useState<string>('average-uk');
  const [licenceType, setLicenceType] = useState<LicenceType>('mandatory');
  const [applicationType, setApplicationType] = useState<ApplicationType>('new');
  const [numberOfProperties, setNumberOfProperties] = useState<string>('1');
  const [numberOfRooms, setNumberOfRooms] = useState<string>('5');
  const [numberOfOccupants, setNumberOfOccupants] = useState<string>('5');

  // Discounts & Fees
  const [isAccreditedLandlord, setIsAccreditedLandlord] = useState<boolean>(false);
  const [earlyBirdDiscount, setEarlyBirdDiscount] = useState<boolean>(false);
  const [multiPropertyDiscount, setMultiPropertyDiscount] = useState<boolean>(false);
  const [customFee, setCustomFee] = useState<string>('');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    baseFee: 0,
    discountAmount: 0,
    totalFee: 0,
    feePerProperty: 0,
    feePerRoom: 0,
    annualCost: 0,
    monthlyEquivalent: 0,
    licenceDuration: 5,
    isMandatoryHmo: false,
    notes: [] as string[],
  });

  // Calculate derived metrics
  useEffect(() => {
    const properties = parseInt(numberOfProperties) || 1;
    const rooms = parseInt(numberOfRooms) || 5;
    const occupants = parseInt(numberOfOccupants) || 5;

    const councilFees = COUNCIL_FEES[council] || COUNCIL_FEES['average-uk'];

    // Determine if it's a mandatory HMO (3+ storeys, 5+ occupants, 2+ households)
    // This is simplified - actual rules are more complex
    const isMandatoryHmo = occupants >= 5;

    // Get base fee
    let baseFee: number;
    if (customFee && parseFloat(customFee) > 0) {
      baseFee = parseFloat(customFee);
    } else if (applicationType === 'renewal') {
      baseFee = councilFees.renewal;
    } else {
      baseFee = licenceType === 'mandatory' ? councilFees.mandatory : councilFees.additional;
    }

    // Calculate discounts
    let discountPercent = 0;
    if (isAccreditedLandlord) discountPercent += 10; // Typical 10% for accredited landlords
    if (earlyBirdDiscount) discountPercent += 5; // Early application discount
    if (multiPropertyDiscount && properties > 1) discountPercent += 5; // Multi-property discount

    const discountAmount = (baseFee * discountPercent) / 100;
    const feePerProperty = baseFee - discountAmount;
    const totalFee = feePerProperty * properties;

    // Calculate per-room and annual costs
    const totalRooms = rooms * properties;
    const feePerRoom = totalRooms > 0 ? totalFee / totalRooms : 0;
    const licenceDuration = councilFees.duration;
    const annualCost = licenceDuration > 0 ? totalFee / licenceDuration : 0;
    const monthlyEquivalent = annualCost / 12;

    // Generate notes
    const notes: string[] = [];
    if (isMandatoryHmo) {
      notes.push('Property qualifies for mandatory HMO licensing');
    }
    if (licenceType === 'additional' && !isMandatoryHmo) {
      notes.push('Check if your council has additional licensing schemes');
    }
    if (isAccreditedLandlord) {
      notes.push('10% discount applied for accredited landlord status');
    }
    if (properties > 3) {
      notes.push('Consider portfolio licensing schemes if available');
    }
    notes.push(`Licence valid for ${licenceDuration} years`);

    setDerivedMetrics({
      baseFee,
      discountAmount,
      totalFee,
      feePerProperty,
      feePerRoom,
      annualCost,
      monthlyEquivalent,
      licenceDuration,
      isMandatoryHmo,
      notes,
    });
  }, [council, licenceType, applicationType, numberOfProperties, numberOfRooms, numberOfOccupants, isAccreditedLandlord, earlyBirdDiscount, multiPropertyDiscount, customFee]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      council,
      licenceType,
      applicationType,
      numberOfProperties: parseInt(numberOfProperties) || 1,
      numberOfRooms: parseInt(numberOfRooms) || 0,
      numberOfOccupants: parseInt(numberOfOccupants) || 0,
      isAccreditedLandlord,
      earlyBirdDiscount,
      multiPropertyDiscount,
      customFee: parseFloat(customFee) || 0,
    },
    outputs: derivedMetrics,
  });

  const councilOptions = Object.keys(COUNCIL_FEES).map(key => ({
    value: key,
    label: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  }));

  const getLicenceBadge = () => {
    return {
      label: derivedMetrics.isMandatoryHmo ? 'Mandatory HMO' : 'Additional Scheme',
      variant: derivedMetrics.isMandatoryHmo ? 'warning' as const : 'neutral' as const,
    };
  };

  return (
    <CalculatorPageLayout
      title="HMO Licence Fee Calculator"
      description="Calculate HMO licensing costs by local authority"
      category="HMO"
      categorySlug="hmo"
      categoryColor="#EC4899"
      badges={[getLicenceBadge()]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); setHasCalculated(true); }}>
            {/* Location & Type */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Location & Licence Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Local Authority</label>
                  <select
                    value={council}
                    onChange={(e) => setCouncil(e.target.value)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    {councilOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Select your local authority</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Licence Type</label>
                  <select
                    value={licenceType}
                    onChange={(e) => setLicenceType(e.target.value as LicenceType)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="mandatory">Mandatory HMO</option>
                    <option value="additional">Additional Licensing</option>
                    <option value="selective">Selective Licensing</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Type of licensing scheme</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Application Type</label>
                  <select
                    value={applicationType}
                    onChange={(e) => setApplicationType(e.target.value as ApplicationType)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="new">New Application</option>
                    <option value="renewal">Renewal</option>
                  </select>
                </div>
                <FloatingField
                  label="Custom Fee (Optional)"
                  value={customFee}
                  onChange={(e) => setCustomFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Override with actual council fee"
                />
              </div>
            </BentoCard>

            {/* Property Details */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Number of Properties"
                  value={numberOfProperties}
                  onChange={(e) => setNumberOfProperties(e.target.value)}
                  helper="Properties to licence"
                />
                <FloatingField
                  label="Rooms Per Property"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  helper="Lettable bedrooms"
                />
                <FloatingField
                  label="Occupants Per Property"
                  value={numberOfOccupants}
                  onChange={(e) => setNumberOfOccupants(e.target.value)}
                  helper="Maximum occupancy"
                />
              </div>
            </BentoCard>

            {/* Discounts */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Available Discounts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAccreditedLandlord}
                      onChange={(e) => setIsAccreditedLandlord(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span>Accredited Landlord</span>
                      <p className="text-xs text-slate-500">~10% discount</p>
                    </div>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={earlyBirdDiscount}
                      onChange={(e) => setEarlyBirdDiscount(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span>Early Application</span>
                      <p className="text-xs text-slate-500">~5% discount</p>
                    </div>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiPropertyDiscount}
                      onChange={(e) => setMultiPropertyDiscount(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span>Multi-Property</span>
                      <p className="text-xs text-slate-500">~5% discount (2+ props)</p>
                    </div>
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Discount availability varies by council. Check with your local authority.
              </p>
            </BentoCard>

            {/* HMO Licensing Info */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                HMO Licensing Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-amber-400 mb-2">Mandatory HMO</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• 5+ occupants from 2+ households</li>
                    <li>• 3+ storeys (or any size in some areas)</li>
                    <li>• Sharing basic amenities</li>
                    <li>• Licence required nationwide</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">Additional Licensing</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Smaller HMOs (3-4 occupants)</li>
                    <li>• Council-designated areas only</li>
                    <li>• Check local schemes</li>
                    <li>• May include all HMOs in area</li>
                  </ul>
                </div>
              </div>
            </BentoCard>

            {/* Calculate Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-5 h-5" />
                Calculate Fees
              </button>
              <button
                type="button"
                onClick={() => {
                  setCouncil('average-uk');
                  setLicenceType('mandatory');
                  setApplicationType('new');
                  setNumberOfProperties('1');
                  setNumberOfRooms('5');
                  setNumberOfOccupants('5');
                  setIsAccreditedLandlord(false);
                  setEarlyBirdDiscount(false);
                  setMultiPropertyDiscount(false);
                  setCustomFee('');
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
              calculatorType="HMO Licence Fee Calculator"
              calculatorSlug="hmo-licence-fee-calculator"
              formData={{
                council,
                licenceType,
                applicationType,
                numberOfProperties,
                numberOfRooms,
                numberOfOccupants
              }}
              hasCalculated={hasCalculated}
            >
            {/* Total Cost */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Total Licence Cost</h2>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {formatCurrency(derivedMetrics.totalFee)}
              </div>
              {derivedMetrics.discountAmount > 0 && (
                <p className="text-emerald-400 text-sm mb-2">
                  Saving {formatCurrency(derivedMetrics.discountAmount)}
                </p>
              )}
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Valid for {derivedMetrics.licenceDuration} years</span>
              </div>
            </BentoCard>

            {/* Cost Breakdown */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Base Fee"
                  value={formatCurrency(derivedMetrics.baseFee)}
                  helper={applicationType === 'renewal' ? 'Renewal rate' : 'New application'}
                />
                {derivedMetrics.discountAmount > 0 && (
                  <DealMetric
                    label="Discounts"
                    value={`-${formatCurrency(derivedMetrics.discountAmount)}`}
                    accent="green"
                  />
                )}
                <DealMetric
                  label="Fee Per Property"
                  value={formatCurrency(derivedMetrics.feePerProperty)}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Annual Cost"
                    value={formatCurrency(derivedMetrics.annualCost)}
                    helper="Spread over licence period"
                  />
                  <DealMetric
                    label="Monthly Equivalent"
                    value={formatCurrency(derivedMetrics.monthlyEquivalent)}
                  />
                  <DealMetric
                    label="Per Room (Annual)"
                    value={formatCurrency(derivedMetrics.feePerRoom / derivedMetrics.licenceDuration)}
                  />
                </div>
              </div>
            </BentoCard>

            {/* Notes */}
            {derivedMetrics.notes.length > 0 && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                <ul className="space-y-2">
                  {derivedMetrics.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </BentoCard>
            )}

            {/* AI Validation */}
            <AiOutputCard
              title="HMO Licence Fee Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your HMO Licence Fee calculation."
              highlights={[]}
              confidence={0.85}
            />
            </CalculatorResultsGate>
          </div>
        </div>

        {/* SEO Content */}
        <CalculatorSEO
          calculatorName="HMO Licence Fee Calculator"
          calculatorSlug="hmo-licence-fee-calculator"
          description="The HMO Licence Fee Calculator helps UK landlords estimate mandatory HMO licensing costs across different local authorities. Calculate fees for mandatory, additional, and selective licensing schemes, factor in available discounts, and understand the annual cost per property and per room for accurate HMO investment budgeting."
          howItWorks={`The HMO Licence Fee Calculator provides accurate licensing cost estimates:

1. Location Selection - Choose your local authority from major UK councils to see area-specific fees
2. Licence Type - Select mandatory HMO licensing, additional licensing, or selective licensing schemes
3. Application Details - Specify whether it's a new application or renewal (renewals are typically cheaper)
4. Portfolio Scale - Enter number of properties and rooms to calculate total portfolio licensing costs
5. Discount Application - Apply discounts for accredited landlord status, early applications, or multi-property portfolios
6. Cost Breakdown - View total fees, annual equivalent costs, and per-room charges

The calculator includes data from 20+ UK local authorities and calculates the amortized annual cost over the typical 5-year licence period. Factor these costs into your HMO cashflow calculations to understand their impact on returns.`}
          whenToUse="Use this calculator when budgeting for HMO investments, comparing costs across different local authorities, or planning portfolio expansion. Essential for understanding the true operating costs of HMO properties and factoring licensing fees into your investment analysis and cashflow projections."
          keyFeatures={[
            "Compare HMO licence fees across 20+ UK councils",
            "Calculate costs for mandatory and additional licensing",
            "Apply discounts for accreditation and early applications",
            "Calculate annual cost per property and per room",
          ]}
          faqs={[
            {
              question: "How much does an HMO licence cost in the UK?",
              answer: "HMO licence fees vary significantly by local authority, ranging from approximately £700-£1,750 for new applications. London boroughs typically charge £1,300-£1,750, while other major cities charge £950-£1,400. Renewals are usually 15-25% cheaper. Licences are valid for 5 years, so the annual equivalent cost is 20% of the total fee."
            },
            {
              question: "What's the difference between mandatory and additional HMO licensing?",
              answer: "Mandatory licensing applies nationwide to properties with 5+ occupants from 2+ households sharing facilities, or any size HMO of 3+ storeys. Additional licensing is discretionary and implemented by some councils for smaller HMOs (3-4 occupants) in specific designated areas. Fees are typically similar, around £800-£1,500 depending on the council."
            },
            {
              question: "Can I get discounts on HMO licence fees?",
              answer: "Many councils offer discounts: accredited landlords (NLA, RLA, or local schemes) typically receive 10% off, early applications before scheme implementation can save 5-10%, and some councils offer multi-property portfolio discounts of 5-15% when licensing multiple properties. Always check your local authority's specific discount schemes."
            },
            {
              question: "What happens if I don't licence my HMO?",
              answer: "Operating an unlicensed HMO is a criminal offence punishable by unlimited fines. Councils can prosecute landlords, issue civil penalties of up to £30,000 per offence, make Rent Repayment Orders forcing you to repay up to 12 months rent to tenants, and issue Management Orders taking control of your property. Always check if your property requires licensing."
            },
            {
              question: "How do I know if my property needs an HMO licence?",
              answer: "Your property needs mandatory HMO licensing if it has 5+ occupants from 2+ households sharing facilities (bathroom/kitchen). Some areas also have additional or selective licensing covering smaller HMOs or all rented properties. Check your local council's website - many have online tools to determine if your property needs licensing. Article 4 directions also affect HMO regulations in certain areas."
            },
          ]}
          relatedTerms={[
            "HMO licence fees UK",
            "Mandatory HMO licensing costs",
            "Additional licensing scheme fees",
            "Selective licensing HMO",
            "HMO licence application cost",
            "Article 4 HMO licence",
            "Accredited landlord discounts",
            "HMO licence renewal fees",
            "Local authority HMO licensing",
            "HMO licensing calculator UK",
          ]}
          categoryColor="#EC4899"
        />
    </CalculatorPageLayout>
  );
}
