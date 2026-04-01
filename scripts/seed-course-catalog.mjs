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
          verified_at
        )
        values (
          $1, $2, $3, $4, $5,
          $6::text[], $7::text[], $8, $9, $10, $11, $12,
          $13::text[], $14::text[], $15::text[], $16, $17, now()
        )
        on conflict (slug) do update set
          provider = excluded.provider,
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
          verified_at = now(),
          updated_at = now()
      `,
      [
        row.slug,
        row.provider,
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
        row.verification_status || 'pending',
      ]
    );
  }

  console.log(`Seeded ${rows.length} course catalog entries.`);
} finally {
  await client.end();
}
