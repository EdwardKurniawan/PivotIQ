import { NextResponse } from 'next/server';
import { buildBroadRoleFixtureSnapshots, summarizeBroadRoleFixtureSnapshots } from '../../../lib/broad-role-fixtures.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshots = buildBroadRoleFixtureSnapshots();
  const summary = summarizeBroadRoleFixtureSnapshots(snapshots);

  return NextResponse.json({
    ...summary,
    fixtures: snapshots.map(({ fixture, report, evaluation }) => ({
      job_title: fixture.jobTitle,
      industry: fixture.industry,
      tasks: fixture.tasks,
      passed: evaluation.passed,
      issues: evaluation.issues,
      quality_status: report?.quality_audit?.status || 'unknown',
      primary: report?.recommendation_stack?.primary || null,
      conservative_backup: report?.recommendation_stack?.conservative_backup || null,
      stay_path: report?.stay_path || null,
      top_pivot: report?.pivots?.[0] || null,
      decision_brief: report?.recommendation_stack?.decision_brief || null,
    })),
  });
}
