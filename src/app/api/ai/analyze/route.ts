import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt, calculatorId } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const fullPrompt = `${systemPrompt}

You are providing analysis for a UK property calculator. Be concise and practical.

You have access to your training data which includes UK property sold prices, Land Registry data, and market trends. Use this knowledge to provide accurate, data-informed analysis.

Format your response as JSON with this structure:
{
  "summary": "2-3 sentence summary of the analysis",
  "verdict": "strong" | "good" | "marginal" | "weak" | "poor",
  "score": 0-100 (optional),
  "insights": [
    {"type": "positive" | "negative" | "neutral" | "warning", "title": "short title", "message": "insight message"}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "risks": ["risk 1", "risk 2"],
  "marketContext": "optional market context with any relevant sold price data or market trends you're aware of"
}

User query:
${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysisResult);
      }
    } catch (parseError) {
      // If JSON parsing fails, return a structured response from the text
      console.error('JSON parse error, returning text response');
    }

    // Fallback: return the text as summary
    return NextResponse.json({
      summary: text.slice(0, 500),
      verdict: 'good',
      insights: [],
      recommendations: [],
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
