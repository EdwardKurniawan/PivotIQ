import { extractJobSignals, inferDomainFocus, inferRoleFamily } from './job-openings.js';
import { canonicalRoleFamilyForTrack, classifyJobTrack, sanitizeGroundingSkills } from './job-grounding.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

const ENRICHMENT_SYSTEM_PROMPT = `You are PivotIQ, a career intelligence analyst.

Your job is to enrich a job posting into a compact structured record.

Rules:
- Return valid JSON only.
- Use concise strings and arrays.
- Keep role_family to one of: legal, procurement, education, marketing, finance, operations, customer, product, general.
- Keep domain_focus short and concrete.
- required_skills should include only skills that look genuinely required.
- preferred_skills should include only skills that look optional or bonus.
- tools should include named software, systems, or platforms.
- proof_assets should describe concrete artifacts or outputs someone in this role would likely produce.
- enrichment_summary should be 1-2 sentences.

Schema:
{
  "role_family": "string",
  "domain_focus": "string",
  "seniority": "junior | senior | manager | director | executive | general",
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "tools": ["string"],
  "job_functions": ["string"],
  "proof_assets": ["string"],
  "enrichment_summary": "string"
}`;

function parseModelJson(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function extractModelText(data) {
  const message = data?.choices?.[0]?.message || {};
  const content = message.content;

  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : item?.text || item?.content || ''))
      .join('\n')
      .trim();
  }

  return data?.choices?.[0]?.text || '';
}

function unique(items, limit = 8) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))].slice(0, limit);
}

function normalizeSeniority(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['junior', 'senior', 'manager', 'director', 'executive'].includes(normalized)) return normalized;
  return 'general';
}

function mergeSkillSignals(job, parsed, track) {
  const deterministic = extractJobSignals(job.description_text || '');
  const title = job.title || '';

  return {
    required_skills: sanitizeGroundingSkills(
      unique([
        ...(deterministic.requiredSkills || []),
        ...((parsed?.required_skills || []).map((item) => String(item || '').trim())),
      ], 10),
      track,
      title
    ),
    preferred_skills: sanitizeGroundingSkills(
      unique([
        ...(deterministic.preferredSkills || []),
        ...((parsed?.preferred_skills || []).map((item) => String(item || '').trim())),
      ], 10),
      track,
      title
    ),
    tools: unique([
      ...(deterministic.tools || []),
      ...((parsed?.tools || []).map((item) => String(item || '').trim())),
    ], 10),
    job_functions: unique([
      ...(deterministic.jobFunctions || []),
      ...((parsed?.job_functions || []).map((item) => String(item || '').trim())),
    ], 8),
  };
}

export async function enrichJobOpening(job) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for job enrichment.');
  }

  const userMessage = `Enrich this job posting.

TITLE: ${job.title}
COMPANY: ${job.company_name}
DEPARTMENT: ${job.department || 'Not provided'}
LOCATION: ${job.location_text || 'Not provided'}
LOCATION TYPE: ${job.location_type || 'Not provided'}
EMPLOYMENT TYPE: ${job.employment_type || 'Not provided'}
CURRENT ROLE FAMILY: ${job.role_family || 'general'}
CURRENT DOMAIN FOCUS: ${job.domain_focus || 'Not provided'}

DESCRIPTION:
${String(job.description_text || '').slice(0, 12000)}`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://pivotiq.app',
      'X-Title': 'PivotIQ',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1800,
      temperature: 0.2,
      reasoning: {
        effort: 'none',
        exclude: true,
      },
      messages: [
        { role: 'system', content: ENRICHMENT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter enrichment failed with status ${response.status}`);
  }

  const data = JSON.parse(await response.text());
  const rawModelOutput = extractModelText(data);
  const parsed = parseModelJson(rawModelOutput);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Failed to parse enrichment JSON.');
  }

  const heuristicRoleFamily = inferRoleFamily({
    title: job.title || '',
    department: job.department || '',
    description: job.description_text || '',
  });
  const heuristicDomainFocus = inferDomainFocus(`${job.title || ''} ${job.department || ''} ${job.description_text || ''}`);
  const inferredTrack = classifyJobTrack({
    title: job.title,
    department: job.department,
    role_family: parsed.role_family || heuristicRoleFamily,
    domain_focus: parsed.domain_focus || heuristicDomainFocus,
    enrichment_summary: parsed.enrichment_summary || '',
  });
  const canonicalRoleFamily = canonicalRoleFamilyForTrack(inferredTrack) || heuristicRoleFamily || 'general';
  const mergedSignals = mergeSkillSignals(job, parsed, inferredTrack);

  return {
    role_family: String(canonicalRoleFamily || job.role_family || 'general').trim().toLowerCase(),
    domain_focus: String(parsed.domain_focus || heuristicDomainFocus || job.domain_focus || '').trim(),
    seniority: normalizeSeniority(parsed.seniority || job.seniority),
    required_skills: mergedSignals.required_skills,
    preferred_skills: mergedSignals.preferred_skills,
    tools: mergedSignals.tools,
    job_functions: mergedSignals.job_functions,
    proof_assets: unique(parsed.proof_assets, 6),
    enrichment_summary: String(parsed.enrichment_summary || '').trim(),
    enrichment_status: 'enriched',
    enrichment_model: MODEL,
    enriched_at: new Date().toISOString(),
  };
}
