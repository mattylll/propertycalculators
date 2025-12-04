'use client';

import { useState, useEffect } from 'react';
import {
  Key,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
} from 'lucide-react';
import { BentoCard } from '@/components/property-kit/bento-card';
import { FloatingField } from '@/components/property-kit/floating-field';
import { DealMetric } from '@/components/property-kit/deal-metric';
import { AiOutputCard } from '@/components/property-kit/ai-output-card';
import { CalculatorPageLayout } from '@/components/property-kit/calculator-page-layout';
import { CalculatorResultsGate } from '@/components/property-kit/calculator-results-gate';
import { CalculatorSEO } from '@/components/property-kit/calculator-seo';

export default function RentToRentProfitCalculatorPage() {
  const [hasCalculated, setHasCalculated] = useState(false);

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
      return { tone: 'success' as const, accent: 'green' as const, label: 'Strong Profit' };
    } else if (derivedMetrics.monthlyProfit > 0) {
      return { tone: 'warning' as const, accent: 'orange' as const, label: 'Marginal' };
    }
    return { tone: 'warning' as const, accent: 'orange' as const, label: 'Loss Making' };
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
    <CalculatorPageLayout
      title="Rent to Rent Profit Calculator"
      description="Calculate profit margins for rent-to-rent deals. Analyze lease agreements, rental income, operating costs, and setup costs to determine your profitability."
      category="Landlord"
      categorySlug="landlord"
      categoryColor="#10B981"
    >
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
              <button
                type="button"
                onClick={() => setHasCalculated(true)}
                className="w-full mt-4 py-3 bg-[var(--pc-green)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate R2R Profit
              </button>
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
            <CalculatorResultsGate
              calculatorType="Rent to Rent Profit Calculator"
              calculatorSlug="rent-to-rent-profit-calculator"
              formData={{
                monthlyRentToLandlord,
                numberOfRooms,
                averageRentPerRoom,
                occupancyRate,
                utilitiesBills,
                furniturePackage
              }}
              hasCalculated={hasCalculated}
            >
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
            </CalculatorResultsGate>

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

        <CalculatorSEO
          calculatorName="Rent to Rent Profit Calculator"
          calculatorSlug="rent-to-rent-profit-calculator"
          description="The Rent to Rent (R2R) Profit Calculator helps UK property investors analyse rent-to-rent deals by calculating monthly profit, annual returns, payback periods, and break-even occupancy. Input your lease costs, room rents, and operating expenses to see if your R2R deal is profitable."
          howItWorks={`Rent-to-Rent is a property business model where you lease a property from a landlord, then sublease it (usually by room) at higher total rent:

**Monthly Profit**: (Total Room Rents × Occupancy Rate) - Rent to Landlord - Operating Costs

**Operating Costs** include: utilities (gas, electric, water, council tax), WiFi/TV, cleaning, maintenance, insurance, and management fees.

**Setup Costs**: Furniture packages, decoration/refurb, legal fees, deposits. These are one-off costs with a payback period.

**Break-Even Occupancy**: The minimum occupancy rate needed for the deal to cover all costs without making a loss.

The calculator shows monthly profit, annual returns, profit margin, ROI on setup costs, payback period, and profit over the entire lease term.`}
          whenToUse="Use this calculator when evaluating R2R opportunities, negotiating lease agreements with landlords, or stress-testing your R2R business model. It's essential for understanding profitability, required occupancy rates, and how long until you recoup setup investments."
          keyFeatures={[
            "Calculate monthly and annual R2R profit",
            "Determine break-even occupancy rate",
            "Calculate payback period on setup costs",
            "Model profit over entire lease duration including rent-free periods",
          ]}
          faqs={[
            {
              question: "What is Rent-to-Rent (R2R)?",
              answer: "Rent-to-Rent is a property strategy where you lease a property from a landlord on a medium-term contract (typically 3-5 years), then sublet it—usually as an HMO letting individual rooms—at higher total rent. You profit from the difference between what you pay the landlord and what you receive from tenants, minus operating costs. R2R requires landlord permission and proper legal agreements."
            },
            {
              question: "Is Rent-to-Rent legal in the UK?",
              answer: "Yes, R2R is legal in the UK provided you have the landlord's written permission to sublet (essential!) and comply with all relevant regulations. If running as an HMO, you'll need HMO licensing, gas/electrical safety certificates, and fire safety compliance. Never do R2R without explicit landlord consent—it breaches your tenancy and can lead to eviction and legal action."
            },
            {
              question: "What is a good profit margin for R2R deals?",
              answer: "Aim for 30-40%+ profit margins in R2R deals. Lower margins leave little buffer for voids, repairs, or rising costs. A £1,200/month rent to landlord with £2,500 gross income from rooms gives £1,300 before operating costs—after £500-600 costs, you'd have £700-800 profit (roughly 30% margin). Factor in realistic voids and maintenance."
            },
            {
              question: "What are the main risks with Rent-to-Rent?",
              answer: "Key R2R risks include: void periods (empty rooms), tenant damage, utility costs exceeding budget, landlord relationship breakdown or termination, regulatory changes (e.g., stricter HMO licensing), and liability for the full rent regardless of occupancy. You're contractually obligated to pay the landlord even if rooms are empty. Always have 3-6 months reserves."
            },
            {
              question: "How much should I budget for R2R setup costs?",
              answer: "Budget £2,000-5,000+ per property for R2R setup: furniture packages (£1,500-3,000), decoration/refurb (£1,000-3,000), legal fees (£300-800), inventory/photography (£200-500), plus 1-2 months deposit to landlord. Budget more for larger properties or full refurbishments. Factor in these costs when calculating payback period and ROI."
            },
          ]}
          relatedTerms={[
            "Rent to rent calculator",
            "R2R profit calculator UK",
            "HMO rent to rent",
            "Rent to rent business model",
            "Serviced accommodation R2R",
            "R2R break-even calculator",
            "Guaranteed rent calculator",
            "Property rental arbitrage",
            "R2R profit margins",
            "Rent to rent strategy",
          ]}
          categoryColor="#10B981"
        />
    </CalculatorPageLayout>
  );
}
