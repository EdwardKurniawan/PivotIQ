import { createSupabaseAdminClient } from './supabase/admin.js';
import { classifyJobTrack, isGroundingEligibleForPivot, sanitizeGroundingSkills } from './job-grounding.js';

const TASK_SKILL_MAP = {
  reporting: ['Reporting', 'Written Communication'],
  analysis: ['Data Analysis', 'Insight Generation'],
  forecasting: ['Forecasting', 'Planning'],
  dashboarding: ['Dashboarding', 'KPI Tracking'],
  'data-cleanup': ['Data Quality', 'Validation'],
  'client-calls': ['Client Communication', 'Relationship Management'],
  'stakeholder-updates': ['Stakeholder Management', 'Cross-Functional Communication'],
  'meeting-facilitation': ['Facilitation', 'Coordination'],
  'cross-functional-alignment': ['Cross-Functional Leadership', 'Stakeholder Management'],
  'decision-memos': ['Decision Support', 'Business Writing'],
  'proposal-writing': ['Presentations', 'Proposal Writing'],
  documentation: ['Documentation', 'Knowledge Capture'],
  'policy-documentation': ['Policy Documentation', 'Compliance'],
  'content-briefing': ['Brief Writing', 'Content Strategy'],
  'campaign-reporting': ['Marketing Analytics', 'Reporting'],
  'market-research': ['Market Research', 'Competitive Analysis'],
  'user-research': ['User Research', 'Synthesis'],
  'process-mapping': ['Process Mapping', 'Workflow Design'],
  'project-tracking': ['Project Management', 'Execution Tracking'],
  'vendor-coordination': ['Vendor Management', 'Coordination'],
  'procurement-operations': ['Procurement', 'Sourcing Operations'],
  'pricing-analysis': ['Pricing Analysis', 'Commercial Analysis'],
  budgeting: ['Budgeting', 'Financial Planning'],
  'variance-analysis': ['Variance Analysis', 'Financial Analysis'],
  'scenario-modeling': ['Scenario Modeling', 'Strategic Analysis'],
  'candidate-screening': ['Candidate Evaluation', 'Talent Assessment'],
  'interview-coordination': ['Interview Coordination', 'Scheduling'],
  'people-ops-reporting': ['People Analytics', 'HR Operations'],
  'team-coaching': ['Coaching', 'People Management'],
  'training-facilitation': ['Training Facilitation', 'Enablement'],
  'onboarding-enablement': ['Onboarding', 'Enablement'],
  'pipeline-reporting': ['Pipeline Analysis', 'Sales Reporting'],
  'sales-enablement': ['Sales Enablement', 'Training'],
  'renewal-analysis': ['Renewal Analysis', 'Customer Success'],
  'customer-success-planning': ['Customer Success', 'Account Planning'],
  'implementation-onboarding': ['Implementation', 'Customer Onboarding'],
  'customer-support': ['Customer Support', 'Issue Resolution'],
  'ticket-triage': ['Support Triage', 'Issue Prioritization'],
  'knowledge-base-writing': ['Knowledge Base Writing', 'Documentation'],
  'planning-roadmaps': ['Roadmapping', 'Strategic Planning'],
  'product-discovery': ['Product Discovery', 'Research'],
  'backlog-prioritization': ['Prioritization', 'Product Operations'],
  'requirements-definition': ['Requirements Gathering', 'Business Analysis'],
  'sprint-planning': ['Sprint Planning', 'Agile Delivery'],
  'release-coordination': ['Release Coordination', 'Program Delivery'],
  'coding-dev': ['Software Development', 'Implementation'],
  'debugging-qa': ['Debugging', 'Quality Assurance'],
  'system-design': ['Systems Design', 'Architecture'],
  'incident-response': ['Incident Response', 'Operations'],
  'data-modeling': ['Data Modeling', 'Analytics Engineering'],
  'automation-building': ['Workflow Automation', 'Systems Thinking'],
  'contract-review': ['Contract Review', 'Legal Analysis'],
  'compliance-monitoring': ['Compliance', 'Risk Monitoring'],
  'curriculum-design': ['Curriculum Design', 'Instructional Design'],
  'demand-generation': ['Demand Generation', 'Campaign Strategy'],
  'seo-optimization': ['SEO', 'Content Optimization'],
  'lifecycle-crm': ['CRM', 'Lifecycle Marketing'],
  'ab-testing': ['Experimentation', 'A/B Testing'],
};

const TITLE_SKILL_PATTERNS = [
  { regex: /\bprocurement\b|\bsourcing\b|\bsupplier\b|\bvendor\b/i, skills: ['Procurement', 'Vendor Management', 'Commercial Judgment'] },
  { regex: /\blegal\b|\bcontract\b|\bcompliance\b|\bprivacy\b/i, skills: ['Legal Operations', 'Compliance', 'Policy Interpretation'] },
  { regex: /\beducation\b|\blearning\b|\benablement\b|\btraining\b|\bonboarding\b/i, skills: ['Enablement', 'Program Design', 'Facilitation'] },
  { regex: /\bfinance\b|\bfp&a\b|\bpayments\b|\baccounting\b|\bforecast/i, skills: ['Financial Analysis', 'Forecasting', 'Business Judgment'] },
  { regex: /\boperations\b|\bprogram\b|\bproject\b/i, skills: ['Program Management', 'Process Improvement', 'Execution Management'] },
  { regex: /\bmarketing\b|\bgrowth\b|\bcampaign\b|\bcontent\b/i, skills: ['Marketing Strategy', 'Campaign Analysis', 'Content Planning'] },
  { regex: /\bcustomer\b|\baccount\b|\brenewal\b/i, skills: ['Customer Success', 'Account Management', 'Stakeholder Management'] },
  { regex: /\bengineer\b|\bdeveloper\b|\barchitecture\b|\bsoftware\b/i, skills: ['Systems Design', 'Technical Problem Solving', 'Implementation'] },
  { regex: /\banalyst\b/i, skills: ['Analysis', 'Reporting', 'Decision Support'] },
  { regex: /\bmanager\b|\blead\b/i, skills: ['Stakeholder Management', 'Prioritization'] },
];

const ROLE_PURITY_RULES = {
  legal: {
    required: [/\blegal\b/, /\bcontract\b/, /\bcompliance\b/, /\bprivacy\b/, /\bgovernance\b/, /\bpolicy\b/, /\brisk\b/],
    blocked: [/\bmarketing\b/, /\bcustomer success\b/, /\bsales\b/, /\brecruit/i, /\bcounsel\b/, /\bcontroller\b/],
  },
  education: {
    required: [/\beducation\b/, /\blearning\b/, /\benablement\b/, /\btraining\b/, /\bonboarding\b/, /\binstructional\b/],
    blocked: [/\bmarketing\b/, /\bsales\b/, /\brecruit/i, /\bfinance\b/],
  },
  procurement: {
    required: [/\bprocurement\b/, /\bsourcing\b/, /\bsupplier\b/, /\bvendor\b/, /\bspend\b/, /\bcategory\b/, /\bsupply chain\b/],
    blocked: [/\bmarketing\b/, /\bcustomer success\b/, /\brecruit/i],
  },
  finance: {
    required: [/\bfinance\b/, /\bpayments\b/, /\baccounting\b/, /\bfp&a\b/, /\bforecast\b/, /\brisk\b/],
    blocked: [/\bmarketing\b/, /\brecruit/i],
  },
};

const ROLE_FAMILY_DOMAIN_TOKENS = {
  legal: new Set(['legal', 'contract', 'contracts', 'compliance', 'privacy', 'governance', 'policy']),
  education: new Set(['education', 'learning', 'enablement', 'training', 'onboarding', 'instructional']),
  procurement: new Set(['procurement', 'sourcing', 'supplier', 'vendor', 'spend', 'category']),
  finance: new Set(['finance', 'payments', 'accounting', 'forecast', 'financial', 'risk']),
};

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function titleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeSkill(value) {
  return titleCase(
    normalizeText(value)
      .replace(/[^\w\s/&+-]/g, ' ')
      .replace(/\s+/g, ' ')
  );
}

function unique(items, limit = 12) {
  return [...new Set((items || []).map((item) => normalizeSkill(item)).filter(Boolean))].slice(0, limit);
}

function tokenSet(value) {
  return new Set(
    normalizeText(value)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token && token.length > 2)
  );
}

const GENERIC_ROLE_TOKENS = new Set([
  'manager',
  'lead',
  'director',
  'specialist',
  'analyst',
  'associate',
  'coordinator',
  'consultant',
  'architect',
  'engineer',
  'operations',
  'operation',
  'program',
  'project',
  'strategy',
  'strategist',
  'senior',
  'principal',
  'head',
  'global',
  'platform',
  'systems',
  'system',
  'customer',
  'business',
  'data',
]);

function informativeTokenSet(value) {
  return new Set([...tokenSet(value)].filter((token) => !GENERIC_ROLE_TOKENS.has(token)));
}

function inferPivotRoleFamily(pivot) {
  const explicit = normalizeText(pivot?.role_family);
  if (explicit) return explicit;

  const normalized = normalizeText([pivot?.title, pivot?.decision_frame, pivot?.fit_summary].join(' '));
  if (/(legal|contract|compliance|privacy|governance|policy)/.test(normalized)) return 'legal';
  if (/(education|learning|enablement|training|instructional|onboarding)/.test(normalized)) return 'education';
  if (/(procurement|sourcing|supplier|vendor|spend|category|supply chain)/.test(normalized)) return 'procurement';
  if (/(finance|payments|accounting|forecast|financial|fp&a)/.test(normalized)) return 'finance';
  if (/(customer success|account|renewal)/.test(normalized)) return 'customer';
  if (/(marketing|growth|campaign|content|seo)/.test(normalized)) return 'marketing';
  return '';
}

function openingText(opening) {
  return normalizeText([
    opening?.title,
    opening?.role_family,
    opening?.domain_focus,
    Array.isArray(opening?.required_skills) ? opening.required_skills.join(' ') : '',
    Array.isArray(opening?.preferred_skills) ? opening.preferred_skills.join(' ') : '',
  ].join(' '));
}

function normalizeOpeningForGrounding(opening) {
  const groundingTrack = classifyJobTrack(opening);
  return {
    ...opening,
    grounding_track: groundingTrack,
    required_skills: sanitizeGroundingSkills(opening.required_skills, groundingTrack, opening.title),
    preferred_skills: sanitizeGroundingSkills(opening.preferred_skills, groundingTrack, opening.title),
  };
}

function isRolePureOpening(opening, roleFamily) {
  const normalizedFamily = normalizeText(roleFamily);
  const rule = ROLE_PURITY_RULES[normalizedFamily];
  if (!rule) return true;

  const text = openingText(opening);
  const hasRequiredSignal = rule.required.some((pattern) => pattern.test(text));
  const hasBlockedSignal = rule.blocked.some((pattern) => pattern.test(text));

  if (!hasRequiredSignal) return false;
  if (hasBlockedSignal && !hasRequiredSignal) return false;
  return !hasBlockedSignal || rule.required.some((pattern) => pattern.test(String(opening?.title || '').toLowerCase()));
}

function overlapCount(left, right) {
  let count = 0;
  left.forEach((token) => {
    if (right.has(token)) count += 1;
  });
  return count;
}

function inferCurrentProfileSkills(profile, selectedTaskLabels = []) {
  const selectedTasks = Array.isArray(profile?.selected_tasks) ? profile.selected_tasks : [];
  const taskIds = selectedTasks.map((task) => task?.task_id).filter(Boolean);
  const taskLabels = [
    ...selectedTasks.map((task) => task?.label).filter(Boolean),
    ...selectedTaskLabels,
    ...(Array.isArray(profile?.primary_tasks) ? profile.primary_tasks : []),
  ];

  const skills = [];
  for (const taskId of taskIds) {
    skills.push(...(TASK_SKILL_MAP[taskId] || []));
  }

  const jobTitle = profile?.job_title || profile?.jobTitle || '';
  for (const pattern of TITLE_SKILL_PATTERNS) {
    if (pattern.regex.test(jobTitle)) skills.push(...pattern.skills);
  }

  for (const label of taskLabels) {
    const normalized = normalizeText(label);
    if (/sql/.test(normalized)) skills.push('SQL');
    if (/dashboard|kpi/.test(normalized)) skills.push('Dashboarding');
    if (/forecast|budget|variance/.test(normalized)) skills.push('Forecasting');
    if (/stakeholder|alignment|coordination/.test(normalized)) skills.push('Stakeholder Management');
    if (/vendor|supplier|procurement/.test(normalized)) skills.push('Vendor Management');
    if (/contract|policy|compliance/.test(normalized)) skills.push('Compliance');
    if (/training|enablement|onboarding/.test(normalized)) skills.push('Enablement');
    if (/analysis|insight/.test(normalized)) skills.push('Data Analysis');
  }

  const coreSystems = Array.isArray(profile?.clarifiers?.core_systems) ? profile.clarifiers.core_systems : [];
  const tools = unique(coreSystems, 10);

  if (profile?.clarifiers?.management_scope && profile.clarifiers.management_scope !== 'none') {
    skills.push('People Management');
  }
  if (profile?.clarifiers?.role_blend === 'strategy') {
    skills.push('Strategic Planning');
  }

  return {
    current_skills: unique(skills, 20),
    current_tools: tools,
  };
}

function scoreOpeningForPivot(opening, pivotTitle, roleFamily) {
  const titleTokens = tokenSet(pivotTitle);
  const openingTitleTokens = tokenSet(opening.title);
  const informativePivotTokens = informativeTokenSet(pivotTitle);
  const informativeOpeningTokens = informativeTokenSet(opening.title);
  const informativeOverlap = overlapCount(informativePivotTokens, informativeOpeningTokens);
  const normalizedRoleFamily = normalizeText(roleFamily);
  const normalizedOpeningFamily = normalizeText(opening.role_family);
  const domainTokens = ROLE_FAMILY_DOMAIN_TOKENS[normalizedRoleFamily] || new Set();
  const domainOverlap = [...informativePivotTokens].some((token) => domainTokens.has(token) && informativeOpeningTokens.has(token));
  const sameStoredFamily = normalizedRoleFamily && normalizedOpeningFamily === normalizedRoleFamily;
  const genericOverlap = overlapCount(titleTokens, openingTitleTokens) - informativeOverlap;
  let score = (informativeOverlap * 10) + Math.max(0, genericOverlap) * 1;

  const normalizedPivot = normalizeText(pivotTitle);
  const normalizedOpening = normalizeText(opening.title);
  if (normalizedOpening.includes(normalizedPivot) || normalizedPivot.includes(normalizedOpening)) {
    score += 12;
  }

  if (!informativeOverlap && !(normalizedOpening.includes(normalizedPivot) || normalizedPivot.includes(normalizedOpening))) {
    return 0;
  }

  if (
    informativePivotTokens.size >= 2 &&
    informativeOverlap < 2 &&
    !(normalizedOpening.includes(normalizedPivot) || normalizedPivot.includes(normalizedOpening)) &&
    !(sameStoredFamily && domainOverlap)
  ) {
    return 0;
  }

  if (sameStoredFamily) score += 4;
  if (opening.enrichment_status === 'enriched') score += 2;

  return score;
}

function estimateSeniorityStretchPenalty(pivot, profile) {
  const pivotTitle = normalizeText(pivot?.title);
  const currentTitle = normalizeText(profile?.job_title || profile?.jobTitle);
  const managementScope = normalizeText(profile?.clarifiers?.management_scope);
  const currentIsDirectorPlus = /\b(head|director|vp|vice president|chief)\b/.test(currentTitle);
  const currentIsManager = currentIsDirectorPlus || /\bmanager\b/.test(currentTitle);

  if (/\b(chief|vp|vice president)\b/.test(pivotTitle) && !currentIsDirectorPlus) {
    return 16;
  }

  if (/\b(head|director)\b/.test(pivotTitle) && !currentIsDirectorPlus) {
    return managementScope === 'manager_of_managers' ? 5 : 12;
  }

  if (/\bdirector\b/.test(pivotTitle) && !currentIsManager) {
    return 10;
  }

  return 0;
}

async function fetchOpenMarketRows() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const query = supabase
    .from('job_openings')
    .select('id, company_name, title, role_family, domain_focus, required_skills, preferred_skills, tools, proof_assets, enrichment_summary, enrichment_status, posted_at')
    .eq('status', 'open')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(800);

  const { data, error } = await query;
  if (error || !Array.isArray(data)) {
    console.error('Live market fetch failed:', error);
    return [];
  }

  return data;
}

function aggregateMarketRequirements(openings) {
  const requiredCounts = new Map();
  const preferredCounts = new Map();
  const toolCounts = new Map();
  const proofAssetCounts = new Map();
  const titleCounts = new Map();
  const companies = new Set();

  const bump = (map, values) => {
    for (const value of values || []) {
      const normalized = normalizeSkill(value);
      if (!normalized) continue;
      map.set(normalized, (map.get(normalized) || 0) + 1);
    }
  };

  for (const opening of openings) {
    companies.add(opening.company_name);
    titleCounts.set(opening.title, (titleCounts.get(opening.title) || 0) + 1);
    bump(requiredCounts, opening.required_skills);
    bump(preferredCounts, opening.preferred_skills);
    bump(toolCounts, opening.tools);
    bump(proofAssetCounts, opening.proof_assets);
  }

  const rank = (map, limit = 8) =>
    [...map.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, limit)
      .map(([label, count]) => ({ label, count }));

  return {
    openings_count: openings.length,
    companies_count: companies.size,
    sampled_titles: rank(titleCounts, 5),
    required_skills: rank(requiredCounts, 10),
    preferred_skills: rank(preferredCounts, 10),
    tools: rank(toolCounts, 10),
    proof_assets: rank(proofAssetCounts, 8),
  };
}

function buildMarketGapSkill(skillLabel, count, pivot, profile) {
  const roleName = pivot?.title || 'this role';
  const currentTitle = profile?.job_title || 'your current role';
  return {
    skill_name: skillLabel,
    category: 'market demand',
    current_strength: `You have adjacent evidence from ${currentTitle}, but this skill is not yet strongly signaled in your intake profile.`,
    required_level: `Visible enough that hiring teams for ${roleName} would see it in examples, projects, or prior scope.`,
    gap_priority: count >= 3 ? 'critical' : 'medium',
    why_it_matters: `This shows up repeatedly in live job postings for ${roleName}, so it is part of the actual hiring bar rather than a generic LLM suggestion.`,
    evidence_you_already_have: `Your current background already overlaps with ${pivot?.strengths_to_leverage?.[0] || 'related work'}, which gives you a base to build from.`,
    how_to_close_gap: `Build one proof asset that shows ${skillLabel} applied to a realistic business problem connected to ${roleName}.`,
    market_backed: true,
    market_demand_count: count,
  };
}

function compareModelAndMarket({ pivot, market, profileSkills }) {
  const currentSkillSet = new Set(profileSkills.current_skills.map(normalizeSkill));
  const currentToolSet = new Set(profileSkills.current_tools.map(normalizeSkill));
  const modelGapNames = unique((pivot.skill_gaps || []).map((gap) => gap?.skill_name), 20);
  const marketRequired = market.required_skills.map((item) => item.label);
  const marketPreferred = market.preferred_skills.map((item) => item.label);
  const marketTools = market.tools.map((item) => item.label);

  const profileOverlap = marketRequired.filter((skill) => currentSkillSet.has(normalizeSkill(skill)) || currentToolSet.has(normalizeSkill(skill)));
  const missingRequired = marketRequired.filter((skill) => !currentSkillSet.has(normalizeSkill(skill)) && !currentToolSet.has(normalizeSkill(skill)));
  const modelOverlap = modelGapNames.filter((skill) => marketRequired.some((required) => normalizeSkill(required) === normalizeSkill(skill)));
  const modelOnly = modelGapNames.filter((skill) => !marketRequired.some((required) => normalizeSkill(required) === normalizeSkill(skill)));
  const marketOnly = missingRequired.filter((skill) => !modelGapNames.some((gap) => normalizeSkill(gap) === normalizeSkill(skill)));

  const weightedRequiredCoverage = marketRequired.length
    ? Math.round((profileOverlap.length / marketRequired.length) * 100)
    : 0;
  const weightedPreferredCoverage = marketPreferred.length
    ? Math.round((marketPreferred.filter((skill) => currentSkillSet.has(normalizeSkill(skill)) || currentToolSet.has(normalizeSkill(skill))).length / marketPreferred.length) * 100)
    : 0;
  const profileFitScore = Math.round((weightedRequiredCoverage * 0.75) + (weightedPreferredCoverage * 0.25));

  return {
    current_profile_skills: profileSkills.current_skills,
    current_profile_tools: profileSkills.current_tools,
    market_required_skills: marketRequired,
    market_preferred_skills: marketPreferred,
    market_tools: marketTools,
    market_proof_assets: market.proof_assets.map((item) => item.label),
    overlap_skills: profileOverlap,
    missing_required_skills: missingRequired,
    model_skill_gap_names: modelGapNames,
    model_market_overlap: modelOverlap,
    model_only_skill_gaps: modelOnly,
    market_only_required_skills: marketOnly,
    profile_fit_score: profileFitScore,
  };
}

function buildGroundingSummary(market, comparison) {
  if (!market.openings_count) {
    return 'No close live openings were found for this pivot title yet, so this recommendation is currently model-led rather than market-grounded.';
  }

  const topRequired = comparison.market_required_skills.slice(0, 3).join(', ');
  const missing = comparison.missing_required_skills.slice(0, 3).join(', ');

  return `${market.openings_count} live openings matched this pivot. The most repeated required skills are ${topRequired || 'not yet stable'}, and the clearest current gaps from the user profile are ${missing || 'fairly well-covered already'}.`;
}

export function rankPivotWithMarketSignal(pivot, signal, profile = null) {
  const originalMatch = Number(pivot?.match_score || 0);
  const profileFit = Number(signal?.profile_fit_score || 0);
  const openings = Number(signal?.matched_openings_count || 0);
  const overlapCount = Array.isArray(signal?.overlap_skills) ? signal.overlap_skills.length : 0;
  const missingCount = Array.isArray(signal?.missing_required_skills) ? signal.missing_required_skills.length : 0;
  const modelOnlyCount = Array.isArray(signal?.model_only_skill_gaps) ? signal.model_only_skill_gaps.length : 0;

  const demandScore = Math.min(100, openings * 4);
  const overlapBonus = Math.min(12, overlapCount * 3);
  const missingPenalty = Math.min(24, missingCount * 4);
  const modelOnlyPenalty = Math.min(10, modelOnlyCount * 2);
  const seniorityPenalty = estimateSeniorityStretchPenalty(pivot, profile || {});
  const decisionFrame = normalizeText(pivot?.decision_frame);
  const noOpeningFramePenalty = /(highest upside|long.?term platform bet)/.test(decisionFrame) ? 6 : 0;

  if (!openings) {
    const fallbackScore = Math.max(
      28,
      Math.min(40, Math.round(28 + (originalMatch * 0.14) - modelOnlyPenalty - seniorityPenalty - noOpeningFramePenalty))
    );

    return {
      ranking_score: fallbackScore,
      ranking_reason: 'This pivot remains mostly model-led because there were not enough close live openings to ground it confidently.',
      original_match_score: originalMatch,
    };
  }

  const rawMarketBackedFloor = openings >= 5 && profileFit >= 30
    ? 42
    : openings >= 2 && profileFit >= 10
      ? 35
      : 20;
  const marketBackedFloor = Math.max(20, rawMarketBackedFloor - seniorityPenalty);
  const rankingScore = Math.max(
    marketBackedFloor,
    Math.min(
      96,
      Math.round(
        (originalMatch * 0.35)
        + (profileFit * 0.45)
        + (demandScore * 0.2)
        + overlapBonus
        - missingPenalty
        - modelOnlyPenalty
        - seniorityPenalty
      )
    )
  );

  let rankingReason = 'This pivot stays highly ranked because the user already signals a meaningful share of what current postings ask for.';
  if (missingCount >= 4) {
    rankingReason = 'This pivot is being pushed down because live postings repeatedly ask for several skills the user does not clearly signal yet.';
  } else if (modelOnlyCount >= 3) {
    rankingReason = 'This pivot is partially discounted because several proposed gaps appear to come from the model rather than repeated market demand.';
  } else if (profileFit >= 60) {
    rankingReason = 'This pivot is strengthened because live postings and the user profile line up unusually well for an adjacent move.';
  }

  return {
    ranking_score: rankingScore,
    ranking_reason: rankingReason,
    original_match_score: originalMatch,
  };
}

function mergeMarketSkillGaps(pivot, comparison, market, profile) {
  const existing = Array.isArray(pivot.skill_gaps) ? pivot.skill_gaps : [];
  const marketOnly = comparison.market_only_required_skills
    .map((skill) => {
      const count = market.required_skills.find((item) => item.label === skill)?.count || 1;
      return buildMarketGapSkill(skill, count, pivot, profile || {});
    })
    .slice(0, 3);

  const normalizedMarket = new Set(comparison.market_required_skills.map(normalizeSkill));
  const normalizedCurrent = new Set(comparison.current_profile_skills.map(normalizeSkill));

  const enhancedExisting = existing.map((gap) => ({
    ...gap,
    market_backed: normalizedMarket.has(normalizeSkill(gap?.skill_name)),
    already_signaled_by_user: normalizedCurrent.has(normalizeSkill(gap?.skill_name)),
  }));

  const sorted = [
    ...enhancedExisting.sort((left, right) => {
      const leftScore = (left.market_backed ? 2 : 0) + (left.gap_priority === 'critical' ? 1 : 0);
      const rightScore = (right.market_backed ? 2 : 0) + (right.gap_priority === 'critical' ? 1 : 0);
      return rightScore - leftScore;
    }),
    ...marketOnly,
  ];

  return sorted.slice(0, 6);
}

export async function groundReportWithLiveJobMarket(reportData, fallbackProfile = null) {
  if (!reportData || typeof reportData !== 'object') return reportData;

  const profile = reportData.profile || fallbackProfile || {};
  const selectedTaskLabels = Array.isArray(profile.tasks) ? profile.tasks : [];
  const profileSkills = inferCurrentProfileSkills(profile, selectedTaskLabels);
  const allMarketRows = await fetchOpenMarketRows();
  const enrichedPivots = [];
  const pivotGrounding = [];

  for (const pivot of reportData.pivots || []) {
    const pivotRoleFamily = inferPivotRoleFamily(pivot);
    const marketRows = pivotRoleFamily
      ? allMarketRows.filter((opening) => normalizeText(opening.role_family) === pivotRoleFamily || isRolePureOpening(opening, pivotRoleFamily))
      : allMarketRows;
    const scored = marketRows
      .map((opening) => normalizeOpeningForGrounding(opening))
      .filter((opening) => isRolePureOpening(opening, pivotRoleFamily))
      .filter((opening) => isGroundingEligibleForPivot(opening, pivot.title, pivotRoleFamily))
      .map((opening) => ({ opening, score: scoreOpeningForPivot(opening, pivot.title, pivotRoleFamily) }))
      .filter((item) => item.score >= 4)
      .sort((left, right) => right.score - left.score)
      .slice(0, 25)
      .map((item) => item.opening);

    const market = aggregateMarketRequirements(scored);
    const comparison = compareModelAndMarket({ pivot, market, profileSkills });
    const groundingSummary = buildGroundingSummary(market, comparison);
    const marketSignal = {
      matched_openings_count: market.openings_count,
      sampled_companies_count: market.companies_count,
      sampled_titles: market.sampled_titles,
      current_profile_skills: comparison.current_profile_skills,
      current_profile_tools: comparison.current_profile_tools,
      market_required_skills: comparison.market_required_skills,
      market_preferred_skills: comparison.market_preferred_skills,
      market_tools: comparison.market_tools,
      market_proof_assets: comparison.market_proof_assets,
      overlap_skills: comparison.overlap_skills,
      missing_required_skills: comparison.missing_required_skills,
      model_skill_gap_names: comparison.model_skill_gap_names,
      model_market_overlap: comparison.model_market_overlap,
      model_only_skill_gaps: comparison.model_only_skill_gaps,
      market_only_required_skills: comparison.market_only_required_skills,
      profile_fit_score: comparison.profile_fit_score,
      grounding_summary: groundingSummary,
    };

    const ranking = rankPivotWithMarketSignal(pivot, marketSignal, profile);
    const enrichedMarketSignal = {
      ...marketSignal,
      ranking_score: ranking.ranking_score,
      ranking_reason: ranking.ranking_reason,
      original_match_score: ranking.original_match_score,
    };

    enrichedPivots.push({
      ...pivot,
      match_score: ranking.ranking_score,
      live_market_signal: enrichedMarketSignal,
      ranking_reason: ranking.ranking_reason,
      original_match_score: ranking.original_match_score,
      skill_gaps: mergeMarketSkillGaps(pivot, comparison, market, profile),
    });

    pivotGrounding.push({
      pivot_id: pivot.id,
      pivot_title: pivot.title,
      ...enrichedMarketSignal,
    });
  }

  const rerankedPivots = [...enrichedPivots].sort((left, right) => {
    const rightScore = Number(right?.match_score || 0);
    const leftScore = Number(left?.match_score || 0);
    if (rightScore !== leftScore) return rightScore - leftScore;
    return String(left?.title || '').localeCompare(String(right?.title || ''));
  });

  return {
    ...reportData,
    pivots: rerankedPivots,
    live_market_grounding: {
      generated_at: new Date().toISOString(),
      current_profile_skills: profileSkills.current_skills,
      current_profile_tools: profileSkills.current_tools,
      pivots: pivotGrounding.sort((left, right) => {
        const rightScore = Number(right?.ranking_score || 0);
        const leftScore = Number(left?.ranking_score || 0);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return String(left?.pivot_title || '').localeCompare(String(right?.pivot_title || ''));
      }),
    },
  };
}

export async function analyzeProfileAgainstTargetRole({ profile, targetTitle, roleFamily = '' }) {
  const selectedTaskLabels = Array.isArray(profile?.tasks) ? profile.tasks : [];
  const profileSkills = inferCurrentProfileSkills(profile || {}, selectedTaskLabels);
  const allMarketRows = await fetchOpenMarketRows();
  const normalizedRoleFamily = normalizeText(roleFamily);
  const marketRows = normalizedRoleFamily
    ? allMarketRows.filter((opening) => normalizeText(opening.role_family) === normalizedRoleFamily || isRolePureOpening(opening, normalizedRoleFamily))
    : allMarketRows;
  const scored = marketRows
    .map((opening) => normalizeOpeningForGrounding(opening))
    .filter((opening) => isRolePureOpening(opening, normalizedRoleFamily))
    .filter((opening) => isGroundingEligibleForPivot(opening, targetTitle, normalizedRoleFamily))
    .map((opening) => ({ opening, score: scoreOpeningForPivot(opening, targetTitle, normalizedRoleFamily) }))
    .filter((item) => item.score >= 4)
    .sort((left, right) => right.score - left.score)
    .slice(0, 25)
    .map((item) => item.opening);
  const market = aggregateMarketRequirements(scored);
  const comparison = compareModelAndMarket({
    pivot: { title: targetTitle, skill_gaps: [] },
    market,
    profileSkills,
  });

  return {
    target_title: targetTitle,
    matched_openings_count: market.openings_count,
    sampled_companies_count: market.companies_count,
    sampled_titles: market.sampled_titles,
    current_profile_skills: profileSkills.current_skills,
    current_profile_tools: profileSkills.current_tools,
    market_required_skills: comparison.market_required_skills,
    market_preferred_skills: comparison.market_preferred_skills,
    market_tools: comparison.market_tools,
    market_proof_assets: comparison.market_proof_assets,
    overlap_skills: comparison.overlap_skills,
    missing_required_skills: comparison.missing_required_skills,
    profile_fit_score: comparison.profile_fit_score,
    grounding_summary: buildGroundingSummary(market, comparison),
  };
}
