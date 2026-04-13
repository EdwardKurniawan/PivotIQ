import { applyReportQualityGate } from './report-quality.js';

const DEFAULT_TASK_RISKS = {
  'Writing reports': 82,
  'Analyzing data': 76,
  'Client calls': 28,
  'Managing people': 22,
  'Coding / Dev': 61,
  'Customer support': 73,
  Research: 58,
  'Creating content': 84,
  'Running meetings': 24,
  'Building models': 52,
  'Reviewing docs': 68,
  'Strategy & planning': 34,
  'Reporting and status updates': 81,
  'Analysis and insight generation': 76,
  'Forecasting and planning': 51,
  'Dashboarding and KPI tracking': 62,
  'Data cleanup and validation': 78,
  'Client calls and relationship management': 26,
  'Stakeholder updates and coordination': 38,
  'Meeting facilitation and follow-through': 24,
  'Cross-functional alignment': 29,
  'Decision memos and recommendations': 63,
  'Proposal writing and presentations': 69,
  'Documentation and knowledge capture': 74,
  'Policy and compliance documentation': 65,
  'Content briefing and creation': 82,
  'Campaign performance reporting': 79,
  'Market and competitor research': 61,
  'User research and synthesis': 46,
  'Process mapping and improvement': 41,
  'Project tracking and follow-up': 55,
  'Vendor and partner coordination': 37,
  'Managing or coaching people': 22,
  'Strategy and roadmap planning': 34,
  'Candidate screening and evaluation': 84,
  'Interview coordination and scheduling': 79,
  'People operations reporting': 74,
  'Budgeting and cost management': 57,
  'Variance analysis and reconciliation': 64,
  'Pipeline reporting and CRM hygiene': 72,
  'Customer issue resolution': 67,
  'Ticket triage and routing': 81,
  'Knowledge base and help center writing': 71,
  'Coding and implementation': 61,
  'Debugging, QA, and troubleshooting': 41,
  'System design and architecture decisions': 27,
  'Automation building and workflow tooling': 31,
  'Contract review and redlining': 63,
  'Curriculum or program design': 44,
};

const FALLBACK_TASK_TRANSLATIONS = {
  nl: {
    'Stakeholder updates and coordination': 'Stakeholder-updates en coördinatie',
  },
  de: {
    'Stakeholder updates and coordination': 'Stakeholder-Updates und Koordination',
  },
};

function translateFallbackTask(locale, taskName) {
  if (!taskName) return taskName;
  const normalizedLocale = String(locale || 'en').toLowerCase();
  return FALLBACK_TASK_TRANSLATIONS[normalizedLocale]?.[taskName] || taskName;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function hasMeaningfulPivotId(id) {
  const normalized = normalizeText(id);
  if (!normalized) return false;
  if (normalized.startsWith('pivot ')) return false;
  const frameLikeIds = new Set([
    'safest transition',
    'strongest leverage fit',
    'fastest cash recovery',
    'highest upside',
    'long term platform bet',
    'long-term platform bet',
  ]);
  return !frameLikeIds.has(normalized);
}

function polishPivotTitle(title) {
  return String(title || '')
    .replace(/\s*,\s*/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractJsonCandidate(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

export function parseModelJson(rawText) {
  const candidate = extractJsonCandidate(rawText);
  if (!candidate) return null;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function extractTaskLabels(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .map((task) => {
      if (typeof task === 'string') return task;
      return task?.label || task?.task_name || '';
    })
    .filter(Boolean);
}

function buildWeek({
  weekNumber,
  title,
  goal,
  why,
  problem,
  actions,
  timeCommitment,
  successSignal,
  proof,
  blockers,
  catchUp,
  encouragement,
}) {
  return {
    week_number: weekNumber,
    title,
    goal,
    why_this_week: why,
    problem_being_solved: problem,
    actions,
    time_commitment: timeCommitment,
    success_signal: successSignal,
    proof_of_completion: proof,
    common_blockers: blockers,
    catch_up_plan: catchUp,
    encouragement,
  };
}

function buildSkillGap({
  skillName,
  category,
  currentStrength,
  requiredLevel,
  gapPriority,
  whyItMatters,
  evidence,
  howToClose,
  resourceTitle,
  resourceUrl,
  resourceProvider = '',
  resourceAccess = '',
  resourcePriceLabel = '',
  resourceType = 'course',
  resourceLevel = '',
  resourceDurationLabel = '',
  resourceVerified = false,
  resourceVerificationStatus = '',
}) {
  return {
    skill_name: skillName,
    category,
    current_strength: currentStrength,
    required_level: requiredLevel,
    gap_priority: gapPriority,
    why_it_matters: whyItMatters,
    evidence_you_already_have: evidence,
    how_to_close_gap: howToClose,
    resource_title: resourceTitle,
    resource_url: resourceUrl,
    resource_provider: resourceProvider,
    resource_access: resourceAccess,
    resource_price_label: resourcePriceLabel,
    resource_type: resourceType,
    resource_level: resourceLevel,
    resource_duration_label: resourceDurationLabel,
    resource_verified: resourceVerified,
    resource_verification_status: resourceVerificationStatus,
  };
}

function buildPivot({
  id,
  title,
  fitSummary,
  outcome,
  decisionFrame,
  whoThisIsFor,
  tradeoffs,
  whyThisPathWins,
  whatYouAreBettingOn,
  matchScore,
  salaryRange,
  salaryDelta,
  transitionTime,
  difficulty,
  strengths,
  skillGaps,
  weeks,
}) {
  return {
    id,
    title,
    fit_summary: fitSummary,
    outcome,
    decision_frame: decisionFrame,
    who_this_is_for: whoThisIsFor,
    tradeoffs: tradeoffs || [],
    why_this_path_wins: whyThisPathWins,
    what_you_are_betting_on: whatYouAreBettingOn,
    match_score: matchScore,
    salary_range: salaryRange,
    salary_delta: salaryDelta,
    transition_time: transitionTime,
    difficulty,
    strengths_to_leverage: strengths,
    skill_gaps: skillGaps,
    roadmap: { weeks },
  };
}

function buildLearningPath(skillGaps = [], profile = null) {
  const withResources = normalizeArray(skillGaps).filter((skill) => skill?.resource_title && skill?.resource_url);
  if (!withResources.length) return [];

  const critical = pickStartingSkillGap(withResources, profile) || withResources[0];
  const proof = withResources.find((skill) =>
    skill !== critical &&
    /portfolio|proof|dashboard|workflow|prototype|build|artifact|case study/i.test([
      skill?.how_to_close_gap,
      skill?.skill_name,
      skill?.resource_title,
    ].join(' '))
  ) || withResources.find((skill) => skill !== critical) || critical;
  const deeper = withResources.find((skill) =>
    skill !== critical &&
    skill !== proof &&
    /intermediate|advanced|agent|automation|governance|strategy|specialization/i.test([
      skill?.resource_level,
      skill?.resource_title,
      skill?.skill_name,
    ].join(' '))
  ) || withResources.find((skill) => skill !== critical && skill !== proof) || proof;

  return [
    { label: 'Start here', helper: 'Learn just enough to redesign one real workflow or decision.', ...critical },
    { label: 'Build proof', helper: 'Turn that learning into a visible asset someone else can review in minutes.', ...proof },
    { label: 'Go deeper', helper: 'Add depth only after the first artifact is already creating signal.', ...deeper },
  ].filter((step, index, steps) =>
    step.resource_title &&
    steps.findIndex((item) => item.label === step.label && item.resource_title === step.resource_title) === index
  );
}

const DEFAULT_PIVOT_DECISION_FRAMES = [
  'safest transition',
  'strongest leverage fit',
  'fastest cash recovery',
  'highest upside',
  'long-term platform bet',
];

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

const EXPERIENCE_BAND_RANK = Object.freeze({
  '0_2': 0,
  '3_5': 1,
  '6_10': 2,
  '11_plus': 3,
});

const AI_MATURITY_RANK = Object.freeze({
  never_use_it: 0,
  occasionally: 1,
  weekly: 2,
  repeatable_workflows: 3,
  team_level_adoption: 4,
});

const TECHNICAL_CAPABILITY_RANK = Object.freeze({
  no_code_only: 0,
  advanced_spreadsheets: 1,
  sql_bi: 2,
  scripting_python: 3,
  software_engineering: 4,
});

const PROOF_STATE_RANK = Object.freeze({
  none: 0,
  internal_project: 1,
  dashboard_or_analysis: 2,
  workflow_or_playbook: 3,
  portfolio_or_case_study: 4,
});

function normalizeCoreSystemsInput(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function extractIntakeClarifiers(intakeProfile = null) {
  const nested = intakeProfile?.clarifiers && typeof intakeProfile.clarifiers === 'object'
    ? intakeProfile.clarifiers
    : {};
  const fallback = intakeProfile && typeof intakeProfile === 'object'
    ? intakeProfile
    : {};

  return {
    goal_now: nested.goal_now || fallback.goal_now || null,
    timeline_urgency: nested.timeline_urgency || fallback.timeline_urgency || null,
    years_experience_band: nested.years_experience_band || fallback.years_experience_band || null,
    location_preference: nested.location_preference || fallback.location_preference || null,
    ai_maturity: nested.ai_maturity || fallback.ai_maturity || null,
    technical_capability: nested.technical_capability || fallback.technical_capability || null,
    salary_tolerance: nested.salary_tolerance || fallback.salary_tolerance || null,
    proof_state: nested.proof_state || fallback.proof_state || null,
    role_blend: nested.role_blend || fallback.role_blend || null,
    management_scope: nested.management_scope || fallback.management_scope || null,
    decision_scope: nested.decision_scope || fallback.decision_scope || null,
    domain_focus: nested.domain_focus || fallback.domain_focus || null,
    core_systems: normalizeCoreSystemsInput(nested.core_systems || fallback.core_systems),
  };
}

function getProfileClarifiers(profile = null) {
  return profile?.clarifiers && typeof profile.clarifiers === 'object'
    ? profile.clarifiers
    : {};
}

function getGoalNow(profile = null) {
  return getProfileClarifiers(profile).goal_now || 'not_sure';
}

function getTimelineUrgency(profile = null) {
  return getProfileClarifiers(profile).timeline_urgency || '';
}

function getYearsExperienceBand(profile = null) {
  return getProfileClarifiers(profile).years_experience_band || '';
}

function getLocationPreference(profile = null) {
  return getProfileClarifiers(profile).location_preference || '';
}

function getAiMaturity(profile = null) {
  return getProfileClarifiers(profile).ai_maturity || '';
}

function getTechnicalCapability(profile = null) {
  return getProfileClarifiers(profile).technical_capability || '';
}

function getSalaryTolerance(profile = null) {
  return getProfileClarifiers(profile).salary_tolerance || '';
}

function getProofState(profile = null) {
  return getProfileClarifiers(profile).proof_state || '';
}

function aiMaturityRank(value) {
  return AI_MATURITY_RANK[String(value || '')] ?? 0;
}

function technicalCapabilityRank(value) {
  return TECHNICAL_CAPABILITY_RANK[String(value || '')] ?? 0;
}

function proofStateRank(value) {
  return PROOF_STATE_RANK[String(value || '')] ?? 0;
}

function hasAdvancedAiMaturity(profile = null) {
  return aiMaturityRank(getAiMaturity(profile)) >= 3;
}

function salaryToleranceIsStrict(value = '') {
  return value === 'cannot_take_cut' || value === 'up_to_10_percent';
}

function parsePercentValue(value) {
  const match = String(value || '').match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

function estimateTechnicalDemand(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  if (/\b(software engineer|software engineering|machine learning engineer|data scientist|developer)\b/.test(text)) return 4;
  if (/\b(python|scripting|api|code|automation consultant|workflow automation consultant|architect)\b/.test(text)) return 3;
  if (/\b(sql|bi|power bi|tableau|dashboard|analytics|systems|systems manager|data)\b/.test(text)) return 2;
  if (/\b(workflow|automation|prompt|governance|adoption|copilot|no-code)\b/.test(text)) return 1;
  return 0;
}

function technicalDemandForPivot(pivot = null) {
  const pivotText = [
    pivot?.title,
    ...normalizeArray(pivot?.skill_gaps).flatMap((skill) => [
      skill?.skill_name,
      skill?.category,
      skill?.required_level,
      skill?.resource_title,
    ]),
  ].join(' ');

  return estimateTechnicalDemand(pivotText);
}

function technicalOvershootForPivot(pivot = null, profile = null) {
  const declaredCapability = getTechnicalCapability(profile);
  if (!declaredCapability) return 0;
  const userRank = technicalCapabilityRank(declaredCapability);
  const demandRank = technicalDemandForPivot(pivot);
  return Math.max(0, demandRank - userRank);
}

function technicalCapabilityLabel(value = '') {
  if (value === 'no_code_only') return 'no-code only';
  if (value === 'advanced_spreadsheets') return 'advanced spreadsheets';
  if (value === 'sql_bi') return 'SQL / BI';
  if (value === 'scripting_python') return 'scripting / Python';
  if (value === 'software_engineering') return 'software engineering';
  return 'the current technical comfort level';
}

function salaryToleranceMismatch(bestPivot = null, profile = null) {
  const tolerance = getSalaryTolerance(profile);
  if (!salaryToleranceIsStrict(tolerance)) return false;

  const delta = parsePercentValue(bestPivot?.salary_delta);
  const transitionText = normalizeText(bestPivot?.transition_time);
  const unclearDelta = delta == null || /flat|similar|unclear|lateral|promotion|scope upgrade/.test(normalizeText(bestPivot?.salary_delta));

  if (tolerance === 'cannot_take_cut') {
    return unclearDelta || (delta != null && delta < 0) || /month/.test(transitionText);
  }

  return unclearDelta || (delta != null && delta < 10) || /4-6 months|4–6 months|5-7 months|6-10 weeks/.test(transitionText);
}

function proofStateActionLabel(value = '') {
  if (value === 'internal_project') return 'package an internal project into visible proof';
  if (value === 'dashboard_or_analysis') return 'turn an existing analysis into a stronger decision case';
  if (value === 'workflow_or_playbook') return 'turn an existing workflow into a reusable proof asset';
  if (value === 'portfolio_or_case_study') return 'upgrade an existing case into stronger market-facing proof';
  return 'build your first visible proof asset';
}

function titleSeniorityLevel(title) {
  const normalized = normalizeText(title);
  if (!normalized) return 0;
  if (/\b(chief|vp|vice president|head|director|principal)\b/.test(normalized)) return 3;
  if (/\barchitect\b/.test(normalized)) return 2;
  if (/\b(manager|lead|partner|consultant)\b/.test(normalized)) return 1;
  return 0;
}

function maxSeniorityLevelForExperienceBand(yearsBand = '') {
  return EXPERIENCE_BAND_RANK[yearsBand] ?? 3;
}

function getExperienceBandLabel(yearsBand = '') {
  if (yearsBand === '0_2') return '0-2 years';
  if (yearsBand === '3_5') return '3-5 years';
  if (yearsBand === '6_10') return '6-10 years';
  if (yearsBand === '11_plus') return '11+ years';
  return 'this experience band';
}

function seniorityOvershoot(title, yearsBand = '') {
  if (!yearsBand) return 0;
  return Math.max(0, titleSeniorityLevel(title) - maxSeniorityLevelForExperienceBand(yearsBand));
}

function targetMarketNeedsExtraCaution(profile = null) {
  const locationPreference = getLocationPreference(profile);
  return locationPreference === 'global_remote' || locationPreference === 'other';
}

function calibrateGrowthTitleForExperience(roleFamily, yearsBand, fallbackTitle) {
  if (!fallbackTitle || !yearsBand || yearsBand === '11_plus') return fallbackTitle;

  const earlyCareerTitles = {
    marketing: 'Marketing Operations Specialist',
    analytics: 'Business Intelligence Analyst',
    finance: 'Strategic Finance Analyst',
    hr: 'People Operations Analyst',
    customer: 'Customer Operations Analyst',
    legal: 'Legal Operations Analyst',
    procurement: 'Strategic Sourcing Analyst',
    education: 'Learning Operations Specialist',
    operations: 'Program Operations Coordinator',
    product: 'Business Operations Analyst',
    general: 'Operations Analyst',
  };

  const midCareerTitles = {
    marketing: 'Marketing Operations Strategist',
    analytics: 'Business Intelligence Lead',
    finance: 'Finance Business Partner',
    hr: 'People Operations Manager',
    customer: 'Customer Success Strategy Manager',
    legal: 'Legal Operations Analyst',
    procurement: 'Spend Analytics Manager',
    education: 'Learning Operations Manager',
    operations: 'Program Operations Manager',
    product: 'Business Operations Manager',
    general: 'Operations Manager',
  };

  if (yearsBand === '0_2' && titleSeniorityLevel(fallbackTitle) > 0) {
    return earlyCareerTitles[roleFamily] || earlyCareerTitles.general;
  }

  if (yearsBand === '3_5' && titleSeniorityLevel(fallbackTitle) > 1) {
    return midCareerTitles[roleFamily] || midCareerTitles.general;
  }

  if (yearsBand === '6_10' && titleSeniorityLevel(fallbackTitle) > 2) {
    return String(fallbackTitle).replace(/\b(Director|Head|Principal)\b/gi, 'Manager');
  }

  return fallbackTitle;
}

function isBeginnerAiSkill(skill) {
  const text = normalizeText([
    skill?.skill_name,
    skill?.resource_title,
    skill?.resource_provider,
  ].join(' '));

  if (/\b(ai workflow design|workflow design|automation mapping|workflow prototyping|ai qa workflows|decision communication)\b/.test(text)) {
    return false;
  }

  return /(prompt design|ai literacy|ai for everyone|intro to ai|introduction to ai|google ai essentials|openai academy|anthropic academy|fundamentals)/.test(text);
}

function isAdvancedAiWorkflowSkill(skill) {
  const text = normalizeText([
    skill?.skill_name,
    skill?.category,
    skill?.resource_title,
    skill?.how_to_close_gap,
  ].join(' '));

  return /(workflow|automation|governance|quality control|qa|decision|system|adoption|analytics|sql|dashboard|forecast|planning|compliance|contract lifecycle|procurement|enablement)/.test(text);
}

function pickStartingSkillGap(skillGaps = [], profile = null) {
  const withResources = normalizeArray(skillGaps).filter((skill) => skill?.resource_title && skill?.resource_url);
  if (!withResources.length) return normalizeArray(skillGaps)[0] || null;

  const technicalRank = technicalCapabilityRank(getTechnicalCapability(profile));
  const accessiblePool = withResources.filter((skill) =>
    estimateTechnicalDemand([
      skill?.skill_name,
      skill?.category,
      skill?.required_level,
      skill?.resource_title,
    ].join(' ')) <= technicalRank + 1
  );
  const candidatePool = accessiblePool.length ? accessiblePool : withResources;
  const defaultCritical = candidatePool.find((skill) => normalizeText(skill?.gap_priority) === 'critical') || candidatePool[0];
  if (!hasAdvancedAiMaturity(profile)) {
    return defaultCritical;
  }

  return candidatePool.find((skill) =>
    normalizeText(skill?.gap_priority) === 'critical'
    && isAdvancedAiWorkflowSkill(skill)
    && !isBeginnerAiSkill(skill)
  ) || candidatePool.find((skill) =>
    isAdvancedAiWorkflowSkill(skill)
    && !isBeginnerAiSkill(skill)
  ) || defaultCritical;
}

function roadmapMentionsPivotTitle(weeks, pivotTitle) {
  const normalizedTitle = normalizeText(pivotTitle);
  if (!normalizedTitle) return false;

  const roadmapText = normalizeText(
    normalizeArray(weeks)
      .slice(0, 4)
      .flatMap((week) => [
        week?.title,
        week?.goal,
        week?.why_this_week,
        week?.problem_being_solved,
        ...(Array.isArray(week?.actions) ? week.actions : []),
      ])
      .join(' ')
  );

  return roadmapText.includes(normalizedTitle);
}

function uniqueTokens(value) {
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token && token.length > 2)
  );
}

function jaccardSimilarity(left, right) {
  if (!left.size || !right.size) return 0;
  const union = new Set([...left, ...right]);
  let intersectionSize = 0;
  left.forEach((token) => {
    if (right.has(token)) intersectionSize += 1;
  });
  return intersectionSize / union.size;
}

function titleTooClose(title, currentJobTitle) {
  const normalizedTitle = normalizeText(title);
  const normalizedCurrent = normalizeText(currentJobTitle);
  if (!normalizedTitle || !normalizedCurrent) return false;
  if (normalizedTitle === normalizedCurrent) return true;
  return jaccardSimilarity(uniqueTokens(normalizedTitle), uniqueTokens(normalizedCurrent)) >= 0.8;
}

function chooseDistinctTitle(options, currentJobTitle, fallbackTitle) {
  return options.find((option) => option && !titleTooClose(option, currentJobTitle)) || fallbackTitle || options[0] || '';
}

function inferRoleFamily(text) {
  const normalized = normalizeText(text);
  if (/(legal|paralegal|contract|compliance|clm|privacy|governance)/.test(normalized)) return 'legal';
  if (/(procurement|sourcing|supplier|vendor|purchasing|spend management)/.test(normalized)) return 'procurement';
  if (/(education|enablement|training|learning|curriculum|instructional|onboarding)/.test(normalized)) return 'education';
  if (/(data analyst|business intelligence|bi analyst|analytics|reporting analyst|reporting specialist|power bi|tableau|looker|sql analyst|data visualization)/.test(normalized)) return 'analytics';
  if (/(marketing|growth|brand|demand|campaign|content|seo|crm)/.test(normalized)) return 'marketing';
  if (/(fp&a|finance|financial|accounting|accountant|controller|budget|forecast)/.test(normalized)) return 'finance';
  if (/(hr|human resources|people|recruit|talent|workforce)/.test(normalized)) return 'hr';
  if (/(customer success|account manager|sales ops|revops|revenue operations|sales operations)/.test(normalized)) return 'customer';
  if (/(executive assistant|assistant to|administrative assistant|executive support|chief of staff|office of the ceo|calendar management|meeting prep)/.test(normalized)) return 'admin';
  if (/(operations|office manager|program manager|project manager|coordinator|admin|administrative)/.test(normalized)) return 'operations';
  if (/(product|strategy|bizops|business operations|analyst)/.test(normalized)) return 'product';
  return 'general';
}

function inferRoleFamilyFromProfile(jobTitle, industry, tasks = [], clarifiers = null) {
  const explicitRoleFamily = inferRoleFamily(jobTitle);
  if (explicitRoleFamily && explicitRoleFamily !== 'general') return explicitRoleFamily;
  const coreSystems = Array.isArray(clarifiers?.core_systems) ? clarifiers.core_systems : [];
  const domainFocus = clarifiers?.domain_focus ? [clarifiers.domain_focus] : [];
  const decisionScope = clarifiers?.decision_scope ? [clarifiers.decision_scope] : [];
  return inferRoleFamily([jobTitle, industry, ...tasks, ...domainFocus, ...coreSystems, ...decisionScope].join(' '));
}

function roleFamilyNeedsConservativePivotBias(roleFamily = '') {
  return [
    'general',
    'operations',
    'customer',
    'marketing',
    'analytics',
    'admin',
    'finance',
    'hr',
  ].includes(String(roleFamily || ''));
}

function buildStayRoleBlueprint(roleFamily, locale = 'en') {
  const copy = {
    en: {
      marketing: {
        nextTitle: 'Marketing Strategy Lead',
        opportunities: [
          'Turn campaign reporting into decision-ready growth reviews',
          'Build AI-assisted briefing systems for content and demand teams',
          'Lead testing velocity and experimentation governance',
        ],
        proofAsset: 'AI-assisted campaign planning operating system',
        metric: 'Reduce campaign planning turnaround time while increasing testing velocity',
        narrative: 'I am making marketing execution faster, but more importantly I am making planning and decision quality stronger.',
      },
      analytics: {
        nextTitle: 'Business Intelligence Lead',
        opportunities: [
          'Turn dashboards into decision-ready review packs',
          'Build AI-assisted analysis workflows with QA and stakeholder-ready narratives',
          'Lead KPI definitions and reporting standards teams can trust',
        ],
        proofAsset: 'AI-assisted KPI review and decision pack',
        metric: 'Reduce dashboard-to-decision turnaround while improving reporting trust and clarity',
        narrative: 'I am not just producing reports. I am building the analytics layer leaders rely on for decisions.',
      },
      finance: {
        nextTitle: 'Finance Planning Lead',
        opportunities: [
          'Turn forecasting into faster scenario support for leaders',
          'Build AI-assisted monthly business review narratives',
          'Own the finance workflow that translates numbers into decisions',
        ],
        proofAsset: 'AI-assisted finance planning and variance review pack',
        metric: 'Reduce planning cycle time while improving decision-readiness of finance narratives',
        narrative: 'I am not only accelerating analysis. I am making finance a faster decision partner for the business.',
      },
      hr: {
        nextTitle: 'People Operations Lead',
        opportunities: [
          'Turn policy and people questions into a reliable AI-assisted support layer',
          'Build manager enablement workflows that reduce repeated HR escalations',
          'Lead AI-assisted org-health and workforce insight reporting',
        ],
        proofAsset: 'AI-assisted manager support and policy workflow',
        metric: 'Reduce repeated HR escalations while improving response consistency',
        narrative: 'I am using AI to make HR support more scalable, but also to increase the strategic quality of people decisions.',
      },
      admin: {
        nextTitle: 'Executive Operations Lead',
        opportunities: [
          'Turn calendar, prep, and follow-up work into cleaner executive operating workflows',
          'Build AI-assisted briefing and decision-support systems for leadership',
          'Lead a reusable operating rhythm that reduces coordination drag for the executive team',
        ],
        proofAsset: 'AI-assisted executive support and briefing system',
        metric: 'Reduce executive prep and follow-up load while improving briefing quality',
        narrative: 'I am not just managing coordination. I am building the operating system that helps leadership move faster with better context.',
      },
      customer: {
        nextTitle: 'Customer Success Strategy Lead',
        opportunities: [
          'Turn renewal prep into AI-assisted risk and expansion reviews',
          'Build reusable AI-assisted onboarding and account-planning workflows',
          'Lead account insight reporting that helps teams act earlier',
        ],
        proofAsset: 'AI-assisted account health and renewal workflow',
        metric: 'Improve renewal-readiness and reduce manual prep time for account reviews',
        narrative: 'I am making customer-facing work more proactive, more scalable, and more commercially useful.',
      },
      legal: {
        nextTitle: 'Legal Technology Lead',
        opportunities: [
          'Turn contract intake into a cleaner AI-assisted triage and review workflow',
          'Build policy and clause playbooks that make legal requests easier to route and answer',
          'Lead operating standards for legal requests, approvals, and knowledge reuse',
        ],
        proofAsset: 'AI-assisted contract intake and clause review system',
        metric: 'Reduce contract cycle time while improving request quality and review consistency',
        narrative: 'I am not just helping legal move faster. I am making legal intake, review, and decision quality more scalable.',
      },
      procurement: {
        nextTitle: 'Strategic Sourcing Manager',
        opportunities: [
          'Turn vendor intake into an AI-assisted sourcing and qualification workflow',
          'Build reusable supplier comparison and decision-support packs',
          'Lead procurement operating rhythms that reduce manual follow-up and improve buying clarity',
        ],
        proofAsset: 'AI-assisted supplier evaluation and sourcing workflow',
        metric: 'Reduce sourcing cycle time while improving supplier comparison quality',
        narrative: 'I am using AI to make procurement faster, but also to improve supplier judgment and decision-readiness.',
      },
      education: {
        nextTitle: 'Learning Experience Lead',
        opportunities: [
          'Turn curriculum work into AI-assisted learning design and update workflows',
          'Build reusable onboarding and enablement systems that scale with less manual rewriting',
          'Lead measurement loops that connect learning content to adoption and performance',
        ],
        proofAsset: 'AI-assisted customer education and enablement system',
        metric: 'Reduce content update time while improving learner adoption and program readiness',
        narrative: 'I am not just shipping training faster. I am making learning programs more scalable, measurable, and easier for teams to use.',
      },
      operations: {
        nextTitle: 'Program Operations Lead',
        opportunities: [
          'Turn intake and coordination work into cleaner automated workflows',
          'Build AI-assisted status reporting and follow-up systems',
          'Lead operational standards that make team throughput more reliable',
        ],
        proofAsset: 'AI-assisted intake and coordination system',
        metric: 'Reduce manual follow-up load while improving response consistency',
        narrative: 'I am not just keeping operations moving. I am redesigning how operational work flows through the team.',
      },
      product: {
        nextTitle: 'Business Operations Lead',
        opportunities: [
          'Turn analysis into faster, decision-ready recommendation memos',
          'Build AI-assisted research synthesis and prioritization workflows',
          'Lead operating rhythms that make planning and review sharper',
        ],
        proofAsset: 'AI-assisted strategy and prioritization brief',
        metric: 'Reduce decision memo turnaround time while improving clarity and reuse',
        narrative: 'I am using AI to increase the speed of analysis, but also to raise the quality of strategic judgment.',
      },
      general: {
        nextTitle: 'Higher-leverage version of your current role',
        opportunities: [
          'Turn repetitive execution into AI-assisted workflow design',
          'Move from raw output into interpretation and decision support',
          'Lead one visible AI adoption pattern for your team',
        ],
        proofAsset: 'Internal AI leverage case',
        metric: 'Improve speed, quality, or decision support on one high-visibility workflow',
        narrative: 'I am using AI to become more strategic, not just more efficient.',
      },
    },
  };

  const selected = copy.en[roleFamily] || copy.en.general;
  if (locale === 'nl') {
    return {
      ...selected,
      nextTitle:
        roleFamily === 'marketing' ? 'Marketing Strategy Lead'
        : roleFamily === 'analytics' ? 'Business Intelligence Lead'
        : roleFamily === 'finance' ? 'Finance Planning Lead'
        : roleFamily === 'hr' ? 'People Operations Lead'
        : roleFamily === 'admin' ? 'Executive Operations Lead'
        : roleFamily === 'customer' ? 'Customer Success Strategy Lead'
        : roleFamily === 'legal' ? 'Legal Technology Lead'
        : roleFamily === 'procurement' ? 'Strategic Sourcing Manager'
        : roleFamily === 'education' ? 'Learning Experience Lead'
        : roleFamily === 'operations' ? 'Program Operations Lead'
        : roleFamily === 'product' ? 'Business Operations Lead'
        : 'Sterkere versie van je huidige rol',
      proofAsset:
        roleFamily === 'marketing' ? 'AI-ondersteund campagneplanningssysteem'
        : roleFamily === 'analytics' ? 'AI-ondersteund KPI-review en besluitvormingspakket'
        : roleFamily === 'finance' ? 'AI-ondersteund finance planning- en variantie review pack'
        : roleFamily === 'hr' ? 'AI-ondersteunde manager- en policyworkflow'
        : roleFamily === 'admin' ? 'AI-ondersteund executive support- en briefingsysteem'
        : roleFamily === 'customer' ? 'AI-ondersteunde account health- en renewalworkflow'
        : roleFamily === 'legal' ? 'AI-ondersteund contract intake- en clausulereviewsysteem'
        : roleFamily === 'procurement' ? 'AI-ondersteunde supplier-evaluatie en sourcingworkflow'
        : roleFamily === 'education' ? 'AI-ondersteund customer education- en enablementsysteem'
        : roleFamily === 'operations' ? 'AI-ondersteund intake- en coördinatiesysteem'
        : roleFamily === 'product' ? 'AI-ondersteunde business-operationsbrief'
        : 'Interne AI-leverage case',
    };
  }
  if (locale === 'de') {
    return {
      ...selected,
      nextTitle:
        roleFamily === 'marketing' ? 'Marketing Strategy Lead'
        : roleFamily === 'analytics' ? 'Business Intelligence Lead'
        : roleFamily === 'finance' ? 'Finance Planning Lead'
        : roleFamily === 'hr' ? 'People Operations Lead'
        : roleFamily === 'admin' ? 'Executive Operations Lead'
        : roleFamily === 'customer' ? 'Customer Success Strategy Lead'
        : roleFamily === 'legal' ? 'Legal Technology Lead'
        : roleFamily === 'procurement' ? 'Strategic Sourcing Manager'
        : roleFamily === 'education' ? 'Learning Experience Lead'
        : roleFamily === 'operations' ? 'Program Operations Lead'
        : roleFamily === 'product' ? 'Business Operations Lead'
        : 'Stärkere Version deiner aktuellen Rolle',
      proofAsset:
        roleFamily === 'marketing' ? 'KI-gestütztes Kampagnenplanungs-System'
        : roleFamily === 'analytics' ? 'KI-gestütztes KPI-Review- und Entscheidungspaket'
        : roleFamily === 'finance' ? 'KI-gestütztes Finance-Planning- und Varianz-Review-Pack'
        : roleFamily === 'hr' ? 'KI-gestützter Manager- und Policy-Workflow'
        : roleFamily === 'admin' ? 'KI-gestütztes Executive-Support- und Briefing-System'
        : roleFamily === 'customer' ? 'KI-gestützter Account-Health- und Renewal-Workflow'
        : roleFamily === 'legal' ? 'KI-gestütztes Vertrags-Intake- und Klausel-Review-System'
        : roleFamily === 'procurement' ? 'KI-gestützter Lieferantenbewertungs- und Sourcing-Workflow'
        : roleFamily === 'education' ? 'KI-gestütztes Customer-Education- und Enablement-System'
        : roleFamily === 'operations' ? 'KI-gestütztes Intake- und Koordinationssystem'
        : roleFamily === 'product' ? 'KI-gestütztes Business-Operations-Brief'
        : 'Interner KI-Leverage-Case',
    };
  }
  return selected;
}

function getRoleTaskAnchors(profile = null) {
  const primaryTasks = normalizeArray(profile?.primary_tasks);
  const tasks = normalizeArray(profile?.tasks);
  const seen = new Set();
  const anchors = [...primaryTasks, ...tasks]
    .map((item) => String(item || '').trim())
    .filter((item) => {
      const normalized = normalizeText(item);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

  return [
    anchors[0] || 'your highest-visibility workflow',
    anchors[1] || 'stakeholder communication',
    anchors[2] || 'team coordination',
  ];
}

function getCoreSystems(profile = null) {
  return normalizeArray(getProfileClarifiers(profile).core_systems);
}

function coreSystemsInclude(profile = null, pattern) {
  return getCoreSystems(profile).some((system) => pattern.test(normalizeText(system)));
}

function buildStayResource({
  title,
  url,
  provider,
  access = '',
  type = 'course',
  verified = true,
  verificationStatus = 'stay-advance-role-native',
}) {
  return {
    resourceTitle: title,
    resourceUrl: url,
    resourceProvider: provider,
    resourceAccess: access,
    resourceType: type,
    resourceVerified: verified,
    resourceVerificationStatus: verificationStatus,
  };
}

function buildStayLearningResources(roleFamily, profile = null) {
  const hasHubspot = coreSystemsInclude(profile, /\bhubspot\b/);
  const hasSalesforce = coreSystemsInclude(profile, /\bsalesforce\b/);
  const hasPowerBi = coreSystemsInclude(profile, /\bpower bi\b/);
  const hasPowerAutomate = coreSystemsInclude(profile, /\bpower automate\b/);
  const hasJira = coreSystemsInclude(profile, /\bjira\b/);
  const hasGoogleMarketing = coreSystemsInclude(profile, /\bgoogle analytics\b|\bgoogle ads\b|\bga4\b/);

  const defaults = {
    workflow: buildStayResource({
      title: 'OpenAI Academy',
      url: 'https://academy.openai.com/',
      provider: 'OpenAI Academy',
      access: 'free',
      type: 'pathway',
      verificationStatus: 'stay-advance-default',
    }),
    communication: buildStayResource({
      title: 'Google AI Essentials',
      url: 'https://www.coursera.org/google-learn/ai-essentials',
      provider: 'Google / Coursera',
      access: 'paid',
      verificationStatus: 'stay-advance-default',
    }),
    leadership: buildStayResource({
      title: 'Digital Transformation',
      url: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
      provider: 'Coursera',
      access: 'paid',
      verificationStatus: 'stay-advance-default',
    }),
  };

  if (roleFamily === 'marketing') {
    return {
      workflow: buildStayResource({
        title: hasHubspot ? 'AI for Marketing Course' : hasGoogleMarketing ? 'Google Skillshop: Ads, Analytics, and marketing products' : 'AI for Marketing Course',
        url: hasHubspot ? 'https://academy.hubspot.com/courses/ai-for-marketers' : hasGoogleMarketing ? 'https://skillshop.withgoogle.com/' : 'https://academy.hubspot.com/courses/ai-for-marketers',
        provider: hasHubspot ? 'HubSpot Academy' : hasGoogleMarketing ? 'Google Skillshop' : 'HubSpot Academy',
        access: 'free',
      }),
      communication: buildStayResource({
        title: hasGoogleMarketing ? 'Google Skillshop: Ads, Analytics, and marketing products' : 'HubSpot Academy: CRM, marketing, sales, and customer education',
        url: hasGoogleMarketing ? 'https://skillshop.withgoogle.com/' : 'https://academy.hubspot.com/',
        provider: hasGoogleMarketing ? 'Google Skillshop' : 'HubSpot Academy',
        access: 'free',
        type: 'pathway',
      }),
      leadership: buildStayResource({
        title: hasHubspot ? 'HubSpot Academy: CRM, marketing, sales, and customer education' : 'Google AI Essentials',
        url: hasHubspot ? 'https://academy.hubspot.com/' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasHubspot ? 'HubSpot Academy' : 'Google / Coursera',
        access: hasHubspot ? 'free' : 'paid',
        type: hasHubspot ? 'pathway' : 'course',
      }),
    };
  }

  if (roleFamily === 'analytics') {
    return {
      workflow: buildStayResource({
        title: hasPowerBi ? 'Get started building with Power BI' : 'Get started with Microsoft data analytics',
        url: hasPowerBi ? 'https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/' : 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
        provider: 'Microsoft Learn',
        access: 'free',
        type: 'pathway',
      }),
      communication: buildStayResource({
        title: 'Get started with Microsoft data analytics',
        url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
        provider: 'Microsoft Learn',
        access: 'free',
        type: 'pathway',
      }),
      leadership: buildStayResource({
        title: hasPowerBi ? 'Get started building with Power BI' : 'Google AI Essentials',
        url: hasPowerBi ? 'https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasPowerBi ? 'Microsoft Learn' : 'Google / Coursera',
        access: hasPowerBi ? 'free' : 'paid',
        type: hasPowerBi ? 'pathway' : 'course',
      }),
    };
  }

  if (roleFamily === 'finance') {
    return {
      workflow: buildStayResource({
        title: 'Financial modeling learning paths',
        url: 'https://www.coursera.org/search?query=financial%20modeling',
        provider: 'Coursera',
        access: 'paid',
        type: 'pathway',
      }),
      communication: buildStayResource({
        title: hasPowerBi ? 'Get started building with Power BI' : 'Google AI Essentials',
        url: hasPowerBi ? 'https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasPowerBi ? 'Microsoft Learn' : 'Google / Coursera',
        access: hasPowerBi ? 'free' : 'paid',
        type: hasPowerBi ? 'pathway' : 'course',
      }),
      leadership: buildStayResource({
        title: hasPowerAutomate ? 'Build and optimize cloud flows in Power Automate' : 'Digital Transformation',
        url: hasPowerAutomate ? 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/' : 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
        provider: hasPowerAutomate ? 'Microsoft Learn' : 'Coursera',
        access: hasPowerAutomate ? 'free' : 'paid',
        type: hasPowerAutomate ? 'pathway' : 'course',
      }),
    };
  }

  if (roleFamily === 'hr') {
    return {
      workflow: buildStayResource({
        title: hasPowerAutomate ? 'Build and optimize cloud flows in Power Automate' : 'OpenAI Academy',
        url: hasPowerAutomate ? 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/' : 'https://academy.openai.com/',
        provider: hasPowerAutomate ? 'Microsoft Learn' : 'OpenAI Academy',
        access: 'free',
        type: hasPowerAutomate ? 'pathway' : 'pathway',
      }),
      communication: buildStayResource({
        title: 'Get started with Microsoft data analytics',
        url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
        provider: 'Microsoft Learn',
        access: 'free',
        type: 'pathway',
      }),
      leadership: buildStayResource({
        title: hasPowerAutomate ? 'Build and optimize cloud flows in Power Automate' : 'Google AI Essentials',
        url: hasPowerAutomate ? 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasPowerAutomate ? 'Microsoft Learn' : 'Google / Coursera',
        access: hasPowerAutomate ? 'free' : 'paid',
        type: hasPowerAutomate ? 'pathway' : 'course',
      }),
    };
  }

  if (roleFamily === 'admin') {
    return {
      workflow: buildStayResource({
        title: 'OpenAI Academy',
        url: 'https://academy.openai.com/',
        provider: 'OpenAI Academy',
        access: 'free',
        type: 'pathway',
      }),
      communication: buildStayResource({
        title: 'Google AI Essentials',
        url: 'https://www.coursera.org/google-learn/ai-essentials',
        provider: 'Google / Coursera',
        access: 'paid',
        type: 'course',
      }),
      leadership: buildStayResource({
        title: 'Build and optimize cloud flows in Power Automate',
        url: 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/',
        provider: 'Microsoft Learn',
        access: 'free',
        type: 'pathway',
      }),
    };
  }

  if (roleFamily === 'customer') {
    return {
      workflow: buildStayResource({
        title: hasSalesforce ? 'Trailhead: CRM and Salesforce learning' : 'Service Hub Software Certification Course',
        url: hasSalesforce ? 'https://trailhead.salesforce.com/' : 'https://academy.hubspot.com/courses/service-hub-software',
        provider: hasSalesforce ? 'Salesforce Trailhead' : 'HubSpot Academy',
        access: 'free',
        type: hasSalesforce ? 'pathway' : 'course',
      }),
      communication: buildStayResource({
        title: hasHubspot ? 'HubSpot Academy: CRM, marketing, sales, and customer education' : 'Trailhead: CRM and Salesforce learning',
        url: hasHubspot ? 'https://academy.hubspot.com/' : 'https://trailhead.salesforce.com/',
        provider: hasHubspot ? 'HubSpot Academy' : 'Salesforce Trailhead',
        access: 'free',
        type: 'pathway',
      }),
      leadership: buildStayResource({
        title: hasHubspot ? 'Service Hub Software Certification Course' : 'Google AI Essentials',
        url: hasHubspot ? 'https://academy.hubspot.com/courses/service-hub-software' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasHubspot ? 'HubSpot Academy' : 'Google / Coursera',
        access: hasHubspot ? 'free' : 'paid',
        type: hasHubspot ? 'course' : 'course',
      }),
    };
  }

  if (roleFamily === 'operations' || roleFamily === 'product') {
    return {
      workflow: buildStayResource({
        title: hasPowerAutomate ? 'Build and optimize cloud flows in Power Automate' : hasJira ? 'Atlassian University: Jira and workflow management' : 'OpenAI Academy',
        url: hasPowerAutomate ? 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/' : hasJira ? 'https://university.atlassian.com/' : 'https://academy.openai.com/',
        provider: hasPowerAutomate ? 'Microsoft Learn' : hasJira ? 'Atlassian University' : 'OpenAI Academy',
        access: 'free',
        type: 'pathway',
      }),
      communication: buildStayResource({
        title: hasJira ? 'Atlassian University: Jira and workflow management' : 'Google AI Essentials',
        url: hasJira ? 'https://university.atlassian.com/' : 'https://www.coursera.org/google-learn/ai-essentials',
        provider: hasJira ? 'Atlassian University' : 'Google / Coursera',
        access: hasJira ? 'free' : 'paid',
        type: hasJira ? 'pathway' : 'course',
      }),
      leadership: buildStayResource({
        title: hasPowerAutomate ? 'Build and optimize cloud flows in Power Automate' : 'Digital Transformation',
        url: hasPowerAutomate ? 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/' : 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
        provider: hasPowerAutomate ? 'Microsoft Learn' : 'Coursera',
        access: hasPowerAutomate ? 'free' : 'paid',
        type: hasPowerAutomate ? 'pathway' : 'course',
      }),
    };
  }

  return defaults;
}

function buildEnglishStaySkillBlueprints(roleFamily, profile = null) {
  const [anchorTask, secondaryTask, tertiaryTask] = getRoleTaskAnchors(profile);

  const generic = {
    workflow: {
      name: 'AI workflow design',
      current: `You already know how ${anchorTask.toLowerCase()} works in practice.`,
      required: 'You can design, review, and document a clear AI-assisted workflow for high-value recurring work.',
      why: 'Internal advancement increasingly goes to people who can redesign how work gets done, not just produce more of it.',
      evidence: `You already see where ${anchorTask.toLowerCase()} slows down, where revisions pile up, and where context gets lost.`,
      close: 'Build one concrete AI-assisted workflow for a recurring task and document the before/after impact.',
    },
    communication: {
      name: 'AI-assisted decision communication',
      current: 'You already translate work into updates, alignment, and decisions for other people.',
      required: 'You can turn AI output into clear decision support that leaders trust.',
      why: 'People who use AI well but explain it poorly do not gain influence. Interpretation remains the leverage layer.',
      evidence: 'You already have stakeholder context, organizational language, and a feel for priorities.',
      close: 'Use AI for first-pass analysis or structure, but personally deliver the final summary, recommendation, and trade-off.',
    },
    leadership: {
      name: 'AI adoption leadership',
      current: 'You are already close enough to the team’s real work to see what will and will not stick.',
      required: 'You can lead one AI pilot, standard, or review process in a way other people can safely adopt.',
      why: 'That is the difference between someone who simply works faster and someone who looks promotable.',
      evidence: 'You already understand the risks, objections, and operational friction around new tools or workflows.',
      close: 'Pick one team process, make a small AI pilot safe and reusable, and tie the result to time, quality, or risk.',
    },
  };

  const roleSpecific = {
    marketing: {
      workflow: {
        name: 'Campaign experiment design',
        current: `You already know where ${anchorTask.toLowerCase()} loses time between brief, draft, review, and launch.`,
        required: 'You can use AI to redesign campaign planning, creative iteration, and experiment setup without lowering quality.',
        why: 'Marketing value shifts upward when you shorten planning cycles and increase experiment velocity, not just content output.',
        evidence: `You already see where ${secondaryTask.toLowerCase()} gets delayed by unclear briefs, late feedback, or scattered context.`,
        close: 'Redesign one campaign or content workflow so AI handles first-pass structure and you keep targeting, judgment, and QA.',
      },
      communication: {
        name: 'Performance narrative design',
        current: 'You already turn campaign work into updates for leaders and partners.',
        required: 'You can convert AI-assisted analysis into crisp performance narratives that lead to faster decisions.',
        why: 'The person who explains what changed, why it matters, and what to do next becomes more valuable than the person who only ships assets.',
        evidence: 'You already know which metrics leaders ask about and where reporting gets too slow or too noisy.',
        close: 'Use AI to draft the first pass of one campaign readout, then tighten the recommendation and trade-offs yourself.',
      },
      leadership: {
        name: 'Marketing automation governance',
        current: `You already know where ${tertiaryTask.toLowerCase()} breaks when briefs, approvals, or analytics are inconsistent.`,
        required: 'You can make one AI-assisted marketing workflow repeatable enough for the team to reuse safely.',
        why: 'Visible workflow ownership is what turns private AI usage into promotion signal.',
        evidence: 'You already know where handoffs, approvals, and QA create marketing drag.',
        close: 'Turn one planning or reporting workflow into a shared operating pattern with prompts, checkpoints, and a clear owner.',
      },
    },
    analytics: {
      workflow: {
        name: 'Dashboard QA workflow design',
        current: `You already know where ${anchorTask.toLowerCase()} stalls between data pull, validation, and stakeholder review.`,
        required: 'You can design an AI-assisted analytics workflow that speeds first-pass analysis while protecting reporting trust.',
        why: 'Analytics influence grows when you reduce the distance between raw data and decision-ready interpretation.',
        evidence: 'You already know which metrics create confusion, rework, or repetitive stakeholder questions.',
        close: 'Build one AI-assisted analytics workflow for KPI review, with a visible QA checkpoint before anything gets shared.',
      },
      communication: {
        name: 'KPI review narrative',
        current: 'You already translate data into updates and explanations for business partners.',
        required: 'You can turn AI-assisted analysis into decision-ready KPI narratives, not just charts.',
        why: 'People remember the analyst who clarifies trade-offs and decisions, not just the analyst who refreshes the dashboard.',
        evidence: 'You already know the business questions behind the metrics and where reporting still needs interpretation.',
        close: 'Use AI to draft one KPI review narrative, then refine the recommendation and next action in your own voice.',
      },
      leadership: {
        name: 'Analytics operating standards',
        current: `You already see where ${tertiaryTask.toLowerCase()} changes from person to person or dashboard to dashboard.`,
        required: 'You can define one repeatable AI-assisted review standard the team can trust.',
        why: 'Standards are how analysts become operators of decision quality, not just report builders.',
        evidence: 'You already know where QA, definitions, and stakeholder expectations drift.',
        close: 'Create one repeatable review checklist for analysis quality, stakeholder context, and recommendation clarity.',
      },
    },
    finance: {
      workflow: {
        name: 'Financial modeling and scenario review',
        current: `You already know where ${anchorTask.toLowerCase()} slows down during updates, sensitivity checks, and assumption changes.`,
        required: 'You can use AI to accelerate scenario prep and model review while keeping finance judgment and control.',
        why: 'Finance becomes more strategic when you reduce model-prep time and spend more time interpreting trade-offs.',
        evidence: 'You already see where manual rework happens in assumptions, summaries, and planning decks.',
        close: 'Use AI to structure one scenario review workflow, then keep the assumptions, risk calls, and recommendation under your control.',
      },
      communication: {
        name: 'Variance and planning narrative design',
        current: 'You already translate numbers into updates for leaders, partners, or reviews.',
        required: 'You can turn AI-assisted analysis into a tighter business narrative about what changed and what leadership should do.',
        why: 'Finance influence compounds when numbers become decisions quickly.',
        evidence: 'You already know where planning reviews get stuck in spreadsheet detail instead of business implication.',
        close: 'Build one monthly review pack where AI helps structure the first narrative and you sharpen the decision takeaway.',
      },
      leadership: {
        name: 'Planning workflow governance',
        current: `You already know where ${tertiaryTask.toLowerCase()} creates friction between finance, business partners, and leadership.`,
        required: 'You can standardize one AI-assisted planning or review cadence so it becomes reusable, not one-off.',
        why: 'Reusable planning systems make you look like finance infrastructure, not just finance support.',
        evidence: 'You already know where requests, assumptions, and follow-ups get messy.',
        close: 'Design one shared planning workflow with clear review checkpoints, version control, and decision ownership.',
      },
    },
    hr: {
      workflow: {
        name: 'Manager enablement workflow design',
        current: `You already know where ${anchorTask.toLowerCase()} repeats the same questions, nudges, and explanations.`,
        required: 'You can redesign one people or manager-support workflow so AI handles first-pass guidance while you keep judgment and exceptions.',
        why: 'HR becomes harder to replace when it turns repeated support into reliable operating systems.',
        evidence: 'You already know where managers wait too long for answers or escalate issues that should be routinized.',
        close: 'Rebuild one manager-facing workflow so AI handles the first pass and you own sensitive cases, policy judgment, and escalation.',
      },
      communication: {
        name: 'People insights narrative',
        current: 'You already translate people data, manager feedback, and policy themes into updates for leaders.',
        required: 'You can turn AI-assisted analysis into a decision-ready HR narrative leaders can actually act on.',
        why: 'People teams gain influence when they connect patterns to decisions, not just policy administration.',
        evidence: 'You already know the recurring issues leaders ask about and where context matters more than generic summaries.',
        close: 'Use AI to draft one people-ops insight memo, then tighten the recommendation, nuance, and risk framing yourself.',
      },
      leadership: {
        name: 'People workflow adoption',
        current: `You already know where ${tertiaryTask.toLowerCase()} breaks when handoffs, approvals, or policy guidance are inconsistent.`,
        required: 'You can lead one AI-assisted HR workflow so other people can safely adopt it.',
        why: 'That is how HR moves from reactive service to visible operating leverage.',
        evidence: 'You already understand the trust, privacy, and consistency concerns around AI in people work.',
        close: 'Pick one intake, enablement, or reporting workflow and turn it into a small reusable team standard.',
      },
    },
    admin: {
      workflow: {
        name: 'Executive workflow design',
        current: `You already know where ${anchorTask.toLowerCase()} breaks because context is scattered, requests are reactive, or follow-up gets lost.`,
        required: 'You can redesign executive support so AI handles first-pass prep while you protect judgment, sequencing, and executive context.',
        why: 'Support roles become more valuable when they create cleaner executive operating systems, not just faster coordination.',
        evidence: 'You already see where meetings, briefs, and follow-up loops create avoidable drag for leaders.',
        close: 'Rebuild one executive-support workflow so AI prepares the first pass and you keep final review, priority, and context control.',
      },
      communication: {
        name: 'Briefing narrative design',
        current: 'You already turn scattered updates into summaries, prep notes, and follow-up for other people.',
        required: 'You can turn AI-assisted prep into clear briefings leaders can read quickly and act on confidently.',
        why: 'The value is not just getting the notes done. It is making the decision context sharper.',
        evidence: 'You already know which context leaders need and which details can safely be abstracted away.',
        close: 'Use AI to structure one executive briefing, then sharpen the priorities, context, and open questions yourself.',
      },
      leadership: {
        name: 'Executive operating rhythm design',
        current: `You already see where ${tertiaryTask.toLowerCase()} creates repeated coordination drag across calendars, meetings, and decisions.`,
        required: 'You can turn one executive support pattern into a repeatable operating rhythm with clear ownership and checkpoints.',
        why: 'That is how support work becomes visible leverage instead of invisible labor.',
        evidence: 'You already know where follow-up breaks, decisions get lost, or prep quality changes from week to week.',
        close: 'Create one reusable operating pattern for meeting prep, follow-up, or decision capture and show the time or clarity it saved.',
      },
    },
    customer: {
      workflow: {
        name: 'Renewal risk review design',
        current: `You already know where ${anchorTask.toLowerCase()} slows down between account prep, risk review, and next-step planning.`,
        required: 'You can use AI to redesign one customer workflow so risk, expansion, and onboarding prep become faster and more consistent.',
        why: 'Customer roles become stronger when you make account insight and follow-through more proactive, not more manual.',
        evidence: 'You already see where account context gets fragmented and where prep work steals time from customer judgment.',
        close: 'Build one AI-assisted renewal or account-health workflow that produces a faster risk review and a clearer next action.',
      },
      communication: {
        name: 'Account health narrative',
        current: 'You already explain customer state, risk, and next moves to internal teams.',
        required: 'You can turn AI-assisted customer analysis into a concise account narrative that helps the team act earlier.',
        why: 'The people who frame customer risk clearly become the commercial signal layer for the team.',
        evidence: 'You already know which account stories are hard to summarize and which details leaders actually need.',
        close: 'Use AI to draft one account or renewal readout, then sharpen the risk framing, recommendation, and customer context yourself.',
      },
      leadership: {
        name: 'Customer workflow orchestration',
        current: `You already know where ${tertiaryTask.toLowerCase()} breaks between onboarding, renewal prep, and cross-functional follow-up.`,
        required: 'You can turn one customer workflow into a reusable AI-assisted operating pattern for the team.',
        why: 'Visible orchestration is what moves customer success from reactive execution into strategic leverage.',
        evidence: 'You already know where handoffs, escalation, and prep quality create avoidable customer risk.',
        close: 'Standardize one account or onboarding workflow with prompts, review rules, and a clear metric the team can track.',
      },
    },
    operations: {
      workflow: {
        name: 'Workflow automation design',
        current: `You already know where ${anchorTask.toLowerCase()} slows down because work enters messy, gets re-routed, or waits for follow-up.`,
        required: 'You can redesign one operations workflow so AI and automation handle the first pass while you keep exception control.',
        why: 'Operations leverage comes from making throughput more reliable, not just pushing status updates faster.',
        evidence: 'You already see where handoffs, tracking, and follow-up work create invisible drag.',
        close: 'Map one intake or coordination workflow, automate the first pass, and document where human review still matters.',
      },
      communication: {
        name: 'Operational status narrative',
        current: 'You already translate workflow health into updates for stakeholders or leaders.',
        required: 'You can use AI to turn activity into a decision-ready operational readout with one clear recommendation.',
        why: 'Teams trust operators who make the system legible, not just the queue visible.',
        evidence: 'You already know the blockers, recurring delays, and context that raw status reports miss.',
        close: 'Use AI to structure one operating review, then add the real bottlenecks, trade-offs, and next action yourself.',
      },
      leadership: {
        name: 'Team workflow governance',
        current: `You already know where ${tertiaryTask.toLowerCase()} changes from person to person and creates inconsistent execution.`,
        required: 'You can standardize one AI-assisted workflow that the team can repeat safely.',
        why: 'That is how operations work becomes system design, not manual coordination.',
        evidence: 'You already know which steps should be standardized and where exceptions still need a human owner.',
        close: 'Turn one recurring coordination pattern into a shared playbook with a handoff rule, review checkpoint, and owner.',
      },
    },
  };

  return roleSpecific[roleFamily] || generic;
}

function buildAiThisWeekPlan(reportData) {
  const profile = reportData?.profile || {};
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const playbook = stayAndAdvance?.ai_leverage_playbook || buildAiLeveragePlaybook(reportData);
  const plays = normalizeArray(playbook?.plays);
  const firstPlay = plays[0] || {};
  const [anchorTask] = getRoleTaskAnchors(profile);
  const roleFamily = inferRoleFamilyFromProfile(
    profile?.job_title || profile?.jobTitle || '',
    profile?.industry || '',
    profile?.tasks || [],
    profile?.clarifiers || null
  );
  const systems = getCoreSystems(profile);
  const defaultSystems = (() => {
    if (roleFamily === 'analytics') return ['Power BI', 'SQL', 'dashboard review pack'];
    if (roleFamily === 'finance') return ['Excel or planning model', 'forecast review deck', 'variance summary'];
    if (roleFamily === 'customer') return ['CRM', 'account notes', 'renewal review'];
    if (roleFamily === 'hr') return ['HRIS', 'policy docs', 'manager intake'];
    if (roleFamily === 'marketing') return ['HubSpot or CRM', 'campaign brief', 'performance dashboard'];
    if (roleFamily === 'operations') return ['project tracker', 'intake queue', 'status review'];
    if (roleFamily === 'admin') return ['calendar', 'meeting brief', 'follow-up tracker'];
    return ['the system where this workflow already lives'];
  })();
  const proofTitle = stayAndAdvance?.thirty_day_plan?.proof_asset?.title || 'one internal AI leverage case';

  return {
    headline: `Use AI in ${profile?.job_title || 'your role'} this week`,
    workflow: firstPlay.workflow || `Redesign ${anchorTask.toLowerCase()} so AI handles the first pass and you keep judgment.`,
    systems: systems.length ? systems : defaultSystems,
    ai_role: firstPlay.ai_role || 'Use AI to handle draft structure, summaries, and repetitive first-pass work.',
    human_checkpoint: firstPlay.human_checkpoint || 'You keep the quality bar, business context, and final decision.',
    output: firstPlay.what_to_share || proofTitle,
    metric: stayAndAdvance?.thirty_day_plan?.metric_to_move || 'Move one visible metric tied to time, quality, or decision speed.',
    stop_condition: 'Stop when a manager or teammate can understand the workflow, the checkpoint, and the business outcome in under 3 minutes.',
    share_with_manager: stayAndAdvance?.promotion_conversation_pack?.manager_script || `Show the before/after workflow, the metric shift, and where you want to own more of this pattern next.`,
  };
}

function buildEnglishStayRecommendation(roleFamily, goalNow) {
  const prompt = goalNow === 'stay_and_advance' ? 'Stay in your lane and use AI to' : 'Stay in your lane, but use AI to';

  if (roleFamily === 'analytics') {
    return `${prompt} move from request-driven reporting into decision support, KPI standards, and business-facing recommendations.`;
  }
  if (roleFamily === 'finance') {
    return `${prompt} move from producing numbers into faster scenario support, board-ready narratives, and decision systems leaders actually use.`;
  }
  if (roleFamily === 'hr') {
    return `${prompt} move from one-off support into manager enablement systems, workforce insight, and scalable people operations.`;
  }
  if (roleFamily === 'admin') {
    return `${prompt} move from reactive executive support into briefing systems, decision support, and repeatable leadership workflows.`;
  }
  if (roleFamily === 'customer') {
    return `${prompt} move from reactive account work into proactive health reviews, renewal strategy, and repeatable customer systems.`;
  }
  if (roleFamily === 'operations') {
    return `${prompt} move from manual coordination into workflow design, operating rhythms, and team throughput systems.`;
  }
  if (roleFamily === 'product') {
    return `${prompt} move from ad hoc analysis into repeatable decision systems, planning rhythms, and sharper prioritization.`;
  }
  if (roleFamily === 'marketing') {
    return `${prompt} move from campaign throughput into planning systems, experimentation cadence, and decision-ready growth reviews.`;
  }

  return goalNow === 'stay_and_advance'
    ? 'Stay in the same career lane and use AI to move faster toward visible leverage, broader scope, and promotion signal.'
    : 'Stay in the same career lane, but shift from raw execution into AI-directed judgment, workflow design, and visible strategic leverage.';
}

function buildEnglishStayRationale(roleFamily, jobTitle, anchorTask, aiMaturity = '') {
  const aiReadyTail = aiMaturityRank(aiMaturity) >= 2
    ? ' You already have enough AI familiarity to make that visible quickly.'
    : '';
  const taskLabel = String(anchorTask || 'your core workflow').toLowerCase();

  if (roleFamily === 'analytics') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the KPI definitions, review pack, and business narrative around it.${aiReadyTail}`;
  }
  if (roleFamily === 'finance') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the planning workflow, scenario framing, and decision story around it.${aiReadyTail}`;
  }
  if (roleFamily === 'hr') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while building manager-support and workforce-planning systems other teams can reuse.${aiReadyTail}`;
  }
  if (roleFamily === 'admin') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the briefing system, follow-up rhythm, and executive context around it.${aiReadyTail}`;
  }
  if (roleFamily === 'customer') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the health signals, risk reviews, and account playbooks the team uses.${aiReadyTail}`;
  }
  if (roleFamily === 'operations') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while redesigning the intake, follow-through, and team rhythms behind it.${aiReadyTail}`;
  }
  if (roleFamily === 'product') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the decision system, prioritization logic, and review cadence around it.${aiReadyTail}`;
  }
  if (roleFamily === 'marketing') {
    return `${jobTitle} does not have to become a leave signal. The stronger internal move is to use AI to make ${taskLabel} faster while owning the planning system, test cadence, and growth review around it.${aiReadyTail}`;
  }

  return `${jobTitle} is not automatically a leave signal. The strongest internal move is often to use AI to make ${taskLabel} faster, sharper, and more tightly connected to business decisions.${aiReadyTail}`;
}

function buildStayConfidenceRoleTail(roleFamily) {
  if (roleFamily === 'analytics') {
    return ' In practice, that means owning the KPI layer, decision-ready review packs, and the reporting standards other teams trust.';
  }
  if (roleFamily === 'finance') {
    return ' In practice, that means turning planning cycles, variance reviews, and scenario work into faster decision support for leaders.';
  }
  if (roleFamily === 'hr') {
    return ' In practice, that means building manager-support, workforce-planning, and people-ops systems other teams can reuse.';
  }
  if (roleFamily === 'admin') {
    return ' In practice, that means turning executive support into reusable briefing systems, cleaner follow-through, and better decision context for leadership.';
  }
  if (roleFamily === 'customer') {
    return ' In practice, that means owning proactive health reviews, renewal signal quality, and reusable account playbooks.';
  }
  if (roleFamily === 'operations') {
    return ' In practice, that means redesigning intake, follow-through, and team operating rhythms instead of carrying them manually.';
  }
  if (roleFamily === 'product') {
    return ' In practice, that means turning analysis into repeatable decision systems and sharper prioritization standards.';
  }
  if (roleFamily === 'marketing') {
    return ' In practice, that means turning campaign work into decision-ready planning, experimentation, and growth operating systems.';
  }

  return '';
}

function buildSafestPivotTitle(roleFamily, jobTitle, industry) {
  if (roleFamily === 'legal') {
    return chooseDistinctTitle(
      ['Contract Lifecycle Manager', 'Legal Technology Manager', 'Compliance Operations Manager'],
      jobTitle,
      'Contract Lifecycle Manager'
    );
  }
  if (roleFamily === 'procurement') {
    return chooseDistinctTitle(
      ['Procurement Operations Manager', 'Strategic Sourcing Manager', 'Supplier Strategy Manager'],
      jobTitle,
      'Procurement Operations Manager'
    );
  }
  if (roleFamily === 'education') {
    return chooseDistinctTitle(
      ['Customer Education Lead', 'Learning Experience Manager', 'Enablement Program Manager'],
      jobTitle,
      'Customer Education Lead'
    );
  }
  if (roleFamily === 'analytics') {
    return chooseDistinctTitle(
      ['Business Intelligence Manager', 'Analytics Manager', 'Customer Insights Manager'],
      jobTitle,
      'Business Intelligence Manager'
    );
  }
  if (roleFamily === 'marketing') return 'Product Marketing Manager';
  if (roleFamily === 'finance') return 'Finance Business Partner';
  if (roleFamily === 'hr') return 'People Operations Manager';
  if (roleFamily === 'admin') return 'Executive Operations Manager';
  if (roleFamily === 'customer') return 'Customer Success Strategy Manager';
  if (roleFamily === 'operations') return 'Project Operations Manager';
  if (roleFamily === 'product') return 'Business Operations Manager';
  return `${industry} Operations Manager`;
}

function buildLeveragePivotTitle(roleFamily, jobTitle, industry) {
  if (roleFamily === 'legal') {
    return chooseDistinctTitle(
      ['Legal Operations Analyst', 'Compliance Operations Analyst', 'Contract Analytics Manager'],
      jobTitle,
      'Legal Operations Analyst'
    );
  }
  if (roleFamily === 'procurement') {
    return chooseDistinctTitle(
      ['Spend Analytics Manager', 'Supplier Operations Analyst', 'Strategic Sourcing Analyst'],
      jobTitle,
      'Spend Analytics Manager'
    );
  }
  if (roleFamily === 'education') {
    return chooseDistinctTitle(
      ['Learning Operations Manager', 'Program Enablement Strategist', 'Customer Enablement Operations Manager'],
      jobTitle,
      'Learning Operations Manager'
    );
  }
  if (roleFamily === 'analytics') {
    return chooseDistinctTitle(
      ['Analytics Strategy Manager', 'Business Intelligence Lead', 'Insights Operations Manager'],
      jobTitle,
      'Analytics Strategy Manager'
    );
  }
  if (roleFamily === 'marketing') return 'Marketing Operations Strategist';
  if (roleFamily === 'finance') return 'Strategic Finance Analyst';
  if (roleFamily === 'hr') return 'Workforce Planning Analyst';
  if (roleFamily === 'admin') return 'Executive Operations Analyst';
  if (roleFamily === 'customer') return 'Customer Operations Analyst';
  if (roleFamily === 'operations') return 'Program Operations Manager';
  if (roleFamily === 'product') return 'Strategy and Operations Analyst';
  return `${industry} Operations Analyst`;
}

function buildFastCashPivotTitle(roleFamily, jobTitle, industry) {
  if (roleFamily === 'legal') {
    return chooseDistinctTitle(
      ['Contract Operations Consultant', 'CLM Enablement Lead', 'Legal Workflow Consultant'],
      jobTitle,
      'Contract Operations Consultant'
    );
  }
  if (roleFamily === 'procurement') {
    return chooseDistinctTitle(
      ['Procurement Enablement Lead', 'Sourcing Process Lead', 'Supplier Workflow Consultant'],
      jobTitle,
      'Procurement Enablement Lead'
    );
  }
  if (roleFamily === 'education') {
    return chooseDistinctTitle(
      ['Enablement Program Lead', 'Learning Systems Lead', 'Customer Onboarding Enablement Lead'],
      jobTitle,
      'Enablement Program Lead'
    );
  }
  if (roleFamily === 'analytics') {
    return chooseDistinctTitle(
      ['Revenue Operations Analyst', 'Business Intelligence Analyst', 'Analytics Enablement Lead'],
      jobTitle,
      'Revenue Operations Analyst'
    );
  }
  if (roleFamily === 'marketing') return 'GTM Enablement Lead';
  if (roleFamily === 'finance') return 'Commercial Finance Manager';
  if (roleFamily === 'hr') return 'Manager Enablement Lead';
  if (roleFamily === 'admin') return 'Chief of Staff';
  if (roleFamily === 'customer') return 'Customer Enablement Lead';
  if (roleFamily === 'operations') return 'Delivery Operations Manager';
  if (roleFamily === 'product') return 'Business Enablement Lead';
  return `${industry} Enablement Lead`;
}

function buildHighUpsidePivotTitle(roleFamily, jobTitle, industry) {
  if (roleFamily === 'legal') {
    return chooseDistinctTitle(
      ['Legal Technology Manager', 'Compliance Operations Manager', 'Contract Operations Lead'],
      jobTitle,
      'Legal Technology Manager'
    );
  }
  if (roleFamily === 'procurement') {
    return chooseDistinctTitle(
      ['Procurement Intelligence Manager', 'Strategic Sourcing Manager', 'Supplier Strategy Lead'],
      jobTitle,
      'Procurement Intelligence Manager'
    );
  }
  if (roleFamily === 'education') {
    return chooseDistinctTitle(
      ['Learning Experience Manager', 'Customer Education Lead', 'Learning Operations Lead'],
      jobTitle,
      'Learning Experience Manager'
    );
  }
  if (roleFamily === 'analytics') {
    return chooseDistinctTitle(
      ['Analytics Manager', 'Business Intelligence Lead', 'Customer Insights Lead'],
      jobTitle,
      'Analytics Manager'
    );
  }
  if (roleFamily === 'admin') return 'Executive Enablement Lead';
  if (roleFamily === 'finance') return 'FP&A Manager';
  if (roleFamily === 'operations') return 'Portfolio Operations Manager';
  if (roleFamily === 'hr') return 'People Operations Lead';
  return 'AI Program Manager';
}

function buildLongTermPivotTitle(roleFamily, jobTitle, industry) {
  if (roleFamily === 'legal') {
    return chooseDistinctTitle(
      ['Contract Management Systems Lead', 'Legal Workflow Manager', 'Compliance Operations Lead'],
      jobTitle,
      'Contract Management Systems Lead'
    );
  }
  if (roleFamily === 'procurement') {
    return chooseDistinctTitle(
      ['Procurement Systems Manager', 'Sourcing Operations Lead', 'Supplier Enablement Manager'],
      jobTitle,
      'Procurement Systems Manager'
    );
  }
  if (roleFamily === 'education') {
    return chooseDistinctTitle(
      ['Learning Operations Lead', 'Customer Enablement Manager', 'Learning Experience Manager'],
      jobTitle,
      'Learning Operations Lead'
    );
  }
  if (roleFamily === 'analytics') {
    return chooseDistinctTitle(
      ['Analytics Operations Lead', 'Business Intelligence Manager', 'Insights Systems Lead'],
      jobTitle,
      'Analytics Operations Lead'
    );
  }
  if (roleFamily === 'admin') return 'Executive Operations Lead';
  if (roleFamily === 'finance') return 'Finance Systems Manager';
  if (roleFamily === 'operations') return 'Workflow Operations Manager';
  if (roleFamily === 'hr') return 'HR Operations Manager';
  return 'Workflow Automation Consultant';
}

function parseSalaryNumbers(value) {
  const matches = String(value || '').match(/\$?\d[\d,]*/g) || [];
  return matches
    .map((item) => Number(String(item).replace(/[^0-9]/g, '')))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function estimateLearningCost(bestPivot) {
  const criticalCount = normalizeArray(bestPivot?.skill_gaps).filter((item) => item?.gap_priority === 'critical').length;
  const mediumCount = normalizeArray(bestPivot?.skill_gaps).filter((item) => item?.gap_priority === 'medium').length;
  const difficultyBase = bestPivot?.difficulty === 'High' ? 1800 : bestPivot?.difficulty === 'Medium' ? 950 : 450;
  return difficultyBase + (criticalCount * 250) + (mediumCount * 100);
}

function estimatePaybackMonths(bestPivot, learningCost) {
  const salaryValues = parseSalaryNumbers(bestPivot?.salary_delta);
  const annualUpside = salaryValues.length >= 2
    ? Math.max(salaryValues[0], salaryValues[1])
    : salaryValues[0] || 0;

  if (!annualUpside || /flat|similar|unclear|lateral/i.test(String(bestPivot?.salary_delta || ''))) {
    return null;
  }

  const monthlyUpside = annualUpside / 12;
  if (!monthlyUpside) return null;

  return clamp(Math.ceil(learningCost / monthlyUpside), 1, 36);
}

function buildDecisionSignal(summary, bestPivot) {
  const score = Number(summary?.overall_score || 0);
  const matchScore = Number(bestPivot?.match_score || 0);

  if (score >= 70) {
    return {
      recommendation_type: 'active-pivot',
      headline: 'Start active transition now',
      urgency: 'High urgency',
      rationale: 'The current role is losing value fast enough that waiting for perfect clarity is riskier than beginning the move.',
      confidence_label: matchScore >= 78 ? 'High confidence' : 'Moderate confidence',
      confidence_reason: matchScore >= 78
        ? 'Your background already maps cleanly into the best-fit path, so the biggest unlock is visible proof, not reinvention.'
        : 'The direction is still strong, but the transition depends on building clearer proof and reducing a few skill gaps quickly.',
    };
  }

  if (score >= 40) {
    return {
      recommendation_type: 'hybrid-transition',
      headline: 'Prepare to pivot in the next 3-6 months',
      urgency: 'Build while you still have leverage',
      rationale: 'You still have room to use the current role as a platform, but the market is shifting enough that a passive wait-and-see approach will cost momentum.',
      confidence_label: matchScore >= 75 ? 'High confidence' : 'Moderate confidence',
      confidence_reason: matchScore >= 75
        ? 'The target path is credible now, which means you can transition deliberately instead of reactively.'
        : 'The strategy is sound, but you should treat the next 30 days as a validation sprint before committing harder.',
    };
  }

  return {
    recommendation_type: 'stay-and-redesign',
    headline: 'Stay, but redesign the role around stronger leverage',
    urgency: 'Low immediate urgency',
    rationale: 'The role is not under immediate collapse, so the highest-value move is to strengthen the parts of the job that become more important with AI.',
    confidence_label: 'Moderate confidence',
    confidence_reason: 'The current role still has room to compound, but the next gains will come from repositioning the work, not protecting the old task mix.',
  };
}

function difficultyWeight(value) {
  const normalized = normalizeText(value);
  if (normalized === 'low') return 0;
  if (normalized === 'high') return 2;
  return 1;
}

function buildPivotConfidenceState(pivot, profile = null) {
  const signal = pivot?.live_market_signal || {};
  const openings = Number(signal?.matched_openings_count || 0);
  const fitScore = Number(signal?.profile_fit_score || 0);
  const matchScore = Number(pivot?.match_score || signal?.ranking_score || 0);
  const missingCount = normalizeArray(signal?.missing_required_skills).length;
  const modelOnlyCount = normalizeArray(signal?.model_only_skill_gaps).length;
  const yearsBand = getYearsExperienceBand(profile);
  const overshoot = seniorityOvershoot(pivot?.title, yearsBand);
  const technicalCapability = getTechnicalCapability(profile);
  const technicalOvershoot = technicalOvershootForPivot(pivot, profile);
  const marketCaution = targetMarketNeedsExtraCaution(profile);
  const experienceNote = overshoot > 0
    ? ` For someone with ${getExperienceBandLabel(yearsBand)}, this title still reads as a stretch unless you already have much stronger proof or cleaner market demand.`
    : '';
  const technicalNote = technicalOvershoot > 0
    ? ` Right now this path also assumes more ${technicalCapabilityLabel(technicalCapability)} than the current profile clearly signals, so treat it as a bigger capability jump until you have stronger proof.`
    : '';
  const locationNote = marketCaution && openings < 3
    ? ' Your target market is narrower than the default catalog view, so treat this as a directional read until you verify local or remote demand directly.'
    : '';

  if (openings >= 5 && fitScore >= 35 && missingCount <= 3 && overshoot === 0 && technicalOvershoot === 0 && !(marketCaution && openings < 7)) {
    return {
      confidence_state: 'market-backed',
      confidence_label: 'Market-backed',
      confidence_reason: `${openings} live opening${openings === 1 ? '' : 's'} matched this path, and your current background already overlaps meaningfully with the repeated requirements.${locationNote}`,
    };
  }

  if (overshoot >= 2 && openings < 5) {
    return {
      confidence_state: 'low-confidence',
      confidence_label: 'Low-confidence pivot',
      confidence_reason: `The title asks for materially more scope or seniority than is usually credible for ${getExperienceBandLabel(yearsBand)} without stronger market evidence.${locationNote}`,
    };
  }

  if (technicalOvershoot >= 2 && openings < 5) {
    return {
      confidence_state: 'low-confidence',
      confidence_label: 'Low-confidence pivot',
      confidence_reason: `The title currently asks for a bigger technical jump than is usually credible from ${technicalCapabilityLabel(technicalCapability)} without cleaner market proof.${locationNote}`,
    };
  }

  if (openings >= 1 || fitScore >= 20 || matchScore >= 78) {
    return {
      confidence_state: 'strategy-led',
      confidence_label: openings ? 'Promising, still proving' : 'Directional fit, build proof',
      confidence_reason: openings
        ? `${openings} live opening${openings === 1 ? '' : 's'} point in the right direction, but PivotIQ still wants clearer proof before treating this as the main external bet.${experienceNote}${technicalNote}${locationNote}`
        : `The path fits your background directionally, but the external market signal is still too thin to justify a blind title jump. Treat it as a build target until you have stronger proof.${experienceNote}${technicalNote}${locationNote}`,
    };
  }

  return {
    confidence_state: 'low-confidence',
    confidence_label: 'Low-confidence pivot',
    confidence_reason: modelOnlyCount >= 3
      ? `Several of the remaining gaps still come mostly from model logic rather than repeated live-market demand, so this should be treated as a hypothesis, not a bet.${experienceNote}${technicalNote}${locationNote}`
      : `This title is adjacent, but there is not enough clean market evidence yet to rely on it as the main move.${experienceNote}${technicalNote}${locationNote}`,
  };
}

function buildStayConfidenceState(summary, stayAndAdvance, profile = null) {
  const score = Number(summary?.overall_score || 0);
  const nextTitle = stayAndAdvance?.promotion_path?.next_title || 'the stronger version of your current role';
  const goalNow = getGoalNow(profile);
  const timelineUrgency = getTimelineUrgency(profile);
  const aiMaturity = getAiMaturity(profile);
  const roleFamily = inferRoleFamilyFromProfile(
    profile?.job_title || profile?.jobTitle || '',
    profile?.industry || '',
    profile?.tasks || [],
    profile?.clarifiers || null
  );
  const roleTail = buildStayConfidenceRoleTail(roleFamily);
  const aiReadyTail = aiMaturityRank(aiMaturity) >= 3
    ? ' You already have enough AI usage to turn this into visible leverage and team-level signal quickly.'
    : aiMaturityRank(aiMaturity) >= 2
      ? ' You already have enough AI familiarity to turn this into a repeatable operating advantage, not just beginner experimentation.'
      : ' The key is to make AI part of your weekly operating rhythm now instead of leaving it as an occasional experiment.';

  if (goalNow === 'stay_and_advance' && score < 80) {
    return {
      confidence_state: 'current-lane-advantage',
      confidence_label: timelineUrgency === 'within_3_months' ? 'Fastest practical path' : 'Strong current-lane advantage',
      confidence_reason: `You explicitly want the strongest move inside your current lane, and the current evidence still supports using AI to move toward ${nextTitle} faster than forcing a bigger reset.${roleTail}${aiReadyTail}`,
    };
  }

  if (score < 45) {
    return {
      confidence_state: 'current-lane-advantage',
      confidence_label: 'Strong current-lane advantage',
      confidence_reason: `The role is not under immediate collapse, so the clearest win is to use AI to move toward ${nextTitle} before you spend energy on a harder external transition.${roleTail}${aiReadyTail}`,
    };
  }

  if (score < 65) {
    return {
      confidence_state: 'current-lane-advantage',
      confidence_label: timelineUrgency === 'within_3_months' ? 'Fastest practical path' : 'Strong near-term advantage',
      confidence_reason: `You still have enough leverage inside the current role to turn AI into broader scope, better visibility, and a stronger internal promotion case toward ${nextTitle}.${roleTail}${aiReadyTail}`,
    };
  }

  return {
    confidence_state: 'strategy-led',
    confidence_label: 'Safer while you validate',
    confidence_reason: `Pressure is rising in the role, so staying only works if you quickly turn AI usage into visible scope, proof, and promotion signal while validating outside options in parallel.${roleTail}${aiReadyTail}`,
  };
}

function buildStayOperatingSystem(reportData) {
  const profile = reportData?.profile || {};
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const locale = reportData?.locale || profile?.locale || 'en';
  const jobTitle = profile?.job_title || profile?.jobTitle || 'your role';
  const industry = profile?.industry || 'your industry';
  const primaryTasks = normalizeArray(profile?.primary_tasks).length
    ? normalizeArray(profile?.primary_tasks)
    : normalizeArray(profile?.tasks);
  const anchorTask = primaryTasks[0] || 'your highest-visibility workflow';
  const roleFamily = inferRoleFamilyFromProfile(jobTitle, industry, profile?.tasks || [], profile?.clarifiers || null);
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);

  const automate = normalizeArray(stayAndAdvance?.work_redesign?.automate);
  const augment = normalizeArray(stayAndAdvance?.work_redesign?.augment);
  const protect = normalizeArray(stayAndAdvance?.work_redesign?.protect);
  const lead = normalizeArray(stayAndAdvance?.work_redesign?.lead);
  const leverageOps = normalizeArray(stayAndAdvance?.leverage_opportunities).map((item) => item?.title || item);
  const aiMaturity = getAiMaturity(profile);
  const timelineUrgency = getTimelineUrgency(profile);
  const firstWeekWin = aiMaturityRank(aiMaturity) >= 3
    ? `Turn one AI workflow around ${anchorTask.toLowerCase()} into a reusable team pattern with a review rule and one adoption metric.`
    : aiMaturityRank(aiMaturity) >= 2
      ? `Convert one weekly AI habit around ${anchorTask.toLowerCase()} into a repeatable workflow with a visible before/after result.`
      : normalizeArray(stayAndAdvance?.thirty_day_plan?.this_week)[0] || `Use AI on the first pass of ${anchorTask.toLowerCase()} this week, document what improved, and keep a manual review step.`;

  return {
    headline: `How to become more valuable in ${jobTitle}`,
    summary: stayAndAdvance?.recommendation || stayAndAdvance?.rationale || blueprint.narrative,
    automate: automate.length ? automate : [anchorTask],
    augment: augment.length ? augment : ['Decision support and stakeholder communication'],
    protect: protect.length ? protect : ['Judgment on high-impact output', 'Quality control on visible deliverables'],
    lead: lead.length ? lead : ['AI adoption pattern for the team', 'Workflow review standards'],
    visible_scope_move: leverageOps[0] || blueprint.opportunities?.[0] || `Use AI to redesign ${anchorTask.toLowerCase()} in a way leadership can see and reuse.`,
    first_week_win: firstWeekWin,
    manager_read: stayAndAdvance?.thirty_day_plan?.leadership_narrative || blueprint.narrative,
    weekly_time_budget: timelineUrgency === 'within_3_months' ? '4-6 focused hours' : '3-5 focused hours',
  };
}

function buildStackItemFromPivot(reportData, pivot, slotLabel = 'Primary move') {
  if (!pivot?.title) return null;

  const confidence = buildPivotConfidenceState(pivot, reportData?.profile || null);
  const nextMove = buildNextMove(reportData?.profile || {}, pivot, reportData?.locale || reportData?.profile?.locale || 'en');
  const proofAsset = buildFirst30Days(
    reportData?.profile || {},
    pivot,
    { weeks: normalizeArray(pivot?.roadmap?.weeks) },
    nextMove
  )?.proof_asset;

  return {
    type: 'pivot',
    slot_label: slotLabel,
    id: pivot.id,
    title: pivot.title,
    decision_frame: pivot.decision_frame || '',
    confidence_state: confidence.confidence_state,
    confidence_label: confidence.confidence_label,
    confidence_reason: confidence.confidence_reason,
    why: pivot.ranking_reason || pivot.fit_summary || pivot.why_this_path_wins || '',
    market_evidence: summarizeMarketEvidence(pivot),
    next_step: nextMove?.explanation || '',
    proof_asset: proofAsset?.title || `${pivot.title} proof asset`,
    learning_focus: getFirstLearningStep(pivot, reportData?.profile || null),
  };
}

function buildStackItemFromStay(reportData, stayPath, slotLabel = 'Stay and advance') {
  if (!stayPath?.title) return null;

  const stayAndAdvance = reportData?.stay_and_advance || {};
  const confidence = buildStayConfidenceState(reportData?.summary || {}, stayAndAdvance, reportData?.profile || null);
  const roleOperatingSystem = buildStayOperatingSystem(reportData);

  return {
    type: 'stay',
    slot_label: slotLabel,
    id: stayPath.id || 'stay-and-advance',
    title: stayPath.title,
    decision_frame: stayPath.decision_frame || 'stay and advance',
    confidence_state: confidence.confidence_state,
    confidence_label: confidence.confidence_label,
    confidence_reason: confidence.confidence_reason,
    why: stayAndAdvance?.recommendation || stayAndAdvance?.rationale || stayPath.fit_summary || '',
    market_evidence: 'This path is based on current-role leverage, workflow redesign potential, and promotion signal rather than external job-posting demand.',
    next_step: normalizeArray(stayAndAdvance?.thirty_day_plan?.this_week)[0] || roleOperatingSystem.first_week_win,
    proof_asset: stayAndAdvance?.thirty_day_plan?.proof_asset?.title || roleOperatingSystem.visible_scope_move,
    learning_focus: getFirstLearningStep(stayPath, reportData?.profile || null),
  };
}

function pickConservativeBackupPivot(pivots = [], primaryPivotId = '') {
  const remaining = normalizeArray(pivots).filter((pivot) => pivot?.id !== primaryPivotId);
  if (!remaining.length) return null;

  return [...remaining].sort((left, right) => {
    const leftDifficulty = difficultyWeight(left?.difficulty);
    const rightDifficulty = difficultyWeight(right?.difficulty);
    if (leftDifficulty !== rightDifficulty) return leftDifficulty - rightDifficulty;

    const rightOpenings = Number(right?.live_market_signal?.matched_openings_count || 0);
    const leftOpenings = Number(left?.live_market_signal?.matched_openings_count || 0);
    if (rightOpenings !== leftOpenings) return rightOpenings - leftOpenings;

    const rightFit = Number(right?.live_market_signal?.profile_fit_score || 0);
    const leftFit = Number(left?.live_market_signal?.profile_fit_score || 0);
    if (rightFit !== leftFit) return rightFit - leftFit;

    return Number(right?.match_score || 0) - Number(left?.match_score || 0);
  })[0];
}

function buildRecommendationStack(reportData) {
  const summary = reportData?.summary || {};
  const profile = reportData?.profile || {};
  const pivots = normalizeArray(reportData?.pivots);
  const primaryPivot = pivots[0] || null;
  const stayPath = reportData?.stay_path || null;
  const stayItem = buildStackItemFromStay(reportData, stayPath);
  const primaryPivotItem = buildStackItemFromPivot(reportData, primaryPivot, 'Primary move');
  const primaryPivotConfidence = buildPivotConfidenceState(primaryPivot || {}, profile);
  const riskScore = Number(summary?.overall_score || 0);
  const goalNow = getGoalNow(profile);
  const timelineUrgency = getTimelineUrgency(profile);
  const yearsBand = getYearsExperienceBand(profile);
  const salaryTolerance = getSalaryTolerance(profile);
  const proofState = getProofState(profile);
  const strictSalaryTolerance = salaryToleranceIsStrict(salaryTolerance);
  const proofStateLevel = proofStateRank(proofState);
  const salaryRiskOnPivot = salaryToleranceMismatch(primaryPivot, profile);
  const roleFamily = inferRoleFamilyFromProfile(
    profile?.job_title || profile?.jobTitle || '',
    profile?.industry || '',
    profile?.tasks || [],
    profile?.clarifiers || null
  );
  const pivotOpenings = Number(primaryPivot?.live_market_signal?.matched_openings_count || 0);
  const pivotFitScore = Number(primaryPivot?.live_market_signal?.profile_fit_score || 0);
  const broadRoleThinSignal = roleFamilyNeedsConservativePivotBias(roleFamily) && pivotOpenings < 3 && pivotFitScore < 35;
  const canStretchIntoPivot = Boolean(
    goalNow === 'active_pivot'
    && proofStateLevel >= 3
    && primaryPivotConfidence.confidence_state !== 'low-confidence'
    && !(strictSalaryTolerance && salaryRiskOnPivot && primaryPivotConfidence.confidence_state !== 'market-backed')
    && (
      primaryPivotConfidence.confidence_state === 'market-backed'
      || (pivotOpenings >= 2 && pivotFitScore >= 25)
    )
  );
  let shouldLeadWithStay = Boolean(
    stayItem
    && (
      riskScore < 55
      || primaryPivotConfidence.confidence_state === 'low-confidence'
      || (primaryPivotConfidence.confidence_state === 'strategy-led' && riskScore < 72)
      || (primaryPivotConfidence.confidence_state === 'strategy-led' && broadRoleThinSignal && goalNow !== 'active_pivot')
    )
  );

  if (stayItem && goalNow === 'stay_and_advance') {
    shouldLeadWithStay = primaryPivotConfidence.confidence_state !== 'market-backed' || riskScore < 78;
  } else if (stayItem && goalNow === 'hybrid_transition') {
    shouldLeadWithStay = shouldLeadWithStay || (
      primaryPivotConfidence.confidence_state !== 'market-backed'
      && (riskScore < 72 || broadRoleThinSignal)
    );
  } else if (stayItem && goalNow === 'active_pivot') {
    shouldLeadWithStay = shouldLeadWithStay || !canStretchIntoPivot;
  } else if (stayItem && goalNow === 'not_sure') {
    shouldLeadWithStay = shouldLeadWithStay || (
      (timelineUrgency === 'exploring_only' && primaryPivotConfidence.confidence_state !== 'market-backed')
      || broadRoleThinSignal
    );
  }

  if (stayItem && timelineUrgency === 'within_3_months' && primaryPivotConfidence.confidence_state !== 'market-backed') {
    shouldLeadWithStay = true;
  }

  if (stayItem && yearsBand === '0_2' && primaryPivotConfidence.confidence_state !== 'market-backed') {
    shouldLeadWithStay = true;
  }

  if (stayItem && strictSalaryTolerance && salaryRiskOnPivot && primaryPivotConfidence.confidence_state !== 'market-backed') {
    shouldLeadWithStay = true;
  }

  if (stayItem && broadRoleThinSignal && primaryPivotConfidence.confidence_state !== 'market-backed' && !canStretchIntoPivot) {
    shouldLeadWithStay = true;
  }

  if (stayItem && primaryPivotConfidence.confidence_state === 'market-backed' && goalNow !== 'stay_and_advance') {
    shouldLeadWithStay = false;
  }

  if (stayItem && canStretchIntoPivot) {
    shouldLeadWithStay = false;
  }

  const primary = shouldLeadWithStay
    ? { ...stayItem, slot_label: 'Primary move' }
    : primaryPivotItem;
  const backupPivot = shouldLeadWithStay
    ? primaryPivot
    : pickConservativeBackupPivot(pivots, primaryPivot?.id);
  const conservativeBackup = buildStackItemFromPivot(reportData, backupPivot, 'Conservative backup');

  const decisionBriefHeadline = primary?.type === 'stay'
    ? goalNow === 'stay_and_advance'
      ? `Use AI to create a stronger promotion case inside ${profile?.job_title || 'your role'}.`
      : `Use AI to get stronger inside ${profile?.job_title || 'your role'} before forcing a pivot.`
    : goalNow === 'active_pivot'
      ? `Move toward ${primary?.title || 'the strongest next role'} now, but make it visible with proof quickly.`
      : `Move toward ${primary?.title || 'the strongest next role'} and keep the current role working for you while you build proof.`;
  const decisionBriefSummary = primary?.type === 'stay'
    ? goalNow === 'stay_and_advance'
      ? 'You asked for the strongest answer inside your current lane, and the cleaner move is still to turn AI into broader scope, visible proof, and promotion signal before forcing a bigger reset.'
      : 'The market signal on external pivots is not strong enough yet to justify a hard jump, so the best move is to turn AI into broader scope, visible proof, and promotion signal in your current lane.'
    : timelineUrgency === 'within_3_months'
      ? 'The top pivot is credible enough to build toward now, but the first win still needs to be a fast proof asset that makes the move useful inside 90 days.'
      : 'The top pivot is strong enough to build toward now, but the safest way to do it is through visible proof, not a dramatic leap or a learning binge.';
  const salaryContext = strictSalaryTolerance && salaryRiskOnPivot
    ? ' Because you said pay protection matters, PivotIQ is leaning toward the path that keeps compensation risk tighter until the market signal gets cleaner.'
    : '';
  const proofContext = proofStateLevel >= 3
    ? ' You already have enough proof to build from something real, so the recommendation can afford to be slightly more ambitious.'
    : proofStateLevel >= 1
      ? ' You already have some usable proof, so the next move should package existing work instead of pretending you are starting from zero.'
      : '';
  const signalContext = primary?.type === 'stay' && broadRoleThinSignal
    ? ' Because this is a broader role family and the external signal is still thin, PivotIQ is protecting you from a weak title jump and leaning toward the path that converts current-role leverage into visible proof first.'
    : '';
  const riskierAlternative = primary?.type === 'stay'
    ? primaryPivotItem
    : conservativeBackup;
  const whyThisWon = primary?.type === 'stay'
    ? stayItem?.confidence_state === 'strategy-led'
      ? 'PivotIQ is leading with the move you can make real fastest: it uses current-role leverage, visible proof, and near-term scope gain instead of asking you to trust a thinner external title jump.'
      : 'PivotIQ is leading with the strongest current-lane advantage because it is the path with the best mix of speed, realism, and usable proof from where you are now.'
    : primaryPivotConfidence.confidence_state === 'market-backed'
      ? 'PivotIQ is leading with this pivot because it already has enough market overlap and role fit to justify building outward now, not just inward.'
      : 'PivotIQ is still leading with this pivot because it is the strongest external direction available, but it only stays primary if you turn it into visible proof quickly.';
  const notYetReason = riskierAlternative
    ? primary?.type === 'stay'
      ? strictSalaryTolerance && salaryRiskOnPivot
        ? `${riskierAlternative.title} is not the lead move yet because it asks for a riskier pay tradeoff before the market signal is strong enough to justify it.`
        : broadRoleThinSignal
          ? `${riskierAlternative.title} is not the lead move yet because the external signal is still too thin and role-mixed for a clean jump.`
          : primaryPivotConfidence.confidence_state === 'low-confidence'
            ? `${riskierAlternative.title} is not the lead move yet because it still reads like a stretch relative to the current evidence, proof, and market overlap.`
            : `${riskierAlternative.title} is not the lead move yet because PivotIQ still sees the cleaner advantage in turning your current lane into visible leverage first.`
      : riskierAlternative.confidence_state === 'low-confidence'
        ? `${riskierAlternative.title} stays secondary because it still needs much stronger evidence before it becomes safer than the current top move.`
        : `${riskierAlternative.title} stays secondary because it is more speculative, slower to prove, or less aligned with the strongest current evidence.`
    : '';
  const unlockCondition = primary?.type === 'stay'
    ? strictSalaryTolerance && salaryRiskOnPivot
      ? 'The riskier pivot becomes more realistic once you can keep compensation risk tight and show one proof asset that clearly matches live postings.'
      : broadRoleThinSignal
        ? 'The riskier pivot becomes more realistic once you have cleaner live-market overlap plus one proof asset that already looks native to that target role.'
        : proofStateLevel < 2
          ? 'The riskier pivot becomes more realistic once you have one visible proof asset and repeated job-posting overlap for the top requirements.'
          : 'The riskier pivot becomes more realistic once live openings and your proof both point in the same direction.'
    : riskierAlternative
      ? 'A flashier lower pivot only becomes worth promoting once it has stronger market overlap, less title stretch, and a clearer proof path than the current top move.'
      : '';

  return {
    primary,
    conservative_backup: conservativeBackup,
    stay_path: stayItem,
    decision_brief: {
      headline: decisionBriefHeadline,
      summary: `${decisionBriefSummary}${salaryContext}${proofContext}${signalContext}`,
      why_this_won: whyThisWon,
      not_yet_title: riskierAlternative?.title || '',
      not_yet_reason: notYetReason,
      unlock_condition: unlockCondition,
      primary_rule: primary?.type === 'stay'
        ? 'Prioritize current-role leverage first.'
        : 'Build toward the pivot while your current role still gives you leverage.',
      confidence_callout: primary?.confidence_reason || '',
    },
  };
}

function buildDecisionFromRecommendationStack(reportData, recommendationStack) {
  const primary = recommendationStack?.primary;
  if (!primary) return reportData?.decision || {};
  const profile = reportData?.profile || {};
  const timelineUrgency = getTimelineUrgency(profile);
  const goalNow = getGoalNow(profile);

  if (primary.type === 'stay') {
    return {
      ...(reportData?.decision || {}),
      recommendation_type: 'stay-and-redesign',
      headline: goalNow === 'stay_and_advance'
        ? 'Use AI to grow your current lane first'
        : 'Use AI to strengthen your current lane first',
      urgency: timelineUrgency === 'within_3_months'
        ? 'Make this useful in the next 90 days'
        : Number(reportData?.summary?.overall_score || 0) >= 65
          ? 'Build while pressure is rising'
          : 'Use this window to get ahead',
      rationale: primary.why || reportData?.stay_and_advance?.rationale || '',
      confidence_label: primary.confidence_label,
      confidence_reason: primary.confidence_reason,
    };
  }

  return {
    ...(reportData?.decision || {}),
    recommendation_type: goalNow === 'active_pivot' || Number(reportData?.summary?.overall_score || 0) >= 70 ? 'active-pivot' : 'hybrid-transition',
    headline: `Build toward ${primary.title} now`,
    urgency: timelineUrgency === 'within_3_months'
      ? 'Make this useful in the next 90 days'
      : Number(reportData?.summary?.overall_score || 0) >= 70
        ? 'Do not wait for perfect certainty'
        : 'Build while you still have leverage',
    rationale: primary.why || reportData?.decision?.rationale || '',
    confidence_label: primary.confidence_label,
    confidence_reason: primary.confidence_reason,
  };
}

function buildCareerRoi(summary, bestPivot, profile = null) {
  const learningCost = estimateLearningCost(bestPivot);
  const paybackMonths = estimatePaybackMonths(bestPivot, learningCost);
  const salaryRangeValues = parseSalaryNumbers(bestPivot?.salary_range);
  const midpointSalary = salaryRangeValues.length >= 2
    ? Math.round((salaryRangeValues[0] + salaryRangeValues[1]) / 2)
    : salaryRangeValues[0] || null;
  const salaryTolerance = getSalaryTolerance(profile);
  const salaryCaution = salaryToleranceMismatch(bestPivot, profile);
  const salaryContext = salaryToleranceIsStrict(salaryTolerance) && salaryCaution
    ? ' Because you said compensation protection matters, only treat this as attractive if you can keep the move close to current pay or convert it through internal scope first.'
    : '';

  return {
    salary_range: bestPivot?.salary_range || '',
    salary_delta: bestPivot?.salary_delta || '',
    transition_time: bestPivot?.transition_time || '',
    learning_cost_estimate: formatCurrency(learningCost),
    payback_period: paybackMonths ? `${paybackMonths} month${paybackMonths === 1 ? '' : 's'}` : 'Longer / depends on role change',
    roi_read: summary?.overall_score >= 70
      ? `The economic case for moving is strong because the downside of staying exposed is rising.${salaryContext}`
      : summary?.overall_score >= 40
        ? `This is usually worth doing as a staged transition: build proof now, then convert once the signal is strong.${salaryContext}`
        : `Treat this as a leverage upgrade more than an escape plan; the value comes from future-proofing while the current role is still viable.${salaryContext}`,
    midpoint_salary: midpointSalary ? formatCurrency(midpointSalary) : '',
  };
}

function buildNextMove(profile, bestPivot, locale = 'en') {
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'your highest-value task';
  const topSkill = normalizeArray(bestPivot?.skill_gaps)[0]?.skill_name || 'one visible skill gap';
  const pivotTitle = bestPivot?.title || 'the target role';

  const explanation = locale === 'nl'
    ? `Kies deze week één kernactiviteit, te beginnen met ${primaryTask}, en herbouw die in de richting van ${pivotTitle}. Maak één klein artefact dat laat zien hoe ${topSkill} de kwaliteit, snelheid of besluitvorming verbetert, zodat je al direct bewijs opbouwt voor de pivot.`
    : locale === 'de'
      ? `Wähle diese Woche eine Kernaufgabe, beginnend mit ${primaryTask}, und baue sie in Richtung ${pivotTitle} um. Erstelle ein kleines Artefakt, das zeigt, wie ${topSkill} Qualität, Tempo oder Entscheidungsfähigkeit verbessert, damit du sofort sichtbaren Nachweis für den Wechsel aufbaust.`
      : `Pick one core task this week, starting with ${primaryTask}, and redesign it toward ${pivotTitle}. Create one small artifact that shows how ${topSkill} improves speed, quality, or decision support so you start building visible proof for the pivot immediately.`;

  return {
    title: locale === 'nl' ? 'Jouw stap deze week' : locale === 'de' ? 'Dein Schritt diese Woche' : 'Your move this week',
    explanation,
  };
}

function buildFirst30Days(profile, bestPivot, roadmap, nextMove) {
  const firstThreeWeeks = normalizeArray(roadmap?.weeks).slice(0, 3);
  const topSkill = normalizeArray(bestPivot?.skill_gaps)[0];
  const secondSkill = normalizeArray(bestPivot?.skill_gaps)[1];
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'your highest-value task';

  return {
    next_7_days: [
      nextMove?.explanation || `Run one AI-assisted redesign on ${primaryTask} and capture the before/after difference.`,
      firstThreeWeeks[0]?.actions?.[0] || `Review live job descriptions for ${bestPivot?.title || 'the target role'} and write down repeated requirements.`,
      `Choose ${topSkill?.skill_name || 'one visible skill gap'} as the first skill to close and ignore secondary learning until that is underway.`,
    ].filter(Boolean),
    next_30_days: [
      firstThreeWeeks[1]?.actions?.[0] || 'Turn past work into 3 proof stories using a problem -> action -> outcome format.',
      firstThreeWeeks[2]?.actions?.[0] || `Build a simple proof asset that demonstrates ${topSkill?.skill_name || 'the target skill'} in a business context.`,
      `Get feedback from 2 people close to ${bestPivot?.title || 'the target path'} so you can refine the story before investing more time.`,
    ].filter(Boolean),
    avoid: [
      'Do not start with a broad learning binge before choosing a target path.',
      'Do not collect certificates without producing one visible proof asset.',
      secondSkill?.skill_name
        ? `Do not split focus too early across both ${topSkill?.skill_name || 'your top skill'} and ${secondSkill.skill_name}; sequence them.`
        : 'Do not try to fix every skill gap at once.',
    ].filter(Boolean),
    proof_asset: {
      title: `${bestPivot?.title || 'Pivot'} proof asset`,
      description: topSkill?.skill_name
        ? `Create one artifact that shows ${topSkill.skill_name} applied to a real business problem connected to your background.`
        : 'Create one artifact that makes your transition story concrete and employer-readable.',
      why_it_matters: 'This is what turns learning into employability. Hiring confidence rises faster when the evidence is visible.',
    },
  };
}

function alignFirst30DaysWithRecommendation(reportData) {
  const recommendationStack = reportData?.recommendation_stack || {};
  const primary = recommendationStack.primary || {};
  if (primary.type !== 'stay') return reportData;

  const stayPath = reportData?.stay_path || {};
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const aiThisWeekPlan = stayAndAdvance?.ai_this_week_plan || {};
  const topSkill = normalizeArray(stayPath?.skill_gaps)[0];
  const secondSkill = normalizeArray(stayPath?.skill_gaps)[1];
  const targetTitle = stayPath?.title || primary.title || 'the stronger version of your current role';
  const output = aiThisWeekPlan?.output || stayAndAdvance?.thirty_day_plan?.proof_asset?.title || `${targetTitle} proof asset`;

  return {
    ...reportData,
    first_30_days: {
      next_7_days: [
        aiThisWeekPlan?.workflow || `Redesign one current-role workflow so AI handles the first pass and you keep judgment.`,
        `Ship ${output} so leadership can see how this creates leverage inside your current lane.`,
        `Choose ${topSkill?.skill_name || 'the top stay-path skill'} as the first skill to close and ignore secondary learning until that is moving.`,
      ].filter(Boolean),
      next_30_days: [
        stayAndAdvance?.thirty_day_plan?.this_month?.[0] || `Show one visible AI workflow improvement tied to ${targetTitle}.`,
        stayAndAdvance?.thirty_day_plan?.this_month?.[1] || 'Document the before/after impact so the work reads like promotion signal, not just efficiency.',
        `Get feedback from 2 people who can judge whether this now looks like ${targetTitle}.`,
      ].filter(Boolean),
      avoid: [
        'Do not treat the stay path like “more of the same work” without a visible workflow change.',
        'Do not collect courses without shipping one manager-readable proof asset.',
        secondSkill?.skill_name
          ? `Do not split focus too early across both ${topSkill?.skill_name || 'your top skill'} and ${secondSkill.skill_name}; sequence them.`
          : 'Do not try to improve every part of the role at once.',
      ].filter(Boolean),
      proof_asset: {
        title: output,
        description: topSkill?.skill_name
          ? `Create one internal proof asset that shows ${topSkill.skill_name} improving a real workflow you already own.`
          : 'Create one internal proof asset that shows how AI improved a real workflow you already own.',
        why_it_matters: 'This is what makes the stay path look like higher-value scope, not just private productivity.',
      },
    },
  };
}

function first30DaysMatchesPivot(first30Days, pivotTitle) {
  const normalizedPivot = normalizeText(pivotTitle);
  if (!normalizedPivot) return true;

  const text = [
    ...(Array.isArray(first30Days?.next_7_days) ? first30Days.next_7_days : []),
    ...(Array.isArray(first30Days?.next_30_days) ? first30Days.next_30_days : []),
    first30Days?.proof_asset?.title,
    first30Days?.proof_asset?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return !text || text.includes(normalizedPivot);
}

function buildFinalTopPivotRankingReason(pivot) {
  const signal = pivot?.live_market_signal || {};
  const openings = Number(signal.matched_openings_count || 0);
  const fitScore = Number(signal.profile_fit_score || 0);

  if (!openings) {
    return 'This pivot ranks first because it is the most role-native path in the final recommendation set, but it should still be verified against more live postings.';
  }

  if (fitScore >= 35) {
    return 'This pivot ranks first because it has the strongest blend of role fit, live-market evidence, and credible next-step skill gaps.';
  }

  return 'This pivot ranks first because live postings support the role direction, even though the user still needs visible proof for several required skills.';
}

function summarizeMarketEvidence(pivot) {
  const signal = pivot?.live_market_signal || {};
  const openings = Number(signal.matched_openings_count || 0);
  const fit = Number(signal.profile_fit_score || 0);
  const required = normalizeArray(signal.market_required_skills).slice(0, 3).join(', ');

  if (!openings) {
    return 'No close live openings matched this exact path yet, so treat it as model-led and verify it with postings before committing hard.';
  }

  return `${openings} live opening${openings === 1 ? '' : 's'} matched this path, with a ${fit || 0}/100 profile-fit signal${required ? ` around ${required}` : ''}.`;
}

function getFirstLearningStep(pivot, profile = null) {
  const skill = pickStartingSkillGap(normalizeArray(pivot?.skill_gaps), profile)
    || normalizeArray(pivot?.skill_gaps).find((item) => item?.resource_title)
    || normalizeArray(pivot?.skill_gaps)[0]
    || null;
  if (!skill) return 'Start with the first visible skill gap and turn it into a proof asset before adding more courses.';
  if (skill.resource_title) return `${skill.skill_name}: ${skill.resource_title}${skill.resource_provider ? ` (${skill.resource_provider})` : ''}`;
  return `${skill.skill_name}: build one small proof asset before adding secondary learning.`;
}

function buildProofAssetVersions(builder, reportData, targetRole) {
  const primaryTask = normalizeArray(reportData?.profile?.primary_tasks)[0] || normalizeArray(reportData?.profile?.tasks)[0] || 'one high-visibility workflow';
  const topSkill = normalizeArray((normalizeArray(reportData?.pivots)[0] || {}).skill_gaps)[0]?.skill_name || 'the highest-value skill gap';

  return {
    internal_version: {
      title: `${builder.title} for internal promotion`,
      use_case: `Use this with your manager or leadership team to show how you are redesigning ${primaryTask.toLowerCase()} for better team leverage.`,
      emphasis: [
        'Tie the artifact to time saved, quality controls, or decision speed.',
        'Show what teammates can now repeat because you designed the workflow clearly.',
        'Frame the asset as evidence that you can own broader scope, not just execute faster.',
      ],
    },
    external_version: {
      title: `${builder.title} for external interviews`,
      use_case: `Use this in interviews or outreach to show that you already think and operate like someone moving toward ${targetRole}.`,
      emphasis: [
        `Name the target shift explicitly: ${topSkill} is now part of how you solve real business work.`,
        'Keep one clean before/after example that an employer can understand in under three minutes.',
        'End with the business decision, recommendation, or system improvement the artifact made possible.',
      ],
    },
  };
}

function buildProofAssetBuilder(reportData) {
  const pivot = normalizeArray(reportData?.pivots)[0] || {};
  const first30Days = reportData?.first_30_days || {};
  const topSkill = normalizeArray(pivot.skill_gaps)[0]?.skill_name || 'the highest-value skill gap';
  const secondSkill = normalizeArray(pivot.skill_gaps)[1]?.skill_name || 'a supporting skill';
  const title = first30Days?.proof_asset?.title || `${pivot.title || 'Target role'} proof asset`;
  const targetRole = pivot.title || 'the target role';
  const primaryTask = normalizeArray(reportData?.profile?.primary_tasks)[0] || normalizeArray(reportData?.profile?.tasks)[0] || 'a real task from your current role';
  const metricPrompt = normalizeArray(pivot?.live_market_signal?.market_required_skills)[0] || topSkill;
  const proofState = getProofState(reportData?.profile || {});
  const proofAction = proofStateActionLabel(proofState);

  let objective = first30Days?.proof_asset?.description || `Show how ${topSkill} improves a realistic business problem connected to ${primaryTask}.`;
  let sections = [
    `Problem: describe the ${primaryTask} workflow or decision this asset improves.`,
    `Approach: show how you used ${topSkill} to redesign the workflow, analysis, or decision path.`,
    `Controls: document where you reviewed AI output, protected quality, or added human judgment.`,
    'Evidence: include one before/after, scorecard, dashboard, workflow map, or decision memo.',
    `Employer read: add 3 bullets explaining why this proves readiness for ${targetRole}.`,
  ];
  let checklist = [
    'Uses a realistic business problem, not a toy example.',
    `Names the target role: ${targetRole}.`,
    `Shows the first skill gap clearly: ${topSkill}.`,
    'Includes a measurable improvement, decision, or quality-control step.',
    'Can be skimmed by a hiring manager in under 3 minutes.',
  ];
  let firstAction = `Spend 60 minutes outlining the current ${primaryTask} process and marking where ${topSkill} changes the outcome.`;
  let sharePrompt = `I’m building proof for a move toward ${targetRole}. Does this artifact make the transition feel credible, and what would you expect to see next?`;

  if (proofState === 'internal_project') {
    objective = `Package one internal project around ${primaryTask} into visible proof that already looks like ${targetRole}.`;
    sections = [
      `Source project: choose the internal project where ${primaryTask} already improved in a measurable way.`,
      `Reframe: explain how the project demonstrates ${topSkill} rather than only task completion.`,
      'Controls: document where judgment, review, and stakeholder alignment still mattered.',
      'Evidence: include the before/after result, memo, dashboard, or workflow artifact you already produced.',
      `Employer read: add 3 bullets showing why this is evidence for ${targetRole}.`,
    ];
    checklist = [
      'Starts from a real internal project you already delivered.',
      `Makes ${topSkill} visible instead of assuming the reviewer will infer it.`,
      'Includes at least one measurable result or stakeholder outcome.',
      'Can stand alone without extra company-only context.',
      'Feels like packaging strong proof, not inventing a new case from scratch.',
    ];
    firstAction = `Spend 60 minutes choosing the internal project with the clearest before/after result and rewriting it in a problem -> action -> outcome format.`;
    sharePrompt = `I already have an internal project that points toward ${targetRole}. What would make this case strong enough for a hiring manager or mentor to take seriously?`;
  } else if (proofState === 'dashboard_or_analysis') {
    objective = `Upgrade an existing analysis into a decision-ready case that proves ${topSkill} for ${targetRole}.`;
    sections = [
      `Original analysis: show the dashboard, model, or analysis tied to ${primaryTask}.`,
      `Decision layer: explain what decision the artifact now supports and how ${topSkill} sharpens it.`,
      'Controls: document checks, assumptions, and where you challenged the AI or data output.',
      'Evidence: show the recommendation, decision memo, or action triggered by the analysis.',
      `Employer read: explain why this goes beyond reporting and reads like ${targetRole}.`,
    ];
    checklist = [
      'Starts from an analysis or dashboard you already have.',
      'Adds business judgment and decision framing, not just cleaner charts.',
      'Shows one recommendation or operating choice the artifact supports.',
      `Makes ${topSkill} explicit in the story.`,
      'Can be understood without a full internal data download.',
    ];
    firstAction = `Spend 60 minutes choosing the strongest existing analysis and outlining the decision, not just the data, it should now support.`;
    sharePrompt = `I’ve turned an existing analysis into a stronger decision case for ${targetRole}. What would make the business value clearer or more credible?`;
  } else if (proofState === 'workflow_or_playbook') {
    objective = `Turn an existing workflow or playbook into reusable proof that you already think like ${targetRole}.`;
    sections = [
      `Workflow baseline: map the original ${primaryTask} process and the friction you solved.`,
      `Operating redesign: show the new workflow, decision rules, and where ${topSkill} changes the result.`,
      'Controls: document ownership, review steps, and risk safeguards.',
      'Evidence: include one workflow map, before/after sequence, or adoption snapshot.',
      `Employer read: explain why this looks like scalable operating judgment for ${targetRole}.`,
    ];
    checklist = [
      'Starts from a workflow or playbook that already exists.',
      'Shows the redesigned operating system, not just the tool steps.',
      'Includes one adoption, quality, or cycle-time signal.',
      'Makes the workflow reusable by someone else.',
      `Ends with why this signals readiness for ${targetRole}.`,
    ];
    firstAction = `Spend 60 minutes picking the workflow with the clearest before/after operating change and annotating the exact rule set someone else could reuse.`;
    sharePrompt = `I’ve packaged an existing workflow into proof for ${targetRole}. What would make this feel more reusable, strategic, or manager-ready?`;
  } else if (proofState === 'portfolio_or_case_study') {
    objective = `Upgrade an existing case study into sharper market-facing proof for ${targetRole}.`;
    sections = [
      'Original case: summarize the current asset and the business problem it solves.',
      `Upgrade: sharpen the case so ${topSkill} and role-readiness for ${targetRole} are obvious.`,
      'Controls: add what you reviewed, challenged, or governed rather than only what the tool produced.',
      'Evidence: include one measurable result, decision shift, or operating change.',
      'Market read: finish with the exact type of role or team this should resonate with.',
    ];
    checklist = [
      'Starts from an existing case study or portfolio item.',
      'Removes fluff and makes the business result obvious fast.',
      `Names ${topSkill} and ${targetRole} clearly.`,
      'Shows judgment, control, and measurable impact.',
      'Feels ready to share externally with minimal edits.',
    ];
    firstAction = `Spend 60 minutes tightening the strongest existing case study so the role shift and business outcome are obvious in the first screenful.`;
    sharePrompt = `I’ve upgraded an existing case study to support a move toward ${targetRole}. What would make it read as strong proof instead of just a nice project?`;
  }

  const builder = {
    title,
    target_role: targetRole,
    objective,
    audience: `A hiring manager or skip-level leader deciding whether you already operate like ${targetRole}.`,
    business_question: `How does this artifact prove that you can use ${topSkill} to improve ${primaryTask.toLowerCase()} in a way a business would trust?`,
    sections,
    checklist,
    sample_metrics: [
      `Time or cycle-time change tied to ${primaryTask.toLowerCase()}`,
      `Quality or revision reduction connected to ${metricPrompt.toLowerCase()}`,
      `Decision-readiness signal that shows how ${secondSkill.toLowerCase()} improved the outcome`,
    ],
    good_looks_like: {
      credible: `A compact artifact with one real business problem, one measured improvement, and one clear explanation of why it matters for ${targetRole}.`,
      standout: `A decision-ready artifact that shows the redesigned workflow, the review logic, and the business outcome in a format another team could actually reuse.`,
    },
    common_mistakes: [
      'Showing only the tool prompt without the workflow or decision context.',
      'Describing learning effort without naming the business impact.',
      'Making the artifact too broad instead of solving one visible problem well.',
    ],
    first_action: firstAction,
    share_prompt: sharePrompt,
    proof_state_read: proofAction,
  };

  return {
    ...builder,
    ...buildProofAssetVersions(builder, reportData, targetRole),
  };
}

function buildStayProofAssetBuilder(reportData) {
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const profile = reportData?.profile || {};
  const locale = reportData?.locale || profile?.locale || 'en';
  const jobTitle = profile?.job_title || profile?.jobTitle || 'your role';
  const industry = profile?.industry || 'your industry';
  const roleFamily = inferRoleFamilyFromProfile(jobTitle, industry, profile?.tasks || [], profile?.clarifiers || null);
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'your highest-visibility workflow';
  const title = stayAndAdvance?.thirty_day_plan?.proof_asset?.title || blueprint.proofAsset || 'Internal AI leverage case';
  const targetRole = stayAndAdvance?.promotion_path?.next_title || blueprint.nextTitle || 'the stronger version of your current role';
  const metric = stayAndAdvance?.thirty_day_plan?.metric_to_move || blueprint.metric || 'one visible operating metric';
  const proofState = getProofState(profile);
  const proofAction = proofStateActionLabel(proofState);

  let objective = stayAndAdvance?.thirty_day_plan?.proof_asset?.description || `Show how you redesigned ${primaryTask.toLowerCase()} with AI in a way leadership can connect to promotion-ready leverage.`;
  let sections = [
    `Current friction: map where ${primaryTask.toLowerCase()} loses time, context, or decision quality today.`,
    'AI-assisted redesign: show what AI does, what you review, and where judgment stays human.',
    `Measured outcome: tie the result to ${metric.toLowerCase()}.`,
    'Leadership readout: explain what this changes for the team, not just for your own workload.',
    `Next-scope ask: name the broader workflow, pilot, or process you are ready to own next as ${targetRole}.`,
  ];
  let checklist = [
    'Focuses on one workflow that leadership already cares about.',
    'Shows review controls, quality thresholds, and risk management clearly.',
    'Connects AI usage to a team or business outcome, not just efficiency.',
    `Makes a direct case for the next title: ${targetRole}.`,
    'Can be shared as a one-page case, deck slide, or manager memo.',
  ];
  let firstAction = `Spend 60 minutes picking one workflow around ${primaryTask.toLowerCase()} and writing the before/after operating steps on a single page.`;
  let sharePrompt = `I’ve redesigned ${primaryTask.toLowerCase()} with AI so the team can move faster without lowering quality. What would make this strong enough to justify broader ownership?`;

  if (proofState === 'internal_project') {
    objective = `Package one internal project into promotion-ready proof that you can already own broader scope around ${primaryTask.toLowerCase()}.`;
    sections = [
      'Source project: choose the internal project leadership already recognizes.',
      `Reframe: show how the project improved ${primaryTask.toLowerCase()} through better workflow judgment, not just more effort.`,
      'Controls: add the review logic, risk checks, and human decisions that made the change trustworthy.',
      `Measured outcome: tie the project to ${metric.toLowerCase()} or another visible operating result.`,
      `Promotion read: explain why this makes you ready for ${targetRole}.`,
    ];
    checklist = [
      'Starts from a real internal project that already happened.',
      'Shows leadership-facing business impact, not only personal productivity.',
      'Includes one operating or team-level outcome.',
      `Connects directly to the next title: ${targetRole}.`,
      'Can be discussed clearly in a 1:1 or review meeting.',
    ];
    firstAction = 'Spend 60 minutes choosing the internal project with the clearest leadership-visible result and rewriting it as a promotion case.';
    sharePrompt = `I already have an internal project that shows stronger scope. What would make it convincing enough for a manager to trust me with more ownership?`;
  } else if (proofState === 'dashboard_or_analysis') {
    objective = `Turn an existing dashboard or analysis into a promotion-ready operating case for ${targetRole}.`;
    sections = [
      'Existing analysis: show the dashboard or analysis you already own.',
      `Decision layer: explain what operating decision it now supports and how it improves ${primaryTask.toLowerCase()}.`,
      'Controls: document assumptions, review steps, and where you challenged the output.',
      `Measured outcome: connect it to ${metric.toLowerCase()} or a team-level decision signal.`,
      `Promotion read: explain why this is broader-scope work for ${targetRole}.`,
    ];
    checklist = [
      'Starts from a real analysis or dashboard.',
      'Adds operating judgment and leadership relevance.',
      'Shows what changed because of the analysis.',
      'Names the next scope this enables you to own.',
      'Reads like a promotion case, not just a reporting artifact.',
    ];
    firstAction = 'Spend 60 minutes rewriting one existing analysis so the leadership decision and team impact are obvious in the first section.';
    sharePrompt = `I’ve upgraded an existing analysis into a stronger promotion case. What would make the leadership value clearer or more persuasive?`;
  } else if (proofState === 'workflow_or_playbook') {
    objective = `Package an existing workflow or playbook as evidence that you can scale better operating practice as ${targetRole}.`;
    sections = [
      'Workflow baseline: map the original process and the friction it created.',
      `Operating redesign: show the workflow or playbook you built and how it improves ${primaryTask.toLowerCase()}.`,
      'Controls: document ownership, review rules, and adoption safeguards.',
      `Measured outcome: connect the change to ${metric.toLowerCase()} or reuse by teammates.`,
      `Promotion read: explain why this shows readiness for ${targetRole}.`,
    ];
    checklist = [
      'Starts from a workflow or playbook that already exists.',
      'Shows repeatability, not just a one-time improvement.',
      'Includes one adoption or reuse signal.',
      'Ties the workflow change to team leverage.',
      'Makes the next scope ask explicit.',
    ];
    firstAction = 'Spend 60 minutes tightening the strongest existing workflow or playbook into a one-page promotion-ready case.';
    sharePrompt = `I already have a reusable workflow/playbook. What would make it strong enough to support a broader-scope conversation with leadership?`;
  } else if (proofState === 'portfolio_or_case_study') {
    objective = `Upgrade an existing case study into a promotion-ready AI leverage story for ${targetRole}.`;
    sections = [
      'Original case: summarize the current case study and the business problem it solved.',
      `Upgrade: sharpen the case so the operating leverage around ${primaryTask.toLowerCase()} is obvious.`,
      'Controls: add the judgment, review, and stakeholder handling that made it safe to use.',
      `Measured outcome: tie it to ${metric.toLowerCase()} or a related operating signal.`,
      `Promotion read: explain the broader ownership this should justify as ${targetRole}.`,
    ];
    checklist = [
      'Starts from an existing case study or portfolio asset.',
      'Shows team-level leverage, not only good storytelling.',
      'Includes one measurable operating result.',
      'Names the next-scope ask clearly.',
      'Feels ready to share with a manager or skip-level leader now.',
    ];
    firstAction = 'Spend 60 minutes tightening the best existing case study so the leadership signal and next-scope ask are obvious in under three minutes.';
    sharePrompt = `I already have a case study. What would make it read like promotion evidence instead of just a nice project?`;
  }

  return {
    title,
    target_role: targetRole,
    objective,
    audience: `Your manager, skip-level leader, or cross-functional partner deciding whether you can own broader scope inside ${industry}.`,
    business_question: `How does this case prove that you can redesign ${primaryTask.toLowerCase()} with AI in a way that improves team leverage, not just personal speed?`,
    sections,
    checklist,
    sample_metrics: [
      metric,
      'Adoption rate or reuse by teammates',
      'Change in turnaround time, revision load, or decision-readiness',
    ],
    good_looks_like: {
      credible: 'A before/after workflow case with one clear operating metric, one control step, and one sentence explaining why the team now runs better.',
      standout: 'A repeatable operating playbook that another teammate could adopt, with evidence that leadership should trust you with broader process ownership.',
    },
    common_mistakes: [
      'Talking only about the tool instead of the operating change.',
      'Showing a solo productivity win that does not help the team.',
      'Leaving out the risk, review, or quality safeguards.',
    ],
    first_action: firstAction,
    share_prompt: sharePrompt,
    proof_state_read: proofAction,
    internal_version: {
      title: `${title} for promotion conversations`,
      use_case: 'Bring this to a 1:1 or team review to make the case that you should own broader process or AI adoption scope.',
      emphasis: [
        'Lead with business impact and risk control.',
        'Show that the workflow can be repeated by the team.',
        `End by naming the next scope you want to own as ${targetRole}.`,
      ],
    },
    external_version: {
      title: `${title} for external opportunities`,
      use_case: 'Use the same case externally to show how you already operate above your current title.',
      emphasis: [
        'Frame it as a system you designed, not just a task you completed.',
        'Show the metric, workflow logic, and leadership communication in one story.',
        'Translate the case into business-language outcomes, not tool-language outputs.',
      ],
    },
  };
}

function buildAiLeveragePlaybook(reportData) {
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const profile = reportData?.profile || {};
  const locale = reportData?.locale || profile?.locale || 'en';
  const jobTitle = profile?.job_title || profile?.jobTitle || 'your role';
  const industry = profile?.industry || 'your industry';
  const roleFamily = inferRoleFamilyFromProfile(jobTitle, industry, profile?.tasks || [], profile?.clarifiers || null);
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);
  const primaryTasks = normalizeArray(profile?.primary_tasks).length ? normalizeArray(profile?.primary_tasks) : normalizeArray(profile?.tasks);
  const [anchorTask, secondaryTask, tertiaryTask] = getRoleTaskAnchors(profile);

  const roleSpecificPlays = {
    legal: [
      {
        title: 'Own contract intake triage',
        workflow: `Redesign ${anchorTask.toLowerCase()} into a cleaner AI-assisted intake, categorization, and escalation workflow.`,
        ai_role: 'Use AI for first-pass issue tagging, clause clustering, and request summarization.',
        human_checkpoint: 'You keep approval logic, risk judgment, and escalation thresholds.',
        business_impact: 'Legal reviews move faster because incoming work is cleaner and easier to route.',
        what_to_share: 'A one-page intake map showing faster routing, better request quality, and lower review friction.',
      },
      {
        title: 'Build a clause and policy reuse layer',
        workflow: `Turn ${secondaryTask.toLowerCase()} into a reusable knowledge workflow for common requests, policy answers, or clause guidance.`,
        ai_role: 'Use AI to draft first-pass summaries and retrieval views from prior approved materials.',
        human_checkpoint: 'You validate legal accuracy, exceptions, and edge-case handling.',
        business_impact: 'The team answers repeat questions faster without sacrificing legal confidence.',
        what_to_share: 'A clause or policy playbook that shows where AI speeds retrieval and where human review stays mandatory.',
      },
      {
        title: 'Lead legal workflow governance',
        workflow: `Create a visible review rhythm around ${tertiaryTask.toLowerCase()} so legal requests, turnaround, and exceptions are easier to measure.`,
        ai_role: 'Use AI to summarize bottlenecks, recurring request types, and handoff friction.',
        human_checkpoint: 'You decide which operational changes to standardize and which risks require tighter review.',
        business_impact: 'Leadership sees legal ops as a scalable operating layer, not just a queue.',
        what_to_share: 'A monthly governance snapshot with throughput, exception themes, and next workflow fixes.',
      },
    ],
    procurement: [
      {
        title: 'Create supplier triage and comparison systems',
        workflow: `Turn ${anchorTask.toLowerCase()} into a standardized AI-assisted supplier review and comparison process.`,
        ai_role: 'Use AI to structure vendor notes, score comparison criteria, and draft decision summaries.',
        human_checkpoint: 'You keep supplier judgment, trade-off calls, and final recommendations.',
        business_impact: 'Stakeholders get faster sourcing decisions with clearer comparisons.',
        what_to_share: 'A supplier comparison pack with one recommendation memo and one repeatable scorecard.',
      },
      {
        title: 'Own procurement decision communication',
        workflow: `Use ${secondaryTask.toLowerCase()} to produce faster sourcing readouts and recommendation briefs for business partners.`,
        ai_role: 'Use AI for first-pass analysis, summary drafting, and scenario framing.',
        human_checkpoint: 'You refine the recommendation, risks, and stakeholder trade-offs.',
        business_impact: 'Procurement starts looking like decision support, not just process handling.',
        what_to_share: 'A sourcing review deck or memo that translates supplier data into a business decision.',
      },
      {
        title: 'Lead procurement operating cadence',
        workflow: `Standardize ${tertiaryTask.toLowerCase()} into a visible operating rhythm for follow-ups, approvals, and sourcing pipeline health.`,
        ai_role: 'Use AI to summarize outstanding actions, recurring blockers, and vendor-risk patterns.',
        human_checkpoint: 'You choose the priorities and escalation path.',
        business_impact: 'The team spends less time chasing updates and more time moving sourcing decisions forward.',
        what_to_share: 'A procurement operating dashboard with one visible metric that leadership cares about.',
      },
    ],
    education: [
      {
        title: 'Redesign learning production workflows',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted content, QA, and update workflow.`,
        ai_role: 'Use AI to draft first versions, spot coverage gaps, and accelerate revisions.',
        human_checkpoint: 'You keep instructional quality, learner context, and final approval.',
        business_impact: 'Programs update faster without lowering quality.',
        what_to_share: 'A learning production workflow showing shorter update cycles and clearer QA checkpoints.',
      },
      {
        title: 'Own learning ops and adoption reporting',
        workflow: `Use ${secondaryTask.toLowerCase()} to create decision-ready learning performance and adoption reviews.`,
        ai_role: 'Use AI to summarize learner feedback, completion patterns, and friction themes.',
        human_checkpoint: 'You interpret what should change in the program and where stakeholders should act.',
        business_impact: 'Learning work becomes easier to tie to adoption, onboarding, or performance outcomes.',
        what_to_share: 'A learning ops scorecard with adoption trends, friction points, and next recommendations.',
      },
      {
        title: 'Lead enablement system design',
        workflow: `Turn ${tertiaryTask.toLowerCase()} into a scalable enablement system with reusable prompts, templates, and review rules.`,
        ai_role: 'Use AI to accelerate draft creation, role-based tailoring, and content synthesis.',
        human_checkpoint: 'You own audience fit, sequencing, and program governance.',
        business_impact: 'The team depends less on manual content churn and more on reusable systems.',
        what_to_share: 'A system map that shows how programs are created, reviewed, updated, and measured.',
      },
    ],
    marketing: [
      {
        title: 'Own campaign workflow design',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted planning, drafting, and QA workflow that increases experiment velocity.`,
        ai_role: 'Use AI to structure briefs, synthesize inputs, and accelerate first-pass creative or campaign planning.',
        human_checkpoint: 'You keep targeting decisions, quality judgment, and final go/no-go control.',
        business_impact: 'Marketing work moves faster without losing brand context or channel judgment.',
        what_to_share: 'A before/after campaign workflow showing faster planning, clearer reviews, and one metric that moved.',
      },
      {
        title: 'Translate performance into decisions',
        workflow: `Use ${secondaryTask.toLowerCase()} to produce AI-assisted performance narratives leaders can act on earlier.`,
        ai_role: 'Use AI to summarize patterns, draft the first readout, and surface likely next questions.',
        human_checkpoint: 'You sharpen the recommendation, trade-offs, and business context.',
        business_impact: 'Your work looks more strategic because it changes decisions, not just reporting cadence.',
        what_to_share: 'A campaign or pipeline review memo that ties results to one recommendation and one next test.',
      },
      {
        title: 'Lead a reusable marketing operating pattern',
        workflow: `Turn ${tertiaryTask.toLowerCase()} into a team-level AI standard for briefs, reviews, or experiment documentation.`,
        ai_role: 'Use AI to support templates, checklists, and reusable prompt patterns.',
        human_checkpoint: 'You decide the standard, the review bar, and where exceptions still need manual handling.',
        business_impact: 'You become the person who makes AI usable for the team instead of using it privately.',
        what_to_share: 'A small marketing playbook showing the prompt pattern, review checkpoint, and metric outcome.',
      },
    ],
    analytics: [
      {
        title: 'Own analytics workflow QA',
        workflow: `Redesign ${anchorTask.toLowerCase()} into an AI-assisted analysis workflow with one explicit QA checkpoint before anything gets shared.`,
        ai_role: 'Use AI for first-pass analysis structure, anomaly summaries, and draft explanations.',
        human_checkpoint: 'You keep data validation, metric interpretation, and final recommendation quality.',
        business_impact: 'Leaders get faster insight without losing trust in the numbers.',
        what_to_share: 'A KPI review pack that shows faster analysis plus a clear QA step and business implication.',
      },
      {
        title: 'Turn dashboards into narratives',
        workflow: `Use ${secondaryTask.toLowerCase()} to convert dashboards and metrics into decision-ready narratives.`,
        ai_role: 'Use AI to prepare the first draft of trend summaries, outlier explanations, and review notes.',
        human_checkpoint: 'You refine the implication, trade-off, and next action.',
        business_impact: 'Your reporting becomes a decision-support layer rather than a passive data feed.',
        what_to_share: 'A before/after dashboard review showing how the narrative improved decision speed.',
      },
      {
        title: 'Set analytics operating standards',
        workflow: `Use ${tertiaryTask.toLowerCase()} to define a repeatable standard for AI-assisted analysis, review, and stakeholder delivery.`,
        ai_role: 'Use AI to support checklist creation, documentation, and pattern detection across recurring reviews.',
        human_checkpoint: 'You decide the QA bar, definitions, and which outputs are safe to standardize.',
        business_impact: 'You become the person who makes analytics more reliable across the team.',
        what_to_share: 'A simple analytics QA playbook with one metric, one check, and one stakeholder-facing example.',
      },
    ],
    finance: [
      {
        title: 'Redesign scenario prep',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted scenario-prep and review workflow that keeps finance judgment visible.`,
        ai_role: 'Use AI to structure scenarios, summarize assumptions, and draft the first pass of model commentary.',
        human_checkpoint: 'You keep model logic, assumption review, and business trade-off calls.',
        business_impact: 'Finance spends less time formatting and more time shaping decisions.',
        what_to_share: 'A planning review pack showing faster scenario prep and a clearer recommendation memo.',
      },
      {
        title: 'Own the finance narrative',
        workflow: `Use ${secondaryTask.toLowerCase()} to turn raw variance or planning analysis into a decision-ready business narrative.`,
        ai_role: 'Use AI for summary drafting, issue clustering, and initial recommendation framing.',
        human_checkpoint: 'You finalize the business implication, risks, and leadership takeaway.',
        business_impact: 'Leaders start seeing finance as a faster thought partner, not just a reporting function.',
        what_to_share: 'A monthly business review narrative that ties numbers to one clear operating decision.',
      },
      {
        title: 'Lead planning workflow governance',
        workflow: `Use ${tertiaryTask.toLowerCase()} to create a reusable planning rhythm with clear review checkpoints and ownership.`,
        ai_role: 'Use AI to summarize open issues, follow-ups, and repeated planning friction.',
        human_checkpoint: 'You decide which changes become standard and where extra review is needed.',
        business_impact: 'You become the operator of planning quality and decision speed.',
        what_to_share: 'A planning cadence map with owner, checkpoint, and one metric leadership cares about.',
      },
    ],
    hr: [
      {
        title: 'Own manager-support workflow design',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted manager-support workflow that handles the first pass while you keep policy judgment.`,
        ai_role: 'Use AI to structure common responses, summarize recurring themes, and route repeated questions.',
        human_checkpoint: 'You keep sensitive case handling, exceptions, and final judgment.',
        business_impact: 'HR support becomes faster and more consistent without feeling robotic.',
        what_to_share: 'A manager-support workflow showing faster first response and a clear escalation path.',
      },
      {
        title: 'Translate people patterns into action',
        workflow: `Use ${secondaryTask.toLowerCase()} to produce AI-assisted people insights leaders can actually act on.`,
        ai_role: 'Use AI to cluster patterns, draft summaries, and structure the first readout.',
        human_checkpoint: 'You interpret context, risk, and the leadership recommendation.',
        business_impact: 'People data starts driving clearer decisions instead of sitting in reactive updates.',
        what_to_share: 'A people-ops insight memo with one pattern, one recommendation, and one owner.',
      },
      {
        title: 'Lead one reusable HR workflow',
        workflow: `Use ${tertiaryTask.toLowerCase()} to standardize one AI-assisted intake, policy, or enablement workflow the team can repeat.`,
        ai_role: 'Use AI to support intake patterns, documentation, and standard response structure.',
        human_checkpoint: 'You set the review rules, privacy limits, and exception handling.',
        business_impact: 'You become the person who makes HR support more scalable across the team.',
        what_to_share: 'A reusable HR workflow playbook with one checkpoint, one metric, and one leader-facing summary.',
      },
    ],
    admin: [
      {
        title: 'Own the executive briefing workflow',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted briefing and prep workflow that reduces context gathering time.`,
        ai_role: 'Use AI to structure briefing drafts, summarize updates, and prepare first-pass meeting notes.',
        human_checkpoint: 'You keep the priority judgment, executive context, and final briefing quality.',
        business_impact: 'Leadership gets cleaner prep and faster follow-through without losing trust in the context.',
        what_to_share: 'A before/after executive prep workflow showing less scramble, clearer context, and one metric that improved.',
      },
      {
        title: 'Turn coordination into decision support',
        workflow: `Use ${secondaryTask.toLowerCase()} to convert scattered updates into faster decision-ready summaries for leadership.`,
        ai_role: 'Use AI to cluster updates, draft summaries, and prepare the first recommendation structure.',
        human_checkpoint: 'You refine the priority, nuance, and what leadership actually needs to see now.',
        business_impact: 'Your support work becomes a decision-support layer instead of invisible admin throughput.',
        what_to_share: 'A briefing memo or follow-up pack that shows faster context synthesis and clearer next actions.',
      },
      {
        title: 'Lead one reusable executive rhythm',
        workflow: `Turn ${tertiaryTask.toLowerCase()} into a reusable operating pattern for prep, follow-up, or decision capture.`,
        ai_role: 'Use AI to support checklists, draft notes, and recurring documentation.',
        human_checkpoint: 'You decide the sequence, owner, and the executive-sensitive exceptions.',
        business_impact: 'You become the person who makes executive work smoother and more scalable across the team.',
        what_to_share: 'A lightweight executive operating playbook with one trigger, one owner, and one visible business benefit.',
      },
    ],
    customer: [
      {
        title: 'Own renewal and risk prep',
        workflow: `Redesign ${anchorTask.toLowerCase()} into an AI-assisted renewal, onboarding, or account-health workflow that surfaces risk earlier.`,
        ai_role: 'Use AI to structure account notes, summarize risk signals, and prepare the first pass of next-step planning.',
        human_checkpoint: 'You keep customer judgment, relationship context, and the final success plan.',
        business_impact: 'Teams act earlier on risk and expansion because prep is faster and more consistent.',
        what_to_share: 'A customer workflow showing faster risk review and a more consistent next-action plan.',
      },
      {
        title: 'Turn account context into decisions',
        workflow: `Use ${secondaryTask.toLowerCase()} to create AI-assisted account narratives that help teams prioritize action.`,
        ai_role: 'Use AI to cluster themes, summarize interactions, and draft the first review note.',
        human_checkpoint: 'You sharpen the priority, risk framing, and commercial recommendation.',
        business_impact: 'Customer work becomes a commercial signal layer, not just reactive coordination.',
        what_to_share: 'An account review memo that ties health signals to one concrete next move.',
      },
      {
        title: 'Lead a reusable customer workflow',
        workflow: `Turn ${tertiaryTask.toLowerCase()} into a team-level AI standard for onboarding, renewals, or escalation handoffs.`,
        ai_role: 'Use AI to support checklists, templates, and repeated prep work.',
        human_checkpoint: 'You set the standard, the review threshold, and the customer-sensitive exceptions.',
        business_impact: 'You become the adoption layer that makes customer workflows more scalable across the team.',
        what_to_share: 'A small customer workflow playbook with owner, prompt pattern, and metric to watch.',
      },
    ],
    operations: [
      {
        title: 'Redesign intake and coordination flow',
        workflow: `Turn ${anchorTask.toLowerCase()} into an AI-assisted intake, routing, and follow-up workflow with clear exception handling.`,
        ai_role: 'Use AI to structure requests, draft status updates, and reduce repeated first-pass coordination work.',
        human_checkpoint: 'You keep exception logic, prioritization, and stakeholder judgment.',
        business_impact: 'Operations becomes more reliable because the workflow is cleaner, not just faster.',
        what_to_share: 'A before/after intake or coordination flow with fewer follow-ups and one clearer metric.',
      },
      {
        title: 'Make status reporting decision-ready',
        workflow: `Use ${secondaryTask.toLowerCase()} to turn status noise into AI-assisted operating reviews with one clear recommendation.`,
        ai_role: 'Use AI to summarize blockers, cluster delays, and draft the first readout.',
        human_checkpoint: 'You refine the actual bottleneck, trade-off, and next action.',
        business_impact: 'Stakeholders get fewer updates and better decisions.',
        what_to_share: 'An operating review that shows how a cleaner narrative improved action speed.',
      },
      {
        title: 'Lead workflow governance',
        workflow: `Use ${tertiaryTask.toLowerCase()} to standardize one recurring workflow the team can repeat safely.`,
        ai_role: 'Use AI to support checklists, SOP drafting, and repeated documentation.',
        human_checkpoint: 'You decide the control points, owner, and exception path.',
        business_impact: 'You shift from manual coordination into system design for the team.',
        what_to_share: 'A workflow playbook with trigger, owner, review checkpoint, and metric.',
      },
    ],
    general: [
      {
        title: 'Redesign one recurring workflow',
        workflow: `Take ${anchorTask.toLowerCase()} and redesign it so AI handles first-pass work while you own review and judgment.`,
        ai_role: 'Use AI for first drafts, summaries, or structure.',
        human_checkpoint: 'You keep the quality bar, stakeholder context, and final call.',
        business_impact: 'You become the person who redesigns throughput instead of simply producing more output.',
        what_to_share: 'A before/after workflow map with one metric and one review control.',
      },
      {
        title: 'Turn output into decision support',
        workflow: `Use ${secondaryTask.toLowerCase()} to produce clearer recommendations and faster decision-ready updates.`,
        ai_role: 'Use AI to prepare analysis, summaries, or recommendation structure.',
        human_checkpoint: 'You refine trade-offs, priority calls, and final recommendations.',
        business_impact: 'Your work starts looking more strategic because it shapes decisions, not just tasks.',
        what_to_share: 'A decision memo or readout that shows speed plus judgment.',
      },
      {
        title: 'Lead one visible adoption pattern',
        workflow: `Turn ${tertiaryTask.toLowerCase()} into a team-level AI pilot, standard, or review pattern other people can follow.`,
        ai_role: 'Use AI to support documentation, pattern recognition, and operating guidance.',
        human_checkpoint: 'You decide what becomes standard and how risk is controlled.',
        business_impact: 'You become the adoption layer for your team instead of a solo power user.',
        what_to_share: 'A simple team playbook showing what changed, what to repeat, and what to avoid.',
      },
    ],
  };

  const plays = roleSpecificPlays[roleFamily] || roleSpecificPlays.general;

  return {
    headline: `How to use AI to get stronger inside ${jobTitle}`,
    operator_shift: stayAndAdvance?.recommendation || 'Shift from raw execution into workflow ownership, decision support, and visible AI leverage.',
    plays,
    weekly_operating_system: [
      'Spend one hour mapping workflow friction before reaching for a new tool.',
      'Ship one visible improvement every week, even if the artifact is small.',
      'Translate every AI win into business language: time, quality, risk, or decision speed.',
      'Document the pattern so other people can reuse it and leadership can see scope, not just effort.',
    ],
    promotion_signals: normalizeArray(stayAndAdvance?.promotion_path?.signals_to_build).length
      ? normalizeArray(stayAndAdvance?.promotion_path?.signals_to_build)
      : [
          'You are redesigning how work gets done, not just using AI privately.',
          'Other people can reuse the workflow or playbook you built.',
          'Leadership can connect the change to one operating metric or business outcome.',
        ],
  };
}

function buildPromotionConversationPack(reportData) {
  const stayAndAdvance = reportData?.stay_and_advance || {};
  const profile = reportData?.profile || {};
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'one important workflow';
  const targetRole = stayAndAdvance?.promotion_path?.next_title || 'the stronger version of your current role';
  const proofTitle = stayAndAdvance?.thirty_day_plan?.proof_asset?.title || 'your internal AI leverage case';
  const metric = stayAndAdvance?.thirty_day_plan?.metric_to_move || 'one visible operating metric';

  return {
    meeting_goal: `Position yourself as the person who should own broader AI-enabled scope on the path to ${targetRole}.`,
    talk_track: [
      `I picked ${primaryTask.toLowerCase()} because it was a workflow where speed, quality, and coordination were all under pressure.`,
      `I redesigned the workflow so AI handles first-pass work while I keep the judgment, review, and exception handling.`,
      `The result is ${proofTitle.toLowerCase()}, which shows the operating change and the effect on ${metric.toLowerCase()}.`,
      `I want to use this as the starting point for broader ownership so the team can reuse the pattern instead of keeping it as a one-off.`,
    ],
    evidence_to_bring: [
      proofTitle,
      `One before/after snapshot tied to ${metric.toLowerCase()}`,
      'One workflow map or SOP showing what changed',
      'One list of where the pattern could be reused next',
    ],
    ask: `Ask for ownership of one broader workflow, pilot, or operating rhythm that moves you toward ${targetRole}.`,
    manager_script: `I’ve been redesigning ${primaryTask.toLowerCase()} with AI so the team gets more speed without giving up quality. I’d like to show you the case, the workflow changes, and where I think I can own more of this pattern going forward.`,
    what_not_to_say: [
      'Do not pitch this as “I found a cool AI tool.”',
      'Do not frame it as a personal productivity hack with no team value.',
      'Do not ask for a promotion before showing the workflow, metric, and evidence.',
    ],
    next_scope_options: [
      `Own the next workflow adjacent to ${primaryTask.toLowerCase()}`,
      'Become the review or governance point for AI-assisted output in your lane',
      'Lead a small repeatable pilot another teammate can adopt',
    ],
  };
}

function buildPaidValueSummary(reportData) {
  const recommendationStack = reportData?.recommendation_stack || {};
  const primary = recommendationStack.primary || null;
  const pivot = normalizeArray(reportData?.pivots)[0] || {};
  const first30Days = reportData?.first_30_days || {};
  const proofAsset = primary?.proof_asset || first30Days?.proof_asset?.title || `${pivot.title || 'Target role'} proof asset`;
  const recommendedMove = primary?.type === 'stay'
    ? `Stay in your lane and build toward ${primary.title}`
    : reportData?.decision?.headline || `Move toward ${primary?.title || pivot.title || 'the strongest pivot path'}`;
  const headline = primary?.type === 'stay'
    ? `Your best move: strengthen your current role into ${primary.title || 'a stronger next version'}`
    : `Your best move: ${primary?.title || pivot.title || 'build a more resilient next role'}`;

  return {
    headline,
    recommended_move: recommendedMove,
    why_this_move: primary?.why || pivot.ranking_reason || pivot.fit_summary || reportData?.decision?.rationale || '',
    confidence_label: primary?.confidence_label || reportData?.decision?.confidence_label || (pivot.live_market_signal?.profile_fit_score ? 'Market-informed' : 'Model-led, verify with postings'),
    market_evidence: primary?.market_evidence || summarizeMarketEvidence(pivot),
    first_proof_asset: proofAsset,
    first_learning_step: primary?.learning_focus || getFirstLearningStep(pivot, reportData?.profile || null),
    avoid: normalizeArray(first30Days?.avoid)[0] || 'Do not collect certificates without producing one visible proof asset.',
  };
}

function addPaidValueFields(reportData) {
  if (!reportData || typeof reportData !== 'object') return reportData;
  const withBuilder = {
    ...reportData,
    pivots: normalizeArray(reportData.pivots).map((pivot) => ({
      ...pivot,
      learning_path: buildLearningPath(pivot?.skill_gaps, reportData?.profile || null),
    })),
    stay_path: reportData.stay_path && typeof reportData.stay_path === 'object'
      ? {
          ...reportData.stay_path,
          learning_path: buildLearningPath(reportData.stay_path?.skill_gaps, reportData?.profile || null),
        }
      : reportData.stay_path,
    stay_and_advance: reportData.stay_and_advance && typeof reportData.stay_and_advance === 'object'
      ? {
          ...reportData.stay_and_advance,
          ai_leverage_playbook: reportData.stay_and_advance.ai_leverage_playbook && typeof reportData.stay_and_advance.ai_leverage_playbook === 'object'
            ? { ...reportData.stay_and_advance.ai_leverage_playbook, ...buildAiLeveragePlaybook(reportData) }
            : buildAiLeveragePlaybook(reportData),
          role_operating_system: reportData.stay_and_advance.role_operating_system && typeof reportData.stay_and_advance.role_operating_system === 'object'
            ? { ...reportData.stay_and_advance.role_operating_system, ...buildStayOperatingSystem(reportData) }
            : buildStayOperatingSystem(reportData),
          ai_this_week_plan: reportData.stay_and_advance.ai_this_week_plan && typeof reportData.stay_and_advance.ai_this_week_plan === 'object'
            ? { ...reportData.stay_and_advance.ai_this_week_plan, ...buildAiThisWeekPlan(reportData) }
            : buildAiThisWeekPlan(reportData),
          promotion_conversation_pack: reportData.stay_and_advance.promotion_conversation_pack && typeof reportData.stay_and_advance.promotion_conversation_pack === 'object'
            ? { ...reportData.stay_and_advance.promotion_conversation_pack, ...buildPromotionConversationPack(reportData) }
            : buildPromotionConversationPack(reportData),
        }
      : reportData.stay_and_advance,
    proof_asset_builder: reportData.proof_asset_builder && typeof reportData.proof_asset_builder === 'object'
      ? { ...reportData.proof_asset_builder, ...buildProofAssetBuilder(reportData) }
      : buildProofAssetBuilder(reportData),
    stay_proof_asset_builder: reportData.stay_proof_asset_builder && typeof reportData.stay_proof_asset_builder === 'object'
      ? { ...reportData.stay_proof_asset_builder, ...buildStayProofAssetBuilder(reportData) }
      : buildStayProofAssetBuilder(reportData),
  };

  const recommendationStack = buildRecommendationStack(withBuilder);
  const withRecommendationStack = alignFirst30DaysWithRecommendation({
    ...withBuilder,
    recommendation_stack: recommendationStack,
    decision: buildDecisionFromRecommendationStack(withBuilder, recommendationStack),
  });

  return {
    ...withRecommendationStack,
    paid_value_summary: withRecommendationStack.paid_value_summary && typeof withRecommendationStack.paid_value_summary === 'object'
      ? { ...withRecommendationStack.paid_value_summary, ...buildPaidValueSummary(withRecommendationStack) }
      : buildPaidValueSummary(withRecommendationStack),
  };
}

function refreshFinalTopPivotRankingLanguage(pivots) {
  if (!Array.isArray(pivots) || !pivots.length) return pivots;

  const [topPivot, ...rest] = pivots;
  const rankingReason = buildFinalTopPivotRankingReason(topPivot);

  return [
    {
      ...topPivot,
      ranking_reason: rankingReason,
      live_market_signal: {
        ...(topPivot.live_market_signal || {}),
        ranking_reason: rankingReason,
      },
    },
    ...rest,
  ];
}

function scoreRoleNativeTitleTieBreak(title, roleFamily) {
  const normalized = normalizeText(title);
  if (!normalized || !roleFamily) return 0;

  if (roleFamily === 'legal') {
    if (/\blegal operations analyst\b/.test(normalized)) return 14;
    if (/\blegal operations\b/.test(normalized)) return 12;
    if (/\bcontract lifecycle\b/.test(normalized)) return 10;
    if (/\bcontract operations\b/.test(normalized)) return 8;
    if (/\bcompliance operations\b/.test(normalized)) return 7;
    if (/\bstrategy consultant\b/.test(normalized)) return 2;
  }

  if (roleFamily === 'procurement') {
    if (/\bprocurement\b/.test(normalized)) return 10;
    if (/\bspend analytics\b/.test(normalized)) return 8;
    if (/\bstrategic sourcing\b/.test(normalized)) return 7;
    if (/\bsupply chain\b/.test(normalized)) return 5;
  }

  if (roleFamily === 'education') {
    if (/\bcustomer education\b/.test(normalized)) return 10;
    if (/\blearning operations\b/.test(normalized)) return 9;
    if (/\benablement program\b/.test(normalized)) return 8;
    if (/\blearning\b/.test(normalized)) return 6;
  }

  return 0;
}

function buildStayAndAdvance(profile, summary, bestPivot, locale = 'en') {
  const jobTitle = profile?.job_title || profile?.jobTitle || 'your role';
  const industry = profile?.industry || 'your industry';
  const roleFamily = inferRoleFamilyFromProfile(jobTitle, industry, profile?.tasks || [], profile?.clarifiers || null);
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);
  const goalNow = getGoalNow(profile);
  const timelineUrgency = getTimelineUrgency(profile);
  const yearsBand = getYearsExperienceBand(profile);
  const aiMaturity = getAiMaturity(profile);
  const primaryTasks = Array.isArray(profile?.primary_tasks) && profile.primary_tasks.length
    ? profile.primary_tasks
    : Array.isArray(profile?.tasks)
      ? profile.tasks.slice(0, 3)
      : [];
  const anchorTask = primaryTasks[0] || 'your highest-visibility work';
  const secondaryTask = primaryTasks[1] || 'stakeholder communication';
  const tertiaryTask = primaryTasks[2] || 'decision support';
  const calibratedNextTitle = calibrateGrowthTitleForExperience(roleFamily, yearsBand, blueprint.nextTitle || 'Stronger version of your current role');
  const urgency = timelineUrgency === 'within_3_months'
    ? 'Make this useful in the next 90 days'
    : summary?.overall_score >= 70
      ? 'Move quickly'
      : summary?.overall_score >= 45
        ? 'Start now'
        : 'Use this as an advantage';

  const localizedHeadline = locale === 'nl'
    ? 'Als je wilt blijven, gebruik AI dan om sneller richting een sterkere rol te bewegen.'
    : locale === 'de'
      ? 'Wenn du bleiben willst, nutze KI, um schneller in eine stärkere Version deiner Rolle zu wachsen.'
      : 'If you want to stay, use AI to move faster toward a stronger version of your role.';

  const localizedRecommendation = locale === 'nl'
    ? goalNow === 'stay_and_advance'
      ? 'Blijf in je vakgebied en gebruik AI om sneller zichtbaar richting bredere scope, promotiewaarde en teamleverage te bewegen.'
      : 'Blijf in je vakgebied, maar verschuif van uitvoer naar AI-gestuurde oordeelsvorming, workflowontwerp en zichtbare strategische leverage.'
    : locale === 'de'
      ? goalNow === 'stay_and_advance'
        ? 'Bleib in deinem Feld und nutze KI, um schneller in sichtbare Hebelwirkung, größere Verantwortung und Beförderungssignal zu wachsen.'
        : 'Bleib im Berufsfeld, aber verschiebe dich von reiner Ausführung hin zu KI-gestütztem Urteilsvermögen, Workflow-Design und sichtbarer strategischer Hebelwirkung.'
      : buildEnglishStayRecommendation(roleFamily, goalNow);

  const localizedRationale = locale === 'nl'
    ? `${jobTitle} hoeft niet per se een exit-signaal te zijn. De sterkste interne stap is vaak degene waarbij je AI gebruikt om ${anchorTask.toLowerCase()} sneller, scherper en beter koppelbaar aan bedrijfsbeslissingen te maken.${aiMaturityRank(aiMaturity) >= 2 ? ' Je hebt al genoeg AI-basis om dit meteen zichtbaar te maken in je werk.' : ''}`
    : locale === 'de'
      ? `${jobTitle} ist nicht automatisch ein Exit-Signal. Der stärkste interne Schritt ist oft, KI zu nutzen, um ${anchorTask.toLowerCase()} schneller, schärfer und enger an Geschäftsentscheidungen zu koppeln.${aiMaturityRank(aiMaturity) >= 2 ? ' Du hast bereits genug KI-Basis, um das sofort sichtbar in deiner Arbeit zu machen.' : ''}`
      : buildEnglishStayRationale(roleFamily, jobTitle, anchorTask, aiMaturity);

  const localizedLeverageOps = [
    {
      title: blueprint.opportunities?.[0] || (locale === 'nl' ? 'Maak repetitieve output lichter' : locale === 'de' ? 'Mache repetitive Outputs leichter' : 'Make repetitive output lighter'),
      current_work: anchorTask,
      ai_shift: locale === 'nl'
        ? `Gebruik AI om eerste versies, samenvattingen of structuur voor ${anchorTask.toLowerCase()} te produceren, zodat jij de kwaliteitscontrole en de uiteindelijke keuze houdt.`
        : locale === 'de'
          ? `Nutze KI, um erste Entwürfe, Zusammenfassungen oder Strukturen für ${anchorTask.toLowerCase()} zu erzeugen, während du Qualitätskontrolle und endgültige Entscheidungen behältst.`
          : `Use AI to draft first versions, summaries, or structure for ${anchorTask.toLowerCase()}, while you keep the quality bar and final judgment.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Leidinggevenden zien je dan niet als iemand die dezelfde output maakt, maar als iemand die throughput herontwerpt.'
        : locale === 'de'
          ? 'So wirst du nicht als jemand gesehen, der nur dieselbe Arbeit macht, sondern als jemand, der den Durchsatz neu gestaltet.'
          : 'That makes you look less like someone doing the same work and more like someone redesigning throughput.',
    },
    {
      title: blueprint.opportunities?.[1] || (locale === 'nl' ? 'Verplaats jezelf richting interpretatie' : locale === 'de' ? 'Verschiebe dich Richtung Interpretation' : 'Move yourself toward interpretation'),
      current_work: secondaryTask,
      ai_shift: locale === 'nl'
        ? `Laat AI helpen met voorbereiding rond ${secondaryTask.toLowerCase()}, maar positioneer jezelf als degene die nuance, stakeholdercontext en prioriteiten bewaakt.`
        : locale === 'de'
          ? `Lass KI bei der Vorbereitung rund um ${secondaryTask.toLowerCase()} helfen, positioniere dich aber als die Person, die Nuancen, Stakeholder-Kontext und Prioritäten steuert.`
          : `Let AI assist with preparation around ${secondaryTask.toLowerCase()}, but position yourself as the person who owns nuance, stakeholder context, and prioritization.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Dat duwt je rol omhoog van uitvoering naar oordeel en advies.'
        : locale === 'de'
          ? 'So verschiebt sich deine Rolle von Ausführung hin zu Urteilsvermögen und Beratung.'
          : 'That pushes your role upward from execution into judgment and recommendation.',
    },
    {
      title: blueprint.opportunities?.[2] || (locale === 'nl' ? 'Word de AI-adoptielaag in je team' : locale === 'de' ? 'Werde die KI-Adoptionsschicht in deinem Team' : 'Become the AI adoption layer for your team'),
      current_work: tertiaryTask,
      ai_shift: locale === 'nl'
        ? `Gebruik ${tertiaryTask.toLowerCase()} als ingang om één AI-pilot, reviewproces of teamworkflow zichtbaar te verbeteren.`
        : locale === 'de'
          ? `Nutze ${tertiaryTask.toLowerCase()} als Einstieg, um einen KI-Piloten, Review-Prozess oder Team-Workflow sichtbar zu verbessern.`
          : `Use ${tertiaryTask.toLowerCase()} as the entry point to improve one AI pilot, review process, or team workflow in a visible way.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Zo word je degene die verandering veiliger en bruikbaarder maakt, niet degene die door verandering wordt ingehaald.'
        : locale === 'de'
          ? 'So wirst du die Person, die Veränderung sicherer und nützlicher macht, statt von ihr überholt zu werden.'
          : 'That makes you the person who makes change safer and more useful, instead of the person change happens to.',
    },
  ];

  return {
    headline: localizedHeadline,
    recommendation: localizedRecommendation,
    rationale: localizedRationale,
    urgency_label: urgency,
    leverage_opportunities: localizedLeverageOps,
    promotion_path: {
      next_title: calibratedNextTitle || (locale === 'nl' ? 'Sterkere variant van je huidige rol' : locale === 'de' ? 'Stärkere Version deiner aktuellen Rolle' : 'Stronger version of your current role'),
      why_it_opens: locale === 'nl'
        ? `De volgende promotiestap in ${industry} gaat waarschijnlijk naar mensen die AI gebruiken om snelheid, besliskwaliteit en zichtbare leverage te verhogen, niet alleen output te verhogen.`
        : locale === 'de'
          ? `Der nächste Karriereschritt in ${industry} geht wahrscheinlich an Menschen, die KI nutzen, um Geschwindigkeit, Entscheidungsqualität und sichtbare Hebelwirkung zu erhöhen, nicht nur Output.`
          : `The next promotion step in ${industry} is likely to go to people who use AI to improve speed, decision quality, and visible leverage, not just produce more output.`,
      timeline: summary?.overall_score >= 70 ? '6-12 months' : '3-9 months',
      signals_to_build: [
        locale === 'nl' ? 'Laat een AI-gestuurde workflowverbetering zien met meetbaar effect' : locale === 'de' ? 'Zeige eine KI-gestützte Workflow-Verbesserung mit messbarer Wirkung' : 'Show one AI-assisted workflow improvement with measurable impact',
        locale === 'nl' ? 'Word de persoon die output van tools beoordeelt en standaardiseert' : locale === 'de' ? 'Werde die Person, die Tool-Output bewertet und standardisiert' : 'Become the person who evaluates and standardizes tool output',
        locale === 'nl' ? 'Vertaal AI-gebruik naar leiderschapstaal: tijd, kwaliteit, risico, throughput' : locale === 'de' ? 'Übersetze KI-Nutzung in Führungssprache: Zeit, Qualität, Risiko, Durchsatz' : 'Translate AI usage into leadership language: time, quality, risk, throughput',
      ],
    },
    work_redesign: {
      automate: [anchorTask],
      augment: [secondaryTask],
      protect: [
        locale === 'nl' ? 'Stakeholderoordeel en prioritering' : locale === 'de' ? 'Stakeholder-Urteil und Priorisierung' : 'Stakeholder judgment and prioritization',
        locale === 'nl' ? 'Kwaliteitscontrole bij output met hoge impact' : locale === 'de' ? 'Qualitätskontrolle bei hochwirksamen Ergebnissen' : 'Quality control on high-stakes output',
      ],
      lead: [
        locale === 'nl' ? 'AI-pilots of teamadoptie' : locale === 'de' ? 'KI-Piloten oder Teamadoption' : 'AI pilots or team adoption',
        locale === 'nl' ? 'Nieuwe workflows of reviewstandaarden' : locale === 'de' ? 'Neue Workflows oder Review-Standards' : 'New workflows or review standards',
      ],
    },
    thirty_day_plan: {
      this_week: [
        locale === 'nl' ? `Kies één taak, te beginnen met ${anchorTask.toLowerCase()}, en herbouw die met AI.` : locale === 'de' ? `Wähle eine Aufgabe, beginnend mit ${anchorTask.toLowerCase()}, und baue sie mit KI neu auf.` : `Choose one task, starting with ${anchorTask.toLowerCase()}, and rebuild it with AI.`,
        locale === 'nl' ? 'Meet tijdswinst, kwaliteitsrisico en waar menselijk oordeel nog nodig was.' : locale === 'de' ? 'Miss Zeitgewinn, Qualitätsrisiko und wo menschliches Urteil noch nötig war.' : 'Measure time saved, quality risk, and where human judgment still had to step in.',
      ],
      this_month: [
        locale === 'nl' ? 'Presenteer één kleine AI-werkflowverbetering aan je manager of team.' : locale === 'de' ? 'Präsentiere deinem Manager oder Team eine kleine KI-Workflow-Verbesserung.' : 'Present one small AI workflow improvement to your manager or team.',
        locale === 'nl' ? 'Documenteer voor-na impact zodat het als promotiesignaal werkt.' : locale === 'de' ? 'Dokumentiere den Vorher-Nachher-Effekt, damit er als Karrieresignal wirkt.' : 'Document before/after impact so it becomes promotion evidence.',
      ],
      metric_to_move: locale === 'nl'
        ? blueprint.metric || 'Kies één metric: doorlooptijd, revisies, foutpercentage of briefingkwaliteit.'
        : locale === 'de'
          ? blueprint.metric || 'Wähle eine Kennzahl: Durchlaufzeit, Revisionen, Fehlerquote oder Briefing-Qualität.'
          : blueprint.metric || 'Choose one metric to move: turnaround time, revisions, error rate, or briefing quality.',
      leadership_narrative: locale === 'nl'
        ? blueprint.narrative || `Positioneer dit als: "Ik gebruik AI niet alleen om sneller te werken, maar om ${jobTitle.toLowerCase()} betrouwbaarder en strategischer te maken."`
        : locale === 'de'
          ? blueprint.narrative || `Positioniere es so: "Ich nutze KI nicht nur, um schneller zu arbeiten, sondern um ${jobTitle.toLowerCase()} verlässlicher und strategischer zu machen."`
          : blueprint.narrative || `Position this as: "I am not just using AI to work faster. I am using it to make ${jobTitle.toLowerCase()} more reliable and more strategic."`,
      proof_asset: {
        title: blueprint.proofAsset || (locale === 'nl' ? 'Interne AI-leverage case' : locale === 'de' ? 'Interner KI-Leverage-Case' : 'Internal AI leverage case'),
        description: locale === 'nl'
          ? 'Een korte voor-na casus die laat zien hoe je één taak met AI hebt herontworpen en wat dat deed voor tijd, kwaliteit of besluitvorming.'
          : locale === 'de'
            ? 'Ein kurzer Vorher-Nachher-Case, der zeigt, wie du eine Aufgabe mit KI neu gestaltet hast und was das für Zeit, Qualität oder Entscheidungen gebracht hat.'
            : 'A short before/after case showing how you redesigned one task with AI and what that changed in time, quality, or decision support.',
        why_it_matters: locale === 'nl'
          ? 'Dit geeft leiders bewijs dat jij niet alleen AI gebruikt, maar ook teamleverage creëert.'
          : locale === 'de'
            ? 'Das gibt Führungskräften Beweis, dass du KI nicht nur nutzt, sondern Team-Leverage schaffst.'
            : 'This gives leadership evidence that you are not just using AI, but creating leverage for the team.',
      },
    },
    ai_leverage_playbook: {
      headline: '',
      operator_shift: '',
      plays: [],
      weekly_operating_system: [],
      promotion_signals: [],
    },
    promotion_conversation_pack: {
      meeting_goal: '',
      talk_track: [],
      evidence_to_bring: [],
      ask: '',
      manager_script: '',
      what_not_to_say: [],
      next_scope_options: [],
    },
  };
}

function buildStayAdvanceSkillGaps(profile, stayAndAdvance, basePivot, locale = 'en') {
  const roleFamily = inferRoleFamilyFromProfile(
    profile?.job_title || profile?.jobTitle || '',
    profile?.industry || '',
    profile?.tasks || [],
    profile?.clarifiers || null
  );
  const [primaryTask] = getRoleTaskAnchors(profile);
  const resources = buildStayLearningResources(roleFamily, profile);
  const englishBlueprints = locale === 'en'
    ? buildEnglishStaySkillBlueprints(roleFamily, profile)
    : null;

  const localized = {
    workflow: englishBlueprints?.workflow || (locale === 'nl'
      ? {
          name: 'AI-workflowontwerp',
          current: `Je kent ${primaryTask.toLowerCase()} al goed vanuit de praktijk.`,
          required: 'Je kunt een duidelijke AI-ondersteunde workflow ontwerpen, reviewen en documenteren.',
          why: 'Interne promoties gaan steeds vaker naar mensen die werk slimmer structureren, niet alleen harder uitvoeren.',
          evidence: `Je ziet al waar ${primaryTask.toLowerCase()} vertraagt, waar revisies ontstaan en waar context verloren gaat.`,
          close: 'Bouw een concrete AI-ondersteunde workflow voor een terugkerende taak en leg de voor-na impact vast.',
        }
      : locale === 'de'
        ? {
            name: 'KI-Workflow-Design',
            current: `Du kennst ${primaryTask.toLowerCase()} bereits aus der Praxis.`,
            required: 'Du kannst einen klaren KI-unterstützten Workflow entwerfen, prüfen und dokumentieren.',
            why: 'Interne Aufstiege gehen zunehmend an Menschen, die Arbeit intelligenter strukturieren, statt nur mehr Output zu liefern.',
            evidence: `Du siehst bereits, wo ${primaryTask.toLowerCase()} stockt, wo Revisionen entstehen und wo Kontext verloren geht.`,
            close: 'Baue einen konkreten KI-unterstützten Workflow für eine wiederkehrende Aufgabe und dokumentiere die Vorher-Nachher-Wirkung.',
          }
        : {
            name: 'AI workflow design',
            current: `You already know how ${primaryTask.toLowerCase()} works in practice.`,
            required: 'You can design, review, and document a clear AI-assisted workflow for high-value recurring work.',
            why: 'Internal advancement increasingly goes to people who can redesign how work gets done, not just produce more of it.',
            evidence: `You already see where ${primaryTask.toLowerCase()} slows down, where revisions pile up, and where context gets lost.`,
            close: 'Build one concrete AI-assisted workflow for a recurring task and document the before/after impact.',
          }),
    communication: englishBlueprints?.communication || (locale === 'nl'
      ? {
          name: 'AI-ondersteunde besluitcommunicatie',
          current: 'Je vertaalt al werk naar updates, afstemming en besluiten voor anderen.',
          required: 'Je kunt AI-output vertalen naar heldere beslisondersteuning die managers vertrouwen.',
          why: 'Mensen die AI goed gebruiken maar de context slecht uitleggen, winnen geen invloed. Interpretatie blijft de hefboom.',
          evidence: 'Je hebt al stakeholdercontext, organisatietaal en gevoel voor prioriteiten.',
          close: 'Gebruik AI voor de eerste analyse of conceptstructuur, maar lever zelf de uiteindelijke samenvatting, aanbeveling en trade-off.',
        }
      : locale === 'de'
        ? {
            name: 'KI-gestützte Entscheidungs-Kommunikation',
            current: 'Du übersetzt Arbeit bereits in Updates, Abstimmung und Entscheidungen für andere.',
            required: 'Du kannst KI-Output in klare Entscheidungsunterstützung übersetzen, der Führungskräfte vertrauen.',
            why: 'Wer KI nutzt, aber den Kontext schlecht erklärt, gewinnt keinen Einfluss. Interpretation bleibt der Hebel.',
            evidence: 'Du hast bereits Stakeholder-Kontext, Organisationssprache und Prioritätsgefühl.',
            close: 'Nutze KI für erste Analyse oder Struktur, liefere aber selbst die finale Zusammenfassung, Empfehlung und Abwägung.',
          }
        : {
            name: 'AI-assisted decision communication',
            current: 'You already translate work into updates, alignment, and decisions for other people.',
            required: 'You can turn AI output into clear decision support that leaders trust.',
            why: 'People who use AI well but explain it poorly do not gain influence. Interpretation remains the leverage layer.',
            evidence: 'You already have stakeholder context, organizational language, and a feel for priorities.',
            close: 'Use AI for first-pass analysis or structure, but personally deliver the final summary, recommendation, and trade-off.',
          }),
    leadership: englishBlueprints?.leadership || (locale === 'nl'
      ? {
          name: 'AI-adoptie en change leadership',
          current: 'Je bent al dichtbij het dagelijkse werk van het team en ziet wat wel of niet landt.',
          required: 'Je kunt één AI-pilot, standaard of reviewproces leiden zodat anderen het veilig overnemen.',
          why: 'Dat is het verschil tussen iemand die efficiënter werkt en iemand die als promotiekandidaat wordt gezien.',
          evidence: 'Je kent al de risico’s, vragen en weerstand die bij nieuwe tools of werkwijzen ontstaan.',
          close: 'Kies één teamproces, maak een kleine AI-pilot veilig en deelbaar, en koppel het effect aan tijd, kwaliteit of risico.',
        }
      : locale === 'de'
        ? {
            name: 'KI-Adoption und Veränderungsführung',
            current: 'Du bist bereits nah an der täglichen Arbeit des Teams und siehst, was funktioniert und was nicht.',
            required: 'Du kannst einen KI-Piloten, Standard oder Review-Prozess so führen, dass andere ihn sicher übernehmen.',
            why: 'Das ist der Unterschied zwischen jemandem, der nur effizienter arbeitet, und jemandem, der als Beförderungskandidat gilt.',
            evidence: 'Du kennst bereits die Risiken, Fragen und Widerstände, die bei neuen Tools oder Arbeitsweisen auftauchen.',
            close: 'Wähle einen Teamprozess, mache einen kleinen KI-Piloten sicher und teilbar und verbinde die Wirkung mit Zeit, Qualität oder Risiko.',
          }
        : {
            name: 'AI adoption leadership',
            current: 'You are already close enough to the team’s real work to see what will and will not stick.',
            required: 'You can lead one AI pilot, standard, or review process in a way other people can safely adopt.',
            why: 'That is the difference between someone who simply works faster and someone who looks promotable.',
            evidence: 'You already understand the risks, objections, and operational friction around new tools or workflows.',
            close: 'Pick one team process, make a small AI pilot safe and reusable, and tie the result to time, quality, or risk.',
          }),
  };

  return [
    buildSkillGap({
      skillName: localized.workflow.name,
      category: 'workflow',
      currentStrength: localized.workflow.current,
      requiredLevel: localized.workflow.required,
      gapPriority: 'critical',
      whyItMatters: localized.workflow.why,
      evidence: localized.workflow.evidence,
      howToClose: localized.workflow.close,
      ...resources.workflow,
    }),
    buildSkillGap({
      skillName: localized.communication.name,
      category: 'communication',
      currentStrength: localized.communication.current,
      requiredLevel: localized.communication.required,
      gapPriority: 'medium',
      whyItMatters: localized.communication.why,
      evidence: localized.communication.evidence,
      howToClose: localized.communication.close,
      ...resources.communication,
    }),
    buildSkillGap({
      skillName: localized.leadership.name,
      category: 'leadership',
      currentStrength: localized.leadership.current,
      requiredLevel: localized.leadership.required,
      gapPriority: 'medium',
      whyItMatters: localized.leadership.why,
      evidence: localized.leadership.evidence,
      howToClose: localized.leadership.close,
      ...resources.leadership,
    }),
  ];
}

function buildStayAdvanceWeeks({ profile, stayAndAdvance, summary, locale = 'en' }) {
  const jobTitle = profile?.job_title || 'your role';
  const anchorTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'one high-visibility task';
  const proofAssetTitle = stayAndAdvance?.thirty_day_plan?.proof_asset?.title || (locale === 'nl' ? 'Interne AI-case' : locale === 'de' ? 'Interner KI-Case' : 'Internal AI case');
  const nextTitle = stayAndAdvance?.promotion_path?.next_title || (locale === 'nl' ? 'Sterkere interne rol' : locale === 'de' ? 'Stärkere interne Rolle' : 'Stronger internal role');
  const leadLabel = locale === 'nl' ? 'Leid de adoptie zichtbaar' : locale === 'de' ? 'Adoption sichtbar führen' : 'Lead adoption visibly';

  return [
    buildWeek({
      weekNumber: 1,
      title: locale === 'nl' ? 'Kies de AI-werkflow die je wilt herontwerpen' : locale === 'de' ? 'Wähle den KI-Workflow, den du neu gestalten willst' : 'Choose the AI workflow to redesign',
      goal: locale === 'nl' ? `Kies één terugkerende taak rond ${anchorTask.toLowerCase()} die genoeg frictie heeft om een zichtbare AI-case op te bouwen.` : locale === 'de' ? `Wähle eine wiederkehrende Aufgabe rund um ${anchorTask.toLowerCase()}, die genug Reibung erzeugt, um einen sichtbaren KI-Case aufzubauen.` : `Choose one recurring workflow around ${anchorTask.toLowerCase()} with enough friction to build a visible AI case.`,
      why: locale === 'nl' ? 'Zonder scherp focusgebied blijft “meer AI gebruiken” vaag en niet promootbaar.' : locale === 'de' ? 'Ohne klaren Fokus bleibt „mehr KI nutzen“ vage und nicht beförderungsrelevant.' : 'Without a sharp focus area, “use more AI” stays vague and not promotion-worthy.',
      problem: locale === 'nl' ? 'Je hebt één duidelijke ingang nodig waar snelheid, kwaliteit of besluitvorming zichtbaar beter kunnen worden.' : locale === 'de' ? 'Du brauchst einen klaren Einstieg, bei dem Geschwindigkeit, Qualität oder Entscheidungsunterstützung sichtbar besser werden können.' : 'You need one clear entry point where speed, quality, or decision support can get visibly better.',
      actions: [
        locale === 'nl' ? `Map de huidige stappen voor ${anchorTask.toLowerCase()} en markeer waar vertraging of herwerk ontstaat.` : locale === 'de' ? `Mappe die aktuellen Schritte für ${anchorTask.toLowerCase()} und markiere, wo Verzögerungen oder Nacharbeit entstehen.` : `Map the current steps for ${anchorTask.toLowerCase()} and mark where delays or rework happen.`,
        locale === 'nl' ? 'Kies één metric om te verbeteren: doorlooptijd, revisies, foutpercentage of briefingkwaliteit.' : locale === 'de' ? 'Wähle eine Kennzahl: Durchlaufzeit, Revisionen, Fehlerquote oder Briefing-Qualität.' : 'Choose one metric to improve: turnaround time, revisions, error rate, or briefing quality.',
        locale === 'nl' ? 'Leg vast wie deze werkflow gebruikt of erop wacht.' : locale === 'de' ? 'Halte fest, wer diesen Workflow nutzt oder auf ihn wartet.' : 'Document who uses or waits on this workflow.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: locale === 'nl' ? 'Je hebt één gekozen workflow, één metric en één stakeholdergroep.' : locale === 'de' ? 'Du hast einen gewählten Workflow, eine Kennzahl und eine Stakeholder-Gruppe.' : 'You have one chosen workflow, one metric, and one stakeholder group.',
      proof: locale === 'nl' ? 'Een korte workflowmap en baseline-notitie.' : locale === 'de' ? 'Eine kurze Workflow-Map und Baseline-Notiz.' : 'A short workflow map and baseline note.',
      blockers: [locale === 'nl' ? 'Tegelijk meerdere workflows willen verbeteren.' : locale === 'de' ? 'Mehrere Workflows gleichzeitig verbessern wollen.' : 'Trying to improve multiple workflows at once.', locale === 'nl' ? 'Geen metric kiezen.' : locale === 'de' ? 'Keine Kennzahl wählen.' : 'Not choosing a metric.'],
      catchUp: locale === 'nl' ? 'Kies alsnog één workflow en één metric, ook als de analyse nog ruw is.' : locale === 'de' ? 'Wähle trotzdem einen Workflow und eine Kennzahl, auch wenn die Analyse noch grob ist.' : 'Still choose one workflow and one metric even if the analysis is rough.',
      encouragement: locale === 'nl' ? 'Een promotiewaardige AI-case begint klein en duidelijk.' : locale === 'de' ? 'Ein beförderungswürdiger KI-Case beginnt klein und klar.' : 'A promotion-worthy AI case starts small and clear.',
    }),
    buildWeek({
      weekNumber: 2,
      title: locale === 'nl' ? 'Ontwerp de nieuwe werkflow' : locale === 'de' ? 'Entwirf den neuen Workflow' : 'Design the new workflow',
      goal: locale === 'nl' ? 'Bepaal wat AI doet, wat jij reviewt en waar menselijk oordeel blijft.' : locale === 'de' ? 'Lege fest, was KI übernimmt, was du prüfst und wo menschliches Urteil bleibt.' : 'Define what AI handles, what you review, and where human judgment stays in the loop.',
      why: locale === 'nl' ? 'Leverage komt uit beter workflowontwerp, niet uit blind automatiseren.' : locale === 'de' ? 'Hebelwirkung entsteht aus besserem Workflow-Design, nicht aus blindem Automatisieren.' : 'Leverage comes from better workflow design, not blind automation.',
      problem: locale === 'nl' ? 'Je moet laten zien dat je snelheid verhoogt zonder kwaliteit of context te verliezen.' : locale === 'de' ? 'Du musst zeigen, dass du Geschwindigkeit erhöhst, ohne Qualität oder Kontext zu verlieren.' : 'You need to show that speed can increase without losing quality or context.',
      actions: [
        locale === 'nl' ? 'Maak een eerste AI-ondersteunde versie van de workflow.' : locale === 'de' ? 'Baue eine erste KI-unterstützte Version des Workflows.' : 'Build a first AI-assisted version of the workflow.',
        locale === 'nl' ? 'Definieer reviewpunten en kwaliteitsgrenzen.' : locale === 'de' ? 'Definiere Review-Punkte und Qualitätsgrenzen.' : 'Define review points and quality thresholds.',
        locale === 'nl' ? 'Schrijf op welke inputs het team moet leveren om de workflow betrouwbaar te maken.' : locale === 'de' ? 'Schreibe auf, welche Inputs das Team liefern muss, damit der Workflow zuverlässig wird.' : 'Write down the inputs the team must provide to make the workflow reliable.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: locale === 'nl' ? 'Er is een duidelijke AI-ondersteunde workflow met reviewstappen.' : locale === 'de' ? 'Es gibt einen klaren KI-unterstützten Workflow mit Review-Schritten.' : 'There is a clear AI-assisted workflow with explicit review steps.',
      proof: locale === 'nl' ? 'Een gedeelde workflowschets of SOP.' : locale === 'de' ? 'Eine geteilte Workflow-Skizze oder SOP.' : 'A shared workflow sketch or SOP.',
      blockers: [locale === 'nl' ? 'AI alles laten doen zonder checks.' : locale === 'de' ? 'KI alles ohne Kontrollen machen lassen.' : 'Letting AI do everything without checks.', locale === 'nl' ? 'Geen duidelijke inputstandaarden zetten.' : locale === 'de' ? 'Keine klaren Input-Standards setzen.' : 'Not setting clear input standards.'],
      catchUp: locale === 'nl' ? 'Documenteer ten minste de stappen, reviewmomenten en kwaliteitscriteria.' : locale === 'de' ? 'Dokumentiere zumindest Schritte, Review-Momente und Qualitätskriterien.' : 'At minimum, document the steps, review moments, and quality criteria.',
      encouragement: locale === 'nl' ? 'Dit is waar je verschuift van gebruiker naar ontwerper.' : locale === 'de' ? 'Hier verschiebst du dich vom Nutzer zum Gestalter.' : 'This is where you shift from user to designer.',
    }),
    buildWeek({
      weekNumber: 3,
      title: locale === 'nl' ? 'Bouw het eerste bewijs' : locale === 'de' ? 'Erzeuge den ersten Nachweis' : 'Build the first proof',
      goal: locale === 'nl' ? `Maak de eerste versie van ${proofAssetTitle.toLowerCase()} zodat leiders een concreet resultaat kunnen zien.` : locale === 'de' ? `Erstelle die erste Version des ${proofAssetTitle.toLowerCase()}, damit Führungskräfte ein konkretes Ergebnis sehen können.` : `Create the first version of the ${proofAssetTitle.toLowerCase()} so leadership can see a concrete result.`,
      why: locale === 'nl' ? 'Zonder bewijs blijft “ik gebruik AI slim” een claim zonder gewicht.' : locale === 'de' ? 'Ohne Beweis bleibt „ich nutze KI gut“ nur eine Behauptung.' : 'Without proof, “I use AI well” is just a claim.',
      problem: locale === 'nl' ? 'Je hebt een zichtbare output nodig die promotiewaarde signaleert.' : locale === 'de' ? 'Du brauchst ein sichtbares Ergebnis, das Beförderungsreife signalisiert.' : 'You need a visible output that signals promotable leverage.',
      actions: [
        locale === 'nl' ? 'Leg baseline en verbeterde output naast elkaar.' : locale === 'de' ? 'Stelle Baseline und verbesserte Ausgabe nebeneinander.' : 'Put baseline output next to the improved output.',
        locale === 'nl' ? 'Beschrijf het zakelijke effect in tijd, kwaliteit of besliskwaliteit.' : locale === 'de' ? 'Beschreibe die geschäftliche Wirkung in Zeit, Qualität oder Entscheidungsqualität.' : 'Describe the business effect in time, quality, or decision quality.',
        locale === 'nl' ? 'Laat één stakeholder de output reviewen.' : locale === 'de' ? 'Lass einen Stakeholder das Ergebnis prüfen.' : 'Have one stakeholder review the output.',
      ],
      timeCommitment: '3 hours',
      successSignal: locale === 'nl' ? 'Je hebt een eerste interne case die niet alleen efficiëntie, maar ook leverage toont.' : locale === 'de' ? 'Du hast einen ersten internen Case, der nicht nur Effizienz, sondern Hebelwirkung zeigt.' : 'You have a first internal case that shows more than efficiency.',
      proof: proofAssetTitle,
      blockers: [locale === 'nl' ? 'Alleen de tooldemo laten zien.' : locale === 'de' ? 'Nur die Tool-Demo zeigen.' : 'Showing only the tool demo.', locale === 'nl' ? 'Geen zakelijk effect benoemen.' : locale === 'de' ? 'Keine geschäftliche Wirkung benennen.' : 'Not naming the business effect.'],
      catchUp: locale === 'nl' ? 'Maak desnoods een ruwe voor-na case van één taak.' : locale === 'de' ? 'Erstelle notfalls einen groben Vorher-Nachher-Case für eine Aufgabe.' : 'Create a rough before/after case for one task if needed.',
      encouragement: locale === 'nl' ? 'Een ruwe case is beter dan nog een week abstract denken.' : locale === 'de' ? 'Ein roher Case ist besser als noch eine Woche abstraktes Denken.' : 'A rough case is better than another week of abstract thinking.',
    }),
    buildWeek({
      weekNumber: 4,
      title: locale === 'nl' ? 'Vertaal het naar leiderschapstaal' : locale === 'de' ? 'Übersetze es in Führungssprache' : 'Translate it into leadership language',
      goal: locale === 'nl' ? 'Maak van de AI-case een narratief dat als promotieleverage gelezen wordt.' : locale === 'de' ? 'Mache aus dem KI-Case ein Narrativ, das wie Beförderungs-Hebelwirkung gelesen wird.' : 'Turn the AI case into a narrative that reads like promotion leverage.',
      why: locale === 'nl' ? 'Promoties volgen zelden uit slim werk alleen; ze volgen uit zichtbaar waardevol werk.' : locale === 'de' ? 'Beförderungen folgen selten aus cleverer Arbeit allein; sie folgen aus sichtbar wertvoller Arbeit.' : 'Promotions rarely follow from smart work alone; they follow from visibly valuable work.',
      problem: locale === 'nl' ? 'Je moet het effect koppelen aan teamresultaat en leiderschapswaarde.' : locale === 'de' ? 'Du musst die Wirkung mit Teamergebnis und Führungswert verknüpfen.' : 'You need to connect the effect to team outcomes and leadership value.',
      actions: [
        locale === 'nl' ? 'Schrijf een korte update voor manager of teamlead.' : locale === 'de' ? 'Schreibe ein kurzes Update für Manager oder Teamlead.' : 'Write a short update for your manager or team lead.',
        locale === 'nl' ? 'Gebruik de leiderschapszin uit je rapport als basis.' : locale === 'de' ? 'Nutze den Führungssatz aus deinem Report als Ausgangspunkt.' : 'Use the leadership narrative from your report as a starting point.',
        locale === 'nl' ? 'Vraag expliciet om feedback op verdere toepassing.' : locale === 'de' ? 'Bitte explizit um Feedback zur weiteren Anwendung.' : 'Ask explicitly for feedback on where to apply it next.',
      ],
      timeCommitment: '2 hours',
      successSignal: locale === 'nl' ? 'Je hebt een verhaal dat klinkt als schaalbare impact, niet als toolenthousiasme.' : locale === 'de' ? 'Du hast ein Narrativ, das wie skalierbare Wirkung klingt, nicht wie Tool-Begeisterung.' : 'You have a story that sounds like scalable impact, not tool enthusiasm.',
      proof: locale === 'nl' ? 'Een gedeelde update, memo of deckslide.' : locale === 'de' ? 'Ein geteiltes Update, Memo oder eine Deck-Slide.' : 'A shared update, memo, or deck slide.',
      blockers: [locale === 'nl' ? 'Te veel praten over de tool.' : locale === 'de' ? 'Zu viel über das Tool sprechen.' : 'Talking too much about the tool.', leadLabel],
      catchUp: locale === 'nl' ? 'Maak minimaal een korte before-after samenvatting van drie zinnen.' : locale === 'de' ? 'Erstelle mindestens eine kurze Vorher-Nachher-Zusammenfassung in drei Sätzen.' : 'At minimum, write a three-sentence before/after summary.',
      encouragement: locale === 'nl' ? 'Wie je het verhaal vertelt, bepaalt vaak hoe hoog de leverage wordt gezien.' : locale === 'de' ? 'Wie du die Geschichte erzählst, bestimmt oft, wie hoch die Hebelwirkung wahrgenommen wird.' : 'How you tell the story often determines how much leverage other people see in it.',
    }),
    ...[5, 6, 7, 8, 9, 10, 11, 12].map((weekNumber) =>
      buildWeek({
        weekNumber,
        title:
          weekNumber === 5 ? (locale === 'nl' ? 'Herhaal met een tweede workflow' : locale === 'de' ? 'Wiederhole es mit einem zweiten Workflow' : 'Repeat with a second workflow')
          : weekNumber === 6 ? (locale === 'nl' ? 'Standaardiseer review en governance' : locale === 'de' ? 'Standardisiere Review und Governance' : 'Standardize review and governance')
          : weekNumber === 7 ? (locale === 'nl' ? 'Bouw teamadoptie' : locale === 'de' ? 'Baue Team-Adoption auf' : 'Build team adoption')
          : weekNumber === 8 ? (locale === 'nl' ? 'Laat een metric echt bewegen' : locale === 'de' ? 'Bewege eine Kennzahl sichtbar' : 'Move the metric visibly')
          : weekNumber === 9 ? (locale === 'nl' ? 'Maak de case promotieready' : locale === 'de' ? 'Mache den Case beförderungsreif' : 'Make the case promotion-ready')
          : weekNumber === 10 ? (locale === 'nl' ? 'Verbind het aan een grotere scope' : locale === 'de' ? 'Verbinde es mit größerem Scope' : 'Connect it to broader scope')
          : weekNumber === 11 ? (locale === 'nl' ? 'Vraag om de volgende verantwoordelijkheid' : locale === 'de' ? 'Bitte um die nächste Verantwortung' : 'Ask for the next responsibility')
          : (locale === 'nl' ? 'Consolideer je promotiepad' : locale === 'de' ? 'Konsolidiere deinen Aufstiegspfad' : 'Consolidate the promotion path'),
        goal: locale === 'nl' ? `Blijf het patroon herhalen totdat ${nextTitle.toLowerCase()} geloofwaardig aan je naam hangt.` : locale === 'de' ? `Wiederhole das Muster, bis ${nextTitle.toLowerCase()} glaubwürdig mit deinem Namen verbunden ist.` : `Keep repeating the pattern until ${nextTitle.toLowerCase()} starts to feel attached to your name.`,
        why: locale === 'nl' ? 'Eén AI-win is interessant. Een reeks zichtbare wins verandert je interne positie.' : locale === 'de' ? 'Ein KI-Erfolg ist interessant. Eine Reihe sichtbarer Erfolge verändert deine interne Position.' : 'One AI win is interesting. A series of visible wins changes your internal position.',
        problem: locale === 'nl' ? 'Je hebt herhaalbaarheid nodig zodat leiderschap dit leest als nieuwe scope, niet als eenmalige slimheid.' : locale === 'de' ? 'Du brauchst Wiederholbarkeit, damit Führung dies als neuen Scope liest und nicht als einmalige Cleverness.' : 'You need repeatability so leadership reads this as new scope, not a one-off smart move.',
        actions: [
          locale === 'nl' ? 'Pas hetzelfde patroon toe op een tweede of grotere workflow.' : locale === 'de' ? 'Wende dasselbe Muster auf einen zweiten oder größeren Workflow an.' : 'Apply the same pattern to a second or larger workflow.',
          locale === 'nl' ? 'Documenteer impact en deel wat anderen kunnen herhalen.' : locale === 'de' ? 'Dokumentiere die Wirkung und teile, was andere wiederholen können.' : 'Document impact and share what others can repeat.',
          locale === 'nl' ? 'Koppel de case aan extra verantwoordelijkheid of scope.' : locale === 'de' ? 'Verknüpfe den Case mit zusätzlicher Verantwortung oder größerem Scope.' : 'Connect the case to increased responsibility or broader scope.',
        ],
        timeCommitment: '2–4 hours',
        successSignal: locale === 'nl' ? 'Je hebt meerdere voorbeelden van AI-leverage die als promotiewaarde gelezen worden.' : locale === 'de' ? 'Du hast mehrere Beispiele für KI-Hebelwirkung, die wie Beförderungswert gelesen werden.' : 'You have multiple examples of AI leverage that read like promotion value.',
        proof: locale === 'nl' ? 'Een reeks korte interne cases of updates.' : locale === 'de' ? 'Eine Reihe kurzer interner Cases oder Updates.' : 'A set of short internal cases or updates.',
        blockers: [locale === 'nl' ? 'Na één succes stoppen.' : locale === 'de' ? 'Nach einem Erfolg aufhören.' : 'Stopping after one success.', locale === 'nl' ? 'De impact niet zichtbaar maken voor anderen.' : locale === 'de' ? 'Die Wirkung nicht sichtbar machen.' : 'Not making the impact visible to others.'],
        catchUp: locale === 'nl' ? 'Herhaal het patroon op kleine schaal in plaats van te wachten op een perfect project.' : locale === 'de' ? 'Wiederhole das Muster im Kleinen, statt auf das perfekte Projekt zu warten.' : 'Repeat the pattern on a smaller scope instead of waiting for the perfect project.',
        encouragement: locale === 'nl' ? 'Carrièresprongen binnen hetzelfde vakgebied komen vaak uit zichtbaar herhaalde leverage, niet uit één groot moment.' : locale === 'de' ? 'Karrieresprünge im selben Feld entstehen oft aus sichtbar wiederholter Hebelwirkung, nicht aus einem großen Moment.' : 'Career acceleration inside the same lane usually comes from visibly repeated leverage, not one big moment.',
      })
    ),
  ];
}

function buildStayAdvancePath(profile, summary, stayAndAdvance, basePivot, locale = 'en') {
  const skillGaps = buildStayAdvanceSkillGaps(profile, stayAndAdvance, basePivot, locale);
  const roadmapWeeks = buildStayAdvanceWeeks({ profile, stayAndAdvance, summary, locale });

  return buildPivot({
    id: 'stay-and-advance',
    title: stayAndAdvance?.promotion_path?.next_title || stayAndAdvance?.headline || 'Stay and advance with AI',
    fitSummary: stayAndAdvance?.recommendation || stayAndAdvance?.rationale || '',
    outcome: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    decisionFrame: 'stay and advance',
    whoThisIsFor: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    tradeoffs: [
      locale === 'nl' ? 'Je moet zichtbaar AI-leverage opbouwen binnen je huidige context.' : locale === 'de' ? 'Du musst sichtbare KI-Hebelwirkung im aktuellen Kontext aufbauen.' : 'You need to build visible AI leverage inside your current context.',
      locale === 'nl' ? 'Zonder bewijs blijft deze route voelen als meer van hetzelfde werk.' : locale === 'de' ? 'Ohne Nachweise fühlt sich dieser Weg wie mehr vom Gleichen an.' : 'Without proof, this path can still look like “more of the same” work.',
    ],
    whyThisPathWins: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    whatYouAreBettingOn: locale === 'nl'
      ? 'Dat leiders waarde toekennen aan mensen die AI veilig, meetbaar en teambreed inzetbaar maken.'
      : locale === 'de'
        ? 'Dass Führung Menschen belohnt, die KI sicher, messbar und teamfähig machen.'
        : 'That leadership rewards people who make AI safe, measurable, and usable for the wider team.',
    matchScore: Math.max(52, Math.min(92, Number(summary?.overall_score || 60) + 8)),
    salaryRange: basePivot?.salary_range || '',
    salaryDelta: locale === 'nl' ? 'Interne promotie / scope-upgrade' : locale === 'de' ? 'Interne Beförderung / Scope-Upgrade' : 'Internal promotion / scope upgrade',
    transitionTime: stayAndAdvance?.promotion_path?.timeline || '3-9 months',
    difficulty: 'Medium',
    strengths: normalizeArray(stayAndAdvance?.promotion_path?.signals_to_build).slice(0, 3),
    skillGaps,
    weeks: roadmapWeeks,
  });
}

function stayTitleMatchesGrowthPattern(title, roleFamily) {
  const normalized = normalizeText(title);
  if (!normalized) return false;

  if (roleFamily === 'analytics') {
    return /\b(business intelligence|analytics|insights)\b/.test(normalized) && !/\b(product owner|engineer|architect)\b/.test(normalized);
  }
  if (roleFamily === 'finance') {
    return /\b(finance|financial|fp a|fpa|planning|business partner|finance systems)\b/.test(normalized);
  }
  if (roleFamily === 'hr') {
    return /\b(people|hr|human resources|workforce|talent)\b/.test(normalized) && /\b(lead|manager|operations|planning|strategy)\b/.test(normalized);
  }
  if (roleFamily === 'admin') {
    return /\b(executive|chief of staff|operations|business operations|enablement|support)\b/.test(normalized);
  }
  if (roleFamily === 'customer') {
    return /\b(customer|account|renewal|success)\b/.test(normalized) && /\b(lead|manager|strategy|operations|enablement)\b/.test(normalized);
  }
  if (roleFamily === 'operations') {
    return /\b(operations|program|project|delivery|workflow|coordination)\b/.test(normalized);
  }
  if (roleFamily === 'product') {
    return /\b(product operations|business operations|strategy and operations|operations lead)\b/.test(normalized);
  }
  if (roleFamily === 'marketing') {
    return /\b(marketing|growth|brand|gtm|product marketing)\b/.test(normalized);
  }
  if (roleFamily === 'legal') {
    return /\b(legal|contract|compliance|clm|privacy|governance)\b/.test(normalized);
  }
  if (roleFamily === 'procurement') {
    return /\b(procurement|sourcing|supplier|vendor|spend)\b/.test(normalized);
  }
  if (roleFamily === 'education') {
    return /\b(learning|education|enablement|training|curriculum|instructional)\b/.test(normalized);
  }

  return true;
}

function shouldRepairStayAndAdvanceTitle(profile, stayAndAdvance, stayPath, locale = 'en') {
  const currentTitle = profile?.job_title || profile?.jobTitle || '';
  const roleFamily = inferRoleFamilyFromProfile(
    currentTitle,
    profile?.industry || '',
    profile?.tasks || [],
    profile?.clarifiers || null
  );
  const yearsBand = getYearsExperienceBand(profile);
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);
  const fallbackTitle = calibrateGrowthTitleForExperience(roleFamily, yearsBand, blueprint.nextTitle || 'Stronger version of your current role');
  const proposedTitle = stayAndAdvance?.promotion_path?.next_title || stayPath?.title || '';
  const strippedProposedTitle = normalizeText(proposedTitle).replace(/^(senior|sr|lead|principal)\s+/, '').trim();
  const normalizedCurrentTitle = normalizeText(currentTitle);
  const strippedCurrentTitle = normalizedCurrentTitle.replace(/^(senior|sr|lead|principal)\s+/, '').trim();

  if (!proposedTitle) return true;
  if (!roleFamilyNeedsConservativePivotBias(roleFamily)) return false;
  if (titleSeniorityLevel(proposedTitle) >= 3 && titleSeniorityLevel(currentTitle) < 3) return true;
  if (strippedProposedTitle && strippedProposedTitle === normalizedCurrentTitle) return true;
  if (strippedCurrentTitle && strippedProposedTitle && strippedProposedTitle.includes(strippedCurrentTitle)) return true;
  if (titleTooClose(proposedTitle, currentTitle)) return true;
  if (seniorityOvershoot(proposedTitle, yearsBand) > 0) return true;
  if (!stayTitleMatchesGrowthPattern(proposedTitle, roleFamily)) return true;
  if (normalizeText(proposedTitle) === normalizeText(fallbackTitle)) return false;
  return false;
}

function applyStayAndAdvanceRepair(reportData) {
  const profile = reportData?.profile || {};
  const locale = reportData?.locale || profile?.locale || 'en';
  const defaultPivot = normalizeArray(reportData?.pivots)[0] || null;
  const currentStay = reportData?.stay_and_advance || {};
  const currentStayPath = reportData?.stay_path || {};

  if (!shouldRepairStayAndAdvanceTitle(profile, currentStay, currentStayPath, locale)) {
    return reportData;
  }

  const rebuiltStay = buildStayAndAdvance(profile, reportData?.summary || {}, defaultPivot, locale);
  const repairedStay = {
    ...currentStay,
    headline: rebuiltStay.headline,
    recommendation: rebuiltStay.recommendation,
    rationale: rebuiltStay.rationale,
    urgency_label: rebuiltStay.urgency_label,
    leverage_opportunities: rebuiltStay.leverage_opportunities,
    promotion_path: rebuiltStay.promotion_path,
    work_redesign: rebuiltStay.work_redesign,
    thirty_day_plan: rebuiltStay.thirty_day_plan,
  };
  const repairedStayPath = buildStayAdvancePath(profile, reportData?.summary || {}, repairedStay, defaultPivot, locale);
  const priorAudit = reportData?.quality_audit && typeof reportData.quality_audit === 'object'
    ? reportData.quality_audit
    : { status: 'warning', warnings: [], repairs: [] };
  const repairs = Array.isArray(priorAudit.repairs) ? [...priorAudit.repairs] : [];
  if (!repairs.includes('Replaced inflated stay-and-advance title with a role-native growth path.')) {
    repairs.push('Replaced inflated stay-and-advance title with a role-native growth path.');
  }

  return {
    ...reportData,
    stay_and_advance: repairedStay,
    stay_path: repairedStayPath,
    quality_audit: {
      ...priorAudit,
      status: priorAudit.status === 'passed' ? 'repaired' : priorAudit.status || 'repaired',
      repairs,
      warnings: Array.isArray(priorAudit.warnings) ? priorAudit.warnings : [],
    },
  };
}

function buildSyntheticPivotWeeks({ pivotTitle, decisionFrame, jobTitle, industry, skillGaps = [] }) {
  const topSkills = normalizeArray(skillGaps).slice(0, 2);
  const primarySkill = topSkills[0]?.skill_name || 'core transition skill';
  const secondarySkill = topSkills[1]?.skill_name || 'proof-building';
  const betLabel = decisionFrame || 'best-fit path';

  return [
    buildWeek({
      weekNumber: 1,
      title: 'Lock the target',
      goal: `Define what ${pivotTitle} actually means in the market so your effort compounds toward one credible direction.`,
      why: `Without a sharp target, ${jobTitle} professionals usually collect advice without translating it into employer-ready proof.`,
      problem: 'You need a concrete target role definition before you start building proof or rewriting your story.',
      actions: [
        `Review 12 live job descriptions for ${pivotTitle} and mark repeated responsibilities, tools, and deliverables.`,
        'Write a one-page transition brief explaining why your current background maps to this path.',
        `List the top 3 employer expectations that matter most for the ${betLabel} version of this pivot.`,
      ],
      timeCommitment: '3–4 hours',
      successSignal: `You can explain ${pivotTitle} in 3 sentences and name the top requirements employers expect.`,
      proof: 'A saved transition brief plus annotated job descriptions.',
      blockers: ['Trying to keep too many directions alive at once.', 'Researching without capturing patterns.'],
      catchUp: 'If the week slips, finish the transition brief and review 5 representative job descriptions only.',
      encouragement: 'Specificity creates relief. Once the target is sharper, the rest of the roadmap feels lighter.',
    }),
    buildWeek({
      weekNumber: 2,
      title: 'Inventory your proof',
      goal: 'Turn your current experience into evidence that already supports this pivot.',
      why: 'Most transitions stall because experience stays described as responsibilities instead of leverage and outcomes.',
      problem: 'You likely already have usable proof, but it is buried inside everyday work.',
      actions: [
        'List 8 work examples that show ownership, judgment, workflow improvement, or measurable results.',
        'Rewrite 3 examples using a problem → action → outcome structure.',
        'Choose one story that will anchor your positioning for this pivot.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have 3 polished proof stories tied clearly to the target role.',
      proof: 'A short document with 3 transition-ready story blocks.',
      blockers: ['Undervaluing routine work that actually shows leverage.', 'Forgetting measurable results or stakeholders.'],
      catchUp: 'Complete one strong proof story first and reuse the pattern later.',
      encouragement: 'You are not starting from zero. You are making existing leverage visible.',
    }),
    buildWeek({
      weekNumber: 3,
      title: 'Prioritize the skill ladder',
      goal: `Decide what to learn first so ${pivotTitle} becomes more credible quickly.`,
      why: 'If every missing skill feels equally urgent, you scatter energy and never build visible proof fast enough.',
      problem: 'You need a practical build order, not a long list of “nice to have” capabilities.',
      actions: [
        `Rank the top skills for ${pivotTitle} by hiring value, not curiosity.`,
        `Make ${primarySkill} the main skill focus for the next 3 weeks.`,
        `Choose ${secondarySkill} as the lighter parallel skill so momentum stays visible.`,
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain why the first skill is first and what can wait.',
      proof: 'A prioritized skill ladder with one main focus and one secondary focus.',
      blockers: ['Trying to master everything at once.', 'Confusing learning with signal-building.'],
      catchUp: 'Lock the first skill and one secondary skill even if the rest stays rough.',
      encouragement: 'Depth beats breadth early. The fastest progress usually looks narrower, not busier.',
    }),
    buildWeek({
      weekNumber: 4,
      title: 'Ship the first proof asset',
      goal: 'Create one visible artifact that proves you can operate in the direction of the pivot.',
      why: 'Courses can help you learn, but evidence is what changes how employers and peers read you.',
      problem: 'Without visible proof, the pivot stays theoretical.',
      actions: [
        'Build one artifact tied to the role: a workflow, dashboard, memo, scorecard, or mini case study.',
        `Use ${primarySkill} inside the artifact so the skill becomes visible, not just claimed.`,
        'Write a short note explaining the business problem the asset solves.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have one shareable artifact that demonstrates new-role behavior.',
      proof: 'A shareable URL, doc, PDF, or deck plus one sentence on the business problem solved.',
      blockers: ['Overbuilding the first asset.', 'Choosing an example too far from real employer needs.'],
      catchUp: 'Publish a rough first version this week and improve it later.',
      encouragement: 'Visible work changes the emotional feel of a pivot fast. Once the proof exists, momentum gets easier.',
    }),
    buildWeek({
      weekNumber: 5,
      title: 'Install a weekly operating rhythm',
      goal: 'Turn the pivot into a consistent system instead of a burst of motivation.',
      why: 'Most people do not fail because the path is impossible. They fail because progress is too irregular to compound.',
      problem: 'You need a cadence that survives work pressure and low-energy weeks.',
      actions: [
        'Protect two recurring calendar blocks for pivot work.',
        'Define a catch-up rule for messy weeks so progress does not stall completely.',
        'Track one visible weekly metric like proof shipped, outreach sent, or hours protected.',
      ],
      timeCommitment: '1–2 hours setup',
      successSignal: 'You have a repeatable weekly system with a fallback plan.',
      proof: 'Calendar blocks plus a simple progress tracker.',
      blockers: ['Treating pivot work as optional.', 'Waiting for a perfect mood or long stretch of time.'],
      catchUp: 'Protect one 45-minute block this week if the original plan breaks.',
      encouragement: 'Consistency is what turns this from stressful to sustainable.',
    }),
    buildWeek({
      weekNumber: 6,
      title: 'Get market feedback',
      goal: 'Pressure-test your story and proof before you invest more time in the wrong version of the pivot.',
      why: 'External feedback prevents expensive drift and reveals what feels credible right now.',
      problem: 'You need a real market read, not just your own internal confidence.',
      actions: [
        'Share your transition brief and first proof asset with 2–3 people close to the target role.',
        'Ask what feels strong, what feels weak, and what they would expect next.',
        'Cluster the feedback into themes and decide what to fix first.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have specific feedback that sharpens the next steps.',
      proof: 'Written notes from 2–3 conversations or message exchanges.',
      blockers: ['Waiting until everything feels finished.', 'Asking vague questions that get vague advice back.'],
      catchUp: 'Send materials asynchronously with 3 targeted questions if live calls are hard to schedule.',
      encouragement: 'Feedback is not a detour. It is how the plan gets smarter.',
    }),
    buildWeek({
      weekNumber: 7,
      title: 'Rewrite your positioning',
      goal: 'Make your public story match the direction you are now building toward.',
      why: 'If your materials still describe only your old role, your new capability stays invisible.',
      problem: 'Your positioning usually lags behind the progress you are making.',
      actions: [
        'Rewrite your headline and summary around the pivot direction.',
        'Add your strongest proof asset to your profile or resume.',
        'Update 3 bullets to emphasize systems improved, outcomes created, or judgment applied.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'Someone can understand your new direction within 30 seconds of reading your materials.',
      proof: 'Updated resume and LinkedIn profile.',
      blockers: ['Trying to sound like a finished expert instead of a credible transitioner.', 'Leaving old role language untouched.'],
      catchUp: 'Update the headline, summary, and one proof project first.',
      encouragement: 'Positioning is not pretending. It is making your trajectory legible.',
    }),
    buildWeek({
      weekNumber: 8,
      title: 'Expand the proof set',
      goal: 'Create a second example so your pivot looks repeatable instead of one-off.',
      why: 'One example creates interest. Two examples create pattern recognition.',
      problem: 'You need to show range without losing focus.',
      actions: [
        'Build a second smaller proof asset that solves a different kind of business problem.',
        'Make it easier to skim than the first asset.',
        'Write one line explaining how the two examples complement each other.',
      ],
      timeCommitment: '4 hours',
      successSignal: 'You have two proof assets that show range within the target direction.',
      proof: 'A second mini case study, workflow, or portfolio item.',
      blockers: ['Making the second asset too big.', 'Choosing an example too similar to the first.'],
      catchUp: 'Create a one-page mini asset rather than a full build if time is tight.',
      encouragement: 'At this point, the pivot should start to feel like evidence, not aspiration.',
    }),
    buildWeek({
      weekNumber: 9,
      title: 'Start targeted outreach',
      goal: 'Turn the roadmap into live opportunities through focused conversations and company mapping.',
      why: 'Transitions accelerate when you stop waiting for perfect readiness and start entering real conversations.',
      problem: 'You need exposure to live openings, decision-makers, and real role language.',
      actions: [
        'Create a list of 20 relevant companies or teams.',
        'Send 5 focused outreach messages tied to your transition brief or proof asset.',
        'Track what gets replies and refine the message after every few sends.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have started real conversations instead of staying in private preparation mode.',
      proof: 'A target list plus outreach tracker.',
      blockers: ['Over-personalizing every message.', 'Waiting until materials feel perfect.'],
      catchUp: 'Send 3 high-quality messages this week if 5 feels too heavy.',
      encouragement: 'You do not need universal approval. You need a few credible openings.',
    }),
    buildWeek({
      weekNumber: 10,
      title: 'Rehearse the transition story',
      goal: 'Prepare concise answers for why this pivot makes sense and why now.',
      why: 'A disciplined story reduces doubt in networking, interviews, and internal conversations.',
      problem: 'Without a tighter narrative, your background can sound fragmented instead of strategic.',
      actions: [
        'Write your answer to “Why this pivot?” in 60 seconds and in 3 minutes.',
        'Practice using your proof assets as support, not side notes.',
        'Prepare one calm response to the most likely objection.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain the transition clearly without rambling or apologizing for missing pieces.',
      proof: 'A written narrative plus one recorded practice run.',
      blockers: ['Overexplaining your whole career history.', 'Sounding defensive about missing experience.'],
      catchUp: 'Nail the 60-second version first.',
      encouragement: 'Clarity creates confidence. Confidence creates momentum.',
    }),
    buildWeek({
      weekNumber: 11,
      title: 'Run live bets',
      goal: 'Use what you built in real-world decisions: applications, pilots, stretch work, or advisory projects.',
      why: 'This is where the roadmap shifts from preparation to conversion.',
      problem: 'You need a bridge from “I could do this” to “someone trusted me to do this.”',
      actions: [
        'Apply to a focused set of roles or propose one internal pilot tied to the new direction.',
        'Customize your story using the strongest proof asset for each opportunity.',
        'Track rejections, silence, and positive signals separately to find the real friction.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have entered the market or internal decision cycle with concrete materials.',
      proof: 'Applications sent, proposal shared, or live opportunity tracker updated.',
      blockers: ['Applying too broadly.', 'Taking silence as proof the pivot is wrong.'],
      catchUp: 'Choose one narrow target segment and submit 3 strong opportunities instead.',
      encouragement: 'This week is about contact with the market, not instant wins.',
    }),
    buildWeek({
      weekNumber: 12,
      title: 'Review and re-sequence',
      goal: 'Close the 12 weeks with a clear view of what worked and what the next 30 days should be.',
      why: 'Reflection keeps the roadmap from ending in a vague blur of effort.',
      problem: 'Without a review step, progress can feel incomplete even when it is real.',
      actions: [
        'Review progress against your original transition brief and current opportunities.',
        'Mark what was completed, what slipped, and why.',
        'Choose the next 3 actions for the coming month based on evidence, not guilt.',
      ],
      timeCommitment: '2 hours',
      successSignal: 'You have a clear next-month plan and can point to concrete progress from the last 12 weeks.',
      proof: 'A short review note plus next-30-day action list.',
      blockers: ['Judging success only by final job outcome.', 'Ignoring process wins and evidence gained.'],
      catchUp: 'If multiple weeks slipped, focus on lessons learned and re-sequence rather than trying to “finish everything.”',
      encouragement: `The point of this plan is traction. If you now have better clarity, stronger proof, and better opportunities, ${pivotTitle} is already becoming more real.`,
    }),
  ];
}

export function hydrateModelReportData(reportData, fallbackProfile = null) {
  const fallback = buildDemoReportData(
    fallbackProfile?.job_title || fallbackProfile?.jobTitle || '',
    fallbackProfile?.industry || '',
    Array.isArray(fallbackProfile?.tasks) ? fallbackProfile.tasks : [],
    fallbackProfile
  );

  if (!reportData || typeof reportData !== 'object') {
    return fallback;
  }

  const profile = {
    ...fallback.profile,
    ...(reportData.profile && typeof reportData.profile === 'object' ? reportData.profile : {}),
  };

  const incomingPivots = normalizeArray(reportData.pivots);
  const basePivotsByFrame = new Map(
    normalizeArray(fallback.pivots).map((pivot) => [pivot.decision_frame, pivot])
  );

  const hydratedPivots = DEFAULT_PIVOT_DECISION_FRAMES.map((frame, index) => {
    const incomingPivot = incomingPivots.find((pivot) => pivot?.decision_frame === frame) || incomingPivots[index] || {};
    const basePivot = basePivotsByFrame.get(frame) || fallback.pivots[index] || fallback.pivots[0];
    const title = polishPivotTitle(incomingPivot.title || basePivot.title);
    const skillGaps = normalizeArray(incomingPivot.skill_gaps).length
      ? incomingPivot.skill_gaps
      : basePivot.skill_gaps;
    const strengths = normalizeArray(incomingPivot.strengths_to_leverage).length
      ? incomingPivot.strengths_to_leverage
      : basePivot.strengths_to_leverage;

    return {
      ...basePivot,
      ...incomingPivot,
      id: hasMeaningfulPivotId(incomingPivot.id) ? incomingPivot.id : slugify(title) || basePivot.id || `pivot-${index + 1}`,
      title,
      decision_frame: frame,
      strengths_to_leverage: strengths,
      tradeoffs: normalizeArray(incomingPivot.tradeoffs).length ? incomingPivot.tradeoffs : basePivot.tradeoffs,
      skill_gaps: skillGaps,
      roadmap: {
        weeks: (() => {
          const incomingWeeks = normalizeArray(incomingPivot?.roadmap?.weeks);
          if (incomingWeeks.length >= 12 && roadmapMentionsPivotTitle(incomingWeeks, title)) {
            return incomingWeeks;
          }

          return buildSyntheticPivotWeeks({
            pivotTitle: title,
            decisionFrame: frame,
            jobTitle: profile.job_title,
            industry: profile.industry,
            skillGaps,
          });
        })(),
      },
    };
  });

  const featuredPivot = hydratedPivots[0] || fallback.pivots[0];
  const nextMove = buildNextMove(profile, featuredPivot, reportData.locale || profile.locale || 'en');
  const decision = reportData.decision && typeof reportData.decision === 'object'
    ? { ...buildDecisionSignal(reportData.summary || fallback.summary, featuredPivot), ...reportData.decision }
    : buildDecisionSignal(reportData.summary || fallback.summary, featuredPivot);
  const careerRoi = reportData.career_roi && typeof reportData.career_roi === 'object'
    ? { ...buildCareerRoi(reportData.summary || fallback.summary, featuredPivot, profile), ...reportData.career_roi }
    : buildCareerRoi(reportData.summary || fallback.summary, featuredPivot, profile);
  const stayAndAdvance = reportData.stay_and_advance && typeof reportData.stay_and_advance === 'object'
    ? { ...buildStayAndAdvance(profile, reportData.summary || fallback.summary, featuredPivot, reportData.locale || profile.locale || 'en'), ...reportData.stay_and_advance }
    : buildStayAndAdvance(profile, reportData.summary || fallback.summary, featuredPivot, reportData.locale || profile.locale || 'en');
  const stayPath = buildStayAdvancePath(profile, reportData.summary || fallback.summary, stayAndAdvance, featuredPivot, reportData.locale || profile.locale || 'en');
  const first30Days = buildFirst30Days(profile, featuredPivot, { weeks: featuredPivot.roadmap.weeks }, nextMove);

  return normalizeReportData({
    ...fallback,
    ...reportData,
    profile,
    summary: {
      ...fallback.summary,
      ...(reportData.summary && typeof reportData.summary === 'object' ? reportData.summary : {}),
    },
    interpretation: {
      ...fallback.interpretation,
      ...(reportData.interpretation && typeof reportData.interpretation === 'object' ? reportData.interpretation : {}),
    },
    task_breakdown: normalizeArray(reportData.task_breakdown).length ? reportData.task_breakdown : fallback.task_breakdown,
    pivots: hydratedPivots,
    skill_gaps: normalizeArray(reportData.skill_gaps).length ? reportData.skill_gaps : featuredPivot.skill_gaps,
    roadmap: {
      cadence: 'weekly',
      total_weeks: 12,
      weeks: normalizeArray(reportData.roadmap?.weeks).length ? reportData.roadmap.weeks : featuredPivot.roadmap.weeks,
    },
    next_move: nextMove,
    decision,
    career_roi: careerRoi,
    stay_and_advance: stayAndAdvance,
    stay_path: stayPath,
    first_30_days: first30Days,
  }, profile);
}

export function buildDemoReportData(jobTitle, industry, tasks, intakeProfile = null, locale = 'en') {
  const selectedTasks = extractTaskLabels(tasks?.length ? tasks : intakeProfile?.selected_tasks).length
    ? extractTaskLabels(tasks?.length ? tasks : intakeProfile?.selected_tasks)
    : ['Reporting and status updates', 'Analysis and insight generation', 'Strategy and roadmap planning'];
  const clarifiers = extractIntakeClarifiers(intakeProfile);
  const primaryTasks = Array.isArray(intakeProfile?.primary_tasks) && intakeProfile.primary_tasks.length
    ? intakeProfile.primary_tasks
    : selectedTasks.slice(0, 3);
  const goalNow = clarifiers?.goal_now || 'not_sure';
  const timelineUrgency = clarifiers?.timeline_urgency || null;
  const yearsExperienceBand = clarifiers?.years_experience_band || null;
  const locationPreference = clarifiers?.location_preference || null;
  const aiMaturity = clarifiers?.ai_maturity || null;
  const technicalCapability = clarifiers?.technical_capability || null;
  const salaryTolerance = clarifiers?.salary_tolerance || null;
  const proofState = clarifiers?.proof_state || null;
  const roleBlend = clarifiers?.role_blend || 'mixed';
  const managementScope = clarifiers?.management_scope || null;
  const decisionScope = clarifiers?.decision_scope || null;
  const domainFocus = clarifiers?.domain_focus || null;
  const coreSystems = normalizeCoreSystemsInput(clarifiers?.core_systems);
  const roleFamily = inferRoleFamilyFromProfile(jobTitle, industry, selectedTasks, clarifiers);
  const safestPivotTitle = buildSafestPivotTitle(roleFamily, jobTitle, industry);
  const leveragePivotTitle = buildLeveragePivotTitle(roleFamily, jobTitle, industry);
  const fastCashPivotTitle = buildFastCashPivotTitle(roleFamily, jobTitle, industry);
  const highUpsidePivotTitle = buildHighUpsidePivotTitle(roleFamily, jobTitle, industry);
  const longTermPivotTitle = buildLongTermPivotTitle(roleFamily, jobTitle, industry);
  const roleBlendLabel = roleBlend === 'execution'
    ? 'execution-heavy'
    : roleBlend === 'strategy'
      ? 'strategy-heavy'
      : 'mixed execution-and-strategy';
  const leadershipContext = managementScope && managementScope !== 'none'
    ? ' Because you also manage people, the safer path is not just doing work faster, but making better decisions about what work should exist at all.'
    : '';
  const taskBreakdown = selectedTasks.map((task, index) => {
    const baseRisk = DEFAULT_TASK_RISKS[task] ?? 55;
    const riskScore = clamp(baseRisk + ((index % 3) - 1) * 4, 18, 92);

    let explanation = 'AI can accelerate part of this work, but human oversight still shapes final quality and accountability.';
    if (riskScore >= 75) {
      explanation = `Tools like ChatGPT, AI copilots, and workflow automation already compress the amount of manual ${task.toLowerCase()} needed in ${industry}.`;
    } else if (riskScore >= 45) {
      explanation = `This part of a ${jobTitle} role is being reshaped by AI copilots, so the value is shifting from doing to directing and quality-controlling output.`;
    } else {
      explanation = `This area still depends on judgment, relationship context, and nuanced tradeoffs that AI cannot reliably own in ${industry}.`;
    }

    return {
      task_name: task,
      risk_score: riskScore,
      explanation,
    };
  });

  const overallScore = clamp(
    Math.round(taskBreakdown.reduce((sum, item) => sum + item.risk_score, 0) / taskBreakdown.length),
    25,
    88
  );
  const riskLevel = overallScore >= 70 ? 'HIGH' : overallScore >= 40 ? 'MODERATE' : 'LOW';
  const displacementTimeline =
    overallScore >= 70
      ? `Significant disruption is likely within 12–18 months as AI adoption rises across ${industry}.`
      : overallScore >= 40
        ? `Meaningful workflow disruption is likely within 18–24 months as teams in ${industry} standardize AI-assisted execution.`
        : `AI adoption is likely to change expectations over the next 24–36 months, even if immediate disruption is lower in ${industry}.`;

  const topTasks = taskBreakdown
    .slice()
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 2)
    .map((item) => item.task_name.toLowerCase());
  const primaryTaskSummary = primaryTasks.slice(0, 2).map((task) => task.toLowerCase()).join(' and ');
  const strengthLine = roleBlend === 'strategy'
    ? 'Your advantage is not raw output volume. It is prioritization, judgment, and decision framing.'
    : roleBlend === 'execution'
      ? 'Your advantage is practical closeness to the work, which makes you well-placed to redesign how it gets done.'
      : 'Your advantage is that you can still bridge execution reality with broader business context.';

  const commonWeeks = [
    buildWeek({
      weekNumber: 1,
      title: 'Clarify the pivot target',
      goal: 'Define the exact role variation you are moving toward so the rest of the roadmap stops feeling generic.',
      why: `Without a specific destination, ${jobTitle} professionals usually collect courses and advice but never translate them into credible progress.`,
      problem: 'You need a tighter direction than “future-proof my career” so each week compounds instead of scattering effort.',
      actions: [
        `Review 15 live job descriptions connected to this pivot and mark repeated responsibilities, tools, and deliverables.`,
        'Write a one-page transition brief that explains why your current background maps to this role.',
        'Choose one proof-of-skill theme you will build over the next 12 weeks.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'You can explain your pivot in 3 sentences and name the top 5 requirements employers expect.',
      proof: 'A saved transition brief plus annotated job descriptions.',
      blockers: ['Trying to keep too many pivot options alive at once.', 'Researching roles without capturing repeat patterns.'],
      catchUp: 'If you miss the week, skip extra research and complete only the transition brief plus 5 representative job descriptions.',
      encouragement: 'Specificity is relief. Once the target sharpens, the roadmap starts feeling much more achievable.',
    }),
    buildWeek({
      weekNumber: 2,
      title: 'Audit your evidence',
      goal: 'Turn vague experience into proof that hiring managers can trust.',
      why: 'Most career switchers undersell themselves because they describe responsibilities instead of results and transferable patterns.',
      problem: 'You likely have relevant evidence already, but it is buried inside past projects and daily work.',
      actions: [
        'List 8 work examples that show strategy, execution, communication, automation, or process improvement.',
        'Rewrite 3 of them using a problem → action → outcome format.',
        'Identify one measurable result you can reference for each example.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have 3 polished proof stories that clearly connect your current background to the pivot.',
      proof: 'A document containing 3 transition-ready story blocks.',
      blockers: ['Assuming “normal work” is not portfolio-worthy.', 'Forgetting numbers, stakeholders, or outcomes.'],
      catchUp: 'Finish one strong story instead of three, then reuse that pattern later.',
      encouragement: 'You are not starting from zero. This week is about making hidden leverage visible.',
    }),
  ];

  const pivot1SkillGaps = [
    buildSkillGap({
      skillName: 'Prompt design',
      category: 'AI execution',
      currentStrength: 'You already know the business context and decisions the output needs to support.',
      requiredLevel: 'Able to structure prompts, evaluate outputs, and iterate quickly with quality controls.',
      gapPriority: 'critical',
      whyItMatters: 'This is the fastest way to convert your existing domain expertise into visible AI leverage.',
      evidence: 'You already shape briefs, stakeholder asks, or deliverables that map naturally into prompt design.',
      howToClose: 'Build one repeatable prompt workflow tied to a real task from your current job.',
      resourceTitle: 'ChatGPT Prompt Engineering for Developers',
      resourceUrl: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
    }),
    buildSkillGap({
      skillName: 'AI QA workflows',
      category: 'Quality control',
      currentStrength: 'You already know what “good enough” looks like in your function.',
      requiredLevel: 'Able to evaluate AI outputs against business, brand, and stakeholder standards before shipping.',
      gapPriority: 'critical',
      whyItMatters: 'Companies do not just want faster output. They want someone who can keep quality from slipping while AI speeds work up.',
      evidence: 'Your current review or approval instincts already give you the basis for a QA rubric.',
      howToClose: 'Create a simple review checklist and use it on 5 AI-assisted outputs.',
      resourceTitle: 'OpenAI Cookbook',
      resourceUrl: 'https://cookbook.openai.com/',
    }),
    buildSkillGap({
      skillName: 'Automation mapping',
      category: 'Workflow design',
      currentStrength: 'You already understand where work gets delayed, repeated, or handed off poorly.',
      requiredLevel: 'Able to map a repetitive workflow and automate low-risk steps with no-code tools.',
      gapPriority: 'medium',
      whyItMatters: 'This turns you from a tool user into someone who improves the operating system of the team.',
      evidence: 'Your familiarity with recurring workflows gives you strong instincts for where automation has leverage.',
      howToClose: 'Map one recurring workflow and automate one step with a low-code or no-code tool.',
      resourceTitle: 'Zapier Learn',
      resourceUrl: 'https://zapier.com/blog/learn-automation/',
    }),
  ];

  const pivot2SkillGaps = [
    buildSkillGap({
      skillName: 'Dashboard storytelling',
      category: 'Analytics communication',
      currentStrength: 'You already know what metrics stakeholders care about.',
      requiredLevel: 'Able to turn raw metrics into a clear narrative that supports decisions.',
      gapPriority: 'critical',
      whyItMatters: 'Operations roles reward people who translate numbers into actions, not just charts.',
      evidence: 'You already surface patterns in meetings, reports, or project reviews.',
      howToClose: 'Rebuild one existing report into a clearer dashboard and explain what decisions it should trigger.',
      resourceTitle: 'Google Data Analytics Certificate',
      resourceUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    }),
    buildSkillGap({
      skillName: 'SQL basics',
      category: 'Technical analytics',
      currentStrength: 'You likely already ask data questions and interpret outputs.',
      requiredLevel: 'Able to query common business tables and validate simple operational hypotheses.',
      gapPriority: 'critical',
      whyItMatters: 'SQL is the fastest credibility unlock for adjacent ops and analytics roles.',
      evidence: 'Your current task mix already gives you business questions worth answering with data.',
      howToClose: 'Practice 20 foundational SQL queries tied to funnel, workflow, or process questions.',
      resourceTitle: 'SQL for Data Science',
      resourceUrl: 'https://www.coursera.org/learn/sql-for-data-science',
    }),
  ];

  const pivot3SkillGaps = [
    buildSkillGap({
      skillName: 'Change management',
      category: 'Leadership',
      currentStrength: 'You already influence people through projects and communication.',
      requiredLevel: 'Able to drive adoption, handle resistance, and sequence change across teams.',
      gapPriority: 'critical',
      whyItMatters: 'AI transformation roles fail when leaders focus only on tools and ignore adoption behavior.',
      evidence: 'You already navigate stakeholders, expectations, and shifting priorities.',
      howToClose: 'Document one internal rollout plan that includes adoption risks and stakeholder handling.',
      resourceTitle: 'Digital Transformation',
      resourceUrl: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
    }),
    buildSkillGap({
      skillName: 'Vendor evaluation',
      category: 'AI strategy',
      currentStrength: 'You already compare tools and tradeoffs informally in your current work.',
      requiredLevel: 'Able to evaluate AI tools based on use case fit, risk, cost, and rollout readiness.',
      gapPriority: 'medium',
      whyItMatters: 'This is how you move from operator to decision-maker in an AI program role.',
      evidence: 'Your practical exposure to workflows gives you real criteria for what matters in evaluation.',
      howToClose: 'Create a side-by-side scorecard for 3 AI tools relevant to your function.',
      resourceTitle: 'AI for Everyone',
      resourceUrl: 'https://www.coursera.org/learn/ai-for-everyone',
    }),
  ];

  const pivot4SkillGaps = [
    buildSkillGap({
      skillName: 'Stakeholder discovery',
      category: 'Consultative work',
      currentStrength: 'You already translate business needs into practical next steps.',
      requiredLevel: 'Able to run short discovery conversations and turn them into scoped workflow or tooling recommendations.',
      gapPriority: 'critical',
      whyItMatters: 'Fast-cash pivots reward people who can diagnose messy workflow problems quickly and convert trust into scoped work.',
      evidence: 'Your current role already exposes you to repeated friction, handoffs, and stakeholder pain points.',
      howToClose: 'Run 3 mock discovery sessions and turn each into a one-page recommendation memo.',
      resourceTitle: 'The Mom Test',
      resourceUrl: 'https://www.momtestbook.com/',
    }),
    buildSkillGap({
      skillName: 'Workflow prototyping',
      category: 'Automation delivery',
      currentStrength: 'You already know the sequence of work well enough to spot where lightweight automation helps.',
      requiredLevel: 'Able to prototype a small workflow improvement or AI-assisted process in days, not weeks.',
      gapPriority: 'critical',
      whyItMatters: 'Quickly-visible prototypes are what make a cash-recovery path credible to employers, clients, or internal sponsors.',
      evidence: 'Your process familiarity means you can usually spot an obvious first automation candidate.',
      howToClose: 'Build 2 small before-and-after workflow prototypes tied to a real business use case.',
      resourceTitle: 'Zapier Learn',
      resourceUrl: 'https://zapier.com/blog/learn-automation/',
    }),
  ];

  const pivot5SkillGaps = [
    buildSkillGap({
      skillName: 'Systems architecture judgment',
      category: 'Platform thinking',
      currentStrength: 'You already understand how work moves between tools, people, and approvals.',
      requiredLevel: 'Able to reason about durable workflow design, operating models, and where AI should sit inside a broader system.',
      gapPriority: 'critical',
      whyItMatters: 'Long-term platform roles reward people who can shape the system, not just optimize a single step.',
      evidence: 'Your day-to-day exposure to broken handoffs gives you grounded instincts for what a better system needs.',
      howToClose: 'Document one end-to-end workflow redesign with clear system boundaries, owners, and AI decision points.',
      resourceTitle: 'Designing Machine Learning Systems',
      resourceUrl: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    }),
    buildSkillGap({
      skillName: 'Governance and rollout design',
      category: 'Operating model',
      currentStrength: 'You likely already balance speed, quality, and stakeholder expectations informally.',
      requiredLevel: 'Able to define adoption rules, risk controls, and rollout sequencing for AI-enabled workflows.',
      gapPriority: 'medium',
      whyItMatters: 'The platform bet gets stronger when you can connect technical possibility to responsible operating decisions.',
      evidence: 'Your current role already requires judgment about what should be standardized, reviewed, or escalated.',
      howToClose: 'Create a lightweight governance playbook for one AI-assisted workflow and test it with peers.',
      resourceTitle: 'NIST AI Risk Management Framework',
      resourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
    }),
  ];

  const buildPivotWeeks = (pivotTitle, skillGaps) => [
    ...commonWeeks,
    buildWeek({
      weekNumber: 3,
      title: 'Translate your target skills',
      goal: `Map the highest-priority capabilities for ${pivotTitle} into a build order that fits your current schedule.`,
      why: 'This week exists because most pivots get bloated here. If every missing capability feels equally urgent, you will scatter your effort and never build visible leverage fast enough.',
      problem: 'You need to know which skills create immediate employability versus which ones can safely wait, otherwise the roadmap turns into anxious busywork.',
      actions: [
        `Rank the top 5 required skills for ${pivotTitle} by urgency, not interest.`,
        'Choose one critical skill to practice deeply this month.',
        'Pick one lower-effort skill to learn in parallel so momentum stays visible.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You have a practical build order, not just a long list of missing skills, and you can explain why the first skill is first.',
      proof: 'A prioritized skill ladder with one critical focus, one secondary focus, and a short note on what can wait.',
      blockers: ['Trying to master everything at once.', 'Choosing skills based on curiosity instead of hiring value.', 'Mistaking course consumption for signal-building.'],
      catchUp: 'If this week slips, keep only the ranking exercise and lock one critical skill. If you skip that decision, the next few weeks lose focus.',
      encouragement: 'Depth beats breadth early. The goal is not to feel busy. It is to build the one capability jump that changes how the market reads you.',
    }),
    buildWeek({
      weekNumber: 4,
      title: 'Build your first proof asset',
      goal: 'Create a visible artifact that proves you can already operate in the direction of the pivot.',
      why: 'This week exists because proof changes the conversation. Courses can help you learn, but evidence is what makes the pivot feel credible to hiring managers and to you.',
      problem: 'Without evidence, your pivot still looks theoretical. If you skip this week, later networking and applications will lean too hard on potential instead of proof.',
      actions: [
        'Create one artifact tied to the new role: a workflow, analysis, memo, scorecard, or mini case study.',
        'Use at least one of your priority skills inside the artifact.',
        'Write a short explanation of the business problem the asset solves.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have one shareable artifact that demonstrates new-role behavior, not just old-role experience, and you know exactly why it matters.',
      proof: 'A URL, PDF, slide, or doc you would feel comfortable showing a recruiter, plus one sentence explaining the business problem it solves.',
      blockers: ['Overbuilding the asset.', 'Picking a portfolio idea too disconnected from real employer needs.', 'Spending all week polishing instead of shipping a first version.'],
      catchUp: 'Create a rough first version this week and polish later instead of waiting for a perfect portfolio piece. Protect the act of publishing; that is the compounding move.',
      encouragement: 'Momentum becomes real once the work is visible. A strong first proof asset often does more for confidence than another month of private preparation.',
    }),
    buildWeek({
      weekNumber: 5,
      title: 'Install a repeatable practice rhythm',
      goal: 'Turn the pivot from a one-off burst into a system you can sustain for 90 days.',
      why: 'Most people do not fail because the pivot is impossible; they fail because progress is too irregular.',
      problem: 'You need a cadence strong enough to survive work fatigue and life interruptions.',
      actions: [
        'Create two weekly practice blocks in your calendar and protect them like meetings.',
        'Define a default catch-up window for weeks that slip.',
        'Set a single metric that proves you are still moving, even in messy weeks.',
      ],
      timeCommitment: '1–2 hours setup, then recurring',
      successSignal: 'You have a weekly routine with protected time and a fallback plan.',
      proof: 'Calendar blocks plus a visible progress tracker.',
      blockers: ['Treating pivot work as optional.', 'Needing the perfect mood or long stretch of time to start.'],
      catchUp: 'Reduce the week to one protected 45-minute block if your schedule breaks.',
      encouragement: 'Consistency is what makes this feel cared-for instead of chaotic.',
    }),
    buildWeek({
      weekNumber: 6,
      title: 'Pressure-test with real feedback',
      goal: 'Get outside validation before you sink more time into the wrong narrative or proof asset.',
      why: 'Internal confidence matters, but market feedback prevents expensive drift.',
      problem: 'You need to know whether your pivot story and asset make sense to someone who hires or works in the role.',
      actions: [
        'Share your transition brief and proof asset with 2–3 relevant professionals.',
        'Ask what feels credible, what feels weak, and what they would expect next.',
        'Capture all feedback in one place and cluster it into themes.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have external feedback pointing to concrete improvements rather than guesswork.',
      proof: 'Written notes from 2–3 review conversations or message exchanges.',
      blockers: ['Waiting until everything feels finished.', 'Asking vague questions that produce vague advice.'],
      catchUp: 'If live calls are hard, send the materials asynchronously with 3 targeted questions.',
      encouragement: 'Feedback is not a detour. It is how the roadmap becomes smarter.',
    }),
    buildWeek({
      weekNumber: 7,
      title: 'Upgrade your positioning',
      goal: 'Make your LinkedIn, resume, and personal narrative match the direction you are now building toward.',
      why: 'If your materials still describe only your past role, your new capability remains invisible.',
      problem: 'Your public positioning likely lags behind the progress you are making.',
      actions: [
        'Rewrite your headline and summary around the pivot direction.',
        'Add one transition-ready project or asset to your profile or resume.',
        'Rewrite 3 bullet points to emphasize problems solved, systems improved, and outcomes created.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'A recruiter or peer can understand your new direction within 30 seconds of viewing your profile.',
      proof: 'Updated resume and LinkedIn profile.',
      blockers: ['Trying to sound like a finished expert instead of a credible transitioner.', 'Leaving old role language untouched.'],
      catchUp: 'Update headline, summary, and one project first; polish the rest later.',
      encouragement: 'Positioning is not pretending. It is making your trajectory legible.',
    }),
    buildWeek({
      weekNumber: 8,
      title: 'Expand your proof set',
      goal: 'Build a second proof asset so you are not relying on one example to carry the whole pivot.',
      why: 'One strong example creates interest; two or more create pattern recognition.',
      problem: 'You need to show this is repeatable behavior, not a lucky one-off project.',
      actions: [
        'Create a second, smaller proof asset that solves a different kind of business problem.',
        'Make the asset easier to skim than the first one.',
        'Write one sentence explaining how the two assets complement each other.',
      ],
      timeCommitment: '4 hours',
      successSignal: 'You have two proof assets that show range within the target role.',
      proof: 'A second portfolio item or mini-case study.',
      blockers: ['Turning the second asset into a giant build.', 'Choosing an example too similar to the first.'],
      catchUp: 'Create a one-page mini asset instead of a full project if time is tight.',
      encouragement: 'At this point, your portfolio should start feeling like evidence, not aspiration.',
    }),
    buildWeek({
      weekNumber: 9,
      title: 'Start targeted outreach',
      goal: 'Turn the roadmap into real opportunities through focused networking and opportunity mapping.',
      why: 'Transitions accelerate when you stop waiting for perfect readiness and start entering real conversations.',
      problem: 'You need exposure to live openings, decision-makers, and role language as it exists now.',
      actions: [
        'Create a target list of 20 companies or teams that hire this role.',
        'Reach out to 5 people with a specific angle tied to your transition brief or proof asset.',
        'Track response patterns and refine your message after every 3–5 sends.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have started real conversations instead of passively consuming advice.',
      proof: 'A target list plus outreach tracker.',
      blockers: ['Over-personalizing every message.', 'Waiting until your materials feel perfect.'],
      catchUp: 'Send 3 quality messages this week if 5 feels too heavy.',
      encouragement: 'You do not need universal approval. You need a few credible openings.',
    }),
    buildWeek({
      weekNumber: 10,
      title: 'Rehearse the transition story',
      goal: 'Prepare concise, credible answers for why you are pivoting and why now.',
      why: 'A strong transition story reduces doubt in both networking and interviews.',
      problem: 'Without a disciplined narrative, your background can sound fragmented instead of strategic.',
      actions: [
        'Write your answer to “Why this pivot?” in 60 seconds and in 3 minutes.',
        'Practice using your proof assets as supporting evidence, not side notes.',
        'Identify one likely objection and prepare a calm response.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain the pivot clearly without rambling or apologizing for your background.',
      proof: 'A written narrative and one recorded practice run.',
      blockers: ['Overexplaining your whole career history.', 'Sounding defensive about missing experience.'],
      catchUp: 'Nail the 60-second answer first. That is the highest-leverage version.',
      encouragement: 'Clarity creates confidence. Confidence creates momentum.',
    }),
    buildWeek({
      weekNumber: 11,
      title: 'Run live applications or internal bets',
      goal: 'Use everything built so far in real-world decisions: applications, internal stretch work, consulting, or pilot offers.',
      why: 'This is where the roadmap shifts from preparation to conversion.',
      problem: 'You need a bridge from “I could do this” to “someone trusted me to do this.”',
      actions: [
        'Apply to a focused set of roles or propose one internal pilot tied to the new direction.',
        'Customize your narrative using the strongest proof asset for each opportunity.',
        'Log rejections, silence, and positive signals separately to see where friction actually sits.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have entered the market or internal decision cycle with concrete materials, not just intentions.',
      proof: 'Applications sent, pilot proposal submitted, or live opportunity tracker updated.',
      blockers: ['Applying too broadly.', 'Taking silence as proof the pivot is wrong.'],
      catchUp: 'Choose one narrow target segment and submit only 3 strong opportunities.',
      encouragement: 'This week is not about instant wins. It is about real contact with the market.',
    }),
    buildWeek({
      weekNumber: 12,
      title: 'Review, celebrate, and re-sequence',
      goal: 'Close the 90 days with a clear view of what worked, what is still blocked, and what the next 30 days should be.',
      why: 'The roadmap should leave the user feeling supported and proud, not dropped at the end.',
      problem: 'Without reflection, progress feels vague and unfinished even when it is real.',
      actions: [
        'Review your progress against the original transition brief and current opportunities.',
        'Mark which milestones were completed, which slipped, and why.',
        'Choose the next 3 actions for the following month based on evidence, not guilt.',
      ],
      timeCommitment: '2 hours',
      successSignal: 'You have a clear next-month plan and can point to concrete progress from the last 12 weeks.',
      proof: 'A short review note plus next-30-day action list.',
      blockers: ['Judging the roadmap only by final job outcome.', 'Ignoring process wins and evidence gained.'],
      catchUp: 'If multiple weeks slipped, focus on lessons learned and re-sequence the next month rather than trying to “finish everything” at once.',
      encouragement: 'Completion matters. Reflection turns effort into a system you can trust again next month.',
    }),
  ];

  const pivot1 = buildPivot({
    id: slugify(safestPivotTitle) || 'safest-adjacent-role',
    title: safestPivotTitle,
    fitSummary: `This is the lowest-friction path because it keeps you close to the context, business judgment, and stakeholder trust you already have while moving you into a more resilient lane. Instead of staying in the most compressible layer of ${jobTitle}, you shift into a role that values coordination, interpretation, and decision support more explicitly.`,
    outcome: `You stay close to your current field while moving toward a title that is easier to defend as AI adoption changes how execution work gets priced.`,
    decisionFrame: 'safest transition',
    whoThisIsFor: `Best for someone who wants to stay close to ${industry}, protect existing credibility, and turn present-day domain knowledge into a stronger advantage rather than start over.`,
    tradeoffs: [
      'Safer and faster than the other paths, but with less upside than a larger role reset.',
      'Relies on you proving you can redesign work, not just use AI tools casually.',
    ],
    whyThisPathWins: `It keeps the user near their existing context while moving them into a role where domain judgment, cross-functional translation, and workflow redesign matter more than raw output volume.`,
    whatYouAreBettingOn: 'You are betting that domain context plus AI workflow judgment will be valued faster than generic tool familiarity.',
    matchScore: clamp(90 - Math.max(taskBreakdown.length - 4, 0) * 2, 76, 94),
    salaryRange: '$95K – $135K/year',
    salaryDelta: '+18% above median for similar roles with AI execution skills',
    transitionTime: '6–10 weeks with consistent effort (~5hrs/week)',
    difficulty: 'Low',
    strengths: ['Domain knowledge', 'Communication', 'Workflow ownership', 'Context from daily execution'],
    skillGaps: pivot1SkillGaps,
    weeks: buildPivotWeeks(safestPivotTitle, pivot1SkillGaps),
  });

  const pivot2 = buildPivot({
    id: slugify(leveragePivotTitle) || 'operations-analyst',
    title: leveragePivotTitle,
    fitSummary: 'This is an adjacent move for users whose current work already touches reporting, process improvement, or cross-functional execution. It works especially well when your current role has too much recurring coordination and not enough recognized operating leverage.',
    outcome: 'You move into a role that is more resilient because it rewards operational clarity, measurement, and process design over repetitive execution.',
    decisionFrame: 'strongest leverage fit',
    whoThisIsFor: `Best for someone whose current job already sits between teams, systems, reporting, and workflow cleanup, but whose leverage is currently hidden inside “keeping things moving.”`,
    tradeoffs: [
      'More repositioning work than the safest path, because you need to make your operating leverage visible.',
      'Usually lower upside than the most ambitious path, but often more credible in the near term.',
    ],
    whyThisPathWins: 'It turns coordination, reporting, and process judgment into a recognized operating role instead of leaving those strengths buried inside a broader job title.',
    whatYouAreBettingOn: 'You are betting that systems thinking, measurement, and process clarity will outlast repetitive execution work in your field.',
    matchScore: clamp(84 - Math.max(taskBreakdown.length - 5, 0) * 2, 70, 88),
    salaryRange: '$88K – $125K/year',
    salaryDelta: '+12% above median for adjacent operations roles',
    transitionTime: '2–4 months with consistent effort (~6hrs/week)',
    difficulty: 'Medium',
    strengths: ['Cross-functional awareness', 'Process exposure', 'Reporting context'],
    skillGaps: pivot2SkillGaps,
    weeks: buildPivotWeeks(leveragePivotTitle, pivot2SkillGaps),
  });

  const pivot3 = buildPivot({
    id: slugify(fastCashPivotTitle) || 'enablement-lead',
    title: fastCashPivotTitle,
    fitSummary: 'This path is optimized for faster cash recovery. It works when your current background already includes training others, improving how teams work, or turning messy operational knowledge into repeatable playbooks.',
    outcome: 'You move toward a role that can monetize quickly through enablement, internal transformation work, or scoped consulting-style projects tied to workflow improvement.',
    decisionFrame: 'fastest cash recovery',
    whoThisIsFor: 'Best for someone who needs a credible near-term move, can package practical workflow knowledge quickly, and wants a path that can create income without waiting for a full identity reset.',
    tradeoffs: [
      'Can create faster income or internal traction, but may feel less prestigious than the highest-upside paths at first.',
      'You need tangible proof assets quickly, because this path is won through visible usefulness rather than title prestige.',
    ],
    whyThisPathWins: 'It turns hard-earned practical knowledge into something employers or clients can buy quickly: clearer processes, faster onboarding, and better AI-assisted execution.',
    whatYouAreBettingOn: 'You are betting that teams will pay sooner for workflow clarity and enablement than for a bigger title leap.',
    matchScore: clamp(81 - Math.max(taskBreakdown.length - 5, 0) * 2, 69, 86),
    salaryRange: '$92K – $132K/year',
    salaryDelta: '+10% above median, with room for contract or advisory income',
    transitionTime: '4–8 weeks with focused proof-building (~6hrs/week)',
    difficulty: 'Medium',
    strengths: ['Practical process knowledge', 'Communication', 'Training instinct', 'Operational empathy'],
    skillGaps: pivot4SkillGaps,
    weeks: buildPivotWeeks(fastCashPivotTitle, pivot4SkillGaps),
  });

  const pivot4 = buildPivot({
    id: slugify(highUpsidePivotTitle) || 'ai-program-manager',
    title: highUpsidePivotTitle,
    fitSummary: 'This is the more ambitious path for users who can already influence people, coordinate work, and operate with strategic context. It is strongest when your current role already includes translation between teams, priorities, and systems.',
    outcome: 'You move from doing the work into helping teams adopt AI, sequence change well, and build operating leverage across functions.',
    decisionFrame: 'highest upside',
    whoThisIsFor: 'Best for someone with visible stakeholder range, stronger strategic instincts, and enough confidence to trade a safer adjacent move for a more ambitious role shift.',
    tradeoffs: [
      'Highest upside of the three, but it asks for more positioning work and more visible proof of strategic influence.',
      'Takes longer to make credible if your current resume still reads as primarily execution-only.',
    ],
    whyThisPathWins: 'It gives the user the clearest route to higher leverage and compensation by moving them from doing the work into shaping how teams adopt and govern it.',
    whatYouAreBettingOn: 'You are betting that cross-functional leadership, AI adoption judgment, and change sequencing will become scarcer and more valuable than direct execution alone.',
    matchScore: clamp(78 - Math.max(taskBreakdown.length - 5, 0) * 2, 64, 83),
    salaryRange: '$110K – $155K/year',
    salaryDelta: '+28% above median for your current field',
    transitionTime: '4–6 months with consistent effort (~8hrs/week)',
    difficulty: 'High',
    strengths: ['Stakeholder communication', 'Project context', 'Execution insight'],
    skillGaps: pivot3SkillGaps,
    weeks: buildPivotWeeks(highUpsidePivotTitle, pivot3SkillGaps),
  });

  const pivot5 = buildPivot({
    id: slugify(longTermPivotTitle) || 'workflow-automation-consultant',
    title: longTermPivotTitle,
    fitSummary: 'This is the longer compounding bet. It fits people who can already see patterns across tools, teams, and recurring work, and who want to move toward designing the operating system instead of only improving one job at a time.',
    outcome: 'You position yourself for a role family that compounds as organizations keep redesigning workflows around AI, automation, governance, and system ownership.',
    decisionFrame: 'long-term platform bet',
    whoThisIsFor: 'Best for someone willing to invest in a longer setup period in exchange for a role family that should keep getting stronger as AI adoption deepens.',
    tradeoffs: [
      'The setup period is longer because you need stronger systems-level proof, not just one-off wins.',
      'This path can feel less immediately legible than a safer adjacent role unless you explain the system value clearly.',
    ],
    whyThisPathWins: 'It shifts the user into a role family built around workflow architecture, durable process leverage, and the ability to redesign how work happens as tools keep changing.',
    whatYouAreBettingOn: 'You are betting that platform-level workflow design and governance will compound faster than any single tool specialization.',
    matchScore: clamp(76 - Math.max(taskBreakdown.length - 5, 0) * 2, 65, 82),
    salaryRange: '$115K – $165K/year',
    salaryDelta: '+22% above median for transformation-oriented roles',
    transitionTime: '4–7 months with consistent systems-level proof (~7hrs/week)',
    difficulty: 'High',
    strengths: ['Systems awareness', 'Pattern recognition', 'Cross-team judgment'],
    skillGaps: pivot5SkillGaps,
    weeks: buildPivotWeeks(longTermPivotTitle, pivot5SkillGaps),
  });

  const pivots = [pivot1, pivot2, pivot3, pivot4, pivot5];
  const featuredPivot = pivot1;

  return {
    locale,
    generation_stage: 'full_complete',
    schema_version: 'pivotiq-structured-report-v1',
    generated_at: new Date().toISOString(),
    profile: {
      locale,
      job_title: jobTitle,
      industry,
      tasks: selectedTasks,
      selected_tasks: Array.isArray(intakeProfile?.selected_tasks) ? intakeProfile.selected_tasks : selectedTasks.map((task) => ({ label: task })),
      primary_tasks: primaryTasks,
      clarifiers: {
        goal_now: goalNow,
        timeline_urgency: timelineUrgency,
        years_experience_band: yearsExperienceBand,
        location_preference: locationPreference,
        ai_maturity: aiMaturity,
        technical_capability: technicalCapability,
        salary_tolerance: salaryTolerance,
        proof_state: proofState,
        role_blend: roleBlend,
        management_scope: managementScope,
        decision_scope: decisionScope,
        domain_focus: domainFocus,
        core_systems: coreSystems,
      },
      linkedin_profile_url: intakeProfile?.linkedin_profile_url || null,
    },
    summary: {
      overall_score: overallScore,
      risk_level: riskLevel,
      displacement_timeline: displacementTimeline,
      narrative: `${jobTitle} in ${industry} is most exposed where work is repeatable, document-heavy, or easy to accelerate with AI. The biggest pressure points here are ${topTasks.join(' and ')}, with special attention to your time-heavy work in ${primaryTaskSummary || topTasks.join(' and ')}. But this is not a blanket “your role is disappearing” story. It is a narrower story about which layers of the role are weakening first, and which layers still become more valuable when teams need judgment, coordination, and ownership.`,
      what_this_means: `The right response is not a vague upskilling sprint. It is a sequenced pivot plan that starts with the riskiest work in your current ${roleBlendLabel} role and maps each problem to a visible, employable capability shift. ${strengthLine}${leadershipContext}`,
    },
    interpretation: {
      role_read: `Your role is being repriced unevenly. The repetitive, document-heavy layer of the work is weakening first, while the parts that depend on prioritization, judgment, and cross-functional trust still carry leverage.`,
      durable_advantages: [
        `You already understand the business context behind ${primaryTasks[0] || selectedTasks[0] || 'the work'}, which is harder to replace than the output itself.`,
        roleBlend === 'strategy'
          ? 'You likely have stronger decision-framing instincts than the average specialist moving into AI-heavy workflows.'
          : 'You are close enough to the day-to-day work to spot where AI helps, where it breaks, and where oversight still matters.',
        managementScope && managementScope !== 'none'
          ? 'You can combine execution changes with people judgment, which becomes more valuable as teams adopt AI unevenly.'
          : 'You already have transferable proof in the form of stakeholder communication, coordination, and delivery judgment.',
      ],
      stop_assuming: `Do not treat this as proof that your whole ${jobTitle} role is fading. The stronger conclusion is that some tasks inside it are losing value faster than the judgment layer around them.`,
    },
    task_breakdown: taskBreakdown,
    pivots,
    skill_gaps: featuredPivot.skill_gaps,
    roadmap: {
      cadence: 'weekly',
      total_weeks: 12,
      weeks: featuredPivot.roadmap.weeks,
    },
    next_move: {
      title: locale === 'nl' ? 'Jouw stap deze week' : locale === 'de' ? 'Dein Schritt diese Woche' : 'Your move this week',
      explanation: `Pick one of your top weekly tasks${primaryTasks[0] ? `, starting with ${primaryTasks[0]}` : ''}, and rebuild it with AI before Friday. Measure the time saved, note what quality controls were still needed, and use that as the first proof point in your transition story. That one experiment gives you a clearer answer than another week of passive research.`,
    },
    decision: buildDecisionSignal({ overall_score: overallScore }, featuredPivot),
    career_roi: buildCareerRoi({ overall_score: overallScore }, featuredPivot, { clarifiers }),
    stay_and_advance: buildStayAndAdvance({
      job_title: jobTitle,
      industry,
      primary_tasks: primaryTasks,
      tasks: selectedTasks,
    }, { overall_score: overallScore }, featuredPivot, locale),
    first_30_days: buildFirst30Days({
      primary_tasks: primaryTasks,
      tasks: selectedTasks,
    }, featuredPivot, { weeks: featuredPivot.roadmap.weeks }, {
      explanation: `Pick one of your top weekly tasks${primaryTasks[0] ? `, starting with ${primaryTasks[0]}` : ''}, and rebuild it with AI before Friday. Measure the time saved, note what quality controls were still needed, and use that as the first proof point in your transition story. That one experiment gives you a clearer answer than another week of passive research.`,
    }),
  };
}

export function normalizeReportData(reportData, fallbackProfile = null) {
  if (!reportData || typeof reportData !== 'object') return null;

  const profile = reportData.profile || fallbackProfile || {};
  const locale = reportData.locale || profile.locale || 'en';
  const fallback = buildDemoReportData(
    profile.job_title || profile.jobTitle || '',
    profile.industry || '',
    Array.isArray(profile.tasks) ? profile.tasks : [],
    profile,
    locale
  );
  const incomingPivots = Array.isArray(reportData.pivots) ? reportData.pivots : [];
  const fallbackPivots = Array.isArray(fallback.pivots) ? fallback.pivots : [];
  let pivots = DEFAULT_PIVOT_DECISION_FRAMES.map((frame, index) => {
    const matchingIncoming = incomingPivots.find((pivot) => normalizeText(pivot?.decision_frame) === frame);
    const positionalIncoming = incomingPivots[index];
    const basePivot = fallbackPivots[index] || fallbackPivots[0] || null;
    const sourcePivot = matchingIncoming || positionalIncoming || basePivot;

    if (!sourcePivot) return null;

    return {
      ...(basePivot || {}),
      ...sourcePivot,
      id: hasMeaningfulPivotId(sourcePivot.id) ? sourcePivot.id : slugify(sourcePivot.title || basePivot?.title) || basePivot?.id,
      title: polishPivotTitle(sourcePivot.title || basePivot?.title || ''),
      decision_frame: frame,
      tradeoffs: Array.isArray(sourcePivot.tradeoffs) && sourcePivot.tradeoffs.length
        ? sourcePivot.tradeoffs
        : basePivot?.tradeoffs || [],
      skill_gaps: Array.isArray(sourcePivot.skill_gaps) && sourcePivot.skill_gaps.length
        ? sourcePivot.skill_gaps
        : basePivot?.skill_gaps || [],
      strengths_to_leverage: Array.isArray(sourcePivot.strengths_to_leverage) && sourcePivot.strengths_to_leverage.length
        ? sourcePivot.strengths_to_leverage
        : basePivot?.strengths_to_leverage || [],
      roadmap: {
        weeks: (() => {
          const resolvedTitle = polishPivotTitle(sourcePivot.title || basePivot?.title || '');
          const sourceWeeks = normalizeArray(sourcePivot?.roadmap?.weeks);
          if (sourceWeeks.length >= 12 && roadmapMentionsPivotTitle(sourceWeeks, resolvedTitle)) {
            return sourceWeeks;
          }

          return buildSyntheticPivotWeeks({
            pivotTitle: resolvedTitle,
            decisionFrame: frame,
            jobTitle: profile.job_title || profile.jobTitle || '',
            industry: profile.industry || '',
            skillGaps: Array.isArray(sourcePivot.skill_gaps) && sourcePivot.skill_gaps.length
              ? sourcePivot.skill_gaps
              : basePivot?.skill_gaps || [],
          });
        })(),
      },
    };
  }).filter(Boolean);

  if (incomingPivots.some((pivot) => pivot?.live_market_signal?.ranking_score || pivot?.ranking_reason || pivot?.original_match_score)) {
    const profileTasks = [
      ...(Array.isArray(profile.tasks) ? profile.tasks : []),
      ...(Array.isArray(profile.primary_tasks) ? profile.primary_tasks : []),
    ];
    const profileRoleFamily = inferRoleFamilyFromProfile(
      profile.job_title || profile.jobTitle || '',
      profile.industry || '',
      profileTasks,
      profile.clarifiers || null
    );
    pivots = [...pivots].sort((left, right) => {
      const rightScore = Number(right?.match_score || right?.live_market_signal?.ranking_score || 0);
      const leftScore = Number(left?.match_score || left?.live_market_signal?.ranking_score || 0);
      if (rightScore !== leftScore) return rightScore - leftScore;
      const rightOpenings = Number(right?.live_market_signal?.matched_openings_count || 0);
      const leftOpenings = Number(left?.live_market_signal?.matched_openings_count || 0);
      if (rightOpenings !== leftOpenings) return rightOpenings - leftOpenings;
      const rightFit = Number(right?.live_market_signal?.profile_fit_score || 0);
      const leftFit = Number(left?.live_market_signal?.profile_fit_score || 0);
      if (rightFit !== leftFit) return rightFit - leftFit;
      const rightRoleTie = scoreRoleNativeTitleTieBreak(right?.title, profileRoleFamily);
      const leftRoleTie = scoreRoleNativeTitleTieBreak(left?.title, profileRoleFamily);
      if (rightRoleTie !== leftRoleTie) return rightRoleTie - leftRoleTie;
      return String(left?.title || '').localeCompare(String(right?.title || ''));
    });
    pivots = refreshFinalTopPivotRankingLanguage(pivots);
  }

  const defaultPivot = pivots[0] || null;
  const taskBreakdownScores = normalizeArray(reportData.task_breakdown)
    .map((item) => Number(item?.risk_score || 0))
    .filter((score) => Number.isFinite(score) && score > 0);
  const fallbackOverallScore = taskBreakdownScores.length
    ? clamp(Math.round(taskBreakdownScores.reduce((sum, score) => sum + score, 0) / taskBreakdownScores.length), 25, 88)
    : 60;
  const summary = {
    overall_score: clamp(Number(reportData.summary?.overall_score || fallbackOverallScore), 25, 88),
    risk_level: reportData.summary?.risk_level || 'MODERATE',
    displacement_timeline: reportData.summary?.displacement_timeline || '',
    narrative: reportData.summary?.narrative || '',
    what_this_means: reportData.summary?.what_this_means || '',
  };
  const decision = reportData.decision && typeof reportData.decision === 'object'
    ? { ...buildDecisionSignal(summary, defaultPivot), ...reportData.decision }
    : buildDecisionSignal(summary, defaultPivot);
  const nextMove = buildNextMove(profile, defaultPivot, locale);
  const careerRoi = reportData.career_roi && typeof reportData.career_roi === 'object'
    ? { ...buildCareerRoi(summary, defaultPivot, profile), ...reportData.career_roi }
    : buildCareerRoi(summary, defaultPivot, profile);
  const stayAndAdvance = reportData.stay_and_advance && typeof reportData.stay_and_advance === 'object'
    ? { ...buildStayAndAdvance(profile, summary, defaultPivot, locale), ...reportData.stay_and_advance }
    : buildStayAndAdvance(profile, summary, defaultPivot, locale);
  const stayPath = buildStayAdvancePath(profile, summary, stayAndAdvance, defaultPivot, locale);
  const first30Days = buildFirst30Days(profile, defaultPivot, { weeks: defaultPivot?.roadmap?.weeks || [] }, nextMove);

  const normalizedReport = {
    locale,
    generation_stage: reportData.generation_stage || fallback.generation_stage || 'full_complete',
    schema_version: reportData.schema_version || 'pivotiq-structured-report-v1',
    generated_at: reportData.generated_at || new Date().toISOString(),
    profile: {
      job_title: profile.job_title || profile.jobTitle || '',
      industry: profile.industry || '',
      tasks: Array.isArray(profile.tasks) ? profile.tasks : [],
      selected_tasks: Array.isArray(profile.selected_tasks) ? profile.selected_tasks : [],
      primary_tasks: Array.isArray(profile.primary_tasks) ? profile.primary_tasks : [],
      clarifiers: profile.clarifiers && typeof profile.clarifiers === 'object' ? profile.clarifiers : {},
      linkedin_profile_url: profile.linkedin_profile_url || null,
    },
    summary,
    interpretation: {
      role_read: reportData.interpretation?.role_read || '',
      durable_advantages: Array.isArray(reportData.interpretation?.durable_advantages) ? reportData.interpretation.durable_advantages : [],
      stop_assuming: reportData.interpretation?.stop_assuming || '',
    },
    task_breakdown: Array.isArray(reportData.task_breakdown)
      ? reportData.task_breakdown.map((task) => ({
          ...task,
          task_name: translateFallbackTask(locale, task.task_name),
        }))
      : [],
    pivots: pivots.map((pivot) => ({
      ...pivot,
      decision_frame: pivot.decision_frame || 'safest transition',
      who_this_is_for: pivot.who_this_is_for || '',
      tradeoffs: Array.isArray(pivot.tradeoffs) ? pivot.tradeoffs : [],
      why_this_path_wins: pivot.why_this_path_wins || '',
      what_you_are_betting_on: pivot.what_you_are_betting_on || '',
      learning_path: Array.isArray(pivot.learning_path) && pivot.learning_path.length
        ? pivot.learning_path
        : buildLearningPath(pivot.skill_gaps, profile),
    })),
    skill_gaps: Array.isArray(reportData.skill_gaps)
      ? reportData.skill_gaps
      : defaultPivot?.skill_gaps || [],
    roadmap: {
      cadence: reportData.roadmap?.cadence || 'weekly',
      total_weeks: Number(reportData.roadmap?.total_weeks || defaultPivot?.roadmap?.weeks?.length || 12),
      weeks: Array.isArray(reportData.roadmap?.weeks)
        ? reportData.roadmap.weeks
        : defaultPivot?.roadmap?.weeks || [],
    },
    next_move: nextMove,
    decision,
    career_roi: careerRoi,
    stay_and_advance: {
      headline: stayAndAdvance?.headline || '',
      recommendation: stayAndAdvance?.recommendation || '',
      rationale: stayAndAdvance?.rationale || '',
      urgency_label: stayAndAdvance?.urgency_label || '',
      leverage_opportunities: Array.isArray(stayAndAdvance?.leverage_opportunities) ? stayAndAdvance.leverage_opportunities : [],
      promotion_path: {
        next_title: stayAndAdvance?.promotion_path?.next_title || '',
        why_it_opens: stayAndAdvance?.promotion_path?.why_it_opens || '',
        timeline: stayAndAdvance?.promotion_path?.timeline || '',
        signals_to_build: Array.isArray(stayAndAdvance?.promotion_path?.signals_to_build) ? stayAndAdvance.promotion_path.signals_to_build : [],
      },
      work_redesign: {
        automate: Array.isArray(stayAndAdvance?.work_redesign?.automate) ? stayAndAdvance.work_redesign.automate : [],
        augment: Array.isArray(stayAndAdvance?.work_redesign?.augment) ? stayAndAdvance.work_redesign.augment : [],
        protect: Array.isArray(stayAndAdvance?.work_redesign?.protect) ? stayAndAdvance.work_redesign.protect : [],
        lead: Array.isArray(stayAndAdvance?.work_redesign?.lead) ? stayAndAdvance.work_redesign.lead : [],
      },
      thirty_day_plan: {
        this_week: Array.isArray(stayAndAdvance?.thirty_day_plan?.this_week) ? stayAndAdvance.thirty_day_plan.this_week : [],
        this_month: Array.isArray(stayAndAdvance?.thirty_day_plan?.this_month) ? stayAndAdvance.thirty_day_plan.this_month : [],
        metric_to_move: stayAndAdvance?.thirty_day_plan?.metric_to_move || '',
        leadership_narrative: stayAndAdvance?.thirty_day_plan?.leadership_narrative || '',
        proof_asset: {
          title: stayAndAdvance?.thirty_day_plan?.proof_asset?.title || '',
          description: stayAndAdvance?.thirty_day_plan?.proof_asset?.description || '',
          why_it_matters: stayAndAdvance?.thirty_day_plan?.proof_asset?.why_it_matters || '',
        },
      },
      ai_leverage_playbook: {
        headline: stayAndAdvance?.ai_leverage_playbook?.headline || '',
        operator_shift: stayAndAdvance?.ai_leverage_playbook?.operator_shift || '',
        plays: Array.isArray(stayAndAdvance?.ai_leverage_playbook?.plays) ? stayAndAdvance.ai_leverage_playbook.plays : [],
        weekly_operating_system: Array.isArray(stayAndAdvance?.ai_leverage_playbook?.weekly_operating_system) ? stayAndAdvance.ai_leverage_playbook.weekly_operating_system : [],
        promotion_signals: Array.isArray(stayAndAdvance?.ai_leverage_playbook?.promotion_signals) ? stayAndAdvance.ai_leverage_playbook.promotion_signals : [],
      },
      ai_this_week_plan: {
        headline: stayAndAdvance?.ai_this_week_plan?.headline || '',
        workflow: stayAndAdvance?.ai_this_week_plan?.workflow || '',
        systems: Array.isArray(stayAndAdvance?.ai_this_week_plan?.systems) ? stayAndAdvance.ai_this_week_plan.systems : [],
        ai_role: stayAndAdvance?.ai_this_week_plan?.ai_role || '',
        human_checkpoint: stayAndAdvance?.ai_this_week_plan?.human_checkpoint || '',
        output: stayAndAdvance?.ai_this_week_plan?.output || '',
        metric: stayAndAdvance?.ai_this_week_plan?.metric || '',
        stop_condition: stayAndAdvance?.ai_this_week_plan?.stop_condition || '',
        share_with_manager: stayAndAdvance?.ai_this_week_plan?.share_with_manager || '',
      },
      promotion_conversation_pack: {
        meeting_goal: stayAndAdvance?.promotion_conversation_pack?.meeting_goal || '',
        talk_track: Array.isArray(stayAndAdvance?.promotion_conversation_pack?.talk_track) ? stayAndAdvance.promotion_conversation_pack.talk_track : [],
        evidence_to_bring: Array.isArray(stayAndAdvance?.promotion_conversation_pack?.evidence_to_bring) ? stayAndAdvance.promotion_conversation_pack.evidence_to_bring : [],
        ask: stayAndAdvance?.promotion_conversation_pack?.ask || '',
        manager_script: stayAndAdvance?.promotion_conversation_pack?.manager_script || '',
        what_not_to_say: Array.isArray(stayAndAdvance?.promotion_conversation_pack?.what_not_to_say) ? stayAndAdvance.promotion_conversation_pack.what_not_to_say : [],
        next_scope_options: Array.isArray(stayAndAdvance?.promotion_conversation_pack?.next_scope_options) ? stayAndAdvance.promotion_conversation_pack.next_scope_options : [],
      },
    },
    stay_path: {
      ...stayPath,
      tradeoffs: Array.isArray(stayPath?.tradeoffs) ? stayPath.tradeoffs : [],
      strengths_to_leverage: Array.isArray(stayPath?.strengths_to_leverage) ? stayPath.strengths_to_leverage : [],
      skill_gaps: Array.isArray(stayPath?.skill_gaps) ? stayPath.skill_gaps : [],
      learning_path: Array.isArray(stayPath?.learning_path) && stayPath.learning_path.length
        ? stayPath.learning_path
        : buildLearningPath(stayPath?.skill_gaps, profile),
      roadmap: {
        weeks: Array.isArray(stayPath?.roadmap?.weeks) ? stayPath.roadmap.weeks : [],
      },
    },
    first_30_days: {
      next_7_days: Array.isArray(first30Days?.next_7_days) ? first30Days.next_7_days : [],
      next_30_days: Array.isArray(first30Days?.next_30_days) ? first30Days.next_30_days : [],
      avoid: Array.isArray(first30Days?.avoid) ? first30Days.avoid : [],
      proof_asset: {
        title: first30Days?.proof_asset?.title || '',
        description: first30Days?.proof_asset?.description || '',
        why_it_matters: first30Days?.proof_asset?.why_it_matters || '',
      },
    },
    stay_proof_asset_builder: reportData?.stay_proof_asset_builder && typeof reportData.stay_proof_asset_builder === 'object'
      ? reportData.stay_proof_asset_builder
      : buildStayProofAssetBuilder({
          ...reportData,
          profile,
          stay_and_advance: stayAndAdvance,
        }),
    refresh_summary: reportData?.refresh_summary && typeof reportData.refresh_summary === 'object'
      ? {
          headline: reportData.refresh_summary.headline || '',
          body: reportData.refresh_summary.body || '',
          what_changed: Array.isArray(reportData.refresh_summary.what_changed) ? reportData.refresh_summary.what_changed : [],
          previous_primary: reportData.refresh_summary.previous_primary || '',
          current_primary: reportData.refresh_summary.current_primary || '',
          next_action: reportData.refresh_summary.next_action || '',
          refreshed_at: reportData.refresh_summary.refreshed_at || reportData.refreshed_at || null,
          confidence_delta: reportData.refresh_summary.confidence_delta || '',
          change_drivers: Array.isArray(reportData.refresh_summary.change_drivers) ? reportData.refresh_summary.change_drivers : [],
          inputs_considered: Array.isArray(reportData.refresh_summary.inputs_considered) ? reportData.refresh_summary.inputs_considered : [],
          comparison_rows: Array.isArray(reportData.refresh_summary.comparison_rows) ? reportData.refresh_summary.comparison_rows : [],
          sections_updated: Array.isArray(reportData.refresh_summary.sections_updated) ? reportData.refresh_summary.sections_updated : [],
        }
      : null,
    refresh_count: Number(reportData?.refresh_count || 0),
    refreshed_at: reportData?.refreshed_at || null,
  };

  const withPaidValue = addPaidValueFields(normalizedReport);
  const qualityGated = applyReportQualityGate(withPaidValue);
  const stayRepaired = applyStayAndAdvanceRepair(qualityGated);
  return addPaidValueFields(stayRepaired);
}

export function reportDataToEmailHtml(reportData) {
  const normalized = normalizeReportData(reportData);
  if (!normalized) return '';

  const { profile, summary, pivots, roadmap, next_move: nextMove, paid_value_summary: paidValue, proof_asset_builder: proofBuilder } = normalized;
  const featuredPivot = pivots[0];
  const topWeeks = (roadmap.weeks || []).slice(0, 4);

  return `
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#9A3412;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">YOUR ACTION PLAN</p>
      <h2 style="color:#111827;font-size:24px;font-weight:900;margin:0 0 8px;">${paidValue?.headline || `Your best move: ${featuredPivot?.title || 'build visible proof'}`}</h2>
      <p style="color:#4B5563;font-size:14px;line-height:1.8;margin:0 0 12px;">${paidValue?.why_this_move || featuredPivot?.fit_summary || ''}</p>
      <div style="display:block;background:white;border:1px solid #FED7AA;border-radius:16px;padding:16px;margin-top:14px;">
        <p style="color:#9A3412;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">First proof asset</p>
        <p style="color:#111827;font-size:16px;font-weight:800;margin:0 0 6px;">${paidValue?.first_proof_asset || proofBuilder?.title || 'Build one visible proof asset'}</p>
        <p style="color:#6B7280;font-size:13px;line-height:1.7;margin:0;">${proofBuilder?.first_action || 'Spend 60 minutes outlining a real business problem and the artifact you will build to prove the pivot.'}</p>
      </div>
      <div style="display:block;background:white;border:1px solid #FED7AA;border-radius:16px;padding:16px;margin-top:12px;">
        <p style="color:#9A3412;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Start learning here</p>
        <p style="color:#111827;font-size:14px;font-weight:800;margin:0;">${paidValue?.first_learning_step || 'Start with the first visible skill gap, then turn it into proof.'}</p>
      </div>
    </div>
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#6366F1;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">WHAT WE FOUND</p>
      <h2 style="color:white;font-size:24px;font-weight:900;margin:0 0 6px;">${summary.overall_score} · ${summary.risk_level} risk</h2>
      <p style="color:#9CA3AF;font-size:14px;line-height:1.7;margin:0 0 10px;">${profile.job_title} · ${profile.industry}</p>
      <p style="color:#C4C9D4;font-size:14px;line-height:1.8;margin:0 0 12px;">${summary.narrative}</p>
      <p style="color:#818CF8;font-size:13px;line-height:1.7;margin:0;">⏱ ${summary.displacement_timeline}</p>
    </div>
    ${
      featuredPivot
        ? `
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#10B981;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">BEST FIT PIVOT</p>
      <h3 style="color:white;font-size:22px;font-weight:800;margin:0 0 8px;">${featuredPivot.title}</h3>
      <p style="color:#C4C9D4;font-size:14px;line-height:1.8;margin:0 0 12px;">${featuredPivot.fit_summary}</p>
      <p style="color:#9CA3AF;font-size:13px;line-height:1.7;margin:0;">${featuredPivot.salary_range} · ${featuredPivot.transition_time} · ${featuredPivot.difficulty} difficulty</p>
    </div>`
        : ''
    }
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#F97316;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">FIRST MILESTONES</p>
      ${topWeeks.map((week) => `
        <div style="padding:14px 0;border-top:1px solid #1A2540;">
          <div style="color:white;font-size:15px;font-weight:700;margin-bottom:4px;">Week ${week.week_number}: ${week.title}</div>
          <div style="color:#818CF8;font-size:12px;font-weight:700;margin-bottom:6px;">Goal: ${week.goal}</div>
          <div style="color:#C4C9D4;font-size:13px;line-height:1.7;">${week.why_this_week}</div>
        </div>
      `).join('')}
    </div>
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#F1F5F9;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">YOUR MOVE THIS WEEK</p>
      <p style="color:#C7D2FE;font-size:14px;line-height:1.8;margin:0;">${nextMove.explanation}</p>
    </div>
    ${
      proofBuilder
        ? `
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#10B981;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">PROOF ASSET BUILDER</p>
      <h3 style="color:white;font-size:20px;font-weight:800;margin:0 0 8px;">${proofBuilder.title}</h3>
      <p style="color:#C4C9D4;font-size:14px;line-height:1.8;margin:0 0 12px;">${proofBuilder.objective}</p>
      <ul style="margin:0;padding-left:18px;color:#C4C9D4;font-size:13px;line-height:1.8;">
        ${(proofBuilder.checklist || []).slice(0, 4).map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>`
        : ''
    }
  `;
}
