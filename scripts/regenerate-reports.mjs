import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../lib/supabase/config.js';
import { generatePivotIQReport } from '../lib/report-generation.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const idsArg = process.argv.find((arg) => arg.startsWith('--ids='))?.split('=')[1] || '';
const dryRun = process.argv.includes('--dry-run');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const ids = idsArg.split(',').map((value) => value.trim()).filter(Boolean);
if (!ids.length) {
  console.error('Pass one or more report ids with --ids=id1,id2');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data: reports, error } = await supabase
  .from('reports')
  .select('id, job_title, industry, tasks, report_data, risk_score, risk_level, active_pivot_id')
  .in('id', ids);

if (error) {
  console.error(error.message || error);
  process.exit(1);
}

for (const report of reports || []) {
  const profile = report.report_data?.profile || {};
  const intakeProfile = {
    job_title_raw: profile.job_title || report.job_title,
    job_title_normalized: profile.job_title || report.job_title,
    industry: profile.industry || report.industry,
    linkedin_profile_url: profile.linkedin_profile_url || null,
    selected_tasks: Array.isArray(profile.selected_tasks) ? profile.selected_tasks : [],
    primary_tasks: Array.isArray(profile.primary_tasks) ? profile.primary_tasks : [],
    clarifiers: profile.clarifiers && typeof profile.clarifiers === 'object' ? profile.clarifiers : {},
    locale: report.report_data?.locale || profile.locale || 'en',
  };

  const selectedTaskLabels = Array.isArray(report.tasks) && report.tasks.length
    ? report.tasks
    : intakeProfile.selected_tasks.map((task) => task?.label).filter(Boolean);

  const { reportData } = await generatePivotIQReport({
    jobTitle: report.job_title,
    industry: report.industry,
    selectedTaskLabels,
    intakeProfile,
    locale: intakeProfile.locale,
    stage: 'full',
  });

  const update = {
    report_data: reportData,
    risk_score: reportData?.summary?.overall_score || report.risk_score || 0,
    risk_level: reportData?.summary?.risk_level || report.risk_level || 'MODERATE',
    active_pivot_id: reportData?.pivots?.[0]?.id || report.active_pivot_id || null,
    updated_at: new Date().toISOString(),
  };

  if (!dryRun) {
    const { error: updateError } = await supabase.from('reports').update(update).eq('id', report.id);
    if (updateError) {
      console.error(`failed to update ${report.id}: ${updateError.message || updateError}`);
      continue;
    }
  }

  console.log(JSON.stringify({
    id: report.id,
    job_title: report.job_title,
    active_pivot_id: update.active_pivot_id,
    top_pivots: (reportData?.pivots || []).slice(0, 5).map((pivot) => ({
      title: pivot.title,
      match_score: pivot.match_score,
      openings: pivot.live_market_signal?.matched_openings_count ?? 0,
      fit_score: pivot.live_market_signal?.profile_fit_score ?? 0,
      ranking_reason: pivot.ranking_reason || '',
    })),
    first_30_days: reportData?.first_30_days?.next_7_days || [],
  }, null, 2));
}
