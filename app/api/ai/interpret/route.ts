import { NextRequest, NextResponse } from 'next/server';
import { interpretSituationAi } from '@/lib/ai/interpretSituation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.substring(0, 500) : '';
    const userRole = body.userRole;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Situation description text is required.' },
        { status: 400 }
      );
    }

    const data = await interpretSituationAi(text, userRole);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('[AI API Error] /api/ai/interpret:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't process your natural-language text. Falling back to guided questions.",
      },
      { status: 500 }
    );
  }
}
