import { createSupabaseAdminClient } from './supabase/admin.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function overlapCount(left, right) {
  const rightSet = new Set(right);
  let count = 0;
  for (const token of left) {
    if (rightSet.has(token)) count += 1;
  }
  return count;
}

function scoreJobOpening(query, row, requestedSkills) {
  const queryTokens = tokenize(query);
  const titleTokens = tokenize(row.title);
  const domainTokens = tokenize(row.domain_focus);
  const summaryTokens = tokenize(row.enrichment_summary);
  const requiredSkillTokens = (row.required_skills || []).flatMap((item) => tokenize(item));
  const toolTokens = (row.tools || []).flatMap((item) => tokenize(item));

  let score = 0;
  if (!queryTokens.length) score += 1;
  score += overlapCount(queryTokens, titleTokens) * 6;
  score += overlapCount(queryTokens, domainTokens) * 5;
  score += overlapCount(queryTokens, summaryTokens) * 2;
  score += overlapCount(queryTokens, requiredSkillTokens) * 3;
  score += overlapCount(queryTokens, toolTokens) * 2;

  if (requestedSkills.length) {
    const normalizedRequired = new Set((row.required_skills || []).map(normalizeText));
    const normalizedPreferred = new Set((row.preferred_skills || []).map(normalizeText));
    const normalizedTools = new Set((row.tools || []).map(normalizeText));

    for (const skill of requestedSkills) {
      if (normalizedRequired.has(skill)) score += 8;
      else if (normalizedPreferred.has(skill)) score += 4;
      if (normalizedTools.has(skill)) score += 3;
    }
  }

  if (row.enrichment_status === 'enriched') score += 2;

  return score;
}

export async function searchJobOpenings({
  query = '',
  roleFamily = '',
  skills = [],
  locationType = '',
  limit = 20,
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  let request = supabase
    .from('job_openings')
    .select('id, provider, company_name, title, role_family, domain_focus, location_text, location_type, employment_type, seniority, apply_url, posting_url, required_skills, preferred_skills, tools, proof_assets, enrichment_summary, enrichment_status, posted_at')
    .eq('status', 'open')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(Math.min(Math.max(limit * 5, 40), 200));

  if (roleFamily) request = request.eq('role_family', roleFamily);
  if (locationType) request = request.eq('location_type', locationType);

  const { data, error } = await request;
  if (error || !Array.isArray(data)) {
    console.error('Job openings search failed:', error);
    return [];
  }

  const requestedSkills = skills.map(normalizeText).filter(Boolean);
  const normalizedQuery = normalizeText(query);

  return data
    .map((row) => ({ ...row, _score: scoreJobOpening(normalizedQuery, row, requestedSkills) }))
    .filter((row) => {
      if (!normalizedQuery && !requestedSkills.length) return true;
      return row._score > 0;
    })
    .sort((left, right) => right._score - left._score || String(right.posted_at || '').localeCompare(String(left.posted_at || '')))
    .slice(0, limit)
    .map(({ _score, ...row }) => row);
}

export async function getJobOpeningsStats() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      openCount: 0,
      sourceCount: 0,
      enrichedCount: 0,
    };
  }

  const [{ count: openCount }, { count: sourceCount }, { count: enrichedCount }] = await Promise.all([
    supabase.from('job_openings').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('job_sources').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('job_openings').select('*', { count: 'exact', head: true }).eq('status', 'open').eq('enrichment_status', 'enriched'),
  ]);

  return {
    openCount: openCount || 0,
    sourceCount: sourceCount || 0,
    enrichedCount: enrichedCount || 0,
  };
}
