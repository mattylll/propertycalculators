import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt, calculatorId } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `${systemPrompt}

You are providing analysis for a UK property calculator. Be concise and practical.

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
  "marketContext": "optional market context"
}`,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse JSON response
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
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
      summary: textContent.text.slice(0, 500),
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
