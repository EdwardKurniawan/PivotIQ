import { NextResponse } from 'next/server';
import { getJobTitleCatalogStats, searchJobTitles } from '../../../../lib/job-title-catalog';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 8), 1), 12);

  const [results, stats] = await Promise.all([
    searchJobTitles(query, limit),
    getJobTitleCatalogStats(),
  ]);

  return NextResponse.json({
    query,
    results,
    stats,
  });
}
