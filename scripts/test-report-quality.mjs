import assert from 'node:assert/strict';
import { buildDemoReportData, normalizeReportData, reportDataToEmailHtml } from '../lib/report-data.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildLegalFixture() {
  const report = buildDemoReportData(
    'Legal Operations Manager',
    'Healthcare',
    ['Contract intake triage', 'Policy workflow management', 'Vendor agreement review'],
    {
      selected_tasks: [
        { label: 'Contract intake triage' },
        { label: 'Policy workflow management' },
        { label: 'Vendor agreement review' },
      ],
      primary_tasks: ['Contract intake triage'],
      domain_focus: 'commercial contracts and legal operations',
      decision_scope: 'workflow owner',
      core_systems: 'CLM, ticketing, document management',
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'customer-success-manager',
    title: 'Customer Success Manager',
    ranking_reason: 'This pivot is being pushed down because the market signal is thin.',
    live_market_signal: {
      ...(report.pivots[0].live_market_signal || {}),
      ranking_reason: 'This pivot is being pushed down because the market signal is thin.',
      matched_openings_count: 0,
      profile_fit_score: 0,
    },
    skill_gaps: [
      {
        skill_name: 'Contract lifecycle management',
        category: 'domain',
        current_strength: 'Understands intake and routing.',
        required_level: 'Can manage CLM workflows and governance.',
        gap_priority: 'critical',
        why_it_matters: 'Contract roles need visible CLM fluency.',
        evidence_to_build: 'Build a contract intake and clause-routing map.',
        how_to_close_gap: 'Practice CLM workflow mapping on one real contract process.',
        resource_title: 'AI For Everyone',
        resource_provider: 'Coursera',
        resource_url: 'https://www.coursera.org/learn/ai-for-everyone',
        resource_access: 'paid',
        resource_verified: true,
      },
    ],
  };

  report.pivots[1] = {
    ...report.pivots[1],
    id: 'legal-operations-analyst',
    title: 'Legal Operations Analyst',
    skill_gaps: report.pivots[0].skill_gaps,
  };

  report.first_30_days = {
    next_7_days: ['Review 12 live job descriptions for AI Operations Analyst.'],
    next_30_days: ['Build one proof asset for AI Operations Analyst.'],
    avoid: ['Do not learn everything at once.'],
    proof_asset: {
      title: 'AI Operations Analyst proof asset',
      description: 'Build a generic AI workflow artifact.',
      why_it_matters: 'It shows action.',
    },
  };

  delete report.proof_asset_builder;
  delete report.paid_value_summary;
  return report;
}

function assertNoNegativeTopCopy(report) {
  const topPivot = report.pivots[0];
  const copy = `${topPivot.ranking_reason || ''} ${topPivot.live_market_signal?.ranking_reason || ''}`.toLowerCase();
  assert.equal(copy.includes('pushed down'), false);
  assert.equal(copy.includes('penalized'), false);
}

function testTopPivotFamilyRepairAndCopy() {
  const normalized = normalizeReportData(buildLegalFixture());

  assert.equal(normalized.pivots[0].title, 'Legal Operations Analyst');
  assert.equal(normalized.active_pivot_id, 'legal-operations-analyst');
  assertNoNegativeTopCopy(normalized);
  assert.equal(normalized.quality_audit.status, 'repaired');
  assert.ok(normalized.quality_audit.repairs.some((item) => item.includes('Moved Legal Operations Analyst')));
}

function testGenericAiResourceRemovedFromNonAiGap() {
  const normalized = normalizeReportData(buildLegalFixture());
  const resourceTitles = (normalized.pivots[0].skill_gaps || []).map((skill) => skill.resource_title);

  assert.equal(resourceTitles.includes('AI For Everyone'), false);
  assert.equal(normalized.pivots[0].skill_gaps[0].resource_verification_status, 'quality-gate-removed');
}

function testFirst30DaysReferencesFinalPivot() {
  const normalized = normalizeReportData(buildLegalFixture());
  const first30Text = [
    ...(normalized.first_30_days.next_7_days || []),
    ...(normalized.first_30_days.next_30_days || []),
    normalized.first_30_days.proof_asset?.title,
  ].join(' ');

  assert.match(first30Text, /Legal Operations Analyst/i);
  assert.doesNotMatch(first30Text, /AI Operations Analyst/i);
}

function testProofAssetBuilderAndPaidSummaryArePresent() {
  const normalized = normalizeReportData(buildLegalFixture());

  assert.equal(normalized.proof_asset_builder.target_role, normalized.pivots[0].title);
  assert.ok(normalized.proof_asset_builder.title);
  assert.ok(normalized.proof_asset_builder.sections.length >= 3);
  assert.ok(normalized.proof_asset_builder.checklist.length >= 3);
  assert.ok(normalized.proof_asset_builder.audience);
  assert.ok(normalized.proof_asset_builder.sample_metrics.length >= 2);
  assert.ok(normalized.proof_asset_builder.internal_version?.title);
  assert.ok(normalized.proof_asset_builder.external_version?.title);
  assert.match(normalized.paid_value_summary.headline, /Legal Operations Analyst/i);
}

function testStayAdvancePremiumSectionsArePresent() {
  const report = buildDemoReportData(
    'Procurement Analyst',
    'Manufacturing',
    ['Vendor performance reporting', 'Sourcing analysis', 'Stakeholder updates'],
    {
      selected_tasks: [{ label: 'Vendor performance reporting' }],
      primary_tasks: ['Vendor performance reporting', 'Sourcing analysis', 'Stakeholder updates'],
      domain_focus: 'supplier performance and spend analytics',
    }
  );

  const normalized = normalizeReportData(report);

  assert.ok(normalized.stay_and_advance.ai_leverage_playbook.headline);
  assert.ok(normalized.stay_and_advance.ai_leverage_playbook.plays.length >= 3);
  assert.ok(normalized.stay_and_advance.promotion_conversation_pack.meeting_goal);
  assert.ok(normalized.stay_and_advance.promotion_conversation_pack.talk_track.length >= 3);
  assert.ok(normalized.stay_proof_asset_builder.title);
  assert.ok(normalized.stay_proof_asset_builder.internal_version?.title);
  assert.match(normalized.stay_proof_asset_builder.target_role, /Strategic Sourcing Manager|current role/i);
}

function testEmailHtmlStartsWithActionPlan() {
  const html = reportDataToEmailHtml(clone(buildLegalFixture()));

  assert.match(html, /YOUR ACTION PLAN/);
  assert.match(html, /PROOF ASSET BUILDER/);
  assert.match(html, /Legal Operations Analyst/);
}

function testProcurementTopSkillUsesProcurementResource() {
  const report = buildDemoReportData(
    'Procurement Analyst',
    'Manufacturing',
    ['Vendor performance reporting', 'Sourcing analysis'],
    {
      selected_tasks: [{ label: 'Vendor performance reporting' }],
      primary_tasks: ['Vendor performance reporting'],
      domain_focus: 'supplier performance and spend analytics',
    }
  );
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'procurement-intelligence-manager',
    title: 'Procurement Intelligence Manager',
    skill_gaps: [
      {
        skill_name: 'Contract lifecycle management',
        category: 'domain',
        current_strength: 'Some vendor workflow exposure.',
        required_level: 'Can manage supplier decisions with data.',
        gap_priority: 'critical',
        why_it_matters: 'Procurement roles need supplier data fluency.',
        evidence_to_build: 'Build a supplier scorecard.',
        how_to_close_gap: 'Study procurement operations.',
        resource_title: 'Digital Contracting Academy',
        resource_provider: 'Ironclad',
        resource_url: 'https://academy.ironcladapp.com/',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.pivots[0].skill_gaps[0].skill_name, 'Procurement analytics');
  assert.equal(normalized.pivots[0].skill_gaps[0].resource_title, 'Global Procurement and Sourcing Specialization');
  assert.match(normalized.first_30_days.next_7_days.join(' '), /Procurement analytics/i);
  assert.match(normalized.paid_value_summary.first_learning_step, /Global Procurement and Sourcing Specialization/i);
}

function testStayAdvanceLearningPathDoesNotInheritPivotCourse() {
  const report = buildDemoReportData(
    'Procurement Analyst',
    'Manufacturing',
    ['Vendor performance reporting', 'Sourcing analysis'],
    {
      selected_tasks: [{ label: 'Vendor performance reporting' }],
      primary_tasks: ['Vendor performance reporting'],
      domain_focus: 'supplier performance and spend analytics',
    }
  );
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'procurement-intelligence-manager',
    title: 'Procurement Intelligence Manager',
    skill_gaps: [
      {
        skill_name: 'Procurement analytics',
        category: 'market demand',
        current_strength: 'Some vendor workflow exposure.',
        required_level: 'Can manage supplier decisions with data.',
        gap_priority: 'critical',
        why_it_matters: 'Procurement roles need supplier data fluency.',
        evidence_to_build: 'Build a supplier scorecard.',
        how_to_close_gap: 'Study procurement operations.',
        resource_title: 'Global Procurement and Sourcing Specialization',
        resource_provider: 'Coursera',
        resource_url: 'https://www.coursera.org/specializations/procurement-sourcing',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];

  assert.equal(stayGaps[0].skill_name, 'AI workflow design');
  assert.equal(stayGaps[0].resource_title, 'OpenAI Academy');
  assert.notEqual(stayGaps[0].resource_title, 'Global Procurement and Sourcing Specialization');
  assert.equal(stayGaps[1].resource_title, 'Google AI Essentials');
}

function testFinanceSyntheticTitleFallsBackToCanonicalRole() {
  const report = buildDemoReportData(
    'FP&A Analyst',
    'Finance',
    ['Forecasting and planning', 'Scenario modeling and sensitivity analysis'],
    {
      selected_tasks: [{ label: 'Forecasting and planning' }],
      primary_tasks: ['Forecasting and planning', 'Scenario modeling and sensitivity analysis'],
      domain_focus: 'commercial planning and pricing',
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'fpga-digital-sales-strategy',
    title: 'FP&A Strategist – Commercial Growth & Pricing Optimization',
    skill_gaps: [
      {
        skill_name: 'Product Monetization',
        category: 'domain',
        current_strength: 'Knows the planning context.',
        required_level: 'Can connect pricing to business trade-offs.',
        gap_priority: 'critical',
        why_it_matters: 'Commercial finance teams need pricing fluency.',
        evidence_you_already_have: 'Already works on forecasts.',
        how_to_close_gap: 'Practice monetization analysis on one pricing case.',
      },
    ],
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 0,
      ranking_reason: 'This pivot is being pushed down because the market signal is thin.',
    },
    ranking_reason: 'This pivot is being pushed down because the market signal is thin.',
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.pivots[0].title, /Finance Business Partner|Strategic Finance Analyst|Commercial Finance Manager|FP&A Manager|Finance Systems Manager/i);
  assertNoNegativeTopCopy(normalized);
}

function testProjectManagerOverSeniorTitlesFallBackToCanonicalRole() {
  const report = buildDemoReportData(
    'Project Manager',
    'Consulting',
    ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    {
      selected_tasks: [{ label: 'Stakeholder updates and coordination' }],
      primary_tasks: ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
      domain_focus: 'client delivery and execution',
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'director-of-strategic-execution',
    title: 'Director of Strategic Execution',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 0,
    },
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.pivots[0].title, /Project Operations Manager|Program Operations Manager|Delivery Operations Manager|Change Management Lead|Portfolio Operations Manager|Workflow Operations Manager/i);
}

function testHrLowerPivotDoesNotKeepLegalSkillLeakage() {
  const report = buildDemoReportData(
    'HR Business Partner',
    'HR',
    ['Onboarding design and enablement workflows', 'People operations reporting'],
    {
      selected_tasks: [{ label: 'Onboarding design and enablement workflows' }],
      primary_tasks: ['Onboarding design and enablement workflows', 'People operations reporting'],
      domain_focus: 'manager enablement and people operations',
    }
  );

  report.pivots[2] = {
    ...report.pivots[2],
    id: 'ai-program-manager',
    title: 'AI Program Manager',
    skill_gaps: [
      {
        skill_name: 'Clause library and approval routing',
        category: 'domain',
        current_strength: 'Handles policy questions today.',
        required_level: 'Can map legal routing systems.',
        gap_priority: 'critical',
        why_it_matters: 'Legal teams need routing discipline.',
        evidence_you_already_have: 'Works cross-functionally.',
        how_to_close_gap: 'Study contract systems.',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const lowerPivotSkills = (normalized.pivots[2].skill_gaps || []).map((skill) => skill.skill_name).join(' ');
  assert.doesNotMatch(lowerPivotSkills, /Clause library|approval routing|contract/i);
}

function testLearningPathIsPersistedInNormalizedReport() {
  const report = buildDemoReportData(
    'Project Manager',
    'Consulting',
    ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    {
      selected_tasks: [{ label: 'Stakeholder updates and coordination' }],
      primary_tasks: ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    }
  );

  const normalized = normalizeReportData(report);
  assert.ok((normalized.pivots[0].learning_path || []).length >= 1);
  assert.ok((normalized.stay_path.learning_path || []).length >= 1);
  assert.ok(normalized.stay_path.learning_path[0].resource_title);
}

testTopPivotFamilyRepairAndCopy();
testGenericAiResourceRemovedFromNonAiGap();
testFirst30DaysReferencesFinalPivot();
testProofAssetBuilderAndPaidSummaryArePresent();
testStayAdvancePremiumSectionsArePresent();
testEmailHtmlStartsWithActionPlan();
testProcurementTopSkillUsesProcurementResource();
testStayAdvanceLearningPathDoesNotInheritPivotCourse();
testFinanceSyntheticTitleFallsBackToCanonicalRole();
testProjectManagerOverSeniorTitlesFallBackToCanonicalRole();
testHrLowerPivotDoesNotKeepLegalSkillLeakage();
testLearningPathIsPersistedInNormalizedReport();

console.log('Report quality tests passed.');
