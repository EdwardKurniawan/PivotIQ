import assert from 'node:assert/strict';
import { rankPivotWithMarketSignal } from '../lib/job-gap-analysis.js';

function testMarketFitCanBeatRawModelScore() {
  const modelFavorite = rankPivotWithMarketSignal(
    { title: 'AI Strategy Manager', match_score: 88 },
    {
      matched_openings_count: 10,
      profile_fit_score: 28,
      overlap_skills: ['Stakeholder Management'],
      missing_required_skills: ['SQL', 'Python', 'Forecasting', 'Compliance'],
      model_only_skill_gaps: ['Prompt Engineering', 'AI Literacy'],
    }
  );

  const marketFavorite = rankPivotWithMarketSignal(
    { title: 'Spend Analytics Manager', match_score: 80 },
    {
      matched_openings_count: 18,
      profile_fit_score: 67,
      overlap_skills: ['Data Analysis', 'Vendor Management', 'Stakeholder Management'],
      missing_required_skills: ['SQL'],
      model_only_skill_gaps: [],
    }
  );

  assert.ok(
    marketFavorite.ranking_score > modelFavorite.ranking_score,
    'A pivot with materially better market fit should outrank a pivot with only a higher raw model score.'
  );
}

function testNoOpeningFallbackKeepsOrderingUsable() {
  const stronger = rankPivotWithMarketSignal(
    { title: 'Procurement Strategy Lead', match_score: 84 },
    {
      matched_openings_count: 0,
      profile_fit_score: 0,
      overlap_skills: [],
      missing_required_skills: [],
      model_only_skill_gaps: ['Prompt Engineering'],
    },
    { job_title: 'Procurement Analyst', clarifiers: { management_scope: 'small-team' } }
  );

  const weaker = rankPivotWithMarketSignal(
    { title: 'Procurement Enablement Lead', match_score: 72 },
    {
      matched_openings_count: 0,
      profile_fit_score: 0,
      overlap_skills: [],
      missing_required_skills: [],
      model_only_skill_gaps: ['Prompt Engineering'],
    },
    { job_title: 'Procurement Analyst', clarifiers: { management_scope: 'small-team' } }
  );

  assert.ok(
    stronger.ranking_score > weaker.ranking_score,
    'When no openings are found, fallback scoring should still preserve meaningful ordering from the original model score.'
  );
}

function testRepeatedMissingSkillsCreatePenalty() {
  const aligned = rankPivotWithMarketSignal(
    { title: 'Contract Lifecycle Manager', match_score: 79 },
    {
      matched_openings_count: 12,
      profile_fit_score: 58,
      overlap_skills: ['Compliance', 'Stakeholder Management', 'Policy Interpretation'],
      missing_required_skills: ['CLM Administration'],
      model_only_skill_gaps: [],
    }
  );

  const stretched = rankPivotWithMarketSignal(
    { title: 'Legal Technology Strategy Director', match_score: 86 },
    {
      matched_openings_count: 12,
      profile_fit_score: 34,
      overlap_skills: ['Compliance'],
      missing_required_skills: ['SQL', 'Python', 'Systems Architecture', 'Data Governance', 'Change Leadership'],
      model_only_skill_gaps: ['Prompt Engineering', 'AI Literacy', 'Agent Design'],
    }
  );

  assert.ok(
    aligned.ranking_score > stretched.ranking_score,
    'Repeated missing market-required skills and model-only gaps should push an overreaching pivot down.'
  );
}

try {
  testMarketFitCanBeatRawModelScore();
  console.log('PASS 1: market fit can outrank a higher raw model score');

  testNoOpeningFallbackKeepsOrderingUsable();
  console.log('PASS 2: no-opening fallback preserves ranking separation');

  testRepeatedMissingSkillsCreatePenalty();
  console.log('PASS 3: missing market-required skills penalize stretched pivots');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
