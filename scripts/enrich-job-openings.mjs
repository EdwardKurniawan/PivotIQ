import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../lib/supabase/config.js';
import { enrichJobOpening } from '../lib/job-opening-enrichment.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const limit = Math.min(Math.max(Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 10), 1), 50);
const targetId = process.argv.find((arg) => arg.startsWith('--id='))?.split('=')[1] || '';
const force = process.argv.includes('--force');
const roleFamilyFilter = process.argv.find((arg) => arg.startsWith('--role-family='))?.split('=')[1] || '';

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

async function fetchCandidates() {
  let query = supabase
    .from('job_openings')
    .select('id, provider, company_name, title, department, location_text, location_type, employment_type, seniority, role_family, domain_focus, description_text, required_skills, preferred_skills, tools, proof_assets, enrichment_summary, enrichment_status, metadata')
    .eq('status', 'open')
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (targetId) {
    query = query.eq('id', targetId);
  } else if (!force) {
    query = query.in('enrichment_status', ['pending', 'failed']);
  }

  if (roleFamilyFilter) {
    query = query.eq('role_family', roleFamilyFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateJobOpening(id, payload) {
  const { error } = await supabase
    .from('job_openings')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

const jobs = await fetchCandidates();

if (!jobs.length) {
  console.log('No job openings need enrichment.');
  process.exit(0);
}

for (const job of jobs) {
  try {
    const enrichment = await enrichJobOpening(job);
    await updateJobOpening(job.id, enrichment);
    console.log(`enriched ${job.id} ${job.title}`);
  } catch (error) {
    await updateJobOpening(job.id, {
      enrichment_status: 'failed',
      enrichment_summary: '',
      enrichment_model: '',
      metadata: {
        ...(job.metadata || {}),
        enrichment_error: error.message || String(error),
      },
    });
    console.error(`failed ${job.id} ${job.title}: ${error.message || error}`);
  }
}
