import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { fetchJobsForSource, normalizeJobOpening } from '../lib/job-openings.js';
import { getSupabaseUrl } from '../lib/supabase/config.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetSlug = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1] || '';

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

async function fetchSources() {
  let query = supabase
    .from('job_sources')
    .select('id, slug, company_name, provider, source_url, external_board_id, status, sync_frequency, source_config, notes')
    .eq('status', 'active');

  if (targetSlug) {
    query = query.eq('slug', targetSlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function upsertOpenings(rows) {
  for (const batch of chunk(rows, 200)) {
    const { error } = await supabase
      .from('job_openings')
      .upsert(batch, {
        onConflict: 'source_id,source_job_id',
        ignoreDuplicates: false,
      });

    if (error) throw error;
  }
}

async function markMissingJobsClosed(sourceId, liveJobIds) {
  let query = supabase
    .from('job_openings')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('source_id', sourceId)
    .eq('status', 'open');

  if (liveJobIds.length) {
    query = query.not('source_job_id', 'in', `(${liveJobIds.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(',')})`);
  }

  const { error } = await query;

  if (error) throw error;
}

async function updateSourceStatus(sourceId, payload) {
  const { error } = await supabase
    .from('job_sources')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sourceId);

  if (error) throw error;
}

async function syncSource(source) {
  const startedAt = new Date().toISOString();

  try {
    const rawJobs = await fetchJobsForSource(source);
    const normalizedJobs = rawJobs.map((job) => normalizeJobOpening(source, job));
    await upsertOpenings(normalizedJobs);
    await markMissingJobsClosed(source.id, normalizedJobs.map((job) => job.source_job_id));
    await updateSourceStatus(source.id, {
      last_synced_at: startedAt,
      last_success_at: startedAt,
      last_error: null,
    });

    return {
      slug: source.slug,
      provider: source.provider,
      count: normalizedJobs.length,
    };
  } catch (error) {
    await updateSourceStatus(source.id, {
      last_synced_at: startedAt,
      last_error: error.message || String(error),
    });
    throw error;
  }
}

const sources = await fetchSources();

if (!sources.length) {
  console.log('No active job sources found.');
  process.exit(0);
}

for (const source of sources) {
  const result = await syncSource(source);
  console.log(`${result.slug} (${result.provider}): synced ${result.count} openings`);
}
