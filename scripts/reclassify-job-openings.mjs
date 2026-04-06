import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../lib/supabase/config.js';
import { canonicalRoleFamilyForTrack, classifyJobTrack, sanitizeGroundingSkills } from '../lib/job-grounding.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const limit = Math.min(Math.max(Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 300), 25), 1000);
const dryRun = process.argv.includes('--dry-run');

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
  .select('id, title, role_family, domain_focus, enrichment_summary, required_skills, preferred_skills')
  .eq('status', 'open')
  .order('posted_at', { ascending: false, nullsFirst: false })
  .limit(limit);

if (error) {
  console.error(error.message || error);
  process.exit(1);
}

const updated = [];

for (const opening of openings || []) {
  const track = classifyJobTrack(opening);
  const canonicalRoleFamily = canonicalRoleFamilyForTrack(track);
  const cleanedRequiredSkills = sanitizeGroundingSkills(opening.required_skills, track, opening.title);
  const cleanedPreferredSkills = sanitizeGroundingSkills(opening.preferred_skills, track, opening.title);
  const currentRoleFamily = String(opening.role_family || 'general').trim().toLowerCase() || 'general';

  const needsRoleFamilyUpdate = canonicalRoleFamily && canonicalRoleFamily !== currentRoleFamily;
  const needsRequiredSkillUpdate = JSON.stringify(cleanedRequiredSkills) !== JSON.stringify(opening.required_skills || []);
  const needsPreferredSkillUpdate = JSON.stringify(cleanedPreferredSkills) !== JSON.stringify(opening.preferred_skills || []);

  if (!needsRoleFamilyUpdate && !needsRequiredSkillUpdate && !needsPreferredSkillUpdate) {
    continue;
  }

  const patch = {
    role_family: canonicalRoleFamily || currentRoleFamily,
    required_skills: cleanedRequiredSkills,
    preferred_skills: cleanedPreferredSkills,
  };

  if (!dryRun) {
    const { error: updateError } = await supabase
      .from('job_openings')
      .update(patch)
      .eq('id', opening.id);

    if (updateError) {
      console.error(`failed to update ${opening.id}: ${updateError.message || updateError}`);
      continue;
    }
  }

  updated.push({
    id: opening.id,
    title: opening.title,
    old_role_family: currentRoleFamily,
    new_role_family: patch.role_family,
    track,
    required_skill_delta: `${(opening.required_skills || []).length} -> ${cleanedRequiredSkills.length}`,
    preferred_skill_delta: `${(opening.preferred_skills || []).length} -> ${cleanedPreferredSkills.length}`,
  });
}

console.log(JSON.stringify({
  scanned_openings: openings?.length || 0,
  updated_count: updated.length,
  updates: updated.slice(0, 50),
}, null, 2));
