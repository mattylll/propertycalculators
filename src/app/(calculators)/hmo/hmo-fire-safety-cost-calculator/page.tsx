'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { StatusPill } from '@/components/property-kit/status-pill';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';

// Fire safety cost estimates (2024 prices)
const FIRE_SAFETY_COSTS = {
  fireDoors: { min: 250, max: 450, label: 'Fire Doors (FD30S)' },
  fireDoorsUpgrade: { min: 450, max: 800, label: 'Fire Doors (FD60)' },
  smokeSealsDoorClosers: { min: 40, max: 80, label: 'Smoke Seals & Door Closers' },
  interlinkedAlarms: { min: 80, max: 150, label: 'Interlinked Smoke Alarms' },
  heatDetectors: { min: 60, max: 120, label: 'Heat Detectors (Kitchen)' },
  emergencyLighting: { min: 150, max: 300, label: 'Emergency Lighting (per unit)' },
  fireExtinguishers: { min: 30, max: 60, label: 'Fire Extinguisher' },
  fireBlanket: { min: 15, max: 35, label: 'Fire Blanket' },
  fireAlarmPanel: { min: 400, max: 1200, label: 'Addressable Fire Alarm Panel' },
  escapeSigns: { min: 15, max: 40, label: 'Escape Route Signs' },
  fireRiskAssessment: { min: 150, max: 400, label: 'Fire Risk Assessment' },
  fireRetardantTreatment: { min: 200, max: 500, label: 'Fire Retardant Treatment' },
};

export default function HMOFireSafetyCostCalculatorPage() {
  // Property Details
  const [propertyStoreys, setPropertyStoreys] = useState<string>('2');
  const [numberOfRooms, setNumberOfRooms] = useState<string>('5');
  const [hasBasement, setHasBasement] = useState<boolean>(false);
  const [buildingAge, setBuildingAge] = useState<string>('pre-1990');

  // Current Fire Safety Status
  const [existingFireDoors, setExistingFireDoors] = useState<string>('0');
  const [hasInterlinkedAlarms, setHasInterlinkedAlarms] = useState<boolean>(false);
  const [hasEmergencyLighting, setHasEmergencyLighting] = useState<boolean>(false);
  const [hasFireAlarmPanel, setHasFireAlarmPanel] = useState<boolean>(false);
  const [hasFireExtinguishers, setHasFireExtinguishers] = useState<boolean>(false);
  const [hasFireRiskAssessment, setHasFireRiskAssessment] = useState<boolean>(false);

  // Configuration Options
  const [doorSpecification, setDoorSpecification] = useState<'FD30' | 'FD60'>('FD30');
  const [alarmType, setAlarmType] = useState<'battery' | 'mains' | 'addressable'>('mains');
  const [useHighEstimates, setUseHighEstimates] = useState<boolean>(false);

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    totalDoorsRequired: 0,
    doorsToInstall: 0,
    doorsCost: 0,
    smokeSealsClosersCost: 0,
    alarmsCost: 0,
    emergencyLightingCost: 0,
    extinguishersCost: 0,
    signageCost: 0,
    firePanelCost: 0,
    frasCost: 0,
    otherCost: 0,
    totalCost: 0,
    costPerRoom: 0,
    complianceLevel: 'basic' as 'basic' | 'standard' | 'enhanced',
    mandatoryItems: [] as string[],
    recommendedItems: [] as string[],
  });

  // Calculate derived metrics
  useEffect(() => {
    const storeys = parseInt(propertyStoreys) || 2;
    const rooms = parseInt(numberOfRooms) || 5;
    const existingDoors = parseInt(existingFireDoors) || 0;

    // Use high or low estimates
    const estimateKey = useHighEstimates ? 'max' : 'min';

    // Calculate doors needed (all bedroom doors + kitchen + any escape route doors)
    // Rule of thumb: rooms + 1 (kitchen) + 1 per storey (escape routes)
    const totalDoorsRequired = rooms + 1 + storeys;
    const doorsToInstall = Math.max(0, totalDoorsRequired - existingDoors);

    // Door costs
    const doorCostPer = doorSpecification === 'FD60'
      ? FIRE_SAFETY_COSTS.fireDoorsUpgrade[estimateKey]
      : FIRE_SAFETY_COSTS.fireDoors[estimateKey];
    const doorsCost = doorsToInstall * doorCostPer;

    // Smoke seals and door closers for all doors
    const smokeSealsClosersCost = totalDoorsRequired * FIRE_SAFETY_COSTS.smokeSealsDoorClosers[estimateKey];

    // Alarms - need one per room + landings + kitchen heat detector
    let alarmsCost = 0;
    if (!hasInterlinkedAlarms) {
      const alarmsNeeded = rooms + storeys + 1; // rooms + landings + common areas
      const alarmCost = alarmType === 'addressable'
        ? FIRE_SAFETY_COSTS.interlinkedAlarms[estimateKey] * 1.5
        : FIRE_SAFETY_COSTS.interlinkedAlarms[estimateKey];
      alarmsCost = alarmsNeeded * alarmCost;
      // Add heat detector for kitchen
      alarmsCost += FIRE_SAFETY_COSTS.heatDetectors[estimateKey];
    }

    // Emergency lighting
    let emergencyLightingCost = 0;
    if (!hasEmergencyLighting) {
      // 3+ storeys or basement typically requires emergency lighting
      if (storeys >= 3 || hasBasement) {
        const lightsNeeded = storeys * 2 + (hasBasement ? 2 : 0); // 2 per floor + basement
        emergencyLightingCost = lightsNeeded * FIRE_SAFETY_COSTS.emergencyLighting[estimateKey];
      }
    }

    // Fire extinguishers (one per floor typically)
    let extinguishersCost = 0;
    if (!hasFireExtinguishers) {
      extinguishersCost = storeys * FIRE_SAFETY_COSTS.fireExtinguishers[estimateKey];
      extinguishersCost += FIRE_SAFETY_COSTS.fireBlanket[estimateKey]; // Kitchen fire blanket
    }

    // Signage
    const signageCost = storeys * 2 * FIRE_SAFETY_COSTS.escapeSigns[estimateKey];

    // Fire alarm panel (if addressable or 3+ storeys)
    let firePanelCost = 0;
    if (!hasFireAlarmPanel && (alarmType === 'addressable' || storeys >= 3)) {
      firePanelCost = FIRE_SAFETY_COSTS.fireAlarmPanel[estimateKey];
    }

    // Fire Risk Assessment
    let frasCost = 0;
    if (!hasFireRiskAssessment) {
      frasCost = FIRE_SAFETY_COSTS.fireRiskAssessment[estimateKey];
    }

    // Additional costs for older buildings
    let otherCost = 0;
    if (buildingAge === 'pre-1990') {
      // May need fire retardant treatment on older staircases
      otherCost += FIRE_SAFETY_COSTS.fireRetardantTreatment[estimateKey] * 0.5;
    }
    if (buildingAge === 'pre-1970') {
      otherCost += FIRE_SAFETY_COSTS.fireRetardantTreatment[estimateKey];
    }

    // Total
    const totalCost = doorsCost + smokeSealsClosersCost + alarmsCost + emergencyLightingCost +
      extinguishersCost + signageCost + firePanelCost + frasCost + otherCost;

    const costPerRoom = rooms > 0 ? totalCost / rooms : 0;

    // Determine compliance level
    let complianceLevel: 'basic' | 'standard' | 'enhanced' = 'basic';
    if (doorSpecification === 'FD60' && alarmType === 'addressable') {
      complianceLevel = 'enhanced';
    } else if (doorSpecification === 'FD30' && alarmType === 'mains') {
      complianceLevel = 'standard';
    }

    // Mandatory items
    const mandatoryItems: string[] = [];
    if (doorsToInstall > 0) mandatoryItems.push(`${doorsToInstall} fire doors required`);
    if (!hasInterlinkedAlarms) mandatoryItems.push('Interlinked smoke alarms required');
    if (!hasFireRiskAssessment) mandatoryItems.push('Fire Risk Assessment required');
    if (storeys >= 3 && !hasEmergencyLighting) mandatoryItems.push('Emergency lighting required (3+ storeys)');

    // Recommended items
    const recommendedItems: string[] = [];
    if (!hasFireExtinguishers) recommendedItems.push('Fire extinguishers recommended');
    if (doorSpecification === 'FD30' && storeys >= 3) recommendedItems.push('Consider FD60 doors for taller buildings');
    if (alarmType !== 'addressable' && rooms > 6) recommendedItems.push('Consider addressable alarm system');

    setDerivedMetrics({
      totalDoorsRequired,
      doorsToInstall,
      doorsCost,
      smokeSealsClosersCost,
      alarmsCost,
      emergencyLightingCost,
      extinguishersCost,
      signageCost,
      firePanelCost,
      frasCost,
      otherCost,
      totalCost,
      costPerRoom,
      complianceLevel,
      mandatoryItems,
      recommendedItems,
    });
  }, [propertyStoreys, numberOfRooms, hasBasement, buildingAge, existingFireDoors, hasInterlinkedAlarms, hasEmergencyLighting, hasFireAlarmPanel, hasFireExtinguishers, hasFireRiskAssessment, doorSpecification, alarmType, useHighEstimates]);

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
      propertyStoreys: parseInt(propertyStoreys) || 0,
      numberOfRooms: parseInt(numberOfRooms) || 0,
      hasBasement,
      buildingAge,
      existingFireDoors: parseInt(existingFireDoors) || 0,
      hasInterlinkedAlarms,
      hasEmergencyLighting,
      hasFireAlarmPanel,
      hasFireExtinguishers,
      hasFireRiskAssessment,
      doorSpecification,
      alarmType,
    },
    outputs: derivedMetrics,
  });

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
            accent={derivedMetrics.complianceLevel === 'enhanced' ? 'success' : derivedMetrics.complianceLevel === 'standard' ? 'orange' : 'teal'}
            label={`${derivedMetrics.complianceLevel.charAt(0).toUpperCase() + derivedMetrics.complianceLevel.slice(1)} Spec`}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HMO Fire Safety Cost Calculator</h1>
              <p className="text-slate-400">
                Estimate fire safety compliance costs for your HMO property
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
                <Shield className="w-5 h-5 text-blue-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Number of Storeys"
                  value={propertyStoreys}
                  onChange={(e) => setPropertyStoreys(e.target.value)}
                  helper="Above ground floors"
                />
                <FloatingField
                  label="Number of Lettable Rooms"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  helper="Bedrooms in HMO"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBasement}
                      onChange={(e) => setHasBasement(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Basement</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">Increases fire safety requirements</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Building Age</label>
                  <select
                    value={buildingAge}
                    onChange={(e) => setBuildingAge(e.target.value)}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="post-2000">Post-2000</option>
                    <option value="1990-2000">1990-2000</option>
                    <option value="pre-1990">Pre-1990</option>
                    <option value="pre-1970">Pre-1970</option>
                  </select>
                </div>
              </div>
            </BentoCard>

            {/* Current Fire Safety */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Current Fire Safety Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Existing Fire Doors"
                  value={existingFireDoors}
                  onChange={(e) => setExistingFireDoors(e.target.value)}
                  helper="Compliant doors already installed"
                />
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasInterlinkedAlarms}
                      onChange={(e) => setHasInterlinkedAlarms(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Interlinked Alarms</span>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEmergencyLighting}
                      onChange={(e) => setHasEmergencyLighting(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Emergency Lighting</span>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFireAlarmPanel}
                      onChange={(e) => setHasFireAlarmPanel(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Fire Alarm Panel</span>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFireExtinguishers}
                      onChange={(e) => setHasFireExtinguishers(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Fire Extinguishers</span>
                  </label>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFireRiskAssessment}
                      onChange={(e) => setHasFireRiskAssessment(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Fire Risk Assessment</span>
                  </label>
                </div>
              </div>
            </BentoCard>

            {/* Specification Options */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Specification Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Fire Door Spec</label>
                  <select
                    value={doorSpecification}
                    onChange={(e) => setDoorSpecification(e.target.value as 'FD30' | 'FD60')}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="FD30">FD30S (30 min)</option>
                    <option value="FD60">FD60 (60 min)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">FD30S standard, FD60 for 3+ storeys</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <label className="text-sm text-slate-400">Alarm Type</label>
                  <select
                    value={alarmType}
                    onChange={(e) => setAlarmType(e.target.value as 'battery' | 'mains' | 'addressable')}
                    className="mt-1 w-full bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                  >
                    <option value="battery">Battery (sealed 10yr)</option>
                    <option value="mains">Mains Interlinked</option>
                    <option value="addressable">Addressable Panel</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Mains interlinked minimum for HMO</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useHighEstimates}
                      onChange={(e) => setUseHighEstimates(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span>Use Higher Estimates</span>
                      <p className="text-xs text-slate-500">Premium materials & labour</p>
                    </div>
                  </label>
                </div>
              </div>
            </BentoCard>

            {/* Compliance Alerts */}
            {(derivedMetrics.mandatoryItems.length > 0 || derivedMetrics.recommendedItems.length > 0) && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Compliance Requirements
                </h2>
                {derivedMetrics.mandatoryItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-red-400 mb-2">Mandatory</h3>
                    <ul className="space-y-1">
                      {derivedMetrics.mandatoryItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {derivedMetrics.recommendedItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-amber-400 mb-2">Recommended</h3>
                    <ul className="space-y-1">
                      {derivedMetrics.recommendedItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </BentoCard>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Total Cost */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Total Estimated Cost</h2>
              <div className="text-4xl font-bold text-orange-400 mb-2">
                {formatCurrency(derivedMetrics.totalCost)}
              </div>
              <p className="text-slate-400 text-sm mb-4">
                {formatCurrency(derivedMetrics.costPerRoom)} per room
              </p>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500">
                  Estimates based on 2024 UK prices. Actual costs vary by location and contractor.
                </p>
              </div>
            </BentoCard>

            {/* Cost Breakdown */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                {derivedMetrics.doorsCost > 0 && (
                  <DealMetric
                    label={`Fire Doors (${derivedMetrics.doorsToInstall})`}
                    value={formatCurrency(derivedMetrics.doorsCost)}
                  />
                )}
                {derivedMetrics.smokeSealsClosersCost > 0 && (
                  <DealMetric
                    label="Smoke Seals & Closers"
                    value={formatCurrency(derivedMetrics.smokeSealsClosersCost)}
                  />
                )}
                {derivedMetrics.alarmsCost > 0 && (
                  <DealMetric
                    label="Smoke Alarm System"
                    value={formatCurrency(derivedMetrics.alarmsCost)}
                  />
                )}
                {derivedMetrics.firePanelCost > 0 && (
                  <DealMetric
                    label="Fire Alarm Panel"
                    value={formatCurrency(derivedMetrics.firePanelCost)}
                  />
                )}
                {derivedMetrics.emergencyLightingCost > 0 && (
                  <DealMetric
                    label="Emergency Lighting"
                    value={formatCurrency(derivedMetrics.emergencyLightingCost)}
                  />
                )}
                {derivedMetrics.extinguishersCost > 0 && (
                  <DealMetric
                    label="Extinguishers & Blanket"
                    value={formatCurrency(derivedMetrics.extinguishersCost)}
                  />
                )}
                {derivedMetrics.signageCost > 0 && (
                  <DealMetric
                    label="Escape Signage"
                    value={formatCurrency(derivedMetrics.signageCost)}
                  />
                )}
                {derivedMetrics.frasCost > 0 && (
                  <DealMetric
                    label="Fire Risk Assessment"
                    value={formatCurrency(derivedMetrics.frasCost)}
                  />
                )}
                {derivedMetrics.otherCost > 0 && (
                  <DealMetric
                    label="Other Works"
                    value={formatCurrency(derivedMetrics.otherCost)}
                    helper="Fire retardant treatment etc."
                  />
                )}
              </div>
            </BentoCard>

            {/* Quick Reference */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">HMO Fire Safety Rules</h2>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• FD30S doors on all rooms & kitchen</p>
                <p>• Mains-powered interlinked alarms</p>
                <p>• Heat detector in kitchen</p>
                <p>• Clear escape routes maintained</p>
                <p>• 3+ storeys: emergency lighting</p>
                <p>• Annual Fire Risk Assessment</p>
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="HMO Fire Safety Cost Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your HMO Fire Safety Cost calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
