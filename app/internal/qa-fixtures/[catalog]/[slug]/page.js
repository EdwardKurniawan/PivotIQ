import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReportExperience from '../../../../../components/report-experience';
import { buildQaFixturePreview } from '../../../../../lib/broad-role-fixtures.js';
import { getServerLocale } from '../../../../../lib/i18n-server';

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255,255,255,0.78)',
  border: 'rgba(19, 27, 35, 0.08)',
  navy: '#13202A',
  orange: '#F28A43',
  textMuted: '#50606B',
};

export const dynamic = 'force-dynamic';

export default async function QaFixturePreviewPage({ params, searchParams }) {
  const snapshot = buildQaFixturePreview(params.catalog, params.slug);
  if (!snapshot?.report) notFound();

  const payload = {
    reportId: null,
    reportSlug: `${snapshot.catalog}-${snapshot.slug}`,
    jobTitle: snapshot.fixture.jobTitle,
    industry: snapshot.fixture.industry,
    tasks: snapshot.fixture.tasks,
    email: '',
    tier: 'full',
    locale: snapshot.report.locale || 'en',
    uiLocale: getServerLocale(),
    initialTab: searchParams?.tab || 'breakdown',
    createdAt: snapshot.report.generated_at || new Date().toISOString(),
    startDate: '',
    weekProgress: {},
    outcome: null,
    completedWeeks: [],
    weekNotes: {},
    reportData: snapshot.report,
  };

  return (
    <main style={{ minHeight: '100vh', background: palette.bg }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px', padding: '16px 18px', borderRadius: '20px', background: palette.panel, border: `1px solid ${palette.border}` }}>
          <div>
            <div style={{ color: palette.orange, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Fixture preview</div>
            <div style={{ color: palette.navy, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em' }}>{snapshot.fixture.jobTitle}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>
              Open the real report UI for visual QA without needing a saved authenticated report.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/internal/qa-fixtures" style={{ borderRadius: '999px', padding: '9px 13px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}`, color: palette.navy, fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>
              Back to fixtures
            </Link>
            <Link href={`/internal/qa-fixtures/${snapshot.catalog}/${snapshot.slug}?tab=stay`} style={{ borderRadius: '999px', padding: '9px 13px', background: 'rgba(27,111,99,0.10)', border: '1px solid rgba(27,111,99,0.18)', color: '#1B6F63', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>
              Open stay tab
            </Link>
            <Link href={`/internal/qa-fixtures/${snapshot.catalog}/${snapshot.slug}?tab=pivots`} style={{ borderRadius: '999px', padding: '9px 13px', background: 'rgba(242,138,67,0.12)', border: '1px solid rgba(242,138,67,0.20)', color: '#8B4A1B', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>
              Open pivots
            </Link>
          </div>
        </div>
      </div>
      <ReportExperience payload={payload} embedded={false} />
    </main>
  );
}
