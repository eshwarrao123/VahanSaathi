import { NextRequest, NextResponse } from 'next/server';
import { explainRoadmapAi } from '@/lib/ai/explainRoadmap';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const vehicleCase = body.vehicleCase;
    const roadmapSteps = body.roadmapSteps || [];

    if (!vehicleCase || !Array.isArray(roadmapSteps)) {
      return NextResponse.json(
        { success: false, error: 'Vehicle case and roadmap steps are required.' },
        { status: 400 }
      );
    }

    const data = await explainRoadmapAi(vehicleCase, roadmapSteps);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('[AI API Error] /api/ai/explain-roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't generate an AI summary. Showing verified rule engine roadmap.",
      },
      { status: 500 }
    );
  }
}
