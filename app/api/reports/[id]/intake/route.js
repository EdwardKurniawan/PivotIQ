import { generatePivotIQReport } from '../../../../../lib/report-generation';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

const REQUIRED_CLARIFIERS = [
  'goal_now',
  'timeline_urgency',
  'years_experience_band',
  'location_preference',
  'ai_maturity',
];

async function authorizeReport(supabase, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, report: null };
  }

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id, job_title, industry, tasks, access_tier, active_pivot_id, risk_score, risk_level, report_data')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return { user, report: null };
  }

  return { user, report };
}

function normalizeClarifiers(input = {}, fallbackClarifiers = {}) {
  const coreSystems = Array.isArray(input.core_systems)
    ? input.core_systems.filter(Boolean).slice(0, 6)
    : Array.isArray(fallbackClarifiers.core_systems)
      ? fallbackClarifiers.core_systems.filter(Boolean).slice(0, 6)
      : [];

  return {
    ...fallbackClarifiers,
    goal_now: input.goal_now || fallbackClarifiers.goal_now || null,
    timeline_urgency: input.timeline_urgency || fallbackClarifiers.timeline_urgency || null,
    years_experience_band: input.years_experience_band || fallbackClarifiers.years_experience_band || null,
    location_preference: input.location_preference || fallbackClarifiers.location_preference || null,
    ai_maturity: input.ai_maturity || fallbackClarifiers.ai_maturity || null,
    role_blend: input.role_blend || fallbackClarifiers.role_blend || 'mixed',
    management_scope: input.management_scope || fallbackClarifiers.management_scope || null,
    decision_scope: input.decision_scope || fallbackClarifiers.decision_scope || null,
    technical_capability: input.technical_capability || fallbackClarifiers.technical_capability || null,
    salary_tolerance: input.salary_tolerance || fallbackClarifiers.salary_tolerance || null,
    proof_state: input.proof_state || fallbackClarifiers.proof_state || null,
    domain_focus: input.domain_focus || fallbackClarifiers.domain_focus || null,
    core_systems: coreSystems,
  };
}

export async function POST(request, { params }) {
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

    const body = await request.json();
    const existingProfile = report.report_data?.profile || {};
    const clarifiers = normalizeClarifiers(
      body?.clarifiers && typeof body.clarifiers === 'object' ? body.clarifiers : {},
      existingProfile?.clarifiers && typeof existingProfile.clarifiers === 'object' ? existingProfile.clarifiers : {}
    );

    const missingRequired = REQUIRED_CLARIFIERS.filter((key) => !clarifiers[key]);
    if (missingRequired.length) {
      return Response.json({ success: false, error: 'Missing required intake fields.' }, { status: 400 });
    }

    const intakeProfile = {
      job_title_raw: existingProfile.job_title || report.job_title,
      job_title_normalized: existingProfile.job_title || report.job_title,
      industry: existingProfile.industry || report.industry,
      linkedin_profile_url: existingProfile.linkedin_profile_url || null,
      selected_tasks: Array.isArray(existingProfile.selected_tasks) ? existingProfile.selected_tasks : [],
      primary_tasks: Array.isArray(existingProfile.primary_tasks) ? existingProfile.primary_tasks : [],
      clarifiers,
      locale: body?.locale || report.report_data?.locale || existingProfile.locale || 'en',
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

    const { data, error } = await supabase
      .from('reports')
      .update({
        report_data: reportData,
        risk_score: reportData?.summary?.overall_score || report.risk_score || 0,
        risk_level: reportData?.summary?.risk_level || report.risk_level || 'MODERATE',
        active_pivot_id: reportData?.pivots?.[0]?.id || report.active_pivot_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', report.id)
      .eq('user_id', user.id)
      .select('id, report_data')
      .single();

    if (error || !data) {
      return Response.json({ success: false, error: error?.message || 'Failed to update report.' }, { status: 500 });
    }

    return Response.json({ success: true, reportId: data.id, reportData: data.report_data });
  } catch (error) {
    console.error('Full intake generation error:', error);
    return Response.json({ success: false, error: 'Failed to generate full report.' }, { status: 500 });
  }
}
