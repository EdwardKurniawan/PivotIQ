import { slugify } from '../../../lib/report-data';
import { generatePivotIQReport } from '../../../lib/report-generation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const PERSIST_TIMEOUT_MS = Number(process.env.PERSIST_TIMEOUT_MS || 15000);

function normalizeIntakePayload(payload) {
  const intakeProfile = payload?.intakeProfile || {};
  const selectedTasks = Array.isArray(intakeProfile.selected_tasks)
    ? intakeProfile.selected_tasks.filter(Boolean)
    : [];
  const selectedTaskLabels = selectedTasks.length
    ? selectedTasks.map((task) => task?.label).filter(Boolean)
    : Array.isArray(payload?.tasks)
      ? payload.tasks.filter(Boolean)
      : [];

  return {
    locale: payload?.locale || intakeProfile?.locale || 'en',
    stage: payload?.stage === 'full' ? 'full' : 'preview',
    jobTitle: payload?.jobTitle || intakeProfile.job_title_raw || '',
    industry: payload?.industry || intakeProfile.industry || '',
    email: payload?.email || null,
    intakeProfile: {
      job_title_raw: intakeProfile.job_title_raw || payload?.jobTitle || '',
      job_title_normalized: intakeProfile.job_title_normalized || intakeProfile.job_title_raw || payload?.jobTitle || '',
      industry: intakeProfile.industry || payload?.industry || '',
      linkedin_profile_url: intakeProfile.linkedin_profile_url || null,
      selected_tasks: selectedTasks.map((task) => ({
        task_id: task.task_id || task.label,
        label: task.label,
        category: task.category || 'custom',
        source: task.source || 'recommended',
      })),
      primary_tasks: Array.isArray(intakeProfile.primary_tasks) ? intakeProfile.primary_tasks.filter(Boolean) : [],
      clarifiers: intakeProfile.clarifiers && typeof intakeProfile.clarifiers === 'object' ? intakeProfile.clarifiers : {},
      locale: payload?.locale || intakeProfile?.locale || 'en',
    },
    selectedTaskLabels,
  };
}

async function maybePersistReport(reportData) {
  const persistOperation = async () => {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = reportData.profile || {};
    const summary = reportData.summary || {};
    const defaultPivot = reportData.pivots?.[0] || null;

    const insertPayload = {
      user_id: user.id,
      slug: `${slugify(profile.job_title || 'report')}-${Date.now()}`,
      job_title: profile.job_title || '',
      industry: profile.industry || '',
      tasks: profile.tasks || [],
      report_data: reportData,
      risk_score: summary.overall_score || 0,
      risk_level: summary.risk_level || 'MODERATE',
      access_tier: 'free',
      active_pivot_id: defaultPivot?.id || null,
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(insertPayload)
      .select('id, slug')
      .single();

    if (error) {
      console.error('Supabase report persistence error:', error);
      return null;
    }

    return data;
  };

  try {
    return await Promise.race([
      persistOperation(),
      new Promise((resolve) =>
        setTimeout(() => {
          console.error(`Supabase report persistence timed out after ${PERSIST_TIMEOUT_MS}ms`);
          resolve(null);
        }, PERSIST_TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    console.error('Supabase report persistence threw an error:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { locale, stage, jobTitle, industry, selectedTaskLabels, intakeProfile, email } = normalizeIntakePayload(payload);

    if (!jobTitle || !industry || !selectedTaskLabels?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { reportData, demoMode, rawModelOutput } = await generatePivotIQReport({
      jobTitle,
      industry,
      selectedTaskLabels,
      intakeProfile,
      locale,
      stage,
    });

    const shouldPersist = stage !== 'full' || Boolean(payload?.persistFullReport);
    const persisted = shouldPersist ? await maybePersistReport(reportData) : null;

    return Response.json({
      reportData,
      reportId: persisted?.id || null,
      reportSlug: persisted?.slug || null,
      demoMode,
      email: email || null,
      rawModelOutput,
    });
  } catch (err) {
    console.error('Report generation error:', err);
    return Response.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}
