import { NextResponse } from 'next/server';
import { auditCourseCatalogQuality } from '../../../../lib/course-catalog-quality';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 500;
    const audit = await auditCourseCatalogQuality({ limit });
    return NextResponse.json(audit);
  } catch (error) {
    console.error('Course catalog quality audit error:', error);
    return NextResponse.json({ error: 'Failed to audit course catalog quality.' }, { status: 500 });
  }
}
