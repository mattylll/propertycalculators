/**
 * DealProfile - Core data model for storing underwriting data
 *
 * This is the persistent data structure that captures all calculator inputs,
 * AI analysis, risk assessments, and lender matching data.
 */

// ============================================
// ENUMS & TYPES
// ============================================

export type DealType =
  | 'development'
  | 'hmo-conversion'
  | 'btl-purchase'
  | 'btl-refinance'
  | 'bridging'
  | 'commercial'
  | 'serviced-accommodation'
  | 'title-split'
  | 'lease-extension'
  | 'portfolio';

export type DealStatus =
  | 'draft'
  | 'in-progress'
  | 'ai-analyzed'
  | 'lender-matched'
  | 'submitted'
  | 'funded'
  | 'declined'
  | 'withdrawn';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PropertyType =
  | 'residential-house'
  | 'residential-flat'
  | 'hmo'
  | 'commercial'
  | 'mixed-use'
  | 'land'
  | 'development-site';

export type ExperienceLevel =
  | 'first-time'
  | 'limited' // 1-3 deals
  | 'experienced' // 4-10 deals
  | 'professional'; // 10+ deals

// ============================================
// PROPERTY DATA
// ============================================

export interface PropertyAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: 'England' | 'Wales' | 'Scotland' | 'Northern Ireland';
}

export interface PropertyData {
  address: PropertyAddress;
  propertyType: PropertyType;
  tenure: 'freehold' | 'leasehold';
  leaseYearsRemaining?: number;
  groundRent?: number;
  epcRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  currentValue?: number;
  purchasePrice?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  constructionType?: 'standard' | 'non-standard' | 'timber-frame' | 'steel-frame';
  hasKnotweed?: boolean;
  hasCladding?: boolean;
  isListedBuilding?: boolean;
  floodRisk?: 'none' | 'low' | 'medium' | 'high';
}

// ============================================
// FINANCIAL DATA
// ============================================

export interface FinancialInputs {
  // Purchase
  purchasePrice?: number;
  depositAmount?: number;
  depositPercentage?: number;
  stampDuty?: number;
  legalFees?: number;
  surveyFees?: number;
  otherPurchaseCosts?: number;

  // Rental
  currentRent?: number;
  projectedRent?: number;
  rentFrequency?: 'monthly' | 'weekly' | 'annual';
  voidPeriodMonths?: number;

  // Development
  gdv?: number;
  buildCosts?: number;
  professionalFees?: number;
  contingency?: number;
  financeCovers?: number;
  targetProfit?: number;
  targetProfitOnCost?: number;

  // Existing Finance
  existingMortgageBalance?: number;
  existingMortgageRate?: number;
  existingMortgageType?: 'interest-only' | 'repayment';
}

export interface CalculatedMetrics {
  // Core Ratios
  ltv?: number;
  ltc?: number;
  ltvGdv?: number;
  dscr?: number;
  icr?: number;
  grossYield?: number;
  netYield?: number;
  roi?: number;
  roce?: number;

  // Development Specific
  profitOnCost?: number;
  profitOnGdv?: number;
  residualLandValue?: number;
  totalDevelopmentCost?: number;
  equityRequired?: number;

  // Cash Flow
  monthlyCashFlow?: number;
  annualCashFlow?: number;
  breakEvenRent?: number;
  breakEvenOccupancy?: number;
}

// ============================================
// BORROWER DATA
// ============================================

export interface BorrowerProfile {
  type: 'individual' | 'limited-company' | 'spv' | 'partnership' | 'trust';
  companyName?: string;
  companyNumber?: string;
  tradingMonths?: number;
  experience: ExperienceLevel;
  portfolioSize?: number;
  portfolioValue?: number;
  annualIncome?: number;
  netWorth?: number;
  creditScore?: 'excellent' | 'good' | 'fair' | 'poor';
  hasCCJs?: boolean;
  hasDefaults?: boolean;
  isUKResident?: boolean;
  isFirstTimeBuyer?: boolean;
}

// ============================================
// AI ANALYSIS
// ============================================

export interface RiskFlag {
  id: string;
  category: 'property' | 'financial' | 'borrower' | 'market' | 'regulatory';
  level: RiskLevel;
  title: string;
  description: string;
  mitigation?: string;
  impact?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'action' | 'warning' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  calculatorId?: string; // Link to recommended calculator
}

export interface AIAnalysis {
  overallViability: 'viable' | 'marginal' | 'not-viable';
  viabilityScore: number; // 0-100
  viabilityReasoning: string;
  riskFlags: RiskFlag[];
  recommendations: AIRecommendation[];
  strengthsSummary: string[];
  weaknessesSummary: string[];
  suggestedStructure?: string;
  analysisTimestamp: string;
  modelVersion: string;
}

// ============================================
// LENDER MATCHING
// ============================================

export interface LenderMatch {
  lenderId: string;
  lenderName: string;
  productType: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  mismatchReasons: string[];
  indicativeRate?: number;
  indicativeLTV?: number;
  indicativeFees?: number;
  status: 'matched' | 'submitted' | 'approved' | 'declined' | 'withdrawn';
}

// ============================================
// CALCULATOR RUNS
// ============================================

export interface CalculatorRun {
  calculatorId: string;
  calculatorName: string;
  timestamp: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  aiInsight?: string;
}

// ============================================
// MAIN DEAL PROFILE
// ============================================

export interface DealProfile {
  // Identity
  id: string;
  userId: string;
  name: string;
  dealType: DealType;
  status: DealStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;

  // Core Data
  property: PropertyData;
  financials: FinancialInputs;
  metrics: CalculatedMetrics;
  borrower: BorrowerProfile;

  // AI & Matching
  aiAnalysis?: AIAnalysis;
  lenderMatches: LenderMatch[];

  // History
  calculatorRuns: CalculatorRun[];

  // Notes & Documents
  notes?: string;
  documentIds?: string[];

  // Tags for organization
  tags?: string[];
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createEmptyDealProfile(
  userId: string,
  name: string,
  dealType: DealType
): DealProfile {
  const now = new Date().toISOString();

  return {
    id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    name,
    dealType,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    property: {
      address: {
        line1: '',
        city: '',
        postcode: '',
        country: 'England',
      },
      propertyType: 'residential-house',
      tenure: 'freehold',
    },
    financials: {},
    metrics: {},
    borrower: {
      type: 'individual',
      experience: 'first-time',
    },
    lenderMatches: [],
    calculatorRuns: [],
  };
}

export function calculateCompleteness(profile: DealProfile): number {
  const requiredFields = [
    profile.property.address.postcode,
    profile.property.propertyType,
    profile.financials.purchasePrice || profile.financials.currentRent,
    profile.borrower.experience,
  ];

  const filledFields = requiredFields.filter(Boolean).length;
  return Math.round((filledFields / requiredFields.length) * 100);
}

export function getDealTypeLabel(type: DealType): string {
  const labels: Record<DealType, string> = {
    'development': 'Development',
    'hmo-conversion': 'HMO Conversion',
    'btl-purchase': 'Buy-to-Let Purchase',
    'btl-refinance': 'Buy-to-Let Refinance',
    'bridging': 'Bridging',
    'commercial': 'Commercial',
    'serviced-accommodation': 'Serviced Accommodation',
    'title-split': 'Title Split',
    'lease-extension': 'Lease Extension',
    'portfolio': 'Portfolio',
  };
  return labels[type];
}

export function getStatusColor(status: DealStatus): string {
  const colors: Record<DealStatus, string> = {
    'draft': 'neutral',
    'in-progress': 'info',
    'ai-analyzed': 'ai',
    'lender-matched': 'success',
    'submitted': 'warning',
    'funded': 'success',
    'declined': 'danger',
    'withdrawn': 'neutral',
  };
  return colors[status];
}
