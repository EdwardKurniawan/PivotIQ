import { buildDemoReportData, hydrateModelReportData, normalizeReportData, parseModelJson, slugify } from './report-data.js';
import { enrichReportLearningResources } from './course-catalog.js';
import { groundReportWithLiveJobMarket } from './job-gap-analysis.js';
import { appendFile } from 'node:fs/promises';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const PREVIEW_OPENROUTER_MODEL =
  process.env.OPENROUTER_PREVIEW_MODEL ||
  process.env.OPENROUTER_MODEL ||
  DEFAULT_OPENROUTER_MODEL;
const FULL_OPENROUTER_MODEL =
  process.env.OPENROUTER_FULL_MODEL ||
  process.env.OPENROUTER_MODEL ||
  DEFAULT_OPENROUTER_MODEL;
const DEBUG_LOG_PATH = '/tmp/pivotiq-generate-report.log';

function resolveOpenRouterConfig(stage) {
  const model = stage === 'full' ? FULL_OPENROUTER_MODEL : PREVIEW_OPENROUTER_MODEL;
  const isNemotronNano = model.includes(DEFAULT_OPENROUTER_MODEL);

  const maxTokens = stage === 'full'
    ? isNemotronNano
      ? Math.min(Number(process.env.OPENROUTER_FULL_MAX_TOKENS || process.env.OPENROUTER_MAX_TOKENS || 9000), 9000)
      : Number(process.env.OPENROUTER_FULL_MAX_TOKENS || process.env.OPENROUTER_MAX_TOKENS || 7000)
    : isNemotronNano
      ? Math.min(Number(process.env.OPENROUTER_PREVIEW_MAX_TOKENS || process.env.OPENROUTER_MAX_TOKENS || 8000), 8000)
      : Number(process.env.OPENROUTER_PREVIEW_MAX_TOKENS || process.env.OPENROUTER_MAX_TOKENS || 7000);

  const timeoutMs = stage === 'full'
    ? isNemotronNano
      ? Math.max(Number(process.env.OPENROUTER_FULL_TIMEOUT_MS || process.env.OPENROUTER_TIMEOUT_MS || 120000), 120000)
      : Number(process.env.OPENROUTER_FULL_TIMEOUT_MS || process.env.OPENROUTER_TIMEOUT_MS || 35000)
    : isNemotronNano
      ? Math.max(Number(process.env.OPENROUTER_PREVIEW_TIMEOUT_MS || process.env.OPENROUTER_TIMEOUT_MS || 90000), 90000)
      : Number(process.env.OPENROUTER_PREVIEW_TIMEOUT_MS || process.env.OPENROUTER_TIMEOUT_MS || 35000);

  return { model, maxTokens, timeoutMs };
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'role',
  'the',
  'to',
  'with',
]);

const PIVOT_DECISION_FRAMES = [
  'safest transition',
  'strongest leverage fit',
  'fastest cash recovery',
  'highest upside',
  'long-term platform bet',
];

const SPECIALIZED_ROLE_KEYWORDS = {
  legal: ['legal', 'contract', 'compliance', 'governance', 'risk', 'clm'],
  procurement: ['procurement', 'sourcing', 'supplier', 'supply', 'vendor', 'purchasing'],
  education: ['education', 'learning', 'enablement', 'training', 'onboarding'],
  finance: ['finance', 'financial', 'fp&a', 'fpa', 'forecast', 'planning', 'pricing', 'commercial'],
  operations: ['operations', 'program', 'project', 'delivery', 'execution', 'pmo', 'change'],
  hr: ['people', 'hr', 'human resources', 'talent', 'workforce', 'employee'],
};

const FULL_REPORT_SCHEMA_GUIDE = `{
  "schema_version": "pivotiq-structured-report-v1",
  "generated_at": "ISO-8601 timestamp",
  "profile": {
    "job_title": "string",
    "industry": "string",
    "tasks": ["string"],
    "selected_tasks": [
      {
        "task_id": "string",
        "label": "string",
        "category": "string",
        "source": "recommended | search | custom | linkedin"
      }
    ],
    "primary_tasks": ["string"],
    "clarifiers": {
      "goal_now": "stay_and_advance | hybrid_transition | active_pivot | not_sure | null",
      "timeline_urgency": "within_3_months | within_6_months | within_12_months | exploring_only | null",
      "years_experience_band": "0_2 | 3_5 | 6_10 | 11_plus | null",
      "location_preference": "netherlands | europe | united_states | global_remote | other | null",
      "ai_maturity": "never_use_it | occasionally | weekly | repeatable_workflows | team_level_adoption | null",
      "role_blend": "execution | mixed | strategy",
      "management_scope": "none | small-team | larger-team | null",
      "decision_scope": "internal-ops | customer-revenue | regulated-high-stakes | null",
      "domain_focus": "string | null",
      "core_systems": ["string"]
    },
    "linkedin_profile_url": "string | null"
  },
  "summary": {
    "overall_score": 0,
    "risk_level": "HIGH | MODERATE | LOW",
    "displacement_timeline": "string",
    "narrative": "2-4 sentences explaining the risk",
    "what_this_means": "1-3 sentences connecting the problem to the solution"
  },
  "interpretation": {
    "role_read": "2-4 sentences interpreting what this pattern says about the user's role",
    "durable_advantages": ["string", "string", "string"],
    "stop_assuming": "1-3 sentences challenging the wrong conclusion the user may be drawing"
  },
  "task_breakdown": [
    {
      "task_name": "string",
      "risk_score": 0,
      "explanation": "1-2 detailed sentences"
    }
  ],
  "pivots": [
    {
      "id": "slug-like-string",
      "title": "string",
      "decision_frame": "safest transition | strongest leverage fit | fastest cash recovery | highest upside | long-term platform bet",
      "fit_summary": "2-4 sentences connecting past experience to future role",
      "outcome": "1-3 sentences describing the payoff of this pivot",
      "who_this_is_for": "2-4 sentences describing who this path fits best",
      "tradeoffs": ["string", "string"],
      "why_this_path_wins": "2-4 sentences explaining why this path is strategically strong",
      "what_you_are_betting_on": "1-3 sentences naming the underlying bet behind this path",
      "match_score": 0,
      "salary_range": "string",
      "salary_delta": "string",
      "transition_time": "string",
      "difficulty": "Low | Medium | High",
      "strengths_to_leverage": ["string"],
      "skill_gaps": [
        {
          "skill_name": "string",
          "category": "string",
          "current_strength": "string",
          "required_level": "string",
          "gap_priority": "critical | medium | low",
          "why_it_matters": "string",
          "evidence_you_already_have": "string",
          "how_to_close_gap": "string",
          "resource_title": "string",
          "resource_url": "https://..."
        }
      ]
    }
  ],
  "decision": {
    "recommendation_type": "stay-and-redesign | hybrid-transition | active-pivot",
    "headline": "string",
    "urgency": "string",
    "rationale": "2-4 sentences explaining why this recommendation is correct now",
    "confidence_label": "High confidence | Moderate confidence | Lower confidence",
    "confidence_reason": "1-3 sentences explaining the confidence level"
  },
  "career_roi": {
    "salary_range": "string",
    "salary_delta": "string",
    "transition_time": "string",
    "learning_cost_estimate": "string",
    "payback_period": "string",
    "roi_read": "1-3 sentences explaining the economic tradeoff"
  },
  "stay_and_advance": {
    "headline": "string",
    "recommendation": "1-3 sentences on how to stay in the same career lane but use AI to advance faster",
    "rationale": "2-4 sentences explaining why staying and leveraging AI is strategically viable for this user",
    "urgency_label": "string",
    "leverage_opportunities": [
      {
        "title": "string",
        "current_work": "string",
        "ai_shift": "string",
        "advantage_if_you_lead": "string"
      }
    ],
    "promotion_path": {
      "next_title": "string",
      "why_it_opens": "1-3 sentences",
      "timeline": "string",
      "signals_to_build": ["string", "string", "string"]
    },
    "work_redesign": {
      "automate": ["string"],
      "augment": ["string"],
      "protect": ["string"],
      "lead": ["string"]
    },
    "thirty_day_plan": {
      "this_week": ["string", "string"],
      "this_month": ["string", "string"],
      "metric_to_move": "string",
      "leadership_narrative": "string",
      "proof_asset": {
        "title": "string",
        "description": "1-3 sentences",
        "why_it_matters": "1-2 sentences"
      }
    }
  },
  "first_30_days": {
    "next_7_days": ["string", "string", "string"],
    "next_30_days": ["string", "string", "string"],
    "avoid": ["string", "string", "string"],
    "proof_asset": {
      "title": "string",
      "description": "1-3 sentences",
      "why_it_matters": "1-2 sentences"
    }
  },
  "next_move": {
    "title": "Your move this week",
    "explanation": "2-4 sentences with a specific next action and reason"
  }
}`;

const PREVIEW_REPORT_SCHEMA_GUIDE = `{
  "schema_version": "pivotiq-preview-report-v1",
  "generated_at": "ISO-8601 timestamp",
  "profile": {
    "job_title": "string",
    "industry": "string",
    "tasks": ["string"],
    "selected_tasks": [
      {
        "task_id": "string",
        "label": "string",
        "category": "string",
        "source": "recommended | search | custom | linkedin"
      }
    ],
    "primary_tasks": ["string"],
    "clarifiers": {
      "goal_now": "stay_and_advance | hybrid_transition | active_pivot | not_sure | null",
      "timeline_urgency": "within_3_months | within_6_months | within_12_months | exploring_only | null",
      "years_experience_band": "0_2 | 3_5 | 6_10 | 11_plus | null",
      "location_preference": "netherlands | europe | united_states | global_remote | other | null",
      "ai_maturity": "never_use_it | occasionally | weekly | repeatable_workflows | team_level_adoption | null",
      "role_blend": "execution | mixed | strategy",
      "management_scope": "none | small-team | larger-team | null",
      "decision_scope": "internal-ops | customer-revenue | regulated-high-stakes | null",
      "domain_focus": "string | null",
      "core_systems": ["string"]
    },
    "linkedin_profile_url": "string | null"
  },
  "summary": {
    "overall_score": 0,
    "risk_level": "HIGH | MODERATE | LOW",
    "displacement_timeline": "string",
    "narrative": "2-4 sentences explaining the risk",
    "what_this_means": "1-3 sentences connecting the problem to the solution"
  },
  "interpretation": {
    "role_read": "2-4 sentences interpreting what this pattern says about the user's role",
    "durable_advantages": ["string", "string", "string"],
    "stop_assuming": "1-3 sentences challenging the wrong conclusion the user may be drawing"
  },
  "task_breakdown": [
    {
      "task_name": "string",
      "risk_score": 0,
      "explanation": "1-2 detailed sentences"
    }
  ],
  "pivots": [
    {
      "id": "slug-like-string",
      "title": "string",
      "decision_frame": "safest transition",
      "fit_summary": "2-4 sentences connecting past experience to future role",
      "outcome": "1-3 sentences describing the payoff of this pivot",
      "why_this_path_wins": "2-4 sentences explaining why this path is strategically strong",
      "what_you_are_betting_on": "1-3 sentences naming the underlying bet behind this path",
      "match_score": 0,
      "salary_range": "string",
      "salary_delta": "string",
      "transition_time": "string",
      "difficulty": "Low | Medium | High",
      "strengths_to_leverage": ["string"],
      "skill_gaps": [
        {
          "skill_name": "string",
          "category": "string",
          "gap_priority": "critical | medium | low",
          "why_it_matters": "string",
          "evidence_you_already_have": "string",
          "how_to_close_gap": "string",
          "resource_title": "string",
          "resource_url": "https://..."
        }
      ]
    }
  ],
  "next_move": {
    "title": "Your move this week",
    "explanation": "2-3 sentences with one immediate next action and reason"
  }
}`;

const FULL_CORE_SCHEMA_GUIDE = `{
  "schema_version": "pivotiq-structured-report-v1",
  "generated_at": "ISO-8601 timestamp",
  "profile": {
    "job_title": "string",
    "industry": "string",
    "tasks": ["string"],
    "selected_tasks": [
      {
        "task_id": "string",
        "label": "string",
        "category": "string",
        "source": "recommended | search | custom | linkedin"
      }
    ],
    "primary_tasks": ["string"],
    "clarifiers": {
      "goal_now": "stay_and_advance | hybrid_transition | active_pivot | not_sure | null",
      "timeline_urgency": "within_3_months | within_6_months | within_12_months | exploring_only | null",
      "years_experience_band": "0_2 | 3_5 | 6_10 | 11_plus | null",
      "location_preference": "netherlands | europe | united_states | global_remote | other | null",
      "ai_maturity": "never_use_it | occasionally | weekly | repeatable_workflows | team_level_adoption | null",
      "role_blend": "execution | mixed | strategy",
      "management_scope": "none | small-team | larger-team | null",
      "decision_scope": "internal-ops | customer-revenue | regulated-high-stakes | null",
      "domain_focus": "string | null",
      "core_systems": ["string"]
    },
    "linkedin_profile_url": "string | null"
  },
  "summary": {
    "overall_score": 0,
    "risk_level": "HIGH | MODERATE | LOW",
    "displacement_timeline": "string",
    "narrative": "2-4 sentences explaining the risk",
    "what_this_means": "1-3 sentences connecting the problem to the solution"
  },
  "interpretation": {
    "role_read": "2-4 sentences interpreting what this pattern says about the user's role",
    "durable_advantages": ["string", "string", "string"],
    "stop_assuming": "1-3 sentences challenging the wrong conclusion the user may be drawing"
  },
  "task_breakdown": [
    {
      "task_name": "string",
      "risk_score": 0,
      "explanation": "1-2 detailed sentences"
    }
  ],
  "decision": {
    "recommendation_type": "stay-and-redesign | hybrid-transition | active-pivot",
    "headline": "string",
    "urgency": "string",
    "rationale": "2-4 sentences explaining why this recommendation is correct now",
    "confidence_label": "High confidence | Moderate confidence | Lower confidence",
    "confidence_reason": "1-3 sentences explaining the confidence level"
  },
  "career_roi": {
    "salary_range": "string",
    "salary_delta": "string",
    "transition_time": "string",
    "learning_cost_estimate": "string",
    "payback_period": "string",
    "roi_read": "1-3 sentences explaining the economic tradeoff"
  },
  "next_move": {
    "title": "Your move this week",
    "explanation": "2-4 sentences with a specific next action and reason"
  }
}`;

const FULL_PIVOTS_SCHEMA_GUIDE = `{
  "pivots": [
    {
      "id": "slug-like-string",
      "title": "string",
      "decision_frame": "safest transition | strongest leverage fit | fastest cash recovery | highest upside | long-term platform bet",
      "fit_summary": "2-4 sentences connecting past experience to future role",
      "outcome": "1-3 sentences describing the payoff of this pivot",
      "who_this_is_for": "2-4 sentences describing who this path fits best",
      "tradeoffs": ["string", "string"],
      "why_this_path_wins": "2-4 sentences explaining why this path is strategically strong",
      "what_you_are_betting_on": "1-3 sentences naming the underlying bet behind this path",
      "match_score": 0,
      "salary_range": "string",
      "salary_delta": "string",
      "transition_time": "string",
      "difficulty": "Low | Medium | High",
      "strengths_to_leverage": ["string"],
      "skill_gaps": [
        {
          "skill_name": "string",
          "category": "string",
          "current_strength": "string",
          "required_level": "string",
          "gap_priority": "critical | medium | low",
          "why_it_matters": "string",
          "evidence_you_already_have": "string",
          "how_to_close_gap": "string",
          "resource_title": "string",
          "resource_url": "https://..."
        }
      ]
    }
  ]
}`;

const FULL_STAY_SCHEMA_GUIDE = `{
  "stay_and_advance": {
    "headline": "string",
    "recommendation": "1-3 sentences on how to stay in the same career lane but use AI to advance faster",
    "rationale": "2-4 sentences explaining why staying and leveraging AI is strategically viable for this user",
    "urgency_label": "string",
    "leverage_opportunities": [
      {
        "title": "string",
        "current_work": "string",
        "ai_shift": "string",
        "advantage_if_you_lead": "string"
      }
    ],
    "promotion_path": {
      "next_title": "string",
      "why_it_opens": "1-3 sentences",
      "timeline": "string",
      "signals_to_build": ["string", "string", "string"]
    },
    "work_redesign": {
      "automate": ["string"],
      "augment": ["string"],
      "protect": ["string"],
      "lead": ["string"]
    },
    "thirty_day_plan": {
      "this_week": ["string", "string"],
      "this_month": ["string", "string"],
      "metric_to_move": "string",
      "leadership_narrative": "string",
      "proof_asset": {
        "title": "string",
        "description": "1-3 sentences",
        "why_it_matters": "1-2 sentences"
      }
    }
  }
}`;

const FULL_SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

You must generate a PREMIUM paid-program experience, not generic career advice.

Your output must feel:
- detailed
- structured
- high-trust
- emotionally supportive without sounding soft
- specific enough that the user feels personally guided

Critical quality rules:
1. Every recommendation must connect the user's current problem to a specific solution.
2. The strategic guidance must be strong enough that a local roadmap generator can turn it into a detailed plan without losing the core logic.
3. Every pivot must feel adjacent and credible based on the user's real background.
4. The 5 pivots must feel meaningfully different from each other: one safest transition, one strongest leverage fit, one fastest cash recovery, one highest upside, and one long-term platform bet.
5. Every skill gap must explain both why it matters and how to close it.
6. Focus your output on diagnosis and strategic differentiation, not step-by-step weekly planning.
7. Use real resources and real job-market language.
8. Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.
9. The best-fit pivot must be strong enough that a paying user feels they received a truly actionable path, while still including 4 additional pivot options.
10. The 5 pivots must not be lightly edited versions of the same destination role.
11. Learning resources must be direct, trustworthy destination pages, not articles, opinion pieces, or newsroom links.
12. Add a decisive recommendation layer so the user knows whether to stay, run a hybrid transition, or start an active pivot now.
13. Add a proof-based first-30-days plan centered on visible proof, not vague learning.
14. Do not use lazy pivot titles like "AI-Enabled [current role]" or minor rewrites of the user's current title.
15. Do not default to generic gaps like prompt engineering or prompt design unless the pivot itself is explicitly an AI-builder, automation, or LLM-operator role.
16. Add a stay-and-advance layer for users who want to remain in the same career lane but use AI to accelerate promotion, scope, and internal leverage.

Use exactly the schema below and do not omit fields:
${FULL_REPORT_SCHEMA_GUIDE}`;

const PREVIEW_SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

You are generating the PRE-PAYWALL preview, not the full paid report.

Your output must feel:
- sharp
- high-trust
- personally diagnostic
- useful enough to create conviction
- concise enough to stay materially cheaper than the full report

Critical preview rules:
1. Generate only one pivot, and it must be the safest transition.
2. Focus on diagnosis, role interpretation, and one credible next move.
3. Do not include the full paid-program depth like multiple pivots, ROI, or a 30-day plan.
4. Keep task breakdown limited to the most important items.
5. Include direct trustworthy learning resources only if they tightly fit the preview pivot.
6. Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.
7. All user-facing prose values must be written in the requested output language.
8. Keep JSON keys, enum values, and schema structure in English exactly as defined.

Use exactly the schema below and do not omit fields:
${PREVIEW_REPORT_SCHEMA_GUIDE}`;

const FULL_CORE_SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

You are generating only the CORE section of the paid report.

Rules:
- Focus only on summary, interpretation, task breakdown, decision, ROI, and next move.
- Do not generate pivots, stay-and-advance, or roadmap content in this response.
- Keep the diagnosis specific, high-trust, and grounded in the user's actual workload.
- Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.

Use exactly the schema below and do not omit fields:
${FULL_CORE_SCHEMA_GUIDE}`;

const FULL_PIVOTS_SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

You are generating only the PIVOT PATHS section of the paid report.

Rules:
- Generate exactly 5 pivots.
- Use the required decision frames: safest transition, strongest leverage fit, fastest cash recovery, highest upside, long-term platform bet.
- Every pivot must land in a materially different destination job family.
- Do not use lazy titles like "AI-Enabled [current role]".
- Do not generate summary, interpretation, decision, stay-and-advance, or roadmap content in this response.
- Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.

Use exactly the schema below and do not omit fields:
${FULL_PIVOTS_SCHEMA_GUIDE}`;

const FULL_STAY_SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

You are generating only the STAY-AND-ADVANCE section of the paid report.

Rules:
- Focus on how the user could stay in the same career lane and use AI to advance faster.
- The next title must feel like a real internal promotion or scope expansion, not "AI-Enabled [current role]".
- Leverage opportunities, proof asset, and metric must be role-specific and concrete.
- Do not generate pivots, summary, interpretation, or roadmap content in this response.
- Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.

Use exactly the schema below and do not omit fields:
${FULL_STAY_SCHEMA_GUIDE}`;

function buildLanguageLabel(locale) {
  const normalizedLocale = String(locale || 'en').toLowerCase();
  return normalizedLocale === 'nl' ? 'Dutch' : normalizedLocale === 'de' ? 'German' : 'English';
}

function buildRefreshContextBlock(intakeProfile = {}) {
  const refresh = intakeProfile?.progress_refresh;
  if (!refresh?.is_ready) return '';

  const outcomeRead = refresh?.outcome_summary?.traction_label
    ? `${refresh.outcome_summary.traction_label}${refresh.outcome?.usefulness_rating ? ` · usefulness ${refresh.outcome.usefulness_rating}/5` : ''}`
    : 'No outcome signal logged yet';
  const progressNotes = Array.isArray(refresh.progress_notes) && refresh.progress_notes.length
    ? refresh.progress_notes.map((note) => `- ${note}`).join('\n')
    : '- No detailed notes logged yet';

  return `
REPORT REFRESH CONTEXT:
This is a refresh of an existing paid report after the user logged progress.
Current primary move: ${refresh.primary_move?.title || 'Unknown'}
Current recommendation type: ${refresh.primary_move?.type || 'unknown'}
Completed milestones: ${refresh.completed_weeks_count || 0}
Weeks with active work logged: ${refresh.touched_weeks_count || 0}
Proof assets ready: ${refresh.proof_ready_count || 0}
Manager conversations logged: ${refresh.manager_done_count || 0}
Current execution summary: ${refresh.execution_summary?.title || 'No execution summary'}
Outcome signal: ${outcomeRead}
Most recent progress notes:
${progressNotes}

Refresh rules:
- Treat proof, manager conversations, and traction as high-signal evidence.
- Do not reset the user back to week one if they already built proof or moved the plan into a real conversation.
- If the current path is working, narrow and strengthen it instead of inventing a dramatic new pivot.
- Only change the primary move if the new progress genuinely points to a stronger path.`;
}

function buildUserMessage(jobTitle, industry, tasks, intakeProfile, locale, stage) {
  const selectedTasks = intakeProfile?.selected_tasks || [];
  const primaryTasks = intakeProfile?.primary_tasks || [];
  const clarifiers = intakeProfile?.clarifiers || {};
  const languageLabel = buildLanguageLabel(locale);
  const refreshContextBlock = buildRefreshContextBlock(intakeProfile);

  const requirements = stage === 'preview'
    ? [
        'Generate exactly 1 pivot.',
        'That pivot must be the safest transition.',
        'Keep the preview diagnostic and persuasive, not exhaustive.',
        'Do not include full-report-only fields like decision, career_roi, or first_30_days.',
        'Task breakdown can cover only the most important items.',
      ]
    : [
        'Generate exactly 5 pivots.',
        'Label the pivots so they clearly map to safest transition, strongest leverage fit, fastest cash recovery, highest upside, and long-term platform bet.',
        'Use realistic salary, timeline, and difficulty.',
        'Keep risk scores realistic.',
        'Weigh the primary tasks more heavily when explaining the user\'s risk and roadmap.',
        'Use the clarifiers to distinguish execution-heavy work from strategy-heavy work.',
        'Treat goal_now, timeline_urgency, years_experience_band, location_preference, and ai_maturity as high-signal inputs, not decorative context.',
        'If the user wants to stay and advance, require stronger market evidence before a dramatic pivot becomes the main recommendation.',
        'If the user needs a plan to be useful within 3 months, prefer safer adjacency, clearer internal leverage, and more conservative title jumps.',
        'Use years_experience_band to avoid over-senior titles and to calibrate how ambitious the first move should feel.',
        'If ai_maturity is already high, do not default to beginner AI literacy as the first unlock.',
        'Use decision scope, domain focus, and core systems to infer what environments, stakes, and tooling the user is actually close to.',
        'Make the problem-to-solution connection explicit in every pivot.',
        'Make the free-layer interpretation feel personally diagnostic, not generic.',
        'Name durable strengths the user already has, not just gaps they need to fix.',
        'Every pivot must include who it is for, why it wins, tradeoffs, and what the user is betting on.',
        'Add a clear decision verdict telling the user whether to stay, build a hybrid transition, or start an active pivot now.',
        'Add a career ROI read that explains salary upside, transition time, learning cost, and rough payback logic.',
        'Add a stay_and_advance section showing how this user could stay in the same field and advance faster with AI instead of pivoting out.',
        'The stay_and_advance section must include AI leverage opportunities, a plausible next-title path, work redesign buckets, and a 30-day internal advancement plan.',
        'The stay_and_advance next title must sound like a credible promotion or scope expansion, not "AI-Enabled [current role]".',
        'The stay_and_advance proof asset must be role-native and concrete, such as a finance review pack, campaign planning system, policy workflow, or operations intake system.',
        'The stay_and_advance metric must be specific to the user function, not a generic prompt like "choose one metric".',
        'Add a proof-based first 30 days plan with next 7 days, next 30 days, what to avoid, and one concrete proof asset.',
        'Make the 5 pivot titles land in materially different job families, not adjacent synonyms.',
        'Give each pivot distinct tradeoffs, downside risks, and strategic logic.',
        'If two pivots would lead to similar hiring-manager expectations, change one of them.',
      ];

  return `Create a PivotIQ structured ${stage === 'preview' ? 'preview' : 'full'} report for this user.

OUTPUT LANGUAGE: ${languageLabel}

JOB TITLE: ${jobTitle}
INDUSTRY: ${industry}
DAILY TASKS: ${tasks.join(', ')}
STRUCTURED TASK SELECTION:
${JSON.stringify(selectedTasks, null, 2)}

PRIMARY / TIME-HEAVY TASKS:
${primaryTasks.length ? primaryTasks.join(', ') : 'Not provided'}

CLARIFIERS:
${JSON.stringify(clarifiers, null, 2)}

LINKEDIN PROFILE URL:
${intakeProfile?.linkedin_profile_url || 'Not provided'}
${refreshContextBlock ? `\n${refreshContextBlock}` : ''}

Requirements:
- ${requirements.join('\n- ')}
- Do not include any weekly roadmap content or roadmap field in the response.
- Treat goal_now, timeline_urgency, years_experience_band, location_preference, ai_maturity, decision_scope, domain_focus, and core_systems as high-signal context about the user\'s constraints, seniority, market, specialty lane, and operating environment.
- Every resource URL must be a direct learning destination page from a trusted provider, not a blog post or general article.
- All user-facing prose values must be written in ${languageLabel}.
- Keep JSON keys, enum values, and schema structure in English exactly as defined.
- Return valid JSON only.`;
}

function buildSharedContext(jobTitle, industry, tasks, intakeProfile, locale) {
  const selectedTasks = intakeProfile?.selected_tasks || [];
  const primaryTasks = intakeProfile?.primary_tasks || [];
  const clarifiers = intakeProfile?.clarifiers || {};
  const languageLabel = buildLanguageLabel(locale);
  const refreshContextBlock = buildRefreshContextBlock(intakeProfile);

  return `OUTPUT LANGUAGE: ${languageLabel}

JOB TITLE: ${jobTitle}
INDUSTRY: ${industry}
DAILY TASKS: ${tasks.join(', ')}
STRUCTURED TASK SELECTION:
${JSON.stringify(selectedTasks, null, 2)}

PRIMARY / TIME-HEAVY TASKS:
${primaryTasks.length ? primaryTasks.join(', ') : 'Not provided'}

CLARIFIERS:
${JSON.stringify(clarifiers, null, 2)}

LINKEDIN PROFILE URL:
${intakeProfile?.linkedin_profile_url || 'Not provided'}
${refreshContextBlock ? `\n${refreshContextBlock}` : ''}

Global output rules:
- All user-facing prose values must be written in ${languageLabel}.
- Keep JSON keys, enum values, and schema structure in English exactly as defined.
- Return valid JSON only.`;
}

function buildFullSectionUserMessage(section, jobTitle, industry, tasks, intakeProfile, locale) {
  const sharedContext = buildSharedContext(jobTitle, industry, tasks, intakeProfile, locale);

  if (section === 'core') {
    return `Create only the CORE diagnosis section for this PivotIQ paid report.

${sharedContext}

Section rules:
- Focus on diagnosis, interpretation, decision, ROI, and the immediate next move.
- Make task breakdown reflect the actual work mix and primary tasks.
- Use goal_now, timeline_urgency, years_experience_band, location_preference, ai_maturity, decision scope, domain focus, and core systems to sharpen the role read so it feels grounded in the user's actual operating context.
- Do not include pivots or stay-and-advance content.`;
  }

  if (section === 'pivots') {
    return `Create only the PIVOT PATHS section for this PivotIQ paid report.

${sharedContext}

Section rules:
- Generate exactly 5 pivots mapped to safest transition, strongest leverage fit, fastest cash recovery, highest upside, and long-term platform bet.
- Make each pivot materially distinct in destination job family and hiring logic.
- Use realistic salary, difficulty, and transition timing.
- Use goal_now, timeline_urgency, years_experience_band, location_preference, ai_maturity, decision scope, domain focus, and core systems to keep pivot titles role-native and avoid drifting into generic or fantasy titles.
- Each pivot needs concrete role-specific skill gaps with direct learning destination URLs.
- Do not include summary, decision, ROI, or stay-and-advance content.`;
  }

  return `Create only the STAY-AND-ADVANCE section for this PivotIQ paid report.

${sharedContext}

Section rules:
- Focus on how the user stays in the same career lane and grows scope with AI.
- The next title must be a credible promotion or expansion, not "AI-Enabled [current role]".
- Leverage opportunities must be specific to the function.
- Use goal_now, timeline_urgency, years_experience_band, location_preference, ai_maturity, decision scope, domain focus, and core systems to make the stay path feel native to the user's real environment.
- The proof asset and metric must be concrete and role-native.
- Do not include pivots, summary, or decision content.`;
}

async function logGenerateReportDebug(event, details = {}) {
  if (process.env.DEBUG_GENERATE_REPORT !== 'true') return;
  try {
    await appendFile(
      DEBUG_LOG_PATH,
      `${new Date().toISOString()} ${event} ${JSON.stringify(details)}\n`
    );
  } catch {}
}

function collectTextFragments(value) {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectTextFragments(item));
  if (typeof value === 'object') {
    const fragments = [];
    if (typeof value.text === 'string') fragments.push(value.text);
    if (typeof value.content === 'string') fragments.push(value.content);
    return fragments;
  }
  return [];
}

function extractModelText(data) {
  const message = data?.choices?.[0]?.message || {};
  const candidates = [
    ...collectTextFragments(message.content),
    ...collectTextFragments(message.reasoning),
    ...collectTextFragments(message.reasoning_details),
    ...collectTextFragments(data?.choices?.[0]?.text),
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return candidates[0] || '';
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasMeaningfulPivotId(id) {
  const normalized = normalizeText(id);
  if (!normalized) return false;
  if (normalized.startsWith('pivot ')) return false;
  return !PIVOT_DECISION_FRAMES.includes(normalized);
}

function canonicalizePivotIds(reportData) {
  if (!Array.isArray(reportData?.pivots)) return reportData;

  const pivots = reportData.pivots.map((pivot, index) => {
    const titleId = slugify(pivot?.title);
    const fallbackId = titleId || `pivot-${index + 1}`;
    return {
      ...pivot,
      id: titleId || (hasMeaningfulPivotId(pivot?.id) ? pivot.id : fallbackId),
    };
  });

  return {
    ...reportData,
    pivots,
  };
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token && !STOP_WORDS.has(token) && token.length > 2);
}

function uniqueTokens(value) {
  return [...new Set(tokenize(value))];
}

function jaccardSimilarity(leftTokens, rightTokens) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;

  let intersectionSize = 0;
  for (const token of left) {
    if (right.has(token)) intersectionSize += 1;
  }
  return intersectionSize / union.size;
}

function compactPivotDescriptor(pivot) {
  return [
    pivot?.title,
    pivot?.fit_summary,
    pivot?.why_this_path_wins,
    pivot?.what_you_are_betting_on,
    Array.isArray(pivot?.tradeoffs) ? pivot.tradeoffs.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function hasMeaningfulPivotTitle(title) {
  const normalized = normalizeText(title);
  if (!normalized) return false;
  return !PIVOT_DECISION_FRAMES.includes(normalized);
}

function isTitleTooCloseToCurrentRole(title, currentJobTitle) {
  const normalizedTitle = normalizeText(title);
  const normalizedCurrent = normalizeText(currentJobTitle);
  if (!normalizedTitle || !normalizedCurrent) return false;
  if (normalizedTitle === normalizedCurrent) return true;
  if (normalizedTitle.includes(normalizedCurrent)) return true;
  if (normalizedTitle === `ai enabled ${normalizedCurrent}`) return true;
  if (normalizedTitle.endsWith(normalizedCurrent) && normalizedTitle.includes('ai enabled')) return true;

  const overlap = jaccardSimilarity(uniqueTokens(normalizedTitle), uniqueTokens(normalizedCurrent));
  return overlap >= 0.8;
}

function pivotAllowsGenericAIGaps(pivot) {
  const normalized = normalizeText([pivot?.title, pivot?.decision_frame].join(' '));
  return /(ai program manager|automation consultant|llm|prompt|agent|workflow automation|ai builder|automation engineer)/.test(normalized);
}

function isGenericAIGap(skillGap) {
  const normalized = normalizeText([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '));
  return /(prompt design|prompt engineering|prompting|learn prompting|ai literacy|generative ai basics)/.test(normalized);
}

function isOffFamilySkillGap(skillGap, roleFamily) {
  const normalized = normalizeText([
    skillGap?.skill_name,
    skillGap?.category,
    skillGap?.how_to_close_gap,
  ].join(' '));
  if (!normalized || !roleFamily) return false;

  if (/\b(stakeholder discovery|client acquisition|proposal development|product analytics|enterprise ai governance|predictive risk modeling|systems architecture judgment)\b/.test(normalized)) {
    return true;
  }

  if (roleFamily === 'legal') {
    return /\b(marketing|sales|revenue|product analytics|growth)\b/.test(normalized);
  }

  if (roleFamily === 'procurement') {
    return /\b(marketing|sales|customer success|client acquisition|proposal)\b/.test(normalized);
  }

  if (roleFamily === 'education') {
    return /\b(procurement|sourcing|legal|contract|revenue operations|product analytics)\b/.test(normalized);
  }

  if (roleFamily === 'finance') {
    return /\b(contract|clause|legal intake|curriculum|instructional|customer success|sales enablement|recruiting|candidate)\b/.test(normalized);
  }

  if (roleFamily === 'operations') {
    return /\b(contract clause|clause library|curriculum|instructional|clinical|legal review|procurement sourcing)\b/.test(normalized);
  }

  if (roleFamily === 'hr') {
    return /\b(contract clause|clause library|legal intake|clm|sourcing|supplier|forecasting model|pricing strategy)\b/.test(normalized);
  }

  return false;
}

function inferSpecializedRoleFamily(...parts) {
  const normalized = normalizeText(parts.filter(Boolean).join(' '));
  if (/(legal|paralegal|contract|compliance|clm|privacy|governance)/.test(normalized)) return 'legal';
  if (/(procurement|sourcing|supplier|vendor|purchasing|spend management|supply chain)/.test(normalized)) return 'procurement';
  if (/(education|enablement|training|learning|curriculum|instructional|onboarding)/.test(normalized)) return 'education';
  if (/(finance|financial|fp&a|fpa|forecast|budget|pricing|variance analysis|commercial finance)/.test(normalized)) return 'finance';
  if (/(project manager|program manager|project management|program management|pmo|delivery|implementation|change management|operations)/.test(normalized)) return 'operations';
  if (/(hr|human resources|people operations|people partner|talent|workforce|employee relations|recruiter)/.test(normalized)) return 'hr';
  return null;
}

function titleMatchesRoleFamily(title, roleFamily) {
  if (!roleFamily) return true;
  const normalized = normalizeText(title);
  if (!normalized) return false;
  return SPECIALIZED_ROLE_KEYWORDS[roleFamily]?.some((keyword) => normalized.includes(keyword)) || false;
}

function titleMatchesCanonicalSpecializedFamily(title, roleFamily) {
  if (!roleFamily) return true;
  const normalized = normalizeText(title);
  if (!normalized) return false;

  if (roleFamily === 'legal') {
    return /\b(legal operations|contract lifecycle|contract operations|contract management|legal technology|compliance operations|compliance analyst|compliance manager|compliance risk)\b/.test(normalized);
  }

  if (roleFamily === 'procurement') {
    return /\b(procurement|strategic sourcing|supplier|spend|supply chain)\b/.test(normalized);
  }

  if (roleFamily === 'education') {
    return /\b(customer education|learning operations|enablement program|instructional design|learning experience|curriculum|onboarding|education lead|learning and development|customer success enablement)\b/.test(normalized);
  }

  if (roleFamily === 'finance') {
    return /\b(finance business partner|strategic finance analyst|commercial finance analyst|fp&a manager|finance systems manager|pricing strategy manager|revenue planning manager)\b/.test(normalized);
  }

  if (roleFamily === 'operations') {
    return /\b(program operations manager|project operations manager|delivery operations manager|change management lead|pmo manager|portfolio operations manager|workflow operations manager)\b/.test(normalized);
  }

  if (roleFamily === 'hr') {
    return /\b(people operations manager|people operations lead|workforce planning manager|talent operations manager|manager enablement lead|hr operations manager)\b/.test(normalized);
  }

  return true;
}

function isSafestPivotOverleveled(title, currentJobTitle) {
  const normalizedTitle = normalizeText(title);
  const normalizedCurrent = normalizeText(currentJobTitle);
  if (!normalizedTitle) return false;

  const targetIsSenior = /^(chief|head|vp|vice president)\b/.test(normalizedTitle);
  if (!targetIsSenior) return false;

  return !/(chief|head|director|vp|vice president)\b/.test(normalizedCurrent);
}

function getSeniorityBand(title) {
  const normalized = normalizeText(title);
  if (!normalized) return 0;
  if (/\b(founder|cofounder|owner|chief|officer|vp|vice president|president)\b/.test(normalized)) return 4;
  if (/\b(head|director)\b/.test(normalized)) return 3;
  if (/\b(manager|lead|principal|architect)\b/.test(normalized)) return 2;
  if (/\b(senior|sr)\b/.test(normalized)) return 1;
  return 0;
}

function isAmbitionMismatch(title, currentJobTitle, decisionFrame) {
  const normalizedTitle = normalizeText(title);
  const normalizedFrame = normalizeText(decisionFrame);
  if (!normalizedTitle) return false;

  if (/\b(founder|cofounder|owner)\b/.test(normalizedTitle)) {
    return true;
  }

  if (/\b(head|director)\b/.test(normalizedTitle) && getSeniorityBand(currentJobTitle) === 0) {
    return true;
  }

  if (/\b(architect|principal)\b/.test(normalizedTitle) && getSeniorityBand(currentJobTitle) <= 1) {
    return true;
  }

  if (!['highest upside', 'long term platform bet', 'long-term platform bet'].includes(normalizedFrame)) {
    return false;
  }

  const targetBand = getSeniorityBand(title);
  const currentBand = getSeniorityBand(currentJobTitle);

  if (/\b(chief|officer|vp|vice president|president)\b/.test(normalizedTitle)) {
    return currentBand < 3;
  }

  if (/\b(head|director)\b/.test(normalizedTitle)) {
    return currentBand === 0 && !/\b(manager|lead)\b/.test(normalizeText(currentJobTitle));
  }

  return targetBand - currentBand >= 4;
}

function isSpecializedPivotImplausible(title, roleFamily) {
  const normalized = normalizeText(title);
  if (!normalized || !roleFamily) return false;

  if (roleFamily === 'legal') {
    return /\b(engineer|data scientist|platform engineer|product manager|product compliance|infrastructure|entrepreneur|intelligence)\b/.test(normalized);
  }

  if (roleFamily === 'procurement') {
    return /\b(engineer|data scientist|product manager)\b/.test(normalized);
  }

  if (roleFamily === 'education') {
    return /\b(engineer|data scientist|product manager|product learning|revenue enablement|sales enablement|ai adoption consultant)\b/.test(normalized);
  }

  if (roleFamily === 'finance') {
    return /\b(engineer|architect|data scientist|program manager|consultant|transformation|automation consultant)\b/.test(normalized);
  }

  if (roleFamily === 'operations') {
    return /\b(architect|scientist|chief|vp|vice president|president|entrepreneur)\b/.test(normalized);
  }

  if (roleFamily === 'hr') {
    return /\b(contract|clause|legal|supplier|sourcing|procurement|engineer|architect)\b/.test(normalized);
  }

  return false;
}

function buildRepairSkillGap(skillName, category, roleName, currentJobTitle) {
  return {
    skill_name: skillName,
    category,
    current_strength: `You already have adjacent evidence from ${currentJobTitle || 'your current role'}, but it needs to be reframed around ${roleName}.`,
    required_level: `Visible enough that a hiring manager for ${roleName} can see it in a concrete example or proof asset.`,
    gap_priority: 'critical',
    why_it_matters: `${skillName} is more role-native for ${roleName} than generic AI prompting and makes the recommendation easier to trust.`,
    evidence_you_already_have: `Your current work already gives you context, stakeholders, and operating examples to build from.`,
    how_to_close_gap: `Build one proof asset that shows ${skillName} applied to a realistic ${roleName} problem.`,
    resource_title: 'Role-specific proof sprint',
    resource_url: 'https://www.coursera.org/',
  };
}

function buildRoleSpecificRepairSkillGaps(roleFamily, roleName, currentJobTitle) {
  if (roleFamily === 'legal') {
    return [
      buildRepairSkillGap('Contract lifecycle administration', 'legal operations', roleName, currentJobTitle),
      buildRepairSkillGap('Legal intake workflow design', 'workflow design', roleName, currentJobTitle),
      buildRepairSkillGap('Clause library and approval routing', 'contract operations', roleName, currentJobTitle),
    ];
  }

  if (roleFamily === 'procurement') {
    return [
      buildRepairSkillGap('Procurement analytics', 'procurement operations', roleName, currentJobTitle),
      buildRepairSkillGap('Spend forecasting', 'analytics', roleName, currentJobTitle),
      buildRepairSkillGap('Supplier performance storytelling', 'vendor management', roleName, currentJobTitle),
    ];
  }

  if (roleFamily === 'education') {
    return [
      buildRepairSkillGap('Enablement program design', 'learning operations', roleName, currentJobTitle),
      buildRepairSkillGap('Curriculum quality assurance', 'instructional design', roleName, currentJobTitle),
      buildRepairSkillGap('Learning operations analytics', 'analytics', roleName, currentJobTitle),
    ];
  }

  return null;
}

function analyzePivotSimilarity(pivots) {
  const diagnostics = [];

  for (let index = 0; index < pivots.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < pivots.length; compareIndex += 1) {
      const left = pivots[index];
      const right = pivots[compareIndex];
      const descriptorOverlap = jaccardSimilarity(
        uniqueTokens(compactPivotDescriptor(left)),
        uniqueTokens(compactPivotDescriptor(right))
      );
      const titleOverlap = jaccardSimilarity(uniqueTokens(left?.title), uniqueTokens(right?.title));
      const decisionFrameMatch = normalizeText(left?.decision_frame) === normalizeText(right?.decision_frame);

      const reasons = [];
      if (titleOverlap >= 0.6) reasons.push(`titles overlap too much (${left?.title} vs ${right?.title})`);
      if (descriptorOverlap >= 0.55) reasons.push(`strategic logic overlaps too much (${Math.round(descriptorOverlap * 100)}% token overlap)`);
      if (decisionFrameMatch) reasons.push('decision frames are duplicated');

      diagnostics.push({ pair: [left?.title || `pivot-${index + 1}`, right?.title || `pivot-${compareIndex + 1}`], reasons });
    }
  }

  return diagnostics;
}

function validateStayAndAdvance(reportData, currentJobTitle) {
  const stay = reportData?.stay_and_advance || {};
  const issues = [];
  const nextTitle = normalizeText(stay?.promotion_path?.next_title);
  const normalizedCurrent = normalizeText(currentJobTitle);
  const proofAsset = normalizeText(stay?.thirty_day_plan?.proof_asset?.title);
  const metric = normalizeText(stay?.thirty_day_plan?.metric_to_move);
  const leverageTitles = Array.isArray(stay?.leverage_opportunities)
    ? stay.leverage_opportunities.map((item) => normalizeText(item?.title))
    : [];

  if (!stay?.promotion_path?.next_title) issues.push('stay-and-advance next title is missing');
  if (!Array.isArray(stay?.leverage_opportunities) || stay.leverage_opportunities.length < 3) issues.push('stay-and-advance needs 3 leverage opportunities');
  if (!stay?.thirty_day_plan?.proof_asset?.title) issues.push('stay-and-advance proof asset is missing');
  if (!stay?.thirty_day_plan?.metric_to_move) issues.push('stay-and-advance metric is missing');

  if (/^ai-enabled /.test(nextTitle) || /^ai enabled /.test(nextTitle)) {
    issues.push('stay-and-advance next title is lazily prefixed with AI-enabled');
  }

  if (nextTitle && normalizedCurrent && (nextTitle === normalizedCurrent || nextTitle.endsWith(normalizedCurrent))) {
    issues.push(`stay-and-advance next title is too close to current role: "${stay?.promotion_path?.next_title}"`);
  }

  const genericLeverageTitles = new Set([
    'make repetitive output lighter',
    'move yourself toward interpretation',
    'become the ai adoption layer for your team',
  ]);
  if (leverageTitles.length && leverageTitles.every((item) => genericLeverageTitles.has(item))) {
    issues.push('stay-and-advance leverage opportunities are generic');
  }

  if (proofAsset === 'internal ai leverage case') {
    issues.push('stay-and-advance proof asset is generic');
  }

  if (/choose one metric to move/.test(metric)) {
    issues.push('stay-and-advance metric is generic');
  }

  return { valid: issues.length === 0, issues };
}

function validatePivotDifferentiation(reportData, currentJobTitle) {
  const pivots = Array.isArray(reportData?.pivots) ? reportData.pivots : [];
  const roleFamily = inferSpecializedRoleFamily(currentJobTitle);
  const issues = [];

  if (pivots.length !== 5) issues.push(`expected exactly 5 pivots, received ${pivots.length}`);

  const normalizedFrames = pivots.map((pivot) => normalizeText(pivot?.decision_frame));
  const missingFrames = PIVOT_DECISION_FRAMES.filter((frame) => !normalizedFrames.includes(frame));
  if (missingFrames.length) issues.push(`missing required decision frame(s): ${missingFrames.join(', ')}`);

  const duplicateFrames = normalizedFrames.filter((frame, index) => frame && normalizedFrames.indexOf(frame) !== index);
  if (duplicateFrames.length) issues.push(`duplicate decision frame(s): ${[...new Set(duplicateFrames)].join(', ')}`);

  pivots.forEach((pivot) => {
    if (!hasMeaningfulPivotTitle(pivot?.title)) {
      issues.push(`pivot title must name a real destination role, received "${pivot?.title || 'Untitled'}"`);
    }
    if (isTitleTooCloseToCurrentRole(pivot?.title, currentJobTitle)) {
      issues.push(`pivot title stays too close to current role: "${pivot?.title}" vs "${currentJobTitle}"`);
    }
    if (isAmbitionMismatch(pivot?.title, currentJobTitle, pivot?.decision_frame)) {
      issues.push(`pivot title overreaches current seniority or realism: "${pivot?.title}"`);
    }
    if (isSpecializedPivotImplausible(pivot?.title, roleFamily)) {
      issues.push(`pivot title is not realistic enough for ${roleFamily}: "${pivot?.title}"`);
    }
    if (roleFamily && !titleMatchesRoleFamily(pivot?.title, roleFamily)) {
      issues.push(`pivot title does not stay inside the ${roleFamily} role family: "${pivot?.title}"`);
    }
    if (roleFamily && !titleMatchesCanonicalSpecializedFamily(pivot?.title, roleFamily)) {
      issues.push(`pivot title is not a conventional ${roleFamily} market label: "${pivot?.title}"`);
    }
    const skillGaps = Array.isArray(pivot?.skill_gaps) ? pivot.skill_gaps : [];
    skillGaps.forEach((skillGap) => {
      if (isGenericAIGap(skillGap) && !pivotAllowsGenericAIGaps(pivot)) {
        issues.push(`generic AI skill gap "${skillGap?.skill_name}" is too weak for pivot "${pivot?.title}"`);
      }
    });
  });

  analyzePivotSimilarity(pivots).forEach((diagnostic) => {
    if (diagnostic.reasons.length) issues.push(`${diagnostic.pair.join(' vs ')}: ${diagnostic.reasons.join('; ')}`);
  });

  return { valid: issues.length === 0, issues };
}

function repairWeakPivots(reportData, { jobTitle, industry, selectedTaskLabels, intakeProfile, locale }) {
  const fallback = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile, locale);
  const fallbackByFrame = new Map(
    (fallback?.pivots || []).map((pivot) => [normalizeText(pivot?.decision_frame), pivot])
  );
  const roleFamily =
    inferSpecializedRoleFamily(jobTitle) ||
    inferSpecializedRoleFamily(industry, ...(selectedTaskLabels || []), ...(intakeProfile?.primary_tasks || []));

  if (!Array.isArray(reportData?.pivots)) return reportData;

  const repairedPivots = reportData.pivots.map((pivot, index) => {
    const frame = normalizeText(pivot?.decision_frame) || PIVOT_DECISION_FRAMES[index];
    const fallbackPivot = fallbackByFrame.get(frame) || fallback?.pivots?.[index];
    if (!fallbackPivot) return pivot;

    const titleIsWeak =
      !hasMeaningfulPivotTitle(pivot?.title) ||
      isTitleTooCloseToCurrentRole(pivot?.title, jobTitle) ||
      (frame === 'safest transition' && isSafestPivotOverleveled(pivot?.title, jobTitle)) ||
      isAmbitionMismatch(pivot?.title, jobTitle, frame) ||
      isSpecializedPivotImplausible(pivot?.title, roleFamily);
    const familyMismatch =
      roleFamily &&
      PIVOT_DECISION_FRAMES.includes(frame) &&
      (!titleMatchesRoleFamily(pivot?.title, roleFamily) || !titleMatchesCanonicalSpecializedFamily(pivot?.title, roleFamily));
    const genericGaps = Array.isArray(pivot?.skill_gaps)
      ? pivot.skill_gaps.some((skillGap) => isGenericAIGap(skillGap) && !pivotAllowsGenericAIGaps(pivot))
      : false;
    const offFamilyGaps = Array.isArray(pivot?.skill_gaps)
      ? pivot.skill_gaps.some((skillGap) => isOffFamilySkillGap(skillGap, roleFamily))
      : false;

    if (!titleIsWeak && !familyMismatch && !genericGaps && !offFamilyGaps) return pivot;

    if (!titleIsWeak && !familyMismatch && (genericGaps || offFamilyGaps)) {
      return {
        ...pivot,
        skill_gaps: buildRoleSpecificRepairSkillGaps(roleFamily, pivot.title, jobTitle) || pivot.skill_gaps,
      };
    }

    return {
      ...pivot,
      id: fallbackPivot.id,
      title: fallbackPivot.title,
      fit_summary: fallbackPivot.fit_summary,
      outcome: fallbackPivot.outcome,
      who_this_is_for: fallbackPivot.who_this_is_for,
      tradeoffs: fallbackPivot.tradeoffs,
      why_this_path_wins: fallbackPivot.why_this_path_wins,
      what_you_are_betting_on: fallbackPivot.what_you_are_betting_on,
      salary_range: fallbackPivot.salary_range,
      salary_delta: fallbackPivot.salary_delta,
      transition_time: fallbackPivot.transition_time,
      difficulty: fallbackPivot.difficulty,
      strengths_to_leverage: fallbackPivot.strengths_to_leverage,
      skill_gaps: genericGaps || offFamilyGaps
        ? buildRoleSpecificRepairSkillGaps(roleFamily, fallbackPivot.title, jobTitle) || fallbackPivot.skill_gaps
        : fallbackPivot.skill_gaps,
    };
  });

  const dedupedPivots = repairedPivots.map((pivot, index) => {
    const normalizedTitle = normalizeText(pivot?.title);
    const duplicateIndex = repairedPivots.findIndex((candidate, candidateIndex) =>
      candidateIndex < index && normalizeText(candidate?.title) === normalizedTitle
    );
    if (duplicateIndex === -1) return pivot;

    const frame = normalizeText(pivot?.decision_frame) || PIVOT_DECISION_FRAMES[index];
    const fallbackPivot = fallbackByFrame.get(frame) || fallback?.pivots?.[index];
    return fallbackPivot || pivot;
  });

  const repairedStay =
    reportData?.stay_and_advance &&
    roleFamily &&
    !titleMatchesRoleFamily(reportData.stay_and_advance?.promotion_path?.next_title, roleFamily)
      ? fallback?.stay_and_advance || reportData.stay_and_advance
      : reportData?.stay_and_advance;

  return {
    ...reportData,
    pivots: dedupedPivots,
    stay_and_advance: repairedStay,
  };
}

function isSparseCoverageRealismRisk(title, roleFamily, signal) {
  if (!roleFamily) return false;
  const normalizedTitle = normalizeText(title);
  if (!normalizedTitle) return false;

  const openings = Number(signal?.matched_openings_count || 0);
  const fit = Number(signal?.profile_fit_score || 0);
  if (openings >= 2 || fit >= 20) return false;

  const wordCount = normalizedTitle.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 5) return true;

  if (roleFamily === 'legal') {
    return /\b(architect|strategy|technology strategy|automation|director)\b/.test(normalizedTitle);
  }

  if (roleFamily === 'procurement') {
    return /\b(strategist|strategy|consultant|transformation|intelligence manager|platform)\b/.test(normalizedTitle);
  }

  if (roleFamily === 'education') {
    return /\b(architect|portfolio|strategy|automation specialist|success automation)\b/.test(normalizedTitle);
  }

  if (roleFamily === 'finance') {
    return /\b(strategist|transformation|systems lead|commercial growth|pricing optimization|ai program)\b/.test(normalizedTitle) || /[–—-]/.test(normalizedTitle);
  }

  if (roleFamily === 'operations') {
    return /\b(director|strategic execution|architect|consultant)\b/.test(normalizedTitle) || /[–—-]/.test(normalizedTitle);
  }

  if (roleFamily === 'hr') {
    return /\b(ai program|legal|contract|architect)\b/.test(normalizedTitle) || /[–—-]/.test(normalizedTitle);
  }

  return false;
}

function stabilizeSparseCoveragePivots(reportData, { jobTitle, industry, selectedTaskLabels, intakeProfile, locale }) {
  const roleFamily =
    inferSpecializedRoleFamily(jobTitle) ||
    inferSpecializedRoleFamily(industry, ...(selectedTaskLabels || []), ...(intakeProfile?.primary_tasks || []));
  if (!roleFamily || !Array.isArray(reportData?.pivots)) {
    return { reportData, changed: false };
  }

  const fallback = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile, locale);
  const fallbackByFrame = new Map(
    (fallback?.pivots || []).map((pivot) => [normalizeText(pivot?.decision_frame), pivot])
  );

  let changed = false;
  const stabilizedPivots = reportData.pivots.map((pivot, index) => {
    const signal = pivot?.live_market_signal || {};
    const frame = normalizeText(pivot?.decision_frame) || PIVOT_DECISION_FRAMES[index];
    const fallbackPivot = fallbackByFrame.get(frame) || fallback?.pivots?.[index];
    if (!fallbackPivot) return pivot;

    const shouldStabilize =
      isSparseCoverageRealismRisk(pivot?.title, roleFamily, signal) ||
      (roleFamily && (!titleMatchesRoleFamily(pivot?.title, roleFamily) || !titleMatchesCanonicalSpecializedFamily(pivot?.title, roleFamily))) ||
      isAmbitionMismatch(pivot?.title, jobTitle, frame) ||
      isSpecializedPivotImplausible(pivot?.title, roleFamily);

    if (!shouldStabilize) return pivot;

    changed = true;
    return {
      ...pivot,
      id: fallbackPivot.id,
      title: fallbackPivot.title,
      fit_summary: fallbackPivot.fit_summary,
      outcome: fallbackPivot.outcome,
      who_this_is_for: fallbackPivot.who_this_is_for,
      tradeoffs: fallbackPivot.tradeoffs,
      why_this_path_wins: fallbackPivot.why_this_path_wins,
      what_you_are_betting_on: fallbackPivot.what_you_are_betting_on,
      salary_range: fallbackPivot.salary_range,
      salary_delta: fallbackPivot.salary_delta,
      transition_time: fallbackPivot.transition_time,
      difficulty: fallbackPivot.difficulty,
      strengths_to_leverage: fallbackPivot.strengths_to_leverage,
      skill_gaps: buildRoleSpecificRepairSkillGaps(roleFamily, fallbackPivot.title, jobTitle) || fallbackPivot.skill_gaps,
      roadmap: fallbackPivot.roadmap,
      live_market_signal: {
        ...signal,
        stabilization_reason: `Sparse market coverage forced a safer canonical ${roleFamily} title.`,
      },
    };
  });

  return {
    reportData: {
      ...reportData,
      pivots: stabilizedPivots,
    },
    changed,
  };
}

function buildRetryInstruction(validationIssues, currentJobTitle) {
  return `Your previous draft did not differentiate the pivots enough.

Fix these issues and regenerate the full JSON report from scratch:
- ${validationIssues.join('\n- ')}

Regeneration rules:
- Keep exactly 5 pivots.
- Keep the required decision frames: safest transition, strongest leverage fit, fastest cash recovery, highest upside, long-term platform bet.
- Do not reuse or lightly restate the user's current title (${currentJobTitle || 'current role'}) as a pivot title.
- Do not use generic gaps like prompt design unless the pivot is explicitly an AI-builder or automation role.
- Change any overlapping pivot titles so each points to a materially different destination job family.
- Make each pivot's hiring logic, tradeoffs, and bet clearly distinct.
- Return the complete JSON object again, not a patch or explanation.`;
}

function buildStayRetryInstruction(validationIssues, currentJobTitle) {
  return `Your previous draft produced a weak stay-and-advance path.

Fix these issues and regenerate the full JSON report from scratch:
- ${validationIssues.join('\n- ')}

Regeneration rules for stay_and_advance:
- Do not use or lightly restate the user's current title (${currentJobTitle || 'current role'}) as the next title.
- Do not use "AI-Enabled ${currentJobTitle || 'role'}" or close variants.
- The next title must feel like a credible internal promotion, scope expansion, or stronger lane.
- The leverage opportunities must be specific to the user's function.
- The proof asset must be a concrete internal artifact a manager would respect.
- The metric must be specific to the function and outcome, not generic.
- Return the complete JSON object again, not a patch or explanation.`;
}

async function requestStructuredReport({
  userMessage,
  systemPrompt,
  stage,
  retryInstruction = null,
  maxTokensOverride = null,
  timeoutOverride = null,
  debugLabel = null,
}) {
  const messages = [{ role: 'system', content: systemPrompt }];
  if (retryInstruction) messages.push({ role: 'assistant', content: retryInstruction });
  messages.push({ role: 'user', content: userMessage });
  const { model, maxTokens, timeoutMs } = resolveOpenRouterConfig(stage);
  const resolvedMaxTokens = Number(maxTokensOverride || maxTokens);
  const resolvedTimeoutMs = Number(timeoutOverride || timeoutMs);

  const controller = new AbortController();
  const startedAt = Date.now();
  let timeoutHandle;

  try {
    const requestPromise = (async () => {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://pivotiq.app',
          'X-Title': 'PivotIQ',
        },
        body: JSON.stringify({
          model,
          max_tokens: resolvedMaxTokens,
          temperature: 0.7,
          reasoning: {
            effort: 'none',
            exclude: true,
          },
          messages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', { status: response.status, elapsed_ms: Date.now() - startedAt, errorText });
        throw new Error('Failed to generate report from OpenRouter.');
      }

      const data = JSON.parse(await response.text());
      const rawModelOutput = extractModelText(data);
      const parsed = parseModelJson(rawModelOutput);
      await logGenerateReportDebug('openrouter_response_parsed', {
        elapsed_ms: Date.now() - startedAt,
        model,
        label: debugLabel,
        raw_chars: rawModelOutput.length,
        parsed: Boolean(parsed),
      });

      return { rawModelOutput, parsed };
    })();

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        controller.abort();
        const timeoutError = new Error('OpenRouter request timed out.');
        timeoutError.code = 'OPENROUTER_TIMEOUT';
        reject(timeoutError);
      }, resolvedTimeoutMs);
    });

    const result = await Promise.race([requestPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle);
    if (error?.name === 'AbortError' || error?.code === 'OPENROUTER_TIMEOUT') {
      const timeoutError = new Error('OpenRouter request timed out.');
      timeoutError.code = 'OPENROUTER_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  }
}

function mergeFullReportSections({ core, pivots, stay }) {
  return {
    ...(core || {}),
    ...(pivots || {}),
    ...(stay || {}),
  };
}

async function requestFullReportSections({ jobTitle, industry, selectedTaskLabels, intakeProfile, locale }) {
  const sections = [
    {
      key: 'core',
      systemPrompt: FULL_CORE_SYSTEM_PROMPT,
      userMessage: buildFullSectionUserMessage('core', jobTitle, industry, selectedTaskLabels, intakeProfile, locale),
      maxTokensOverride: 2600,
      timeoutOverride: 90000,
    },
    {
      key: 'pivots',
      systemPrompt: FULL_PIVOTS_SYSTEM_PROMPT,
      userMessage: buildFullSectionUserMessage('pivots', jobTitle, industry, selectedTaskLabels, intakeProfile, locale),
      maxTokensOverride: 5200,
      timeoutOverride: 120000,
    },
    {
      key: 'stay',
      systemPrompt: FULL_STAY_SYSTEM_PROMPT,
      userMessage: buildFullSectionUserMessage('stay', jobTitle, industry, selectedTaskLabels, intakeProfile, locale),
      maxTokensOverride: 2400,
      timeoutOverride: 90000,
    },
  ];

  const settled = await Promise.allSettled(
    sections.map((section) =>
      requestStructuredReport({
        userMessage: section.userMessage,
        systemPrompt: section.systemPrompt,
        stage: 'full',
        maxTokensOverride: section.maxTokensOverride,
        timeoutOverride: section.timeoutOverride,
        debugLabel: section.key,
      })
    )
  );

  const parsedSections = {};
  const rawOutputs = [];
  const errors = [];

  settled.forEach((result, index) => {
    const section = sections[index];
    if (result.status === 'fulfilled') {
      if (result.value?.rawModelOutput) rawOutputs.push(`[${section.key}] ${result.value.rawModelOutput}`);
      if (result.value?.parsed) parsedSections[section.key] = result.value.parsed;
      else errors.push(`${section.key}: empty parse`);
    } else {
      errors.push(`${section.key}: ${result.reason?.code || result.reason?.message || 'unknown error'}`);
    }
  });

  return {
    parsed: Object.keys(parsedSections).length
      ? mergeFullReportSections({
          core: parsedSections.core,
          pivots: parsedSections.pivots,
          stay: parsedSections.stay,
        })
      : null,
    rawModelOutput: rawOutputs.join('\n\n'),
    errors,
  };
}

export async function generatePivotIQReport({
  jobTitle,
  industry,
  selectedTaskLabels,
  intakeProfile,
  locale,
  stage = 'preview',
}) {
  let reportData;
  let demoMode = false;
  let rawModelOutput = null;

  if (!process.env.OPENROUTER_API_KEY) {
    reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile, locale);
    demoMode = true;
  } else {
    let parsed = null;

    try {
      if (stage === 'preview') {
        const userMessage = buildUserMessage(jobTitle, industry, selectedTaskLabels, intakeProfile, locale, stage);
        const initialAttempt = await requestStructuredReport({
          userMessage,
          systemPrompt: PREVIEW_SYSTEM_PROMPT,
          stage,
          debugLabel: 'preview',
        });
        rawModelOutput = initialAttempt.rawModelOutput;
        parsed = initialAttempt.parsed;
      } else {
        const fullAttempt = await requestFullReportSections({
          jobTitle,
          industry,
          selectedTaskLabels,
          intakeProfile,
          locale,
        });
        rawModelOutput = fullAttempt.rawModelOutput;
        parsed = fullAttempt.parsed;
        if (fullAttempt.errors.length) {
          await logGenerateReportDebug('full_parallel_generation_partial', {
            errors: fullAttempt.errors,
            parsed_sections: Object.keys(fullAttempt.parsed || {}),
          });
        }
      }
    } catch (error) {
      console.error('OpenRouter request error:', error);
      reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile, locale);
      demoMode = true;
    }

    if (!reportData && !parsed) {
      reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile, locale);
      demoMode = true;
    } else if (!reportData) {
      reportData = hydrateModelReportData(parsed, {
        job_title: jobTitle,
        industry,
        tasks: selectedTaskLabels,
        selected_tasks: intakeProfile.selected_tasks,
        primary_tasks: intakeProfile.primary_tasks,
        clarifiers: intakeProfile.clarifiers,
        linkedin_profile_url: intakeProfile.linkedin_profile_url,
      });
      reportData = repairWeakPivots(reportData, {
        jobTitle,
        industry,
        selectedTaskLabels,
        intakeProfile,
        locale,
      });

      if (stage === 'full') {
        const validation = validatePivotDifferentiation(reportData, jobTitle);
        const stayValidation = validateStayAndAdvance(reportData, jobTitle);
        if (!validation.valid || !stayValidation.valid) {
          try {
            const retryResults = [];
            if (!validation.valid) {
              const pivotRetry = await requestStructuredReport({
                userMessage: buildFullSectionUserMessage('pivots', jobTitle, industry, selectedTaskLabels, intakeProfile, locale),
                systemPrompt: FULL_PIVOTS_SYSTEM_PROMPT,
                stage,
                retryInstruction: buildRetryInstruction(validation.issues, jobTitle),
                maxTokensOverride: 5200,
                timeoutOverride: 120000,
                debugLabel: 'pivots-retry',
              });
              retryResults.push(['pivots', pivotRetry]);
            }
            if (!stayValidation.valid) {
              const stayRetry = await requestStructuredReport({
                userMessage: buildFullSectionUserMessage('stay', jobTitle, industry, selectedTaskLabels, intakeProfile, locale),
                systemPrompt: FULL_STAY_SYSTEM_PROMPT,
                stage,
                retryInstruction: buildStayRetryInstruction(stayValidation.issues, jobTitle),
                maxTokensOverride: 2400,
                timeoutOverride: 90000,
                debugLabel: 'stay-retry',
              });
              retryResults.push(['stay_and_advance', stayRetry]);
            }

            if (retryResults.length) {
              const mergedRetry = {
                ...parsed,
              };
              for (const [key, result] of retryResults) {
                if (result?.rawModelOutput) {
                  rawModelOutput = [rawModelOutput, `[${key}-retry] ${result.rawModelOutput}`].filter(Boolean).join('\n\n');
                }
                if (result?.parsed) {
                  if (key === 'pivots') mergedRetry.pivots = result.parsed.pivots;
                  if (key === 'stay_and_advance') mergedRetry.stay_and_advance = result.parsed.stay_and_advance;
                }
              }

              const retriedReportData = hydrateModelReportData(mergedRetry, {
                job_title: jobTitle,
                industry,
                tasks: selectedTaskLabels,
                selected_tasks: intakeProfile.selected_tasks,
                primary_tasks: intakeProfile.primary_tasks,
                clarifiers: intakeProfile.clarifiers,
                linkedin_profile_url: intakeProfile.linkedin_profile_url,
              });
              const repairedRetriedReportData = repairWeakPivots(retriedReportData, {
                jobTitle,
                industry,
                selectedTaskLabels,
                intakeProfile,
                locale,
              });

              if (
                validatePivotDifferentiation(repairedRetriedReportData, jobTitle).valid &&
                validateStayAndAdvance(repairedRetriedReportData, jobTitle).valid
              ) {
                reportData = repairedRetriedReportData;
              }
            }
          } catch (error) {
            console.error('OpenRouter retry request error:', error);
          }
        }
      }
    }
  }

  reportData = repairWeakPivots(reportData, {
    jobTitle,
    industry,
    selectedTaskLabels,
    intakeProfile,
    locale,
  });

  reportData = await groundReportWithLiveJobMarket(reportData, {
    job_title: jobTitle,
    industry,
    tasks: selectedTaskLabels,
    selected_tasks: intakeProfile.selected_tasks,
    primary_tasks: intakeProfile.primary_tasks,
    clarifiers: intakeProfile.clarifiers,
    linkedin_profile_url: intakeProfile.linkedin_profile_url,
  });

  const stabilized = stabilizeSparseCoveragePivots(reportData, {
    jobTitle,
    industry,
    selectedTaskLabels,
    intakeProfile,
    locale,
  });

  reportData = stabilized.reportData;

  if (stabilized.changed) {
    reportData = await groundReportWithLiveJobMarket(reportData, {
      job_title: jobTitle,
      industry,
      tasks: selectedTaskLabels,
      selected_tasks: intakeProfile.selected_tasks,
      primary_tasks: intakeProfile.primary_tasks,
      clarifiers: intakeProfile.clarifiers,
      linkedin_profile_url: intakeProfile.linkedin_profile_url,
    });
  }

  reportData = await enrichReportLearningResources(reportData, {
    job_title: jobTitle,
    industry,
    tasks: selectedTaskLabels,
    selected_tasks: intakeProfile.selected_tasks,
    primary_tasks: intakeProfile.primary_tasks,
    clarifiers: intakeProfile.clarifiers,
    linkedin_profile_url: intakeProfile.linkedin_profile_url,
  });

  reportData = normalizeReportData(reportData, {
    job_title: jobTitle,
    industry,
    tasks: selectedTaskLabels,
    selected_tasks: intakeProfile.selected_tasks,
    primary_tasks: intakeProfile.primary_tasks,
    clarifiers: intakeProfile.clarifiers,
    linkedin_profile_url: intakeProfile.linkedin_profile_url,
    locale,
  });

  reportData = {
    ...reportData,
    locale,
    generation_stage: stage === 'full' ? 'full_complete' : 'preview_complete',
    profile: {
      ...(reportData?.profile || {}),
      locale,
    },
  };

  reportData = canonicalizePivotIds(reportData);

  return {
    reportData,
    demoMode,
    rawModelOutput,
  };
}
