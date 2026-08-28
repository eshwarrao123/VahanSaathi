import { NextResponse } from 'next/server';
import { seedSyntheticData } from '@/lib/services/journey';

export async function POST() {
  try {
    const result = await seedSyntheticData();
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Database seed failed' },
      { status: 500 }
    );
  }
}
