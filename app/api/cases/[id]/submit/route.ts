import { NextRequest, NextResponse } from 'next/server';
import { submitMockCaseAction } from '@/lib/services/journey';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedCase = await submitMockCaseAction(id);

    return NextResponse.json({
      success: true,
      message: 'Demo submission simulated.',
      data: updatedCase,
    });
  } catch (error: unknown) {
    console.error('Error submitting mock case:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't simulate submission just now. Please check your case status.",
      },
      { status: 500 }
    );
  }
}
