import Link from 'next/link';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { isSupabaseConfigured } from '../../lib/supabase/config';
import { buildOutcomeFollowupState, buildOutcomeSummary } from '../../lib/outcome-tracking';
import { normalizeReportData } from '../../lib/report-data';
import { buildExecutionSummary, buildWeekProgressMap, getCompletedWeeks } from '../../lib/progress-tracking';
import { buildProgressRefreshContext } from '../../lib/report-refresh';
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
      updated_at,
      active_pivot_id,
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
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
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

function formatShortDate(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

function buildCoachingSnapshot(report, messages, locale) {
  const normalized = normalizeReportData(report.report_data, {
    job_title: report.job_title,
    industry: report.industry,
    tasks: report.tasks || [],
  });
  const pivots = normalized?.pivots || [];
  const activePivot = pivots.find((pivot) => pivot.id === report.active_pivot_id) || pivots[0] || null;
  const roadmapWeeks = activePivot?.roadmap?.weeks || normalized?.roadmap?.weeks || [];
  const weekProgressMap = buildWeekProgressMap(report.week_progress || []);
  const completedWeeks = getCompletedWeeks(weekProgressMap);
  const completedCount = completedWeeks.filter((weekNumber) => roadmapWeeks.some((week) => week.week_number === weekNumber)).length;
  const progressPercent = Math.round((completedCount / Math.max(roadmapWeeks.length || 1, 1)) * 100);
  const nextIncompleteWeek = roadmapWeeks.find((week) => !completedWeeks.includes(week.week_number)) || roadmapWeeks[roadmapWeeks.length - 1] || null;
  const executionSummary = buildExecutionSummary({
    roadmapWeeks,
    weekProgressMap,
    startDate: report.roadmap_start_date || '',
  });
  const outcomeEntry = Array.isArray(report.report_outcomes) ? report.report_outcomes[0] : report.report_outcomes;
  const outcomeSummary = buildOutcomeSummary(outcomeEntry);
  const outcomeFollowup = buildOutcomeFollowupState({
    createdAt: report.created_at || report.updated_at || '',
    outcome: outcomeEntry,
  });
  const refreshContext = buildProgressRefreshContext({
    reportData: normalized,
    weekProgressMap,
    startDate: report.roadmap_start_date || '',
    outcome: outcomeEntry,
    createdAt: report.created_at || report.updated_at || '',
    refreshedAt: normalized?.refreshed_at || '',
  });
  const nextWeekStart = report.roadmap_start_date && nextIncompleteWeek
    ? addDays(report.roadmap_start_date, (nextIncompleteWeek.week_number - 1) * 7)
    : null;
  const nextWeekEnd = report.roadmap_start_date && nextIncompleteWeek
    ? addDays(report.roadmap_start_date, (nextIncompleteWeek.week_number - 1) * 7 + 6)
    : null;

  let currentLabel = messages.dashboard.currentLabelSetup;
  let dateLabel = messages.dashboard.dateLabelUnset;
  if (report.roadmap_start_date && nextIncompleteWeek) {
    const now = new Date();
    dateLabel = `${formatShortDate(nextWeekStart, locale)} - ${formatShortDate(nextWeekEnd, locale)}`;
    if (now > nextWeekEnd) {
      currentLabel = messages.dashboard.weekOverdue.replace('{week}', nextIncompleteWeek.week_number);
    } else if (now >= nextWeekStart) {
      currentLabel = messages.dashboard.currentFocusWeek.replace('{week}', nextIncompleteWeek.week_number);
    } else {
      currentLabel = messages.dashboard.upcomingWeek.replace('{week}', nextIncompleteWeek.week_number);
    }
  } else if (nextIncompleteWeek) {
    currentLabel = messages.dashboard.nextMilestoneWeek.replace('{week}', nextIncompleteWeek.week_number);
    dateLabel = messages.dashboard.activateTiming;
  }

  return {
    activePivot,
    nextIncompleteWeek,
    progressPercent,
    completedCount,
    totalWeeks: roadmapWeeks.length,
    executionSummary,
    outcomeSummary,
    outcomeFollowup,
    refreshContext,
    currentLabel,
    dateLabel,
  };
}

function riskTone(level) {
  if (level === 'HIGH') return { bg: 'rgba(255,143,77,0.14)', fg: '#FFB17E', border: 'rgba(255,143,77,0.22)' };
  if (level === 'LOW') return { bg: 'rgba(27,111,99,0.12)', fg: '#1B6F63', border: 'rgba(27,111,99,0.18)' };
  return { bg: 'rgba(244,228,199,0.24)', fg: '#7A5A43', border: 'rgba(122,90,67,0.16)' };
}

function buildAttentionState(snapshot) {
  if (snapshot?.outcomeFollowup?.is_due) {
    return {
      priority: 4,
      label: 'Feedback due',
      detail: snapshot.outcomeFollowup.title,
      tone: { bg: 'rgba(242,138,67,0.14)', fg: '#8B4A1B', border: 'rgba(242,138,67,0.24)' },
    };
  }

  if (snapshot?.executionSummary?.statusLabel === 'Conversation prep' || /conversation/i.test(snapshot?.executionSummary?.title || '')) {
    return {
      priority: 3,
      label: 'Manager conversation',
      detail: snapshot.executionSummary.title,
      tone: { bg: 'rgba(27,111,99,0.12)', fg: palette.teal, border: 'rgba(27,111,99,0.18)' },
    };
  }

  if (snapshot?.executionSummary?.statusLabel === 'Proof still needed' || /proof/i.test(snapshot?.executionSummary?.title || '')) {
    return {
      priority: 2,
      label: 'Proof sprint',
      detail: snapshot.executionSummary.title,
      tone: { bg: 'rgba(255,143,77,0.14)', fg: '#A7602E', border: 'rgba(255,143,77,0.22)' },
    };
  }

  if (snapshot?.executionSummary?.title) {
    return {
      priority: 1,
      label: 'Active plan',
      detail: snapshot.executionSummary.title,
      tone: { bg: 'rgba(19,27,35,0.06)', fg: palette.textMuted, border: 'rgba(19,27,35,0.12)' },
    };
  }

  return {
    priority: 0,
    label: 'Tracked',
    detail: 'No urgent action right now.',
    tone: { bg: 'rgba(19,27,35,0.06)', fg: palette.textMuted, border: 'rgba(19,27,35,0.12)' },
  };
}

function buildReportHref(reportId, attention, snapshot, preferredTab = '') {
  const resolvedTab = preferredTab
    || (attention?.label === 'Feedback due'
      ? 'plan'
      : attention?.label === 'Manager conversation' || attention?.label === 'Proof sprint'
        ? 'stay'
        : snapshot?.refreshContext?.is_ready
          ? 'stay'
          : '');
  return resolvedTab ? `/report/${reportId}?tab=${resolvedTab}` : `/report/${reportId}`;
}

function dashboardActionLinkStyle(kind = 'secondary') {
  if (kind === 'primary') {
    return {
      borderRadius: '999px',
      padding: '9px 13px',
      background: palette.navy,
      border: `1px solid ${palette.navy}`,
      color: '#FFF7F1',
      fontSize: '12px',
      fontWeight: 800,
      textDecoration: 'none',
    };
  }

  return {
    borderRadius: '999px',
    padding: '9px 13px',
    background: 'rgba(255,255,255,0.74)',
    border: `1px solid ${palette.border}`,
    color: palette.text,
    fontSize: '12px',
    fontWeight: 800,
    textDecoration: 'none',
  };
}

export default async function DashboardPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const data = await loadDashboardData();
  const configured = isSupabaseConfigured();
  const reportCards = data.mode === 'ready'
    ? data.reports.map((report) => {
        const snapshot = buildCoachingSnapshot(report, messages, locale);
        return {
          report,
          snapshot,
          attention: buildAttentionState(snapshot),
        };
      })
    : [];
  const latestCard = reportCards[0] || null;
  const latestSnapshot = latestCard?.snapshot || null;
  const dueOutcomeReports = reportCards.filter((item) => item.snapshot?.outcomeFollowup?.is_due);
  const managerConversationReports = reportCards.filter((item) => item.attention.label === 'Manager conversation');
  const proofSprintReports = reportCards.filter((item) => item.attention.label === 'Proof sprint');
  const tractionReports = reportCards.filter((item) => item.snapshot?.outcomeSummary?.traction_status !== 'no_signal');
  const sortedReportCards = reportCards
    .slice(1)
    .sort((left, right) => right.attention.priority - left.attention.priority || new Date(right.report.updated_at || right.report.created_at).getTime() - new Date(left.report.updated_at || left.report.created_at).getTime());

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

          {data.mode === 'ready' && dueOutcomeReports.length > 0 && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.orange}33`, boxShadow: '0 20px 60px rgba(19, 33, 45, 0.10)' }}>
              <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outcome feedback due</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: '0 0 12px', maxWidth: '760px' }}>
                {dueOutcomeReports.length} report{dueOutcomeReports.length === 1 ? '' : 's'} now need a real-world check-in. Logging proof, manager conversations, and traction is how PivotIQ gets sharper.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dueOutcomeReports.slice(0, 4).map(({ report, snapshot }) => (
                  <Link
                    key={report.id}
                    href={buildReportHref(report.id, { label: 'Feedback due' }, snapshot)}
                    style={{ borderRadius: '999px', padding: '8px 12px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, color: palette.text, fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}
                  >
                    {report.job_title} · {snapshot.outcomeFollowup.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.mode === 'ready' && reportCards.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }} className="dashboard-action-grid">
              {[
                ['Feedback due', dueOutcomeReports.length, 'Reports that now need a real-world outcome check-in.'],
                ['Manager prep', managerConversationReports.length, 'Reports where the next move is to make the work visible to a manager.'],
                ['Proof sprint', proofSprintReports.length, 'Reports that should turn planning into a visible artifact next.'],
                ['Traction logged', tractionReports.length, 'Reports where users already recorded team, internal, or market movement.'],
              ].map(([label, value, body]) => (
                <div key={label} style={{ borderRadius: '22px', padding: '18px', background: palette.panel, border: `1px solid ${palette.border}`, boxShadow: '0 20px 60px rgba(19, 33, 45, 0.10)' }}>
                  <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                  <div style={{ color: palette.text, fontSize: '30px', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: '6px' }}>{value}</div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{body}</div>
                </div>
              ))}
            </div>
          )}

          {data.mode === 'unconfigured' && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{messages.dashboard.setupRequired}</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '12px' }}>
                {messages.dashboard.setupBody}
              </p>
              <Link href="/login" style={{ color: palette.cream, fontWeight: 800 }}>{messages.dashboard.openLogin}</Link>
            </div>
          )}

          {data.mode === 'anonymous' && configured && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: palette.teal, fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{messages.dashboard.saveProgressTitle}</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '12px' }}>
                {messages.dashboard.saveProgressBody}
              </p>
              <Link href="/login" style={{ color: palette.cream, fontWeight: 800 }}>{messages.dashboard.sendMagicLink}</Link>
            </div>
          )}

          {data.mode === 'error' && (
            <div style={{ borderRadius: '24px', padding: '22px', background: palette.panel, border: `1px solid ${palette.border}` }}>
              <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{messages.dashboard.queryFailed}</div>
              <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: 0 }}>{data.message}</p>
            </div>
          )}
        </div>

        {data.mode === 'ready' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {latestCard && latestSnapshot && (
              <div
                style={{
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
                      {messages.dashboard.continueFromHere}
                    </div>
                    <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                      {latestSnapshot.activePivot?.title || latestCard.report.job_title}
                    </div>
                    <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '14px', maxWidth: '720px' }}>
                      {latestSnapshot.nextIncompleteWeek?.goal || messages.dashboard.latestReportFallback}
                    </div>
                    {latestSnapshot.executionSummary?.title && (
                      <div style={{ marginBottom: '14px', padding: '13px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.border}`, maxWidth: '760px' }}>
                        <div style={{ color: '#A7602E', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Next best action</div>
                        <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{latestSnapshot.executionSummary.title}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{latestSnapshot.executionSummary.body}</div>
                      </div>
                    )}
                    <div style={{ marginBottom: '14px', padding: '13px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.border}`, maxWidth: '760px' }}>
                      <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Outcome signal</div>
                      <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{latestSnapshot.outcomeSummary.title}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{latestSnapshot.outcomeSummary.body}</div>
                    </div>
                    {latestSnapshot.outcomeFollowup?.is_due && (
                      <div style={{ marginBottom: '14px', padding: '13px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.orange}33`, maxWidth: '760px' }}>
                        <div style={{ color: '#8B4A1B', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Feedback due</div>
                        <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{latestSnapshot.outcomeFollowup.title}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{latestSnapshot.outcomeFollowup.body}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(27,111,99,0.12)', border: '1px solid rgba(27,111,99,0.18)', color: '#1B6F63', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                        {latestSnapshot.currentLabel}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.completedCount} of {latestSnapshot.totalWeeks} {messages.dashboard.milestonesComplete}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.progressPercent}% {messages.dashboard.progressSuffix}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.dateLabel}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.executionSummary?.proofReadyCount || 0} proof ready
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.executionSummary?.managerDoneCount || 0} manager conversations
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                        {latestSnapshot.outcomeSummary.traction_label}
                      </span>
                      {latestSnapshot.refreshContext?.is_ready && (
                        <span style={{ background: 'rgba(19,27,35,0.08)', border: `1px solid ${palette.border}`, color: palette.navy, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                          Refresh ready
                        </span>
                      )}
                      {latestSnapshot.outcomeFollowup?.is_due && (
                        <span style={{ background: 'rgba(242,138,67,0.14)', border: '1px solid rgba(242,138,67,0.24)', color: '#8B4A1B', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                          Feedback due
                        </span>
                        )}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
                    <div style={{ color: palette.navy, fontWeight: 800 }}>{messages.dashboard.resume}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link href={buildReportHref(latestCard.report.id, latestCard.attention, latestSnapshot)} style={dashboardActionLinkStyle('primary')}>
                        Resume
                      </Link>
                      <Link href={buildReportHref(latestCard.report.id, latestCard.attention, latestSnapshot, 'stay')} style={dashboardActionLinkStyle()}>
                        Open stay tab
                      </Link>
                      <Link href={buildReportHref(latestCard.report.id, latestCard.attention, latestSnapshot, 'plan')} style={dashboardActionLinkStyle()}>
                        Open plan
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportCards.length <= 1 ? (
              <div style={{ borderRadius: '24px', padding: '24px', background: palette.panel, border: `1px solid ${palette.border}` }}>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: 0 }}>
                  {reportCards.length === 0 ? messages.dashboard.noSavedReports : 'No additional saved reports yet. Run a new audit to compare multiple plans in one place.'}
                </p>
              </div>
            ) : (
              sortedReportCards.map(({ report, snapshot, attention }, index) => {
                const tone = riskTone(report.risk_level);
                return (
                  <div
                    key={report.id}
                    style={{
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
                          {report.industry} · Updated {new Date(report.updated_at || report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '12px', maxWidth: '700px' }}>
                          {snapshot.nextIncompleteWeek?.title
                            ? `${snapshot.currentLabel}. ${snapshot.nextIncompleteWeek.title}`
                            : messages.dashboard.latestReportFallback}
                        </div>
                        {snapshot.executionSummary?.title && (
                          <div style={{ marginBottom: '12px', padding: '12px 13px', borderRadius: '14px', background: 'rgba(255,255,255,0.66)', border: `1px solid ${palette.border}`, maxWidth: '760px' }}>
                            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>Next best action</div>
                            <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>{snapshot.executionSummary.title}</div>
                            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{snapshot.executionSummary.body}</div>
                          </div>
                        )}
                        <div style={{ marginBottom: '12px', padding: '12px 13px', borderRadius: '14px', background: 'rgba(255,255,255,0.66)', border: `1px solid ${palette.border}`, maxWidth: '760px' }}>
                          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>Outcome signal</div>
                          <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>{snapshot.outcomeSummary.title}</div>
                          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{snapshot.outcomeSummary.body}</div>
                        </div>
                        {snapshot.outcomeFollowup?.is_due && (
                          <div style={{ marginBottom: '12px', padding: '12px 13px', borderRadius: '14px', background: 'rgba(255,255,255,0.66)', border: `1px solid ${palette.orange}33`, maxWidth: '760px' }}>
                            <div style={{ color: '#8B4A1B', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>Feedback due</div>
                            <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>{snapshot.outcomeFollowup.title}</div>
                            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{snapshot.outcomeFollowup.body}</div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: attention.tone.bg, border: `1px solid ${attention.tone.border}`, color: attention.tone.fg, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                            {attention.label}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.progressPercent}% {messages.dashboard.progressSuffix}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.dateLabel}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.executionSummary?.proofReadyCount || 0} proof ready
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {snapshot.outcomeSummary.traction_label}
                          </span>
                          {snapshot.refreshContext?.is_ready && (
                            <span style={{ background: 'rgba(19,27,35,0.08)', border: `1px solid ${palette.border}`, color: palette.navy, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                              Refresh ready
                            </span>
                          )}
                          {snapshot.outcomeFollowup?.is_due && (
                            <span style={{ background: 'rgba(242,138,67,0.14)', border: '1px solid rgba(242,138,67,0.24)', color: '#8B4A1B', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                              Feedback due
                            </span>
                          )}
                          <span style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.fg, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 800 }}>
                            {report.risk_score} {messages.dashboard.riskScoreSuffix}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}`, color: palette.text, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700 }}>
                            {report.risk_level}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
                        <div style={{ color: palette.navy, fontWeight: 800 }}>{messages.dashboard.open}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Link href={buildReportHref(report.id, attention, snapshot)} style={dashboardActionLinkStyle('primary')}>
                            Open report
                          </Link>
                          <Link href={buildReportHref(report.id, attention, snapshot, 'stay')} style={dashboardActionLinkStyle()}>
                            Open stay tab
                          </Link>
                          <Link href={buildReportHref(report.id, attention, snapshot, 'plan')} style={dashboardActionLinkStyle()}>
                            Open plan
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 920px) {
          .dashboard-action-grid,
          .dashboard-card-head {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </div>
  );
}
