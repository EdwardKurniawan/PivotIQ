import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '../../../../lib/supabase/config';

function buildReminderEmail(type, report) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
  const jobTitle = report.job_title;
  const industry = report.industry;
  const targetWeek = report.current_week || 1;
  const reportUrl = report.report_id ? `${appUrl}/report/${report.report_id}` : `${appUrl}/dashboard`;
  const dashboardUrl = `${appUrl}/dashboard`;

  if (type === 'celebration') {
    return {
      subject: `Nice work — you completed Week ${targetWeek} in your PivotIQ plan`,
      html: `<p>You completed Week ${targetWeek} of your PivotIQ roadmap for ${jobTitle} in ${industry}. Keep the momentum going and review your next milestone in the dashboard.</p><p><a href="${dashboardUrl}">Open your dashboard →</a></p>`,
    };
  }

  if (type === 'at_risk') {
    return {
      subject: `Your PivotIQ roadmap is slipping — here’s how to recover`,
      html: `<p>Your Week ${targetWeek} milestone for ${jobTitle} is behind schedule. Open your dashboard to review the catch-up plan and get back on track.</p><p><a href="${dashboardUrl}">Review the catch-up plan →</a></p>`,
    };
  }

  if (type === 'outcome_7d') {
    return {
      subject: `7-day check-in: did your PivotIQ plan turn into anything real?`,
      html: `<p>It has been a week since your PivotIQ report for ${jobTitle} in ${industry} was delivered.</p><p>Open the report and log what actually happened: did you build the proof asset, talk to your manager, or get any traction?</p><p><a href="${reportUrl}">Update the outcome tracker →</a></p>`,
    };
  }

  if (type === 'outcome_21d') {
    return {
      subject: `21-day follow-up: what changed after your PivotIQ report?`,
      html: `<p>Three weeks have passed since your PivotIQ report for ${jobTitle} in ${industry} was delivered.</p><p>This is the right moment to record whether the recommendation created proof, manager conversations, broader scope, interviews, or no traction yet.</p><p><a href="${reportUrl}">Log what changed →</a></p>`,
    };
  }

  return {
    subject: `Week ${targetWeek} is up next in your PivotIQ roadmap`,
    html: `<p>Your next PivotIQ milestone is ready. Open your dashboard, review Week ${targetWeek}, and block time for the actions that matter most.</p><p><a href="${dashboardUrl}">Open your dashboard →</a></p>`,
  };
}

export async function POST(request) {
  try {
    const cronSecret = process.env.REMINDER_CRON_SECRET;
    const incomingSecret = request.headers.get('x-reminder-secret');
    if (cronSecret && incomingSecret !== cronSecret) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = getSupabaseUrl();

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !supabaseUrl) {
      return Response.json({ success: false, error: 'Supabase service credentials not configured.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json({ success: true, demoMode: true, sent: 0 });
    }

    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: dueReminders, error } = await supabase
      .from('reminder_events')
      .select('id, report_id, user_email, type, current_week, job_title, industry')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    let sent = 0;
    for (const reminder of dueReminders || []) {
      const message = buildReminderEmail(reminder.type, reminder);
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'PivotIQ <reports@pivotiq.ai>',
        to: reminder.user_email,
        subject: message.subject,
        html: message.html,
      });

      await supabase
        .from('reminder_events')
        .update({
          status: sendError ? 'failed' : 'sent',
          sent_at: sendError ? null : new Date().toISOString(),
          error_message: sendError?.message || null,
        })
        .eq('id', reminder.id);

      if (!sendError) sent += 1;
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('Reminder worker error:', error);
    return Response.json({ success: false, error: 'Failed to run reminder worker.' }, { status: 500 });
  }
}
