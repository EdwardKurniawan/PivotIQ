import { generatePivotIQReport } from '../../../../../lib/report-generation';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

async function authorizeReport(supabase, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, report: null };
  }

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id, job_title, industry, tasks, access_tier, active_pivot_id, report_data')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return { user, report: null };
  }

  return { user, report };
}

export async function POST(_request, { params }) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return Response.json({ success: false, error: 'Supabase is not configured.' }, { status: 400 });
    }

    const { user, report } = await authorizeReport(supabase, params.id);
    if (!user || !report) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (report.access_tier !== 'full') {
      return Response.json({ success: false, error: 'Full report generation requires full access.' }, { status: 403 });
    }

    if (report.report_data?.generation_stage === 'full_complete') {
      return Response.json({ success: true, reportData: report.report_data, reused: true });
    }

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
      locale: report.report_data?.locale || profile.locale || 'en',
      stage: 'full',
    });

    const { data, error } = await supabase
      .from('reports')
      .update({
        report_data: reportData,
        risk_score: reportData?.summary?.overall_score || report.risk_score || 0,
        risk_level: reportData?.summary?.risk_level || report.risk_level || 'MODERATE',
        active_pivot_id: reportData?.pivots?.[0]?.id || report.active_pivot_id || null,
      })
      .eq('id', report.id)
      .eq('user_id', user.id)
      .select('id, report_data')
      .single();

    if (error || !data) {
      return Response.json({ success: false, error: error?.message || 'Failed to update report.' }, { status: 500 });
    }

    return Response.json({ success: true, reportData: data.report_data, reportId: data.id });
  } catch (error) {
    console.error('Full report generation error:', error);
    return Response.json({ success: false, error: 'Failed to generate full report.' }, { status: 500 });
  }
}
