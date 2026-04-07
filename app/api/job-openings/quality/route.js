import { NextResponse } from 'next/server';
import { auditJobOpeningsQuality } from '../../../../lib/job-openings-quality';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 300;
    const audit = await auditJobOpeningsQuality({ limit });
    return NextResponse.json(audit);
  } catch (error) {
    console.error('Job openings quality audit error:', error);
    return NextResponse.json({ error: 'Failed to audit job openings quality.' }, { status: 500 });
  }
}
