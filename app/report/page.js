'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import ReportExperience from '../../components/report-experience';
import { normalizeReportData } from '../../lib/report-data';
import { BrandMarkBadge } from '../../components/brand-logo';
import { getBrowserLocale, getMessages } from '../../lib/i18n';

export default function ReportPage() {
  const router = useRouter();
  const [payload, setPayload] = useState(null);
  const [locale, setLocale] = useState('en');
  const searchParams = useSearchParams();

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem('pivotiq_report') || localStorage.getItem('pivotiq_report');
    if (!raw) return;

    try {
      const stored = JSON.parse(raw);
      const reportData = normalizeReportData(stored.reportData, {
        job_title: stored.jobTitle,
        industry: stored.industry,
        tasks: stored.tasks,
        selected_tasks: stored.intakeProfile?.selected_tasks,
        primary_tasks: stored.intakeProfile?.primary_tasks,
        clarifiers: stored.intakeProfile?.clarifiers,
        linkedin_profile_url: stored.intakeProfile?.linkedin_profile_url,
      });

      if (!reportData) return;

      const storedTier = localStorage.getItem('pivotiq_tier') || 'free';
      if (storedTier === 'full' && reportData.generation_stage !== 'full_complete') {
        router.replace('/report/intake');
        return;
      }

      setPayload({
        ...stored,
        initialTab: searchParams.get('tab') || 'breakdown',
        locale: stored.reportData?.locale || stored.locale || 'en',
        uiLocale: getBrowserLocale(),
        reportData,
        tier: storedTier,
      });
    } catch (error) {
      console.error('Failed to load stored report', error);
    }
  }, [router, searchParams]);

  if (!payload?.reportData) {
    const messages = getMessages(locale);
    return (
      <div className="report-empty-page" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: '88px', height: '88px', display: 'grid', placeItems: 'center', boxShadow: '0 24px 60px rgba(19, 33, 45, 0.12)', borderRadius: '28px' }}>
          <BrandMarkBadge size={88} />
        </div>
        <div className="report-empty-card" style={{ maxWidth: '460px', padding: '28px', borderRadius: '28px', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(19,27,35,0.08)', boxShadow: '0 24px 70px rgba(19,33,45,0.12)' }}>
          <div className="report-empty-title" style={{ color: 'var(--text)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>{messages.report.emptyTitle}</div>
          <p className="report-empty-copy" style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
            {messages.report.emptyBody}
          </p>
          <Link href="/audit" style={{ display: 'inline-flex', marginTop: '12px', color: 'var(--primary)', fontWeight: 700 }}>{messages.report.emptyCta}</Link>
        </div>
      </div>
    );
  }

  return <ReportExperience payload={payload} />;
}
