import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const seedPath = path.join(process.cwd(), 'data', 'job-title-catalog.seed.json');
const { rows } = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
const BATCH_SIZE = 500;

function buildBatchInsert(batch) {
  const values = [];
  const placeholders = batch.map((row, index) => {
    const offset = index * 10;
    values.push(
      row.slug,
      row.title,
      row.normalized_title,
      row.canonical_title,
      row.onet_soc_code,
      row.major_group_code,
      row.major_group_name,
      row.source_type,
      row.source_names || [],
      Boolean(row.is_canonical)
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}::text[], $${offset + 10})`;
  });

  return {
    text: `
      insert into public.job_title_catalog (
        slug,
        title,
        normalized_title,
        canonical_title,
        onet_soc_code,
        major_group_code,
        major_group_name,
        source_type,
        source_names,
        is_canonical
      )
      values ${placeholders.join(',\n')}
      on conflict (slug) do update set
        title = excluded.title,
        normalized_title = excluded.normalized_title,
        canonical_title = excluded.canonical_title,
        onet_soc_code = excluded.onet_soc_code,
        major_group_code = excluded.major_group_code,
        major_group_name = excluded.major_group_name,
        source_type = excluded.source_type,
        source_names = excluded.source_names,
        is_canonical = excluded.is_canonical,
        updated_at = now()
    `,
    values,
  };
}

try {
  await client.connect();

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const query = buildBatchInsert(batch);
    await client.query(query);
  }

  console.log(`Seeded ${rows.length} job title catalog entries.`);
} finally {
  await client.end();
}
