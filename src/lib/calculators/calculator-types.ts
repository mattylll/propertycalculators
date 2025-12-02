// ============================================
// CALCULATOR TYPE DEFINITIONS
// PropertyCalculators.ai
// ============================================

// ============================================
// CATEGORY DEFINITIONS
// ============================================

export type CalculatorCategory =
  | 'hmo'           // HMO & Conversion
  | 'development'   // New Build & Development
  | 'bridging'      // Bridging & Specialty Finance
  | 'leasehold'     // Leasehold & Title
  | 'planning'      // Planning & Permissions
  | 'commercial'    // Commercial Property
  | 'portfolio'     // Portfolio & Tax
  | 'refurb'        // Refurbishment
  | 'green'         // EPC & Green Retrofit
  | 'valuation'     // Valuation & Analysis
  | 'auction'       // Auction
  | 'tenant'        // Tenant Risk
  | 'specialist'    // Specialist Housing (Care, Supported Living)
  | 'land'          // Land & Strategic
  | 'sa'            // Serviced Accommodation
  | 'creative'      // Creative Deal Structures
  | 'compliance'    // Compliance & Safety
  | 'risk';         // Risk & Market

export const CATEGORY_META: Record<CalculatorCategory, {
  name: string;
  description: string;
  color: string;
  icon: string;
  slug: string;
}> = {
  hmo: {
    name: 'HMO & Conversion',
    description: 'Viability, licensing, fire safety, and room-by-room analysis',
    color: 'var(--pc-cat-hmo)',
    icon: 'Users',
    slug: 'hmo',
  },
  development: {
    name: 'Development Finance',
    description: 'GDV, build costs, development appraisals, and exit strategies',
    color: 'var(--pc-cat-development)',
    icon: 'Building2',
    slug: 'development',
  },
  bridging: {
    name: 'Bridging & Specialty',
    description: 'Bridging loans, development finance, and mezzanine',
    color: 'var(--pc-cat-bridging)',
    icon: 'Zap',
    slug: 'bridging',
  },
  leasehold: {
    name: 'Leasehold & Title',
    description: 'Lease extensions, marriage value, and enfranchisement',
    color: 'var(--pc-cat-leasehold)',
    icon: 'FileText',
    slug: 'leasehold',
  },
  planning: {
    name: 'Planning & Permissions',
    description: 'Planning gain, CIL, Section 106, and PD rights',
    color: 'var(--pc-cat-planning)',
    icon: 'FileCheck',
    slug: 'planning',
  },
  commercial: {
    name: 'Commercial Property',
    description: 'Commercial yields, ERV, FRI leases, and conversions',
    color: 'var(--pc-cat-commercial)',
    icon: 'BarChart3',
    slug: 'commercial',
  },
  portfolio: {
    name: 'Portfolio & Tax',
    description: 'Portfolio stress testing, Section 24, and optimisation',
    color: 'var(--pc-cat-landlord)',
    icon: 'PieChart',
    slug: 'portfolio',
  },
  refurb: {
    name: 'Refurbishment',
    description: 'Room-by-room costs, extensions, and ROI analysis',
    color: 'var(--pc-cat-refurb)',
    icon: 'Hammer',
    slug: 'refurb',
  },
  green: {
    name: 'EPC & Green Retrofit',
    description: 'EPC upgrades, heat pumps, solar, and retrofitting',
    color: 'var(--pc-cat-green)',
    icon: 'Leaf',
    slug: 'green',
  },
  valuation: {
    name: 'Valuation & Analysis',
    description: 'AVM, yield analysis, DCF, and comparable adjustments',
    color: 'var(--pc-cat-valuation)',
    icon: 'Calculator',
    slug: 'valuation',
  },
  auction: {
    name: 'Auction',
    description: 'Maximum bids, fees, and auction viability',
    color: 'var(--pc-cat-auction)',
    icon: 'Gavel',
    slug: 'auction',
  },
  tenant: {
    name: 'Tenant Risk',
    description: 'Eviction timelines, void periods, and arrears risk',
    color: 'var(--pc-cat-tenant)',
    icon: 'UserX',
    slug: 'tenant',
  },
  specialist: {
    name: 'Specialist Housing',
    description: 'Care homes, supported living, and medical',
    color: 'var(--pc-cat-specialist)',
    icon: 'Heart',
    slug: 'specialist',
  },
  land: {
    name: 'Land & Strategic',
    description: 'Land value, options, and strategic land',
    color: 'var(--pc-cat-land)',
    icon: 'Mountain',
    slug: 'land',
  },
  sa: {
    name: 'Serviced Accommodation',
    description: 'Airbnb, short-stay, and dynamic pricing',
    color: 'var(--pc-cat-sa)',
    icon: 'Home',
    slug: 'sa',
  },
  creative: {
    name: 'Creative Strategies',
    description: 'BRRR, rent-to-rent, lease options',
    color: 'var(--pc-cat-creative)',
    icon: 'Lightbulb',
    slug: 'creative',
  },
  compliance: {
    name: 'Compliance & Safety',
    description: 'Building safety, fire regulations, EWS1',
    color: 'var(--pc-cat-compliance)',
    icon: 'Shield',
    slug: 'compliance',
  },
  risk: {
    name: 'Risk & Market',
    description: 'Market forecasting, stress testing, risk analysis',
    color: 'var(--pc-cat-risk)',
    icon: 'AlertTriangle',
    slug: 'risk',
  },
};

// ============================================
// INPUT FIELD DEFINITIONS
// ============================================

export type InputType =
  | 'currency'      // GBP input with £ symbol
  | 'percentage'    // Percentage with % symbol
  | 'number'        // Plain number
  | 'integer'       // Whole numbers only
  | 'select'        // Dropdown selection
  | 'multiselect'   // Multiple selection
  | 'slider'        // Range slider
  | 'toggle'        // Boolean toggle
  | 'date'          // Date picker
  | 'text';         // Text input

export interface InputOption {
  value: string | number;
  label: string;
  description?: string;
}

export interface InputField {
  id: string;
  label: string;
  type: InputType;

  // Validation
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;

  // Default and placeholder
  defaultValue?: number | string | boolean;
  placeholder?: string;

  // For select/multiselect
  options?: InputOption[];

  // Help text
  hint?: string;
  tooltip?: string;

  // Conditional display
  showIf?: (inputs: Record<string, unknown>) => boolean;

  // Grouping
  group?: string;

  // Formatting
  prefix?: string;
  suffix?: string;
  currency?: 'GBP' | 'USD' | 'EUR';
}

// ============================================
// OUTPUT FIELD DEFINITIONS
// ============================================

export type OutputVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface OutputField {
  id: string;
  label: string;

  // Display
  format: 'currency' | 'percentage' | 'number' | 'ratio' | 'text' | 'months' | 'years';
  decimals?: number;

  // Styling
  variant?: OutputVariant | ((value: number | string) => OutputVariant);
  isPrimary?: boolean; // Highlight as main result

  // Help
  tooltip?: string;

  // Conditional display
  showIf?: (outputs: Record<string, unknown>) => boolean;

  // Grouping
  group?: string;
}

// ============================================
// AI CONFIGURATION
// ============================================

export type AnalysisAspect =
  | 'viability'        // Is this deal viable?
  | 'risk'             // What are the risks?
  | 'optimisation'     // How could this be improved?
  | 'comparison'       // How does this compare to typical deals?
  | 'next_steps'       // What should the user do next?
  | 'warnings'         // Any red flags?
  | 'market_context'   // Market conditions
  | 'financing'        // Financing implications
  | 'tax'              // Tax implications
  | 'exit';            // Exit strategy considerations

export interface AIThreshold {
  metric: string;
  operator: '<' | '>' | '==' | '<=' | '>=';
  value: number;
  severity: 'info' | 'success' | 'warning' | 'critical';
  message: string;
}

export interface AIConfig {
  // System prompt for this calculator
  systemPrompt: string;

  // Template for building user prompt from inputs/outputs
  promptTemplate: string;

  // What aspects to analyze
  analysisAspects: AnalysisAspect[];

  // Thresholds for automatic insights
  thresholds?: AIThreshold[];
}

// ============================================
// CALCULATOR DEFINITION
// ============================================

export interface CalculatorDefinition {
  // Identity
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: CalculatorCategory;
  subcategory?: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // Status
  status: 'live' | 'coming_soon' | 'beta';

  // Configuration
  inputs: InputField[];
  outputs: OutputField[];

  // Calculation function
  calculate: (inputs: Record<string, number | string | boolean>) => Record<string, number | string>;

  // AI configuration
  ai: AIConfig;

  // Connections to other calculators
  connections: {
    upstream: string[];    // Calculators that feed into this one
    downstream: string[];  // Calculators this feeds into
    related: string[];     // Similar calculators
  };

  // Additional
  examples?: Array<{
    name: string;
    description: string;
    inputs: Record<string, number | string | boolean>;
  }>;

  helpArticle?: string;
  videoUrl?: string;
}

// ============================================
// CALCULATION RESULT
// ============================================

export interface CalculationResult {
  outputs: Record<string, number | string>;
  formattedOutputs: Record<string, string>;
  variants: Record<string, OutputVariant>;
  primaryMetric?: {
    id: string;
    value: number | string;
    formatted: string;
    variant: OutputVariant;
  };
}

// ============================================
// AI ANALYSIS RESULT
// ============================================

export interface AIAnalysisResult {
  summary: string;
  verdict: 'strong' | 'good' | 'marginal' | 'weak' | 'poor';
  score?: number;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    message: string;
  }>;
  recommendations: string[];
  nextCalculators: string[];
  marketContext?: string;
  risks?: string[];
}
