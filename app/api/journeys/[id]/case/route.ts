import { NextRequest, NextResponse } from 'next/server';
import { createCaseFromJourney } from '@/lib/services/journey';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await createCaseFromJourney(id);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating case from journey:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't generate your roadmap case at this moment. Please try again.",
      },
      { status: 500 }
    );
  }
}
