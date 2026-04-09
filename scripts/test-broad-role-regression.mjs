import assert from 'node:assert/strict';
import { BROAD_ROLE_FIXTURES } from '../data/broad-role-fixtures.js';
import { buildBroadRoleFixtureReport, evaluateBroadRoleFixtureReport } from '../lib/broad-role-fixtures.js';

function testBroadRoleFixturesStaySane() {
  for (const fixture of BROAD_ROLE_FIXTURES) {
    const normalized = buildBroadRoleFixtureReport(fixture);
    const evaluation = evaluateBroadRoleFixtureReport(fixture, normalized);
    assert.ok(evaluation.passed, `${fixture.jobTitle}: ${evaluation.issues.join(' | ')}`);
  }
}

testBroadRoleFixturesStaySane();

console.log('Broad role regression tests passed.');
