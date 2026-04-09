import assert from 'node:assert/strict';
import { buildDemoReportData, normalizeReportData } from '../lib/report-data.js';

const fixtures = [
  {
    jobTitle: 'Data Analyst',
    industry: 'SaaS',
    tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    topPivotPattern: /(data|analytics|business operations|business intelligence|strategy and operations|operations manager)/i,
    stayPattern: /(strategic operations manager|analytics|operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Customer Success Manager',
    industry: 'SaaS',
    tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    topPivotPattern: /(customer|account|enablement|operations)/i,
    stayPattern: /(customer strategy lead|customer success lead|customer operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Executive Assistant',
    industry: 'Healthcare',
    tasks: ['Calendar coordination', 'Meeting prep', 'Executive follow-up'],
    topPivotPattern: /(operations|administrative|business operations|executive operations)/i,
    stayPattern: /(higher-leverage version|operations lead|executive operations lead)/i,
  },
  {
    jobTitle: 'Operations Manager',
    industry: 'Manufacturing',
    tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
    topPivotPattern: /(operations|program|project|delivery|workflow)/i,
    stayPattern: /(program operations lead|operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Marketing Manager',
    industry: 'Retail',
    tasks: ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
    topPivotPattern: /(marketing|gtm|growth|product marketing|operations)/i,
    stayPattern: /(marketing strategy lead|marketing operations lead|growth strategy lead|higher-leverage version)/i,
  },
];

function buildFixtureReport({ jobTitle, industry, tasks }) {
  return normalizeReportData(buildDemoReportData(jobTitle, industry, tasks, {
    selected_tasks: tasks.map((label) => ({ label })),
    primary_tasks: tasks,
    clarifiers: {
      goal_now: 'hybrid_transition',
      timeline_urgency: 'within_6_months',
      years_experience_band: '6_10',
      location_preference: 'united_states',
      ai_maturity: 'weekly',
    },
  }));
}

function assertNoSyntheticDrift(title, label) {
  assert.ok(title, `${label} should exist`);
  assert.doesNotMatch(title, /(entrepreneur|visionary|ninja|guru|infrastructure|architect|director|chief|principal|head of)/i, `${label} drifted into a synthetic or over-senior title`);
  assert.doesNotMatch(title, /[–—:]/, `${label} drifted into punctuation-heavy title soup`);
}

function testBroadRoleFixturesStaySane() {
  for (const fixture of fixtures) {
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
