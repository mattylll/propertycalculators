// Deal Profile - core data model for PropertyCalculators.ai

export type DealProfile = {
    id: string;
    userId?: string;
    address: string;
    lat?: number;
    long?: number;
    localAuthority: string;
    planningHistory?: string[];
    pdSummary?: PdAssessment;
    gdvEstimate?: GdvAssessment;
    buildCostEstimate?: BuildCostAssessment;
    financeRequirements?: FinanceAssessment;
    aiSummary?: string;
    createdAt: Date;
    updatedAt: Date;
};

// Permitted Development Assessment
export type PdAssessment = {
    existingUse: string;
    proposedUse: string;
    gia: number;
    storeys: number;
    targetUnits: number;
    articleFour: boolean;
    heritage: boolean;
    floodZone?: number;
    conservationArea?: boolean;
    pdRoute: 'Class MA' | 'Class O' | 'Class Q' | 'Full Planning' | 'Prior Approval';
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
};

// Gross Development Value Assessment
export type GdvAssessment = {
    totalGdv: number;
    gdvPerUnit: number;
    gdvPerSqft: number;
    comparables: Comparable[];
    newBuildPremium: number;
    marketTrend: 'rising' | 'stable' | 'falling';
    confidence: number;
    reasoning: string;
};

export type Comparable = {
    address: string;
    salePrice: number;
    sqft: number;
    pricePerSqft: number;
    saleDate: string;
    bedrooms?: number;
    propertyType: string;
    distance: number;
};

// Build Cost Assessment
export type BuildCostAssessment = {
    totalCost: number;
    costPerSqft: number;
    costPerSqm: number;
    breakdown: CostBreakdown;
    specLevel: 'basic' | 'standard' | 'premium';
    buildType: 'new_build' | 'conversion' | 'refurbishment' | 'extension';
    region: string;
    contingency: number;
    professionalFees: number;
    reasoning: string;
    confidence: number;
};

export type CostBreakdown = {
    preliminaries: number;
    substructure: number;
    superstructure: number;
    internalFinishes: number;
    fittings: number;
    services: number;
    externalWorks: number;
    contingency: number;
    professionalFees: number;
};

// Finance Assessment
export type FinanceAssessment = {
    totalFunding: number;
    seniorDebt: SeniorDebtTerms;
    mezzanine?: MezzanineTerms;
    equityRequired: number;
    ltc: number; // Loan to Cost
    ltgdv: number; // Loan to GDV
    profitOnCost: number;
    profitOnGdv: number;
    lenderAppetite: 'strong' | 'moderate' | 'weak';
    reasoning: string;
    confidence: number;
};

export type SeniorDebtTerms = {
    amount: number;
    ltc: number;
    interestRate: number;
    term: number; // months
    arrangementFee: number;
    exitFee: number;
};

export type MezzanineTerms = {
    amount: number;
    interestRate: number;
    profitShare?: number;
    term: number;
};

// Calculator Status
export type CalculatorStatus = 'idle' | 'thinking' | 'streaming' | 'ready' | 'error';

// AI Response wrapper
export type AiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    reasoning: string;
    confidence: number;
    processingTime: number;
};
