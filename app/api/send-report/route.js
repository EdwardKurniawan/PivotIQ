import { Resend } from 'resend';
import { normalizeReportData, reportDataToEmailHtml } from '../../../lib/report-data';
import { createSupabaseAdminClient } from '../../../lib/supabase/admin';
import { scheduleOutcomeFollowups } from '../../../lib/reminder-events';

function buildEmailHTML({ reportData }) {
  const normalized = normalizeReportData(reportData);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pivotiq.vercel.app';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your PivotIQ Career Report</title>
</head>
<body style="background:#080E1C;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:36px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#4F46E5,#6366F1);padding:12px 22px;border-radius:14px;margin-bottom:20px;">
        <span style="font-size:22px;">🛡️</span>
        <span style="color:white;font-size:19px;font-weight:800;letter-spacing:-0.3px;">PivotIQ</span>
      </div>
      <h1 style="color:white;font-size:26px;font-weight:900;margin:0 0 6px;letter-spacing:-0.5px;">Your Premium Career Pivot Report</h1>
      <p style="color:#6B7280;font-size:14px;margin:0;">${normalized?.profile?.job_title || ''} · ${normalized?.profile?.industry || ''}</p>
    </div>

    ${reportDataToEmailHtml(reportData)}

    <div style="text-align:center;padding:28px;background:#0F1828;border:1px solid #1A2540;border-radius:20px;margin-bottom:24px;">
      <p style="color:#6B7280;font-size:14px;margin:0 0 18px;">Need to review milestones, update progress, or revisit your report later?</p>
      <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#6366F1);color:white;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">Open Your Dashboard →</a>
    </div>

    <p style="text-align:center;color:#374151;font-size:12px;margin:0;line-height:1.8;">
      PivotIQ · AI Career Risk Intelligence<br>
      You received this because you requested a career audit report.<br>
      <a href="${appUrl}" style="color:#4B5563;text-decoration:none;">pivotiq.ai</a>
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req) {
  try {
    const { email, jobTitle, industry, tier, reportId, reportData } = await req.json();

    if (!email || !reportData) {
      return Response.json({ error: 'Missing required fields: email, reportData' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      const admin = createSupabaseAdminClient();
      if (admin && tier === 'full' && reportId) {
        try {
          await scheduleOutcomeFollowups(admin, {
            reportId,
            userEmail: email,
            jobTitle,
            industry,
          });
        } catch (scheduleError) {
          console.warn('Failed to schedule outcome followups:', scheduleError);
        }
      }
      return Response.json({ success: true, demoMode: true, id: 'demo-email' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const admin = createSupabaseAdminClient();
    const normalized = normalizeReportData(reportData, {
      job_title: jobTitle,
      industry,
    });
    const riskLevel = normalized?.summary?.risk_level || 'Moderate';
    const tierLabel = tier === 'full' ? 'Full Career Report' : 'Quick Peek';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PivotIQ <reports@pivotiq.ai>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your PivotIQ ${tierLabel}: ${riskLevel} Risk for ${jobTitle}`,
      html: buildEmailHTML({ reportData }),
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (admin && tier === 'full' && reportId) {
      try {
        await scheduleOutcomeFollowups(admin, {
          reportId,
          userEmail: email,
          jobTitle,
          industry,
        });
      } catch (scheduleError) {
        console.warn('Failed to schedule outcome followups:', scheduleError);
      }
    }

    return Response.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('send-report error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
