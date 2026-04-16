import { notFound, redirect } from 'next/navigation';
import ReportExperience from '../../../components/report-experience';
import { normalizeReportData } from '../../../lib/report-data';
import { normalizeOutcomeEntry } from '../../../lib/outcome-tracking';
import { buildWeekProgressMap } from '../../../lib/progress-tracking';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getServerLocale } from '../../../lib/i18n-server';

async function loadPersistedReport(id) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { mode: 'unconfigured' };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { mode: 'anonymous' };

  const { data: report, error } = await supabase
    .from('reports')
    .select(`
      id,
      slug,
      job_title,
      industry,
      tasks,
      report_data,
      created_at,
      updated_at,
      access_tier,
      active_pivot_id,
      roadmap_start_date,
      week_progress (
        week_number,
        completed_at,
        notes,
        action_state,
        proof_asset_status,
        manager_conversation_status,
        last_active_step,
        updated_at
      ),
      report_outcomes (
        built_proof_asset,
        manager_conversation_done,
        traction_status,
        usefulness_rating,
        notes,
        updated_at
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !report) return { mode: 'missing' };

  const persistedTimestamp = report.updated_at || report.created_at;
  const reportData = normalizeReportData({
    ...(report.report_data || {}),
    generated_at: persistedTimestamp,
  }, {
    job_title: report.job_title,
    industry: report.industry,
    tasks: report.tasks || [],
  });

  return {
    mode: 'ready',
    reportId: report.id,
    reportSlug: report.slug,
    locale: report.report_data?.locale || report.report_data?.profile?.locale || 'en',
    reportData,
    generatedAt: persistedTimestamp,
    jobTitle: report.job_title,
    industry: report.industry,
    tasks: report.tasks || [],
    email: user.email || '',
    tier: report.access_tier || 'free',
    createdAt: report.created_at || '',
    startDate: report.roadmap_start_date || '',
    weekProgress: buildWeekProgressMap(report.week_progress || []),
    outcome: normalizeOutcomeEntry(Array.isArray(report.report_outcomes) ? report.report_outcomes[0] : report.report_outcomes),
    completedWeeks: (report.week_progress || []).filter((item) => item.completed_at).map((item) => item.week_number),
    weekNotes: Object.fromEntries((report.week_progress || []).filter((item) => item.notes).map((item) => [item.week_number, item.notes])),
  };
}

export default async function PersistedReportPage({ params, searchParams }) {
  const payload = await loadPersistedReport(params.id);
  if (payload?.mode === 'anonymous') {
    redirect(`/login?next=${encodeURIComponent(`/report/${params.id}`)}`);
  }
  if (!payload?.reportData) notFound();
  if (payload.tier === 'full' && payload.reportData?.generation_stage !== 'full_complete') {
    redirect(`/report/${params.id}/intake`);
  }

  return <ReportExperience payload={{ ...payload, initialTab: searchParams?.tab || 'breakdown', uiLocale: getServerLocale() }} embedded={false} />;
}
