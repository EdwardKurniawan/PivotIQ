import { auditRecommendationQuality } from '../../../lib/recommendation-quality';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 500);
    const audit = await auditRecommendationQuality({ limit });
    return Response.json(audit);
  } catch (error) {
    console.error('Recommendation quality API error:', error);
    return Response.json({ error: 'Failed to audit recommendation quality.' }, { status: 500 });
  }
}
