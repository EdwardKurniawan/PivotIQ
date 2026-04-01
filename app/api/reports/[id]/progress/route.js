import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';

async function getAuthorizedReport(supabase, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, report: null };

  const { data: report } = await supabase
    .from('reports')
    .select('id, user_id')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  return { user, report };
}

async function queueReminderEvent(supabase, reportId, userEmail, type, weekNumber, jobTitle, industry, scheduledFor) {
  if (!userEmail || !scheduledFor) return;

  await supabase.from('reminder_events').insert({
    report_id: reportId,
    user_email: userEmail,
    type,
    current_week: weekNumber,
    job_title: jobTitle || 'Career Pivot Plan',
    industry: industry || 'General',
    scheduled_for: scheduledFor,
  });
}

export async function PATCH(request, { params }) {
  try {
    const supabase = createSupabaseServerClient();
    const admin = createSupabaseAdminClient();
    if (!supabase || !admin) {
      return Response.json({ success: false, error: 'Supabase is not configured.' }, { status: 400 });
    }

    const { user, report } = await getAuthorizedReport(supabase, params.id);
    if (!user || !report) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { week_number, completed, notes, start_date } = await request.json();

    const { data: fullReport } = await admin
      .from('reports')
      .select('id, job_title, industry, roadmap_start_date')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (start_date !== undefined) {
      const { data: updatedReport, error: updateError } = await admin
        .from('reports')
        .update({ roadmap_start_date: start_date || null })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (updateError || !updatedReport) {
        return Response.json({ success: false, error: updateError.message }, { status: 500 });
      }

      if (start_date) {
        const nextReminder = new Date(start_date);
        nextReminder.setHours(9, 0, 0, 0);
        await queueReminderEvent(
          admin,
          params.id,
          user.email,
          'upcoming',
          1,
          fullReport?.job_title,
          fullReport?.industry,
          nextReminder.toISOString()
        );
      }
    }

    if (week_number) {
      const payload = {
        report_id: params.id,
        week_number,
        notes: notes || null,
        completed_at: completed ? new Date().toISOString() : null,
      };

      const { error: progressError } = await admin
        .from('week_progress')
        .upsert(payload, { onConflict: 'report_id,week_number' });

      if (progressError) {
        return Response.json({ success: false, error: progressError.message }, { status: 500 });
      }

      if (completed) {
        await queueReminderEvent(
          admin,
          params.id,
          user.email,
          'celebration',
          week_number,
          fullReport?.job_title,
          fullReport?.industry,
          new Date().toISOString()
        );

        const baseDate = start_date || fullReport?.roadmap_start_date;
        if (baseDate && week_number < 12) {
          const nextReminder = new Date(baseDate);
          nextReminder.setDate(nextReminder.getDate() + week_number * 7);
          nextReminder.setHours(9, 0, 0, 0);
          await queueReminderEvent(
            admin,
            params.id,
            user.email,
            'upcoming',
            week_number + 1,
            fullReport?.job_title,
            fullReport?.industry,
            nextReminder.toISOString()
          );
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Progress update error:', error);
    return Response.json({ success: false, error: 'Failed to update progress.' }, { status: 500 });
  }
}
