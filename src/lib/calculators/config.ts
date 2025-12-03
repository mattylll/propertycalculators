// Centralized Calculator Configuration
// All 66 calculators organized into 10 categories

export type CalculatorCategory =
  | 'development'
  | 'hmo'
  | 'leasehold'
  | 'titlesplit'
  | 'landlord'
  | 'bridging'
  | 'sa'
  | 'commercial'
  | 'refurb'
  | 'niche';

export type CalculatorStatus = 'live' | 'coming-soon';

export type CalculatorConfig = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: CalculatorCategory;
  icon: string;
  color: string;
  href: string;
  status: CalculatorStatus;
  keywords?: string[];
  workflows?: string[];
};

export type CategoryConfig = {
  id: CalculatorCategory;
  name: string;
  description: string;
  color: string;
  icon: string;
  slug: string;
};

export type WorkflowConfig = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  color: string;
};

// ============================================
// CATEGORIES
// ============================================

export const categories: CategoryConfig[] = [
  {
    id: 'development',
    name: 'Development Finance & Exit',
    description: 'Calculate development finance, exit strategies, profit on cost, and residual land values',
    color: '#00C9A7',
    icon: 'Building2',
    slug: 'development',
  },
  {
    id: 'hmo',
    name: 'HMO & Conversion',
    description: 'HMO viability, licensing costs, fire safety, and conversion calculators',
    color: '#3B82F6',
    icon: 'Home',
    slug: 'hmo',
  },
  {
    id: 'leasehold',
    name: 'Leasehold & Title',
    description: 'Lease extensions, marriage value, ground rent, and freeholder calculations',
    color: '#8B5CF6',
    icon: 'FileText',
    slug: 'leasehold',
  },
  {
    id: 'titlesplit',
    name: 'Title Split & Planning Gain',
    description: 'Title splitting, planning gain uplift, airspace development, and subdivision tools',
    color: '#F97316',
    icon: 'Split',
    slug: 'titlesplit',
  },
  {
    id: 'landlord',
    name: 'Buy-to-Let & Portfolio',
    description: 'BTL finance, BRRR, portfolio refinancing, and Section 24 tax calculators',
    color: '#22C55E',
    icon: 'Wallet',
    slug: 'landlord',
  },
  {
    id: 'bridging',
    name: 'Bridging & Specialty Finance',
    description: 'Bridging loans, refurbishment bridges, auction finance, and specialty lending',
    color: '#EF4444',
    icon: 'Zap',
    slug: 'bridging',
  },
  {
    id: 'sa',
    name: 'Serviced Accommodation & Holiday Let',
    description: 'SA profitability, holiday let tax, occupancy rates, and ADR calculators',
    color: '#EC4899',
    icon: 'BedDouble',
    slug: 'sa',
  },
  {
    id: 'commercial',
    name: 'Commercial Property',
    description: 'Commercial yields, ERV, FRI leases, and VAT on commercial property',
    color: '#6366F1',
    icon: 'Building',
    slug: 'commercial',
  },
  {
    id: 'refurb',
    name: 'Refurbishment & Build Costs',
    description: 'Refurb costs, loft conversions, EPC upgrades, and retrofit payback',
    color: '#F59E0B',
    icon: 'Hammer',
    slug: 'refurb',
  },
  {
    id: 'niche',
    name: 'Ultra-Niche Calculators',
    description: 'Specialist calculators for knotweed, cladding, EWS1, party walls, and more',
    color: '#64748B',
    icon: 'Search',
    slug: 'niche',
  },
];

// ============================================
// CALCULATORS - DEVELOPMENT (10)
// ============================================

const developmentCalculators: CalculatorConfig[] = [
  {
    id: 'development-exit',
    slug: 'development-exit-calculator',
    name: 'Development Exit Calculator',
    shortName: 'Dev Exit',
    description: 'Calculate your development exit finance options, including exit bridge and refinance strategies',
    category: 'development',
    icon: 'ArrowRightCircle',
    color: '#00C9A7',
    href: '/development/development-exit-calculator',
    status: 'coming-soon',
    keywords: ['development exit finance', 'exit bridge calculator', 'refinance after development'],
  },
  {
    id: 'development-finance',
    slug: 'development-finance-calculator',
    name: 'Development Finance Calculator',
    shortName: 'Dev Finance',
    description: 'Structure your development finance with senior debt, mezzanine, and equity analysis',
    category: 'development',
    icon: 'Banknote',
    color: '#00C9A7',
    href: '/development/development-finance-calculator',
    status: 'live',
    keywords: ['development finance UK', 'developer loan calculator'],
    workflows: ['full-development'],
  },
  {
    id: 'permitted-development',
    slug: 'permitted-development-calculator',
    name: 'Permitted Development Calculator',
    shortName: 'PD Calculator',
    description: 'Check PD rights for commercial to residential conversions under Class MA and other permitted development routes',
    category: 'development',
    icon: 'FileText',
    color: '#8B5CF6',
    href: '/development/permitted-development-calculator',
    status: 'live',
    keywords: ['permitted development', 'class MA', 'office to residential', 'PD rights', 'prior approval'],
    workflows: [],
  },
  {
    id: 'gdv',
    slug: 'gdv-calculator',
    name: 'GDV Calculator',
    shortName: 'GDV',
    description: 'Estimate Gross Development Value using Land Registry comparables and new-build premiums',
    category: 'development',
    icon: 'TrendingUp',
    color: '#00C9A7',
    href: '/development/gdv-calculator',
    status: 'live',
    keywords: ['GDV calculator UK', 'gross development value', 'property valuation'],
    workflows: ['full-development'],
  },
  {
    id: 'build-cost',
    slug: 'build-cost-calculator',
    name: 'Build Cost Calculator',
    shortName: 'Build Cost',
    description: 'Generate BCIS-aligned cost estimates with regional adjustments and contingencies',
    category: 'development',
    icon: 'Hammer',
    color: '#00C9A7',
    href: '/development/build-cost-calculator',
    status: 'live',
    keywords: ['build cost calculator UK', 'construction cost estimator', 'BCIS calculator'],
    workflows: ['full-development'],
  },
  {
    id: 'profit-on-cost',
    slug: 'profit-on-cost-calculator',
    name: 'Profit on Cost Calculator',
    shortName: 'POC',
    description: 'Calculate developer profit on cost percentage and assess deal viability',
    category: 'development',
    icon: 'Percent',
    color: '#00C9A7',
    href: '/development/profit-on-cost-calculator',
    status: 'live',
    keywords: ['profit on cost UK', 'developer margin calculator'],
  },
  {
    id: 'residual-land-value',
    slug: 'residual-land-value-calculator',
    name: 'Residual Land Value Calculator',
    shortName: 'RLV',
    description: 'Work backwards from GDV to determine maximum land value for your development',
    category: 'development',
    icon: 'Map',
    color: '#00C9A7',
    href: '/development/residual-land-value-calculator',
    status: 'live',
    keywords: ['residual land value', 'land value calculator', 'site value'],
  },
  {
    id: 'stretched-senior',
    slug: 'stretched-senior-calculator',
    name: 'Stretched Senior Calculator',
    shortName: 'Stretched',
    description: 'Model stretched senior finance structures for higher leverage development deals',
    category: 'development',
    icon: 'TrendingUp',
    color: '#00C9A7',
    href: '/development/stretched-senior-calculator',
    status: 'coming-soon',
    keywords: ['stretched senior finance', 'high leverage development'],
  },
  {
    id: 'mezzanine-finance',
    slug: 'mezzanine-finance-calculator',
    name: 'Mezzanine Finance Calculator',
    shortName: 'Mezz',
    description: 'Calculate mezzanine layer costs and total blended rates for development projects',
    category: 'development',
    icon: 'Layers',
    color: '#00C9A7',
    href: '/development/mezzanine-finance-calculator',
    status: 'coming-soon',
    keywords: ['mezzanine finance calculator', 'mezz loan calculator'],
  },
  {
    id: 'equity-waterfall',
    slug: 'equity-waterfall-calculator',
    name: 'Equity Waterfall Calculator',
    shortName: 'Waterfall',
    description: 'Model profit distribution between investors and developers with hurdle rates',
    category: 'development',
    icon: 'GitBranch',
    color: '#00C9A7',
    href: '/development/equity-waterfall-calculator',
    status: 'coming-soon',
    keywords: ['equity waterfall model', 'profit share calculator'],
  },
  {
    id: 'loan-to-cost',
    slug: 'loan-to-cost-calculator',
    name: 'Loan to Cost Calculator',
    shortName: 'LTC',
    description: 'Calculate loan-to-cost ratios and determine borrowing capacity',
    category: 'development',
    icon: 'Calculator',
    color: '#00C9A7',
    href: '/development/loan-to-cost-calculator',
    status: 'coming-soon',
    keywords: ['LTC calculator', 'loan to cost ratio'],
  },
  {
    id: 'cost-to-complete',
    slug: 'cost-to-complete-calculator',
    name: 'Cost to Complete Calculator',
    shortName: 'CTC',
    description: 'Track remaining costs and forecast final project expenditure',
    category: 'development',
    icon: 'CheckSquare',
    color: '#00C9A7',
    href: '/development/cost-to-complete-calculator',
    status: 'coming-soon',
    keywords: ['cost to complete', 'project cost forecast'],
  },
  {
    id: 'cil',
    slug: 'cil-calculator',
    name: 'CIL Calculator',
    shortName: 'CIL',
    description: 'Calculate Community Infrastructure Levy for your development project based on local authority rates and floor area',
    category: 'development',
    icon: 'Building2',
    color: '#00C9A7',
    href: '/development/cil-calculator',
    status: 'live',
    keywords: ['CIL calculator', 'community infrastructure levy', 'CIL rates', 'section 106'],
  },
];

// ============================================
// CALCULATORS - HMO (9)
// ============================================

const hmoCalculators: CalculatorConfig[] = [
  {
    id: 'hmo-viability',
    slug: 'hmo-viability-calculator',
    name: 'HMO Viability Calculator',
    shortName: 'HMO Viability',
    description: 'Assess whether your HMO conversion or purchase will stack financially',
    category: 'hmo',
    icon: 'Home',
    color: '#3B82F6',
    href: '/hmo/hmo-viability-calculator',
    status: 'live',
    keywords: ['HMO viability', 'does HMO stack', 'HMO calculator UK'],
  },
  {
    id: 'hmo-finance',
    slug: 'hmo-finance-calculator',
    name: 'HMO Finance Calculator',
    shortName: 'HMO Finance',
    description: 'Calculate HMO mortgage options and stress test affordability',
    category: 'hmo',
    icon: 'Banknote',
    color: '#3B82F6',
    href: '/hmo/hmo-finance-calculator',
    status: 'live',
    keywords: ['HMO finance calculator UK', 'HMO mortgage calculator'],
  },
  {
    id: 'hmo-gross-rent-multiplier',
    slug: 'hmo-gross-rent-multiplier',
    name: 'HMO Gross Rent Multiplier',
    shortName: 'GRM',
    description: 'Calculate gross rent multiplier to quickly assess HMO value',
    category: 'hmo',
    icon: 'X',
    color: '#3B82F6',
    href: '/hmo/hmo-gross-rent-multiplier',
    status: 'coming-soon',
    keywords: ['HMO GRM', 'gross rent multiplier'],
  },
  {
    id: 'hmo-fire-safety',
    slug: 'hmo-fire-safety-cost-calculator',
    name: 'HMO Fire Safety Cost Calculator',
    shortName: 'Fire Safety',
    description: 'Estimate fire safety compliance costs for your HMO property',
    category: 'hmo',
    icon: 'Flame',
    color: '#3B82F6',
    href: '/hmo/hmo-fire-safety-cost-calculator',
    status: 'live',
    keywords: ['HMO fire safety cost', 'fire door calculator'],
  },
  {
    id: 'hmo-licence-fee',
    slug: 'hmo-licence-fee-calculator',
    name: 'HMO Licence Fee Calculator',
    shortName: 'Licence Fee',
    description: 'Calculate HMO licensing costs by local authority',
    category: 'hmo',
    icon: 'FileCheck',
    color: '#3B82F6',
    href: '/hmo/hmo-licence-fee-calculator',
    status: 'live',
    keywords: ['HMO licensing cost', 'HMO licence fee calculator'],
  },
  {
    id: 'hmo-conversion-cost',
    slug: 'hmo-conversion-cost-calculator',
    name: 'HMO Conversion Cost Calculator',
    shortName: 'Conversion',
    description: 'Estimate costs to convert a property into an HMO',
    category: 'hmo',
    icon: 'Wrench',
    color: '#3B82F6',
    href: '/hmo/hmo-conversion-cost-calculator',
    status: 'coming-soon',
    keywords: ['HMO conversion calculator UK', 'HMO refurb cost'],
  },
  {
    id: 'article-4-hmo',
    slug: 'article-4-hmo-appraisal',
    name: 'Article 4 HMO Appraisal',
    shortName: 'Article 4',
    description: 'Check Article 4 direction status and planning requirements for HMOs',
    category: 'hmo',
    icon: 'AlertTriangle',
    color: '#3B82F6',
    href: '/hmo/article-4-hmo-appraisal',
    status: 'coming-soon',
    keywords: ['Article 4 HMO calculator', 'Article 4 direction checker'],
  },
  {
    id: 'student-hmo-rent',
    slug: 'student-hmo-rent-calculator',
    name: 'Student HMO Rent Calculator',
    shortName: 'Student Rent',
    description: 'Calculate achievable rents for student HMO properties',
    category: 'hmo',
    icon: 'GraduationCap',
    color: '#3B82F6',
    href: '/hmo/student-hmo-rent-calculator',
    status: 'coming-soon',
    keywords: ['student HMO rent', 'university HMO calculator'],
  },
  {
    id: 'minimo-hmo',
    slug: 'minimo-hmo-calculator',
    name: 'Minimo HMO Calculator',
    shortName: 'Minimo',
    description: 'Calculate minimum room sizes and compliance for HMO standards',
    category: 'hmo',
    icon: 'Ruler',
    color: '#3B82F6',
    href: '/hmo/minimo-hmo-calculator',
    status: 'coming-soon',
    keywords: ['HMO minimum room size', 'HMO room size calculator'],
  },
];

// ============================================
// CALCULATORS - LEASEHOLD (7)
// ============================================

const leaseholdCalculators: CalculatorConfig[] = [
  {
    id: 'lease-extension',
    slug: 'lease-extension-calculator',
    name: 'Lease Extension Calculator',
    shortName: 'Lease Ext',
    description: 'Calculate the cost to extend your lease using the statutory formula',
    category: 'leasehold',
    icon: 'FileText',
    color: '#8B5CF6',
    href: '/leasehold/lease-extension-calculator',
    status: 'live',
    keywords: ['lease extension calculator', 'how much to extend lease'],
  },
  {
    id: 'service-charge',
    slug: 'service-charge-calculator',
    name: 'Service Charge Calculator',
    shortName: 'Service Chg',
    description: 'Calculate annual service charges for leasehold properties including management fees, insurance, and maintenance reserves',
    category: 'leasehold',
    icon: 'Receipt',
    color: '#8B5CF6',
    href: '/leasehold/service-charge-calculator',
    status: 'live',
    keywords: ['service charge calculator', 'leasehold service charge', 'flat service charge estimate', 'service charge breakdown'],
  },
  {
    id: 'ground-rent',
    slug: 'ground-rent-calculator',
    name: 'Ground Rent Calculator',
    shortName: 'Ground Rent',
    description: 'Calculate ground rent obligations, escalation costs, and impact on property value for leasehold properties',
    category: 'leasehold',
    icon: 'Coins',
    color: '#8B5CF6',
    href: '/leasehold/ground-rent-calculator',
    status: 'live',
    keywords: ['ground rent calculator', 'leasehold ground rent', 'ground rent escalation', 'ground rent value impact'],
  },
  {
    id: 'marriage-value',
    slug: 'marriage-value-calculator',
    name: 'Marriage Value Calculator',
    shortName: 'Marriage Val',
    description: 'Calculate marriage value component for leases under 80 years',
    category: 'leasehold',
    icon: 'Heart',
    color: '#8B5CF6',
    href: '/leasehold/marriage-value-calculator',
    status: 'live',
    keywords: ['marriage value formula', 'lease extension marriage value'],
  },
  {
    id: 'ground-rent-capitalisation',
    slug: 'ground-rent-capitalisation-calculator',
    name: 'Ground Rent Capitalisation Calculator',
    shortName: 'Ground Rent',
    description: 'Capitalise ground rent to determine freehold value contribution',
    category: 'leasehold',
    icon: 'Coins',
    color: '#8B5CF6',
    href: '/leasehold/ground-rent-capitalisation-calculator',
    status: 'coming-soon',
    keywords: ['ground rent capitalisation rates', 'ground rent calculator'],
  },
  {
    id: 'absent-freeholder',
    slug: 'absent-freeholder-calculator',
    name: 'Absent Freeholder Calculator',
    shortName: 'Absent FH',
    description: 'Calculate premium when freeholder cannot be found',
    category: 'leasehold',
    icon: 'UserX',
    color: '#8B5CF6',
    href: '/leasehold/absent-freeholder-calculator',
    status: 'coming-soon',
    keywords: ['absent freeholder premium', 'missing freeholder calculator'],
  },
  {
    id: 'collective-enfranchisement',
    slug: 'collective-enfranchisement-share-calculator',
    name: 'Collective Enfranchisement Share Calculator',
    shortName: 'Coll Enfran',
    description: 'Calculate each flat\'s share of collective enfranchisement costs',
    category: 'leasehold',
    icon: 'Users',
    color: '#8B5CF6',
    href: '/leasehold/collective-enfranchisement-share-calculator',
    status: 'coming-soon',
    keywords: ['collective enfranchisement', 'freehold share calculator'],
  },
  {
    id: 'short-lease-value-drop',
    slug: 'short-lease-value-drop-calculator',
    name: 'Short Lease Value Drop Calculator',
    shortName: 'Value Drop',
    description: 'See how lease length affects property value',
    category: 'leasehold',
    icon: 'TrendingDown',
    color: '#8B5CF6',
    href: '/leasehold/short-lease-value-drop-calculator',
    status: 'coming-soon',
    keywords: ['short lease value drop', 'lease length value calculator'],
  },
  {
    id: 'peppercorn-ground-rent',
    slug: 'peppercorn-ground-rent-impact-calculator',
    name: 'Peppercorn Ground Rent Impact Calculator',
    shortName: 'Peppercorn',
    description: 'Understand the impact of peppercorn ground rent reforms',
    category: 'leasehold',
    icon: 'Leaf',
    color: '#8B5CF6',
    href: '/leasehold/peppercorn-ground-rent-impact-calculator',
    status: 'coming-soon',
    keywords: ['peppercorn ground rent', 'ground rent reform calculator'],
  },
];

// ============================================
// CALCULATORS - TITLE SPLIT (6)
// ============================================

const titlesplitCalculators: CalculatorConfig[] = [
  {
    id: 'title-split',
    slug: 'title-split-calculator',
    name: 'Title Split Calculator',
    shortName: 'Title Split',
    description: 'Determine if splitting a property title adds value',
    category: 'titlesplit',
    icon: 'Split',
    color: '#F97316',
    href: '/titlesplit/title-split-calculator',
    status: 'live',
    keywords: ['title split calculator', 'can I title split'],
  },
  {
    id: 'title-split-profit',
    slug: 'title-split-profit-calculator',
    name: 'Title Split Profit Calculator',
    shortName: 'Split Profit',
    description: 'Calculate potential profit from title splitting strategy',
    category: 'titlesplit',
    icon: 'PoundSterling',
    color: '#F97316',
    href: '/titlesplit/title-split-profit-calculator',
    status: 'coming-soon',
    keywords: ['title split uplift', 'title split profit'],
  },
  {
    id: 'boundary-change',
    slug: 'title-plan-boundary-change-calculator',
    name: 'Title Plan Boundary Change Calculator',
    shortName: 'Boundary',
    description: 'Calculate costs for Land Registry boundary changes',
    category: 'titlesplit',
    icon: 'Maximize2',
    color: '#F97316',
    href: '/titlesplit/title-plan-boundary-change-calculator',
    status: 'coming-soon',
    keywords: ['boundary change cost', 'Land Registry boundary'],
  },
  {
    id: 'planning-gain-uplift',
    slug: 'planning-gain-uplift-calculator',
    name: 'Planning Gain Uplift Calculator',
    shortName: 'Planning Gain',
    description: 'Calculate value uplift from planning permission',
    category: 'titlesplit',
    icon: 'ArrowUp',
    color: '#F97316',
    href: '/titlesplit/planning-gain-uplift-calculator',
    status: 'coming-soon',
    keywords: ['planning gain calculator', 'planning uplift value'],
  },
  {
    id: 'airspace-development',
    slug: 'airspace-development-calculator',
    name: 'Airspace Development Calculator',
    shortName: 'Airspace',
    description: 'Value airspace rights above existing buildings',
    category: 'titlesplit',
    icon: 'Cloud',
    color: '#F97316',
    href: '/titlesplit/airspace-development-calculator',
    status: 'coming-soon',
    keywords: ['airspace development value', 'rooftop development calculator'],
  },
  {
    id: 'garden-plot',
    slug: 'garden-plot-subdivision-calculator',
    name: 'Garden Plot Subdivision Calculator',
    shortName: 'Garden Plot',
    description: 'Calculate value of subdividing garden for development',
    category: 'titlesplit',
    icon: 'TreePine',
    color: '#F97316',
    href: '/titlesplit/garden-plot-subdivision-calculator',
    status: 'coming-soon',
    keywords: ['garden plot subdivision', 'garden development calculator'],
  },
];

// ============================================
// CALCULATORS - LANDLORD / BTL (7)
// ============================================

const landlordCalculators: CalculatorConfig[] = [
  {
    id: 'buy-to-let',
    slug: 'buy-to-let-calculator',
    name: 'Buy to Let Calculator',
    shortName: 'BTL',
    description: 'Calculate buy-to-let profitability, rental yield, monthly cashflow and ROI for investment properties',
    category: 'landlord',
    icon: 'Home',
    color: '#22C55E',
    href: '/landlord/buy-to-let-calculator',
    status: 'live',
    keywords: ['buy to let calculator', 'BTL investment calculator', 'rental property calculator', 'landlord profit calculator'],
  },
  {
    id: 'stamp-duty',
    slug: 'stamp-duty-calculator',
    name: 'Stamp Duty Calculator',
    shortName: 'SDLT',
    description: 'Calculate Stamp Duty Land Tax for property purchases including additional property surcharge',
    category: 'landlord',
    icon: 'Receipt',
    color: '#22C55E',
    href: '/landlord/stamp-duty-calculator',
    status: 'live',
    keywords: ['stamp duty calculator', 'SDLT calculator', 'stamp duty land tax', 'additional property stamp duty'],
  },
  {
    id: 'btl-dscr',
    slug: 'btl-dscr-calculator',
    name: 'BTL DSCR Calculator',
    shortName: 'DSCR',
    description: 'Calculate Debt Service Coverage Ratio for buy-to-let mortgages',
    category: 'landlord',
    icon: 'Calculator',
    color: '#22C55E',
    href: '/landlord/btl-dscr-calculator',
    status: 'live',
    keywords: ['DSCR calculator UK BTL', 'debt service coverage ratio'],
  },
  {
    id: 'btl-icr',
    slug: 'btl-icr-calculator',
    name: 'BTL ICR Calculator',
    shortName: 'ICR',
    description: 'Calculate Interest Coverage Ratio for rental stress testing',
    category: 'landlord',
    icon: 'Percent',
    color: '#22C55E',
    href: '/landlord/btl-icr-calculator',
    status: 'coming-soon',
    keywords: ['ICR calculator', 'interest coverage ratio BTL'],
  },
  {
    id: 'brrr',
    slug: 'brrr-calculator',
    name: 'BRRR Calculator',
    shortName: 'BRRR',
    description: 'Model Buy-Refurbish-Refinance-Rent strategy returns',
    category: 'landlord',
    icon: 'RefreshCw',
    color: '#22C55E',
    href: '/landlord/brrr-calculator',
    status: 'live',
    keywords: ['BRRR calculator UK', 'buy refurbish refinance'],
  },
  {
    id: 'rent-to-rent',
    slug: 'rent-to-rent-profit-calculator',
    name: 'Rent to Rent Profit Calculator',
    shortName: 'R2R',
    description: 'Calculate profit margins for rent-to-rent deals',
    category: 'landlord',
    icon: 'Key',
    color: '#22C55E',
    href: '/landlord/rent-to-rent-profit-calculator',
    status: 'live',
    keywords: ['rent to rent profit', 'R2R calculator'],
  },
  {
    id: 'portfolio-ltv-blending',
    slug: 'portfolio-ltv-blending-calculator',
    name: 'Portfolio LTV Blending Calculator',
    shortName: 'Portfolio LTV',
    description: 'Calculate blended LTV across your property portfolio',
    category: 'landlord',
    icon: 'PieChart',
    color: '#22C55E',
    href: '/landlord/portfolio-ltv-blending-calculator',
    status: 'coming-soon',
    keywords: ['portfolio mortgage LTV blend', 'portfolio LTV calculator'],
  },
  {
    id: 'section-24',
    slug: 'section-24-tax-impact-calculator',
    name: 'Section 24 Tax Impact Calculator',
    shortName: 'Section 24',
    description: 'Calculate the impact of Section 24 mortgage interest relief changes',
    category: 'landlord',
    icon: 'FileWarning',
    color: '#22C55E',
    href: '/landlord/section-24-tax-impact-calculator',
    status: 'live',
    keywords: ['Section 24 calculator landlord UK', 'mortgage interest relief'],
  },
  {
    id: 'portfolio-refinance',
    slug: 'portfolio-refinance-calculator',
    name: 'Portfolio Refinance Calculator',
    shortName: 'Refinance',
    description: 'Model refinancing options across your property portfolio',
    category: 'landlord',
    icon: 'Repeat',
    color: '#22C55E',
    href: '/landlord/portfolio-refinance-calculator',
    status: 'coming-soon',
    keywords: ['portfolio refinance', 'remortgage portfolio'],
  },
];

// ============================================
// CALCULATORS - BRIDGING (5)
// ============================================

const bridgingCalculators: CalculatorConfig[] = [
  {
    id: 'bridging-loan',
    slug: 'bridging-loan-calculator',
    name: 'Bridging Loan Calculator',
    shortName: 'Bridging',
    description: 'Calculate bridging loan costs, fees, and total repayment',
    category: 'bridging',
    icon: 'Zap',
    color: '#EF4444',
    href: '/bridging/bridging-loan-calculator',
    status: 'live',
    keywords: ['bridging loan calculator', 'bridge finance calculator UK'],
  },
  {
    id: 'refurbishment-bridge',
    slug: 'refurbishment-bridge-calculator',
    name: 'Refurbishment Bridge Calculator',
    shortName: 'Refurb Bridge',
    description: 'Calculate light and heavy refurbishment bridging options',
    category: 'bridging',
    icon: 'Hammer',
    color: '#EF4444',
    href: '/bridging/refurbishment-bridge-calculator',
    status: 'live',
    keywords: ['refurbishment bridging', 'heavy refurb bridge'],
  },
  {
    id: 'bridge-to-let',
    slug: 'bridge-to-let-calculator',
    name: 'Bridge to Let Calculator',
    shortName: 'Bridge to Let',
    description: 'Model bridge-to-let exit strategies and refinance options',
    category: 'bridging',
    icon: 'ArrowRight',
    color: '#EF4444',
    href: '/bridging/bridge-to-let-calculator',
    status: 'live',
    keywords: ['bridge to let calculator', 'bridging to BTL'],
  },
  {
    id: 'auction-bridge',
    slug: 'auction-bridge-calculator',
    name: 'Auction Bridge Calculator',
    shortName: 'Auction',
    description: 'Calculate bridging for auction purchases with 28-day completion',
    category: 'bridging',
    icon: 'Gavel',
    color: '#EF4444',
    href: '/bridging/auction-bridge-calculator',
    status: 'live',
    keywords: ['auction bridging calculator', 'auction finance calculator'],
  },
  {
    id: 'retained-vs-rolled',
    slug: 'retained-vs-rolled-calculator',
    name: 'Retained vs Rolled Calculator',
    shortName: 'Ret vs Roll',
    description: 'Compare retained and rolled-up interest options',
    category: 'bridging',
    icon: 'ArrowLeftRight',
    color: '#EF4444',
    href: '/bridging/retained-vs-rolled-calculator',
    status: 'coming-soon',
    keywords: ['retained vs rolled interest', 'bridging interest options'],
  },
];

// ============================================
// CALCULATORS - SERVICED ACCOMMODATION (4)
// ============================================

const saCalculators: CalculatorConfig[] = [
  {
    id: 'sa-profit',
    slug: 'serviced-accommodation-profit-calculator',
    name: 'Serviced Accommodation Profit Calculator',
    shortName: 'SA Profit',
    description: 'Calculate profitability of serviced accommodation ventures',
    category: 'sa',
    icon: 'BedDouble',
    color: '#EC4899',
    href: '/sa/serviced-accommodation-profit-calculator',
    status: 'live',
    keywords: ['SA viability calculator', 'serviced accommodation profit'],
  },
  {
    id: 'sa-finance',
    slug: 'sa-finance-calculator',
    name: 'SA Finance Calculator',
    shortName: 'SA Finance',
    description: 'Calculate finance options for serviced accommodation properties',
    category: 'sa',
    icon: 'Banknote',
    color: '#EC4899',
    href: '/sa/sa-finance-calculator',
    status: 'live',
    keywords: ['SA mortgage calculator', 'serviced accommodation finance'],
  },
  {
    id: 'holiday-let-tax',
    slug: 'holiday-let-tax-calculator',
    name: 'Holiday Let Tax Calculator',
    shortName: 'Holiday Tax',
    description: 'Calculate tax implications for furnished holiday lets',
    category: 'sa',
    icon: 'Receipt',
    color: '#EC4899',
    href: '/sa/holiday-let-tax-calculator',
    status: 'coming-soon',
    keywords: ['holiday let tax calculator', 'FHL tax'],
  },
  {
    id: 'sa-occupancy',
    slug: 'sa-occupancy-calculator',
    name: 'SA Occupancy Calculator',
    shortName: 'Occupancy',
    description: 'Model occupancy rates and breakeven analysis for SA',
    category: 'sa',
    icon: 'Calendar',
    color: '#EC4899',
    href: '/sa/sa-occupancy-calculator',
    status: 'coming-soon',
    keywords: ['occupancy breakeven', 'ADR calculator'],
  },
];

// ============================================
// CALCULATORS - COMMERCIAL (5)
// ============================================

const commercialCalculators: CalculatorConfig[] = [
  {
    id: 'commercial-yield',
    slug: 'commercial-yield-calculator',
    name: 'Commercial Yield Calculator',
    shortName: 'Comm Yield',
    description: 'Calculate commercial property yields and cap rates',
    category: 'commercial',
    icon: 'Building',
    color: '#6366F1',
    href: '/commercial/commercial-yield-calculator',
    status: 'live',
    keywords: ['commercial property yield UK', 'cap rate calculator'],
  },
  {
    id: 'erv-rent',
    slug: 'erv-rent-calculator',
    name: 'ERV Rent Calculator',
    shortName: 'ERV',
    description: 'Estimate Estimated Rental Value for commercial property',
    category: 'commercial',
    icon: 'PoundSterling',
    color: '#6366F1',
    href: '/commercial/erv-rent-calculator',
    status: 'live',
    keywords: ['ERV calculator UK', 'estimated rental value'],
  },
  {
    id: 'commercial-ground-rent',
    slug: 'commercial-ground-rent-calculator',
    name: 'Commercial Ground Rent Calculator',
    shortName: 'Comm GR',
    description: 'Calculate and capitalise commercial ground rents',
    category: 'commercial',
    icon: 'Coins',
    color: '#6366F1',
    href: '/commercial/commercial-ground-rent-calculator',
    status: 'coming-soon',
    keywords: ['commercial ground rent', 'commercial lease ground rent'],
  },
  {
    id: 'fri-lease',
    slug: 'fri-lease-cost-calculator',
    name: 'FRI Lease Cost Calculator',
    shortName: 'FRI Lease',
    description: 'Estimate Full Repairing and Insuring lease costs',
    category: 'commercial',
    icon: 'Wrench',
    color: '#6366F1',
    href: '/commercial/fri-lease-cost-calculator',
    status: 'coming-soon',
    keywords: ['FRI lease cost', 'full repairing insuring lease'],
  },
  {
    id: 'vat-commercial',
    slug: 'vat-on-commercial-property-calculator',
    name: 'VAT on Commercial Property Calculator',
    shortName: 'VAT',
    description: 'Calculate VAT implications for commercial property transactions',
    category: 'commercial',
    icon: 'Receipt',
    color: '#6366F1',
    href: '/commercial/vat-on-commercial-property-calculator',
    status: 'coming-soon',
    keywords: ['VAT commercial property', 'option to tax calculator'],
  },
];

// ============================================
// CALCULATORS - REFURBISHMENT (6)
// ============================================

const refurbCalculators: CalculatorConfig[] = [
  {
    id: 'refurb-cost',
    slug: 'refurb-cost-calculator',
    name: 'Refurb Cost Calculator',
    shortName: 'Refurb Cost',
    description: 'Estimate refurbishment costs per square metre',
    category: 'refurb',
    icon: 'Hammer',
    color: '#F59E0B',
    href: '/refurb/refurb-cost-calculator',
    status: 'live',
    keywords: ['refurb cost per m2 UK', 'renovation cost calculator'],
  },
  {
    id: 'loft-conversion',
    slug: 'loft-conversion-calculator',
    name: 'Loft Conversion Calculator',
    shortName: 'Loft',
    description: 'Calculate loft conversion costs, added value and ROI for your property',
    category: 'refurb',
    icon: 'Home',
    color: '#F59E0B',
    href: '/refurb/loft-conversion-calculator',
    status: 'live',
    keywords: ['loft conversion ROI', 'loft conversion cost calculator', 'loft conversion value added'],
  },
  {
    id: 'epc-upgrade',
    slug: 'epc-upgrade-calculator',
    name: 'EPC Upgrade Calculator',
    shortName: 'EPC',
    description: 'Calculate costs to improve your EPC rating',
    category: 'refurb',
    icon: 'Leaf',
    color: '#F59E0B',
    href: '/refurb/epc-upgrade-calculator',
    status: 'live',
    keywords: ['EPC upgrade cost', 'energy efficiency calculator'],
  },
  {
    id: 'retrofit-payback',
    slug: 'retrofit-payback-calculator',
    name: 'Retrofit Payback Calculator',
    shortName: 'Retrofit',
    description: 'Calculate payback period for energy efficiency retrofits',
    category: 'refurb',
    icon: 'Zap',
    color: '#F59E0B',
    href: '/refurb/retrofit-payback-calculator',
    status: 'coming-soon',
    keywords: ['retrofit payback', 'energy retrofit ROI'],
  },
  {
    id: 'kitchen-renovation',
    slug: 'kitchen-renovation-roi-calculator',
    name: 'Kitchen Renovation ROI Calculator',
    shortName: 'Kitchen ROI',
    description: 'Calculate return on investment for kitchen renovations',
    category: 'refurb',
    icon: 'ChefHat',
    color: '#F59E0B',
    href: '/refurb/kitchen-renovation-roi-calculator',
    status: 'coming-soon',
    keywords: ['kitchen renovation ROI', 'kitchen cost value added'],
  },
  {
    id: 'fire-door',
    slug: 'fire-door-compliance-calculator',
    name: 'Fire Door Compliance Calculator',
    shortName: 'Fire Door',
    description: 'Calculate fire door compliance costs for rental properties',
    category: 'refurb',
    icon: 'DoorOpen',
    color: '#F59E0B',
    href: '/refurb/fire-door-compliance-calculator',
    status: 'coming-soon',
    keywords: ['fire door compliance', 'fire door cost calculator'],
  },
];

// ============================================
// CALCULATORS - ULTRA-NICHE (7)
// ============================================

const nicheCalculators: CalculatorConfig[] = [
  {
    id: 'knotweed',
    slug: 'knotweed-valuation-impact-calculator',
    name: 'Knotweed Valuation Impact Calculator',
    shortName: 'Knotweed',
    description: 'Calculate how Japanese knotweed affects property value',
    category: 'niche',
    icon: 'Bug',
    color: '#64748B',
    href: '/niche/knotweed-valuation-impact-calculator',
    status: 'coming-soon',
    keywords: ['knotweed devaluation', 'Japanese knotweed property value'],
  },
  {
    id: 'cladding-remediation',
    slug: 'cladding-remediation-cost-calculator',
    name: 'Cladding Remediation Cost Calculator',
    shortName: 'Cladding',
    description: 'Estimate cladding remediation costs for affected buildings',
    category: 'niche',
    icon: 'Building2',
    color: '#64748B',
    href: '/niche/cladding-remediation-cost-calculator',
    status: 'coming-soon',
    keywords: ['cladding remediation cost', 'cladding calculator'],
  },
  {
    id: 'ews1-risk',
    slug: 'ews1-risk-calculator',
    name: 'EWS1 Risk Calculator',
    shortName: 'EWS1',
    description: 'Assess EWS1 risk and potential impact on property value',
    category: 'niche',
    icon: 'AlertTriangle',
    color: '#64748B',
    href: '/niche/ews1-risk-calculator',
    status: 'coming-soon',
    keywords: ['EWS1 calculator', 'external wall system risk'],
  },
  {
    id: 'party-wall',
    slug: 'party-wall-award-cost-calculator',
    name: 'Party Wall Award Cost Calculator',
    shortName: 'Party Wall',
    description: 'Estimate party wall award and surveyor costs',
    category: 'niche',
    icon: 'Scale',
    color: '#64748B',
    href: '/niche/party-wall-award-cost-calculator',
    status: 'coming-soon',
    keywords: ['party wall calculator UK', 'party wall surveyor cost'],
  },
  {
    id: 'neighbour-dispute',
    slug: 'neighbour-dispute-devaluation-calculator',
    name: 'Neighbour Dispute Devaluation Calculator',
    shortName: 'Neighbour',
    description: 'Estimate property value impact from neighbour disputes',
    category: 'niche',
    icon: 'UserX',
    color: '#64748B',
    href: '/niche/neighbour-dispute-devaluation-calculator',
    status: 'coming-soon',
    keywords: ['neighbour dispute property value', 'dispute devaluation'],
  },
  {
    id: 'slow-market',
    slug: 'slow-market-vendor-motivation-calculator',
    name: 'Slow Market Vendor Motivation Calculator',
    shortName: 'Vendor Motive',
    description: 'Assess vendor motivation and negotiation leverage',
    category: 'niche',
    icon: 'TrendingDown',
    color: '#64748B',
    href: '/niche/slow-market-vendor-motivation-calculator',
    status: 'coming-soon',
    keywords: ['vendor motivation', 'slow market negotiation'],
  },
  {
    id: 'absent-freeholder-risk',
    slug: 'absent-freeholder-risk-score',
    name: 'Absent Freeholder Risk Score',
    shortName: 'FH Risk',
    description: 'Score the risk of buying with an absent freeholder',
    category: 'niche',
    icon: 'HelpCircle',
    color: '#64748B',
    href: '/niche/absent-freeholder-risk-score',
    status: 'coming-soon',
    keywords: ['absent freeholder risk', 'missing freeholder score'],
  },
];

// ============================================
// COMBINED EXPORTS
// ============================================

export const calculators: CalculatorConfig[] = [
  ...developmentCalculators,
  ...hmoCalculators,
  ...leaseholdCalculators,
  ...titlesplitCalculators,
  ...landlordCalculators,
  ...bridgingCalculators,
  ...saCalculators,
  ...commercialCalculators,
  ...refurbCalculators,
  ...nicheCalculators,
];

// ============================================
// WORKFLOWS
// ============================================

export const workflows: WorkflowConfig[] = [
  {
    id: 'full-development',
    name: 'Full Development Appraisal',
    description: 'Complete 4-step development analysis: Type → GDV → Build Costs → Finance',
    steps: ['gdv', 'build-cost', 'development-finance'],
    color: '#00C9A7',
  },
  {
    id: 'quick-investment',
    name: 'Quick Investment Check',
    description: 'Rapid assessment for BTL and portfolio investors',
    steps: ['btl-dscr', 'section-24', 'portfolio-ltv-blending'],
    color: '#22C55E',
  },
  {
    id: 'hmo-setup',
    name: 'HMO Setup Workflow',
    description: 'Full HMO viability and compliance assessment',
    steps: ['hmo-viability', 'article-4-hmo', 'hmo-fire-safety', 'hmo-finance'],
    color: '#3B82F6',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorConfig[] {
  return calculators.filter((calc) => calc.category === category);
}

export function getCalculatorById(id: string): CalculatorConfig | undefined {
  return calculators.find((calc) => calc.id === id);
}

export function getCalculatorBySlug(slug: string): CalculatorConfig | undefined {
  return calculators.find((calc) => calc.slug === slug);
}

export function getCategoryById(id: CalculatorCategory): CategoryConfig | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getLiveCalculators(): CalculatorConfig[] {
  return calculators.filter((calc) => calc.status === 'live');
}

export function getComingSoonCalculators(): CalculatorConfig[] {
  return calculators.filter((calc) => calc.status === 'coming-soon');
}

export function getFeaturedCalculators(): CalculatorConfig[] {
  // Return the 4 live calculators + 4 popular coming soon
  const live = getLiveCalculators();
  const featured = [
    'hmo-viability',
    'bridging-loan',
    'lease-extension',
    'brrr',
  ];
  const comingSoon = featured
    .map((id) => getCalculatorById(id))
    .filter((calc): calc is CalculatorConfig => calc !== undefined);
  return [...live, ...comingSoon].slice(0, 8);
}
