import assert from 'node:assert/strict';
import { analyzeRecommendationQualityRows } from '../lib/recommendation-quality.js';

function buildReportRow({
  id,
  jobTitle,
  primaryType,
  confidenceState,
  qualityStatus = 'passed',
  outcome = null,
}) {
  const isPivotPrimary = primaryType === 'pivot';
  return {
    id,
    slug: id,
    job_title: jobTitle,
    industry: 'General',
    updated_at: '2026-04-09T10:00:00.000Z',
    report_data: {
      profile: { job_title: jobTitle, industry: 'General', tasks: [] },
      summary: { overall_score: isPivotPrimary ? 78 : 45, risk_level: isPivotPrimary ? 'HIGH' : 'MODERATE' },
      pivots: [{
        id: 'pivot-1',
        title: 'Operations Manager',
        match_score: isPivotPrimary ? 84 : 72,
        live_market_signal: {
          matched_openings_count: isPivotPrimary ? 6 : 1,
          profile_fit_score: isPivotPrimary ? 42 : 18,
        },
      }],
      stay_path: isPivotPrimary ? null : { id: 'stay-1', title: 'Operations Lead', decision_frame: 'stay and advance', skill_gaps: [] },
      stay_and_advance: isPivotPrimary ? null : { recommendation: 'Use AI to strengthen your current role.' },
      recommendation_stack: isPivotPrimary ? undefined : {
        primary: {
          type: primaryType,
          title: 'Operations Lead',
          confidence_state: confidenceState,
          confidence_label: confidenceState,
        },
      },
      quality_audit: { status: qualityStatus, warnings: [], repairs: [] },
    },
    report_outcomes: outcome ? [outcome] : [],
  };
}

function testRecommendationQualityAudit() {
  const audit = analyzeRecommendationQualityRows([
    buildReportRow({
      id: 'report-1',
      jobTitle: 'FP&A Analyst',
      primaryType: 'stay',
      confidenceState: 'strategy-led',
      outcome: {
        built_proof_asset: true,
        manager_conversation_done: true,
        traction_status: 'broader_scope',
        usefulness_rating: 4,
        notes: 'Internal scope expanded.',
      },
    }),
    buildReportRow({
      id: 'report-2',
      jobTitle: 'Project Manager',
      primaryType: 'pivot',
      confidenceState: 'low-confidence',
      qualityStatus: 'repaired',
      outcome: {
        built_proof_asset: false,
        manager_conversation_done: false,
        traction_status: 'no_signal',
        usefulness_rating: 2,
        notes: 'Recommendation felt weak.',
      },
    }),
    buildReportRow({
      id: 'report-3',
      jobTitle: 'HR Business Partner',
      primaryType: 'pivot',
      confidenceState: 'market-backed',
      outcome: null,
    }),
  ]);

  assert.equal(audit.scanned_reports, 3);
  assert.equal(audit.reports_with_outcomes, 2);
  assert.equal(audit.coverage_rate, 67);
  assert.equal(audit.confidence_performance.length, 2);
  assert.equal(audit.recommendation_type_performance.length, 2);
  assert.ok(audit.strong_examples.some((item) => item.job_title === 'FP&A Analyst'));
  assert.ok(audit.weak_examples.some((item) => item.job_title === 'Project Manager'));
  assert.ok(audit.action_items.length >= 1);
  assert.ok(audit.tuning_playbook.policy_levers.length >= 1);
  assert.ok(audit.tuning_playbook.policy_levers.some((item) => /low-confidence|stay-path bias|proof-builder specificity|outcome sampling/i.test(item.lever) || /low-confidence|stay-and-advance|proof|collect more outcome feedback/i.test(item.recommendation)));
  assert.ok(audit.tuning_playbook.winning_patterns.length >= 1);
  assert.ok(audit.tuning_playbook.watchlist_patterns.length >= 1);
}

testRecommendationQualityAudit();

console.log('Recommendation quality tests passed.');
