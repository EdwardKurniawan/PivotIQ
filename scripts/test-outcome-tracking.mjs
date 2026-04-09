import assert from 'node:assert/strict';
import {
  buildOutcomeFollowupState,
  buildDefaultOutcomeEntry,
  buildOutcomeSummary,
  hasMeaningfulOutcome,
  normalizeOutcomeEntry,
  tractionStatusLabel,
} from '../lib/outcome-tracking.js';

function testDefaultOutcomeEntry() {
  const outcome = buildDefaultOutcomeEntry();
  assert.equal(outcome.built_proof_asset, false);
  assert.equal(outcome.manager_conversation_done, false);
  assert.equal(outcome.traction_status, 'no_signal');
}

function testNormalizeOutcomeEntry() {
  const outcome = normalizeOutcomeEntry({
    built_proof_asset: true,
    manager_conversation_done: true,
    traction_status: 'interview',
    usefulness_rating: '4',
    notes: 'Got traction.',
  });

  assert.equal(outcome.built_proof_asset, true);
  assert.equal(outcome.manager_conversation_done, true);
  assert.equal(outcome.traction_status, 'interview');
  assert.equal(outcome.usefulness_rating, 4);
  assert.equal(outcome.notes, 'Got traction.');
}

function testOutcomeSummaryReflectsMomentum() {
  const summary = buildOutcomeSummary({
    built_proof_asset: true,
    manager_conversation_done: true,
    traction_status: 'broader_scope',
    usefulness_rating: 4,
  });

  assert.match(summary.title, /internal leverage|momentum/i);
  assert.equal(summary.traction_label, tractionStatusLabel('broader_scope'));
  assert.equal(summary.recommendation_quality_state, 'encouraging');
  assert.ok(summary.score >= 50);
}

function testOutcomeSummaryReflectsStrongValidation() {
  const summary = buildOutcomeSummary({
    built_proof_asset: true,
    manager_conversation_done: true,
    traction_status: 'offer',
    usefulness_rating: 5,
  });

  assert.match(summary.title, /career move|offer/i);
  assert.equal(summary.recommendation_quality_state, 'validated');
  assert.ok(summary.score >= 90);
}

function testMeaningfulOutcomeIgnoresEmptyDefaults() {
  assert.equal(hasMeaningfulOutcome(buildDefaultOutcomeEntry()), false);
  assert.equal(hasMeaningfulOutcome({ usefulness_rating: 4 }), true);
}

function testOutcomeFollowupStates() {
  const sevenDay = buildOutcomeFollowupState({
    createdAt: '2026-04-01T09:00:00.000Z',
    outcome: buildDefaultOutcomeEntry(),
    now: '2026-04-09T09:00:00.000Z',
  });
  assert.equal(sevenDay.stage, 'seven_day_due');
  assert.equal(sevenDay.is_due, true);

  const twentyOneDay = buildOutcomeFollowupState({
    createdAt: '2026-03-15T09:00:00.000Z',
    outcome: { built_proof_asset: true, manager_conversation_done: false, traction_status: 'no_signal' },
    now: '2026-04-09T09:00:00.000Z',
  });
  assert.equal(twentyOneDay.stage, 'twenty_one_day_refresh');
  assert.equal(twentyOneDay.is_due, true);
}

testDefaultOutcomeEntry();
testNormalizeOutcomeEntry();
testOutcomeSummaryReflectsMomentum();
testOutcomeSummaryReflectsStrongValidation();
testMeaningfulOutcomeIgnoresEmptyDefaults();
testOutcomeFollowupStates();

console.log('Outcome tracking tests passed.');
