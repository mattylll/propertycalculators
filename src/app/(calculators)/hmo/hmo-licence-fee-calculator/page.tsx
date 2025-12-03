'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileCheck,
  MapPin,
  Info,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/hmo"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to HMO</span>
          </Link>
          <StatusPill
            accent={derivedMetrics.isMandatoryHmo ? 'orange' : 'teal'}
            label={derivedMetrics.isMandatoryHmo ? 'Mandatory HMO' : 'Additional Scheme'}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HMO Licence Fee Calculator</h1>
              <p className="text-slate-400">
                Calculate HMO licensing costs by local authority
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}
