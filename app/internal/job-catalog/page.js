import Link from 'next/link';
import { auditJobOpeningsQuality } from '../../../lib/job-openings-quality';

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

export default async function JobCatalogQualityPage() {
  const audit = await auditJobOpeningsQuality({ limit: 1000 });
  const failedCount = audit.failed_enrichments_count || 0;
  const suspiciousCount = audit.suspicious_openings_count || 0;
  const watchedCoverage = audit.watched_family_coverage || [];
  const topFamilies = (audit.open_role_family_counts || []).slice(0, 10);

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
            <Link href="/internal/recommendation-quality" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Recommendation quality</Link>
            <Link href="/internal/qa-fixtures" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>QA fixtures</Link>
            <Link href="/internal/course-catalog" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Course catalog</Link>
            <Link href="/api/job-openings/quality?limit=1000" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Open JSON</Link>
            <Link href="/api/job-openings/search?limit=10" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Search API</Link>
          </div>
        </nav>

        <Card style={{ padding: '34px', marginBottom: '18px', background: 'linear-gradient(140deg, rgba(255,255,255,0.86), rgba(255,249,242,0.72))' }}>
          <div style={{ color: palette.orange, fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Internal catalog quality</div>
          <h1 style={{ color: palette.text, fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 0.92, letterSpacing: '-0.07em', margin: '0 0 14px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Keep market truth clean before it reaches reports.
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, maxWidth: '760px', margin: 0 }}>
            This page audits open postings for failed enrichments, suspicious family drift, and thin role-pure coverage in the families that currently matter most to validation fixtures.
          </p>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' }} className="quality-grid">
          <Stat label="Health score" value={`${audit.health_score || 0}%`} sublabel="Higher means fewer failed and suspicious rows in the scanned sample." />
          <Stat label="Scanned openings" value={audit.scanned_openings || 0} sublabel="Latest open postings checked by deterministic grounding rules." />
          <Stat label="Failed enrichments" value={failedCount} sublabel="Rows to retry when rate limits clear." />
          <Stat label="Suspicious rows" value={suspiciousCount} sublabel="Rows where stored labels or skills disagree with deterministic grounding." />
        </div>

        <Card style={{ marginBottom: '18px', borderColor: `${statusColor(audit.health_score)}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div>
              <div style={{ color: statusColor(audit.health_score), fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Action queue</div>
              <h2 style={{ color: palette.text, fontSize: '24px', margin: 0 }}>What needs attention next</h2>
            </div>
          </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', marginBottom: '18px' }} className="quality-two-col">
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Watched role-family coverage</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {watchedCoverage.map((item) => {
                const enrichedPct = Math.round((item.enriched_count / Math.max(item.open_count, 1)) * 100);
                return (
                  <div key={item.role_family} style={{ padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', marginBottom: '8px' }}>
                      <strong style={{ color: palette.text, textTransform: 'capitalize' }}>{item.role_family}</strong>
                      <span style={{ color: palette.textMuted, fontSize: '13px' }}>{item.open_count} open · {enrichedPct}% enriched</span>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(19,27,35,0.08)' }}>
                      <div style={{ width: `${Math.max(4, enrichedPct)}%`, height: '100%', background: `linear-gradient(90deg, ${palette.teal}, ${palette.orange})` }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <Pill tone={item.failed_count ? 'high' : 'low'}>{item.failed_count} failed</Pill>
                      <Pill tone={item.suspicious_count ? 'medium' : 'low'}>{item.suspicious_count} suspicious</Pill>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Top families</h2>
            <div style={{ display: 'grid', gap: '8px' }}>
              {topFamilies.map((item) => (
                <div key={item.role_family} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.textMuted, textTransform: 'capitalize' }}>{item.role_family}</span>
                  <strong style={{ color: palette.text }}>{item.count}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }} className="quality-two-col">
          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Suspicious transitions</h2>
            {(audit.suspicious_role_family_mismatches || []).length ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {audit.suspicious_role_family_mismatches.map((item) => (
                  <div key={item.transition} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                    <span style={{ color: palette.textMuted }}>{item.transition}</span>
                    <strong style={{ color: palette.text }}>{item.count}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: palette.textMuted, margin: 0 }}>No suspicious transitions in this sample.</p>
            )}
          </Card>

          <Card>
            <h2 style={{ color: palette.text, fontSize: '22px', margin: '0 0 14px' }}>Failed enrichment examples</h2>
            {(audit.failed_enrichments || []).length ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {audit.failed_enrichments.slice(0, 8).map((item) => (
                  <a key={item.id} href={item.posting_url || '#'} style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, textDecoration: 'none' }}>
                    <div style={{ color: palette.text, fontWeight: 850, marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: palette.textMuted, fontSize: '12px' }}>{item.company_name} · {item.role_family}</div>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: palette.textMuted, margin: 0 }}>No failed enrichments in this sample.</p>
            )}
          </Card>
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
