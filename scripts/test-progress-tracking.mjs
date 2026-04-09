import assert from 'node:assert/strict';
import {
  buildExecutionSummary,
  buildWeekProgressMap,
  getCompletedWeeks,
  hydrateLegacyWeekProgress,
} from '../lib/progress-tracking.js';

function testBuildWeekProgressMap() {
  const map = buildWeekProgressMap([
    {
      week_number: 2,
      completed_at: '2026-04-09T09:00:00.000Z',
      notes: 'Built the first draft.',
      action_state: 'building',
      proof_asset_status: 'drafting',
      manager_conversation_status: 'drafted',
      last_active_step: 'Mapped the workflow.',
      updated_at: '2026-04-09T09:10:00.000Z',
    },
  ]);

  assert.equal(map[2].completed, true);
  assert.equal(map[2].action_state, 'building');
  assert.equal(map[2].proof_asset_status, 'drafting');
  assert.equal(map[2].manager_conversation_status, 'drafted');
}

function testHydrateLegacyWeekProgress() {
  const map = hydrateLegacyWeekProgress([1, 3], { 3: 'Shared with manager.' });
  assert.deepEqual(getCompletedWeeks(map), [1, 3]);
  assert.equal(map[3].notes, 'Shared with manager.');
  assert.equal(map[3].action_state, 'not_started');
}

function testExecutionSummaryPrefersSettingStartDate() {
  const summary = buildExecutionSummary({
    roadmapWeeks: [{ week_number: 1, goal: 'Pick one workflow', actions: ['Review the current process'] }],
    weekProgressMap: {},
    startDate: '',
  });

  assert.match(summary.title, /Start week 1/i);
  assert.match(summary.body, /Set your roadmap start date/i);
}

function testExecutionSummaryMovesFromResearchToBuild() {
  const summary = buildExecutionSummary({
    roadmapWeeks: [{ week_number: 2, goal: 'Build proof', actions: ['Research the workflow', 'Create the first asset'] }],
    weekProgressMap: {
      2: {
        completed: false,
        notes: '',
        action_state: 'researching',
        proof_asset_status: 'not_started',
        manager_conversation_status: 'not_started',
        last_active_step: '',
      },
    },
    startDate: '2026-04-09',
  });

  assert.match(summary.title, /build mode/i);
  assert.match(summary.body, /Create the first asset/i);
}

testBuildWeekProgressMap();
testHydrateLegacyWeekProgress();
testExecutionSummaryPrefersSettingStartDate();
testExecutionSummaryMovesFromResearchToBuild();

console.log('Progress tracking tests passed.');
