'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportExperience from '../../components/report-experience';
import { normalizeReportData } from '../../lib/report-data';
import { BrandMarkBadge } from '../../components/brand-logo';

export default function ReportPage() {
  const [payload, setPayload] = useState(null);

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

      setPayload({
        ...stored,
        reportData,
        tier: localStorage.getItem('pivotiq_tier') || 'free',
      });
    } catch (error) {
      console.error('Failed to load stored report', error);
    }
  }, []);

  if (!payload?.reportData) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: '88px', height: '88px', display: 'grid', placeItems: 'center', boxShadow: '0 24px 60px rgba(19, 33, 45, 0.12)', borderRadius: '28px' }}>
          <BrandMarkBadge size={88} />
        </div>
        <div style={{ maxWidth: '460px', padding: '28px', borderRadius: '28px', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(19,27,35,0.08)', boxShadow: '0 24px 70px rgba(19,33,45,0.12)' }}>
          <div style={{ color: 'var(--text)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>No report found yet.</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
            Start a fresh audit and we’ll build your first task-level diagnosis.
          </p>
          <Link href="/audit" style={{ display: 'inline-flex', marginTop: '12px', color: 'var(--primary)', fontWeight: 700 }}>Start your free audit →</Link>
        </div>
      </div>
    );
  }

  return <ReportExperience payload={payload} />;
}
