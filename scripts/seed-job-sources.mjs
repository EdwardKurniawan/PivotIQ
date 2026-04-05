import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const seedPath = path.join(process.cwd(), 'data', 'job-source.seed.json');
const { rows } = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function buildBatchInsert(batch) {
  const values = [];
  const placeholders = batch.map((row, index) => {
    const offset = index * 9;
    values.push(
      row.slug,
      row.company_name,
      row.provider,
      row.source_url || null,
      row.external_board_id || null,
      row.status || 'draft',
      row.sync_frequency || 'daily',
      row.source_config || {},
      row.notes || ''
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}::jsonb, $${offset + 9})`;
  });

  return {
    text: `
      insert into public.job_sources (
        slug,
        company_name,
        provider,
        source_url,
        external_board_id,
        status,
        sync_frequency,
        source_config,
        notes
      )
      values ${placeholders.join(',\n')}
      on conflict (slug) do update set
        company_name = excluded.company_name,
        provider = excluded.provider,
        source_url = excluded.source_url,
        external_board_id = excluded.external_board_id,
        status = excluded.status,
        sync_frequency = excluded.sync_frequency,
        source_config = excluded.source_config,
        notes = excluded.notes,
        updated_at = now()
    `,
    values,
  };
}

try {
  await client.connect();
  const query = buildBatchInsert(rows);
  await client.query(query);
  console.log(`Seeded ${rows.length} job source entries.`);
} finally {
  await client.end();
}
