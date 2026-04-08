import { notFound } from 'next/navigation';
import ReportExperience from '../../../components/report-experience';
import { normalizeReportData } from '../../../lib/report-data';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getServerLocale } from '../../../lib/i18n-server';

async function loadPersistedReport(id) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
        notes
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !report) return null;

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
    startDate: report.roadmap_start_date || '',
    completedWeeks: (report.week_progress || []).filter((item) => item.completed_at).map((item) => item.week_number),
    weekNotes: Object.fromEntries((report.week_progress || []).filter((item) => item.notes).map((item) => [item.week_number, item.notes])),
  };
}

export default async function PersistedReportPage({ params }) {
  const payload = await loadPersistedReport(params.id);
  if (!payload?.reportData) notFound();

  return <ReportExperience payload={{ ...payload, uiLocale: getServerLocale() }} embedded={false} />;
}
