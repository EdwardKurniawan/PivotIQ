import { NextResponse } from 'next/server';
import { analyzeProfileAgainstTargetRole } from '../../../../lib/job-gap-analysis';

export async function POST(request) {
  try {
    const payload = await request.json();
    const profile = payload?.profile && typeof payload.profile === 'object' ? payload.profile : {};
    const targetTitle = String(payload?.targetTitle || '').trim();
    const roleFamily = String(payload?.roleFamily || '').trim();

    if (!targetTitle) {
      return NextResponse.json({ error: 'targetTitle is required' }, { status: 400 });
    }

    const analysis = await analyzeProfileAgainstTargetRole({
      profile,
      targetTitle,
      roleFamily,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Job gap analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze job gap.' }, { status: 500 });
  }
}
