import { BROAD_ROLE_FIXTURES, BROAD_ROLE_FIXTURE_CLARIFIERS } from '../data/broad-role-fixtures.js';
import { buildDemoReportData, normalizeReportData } from './report-data.js';

const SYNTHETIC_DRIFT_PATTERN = /(entrepreneur|visionary|ninja|guru|infrastructure|architect|director|chief|principal|head of)/i;
const PUNCTUATION_SOUP_PATTERN = /[–—:]/;

function titleHasSyntheticDrift(title = '') {
  return SYNTHETIC_DRIFT_PATTERN.test(String(title || '')) || PUNCTUATION_SOUP_PATTERN.test(String(title || ''));
}

export function buildBroadRoleFixtureReport(fixture) {
  const { jobTitle, industry, tasks } = fixture;
  return normalizeReportData(buildDemoReportData(jobTitle, industry, tasks, {
    selected_tasks: tasks.map((label) => ({ label })),
    primary_tasks: tasks,
    clarifiers: BROAD_ROLE_FIXTURE_CLARIFIERS,
  }));
}

export function evaluateBroadRoleFixtureReport(fixture, normalized) {
  const primary = normalized?.recommendation_stack?.primary || null;
  const backup = normalized?.recommendation_stack?.conservative_backup || null;
  const topPivot = normalized?.pivots?.[0] || null;
  const stayPath = normalized?.stay_path || null;
  const checks = [
    { key: 'primary_exists', passed: Boolean(primary?.title), detail: 'Primary recommendation exists.' },
    { key: 'backup_exists', passed: Boolean(backup?.title), detail: 'Conservative backup exists.' },
    { key: 'top_pivot_exists', passed: Boolean(topPivot?.title), detail: 'Top pivot exists.' },
    { key: 'stay_path_exists', passed: Boolean(stayPath?.title), detail: 'Stay path exists.' },
    { key: 'proof_builder', passed: Boolean(normalized?.proof_asset_builder?.title) && (normalized?.proof_asset_builder?.sections || []).length >= 3, detail: 'Proof asset builder is structured.' },
    { key: 'stay_proof_builder', passed: Boolean(normalized?.stay_proof_asset_builder?.title), detail: 'Stay proof asset builder exists.' },
    { key: 'pivot_learning_path', passed: (topPivot?.learning_path || []).length >= 1, detail: 'Top pivot learning path exists.' },
    { key: 'stay_learning_path', passed: (stayPath?.learning_path || []).length >= 1, detail: 'Stay learning path exists.' },
    { key: 'quality_audit', passed: ['passed', 'repaired'].includes(normalized?.quality_audit?.status), detail: 'Quality audit passed or repaired.' },
    { key: 'top_pivot_not_synthetic', passed: !titleHasSyntheticDrift(topPivot?.title), detail: 'Top pivot avoided synthetic or over-senior drift.' },
    { key: 'backup_not_synthetic', passed: !titleHasSyntheticDrift(backup?.title), detail: 'Backup pivot avoided synthetic or over-senior drift.' },
    { key: 'top_pivot_family_match', passed: fixture.topPivotPattern.test(String(topPivot?.title || '')), detail: 'Top pivot stayed in a sane role-family lane.' },
    { key: 'stay_path_family_match', passed: fixture.stayPattern.test(String(stayPath?.title || '')), detail: 'Stay path stayed in a sane lane.' },
    {
      key: 'stay_primary_alignment',
      passed: primary?.type !== 'stay' || primary?.title === stayPath?.title,
      detail: 'Stay-primary reports align the primary recommendation with the stay path.',
    },
  ];

  return {
    passed: checks.every((item) => item.passed),
    checks,
    issues: checks.filter((item) => !item.passed).map((item) => item.detail),
    primary,
    backup,
    topPivot,
    stayPath,
  };
}

export function buildBroadRoleFixtureSnapshots() {
  return BROAD_ROLE_FIXTURES.map((fixture) => {
    const report = buildBroadRoleFixtureReport(fixture);
    const evaluation = evaluateBroadRoleFixtureReport(fixture, report);
    return {
      fixture,
      report,
      evaluation,
    };
  });
}

export function summarizeBroadRoleFixtureSnapshots(snapshots = []) {
  const entries = Array.isArray(snapshots) ? snapshots : [];
  const passedCount = entries.filter((item) => item.evaluation?.passed).length;
  const stayPrimaryCount = entries.filter((item) => item.report?.recommendation_stack?.primary?.type === 'stay').length;
  const marketBackedPrimaryCount = entries.filter((item) => item.report?.recommendation_stack?.primary?.confidence_state === 'market-backed').length;
  const lowConfidenceBackupCount = entries.filter((item) => item.report?.recommendation_stack?.conservative_backup?.confidence_state === 'low-confidence').length;

  return {
    fixture_count: entries.length,
    pass_rate: entries.length ? Math.round((passedCount / entries.length) * 100) : 0,
    passed_count: passedCount,
    stay_primary_count: stayPrimaryCount,
    market_backed_primary_count: marketBackedPrimaryCount,
    low_confidence_backup_count: lowConfidenceBackupCount,
  };
}
