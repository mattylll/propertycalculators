// ============================================
// CALCULATOR REGISTRY
// PropertyCalculators.ai - Central calculator management
// ============================================

import {
  CalculatorDefinition,
  CalculatorCategory,
  CATEGORY_META,
  OutputVariant,
} from './calculator-types';
import { formulas } from './formulas';

// ============================================
// REGISTRY CLASS
// ============================================

class CalculatorRegistryClass {
  private calculators: Map<string, CalculatorDefinition> = new Map();
  private byCategory: Map<CalculatorCategory, string[]> = new Map();

  constructor() {
    // Initialize category maps
    Object.keys(CATEGORY_META).forEach((cat) => {
      this.byCategory.set(cat as CalculatorCategory, []);
    });
  }

  register(calculator: CalculatorDefinition): void {
    this.calculators.set(calculator.slug, calculator);
    const categoryCalcs = this.byCategory.get(calculator.category) || [];
    categoryCalcs.push(calculator.slug);
    this.byCategory.set(calculator.category, categoryCalcs);
  }

  get(slug: string): CalculatorDefinition | undefined {
    return this.calculators.get(slug);
  }

  getByCategory(category: CalculatorCategory): CalculatorDefinition[] {
    const slugs = this.byCategory.get(category) || [];
    return slugs.map((slug) => this.calculators.get(slug)!).filter(Boolean);
  }

  getRelated(slug: string): CalculatorDefinition[] {
    const calc = this.calculators.get(slug);
    if (!calc) return [];
    return calc.connections.related
      .map((s) => this.calculators.get(s)!)
      .filter(Boolean);
  }

  getUpstream(slug: string): CalculatorDefinition[] {
    const calc = this.calculators.get(slug);
    if (!calc) return [];
    return calc.connections.upstream
      .map((s) => this.calculators.get(s)!)
      .filter(Boolean);
  }

  getDownstream(slug: string): CalculatorDefinition[] {
    const calc = this.calculators.get(slug);
    if (!calc) return [];
    return calc.connections.downstream
      .map((s) => this.calculators.get(s)!)
      .filter(Boolean);
  }

  search(query: string): CalculatorDefinition[] {
    const lower = query.toLowerCase();
    return Array.from(this.calculators.values()).filter(
      (calc) =>
        calc.title.toLowerCase().includes(lower) ||
        calc.description.toLowerCase().includes(lower) ||
        calc.keywords.some((k) => k.toLowerCase().includes(lower))
    );
  }

  all(): CalculatorDefinition[] {
    return Array.from(this.calculators.values());
  }

  allSlugs(): string[] {
    return Array.from(this.calculators.keys());
  }

  count(): number {
    return this.calculators.size;
  }

  categories(): { category: CalculatorCategory; meta: typeof CATEGORY_META[CalculatorCategory]; count: number }[] {
    return Object.entries(CATEGORY_META).map(([key, meta]) => ({
      category: key as CalculatorCategory,
      meta,
      count: this.byCategory.get(key as CalculatorCategory)?.length || 0,
    }));
  }
}

// Singleton instance
export const registry = new CalculatorRegistryClass();

// ============================================
// HELPER: VARIANT RULES
// ============================================

const variantRules = {
  yield: (value: number): OutputVariant => {
    if (value >= 8) return 'success';
    if (value >= 6) return 'default';
    if (value >= 4) return 'warning';
    return 'danger';
  },
  ltv: (value: number): OutputVariant => {
    if (value <= 60) return 'success';
    if (value <= 75) return 'default';
    if (value <= 85) return 'warning';
    return 'danger';
  },
  dscr: (value: number): OutputVariant => {
    if (value >= 1.45) return 'success';
    if (value >= 1.25) return 'default';
    if (value >= 1.0) return 'warning';
    return 'danger';
  },
  icr: (value: number): OutputVariant => {
    if (value >= 145) return 'success';
    if (value >= 125) return 'default';
    if (value >= 100) return 'warning';
    return 'danger';
  },
  profitOnCost: (value: number): OutputVariant => {
    if (value >= 25) return 'success';
    if (value >= 20) return 'default';
    if (value >= 15) return 'warning';
    return 'danger';
  },
  cashFlow: (value: number): OutputVariant => {
    if (value >= 500) return 'success';
    if (value >= 200) return 'default';
    if (value >= 0) return 'warning';
    return 'danger';
  },
};

// ============================================
// HMO CALCULATORS
// ============================================

registry.register({
  id: 'hmo-viability',
  slug: 'hmo-viability-calculator',
  title: 'HMO Viability Calculator',
  shortTitle: 'HMO Viability',
  description: 'Assess whether a property is viable as an HMO investment, including yield, cash flow, and licensing requirements.',
  category: 'hmo',
  metaTitle: 'HMO Viability Calculator | Is Your Property Suitable for HMO?',
  metaDescription: 'Free HMO viability calculator. Check if your property works as an HMO - analyse yields, cash flow, licensing costs, and room-by-room profitability.',
  keywords: ['hmo viability', 'hmo calculator', 'hmo investment', 'house in multiple occupation', 'hmo yield'],
  status: 'live',
  inputs: [
    { id: 'purchasePrice', label: 'Purchase Price', type: 'currency', required: true, defaultValue: 250000, hint: 'Total purchase price of the property' },
    { id: 'refurbCost', label: 'Refurbishment Cost', type: 'currency', required: true, defaultValue: 30000, hint: 'Cost to convert to HMO standard' },
    { id: 'numRooms', label: 'Number of Lettable Rooms', type: 'integer', required: true, min: 3, max: 20, defaultValue: 5 },
    { id: 'avgRoomRent', label: 'Average Room Rent (pcm)', type: 'currency', required: true, defaultValue: 550, hint: 'Average rent per room per month' },
    { id: 'councilTax', label: 'Annual Council Tax', type: 'currency', defaultValue: 2400 },
    { id: 'utilities', label: 'Annual Utilities', type: 'currency', defaultValue: 3600, hint: 'Gas, electric, water, broadband' },
    { id: 'insurance', label: 'Annual Insurance', type: 'currency', defaultValue: 800 },
    { id: 'managementFee', label: 'Management Fee', type: 'percentage', defaultValue: 12, hint: 'Percentage of rent' },
    { id: 'voidRate', label: 'Void Allowance', type: 'percentage', defaultValue: 8, hint: 'Expected void percentage' },
    { id: 'mortgageRate', label: 'Mortgage Rate', type: 'percentage', defaultValue: 6.5 },
    { id: 'ltv', label: 'Loan to Value', type: 'percentage', defaultValue: 75 },
  ],
  outputs: [
    { id: 'grossRent', label: 'Gross Annual Rent', format: 'currency', isPrimary: false },
    { id: 'grossYield', label: 'Gross Yield', format: 'percentage', isPrimary: true, variant: (v) => variantRules.yield(Number(v)) },
    { id: 'netYield', label: 'Net Yield', format: 'percentage', variant: (v) => variantRules.yield(Number(v)) },
    { id: 'totalInvestment', label: 'Total Investment', format: 'currency' },
    { id: 'annualCosts', label: 'Annual Running Costs', format: 'currency' },
    { id: 'netOperatingIncome', label: 'Net Operating Income', format: 'currency' },
    { id: 'mortgageAmount', label: 'Mortgage Amount', format: 'currency' },
    { id: 'annualMortgage', label: 'Annual Mortgage Cost', format: 'currency' },
    { id: 'annualCashFlow', label: 'Annual Cash Flow', format: 'currency', isPrimary: true, variant: (v) => variantRules.cashFlow(Number(v)) },
    { id: 'monthlyCashFlow', label: 'Monthly Cash Flow', format: 'currency' },
    { id: 'cashOnCash', label: 'Cash on Cash Return', format: 'percentage', variant: (v) => variantRules.yield(Number(v)) },
    { id: 'cashRequired', label: 'Cash Required', format: 'currency' },
  ],
  calculate: (inputs) => {
    const purchasePrice = Number(inputs.purchasePrice);
    const refurbCost = Number(inputs.refurbCost);
    const numRooms = Number(inputs.numRooms);
    const avgRoomRent = Number(inputs.avgRoomRent);
    const councilTax = Number(inputs.councilTax);
    const utilities = Number(inputs.utilities);
    const insurance = Number(inputs.insurance);
    const managementFee = Number(inputs.managementFee) / 100;
    const voidRate = Number(inputs.voidRate) / 100;
    const mortgageRate = Number(inputs.mortgageRate) / 100;
    const ltv = Number(inputs.ltv) / 100;

    const totalInvestment = purchasePrice + refurbCost;
    const grossRent = numRooms * avgRoomRent * 12;
    const effectiveRent = grossRent * (1 - voidRate);
    const management = effectiveRent * managementFee;
    const maintenance = effectiveRent * 0.05; // 5% maintenance reserve
    const annualCosts = councilTax + utilities + insurance + management + maintenance;
    const netOperatingIncome = effectiveRent - annualCosts;

    const mortgageAmount = purchasePrice * ltv;
    const annualMortgage = mortgageAmount * mortgageRate;
    const annualCashFlow = netOperatingIncome - annualMortgage;
    const cashRequired = totalInvestment - mortgageAmount;

    const grossYield = formulas.yields.gross(grossRent, totalInvestment);
    const netYield = formulas.yields.net(grossRent, annualCosts, totalInvestment);
    const cashOnCash = formulas.cashflow.cashOnCash(annualCashFlow, cashRequired);

    return {
      grossRent,
      grossYield,
      netYield,
      totalInvestment,
      annualCosts,
      netOperatingIncome,
      mortgageAmount,
      annualMortgage,
      annualCashFlow,
      monthlyCashFlow: annualCashFlow / 12,
      cashOnCash,
      cashRequired,
    };
  },
  ai: {
    systemPrompt: `You are an expert UK HMO property analyst. Analyse HMO viability calculations and provide actionable insights.
Focus on: yield quality, cash flow sustainability, licensing requirements, fire safety implications, and local market context.
Be direct and practical. Flag any concerns clearly. Suggest specific improvements where possible.`,
    promptTemplate: `Analyse this HMO investment:
- Purchase: £{{purchasePrice}}, Refurb: £{{refurbCost}}
- {{numRooms}} rooms at £{{avgRoomRent}}/room/month
- Gross yield: {{grossYield}}%, Net yield: {{netYield}}%
- Monthly cash flow: £{{monthlyCashFlow}}
- Cash on cash return: {{cashOnCash}}%

Assess viability, risks, and suggest improvements.`,
    analysisAspects: ['viability', 'risk', 'optimisation', 'comparison', 'next_steps'],
    thresholds: [
      { metric: 'grossYield', operator: '<', value: 10, severity: 'warning', message: 'Gross yield below 10% is marginal for HMO' },
      { metric: 'grossYield', operator: '>=', value: 12, severity: 'success', message: 'Strong gross yield for HMO' },
      { metric: 'monthlyCashFlow', operator: '<', value: 200, severity: 'warning', message: 'Cash flow buffer is tight' },
      { metric: 'cashOnCash', operator: '>=', value: 15, severity: 'success', message: 'Excellent cash-on-cash return' },
    ],
  },
  connections: {
    upstream: [],
    downstream: ['hmo-finance-calculator', 'hmo-yield-cashflow-calculator', 'hmo-licensing-fee-calculator'],
    related: ['hmo-fire-safety-upgrade-cost-calculator', 'article-4-hmo-conversion-risk-calculator'],
  },
  examples: [
    {
      name: '5-Bed Professional HMO',
      description: 'Typical professional HMO in a secondary city',
      inputs: { purchasePrice: 250000, refurbCost: 35000, numRooms: 5, avgRoomRent: 575, councilTax: 2400, utilities: 4200, insurance: 900, managementFee: 12, voidRate: 6, mortgageRate: 6.5, ltv: 75 },
    },
  ],
});

registry.register({
  id: 'hmo-licensing-fee',
  slug: 'hmo-licensing-fee-calculator',
  title: 'HMO Licensing Fee Calculator',
  shortTitle: 'HMO Licensing',
  description: 'Calculate HMO licensing fees based on your local authority and property size.',
  category: 'hmo',
  metaTitle: 'HMO Licensing Fee Calculator | UK Council HMO Fees 2024',
  metaDescription: 'Calculate HMO licensing costs for your local authority. Includes mandatory and additional licensing fees, renewal costs, and licence period.',
  keywords: ['hmo licensing', 'hmo licence fee', 'mandatory licensing', 'additional licensing', 'council hmo fee'],
  status: 'live',
  inputs: [
    { id: 'councilType', label: 'Council Fee Level', type: 'select', required: true, defaultValue: 'medium', options: [
      { value: 'low', label: 'Low (Rural/Small)', description: '£400-700 base fee' },
      { value: 'medium', label: 'Medium (Most councils)', description: '£700-1200 base fee' },
      { value: 'high', label: 'High (London/Major cities)', description: '£1200-1800 base fee' },
    ]},
    { id: 'numBeds', label: 'Number of Bedrooms', type: 'integer', required: true, min: 3, max: 30, defaultValue: 5 },
    { id: 'isRenewal', label: 'Is this a renewal?', type: 'toggle', defaultValue: false },
    { id: 'licenceYears', label: 'Licence Period (years)', type: 'select', defaultValue: 5, options: [
      { value: 1, label: '1 year' },
      { value: 3, label: '3 years' },
      { value: 5, label: '5 years (standard)' },
    ]},
  ],
  outputs: [
    { id: 'totalFee', label: 'Total Licensing Fee', format: 'currency', isPrimary: true },
    { id: 'feePerYear', label: 'Cost Per Year', format: 'currency' },
    { id: 'feePerRoom', label: 'Cost Per Room', format: 'currency' },
    { id: 'feePerRoomPerYear', label: 'Cost Per Room Per Year', format: 'currency' },
  ],
  calculate: (inputs) => {
    const councilType = String(inputs.councilType) as 'low' | 'medium' | 'high';
    const numBeds = Number(inputs.numBeds);
    const isRenewal = Boolean(inputs.isRenewal);
    const licenceYears = Number(inputs.licenceYears);

    const baseFees = { low: 500, medium: 900, high: 1500 };
    const perBedFees = { low: 30, medium: 50, high: 80 };
    const renewalDiscount = isRenewal ? 0.8 : 1;

    const totalFee = (baseFees[councilType] + perBedFees[councilType] * numBeds) * renewalDiscount;
    const feePerYear = totalFee / licenceYears;
    const feePerRoom = totalFee / numBeds;
    const feePerRoomPerYear = feePerYear / numBeds;

    return { totalFee, feePerYear, feePerRoom, feePerRoomPerYear };
  },
  ai: {
    systemPrompt: 'You are an HMO licensing expert. Provide context on licensing requirements and costs.',
    promptTemplate: 'HMO licensing for {{numBeds}} bed property: £{{totalFee}} total (£{{feePerYear}}/year). Council type: {{councilType}}. Provide context.',
    analysisAspects: ['comparison', 'next_steps'],
  },
  connections: {
    upstream: ['hmo-viability-calculator'],
    downstream: ['hmo-fire-safety-upgrade-cost-calculator'],
    related: ['article-4-hmo-conversion-risk-calculator'],
  },
});

// ============================================
// DEVELOPMENT CALCULATORS
// ============================================

registry.register({
  id: 'development-appraisal',
  slug: 'new-build-development-appraisal-calculator',
  title: 'New-Build Development Appraisal Calculator',
  shortTitle: 'Dev Appraisal',
  description: 'Full development appraisal for new-build projects including GDV, build costs, finance, and profit analysis.',
  category: 'development',
  metaTitle: 'Development Appraisal Calculator | New Build Property Development',
  metaDescription: 'Free development appraisal calculator for UK property developers. Calculate GDV, build costs, profit on cost, residual land value, and development finance.',
  keywords: ['development appraisal', 'property development', 'gdv calculator', 'build cost', 'profit on cost', 'residual land value'],
  status: 'live',
  inputs: [
    { id: 'landCost', label: 'Land Cost', type: 'currency', required: true, defaultValue: 500000, group: 'costs' },
    { id: 'numUnits', label: 'Number of Units', type: 'integer', required: true, min: 1, max: 500, defaultValue: 4 },
    { id: 'avgUnitSqft', label: 'Average Unit Size (sqft)', type: 'number', required: true, defaultValue: 850 },
    { id: 'saleValuePerSqft', label: 'Sale Value (£/sqft)', type: 'currency', required: true, defaultValue: 400, hint: 'Expected sale price per square foot' },
    { id: 'buildCostPerSqft', label: 'Build Cost (£/sqft)', type: 'currency', required: true, defaultValue: 180, hint: 'All-in build cost per sqft' },
    { id: 'professionalFees', label: 'Professional Fees', type: 'percentage', defaultValue: 10, hint: 'Architects, engineers, etc.' },
    { id: 'contingency', label: 'Contingency', type: 'percentage', defaultValue: 7.5 },
    { id: 'salesCosts', label: 'Sales & Legal Costs', type: 'percentage', defaultValue: 3, hint: 'Agent fees, legal, marketing' },
    { id: 'financeRate', label: 'Finance Rate (annual)', type: 'percentage', defaultValue: 10 },
    { id: 'buildPeriod', label: 'Build Period (months)', type: 'integer', min: 3, max: 60, defaultValue: 12 },
    { id: 'salePeriod', label: 'Sale Period (months)', type: 'integer', min: 1, max: 24, defaultValue: 6 },
  ],
  outputs: [
    { id: 'gdv', label: 'Gross Development Value', format: 'currency', isPrimary: true },
    { id: 'totalBuildCost', label: 'Total Build Cost', format: 'currency' },
    { id: 'professionalTotal', label: 'Professional Fees', format: 'currency' },
    { id: 'contingencyTotal', label: 'Contingency', format: 'currency' },
    { id: 'salesTotal', label: 'Sales Costs', format: 'currency' },
    { id: 'financeCost', label: 'Finance Cost', format: 'currency' },
    { id: 'totalCosts', label: 'Total Development Costs', format: 'currency' },
    { id: 'profit', label: 'Developer Profit', format: 'currency', isPrimary: true },
    { id: 'profitOnCost', label: 'Profit on Cost', format: 'percentage', variant: (v) => variantRules.profitOnCost(Number(v)) },
    { id: 'profitOnGDV', label: 'Profit on GDV', format: 'percentage' },
    { id: 'buildCostTotal', label: 'Build Cost (inc. fees)', format: 'currency' },
  ],
  calculate: (inputs) => {
    const landCost = Number(inputs.landCost);
    const numUnits = Number(inputs.numUnits);
    const avgUnitSqft = Number(inputs.avgUnitSqft);
    const saleValuePerSqft = Number(inputs.saleValuePerSqft);
    const buildCostPerSqft = Number(inputs.buildCostPerSqft);
    const professionalFees = Number(inputs.professionalFees) / 100;
    const contingency = Number(inputs.contingency) / 100;
    const salesCosts = Number(inputs.salesCosts) / 100;
    const financeRate = Number(inputs.financeRate) / 100;
    const buildPeriod = Number(inputs.buildPeriod);
    const salePeriod = Number(inputs.salePeriod);

    const totalSqft = numUnits * avgUnitSqft;
    const gdv = totalSqft * saleValuePerSqft;
    const totalBuildCost = totalSqft * buildCostPerSqft;
    const professionalTotal = totalBuildCost * professionalFees;
    const contingencyTotal = totalBuildCost * contingency;
    const salesTotal = gdv * salesCosts;

    // Finance calculation (simplified - land fully drawn, build 50% average)
    const totalMonths = buildPeriod + salePeriod;
    const monthlyRate = financeRate / 12;
    const landFinance = landCost * (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const buildFinance = (totalBuildCost + professionalTotal + contingencyTotal) * 0.5 * (Math.pow(1 + monthlyRate, buildPeriod) - 1);
    const financeCost = landFinance + buildFinance;

    const totalCosts = landCost + totalBuildCost + professionalTotal + contingencyTotal + salesTotal + financeCost;
    const profit = gdv - totalCosts;
    const profitOnCost = formulas.development.profitOnCost(gdv, totalCosts);
    const profitOnGDV = formulas.development.profitOnGDV(gdv, totalCosts);
    const buildCostTotal = totalBuildCost + professionalTotal + contingencyTotal;

    return {
      gdv,
      totalBuildCost,
      professionalTotal,
      contingencyTotal,
      salesTotal,
      financeCost,
      totalCosts,
      profit,
      profitOnCost,
      profitOnGDV,
      buildCostTotal,
    };
  },
  ai: {
    systemPrompt: `You are an expert UK property development analyst. Analyse development appraisals and provide practical insights.
Focus on: profit margins, cost benchmarking, risk factors, finance structure, and market conditions.
Be direct about viability. Flag concerns clearly. Compare to industry benchmarks (20% profit on cost target).`,
    promptTemplate: `Development appraisal for {{numUnits}} units:
- GDV: £{{gdv}} ({{avgUnitSqft}} sqft @ £{{saleValuePerSqft}}/sqft)
- Land: £{{landCost}}
- Build cost: £{{buildCostTotal}} (£{{buildCostPerSqft}}/sqft)
- Finance: £{{financeCost}} ({{buildPeriod}}m build + {{salePeriod}}m sale)
- Total costs: £{{totalCosts}}
- Profit: £{{profit}} ({{profitOnCost}}% on cost, {{profitOnGDV}}% on GDV)

Assess viability and risks.`,
    analysisAspects: ['viability', 'risk', 'optimisation', 'comparison', 'financing'],
    thresholds: [
      { metric: 'profitOnCost', operator: '<', value: 15, severity: 'warning', message: 'Profit margin below typical lender requirement' },
      { metric: 'profitOnCost', operator: '>=', value: 20, severity: 'success', message: 'Healthy profit margin' },
      { metric: 'profitOnCost', operator: '<', value: 10, severity: 'critical', message: 'Very tight margin - high risk' },
    ],
  },
  connections: {
    upstream: ['residual-land-value-calculator', 'build-cost-benchmarking-calculator'],
    downstream: ['development-finance-calculator', 'developer-exit-strategy-calculator'],
    related: ['conversion-appraisal-calculator', 'profit-on-cost-and-gdv-calculator'],
  },
});

// ============================================
// BRIDGING & FINANCE CALCULATORS
// ============================================

registry.register({
  id: 'bridging-loan',
  slug: 'bridging-loan-calculator',
  title: 'Bridging Loan Calculator',
  shortTitle: 'Bridging Loan',
  description: 'Calculate bridging loan costs including interest, fees, and day-1 net proceeds.',
  category: 'bridging',
  metaTitle: 'Bridging Loan Calculator | UK Bridge Finance Costs 2024',
  metaDescription: 'Free bridging loan calculator. Calculate total bridging costs, retained vs rolled interest, arrangement fees, and net day-1 proceeds for UK property.',
  keywords: ['bridging loan', 'bridge finance', 'bridging calculator', 'bridge interest', 'development bridge'],
  status: 'live',
  inputs: [
    { id: 'propertyValue', label: 'Property Value / Purchase Price', type: 'currency', required: true, defaultValue: 300000 },
    { id: 'loanAmount', label: 'Loan Amount Required', type: 'currency', required: true, defaultValue: 225000 },
    { id: 'monthlyRate', label: 'Monthly Interest Rate', type: 'percentage', required: true, defaultValue: 0.85, step: 0.01 },
    { id: 'termMonths', label: 'Term (months)', type: 'integer', required: true, min: 1, max: 24, defaultValue: 12 },
    { id: 'arrangementFee', label: 'Arrangement Fee', type: 'percentage', defaultValue: 2 },
    { id: 'exitFee', label: 'Exit Fee', type: 'percentage', defaultValue: 1 },
    { id: 'valuationFee', label: 'Valuation Fee', type: 'currency', defaultValue: 750 },
    { id: 'legalFees', label: 'Legal Fees', type: 'currency', defaultValue: 1500 },
    { id: 'interestType', label: 'Interest Type', type: 'select', defaultValue: 'retained', options: [
      { value: 'retained', label: 'Retained (deducted upfront)' },
      { value: 'rolled', label: 'Rolled (added to loan)' },
      { value: 'serviced', label: 'Serviced (paid monthly)' },
    ]},
  ],
  outputs: [
    { id: 'ltv', label: 'Loan to Value', format: 'percentage', isPrimary: true, variant: (v) => variantRules.ltv(Number(v)) },
    { id: 'totalInterest', label: 'Total Interest Cost', format: 'currency' },
    { id: 'arrangementCost', label: 'Arrangement Fee', format: 'currency' },
    { id: 'exitCost', label: 'Exit Fee', format: 'currency' },
    { id: 'totalFees', label: 'Total Fees', format: 'currency' },
    { id: 'totalCost', label: 'Total Bridging Cost', format: 'currency', isPrimary: true },
    { id: 'effectiveAnnualRate', label: 'Effective Annual Rate', format: 'percentage' },
    { id: 'day1Net', label: 'Day-1 Net Proceeds', format: 'currency' },
    { id: 'redemptionFigure', label: 'Redemption Figure', format: 'currency' },
  ],
  calculate: (inputs) => {
    const propertyValue = Number(inputs.propertyValue);
    const loanAmount = Number(inputs.loanAmount);
    const monthlyRate = Number(inputs.monthlyRate);
    const termMonths = Number(inputs.termMonths);
    const arrangementFee = Number(inputs.arrangementFee) / 100;
    const exitFee = Number(inputs.exitFee) / 100;
    const valuationFee = Number(inputs.valuationFee);
    const legalFees = Number(inputs.legalFees);
    const interestType = String(inputs.interestType);

    const ltv = formulas.mortgage.ltv(loanAmount, propertyValue);
    const arrangementCost = loanAmount * arrangementFee;
    const exitCost = loanAmount * exitFee;

    let totalInterest: number;
    if (interestType === 'rolled') {
      totalInterest = formulas.bridging.totalInterestRolled(loanAmount, monthlyRate, termMonths);
    } else {
      totalInterest = formulas.bridging.totalInterestRetained(loanAmount, monthlyRate, termMonths);
    }

    const totalFees = arrangementCost + exitCost + valuationFee + legalFees;
    const totalCost = totalInterest + totalFees;
    const effectiveAnnualRate = formulas.bridging.effectiveAnnualRate(monthlyRate);

    let day1Net: number;
    if (interestType === 'retained') {
      day1Net = loanAmount - arrangementCost - totalInterest - legalFees - valuationFee;
    } else {
      day1Net = loanAmount - arrangementCost - legalFees - valuationFee;
    }

    let redemptionFigure: number;
    if (interestType === 'rolled') {
      redemptionFigure = loanAmount + totalInterest + exitCost;
    } else {
      redemptionFigure = loanAmount + exitCost;
    }

    return {
      ltv,
      totalInterest,
      arrangementCost,
      exitCost,
      totalFees,
      totalCost,
      effectiveAnnualRate,
      day1Net,
      redemptionFigure,
    };
  },
  ai: {
    systemPrompt: `You are an expert UK bridging finance analyst. Analyse bridging loan calculations and provide practical insights.
Focus on: cost efficiency, LTV risk, exit strategy viability, and comparison to market rates.
Be direct about the true cost of finance. Highlight hidden costs.`,
    promptTemplate: `Bridging loan analysis:
- Loan: £{{loanAmount}} on £{{propertyValue}} property ({{ltv}}% LTV)
- Rate: {{monthlyRate}}% monthly ({{effectiveAnnualRate}}% EAR)
- Term: {{termMonths}} months
- Total cost: £{{totalCost}} (Interest: £{{totalInterest}}, Fees: £{{totalFees}})
- Day-1 net: £{{day1Net}}
- Redemption: £{{redemptionFigure}}

Assess cost efficiency and risks.`,
    analysisAspects: ['viability', 'risk', 'comparison', 'exit'],
    thresholds: [
      { metric: 'ltv', operator: '>', value: 75, severity: 'warning', message: 'High LTV - limited lender options' },
      { metric: 'effectiveAnnualRate', operator: '>', value: 15, severity: 'warning', message: 'High effective rate - ensure exit is viable' },
    ],
  },
  connections: {
    upstream: ['auction-maximum-bid-calculator'],
    downstream: ['bridge-to-let-calculator', 'day1-vs-day180-refinance-calculator'],
    related: ['refurbishment-bridge-calculator', 'development-finance-calculator'],
  },
});

registry.register({
  id: 'dscr-icr-btl',
  slug: 'dscr-icr-btl-calculator',
  title: 'DSCR / ICR Buy-to-Let Calculator',
  shortTitle: 'DSCR/ICR BTL',
  description: 'Calculate Debt Service Coverage Ratio and Interest Coverage Ratio for BTL mortgages.',
  category: 'bridging',
  metaTitle: 'DSCR & ICR Calculator | BTL Mortgage Affordability UK',
  metaDescription: 'Calculate DSCR and ICR for buy-to-let mortgages. Check if your rental property meets lender stress test requirements at 125% or 145% ICR.',
  keywords: ['dscr calculator', 'icr calculator', 'btl affordability', 'stress test', 'rental coverage'],
  status: 'live',
  inputs: [
    { id: 'monthlyRent', label: 'Monthly Rent', type: 'currency', required: true, defaultValue: 1200 },
    { id: 'propertyValue', label: 'Property Value', type: 'currency', required: true, defaultValue: 250000 },
    { id: 'loanAmount', label: 'Mortgage Amount', type: 'currency', required: true, defaultValue: 187500 },
    { id: 'interestRate', label: 'Current Interest Rate', type: 'percentage', defaultValue: 5.5 },
    { id: 'stressRate', label: 'Stress Test Rate', type: 'percentage', defaultValue: 5.5, hint: 'Lender stress test rate (typically 5.5%)' },
    { id: 'requiredICR', label: 'Required ICR', type: 'percentage', defaultValue: 145, hint: 'Lender ICR requirement (125% basic, 145% higher)' },
  ],
  outputs: [
    { id: 'ltv', label: 'Loan to Value', format: 'percentage', variant: (v) => variantRules.ltv(Number(v)) },
    { id: 'grossYield', label: 'Gross Yield', format: 'percentage', variant: (v) => variantRules.yield(Number(v)) },
    { id: 'annualRent', label: 'Annual Rent', format: 'currency' },
    { id: 'annualInterest', label: 'Annual Interest (current)', format: 'currency' },
    { id: 'stressedInterest', label: 'Annual Interest (stressed)', format: 'currency' },
    { id: 'icr', label: 'ICR (current rate)', format: 'percentage', isPrimary: true, variant: (v) => variantRules.icr(Number(v)) },
    { id: 'icrStressed', label: 'ICR (stressed)', format: 'percentage', isPrimary: true, variant: (v) => variantRules.icr(Number(v)) },
    { id: 'maxLoan', label: 'Maximum Loan (at required ICR)', format: 'currency' },
    { id: 'passesStressTest', label: 'Passes Stress Test', format: 'text' },
  ],
  calculate: (inputs) => {
    const monthlyRent = Number(inputs.monthlyRent);
    const propertyValue = Number(inputs.propertyValue);
    const loanAmount = Number(inputs.loanAmount);
    const interestRate = Number(inputs.interestRate);
    const stressRate = Number(inputs.stressRate);
    const requiredICR = Number(inputs.requiredICR);

    const annualRent = monthlyRent * 12;
    const annualInterest = loanAmount * (interestRate / 100);
    const stressedInterest = loanAmount * (stressRate / 100);

    const ltv = formulas.mortgage.ltv(loanAmount, propertyValue);
    const grossYield = formulas.yields.gross(annualRent, propertyValue);
    const icr = formulas.mortgage.icr(annualRent, annualInterest);
    const icrStressed = formulas.mortgage.icr(annualRent, stressedInterest);
    const maxLoan = formulas.mortgage.maxLoanFromICR(annualRent, stressRate, requiredICR);
    const passesStressTest = icrStressed >= requiredICR ? 'Yes' : 'No';

    return {
      ltv,
      grossYield,
      annualRent,
      annualInterest,
      stressedInterest,
      icr,
      icrStressed,
      maxLoan,
      passesStressTest,
    };
  },
  ai: {
    systemPrompt: 'You are a UK BTL mortgage specialist. Analyse ICR/DSCR calculations and provide practical lending insights.',
    promptTemplate: `BTL mortgage analysis:
- Rent: £{{monthlyRent}}/month (£{{annualRent}}/year)
- Loan: £{{loanAmount}} on £{{propertyValue}} ({{ltv}}% LTV)
- ICR: {{icr}}% (current), {{icrStressed}}% (stressed at {{stressRate}}%)
- Required ICR: {{requiredICR}}%
- Passes stress test: {{passesStressTest}}
- Max loan at required ICR: £{{maxLoan}}

Assess affordability and options.`,
    analysisAspects: ['viability', 'financing', 'optimisation'],
    thresholds: [
      { metric: 'icrStressed', operator: '<', value: 125, severity: 'critical', message: 'Does not meet minimum 125% ICR requirement' },
      { metric: 'icrStressed', operator: '<', value: 145, severity: 'warning', message: 'Below 145% - limited to basic rate taxpayers' },
      { metric: 'icrStressed', operator: '>=', value: 145, severity: 'success', message: 'Meets higher rate taxpayer ICR requirement' },
    ],
  },
  connections: {
    upstream: ['rental-yield-calculator'],
    downstream: ['section-24-tax-impact-calculator', 'portfolio-stress-test-calculator'],
    related: ['holiday-let-stress-test-calculator', 'portfolio-dscr-calculator'],
  },
});

// ============================================
// LEASEHOLD CALCULATORS
// ============================================

registry.register({
  id: 'lease-extension',
  slug: 'lease-extension-calculator',
  title: 'Lease Extension Calculator',
  shortTitle: 'Lease Extension',
  description: 'Estimate the cost of extending your lease under the Leasehold Reform Act.',
  category: 'leasehold',
  metaTitle: 'Lease Extension Calculator | UK Leasehold Premium Estimator 2024',
  metaDescription: 'Free lease extension calculator. Estimate your lease extension premium based on remaining years, ground rent, and property value. UK leasehold reform compliant.',
  keywords: ['lease extension', 'lease extension calculator', 'leasehold premium', 'marriage value', 'leasehold reform'],
  status: 'live',
  inputs: [
    { id: 'flatValue', label: 'Current Flat Value', type: 'currency', required: true, defaultValue: 350000, hint: 'Market value with current lease' },
    { id: 'remainingYears', label: 'Remaining Lease Years', type: 'number', required: true, min: 0, max: 999, defaultValue: 72 },
    { id: 'groundRent', label: 'Current Ground Rent (annual)', type: 'currency', defaultValue: 250 },
    { id: 'groundRentReview', label: 'Ground Rent Review Period (years)', type: 'integer', defaultValue: 25 },
    { id: 'groundRentMultiplier', label: 'Ground Rent Multiplier at Review', type: 'number', defaultValue: 2, hint: 'e.g., 2 = doubles' },
  ],
  outputs: [
    { id: 'relativity', label: 'Relativity %', format: 'percentage', tooltip: 'Value of current lease as % of freehold value' },
    { id: 'freeholdValue', label: 'Estimated Freehold Value', format: 'currency' },
    { id: 'capitalGroundRent', label: 'Capitalised Ground Rent', format: 'currency' },
    { id: 'marriageValue', label: 'Marriage Value (50% share)', format: 'currency' },
    { id: 'estimatedPremium', label: 'Estimated Premium', format: 'currency', isPrimary: true },
    { id: 'extendedValue', label: 'Value After Extension', format: 'currency' },
    { id: 'valueUplift', label: 'Value Uplift', format: 'currency' },
    { id: 'netBenefit', label: 'Net Benefit', format: 'currency', isPrimary: true },
  ],
  calculate: (inputs) => {
    const flatValue = Number(inputs.flatValue);
    const remainingYears = Number(inputs.remainingYears);
    const groundRent = Number(inputs.groundRent);

    const relativity = formulas.leasehold.relativity(remainingYears);
    const freeholdValue = flatValue / (relativity / 100);
    const extendedValue = freeholdValue; // 999 year lease = freehold value

    // Capitalised ground rent (simplified)
    const capitalGroundRent = formulas.leasehold.groundRentCapitalisation(groundRent, 6, Math.min(remainingYears, 50));

    // Marriage value (only if under 80 years)
    const marriageValue = formulas.leasehold.marriageValue(flatValue, extendedValue, remainingYears);

    // Diminution in freeholder's interest
    const diminution = (freeholdValue - flatValue) * 0.3;

    const estimatedPremium = Math.round(capitalGroundRent + marriageValue + diminution);
    const valueUplift = extendedValue - flatValue;
    const netBenefit = valueUplift - estimatedPremium;

    return {
      relativity,
      freeholdValue,
      capitalGroundRent,
      marriageValue,
      estimatedPremium,
      extendedValue,
      valueUplift,
      netBenefit,
    };
  },
  ai: {
    systemPrompt: `You are a UK leasehold specialist and RICS qualified surveyor. Analyse lease extension calculations.
Focus on: marriage value implications, relativity accuracy, negotiation tactics, and timing considerations.
Explain the 80-year cliff edge. Discuss reform implications if relevant.`,
    promptTemplate: `Lease extension analysis:
- Flat value: £{{flatValue}} with {{remainingYears}} years remaining
- Ground rent: £{{groundRent}}/year
- Relativity: {{relativity}}%
- Estimated premium: £{{estimatedPremium}}
  - Capitalised ground rent: £{{capitalGroundRent}}
  - Marriage value (50%): £{{marriageValue}}
- Value after extension: £{{extendedValue}}
- Net benefit: £{{netBenefit}}

Assess value and advise on timing/strategy.`,
    analysisAspects: ['viability', 'optimisation', 'next_steps'],
    thresholds: [
      { metric: 'remainingYears', operator: '<=', value: 80, severity: 'warning', message: 'Under 80 years - marriage value applies' },
      { metric: 'remainingYears', operator: '<=', value: 70, severity: 'critical', message: 'Under 70 years - significant marriage value, extend urgently' },
      { metric: 'netBenefit', operator: '>', value: 0, severity: 'success', message: 'Positive net benefit from extension' },
    ],
  },
  connections: {
    upstream: [],
    downstream: ['marriage-value-calculator', 'leasehold-vs-freehold-value-differential-calculator'],
    related: ['freehold-enfranchisement-calculator', 'ground-rent-capitalisation-calculator'],
  },
});

// ============================================
// CREATIVE STRATEGIES
// ============================================

registry.register({
  id: 'brrr',
  slug: 'brrr-calculator',
  title: 'BRRR (Buy-Refurb-Refinance-Rent) Calculator',
  shortTitle: 'BRRR',
  description: 'Calculate returns on a BRRR strategy including cash recycling and long-term yield.',
  category: 'creative',
  metaTitle: 'BRRR Calculator | Buy Refurb Refinance Rent Strategy UK',
  metaDescription: 'Free BRRR calculator for UK property investors. Calculate cash recycling, refinance equity release, and ongoing rental returns from buy-refurb-refinance-rent deals.',
  keywords: ['brrr', 'brrr strategy', 'buy refurb refinance rent', 'cash recycling', 'property investment'],
  status: 'live',
  inputs: [
    { id: 'purchasePrice', label: 'Purchase Price', type: 'currency', required: true, defaultValue: 120000 },
    { id: 'refurbCost', label: 'Refurbishment Cost', type: 'currency', required: true, defaultValue: 25000 },
    { id: 'afterRepairValue', label: 'After Repair Value (ARV)', type: 'currency', required: true, defaultValue: 180000 },
    { id: 'monthlyRent', label: 'Monthly Rent (post-refurb)', type: 'currency', required: true, defaultValue: 850 },
    { id: 'purchaseCosts', label: 'Purchase Costs (SDLT, legal)', type: 'currency', defaultValue: 5000 },
    { id: 'refinanceLTV', label: 'Refinance LTV', type: 'percentage', defaultValue: 75 },
    { id: 'refinanceRate', label: 'Refinance Mortgage Rate', type: 'percentage', defaultValue: 5.5 },
    { id: 'monthlyExpenses', label: 'Monthly Expenses', type: 'currency', defaultValue: 150, hint: 'Management, insurance, maintenance' },
    { id: 'bridgingMonths', label: 'Bridging Period (months)', type: 'integer', defaultValue: 6 },
    { id: 'bridgingRate', label: 'Bridging Monthly Rate', type: 'percentage', defaultValue: 0.9 },
  ],
  outputs: [
    { id: 'totalInvested', label: 'Total Cash Invested', format: 'currency' },
    { id: 'refinanceAmount', label: 'Refinance Mortgage', format: 'currency' },
    { id: 'equityReleased', label: 'Equity Released', format: 'currency' },
    { id: 'cashLeftIn', label: 'Cash Left in Deal', format: 'currency', isPrimary: true },
    { id: 'grossYield', label: 'Gross Yield (on ARV)', format: 'percentage' },
    { id: 'monthlyCashFlow', label: 'Monthly Cash Flow', format: 'currency' },
    { id: 'annualCashFlow', label: 'Annual Cash Flow', format: 'currency' },
    { id: 'cashOnCash', label: 'Cash on Cash Return', format: 'percentage', isPrimary: true, variant: (v) => variantRules.yield(Number(v)) },
    { id: 'infiniteReturn', label: 'Infinite Return?', format: 'text' },
    { id: 'equityPosition', label: 'Equity Position', format: 'currency' },
  ],
  calculate: (inputs) => {
    const purchasePrice = Number(inputs.purchasePrice);
    const refurbCost = Number(inputs.refurbCost);
    const afterRepairValue = Number(inputs.afterRepairValue);
    const monthlyRent = Number(inputs.monthlyRent);
    const purchaseCosts = Number(inputs.purchaseCosts);
    const refinanceLTV = Number(inputs.refinanceLTV) / 100;
    const refinanceRate = Number(inputs.refinanceRate) / 100;
    const monthlyExpenses = Number(inputs.monthlyExpenses);
    const bridgingMonths = Number(inputs.bridgingMonths);
    const bridgingRate = Number(inputs.bridgingRate) / 100;

    // Bridging costs
    const bridgingInterest = (purchasePrice + refurbCost * 0.5) * bridgingRate * bridgingMonths;
    const bridgingFees = (purchasePrice + refurbCost) * 0.02; // 2% arrangement

    const totalInvested = purchasePrice + refurbCost + purchaseCosts + bridgingInterest + bridgingFees;
    const refinanceAmount = afterRepairValue * refinanceLTV;
    const equityReleased = refinanceAmount;
    const cashLeftIn = Math.max(0, totalInvested - equityReleased);

    const annualRent = monthlyRent * 12;
    const grossYield = formulas.yields.gross(annualRent, afterRepairValue);
    const monthlyMortgage = formulas.mortgage.monthlyInterestOnly(refinanceAmount, refinanceRate * 100);
    const monthlyCashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    const cashOnCash = cashLeftIn > 0 ? formulas.cashflow.cashOnCash(annualCashFlow, cashLeftIn) : Infinity;
    const infiniteReturn = cashLeftIn <= 0 ? 'Yes - all cash out!' : 'No';
    const equityPosition = afterRepairValue - refinanceAmount;

    return {
      totalInvested,
      refinanceAmount,
      equityReleased,
      cashLeftIn,
      grossYield,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash: cashOnCash === Infinity ? 999 : cashOnCash,
      infiniteReturn,
      equityPosition,
    };
  },
  ai: {
    systemPrompt: `You are a UK BRRR strategy expert. Analyse BRRR deals and provide practical insights.
Focus on: cash recycling efficiency, refinance viability, realistic timelines, and risk factors.
Be honest about achievability. Flag concerns clearly.`,
    promptTemplate: `BRRR analysis:
- Purchase: £{{purchasePrice}}, Refurb: £{{refurbCost}}
- ARV: £{{afterRepairValue}}, Rent: £{{monthlyRent}}/month
- Total invested: £{{totalInvested}}
- Refinance at {{refinanceLTV}}% LTV: £{{refinanceAmount}}
- Cash left in: £{{cashLeftIn}} ({{infiniteReturn}})
- Monthly cash flow: £{{monthlyCashFlow}}
- Cash on cash return: {{cashOnCash}}%
- Equity position: £{{equityPosition}}

Assess viability and risks.`,
    analysisAspects: ['viability', 'risk', 'optimisation', 'financing'],
    thresholds: [
      { metric: 'cashLeftIn', operator: '<=', value: 0, severity: 'success', message: 'All cash out - infinite return strategy achieved!' },
      { metric: 'cashOnCash', operator: '>=', value: 20, severity: 'success', message: 'Excellent cash-on-cash return' },
      { metric: 'monthlyCashFlow', operator: '<', value: 100, severity: 'warning', message: 'Tight cash flow - consider contingency' },
    ],
  },
  connections: {
    upstream: ['bridging-loan-calculator', 'refurbishment-cost-calculator'],
    downstream: ['rental-yield-calculator', 'dscr-icr-btl-calculator'],
    related: ['bridge-to-let-calculator', 'day1-vs-day180-refinance-calculator'],
  },
});

// ============================================
// VALUATION CALCULATORS
// ============================================

registry.register({
  id: 'rental-yield',
  slug: 'rental-yield-calculator',
  title: 'Rental Yield Calculator',
  shortTitle: 'Rental Yield',
  description: 'Calculate gross and net rental yields for buy-to-let properties.',
  category: 'valuation',
  metaTitle: 'Rental Yield Calculator | BTL Yield Analysis UK',
  metaDescription: 'Free rental yield calculator. Calculate gross and net yields, cash flow, and return on investment for UK buy-to-let properties.',
  keywords: ['rental yield', 'yield calculator', 'btl yield', 'gross yield', 'net yield'],
  status: 'live',
  inputs: [
    { id: 'purchasePrice', label: 'Purchase Price', type: 'currency', required: true, defaultValue: 200000 },
    { id: 'monthlyRent', label: 'Monthly Rent', type: 'currency', required: true, defaultValue: 950 },
    { id: 'purchaseCosts', label: 'Purchase Costs', type: 'currency', defaultValue: 8000, hint: 'SDLT, legal, survey' },
    { id: 'annualExpenses', label: 'Annual Running Costs', type: 'currency', defaultValue: 2000, hint: 'Insurance, maintenance, management' },
    { id: 'voidWeeks', label: 'Expected Void (weeks/year)', type: 'number', defaultValue: 2 },
  ],
  outputs: [
    { id: 'annualRent', label: 'Annual Rent', format: 'currency' },
    { id: 'grossYield', label: 'Gross Yield', format: 'percentage', isPrimary: true, variant: (v) => variantRules.yield(Number(v)) },
    { id: 'netYield', label: 'Net Yield', format: 'percentage', variant: (v) => variantRules.yield(Number(v)) },
    { id: 'totalInvestment', label: 'Total Investment', format: 'currency' },
    { id: 'effectiveRent', label: 'Effective Rent (after voids)', format: 'currency' },
    { id: 'netOperatingIncome', label: 'Net Operating Income', format: 'currency' },
  ],
  calculate: (inputs) => {
    const purchasePrice = Number(inputs.purchasePrice);
    const monthlyRent = Number(inputs.monthlyRent);
    const purchaseCosts = Number(inputs.purchaseCosts);
    const annualExpenses = Number(inputs.annualExpenses);
    const voidWeeks = Number(inputs.voidWeeks);

    const annualRent = monthlyRent * 12;
    const totalInvestment = purchasePrice + purchaseCosts;
    const voidCost = (monthlyRent / 4.33) * voidWeeks;
    const effectiveRent = annualRent - voidCost;
    const netOperatingIncome = effectiveRent - annualExpenses;

    const grossYield = formulas.yields.gross(annualRent, purchasePrice);
    const netYield = formulas.yields.net(annualRent, annualExpenses + voidCost, totalInvestment);

    return {
      annualRent,
      grossYield,
      netYield,
      totalInvestment,
      effectiveRent,
      netOperatingIncome,
    };
  },
  ai: {
    systemPrompt: 'You are a UK property yield analyst. Provide practical insights on rental yields.',
    promptTemplate: `Yield analysis for £{{purchasePrice}} property:
- Rent: £{{monthlyRent}}/month (£{{annualRent}}/year)
- Gross yield: {{grossYield}}%
- Net yield: {{netYield}}%
- NOI: £{{netOperatingIncome}}

Compare to market and assess.`,
    analysisAspects: ['comparison', 'optimisation'],
    thresholds: [
      { metric: 'grossYield', operator: '>=', value: 7, severity: 'success', message: 'Above average gross yield' },
      { metric: 'grossYield', operator: '<', value: 5, severity: 'warning', message: 'Below average yield for BTL' },
    ],
  },
  connections: {
    upstream: [],
    downstream: ['dscr-icr-btl-calculator', 'section-24-tax-impact-calculator'],
    related: ['true-net-yield-calculator', 'cap-rate-calculator'],
  },
});

// ============================================
// TAX CALCULATORS
// ============================================

registry.register({
  id: 'section-24-tax',
  slug: 'section-24-tax-impact-calculator',
  title: 'Section 24 Tax Impact Calculator',
  shortTitle: 'Section 24',
  description: 'Calculate how Section 24 mortgage interest restrictions affect your rental profits.',
  category: 'portfolio',
  metaTitle: 'Section 24 Calculator | Landlord Mortgage Interest Tax Impact',
  metaDescription: 'Free Section 24 calculator. See how mortgage interest restrictions affect your rental profits as a higher-rate taxpayer landlord.',
  keywords: ['section 24', 'mortgage interest relief', 'landlord tax', 'section 24 calculator', 'rental tax'],
  status: 'live',
  inputs: [
    { id: 'annualRent', label: 'Annual Rental Income', type: 'currency', required: true, defaultValue: 24000 },
    { id: 'mortgageInterest', label: 'Annual Mortgage Interest', type: 'currency', required: true, defaultValue: 12000 },
    { id: 'otherExpenses', label: 'Other Allowable Expenses', type: 'currency', defaultValue: 3000 },
    { id: 'otherIncome', label: 'Other Taxable Income', type: 'currency', defaultValue: 60000, hint: 'Salary, dividends, etc.' },
    { id: 'taxBand', label: 'Tax Band', type: 'select', defaultValue: 'higher', options: [
      { value: 'basic', label: 'Basic Rate (20%)' },
      { value: 'higher', label: 'Higher Rate (40%)' },
      { value: 'additional', label: 'Additional Rate (45%)' },
    ]},
  ],
  outputs: [
    { id: 'rentalProfit', label: 'Rental Profit (no interest)', format: 'currency' },
    { id: 'oldSystemProfit', label: 'Old System Taxable Profit', format: 'currency' },
    { id: 'oldSystemTax', label: 'Old System Tax', format: 'currency' },
    { id: 'newSystemTax', label: 'New System Tax (Section 24)', format: 'currency' },
    { id: 'additionalTax', label: 'Additional Tax Due', format: 'currency', isPrimary: true },
    { id: 'effectiveRate', label: 'Effective Tax Rate', format: 'percentage' },
    { id: 'netRentalIncome', label: 'Net Rental Income (after tax)', format: 'currency' },
  ],
  calculate: (inputs) => {
    const annualRent = Number(inputs.annualRent);
    const mortgageInterest = Number(inputs.mortgageInterest);
    const otherExpenses = Number(inputs.otherExpenses);
    const taxBand = String(inputs.taxBand);

    const taxRates: Record<string, number> = { basic: 0.2, higher: 0.4, additional: 0.45 };
    const marginalRate = taxRates[taxBand];

    const result = formulas.ukTax.section24Impact(annualRent, mortgageInterest, otherExpenses, marginalRate);

    const rentalProfit = annualRent - otherExpenses;
    const oldSystemProfit = annualRent - mortgageInterest - otherExpenses;
    const effectiveRate = rentalProfit > 0 ? (result.newTax / rentalProfit) * 100 : 0;
    const netRentalIncome = rentalProfit - result.newTax;

    return {
      rentalProfit,
      oldSystemProfit,
      oldSystemTax: result.oldTax,
      newSystemTax: result.newTax,
      additionalTax: result.additionalTax,
      effectiveRate,
      netRentalIncome,
    };
  },
  ai: {
    systemPrompt: `You are a UK property tax specialist. Analyse Section 24 impact and provide practical mitigation strategies.
Focus on: tax impact quantification, incorporation considerations, portfolio restructuring options.
Be clear about the numbers. Suggest professional advice where appropriate.`,
    promptTemplate: `Section 24 analysis:
- Rental income: £{{annualRent}}/year
- Mortgage interest: £{{mortgageInterest}}/year
- Other expenses: £{{otherExpenses}}/year
- Tax band: {{taxBand}}

Old system tax: £{{oldSystemTax}}
New system tax: £{{newSystemTax}}
Additional tax: £{{additionalTax}}
Effective rate: {{effectiveRate}}%
Net rental income: £{{netRentalIncome}}

Assess impact and suggest mitigations.`,
    analysisAspects: ['tax', 'optimisation', 'next_steps'],
    thresholds: [
      { metric: 'additionalTax', operator: '>', value: 2000, severity: 'warning', message: 'Significant Section 24 impact - consider incorporation' },
      { metric: 'effectiveRate', operator: '>', value: 40, severity: 'warning', message: 'High effective tax rate on rental profits' },
    ],
  },
  connections: {
    upstream: ['rental-yield-calculator', 'dscr-icr-btl-calculator'],
    downstream: ['incorporation-vs-personal-tax-calculator'],
    related: ['cgt-calculator', 'portfolio-stress-test-calculator'],
  },
});

// ============================================
// EXPORT REGISTRY
// ============================================

export default registry;
export { registry as calculatorRegistry };
