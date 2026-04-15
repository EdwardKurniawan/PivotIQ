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

  assert.match(first30Text, /Legal Operations Analyst|Legal Technology Lead/i);
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
  assert.ok(normalized.proof_asset_builder.execution_guide?.one_week_ship);
  assert.ok(normalized.proof_asset_builder.execution_guide?.manager_readout);
  assert.match(normalized.paid_value_summary.headline, /Legal Technology Lead|Legal Operations Analyst/i);
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
  assert.ok(normalized.stay_and_advance.role_operating_system.headline);
  assert.ok(normalized.stay_and_advance.role_operating_system.automate.length >= 1);
  assert.ok(normalized.stay_and_advance.role_operating_system.lead.length >= 1);
  assert.ok(normalized.stay_and_advance.job_safety_case.headline);
  assert.ok(normalized.stay_and_advance.job_safety_case.safer_because.length >= 3);
  assert.ok(normalized.stay_and_advance.promotion_case.headline);
  assert.ok(normalized.stay_and_advance.promotion_case.leadership_case.length >= 3);
  assert.ok(normalized.stay_and_advance.promotion_conversation_pack.meeting_goal);
  assert.ok(normalized.stay_and_advance.promotion_conversation_pack.talk_track.length >= 3);
  assert.ok(normalized.stay_proof_asset_builder.title);
  assert.ok(normalized.stay_proof_asset_builder.internal_version?.title);
  assert.ok(normalized.stay_proof_asset_builder.execution_guide?.artifact_format);
  assert.ok(normalized.stay_proof_asset_builder.execution_guide?.resume_bullet_formula);
  assert.match(normalized.stay_proof_asset_builder.target_role, /Strategic Sourcing Manager|current role/i);
}

function testRecommendationStackFallsBackToStayWhenPivotConfidenceIsWeak() {
  const normalized = normalizeReportData(buildLegalFixture());

  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.equal(normalized.recommendation_stack.stay_path.type, 'stay');
  assert.ok(normalized.recommendation_stack.conservative_backup.title);
  assert.match(normalized.decision.headline, /strengthen your current lane/i);
}

function testRecommendationStackKeepsMarketBackedPivotPrimary() {
  const report = buildDemoReportData(
    'HR Business Partner',
    'HR',
    ['Manager enablement', 'People operations reporting'],
    {
      selected_tasks: [{ label: 'Manager enablement' }],
      primary_tasks: ['Manager enablement', 'People operations reporting'],
      domain_focus: 'people operations and manager support',
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'people-operations-manager',
    title: 'People Operations Manager',
    fit_summary: 'This path is close to your current scope and has real hiring demand.',
    ranking_reason: 'This path aligns strongly with your current background and current hiring demand.',
    live_market_signal: {
      matched_openings_count: 8,
      profile_fit_score: 48,
      missing_required_skills: ['Workforce analytics'],
      model_only_skill_gaps: [],
    },
    match_score: 84,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'pivot');
  assert.equal(normalized.recommendation_stack.primary.title, 'People Operations Manager');
  assert.equal(normalized.recommendation_stack.primary.confidence_state, 'market-backed');
  assert.match(normalized.decision.headline, /People Operations Manager/i);
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
  assert.match(normalized.pivots[0].skill_gaps[0].skill_name, /Contract lifecycle management/i);
  assert.notEqual(normalized.pivots[0].skill_gaps[0].skill_name, 'Procurement analytics');
  assert.doesNotMatch(JSON.stringify(normalized.pivots[0].learning_path || []), /Global Procurement and Sourcing Specialization/i);
  assert.ok(normalized.paid_value_summary.first_learning_step);
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
  assert.notEqual(stayGaps[1].resource_title, 'Global Procurement and Sourcing Specialization');
}

function testBroadRoleStayPathUsesRoleNativeLearningAndWeeklyPlan() {
  const report = buildDemoReportData(
    'Marketing Manager',
    'SaaS',
    ['Campaign planning and launch', 'Performance reporting and readouts', 'Cross-functional review coordination'],
    {
      selected_tasks: [{ label: 'Campaign planning and launch' }],
      primary_tasks: ['Campaign planning and launch', 'Performance reporting and readouts', 'Cross-functional review coordination'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        core_systems: 'HubSpot, Google Analytics',
        domain_focus: 'growth marketing and campaign operations',
      },
    }
  );

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];

  assert.match(stayGaps[0].skill_name, /HubSpot|Marketo|Campaign experiment design/i);
  assert.match(stayGaps[2].skill_name, /Growth review operating system/i);
  assert.match(stayGaps[0].resource_title, /HubSpot|Marketo|AI for Marketing Course|Google Skillshop/i);
  assert.doesNotMatch(normalized.stay_and_advance.job_safety_case.summary, /The goal is not to look “good at AI.”/i);
  assert.ok(normalized.stay_and_advance.ai_this_week_plan.headline);
  assert.ok(normalized.stay_and_advance.ai_this_week_plan.workflow);
  assert.ok(normalized.stay_and_advance.ai_this_week_plan.output);
  assert.ok((normalized.stay_and_advance.ai_this_week_plan.systems || []).length >= 1);
  assert.notEqual(normalized.stay_and_advance.ai_leverage_playbook.plays[0].title, 'Redesign one recurring workflow');
}

function testAnalyticsStayPathUsesRoleNativeResources() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard QA and metric review', 'Stakeholder KPI reporting', 'Weekly performance review'],
    {
      selected_tasks: [{ label: 'Dashboard QA and metric review' }],
      primary_tasks: ['Dashboard QA and metric review', 'Stakeholder KPI reporting', 'Weekly performance review'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        core_systems: 'Power BI, SQL',
        domain_focus: 'business intelligence and KPI reporting',
      },
    }
  );

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];

  assert.match(stayGaps[0].skill_name, /Power BI|SQL/i);
  assert.match(stayGaps[0].resource_title, /Power BI|SQL|Microsoft data analytics/i);
  assert.notEqual(normalized.stay_and_advance.ai_leverage_playbook.plays[0].title, 'Redesign one recurring workflow');
}

function testFinanceStayPathUsesSharperRoleNativeResources() {
  const report = buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Forecast review and planning', 'Variance analysis', 'Leadership updates'],
    {
      selected_tasks: [{ label: 'Forecast review and planning' }],
      primary_tasks: ['Forecast review and planning', 'Variance analysis', 'Leadership updates'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        core_systems: 'Excel, ERP',
        domain_focus: 'planning and commercial finance',
      },
    }
  );

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];

  assert.match(stayGaps[0].skill_name, /Excel|ERP|planning and review governance/i);
  assert.match(stayGaps[2].skill_name, /Planning review cadence/i);
  assert.match(stayGaps[0].resource_title, /FP&A learning paths|Financial modeling paths|NetSuite|SAP/i);
  assert.doesNotMatch(normalized.stay_and_advance.rationale, /The safer move is not to outrun/i);
  assert.notEqual(stayGaps[2].resource_title, 'Digital Transformation');
}

function testAnalyticsStayPathAddsAdjacentHardSkillLayer() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard QA and metric review', 'Stakeholder KPI reporting'],
    {
      selected_tasks: [{ label: 'Dashboard QA and metric review' }],
      primary_tasks: ['Dashboard QA and metric review', 'Stakeholder KPI reporting'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        technical_capability: 'sql_bi',
        core_systems: 'Tableau, Salesforce',
        domain_focus: 'business intelligence and KPI reporting',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    title: 'Analytics Manager',
    live_market_signal: {
      matched_openings_count: 6,
      profile_fit_score: 17,
      market_required_skills: ['SQL', 'Data modeling'],
      market_tools: ['Snowflake'],
    },
    skill_gaps: [
      {
        skill_name: 'SQL',
        category: 'technical stack',
        gap_priority: 'critical',
        why_it_matters: 'SQL helps tighten the data layer behind analytics reviews.',
        how_to_close_gap: 'Use SQL on one recurring analytics QA workflow.',
        resource_title: 'Learn Structured Query Language (SQL)',
        resource_url: 'https://www.edx.org/learn/sql',
        resource_provider: 'edX',
      },
      {
        skill_name: 'Data modeling',
        category: 'technical stack',
        gap_priority: 'medium',
        why_it_matters: 'Data modeling sharpens the trust layer behind dashboard decisions.',
        how_to_close_gap: 'Rework one semantic layer behind a dashboard review.',
        resource_title: 'Data engineering learning paths',
        resource_url: 'https://www.pluralsight.com/paths/data-engineering',
        resource_provider: 'Pluralsight',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];
  assert.match(stayGaps[0].skill_name, /Tableau/i);
  assert.match(stayGaps[1].skill_name, /SQL|Data modeling/i);
}

function testAnalyticsStayPathAddsAdjacentHardSkillWithoutExplicitSystems() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    {
      selected_tasks: [{ label: 'Dashboard creation' }],
      primary_tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        ai_maturity: 'weekly',
      },
    }
  );

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];
  assert.match(stayGaps[0].skill_name, /Dashboard QA workflow design/i);
  assert.match(stayGaps[1].skill_name, /SQL|Data modeling/i);
}

function testFinanceStayPathAddsAdjacentHardSkillLayer() {
  const report = buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Forecast review and planning', 'Variance analysis'],
    {
      selected_tasks: [{ label: 'Forecast review and planning' }],
      primary_tasks: ['Forecast review and planning', 'Variance analysis'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        technical_capability: 'advanced_spreadsheets',
        core_systems: 'Excel, NetSuite',
        domain_focus: 'planning and commercial finance',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    title: 'Finance Systems Manager',
    live_market_signal: {
      matched_openings_count: 4,
      profile_fit_score: 18,
      market_required_skills: ['Financial modeling', 'Scenario planning'],
      market_tools: ['NetSuite', 'Power BI'],
    },
    skill_gaps: [
      {
        skill_name: 'Financial modeling',
        category: 'technical stack',
        gap_priority: 'critical',
        why_it_matters: 'Model judgment matters for finance systems work.',
        how_to_close_gap: 'Refactor one planning model into a cleaner review flow.',
        resource_title: 'Financial modeling paths',
        resource_url: 'https://www.datacamp.com/search?q=financial%20modeling',
        resource_provider: 'DataCamp',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];
  assert.match(stayGaps[0].skill_name, /Excel|NetSuite|planning and review governance/i);
  assert.match(stayGaps[1].skill_name, /Financial modeling|Scenario planning|Planning model governance/i);
}

function testDuplicateHardSkillGapsCollapseToOneCanonicalGap() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard QA and metric review', 'SQL analysis'],
    {
      selected_tasks: [{ label: 'Dashboard QA and metric review' }],
      primary_tasks: ['Dashboard QA and metric review', 'SQL analysis'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        ai_maturity: 'weekly',
        technical_capability: 'sql_bi',
        core_systems: 'Power BI, SQL',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    title: 'Business Intelligence Manager',
    skill_gaps: [
      {
        skill_name: 'Python',
        category: 'technical stack',
        gap_priority: 'critical',
        market_backed: true,
        why_it_matters: 'Python helps automate QA and transformation work.',
        how_to_close_gap: 'Automate one analytics QA task with Python.',
        resource_title: 'Python for Data Science and Machine Learning Bootcamp',
        resource_url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
        resource_provider: 'Udemy',
      },
      {
        skill_name: 'Python for analytics',
        category: 'technical analytics',
        gap_priority: 'medium',
        market_backed: true,
        why_it_matters: 'Python widens the analysis and automation work you can do.',
        how_to_close_gap: 'Build one recurring analytics workflow in Python.',
        resource_title: 'Python for Everybody',
        resource_url: 'https://www.coursera.org/specializations/python',
        resource_provider: 'Coursera',
      },
      {
        skill_name: 'Snowflake',
        category: 'platform fluency',
        gap_priority: 'medium',
        market_backed: true,
        why_it_matters: 'Warehouse fluency helps you work in the stack teams already use.',
        how_to_close_gap: 'Use Snowflake in one real proof asset.',
        resource_title: 'Snowflake Learning Tracks',
        resource_url: 'https://learn.snowflake.com/en/',
        resource_provider: 'Snowflake',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const pythonGaps = normalized.pivots[0].skill_gaps.filter((skill) => /python/i.test(skill.skill_name));
  const learningPathNames = normalized.pivots[0].learning_path.map((step) => step.skill_name).join(' | ');

  assert.equal(pythonGaps.length, 1);
  assert.equal(pythonGaps[0].skill_name, 'Python');
  assert.doesNotMatch(learningPathNames, /Python for analytics.*Python|Python.*Python for analytics/i);
}

function testStayPathPrefersRoleNativeSystemOverSideTool() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard QA and metric review', 'Stakeholder KPI reporting'],
    {
      selected_tasks: [{ label: 'Dashboard QA and metric review' }],
      primary_tasks: ['Dashboard QA and metric review', 'Stakeholder KPI reporting'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        core_systems: 'Salesforce, Tableau',
        domain_focus: 'business intelligence and KPI reporting',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.match(normalized.stay_path.skill_gaps[0].skill_name, /Tableau/i);
  assert.doesNotMatch(normalized.stay_path.skill_gaps[0].skill_name, /Salesforce/i);
}

function testOperationsStayPathAvoidsGenericAiAcademyDefault() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Manufacturing',
    ['Process mapping', 'Workflow coordination', 'Status reporting'],
    {
      selected_tasks: [{ label: 'Process mapping' }],
      primary_tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
        domain_focus: 'operations improvement',
      },
    }
  );

  const normalized = normalizeReportData(report);
  const stayGaps = normalized.stay_path.skill_gaps || [];

  assert.equal(stayGaps[0].skill_name, 'Workflow automation design');
  assert.notEqual(stayGaps[0].resource_title, 'OpenAI Academy');
  assert.match(stayGaps[0].resource_title, /Zapier|Power Automate|Atlassian/i);
  assert.notEqual(stayGaps[2].resource_title, 'Digital Transformation');
}

function testStayWeeklyPlanUsesRoleNativeSystemsAndStayFirstActions() {
  const report = buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Board-ready variance narratives', 'Scenario planning and tradeoff modeling'],
    {
      selected_tasks: [{ label: 'Board-ready variance narratives' }],
      primary_tasks: ['Board-ready variance narratives', 'Scenario planning and tradeoff modeling'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'repeatable_workflows',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.deepEqual(normalized.stay_and_advance.ai_this_week_plan.systems, ['Excel or planning model', 'forecast review deck', 'variance summary']);
  const first7 = (normalized.first_30_days.next_7_days || []).join(' ');
  assert.match(first7, /leadership can see|stronger version|Finance Planning Lead|Finance/i);
  assert.doesNotMatch(first7, /review 12 live job descriptions/i);
}

function testExecutiveAssistantGetsRoleNativeStayPath() {
  const report = buildDemoReportData(
    'Executive Assistant',
    'Healthcare',
    ['Calendar coordination', 'Meeting prep', 'Executive follow-up'],
    {
      selected_tasks: [{ label: 'Calendar coordination' }],
      primary_tasks: ['Calendar coordination', 'Meeting prep', 'Executive follow-up'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        ai_maturity: 'weekly',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.match(normalized.stay_path.title, /Executive Operations Lead/i);
  assert.match(normalized.stay_path.learning_path[0].skill_name, /Executive (workflow design|decision cadence|operating rhythm)/i);
  assert.match(normalized.stay_path.skill_gaps[2].skill_name, /Executive decision cadence/i);
  assert.notEqual(normalized.stay_and_advance.ai_leverage_playbook.plays[0].title, 'Redesign one recurring workflow');
  assert.deepEqual(normalized.stay_and_advance.ai_this_week_plan.systems, ['calendar', 'meeting brief', 'follow-up tracker']);
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

function testPhaseOneClarifiersPersistInNormalizedReport() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Tech',
    ['Process mapping and improvement', 'Stakeholder updates and coordination'],
    {
      selected_tasks: [{ label: 'Process mapping and improvement' }],
      primary_tasks: ['Process mapping and improvement'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        timeline_urgency: 'within_3_months',
        years_experience_band: '3_5',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        domain_focus: 'internal operations',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.equal(normalized.profile.clarifiers.goal_now, 'stay_and_advance');
  assert.equal(normalized.profile.clarifiers.timeline_urgency, 'within_3_months');
  assert.equal(normalized.profile.clarifiers.years_experience_band, '3_5');
  assert.equal(normalized.profile.clarifiers.location_preference, 'europe');
  assert.equal(normalized.profile.clarifiers.ai_maturity, 'weekly');
}

function testPhaseTwoClarifiersPersistInNormalizedReport() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Tech',
    ['Process mapping and improvement', 'Stakeholder updates and coordination'],
    {
      selected_tasks: [{ label: 'Process mapping and improvement' }],
      primary_tasks: ['Process mapping and improvement'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        technical_capability: 'advanced_spreadsheets',
        salary_tolerance: 'up_to_10_percent',
        proof_state: 'internal_project',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.equal(normalized.profile.clarifiers.technical_capability, 'advanced_spreadsheets');
  assert.equal(normalized.profile.clarifiers.salary_tolerance, 'up_to_10_percent');
  assert.equal(normalized.profile.clarifiers.proof_state, 'internal_project');
}

function testStayGoalAndUrgencyPreferStayOverStrategyLedPivot() {
  const report = buildDemoReportData(
    'HR Business Partner',
    'HR',
    ['Manager enablement', 'People operations reporting'],
    {
      selected_tasks: [{ label: 'Manager enablement' }],
      primary_tasks: ['Manager enablement', 'People operations reporting'],
      clarifiers: {
        goal_now: 'stay_and_advance',
        timeline_urgency: 'within_3_months',
        years_experience_band: '3_5',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        domain_focus: 'people operations and manager support',
      },
    }
  );

  report.summary.overall_score = 75;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'people-operations-manager',
    title: 'People Operations Manager',
    fit_summary: 'This path is close to your current scope and has some hiring support.',
    live_market_signal: {
      matched_openings_count: 2,
      profile_fit_score: 32,
      missing_required_skills: ['Workforce analytics'],
      model_only_skill_gaps: [],
    },
    match_score: 84,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.match(normalized.recommendation_stack.primary.confidence_label, /Fastest practical path|Strong current-lane advantage/i);
}

function testLowTechnicalCapabilityKeepsTechnicalStretchPivotLowConfidence() {
  const report = buildDemoReportData(
    'FP&A Analyst',
    'Finance',
    ['Forecasting and planning', 'Scenario modeling and sensitivity analysis'],
    {
      selected_tasks: [{ label: 'Forecasting and planning' }],
      primary_tasks: ['Forecasting and planning', 'Scenario modeling and sensitivity analysis'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        years_experience_band: '3_5',
        location_preference: 'europe',
        ai_maturity: 'occasionally',
        technical_capability: 'no_code_only',
        domain_focus: 'commercial planning and pricing',
      },
    }
  );

  report.summary.overall_score = 68;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'finance-systems-manager',
    title: 'Finance Systems Manager',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 24,
      missing_required_skills: ['SQL', 'systems design'],
      model_only_skill_gaps: [],
    },
    match_score: 81,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.equal(normalized.recommendation_stack.conservative_backup.title, 'Finance Systems Manager');
  assert.equal(normalized.recommendation_stack.conservative_backup.confidence_state, 'low-confidence');
  assert.match(normalized.recommendation_stack.conservative_backup.confidence_reason, /technical jump|no-code only/i);
}

function testStrictSalaryTolerancePrefersSaferStayPathWhenPivotPayoffIsThin() {
  const report = buildDemoReportData(
    'HR Business Partner',
    'HR',
    ['Manager enablement', 'People operations reporting'],
    {
      selected_tasks: [{ label: 'Manager enablement' }],
      primary_tasks: ['Manager enablement', 'People operations reporting'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        salary_tolerance: 'cannot_take_cut',
        domain_focus: 'people operations and manager support',
      },
    }
  );

  report.summary.overall_score = 71;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'people-operations-manager',
    title: 'People Operations Manager',
    salary_delta: 'Flat / lateral to start',
    transition_time: '4–6 months with consistent effort (~6hrs/week)',
    live_market_signal: {
      matched_openings_count: 2,
      profile_fit_score: 28,
      missing_required_skills: ['Workforce analytics'],
      model_only_skill_gaps: [],
    },
    match_score: 82,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.match(normalized.recommendation_stack.decision_brief.summary, /pay protection matters/i);
  assert.match(normalized.career_roi.roi_read, /compensation protection matters/i);
}

function testActivePivotGoalKeepsMarketBackedPivotPrimary() {
  const report = buildDemoReportData(
    'HR Business Partner',
    'HR',
    ['Manager enablement', 'People operations reporting'],
    {
      selected_tasks: [{ label: 'Manager enablement' }],
      primary_tasks: ['Manager enablement', 'People operations reporting'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_3_months',
        years_experience_band: '3_5',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
        domain_focus: 'people operations and manager support',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'people-operations-manager',
    title: 'People Operations Manager',
    fit_summary: 'This path is close to your current scope and has real hiring demand.',
    live_market_signal: {
      matched_openings_count: 8,
      profile_fit_score: 48,
      missing_required_skills: ['Workforce analytics'],
      model_only_skill_gaps: [],
    },
    match_score: 86,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'pivot');
  assert.equal(normalized.recommendation_stack.primary.title, 'People Operations Manager');
  assert.equal(normalized.decision.recommendation_type, 'active-pivot');
  assert.equal(normalized.decision.urgency, 'Make this useful in the next 90 days');
}

function testStrongProofLetsActivePivotStayPrimaryWhenSignalIsStrategyLed() {
  const report = buildDemoReportData(
    'Project Manager',
    'Consulting',
    ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    {
      selected_tasks: [{ label: 'Stakeholder updates and coordination' }],
      primary_tasks: ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        proof_state: 'workflow_or_playbook',
        domain_focus: 'client delivery and execution',
      },
    }
  );

  report.summary.overall_score = 68;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'delivery-operations-manager',
    title: 'Delivery Operations Manager',
    live_market_signal: {
      matched_openings_count: 2,
      profile_fit_score: 29,
      missing_required_skills: ['Operating rhythm design'],
      model_only_skill_gaps: [],
    },
    match_score: 82,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'pivot');
  assert.equal(normalized.recommendation_stack.primary.title, 'Delivery Operations Manager');
  assert.match(normalized.recommendation_stack.decision_brief.summary, /already have enough proof/i);
}

function testHighRiskLowConfidencePivotStillFailsSafeToStay() {
  const report = buildDemoReportData(
    'Project Manager',
    'Consulting',
    ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    {
      selected_tasks: [{ label: 'Stakeholder updates and coordination' }],
      primary_tasks: ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_3_months',
        years_experience_band: '3_5',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        proof_state: 'dashboard_or_analysis',
        domain_focus: 'client delivery and execution',
      },
    }
  );

  report.summary.overall_score = 83;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'program-operations-manager',
    title: 'Program Operations Manager',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 12,
      missing_required_skills: ['Operating rhythm design'],
      model_only_skill_gaps: ['Portfolio governance'],
    },
    match_score: 74,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.equal(normalized.recommendation_stack.conservative_backup.confidence_state, 'low-confidence');
}

function testBroadRoleThinSignalDefaultsToStayBeforeTitleJump() {
  const report = buildDemoReportData(
    'Marketing Manager',
    'Retail',
    ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
    {
      selected_tasks: [{ label: 'Campaign planning' }],
      primary_tasks: ['Campaign planning', 'Performance reporting'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
        domain_focus: 'campaign strategy and measurement',
      },
    }
  );

  report.summary.overall_score = 74;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'marketing-strategy-lead',
    title: 'Marketing Strategy Lead',
    live_market_signal: {
      matched_openings_count: 1,
      profile_fit_score: 24,
      missing_required_skills: ['Experiment design'],
      model_only_skill_gaps: [],
    },
    match_score: 83,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.match(normalized.recommendation_stack.decision_brief.summary, /broader role family|external signal is still thin/i);
}

function testExistingProofUpgradesProofBuildersInsteadOfStartingFromScratch() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Manufacturing',
    ['Process mapping and improvement', 'Stakeholder updates and coordination'],
    {
      selected_tasks: [{ label: 'Process mapping and improvement' }],
      primary_tasks: ['Process mapping and improvement'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'europe',
        ai_maturity: 'weekly',
        proof_state: 'internal_project',
        domain_focus: 'operations improvement',
      },
    }
  );

  const normalized = normalizeReportData(report);
  assert.match(normalized.proof_asset_builder.objective, /Package one internal project/i);
  assert.match(normalized.proof_asset_builder.first_action, /choosing the internal project/i);
  assert.equal(normalized.proof_asset_builder.proof_state_read, 'package an internal project into visible proof');
  assert.match(normalized.stay_proof_asset_builder.objective, /Package one internal project/i);
  assert.match(normalized.stay_proof_asset_builder.first_action, /promotion case/i);
}

function testLowExperienceStretchTitleFallsBackToStayFirst() {
  const report = buildDemoReportData(
    'Project Manager',
    'Consulting',
    ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
    {
      selected_tasks: [{ label: 'Stakeholder updates and coordination' }],
      primary_tasks: ['Stakeholder updates and coordination', 'Project tracking and follow-up'],
      clarifiers: {
        goal_now: 'active_pivot',
        timeline_urgency: 'within_6_months',
        years_experience_band: '0_2',
        location_preference: 'europe',
        ai_maturity: 'occasionally',
        domain_focus: 'client delivery and execution',
      },
    }
  );

  report.summary.overall_score = 72;
  report.pivots[0] = {
    ...report.pivots[0],
    id: 'director-of-strategic-execution',
    title: 'Director of Strategic Execution',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 18,
      missing_required_skills: ['Portfolio leadership'],
      model_only_skill_gaps: ['Executive stakeholder alignment'],
    },
    match_score: 82,
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.doesNotMatch(normalized.recommendation_stack.conservative_backup.title, /Director|Head|Principal|Architect/i);
  assert.notEqual(normalized.recommendation_stack.conservative_backup.confidence_state, 'market-backed');
}

function testAdvancedAiMaturitySkipsBeginnerLearningStart() {
  const report = buildDemoReportData(
    'Procurement Analyst',
    'Manufacturing',
    ['Vendor performance reporting', 'Sourcing analysis'],
    {
      selected_tasks: [{ label: 'Vendor performance reporting' }],
      primary_tasks: ['Vendor performance reporting'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'europe',
        ai_maturity: 'repeatable_workflows',
        domain_focus: 'supplier performance and spend analytics',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    skill_gaps: [
      {
        skill_name: 'Prompt design',
        category: 'ai execution',
        gap_priority: 'critical',
        how_to_close_gap: 'Practice with reusable prompts.',
        resource_title: 'OpenAI Academy',
        resource_provider: 'OpenAI',
        resource_url: 'https://academy.openai.com/',
      },
      {
        skill_name: 'Workflow automation design',
        category: 'workflow design',
        gap_priority: 'critical',
        how_to_close_gap: 'Turn one weekly workflow into a reusable automation pattern.',
        resource_title: 'Zapier Learn in 14 Days',
        resource_provider: 'Zapier',
        resource_url: 'https://zapier.com/l/learn-14-days',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.pivots[0].learning_path[0].skill_name, 'Workflow automation design');
}

function testAnalyticsRoleGetsRoleNativeStayPath() {
  const normalized = normalizeReportData(buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    {
      selected_tasks: [{ label: 'Dashboard creation' }],
      primary_tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  ));

  assert.match(normalized.stay_path.title, /Business Intelligence Lead/i);
  assert.match(normalized.recommendation_stack.primary.title, /Business Intelligence Lead|Business Intelligence Manager/i);
  assert.match(normalized.stay_and_advance.recommendation, /analytics|decision support|KPI/i);
}

function testAdvancedStayPathStartsWithRoleNativeWorkflowSkill() {
  const normalized = normalizeReportData(buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Board-ready variance narratives', 'Scenario planning and tradeoff modeling'],
    {
      selected_tasks: [{ label: 'Board-ready variance narratives' }],
      primary_tasks: ['Board-ready variance narratives', 'Scenario planning and tradeoff modeling'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '11_plus',
        location_preference: 'united_states',
        ai_maturity: 'repeatable_workflows',
      },
    }
  ));

  assert.match(normalized.stay_path.learning_path[0].skill_name, /Financial modeling and scenario review|AI workflow design/i);
  assert.match(normalized.stay_path.title, /Finance Planning Lead|Finance/i);
}

function testInflatedStayTitlesFallBackToRoleNativeGrowthPath() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.stay_and_advance = {
    ...report.stay_and_advance,
    recommendation: 'Deploy AI health scoring and move into a senior version of the same role.',
    rationale: 'Position yourself for Senior Customer Success Manager within six months.',
    promotion_path: {
      ...(report.stay_and_advance?.promotion_path || {}),
      next_title: 'Senior Customer Success Manager',
    },
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.stay_path.title, /Customer Success Strategy Lead|Customer Operations Lead/i);
  assert.match(normalized.stay_and_advance.recommendation, /customer|renewal|proactive health/i);
  assert.ok(normalized.quality_audit.repairs.some((item) => /stay-and-advance title/i.test(item)));
}

function testCustomerSuccessPivotFallsBackToCanonicalTitleAndRoleNativeLearning() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'customer-success-data-analyst',
    title: 'Customer Success Data Analyst',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 12,
      missing_required_skills: ['SQL'],
      model_only_skill_gaps: ['Python for Data Analysis'],
    },
    skill_gaps: [
      {
        skill_name: 'Python for Data Analysis',
        category: 'technical',
        gap_priority: 'critical',
        why_it_matters: 'Customer reporting needs more analysis depth.',
        how_to_close_gap: 'Learn Python and notebooks.',
        resource_title: 'Python for Everybody',
        resource_url: 'https://www.coursera.org/specializations/python',
        resource_provider: 'Coursera',
      },
      {
        skill_name: 'Statistical modeling',
        category: 'technical',
        gap_priority: 'medium',
        why_it_matters: 'Better analysis.',
        how_to_close_gap: 'Study statistics.',
        resource_title: 'Data Science Specialization',
        resource_url: 'https://www.coursera.org/specializations/jhu-data-science',
        resource_provider: 'Coursera',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.pivots[0].title, /Customer Operations Lead|Customer Enablement Lead/);
  assert.doesNotMatch(normalized.pivots[0].title, /Customer Success Data Analyst/i);
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'Python for Everybody');
}

function testMarketingPivotGetsRoleNativeLearningBundle() {
  const report = buildDemoReportData(
    'Marketing Manager',
    'Retail',
    ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
    {
      selected_tasks: [{ label: 'Campaign planning' }],
      primary_tasks: ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'strategic-ai-integrated-marketing-lead',
    title: 'Strategic AI-Integrated Marketing Lead',
    skill_gaps: [
      {
        skill_name: 'Prompt design',
        category: 'AI execution',
        gap_priority: 'critical',
        why_it_matters: 'Prompting helps.',
        how_to_close_gap: 'Study prompt engineering.',
        resource_title: 'ChatGPT Prompt Engineering for Developers',
        resource_url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
        resource_provider: 'DeepLearning.AI',
      },
      {
        skill_name: 'AI QA workflows',
        category: 'Quality control',
        gap_priority: 'medium',
        why_it_matters: 'Quality matters.',
        how_to_close_gap: 'Learn QA workflows.',
        resource_title: 'OpenAI Cookbook',
        resource_url: 'https://cookbook.openai.com/',
        resource_provider: 'OpenAI',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.pivots[0].title, /Marketing Operations Lead|Marketing Operations Strategist/);
  assert.notEqual(normalized.pivots[0].learning_path[0].skill_name, 'Prompt design');
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'ChatGPT Prompt Engineering for Developers');
}

function testOperationsPivotGetsRoleNativeLearningBundle() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Manufacturing',
    ['Process mapping', 'Workflow coordination', 'Status reporting'],
    {
      selected_tasks: [{ label: 'Process mapping' }],
      primary_tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'strategy-and-operations-architect',
    title: 'Strategy and Operations Architect',
    skill_gaps: [
      {
        skill_name: 'Prompt design',
        category: 'AI execution',
        gap_priority: 'critical',
        why_it_matters: 'Prompting helps.',
        how_to_close_gap: 'Study prompt engineering.',
        resource_title: 'ChatGPT Prompt Engineering for Developers',
        resource_url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
        resource_provider: 'DeepLearning.AI',
      },
      {
        skill_name: 'Systems architecture judgment',
        category: 'Platform thinking',
        gap_priority: 'medium',
        why_it_matters: 'Systems matter.',
        how_to_close_gap: 'Study systems design.',
        resource_title: 'Designing Machine Learning Systems',
        resource_url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
        resource_provider: 'O’Reilly',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.match(normalized.pivots[0].title, /Delivery Operations Manager|Program Operations Manager/);
  assert.notEqual(normalized.pivots[0].learning_path[0].skill_name, 'Prompt design');
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'Designing Machine Learning Systems');
}

function testHrPivotLearningPathAvoidsOvertechnicalStart() {
  const report = buildDemoReportData(
    'Senior HR Business Partner',
    'SaaS',
    ['Workforce planning', 'Manager coaching', 'Org design support'],
    {
      selected_tasks: [{ label: 'Workforce planning' }],
      primary_tasks: ['Workforce planning', 'Manager coaching', 'Org design support'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '11_plus',
        location_preference: 'united_states',
        ai_maturity: 'repeatable_workflows',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'hr-operations-manager',
    title: 'HR Operations Manager',
    skill_gaps: [
      {
        skill_name: 'Systems architecture judgment',
        category: 'Platform thinking',
        gap_priority: 'critical',
        why_it_matters: 'Systems matter.',
        how_to_close_gap: 'Study systems design.',
        resource_title: 'Designing Machine Learning Systems',
        resource_url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
        resource_provider: 'O’Reilly',
      },
      {
        skill_name: 'Governance and rollout design',
        category: 'Operating model',
        gap_priority: 'medium',
        why_it_matters: 'Governance matters.',
        how_to_close_gap: 'Study rollout design.',
        resource_title: 'Build and optimize cloud flows in Power Automate',
        resource_url: 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/',
        resource_provider: 'Microsoft Learn',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.notEqual(normalized.pivots[0].learning_path[0].skill_name, 'Systems architecture judgment');
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'Designing Machine Learning Systems');
}

function testBroadRoleCanonicalTitleCannotJumpStraightToDirector() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'customer-success-director',
    title: 'Customer Success Director',
    live_market_signal: {
      matched_openings_count: 4,
      profile_fit_score: 25,
      missing_required_skills: ['Leadership'],
      model_only_skill_gaps: [],
    },
  };

  const normalized = normalizeReportData(report);
  assert.doesNotMatch(normalized.pivots[0].title, /Customer Success Director/i);
}

function testAnalyticsPivotAvoidsOffFamilyStartingSkill() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    {
      selected_tasks: [{ label: 'Dashboard creation' }],
      primary_tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'business-intelligence-lead',
    title: 'Business Intelligence Lead',
    skill_gaps: [
      {
        skill_name: 'Product lifecycle management',
        category: 'product',
        gap_priority: 'critical',
        why_it_matters: 'Learn product work.',
        how_to_close_gap: 'Study digital product management.',
        resource_title: 'Digital Product Management',
        resource_url: 'https://www.coursera.org/learn/digital-product-management',
        resource_provider: 'Coursera',
      },
      {
        skill_name: 'Business strategy',
        category: 'strategy',
        gap_priority: 'medium',
        why_it_matters: 'Think more strategically.',
        how_to_close_gap: 'Study strategy.',
        resource_title: 'Digital Product Management',
        resource_url: 'https://www.coursera.org/learn/digital-product-management',
        resource_provider: 'Coursera',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.equal((normalized.pivots[0].learning_path || []).length, 0);
  assert.equal((normalized.pivots[0].skill_gaps || []).length, 0);
}

function testFinancePivotGetsRoleNativeLearningBundle() {
  const report = buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Forecast review', 'Budget planning', 'Variance analysis'],
    {
      selected_tasks: [{ label: 'Forecast review' }],
      primary_tasks: ['Forecast review', 'Budget planning', 'Variance analysis'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'finance-systems-manager',
    title: 'Finance Systems Manager',
    skill_gaps: [
      {
        skill_name: 'Prompt design',
        category: 'ai execution',
        gap_priority: 'critical',
        why_it_matters: 'Prompting helps finance teams.',
        how_to_close_gap: 'Study prompt engineering.',
        resource_title: 'Prompt Engineering & Generative AI for AI Engineers',
        resource_url: 'https://www.coursera.org/learn/prompt-engineering',
        resource_provider: 'Coursera',
      },
      {
        skill_name: 'Business process management',
        category: 'workflow',
        gap_priority: 'medium',
        why_it_matters: 'Process design matters.',
        how_to_close_gap: 'Study BPM.',
        resource_title: 'Business Process Management Specialization',
        resource_url: 'https://www.coursera.org/specializations/business-process-management',
        resource_provider: 'Coursera',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.notEqual(normalized.pivots[0].learning_path[0].skill_name, 'Prompt design');
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'Prompt Engineering & Generative AI for AI Engineers');
}

function testCustomerPivotAvoidsGenericProcessCourseAsFirstStep() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'customer-operations-lead',
    title: 'Customer Operations Lead',
    skill_gaps: [
      {
        skill_name: 'Process design',
        category: 'workflow',
        gap_priority: 'critical',
        why_it_matters: 'Better renewals need a stronger review process.',
        how_to_close_gap: 'Study business process management.',
        resource_title: 'Business Process Management Specialization',
        resource_url: 'https://www.coursera.org/specializations/business-process-management',
        resource_provider: 'Coursera',
      },
      {
        skill_name: 'Data modeling',
        category: 'analytics',
        gap_priority: 'medium',
        why_it_matters: 'Model better account signals.',
        how_to_close_gap: 'Study Power BI modeling.',
        resource_title: 'Get started building with Power BI',
        resource_url: 'https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/',
        resource_provider: 'Microsoft Learn',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  assert.notEqual(normalized.pivots[0].learning_path[0].resource_title, 'Business Process Management Specialization');
  assert.match(normalized.pivots[0].learning_path[0].skill_name, /Data modeling|Process design|Renewal|Customer/i);
}

function testDecisionBriefExplainsWhyRiskierMoveIsNotLeading() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'customer-success-platform-product-manager',
    title: 'Customer Success Platform Product Manager',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 10,
      missing_required_skills: ['Product strategy'],
      model_only_skill_gaps: ['Platform roadmap'],
    },
  };

  const normalized = normalizeReportData(report);
  assert.ok(normalized.recommendation_stack.decision_brief.why_this_won);
  assert.ok(normalized.recommendation_stack.decision_brief.not_yet_reason);
  assert.ok(normalized.recommendation_stack.decision_brief.unlock_condition);
}

function testCustomerLowerPivotsGetCleanerAdjacentTitles() {
  const report = buildDemoReportData(
    'Customer Success Manager',
    'SaaS',
    ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    {
      selected_tasks: [{ label: 'Renewal prep' }],
      primary_tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[1] = {
    ...report.pivots[1],
    id: 'customer-success-platform-product-manager',
    title: 'Customer Success Platform Product Manager',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 0,
    },
  };

  report.pivots[2] = {
    ...report.pivots[2],
    id: 'head-of-customer-success',
    title: 'Head of Customer Success',
    live_market_signal: {
      matched_openings_count: 1,
      profile_fit_score: 10,
    },
  };

  const normalized = normalizeReportData(report);
  const lowerTitles = normalized.pivots.slice(1, 3).map((pivot) => pivot.title).join(' | ');
  assert.doesNotMatch(lowerTitles, /Platform Product Manager|Head of Customer Success/);
}

function testFinanceLowerPivotsStayUniqueAfterRepair() {
  const report = buildDemoReportData(
    'Finance Manager',
    'SaaS',
    ['Forecast review', 'Budget planning', 'Variance analysis'],
    {
      selected_tasks: [{ label: 'Forecast review' }],
      primary_tasks: ['Forecast review', 'Budget planning', 'Variance analysis'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = { ...report.pivots[0], title: 'Finance Systems Manager', id: 'finance-systems-manager' };
  report.pivots[1] = { ...report.pivots[1], title: 'Finance Systems Manager', id: 'finance-systems-manager-2', live_market_signal: { matched_openings_count: 1, profile_fit_score: 10 } };
  report.pivots[2] = { ...report.pivots[2], title: 'Finance Systems Manager', id: 'finance-systems-manager-3', live_market_signal: { matched_openings_count: 0, profile_fit_score: 0 } };

  const normalized = normalizeReportData(report);
  const lowerTitles = normalized.pivots.slice(1, 4).map((pivot) => pivot.title);
  assert.equal(new Set(lowerTitles).size, lowerTitles.length);
}

function testMarketingLowerPivotsGetCleanerAdjacentTitles() {
  const report = buildDemoReportData(
    'Marketing Manager',
    'Retail',
    ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
    {
      selected_tasks: [{ label: 'Campaign planning' }],
      primary_tasks: ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[1] = {
    ...report.pivots[1],
    id: 'ai-program-manager',
    title: 'AI Program Manager',
    live_market_signal: { matched_openings_count: 0, profile_fit_score: 0 },
  };
  report.pivots[2] = {
    ...report.pivots[2],
    id: 'customer-success-manager-saas-platform',
    title: 'Customer Success Manager - SaaS Platform',
    live_market_signal: { matched_openings_count: 1, profile_fit_score: 0 },
  };
  report.pivots[3] = {
    ...report.pivots[3],
    id: 'senior-marketing-strategy-consultant',
    title: 'Senior Marketing Strategy Consultant',
    live_market_signal: { matched_openings_count: 0, profile_fit_score: 8 },
  };

  const normalized = normalizeReportData(report);
  const lowerTitles = normalized.pivots.slice(1, 4).map((pivot) => pivot.title).join(' | ');
  assert.doesNotMatch(lowerTitles, /AI Program Manager|Customer Success Manager|Consultant/);
  assert.equal(new Set(normalized.pivots.slice(0, 4).map((pivot) => pivot.title)).size, normalized.pivots.slice(0, 4).length);
}

function testAnalyticsLowerPivotsAvoidWeakRevOpsDrift() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    {
      selected_tasks: [{ label: 'Dashboard creation' }],
      primary_tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[3] = {
    ...report.pivots[3],
    id: 'revenue-operations-analyst',
    title: 'Revenue Operations Analyst',
    live_market_signal: { matched_openings_count: 0, profile_fit_score: 0 },
  };

  const normalized = normalizeReportData(report);
  const lowerTitles = normalized.pivots.slice(1, 5).map((pivot) => pivot.title).join(' | ');
  assert.doesNotMatch(lowerTitles, /Revenue Operations Analyst/);
}

function testOperationsLowerPivotsGetCleanerAdjacentTitles() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Manufacturing',
    ['Process mapping', 'Workflow coordination', 'Status reporting'],
    {
      selected_tasks: [{ label: 'Process mapping' }],
      primary_tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[1] = {
    ...report.pivots[1],
    id: 'strategy-and-operations-architect',
    title: 'Strategy and Operations Architect',
    live_market_signal: { matched_openings_count: 0, profile_fit_score: 0 },
  };
  report.pivots[2] = {
    ...report.pivots[2],
    id: 'customer-success-operations-lead',
    title: 'Customer Success Operations Lead',
    live_market_signal: { matched_openings_count: 1, profile_fit_score: 4 },
  };
  report.pivots[3] = {
    ...report.pivots[3],
    id: 'head-of-operational-excellence',
    title: 'Head of Operational Excellence',
    live_market_signal: { matched_openings_count: 0, profile_fit_score: 8 },
  };

  const normalized = normalizeReportData(report);
  const lowerTitles = normalized.pivots.slice(1, 4).map((pivot) => pivot.title).join(' | ');
  assert.doesNotMatch(lowerTitles, /Strategy and Operations Architect|Customer Success Operations Lead|Head of Operational Excellence/);
  assert.equal(new Set(normalized.pivots.slice(0, 4).map((pivot) => pivot.title)).size, normalized.pivots.slice(0, 4).length);
}

function testOperationsDecisionBriefUsesRoleNativeStayLanguage() {
  const report = buildDemoReportData(
    'Operations Manager',
    'Manufacturing',
    ['Process mapping', 'Workflow coordination', 'Status reporting'],
    {
      selected_tasks: [{ label: 'Process mapping' }],
      primary_tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'strategy-and-operations-architect',
    title: 'Strategy and Operations Architect',
    live_market_signal: {
      matched_openings_count: 0,
      profile_fit_score: 10,
      missing_required_skills: ['Systems redesign'],
      model_only_skill_gaps: ['Program architecture'],
    },
  };

  const normalized = normalizeReportData(report);
  assert.equal(normalized.recommendation_stack.primary.type, 'stay');
  assert.match(normalized.recommendation_stack.decision_brief.why_this_won, /workflow|handoff|operating system/i);
  assert.match(normalized.recommendation_stack.decision_brief.not_yet_reason, /workflow|handoff|operating proof/i);
  assert.match(normalized.recommendation_stack.decision_brief.unlock_condition, /workflow redesign|operating review|handoff system/i);
}

function testMarketBackedAnalyticsHardSkillsArePreserved() {
  const report = buildDemoReportData(
    'Data Analyst',
    'SaaS',
    ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    {
      selected_tasks: [{ label: 'Dashboard creation' }],
      primary_tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
      clarifiers: {
        goal_now: 'hybrid_transition',
        timeline_urgency: 'within_6_months',
        years_experience_band: '6_10',
        location_preference: 'united_states',
        ai_maturity: 'weekly',
        technical_capability: 'sql_bi',
        core_systems: 'Power BI, SQL',
      },
    }
  );

  report.pivots[0] = {
    ...report.pivots[0],
    id: 'business-intelligence-manager',
    title: 'Business Intelligence Manager',
    live_market_signal: {
      matched_openings_count: 7,
      profile_fit_score: 34,
      market_required_skills: ['Database architecture', 'ETL pipeline design', 'Python', 'Data modeling'],
      market_tools: ['Snowflake', 'dbt'],
    },
    skill_gaps: [
      {
        skill_name: 'Database architecture',
        category: 'technical stack',
        gap_priority: 'critical',
        market_backed: true,
        why_it_matters: 'BI roles need stronger data structure judgment.',
        how_to_close_gap: 'Model one analytics dataset into a cleaner semantic layer.',
        resource_title: 'Data engineering learning paths',
        resource_url: 'https://www.pluralsight.com/paths/data-engineering',
        resource_provider: 'Pluralsight',
      },
      {
        skill_name: 'ETL pipeline design',
        category: 'technical stack',
        gap_priority: 'critical',
        market_backed: true,
        why_it_matters: 'BI roles often own the movement from raw data to trusted reporting.',
        how_to_close_gap: 'Document and rebuild one recurring ETL workflow with validation checks.',
        resource_title: 'Data engineering learning paths',
        resource_url: 'https://www.pluralsight.com/paths/data-engineering',
        resource_provider: 'Pluralsight',
      },
      {
        skill_name: 'Snowflake',
        category: 'platform fluency',
        gap_priority: 'medium',
        market_backed: true,
        why_it_matters: 'Warehouse fluency shows you can work in the stack hiring teams already use.',
        how_to_close_gap: 'Use Snowflake on one analytics proof asset tied to a real business question.',
        resource_title: 'Snowflake Learning Tracks',
        resource_url: 'https://learn.snowflake.com/en/',
        resource_provider: 'Snowflake',
      },
      {
        skill_name: 'Python for analytics',
        category: 'technical analytics',
        gap_priority: 'medium',
        market_backed: true,
        why_it_matters: 'Python widens the analysis and automation work you can do without waiting on engineering.',
        how_to_close_gap: 'Automate one recurring QA or transformation step with Python.',
        resource_title: 'Python for Everybody',
        resource_url: 'https://www.coursera.org/specializations/python',
        resource_provider: 'Coursera',
      },
    ],
  };

  const normalized = normalizeReportData(report);
  const topSkillNames = normalized.pivots[0].skill_gaps.slice(0, 4).map((skill) => skill.skill_name).join(' | ');
  const learningPathNames = normalized.pivots[0].learning_path.map((step) => step.skill_name).join(' | ');

  assert.match(topSkillNames, /Database architecture|ETL pipeline design|Snowflake|Python for analytics/i);
  assert.doesNotMatch(topSkillNames, /KPI review narrative/i);
  assert.match(learningPathNames, /Database architecture|ETL pipeline design|Snowflake|Python for analytics/i);
}

testTopPivotFamilyRepairAndCopy();
testGenericAiResourceRemovedFromNonAiGap();
testFirst30DaysReferencesFinalPivot();
testProofAssetBuilderAndPaidSummaryArePresent();
testStayAdvancePremiumSectionsArePresent();
testRecommendationStackFallsBackToStayWhenPivotConfidenceIsWeak();
testRecommendationStackKeepsMarketBackedPivotPrimary();
testEmailHtmlStartsWithActionPlan();
testProcurementTopSkillUsesProcurementResource();
testStayAdvanceLearningPathDoesNotInheritPivotCourse();
testBroadRoleStayPathUsesRoleNativeLearningAndWeeklyPlan();
testAnalyticsStayPathUsesRoleNativeResources();
testFinanceStayPathUsesSharperRoleNativeResources();
testAnalyticsStayPathAddsAdjacentHardSkillLayer();
testAnalyticsStayPathAddsAdjacentHardSkillWithoutExplicitSystems();
testFinanceStayPathAddsAdjacentHardSkillLayer();
testDuplicateHardSkillGapsCollapseToOneCanonicalGap();
testStayPathPrefersRoleNativeSystemOverSideTool();
testOperationsStayPathAvoidsGenericAiAcademyDefault();
testStayWeeklyPlanUsesRoleNativeSystemsAndStayFirstActions();
testExecutiveAssistantGetsRoleNativeStayPath();
testFinanceSyntheticTitleFallsBackToCanonicalRole();
testProjectManagerOverSeniorTitlesFallBackToCanonicalRole();
testHrLowerPivotDoesNotKeepLegalSkillLeakage();
testLearningPathIsPersistedInNormalizedReport();
testPhaseOneClarifiersPersistInNormalizedReport();
testPhaseTwoClarifiersPersistInNormalizedReport();
testStayGoalAndUrgencyPreferStayOverStrategyLedPivot();
testLowTechnicalCapabilityKeepsTechnicalStretchPivotLowConfidence();
testStrictSalaryTolerancePrefersSaferStayPathWhenPivotPayoffIsThin();
testActivePivotGoalKeepsMarketBackedPivotPrimary();
testStrongProofLetsActivePivotStayPrimaryWhenSignalIsStrategyLed();
testHighRiskLowConfidencePivotStillFailsSafeToStay();
testBroadRoleThinSignalDefaultsToStayBeforeTitleJump();
testExistingProofUpgradesProofBuildersInsteadOfStartingFromScratch();
testLowExperienceStretchTitleFallsBackToStayFirst();
testAdvancedAiMaturitySkipsBeginnerLearningStart();
testAnalyticsRoleGetsRoleNativeStayPath();
testAdvancedStayPathStartsWithRoleNativeWorkflowSkill();
testInflatedStayTitlesFallBackToRoleNativeGrowthPath();
testCustomerSuccessPivotFallsBackToCanonicalTitleAndRoleNativeLearning();
testMarketingPivotGetsRoleNativeLearningBundle();
testOperationsPivotGetsRoleNativeLearningBundle();
testHrPivotLearningPathAvoidsOvertechnicalStart();
testBroadRoleCanonicalTitleCannotJumpStraightToDirector();
testAnalyticsPivotAvoidsOffFamilyStartingSkill();
testFinancePivotGetsRoleNativeLearningBundle();
testCustomerPivotAvoidsGenericProcessCourseAsFirstStep();
testDecisionBriefExplainsWhyRiskierMoveIsNotLeading();
testCustomerLowerPivotsGetCleanerAdjacentTitles();
testFinanceLowerPivotsStayUniqueAfterRepair();
testMarketingLowerPivotsGetCleanerAdjacentTitles();
testAnalyticsLowerPivotsAvoidWeakRevOpsDrift();
testOperationsLowerPivotsGetCleanerAdjacentTitles();
testOperationsDecisionBriefUsesRoleNativeStayLanguage();
testMarketBackedAnalyticsHardSkillsArePreserved();

console.log('Report quality tests passed.');
