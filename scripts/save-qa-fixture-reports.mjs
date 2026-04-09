import process from 'node:process';
import { createSupabaseAdminClient } from '../lib/supabase/admin.js';
import { slugify } from '../lib/report-data.js';
import { buildQaFixtureSnapshotGroups } from '../lib/broad-role-fixtures.js';

const email = (process.argv.find((arg) => arg.startsWith('--email='))?.split('=')[1] || '').trim().toLowerCase();
const catalog = (process.argv.find((arg) => arg.startsWith('--catalog='))?.split('=')[1] || 'mixed').trim().toLowerCase();
const limit = Math.max(1, Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 4));

if (!email) {
  console.error('Pass --email=user@example.com');
  process.exit(1);
}

const supabase = createSupabaseAdminClient();
if (!supabase) {
  console.error('Supabase admin credentials are required.');
  process.exit(1);
}

function selectFixtures(groups, selectionCatalog, selectionLimit) {
  const broad = groups.find((group) => group.key === 'broad')?.snapshots || [];
  const senior = groups.find((group) => group.key === 'senior')?.snapshots || [];

  if (selectionCatalog === 'broad') return broad.slice(0, selectionLimit);
  if (selectionCatalog === 'senior') return senior.slice(0, selectionLimit);

  const mixed = [];
  const maxLength = Math.max(broad.length, senior.length);
  for (let index = 0; index < maxLength && mixed.length < selectionLimit; index += 1) {
    if (broad[index]) mixed.push(broad[index]);
    if (mixed.length >= selectionLimit) break;
    if (senior[index]) mixed.push(senior[index]);
  }
  return mixed.slice(0, selectionLimit);
}

const { data: userList, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
if (userError) {
  console.error(userError.message || userError);
  process.exit(1);
}

const user = (userList?.users || []).find((item) => String(item.email || '').toLowerCase() === email);
if (!user) {
  console.error(`No auth user found for ${email}`);
  process.exit(1);
}

const groups = buildQaFixtureSnapshotGroups();
const selected = selectFixtures(groups, catalog, limit);
const now = new Date().toISOString();
const inserted = [];

for (const item of selected) {
  const reportData = {
    ...item.report,
    generation_stage: 'full_complete',
    generated_at: now,
    qa_fixture: {
      catalog: item.catalog,
      label: item.catalog_label,
      seeded_for: email,
    },
  };

  const payload = {
    user_id: user.id,
    slug: `qa-${item.catalog}-${slugify(item.fixture.jobTitle || 'report')}-${Date.now()}-${inserted.length + 1}`,
    job_title: item.fixture.jobTitle,
    industry: item.fixture.industry,
    tasks: item.fixture.tasks,
    report_data: reportData,
    risk_score: reportData?.summary?.overall_score || 0,
    risk_level: reportData?.summary?.risk_level || 'MODERATE',
    access_tier: 'full',
    active_pivot_id: reportData?.pivots?.[0]?.id || null,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('id, slug, job_title, updated_at')
    .single();

  if (error) {
    console.error(`Failed to save ${item.fixture.jobTitle}: ${error.message || error}`);
    continue;
  }

  inserted.push({
    ...data,
    catalog: item.catalog,
    primary: reportData?.recommendation_stack?.primary?.title || '',
    backup: reportData?.recommendation_stack?.conservative_backup?.title || '',
    stay: reportData?.stay_path?.title || '',
  });
}

console.log(JSON.stringify({
  email,
  user_id: user.id,
  saved_count: inserted.length,
  reports: inserted,
}, null, 2));
