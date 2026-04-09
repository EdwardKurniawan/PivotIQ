import { NextResponse } from 'next/server';
import { buildQaFixtureSnapshotGroups } from '../../../lib/broad-role-fixtures.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const groups = buildQaFixtureSnapshotGroups();
  const summaries = groups.map((group) => ({
    key: group.key,
    label: group.label,
    ...group.summary,
  }));
  const totalFixtures = summaries.reduce((sum, item) => sum + Number(item.fixture_count || 0), 0);
  const totalPassed = summaries.reduce((sum, item) => sum + Number(item.passed_count || 0), 0);

  return NextResponse.json({
    fixture_count: totalFixtures,
    passed_count: totalPassed,
    pass_rate: totalFixtures ? Math.round((totalPassed / totalFixtures) * 100) : 0,
    groups: groups.map((group) => ({
      key: group.key,
      label: group.label,
      summary: group.summary,
      fixtures: group.snapshots.map(({ fixture, report, evaluation, catalog, catalog_label }) => ({
        catalog,
        catalog_label,
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
    })),
  });
}
