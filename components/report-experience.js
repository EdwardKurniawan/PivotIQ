'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { getBrowserLocale, getMessages } from '../lib/i18n';

function riskColor(score) {
  return score >= 70 ? '#C86A2C' : score >= 40 ? '#8B6B2E' : '#1B6F63';
}

function recommendationAccent(type) {
  if (type === 'active-pivot') return { color: '#8B4A1B', bg: 'rgba(242, 138, 67, 0.12)', border: 'rgba(242, 138, 67, 0.24)' };
  if (type === 'hybrid-transition') return { color: '#1B6F63', bg: 'rgba(27, 111, 99, 0.12)', border: 'rgba(27, 111, 99, 0.24)' };
  return { color: '#4F5D68', bg: 'rgba(19, 32, 42, 0.08)', border: 'rgba(19, 32, 42, 0.14)' };
}

function decisionFrameLabel(frame, messages) {
  const labels = messages?.report?.decisionFrames || {};
  if (frame === 'highest upside') return labels.highestUpside || 'Highest upside';
  if (frame === 'strongest leverage fit') return labels.strongestLeverageFit || 'Strongest leverage fit';
  if (frame === 'fastest cash recovery') return labels.fastestCashRecovery || 'Fastest cash recovery';
  if (frame === 'long-term platform bet') return labels.longTermPlatformBet || 'Long-term platform bet';
  return labels.safest || 'Safest transition';
}

const pivotColors = ['#FF8F4D', '#41C2AE', '#F4E4C7', '#7DD3FC', '#F9A8D4'];
const pivotIcons = ['01', '02', '03', '04', '05'];
const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255, 255, 255, 0.8)',
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

function getStorageScope(reportData, reportId) {
  return reportId || `${reportData?.profile?.job_title || 'report'}-${reportData?.generated_at || 'latest'}`;
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(dateString, locale = 'en') {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPivotColor(index) {
  return pivotColors[index % pivotColors.length];
}

function getPivotIcon(index) {
  return pivotIcons[index % pivotIcons.length];
}

function IconGlyph({ name, color }) {
  const common = {
    width: '64%',
    height: '64%',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: color,
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'role-read':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="4.5" />
          <path d="M13.5 13.5L18.5 18.5" />
        </svg>
      );
    case 'durable':
      return (
        <svg {...common}>
          <path d="M12 3L18 5.8V10.4C18 14.2 15.5 17.6 12 19C8.5 17.6 6 14.2 6 10.4V5.8L12 3Z" />
          <path d="M9.5 11.5L11.2 13.2L14.8 9.6" />
        </svg>
      );
    case 'assumption':
      return (
        <svg {...common}>
          <path d="M6 7H18" />
          <path d="M6 12H14" />
          <path d="M6 17H12" />
        </svg>
      );
    case 'best-pivot':
      return (
        <svg {...common}>
          <path d="M12 4L18 10L12 20L6 10L12 4Z" />
          <path d="M12 4V20" />
        </svg>
      );
    case 'bet':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 5V3.5" />
        </svg>
      );
    case 'next-first':
      return (
        <svg {...common}>
          <path d="M5 12H19" />
          <path d="M14 7L19 12L14 17" />
        </svg>
      );
    case 'task-diagnostics':
      return (
        <svg {...common}>
          <rect x="5" y="6" width="4" height="12" rx="1.5" />
          <rect x="10" y="10" width="4" height="8" rx="1.5" />
          <rect x="15" y="4" width="4" height="14" rx="1.5" />
        </svg>
      );
    case 'pivot-paths':
      return (
        <svg {...common}>
          <path d="M7 6H17" />
          <path d="M7 12H12" />
          <path d="M7 18H17" />
          <path d="M14 10L17 12L14 14" />
        </svg>
      );
    case 'skill-gaps':
      return (
        <svg {...common}>
          <path d="M8 8L10.5 5.5L18.5 13.5L16 16L8 8Z" />
          <path d="M6 18L9.2 14.8" />
        </svg>
      );
    case 'roadmap':
      return (
        <svg {...common}>
          <rect x="5" y="6" width="14" height="12" rx="2" />
          <path d="M8 4V8" />
          <path d="M16 4V8" />
          <path d="M5 10H19" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="7" y="11" width="10" height="8" rx="2" />
          <path d="M9 11V8.5C9 6.6 10.3 5 12 5C13.7 5 15 6.6 15 8.5V11" />
        </svg>
      );
    case 'share':
      return (
        <svg {...common}>
          <circle cx="7" cy="12" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M8.8 11L15.2 8" />
          <path d="M8.8 13L15.2 16" />
        </svg>
      );
    case 'tab-breakdown':
      return (
        <svg {...common}>
          <rect x="5" y="6" width="14" height="3" rx="1.5" />
          <rect x="5" y="11" width="14" height="3" rx="1.5" />
          <rect x="5" y="16" width="14" height="3" rx="1.5" />
        </svg>
      );
    case 'tab-pivots':
      return (
        <svg {...common}>
          <path d="M7 7H17" />
          <path d="M7 12H12" />
          <path d="M7 17H17" />
        </svg>
      );
    case 'tab-plan':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="12" height="14" rx="2" />
          <path d="M9 3.5V6.5" />
          <path d="M15 3.5V6.5" />
          <path d="M9 10H15" />
          <path d="M9 14H13" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M6.5 12.5L10.2 16L17.5 8.7" />
        </svg>
      );
    case 'decision':
      return (
        <svg {...common}>
          <path d="M7 6H17" />
          <path d="M7 12H13" />
          <path d="M7 18H17" />
          <path d="M15 10L18 12L15 14" />
        </svg>
      );
    case 'roi':
      return (
        <svg {...common}>
          <path d="M6 16L10 12L13 14L18 8" />
          <path d="M15 8H18V11" />
          <path d="M6 19H18" />
        </svg>
      );
    case 'proof':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="12" height="14" rx="2" />
          <path d="M9 10H15" />
          <path d="M9 14H13" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
  }
}

function MonoIcon({ name, tone = 'default', size = 28 }) {
  const tones = {
    default: { bg: 'rgba(19, 32, 42, 0.08)', border: 'rgba(19, 32, 42, 0.12)', color: '#13202A' },
    teal: { bg: 'rgba(27, 111, 99, 0.10)', border: 'rgba(27, 111, 99, 0.16)', color: '#1B6F63' },
    orange: { bg: 'rgba(242, 138, 67, 0.10)', border: 'rgba(242, 138, 67, 0.16)', color: '#8B4A1B' },
    dark: { bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.12)', color: '#F4EFE7' },
  };
  const style = tones[tone] || tones.default;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.36),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        flexShrink: 0,
      }}
    >
      <IconGlyph name={name} color={style.color} />
    </span>
  );
}

function RiskRing({ score, size = 165, label = 'RISK SCORE' }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const color = riskColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(19,27,35,0.08)" strokeWidth="12" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color, fontSize: size * 0.23, fontWeight: 900, lineHeight: 1 }}>{score}</div>
        <div style={{ color: palette.navy, fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

function SkillGapCard({ skill, color, messages }) {
  const priorityColors = {
    critical: '#FF8F4D',
    medium: '#F4E4C7',
    low: '#41C2AE',
  };
  const priorityColor = priorityColors[skill.gap_priority] || color;

  return (
    <div className="piq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: palette.text, fontSize: '16px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.02em' }}>{skill.skill_name}</div>
          <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{skill.category}</div>
        </div>
        <span style={{
          background: `${priorityColor}18`,
          color: priorityColor,
          border: `1px solid ${priorityColor}33`,
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
        }}>
          {skill.gap_priority}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
        <div style={{ background: 'rgba(10, 16, 24, 0.9)', border: `1px solid ${palette.border}`, borderRadius: '16px', padding: '13px' }}>
          <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.currentLeverage}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{skill.current_strength}</div>
        </div>
        <MonoIcon name="next-first" tone="orange" size={24} />
        <div style={{ background: `${color}0F`, border: `1px solid ${color}22`, borderRadius: '16px', padding: '13px' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.requiredLevel}</div>
          <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.6 }}>{skill.required_level}</div>
        </div>
      </div>

      <div style={{ height: '8px', background: 'rgba(19, 27, 35, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          width: skill.gap_priority === 'critical' ? '78%' : skill.gap_priority === 'medium' ? '54%' : '30%',
          height: '100%',
          background: `linear-gradient(90deg, ${priorityColor}, ${color})`,
          borderRadius: '999px',
        }} />
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.whyThisMatters}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{skill.why_it_matters}</div>
        </div>
        <div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.evidenceAlready}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{skill.evidence_you_already_have}</div>
        </div>
        <div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.closeGap}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{skill.how_to_close_gap}</div>
        </div>
      </div>

      <a
        href={skill.resource_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          padding: '10px 14px',
          borderRadius: '12px',
          background: `${color}16`,
          color,
          border: `1px solid ${color}33`,
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        {messages.report.learnWith} {skill.resource_title} →
      </a>

      {(skill.resource_provider || skill.resource_access || skill.resource_price_label) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {skill.resource_provider && (
            <span style={{ borderRadius: '999px', padding: '5px 10px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '11px', fontWeight: 700 }}>
              {skill.resource_provider}
            </span>
          )}
          {skill.resource_access && (
            <span style={{ borderRadius: '999px', padding: '5px 10px', background: skill.resource_access === 'paid' ? 'rgba(242,138,67,0.10)' : 'rgba(27,111,99,0.10)', border: `1px solid ${skill.resource_access === 'paid' ? 'rgba(242,138,67,0.18)' : 'rgba(27,111,99,0.18)'}`, color: skill.resource_access === 'paid' ? '#8B4A1B' : '#1B6F63', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>
              {skill.resource_access}
            </span>
          )}
          {skill.resource_price_label && (
            <span style={{ borderRadius: '999px', padding: '5px 10px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '11px', fontWeight: 700 }}>
              {skill.resource_price_label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getMilestoneStatus({ week, index, startDate, completedWeeks }) {
  const isCompleted = completedWeeks.includes(week.week_number);
  if (isCompleted) return 'completed';
  if (!startDate) return index === 0 ? 'current' : 'upcoming';

  const weekStart = addDays(startDate, index * 7);
  const weekEnd = addDays(startDate, index * 7 + 6);
  const now = new Date();

  if (now >= weekStart && now <= weekEnd) return 'current';
  if (now > weekEnd) return 'at_risk';
  return 'upcoming';
}

function statusStyles(status, color) {
  if (status === 'completed') return { bg: 'rgba(27,111,99,0.12)', fg: '#1B6F63', border: 'rgba(27,111,99,0.24)' };
  if (status === 'current') return { bg: `${color}18`, fg: color, border: `${color}40` };
  if (status === 'at_risk') return { bg: 'rgba(200,106,44,0.12)', fg: '#8B4A1B', border: 'rgba(200,106,44,0.24)' };
  return { bg: 'rgba(80,96,107,0.10)', fg: '#50606B', border: 'rgba(80,96,107,0.18)' };
}

async function syncProgress(reportId, payload) {
  if (!reportId) return;

  try {
    await fetch(`/api/reports/${reportId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Progress sync failed', error);
  }
}

function TeaserView({ payload, onCheckout, loading }) {
  const reportData = payload.reportData;
  const { summary, task_breakdown: taskBreakdown, pivots, roadmap } = reportData;
  const color = riskColor(summary.overall_score);
  const bestPivot = pivots[0];
  const interpretation = reportData.interpretation || {};
  const messages = getMessages(payload.locale || reportData.locale || getBrowserLocale());

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, paddingBottom: '90px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)' }} />
      <nav style={{ position: 'relative', zIndex: 2, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <BrandLogo subtitle={messages.report.previewSubtitle} />
        <Link href="/audit">
          <button style={{ border: 'none', borderRadius: '999px', background: palette.navy, color: '#FFF7F1', padding: '13px 18px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 18px 40px rgba(19, 32, 42, 0.14)' }}>{messages.common.newAudit}</button>
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(180deg, ${color}10 0%, transparent 100%)`, borderBottom: `1px solid ${palette.border}`, padding: '48px 24px' }}>
        <div className="report-hero" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '36px', alignItems: 'center', flexWrap: 'wrap' }}>
          <RiskRing score={summary.overall_score} label={messages.report.riskScore} />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${color}14`, border: `1px solid ${color}35`, color, borderRadius: '999px', padding: '6px 14px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
              ● {summary.risk_level} risk
            </div>
            <h1 style={{ color: palette.navy, fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.98, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
              {messages.report.pivotReady}
            </h1>
            <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.72, marginBottom: '12px' }}>{summary.narrative}</p>
            <p style={{ color, fontSize: '13px', fontWeight: 800 }}>{summary.displacement_timeline}</p>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '28px 24px 0' }}>
        {(interpretation.role_read || interpretation.stop_assuming || interpretation.durable_advantages?.length) && (
          <div className="hook-stats" style={{ marginBottom: '18px' }}>
            <span className="section-label">{messages.report.whatThisReallySays}</span>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              {interpretation.role_read && (
                <div className="hook-item" style={{ alignItems: 'flex-start' }}>
                  <MonoIcon name="role-read" tone="orange" />
                  <div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.roleRead}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>{interpretation.role_read}</div>
                  </div>
                </div>
              )}

              {Array.isArray(interpretation.durable_advantages) && interpretation.durable_advantages.length > 0 && (
                <div className="hook-item" style={{ alignItems: 'flex-start' }}>
                  <MonoIcon name="durable" tone="teal" />
                  <div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{messages.report.durableAdvantages}</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {interpretation.durable_advantages.slice(0, 3).map((item) => (
                        <div key={item} style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {interpretation.stop_assuming && (
                <div className="hook-item" style={{ alignItems: 'flex-start', borderColor: 'rgba(255, 143, 77, 0.18)' }}>
                  <MonoIcon name="assumption" tone="orange" />
                  <div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.stopAssuming}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>{interpretation.stop_assuming}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {bestPivot && (
          <div className="hook-stats" style={{ marginBottom: '18px' }}>
            <span className="section-label">{messages.report.strongestNextMove}</span>
            <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
              <div className="hook-item" style={{ alignItems: 'flex-start' }}>
                <MonoIcon name="best-pivot" tone="orange" />
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${pivotColors[0]}10`, border: `1px solid ${pivotColors[0]}26`, color: '#9A5727', borderRadius: '999px', padding: '4px 9px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {decisionFrameLabel(bestPivot.decision_frame, messages)}
                  </div>
                  <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{bestPivot.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>{bestPivot.why_this_path_wins || bestPivot.outcome || bestPivot.fit_summary}</div>
                </div>
              </div>
              {bestPivot.what_you_are_betting_on && (
                <div className="hook-item" style={{ alignItems: 'flex-start' }}>
                  <MonoIcon name="bet" tone="teal" />
                  <div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.whatYouAreBettingOn}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>{bestPivot.what_you_are_betting_on}</div>
                  </div>
                </div>
              )}
              {reportData.next_move?.explanation && (
                <div className="hook-item" style={{ alignItems: 'flex-start', borderColor: 'rgba(65, 194, 174, 0.18)' }}>
                  <MonoIcon name="next-first" tone="default" />
                  <div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.whatToDoFirst}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>{reportData.next_move.explanation}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="hook-stats">
          <span className="section-label">{messages.report.unlocksNext}</span>
          <div className="hook-grid">
            {[
              { icon: 'task-diagnostics', tone: 'orange', val: `${taskBreakdown.length} ${messages.report.unlockItems[0][0]}`, sub: messages.report.unlockItems[0][1] },
              { icon: 'pivot-paths', tone: 'default', val: `${pivots.length} ${messages.report.unlockItems[1][0]}`, sub: messages.report.unlockItems[1][1] },
              { icon: 'skill-gaps', tone: 'teal', val: `${bestPivot?.skill_gaps?.length || 0} ${messages.report.unlockItems[2][0]}`, sub: messages.report.unlockItems[2][1] },
              { icon: 'roadmap', tone: 'default', val: `${roadmap.total_weeks}-${messages.report.unlockItems[3][0]}`, sub: messages.report.unlockItems[3][1] },
            ].map(({ icon, tone, val, sub }) => (
              <div key={val} className="hook-item">
                <MonoIcon name={icon} tone={tone} />
                <div>
                  <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800 }}>{val}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="locked-section" style={{ marginTop: '18px' }}>
          <div style={{ padding: '24px', background: palette.panelStrong, border: `1px solid ${palette.border}`, borderRadius: '28px', boxShadow: '0 24px 70px rgba(19, 33, 45, 0.14)' }}>
            <span className="section-label">{messages.report.lockedPreview}</span>
            <div style={{ display: 'grid', gap: '14px' }}>
              {roadmap.weeks.slice(0, 3).map((week, index) => (
                <div key={week.week_number} style={{ background: 'rgba(10,16,24,0.9)', border: `1px solid ${palette.border}`, borderRadius: '18px', padding: '18px', filter: 'blur(1px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ color: '#A7602E', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{messages.report.week} {week.week_number}</div>
                      <div style={{ color: '#F4EFE7', fontSize: '15px', fontWeight: 800 }}>{week.title}</div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${pivotColors[0]}18`, color: pivotColors[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{index + 1}</div>
                  </div>
                  <div style={{ height: '12px', width: '70%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '10px', width: '55%', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }} />
                </div>
              ))}
            </div>

            <div className="lock-gate" style={{ position: 'relative', marginTop: '-120px', background: 'linear-gradient(to bottom, rgba(10,16,24,0.08), rgba(10,16,24,0.98) 25%)', borderRadius: '0 0 28px 28px' }}>
              <div className="lock-icon"><MonoIcon name="lock" tone="dark" size={46} /></div>
              <h3 style={{ color: '#F4EFE7', fontSize: '18px', fontWeight: 800, margin: '0 0 4px' }}>
                {messages.report.unlockTitle}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                {messages.report.unlockBody}
              </p>
              <div className="upgrade-btns">
                <button className="btn-full-upgrade" style={{ background: 'linear-gradient(135deg, #FF8F4D, #FFC66C)', color: '#14181F', boxShadow: '0 18px 40px rgba(255, 143, 77, 0.25)' }} disabled={!!loading} onClick={() => onCheckout('full')}>
                  {loading === 'full' ? messages.report.redirectingCheckout : messages.report.unlockButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportExperience({ payload, embedded = false }) {
  const [tier, setTier] = useState(payload.tier || 'free');
  const [loading, setLoading] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('breakdown');
  const [activePivot, setActivePivot] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const [startDate, setStartDate] = useState(payload.startDate || '');
  const [completedWeeks, setCompletedWeeks] = useState(payload.completedWeeks || []);
  const [weekNotes, setWeekNotes] = useState(payload.weekNotes || {});
  const reportData = payload.reportData;
  const profile = reportData.profile || {};
  const summary = reportData.summary || {};
  const pivots = reportData.pivots || [];
  const pivot = pivots[activePivot] || pivots[0] || {};
  const color = riskColor(summary.overall_score || 0);
  const pColor = getPivotColor(activePivot) || '#6366F1';
  const interpretation = reportData.interpretation || {};
  const decision = reportData.decision || {};
  const careerRoi = reportData.career_roi || {};
  const first30Days = reportData.first_30_days || {};
  const storageScope = useMemo(() => getStorageScope(reportData, payload.reportId), [reportData, payload.reportId]);
  const messages = getMessages(payload.locale || reportData.locale || getBrowserLocale());

  useEffect(() => {
    const storedTier = payload.tier || localStorage.getItem('pivotiq_tier') || 'free';
    setTier(storedTier);

    const rawProgress = localStorage.getItem(`pivotiq_progress_${storageScope}`);
    if (rawProgress) {
      try {
        const parsed = JSON.parse(rawProgress);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (Array.isArray(parsed.completedWeeks)) setCompletedWeeks(parsed.completedWeeks);
        if (parsed.weekNotes && typeof parsed.weekNotes === 'object') setWeekNotes(parsed.weekNotes);
      } catch {}
    }
  }, [payload.tier, storageScope]);

  useEffect(() => {
    localStorage.setItem(`pivotiq_progress_${storageScope}`, JSON.stringify({
      startDate,
      completedWeeks,
      weekNotes,
    }));
  }, [storageScope, startDate, completedWeeks, weekNotes]);

  const milestoneStatuses = useMemo(() => {
    return (pivot.roadmap?.weeks || []).map((week, index) => ({
      week,
      status: getMilestoneStatus({ week, index, startDate, completedWeeks }),
    }));
  }, [pivot, startDate, completedWeeks]);

  const currentFocus = milestoneStatuses.find((item) => item.status === 'current')
    || milestoneStatuses.find((item) => item.status === 'at_risk')
    || milestoneStatuses.find((item) => item.status === 'upcoming')
    || milestoneStatuses[milestoneStatuses.length - 1];

  const skillGapCounts = useMemo(() => {
    return (pivot.skill_gaps || []).reduce((acc, skill) => {
      acc[skill.gap_priority] = (acc[skill.gap_priority] || 0) + 1;
      return acc;
    }, { critical: 0, medium: 0, low: 0 });
  }, [pivot]);

  const completedCount = completedWeeks.filter((weekNumber) => (pivot.roadmap?.weeks || []).some((week) => week.week_number === weekNumber)).length;
  const progressPercent = Math.round((completedCount / Math.max(pivot.roadmap?.weeks?.length || 1, 1)) * 100);

  const toggleExpandedWeek = (weekNumber) => {
    setExpandedWeeks((prev) => (
      prev.includes(weekNumber)
        ? prev.filter((value) => value !== weekNumber)
        : [...prev, weekNumber]
    ));
  };

  const toggleWeekComplete = async (weekNumber) => {
    const next = completedWeeks.includes(weekNumber)
      ? completedWeeks.filter((value) => value !== weekNumber)
      : [...completedWeeks, weekNumber].sort((a, b) => a - b);
    setCompletedWeeks(next);
    await syncProgress(payload.reportId, {
      start_date: startDate || null,
      week_number: weekNumber,
      completed: next.includes(weekNumber),
      notes: weekNotes[weekNumber] || '',
    });
  };

  const saveStartDate = async (value) => {
    setStartDate(value);
    await syncProgress(payload.reportId, { start_date: value || null });
  };

  const saveWeekNote = async (weekNumber, note) => {
    const nextNotes = { ...weekNotes, [weekNumber]: note };
    setWeekNotes(nextNotes);
    await syncProgress(payload.reportId, {
      start_date: startDate || null,
      week_number: weekNumber,
      completed: completedWeeks.includes(weekNumber),
      notes: note,
    });
  };

  const handleCheckout = async (selectedTier) => {
    setLoading(selectedTier);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          reportId: payload.reportId,
          jobTitle: profile.job_title,
          industry: profile.industry,
          email: payload.email,
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || 'No URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(null);
      alert('Payment redirect failed. Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tier === 'free' && !embedded) {
    return <TeaserView payload={payload} onCheckout={handleCheckout} loading={loading} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)' }} />
      {!embedded && (
        <nav style={{ position: 'relative', zIndex: 2, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <BrandLogo subtitle={messages.report.fullSubtitle} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/dashboard">
              <button className="btn-ghost" style={{ width: 'auto', padding: '10px 16px', background: 'rgba(255,255,255,0.58)', borderColor: palette.border, color: palette.text, borderRadius: '18px' }}>{messages.common.dashboard}</button>
            </Link>
            <button onClick={handleShare} className="btn-ghost" style={{ width: 'auto', padding: '10px 16px', background: 'rgba(255,255,255,0.58)', borderColor: palette.border, color: palette.text, borderRadius: '18px' }}>
              {copied ? messages.common.linkCopied : messages.common.shareLink}
            </button>
            <Link href="/audit">
              <button style={{ border: 'none', borderRadius: '999px', background: palette.navy, color: '#FFF7F1', padding: '13px 18px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 18px 40px rgba(19, 32, 42, 0.14)' }}>{messages.common.newAudit}</button>
            </Link>
          </div>
        </nav>
      )}

      <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(180deg, ${color}10 0%, transparent 100%)`, borderBottom: `1px solid ${palette.border}`, padding: '48px 24px' }}>
        <div className="report-hero" style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr)', gap: '32px', alignItems: 'center' }}>
          <RiskRing score={summary.overall_score || 0} label={messages.report.riskScore} />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${color}20`, border: `1px solid ${color}55`, color: color === '#F4E4C7' ? '#7A5A43' : color, borderRadius: '999px', padding: '5px 14px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
              ● {summary.risk_level} risk · {tier === 'full' ? messages.report.fullReport : messages.report.quickPeek}
            </div>
            <h1 style={{ color: palette.navy, fontSize: 'clamp(30px,5vw,46px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.98, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
              {messages.report.pivotPlanTitle}
            </h1>
            <p style={{ color: palette.textSoft, fontSize: '14px', marginBottom: '12px' }}>
              {profile.job_title} · {profile.industry} · {formatDate(reportData.generated_at, payload.locale || reportData.locale || getBrowserLocale())}
            </p>
            <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.78, marginBottom: '8px' }}>{summary.narrative}</p>
            <p style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>{summary.what_this_means}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${color}14`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '8px 14px' }}>
              <span style={{ color: color === '#F4E4C7' ? '#7A5A43' : color, fontSize: '12px', fontWeight: 800 }}>TL {summary.displacement_timeline}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {tier === 'full' && (
          <div className="piq-card" style={{ marginTop: '-22px', marginBottom: '18px', padding: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(249,243,235,0.98))' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: '16px', marginBottom: '16px' }} className="two-col">
              <div style={{ padding: '20px', borderRadius: '22px', background: `${recommendationAccent(decision.recommendation_type).bg}`, border: `1px solid ${recommendationAccent(decision.recommendation_type).border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <MonoIcon name="decision" tone="orange" />
                  <div className="section-label" style={{ color: recommendationAccent(decision.recommendation_type).color, marginBottom: 0 }}>{messages.report.decisionClarity}</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.62)', border: `1px solid ${recommendationAccent(decision.recommendation_type).border}`, color: recommendationAccent(decision.recommendation_type).color, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  {decision.urgency || messages.report.recommendedNextMove}
                </div>
                <div style={{ color: palette.text, fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, marginBottom: '10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                  {decision.headline || messages.report.pivotPlanTitle}
                </div>
                <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
                  {decision.rationale}
                </div>
                <div style={{ padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>{decision.confidence_label || messages.report.moderateConfidence}</div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{decision.confidence_reason}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.74)', border: `1px solid ${palette.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <MonoIcon name="roi" tone="teal" />
                    <div className="section-label" style={{ marginBottom: 0 }}>{messages.report.careerRoi}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {[
                      [messages.report.roiLabels[0], careerRoi.salary_delta || pivot.salary_delta],
                      [messages.report.roiLabels[1], careerRoi.transition_time || pivot.transition_time],
                      [messages.report.roiLabels[2], careerRoi.learning_cost_estimate || 'TBD'],
                      [messages.report.roiLabels[3], careerRoi.payback_period || 'TBD'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(244,239,231,0.9)', border: `1px solid ${palette.border}` }}>
                        <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' }}>{label}</div>
                        <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, lineHeight: 1.35 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                    {careerRoi.roi_read}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '22px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${palette.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <MonoIcon name="proof" tone="default" />
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>{messages.report.first30Days}</div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                    {messages.report.first30DaysBody}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '12px' }} className="two-col">
                {[
                  [messages.report.first30DayBuckets[0], first30Days.next_7_days || [], 'rgba(242, 138, 67, 0.08)', '#8B4A1B'],
                  [messages.report.first30DayBuckets[1], first30Days.next_30_days || [], 'rgba(27, 111, 99, 0.08)', '#1B6F63'],
                  [messages.report.first30DayBuckets[2], first30Days.avoid || [], 'rgba(19, 32, 42, 0.06)', palette.text],
                ].map(([label, items, bg, headingColor]) => (
                  <div key={label} style={{ padding: '16px', borderRadius: '18px', background: bg, border: `1px solid ${palette.border}` }}>
                    <div style={{ color: headingColor, fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {items.map((item) => (
                        <div key={item} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px', borderRadius: '18px', background: `${pColor}0F`, border: `1px solid ${pColor}22` }}>
                <div style={{ color: pColor, fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.proofAssetToShip}</div>
                <div style={{ color: palette.text, fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{first30Days.proof_asset?.title}</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>{first30Days.proof_asset?.description}</div>
                <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.6 }}>{first30Days.proof_asset?.why_it_matters}</div>
              </div>
            </div>
          </div>
        )}

        {tier === 'full' && (interpretation.role_read || interpretation.stop_assuming || interpretation.durable_advantages?.length) && (
          <div className="piq-card" style={{ marginBottom: '18px', padding: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(249,243,235,0.96))' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '14px' }} className="two-col">
              <div>
                <div className="section-label" style={{ color: pColor, marginBottom: '8px' }}>{messages.report.whatThisSaysAboutRole}</div>
                <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75 }}>
                  {interpretation.role_read || summary.what_this_means}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {Array.isArray(interpretation.durable_advantages) && interpretation.durable_advantages.length > 0 && (
                  <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>{messages.report.durableAdvantages}</div>
                    <div style={{ display: 'grid', gap: '7px' }}>
                      {interpretation.durable_advantages.slice(0, 3).map((item) => (
                        <div key={item} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{item}</div>
                      ))}
                    </div>
                  </div>
                )}
                {interpretation.stop_assuming && (
                  <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(242, 138, 67, 0.10)', border: '1px solid rgba(242, 138, 67, 0.18)' }}>
                    <div style={{ color: '#8B4A1B', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.stopAssuming}</div>
                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{interpretation.stop_assuming}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tier === 'full' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) repeat(3, minmax(160px, 0.63fr))', gap: '12px' }} className="two-col">
              <div className="piq-card" style={{ padding: '20px', background: `linear-gradient(145deg, ${pColor}12, rgba(255,255,255,0.92) 60%)`, border: `1px solid ${pColor}28` }}>
                <div style={{ color: pColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {messages.report.bestFitDirection}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${pColor}14`, border: `1px solid ${pColor}30`, color: pColor, borderRadius: '999px', padding: '4px 9px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {decisionFrameLabel(pivot.decision_frame, messages)}
                </div>
                <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '6px' }}>
                  {pivot.title}
                </div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                  {pivot.outcome || pivot.fit_summary}
                </div>
              </div>

              <div className="piq-card" style={{ padding: '20px' }}>
                <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {messages.report.salarySignal}
                </div>
                <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>{pivot.salary_delta || pivot.salary_range}</div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{pivot.salary_range}</div>
              </div>

              <div className="piq-card" style={{ padding: '20px' }}>
                <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {messages.report.transitionWindow}
                </div>
                <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>{pivot.transition_time}</div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{pivot.difficulty} {messages.report.difficultySuffix}</div>
              </div>

              <div className="piq-card" style={{ padding: '20px' }}>
                <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {messages.report.nextMove}
                </div>
                <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>{reportData.next_move?.title || messages.report.yourMoveThisWeek}</div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
                  {(reportData.next_move?.explanation || '').slice(0, 150)}{(reportData.next_move?.explanation || '').length > 150 ? '…' : ''}
                </div>
              </div>
            </div>

            <div
              className="piq-card"
              style={{
                marginTop: '14px',
                padding: '24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,241,233,0.98))',
                border: `1px solid ${palette.border}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(circle at 0% 0%, ${pColor}12, transparent 34%)`,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: '20px' }} className="two-col">
                <div>
                  <div style={{ color: pColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                    Strategic read
                  </div>
                  <div style={{ color: palette.text, fontSize: '28px', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: '10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                    The role is not collapsing evenly. The leverage is moving.
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.8 }}>
                    This report is strongest when it helps you separate the work that is getting compressed from the work that becomes more valuable when AI enters the workflow.
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    [messages.report.whatWeakensFirst, summary.narrative],
                    [messages.report.whatStillCompounds, interpretation.durable_advantages?.[0] || summary.what_this_means],
                    [messages.report.whyThisPathWinsNow, pivot.why_this_path_wins || pivot.outcome || pivot.fit_summary],
                    [messages.report.whatToDoThisWeek, reportData.next_move?.explanation || 'Set a start date, pick the first milestone, and turn the roadmap into visible motion.'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
                      <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                        {label}
                      </div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.75 }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="tab-bar">
          {[['breakdown', 'tab-breakdown', messages.report.tabs[0]], ['pivots', 'tab-pivots', messages.report.tabs[1]], ...(tier === 'full' ? [['plan', 'tab-plan', messages.report.tabs[2]]] : [])].map(([key, icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`tab-btn ${activeTab === key ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><MonoIcon name={icon} size={22} />{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '36px 24px 80px' }}>
        {activeTab === 'breakdown' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: messages.report.breakdownStats[0][0], value: reportData.task_breakdown.filter((item) => item.risk_score >= 70).length, sub: messages.report.breakdownStats[0][1] },
                { label: messages.report.breakdownStats[1][0], value: reportData.task_breakdown.filter((item) => item.risk_score >= 40 && item.risk_score < 70).length, sub: messages.report.breakdownStats[1][1] },
                { label: messages.report.breakdownStats[2][0], value: reportData.task_breakdown.filter((item) => item.risk_score < 40).length, sub: messages.report.breakdownStats[2][1] },
              ].map((item) => (
                <div key={item.label} className="piq-card" style={{ padding: '18px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>{item.label}</div>
                  <div style={{ color: palette.text, fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>{item.value}</div>
                  <div style={{ color: palette.textMuted, fontSize: '13px' }}>{item.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {reportData.task_breakdown.map((task) => {
                const taskColor = riskColor(task.risk_score);
                return (
                  <div key={task.task_name} className="piq-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                      <div style={{ color: palette.text, fontSize: '16px', fontWeight: 700 }}>{task.task_name}</div>
                      <span style={{ background: `${taskColor}18`, color: taskColor, border: `1px solid ${taskColor}44`, borderRadius: '999px', padding: '5px 12px', fontSize: '12px', fontWeight: 800 }}>{task.risk_score}%</span>
                    </div>
                    <div style={{ height: '7px', background: 'var(--bg)', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ width: `${task.risk_score}%`, height: '100%', background: `linear-gradient(90deg, ${taskColor}, ${taskColor}CC)` }} />
                    </div>
                    <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{task.explanation}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'pivots' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pivots.map((item, index) => {
              const itemColor = getPivotColor(index) || '#6366F1';
              const criticalCount = item.skill_gaps?.filter((skill) => skill.gap_priority === 'critical').length || 0;
              return (
                <div
                  key={item.id}
                  className="piq-card piq-card-clickable"
                  onClick={() => {
                    setActivePivot(index);
                    if (tier === 'full') setActiveTab('plan');
                  }}
                  style={{ padding: '24px', border: `1px solid ${itemColor}33` }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${itemColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MonoIcon name="pivot-paths" tone="default" size={40} />
                    </div>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${itemColor}15`, border: `1px solid ${itemColor}30`, color: itemColor, borderRadius: '999px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        {index === 0 ? `${decisionFrameLabel(item.decision_frame, messages)} · ${messages.report.bestFitDirection}` : decisionFrameLabel(item.decision_frame, messages)}
                      </div>
                      <div style={{ color: palette.text, fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{item.title}</div>
                      <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>{item.fit_summary}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: itemColor, fontSize: '28px', fontWeight: 900 }}>{item.match_score}%</div>
                      <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{messages.report.match}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                    {[
                      [messages.report.pivotStats[0], item.salary_range],
                      [messages.report.pivotStats[1], item.salary_delta],
                      [messages.report.pivotStats[2], item.transition_time],
                      [messages.report.pivotStats[3], item.difficulty],
                      [messages.report.pivotStats[4], String(criticalCount)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
                        <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 700 }}>{label}</div>
                        <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="two-col">
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whoThisIsFor}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>{item.who_this_is_for || item.fit_summary}</div>
                      <div style={{ color: '#10B981', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.strengthsToLeverage}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(item.strengths_to_leverage || []).map((strength) => (
                          <span key={strength} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: '12px', fontWeight: 700 }}>
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: `${itemColor}10`, border: `1px solid ${itemColor}24`, borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: itemColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.whyThisPathWins}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>{item.why_this_path_wins || item.outcome}</div>
                      {item.what_you_are_betting_on && (
                        <>
                          <div style={{ color: itemColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.whatYouAreBettingOn}</div>
                          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{item.what_you_are_betting_on}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {Array.isArray(item.tradeoffs) && item.tradeoffs.length > 0 && (
                    <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: '#8B4A1B', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.tradeoffs}</div>
                      <div style={{ display: 'grid', gap: '7px' }}>
                        {item.tradeoffs.map((tradeoff) => (
                        <div key={tradeoff} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{tradeoff}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'plan' && tier === 'full' && (
          <>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {pivots.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActivePivot(index)}
                  className="chip"
                  style={{
                    background: activePivot === index ? `${getPivotColor(index)}20` : 'var(--bg-card)',
                    color: activePivot === index ? getPivotColor(index) : 'var(--text-muted)',
                    outline: activePivot === index ? `1.5px solid ${getPivotColor(index)}` : '1.5px solid var(--border)',
                  }}
                >
                  {getPivotIcon(index)} {item.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: '18px', marginBottom: '24px' }} className="two-col">
              <div className="piq-card" style={{ padding: '24px', background: `linear-gradient(160deg, ${pColor}12 0%, rgba(255, 255, 255, 0.94) 62%)`, border: `1px solid ${pColor}24`, boxShadow: '0 24px 50px rgba(19, 32, 42, 0.08)' }}>
                <div style={{ color: pColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{messages.report.currentFocus}</div>
                <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{currentFocus?.week?.title || pivot.title}</h2>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75, marginBottom: '14px' }}>{currentFocus?.week?.goal || pivot.fit_summary}</p>
                {currentFocus?.week && (
                  <>
                    <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                        <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whyThisWeekExists}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{currentFocus.week.why_this_week}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                        <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.problemThisWeekSolves}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{currentFocus.week.problem_being_solved}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '8px 12px', borderRadius: '999px', background: `${statusStyles(currentFocus.status, pColor).bg}`, border: `1px solid ${statusStyles(currentFocus.status, pColor).border}`, color: statusStyles(currentFocus.status, pColor).fg, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                        {currentFocus.status.replace('_', ' ')}
                      </span>
                      <span style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '12px', fontWeight: 700 }}>
                        {currentFocus.week.time_commitment}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="piq-card" style={{ padding: '24px' }}>
                <div style={{ color: '#10B981', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{messages.report.progressCockpit}</div>
                <div style={{ color: palette.text, fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>{progressPercent}%</div>
                <div style={{ color: palette.textSoft, fontSize: '13px', marginBottom: '14px' }}>{completedCount} of {pivot.roadmap?.weeks?.length || 0} milestones completed</div>
                <div style={{ height: '10px', background: 'var(--bg)', borderRadius: '999px', overflow: 'hidden', marginBottom: '18px' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, ${pColor}, ${pColor}AA)` }} />
                </div>

                <label className="section-label" style={{ marginBottom: '8px' }}>{messages.report.roadmapStartDate}</label>
                <input
                  type="date"
                  className="piq-input"
                  value={startDate}
                  onChange={(event) => saveStartDate(event.target.value)}
                  style={{ marginBottom: '14px' }}
                />
                <p style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                  {messages.report.roadmapStartDateBody}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>{messages.report.skillGapMap}</div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
                    {skillGapCounts.critical} critical gaps, {skillGapCounts.medium} medium gaps, {skillGapCounts.low} lower-priority gaps. Build order is designed to get the user employable fastest.
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '14px' }}>
                {(pivot.skill_gaps || []).map((skill) => (
                  <SkillGapCard key={`${pivot.id}-${skill.skill_name}`} skill={skill} color={pColor} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div className="section-label" style={{ marginBottom: '6px' }}>{messages.report.milestoneJourney}</div>
              <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
                {messages.report.milestoneJourneyBody}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {milestoneStatuses.map(({ week, status }, index) => {
                const isExpanded = expandedWeeks.includes(week.week_number);
                const styles = statusStyles(status, pColor);
                const note = weekNotes[week.week_number] || '';

                return (
                  <div key={`${pivot.id}-week-${week.week_number}`} className="piq-card" style={{ padding: '20px', border: `1px solid ${styles.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '16px', alignItems: 'start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: styles.bg, color: styles.fg, border: `1px solid ${styles.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                          {status === 'completed' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={styles.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6.5 12.5L10.2 16L17.5 8.7" />
                            </svg>
                          ) : week.week_number}
                        </div>
                        {index < milestoneStatuses.length - 1 && (
                          <div style={{ width: '2px', flex: 1, minHeight: '44px', background: 'linear-gradient(180deg, rgba(99,102,241,0.45), rgba(148,163,184,0.18))' }} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <div>
                            <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.week} {week.week_number}</div>
                            <div style={{ color: palette.text, fontSize: '18px', fontWeight: 800 }}>{week.title}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ background: styles.bg, color: styles.fg, border: `1px solid ${styles.border}`, borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                              {status.replace('_', ' ')}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, color: palette.textMuted }}>
                              {week.time_commitment}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{week.goal}</div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          <button className="btn-ghost" style={{ width: 'auto', padding: '9px 14px' }} onClick={() => toggleExpandedWeek(week.week_number)}>
                            {isExpanded ? messages.report.hideDetails : messages.report.viewDetails}
                          </button>
                          <button className="btn-primary" style={{ width: 'auto', padding: '9px 14px' }} onClick={() => toggleWeekComplete(week.week_number)}>
                            {completedWeeks.includes(week.week_number) ? messages.report.markIncomplete : messages.report.markComplete}
                          </button>
                        </div>

                        {isExpanded && (
                          <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whyThisWeekMatters}</div>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.why_this_week}</div>
                              </div>
                              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.problemBeingSolved}</div>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.problem_being_solved}</div>
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                              <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>{messages.report.whatToDo}</div>
                              <div style={{ display: 'grid', gap: '8px' }}>
                                {(week.actions || []).map((action, actionIndex) => (
                                  <div key={actionIndex} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr)', gap: '10px', alignItems: 'start' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '8px', background: `${pColor}18`, color: pColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{actionIndex + 1}</div>
                                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{action}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                              <div style={{ background: `${pColor}10`, border: `1px solid ${pColor}22`, borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: pColor, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.successSignal}</div>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.success_signal}</div>
                              </div>
                              <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: '#10B981', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.proofOfCompletion}</div>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.proof_of_completion}</div>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                              <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.commonBlockers}</div>
                                <ul style={{ margin: 0, paddingLeft: '18px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                                  {(week.common_blockers || []).map((blocker) => (
                                    <li key={blocker}>{blocker}</li>
                                  ))}
                                </ul>
                              </div>
                              <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.catchUpPlan}</div>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.catch_up_plan}</div>
                              </div>
                            </div>

                            <div style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '14px', padding: '14px' }}>
                              <div style={{ color: '#5B65C6', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.encouragement}</div>
                              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{week.encouragement}</div>
                            </div>

                            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                              <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.progressNotes}</div>
                              <textarea
                                className="piq-input"
                                style={{ minHeight: '100px' }}
                                placeholder={messages.report.progressNotesPlaceholder}
                                value={note}
                                onChange={(event) => setWeekNotes((prev) => ({ ...prev, [week.week_number]: event.target.value }))}
                                onBlur={(event) => saveWeekNote(week.week_number, event.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {reportData.next_move?.explanation && (
              <div style={{ marginTop: '28px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '18px', padding: '22px' }}>
                <div className="section-label" style={{ marginBottom: '6px' }}>{messages.report.yourMoveThisWeek}</div>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.8, margin: 0 }}>{reportData.next_move.explanation}</p>
              </div>
            )}
          </>
        )}

        {!embedded && (
          <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '18px' }}>
              {messages.report.dashboardReturn}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard">
                <button className="btn-primary" style={{ width: 'auto', padding: '14px 24px' }}>{messages.report.openDashboard}</button>
              </Link>
              <Link href="/audit">
                <button className="btn-ghost" style={{ width: 'auto', padding: '14px 24px' }}>{messages.report.runAnotherAudit}</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
