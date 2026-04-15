import { BROAD_ROLE_FIXTURES, BROAD_ROLE_FIXTURE_CLARIFIERS } from '../data/broad-role-fixtures.js';
import { SENIOR_ROLE_FIXTURES, SENIOR_ROLE_FIXTURE_CLARIFIERS } from '../data/senior-role-fixtures.js';
import { buildDemoReportData, normalizeReportData } from './report-data.js';

const SYNTHETIC_DRIFT_PATTERN = /(entrepreneur|visionary|ninja|guru|infrastructure|architect|director|chief|principal|head of)/i;
const SENIOR_SYNTHETIC_DRIFT_PATTERN = /(entrepreneur|visionary|ninja|guru|infrastructure|architect|chief)/i;
const PUNCTUATION_SOUP_PATTERN = /[–—:]/;

function slugifyFixtureLabel(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function titleHasSyntheticDrift(title = '', allowSeniorTitles = false) {
  const pattern = allowSeniorTitles ? SENIOR_SYNTHETIC_DRIFT_PATTERN : SYNTHETIC_DRIFT_PATTERN;
  return pattern.test(String(title || '')) || PUNCTUATION_SOUP_PATTERN.test(String(title || ''));
}

function buildFixtureClarifiers(defaultClarifiers = {}, fixture = {}) {
  return {
    ...defaultClarifiers,
    ...(fixture?.clarifiers && typeof fixture.clarifiers === 'object' ? fixture.clarifiers : {}),
  };
}

function buildFixtureReportWithDefaults(fixture, defaultClarifiers) {
  const { jobTitle, industry, tasks } = fixture;
  return normalizeReportData(buildDemoReportData(jobTitle, industry, tasks, {
    selected_tasks: tasks.map((label) => ({ label })),
    primary_tasks: tasks,
    clarifiers: buildFixtureClarifiers(defaultClarifiers, fixture),
  }));
}

export function buildBroadRoleFixtureReport(fixture) {
  return buildFixtureReportWithDefaults(fixture, BROAD_ROLE_FIXTURE_CLARIFIERS);
}

export function buildSeniorRoleFixtureReport(fixture) {
  return buildFixtureReportWithDefaults(fixture, SENIOR_ROLE_FIXTURE_CLARIFIERS);
}

export function evaluateBroadRoleFixtureReport(fixture, normalized) {
  const primary = normalized?.recommendation_stack?.primary || null;
  const backup = normalized?.recommendation_stack?.conservative_backup || null;
  const topPivot = normalized?.pivots?.[0] || null;
  const stayPath = normalized?.stay_path || null;
  const allowSeniorTitles = Boolean(fixture?.allowSeniorTitles);
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
    { key: 'top_pivot_not_synthetic', passed: !titleHasSyntheticDrift(topPivot?.title, allowSeniorTitles), detail: 'Top pivot avoided synthetic or over-senior drift.' },
    { key: 'backup_not_synthetic', passed: !titleHasSyntheticDrift(backup?.title, allowSeniorTitles), detail: 'Backup pivot avoided synthetic or over-senior drift.' },
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

function buildFixtureSnapshots(fixtures, buildReport, catalogKey, catalogLabel) {
  return fixtures.map((fixture) => {
    const report = buildReport(fixture);
    const evaluation = evaluateBroadRoleFixtureReport(fixture, report);
    return {
      catalog: catalogKey,
      catalog_label: catalogLabel,
      slug: slugifyFixtureLabel(fixture.jobTitle),
      fixture,
      report,
      evaluation,
    };
  });
}

function buildBroadRoleFixtureSnapshots() {
  return buildFixtureSnapshots(BROAD_ROLE_FIXTURES, buildBroadRoleFixtureReport, 'broad', 'Broad roles');
}

function buildSeniorRoleFixtureSnapshots() {
  return buildFixtureSnapshots(SENIOR_ROLE_FIXTURES, buildSeniorRoleFixtureReport, 'senior', 'Senior roles');
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

export function buildQaFixtureSnapshotGroups() {
  const broadSnapshots = buildBroadRoleFixtureSnapshots();
  const seniorSnapshots = buildSeniorRoleFixtureSnapshots();

  return [
    {
      key: 'broad',
      label: 'Broad roles',
      snapshots: broadSnapshots,
      summary: summarizeBroadRoleFixtureSnapshots(broadSnapshots),
    },
    {
      key: 'senior',
      label: 'Senior roles',
      snapshots: seniorSnapshots,
      summary: summarizeBroadRoleFixtureSnapshots(seniorSnapshots),
    },
  ];
}

export function buildQaFixturePreview(catalogKey = '', slug = '') {
  const normalizedCatalog = String(catalogKey || '').toLowerCase();
  const normalizedSlug = slugifyFixtureLabel(slug);
  const snapshots = normalizedCatalog === 'senior'
    ? buildSeniorRoleFixtureSnapshots()
    : normalizedCatalog === 'broad'
      ? buildBroadRoleFixtureSnapshots()
      : [];
  return snapshots.find((snapshot) => snapshot.slug === normalizedSlug) || null;
}
