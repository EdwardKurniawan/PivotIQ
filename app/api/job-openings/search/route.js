import { NextResponse } from 'next/server';
import { getJobOpeningsStats, searchJobOpenings } from '../../../../lib/job-openings-catalog';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const roleFamily = searchParams.get('role_family') || '';
  const locationType = searchParams.get('location_type') || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 50);
  const skills = (searchParams.get('skills') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const [results, stats] = await Promise.all([
    searchJobOpenings({
      query,
      roleFamily,
      locationType,
      skills,
      limit,
    }),
    getJobOpeningsStats(),
  ]);

  return NextResponse.json({
    query,
    roleFamily,
    locationType,
    skills,
    results,
    stats,
  });
}
