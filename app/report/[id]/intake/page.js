import { notFound, redirect } from 'next/navigation';
import FullReportIntake from '../../../../components/full-report-intake';
import { normalizeReportData } from '../../../../lib/report-data';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getServerLocale } from '../../../../lib/i18n-server';

async function loadPersistedReport(id) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { mode: 'unconfigured' };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { mode: 'anonymous' };

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, job_title, industry, tasks, access_tier, report_data, created_at, updated_at')
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
    tier: report.access_tier || 'free',
    locale: report.report_data?.locale || report.report_data?.profile?.locale || 'en',
    reportData,
    generatedAt: persistedTimestamp,
    jobTitle: report.job_title,
    industry: report.industry,
    tasks: report.tasks || [],
  };
}

export default async function PersistedReportIntakePage({ params }) {
  const payload = await loadPersistedReport(params.id);

  if (payload?.mode === 'anonymous') {
    redirect(`/login?next=${encodeURIComponent(`/report/${params.id}/intake`)}`);
  }

  if (!payload?.reportData) notFound();
  if (payload.tier !== 'full') redirect(`/report/${params.id}`);
  if (payload.reportData?.generation_stage === 'full_complete') redirect(`/report/${params.id}`);

  return (
    <FullReportIntake
      reportId={payload.reportId}
      payload={payload}
      uiLocale={getServerLocale()}
      backHref={`/report/${params.id}`}
    />
  );
}
