import { canonicalRoleFamilyForTrack, classifyJobTrack, sanitizeGroundingSkills } from './job-grounding.js';
import { createSupabaseAdminClient } from './supabase/admin.js';

const WATCHED_FAMILIES = ['legal', 'procurement', 'education'];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function increment(map, key, amount = 1) {
  const normalizedKey = key || 'unknown';
  map.set(normalizedKey, (map.get(normalizedKey) || 0) + amount);
}

function mapToCountList(map) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])))
    .map(([key, count]) => ({ key, count }));
}

function calculateHealthScore({ scannedCount, suspiciousCount, failedCount }) {
  if (!scannedCount) return 0;
  const suspiciousPenalty = Math.min(45, (suspiciousCount / scannedCount) * 100);
  const failedPenalty = Math.min(35, (failedCount / scannedCount) * 100);
  return Math.max(0, Math.round(100 - suspiciousPenalty - failedPenalty));
}

function buildActionItems({ coverage, failed, suspicious }) {
  const items = [];
  const thinFamilies = coverage.filter((item) => item.open_count < 12);
  const failedFamilies = coverage.filter((item) => item.failed_count > 0);

  if (thinFamilies.length) {
    items.push({
      priority: 'high',
      title: 'Expand thin role-family coverage',
      detail: `${thinFamilies.map((item) => item.role_family).join(', ')} still have fewer than 12 open role-pure postings in the latest sample.`,
    });
  }

  if (failedFamilies.length) {
    items.push({
      priority: 'high',
      title: 'Retry failed enrichment rows',
      detail: `${failedFamilies.map((item) => `${item.role_family} (${item.failed_count})`).join(', ')} have failed enrichment rows that should be retried in small batches.`,
    });
  }

  if (suspicious.length) {
    items.push({
      priority: 'medium',
      title: 'Run deterministic reclassification',
      detail: `${suspicious.length} suspicious openings were found in the scanned sample. Run db:reclassify-job-openings after reviewing the top examples.`,
    });
  }

  if (!items.length && failed.length) {
    items.push({
      priority: 'medium',
      title: 'Clean failed enrichment backlog',
      detail: `${failed.length} failed enrichment rows remain in the scanned sample.`,
    });
  }

  if (!items.length) {
    items.push({
      priority: 'low',
      title: 'Catalog looks stable',
      detail: 'No urgent catalog quality issues were found in the scanned sample.',
    });
  }

  return items;
}

export async function auditJobOpeningsQuality({ limit = 300 } = {}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      configured: false,
      scanned_openings: 0,
      health_score: 0,
      open_role_family_counts: [],
      watched_family_coverage: [],
      suspicious_role_family_mismatches: [],
      failed_enrichments: [],
      suspicious_openings: [],
      action_items: [{ priority: 'high', title: 'Supabase is not configured', detail: 'Set Supabase server credentials before auditing the job catalog.' }],
    };
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 300, 50), 1000);
  const { data: openings, error } = await supabase
    .from('job_openings')
    .select('id, company_name, title, role_family, domain_focus, required_skills, enrichment_status, posting_url, posted_at')
    .eq('status', 'open')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(cappedLimit);

  if (error) {
    throw new Error(error.message || 'Failed to audit job openings.');
  }

  const familyCounts = new Map();
  const mismatchCounts = new Map();
  const coverage = new Map(WATCHED_FAMILIES.map((family) => [family, {
    role_family: family,
    open_count: 0,
    enriched_count: 0,
    failed_count: 0,
    suspicious_count: 0,
  }]));
  const suspicious = [];
  const failed = [];

  for (const opening of openings || []) {
    const track = classifyJobTrack(opening);
    const canonicalFamily = canonicalRoleFamilyForTrack(track);
    const cleanedSkills = sanitizeGroundingSkills(opening.required_skills, track, opening.title);
    const currentFamily = normalizeText(opening.role_family) || 'general';
    const watched = coverage.get(currentFamily);

    increment(familyCounts, currentFamily);

    if (watched) {
      watched.open_count += 1;
      if (opening.enrichment_status === 'enriched') watched.enriched_count += 1;
      if (opening.enrichment_status === 'failed') watched.failed_count += 1;
    }

    if (opening.enrichment_status === 'failed') {
      failed.push({
        id: opening.id,
        company_name: opening.company_name,
        title: opening.title,
        role_family: currentFamily,
        posting_url: opening.posting_url,
      });
    }

    const suspiciousSkillDrop = (opening.required_skills || []).length - cleanedSkills.length >= 2;
    const familyMismatch = canonicalFamily && canonicalFamily !== currentFamily;

    if (familyMismatch || suspiciousSkillDrop) {
      const mismatchKey = `${currentFamily}->${canonicalFamily || 'unknown'}`;
      increment(mismatchCounts, mismatchKey);
      if (watched) watched.suspicious_count += 1;

      suspicious.push({
        id: opening.id,
        company_name: opening.company_name,
        title: opening.title,
        role_family: currentFamily,
        canonical_role_family: canonicalFamily,
        track,
        original_required_skills: opening.required_skills || [],
        cleaned_required_skills: cleanedSkills,
        posting_url: opening.posting_url,
      });
    }
  }

  const coverageList = [...coverage.values()];
  return {
    configured: true,
    scanned_openings: openings?.length || 0,
    failed_enrichments_count: failed.length,
    suspicious_openings_count: suspicious.length,
    health_score: calculateHealthScore({
      scannedCount: openings?.length || 0,
      suspiciousCount: suspicious.length,
      failedCount: failed.length,
    }),
    open_role_family_counts: mapToCountList(familyCounts).map(({ key, count }) => ({ role_family: key, count })),
    watched_family_coverage: coverageList,
    suspicious_role_family_mismatches: mapToCountList(mismatchCounts)
      .slice(0, 15)
      .map(({ key, count }) => ({ transition: key, count })),
    failed_enrichments: failed.slice(0, 25),
    suspicious_openings: suspicious.slice(0, 50),
    action_items: buildActionItems({ coverage: coverageList, failed, suspicious }),
  };
}
