import assert from 'node:assert/strict';
import { BROAD_ROLE_FIXTURES } from '../data/broad-role-fixtures.js';
import { SENIOR_ROLE_FIXTURES } from '../data/senior-role-fixtures.js';
import {
  buildBroadRoleFixtureReport,
  buildSeniorRoleFixtureReport,
  evaluateBroadRoleFixtureReport,
} from '../lib/broad-role-fixtures.js';

function testFixtureCatalog(label, fixtures, buildReport) {
  for (const fixture of fixtures) {
    const normalized = buildReport(fixture);
    const evaluation = evaluateBroadRoleFixtureReport(fixture, normalized);
    assert.ok(evaluation.passed, `${label} / ${fixture.jobTitle}: ${evaluation.issues.join(' | ')}`);
  }
}

testFixtureCatalog('Broad roles', BROAD_ROLE_FIXTURES, buildBroadRoleFixtureReport);
testFixtureCatalog('Senior roles', SENIOR_ROLE_FIXTURES, buildSeniorRoleFixtureReport);

console.log('QA fixture regression tests passed.');
