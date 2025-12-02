// ============================================
// ALL CALCULATOR DEFINITIONS
// PropertyCalculators.ai - Complete calculator registry
// ============================================

import { CalculatorCategory } from './calculator-types';

/**
 * Complete list of all calculators for PropertyCalculators.ai
 * Status: 'live' = fully implemented, 'coming_soon' = placeholder
 */
export const ALL_CALCULATORS: Array<{
  title: string;
  slug: string;
  category: CalculatorCategory;
  status: 'live' | 'coming_soon';
}> = [
  // ============================================
  // HMO & CONVERSION (10)
  // ============================================
  { title: 'HMO Viability Calculator', slug: 'hmo-viability-calculator', category: 'hmo', status: 'live' },
  { title: 'HMO Finance Calculator', slug: 'hmo-finance-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'HMO Yield & Cashflow Calculator', slug: 'hmo-yield-cashflow-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'Hybrid HMO / Serviced Accommodation Viability Calculator', slug: 'hybrid-hmo-sa-viability-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'Article 4 HMO Conversion Risk Calculator', slug: 'article-4-hmo-conversion-risk-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'HMO Fire Safety Upgrade Cost Calculator', slug: 'hmo-fire-safety-upgrade-cost-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'PBSA vs HMO Yield Comparison Tool', slug: 'pbsa-vs-hmo-yield-comparison-tool', category: 'hmo', status: 'coming_soon' },
  { title: 'Student HMO Rent Forecast Calculator', slug: 'student-hmo-rent-forecast-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'Mini-Mo (Micro-HMO) Feasibility Calculator', slug: 'minimo-hmo-feasibility-calculator', category: 'hmo', status: 'coming_soon' },
  { title: 'HMO Licensing Fee Calculator', slug: 'hmo-licensing-fee-calculator', category: 'hmo', status: 'live' },

  // ============================================
  // DEVELOPMENT (13)
  // ============================================
  { title: 'New-Build Development Appraisal Calculator', slug: 'new-build-development-appraisal-calculator', category: 'development', status: 'live' },
  { title: 'Conversion Appraisal Calculator', slug: 'conversion-appraisal-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Commercial-to-Residential PD Rights Calculator', slug: 'commercial-to-residential-pd-rights-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Build Cost Benchmarking Calculator', slug: 'build-cost-benchmarking-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Profit-on-Cost & Profit-on-GDV Calculator', slug: 'profit-on-cost-and-gdv-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Developer Contingency Stress-Test Calculator', slug: 'developer-contingency-stress-test-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Developer Exit Strategy Decision Calculator', slug: 'developer-exit-strategy-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Developer Equity Waterfall Calculator', slug: 'developer-equity-waterfall-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Land Assembly Uplift Calculator', slug: 'land-assembly-uplift-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Airspace Development Calculator', slug: 'airspace-development-calculator', category: 'development', status: 'coming_soon' },
  { title: 'Brownfield Remediation Cost Estimator', slug: 'brownfield-remediation-cost-estimator', category: 'development', status: 'coming_soon' },
  { title: 'Basement Development Feasibility Calculator', slug: 'basement-development-feasibility-calculator', category: 'development', status: 'coming_soon' },
  { title: 'BTR Yield & Stabilisation Calculator', slug: 'btr-yield-stabilisation-calculator', category: 'development', status: 'coming_soon' },

  // ============================================
  // BRIDGING & SPECIALTY FINANCE (14)
  // ============================================
  { title: 'Bridging Loan Calculator', slug: 'bridging-loan-calculator', category: 'bridging', status: 'live' },
  { title: 'Refurbishment Bridge Calculator', slug: 'refurbishment-bridge-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Development Finance Calculator', slug: 'development-finance-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Stretched Senior Debt Calculator', slug: 'stretched-senior-debt-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Mezzanine Finance Calculator', slug: 'mezzanine-finance-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Equity Participation Finance Calculator', slug: 'equity-participation-finance-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Retained vs Rolled Interest Calculator', slug: 'retained-vs-rolled-interest-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Day-1 vs Day-180 Refinance Calculator', slug: 'day1-vs-day180-refinance-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Bridge-to-Let Calculator', slug: 'bridge-to-let-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Portfolio Mortgage Stress Test Calculator', slug: 'portfolio-mortgage-stress-test-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio LTV Blending Calculator', slug: 'portfolio-ltv-blending-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'DSCR / ICR Buy-to-Let Calculator', slug: 'dscr-icr-btl-calculator', category: 'bridging', status: 'live' },
  { title: 'Holiday Let Stress Test Calculator', slug: 'holiday-let-stress-test-calculator', category: 'bridging', status: 'coming_soon' },
  { title: 'Serviced Accommodation Lending Calculator', slug: 'sa-lending-calculator', category: 'sa', status: 'coming_soon' },

  // ============================================
  // LEASEHOLD & TITLE (9)
  // ============================================
  { title: 'Lease Extension Calculator', slug: 'lease-extension-calculator', category: 'leasehold', status: 'live' },
  { title: 'Title Split Calculator', slug: 'title-split-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Freehold Enfranchisement Calculator', slug: 'freehold-enfranchisement-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Collective Enfranchisement Share Allocation Calculator', slug: 'collective-enfranchisement-share-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Ground Rent Capitalisation Calculator', slug: 'ground-rent-capitalisation-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Marriage Value Calculator', slug: 'marriage-value-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Right-to-Manage Savings Calculator', slug: 'rtm-savings-calculator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Absent Freeholder Premium Estimator', slug: 'absent-freeholder-premium-estimator', category: 'leasehold', status: 'coming_soon' },
  { title: 'Flying Freehold Risk Calculator', slug: 'flying-freehold-risk-calculator', category: 'leasehold', status: 'coming_soon' },

  // ============================================
  // PLANNING & PERMISSIONS (9)
  // ============================================
  { title: 'Planning Gain Uplift Calculator', slug: 'planning-gain-uplift-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'CIL Calculator', slug: 'cil-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Section 106 Contributions Calculator', slug: 'section-106-contributions-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Affordable Housing Viability Calculator', slug: 'affordable-housing-viability-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Permitted Development Rights Eligibility Checker', slug: 'pd-eligibility-checker', category: 'planning', status: 'coming_soon' },
  { title: 'Prior Approval Feasibility Calculator', slug: 'prior-approval-feasibility-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Green Belt Development Probability Calculator', slug: 'green-belt-probability-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Nutrient Neutrality Mitigation Cost Calculator', slug: 'nutrient-neutrality-calculator', category: 'planning', status: 'coming_soon' },
  { title: 'Biodiversity Net Gain (BNG) Credits Calculator', slug: 'bng-credits-calculator', category: 'planning', status: 'coming_soon' },

  // ============================================
  // COMMERCIAL PROPERTY (10)
  // ============================================
  { title: 'Commercial Yield Calculator', slug: 'commercial-yield-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'ERV (Estimated Rental Value) Calculator', slug: 'erv-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'FRI Lease Cost Allocation Calculator', slug: 'fri-lease-cost-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Service Charge Budgeting Calculator', slug: 'service-charge-budgeting-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Commercial to Resi Conversion Viability Calculator', slug: 'commercial-to-resi-viability-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Retail-to-Resi Void Forecast Calculator', slug: 'retail-to-resi-void-forecast-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Office Vacancy Incentive Calculator', slug: 'office-vacancy-incentive-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Industrial Asset Yield Calculator', slug: 'industrial-asset-yield-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'Warehouse Investment Return Calculator', slug: 'warehouse-investment-return-calculator', category: 'commercial', status: 'coming_soon' },
  { title: 'BTR vs Commercial Yield Comparison Tool', slug: 'btr-vs-commercial-yield-calculator', category: 'commercial', status: 'coming_soon' },

  // ============================================
  // PORTFOLIO & TAX (11)
  // ============================================
  { title: 'ROCE vs ROI vs IRR Comparison Tool', slug: 'roce-vs-roi-vs-irr-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Capital Allowances (CA) Estimator', slug: 'capital-allowances-estimator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Section 24 Tax Impact Calculator', slug: 'section-24-tax-impact-calculator', category: 'portfolio', status: 'live' },
  { title: 'Incorporation vs Personal Ownership Tax Calculator', slug: 'incorporation-vs-personal-tax-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio Stress-Test Calculator', slug: 'portfolio-stress-test-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio Equity Release Calculator', slug: 'portfolio-equity-release-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio Disposal Tax Calculator', slug: 'portfolio-disposal-tax-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio DSCR Consolidation Calculator', slug: 'portfolio-dscr-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio Refinance Optimisation Calculator', slug: 'portfolio-refinance-optimisation-calculator', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio EPC Upgrade Cost Model', slug: 'portfolio-epc-upgrade-model', category: 'portfolio', status: 'coming_soon' },
  { title: 'Portfolio Heatmap Risk Calculator', slug: 'portfolio-heatmap-risk-calculator', category: 'portfolio', status: 'coming_soon' },

  // ============================================
  // CREATIVE STRATEGIES (6)
  // ============================================
  { title: 'BRRR (Buy-Refurb-Refinance-Rent) Calculator', slug: 'brrr-calculator', category: 'creative', status: 'live' },
  { title: 'Rent-to-Rent Profitability Calculator', slug: 'r2r-profitability-calculator', category: 'creative', status: 'coming_soon' },
  { title: 'Lease Option Deal Calculator', slug: 'lease-option-deal-calculator', category: 'creative', status: 'coming_soon' },
  { title: 'Option Agreement Premium Calculator', slug: 'option-agreement-premium-calculator', category: 'creative', status: 'coming_soon' },
  { title: 'Vendor Finance Feasibility Calculator', slug: 'vendor-finance-calculator', category: 'creative', status: 'coming_soon' },
  { title: 'Delayed Completion Profit Calculator', slug: 'delayed-completion-calculator', category: 'creative', status: 'coming_soon' },

  // ============================================
  // REFURBISHMENT (11)
  // ============================================
  { title: 'Refurbishment Cost Calculator (Room-by-Room)', slug: 'refurbishment-cost-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Extension ROI Calculator', slug: 'extension-roi-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Loft Conversion Viability Calculator', slug: 'loft-conversion-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Kitchen Renovation Cost Calculator', slug: 'kitchen-renovation-cost-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Bathroom Renovation Cost Calculator', slug: 'bathroom-renovation-cost-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Roof Replacement Cost Calculator', slug: 'roof-replacement-cost-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Damp & Timber Remediation Calculator', slug: 'damp-and-timber-remediation-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Subsidence Repair Cost Estimator', slug: 'subsidence-repair-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Fire Door Compliance Calculator', slug: 'fire-door-compliance-calculator', category: 'compliance', status: 'coming_soon' },
  { title: 'Window Replacement ROI Calculator', slug: 'window-replacement-roi-calculator', category: 'refurb', status: 'coming_soon' },
  { title: 'Insulation Upgrade ROI Calculator', slug: 'insulation-upgrade-roi-calculator', category: 'green', status: 'coming_soon' },

  // ============================================
  // EPC & GREEN RETROFIT (10)
  // ============================================
  { title: 'EPC Upgrade Cost Calculator', slug: 'epc-upgrade-cost-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Retrofit Payback Calculator', slug: 'retrofit-payback-calculator', category: 'green', status: 'coming_soon' },
  { title: 'EPC Band Improvement Probability Calculator', slug: 'epc-improvement-probability-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Heat Pump Payback Calculator', slug: 'heat-pump-payback-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Solar ROI Calculator', slug: 'solar-roi-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Battery Storage ROI Calculator', slug: 'battery-storage-roi-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Energy Efficiency Retrofit Grant Calculator', slug: 'retrofit-grant-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Boiler Upgrade Scheme Benefit Calculator', slug: 'boiler-upgrade-benefit-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Carbon Offset Requirement Calculator', slug: 'carbon-offset-requirement-calculator', category: 'green', status: 'coming_soon' },
  { title: 'Energy Performance Deterioration Risk Calculator', slug: 'epc-deterioration-risk-calculator', category: 'green', status: 'coming_soon' },

  // ============================================
  // VALUATION & ANALYSIS (12)
  // ============================================
  { title: 'AVM - Automated Valuation Model (Lite)', slug: 'avm-lite-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'AVM Range Estimator', slug: 'avm-range-estimator', category: 'valuation', status: 'coming_soon' },
  { title: 'GDV Sensitivity Analysis Calculator', slug: 'gdv-sensitivity-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Comparable Sales Adjustment Calculator', slug: 'comparable-sales-adjustment-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Square Foot Valuation Calculator', slug: 'square-foot-valuation-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Rental Yield Calculator', slug: 'rental-yield-calculator', category: 'valuation', status: 'live' },
  { title: 'True Net Yield Calculator', slug: 'true-net-yield-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Cap Rate Calculator', slug: 'cap-rate-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Discounted Cashflow (DCF) Calculator', slug: 'discounted-cashflow-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Valuation Confidence Score Calculator', slug: 'valuation-confidence-score-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Development Residual Land Value Calculator', slug: 'residual-land-value-calculator', category: 'valuation', status: 'coming_soon' },
  { title: 'Land Value per Plot Calculator', slug: 'land-value-per-plot-calculator', category: 'valuation', status: 'coming_soon' },

  // ============================================
  // AUCTION (5)
  // ============================================
  { title: 'Auction Maximum Bid Calculator', slug: 'auction-maximum-bid-calculator', category: 'auction', status: 'coming_soon' },
  { title: 'Auction Fee Effective Price Calculator', slug: 'auction-fee-effective-price-calculator', category: 'auction', status: 'coming_soon' },
  { title: 'Auction Bridge Viability Calculator', slug: 'auction-bridge-viability-calculator', category: 'auction', status: 'coming_soon' },
  { title: 'Auction Repossession Timing Calculator', slug: 'auction-repo-timing-calculator', category: 'auction', status: 'coming_soon' },
  { title: 'Modern Method of Auction ROI Calculator', slug: 'mma-roi-calculator', category: 'auction', status: 'coming_soon' },

  // ============================================
  // TENANT RISK (7)
  // ============================================
  { title: 'Eviction Timeline Calculator', slug: 'eviction-timeline-calculator', category: 'tenant', status: 'coming_soon' },
  { title: 'Section 8 / Section 21 Probability Calculator', slug: 'eviction-probability-calculator', category: 'tenant', status: 'coming_soon' },
  { title: 'Tenant Arrears Probability Calculator', slug: 'tenant-arrears-probability-calculator', category: 'tenant', status: 'coming_soon' },
  { title: 'Rent Guarantee Break-Even Calculator', slug: 'rent-guarantee-break-even-calculator', category: 'tenant', status: 'coming_soon' },
  { title: 'Void Period Risk Calculator', slug: 'void-period-risk-calculator', category: 'tenant', status: 'coming_soon' },
  { title: 'Landlord Insurance Premium Estimator', slug: 'landlord-insurance-premium-estimator', category: 'tenant', status: 'coming_soon' },
  { title: 'Tenant Turnover Cost Calculator', slug: 'tenant-turnover-cost-calculator', category: 'tenant', status: 'coming_soon' },

  // ============================================
  // SPECIALIST HOUSING - SUPPORTED LIVING (8)
  // ============================================
  { title: 'Supported Living Lease Yield Calculator', slug: 'supported-living-lease-yield-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Provider Strength Score Calculator', slug: 'supported-living-provider-strength-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Long Lease Capitalisation Calculator', slug: 'supported-living-capitalisation-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Rent Benchmarking Tool', slug: 'supported-living-rent-benchmark-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Void Risk Calculator', slug: 'supported-living-void-risk-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Break Clause Valuation Calculator', slug: 'supported-living-break-clause-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Fit-Out Cost Calculator', slug: 'supported-living-fitout-cost-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Supported Living Compliance Upgrade Calculator', slug: 'supported-living-compliance-upgrade-calculator', category: 'specialist', status: 'coming_soon' },

  // ============================================
  // SPECIALIST HOUSING - CARE HOMES (10)
  // ============================================
  { title: 'Care Home Feasibility Calculator', slug: 'care-home-feasibility-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home EBITDA Margin Calculator', slug: 'care-home-ebitda-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Cap Rate Valuation Calculator', slug: 'care-home-cap-rate-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Staffing Ratio Cost Calculator', slug: 'care-home-staffing-cost-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home CQC Rating Impact Calculator', slug: 'care-home-cqc-impact-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Refit Cost Calculator', slug: 'care-home-refit-cost-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Break-Even Occupancy Calculator', slug: 'care-home-occupancy-breakeven-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Energy Consumption Savings Calculator', slug: 'care-home-energy-savings-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Fire Regulation Upgrade Cost Calculator', slug: 'care-home-fire-upgrade-calculator', category: 'specialist', status: 'coming_soon' },
  { title: 'Care Home Extension Feasibility Calculator', slug: 'care-home-extension-feasibility-calculator', category: 'specialist', status: 'coming_soon' },

  // ============================================
  // SERVICED ACCOMMODATION (4)
  // ============================================
  { title: 'Airbnb Pricing Sensitivity Calculator', slug: 'airbnb-pricing-sensitivity-calculator', category: 'sa', status: 'coming_soon' },
  { title: 'Serviced Accommodation Break-Even Calculator', slug: 'sa-breakeven-calculator', category: 'sa', status: 'coming_soon' },
  { title: 'Dynamic Pricing Revenue Forecast Calculator', slug: 'dynamic-pricing-revenue-calculator', category: 'sa', status: 'coming_soon' },
  { title: 'Cleaning & Ops Cost Model for SA', slug: 'sa-ops-cost-calculator', category: 'sa', status: 'coming_soon' },

  // ============================================
  // RISK & MARKET (additional)
  // ============================================
  { title: 'Build Cost Inflation Impact Calculator', slug: 'build-cost-inflation-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Interest Rate Forecast Stress Calculator', slug: 'interest-rate-stress-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Yield Compression / Expansion Scenario Calculator', slug: 'yield-compression-scenario-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Mortgage Arrears Probability Calculator', slug: 'mortgage-arrears-probability-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Refinance Failure Risk Calculator', slug: 'refinance-failure-risk-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Portfolio Liquidity Risk Calculator', slug: 'portfolio-liquidity-risk-calculator', category: 'risk', status: 'coming_soon' },
  { title: 'Landlord Stress Survival Calculator', slug: 'landlord-stress-survival-calculator', category: 'risk', status: 'coming_soon' },

  // ============================================
  // COMPLIANCE & SAFETY (5)
  // ============================================
  { title: 'Building Safety Act Compliance Calculator', slug: 'building-safety-act-compliance-calculator', category: 'compliance', status: 'coming_soon' },
  { title: 'Fire Strategy Cost Calculator', slug: 'fire-strategy-cost-calculator', category: 'compliance', status: 'coming_soon' },
  { title: 'Sprinkler System Retrofit Calculator', slug: 'sprinkler-retrofit-calculator', category: 'compliance', status: 'coming_soon' },
  { title: 'EWS Remediation Timeline Calculator', slug: 'ews-remediation-timeline-calculator', category: 'compliance', status: 'coming_soon' },
  { title: 'Cladding Remediation Cost / EWS1 Risk Calculator', slug: 'cladding-remediation-cost-calculator', category: 'compliance', status: 'coming_soon' },

  // ============================================
  // LAND & STRATEGIC (8)
  // ============================================
  { title: 'Land Promotion Agreement Value Calculator', slug: 'land-promotion-agreement-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Land Option Agreement Value Calculator', slug: 'land-option-value-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Land Uplift (Hope Value) Calculator', slug: 'land-hope-value-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Residual Land Value (Advanced) Calculator', slug: 'residual-land-value-advanced-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Serviced Plot Sales Calculator', slug: 'serviced-plot-sales-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Land Assembly Blight Impact Calculator', slug: 'land-assembly-blight-impact-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Greenfield Planning Probability Calculator', slug: 'greenfield-planning-probability-calculator', category: 'land', status: 'coming_soon' },
  { title: 'Land Taxation Exposure Calculator', slug: 'land-taxation-exposure-calculator', category: 'land', status: 'coming_soon' },
];

/**
 * Get calculators by category
 */
export function getCalculatorsByCategory(category: CalculatorCategory) {
  return ALL_CALCULATORS.filter((c) => c.category === category);
}

/**
 * Get all live calculators
 */
export function getLiveCalculators() {
  return ALL_CALCULATORS.filter((c) => c.status === 'live');
}

/**
 * Get calculator count by category
 */
export function getCalculatorCountByCategory(): Record<CalculatorCategory, number> {
  const counts = {} as Record<CalculatorCategory, number>;
  ALL_CALCULATORS.forEach((calc) => {
    counts[calc.category] = (counts[calc.category] || 0) + 1;
  });
  return counts;
}

/**
 * Total calculator count
 */
export const TOTAL_CALCULATORS = ALL_CALCULATORS.length;

export default ALL_CALCULATORS;
