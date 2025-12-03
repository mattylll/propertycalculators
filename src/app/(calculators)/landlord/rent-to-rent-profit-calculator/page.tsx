'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Key,
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

export default function RentToRentProfitCalculatorPage() {
  // Lease Costs
  const [monthlyRentToLandlord, setMonthlyRentToLandlord] = useState<string>('1200');
  const [leaseLengthYears, setLeaseLengthYears] = useState<string>('3');
  const [depositToLandlord, setDepositToLandlord] = useState<string>('2400');
  const [rentFreeMonths, setRentFreeMonths] = useState<string>('1');

  // Income
  const [numberOfRooms, setNumberOfRooms] = useState<string>('4');
  const [averageRentPerRoom, setAverageRentPerRoom] = useState<string>('650');
  const [occupancyRate, setOccupancyRate] = useState<string>('95');

  // Operating Costs
  const [utilitiesBills, setUtilitiesBills] = useState<string>('250');
  const [wifiTv, setWifiTv] = useState<string>('50');
  const [cleaningMaintenance, setCleaningMaintenance] = useState<string>('150');
  const [insurance, setInsurance] = useState<string>('40');
  const [managementFee, setManagementFee] = useState<string>('0');
  const [otherCosts, setOtherCosts] = useState<string>('50');

  // Setup Costs
  const [furniturePackage, setFurniturePackage] = useState<string>('3000');
  const [decorRefurb, setDecorRefurb] = useState<string>('1500');
  const [legalFees, setLegalFees] = useState<string>('500');
  const [otherSetupCosts, setOtherSetupCosts] = useState<string>('500');

  // Derived calculations
  const [derivedMetrics, setDerivedMetrics] = useState({
    grossMonthlyIncome: 0,
    effectiveMonthlyIncome: 0,
    totalMonthlyCosts: 0,
    monthlyOperatingCosts: 0,
    monthlyProfit: 0,
    annualProfit: 0,
    totalSetupCosts: 0,
    totalLeaseValue: 0,
    profitOverLease: 0,
    profitMargin: 0,
    roiOnSetup: 0,
    paybackMonths: 0,
    breakEvenOccupancy: 0,
    cashflowPerRoom: 0,
  });

  // Calculate derived metrics
  useEffect(() => {
    const rentToLandlord = parseFloat(monthlyRentToLandlord) || 0;
    const leaseLength = parseFloat(leaseLengthYears) || 0;
    const deposit = parseFloat(depositToLandlord) || 0;
    const rentFree = parseFloat(rentFreeMonths) || 0;
    const rooms = parseFloat(numberOfRooms) || 0;
    const rentPerRoom = parseFloat(averageRentPerRoom) || 0;
    const occupancy = parseFloat(occupancyRate) || 100;

    const utilities = parseFloat(utilitiesBills) || 0;
    const wifi = parseFloat(wifiTv) || 0;
    const cleaning = parseFloat(cleaningMaintenance) || 0;
    const ins = parseFloat(insurance) || 0;
    const management = parseFloat(managementFee) || 0;
    const other = parseFloat(otherCosts) || 0;

    const furniture = parseFloat(furniturePackage) || 0;
    const decor = parseFloat(decorRefurb) || 0;
    const legal = parseFloat(legalFees) || 0;
    const otherSetup = parseFloat(otherSetupCosts) || 0;

    // Income calculations
    const grossMonthlyIncome = rooms * rentPerRoom;
    const effectiveMonthlyIncome = grossMonthlyIncome * (occupancy / 100);

    // Operating costs (excluding rent to landlord)
    const monthlyOperatingCosts = utilities + wifi + cleaning + ins + management + other;

    // Total monthly costs including rent to landlord
    const totalMonthlyCosts = rentToLandlord + monthlyOperatingCosts;

    // Monthly profit
    const monthlyProfit = effectiveMonthlyIncome - totalMonthlyCosts;

    // Effective months in lease (accounting for rent-free period)
    const totalLeaseMonths = leaseLength * 12;
    const payingMonths = totalLeaseMonths - rentFree;

    // Total lease value (what you pay over the lease)
    const totalLeaseValue = (rentToLandlord * payingMonths) + deposit;

    // Annual and total profit
    const annualProfit = monthlyProfit * 12;

    // Profit over entire lease
    // Account for rent-free months where you still earn but don't pay rent
    const profitDuringRentFree = rentFree * (effectiveMonthlyIncome - monthlyOperatingCosts);
    const profitDuringPayingMonths = payingMonths * monthlyProfit;
    const profitOverLease = profitDuringRentFree + profitDuringPayingMonths;

    // Setup costs
    const totalSetupCosts = furniture + decor + legal + otherSetup + deposit;

    // Profit margin
    const profitMargin = effectiveMonthlyIncome > 0 ? (monthlyProfit / effectiveMonthlyIncome) * 100 : 0;

    // ROI on setup costs
    const roiOnSetup = totalSetupCosts > 0 ? (annualProfit / totalSetupCosts) * 100 : 0;

    // Payback period in months
    const paybackMonths = monthlyProfit > 0 ? totalSetupCosts / monthlyProfit : 0;

    // Break-even occupancy
    // At what occupancy do we break even?
    // breakEvenIncome = totalMonthlyCosts
    // breakEvenIncome = rooms * rentPerRoom * (breakEvenOccupancy / 100)
    // breakEvenOccupancy = (totalMonthlyCosts / (rooms * rentPerRoom)) * 100
    const breakEvenOccupancy = grossMonthlyIncome > 0 ? (totalMonthlyCosts / grossMonthlyIncome) * 100 : 0;

    // Cashflow per room
    const cashflowPerRoom = rooms > 0 ? monthlyProfit / rooms : 0;

    setDerivedMetrics({
      grossMonthlyIncome,
      effectiveMonthlyIncome,
      totalMonthlyCosts,
      monthlyOperatingCosts,
      monthlyProfit,
      annualProfit,
      totalSetupCosts,
      totalLeaseValue,
      profitOverLease,
      profitMargin,
      roiOnSetup,
      paybackMonths,
      breakEvenOccupancy,
      cashflowPerRoom,
    });
  }, [monthlyRentToLandlord, leaseLengthYears, depositToLandlord, rentFreeMonths, numberOfRooms, averageRentPerRoom, occupancyRate, utilitiesBills, wifiTv, cleaningMaintenance, insurance, managementFee, otherCosts, furniturePackage, decorRefurb, legalFees, otherSetupCosts]);

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

  // Profit status
  const getProfitStatus = () => {
    if (derivedMetrics.monthlyProfit >= 500) {
      return { tone: 'success', accent: 'green' as const, label: 'Strong Profit' };
    } else if (derivedMetrics.monthlyProfit > 0) {
      return { tone: 'warning', accent: 'orange' as const, label: 'Marginal' };
    }
    return { tone: 'warning', accent: 'orange' as const, label: 'Loss Making' };
  };

  // Prepare data for AI validation
  const getCalculatorData = () => ({
    inputs: {
      monthlyRentToLandlord: parseFloat(monthlyRentToLandlord) || 0,
      leaseLengthYears: parseFloat(leaseLengthYears) || 0,
      depositToLandlord: parseFloat(depositToLandlord) || 0,
      rentFreeMonths: parseFloat(rentFreeMonths) || 0,
      numberOfRooms: parseFloat(numberOfRooms) || 0,
      averageRentPerRoom: parseFloat(averageRentPerRoom) || 0,
      occupancyRate: parseFloat(occupancyRate) || 0,
      utilitiesBills: parseFloat(utilitiesBills) || 0,
      wifiTv: parseFloat(wifiTv) || 0,
      cleaningMaintenance: parseFloat(cleaningMaintenance) || 0,
      insurance: parseFloat(insurance) || 0,
      managementFee: parseFloat(managementFee) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
      furniturePackage: parseFloat(furniturePackage) || 0,
      decorRefurb: parseFloat(decorRefurb) || 0,
      legalFees: parseFloat(legalFees) || 0,
      otherSetupCosts: parseFloat(otherSetupCosts) || 0,
    },
    outputs: derivedMetrics,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/landlord"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landlord</span>
          </Link>
          <StatusPill tone={getProfitStatus().tone} label={getProfitStatus().label} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Key className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Rent to Rent Profit Calculator</h1>
              <p className="text-slate-400">
                Calculate profit margins for rent-to-rent deals
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lease Agreement */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                Lease Agreement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Monthly Rent to Landlord"
                  value={monthlyRentToLandlord}
                  onChange={(e) => setMonthlyRentToLandlord(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="What you pay the property owner"
                />
                <FloatingField
                  label="Lease Length"
                  value={leaseLengthYears}
                  onChange={(e) => setLeaseLengthYears(e.target.value)}
                  unit="years"
                  helper="Contract duration (3-5 years typical)"
                />
                <FloatingField
                  label="Deposit to Landlord"
                  value={depositToLandlord}
                  onChange={(e) => setDepositToLandlord(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Security deposit required"
                />
                <FloatingField
                  label="Rent-Free Months"
                  value={rentFreeMonths}
                  onChange={(e) => setRentFreeMonths(e.target.value)}
                  unit="months"
                  helper="Initial rent-free period"
                />
              </div>
            </BentoCard>

            {/* Rental Income */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Rental Income
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Number of Rooms"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  helper="Lettable rooms"
                />
                <FloatingField
                  label="Average Rent Per Room"
                  value={averageRentPerRoom}
                  onChange={(e) => setAverageRentPerRoom(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Monthly rent per room"
                />
                <FloatingField
                  label="Occupancy Rate"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(e.target.value)}
                  unit="%"
                  helper="Expected occupancy"
                />
              </div>
            </BentoCard>

            {/* Operating Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Monthly Operating Costs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  label="Utilities & Bills"
                  value={utilitiesBills}
                  onChange={(e) => setUtilitiesBills(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Gas, electric, water, council tax"
                />
                <FloatingField
                  label="WiFi & TV Licence"
                  value={wifiTv}
                  onChange={(e) => setWifiTv(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Internet and TV costs"
                />
                <FloatingField
                  label="Cleaning & Maintenance"
                  value={cleaningMaintenance}
                  onChange={(e) => setCleaningMaintenance(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Regular cleaning & small repairs"
                />
                <FloatingField
                  label="Insurance"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Contents & liability insurance"
                />
                <FloatingField
                  label="Management Fee"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="If using R2R management"
                />
                <FloatingField
                  label="Other Costs"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Miscellaneous expenses"
                />
              </div>
            </BentoCard>

            {/* Setup Costs */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                One-Time Setup Costs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  label="Furniture Package"
                  value={furniturePackage}
                  onChange={(e) => setFurniturePackage(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Beds, wardrobes, desks etc."
                />
                <FloatingField
                  label="Decor & Refurb"
                  value={decorRefurb}
                  onChange={(e) => setDecorRefurb(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Paint, flooring, fixtures"
                />
                <FloatingField
                  label="Legal Fees"
                  value={legalFees}
                  onChange={(e) => setLegalFees(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Contract review, company setup"
                />
                <FloatingField
                  label="Other Setup Costs"
                  value={otherSetupCosts}
                  onChange={(e) => setOtherSetupCosts(e.target.value)}
                  unit="£"
                  unitPosition="prefix"
                  helper="Keys, listing fees, photos"
                />
              </div>
            </BentoCard>

            {/* Risk Factors */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Key Risk Factors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-amber-400 mb-2">Break-Even Occupancy</h3>
                  <p className="text-2xl font-bold">{formatPercent(derivedMetrics.breakEvenOccupancy)}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Occupancy needed to cover all costs
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">Payback Period</h3>
                  <p className="text-2xl font-bold">
                    {derivedMetrics.paybackMonths > 0 ? `${derivedMetrics.paybackMonths.toFixed(1)} months` : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Time to recoup setup investment
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-slate-400">
                  <span className="text-amber-400 font-medium">R2R Risks:</span> Void periods, tenant damage, landlord relationship, utility costs exceeding budget, lease termination.
                </p>
              </div>
            </BentoCard>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Monthly Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Gross Income"
                  value={formatCurrency(derivedMetrics.grossMonthlyIncome)}
                  helper={`${numberOfRooms} rooms × ${formatCurrency(parseFloat(averageRentPerRoom) || 0)}`}
                />
                <DealMetric
                  label="Effective Income"
                  value={formatCurrency(derivedMetrics.effectiveMonthlyIncome)}
                  helper={`At ${occupancyRate}% occupancy`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Rent to Landlord"
                    value={`-${formatCurrency(parseFloat(monthlyRentToLandlord) || 0)}`}
                    accent="orange"
                  />
                  <DealMetric
                    label="Operating Costs"
                    value={`-${formatCurrency(derivedMetrics.monthlyOperatingCosts)}`}
                    accent="orange"
                  />
                </div>
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Monthly Profit"
                    value={formatCurrency(derivedMetrics.monthlyProfit)}
                    accent={getProfitStatus().accent}
                  />
                  <DealMetric
                    label="Per Room Cashflow"
                    value={formatCurrency(derivedMetrics.cashflowPerRoom)}
                    helper="Monthly profit per room"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Annual & Lease Returns */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Returns</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Annual Profit"
                  value={formatCurrency(derivedMetrics.annualProfit)}
                  accent={derivedMetrics.annualProfit > 0 ? 'green' : 'orange'}
                />
                <DealMetric
                  label="Profit Over Lease"
                  value={formatCurrency(derivedMetrics.profitOverLease)}
                  helper={`Over ${leaseLengthYears} years`}
                />
                <div className="border-t border-white/10 pt-3">
                  <DealMetric
                    label="Profit Margin"
                    value={formatPercent(derivedMetrics.profitMargin)}
                    accent={derivedMetrics.profitMargin >= 30 ? 'green' : derivedMetrics.profitMargin >= 20 ? 'orange' : 'orange'}
                  />
                  <DealMetric
                    label="ROI on Setup"
                    value={formatPercent(derivedMetrics.roiOnSetup)}
                    helper="Annual return on setup costs"
                  />
                </div>
              </div>
            </BentoCard>

            {/* Investment Summary */}
            <BentoCard>
              <h2 className="text-lg font-semibold mb-4">Investment Required</h2>
              <div className="space-y-3">
                <DealMetric
                  label="Total Setup Costs"
                  value={formatCurrency(derivedMetrics.totalSetupCosts)}
                  helper="Including deposit"
                />
                <DealMetric
                  label="Total Lease Value"
                  value={formatCurrency(derivedMetrics.totalLeaseValue)}
                  helper="Rent payments + deposit"
                />
              </div>
            </BentoCard>

            {/* AI Validation */}
            <AiOutputCard
              title="Rent to Rent Profit Analysis"
              status="ready"
              response="Enter your property details above to see AI-powered analysis and recommendations for your Rent to Rent Profit calculation."
              highlights={[]}
              confidence={0.85}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
