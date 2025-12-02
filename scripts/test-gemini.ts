/**
 * Test script for Gemini AI integration
 *
 * Run with: npx ts-node scripts/test-gemini.ts
 * Or: GOOGLE_AI_API_KEY=your-key npx ts-node scripts/test-gemini.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_AI_API_KEY not set');
  console.log('\nTo test, run:');
  console.log('GOOGLE_AI_API_KEY=your-key npx ts-node scripts/test-gemini.ts');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testGemini() {
  console.log('🧪 Testing Gemini 2.0 Flash for PropertyCalculators.ai\n');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  // Test 1: Basic property valuation knowledge
  console.log('📊 Test 1: Property Valuation Knowledge');
  console.log('─'.repeat(50));

  const test1Prompt = `You are an expert UK property valuer.

I'm looking at a 2-bed flat in WC1R (Bloomsbury, London).
- 750 sqft
- New build
- Asking price: £650,000

Based on your knowledge of recent sold prices in this area, is this price reasonable?
What would you expect the £/sqft to be for this location?

Respond in JSON format:
{
  "summary": "brief assessment",
  "estimatedPsf": number,
  "verdict": "strong" | "good" | "marginal" | "weak",
  "comparables": ["any specific sales you're aware of"],
  "marketContext": "market trends"
}`;

  try {
    const result1 = await model.generateContent(test1Prompt);
    const response1 = result1.response.text();
    console.log(response1);

    // Try to parse JSON
    const jsonMatch = response1.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\n✅ JSON parsed successfully');
      console.log('Verdict:', parsed.verdict);
      console.log('Estimated £/sqft:', parsed.estimatedPsf);
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  console.log('\n');

  // Test 2: GDV calculation analysis
  console.log('📊 Test 2: GDV Analysis');
  console.log('─'.repeat(50));

  const test2Prompt = `You are an expert UK property development analyst.

Analyse this development scheme:
- Location: Manchester M1 (city centre)
- Unit mix: 3x 1-bed (550 sqft), 6x 2-bed (750 sqft), 4x 3-bed (950 sqft)
- Total: 13 units, 9,650 sqft
- Proposed GDV: £4,200,000 (£435/sqft avg)
- New build premium applied: 15%

Based on Manchester city centre sold prices, is this GDV realistic?

Respond in JSON format:
{
  "summary": "2-3 sentence analysis",
  "verdict": "strong" | "good" | "marginal" | "weak",
  "insights": [{"type": "positive" | "warning", "title": "title", "message": "detail"}],
  "recommendations": ["rec 1", "rec 2"],
  "marketContext": "Manchester market context"
}`;

  try {
    const result2 = await model.generateContent(test2Prompt);
    const response2 = result2.response.text();
    console.log(response2);

    const jsonMatch = response2.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\n✅ JSON parsed successfully');
      console.log('Verdict:', parsed.verdict);
      console.log('Insights:', parsed.insights?.length || 0);
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  console.log('\n');

  // Test 3: Rental yield with actual data
  console.log('📊 Test 3: Rental Yield Analysis');
  console.log('─'.repeat(50));

  const test3Prompt = `You are an expert UK BTL property analyst.

Analyse this rental yield calculation:
- Property: 3-bed semi in Birmingham B15 (Edgbaston)
- Purchase price: £285,000
- Monthly rent: £1,450
- Gross yield: 6.1%

Based on Birmingham B15 market data:
1. Is £1,450/month achievable for this area?
2. Is £285,000 a fair price?
3. How does 6.1% compare to the local average?

Respond in JSON format:
{
  "summary": "assessment",
  "verdict": "strong" | "good" | "marginal" | "weak",
  "insights": [{"type": "positive" | "negative" | "warning", "title": "title", "message": "message"}],
  "marketContext": "B15 rental market context",
  "recommendations": ["rec"]
}`;

  try {
    const result3 = await model.generateContent(test3Prompt);
    const response3 = result3.response.text();
    console.log(response3);

    const jsonMatch = response3.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\n✅ JSON parsed successfully');
      console.log('Verdict:', parsed.verdict);
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ All tests complete');
}

testGemini().catch(console.error);
