import assert from 'node:assert/strict';
import { buildDemoReportData, normalizeReportData } from '../lib/report-data.js';
import { buildProgressRefreshContext, buildRefreshSummary } from '../lib/report-refresh.js';

function testRefreshContextRequiresSignal() {
  const reportData = buildDemoReportData('Procurement Analyst', 'Manufacturing', ['Vendor performance reporting']);
  const refreshContext = buildProgressRefreshContext({
    reportData,
    weekProgressMap: {},
    startDate: '',
    outcome: null,
    createdAt: '2026-04-01T10:00:00.000Z',
  });

  assert.equal(refreshContext.is_ready, false);
  assert.match(refreshContext.title, /Refresh unlocks/i);
}

function testRefreshContextBecomesReadyWithProofAndOutcome() {
  const reportData = buildDemoReportData('HR Business Partner', 'SaaS', ['Policy rollout']);
  const refreshContext = buildProgressRefreshContext({
    reportData,
    weekProgressMap: {
      2: {
        completed: true,
        notes: 'Shared the workflow map with the people ops lead.',
        action_state: 'ready_to_share',
        proof_asset_status: 'ready',
        manager_conversation_status: 'done',
        last_active_step: 'Built the first workflow map.',
        updated_at: '2026-04-09T09:00:00.000Z',
      },
    },
    startDate: '2026-04-02',
    outcome: {
      built_proof_asset: true,
      manager_conversation_done: true,
      traction_status: 'team_adoption',
      usefulness_rating: 4,
      notes: 'The pilot is now being reused by the team.',
    },
    createdAt: '2026-04-01T10:00:00.000Z',
  });

  assert.equal(refreshContext.is_ready, true);
  assert.equal(refreshContext.proof_ready_count, 1);
  assert.equal(refreshContext.manager_done_count, 1);
  assert.match(refreshContext.body, /Outcome feedback is the strongest refresh input|proof and conversations/i);
}

function testRefreshSummaryCapturesPrimaryMoveChange() {
  const previous = {
    profile: {
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        technical_capability: 'sql_bi',
        proof_state: 'workflow_or_playbook',
      },
    },
    decision: {
      headline: 'Build toward Program Operations Manager now',
    },
    paid_value_summary: {
      first_learning_step: 'SQL / BI: DataCamp',
      first_proof_asset: 'Program Operations Manager proof asset',
    },
    recommendation_stack: {
      primary: {
        id: 'program-operations-manager',
        type: 'pivot',
        title: 'Program Operations Manager',
        confidence_label: 'Strategy-led',
      },
    },
  };
  const next = {
    profile: {
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        technical_capability: 'sql_bi',
        proof_state: 'workflow_or_playbook',
      },
    },
    decision: {
      headline: 'Build toward Delivery Operations Manager now',
    },
    paid_value_summary: {
      first_learning_step: 'Workflow automation design: Zapier Learn in 14 Days',
      first_proof_asset: 'Delivery Operations Manager proof asset',
    },
    recommendation_stack: {
      primary: {
        id: 'delivery-operations-manager',
        type: 'pivot',
        title: 'Delivery Operations Manager',
        confidence_label: 'Market-backed',
      },
    },
    next_move: {
      title: 'Your move this week',
      explanation: 'Turn the refreshed recommendation into one delivery workflow proof asset.',
    },
  };

  const summary = buildRefreshSummary({
    previousReportData: previous,
    refreshedReportData: next,
    progressContext: {
      proof_ready_count: 1,
      manager_done_count: 0,
      meaningful_outcome: false,
      outcome_summary: { traction_label: 'No traction yet' },
    },
    refreshedAt: '2026-04-09T10:00:00.000Z',
  });

  assert.match(summary.headline, /changed/i);
  assert.equal(summary.previous_primary, 'Program Operations Manager');
  assert.equal(summary.current_primary, 'Delivery Operations Manager');
  assert.ok(summary.what_changed.some((item) => /Primary move changed/i.test(item)));
  assert.ok(summary.comparison_rows.some((row) => row.label === 'Primary move' && row.changed));
  assert.ok(summary.comparison_rows.some((row) => row.label === 'First learning focus' && row.changed));
  assert.ok(summary.change_drivers.some((item) => /proof-ready milestone/i.test(item)));
  assert.ok(summary.inputs_considered.some((item) => /Goal now: Active pivot/i.test(item)));
  assert.ok(summary.sections_updated.includes('Primary move'));
}

function testNormalizeReportPreservesRefreshFields() {
  const normalized = normalizeReportData({
    ...buildDemoReportData('FP&A Analyst', 'Retail', ['Scenario modeling']),
    refresh_summary: {
      headline: 'Your report was refreshed around real proof',
      body: 'The report kept the same primary move but tightened the plan.',
      what_changed: ['Primary move stayed on Finance Systems Manager.'],
      previous_primary: 'Finance Systems Manager',
      current_primary: 'Finance Systems Manager',
      next_action: 'Share the forecast scenario model.',
      refreshed_at: '2026-04-09T11:00:00.000Z',
      confidence_delta: 'Strategy-led -> Market-backed',
      change_drivers: ['1 proof-ready milestone told PivotIQ you have stronger visible evidence now.'],
      inputs_considered: ['Technical capability: SQL / BI'],
      comparison_rows: [
        { key: 'primary_move', label: 'Primary move', before: 'Finance Systems Manager', after: 'Finance Systems Manager', changed: false },
      ],
      sections_updated: ['Confidence'],
    },
    refresh_count: 2,
    refreshed_at: '2026-04-09T11:00:00.000Z',
  });

  assert.equal(normalized.refresh_count, 2);
  assert.equal(normalized.refresh_summary.current_primary, 'Finance Systems Manager');
  assert.equal(normalized.refresh_summary.change_drivers[0], '1 proof-ready milestone told PivotIQ you have stronger visible evidence now.');
  assert.equal(normalized.refresh_summary.inputs_considered[0], 'Technical capability: SQL / BI');
  assert.equal(normalized.refresh_summary.comparison_rows[0].label, 'Primary move');
  assert.equal(normalized.refresh_summary.sections_updated[0], 'Confidence');
  assert.equal(normalized.refreshed_at, '2026-04-09T11:00:00.000Z');
}

testRefreshContextRequiresSignal();
testRefreshContextBecomesReadyWithProofAndOutcome();
testRefreshSummaryCapturesPrimaryMoveChange();
testNormalizeReportPreservesRefreshFields();

console.log('Report refresh tests passed.');
