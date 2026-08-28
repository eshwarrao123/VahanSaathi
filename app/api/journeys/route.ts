import { NextRequest, NextResponse } from 'next/server';
import { createJourney } from '@/lib/services/journey';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const initialRole = body.initialRole;

    const journey = await createJourney(sessionId, initialRole);

    return NextResponse.json({ success: true, data: journey }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating journey:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't initialize your journey just now. Please try again.",
      },
      { status: 500 }
    );
  }
}
