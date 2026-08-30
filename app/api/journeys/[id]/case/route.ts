import { NextRequest, NextResponse } from 'next/server';
import { createCaseFromJourney } from '@/lib/services/journey';

function getSafeDbHost(): string {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return 'DATABASE_URL_NOT_SET';
    const parsed = new URL(dbUrl);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}`;
  } catch {
    return 'URL_PARSER_ERROR';
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const env = process.env.NODE_ENV || 'development';
  const safeDbHost = getSafeDbHost();

  console.log(`[AI-CASE-ROUTE] [START] journeyId=${id} | env=${env} | db=${safeDbHost}`);

  try {
    const result = await createCaseFromJourney(id);
    const caseId = result.caseId || (result.journey && result.journey.case && result.journey.case.id);
    console.log(`[AI-CASE-ROUTE] [SUCCESS] journeyId=${id} | caseId=${caseId}`);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const isNotFound = message.includes('Journey not found');

    console.error(`[AI-CASE-ROUTE] [ERROR] journeyId=${id} | isNotFound=${isNotFound} | error=${message}`);

    return NextResponse.json(
      {
        success: false,
        error: isNotFound
          ? 'Journey not found'
          : "We couldn't generate your roadmap case at this moment. Please try again.",
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
