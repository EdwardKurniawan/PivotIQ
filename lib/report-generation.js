import { buildDemoReportData, hydrateModelReportData, parseModelJson } from './report-data';
import { enrichReportLearningResources } from './course-catalog';
import { appendFile } from 'node:fs/promises';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.6';
const IS_CLAUDE_SONNET_46 = OPENROUTER_MODEL.includes('anthropic/claude-sonnet-4.6');
const OPENROUTER_MAX_TOKENS = IS_CLAUDE_SONNET_46
  ? Math.min(Number(process.env.OPENROUTER_MAX_TOKENS || 16000), 16000)
  : Number(process.env.OPENROUTER_MAX_TOKENS || 7000);
const OPENROUTER_TIMEOUT_MS = IS_CLAUDE_SONNET_46
  ? Math.max(Number(process.env.OPENROUTER_TIMEOUT_MS || 240000), 240000)
  : Number(process.env.OPENROUTER_TIMEOUT_MS || 35000);
const DEBUG_LOG_PATH = '/tmp/pivotiq-generate-report.log';

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
      "role_blend": "execution | mixed | strategy",
      "management_scope": "none | small-team | larger-team | null"
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
      "role_blend": "execution | mixed | strategy",
      "management_scope": "none | small-team | larger-team | null"
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
3. Every pivot must feel adjacent and believable based on the user's real background.
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
2. Focus on diagnosis, role interpretation, and one believable next move.
3. Do not include the full paid-program depth like multiple pivots, ROI, or a 30-day plan.
4. Keep task breakdown limited to the most important items.
5. Include direct trustworthy learning resources only if they tightly fit the preview pivot.
6. Return ONLY valid JSON with no markdown fence, no commentary, and no prose outside the JSON object.
7. All user-facing prose values must be written in the requested output language.
8. Keep JSON keys, enum values, and schema structure in English exactly as defined.

Use exactly the schema below and do not omit fields:
${PREVIEW_REPORT_SCHEMA_GUIDE}`;

function buildLanguageLabel(locale) {
  const normalizedLocale = String(locale || 'en').toLowerCase();
  return normalizedLocale === 'nl' ? 'Dutch' : normalizedLocale === 'de' ? 'German' : 'English';
}

function buildUserMessage(jobTitle, industry, tasks, intakeProfile, locale, stage) {
  const selectedTasks = intakeProfile?.selected_tasks || [];
  const primaryTasks = intakeProfile?.primary_tasks || [];
  const clarifiers = intakeProfile?.clarifiers || {};
  const languageLabel = buildLanguageLabel(locale);

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
        'Make the problem-to-solution connection explicit in every pivot.',
        'Make the free-layer interpretation feel personally diagnostic, not generic.',
        'Name durable strengths the user already has, not just gaps they need to fix.',
        'Every pivot must include who it is for, why it wins, tradeoffs, and what the user is betting on.',
        'Add a clear decision verdict telling the user whether to stay, build a hybrid transition, or start an active pivot now.',
        'Add a career ROI read that explains salary upside, transition time, learning cost, and rough payback logic.',
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

Requirements:
- ${requirements.join('\n- ')}
- Do not include any weekly roadmap content or roadmap field in the response.
- Every resource URL must be a direct learning destination page from a trusted provider, not a blog post or general article.
- All user-facing prose values must be written in ${languageLabel}.
- Keep JSON keys, enum values, and schema structure in English exactly as defined.
- Return valid JSON only.`;
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
  if (normalizedTitle === `ai enabled ${normalizedCurrent}`) return true;
  if (normalizedTitle.endsWith(normalizedCurrent) && normalizedTitle.includes('ai enabled')) return true;

  const overlap = jaccardSimilarity(uniqueTokens(normalizedTitle), uniqueTokens(normalizedCurrent));
  return overlap >= 0.8;
}

function pivotAllowsGenericAIGaps(pivot) {
  const normalized = normalizeText([pivot?.title, pivot?.decision_frame, pivot?.fit_summary].join(' '));
  return /(ai program manager|automation consultant|llm|prompt|agent|workflow automation|ai builder|automation engineer)/.test(normalized);
}

function isGenericAIGap(skillGap) {
  const normalized = normalizeText([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '));
  return /(prompt design|prompt engineering|prompting|learn prompting|ai literacy|generative ai basics)/.test(normalized);
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

function validatePivotDifferentiation(reportData, currentJobTitle) {
  const pivots = Array.isArray(reportData?.pivots) ? reportData.pivots : [];
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

async function requestStructuredReport({ userMessage, systemPrompt, retryInstruction = null }) {
  const messages = [{ role: 'system', content: systemPrompt }];
  if (retryInstruction) messages.push({ role: 'assistant', content: retryInstruction });
  messages.push({ role: 'user', content: userMessage });

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
          model: OPENROUTER_MODEL,
          max_tokens: OPENROUTER_MAX_TOKENS,
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
      }, OPENROUTER_TIMEOUT_MS);
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
    const userMessage = buildUserMessage(jobTitle, industry, selectedTaskLabels, intakeProfile, locale, stage);
    const systemPrompt = stage === 'preview' ? PREVIEW_SYSTEM_PROMPT : FULL_SYSTEM_PROMPT;
    let parsed = null;

    try {
      const initialAttempt = await requestStructuredReport({ userMessage, systemPrompt });
      rawModelOutput = initialAttempt.rawModelOutput;
      parsed = initialAttempt.parsed;
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

      if (stage === 'full') {
        const validation = validatePivotDifferentiation(reportData, jobTitle);
        if (!validation.valid) {
          try {
            const retryAttempt = await requestStructuredReport({
              userMessage,
              systemPrompt,
              retryInstruction: buildRetryInstruction(validation.issues, jobTitle),
            });
            rawModelOutput = retryAttempt.rawModelOutput;
            if (retryAttempt.parsed) {
              const retriedReportData = hydrateModelReportData(retryAttempt.parsed, {
                job_title: jobTitle,
                industry,
                tasks: selectedTaskLabels,
                selected_tasks: intakeProfile.selected_tasks,
                primary_tasks: intakeProfile.primary_tasks,
                clarifiers: intakeProfile.clarifiers,
                linkedin_profile_url: intakeProfile.linkedin_profile_url,
              });
              if (validatePivotDifferentiation(retriedReportData, jobTitle).valid) {
                reportData = retriedReportData;
              }
            }
          } catch (error) {
            console.error('OpenRouter retry request error:', error);
          }
        }
      }
    }
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

  reportData = {
    ...reportData,
    locale,
    generation_stage: stage === 'full' ? 'full_complete' : 'preview_complete',
    profile: {
      ...(reportData?.profile || {}),
      locale,
    },
  };

  return {
    reportData,
    demoMode,
    rawModelOutput,
  };
}
