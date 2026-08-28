import { NextRequest, NextResponse } from 'next/server';
import { getJourney, updateJourney } from '@/lib/services/journey';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const journey = await getJourney(id);

    if (!journey) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: journey });
  } catch (error: unknown) {
    console.error('Error fetching journey:', error);
    return NextResponse.json(
      { success: false, error: "We couldn't retrieve your journey details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateJourney(id, {
      currentScreen: body.currentScreen,
      userRole: body.userRole,
      situationText: body.situationText,
      answers: body.answers,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error('Error updating journey:', error);
    return NextResponse.json(
      { success: false, error: "We couldn't save your answer just now. Your information is preserved." },
      { status: 500 }
    );
  }
}
