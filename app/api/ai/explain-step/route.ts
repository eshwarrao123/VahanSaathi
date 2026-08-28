import { NextRequest, NextResponse } from 'next/server';
import { explainStepAi } from '@/lib/ai/explainStep';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { stepTitle, stepDescription, legalBasis, userRole, officialRtoAction } = body;

    if (!stepTitle || !stepDescription) {
      return NextResponse.json(
        { success: false, error: 'Step details are required.' },
        { status: 400 }
      );
    }

    const data = await explainStepAi({
      stepTitle,
      stepDescription,
      legalBasis: legalBasis || 'Motor Vehicles Act 1988',
      userRole: userRole || 'seller',
      officialRtoAction: officialRtoAction || 'RTO Office',
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('[AI API Error] /api/ai/explain-step:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't retrieve contextual AI guidance. Showing verified rule description.",
      },
      { status: 500 }
    );
  }
}
