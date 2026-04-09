import Link from 'next/link';
import { auditCourseCatalogQuality } from '../../../lib/course-catalog-quality';

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
  cream: '#FFF9F2',
};

function statusColor(score) {
  if (score >= 88) return palette.teal;
  if (score >= 70) return '#8B6F1B';
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

function CountList({ items, labelKey, empty = 'No entries in this sample.' }) {
  if (!items?.length) return <p style={{ color: palette.textMuted, margin: 0 }}>{empty}</p>;

  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      {items.map((item) => (
        <div key={item[labelKey]} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${palette.border}` }}>
          <span style={{ color: palette.textMuted }}>{item[labelKey]}</span>
          <strong style={{ color: palette.text }}>{item.count}</strong>
        </div>
      ))}
    </div>
  );
}

function CourseLink({ course }) {
  return (
    <a href={course.url || course.final_url || '#'} style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, textDecoration: 'none' }}>
      <div style={{ color: palette.text, fontWeight: 850, marginBottom: '4px' }}>{course.title}</div>
      <div style={{ color: palette.textMuted, fontSize: '12px' }}>{course.provider} · {course.verification_status} · {course.resource_type || 'course'}</div>
    </a>
  );
}

function isWeakProbe(probe) {
  return !probe?.match || probe.score < 4 || probe.relevance_status === 'weak';
}

export default async function CourseCatalogQualityPage() {
  const audit = await auditCourseCatalogQuality({ limit: 1000 });
  const providerCounts = audit.provider_counts || [];
  const dataCampCount = providerCounts.find((item) => item.provider.toLowerCase() === 'datacamp')?.count || 0;
  const weakProbeCount = (audit.recommendation_probes || []).filter(isWeakProbe).length;

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
            <Link href="/internal/recommendation-quality" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Recommendation quality</Link>
            <Link href="/internal/qa-fixtures" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>QA fixtures</Link>
            <Link href="/api/course-catalog/quality?limit=1000" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Open JSON</Link>
          </div>
        </nav>

        <Card style={{ padding: '34px', marginBottom: '18px', background: 'linear-gradient(140deg, rgba(255,255,255,0.86), rgba(255,249,242,0.72))' }}>
          <div style={{ color: palette.orange, fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Internal learning quality</div>
          <h1 style={{ color: palette.text, fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 0.92, letterSpacing: '-0.07em', margin: '0 0 14px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Keep learning recommendations specific before they reach reports.
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, maxWidth: '760px', margin: 0 }}>
            This page audits course provider coverage, verification health, generic entries, missing skill metadata, and sample skill-gap recommendations.
          </p>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' }} className="quality-grid">
          <Stat label="Health score" value={`${audit.health_score || 0}%`} sublabel="Higher means fewer failed, generic, and under-tagged course entries." />
          <Stat label="Scanned courses" value={audit.scanned_courses || 0} sublabel="Latest course catalog rows checked in Supabase." />
          <Stat label="DataCamp courses" value={dataCampCount} sublabel="Will populate after DATACAMP_LMS_CATALOG_API_TOKEN is added and synced." />
          <Stat label="Weak probes" value={weakProbeCount} sublabel="Sample skill gaps without strong catalog matches." />
        </div>

        <Card style={{ marginBottom: '18px', borderColor: `${statusColor(audit.health_score)}44` }}>
          <div style={{ color: statusColor(audit.health_score), fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Action queue</div>
          <h2 style={{ color: palette.text, fontSize: '24px', margin: '0 0 14px' }}>What needs attention next</h2>
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
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Providers</h2>
            <CountList items={providerCounts} labelKey="provider" />
          </Card>
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Verification</h2>
            <CountList items={audit.verification_counts || []} labelKey="status" />
          </Card>
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Resource types</h2>
            <CountList items={audit.resource_type_counts || []} labelKey="resource_type" />
          </Card>
        </div>

        <Card style={{ marginBottom: '18px' }}>
          <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Learning recommendation probes</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(audit.recommendation_probes || []).map((probe) => (
              <div key={probe.skill_name} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 0.5fr) minmax(0, 1fr) auto', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${isWeakProbe(probe) ? 'rgba(242,138,67,0.32)' : 'rgba(27,111,99,0.18)'}` }}>
                <div>
                  <strong style={{ color: palette.text, display: 'block', marginBottom: '5px' }}>{probe.skill_name}</strong>
                  <span style={{ color: palette.textSoft, fontSize: '12px' }}>
                    Expected: {(probe.expected_terms || []).join(', ') || 'general relevance'}
                  </span>
                </div>
                <div>
                  {probe.match ? (
                    <a href={probe.match.url} style={{ color: palette.textMuted, textDecoration: 'none', fontSize: '13px', lineHeight: 1.55 }}>
                      {probe.match.provider} · {probe.match.title}
                    </a>
                  ) : (
                    <span style={{ color: palette.textMuted, fontSize: '13px' }}>No catalog match yet.</span>
                  )}
                  {probe.match && (
                    <div style={{ color: isWeakProbe(probe) ? '#8B4A1B' : palette.teal, fontSize: '12px', marginTop: '5px', fontWeight: 800 }}>
                      {probe.relevance_status === 'weak'
                        ? `Weak domain overlap${(probe.required_terms || []).length ? `; needs one of ${(probe.required_terms || []).join(', ')}` : ''}`
                        : `Aligned on ${(probe.expected_term_hits || []).join(', ')}`}
                    </div>
                  )}
                </div>
                <Pill tone={isWeakProbe(probe) ? 'medium' : 'low'}>score {probe.score}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }} className="quality-grid">
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Missing skills</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(audit.missing_skill_entries || []).slice(0, 8).map((item) => <CourseLink key={item.id} course={item} />)}
              {!(audit.missing_skill_entries || []).length && <p style={{ color: palette.textMuted, margin: 0 }}>No missing skill examples in this sample.</p>}
            </div>
          </Card>
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Generic entries</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(audit.generic_entries || []).slice(0, 8).map((item) => <CourseLink key={item.id} course={item} />)}
              {!(audit.generic_entries || []).length && <p style={{ color: palette.textMuted, margin: 0 }}>No generic examples in this sample.</p>}
            </div>
          </Card>
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Failed/review</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(audit.failed_entries || []).slice(0, 8).map((item) => <CourseLink key={item.id} course={item} />)}
              {!(audit.failed_entries || []).length && <p style={{ color: palette.textMuted, margin: 0 }}>No failed course examples in this sample.</p>}
            </div>
          </Card>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 920px) {
          .quality-grid {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </main>
  );
}
