import { buildDemoReportData, hydrateModelReportData, parseModelJson, slugify } from '../../../lib/report-data';
import { enrichReportLearningResources } from '../../../lib/course-catalog';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { appendFile } from 'node:fs/promises';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3.6-plus-preview:free';
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || 7000);
const OPENROUTER_TIMEOUT_MS = Number(process.env.OPENROUTER_TIMEOUT_MS || 35000);
const PERSIST_TIMEOUT_MS = Number(process.env.PERSIST_TIMEOUT_MS || 15000);
const DEBUG_LOG_PATH = '/tmp/pivotiq-generate-report.log';

const REPORT_SCHEMA_GUIDE = `{
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

const SYSTEM_PROMPT = `You are PivotIQ, an expert career intelligence analyst specializing in AI job displacement risk and career transition strategy.

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

Pivot differentiation rules:
- Each pivot must target a materially different destination job family, not 5 variants of the same role.
- The safest transition should stay closest to the user's current context and existing credibility.
- The strongest leverage fit should convert the user's most transferable strengths into a clearly adjacent role with a different hiring logic than the safest option.
- The fastest cash recovery path should emphasize quickest credible monetization, employability, or consulting-style income recovery.
- The highest upside path should be a more ambitious strategic bet with a meaningfully different compensation and scope profile.
- The long-term platform bet should point to a role family likely to compound as AI adoption deepens over the next few years, even if it takes more setup.
- The titles, fit summaries, tradeoffs, why-this-wins logic, and what-you-are-betting-on sections must clearly differentiate the pivots.
- Do not reuse the same core destination nouns across multiple pivot titles unless the job family is genuinely different.
- Each pivot must have distinct failure risks and distinct reasons it could plausibly win.
- Only use learning resource URLs from trusted learning providers or official product docs.
- Good examples: Coursera course pages, Udemy course pages, DataCamp course pages, edX course/program pages, DeepLearning.AI course pages, official docs, or official books.
- Bad examples: HBR articles, Medium posts, newsletters, generic blogs, or pages that are not the actual learning destination.
- The decision section must make a clear recommendation: stay-and-redesign, hybrid-transition, or active-pivot.
- The career_roi section should express the economic tradeoff clearly enough that the user can judge whether the move is worth it.
- The first_30_days section should be practical, specific, and biased toward proof assets over passive study.

The app will generate the detailed week-by-week roadmap locally, so do not include roadmap fields anywhere.

Use exactly the schema below and do not omit fields:
${REPORT_SCHEMA_GUIDE}`;

const PIVOT_DECISION_FRAMES = [
  'safest transition',
  'strongest leverage fit',
  'fastest cash recovery',
  'highest upside',
  'long-term platform bet',
];
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

function normalizeIntakePayload(payload) {
  const intakeProfile = payload?.intakeProfile || {};
  const selectedTasks = Array.isArray(intakeProfile.selected_tasks)
    ? intakeProfile.selected_tasks.filter(Boolean)
    : [];
  const selectedTaskLabels = selectedTasks.length
    ? selectedTasks.map((task) => task?.label).filter(Boolean)
    : Array.isArray(payload?.tasks)
      ? payload.tasks.filter(Boolean)
      : [];

  return {
    jobTitle: payload?.jobTitle || intakeProfile.job_title_raw || '',
    industry: payload?.industry || intakeProfile.industry || '',
    email: payload?.email || null,
    intakeProfile: {
      job_title_raw: intakeProfile.job_title_raw || payload?.jobTitle || '',
      job_title_normalized: intakeProfile.job_title_normalized || intakeProfile.job_title_raw || payload?.jobTitle || '',
      industry: intakeProfile.industry || payload?.industry || '',
      linkedin_profile_url: intakeProfile.linkedin_profile_url || null,
      selected_tasks: selectedTasks.map((task) => ({
        task_id: task.task_id || task.label,
        label: task.label,
        category: task.category || 'custom',
        source: task.source || 'recommended',
      })),
      primary_tasks: Array.isArray(intakeProfile.primary_tasks) ? intakeProfile.primary_tasks.filter(Boolean) : [],
      clarifiers: intakeProfile.clarifiers && typeof intakeProfile.clarifiers === 'object' ? intakeProfile.clarifiers : {},
    },
    selectedTaskLabels,
  };
}

function buildUserMessage(jobTitle, industry, tasks, intakeProfile) {
  const selectedTasks = intakeProfile?.selected_tasks || [];
  const primaryTasks = intakeProfile?.primary_tasks || [];
  const clarifiers = intakeProfile?.clarifiers || {};

  return `Create a PivotIQ structured report for this user.

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
- Generate exactly 5 pivots.
- Label the pivots so they clearly map to safest transition, strongest leverage fit, fastest cash recovery, highest upside, and long-term platform bet.
- Use realistic salary, timeline, and difficulty.
- Keep risk scores realistic.
- Weigh the primary tasks more heavily when explaining the user's risk and roadmap.
- Use the clarifiers to distinguish execution-heavy work from strategy-heavy work.
- Make the problem-to-solution connection explicit in every pivot.
- Make the free-layer interpretation feel personally diagnostic, not generic.
- Name durable strengths the user already has, not just gaps they need to fix.
- Every pivot must include who it is for, why it wins, tradeoffs, and what the user is betting on.
- Add a clear decision verdict telling the user whether to stay, build a hybrid transition, or start an active pivot now.
- Add a career ROI read that explains salary upside, transition time, learning cost, and rough payback logic.
- Add a proof-based first 30 days plan with next 7 days, next 30 days, what to avoid, and one concrete proof asset.
- Make the 5 pivot titles land in materially different job families, not adjacent synonyms.
- Give each pivot distinct tradeoffs, downside risks, and strategic logic.
- If two pivots would lead to similar hiring-manager expectations, change one of them.
- Do not include any weekly roadmap content or roadmap field in the response.
- Every skill gap must include a real resource URL.
- Every resource URL must be a direct learning destination page from a trusted provider, not a blog post or general article.
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
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextFragments(item));
  }
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

function analyzePivotSimilarity(pivots) {
  const diagnostics = [];

  for (let index = 0; index < pivots.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < pivots.length; compareIndex += 1) {
      const left = pivots[index];
      const right = pivots[compareIndex];
      const leftTitleTokens = uniqueTokens(left?.title);
      const rightTitleTokens = uniqueTokens(right?.title);
      const descriptorOverlap = jaccardSimilarity(
        uniqueTokens(compactPivotDescriptor(left)),
        uniqueTokens(compactPivotDescriptor(right))
      );
      const titleOverlap = jaccardSimilarity(leftTitleTokens, rightTitleTokens);
      const decisionFrameMatch =
        normalizeText(left?.decision_frame) === normalizeText(right?.decision_frame);

      const reasons = [];
      if (titleOverlap >= 0.6) {
        reasons.push(`titles overlap too much (${left?.title} vs ${right?.title})`);
      }
      if (descriptorOverlap >= 0.55) {
        reasons.push(`strategic logic overlaps too much (${Math.round(descriptorOverlap * 100)}% token overlap)`);
      }
      if (decisionFrameMatch) {
        reasons.push('decision frames are duplicated');
      }

      diagnostics.push({
        pair: [left?.title || `pivot-${index + 1}`, right?.title || `pivot-${compareIndex + 1}`],
        titleOverlap,
        descriptorOverlap,
        decisionFrameMatch,
        reasons,
      });
    }
  }

  return diagnostics;
}

function validatePivotDifferentiation(reportData) {
  const pivots = Array.isArray(reportData?.pivots) ? reportData.pivots : [];
  const issues = [];

  if (pivots.length !== 5) {
    issues.push(`expected exactly 5 pivots, received ${pivots.length}`);
  }

  const normalizedFrames = pivots.map((pivot) => normalizeText(pivot?.decision_frame));
  const missingFrames = PIVOT_DECISION_FRAMES.filter((frame) => !normalizedFrames.includes(frame));
  if (missingFrames.length) {
    issues.push(`missing required decision frame(s): ${missingFrames.join(', ')}`);
  }

  const duplicateFrames = normalizedFrames.filter(
    (frame, index) => frame && normalizedFrames.indexOf(frame) !== index
  );
  if (duplicateFrames.length) {
    issues.push(`duplicate decision frame(s): ${[...new Set(duplicateFrames)].join(', ')}`);
  }

  const diagnostics = analyzePivotSimilarity(pivots);
  diagnostics.forEach((diagnostic) => {
    if (diagnostic.reasons.length) {
      issues.push(`${diagnostic.pair.join(' vs ')}: ${diagnostic.reasons.join('; ')}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

function buildRetryInstruction(validationIssues) {
  return `Your previous draft did not differentiate the pivots enough.

Fix these issues and regenerate the full JSON report from scratch:
- ${validationIssues.join('\n- ')}

Regeneration rules:
- Keep exactly 5 pivots.
- Keep the required decision frames: safest transition, strongest leverage fit, fastest cash recovery, highest upside, long-term platform bet.
- Change any overlapping pivot titles so each points to a materially different destination job family.
- Make each pivot's hiring logic, tradeoffs, and bet clearly distinct.
- Return the complete JSON object again, not a patch or explanation.`;
}

async function requestStructuredReport(userMessage, retryInstruction = null) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (retryInstruction) {
    messages.push({ role: 'assistant', content: retryInstruction });
  }

  messages.push({ role: 'user', content: userMessage });
  const controller = new AbortController();
  const startedAt = Date.now();
  let timeoutHandle;

  try {
    const requestPromise = (async () => {
      await logGenerateReportDebug('openrouter_request_start', {
        has_retry_instruction: Boolean(retryInstruction),
        user_message_chars: userMessage.length,
        max_tokens: OPENROUTER_MAX_TOKENS,
        model: OPENROUTER_MODEL,
      });
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
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

      await logGenerateReportDebug('openrouter_response_received', {
        elapsed_ms: Date.now() - startedAt,
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', {
          status: response.status,
          elapsed_ms: Date.now() - startedAt,
          errorText,
        });
        throw new Error('Failed to generate report from OpenRouter.');
      }

      const responseText = await response.text();
      await logGenerateReportDebug('openrouter_response_text_loaded', {
        elapsed_ms: Date.now() - startedAt,
        response_chars: responseText.length,
      });

      let data = null;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        await logGenerateReportDebug('openrouter_outer_json_parse_failed', {
          elapsed_ms: Date.now() - startedAt,
          error: String(parseError),
          response_preview: responseText.slice(0, 300),
        });
        throw parseError;
      }

    const rawModelOutput = extractModelText(data);
    const parsed = parseModelJson(rawModelOutput);
    await logGenerateReportDebug('openrouter_response_parsed', {
      elapsed_ms: Date.now() - startedAt,
      raw_chars: rawModelOutput.length,
      parsed: Boolean(parsed),
      choice_keys: Object.keys(data?.choices?.[0]?.message || {}),
    });

      return {
        rawModelOutput,
        parsed,
      };
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
      await logGenerateReportDebug('openrouter_timeout', {
        elapsed_ms: Date.now() - startedAt,
        model: OPENROUTER_MODEL,
      });
      console.error(`OpenRouter request timed out after ${OPENROUTER_TIMEOUT_MS}ms`, {
        elapsed_ms: Date.now() - startedAt,
        model: OPENROUTER_MODEL,
      });
      if (error?.code === 'OPENROUTER_TIMEOUT') {
        throw error;
      }
      const timeoutError = new Error('OpenRouter request timed out.');
      timeoutError.code = 'OPENROUTER_TIMEOUT';
      throw timeoutError;
    }

    await logGenerateReportDebug('openrouter_request_error', {
      elapsed_ms: Date.now() - startedAt,
      error: String(error),
      name: error?.name || null,
      code: error?.code || null,
    });
    throw error;
  }
}

async function maybePersistReport(reportData) {
  await logGenerateReportDebug('persist_start', {
    has_report: Boolean(reportData),
  });
  const persistOperation = async () => {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = reportData.profile || {};
    const summary = reportData.summary || {};
    const defaultPivot = reportData.pivots?.[0] || null;

    const insertPayload = {
      user_id: user.id,
      slug: `${slugify(profile.job_title || 'report')}-${Date.now()}`,
      job_title: profile.job_title || '',
      industry: profile.industry || '',
      tasks: profile.tasks || [],
      report_data: reportData,
      risk_score: summary.overall_score || 0,
      risk_level: summary.risk_level || 'MODERATE',
      access_tier: 'free',
      active_pivot_id: defaultPivot?.id || null,
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(insertPayload)
      .select('id, slug')
      .single();

    if (error) {
      await logGenerateReportDebug('persist_insert_error', {
        error: error.message || String(error),
      });
      console.error('Supabase report persistence error:', error);
      return null;
    }

    await logGenerateReportDebug('persist_success', {
      id: data?.id || null,
      slug: data?.slug || null,
    });
    return data;
  };

  try {
    return await Promise.race([
      persistOperation(),
      new Promise((resolve) =>
        setTimeout(() => {
          logGenerateReportDebug('persist_timeout', {
            timeout_ms: PERSIST_TIMEOUT_MS,
          });
          console.error(`Supabase report persistence timed out after ${PERSIST_TIMEOUT_MS}ms`);
          resolve(null);
        }, PERSIST_TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    await logGenerateReportDebug('persist_threw', {
      error: String(error),
    });
    console.error('Supabase report persistence threw an error:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    await logGenerateReportDebug('route_start');
    const payload = await request.json();
    const { jobTitle, industry, selectedTaskLabels, intakeProfile, email } = normalizeIntakePayload(payload);
    await logGenerateReportDebug('route_payload_ready', {
      jobTitle,
      industry,
      taskCount: selectedTaskLabels?.length || 0,
    });

    if (!jobTitle || !industry || !selectedTaskLabels?.length) {
      await logGenerateReportDebug('route_missing_required_fields');
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let reportData;
    let demoMode = false;
    let rawModelOutput = null;

    if (!process.env.OPENROUTER_API_KEY) {
      reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile);
      demoMode = true;
      await logGenerateReportDebug('route_demo_mode_no_key');
    } else {
      const userMessage = buildUserMessage(jobTitle, industry, selectedTaskLabels, intakeProfile);
      let parsed = null;
      let validation = null;

      try {
        const initialAttempt = await requestStructuredReport(userMessage);
        rawModelOutput = initialAttempt.rawModelOutput;
        parsed = initialAttempt.parsed;
        await logGenerateReportDebug('route_initial_attempt_complete', {
          parsed: Boolean(parsed),
          raw_chars: rawModelOutput?.length || 0,
        });
      } catch (error) {
        console.error('OpenRouter request error:', error);
        reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile);
        demoMode = true;
        await logGenerateReportDebug('route_fallback_demo_after_openrouter_error', {
          error: String(error),
          code: error?.code || null,
        });
      }

      if (!reportData && !parsed) {
        console.error('Structured report JSON parse failed. Raw output:', rawModelOutput);
        reportData = buildDemoReportData(jobTitle, industry, selectedTaskLabels, intakeProfile);
        demoMode = true;
        await logGenerateReportDebug('route_fallback_demo_after_parse_failure');
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

        validation = validatePivotDifferentiation(reportData);
        await logGenerateReportDebug('route_validation_complete', {
          valid: validation.valid,
          issues: validation.issues,
        });

        if (!validation.valid) {
          console.warn('Pivot differentiation validation failed on first pass:', validation.issues);

          try {
            const retryAttempt = await requestStructuredReport(
              userMessage,
              buildRetryInstruction(validation.issues)
            );
            rawModelOutput = retryAttempt.rawModelOutput;
            await logGenerateReportDebug('route_retry_attempt_complete', {
              parsed: Boolean(retryAttempt.parsed),
              raw_chars: rawModelOutput?.length || 0,
            });

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
              const retryValidation = validatePivotDifferentiation(retriedReportData);

              if (retryValidation.valid) {
                reportData = retriedReportData;
                await logGenerateReportDebug('route_retry_validation_passed');
              } else {
                await logGenerateReportDebug('route_retry_validation_failed', {
                  issues: retryValidation.issues,
                });
                console.warn('Pivot differentiation validation still failed after retry:', retryValidation.issues);
              }
            } else {
              await logGenerateReportDebug('route_retry_parse_failed');
              console.error('Structured report JSON parse failed after retry. Raw output:', rawModelOutput);
            }
          } catch (error) {
            await logGenerateReportDebug('route_retry_request_error', {
              error: String(error),
              code: error?.code || null,
            });
            console.error('OpenRouter retry request error:', error);
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

    await logGenerateReportDebug('route_before_persist', {
      demoMode,
      pivotCount: reportData?.pivots?.length || 0,
    });
    const persisted = await maybePersistReport(reportData);
    await logGenerateReportDebug('route_after_persist', {
      persisted: Boolean(persisted),
    });

    await logGenerateReportDebug('route_response_ready', {
      demoMode,
      pivotCount: reportData?.pivots?.length || 0,
    });
    return Response.json({
      reportData,
      reportId: persisted?.id || null,
      reportSlug: persisted?.slug || null,
      demoMode,
      email: email || null,
      rawModelOutput,
    });
  } catch (err) {
    await logGenerateReportDebug('route_unhandled_error', {
      error: String(err),
      name: err?.name || null,
    });
    console.error('Report generation error:', err);
    return Response.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}
