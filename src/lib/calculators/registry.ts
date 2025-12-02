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
  content: {
    overview: `The HMO Viability Calculator helps property investors assess whether a property is suitable for conversion to a House in Multiple Occupation (HMO). An HMO is a property rented out by at least 3 people who are not from one 'household' but share facilities like the bathroom and kitchen. This calculator analyses the key financial metrics including gross and net yields, cash flow projections, and return on investment to help you make an informed decision before committing to an HMO investment.`,

    methodology: `This calculator uses industry-standard property investment formulas to assess HMO viability:

**Gross Yield** = (Annual Rent ÷ Total Investment) × 100
This gives you the headline return before any costs are deducted.

**Net Yield** = ((Annual Rent - Operating Costs) ÷ Total Investment) × 100
A more realistic measure that accounts for running costs including council tax, utilities, insurance, and management fees.

**Cash on Cash Return** = (Annual Cash Flow ÷ Cash Invested) × 100
This shows the return on your actual cash invested, accounting for mortgage leverage.

**Net Operating Income (NOI)** = Effective Rent - All Operating Costs
The income remaining after all operating costs but before mortgage payments.

The calculator automatically applies a void allowance to account for periods when rooms are empty, and includes a 5% maintenance reserve as standard.`,

    assumptions: [
      'Interest-only mortgage calculation is used (standard for HMO investment)',
      'A 5% maintenance reserve is automatically included in running costs',
      'Void allowance applies equally across all rooms',
      'Council tax is paid by the landlord (standard for HMO)',
      'All bills inclusive model is assumed (landlord pays utilities)',
      'Management fees are calculated on gross rent',
      'No allowance for furniture replacement is included',
      'Stamp duty and legal fees are not included in the investment total',
    ],

    useCases: [
      'Evaluating a potential HMO purchase before making an offer',
      'Comparing different HMO opportunities in your target area',
      'Understanding how room rent changes affect overall returns',
      'Assessing the impact of refurbishment costs on profitability',
      'Calculating how much cash you need to complete the purchase',
      'Stress-testing the investment against interest rate increases',
      'Presenting investment cases to joint venture partners',
      'Determining maximum purchase price for target yield',
    ],

    faqs: [
      {
        question: 'What is a good gross yield for an HMO?',
        answer: 'A good gross yield for an HMO is typically 12-15% or higher. Anything below 10% is generally considered marginal and may not provide sufficient buffer against void periods, maintenance issues, or interest rate increases. Remember that gross yield doesn\'t account for the higher running costs associated with HMOs.',
      },
      {
        question: 'How does HMO cash flow compare to standard BTL?',
        answer: 'HMOs typically generate 2-3x the cash flow of standard BTLs on a like-for-like property, but they also come with higher running costs and more intensive management. While a BTL might achieve 5-7% gross yield, HMOs often achieve 12-18%. However, HMOs require more capital (licensing, fire safety upgrades) and ongoing attention.',
      },
      {
        question: 'What costs should I include in my HMO budget?',
        answer: 'Beyond mortgage, council tax, and insurance, HMO costs include: all utilities (gas, electric, water, broadband), cleaning of communal areas, garden maintenance, fire safety system maintenance, furniture replacement, licensing fees (amortised), and higher maintenance reserves. Budget 40-50% of gross rent for total costs.',
      },
      {
        question: 'Do I need planning permission for an HMO?',
        answer: 'You may need planning permission depending on your local authority. Many councils have introduced Article 4 directions that remove permitted development rights for HMO conversion. Check with your local planning authority before purchasing. Additionally, properties with 7 or more tenants always require planning permission as they\'re classified as Sui Generis.',
      },
      {
        question: 'What is the minimum room size for HMO?',
        answer: 'Under UK regulations, the minimum room size for one person is 6.51 sqm (70 sq ft), and for two people sharing is 10.22 sqm (110 sq ft). Many councils impose larger minimums in their licensing conditions. Rooms below these sizes cannot be let as sleeping accommodation.',
      },
    ],

    disclaimer: 'This calculator provides estimates for educational purposes only. Actual returns will vary based on local market conditions, property specifics, and your personal circumstances. Always conduct thorough due diligence and seek professional advice before making investment decisions. HMO regulations vary by local authority.',
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
  content: {
    overview: `The HMO Licensing Fee Calculator helps landlords and property investors estimate the cost of obtaining an HMO licence from their local authority. In England and Wales, certain Houses in Multiple Occupation (HMOs) require mandatory licensing, while many councils also operate additional or selective licensing schemes. Understanding these costs upfront is essential for accurate investment appraisals and cash flow planning.`,

    methodology: `This calculator estimates HMO licensing fees based on three key factors:

**Base Fee Structure**
Councils typically charge a base fee plus an additional amount per bedroom or habitable room. We've categorised councils into three fee levels:
- Low (rural/smaller councils): £400-700 base
- Medium (most councils): £700-1,200 base
- High (London/major cities): £1,200-1,800 base

**Per-Bedroom Charges**
Most councils add £30-80 per bedroom on top of the base fee. Larger HMOs incur higher total fees.

**Renewal Discounts**
Many councils offer a 10-25% discount for licence renewals, particularly for landlords with good compliance records. We apply a standard 20% renewal discount.

The calculator amortises the licence fee over the licence period to show the true annual and per-room cost impact on your investment.`,

    assumptions: [
      'Fee estimates are based on typical UK council ranges - actual fees vary significantly by local authority',
      'Renewal discount of 20% is applied - some councils offer more, others less',
      'Standard 5-year licence period is most common but some councils issue 1 or 3-year licences',
      'Fees shown do not include potential additional charges for inspections or compliance issues',
      'DBS/criminal record check costs for licence holders are not included',
      'Fire risk assessment and safety certificate costs are separate from licensing fees',
    ],

    useCases: [
      'Estimating upfront costs before purchasing an HMO',
      'Comparing licensing costs across different councils when sourcing deals',
      'Including accurate licensing costs in HMO viability calculations',
      'Budgeting for licence renewal costs',
      'Understanding the per-room impact on rental yields',
      'Comparing costs between different property sizes',
    ],

    faqs: [
      {
        question: 'Do all HMOs need a licence?',
        answer: 'Not all HMOs require licensing. Mandatory licensing applies to HMOs with 5 or more occupants forming 2 or more households. However, many councils operate additional licensing schemes that cover smaller HMOs. Always check with your local authority as schemes vary significantly by area.',
      },
      {
        question: 'What happens if I operate without a licence?',
        answer: 'Operating an unlicensed HMO when one is required is a criminal offence. Penalties include unlimited fines, Rent Repayment Orders (tenants can reclaim up to 12 months rent), and civil penalties up to £30,000. Some councils are actively pursuing unlicensed landlords.',
      },
      {
        question: 'How long does an HMO licence last?',
        answer: 'HMO licences are typically issued for 5 years, though some councils issue shorter 1-3 year licences, particularly for first-time applicants or those with compliance concerns. You must apply for renewal before the licence expires to avoid operating unlicensed.',
      },
      {
        question: 'Can my HMO licence application be refused?',
        answer: 'Yes. Councils can refuse applications if the property is unsuitable for the number of occupants, if required safety standards are not met, or if the proposed licence holder or manager is not a "fit and proper person". Common issues include fire safety deficiencies and inadequate facilities.',
      },
      {
        question: 'What conditions are attached to an HMO licence?',
        answer: 'Licence conditions typically cover: maximum occupancy numbers, minimum room sizes, fire safety requirements (alarms, doors, escape routes), kitchen and bathroom facilities, waste management, and property management standards. Breach of conditions can lead to prosecution or licence revocation.',
      },
    ],

    disclaimer: 'Licensing fees vary significantly between local authorities and change periodically. Always verify current fees with your specific council before making investment decisions. This calculator provides estimates only.',
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
  content: {
    overview: `The Development Appraisal Calculator is the essential tool for property developers assessing the viability of new-build projects. Whether you're building a single house, a small development of flats, or a larger residential scheme, this calculator helps you understand whether your project will generate acceptable returns after accounting for all costs including land, construction, professional fees, finance, and sales expenses.

A robust development appraisal is the foundation of every successful property development. It's what developers present to lenders, investors, and joint venture partners to demonstrate project viability. Getting this right at the outset helps you avoid costly mistakes and ensure your development delivers the returns you need.`,

    methodology: `This calculator uses the residual valuation method, the industry-standard approach for assessing development viability:

**Gross Development Value (GDV)**
GDV = Number of Units × Average Unit Size (sqft) × Sale Price per sqft
This is the total expected sales revenue from the completed development.

**Build Costs**
Total Build Cost = Total sqft × Build Cost per sqft
We then add professional fees (architects, engineers, project managers) and a contingency allowance.

**Development Finance**
Finance is calculated using compound interest with:
- Land fully drawn from day one for the entire project duration
- Build costs drawn at 50% average (phased drawdown)
- Interest compounds monthly at the specified annual rate

**Profit Analysis**
- Profit = GDV - Total Costs
- Profit on Cost = (Profit ÷ Total Costs) × 100
- Profit on GDV = (Profit ÷ GDV) × 100

Most lenders require 20% profit on cost as a minimum for development finance.`,

    assumptions: [
      'Build costs are all-inclusive (labour, materials, preliminaries, contractor margin)',
      'Professional fees are calculated as a percentage of build costs',
      'Contingency is applied to build costs only',
      'Finance is calculated on an interest-only, compound basis',
      'Land finance runs for the full project duration (build + sale period)',
      'Build finance assumes 50% average drawdown (phased construction)',
      'Sales costs include agent fees, legal costs, and marketing',
      'No allowance for Section 106 or CIL (Community Infrastructure Levy)',
      'No affordable housing contribution is included',
      'VAT is not included (most new-build sales are zero-rated)',
    ],

    useCases: [
      'Initial feasibility assessment when considering a site purchase',
      'Determining maximum land bid using residual valuation',
      'Presenting development proposals to lenders and investors',
      'Comparing different scheme options on the same site',
      'Sensitivity analysis on key variables (build costs, sales values)',
      'Joint venture deal structuring and profit share negotiations',
      'Tracking project viability as costs and values change',
      'Due diligence on development opportunities',
    ],

    faqs: [
      {
        question: 'What profit margin should I target?',
        answer: 'Most development lenders require a minimum 20% profit on cost. However, the appropriate margin depends on project risk. Simple, low-risk projects might work at 15-18%, while complex schemes or those in volatile markets should target 25%+. Remember that margin is your buffer against cost overruns and market changes.',
      },
      {
        question: 'What build cost per sqft should I use?',
        answer: 'UK build costs vary significantly by location, specification, and project type. As of 2024, typical ranges are: basic spec £120-150/sqft, medium spec £150-200/sqft, high spec £200-280/sqft, premium London £280-400+/sqft. Always get quantity surveyor estimates for accurate appraisals.',
      },
      {
        question: 'How does development finance work?',
        answer: 'Development finance typically covers 60-70% of land cost and 100% of build costs (up to 65-70% of GDV total). Interest rates are usually 8-12% annually, charged monthly in arrears. Most facilities are interest-rolled (added to the loan) rather than serviced. You\'ll also pay arrangement fees (1-2%) and exit fees (0.5-1%).',
      },
      {
        question: 'What is "profit on cost" vs "profit on GDV"?',
        answer: 'Profit on cost = Profit ÷ Total Costs - this measures return on money spent. Profit on GDV = Profit ÷ Sales Revenue - this shows profit as a percentage of end values. Lenders typically focus on profit on cost (requiring 20%+), while investors might look at profit on GDV (typically 15-17% on larger schemes).',
      },
      {
        question: 'Should I include contingency?',
        answer: 'Always. Contingency is not a luxury - it\'s essential risk management. Standard contingency is 5-10% of build costs, but complex sites (contamination, listed buildings, difficult ground conditions) may warrant 10-15%. Lenders will insist on contingency and may increase your required margin if it\'s too low.',
      },
    ],

    disclaimer: 'Development appraisals are estimates based on assumptions that will change during the project. Always commission professional quantity surveyor cost estimates, up-to-date valuations, and take independent financial advice before committing to a development. Market conditions can change significantly between appraisal and completion.',
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
  content: {
    overview: `The Bridging Loan Calculator helps property investors and developers understand the true cost of short-term bridging finance. Bridging loans are specialist short-term loans typically used to bridge a gap in funding - whether you're buying at auction, purchasing before selling, funding refurbishment, or moving quickly on an opportunity where traditional mortgage finance is too slow.

Understanding the full cost of bridging is critical because these loans are expensive. With monthly interest rates typically 0.75-1.2% (9-15% annually), plus arrangement and exit fees, bridging can significantly impact deal profitability. This calculator shows you the total cost, effective annual rate, day-one net proceeds, and final redemption figure.`,

    methodology: `This calculator analyses bridging loan costs using three interest calculation methods:

**Retained Interest**
Interest for the full term is deducted from the loan upfront and held by the lender. You receive less cash on day one, but your redemption figure equals the original loan amount plus exit fee. This is the most common arrangement.

**Rolled-Up Interest**
No interest is deducted upfront - you receive the full loan amount. However, interest compounds monthly and is added to your loan balance, increasing your redemption figure. This maximises day-one cash but costs more overall.

**Serviced Interest**
You pay interest monthly throughout the term. This keeps costs down but requires monthly cash flow. Less common for property bridging.

**Key Calculations**
- LTV = Loan Amount ÷ Property Value × 100
- Total Interest (retained) = Loan × Monthly Rate × Term
- Total Interest (rolled) = Loan × ((1 + Monthly Rate)^Term - 1)
- Day-1 Net = Loan - Retained Interest - Arrangement Fee - Valuation - Legal
- Redemption = Loan + Rolled Interest + Exit Fee`,

    assumptions: [
      'Monthly interest rate is applied consistently throughout the term',
      'Arrangement fee is calculated on gross loan amount and deducted at drawdown',
      'Exit fee is calculated on gross loan amount and added to redemption figure',
      'Valuation and legal fees are deducted from day-one proceeds',
      'For rolled interest, compounding is monthly',
      'No early repayment penalties are modelled (though many bridges have minimum interest periods)',
      'Broker fees are not included - typically add 1-2% to costs',
      'Extension fees are not included if the term overruns',
    ],

    useCases: [
      'Calculating true cost of bridging for auction purchases',
      'Comparing retained vs rolled interest options',
      'Understanding day-one cash available for a deal',
      'Calculating redemption figure for exit planning',
      'Comparing different bridging offers and lenders',
      'Inputting accurate finance costs into development appraisals',
      'Planning BRRR strategy refinance timing',
      'Stress-testing deal viability at different rates',
    ],

    faqs: [
      {
        question: 'What LTV can I get on a bridging loan?',
        answer: 'Maximum LTV varies by lender and property type. Standard residential is typically 70-75% LTV. Refurbishment bridges might offer 65-70% of current value plus 100% of works. Development bridges work on GDV (60-65% of end value). Some lenders offer higher LTV at premium rates or with additional security.',
      },
      {
        question: 'What is the difference between retained and rolled interest?',
        answer: 'Retained interest is deducted upfront - you receive less cash but your redemption amount is fixed at the loan amount plus exit fee. Rolled interest gives you the full loan upfront, but interest compounds monthly and adds to your debt. Rolled is more expensive but maximises day-one cash. Choose based on whether you need maximum funds or minimum total cost.',
      },
      {
        question: 'How quickly can bridging complete?',
        answer: 'Bridging can complete in 5-10 working days for straightforward cases with desktop valuations. Standard completion is 2-3 weeks with physical valuation. Complex cases (development, HMO, commercial) may take 3-4 weeks. Auction purchases typically complete within the 28-day deadline if you instruct immediately.',
      },
      {
        question: 'What are typical bridging rates in the UK?',
        answer: 'As of 2024, prime bridging rates start from 0.55-0.65% monthly for low LTV, clean deals. Standard rates are 0.75-0.95% monthly. Higher LTV, non-standard properties, or complicated situations might see 1.0-1.5% monthly. Always consider the full cost including fees, not just the headline rate.',
      },
      {
        question: 'What happens if I cannot repay the bridging loan on time?',
        answer: 'Most bridging loans allow extensions, but you\'ll pay extension fees (typically 1-2%) and continued interest at the same or higher rate. If you cannot repay or extend, the lender can enforce their security and repossess the property. Always have a clear, realistic exit strategy before taking bridging finance.',
      },
    ],

    disclaimer: 'Bridging loan costs vary significantly between lenders. This calculator provides estimates based on typical market terms. Always obtain formal quotes and read loan documentation carefully. Bridging loans are secured against property - your property may be repossessed if you do not keep up repayments.',
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
  content: {
    overview: `The DSCR/ICR Calculator helps buy-to-let investors understand whether their rental property will pass lender affordability tests. Since 2017, the Prudential Regulation Authority (PRA) has required lenders to stress test BTL mortgages using Interest Coverage Ratios (ICR), making this calculation essential for anyone seeking BTL finance.

Understanding your ICR before applying for a mortgage can save time and help you structure deals appropriately. This calculator shows both the current ICR at your actual rate and the stressed ICR at the lender's test rate, along with the maximum loan amount you can achieve at required coverage levels.`,

    methodology: `This calculator uses standard UK lender affordability testing methodology:

**Interest Coverage Ratio (ICR)**
ICR = (Annual Rent ÷ Annual Interest Cost) × 100

For example, if rent is £12,000/year and interest is £8,000/year:
ICR = (12,000 ÷ 8,000) × 100 = 150%

**Stress Testing**
Lenders calculate ICR at a "stress rate" (typically 5.5% or their reversionary rate) rather than your actual mortgage rate. This ensures the property remains viable if rates increase.

**ICR Requirements**
- Basic rate taxpayers: 125% ICR minimum
- Higher/additional rate taxpayers: 145% ICR minimum
- Some specialist lenders: 110-140% depending on criteria

**Maximum Loan Calculation**
Max Loan = (Annual Rent ÷ Required ICR) × 100 ÷ Stress Rate

This tells you the maximum mortgage you can obtain based on the rental income.`,

    assumptions: [
      'Interest-only mortgage calculation (standard for BTL)',
      'Stress rate of 5.5% used (current PRA guideline)',
      'ICR requirement based on landlord\'s tax band',
      'No allowance for letting agent fees in rental income',
      'No rental voids factored into the calculation',
      'Property is a standard AST residential let',
      'No top-slicing from other income considered',
      'Single property calculation (portfolio rates may differ)',
    ],

    useCases: [
      'Checking if a property will pass mortgage affordability tests',
      'Calculating maximum borrowing for a target property',
      'Understanding how rent increases affect borrowing capacity',
      'Comparing different purchase prices and loan amounts',
      'Planning portfolio expansion with ICR constraints',
      'Stress testing existing mortgages against rate rises',
      'Determining minimum rent required for target LTV',
      'Preparing for mortgage applications and discussions with brokers',
    ],

    faqs: [
      {
        question: 'Why do higher-rate taxpayers need 145% ICR?',
        answer: 'Since Section 24 phased in, mortgage interest is no longer fully deductible for higher-rate taxpayers. Instead, you get a 20% tax credit. This effectively increases your tax burden, meaning you need more rental income to cover costs. Lenders require 145% ICR to ensure you can still afford the mortgage after Section 24 tax impact.',
      },
      {
        question: 'What is the current stress test rate?',
        answer: 'The PRA guideline suggests using the higher of: the lender\'s reversionary rate plus 2%, or a minimum floor (historically 5.5%). In practice, most lenders use 5.5%, though this can vary. Some lenders now "pay rate" (use your actual rate) for 5-year fixed deals, making affordability easier.',
      },
      {
        question: 'Can I get a BTL mortgage if I fail the stress test?',
        answer: 'Yes, several options exist. Some lenders accept "top-slicing" - using your other income to cover shortfalls. Limited company BTL mortgages sometimes have different criteria. Some lenders use lower ICR requirements (110-125%) for portfolio landlords. Finally, you might get a longer fixed rate where lenders use pay-rate testing.',
      },
      {
        question: 'What is the difference between ICR and DSCR?',
        answer: 'ICR (Interest Coverage Ratio) measures rent against interest-only payments. DSCR (Debt Service Coverage Ratio) measures rent against full mortgage payments including principal. UK BTL lenders typically use ICR since most BTL mortgages are interest-only. DSCR is more common in commercial property lending.',
      },
      {
        question: 'How can I improve my ICR?',
        answer: 'Options include: increasing rent (market review), reducing loan amount (larger deposit), choosing a lender with lower ICR requirements, using limited company structure, applying for a 5-year fix with pay-rate testing, or demonstrating other income for top-slicing. Speak with a specialist BTL broker about your options.',
      },
    ],

    disclaimer: 'Lender criteria vary significantly. This calculator provides estimates based on typical requirements. Always speak with a mortgage broker to understand your specific options. Mortgage lending is subject to status and property valuation.',
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
  content: {
    overview: `The Lease Extension Calculator helps leaseholders estimate the cost of extending their lease under the Leasehold Reform, Housing and Urban Development Act 1993. If you own a flat with a lease under 90 years, extending your lease is one of the most important financial decisions you can make - as leases shorten, property values fall and mortgages become harder to obtain.

This calculator uses the statutory valuation methodology to estimate your lease extension premium, including the crucial "marriage value" that applies when leases fall below 80 years. Understanding these costs helps you plan financially and negotiate effectively with your freeholder.`,

    methodology: `This calculator uses the three-component statutory valuation method:

**1. Capitalised Ground Rent**
The present value of the ground rent the freeholder will lose for the remaining lease term. Calculated by discounting future ground rent payments at a deferment rate (typically 5-6%).

Ground Rent PV = Σ (Ground Rent ÷ (1 + rate)^n) for each year

**2. Reversion Value**
The present value of the freeholder's right to get the property back at the end of the lease. This is the freehold value, deferred for the remaining years:

Reversion = Freehold Value × (1 ÷ (1 + deferment rate)^years remaining)

**3. Marriage Value (if under 80 years)**
When a lease is extended, value is "released" - the difference between extended value and current value. The freeholder is entitled to 50% of this marriage value:

Marriage Value = 50% × (Extended Value - Current Value - Premium)

**Relativity**
Relativity tables (Savills, Gerald Eve, RICS) estimate how a lease's value relates to freehold value based on years remaining. We use a smoothed relativity curve.`,

    assumptions: [
      'Deferment rate of 5% used (Sportelli decision standard for Prime Central London; 5.75% elsewhere)',
      'Relativity based on averaged graphs from major RICS-approved sources',
      'Extension adds 90 years to current lease and reduces ground rent to peppercorn',
      'Property is a qualifying flat under the 1993 Act',
      'No hope value is included (contentious in some valuations)',
      'Ground rent reviews (if applicable) are simplified',
      'No allowance for improvements made by leaseholder',
      'Freeholder\'s legal and valuation costs are separate (typically £1,500-3,000)',
    ],

    useCases: [
      'Estimating lease extension costs before purchasing a flat',
      'Planning finances for an upcoming lease extension',
      'Understanding the "80-year cliff edge" and marriage value impact',
      'Comparing informal deal offers from freeholders',
      'Deciding whether to extend now or wait',
      'Calculating value uplift to assess return on investment',
      'Preparing for negotiations with freeholders',
      'Due diligence on leasehold investment properties',
    ],

    faqs: [
      {
        question: 'What is the 80-year rule and why does it matter?',
        answer: 'When a lease falls below 80 years, "marriage value" kicks in. This is 50% of the value released by extending, and it\'s paid to the freeholder. As leases approach 80 years, premiums increase sharply. For example, extending from 85 years might cost £15,000, but from 75 years could cost £40,000+. This "cliff edge" makes extending before 80 years financially critical.',
      },
      {
        question: 'Can I sell a flat with a short lease?',
        answer: 'Yes, but it becomes increasingly difficult. Most mortgage lenders require 70-85+ years remaining at the end of the mortgage term. A 60-year lease is effectively unmortgageable. Short leases also deter cash buyers who know extension costs. Properties with under 80 years typically sell at significant discounts.',
      },
      {
        question: 'How do I actually extend my lease?',
        answer: 'You must have owned the flat for at least 2 years. Serve a Section 42 notice on the freeholder with your proposed premium. They must respond within 2 months with a counter-proposal. If you cannot agree, either party can apply to the First-tier Tribunal for determination. The process typically takes 6-12 months.',
      },
      {
        question: 'What about the Leasehold Reform Bill?',
        answer: 'The Leasehold and Freehold Reform Act 2024 promises significant changes: abolishing marriage value (huge savings for sub-80-year leases), capping ground rents, and potentially standardising premium calculations. However, implementation dates remain unclear, and the financial impact of waiting versus extending now requires careful analysis.',
      },
      {
        question: 'Is it worth extending my lease?',
        answer: 'Almost always yes, if you plan to keep the property for several years or sell within the next decade. The value uplift from extension typically exceeds the premium paid, meaning positive ROI. The longer you wait, the more expensive it becomes. Extending also eliminates ground rent and makes the property more mortgageable and saleable.',
      },
    ],

    disclaimer: 'Lease extension valuations are complex and this calculator provides estimates only. Premiums depend on specific property characteristics, local markets, and tribunal interpretations. Always obtain a formal valuation from a qualified RICS surveyor before proceeding. Legal advice is essential for the statutory process.',
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
  content: {
    overview: `The BRRR Calculator is essential for property investors using the Buy-Refurb-Refinance-Rent strategy. BRRR allows investors to recycle capital by purchasing undervalued properties, adding value through refurbishment, refinancing at the new higher value, and then renting for ongoing income - ideally with all or most of their original cash returned.

This calculator helps you assess whether a potential BRRR deal works financially. It calculates how much cash you can recover through refinancing, your ongoing cash flow, and whether you can achieve the holy grail of BRRR - an "infinite return" where all your original capital is returned while you retain ownership and rental income.`,

    methodology: `This calculator models the complete BRRR cycle:

**Phase 1: Acquisition & Refurb**
- Total Cash Invested = Purchase Price + Refurb Cost + Purchase Costs + Bridging Costs
- Bridging is modelled at 50% average drawdown for refurb (phased spending)
- Includes arrangement fees (2%) and monthly interest

**Phase 2: Refinance**
- Refinance Amount = After Repair Value (ARV) × Refinance LTV
- Equity Released = Refinance Amount (pays off bridge)
- Cash Left in Deal = Total Invested - Equity Released

**Phase 3: Rent**
- Gross Yield = (Annual Rent ÷ ARV) × 100
- Monthly Cash Flow = Rent - Mortgage Payment - Expenses
- Cash on Cash Return = (Annual Cash Flow ÷ Cash Left In) × 100

**Infinite Return Test**
If Cash Left in Deal ≤ 0, you've achieved an infinite return - all capital recycled with ongoing income.`,

    assumptions: [
      'Bridging finance used during refurbishment phase',
      'Bridging fees at 2% arrangement (deducted from analysis)',
      'Refurbishment costs drawn at 50% average over the bridge term',
      'Refinance is on interest-only BTL mortgage',
      'Refinance completes immediately after refurb (no delay)',
      'ARV valuation is achieved (surveyors can be conservative)',
      'No SDLT refund for uninhabitable property is modelled',
      'Void period between refurb and tenancy not included',
    ],

    useCases: [
      'Evaluating potential BRRR deals before purchase',
      'Calculating maximum purchase price for target cash return',
      'Understanding how much refurb budget you can allocate',
      'Stress testing deals against lower ARV valuations',
      'Comparing multiple BRRR opportunities',
      'Presenting deal analysis to JV partners',
      'Planning capital recycling across multiple projects',
      'Understanding breakeven refurb spend for full cash return',
    ],

    faqs: [
      {
        question: 'What makes a good BRRR deal?',
        answer: 'The ideal BRRR deal has: purchase price 20-25% below ARV, scope for meaningful value-add through refurbishment, strong rental demand for quick let-up, and an ARV that supports 75% LTV refinance covering all costs. Target properties that are cosmetically tired but structurally sound - avoid major works unless you\'re experienced.',
      },
      {
        question: 'What if I cannot get all my money back?',
        answer: 'Not every BRRR achieves full cash recycling. Even leaving some money in can deliver excellent returns. If you invest £40,000 total and leave £10,000 in but receive £200/month cash flow, that\'s still 24% annual return on cash employed. The key is whether the return justifies the capital deployment.',
      },
      {
        question: 'How long should a BRRR project take?',
        answer: 'Typical timeline: 1-3 months to find and purchase, 2-4 months for refurbishment, 1-2 months to refinance and let. Total 4-9 months from first viewing to cash returned. Experienced investors might complete 2-3 BRRR projects per year with the same capital pot.',
      },
      {
        question: 'What are the main risks with BRRR?',
        answer: 'Key risks include: refurb cost overruns eating into margins, ARV valuation coming in lower than expected (surveyors are often conservative), extended refurb timelines increasing bridging costs, difficulty refinancing (ICR stress tests, lender criteria changes), and void periods before letting. Always have contingency.',
      },
      {
        question: 'Should I use bridging or cash for BRRR?',
        answer: 'Using bridging amplifies returns (higher cash-on-cash) but adds costs and complexity. If you have the cash, running costs are lower and refinance pressure is reduced. Many investors prefer 70% bridging to conserve cash for multiple projects. The choice depends on your capital, experience, and risk appetite.',
      },
    ],

    disclaimer: 'BRRR investing involves significant risk including property values falling, refurbishment costs exceeding budgets, and refinancing not being available at expected terms. This calculator provides estimates only. Always conduct thorough due diligence and seek professional advice.',
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
  content: {
    overview: `The Rental Yield Calculator is the fundamental tool for evaluating buy-to-let property investments. Rental yield measures the annual return from rental income as a percentage of the property's value - it's the first metric any property investor should calculate when assessing a potential purchase.

This calculator shows both gross yield (before costs) and net yield (after running costs), giving you a realistic picture of investment returns. Understanding the difference between these metrics is crucial for comparing opportunities and making informed investment decisions.`,

    methodology: `This calculator uses standard property investment yield formulas:

**Gross Yield**
Gross Yield = (Annual Rent ÷ Property Price) × 100

This is the headline figure often quoted by agents and property listings. It doesn't account for any costs.

**Net Yield (more realistic)**
Net Yield = ((Annual Rent - Annual Costs - Void Costs) ÷ Total Investment) × 100

Where:
- Total Investment = Purchase Price + Purchase Costs (SDLT, legal, survey)
- Annual Costs = Insurance, maintenance, management, repairs
- Void Costs = Lost rent during empty periods

**Effective Rent**
Effective Rent = Annual Rent - (Weekly Rent × Void Weeks)

This adjusts for expected void periods when the property is unlet.

**Net Operating Income (NOI)**
NOI = Effective Rent - Operating Expenses

This is the income available to pay mortgages or distribute to investors.`,

    assumptions: [
      'Monthly rent is achieved consistently when the property is occupied',
      'Void periods are evenly distributed throughout the year',
      'Running costs are stable year-on-year',
      'No allowance for rent arrears or non-paying tenants',
      'Mortgage costs are not included (this is a yield, not cash flow calculation)',
      'Property value remains stable (no capital growth or decline modelled)',
      'No major refurbishment or capital expenditure included',
      'Tax implications are not factored in',
    ],

    useCases: [
      'Quickly assessing whether a property meets investment criteria',
      'Comparing multiple properties across different areas',
      'Benchmarking against area averages and investment thresholds',
      'Calculating whether asking price delivers acceptable returns',
      'Determining maximum purchase price for a target yield',
      'Presenting investment cases to partners or lenders',
      'Portfolio analysis and performance tracking',
      'Understanding the impact of rent changes on returns',
    ],

    faqs: [
      {
        question: 'What is a good rental yield in the UK?',
        answer: 'It depends on location and strategy. In the North and Midlands, 7-10% gross yields are common. In the South East and London, 3-5% is typical but capital growth expectations are higher. Most investors target 6%+ gross yield, with 4%+ net yield after costs. HMOs typically achieve 10-15% gross.',
      },
      {
        question: 'Why is net yield more important than gross yield?',
        answer: 'Gross yield ignores all costs and can be misleading. A property with 7% gross yield might only deliver 3% net after accounting for high service charges, insurance, management fees, and void periods. Always calculate net yield for meaningful comparisons between properties.',
      },
      {
        question: 'How do I increase my rental yield?',
        answer: 'Options include: increasing rent (market review), reducing purchase price through negotiation, minimising void periods with quality tenants, reducing management costs (self-management), and adding value through conversion (e.g., to HMO). Focus on optimising all parts of the equation.',
      },
      {
        question: 'Should I prioritise yield or capital growth?',
        answer: 'This depends on your investment strategy. Cash flow investors prioritise yield for immediate income. Capital growth investors accept lower yields in areas with strong appreciation prospects. Many investors seek a balance - reasonable yield (5%+) in areas with good growth potential.',
      },
      {
        question: 'What costs should I include in running expenses?',
        answer: 'Typical BTL costs include: landlord insurance (£200-400/year), maintenance/repairs (typically 5-10% of rent), management fees if using an agent (8-15% of rent), safety certificates (gas, electrical), and a void provision. Leasehold properties add service charges and ground rent.',
      },
    ],

    disclaimer: 'Rental yields are estimates based on current rents and values. Actual returns depend on market conditions, property specifics, and management quality. Past performance is not indicative of future results. Always conduct thorough due diligence.',
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
  content: {
    overview: `The Section 24 Calculator shows how the UK's mortgage interest tax relief restrictions affect landlord profits. Phased in from April 2017 to April 2020, Section 24 of the Finance (No. 2) Act 2015 fundamentally changed how rental income is taxed for individual landlords.

Before Section 24, landlords could deduct mortgage interest as an expense before calculating tax. Now, you're taxed on rental profit without interest deduction, then receive a 20% tax credit. For higher-rate taxpayers, this significantly increases the effective tax rate on rental income - in some cases creating a tax liability even when actual profit is negative.`,

    methodology: `This calculator compares the old and new tax systems:

**Old System (Pre-Section 24)**
- Taxable Profit = Rental Income - Mortgage Interest - Other Expenses
- Tax Due = Taxable Profit × Marginal Tax Rate
- Higher-rate taxpayers paid 40% on profit after interest deduction

**New System (Post-Section 24)**
- Taxable Profit = Rental Income - Other Expenses (interest NOT deductible)
- Gross Tax = Taxable Profit × Marginal Tax Rate
- Tax Credit = Mortgage Interest × 20%
- Final Tax Due = Gross Tax - Tax Credit

**Additional Tax Impact**
Additional Tax = New System Tax - Old System Tax

**Effective Tax Rate**
Effective Rate = (Final Tax Due ÷ True Profit) × 100
Where True Profit = Rental Income - Interest - Expenses

For higher-rate taxpayers, the effective rate can exceed 100% when interest costs are high relative to profit.`,

    assumptions: [
      'All calculations based on 2024/25 tax rates',
      'Landlord is UK tax resident',
      'Properties held in personal name (not limited company)',
      'Mortgage is interest-only (if repayment, only interest portion qualifies)',
      'No other rental losses to offset',
      'Personal allowance already used by other income',
      'No Scottish or Welsh income tax rate variations applied',
      'Interest is on borrowing used to acquire or improve the property',
    ],

    useCases: [
      'Understanding how Section 24 affects your rental portfolio',
      'Calculating the true cost of mortgage interest post-Section 24',
      'Comparing personal ownership vs limited company',
      'Assessing whether to incorporate existing portfolio',
      'Stress testing portfolio against interest rate rises',
      'Planning property purchases with tax efficiency in mind',
      'Presenting tax impact to accountants for verification',
      'Deciding whether to sell, hold, or restructure properties',
    ],

    faqs: [
      {
        question: 'Why does Section 24 affect higher-rate taxpayers more?',
        answer: 'Under the old system, a 40% taxpayer deducted interest before tax, saving 40p per £1 of interest. Now, they pay 40% tax on profit before interest deduction, then get only 20p back per £1 of interest. The 20p difference (per £1 of interest) is the additional tax burden. Basic-rate taxpayers saving 20% and getting 20% back see no change.',
      },
      {
        question: 'Can Section 24 make me pay tax on a loss?',
        answer: 'Yes, in extreme cases. If your rental income minus expenses is positive, but your true profit (after interest) is negative, you\'ll still pay tax on the "paper profit" minus a 20% credit. This can create a tax bill even when you\'re making a cash loss. This typically happens with high LTV mortgages at high interest rates.',
      },
      {
        question: 'Should I transfer properties to a limited company?',
        answer: 'It depends on many factors: current LTV, interest rates, your tax band, future plans, CGT liability on transfer, and SDLT costs. Companies pay corporation tax (25%) but Section 24 doesn\'t apply. However, transferring existing properties triggers CGT and SDLT. For new purchases, company ownership is often more tax-efficient. Seek specialist tax advice.',
      },
      {
        question: 'Does Section 24 apply to HMOs and holiday lets?',
        answer: 'It applies to HMOs let on ASTs. However, Furnished Holiday Lets (FHLs) are currently exempt - they\'re treated as trading income with full interest deductibility. Note: the government has announced FHL tax advantages will be removed from April 2025, bringing them in line with standard BTL.',
      },
      {
        question: 'How can I reduce my Section 24 tax burden?',
        answer: 'Options include: incorporating (for new purchases), paying down mortgages, remortgaging to lower rates, transferring to basic-rate taxpayer spouse, selling high-LTV properties, increasing rents, and offsetting losses from loss-making properties. Each has implications - consult a property tax specialist.',
      },
    ],

    disclaimer: 'Tax rules are complex and individual circumstances vary. This calculator provides estimates for illustration. Section 24 interacts with other tax rules including personal allowance, child benefit, pension contributions, and student loan thresholds. Always consult a qualified accountant or tax advisor for personal advice.',
  },
});

// ============================================
// EXPORT REGISTRY
// ============================================

export default registry;
export { registry as calculatorRegistry };
