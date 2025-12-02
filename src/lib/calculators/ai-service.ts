// ============================================
// AI SERVICE FOR CALCULATOR ANALYSIS
// PropertyCalculators.ai
// ============================================

import {
  CalculatorDefinition,
  AIConfig,
  AIAnalysisResult,
  AIThreshold,
  CalculatorCategory,
} from './calculator-types';

// ============================================
// AI SYSTEM PROMPTS BY CATEGORY
// ============================================

export const CATEGORY_SYSTEM_PROMPTS: Record<CalculatorCategory, string> = {
  hmo: `You are an expert UK HMO (House in Multiple Occupation) property analyst.
You understand HMO licensing (mandatory and additional), Article 4 directions, fire safety regulations, and room-by-room profitability.
Focus on yield quality relative to HMO standards (10%+ gross typical), cash flow sustainability, compliance costs, and local market context.
Be direct and practical. Flag regulatory concerns clearly.`,

  development: `You are an expert UK property development analyst and quantity surveyor.
You understand GDV analysis, build cost benchmarking (BCIS), development finance structures, and profit margin requirements.
Focus on profit on cost (20% target), build cost reasonableness, finance structure, and exit strategy viability.
Be realistic about timelines and costs. Flag overly optimistic assumptions.`,

  bridging: `You are an expert UK bridging and specialist finance analyst.
You understand bridging structures (retained, rolled, serviced), development finance, mezzanine, and exit requirements.
Focus on true cost of finance, LTV implications, exit viability, and comparison to market rates.
Be clear about hidden costs and risks. Calculate effective rates.`,

  leasehold: `You are an expert UK leasehold analyst and RICS qualified surveyor.
You understand lease extension calculations, marriage value, relativity graphs, and enfranchisement.
Focus on the 80-year cliff edge, ground rent capitalization, and leasehold reform implications.
Explain complex concepts simply. Flag timing considerations.`,

  planning: `You are an expert UK planning consultant.
You understand planning classes, permitted development rights, CIL, Section 106, and planning appeals.
Focus on planning probability, cost implications, and timeline risks.
Be realistic about planning outcomes. Flag policy constraints.`,

  commercial: `You are an expert UK commercial property analyst.
You understand commercial yields, ERV, FRI leases, service charges, and commercial-to-resi conversions.
Focus on yield sustainability, covenant strength, and lease terms.
Be clear about commercial property risks and market trends.`,

  portfolio: `You are an expert UK property portfolio analyst and tax specialist.
You understand Section 24, portfolio stress testing, incorporation decisions, and CGT planning.
Focus on portfolio-level metrics, tax efficiency, and risk diversification.
Be practical about tax mitigation. Recommend professional advice where needed.`,

  refurb: `You are an expert UK refurbishment cost analyst.
You understand room-by-room costs, extension viability, and ROI on improvements.
Focus on cost accuracy, value add potential, and return on investment.
Be realistic about refurb costs and timelines. Flag scope creep risks.`,

  green: `You are an expert UK energy efficiency and retrofit analyst.
You understand EPC requirements, heat pump economics, solar ROI, and retrofit funding.
Focus on payback periods, EPC improvement probability, and compliance deadlines.
Be realistic about green upgrade costs and savings.`,

  valuation: `You are an expert UK property valuer.
You understand AVM methodology, comparable analysis, yield-based valuations, and DCF.
Focus on valuation accuracy, comparable selection, and market conditions.
Be clear about valuation uncertainty ranges.`,

  auction: `You are an expert UK property auction analyst.
You understand auction fees, legal packs, and maximum bid calculations.
Focus on true cost of purchase, risk factors, and comparison to open market.
Flag hidden costs and legal issues in auction properties.`,

  tenant: `You are an expert UK landlord and tenant risk analyst.
You understand eviction processes, void periods, arrears probability, and tenant referencing.
Focus on risk quantification and mitigation strategies.
Be realistic about timelines (especially evictions).`,

  specialist: `You are an expert UK specialist housing analyst covering care homes, supported living, and medical property.
You understand CQC ratings, care home economics, supported living leases, and healthcare property yields.
Focus on operator covenant, regulatory compliance, and sector-specific risks.
Flag care sector complexities and due diligence requirements.`,

  land: `You are an expert UK strategic land analyst.
You understand land options, promotion agreements, hope value, and planning uplift.
Focus on planning probability, timeline risk, and value uplift potential.
Be realistic about strategic land timelines (often 5-10+ years).`,

  sa: `You are an expert UK serviced accommodation analyst.
You understand Airbnb economics, dynamic pricing, occupancy patterns, and operating costs.
Focus on realistic occupancy, seasonal variation, and operating complexity.
Be honest about SA volatility and management requirements.`,

  creative: `You are an expert UK creative property strategy analyst.
You understand BRRR, rent-to-rent, lease options, and vendor finance.
Focus on strategy viability, risk factors, and realistic returns.
Be clear about the additional complexity and risk in creative strategies.`,

  compliance: `You are an expert UK building safety and compliance analyst.
You understand Building Safety Act, EWS1, fire regulations, and cladding remediation.
Focus on compliance requirements, cost implications, and timeline.
Flag safety-critical issues clearly.`,

  risk: `You are an expert UK property market risk analyst.
You understand market cycles, stress testing, refinance risk, and liquidity.
Focus on downside scenarios, risk quantification, and hedging strategies.
Be realistic about market risks and uncertainty.`,
};

// ============================================
// PROMPT BUILDER
// ============================================

/**
 * Build a user prompt from template and values
 */
export function buildPrompt(
  template: string,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>
): string {
  let prompt = template;

  // Replace input placeholders
  Object.entries(inputs).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(placeholder, formatValueForPrompt(value));
  });

  // Replace output placeholders
  Object.entries(outputs).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(placeholder, formatValueForPrompt(value));
  });

  return prompt;
}

function formatValueForPrompt(value: unknown): string {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toLocaleString('en-GB');
    }
    return value.toFixed(2);
  }
  return String(value);
}

// ============================================
// THRESHOLD ANALYSIS
// ============================================

/**
 * Evaluate thresholds and generate automatic insights
 */
export function evaluateThresholds(
  thresholds: AIThreshold[] | undefined,
  outputs: Record<string, number | string>
): Array<{
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  message: string;
}> {
  if (!thresholds) return [];

  const insights: Array<{
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    message: string;
  }> = [];

  thresholds.forEach((threshold) => {
    const value = Number(outputs[threshold.metric]);
    if (isNaN(value)) return;

    let triggered = false;
    switch (threshold.operator) {
      case '<':
        triggered = value < threshold.value;
        break;
      case '>':
        triggered = value > threshold.value;
        break;
      case '<=':
        triggered = value <= threshold.value;
        break;
      case '>=':
        triggered = value >= threshold.value;
        break;
      case '==':
        triggered = value === threshold.value;
        break;
    }

    if (triggered) {
      const typeMap: Record<string, 'positive' | 'negative' | 'neutral' | 'warning'> = {
        success: 'positive',
        warning: 'warning',
        critical: 'negative',
        info: 'neutral',
      };

      insights.push({
        type: typeMap[threshold.severity] || 'neutral',
        title: threshold.metric,
        message: threshold.message,
      });
    }
  });

  return insights;
}

// ============================================
// AI API INTEGRATION
// ============================================

export interface AIAnalysisRequest {
  calculator: CalculatorDefinition;
  inputs: Record<string, number | string | boolean>;
  outputs: Record<string, number | string>;
}

/**
 * Call AI API for calculator analysis
 * This function should be called from an API route to keep the API key secure
 */
export async function analyzeCalculation(
  request: AIAnalysisRequest
): Promise<AIAnalysisResult> {
  const { calculator, inputs, outputs } = request;

  // Build the prompt
  const systemPrompt = calculator.ai.systemPrompt || CATEGORY_SYSTEM_PROMPTS[calculator.category];
  const userPrompt = buildPrompt(calculator.ai.promptTemplate, inputs, outputs);

  // Get threshold-based insights first
  const thresholdInsights = evaluateThresholds(calculator.ai.thresholds, outputs);

  // Build analysis aspects instruction
  const aspectsInstruction = buildAspectsInstruction(calculator.ai.analysisAspects);

  // Make API call (this should be done server-side)
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userPrompt: `${userPrompt}\n\n${aspectsInstruction}`,
        calculatorId: calculator.id,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResponse = await response.json();

    // Combine AI response with threshold insights
    return {
      summary: aiResponse.summary || 'Analysis complete.',
      verdict: aiResponse.verdict || determineVerdict(outputs, calculator.ai.thresholds),
      score: aiResponse.score,
      insights: [...thresholdInsights, ...(aiResponse.insights || [])],
      recommendations: aiResponse.recommendations || [],
      nextCalculators: calculator.connections.downstream,
      marketContext: aiResponse.marketContext,
      risks: aiResponse.risks,
    };
  } catch (error) {
    // Fallback to threshold-only analysis if AI fails
    return {
      summary: 'Based on the calculated metrics:',
      verdict: determineVerdict(outputs, calculator.ai.thresholds),
      insights: thresholdInsights,
      recommendations: generateBasicRecommendations(calculator, outputs),
      nextCalculators: calculator.connections.downstream,
    };
  }
}

function buildAspectsInstruction(aspects: string[]): string {
  const aspectDescriptions: Record<string, string> = {
    viability: 'Assess overall deal viability - is this worth pursuing?',
    risk: 'Identify key risks and how to mitigate them.',
    optimisation: 'Suggest specific ways to improve the numbers.',
    comparison: 'Compare to typical/benchmark deals in this category.',
    next_steps: 'Recommend specific next steps for the user.',
    warnings: 'Flag any red flags or concerns clearly.',
    market_context: 'Provide relevant market context.',
    financing: 'Discuss financing implications and options.',
    tax: 'Highlight tax considerations.',
    exit: 'Discuss exit strategy implications.',
  };

  const instructions = aspects
    .map((aspect) => aspectDescriptions[aspect])
    .filter(Boolean)
    .join('\n- ');

  return `Please address the following in your analysis:\n- ${instructions}\n\nBe concise and practical. Use bullet points. Avoid jargon.`;
}

function determineVerdict(
  outputs: Record<string, number | string>,
  thresholds?: AIThreshold[]
): 'strong' | 'good' | 'marginal' | 'weak' | 'poor' {
  if (!thresholds) return 'good';

  let positiveCount = 0;
  let negativeCount = 0;

  thresholds.forEach((threshold) => {
    const value = Number(outputs[threshold.metric]);
    if (isNaN(value)) return;

    let triggered = false;
    switch (threshold.operator) {
      case '<':
        triggered = value < threshold.value;
        break;
      case '>':
        triggered = value > threshold.value;
        break;
      case '<=':
        triggered = value <= threshold.value;
        break;
      case '>=':
        triggered = value >= threshold.value;
        break;
      case '==':
        triggered = value === threshold.value;
        break;
    }

    if (triggered) {
      if (threshold.severity === 'success') positiveCount++;
      if (threshold.severity === 'warning') negativeCount++;
      if (threshold.severity === 'critical') negativeCount += 2;
    }
  });

  const score = positiveCount - negativeCount;
  if (score >= 2) return 'strong';
  if (score >= 1) return 'good';
  if (score >= 0) return 'marginal';
  if (score >= -1) return 'weak';
  return 'poor';
}

function generateBasicRecommendations(
  calculator: CalculatorDefinition,
  outputs: Record<string, number | string>
): string[] {
  const recommendations: string[] = [];

  // Add next calculator recommendations
  if (calculator.connections.downstream.length > 0) {
    recommendations.push(
      `Continue your analysis with: ${calculator.connections.downstream.slice(0, 3).join(', ')}`
    );
  }

  // Add related calculator recommendations
  if (calculator.connections.related.length > 0) {
    recommendations.push(
      `Compare results using: ${calculator.connections.related.slice(0, 2).join(', ')}`
    );
  }

  return recommendations;
}

// ============================================
// STREAMING AI ANALYSIS
// ============================================

/**
 * Stream AI analysis for real-time display
 */
export async function* streamAnalysis(
  request: AIAnalysisRequest
): AsyncGenerator<string, void, unknown> {
  const { calculator, inputs, outputs } = request;

  const systemPrompt = calculator.ai.systemPrompt || CATEGORY_SYSTEM_PROMPTS[calculator.category];
  const userPrompt = buildPrompt(calculator.ai.promptTemplate, inputs, outputs);
  const aspectsInstruction = buildAspectsInstruction(calculator.ai.analysisAspects);

  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt,
      userPrompt: `${userPrompt}\n\n${aspectsInstruction}`,
      calculatorId: calculator.id,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Streaming failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  buildPrompt,
  evaluateThresholds,
  analyzeCalculation,
  streamAnalysis,
  CATEGORY_SYSTEM_PROMPTS,
};
