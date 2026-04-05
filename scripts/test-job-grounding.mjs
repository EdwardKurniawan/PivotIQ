import assert from 'node:assert/strict';
import { canonicalRoleFamilyForTrack, classifyJobTrack, isGroundingEligibleForPivot, sanitizeGroundingSkills } from '../lib/job-grounding.js';

function testClassifiesPollutedLegalTitlesMorePrecisely() {
  assert.equal(classifyJobTrack({ title: 'Technical Recruiter (Fixed Term Contract)', role_family: 'legal' }), 'recruiting');
  assert.equal(classifyJobTrack({ title: 'Product Manager, Risk & Compliance', role_family: 'legal' }), 'product-compliance');
  assert.equal(classifyJobTrack({ title: 'Contracting Operations Specialist', role_family: 'operations' }), 'contract-ops');
}

function testSanitizesHallucinatedLegalSkills() {
  const cleaned = sanitizeGroundingSkills(['Compliance', 'Enablement', 'Procurement', 'Stakeholder Management'], 'compliance-risk', 'Compliance Analyst');
  assert.deepEqual(cleaned, ['Compliance', 'Stakeholder Management']);
}

function testExcludesNonAdjacentLegalOpeningsFromGrounding() {
  assert.equal(
    isGroundingEligibleForPivot({ title: 'Technical Recruiter (Fixed Term Contract)', role_family: 'legal' }, 'Compliance Risk Analyst', 'legal'),
    false
  );
  assert.equal(
    isGroundingEligibleForPivot({ title: 'Product Manager, Risk & Compliance', role_family: 'legal' }, 'Compliance Risk Analyst', 'legal'),
    false
  );
  assert.equal(
    isGroundingEligibleForPivot({ title: 'Contracting Operations Specialist', role_family: 'operations' }, 'Contract Operations Consultant', 'legal'),
    true
  );
  assert.equal(canonicalRoleFamilyForTrack('contract-ops'), 'legal');
}

try {
  testClassifiesPollutedLegalTitlesMorePrecisely();
  console.log('PASS 1: job track classification separates polluted legal titles');

  testSanitizesHallucinatedLegalSkills();
  console.log('PASS 2: legal skill sanitation removes off-track requirements');

  testExcludesNonAdjacentLegalOpeningsFromGrounding();
  console.log('PASS 3: legal grounding eligibility excludes non-adjacent roles');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
