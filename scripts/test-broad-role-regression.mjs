import assert from 'node:assert/strict';
import { BROAD_ROLE_FIXTURES, BROAD_ROLE_FIXTURE_CLARIFIERS } from '../data/broad-role-fixtures.js';
import { buildDemoReportData, normalizeReportData } from '../lib/report-data.js';

function buildFixtureReport({ jobTitle, industry, tasks }) {
  return normalizeReportData(buildDemoReportData(jobTitle, industry, tasks, {
    selected_tasks: tasks.map((label) => ({ label })),
    primary_tasks: tasks,
    clarifiers: BROAD_ROLE_FIXTURE_CLARIFIERS,
  }));
}

function assertNoSyntheticDrift(title, label) {
  assert.ok(title, `${label} should exist`);
  assert.doesNotMatch(title, /(entrepreneur|visionary|ninja|guru|infrastructure|architect|director|chief|principal|head of)/i, `${label} drifted into a synthetic or over-senior title`);
  assert.doesNotMatch(title, /[–—:]/, `${label} drifted into punctuation-heavy title soup`);
}

function testBroadRoleFixturesStaySane() {
  for (const fixture of BROAD_ROLE_FIXTURES) {
    const normalized = buildFixtureReport(fixture);
    const primary = normalized.recommendation_stack?.primary;
    const backup = normalized.recommendation_stack?.conservative_backup;
    const topPivot = normalized.pivots?.[0];
    const stayPath = normalized.stay_path;

    assert.ok(primary?.title, `${fixture.jobTitle}: primary recommendation should exist`);
    assert.ok(backup?.title, `${fixture.jobTitle}: conservative backup should exist`);
    assert.ok(topPivot?.title, `${fixture.jobTitle}: top pivot should exist`);
    assert.ok(stayPath?.title, `${fixture.jobTitle}: stay path should exist`);
    assert.ok(normalized.proof_asset_builder?.title, `${fixture.jobTitle}: proof asset builder should exist`);
    assert.ok((normalized.proof_asset_builder?.sections || []).length >= 3, `${fixture.jobTitle}: proof asset builder should be structured`);
    assert.ok(normalized.stay_proof_asset_builder?.title, `${fixture.jobTitle}: stay proof builder should exist`);
    assert.ok((topPivot.learning_path || []).length >= 1, `${fixture.jobTitle}: top pivot learning path should exist`);
    assert.ok((stayPath.learning_path || []).length >= 1, `${fixture.jobTitle}: stay learning path should exist`);
    assert.ok(['passed', 'repaired'].includes(normalized.quality_audit?.status), `${fixture.jobTitle}: quality audit should pass or repair`);

    assertNoSyntheticDrift(topPivot.title, `${fixture.jobTitle} top pivot`);
    assertNoSyntheticDrift(backup.title, `${fixture.jobTitle} backup pivot`);
    assert.match(topPivot.title, fixture.topPivotPattern, `${fixture.jobTitle}: top pivot should stay in a sane role family lane`);
    assert.match(stayPath.title, fixture.stayPattern, `${fixture.jobTitle}: stay path should stay in a sane lane`);

    if (primary.type === 'stay') {
      assert.equal(primary.title, stayPath.title, `${fixture.jobTitle}: stay-primary reports should align the primary title with the stay path`);
    }
  }
}

testBroadRoleFixturesStaySane();

console.log('Broad role regression tests passed.');
