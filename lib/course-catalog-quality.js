import { buildCatalogMatch, fetchCourseCatalog } from './course-catalog.js';
import { createSupabaseAdminClient } from './supabase/admin.js';

const PROBE_SKILL_GAPS = [
  { skill_name: 'SQL', category: 'technical', gap_priority: 'critical', how_to_close_gap: 'Build hands-on SQL query fluency for analytics and reporting.', expected_terms: ['sql', 'query', 'database'], required_terms: ['sql'] },
  { skill_name: 'Dashboard storytelling', category: 'technical', gap_priority: 'critical', how_to_close_gap: 'Turn dashboards into executive-ready narratives and decisions.', expected_terms: ['dashboard', 'storytelling', 'visualization', 'analytics'], required_terms: ['dashboard', 'storytelling', 'visualization'] },
  { skill_name: 'Python data analysis', category: 'technical', gap_priority: 'medium', how_to_close_gap: 'Use Python for practical data cleaning, analysis, and automation.', expected_terms: ['python', 'analysis', 'data'], required_terms: ['python'] },
  { skill_name: 'Power BI reporting', category: 'technical', gap_priority: 'medium', how_to_close_gap: 'Create business-ready BI dashboards and reporting workflows.', expected_terms: ['power bi', 'dashboard', 'reporting', 'analytics'], required_terms: ['power bi', 'dashboard'] },
  { skill_name: 'Contract lifecycle management', category: 'domain', gap_priority: 'medium', how_to_close_gap: 'Understand contract workflow, governance, and lifecycle operations.', expected_terms: ['contract', 'legal', 'clm', 'lifecycle'], required_terms: ['contract', 'legal', 'clm'] },
  { skill_name: 'Procurement analytics', category: 'domain', gap_priority: 'medium', how_to_close_gap: 'Analyze spend, suppliers, sourcing tradeoffs, and procurement performance.', expected_terms: ['procurement', 'sourcing', 'supplier', 'spend'], required_terms: ['procurement', 'sourcing', 'supplier', 'spend'] },
  { skill_name: 'Enablement program design', category: 'domain', gap_priority: 'medium', how_to_close_gap: 'Design measurable learning and enablement programs for customer-facing teams.', expected_terms: ['enablement', 'training', 'instructional', 'learning', 'curriculum'], required_terms: ['enablement', 'training', 'instructional', 'learning', 'curriculum'] },
  { skill_name: 'AI automation workflows', category: 'technical', gap_priority: 'critical', how_to_close_gap: 'Use AI and automation to redesign repetitive workflows.', expected_terms: ['ai', 'automation', 'workflow', 'prompt'], required_terms: ['ai', 'automation', 'workflow', 'prompt'] },
];

const PROBE_PIVOT = {
  title: 'Data-Driven Operations Manager',
  decision_frame: 'strongest-leverage-fit',
};

function increment(map, key, amount = 1) {
  const normalized = key || 'unknown';
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function mapToCountList(map) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])))
    .map(([key, count]) => ({ key, count }));
}

function scoreCourseHealth({ scannedCount, missingSkillsCount, genericCount, inactiveCount, failedCount }) {
  if (!scannedCount) return 0;

  const missingSkillsPenalty = Math.min(28, (missingSkillsCount / scannedCount) * 100);
  const genericPenalty = Math.min(24, (genericCount / scannedCount) * 100);
  const inactivePenalty = Math.min(22, (inactiveCount / scannedCount) * 100);
  const failedPenalty = Math.min(26, (failedCount / scannedCount) * 100);

  return Math.max(0, Math.round(100 - missingSkillsPenalty - genericPenalty - inactivePenalty - failedPenalty));
}

function isGenericTitle(title) {
  return /^online .+ courses$/i.test(String(title || '').trim()) ||
    /\bcourse match\b/i.test(String(title || '')) ||
    String(title || '').trim().length < 5;
}

function buildEntrySearchText(entry) {
  return [
    entry?.title,
    entry?.provider,
    entry?.summary,
    Array.isArray(entry?.skills) ? entry.skills.join(' ') : '',
    Array.isArray(entry?.tags) ? entry.tags.join(' ') : '',
    Array.isArray(entry?.role_families) ? entry.role_families.join(' ') : '',
    Array.isArray(entry?.outcome_types) ? entry.outcome_types.join(' ') : '',
  ].join(' ').toLowerCase();
}

function getExpectedTermHits(entry, expectedTerms = []) {
  const text = buildEntrySearchText(entry);
  return expectedTerms.filter((term) => text.includes(String(term).toLowerCase()));
}

function isWeakProbeResult(probe) {
  return !probe?.match || probe.score < 4 || probe.relevance_status === 'weak';
}

function buildActionItems({ providerCounts, missingSkills, genericEntries, failedEntries, probeResults }) {
  const items = [];
  const datacampCount = providerCounts.find((item) => item.provider.toLowerCase() === 'datacamp')?.count || 0;
  const weakProbeCount = probeResults.filter(isWeakProbeResult).length;

  if (!datacampCount) {
    items.push({
      priority: 'high',
      title: 'Sync DataCamp live courses',
      detail: 'DataCamp has no active entries in course_catalog yet. Add DATACAMP_LMS_CATALOG_API_TOKEN and run npm run db:sync-datacamp.',
    });
  }

  if (weakProbeCount) {
    items.push({
      priority: 'high',
      title: 'Improve weak learning probes',
      detail: `${weakProbeCount} probe skill gaps do not have a strong catalog match. Add provider coverage or better tags for those skills.`,
    });
  }

  if (missingSkills.length) {
    items.push({
      priority: 'medium',
      title: 'Backfill course skill tags',
      detail: `${missingSkills.length} scanned courses are missing skills. Better skills improve course matching and reduce generic fallback links.`,
    });
  }

  if (genericEntries.length) {
    items.push({
      priority: 'medium',
      title: 'Review generic course entries',
      detail: `${genericEntries.length} scanned entries look too generic to be trusted as recommendations without stronger metadata.`,
    });
  }

  if (failedEntries.length) {
    items.push({
      priority: 'medium',
      title: 'Verify failed course links',
      detail: `${failedEntries.length} scanned course entries are failed/review status and should not be used in recommendations.`,
    });
  }

  if (!items.length) {
    items.push({
      priority: 'low',
      title: 'Course catalog looks stable',
      detail: 'Provider coverage, verification status, and probe recommendations look healthy in this sample.',
    });
  }

  return items;
}

export async function auditCourseCatalogQuality({ limit = 500 } = {}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      configured: false,
      scanned_courses: 0,
      health_score: 0,
      provider_counts: [],
      verification_counts: [],
      resource_type_counts: [],
      missing_skill_entries: [],
      generic_entries: [],
      failed_entries: [],
      recommendation_probes: [],
      action_items: [{ priority: 'high', title: 'Supabase is not configured', detail: 'Set Supabase server credentials before auditing the course catalog.' }],
    };
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 500, 50), 2000);
  const { data: courses, error } = await supabase
    .from('course_catalog')
    .select('id, slug, provider, title, url, summary, skills, tags, status, verification_status, level, resource_type, role_families, outcome_types, final_url, updated_at')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(cappedLimit);

  if (error) {
    throw new Error(error.message || 'Failed to audit course catalog.');
  }

  const entries = courses || [];
  const providerMap = new Map();
  const verificationMap = new Map();
  const resourceTypeMap = new Map();
  const missingSkills = [];
  const genericEntries = [];
  const failedEntries = [];

  for (const course of entries) {
    increment(providerMap, course.provider);
    increment(verificationMap, course.verification_status);
    increment(resourceTypeMap, course.resource_type);

    if (!Array.isArray(course.skills) || course.skills.length === 0) {
      missingSkills.push(course);
    }

    if (isGenericTitle(course.title)) {
      genericEntries.push(course);
    }

    if (course.status !== 'active' || ['failed', 'review'].includes(course.verification_status)) {
      failedEntries.push(course);
    }
  }

  const activeCatalogEntries = await fetchCourseCatalog();
  const probeResults = PROBE_SKILL_GAPS.map((skillGap) => {
    const match = buildCatalogMatch(skillGap, PROBE_PIVOT, activeCatalogEntries);
    const expectedTermHits = match ? getExpectedTermHits(match.entry, skillGap.expected_terms) : [];
    const requiredTermHits = match ? getExpectedTermHits(match.entry, skillGap.required_terms) : [];
    const relevanceStatus = match && expectedTermHits.length && requiredTermHits.length ? 'aligned' : 'weak';

    return {
      skill_name: skillGap.skill_name,
      expected_terms: skillGap.expected_terms,
      expected_term_hits: expectedTermHits,
      required_terms: skillGap.required_terms,
      required_term_hits: requiredTermHits,
      relevance_status: relevanceStatus,
      match: match ? {
        provider: match.entry.provider,
        title: match.entry.title,
        url: match.entry.final_url || match.entry.url,
        score: match.score,
        verification_status: match.entry.verification_status,
      } : null,
      score: match?.score || 0,
    };
  });

  const providerCounts = mapToCountList(providerMap).map(({ key, count }) => ({ provider: key, count }));
  return {
    configured: true,
    scanned_courses: entries.length,
    active_catalog_entries: activeCatalogEntries.length,
    health_score: scoreCourseHealth({
      scannedCount: entries.length,
      missingSkillsCount: missingSkills.length,
      genericCount: genericEntries.length,
      inactiveCount: failedEntries.filter((item) => item.status !== 'active').length,
      failedCount: failedEntries.length,
    }),
    provider_counts: providerCounts,
    verification_counts: mapToCountList(verificationMap).map(({ key, count }) => ({ status: key, count })),
    resource_type_counts: mapToCountList(resourceTypeMap).map(({ key, count }) => ({ resource_type: key, count })),
    missing_skill_entries_count: missingSkills.length,
    generic_entries_count: genericEntries.length,
    failed_entries_count: failedEntries.length,
    missing_skill_entries: missingSkills.slice(0, 25),
    generic_entries: genericEntries.slice(0, 25),
    failed_entries: failedEntries.slice(0, 25),
    recommendation_probes: probeResults,
    action_items: buildActionItems({ providerCounts, missingSkills, genericEntries, failedEntries, probeResults }),
  };
}
