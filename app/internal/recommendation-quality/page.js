import Link from 'next/link';
import { auditRecommendationQuality } from '../../../lib/recommendation-quality';

export const dynamic = 'force-dynamic';

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255,255,255,0.78)',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  navy: '#13202A',
  teal: '#1B6F63',
  orange: '#F28A43',
};

function statusColor(score) {
  if (score >= 82) return palette.teal;
  if (score >= 65) return '#8B6F1B';
  return '#9B3D2E';
}

function Card({ children, style = {} }) {
  return (
    <section style={{
      borderRadius: '26px',
      padding: '22px',
      background: palette.panel,
      border: `1px solid ${palette.border}`,
      boxShadow: '0 20px 60px rgba(19, 33, 45, 0.10)',
      ...style,
    }}>
      {children}
    </section>
  );
}

function Stat({ label, value, sublabel }) {
  return (
    <Card style={{ minHeight: '116px' }}>
      <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ color: palette.text, fontSize: '34px', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: '6px' }}>{value}</div>
      {sublabel && <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{sublabel}</div>}
    </Card>
  );
}

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    high: { bg: 'rgba(155,61,46,0.12)', fg: '#9B3D2E' },
    medium: { bg: 'rgba(242,138,67,0.14)', fg: '#8B4A1B' },
    low: { bg: 'rgba(27,111,99,0.12)', fg: palette.teal },
    neutral: { bg: 'rgba(19,27,35,0.06)', fg: palette.textMuted },
  }[tone] || {};

  return (
    <span style={{ display: 'inline-flex', borderRadius: '999px', padding: '7px 10px', background: styles.bg, color: styles.fg, fontSize: '12px', fontWeight: 800 }}>
      {children}
    </span>
  );
}

function PerformanceTable({ title, rows, labelKey, empty = 'No data yet.' }) {
  return (
    <Card>
      <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>{title}</h2>
      {rows?.length ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {rows.map((row) => (
            <div key={`${title}-${row[labelKey]}`} style={{ padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                <strong style={{ color: palette.text, textTransform: 'capitalize' }}>{String(row[labelKey]).replace(/-/g, ' ')}</strong>
                <Pill tone={row.avg_outcome_score >= 70 ? 'low' : row.avg_outcome_score >= 45 ? 'medium' : 'high'}>
                  {row.avg_outcome_score} score
                </Pill>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ color: palette.textMuted, fontSize: '12px' }}>{row.count} reports</span>
                <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '12px' }}>·</span>
                <span style={{ color: palette.textMuted, fontSize: '12px' }}>{row.proof_rate}% proof</span>
                <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '12px' }}>·</span>
                <span style={{ color: palette.textMuted, fontSize: '12px' }}>{row.manager_rate}% manager</span>
                <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '12px' }}>·</span>
                <span style={{ color: palette.textMuted, fontSize: '12px' }}>{row.traction_rate}% traction</span>
              </div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>
                Avg usefulness {row.avg_usefulness ?? 'n/a'} · {row.validated_count} validated · {row.encouraging_count} encouraging
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: palette.textMuted, margin: 0 }}>{empty}</p>
      )}
    </Card>
  );
}

function ExampleList({ title, rows, empty }) {
  return (
    <Card>
      <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>{title}</h2>
      {rows?.length ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {rows.map((row) => (
            <Link key={`${title}-${row.report_id}`} href={`/report/${row.report_id}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <div>
                    <div style={{ color: palette.text, fontWeight: 850 }}>{row.job_title}</div>
                    <div style={{ color: palette.textSoft, fontSize: '12px' }}>{row.primary_title} · {row.confidence_state}</div>
                  </div>
                  <Pill tone={row.outcome_score >= 70 ? 'low' : row.outcome_score >= 40 ? 'medium' : 'high'}>{row.outcome_score} score</Pill>
                </div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55, marginBottom: '6px' }}>
                  {row.traction_label}{row.usefulness_rating ? ` · usefulness ${row.usefulness_rating}/5` : ''}{row.quality_status ? ` · quality ${row.quality_status}` : ''}
                </div>
                {row.notes && <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{row.notes}</div>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: palette.textMuted, margin: 0 }}>{empty}</p>
      )}
    </Card>
  );
}

export default async function RecommendationQualityPage() {
  const audit = await auditRecommendationQuality({ limit: 1000 });

  return (
    <main style={{ minHeight: '100vh', background: palette.bg, padding: '28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 12% 0%, rgba(242,138,67,0.18), transparent 30%), radial-gradient(circle at 88% 10%, rgba(27,111,99,0.14), transparent 32%)',
      }} />
      <div style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '22px' }}>
          <Link href="/dashboard" style={{ color: palette.navy, fontWeight: 900, textDecoration: 'none' }}>PivotIQ</Link>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/internal/job-catalog" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Job catalog</Link>
            <Link href="/internal/course-catalog" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Course catalog</Link>
            <Link href="/api/recommendation-quality?limit=1000" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Open JSON</Link>
          </div>
        </nav>

        <Card style={{ padding: '34px', marginBottom: '18px', background: 'linear-gradient(140deg, rgba(255,255,255,0.86), rgba(255,249,242,0.72))' }}>
          <div style={{ color: palette.orange, fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Internal recommendation quality</div>
          <h1 style={{ color: palette.text, fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 0.92, letterSpacing: '-0.07em', margin: '0 0 14px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Tune the engine using real career outcomes, not just model confidence.
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, maxWidth: '760px', margin: 0 }}>
            This page shows which recommendation styles are actually turning into proof, manager conversations, and traction after users receive a full report.
          </p>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' }} className="quality-grid">
          <Stat label="Recommendation health" value={`${audit.recommendation_health_score || 0}%`} sublabel="Weighted from coverage, proof, manager conversations, traction, usefulness, and quality audits." />
          <Stat label="Full reports scanned" value={audit.scanned_reports || 0} sublabel="Recent saved full reports included in this audit." />
          <Stat label="Outcome coverage" value={`${audit.coverage_rate || 0}%`} sublabel={`${audit.reports_with_outcomes || 0} reports have meaningful outcome feedback.`} />
          <Stat label="Proof asset rate" value={`${audit.proof_asset_rate || 0}%`} sublabel="Share of feedback-bearing reports where a visible proof asset was actually built." />
          <Stat label="Traction rate" value={`${audit.traction_rate || 0}%`} sublabel={`Average usefulness ${audit.avg_usefulness || 0}/5 across reports with feedback.`} />
        </div>

        <Card style={{ marginBottom: '18px', borderColor: `${statusColor(audit.recommendation_health_score)}44` }}>
          <div style={{ color: statusColor(audit.recommendation_health_score), fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Action queue</div>
          <h2 style={{ color: palette.text, fontSize: '24px', margin: '0 0 14px' }}>What the outcomes say to do next</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(audit.action_items || []).map((item) => (
              <div key={`${item.priority}-${item.title}`} style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <Pill tone={item.priority}>{item.priority}</Pill>
                  <strong style={{ color: palette.text }}>{item.title}</strong>
                </div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px', marginBottom: '18px' }} className="quality-grid">
          <PerformanceTable title="Performance by confidence" rows={audit.confidence_performance || []} labelKey="confidence_state" />
          <PerformanceTable title="Performance by recommendation type" rows={audit.recommendation_type_performance || []} labelKey="recommendation_type" />
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Signals in the sample</h2>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(audit.traction_status_counts || []).map((item) => (
                <div key={item.traction_status} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.textMuted, textTransform: 'capitalize' }}>{String(item.traction_status).replace(/_/g, ' ')}</span>
                  <strong style={{ color: palette.text }}>{item.count}</strong>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: '8px', marginTop: '18px' }}>
              {(audit.quality_status_counts || []).map((item) => (
                <div key={item.quality_status} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.textMuted, textTransform: 'capitalize' }}>{String(item.quality_status).replace(/_/g, ' ')}</span>
                  <strong style={{ color: palette.text }}>{item.count}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '18px', marginBottom: '18px' }} className="quality-two-col">
          <PerformanceTable title="Role bucket performance" rows={audit.role_bucket_performance || []} labelKey="role_bucket" />
          <ExampleList title="Strongest examples" rows={audit.strong_examples || []} empty="No strong examples yet." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }} className="quality-two-col">
          <ExampleList title="Needs review" rows={audit.weak_examples || []} empty="No weak examples in this sample." />
          <ExampleList title="Latest outcome notes" rows={audit.recent_examples || []} empty="No recent full reports in this sample." />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 920px) {
          .quality-grid,
          .quality-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </main>
  );
}
