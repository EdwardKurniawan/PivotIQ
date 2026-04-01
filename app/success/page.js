'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo, BrandMarkBadge } from '../../components/brand-logo';

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255, 255, 255, 0.82)',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  cream: '#FFF9F2',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [tier, setTier] = useState('full');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [persistStatus, setPersistStatus] = useState('idle');
  const [destination, setDestination] = useState('/report');

  useEffect(() => {
    const urlTier = searchParams.get('tier') || 'full';
    const sessionId = searchParams.get('session_id');
    const reportIdFromUrl = searchParams.get('report_id');
    const demoMode = searchParams.get('demo') === '1';
    setTier(urlTier);
    setStatus('unlocking');

    const raw = localStorage.getItem('pivotiq_report');
    let persistedReportId = reportIdFromUrl || '';
    if (raw) {
      try {
        const { reportData, email, jobTitle, industry, reportId } = JSON.parse(raw);
        persistedReportId = persistedReportId || reportId || '';

        if (email && reportData && urlTier === 'full') {
          fetch('/api/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, jobTitle, industry, tier: urlTier, reportData }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success && !d.demoMode) {
                setEmailStatus('sent');
              } else if (d.demoMode) {
                setEmailStatus('unavailable');
              } else {
                setEmailStatus('failed');
              }
            })
            .catch(() => { setEmailStatus('failed'); });
        }
      } catch {}
    }

    const nextDestination = persistedReportId ? `/report/${persistedReportId}` : '/report';
    setDestination(nextDestination);

    const finalizeUnlock = async () => {
      if (persistedReportId && (demoMode || sessionId)) {
        try {
          const response = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reportId: persistedReportId,
              tier: urlTier,
              sessionId,
              demoMode,
            }),
          });

          if (!response.ok) {
            throw new Error('Persisted unlock failed');
          }

          setPersistStatus('saved');
        } catch {
          setPersistStatus('failed');
        }
      } else {
        setPersistStatus('skipped');
      }

      localStorage.setItem('pivotiq_tier', urlTier);
      setStatus('done');
      setTimeout(() => router.push(nextDestination), 2200);
    };

    const timer = setTimeout(() => {
      finalizeUnlock();
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  const tierLabel = tier === 'full' ? 'Full Career Report' : 'Quick Peek';

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)',
        }}
      />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BrandLogo subtitle="Unlock complete" />
      </nav>

      {status === 'loading' || status === 'unlocking' ? (
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 28px', animation: 'pulse-ring 1.5s ease-in-out infinite', display: 'grid', placeItems: 'center' }}>
            <BrandMarkBadge size={96} />
          </div>
          <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Unlocking your report…
          </h2>
          <p style={{ color: palette.textSoft, fontSize: '14px' }}>Hang on for a second</p>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '680px', borderRadius: '32px', padding: '34px 30px', background: palette.panel, border: `1px solid ${palette.border}`, boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)' }}>
          <div style={{ width: '104px', height: '104px', background: 'linear-gradient(135deg, #1B6F63, #8AD8CB)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 60px rgba(27,111,99,0.16)' }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#071015" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6.5 12.5L10.2 16L17.5 8.7" />
            </svg>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,99,0.10)', border: '1px solid rgba(27,111,99,0.18)', color: '#1B6F63', borderRadius: '999px', padding: '7px 16px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '18px' }}>
            Payment confirmed
          </div>

          <h1 style={{ color: palette.text, fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.05em', lineHeight: 0.98, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Your {tierLabel.toLowerCase()} is unlocked.
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '16px', maxWidth: '470px', lineHeight: 1.72, margin: '0 auto 16px' }}>
            {tier === 'full'
              ? 'Your diagnosis is now connected to a real next move: the best-fit pivot, the first gaps to close, and the roadmap to follow.'
              : 'Your free diagnosis is ready, along with the first look at where the pressure is building.'}
          </p>

          {tier === 'full' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {['Best-fit pivot unlocked', 'Skill-gap map ready', '12-week plan ready'].map((item) => (
                <span
                  key={item}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.6)',
                    border: `1px solid ${palette.border}`,
                    borderRadius: '999px',
                    padding: '8px 12px',
                    color: palette.text,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {emailStatus === 'sent' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,99,0.10)', border: '1px solid rgba(27,111,99,0.18)', borderRadius: '14px', padding: '11px 16px', color: '#1B6F63', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
              Report also sent to your email
            </div>
          )}

          {emailStatus === 'unavailable' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(242,138,67,0.10)', border: '1px solid rgba(242,138,67,0.18)', borderRadius: '14px', padding: '11px 16px', color: '#8B4A1B', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
              Email delivery is not configured locally yet
            </div>
          )}

          {emailStatus === 'failed' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(242,138,67,0.10)', border: '1px solid rgba(242,138,67,0.18)', borderRadius: '14px', padding: '11px 16px', color: '#8B4A1B', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
              The report unlocked, but email delivery could not be confirmed.
            </div>
          )}

          {persistStatus === 'saved' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,99,0.10)', border: '1px solid rgba(27,111,99,0.18)', borderRadius: '14px', padding: '11px 16px', color: '#1B6F63', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
              Saved report access updated for this account
            </div>
          )}

          {persistStatus === 'failed' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(242,138,67,0.10)', border: '1px solid rgba(242,138,67,0.18)', borderRadius: '14px', padding: '11px 16px', color: '#8B4A1B', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
              Payment succeeded, but saved-report access could not be confirmed for your account.
            </div>
          )}

          <p style={{ color: palette.textSoft, fontSize: '13px', marginBottom: '28px' }}>
            Redirecting you to the report in a moment…
          </p>

          <Link href={destination}>
            <button style={{ border: 'none', borderRadius: '20px', background: palette.navy, color: '#FFF7F1', padding: '16px 28px', fontSize: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 18px 40px rgba(19, 32, 42, 0.18)' }}>
              View my report now →
            </button>
          </Link>

          {tier === 'peek' && (
            <div style={{ marginTop: '28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.border}`, borderRadius: '22px', padding: '22px', textAlign: 'left' }}>
              <p style={{ color: palette.textMuted, fontSize: '13px', margin: '0 0 14px', lineHeight: 1.65 }}>
                You&apos;re on the Quick Peek plan. The deeper pivot options, skill-gap actions, and full roadmap are still locked.
              </p>
              <Link href={destination}>
                <button style={{ width: '100%', border: 'none', borderRadius: '18px', background: 'linear-gradient(135deg, #FF8F4D, #FFC66C)', color: '#14181F', padding: '14px 18px', fontSize: '15px', fontWeight: 900, cursor: 'pointer' }}>
                  Upgrade to Full Report — $29.99
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
