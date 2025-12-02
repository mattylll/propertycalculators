// ============================================
// UK PROPERTY CALCULATION FORMULA LIBRARY
// PropertyCalculators.ai
// ============================================

// ============================================
// YIELD CALCULATIONS
// ============================================

export const yields = {
  /** Gross yield = (Annual Rent / Purchase Price) * 100 */
  gross: (annualRent: number, purchasePrice: number): number => {
    if (purchasePrice <= 0) return 0;
    return (annualRent / purchasePrice) * 100;
  },

  /** Net yield = ((Annual Rent - Annual Costs) / Total Investment) * 100 */
  net: (annualRent: number, annualCosts: number, totalInvestment: number): number => {
    if (totalInvestment <= 0) return 0;
    return ((annualRent - annualCosts) / totalInvestment) * 100;
  },

  /** True net yield accounting for voids, management, maintenance */
  trueNet: (
    annualRent: number,
    voidRate: number, // as decimal e.g. 0.05 for 5%
    managementFee: number, // as decimal
    maintenanceReserve: number, // as decimal
    insurance: number,
    otherCosts: number,
    totalInvestment: number
  ): number => {
    if (totalInvestment <= 0) return 0;
    const effectiveRent = annualRent * (1 - voidRate);
    const management = effectiveRent * managementFee;
    const maintenance = effectiveRent * maintenanceReserve;
    const netIncome = effectiveRent - management - maintenance - insurance - otherCosts;
    return (netIncome / totalInvestment) * 100;
  },

  /** Cap rate (for commercial) = NOI / Market Value */
  capRate: (netOperatingIncome: number, marketValue: number): number => {
    if (marketValue <= 0) return 0;
    return (netOperatingIncome / marketValue) * 100;
  },

  /** Years' Purchase (inverse of yield) */
  yearsPurchase: (yieldPercent: number): number => {
    if (yieldPercent <= 0) return 0;
    return 100 / yieldPercent;
  },
};

// ============================================
// MORTGAGE & DEBT CALCULATIONS
// ============================================

export const mortgage = {
  /** Loan-to-Value ratio */
  ltv: (loanAmount: number, propertyValue: number): number => {
    if (propertyValue <= 0) return 0;
    return (loanAmount / propertyValue) * 100;
  },

  /** Debt Service Coverage Ratio (DSCR) */
  dscr: (netOperatingIncome: number, annualDebtService: number): number => {
    if (annualDebtService <= 0) return 0;
    return netOperatingIncome / annualDebtService;
  },

  /** Interest Coverage Ratio (ICR) - UK BTL standard */
  icr: (annualRent: number, annualInterest: number): number => {
    if (annualInterest <= 0) return 0;
    return (annualRent / annualInterest) * 100;
  },

  /** ICR at stressed rate (typically 5.5% for BTL) */
  icrStressed: (annualRent: number, loanAmount: number, stressRate: number = 5.5): number => {
    const stressedInterest = loanAmount * (stressRate / 100);
    if (stressedInterest <= 0) return 0;
    return (annualRent / stressedInterest) * 100;
  },

  /** Monthly mortgage payment (interest only) */
  monthlyInterestOnly: (loanAmount: number, annualRate: number): number => {
    return (loanAmount * (annualRate / 100)) / 12;
  },

  /** Monthly mortgage payment (repayment) */
  monthlyRepayment: (loanAmount: number, annualRate: number, termYears: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    if (monthlyRate === 0) return loanAmount / numPayments;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  },

  /** Maximum loan based on ICR requirement */
  maxLoanFromICR: (annualRent: number, stressRate: number, requiredICR: number): number => {
    // ICR = (Rent / Interest) * 100
    // Interest = Loan * Rate
    // requiredICR = (Rent / (Loan * Rate)) * 100
    // Loan = (Rent * 100) / (requiredICR * Rate)
    return (annualRent * 100) / (requiredICR * (stressRate / 100));
  },
};

// ============================================
// BRIDGING FINANCE CALCULATIONS
// ============================================

export const bridging = {
  /** Monthly interest cost */
  monthlyInterest: (loanAmount: number, monthlyRate: number): number => {
    return loanAmount * (monthlyRate / 100);
  },

  /** Total interest for term (simple interest, retained) */
  totalInterestRetained: (loanAmount: number, monthlyRate: number, termMonths: number): number => {
    return loanAmount * (monthlyRate / 100) * termMonths;
  },

  /** Total interest for term (rolled/compounded) */
  totalInterestRolled: (loanAmount: number, monthlyRate: number, termMonths: number): number => {
    const monthlyDecimal = monthlyRate / 100;
    return loanAmount * (Math.pow(1 + monthlyDecimal, termMonths) - 1);
  },

  /** Day-1 net loan (after fees and retained interest) */
  day1NetLoan: (
    grossLoan: number,
    arrangementFee: number, // as decimal
    retainedInterestMonths: number,
    monthlyRate: number,
    legalFees: number,
    valuationFee: number
  ): number => {
    const arrangementCost = grossLoan * arrangementFee;
    const retainedInterest = grossLoan * (monthlyRate / 100) * retainedInterestMonths;
    return grossLoan - arrangementCost - retainedInterest - legalFees - valuationFee;
  },

  /** Effective annual rate (EAR) from monthly rate */
  effectiveAnnualRate: (monthlyRate: number): number => {
    return (Math.pow(1 + monthlyRate / 100, 12) - 1) * 100;
  },

  /** Gross Development Value loan calculation */
  loanFromLTGDV: (gdv: number, ltgdvPercent: number): number => {
    return gdv * (ltgdvPercent / 100);
  },
};

// ============================================
// DEVELOPMENT FINANCE CALCULATIONS
// ============================================

export const development = {
  /** Gross Development Value */
  gdv: (units: { sqft: number; pricePerSqft: number }[]): number => {
    return units.reduce((sum, unit) => sum + unit.sqft * unit.pricePerSqft, 0);
  },

  /** Total development costs */
  totalCosts: (
    landCost: number,
    buildCost: number,
    professionalFees: number, // as decimal of build cost
    contingency: number, // as decimal of build cost
    financeCost: number,
    salesCosts: number // as decimal of GDV
  ): number => {
    const professionalTotal = buildCost * professionalFees;
    const contingencyTotal = buildCost * contingency;
    return landCost + buildCost + professionalTotal + contingencyTotal + financeCost;
  },

  /** Profit on Cost */
  profitOnCost: (gdv: number, totalCosts: number): number => {
    if (totalCosts <= 0) return 0;
    return ((gdv - totalCosts) / totalCosts) * 100;
  },

  /** Profit on GDV */
  profitOnGDV: (gdv: number, totalCosts: number): number => {
    if (gdv <= 0) return 0;
    return ((gdv - totalCosts) / gdv) * 100;
  },

  /** Residual Land Value */
  residualLandValue: (
    gdv: number,
    buildCost: number,
    professionalFees: number,
    contingency: number,
    financeCost: number,
    salesCosts: number,
    targetProfit: number // as decimal of GDV
  ): number => {
    const profitRequired = gdv * targetProfit;
    const salesTotal = gdv * salesCosts;
    const professionalTotal = buildCost * professionalFees;
    const contingencyTotal = buildCost * contingency;
    return gdv - buildCost - professionalTotal - contingencyTotal - financeCost - salesTotal - profitRequired;
  },

  /** Build cost per sqft */
  buildCostPerSqft: (totalBuildCost: number, totalSqft: number): number => {
    if (totalSqft <= 0) return 0;
    return totalBuildCost / totalSqft;
  },

  /** Development finance interest (rolled up) */
  developmentFinanceInterest: (
    landLoan: number,
    buildLoan: number,
    monthlyRate: number,
    buildPeriodMonths: number
  ): number => {
    // Land loan accrues interest for full period
    const landInterest = landLoan * (Math.pow(1 + monthlyRate / 100, buildPeriodMonths) - 1);
    // Build loan drawn down over time - approximate as 50% average exposure
    const avgBuildExposure = buildLoan * 0.5;
    const buildInterest = avgBuildExposure * (Math.pow(1 + monthlyRate / 100, buildPeriodMonths) - 1);
    return landInterest + buildInterest;
  },
};

// ============================================
// UK TAX CALCULATIONS
// ============================================

export const ukTax = {
  /** Stamp Duty Land Tax (SDLT) - Residential */
  sdltResidential: (purchasePrice: number, additionalProperty: boolean = false): number => {
    // 2024/25 rates
    const surcharge = additionalProperty ? 3 : 0;
    let sdlt = 0;

    if (purchasePrice <= 250000) {
      sdlt = purchasePrice * (surcharge / 100);
    } else if (purchasePrice <= 925000) {
      sdlt = 250000 * (surcharge / 100) + (purchasePrice - 250000) * ((5 + surcharge) / 100);
    } else if (purchasePrice <= 1500000) {
      sdlt =
        250000 * (surcharge / 100) +
        675000 * ((5 + surcharge) / 100) +
        (purchasePrice - 925000) * ((10 + surcharge) / 100);
    } else {
      sdlt =
        250000 * (surcharge / 100) +
        675000 * ((5 + surcharge) / 100) +
        575000 * ((10 + surcharge) / 100) +
        (purchasePrice - 1500000) * ((12 + surcharge) / 100);
    }

    return Math.round(sdlt);
  },

  /** SDLT - Non-residential / Commercial */
  sdltCommercial: (purchasePrice: number): number => {
    let sdlt = 0;

    if (purchasePrice <= 150000) {
      sdlt = 0;
    } else if (purchasePrice <= 250000) {
      sdlt = (purchasePrice - 150000) * 0.02;
    } else {
      sdlt = 100000 * 0.02 + (purchasePrice - 250000) * 0.05;
    }

    return Math.round(sdlt);
  },

  /** Capital Gains Tax for property */
  cgt: (
    gain: number,
    isResidential: boolean,
    isHigherRateTaxpayer: boolean,
    annualExemption: number = 3000 // 2024/25
  ): number => {
    const taxableGain = Math.max(0, gain - annualExemption);
    if (isResidential) {
      return taxableGain * (isHigherRateTaxpayer ? 0.24 : 0.18);
    } else {
      return taxableGain * (isHigherRateTaxpayer ? 0.20 : 0.10);
    }
  },

  /** Section 24 tax impact calculation */
  section24Impact: (
    rentalIncome: number,
    mortgageInterest: number,
    otherExpenses: number,
    marginalTaxRate: number // as decimal
  ): { oldTax: number; newTax: number; additionalTax: number } => {
    // Old system: full interest deduction
    const oldProfitBeforeTax = rentalIncome - mortgageInterest - otherExpenses;
    const oldTax = oldProfitBeforeTax * marginalTaxRate;

    // New system: 20% tax credit on interest
    const newProfitBeforeTax = rentalIncome - otherExpenses; // No interest deduction
    const taxBeforeCredit = newProfitBeforeTax * marginalTaxRate;
    const taxCredit = mortgageInterest * 0.2;
    const newTax = taxBeforeCredit - taxCredit;

    return {
      oldTax: Math.max(0, oldTax),
      newTax: Math.max(0, newTax),
      additionalTax: Math.max(0, newTax - oldTax),
    };
  },

  /** Income tax on rental profit */
  incomeTax: (
    profit: number,
    otherIncome: number,
    personalAllowance: number = 12570
  ): { tax: number; effectiveRate: number; marginalRate: number } => {
    const totalIncome = profit + otherIncome;
    let tax = 0;
    let marginalRate = 0;

    // Reduce personal allowance if income > £100k
    let allowance = personalAllowance;
    if (totalIncome > 100000) {
      allowance = Math.max(0, personalAllowance - (totalIncome - 100000) / 2);
    }

    const taxableIncome = Math.max(0, totalIncome - allowance);

    // 2024/25 bands
    if (taxableIncome <= 37700) {
      tax = taxableIncome * 0.2;
      marginalRate = 0.2;
    } else if (taxableIncome <= 125140) {
      tax = 37700 * 0.2 + (taxableIncome - 37700) * 0.4;
      marginalRate = 0.4;
    } else {
      tax = 37700 * 0.2 + 87440 * 0.4 + (taxableIncome - 125140) * 0.45;
      marginalRate = 0.45;
    }

    return {
      tax,
      effectiveRate: totalIncome > 0 ? (tax / totalIncome) * 100 : 0,
      marginalRate: marginalRate * 100,
    };
  },
};

// ============================================
// HMO CALCULATIONS
// ============================================

export const hmo = {
  /** HMO gross rent */
  grossRent: (rooms: { rent: number }[]): number => {
    return rooms.reduce((sum, room) => sum + room.rent, 0) * 12;
  },

  /** HMO operating costs */
  operatingCosts: (
    councilTax: number,
    utilities: number,
    broadband: number,
    cleaningWeekly: number,
    insurance: number,
    management: number, // as decimal of rent
    maintenance: number, // as decimal of rent
    voidAllowance: number, // as decimal
    grossRent: number
  ): number => {
    const cleaning = cleaningWeekly * 52;
    const managementCost = grossRent * management;
    const maintenanceCost = grossRent * maintenance;
    const voidCost = grossRent * voidAllowance;
    return councilTax + utilities + broadband + cleaning + insurance + managementCost + maintenanceCost + voidCost;
  },

  /** HMO room profitability */
  roomProfitability: (
    roomRent: number,
    proportionOfCosts: number // fixed costs allocated to this room
  ): number => {
    return roomRent * 12 - proportionOfCosts;
  },

  /** Licensing fee estimate by council type */
  licensingFee: (
    numBeds: number,
    councilType: 'low' | 'medium' | 'high' = 'medium',
    licenceYears: number = 5
  ): number => {
    // Approximate UK council fees
    const baseFees = { low: 500, medium: 900, high: 1500 };
    const perBedFees = { low: 30, medium: 50, high: 80 };
    const totalFee = baseFees[councilType] + perBedFees[councilType] * numBeds;
    return totalFee; // Per licence period
  },

  /** Fire safety upgrade cost estimate */
  fireSafetyUpgrade: (
    numStoreys: number,
    numBeds: number,
    hasFireDoors: boolean,
    hasAlarmSystem: boolean,
    hasEmergencyLighting: boolean
  ): number => {
    let cost = 0;
    if (!hasFireDoors) cost += numBeds * 350 + 500; // Doors + installation
    if (!hasAlarmSystem) cost += numStoreys * 400 + 500; // System per floor + install
    if (!hasEmergencyLighting) cost += numStoreys * 200;
    // Additional for 3+ storey
    if (numStoreys >= 3) cost += 1500; // Protected staircase upgrades
    return cost;
  },
};

// ============================================
// LEASEHOLD CALCULATIONS
// ============================================

export const leasehold = {
  /** Relativity percentage based on remaining years */
  relativity: (remainingYears: number): number => {
    // Simplified relativity curve (would use actual graphs in practice)
    if (remainingYears >= 99) return 99;
    if (remainingYears >= 90) return 95;
    if (remainingYears >= 80) return 90 + (remainingYears - 80) * 0.5;
    if (remainingYears >= 70) return 82 + (remainingYears - 70) * 0.8;
    if (remainingYears >= 60) return 72 + (remainingYears - 60);
    if (remainingYears >= 50) return 60 + (remainingYears - 50) * 1.2;
    if (remainingYears >= 40) return 45 + (remainingYears - 40) * 1.5;
    return Math.max(0, remainingYears * 1.125);
  },

  /** Marriage value (only applies under 80 years) */
  marriageValue: (
    currentValue: number,
    extendedValue: number,
    remainingYears: number
  ): number => {
    if (remainingYears >= 80) return 0;
    const uplift = extendedValue - currentValue;
    return uplift * 0.5; // 50% share to freeholder
  },

  /** Lease extension premium estimate */
  leaseExtensionPremium: (
    flatValue: number,
    remainingYears: number,
    groundRent: number,
    groundRentReviewPeriod: number = 25,
    groundRentMultiplier: number = 2
  ): number => {
    // Simplified calculation - actual would use Savills/Gerald Eve graphs
    const relativityPercent = leasehold.relativity(remainingYears) / 100;
    const extendedValue = flatValue; // Assume 999 year = 100% value
    const currentValue = flatValue * relativityPercent;

    // Capitalised ground rent (simplified)
    const ypGroundRent = 100 / 6; // Assume 6% yield
    const capitalisedGroundRent = groundRent * Math.min(ypGroundRent, remainingYears);

    // Marriage value
    const marriage = leasehold.marriageValue(currentValue, extendedValue, remainingYears);

    // Diminution in freeholder's interest (simplified)
    const diminution = flatValue * (1 - relativityPercent) * 0.3;

    return Math.round(capitalisedGroundRent + marriage + diminution);
  },

  /** Ground rent capitalisation */
  groundRentCapitalisation: (
    groundRent: number,
    yieldPercent: number,
    yearsRemaining: number
  ): number => {
    const rate = yieldPercent / 100;
    // Present value of annuity
    if (rate === 0) return groundRent * yearsRemaining;
    return groundRent * ((1 - Math.pow(1 + rate, -yearsRemaining)) / rate);
  },
};

// ============================================
// CASH FLOW CALCULATIONS
// ============================================

export const cashflow = {
  /** Monthly cash flow */
  monthly: (monthlyRent: number, monthlyMortgage: number, monthlyExpenses: number): number => {
    return monthlyRent - monthlyMortgage - monthlyExpenses;
  },

  /** Annual cash flow */
  annual: (annualRent: number, annualMortgage: number, annualExpenses: number): number => {
    return annualRent - annualMortgage - annualExpenses;
  },

  /** Cash-on-cash return */
  cashOnCash: (annualCashFlow: number, totalCashInvested: number): number => {
    if (totalCashInvested <= 0) return 0;
    return (annualCashFlow / totalCashInvested) * 100;
  },

  /** Break-even occupancy rate */
  breakEvenOccupancy: (totalExpenses: number, potentialGrossRent: number): number => {
    if (potentialGrossRent <= 0) return 100;
    return (totalExpenses / potentialGrossRent) * 100;
  },

  /** Void period cost */
  voidCost: (monthlyRent: number, voidWeeks: number): number => {
    return (monthlyRent / 4.33) * voidWeeks;
  },
};

// ============================================
// RETURN CALCULATIONS
// ============================================

export const returns = {
  /** Return on Investment (ROI) */
  roi: (totalReturn: number, totalInvestment: number): number => {
    if (totalInvestment <= 0) return 0;
    return (totalReturn / totalInvestment) * 100;
  },

  /** Return on Capital Employed (ROCE) */
  roce: (operatingProfit: number, capitalEmployed: number): number => {
    if (capitalEmployed <= 0) return 0;
    return (operatingProfit / capitalEmployed) * 100;
  },

  /** Internal Rate of Return (IRR) - simplified Newton-Raphson */
  irr: (cashFlows: number[], guess: number = 0.1): number => {
    const maxIterations = 100;
    const tolerance = 0.0001;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
        derivative -= (j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
      }

      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100;
      }
      rate = newRate;
    }

    return rate * 100;
  },

  /** Net Present Value (NPV) */
  npv: (cashFlows: number[], discountRate: number): number => {
    const rate = discountRate / 100;
    return cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  },

  /** Equity Multiple */
  equityMultiple: (totalDistributions: number, totalEquityInvested: number): number => {
    if (totalEquityInvested <= 0) return 0;
    return totalDistributions / totalEquityInvested;
  },
};

// ============================================
// RISK CALCULATIONS
// ============================================

export const risk = {
  /** Stress test at given interest rate */
  stressTest: (
    annualRent: number,
    loanAmount: number,
    currentRate: number,
    stressRate: number,
    expenses: number
  ): { currentCashFlow: number; stressedCashFlow: number; survives: boolean } => {
    const currentInterest = loanAmount * (currentRate / 100);
    const stressedInterest = loanAmount * (stressRate / 100);
    const currentCashFlow = annualRent - currentInterest - expenses;
    const stressedCashFlow = annualRent - stressedInterest - expenses;
    return {
      currentCashFlow,
      stressedCashFlow,
      survives: stressedCashFlow > 0,
    };
  },

  /** Rental void risk score (0-100) */
  voidRiskScore: (
    propertyType: 'house' | 'flat' | 'hmo' | 'sa',
    location: 'prime' | 'secondary' | 'tertiary',
    condition: 'excellent' | 'good' | 'fair' | 'poor'
  ): number => {
    const typeScores = { house: 20, flat: 30, hmo: 40, sa: 50 };
    const locationScores = { prime: 10, secondary: 30, tertiary: 50 };
    const conditionScores = { excellent: 10, good: 20, fair: 40, poor: 60 };
    return Math.min(100, typeScores[propertyType] + locationScores[location] + conditionScores[condition]) / 3;
  },

  /** Refinance risk score */
  refinanceRisk: (
    currentLTV: number,
    projectedValue: number,
    loanAmount: number,
    timeToRefinance: number // months
  ): number => {
    const projectedLTV = (loanAmount / projectedValue) * 100;
    let score = 0;
    if (projectedLTV > 80) score += 40;
    else if (projectedLTV > 75) score += 20;
    if (timeToRefinance < 6) score += 30;
    else if (timeToRefinance < 12) score += 15;
    if (currentLTV > 85) score += 30;
    return Math.min(100, score);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const utils = {
  /** Format as GBP currency */
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /** Format as percentage */
  formatPercent: (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /** Format as ratio (e.g., 1.25x) */
  formatRatio: (value: number): string => {
    return `${value.toFixed(2)}x`;
  },

  /** Round to nearest */
  roundTo: (value: number, nearest: number): number => {
    return Math.round(value / nearest) * nearest;
  },

  /** Calculate compound growth */
  compoundGrowth: (principal: number, rate: number, years: number): number => {
    return principal * Math.pow(1 + rate / 100, years);
  },

  /** Calculate present value */
  presentValue: (futureValue: number, rate: number, years: number): number => {
    return futureValue / Math.pow(1 + rate / 100, years);
  },
};

// Export all formula categories
export const formulas = {
  yields,
  mortgage,
  bridging,
  development,
  ukTax,
  hmo,
  leasehold,
  cashflow,
  returns,
  risk,
  utils,
};

export default formulas;
