import Link from 'next/link';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { isSupabaseConfigured } from '../../lib/supabase/config';
import { normalizeReportData } from '../../lib/report-data';
import { BrandLogo } from '../../components/brand-logo';
import LanguageSwitcher from '../../components/language-switcher';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255, 255, 255, 0.78)',
  panelStrong: '#13202A',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  cream: '#FFF9F2',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
};

async function loadDashboardData() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { mode: 'unconfigured' };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { mode: 'anonymous' };

  const { data: reports, error } = await supabase
    .from('reports')
    .select(`
      id,
      slug,
      job_title,
      industry,
      risk_score,
      risk_level,
      created_at,
      active_pivot_id,
      roadmap_start_date,
      report_data,
      week_progress (
        week_number,
        completed_at,
        notes
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { mode: 'error', message: error.message };
  }

  return { mode: 'ready', user, reports: reports || [] };
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildCoachingSnapshot(report) {
  const normalized = normalizeReportData(report.report_data, {
    job_title: report.job_title,
    industry: report.industry,
    tasks: report.tasks || [],
  });
  const pivots = normalized?.pivots || [];
  const activePivot = pivots.find((pivot) => pivot.id === report.active_pivot_id) || pivots[0] || null;
  const roadmapWeeks = activePivot?.roadmap?.weeks || normalized?.roadmap?.weeks || [];
  const completedWeeks = (report.week_progress || []).filter((item) => item.completed_at).map((item) => item.week_number);
  const completedCount = completedWeeks.filter((weekNumber) => roadmapWeeks.some((week) => week.week_number === weekNumber)).length;
  const progressPercent = Math.round((completedCount / Math.max(roadmapWeeks.length || 1, 1)) * 100);
  const nextIncompleteWeek = roadmapWeeks.find((week) => !completedWeeks.includes(week.week_number)) || roadmapWeeks[roadmapWeeks.length - 1] || null;
  const nextWeekStart = report.roadmap_start_date && nextIncompleteWeek
    ? addDays(report.roadmap_start_date, (nextIncompleteWeek.week_number - 1) * 7)
    : null;
  const nextWeekEnd = report.roadmap_start_date && nextIncompleteWeek
    ? addDays(report.roadmap_start_date, (nextIncompleteWeek.week_number - 1) * 7 + 6)
    : null;

  let currentLabel = 'Set roadmap start date';
  let dateLabel = 'Start date not set';
  if (report.roadmap_start_date && nextIncompleteWeek) {
    const now = new Date();
    dateLabel = `${formatShortDate(nextWeekStart)} - ${formatShortDate(nextWeekEnd)}`;
    if (now > nextWeekEnd) {
      currentLabel = `Week ${nextIncompleteWeek.week_number} is overdue`;
    } else if (now >= nextWeekStart) {
      currentLabel = `Current focus: Week ${nextIncompleteWeek.week_number}`;
    } else {
      currentLabel = `Upcoming: Week ${nextIncompleteWeek.week_number}`;
    }
  } else if (nextIncompleteWeek) {
    currentLabel = `Next milestone: Week ${nextIncompleteWeek.week_number}`;
    dateLabel = 'Set a roadmap start date to activate timing';
  }

  return {
    activePivot,
    nextIncompleteWeek,
    progressPercent,
    completedCount,
    totalWeeks: roadmapWeeks.length,
    currentLabel,
    dateLabel,
  };
}

function riskTone(level) {
  if (level === 'HIGH') return { bg: 'rgba(255,143,77,0.14)', fg: '#FFB17E', border: 'rgba(255,143,77,0.22)' };
  if (level === 'LOW') return { bg: 'rgba(27,111,99,0.12)', fg: '#1B6F63', border: 'rgba(27,111,99,0.18)' };
  return { bg: 'rgba(244,228,199,0.24)', fg: '#7A5A43', border: 'rgba(122,90,67,0.16)' };
}

export default async function DashboardPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const data = await loadDashboardData();
  const configured = isSupabaseConfigured();
  const latestSnapshot = data.mode === 'ready' && data.reports[0] ? buildCoachingSnapshot(data.reports[0]) : null;

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)',
        }}
      />

      <div className="dashboard-shell" style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <nav className="dashboard-nav" style={{ marginBottom: '24px', padding: '22px 26px', borderRadius: '26px', background: palette.panel, border: `1px solid ${palette.border}`, boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <BrandLogo subtitle={messages.dashboard.subtitle} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <LanguageSwitcher locale={locale} />
            <Link href="/audit">
              <button style={{ border: 'none', borderRadius: '999px', background: palette.navy, color: '#FFF7F1', padding: '13px 18px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 18px 40px rgba(18, 31, 41, 0.12)' }}>{messages.common.newAudit}</button>
            </Link>
            <Link href="/report">
              <button style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, padding: '12px 16px', fontSize: '14px', fontWeight: 700 }}>{messages.common.latestLocalReport}</button>
            </Link>
          </div>
        </nav>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div style={{ borderRadius: '30px', padding: '30px', background: palette.panel, border: `1px solid ${palette.border}`, boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)' }}>
            <div style={{ color: '#6A7882', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{messages.dashboard.heroEyebrow}</div>
            <h1 style={{ color: palette.text, fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.05em', lineHeight: 0.96, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
              {messages.dashboard.heroTitle}
            </h1>
            <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.76, margin: 0, maxWidth: '760px' }}>
              {messages.dashboard.heroBody}
            </p>
          </div>

          {data.mode === 'unconfigured' && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Supabase setup required</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '12px' }}>
                Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to enable saved reports, magic-link accounts, and progress tracking.
              </p>
              <Link href="/login" style={{ color: palette.cream, fontWeight: 800 }}>Open login page →</Link>
            </div>
          )}

          {data.mode === 'anonymous' && configured && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: palette.teal, fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sign in to save progress</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '12px' }}>
                Your local report still works, but signing in lets you keep the diagnosis, the roadmap, and milestone progress across sessions.
              </p>
              <Link href="/login" style={{ color: palette.cream, fontWeight: 800 }}>Send magic link →</Link>
            </div>
          )}

          {data.mode === 'error' && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard query failed</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: 0 }}>{data.message}</p>
            </div>
          )}
        </div>

        {data.mode === 'ready' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.reports[0] && latestSnapshot && (
              <Link
                href={`/report/${data.reports[0].id}`}
                style={{
                  display: 'block',
                  borderRadius: '28px',
                  padding: '24px',
                    background: 'linear-gradient(150deg, rgba(242,138,67,0.14), rgba(255,255,255,0.92) 58%)',
                    border: `1px solid ${palette.border}`,
                    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
                }}
              >
                <div className="dashboard-card-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#A7602E', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      Continue from here
                    </div>
                    <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                      {latestSnapshot.activePivot?.title || data.reports[0].job_title}
                    </div>
                    <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '14px', maxWidth: '720px' }}>
                      {latestSnapshot.nextIncompleteWeek?.goal || 'Your latest report is ready to reopen, review, and move forward.'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(27,111,99,0.12)', border: '1px solid rgba(27,111,99,0.18)', color: '#1B6F63', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                        {latestSnapshot.currentLabel}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.completedCount} of {latestSnapshot.totalWeeks} milestones complete
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.progressPercent}% progress
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.dateLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: palette.navy, fontWeight: 800 }}>Resume →</div>
                </div>
              </Link>
            )}

            {data.reports.length === 0 ? (
              <div style={{ borderRadius: '24px', padding: '24px', background: palette.panel, border: `1px solid ${palette.border}` }}>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: 0 }}>
                  No saved reports yet. Run a new audit while signed in and your scan will show up here automatically.
                </p>
              </div>
            ) : (
              data.reports.map((report, index) => {
                const tone = riskTone(report.risk_level);
                const snapshot = buildCoachingSnapshot(report);
                return (
                  <Link
                    key={report.id}
                    href={`/report/${report.id}`}
                    style={{
                      display: 'block',
                      borderRadius: '26px',
                      padding: '24px',
                      background: index === 0 ? 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(249,243,235,0.96))' : palette.panel,
                      border: `1px solid ${palette.border}`,
                      boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
                    }}
                  >
                    <div className="dashboard-card-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: palette.text, fontSize: '20px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }}>{report.job_title}</div>
                        <div style={{ color: palette.textSoft, fontSize: '13px', marginBottom: '12px' }}>
                          {report.industry} · {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '12px', maxWidth: '700px' }}>
                          {snapshot.nextIncompleteWeek?.title
                            ? `${snapshot.currentLabel}. ${snapshot.nextIncompleteWeek.title}`
                            : 'Reopen the report to continue your roadmap and track progress.'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {index === 0 && (
                              <span style={{ background: 'rgba(27,111,99,0.12)', border: '1px solid rgba(27,111,99,0.18)', color: '#1B6F63', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                                Continue latest
                              </span>
                          )}
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.progressPercent}% progress
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.dateLabel}
                          </span>
                          <span style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.fg, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                            {report.risk_score} risk score
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {report.risk_level}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: palette.navy, fontWeight: 800 }}>Open →</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
