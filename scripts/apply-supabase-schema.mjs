import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
const sql = await fs.readFile(schemaPath, 'utf8');
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log('Supabase schema applied successfully.');
} finally {
  await client.end();
}

