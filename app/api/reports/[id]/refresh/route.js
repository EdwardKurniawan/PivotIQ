import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';
import { generatePivotIQReport } from '../../../../../lib/report-generation';
import { normalizeReportData } from '../../../../../lib/report-data';
import { normalizeOutcomeEntry } from '../../../../../lib/outcome-tracking';
import { buildWeekProgressMap } from '../../../../../lib/progress-tracking';
import { buildProgressRefreshContext, buildRefreshSummary } from '../../../../../lib/report-refresh';

async function getAuthorizedRefreshReport(supabase, admin, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, report: null };
  }

  const { data: report, error } = await admin
    .from('reports')
    .select(`
      id,
      user_id,
      job_title,
      industry,
      tasks,
      risk_score,
      risk_level,
      access_tier,
      active_pivot_id,
      created_at,
      updated_at,
      roadmap_start_date,
      report_data,
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
    const admin = createSupabaseAdminClient();
    if (!supabase || !admin) {
      return Response.json({ success: false, error: 'Supabase is not configured.' }, { status: 400 });
    }

    const { user, report } = await getAuthorizedRefreshReport(supabase, admin, params.id);
    if (!user || !report) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (report.access_tier !== 'full') {
      return Response.json({ success: false, error: 'Only full reports can be refreshed from progress.' }, { status: 403 });
    }

    const persistedTimestamp = report.updated_at || report.created_at;
    const previousReportData = normalizeReportData({
      ...(report.report_data || {}),
      generated_at: persistedTimestamp,
    }, {
      job_title: report.job_title,
      industry: report.industry,
      tasks: report.tasks || [],
    });

    const weekProgressMap = buildWeekProgressMap(report.week_progress || []);
    const outcomeEntry = normalizeOutcomeEntry(Array.isArray(report.report_outcomes) ? report.report_outcomes[0] : report.report_outcomes);
    const refreshContext = buildProgressRefreshContext({
      reportData: previousReportData,
      weekProgressMap,
      startDate: report.roadmap_start_date || '',
      outcome: outcomeEntry,
      createdAt: report.created_at || '',
      refreshedAt: report.report_data?.refreshed_at || '',
    });

    if (!refreshContext.is_ready) {
      return Response.json({ success: false, error: 'Log some progress first so the refresh has real signal to work with.' }, { status: 400 });
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
      progress_refresh: refreshContext,
    };

    const selectedTaskLabels = Array.isArray(report.tasks) && report.tasks.length
      ? report.tasks
      : intakeProfile.selected_tasks.map((task) => task?.label).filter(Boolean);

    const generated = await generatePivotIQReport({
      jobTitle: report.job_title,
      industry: report.industry,
      selectedTaskLabels,
      intakeProfile,
      locale: report.report_data?.locale || profile.locale || 'en',
      stage: 'full',
    });

    const refreshedAt = new Date().toISOString();
    const refreshSummary = buildRefreshSummary({
      previousReportData,
      refreshedReportData: generated.reportData,
      progressContext: refreshContext,
      refreshedAt,
    });

    const reportData = {
      ...generated.reportData,
      refresh_summary: refreshSummary,
      refresh_count: Number(report.report_data?.refresh_count || 0) + 1,
      refreshed_at: refreshedAt,
    };

    const { data, error } = await admin
      .from('reports')
      .update({
        report_data: reportData,
        risk_score: reportData?.summary?.overall_score || report.risk_score || 0,
        risk_level: reportData?.summary?.risk_level || report.risk_level || 'MODERATE',
        active_pivot_id: reportData?.pivots?.[0]?.id || report.active_pivot_id || null,
        updated_at: refreshedAt,
      })
      .eq('id', report.id)
      .eq('user_id', user.id)
      .select('id, report_data')
      .single();

    if (error || !data) {
      return Response.json({ success: false, error: error?.message || 'Failed to refresh report.' }, { status: 500 });
    }

    return Response.json({
      success: true,
      reportId: data.id,
      reportData: data.report_data,
      refreshSummary,
    });
  } catch (error) {
    console.error('Report refresh error:', error);
    return Response.json({ success: false, error: 'Failed to refresh the report from progress.' }, { status: 500 });
  }
}
