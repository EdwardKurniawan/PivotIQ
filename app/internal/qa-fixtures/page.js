import Link from 'next/link';
import { buildBroadRoleFixtureSnapshots, summarizeBroadRoleFixtureSnapshots } from '../../../lib/broad-role-fixtures.js';

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

function FixtureCard({ snapshot }) {
  const { fixture, report, evaluation } = snapshot;
  const primary = report?.recommendation_stack?.primary || null;
  const backup = report?.recommendation_stack?.conservative_backup || null;
  const stay = report?.stay_path || null;
  const topPivot = report?.pivots?.[0] || null;
  const decisionBrief = report?.recommendation_stack?.decision_brief || null;

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div>
          <div style={{ color: palette.orange, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>{fixture.industry}</div>
          <h2 style={{ color: palette.text, fontSize: '24px', margin: 0 }}>{fixture.jobTitle}</h2>
        </div>
        <Pill tone={evaluation.passed ? 'low' : 'high'}>{evaluation.passed ? 'Passes fixture checks' : 'Needs review'}</Pill>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {fixture.tasks.map((task) => (
          <span key={task} style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, padding: '6px 9px', borderRadius: '999px', background: 'rgba(19,32,42,0.05)', border: `1px solid ${palette.border}` }}>
            {task}
          </span>
        ))}
      </div>

      <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, marginBottom: '14px' }}>
        <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>Decision brief</div>
        <div style={{ color: palette.text, fontWeight: 850, marginBottom: '6px' }}>{decisionBrief?.headline || 'No decision brief'}</div>
        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{decisionBrief?.summary || 'No summary yet.'}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }} className="fixture-grid">
        {[
          ['Primary move', primary],
          ['Conservative backup', backup],
          ['Stay path', stay],
        ].map(([label, item]) => (
          <div key={label} style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.text, fontWeight: 850, marginBottom: '6px' }}>{item?.title || 'None'}</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{item?.confidence_label || item?.decision_frame || 'No confidence read yet.'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: evaluation.issues.length ? '14px' : '0' }} className="fixture-grid">
        <div style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>Top pivot lane</div>
          <div style={{ color: palette.text, fontWeight: 850, marginBottom: '6px' }}>{topPivot?.title || 'None'}</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{topPivot?.learning_path?.[0]?.skill_name || 'No learning path yet.'}</div>
        </div>
        <div style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>Proof focus</div>
          <div style={{ color: palette.text, fontWeight: 850, marginBottom: '6px' }}>{primary?.proof_asset || report?.proof_asset_builder?.title || 'No proof asset yet.'}</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{primary?.learning_focus || report?.paid_value_summary?.first_learning_step || 'No learning focus yet.'}</div>
        </div>
      </div>

      {evaluation.issues.length > 0 && (
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(155,61,46,0.08)', border: '1px solid rgba(155,61,46,0.16)', marginTop: '14px' }}>
          <div style={{ color: '#9B3D2E', fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>Why this fixture failed</div>
          <div style={{ display: 'grid', gap: '7px' }}>
            {evaluation.issues.map((issue) => (
              <div key={issue} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{issue}</div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default async function QaFixturesPage() {
  const snapshots = buildBroadRoleFixtureSnapshots();
  const summary = summarizeBroadRoleFixtureSnapshots(snapshots);

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
            <Link href="/internal/job-catalog" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Job catalog</Link>
            <Link href="/internal/course-catalog" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Course catalog</Link>
            <Link href="/api/qa-fixtures" style={{ color: palette.navy, fontWeight: 800, textDecoration: 'none' }}>Open JSON</Link>
          </div>
        </nav>

        <Card style={{ padding: '34px', marginBottom: '18px', background: 'linear-gradient(140deg, rgba(255,255,255,0.86), rgba(255,249,242,0.72))' }}>
          <div style={{ color: palette.orange, fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Internal fixture QA</div>
          <h1 style={{ color: palette.text, fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 0.92, letterSpacing: '-0.07em', margin: '0 0 14px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Inspect broad-role snapshots before they reach real users.
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, maxWidth: '760px', margin: 0 }}>
            These fixtures turn the shared broad-role catalog into live report snapshots so we can check whether the engine is staying sane, useful, and properly conservative when signal is thin.
          </p>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' }} className="fixture-grid">
          <Stat label="Fixtures" value={summary.fixture_count} sublabel="Broad-role snapshots generated from the shared fixture catalog." />
          <Stat label="Pass rate" value={`${summary.pass_rate}%`} sublabel={`${summary.passed_count} fixtures currently pass every guardrail check.`} />
          <Stat label="Stay-first primaries" value={summary.stay_primary_count} sublabel="How often PivotIQ currently prefers safer current-lane leverage on these roles." />
          <Stat label="Low-confidence backups" value={summary.low_confidence_backup_count} sublabel={`${summary.market_backed_primary_count} primaries are already market-backed in this fixture set.`} />
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          {snapshots.map((snapshot) => (
            <FixtureCard key={snapshot.fixture.jobTitle} snapshot={snapshot} />
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 920px) {
          .fixture-grid {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </main>
  );
}
