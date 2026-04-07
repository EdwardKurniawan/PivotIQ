import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const seedPath = path.join(process.cwd(), 'data', 'course-catalog.seed.json');
const rows = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();

  for (const row of rows) {
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

  console.log(`Seeded ${rows.length} course catalog entries.`);
} finally {
  await client.end();
}
