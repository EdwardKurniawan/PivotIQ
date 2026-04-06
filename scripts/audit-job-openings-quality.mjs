import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../lib/supabase/config.js';
import { canonicalRoleFamilyForTrack, classifyJobTrack, sanitizeGroundingSkills } from '../lib/job-grounding.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const limit = Math.min(Math.max(Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 300), 50), 1000);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data: openings, error } = await supabase
  .from('job_openings')
  .select('id, company_name, title, role_family, domain_focus, required_skills, enrichment_status, posting_url')
  .eq('status', 'open')
  .order('posted_at', { ascending: false, nullsFirst: false })
  .limit(limit);

if (error) {
  console.error(error.message || error);
  process.exit(1);
}

const familyCounts = new Map();
const mismatchCounts = new Map();
const suspicious = [];
const failed = [];

for (const opening of openings || []) {
  const track = classifyJobTrack(opening);
  const canonicalFamily = canonicalRoleFamilyForTrack(track);
  const cleanedSkills = sanitizeGroundingSkills(opening.required_skills, track, opening.title);
  const currentFamily = String(opening.role_family || '').trim().toLowerCase() || 'general';

  familyCounts.set(currentFamily, (familyCounts.get(currentFamily) || 0) + 1);

  if (opening.enrichment_status === 'failed') {
    failed.push({
      id: opening.id,
      title: opening.title,
      role_family: currentFamily,
      posting_url: opening.posting_url,
    });
  }

  const suspiciousSkillDrop = (opening.required_skills || []).length - cleanedSkills.length >= 2;
  const familyMismatch = canonicalFamily && canonicalFamily !== currentFamily;

  if (familyMismatch || suspiciousSkillDrop) {
    const mismatchKey = `${currentFamily}->${canonicalFamily || 'unknown'}`;
    mismatchCounts.set(mismatchKey, (mismatchCounts.get(mismatchKey) || 0) + 1);

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

console.log(JSON.stringify({
  scanned_openings: openings?.length || 0,
  open_role_family_counts: [...familyCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([role_family, count]) => ({ role_family, count })),
  suspicious_role_family_mismatches: [...mismatchCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 15)
    .map(([transition, count]) => ({ transition, count })),
  failed_enrichments: failed.slice(0, 25),
  suspicious_openings: suspicious.slice(0, 50),
}, null, 2));
