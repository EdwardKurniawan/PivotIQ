import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import { GENERATED_COURSE_CATALOG } from '../data/course-catalog.expansion.mjs';

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const seedPath = path.join(process.cwd(), 'data', 'course-catalog.seed.json');
const baseRows = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const rows = [...baseRows, ...GENERATED_COURSE_CATALOG].reduce((accumulator, row) => {
  accumulator.set(row.slug, row);
  return accumulator;
}, new Map());
const dedupedRows = [...rows.values()];
function toPayload(row) {
  return {
    slug: row.slug,
    provider: row.provider,
    external_id: row.external_id || null,
    title: row.title,
    url: row.url,
    summary: row.summary || '',
    skills: row.skills || [],
    tags: row.tags || [],
    is_paid: Boolean(row.is_paid),
    price_label: row.price_label || '',
    level: row.level || '',
    duration_label: row.duration_label || '',
    resource_type: row.resource_type || 'course',
    role_families: row.role_families || [],
    pivot_frames: row.pivot_frames || [],
    outcome_types: row.outcome_types || [],
    status: row.status || 'active',
    verification_status: row.verification_status || 'verified',
    final_url: row.final_url || row.url,
    provider_program_ids: row.provider_program_ids || [],
    provider_partners: row.provider_partners || [],
    language_code: row.language_code || '',
    source_metadata: row.source_metadata || {},
    verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function seedViaSupabase(rowsToSeed) {
  if (!supabaseUrl || !supabaseServiceRoleKey) return false;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const chunkSize = 50;
  for (let index = 0; index < rowsToSeed.length; index += chunkSize) {
    const chunk = rowsToSeed.slice(index, index + chunkSize).map(toPayload);
    const { error } = await supabase
      .from('course_catalog')
      .upsert(chunk, { onConflict: 'slug' });

    if (error) {
      throw new Error(`Supabase seed failed: ${error.message}`);
    }
  }

  return true;
}

async function seedViaPostgres(rowsToSeed) {
  if (!databaseUrl) return false;

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    for (const row of rowsToSeed) {
      await client.query(
        `
          insert into public.course_catalog (
            slug,
            provider,
            external_id,
            title,
            url,
            summary,
            skills,
            tags,
            is_paid,
            price_label,
            level,
            duration_label,
            resource_type,
            role_families,
            pivot_frames,
            outcome_types,
            status,
            verification_status,
            final_url,
            provider_program_ids,
            provider_partners,
            language_code,
            source_metadata,
            verified_at
          )
          values (
            $1, $2, $3, $4, $5,
            $6, $7::text[], $8::text[], $9, $10, $11, $12, $13,
            $14::text[], $15::text[], $16::text[], $17, $18, $19,
            $20::text[], $21::text[], $22, $23::jsonb, now()
          )
          on conflict (slug) do update set
            provider = excluded.provider,
            external_id = excluded.external_id,
            title = excluded.title,
            url = excluded.url,
            summary = excluded.summary,
            skills = excluded.skills,
            tags = excluded.tags,
            is_paid = excluded.is_paid,
            price_label = excluded.price_label,
            level = excluded.level,
            duration_label = excluded.duration_label,
            resource_type = excluded.resource_type,
            role_families = excluded.role_families,
            pivot_frames = excluded.pivot_frames,
            outcome_types = excluded.outcome_types,
            status = excluded.status,
            verification_status = excluded.verification_status,
            final_url = excluded.final_url,
            provider_program_ids = excluded.provider_program_ids,
            provider_partners = excluded.provider_partners,
            language_code = excluded.language_code,
            source_metadata = excluded.source_metadata,
            verified_at = now(),
            updated_at = now()
        `,
        [
          row.slug,
          row.provider,
          row.external_id || null,
          row.title,
          row.url,
          row.summary || '',
          row.skills || [],
          row.tags || [],
          Boolean(row.is_paid),
          row.price_label || '',
          row.level || '',
          row.duration_label || '',
          row.resource_type || 'course',
          row.role_families || [],
          row.pivot_frames || [],
          row.outcome_types || [],
          row.status || 'active',
          row.verification_status || 'verified',
          row.final_url || row.url,
          row.provider_program_ids || [],
          row.provider_partners || [],
          row.language_code || '',
          JSON.stringify(row.source_metadata || {}),
        ]
      );
    }
  } finally {
    await client.end();
  }

  return true;
}

const seededTargets = [];

if (await seedViaSupabase(dedupedRows)) {
  seededTargets.push('supabase');
}

if (await seedViaPostgres(dedupedRows)) {
  seededTargets.push('postgres');
}

if (!seededTargets.length) {
  console.error('No course catalog destination is configured. Set Supabase service role credentials or DATABASE_URL.');
  process.exit(1);
}

console.log(`Seeded ${dedupedRows.length} course catalog entries to ${seededTargets.join(' and ')}.`);
