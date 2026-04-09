'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BrandLogo, BrandMarkBadge } from './brand-logo';
import { getBrowserLocale, getMessages } from '../lib/i18n';
import {
  ACTION_STATE_OPTIONS,
  PROOF_ASSET_STATUS_OPTIONS,
  MANAGER_CONVERSATION_STATUS_OPTIONS,
  buildExecutionSummary,
  buildDefaultWeekProgressEntry,
  getCompletedWeeks,
  getWeekNotes,
  getWeekProgressEntry,
  hydrateLegacyWeekProgress,
} from '../lib/progress-tracking';

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
  if (frame === 'stay and advance') return messages?.report?.stayAndAdvance || 'Stay and advance with AI';
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

function marketDemandBarValue(openings, maxOpenings) {
  if (!openings || !maxOpenings) return 0;
  return Math.round((Number(openings) / Number(maxOpenings)) * 100);
}

function marketDemandLabel(openings) {
  const count = Number(openings || 0);
  if (!count) return 'No close openings';
  if (count === 1) return '1 matched opening';
  return `${count} matched openings`;
}

function evidenceBarRows({ matchScore = 0, profileFit = 0, openings = 0, maxOpenings = 0 }) {
  return [
    {
      key: 'model-confidence',
      label: 'Model confidence',
      value: Number(matchScore || 0),
      tone: palette.navy,
      valueLabel: `${Number(matchScore || 0)}%`,
      helper: 'How strongly the model likes this pivot.',
    },
    {
      key: 'current-fit',
      label: 'Current fit',
      value: Number(profileFit || 0),
      tone: palette.teal,
      valueLabel: `${Number(profileFit || 0)}%`,
      helper: 'How much of the market signal you already cover.',
    },
    {
      key: 'market-demand',
      label: 'Market demand',
      value: marketDemandBarValue(openings, maxOpenings),
      tone: palette.orange,
      valueLabel: marketDemandLabel(openings),
      helper: 'Relative demand within this chart, not an overall sitewide score.',
    },
  ];
}

const affiliateLearningProviders = ['Coursera', 'Udemy', 'edX', 'DataCamp', 'Pluralsight', 'Skillshare'];
const trustedLearningProviders = [
  'Anthropic',
  'Anthropic Academy',
  'Atlassian University',
  'AWS Skill Builder',
  'DeepLearning.AI',
  'Google Cloud Skills Boost',
  'Google Skillshop',
  'HubSpot Academy',
  'Ironclad',
  'Kaggle / Google',
  'Microsoft',
  'Microsoft Learn',
  'OpenAI',
  'OpenAI Academy',
  'Salesforce Trailhead',
];

function getLearningResourceBadges(skill) {
  const provider = String(skill?.resource_provider || '');
  const badges = [];

  if (skill?.resource_access) {
    badges.push({
      label: skill.resource_access === 'paid' ? 'Paid' : 'Free',
      tone: skill.resource_access === 'paid' ? 'paid' : 'free',
    });
  }

  if (affiliateLearningProviders.some((item) => provider.toLowerCase().includes(item.toLowerCase()))) {
    badges.push({ label: 'Affiliate partner', tone: 'affiliate' });
  } else if (trustedLearningProviders.some((item) => provider.toLowerCase().includes(item.toLowerCase()))) {
    badges.push({ label: 'Trusted vendor', tone: 'trusted' });
  }

  if (skill?.resource_verified) {
    badges.push({ label: 'Catalog-verified', tone: 'verified' });
  }

  if (skill?.resource_level) {
    badges.push({ label: skill.resource_level, tone: 'neutral' });
  }

  if (skill?.resource_duration_label) {
    badges.push({ label: skill.resource_duration_label, tone: 'neutral' });
  }

  return badges;
}

function resourceBadgeStyle(tone) {
  const styles = {
    affiliate: { color: palette.textSoft },
    free: { color: palette.textSoft },
    paid: { color: palette.textSoft },
    trusted: { color: palette.textSoft },
    verified: { color: palette.textSoft },
    neutral: { color: palette.textSoft },
  };

  return styles[tone] || styles.neutral;
}

function skillPriorityColor(priority, fallback = palette.orange) {
  if (priority === 'critical') return '#FF8F4D';
  if (priority === 'medium') return '#A7602E';
  if (priority === 'low') return '#1B6F63';
  return fallback;
}

function LearningResourceBadges({ skill }) {
  const badges = getLearningResourceBadges(skill);
  if (!badges.length) return null;

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      {badges.map((badge) => {
        const style = resourceBadgeStyle(badge.tone);
        return (
          <span key={`${badge.label}-${badge.tone}`} style={{ color: style.color, fontSize: '11px', fontWeight: 750, letterSpacing: '0.02em' }}>
            {badge.label}
          </span>
        );
      }).reduce((items, item, index) => (
        index === 0 ? [item] : [...items, <span key={`separator-${index}`} style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>, item]
      ), [])}
    </div>
  );
}

function buildLearningPathSteps(skillGaps = []) {
  const withResources = (skillGaps || []).filter((skill) => skill?.resource_title && skill?.resource_url);
  if (!withResources.length) return [];

  const critical = withResources.find((skill) => skill.gap_priority === 'critical') || withResources[0];
  const proof = withResources.find((skill) => skill !== critical && /portfolio|proof|dashboard|workflow|prototype|build|artifact|case study/i.test([
    skill?.how_to_close_gap,
    skill?.skill_name,
    skill?.resource_title,
  ].join(' '))) || withResources.find((skill) => skill !== critical) || critical;
  const deeper = withResources.find((skill) => skill !== critical && skill !== proof && /intermediate|advanced|agent|automation|governance|strategy|specialization/i.test([
    skill?.resource_level,
    skill?.resource_title,
    skill?.skill_name,
  ].join(' '))) || withResources.find((skill) => skill !== critical && skill !== proof) || proof;

  return [
    { label: 'Start here', helper: 'Learn just enough to redesign one real workflow or decision.', skill: critical },
    { label: 'Build proof', helper: 'Turn that learning into a visible asset someone else can review in minutes.', skill: proof },
    { label: 'Go deeper', helper: 'Add depth only after the first artifact is already creating signal.', skill: deeper },
  ].filter((step, index, steps) => step.skill && steps.findIndex((item) => item.label === step.label && item.skill?.resource_title === step.skill?.resource_title) === index);
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

function SignalStatCard({ label, value, tone = palette.orange }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '18px',
        background: 'rgba(255,255,255,0.62)',
        border: `1px solid ${palette.border}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline', marginBottom: '8px' }}>
        <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ color: tone, fontSize: '21px', fontWeight: 900, letterSpacing: '-0.04em' }}>{value}</div>
      </div>
      <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(19, 27, 35, 0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.max(24, Math.min(92, parseInt(String(value), 10) || 56))}%`,
            height: '100%',
            borderRadius: '999px',
            background: tone,
          }}
        />
      </div>
    </div>
  );
}

function TaskExposureChart({ tasks = [] }) {
  const high = tasks.filter((item) => Number(item.risk_score || 0) >= 70).length;
  const medium = tasks.filter((item) => Number(item.risk_score || 0) >= 40 && Number(item.risk_score || 0) < 70).length;
  const low = tasks.filter((item) => Number(item.risk_score || 0) < 40).length;
  const total = Math.max(tasks.length, 1);
  const average = Math.round(tasks.reduce((sum, item) => sum + Number(item.risk_score || 0), 0) / total);
  const highDeg = (high / total) * 360;
  const mediumDeg = ((high + medium) / total) * 360;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(244,239,231,0.96))', border: `1px solid ${palette.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 0.55fr) minmax(0, 1fr)', gap: '22px', alignItems: 'center' }} className="two-col">
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <div
            style={{
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              background: `conic-gradient(#C86A2C 0deg ${highDeg}deg, #F28A43 ${highDeg}deg ${mediumDeg}deg, #1B6F63 ${mediumDeg}deg 360deg)`,
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(19,27,35,0.08), 0 24px 70px rgba(19,33,45,0.10)',
            }}
          >
            <div style={{ width: '118px', height: '118px', borderRadius: '50%', background: palette.cream, display: 'grid', placeItems: 'center', textAlign: 'center', border: `1px solid ${palette.border}` }}>
              <div>
                <div style={{ color: riskColor(average), fontSize: '34px', fontWeight: 950, letterSpacing: '-0.06em', lineHeight: 1 }}>{average}</div>
                <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>avg exposure</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ color: palette.orange, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Exposure mix</div>
          <div style={{ color: palette.text, fontSize: '28px', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1.02, marginBottom: '8px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            See the workload shape before reading the task list.
          </div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75, marginBottom: '16px' }}>
            The chart separates compressible work from the tasks that still carry human judgment, trust, and cross-functional context.
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              ['High exposure', high, '#C86A2C'],
              ['Medium exposure', medium, '#F28A43'],
              ['Low exposure', low, '#1B6F63'],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: palette.textMuted, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
                  <span>{label}</span>
                  <span style={{ color }}>{value} task{value === 1 ? '' : 's'}</span>
                </div>
                <div style={{ height: '9px', borderRadius: '999px', background: 'rgba(19,27,35,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(value ? 8 : 0, (value / total) * 100)}%`, height: '100%', background: color, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PivotMarketComparison({ pivots = [] }) {
  const rows = pivots.slice(0, 5);
  const maxOpenings = Math.max(...rows.map((pivot) => Number(pivot.live_market_signal?.matched_openings_count || 0)), 1);

  return (
    <div className="piq-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(244,239,231,0.96))', border: `1px solid ${palette.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'end', marginBottom: '18px' }}>
        <div>
          <div style={{ color: palette.teal, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Pivot evidence map</div>
          <div style={{ color: palette.text, fontSize: '26px', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1.05, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Compare confidence, current fit, and demand at a glance.
          </div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6, marginTop: '8px', maxWidth: '720px' }}>
            Longer bars are better. Model confidence and current fit are percentages. Market demand compares the visible pivots against each other, so a longer orange bar means stronger demand in this chart.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', color: palette.textSoft, fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span style={{ color: palette.navy }}>Model confidence</span>
          <span style={{ color: palette.teal }}>Current fit</span>
          <span style={{ color: palette.orange }}>Market demand</span>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '14px' }}>
        {rows.map((pivot, index) => {
          const openings = Number(pivot.live_market_signal?.matched_openings_count || 0);
          const profileFit = Number(pivot.live_market_signal?.profile_fit_score || 0);
          const matchScore = Number(pivot.match_score || 0);
          const evidenceRows = evidenceBarRows({ matchScore, profileFit, openings, maxOpenings });
          return (
            <div key={pivot.id || pivot.title} style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 0.72fr) minmax(0, 1fr)', gap: '14px', alignItems: 'center' }} className="two-col">
              <div>
                <div style={{ color: palette.text, fontSize: '14px', fontWeight: 900, lineHeight: 1.35 }}>{index + 1}. {pivot.title}</div>
                <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{openings ? marketDemandLabel(openings) : 'Model-led recommendation'}</div>
              </div>
              <div style={{ display: 'grid', gap: '7px' }}>
                {evidenceRows.map((item) => (
                  <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '108px minmax(0, 1fr) 110px', gap: '10px', alignItems: 'center' }}>
                    <span title={item.helper} style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>{item.label}</span>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(19,27,35,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(Number(item.value) ? 6 : 0, Math.min(100, Number(item.value) || 0))}%`, height: '100%', borderRadius: '999px', background: item.tone }} />
                    </div>
                    <span style={{ color: item.tone, fontSize: '12px', fontWeight: 900, textAlign: 'right' }}>{item.valueLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '14px', color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
        Longer is better. Orange bars show relative demand only among these pivots, while the other two bars are direct percentage scores.
      </div>
    </div>
  );
}

const roadmapPhaseCopy = [
  {
    label: 'Phase 1',
    title: 'Make the move legible',
    body: 'Clarify the target, translate your current experience, and choose the first proof thread.',
  },
  {
    label: 'Phase 2',
    title: 'Build visible proof',
    body: 'Turn skill gaps into artifacts, examples, and concrete signals a hiring manager can evaluate.',
  },
  {
    label: 'Phase 3',
    title: 'Convert into signal',
    body: 'Package the story, pressure-test it against the market, and make the move visible.',
  },
];

function getRoadmapPhases(milestoneStatuses = []) {
  const total = Math.max(milestoneStatuses.length, 1);

  return roadmapPhaseCopy.map((phase, phaseIndex) => {
    const startIndex = Math.floor((phaseIndex * total) / roadmapPhaseCopy.length);
    const endIndex = Math.floor(((phaseIndex + 1) * total) / roadmapPhaseCopy.length);
    const items = milestoneStatuses.slice(startIndex, endIndex);
    const completed = items.filter((item) => item.status === 'completed').length;
    const active = items.find((item) => item.status === 'current' || item.status === 'at_risk') || items[0];
    const proofCheckpoint = [...items].reverse().find((item) => item.week?.proof_of_completion)?.week?.proof_of_completion;

    return {
      ...phase,
      items,
      completed,
      active,
      proofCheckpoint,
      progress: Math.round((completed / Math.max(items.length, 1)) * 100),
    };
  });
}

function RoadmapJourneyMap({ phases = [], planColor, palette, messages, onWeekSelect }) {
  const hasWeeks = phases.some((phase) => phase.items.length);
  if (!hasWeeks) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '24px', background: `linear-gradient(135deg, ${planColor}10, rgba(255,255,255,0.94) 54%, rgba(244,239,231,0.96))`, border: `1px solid ${planColor}24`, boxShadow: '0 24px 60px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '18px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div style={{ color: planColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Roadmap journey map</div>
          <div style={{ color: palette.text, fontSize: '28px', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1.05, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Turn 12 weeks into three visible arcs.
          </div>
        </div>
        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, maxWidth: '360px' }}>
          Each phase ends with a proof checkpoint, so the plan reads like momentum instead of homework.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }} className="two-col">
        {phases.map((phase, phaseIndex) => {
          const phaseColor = phaseIndex === 0 ? planColor : phaseIndex === 1 ? palette.orange : palette.teal;
          return (
            <div key={phase.title} style={{ position: 'relative', overflow: 'hidden', borderRadius: '22px', padding: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${phaseColor}24` }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 12% 0%, ${phaseColor}18, transparent 32%)` }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: phaseColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{phase.label}</span>
                  <span style={{ color: phaseColor, background: `${phaseColor}12`, border: `1px solid ${phaseColor}24`, borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 900 }}>{phase.progress}%</span>
                </div>
                <div style={{ color: palette.text, fontSize: '18px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '7px' }}>{phase.title}</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '14px' }}>{phase.body}</div>

                <div style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(19,27,35,0.08)', marginBottom: '14px' }}>
                  <div style={{ width: `${phase.progress}%`, height: '100%', background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}AA)`, borderRadius: '999px' }} />
                </div>

                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {phase.items.map(({ week, status }) => {
                    const styles = statusStyles(status, phaseColor);
                    return (
                      <button
                        key={week.week_number}
                        type="button"
                        onClick={() => onWeekSelect?.(week.week_number)}
                        style={{
                          border: `1px solid ${styles.border}`,
                          background: styles.bg,
                          color: styles.fg,
                          borderRadius: '999px',
                          padding: '6px 9px',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        W{week.week_number}
                      </button>
                    );
                  })}
                </div>

                <div style={{ borderRadius: '16px', padding: '13px', background: `${phaseColor}0F`, border: `1px solid ${phaseColor}24` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: phaseColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <MonoIcon name="proof" tone="default" /> Proof checkpoint
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
                    {phase.proofCheckpoint || phase.active?.week?.success_signal || messages.report.proofOfCompletion}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function uniqCompact(items = []) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

function RecommendationWhyCard({ pivot, color, first30Days }) {
  if (!pivot?.title) return null;

  const signal = pivot.live_market_signal || {};
  const confidence = buildMarketConfidenceSummary(signal);
  const strengths = uniqCompact([
    ...(pivot.strengths_to_leverage || []),
    ...(signal.overlap_skills || []),
    ...(pivot.skill_gaps || []).map((skill) => skill.evidence_you_already_have).filter(Boolean),
  ]).slice(0, 3);
  const marketNeeds = uniqCompact([
    ...(signal.market_required_skills || []),
    ...(signal.market_tools || []),
    ...(pivot.skill_gaps || []).map((skill) => skill.skill_name),
  ]).slice(0, 4);
  const proofNeeds = uniqCompact([
    first30Days?.proof_asset?.title,
    ...(signal.market_proof_assets || []),
    ...(signal.missing_required_skills || []),
    ...(pivot.skill_gaps || []).filter((skill) => skill.gap_priority === 'critical').map((skill) => skill.skill_name),
  ]).slice(0, 4);
  const matchedOpenings = Number(signal.matched_openings_count || 0);
  const profileFit = Number(signal.profile_fit_score || 0);
  const matchScore = Number(pivot.match_score || 0);
  const evidenceRows = evidenceBarRows({ matchScore, profileFit, openings: matchedOpenings, maxOpenings: Math.max(matchedOpenings, 1) });

  const columns = [
    {
      label: 'You already signal',
      value: strengths.length || 'Some',
      body: strengths,
      empty: pivot.fit_summary || 'Your current role still contains transferable evidence for this path.',
      tone: palette.teal,
    },
    {
      label: 'The market asks for',
      value: matchedOpenings || 'Verify',
      body: marketNeeds,
      empty: 'Live evidence is still thin, so validate this title against postings before betting hard.',
      tone: palette.orange,
    },
    {
      label: 'Proof to build',
      value: proofNeeds.length || '1',
      body: proofNeeds,
      empty: 'Build one concrete artifact that makes the transition visible.',
      tone: color,
    },
  ];

  return (
    <div className="piq-card" style={{ marginTop: '18px', padding: '22px', background: `linear-gradient(135deg, rgba(255,255,255,0.88), ${color}0F 48%, rgba(244,239,231,0.96))`, border: `1px solid ${color}24`, boxShadow: '0 22px 54px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Why this recommendation?</div>
          <div style={{ color: palette.text, fontSize: '24px', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1.06, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {pivot.title} is the current best bet because three signals line up.
          </div>
        </div>
        <div style={{ maxWidth: '320px', padding: '12px 14px', borderRadius: '16px', background: `${color}10`, border: `1px solid ${color}26` }}>
          <div style={{ color, fontSize: '12px', fontWeight: 900, marginBottom: '4px' }}>{confidence.label}</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{confidence.body}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }} className="two-col">
        {columns.map((column) => (
          <div key={column.label} style={{ borderRadius: '18px', padding: '15px', background: 'rgba(255,255,255,0.74)', border: `1px solid ${column.tone}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: column.tone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{column.label}</div>
              <div style={{ color: column.tone, fontSize: '18px', fontWeight: 950, letterSpacing: '-0.04em' }}>{column.value}</div>
            </div>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {column.body.length
                ? column.body.map((item) => <MarketSkillPill key={item} label={item} tone={column.tone === palette.teal ? 'positive' : column.tone === palette.orange ? 'caution' : 'default'} />)
                : <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{column.empty}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }} className="three-col">
        {evidenceRows.map((item) => (
          <div key={item.key} style={{ display: 'grid', gap: '7px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: palette.textSoft, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>{item.label}</span>
              <span style={{ color: item.tone }}>{item.valueLabel}</span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(19,27,35,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(Number(item.value) ? 8 : 0, Math.min(100, Number(item.value) || 0))}%`, height: '100%', background: item.tone, borderRadius: '999px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
        Longer bars are better. Market demand here reflects relative evidence volume for this recommendation, not a universal score across every role.
      </div>
    </div>
  );
}

function RecommendationStackCard({ stack, pivotColor, stayColor = palette.teal }) {
  const cards = [
    stack?.primary ? { ...stack.primary, tone: stack.primary.type === 'stay' ? stayColor : pivotColor, primary: true } : null,
    stack?.conservative_backup ? { ...stack.conservative_backup, tone: palette.orange, primary: false } : null,
    stack?.stay_path ? { ...stack.stay_path, tone: stayColor, primary: false } : null,
  ]
    .filter(Boolean)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);

  if (!cards.length) return null;

  return (
    <div className="piq-card" style={{ marginTop: '-22px', marginBottom: '18px', padding: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(249,243,235,0.98))', boxShadow: '0 24px 54px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{ color: pivotColor, fontSize: '11px', fontWeight: 950, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>Decision brief</div>
          <h2 style={{ color: palette.text, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 950, letterSpacing: '-0.055em', lineHeight: 1.02, margin: '0 0 10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {stack?.decision_brief?.headline || 'Here is the clearest move from this report.'}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, margin: 0 }}>
            {stack?.decision_brief?.summary || stack?.decision_brief?.confidence_callout || 'The report is now prioritizing a narrower recommendation set so you can act with more confidence.'}
          </p>
        </div>
        {stack?.decision_brief?.primary_rule && (
          <div style={{ maxWidth: '280px', padding: '12px 14px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>How to use this report</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{stack.decision_brief.primary_rule}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {cards.map((item) => {
          const confidenceStyle = recommendationConfidenceStyle(item.confidence_state);
          return (
            <div
              key={`${item.slot_label}-${item.id}`}
              style={{
                padding: '18px',
                borderRadius: '22px',
                background: item.primary ? `${item.tone}10` : 'rgba(255,255,255,0.78)',
                border: `1px solid ${item.primary ? `${item.tone}2A` : palette.border}`,
                boxShadow: item.primary ? `0 18px 42px ${item.tone}18` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'start', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: item.tone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{item.slot_label}</div>
                  <div style={{ color: palette.text, fontSize: '19px', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em' }}>{item.title}</div>
                </div>
                <span style={{ padding: '6px 10px', borderRadius: '999px', background: confidenceStyle.bg, border: `1px solid ${confidenceStyle.border}`, color: confidenceStyle.color, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.confidence_label}
                </span>
              </div>

              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
                {item.why}
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Confidence read</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{item.confidence_reason}</div>
                </div>
                <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Evidence</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{item.market_evidence}</div>
                </div>
                <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Next step</div>
                    <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{item.next_step}</div>
                  </div>
                  <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Proof to build</div>
                    <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{item.proof_asset}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaidValueSummaryCard({ summary, pivot, color, emailStatus }) {
  if (!summary?.headline && !pivot?.title) return null;

  const items = [
    ['Recommended move', summary?.recommended_move || `Move toward ${pivot?.title || 'the strongest path'}`],
    ['Market evidence', summary?.market_evidence || pivot?.ranking_reason || 'Market evidence is still being validated.'],
    ['First proof asset', summary?.first_proof_asset || 'Build one visible proof asset.'],
    ['Start learning here', summary?.first_learning_step || 'Close the first skill gap before adding more courses.'],
  ];

  return (
    <div className="piq-card" style={{ marginBottom: '16px', padding: '24px', background: `linear-gradient(135deg, ${color}18 0%, rgba(255,255,255,0.94) 52%, rgba(255,249,242,0.94) 100%)`, border: `1px solid ${color}30`, boxShadow: '0 24px 58px rgba(19, 32, 42, 0.09)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 950, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>Your Best Move</div>
          <h2 style={{ color: palette.text, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 950, letterSpacing: '-0.055em', lineHeight: 1, margin: '0 0 10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {summary?.headline || `Your best move: ${pivot?.title || 'build visible proof'}`}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.75, margin: 0 }}>
            {summary?.why_this_move || pivot?.fit_summary || 'The paid plan turns the diagnosis into a concrete next move, skill sequence, and proof asset.'}
          </p>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${color}24`, minWidth: '190px' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>Confidence</div>
          <div style={{ color: palette.text, fontSize: '16px', fontWeight: 900 }}>{summary?.confidence_label || 'Market-informed'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {items.map(([label, value]) => (
          <div key={label} style={{ borderRadius: '18px', padding: '16px', background: 'rgba(255,255,255,0.74)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{value}</div>
          </div>
        ))}
      </div>

      {summary?.avoid && (
        <div style={{ marginTop: '14px', padding: '13px 15px', borderRadius: '16px', background: 'rgba(19, 32, 42, 0.06)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
          <strong style={{ color: palette.text }}>Avoid:</strong> {summary.avoid}
        </div>
      )}

      {emailStatus !== 'idle' && (
        <div style={{ marginTop: '12px', color: emailStatus === 'failed' ? '#8B4A1B' : palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
          {emailStatus === 'sent' && 'Action-plan email sent.'}
          {emailStatus === 'unavailable' && 'Action-plan email is configured for production; local demo mode skipped the real send.'}
          {emailStatus === 'failed' && 'Action-plan email could not be sent automatically. Your report is still saved here.'}
        </div>
      )}
    </div>
  );
}

function RoleOperatingSystemCard({ system, color }) {
  if (!system?.headline) return null;

  const sections = [
    ['Automate', system.automate || []],
    ['Augment', system.augment || []],
    ['Protect', system.protect || []],
    ['Lead', system.lead || []],
  ];

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.94) 58%)`, border: `1px solid ${color}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>How to work now</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{system.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '760px' }}>{system.summary}</p>
        </div>
        <span style={{ borderRadius: '999px', padding: '7px 12px', background: `${color}12`, border: `1px solid ${color}24`, color, fontSize: '12px', fontWeight: 900 }}>
          {system.weekly_time_budget || '3-5 focused hours'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {sections.map(([label, items]) => (
          <div key={label} style={{ padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {items.map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: `${color}0F`, border: `1px solid ${color}22` }}>
          <div style={{ color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Visible scope move</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{system.visible_scope_move}</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>First-week win</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{system.first_week_win}</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>What leadership should see</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{system.manager_read}</div>
        </div>
      </div>
    </div>
  );
}

function ProofAssetBuilderCard({ builder, color }) {
  if (!builder?.title) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, rgba(255,255,255,0.94), ${color}12)`, border: `1px solid ${color}26`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 950, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Proof Asset Builder</div>
          <h3 style={{ color: palette.text, fontSize: '24px', fontWeight: 950, letterSpacing: '-0.045em', margin: '0 0 6px' }}>{builder.title}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '760px' }}>{builder.objective}</p>
        </div>
        <span style={{ borderRadius: '999px', padding: '7px 12px', background: `${color}12`, border: `1px solid ${color}28`, color, fontSize: '12px', fontWeight: 900 }}>
          {builder.target_role || 'Target role'}
        </span>
      </div>

      {(builder.audience || builder.business_question) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
          {builder.audience && (
            <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
              <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Who this convinces</div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{builder.audience}</div>
            </div>
          )}
          {builder.business_question && (
            <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
              <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Business question to answer</div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{builder.business_question}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Artifact outline</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(builder.sections || []).map((section) => (
              <div key={section} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{section}</div>
            ))}
          </div>
        </div>
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Quality checklist</div>
          <div style={{ display: 'grid', gap: '9px', marginBottom: '14px' }}>
            {(builder.checklist || []).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 13px', borderRadius: '16px', background: `${color}10`, border: `1px solid ${color}22`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
            <strong style={{ color: palette.text }}>First 60 minutes:</strong> {builder.first_action}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '14px' }} className="two-col">
        {(builder.sample_metrics || []).length > 0 && (
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Metrics to show</div>
            <div style={{ display: 'grid', gap: '9px' }}>
              {(builder.sample_metrics || []).map((metric) => (
                <div key={metric} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{metric}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(builder.good_looks_like?.credible || builder.good_looks_like?.standout) && (
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>What good looks like</div>
            {builder.good_looks_like?.credible && (
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '10px' }}>
                <strong style={{ color: palette.text }}>Credible:</strong> {builder.good_looks_like.credible}
              </div>
            )}
            {builder.good_looks_like?.standout && (
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
                <strong style={{ color: palette.text }}>Standout:</strong> {builder.good_looks_like.standout}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '14px' }} className="two-col">
        {builder.internal_version && (
          <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0F`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Use this internally</div>
            <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>{builder.internal_version.title}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '10px' }}>{builder.internal_version.use_case}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(builder.internal_version.emphasis || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {builder.external_version && (
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Use this externally</div>
            <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>{builder.external_version.title}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '10px' }}>{builder.external_version.use_case}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(builder.external_version.emphasis || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(builder.common_mistakes || []).length > 0 && (
        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(19,32,42,0.06)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>Avoid these mistakes</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(builder.common_mistakes || []).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color: '#B45309', fontWeight: 900 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {builder.share_prompt && (
        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(19,32,42,0.06)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
          <strong style={{ color: palette.text }}>Use this in outreach:</strong> {builder.share_prompt}
        </div>
      )}
    </div>
  );
}

function AiLeveragePlaybookCard({ playbook, color }) {
  if (!playbook?.headline) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(140deg, ${color}10 0%, rgba(255,255,255,0.96) 58%)`, border: `1px solid ${color}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>AI leverage playbook</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{playbook.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '760px' }}>{playbook.operator_shift}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '14px' }}>
        {(playbook.plays || []).map((play, index) => (
          <div key={`${play.title}-${index}`} style={{ borderRadius: '22px', padding: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{ color: palette.text, fontSize: '17px', fontWeight: 900 }}>{play.title}</div>
              <span style={{ padding: '6px 10px', borderRadius: '999px', background: `${color}12`, border: `1px solid ${color}22`, color, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Play {index + 1}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }} className="two-col">
              <div>
                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Workflow to own</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{play.workflow}</div>
              </div>
              <div>
                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>How AI helps</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{play.ai_role}</div>
              </div>
              <div>
                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Human checkpoint</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{play.human_checkpoint}</div>
              </div>
              <div>
                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>What this changes</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{play.business_impact}</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '12px 13px', borderRadius: '16px', background: `${color}0E`, border: `1px solid ${color}20`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
              <strong style={{ color: palette.text }}>What to show leadership:</strong> {play.what_to_share}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>How to work now</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(playbook.weekly_operating_system || []).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Signals that make you promotable</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(playbook.promotion_signals || []).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionConversationPackCard({ pack, color }) {
  if (!pack?.meeting_goal) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,247,237,0.94))', border: `1px solid ${color}20`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Promotion conversation pack</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>Use your AI work to earn more scope</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '760px' }}>{pack.meeting_goal}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(280px, 0.95fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Talk track</div>
          <div style={{ display: 'grid', gap: '9px' }}>
            {(pack.talk_track || []).map((item, index) => (
              <div key={item} style={{ display: 'flex', gap: '10px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
                <span style={{ color, fontWeight: 950 }}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          {pack.manager_script && (
            <div style={{ marginTop: '12px', padding: '12px 13px', borderRadius: '16px', background: `${color}0F`, border: `1px solid ${color}22`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
              <strong style={{ color: palette.text }}>Open with this:</strong> {pack.manager_script}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Bring this evidence</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(pack.evidence_to_bring || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Make this ask</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '10px' }}>{pack.ask}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(pack.next_scope_options || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(pack.what_not_to_say || []).length > 0 && (
        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(19,32,42,0.06)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>What not to say</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(pack.what_not_to_say || []).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color: '#B45309', fontWeight: 900 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillGapCard({ skill, color, messages }) {
  const priorityColor = skillPriorityColor(skill.gap_priority, color);

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
          border: `1px solid ${priorityColor}4D`,
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
          <div style={{ color: 'rgba(244,239,231,0.72)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.currentLeverage}</div>
          <div style={{ color: '#F4EFE7', fontSize: '13px', lineHeight: 1.6 }}>{skill.current_strength}</div>
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
          background: priorityColor,
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

      <LearningResourceBadges skill={skill} />
      {skill.resource_provider && (
        <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
          {skill.resource_provider}{skill.resource_price_label ? ` · ${skill.resource_price_label}` : ''}
        </div>
      )}
    </div>
  );
}

function LearningPathCard({ path, color }) {
  const steps = buildLearningPathSteps(path?.skill_gaps || []);
  if (!steps.length) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.92) 58%, rgba(255,249,242,0.9) 100%)`, border: `1px solid ${color}28`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Learning path</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>The fastest credible learning sequence</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '720px' }}>
            Start with the highest-priority gap, turn it into proof, then go deeper only after you have a visible artifact.
          </p>
        </div>
        <span style={{ borderRadius: '999px', padding: '7px 12px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '12px', fontWeight: 850 }}>
          {steps.length} recommended steps
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {steps.map((step, index) => (
          <div key={`${step.label}-${step.skill.skill_name}`} style={{ position: 'relative', padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-18px', top: '-24px', color: `${color}14`, fontSize: '96px', fontWeight: 950, lineHeight: 1 }}>{index + 1}</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>{step.label}</span>
                <span style={{ color: skillPriorityColor(step.skill.gap_priority, color), fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{step.skill.gap_priority || 'skill'}</span>
              </div>
              <div style={{ color: palette.text, fontSize: '16px', fontWeight: 900, lineHeight: 1.25, marginBottom: '6px' }}>{step.skill.skill_name}</div>
              <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6, margin: '0 0 12px' }}>{step.helper}</p>
              <a href={step.skill.resource_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', color, fontSize: '13px', fontWeight: 850, textDecoration: 'none', marginBottom: '12px' }}>
                {step.skill.resource_title} →
              </a>
              <LearningResourceBadges skill={step.skill} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketSkillPill({ label, tone = 'default' }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,0.76)', border: 'rgba(19, 32, 42, 0.12)', color: palette.textMuted },
    positive: { bg: 'rgba(27,111,99,0.10)', border: 'rgba(27,111,99,0.18)', color: '#1B6F63' },
    caution: { bg: 'rgba(242,138,67,0.10)', border: 'rgba(242,138,67,0.18)', color: '#8B4A1B' },
    muted: { bg: 'rgba(19,32,42,0.06)', border: 'rgba(19,32,42,0.10)', color: palette.textSoft },
  };
  const style = tones[tone] || tones.default;

  return (
    <span
      style={{
        padding: '7px 10px',
        borderRadius: '999px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
  );
}

function recommendationConfidenceStyle(state) {
  if (state === 'market-backed') {
    return { bg: 'rgba(27,111,99,0.12)', border: 'rgba(27,111,99,0.24)', color: '#1B6F63' };
  }
  if (state === 'current-lane-advantage') {
    return { bg: 'rgba(15,122,110,0.12)', border: 'rgba(15,122,110,0.24)', color: '#0F766E' };
  }
  if (state === 'low-confidence') {
    return { bg: 'rgba(180,83,9,0.10)', border: 'rgba(180,83,9,0.20)', color: '#8B4A1B' };
  }
  return { bg: 'rgba(19,32,42,0.08)', border: 'rgba(19,32,42,0.14)', color: palette.textMuted };
}

function MarketMeter({ value, color, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline', marginBottom: '8px' }}>
        <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>{label}</div>
        <div style={{ color, fontSize: '20px', fontWeight: 900 }}>{clamped}%</div>
      </div>
      <div style={{ height: '8px', background: 'rgba(19, 27, 35, 0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ width: `${Math.max(clamped, clamped > 0 ? 10 : 0)}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${color}, ${color}BB)` }} />
      </div>
      <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>{sublabel}</div>
    </div>
  );
}

function buildMarketConfidenceSummary(signal) {
  const openings = Number(signal?.matched_openings_count || 0);
  const fitScore = Number(signal?.profile_fit_score || 0);
  const missingCount = signal?.missing_required_skills?.length || 0;
  const modelOnlyCount = signal?.model_only_skill_gaps?.length || 0;

  if (!openings) {
    return {
      label: 'Model-led, verify with postings',
      body: 'We did not find close live openings for this exact pivot title yet. Treat it as a plausible strategy, but validate the title and requirements before committing hard.',
    };
  }

  if (fitScore >= 45 && missingCount <= 3) {
    return {
      label: 'Market-backed and adjacent',
      body: `${openings} live opening${openings === 1 ? '' : 's'} matched this path, and the user already signals a meaningful share of the repeated requirements.`,
    };
  }

  if (openings >= 4) {
    return {
      label: 'Market-backed, proof needed',
      body: `${openings} live opening${openings === 1 ? '' : 's'} matched this path, but the user still needs visible proof for several repeated market requirements before the move feels strong.`,
    };
  }

  if (modelOnlyCount >= 3) {
    return {
      label: 'Thin market signal',
      body: 'A few postings matched, but several gaps still come mostly from the model. Use this as a validation sprint rather than a final bet.',
    };
  }

  return {
    label: 'Early market signal',
    body: `${openings} live opening${openings === 1 ? '' : 's'} matched this path. The evidence is useful, but the sample is still small.`,
  };
}

function MarketSignalCard({ signal, color, compact = false }) {
  if (!signal) return null;

  const overlapCount = signal.overlap_skills?.length || 0;
  const missingCount = signal.missing_required_skills?.length || 0;
  const modelOnlyCount = signal.model_only_skill_gaps?.length || 0;
  const maxDenominator = Math.max(overlapCount + missingCount + modelOnlyCount, 1);
  const overlapWidth = `${Math.max(8, (overlapCount / maxDenominator) * 100)}%`;
  const missingWidth = `${Math.max(missingCount ? 8 : 0, (missingCount / maxDenominator) * 100)}%`;
  const modelOnlyWidth = `${Math.max(modelOnlyCount ? 8 : 0, (modelOnlyCount / maxDenominator) * 100)}%`;
  const confidenceSummary = buildMarketConfidenceSummary(signal);

  if (compact) {
    return (
      <div style={{ marginTop: '14px', padding: '14px', borderRadius: '14px', background: `${color}0C`, border: `1px solid ${color}22` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Market reality check
          </div>
          <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800 }}>
            {signal.matched_openings_count || 0} live openings · {signal.profile_fit_score || 0}% fit
          </div>
        </div>
        <div style={{ height: '9px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(19, 27, 35, 0.08)', display: 'flex', marginBottom: '10px' }}>
          <div style={{ width: overlapWidth, background: '#1B6F63' }} />
          <div style={{ width: missingWidth, background: '#F28A43' }} />
          <div style={{ width: modelOnlyWidth, background: '#6D7A84' }} />
        </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
          {[
            ['Already signal', overlapCount],
            ['Missing from market', missingCount],
            ['Model-only gaps', modelOnlyCount],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
              <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
              <div style={{ color: palette.text, fontSize: '16px', fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
        {signal.ranking_reason && (
          <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Why it ranks here
            </div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>
              <strong style={{ color: palette.text }}>{confidenceSummary.label}.</strong> {confidenceSummary.body}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="piq-card" style={{ padding: '24px', background: `linear-gradient(180deg, ${color}0D, rgba(255,255,255,0.96))`, border: `1px solid ${color}22`, marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            Live market reality check
          </div>
          <div style={{ color: palette.text, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            {confidenceSummary.label}
          </div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
            {confidenceSummary.body}
          </div>
        </div>
        <div style={{ minWidth: '210px', padding: '16px 18px', borderRadius: '18px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            Sample size
          </div>
          <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{signal.matched_openings_count || 0}</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
            openings across {signal.sampled_companies_count || 0} companies
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }} className="two-col">
        <MarketMeter
          value={signal.profile_fit_score}
          color="#1B6F63"
          label="Profile fit vs live postings"
          sublabel="Higher means the user already signals more of the repeated required skills showing up in current openings."
        />
        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>Signal split</div>
          <div style={{ height: '12px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(19, 27, 35, 0.08)', display: 'flex', marginBottom: '10px' }}>
            <div style={{ width: overlapWidth, background: '#1B6F63' }} />
            <div style={{ width: missingWidth, background: '#F28A43' }} />
            <div style={{ width: modelOnlyWidth, background: '#6D7A84' }} />
          </div>
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={{ color: palette.textMuted, fontSize: '12px' }}><strong style={{ color: '#1B6F63' }}>{overlapCount}</strong> skills already signaled by the user</div>
            <div style={{ color: palette.textMuted, fontSize: '12px' }}><strong style={{ color: '#8B4A1B' }}>{missingCount}</strong> repeated market requirements still missing</div>
            <div style={{ color: palette.textMuted, fontSize: '12px' }}><strong style={{ color: palette.text }}>{modelOnlyCount}</strong> model-only gaps to treat as lower-confidence</div>
          </div>
        </div>
      </div>

      {signal.ranking_reason && (
        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}`, marginBottom: '16px' }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Why this pivot ranks here</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{signal.grounding_summary}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }} className="two-col">
        {[
          ['Skills you already signal', signal.overlap_skills || [], 'positive'],
          ['Repeated market gaps', signal.missing_required_skills || [], 'caution'],
          ['Model-only gaps', signal.model_only_skill_gaps || [], 'muted'],
        ].map(([label, items, tone]) => (
          <div key={label} style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>{label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {items.length ? items.slice(0, 8).map((item) => <MarketSkillPill key={item} label={item} tone={tone} />) : <div style={{ color: palette.textSoft, fontSize: '12px' }}>No strong signal yet.</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {[
          ['What live postings ask for', signal.market_required_skills || []],
          ['Common tools in postings', signal.market_tools || []],
          ['Proof assets implied by postings', signal.market_proof_assets || []],
        ].map(([label, items]) => (
          <div key={label} style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>{label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {items.length ? items.slice(0, 8).map((item) => <MarketSkillPill key={item} label={item} />) : <div style={{ color: palette.textSoft, fontSize: '12px' }}>Not stable enough yet.</div>}
            </div>
          </div>
        ))}
      </div>
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

function progressOptionLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value;
}

function updateWeekProgressState(map, weekNumber, patch) {
  const current = getWeekProgressEntry(map, weekNumber);
  return {
    ...map,
    [weekNumber]: {
      ...current,
      ...patch,
    },
  };
}

function ExecutionLoopCard({ summary, planColor, progressPercent }) {
  if (!summary) return null;

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: `linear-gradient(145deg, ${planColor}12 0%, rgba(255,255,255,0.94) 62%)`, border: `1px solid ${planColor}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <div style={{ color: planColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Next best action</div>
          <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '6px' }}>{summary.title}</div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, maxWidth: '760px' }}>{summary.body}</div>
        </div>
        <div style={{ display: 'grid', gap: '8px', minWidth: '220px' }}>
          <span style={{ padding: '7px 11px', borderRadius: '999px', background: `${planColor}12`, border: `1px solid ${planColor}22`, color: planColor, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', justifySelf: 'start' }}>
            {summary.statusLabel}
          </span>
          <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
            {summary.nextWeek ? `Week ${summary.nextWeek.week_number}` : 'Current roadmap'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) repeat(3, minmax(140px, 0.7fr))', gap: '12px' }} className="two-col">
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Why this matters now</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
            The report should keep turning into proof, conversation signal, and visible momentum instead of sitting as a static plan.
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Roadmap progress</div>
          <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900 }}>{progressPercent}%</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Proof assets ready</div>
          <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900 }}>{summary.proofReadyCount}</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Manager conversations</div>
          <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900 }}>{summary.managerDoneCount}</div>
        </div>
      </div>
    </div>
  );
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
  const messages = getMessages(payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale);
  const fullUnlocks = [
    'Market-grounded pivot ranking',
    'Proof asset builder',
    'Learning path + emailed action plan',
    '12-week roadmap',
  ];

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginTop: '16px' }} className="three-col">
              <SignalStatCard label={messages.report.riskScore} value={summary.overall_score} tone={color} />
              <SignalStatCard label={messages.report.tabs[0]} value={taskBreakdown.length} tone={palette.navy} />
              <SignalStatCard label={messages.report.tabs[1]} value={pivots.length} tone={palette.teal} />
            </div>
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
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
                {fullUnlocks.map((item) => (
                  <span key={item} style={{ borderRadius: '999px', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#F4EFE7', fontSize: '11px', fontWeight: 800 }}>
                    {item}
                  </span>
                ))}
              </div>
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
  const [selectedPlanPath, setSelectedPlanPath] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const [startDate, setStartDate] = useState(payload.startDate || '');
  const [weekProgressState, setWeekProgressState] = useState(
    hydrateLegacyWeekProgress(payload.completedWeeks || [], payload.weekNotes || {}, payload.weekProgress || {})
  );
  const [reportData, setReportData] = useState(payload.reportData);
  const [actionEmailStatus, setActionEmailStatus] = useState('idle');
  const [generationStatus, setGenerationStatus] = useState(
    payload.tier === 'full' && payload.reportData?.generation_stage !== 'full_complete' ? 'loading' : 'idle'
  );
  const profile = reportData.profile || {};
  const summary = reportData.summary || {};
  const pivots = reportData.pivots || [];
  const pivot = pivots[0] || {};
  const color = riskColor(summary.overall_score || 0);
  const pColor = getPivotColor(0) || '#6366F1';
  const interpretation = reportData.interpretation || {};
  const decision = reportData.decision || {};
  const careerRoi = reportData.career_roi || {};
  const stayAndAdvance = reportData.stay_and_advance || {};
  const stayPath = reportData.stay_path || null;
  const first30Days = reportData.first_30_days || {};
  const paidValueSummary = reportData.paid_value_summary || {};
  const recommendationStack = reportData.recommendation_stack || {};
  const proofAssetBuilder = reportData.proof_asset_builder || {};
  const stayProofAssetBuilder = reportData.stay_proof_asset_builder || {};
  const aiLeveragePlaybook = stayAndAdvance.ai_leverage_playbook || {};
  const roleOperatingSystem = stayAndAdvance.role_operating_system || {};
  const promotionConversationPack = stayAndAdvance.promotion_conversation_pack || {};
  const storageScope = useMemo(() => getStorageScope(reportData, payload.reportId), [reportData, payload.reportId]);
  const messages = getMessages(payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale);
  const completedWeeks = useMemo(() => getCompletedWeeks(weekProgressState), [weekProgressState]);
  const weekNotes = useMemo(() => getWeekNotes(weekProgressState), [weekProgressState]);
  const reportPaths = useMemo(() => (tier === 'full' && stayPath ? [stayPath, ...pivots] : pivots), [tier, stayPath, pivots]);
  const activePath = reportPaths[selectedPlanPath] || reportPaths[0] || pivot || {};
  const isStayPlan = tier === 'full' && Boolean(stayPath) && selectedPlanPath === 0;
  const planColor = isStayPlan ? palette.teal : getPivotColor(Math.max(selectedPlanPath - (stayPath ? 1 : 0), 0)) || pColor;
  const activeMarketSignal = activePath.live_market_signal || null;

  useEffect(() => {
    setReportData(payload.reportData);
    setWeekProgressState(hydrateLegacyWeekProgress(payload.completedWeeks || [], payload.weekNotes || {}, payload.weekProgress || {}));
    setStartDate(payload.startDate || '');
    if (payload.tier === 'full' && payload.reportData?.generation_stage !== 'full_complete') {
      setGenerationStatus('loading');
    } else {
      setGenerationStatus('idle');
    }
  }, [payload.reportData, payload.tier]);

  useEffect(() => {
    if (!reportPaths.length) return;
    if (selectedPlanPath > reportPaths.length - 1) {
      setSelectedPlanPath(0);
    }
  }, [reportPaths, selectedPlanPath]);

  useEffect(() => {
    const storedTier = payload.tier || localStorage.getItem('pivotiq_tier') || 'free';
    setTier(storedTier);

    const rawProgress = localStorage.getItem(`pivotiq_progress_${storageScope}`);
    if (rawProgress) {
      try {
        const parsed = JSON.parse(rawProgress);
        if (parsed.startDate) setStartDate(parsed.startDate);
        setWeekProgressState(hydrateLegacyWeekProgress(parsed.completedWeeks || [], parsed.weekNotes || {}, parsed.weekProgress || {}));
      } catch {}
    }
  }, [payload.tier, storageScope]);

  useEffect(() => {
    localStorage.setItem(`pivotiq_progress_${storageScope}`, JSON.stringify({
      startDate,
      completedWeeks,
      weekNotes,
      weekProgress: weekProgressState,
    }));
  }, [storageScope, startDate, completedWeeks, weekNotes, weekProgressState]);

  useEffect(() => {
    if (embedded || tier !== 'full' || reportData?.generation_stage === 'full_complete') return;

    let cancelled = false;

    async function upgradeToFullReport() {
      setGenerationStatus('loading');

      try {
        let response;

        if (payload.reportId) {
          response = await fetch(`/api/reports/${payload.reportId}/generate-full`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          response = await fetch('/api/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stage: 'full',
              locale: payload.locale || reportData.locale || 'en',
              jobTitle: payload.jobTitle || profile.job_title,
              industry: payload.industry || profile.industry,
              tasks: payload.tasks || profile.tasks || [],
              email: payload.email || '',
              intakeProfile: payload.intakeProfile || reportData.profile || {},
            }),
          });
        }

        const json = await response.json();
        if (!response.ok || !json.reportData) {
          throw new Error(json.error || 'Failed to generate the full report.');
        }

        if (cancelled) return;

        setReportData(json.reportData);
        setGenerationStatus('done');

        const raw = sessionStorage.getItem('pivotiq_report') || localStorage.getItem('pivotiq_report');
        if (raw) {
          try {
            const stored = JSON.parse(raw);
            const next = JSON.stringify({
              ...stored,
              reportData: json.reportData,
              reportId: json.reportId || stored.reportId || payload.reportId || null,
            });
            sessionStorage.setItem('pivotiq_report', next);
            localStorage.setItem('pivotiq_report', next);
          } catch {}
        }
      } catch (error) {
        console.error('Full report upgrade failed:', error);
        if (!cancelled) setGenerationStatus('failed');
      }
    }

    upgradeToFullReport();

    return () => {
      cancelled = true;
    };
  }, [
    embedded,
    payload.email,
    payload.industry,
    payload.intakeProfile,
    payload.jobTitle,
    payload.locale,
    payload.reportId,
    payload.tasks,
    profile.industry,
    profile.job_title,
    profile.tasks,
    reportData?.generation_stage,
    tier,
  ]);

  useEffect(() => {
    if (embedded || tier !== 'full' || reportData?.generation_stage !== 'full_complete' || !payload.email) return;

    const emailKey = `pivotiq_action_email_sent_${payload.reportId || reportData.generated_at || 'latest'}`;
    if (localStorage.getItem(emailKey) || sessionStorage.getItem(emailKey)) return;
    sessionStorage.setItem(emailKey, 'pending');

    let cancelled = false;

    async function sendActionPlanEmail() {
      try {
        const response = await fetch('/api/send-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload.email,
            jobTitle: payload.jobTitle || profile.job_title,
            industry: payload.industry || profile.industry,
            tier: 'full',
            reportData,
          }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok || (!json.success && !json.demoMode)) {
          throw new Error(json.error || 'Action-plan email failed.');
        }
        if (!cancelled) {
          setActionEmailStatus(json.demoMode ? 'unavailable' : 'sent');
          localStorage.setItem(emailKey, '1');
          sessionStorage.setItem(emailKey, '1');
        }
      } catch (error) {
        sessionStorage.removeItem(emailKey);
        if (!cancelled) setActionEmailStatus('failed');
        console.warn('Action-plan email was not sent:', error);
      }
    }

    sendActionPlanEmail();

    return () => {
      cancelled = true;
    };
  }, [
    embedded,
    payload.email,
    payload.industry,
    payload.jobTitle,
    payload.reportId,
    profile.industry,
    profile.job_title,
    reportData,
    reportData?.generation_stage,
    tier,
  ]);

  const milestoneStatuses = useMemo(() => {
    return (activePath.roadmap?.weeks || []).map((week, index) => ({
      week,
      status: getMilestoneStatus({ week, index, startDate, completedWeeks }),
    }));
  }, [activePath, startDate, completedWeeks]);

  const currentFocus = milestoneStatuses.find((item) => item.status === 'current')
    || milestoneStatuses.find((item) => item.status === 'at_risk')
    || milestoneStatuses.find((item) => item.status === 'upcoming')
    || milestoneStatuses[milestoneStatuses.length - 1];

  const roadmapPhases = useMemo(() => getRoadmapPhases(milestoneStatuses), [milestoneStatuses]);

  const skillGapCounts = useMemo(() => {
    return (activePath.skill_gaps || []).reduce((acc, skill) => {
      acc[skill.gap_priority] = (acc[skill.gap_priority] || 0) + 1;
      return acc;
    }, { critical: 0, medium: 0, low: 0 });
  }, [activePath]);

  if (tier === 'full' && reportData?.generation_stage !== 'full_complete') {
    return (
      <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 10%, rgba(27, 111, 99, 0.14), transparent 28%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '560px', borderRadius: '32px', padding: '34px 30px', background: 'rgba(255, 255, 255, 0.82)', border: `1px solid ${palette.border}`, boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 28px', animation: 'pulse-ring 1.5s ease-in-out infinite', display: 'grid', placeItems: 'center' }}>
            <BrandMarkBadge size={96} />
          </div>
          <h2 style={{ color: palette.text, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.98, margin: '0 0 10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {generationStatus === 'failed' ? 'Your full report hit a snag.' : 'Building your full pivot map'}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.72, margin: 0 }}>
            {generationStatus === 'failed'
              ? 'We unlocked your report, but the deeper generation did not finish cleanly. Refresh this page to retry.'
              : 'You already paid. We are now generating the full 5-path report, detailed skill gaps, ROI logic, and milestone plan.'}
          </p>
        </div>
      </div>
    );
  }

  const completedCount = completedWeeks.filter((weekNumber) => (activePath.roadmap?.weeks || []).some((week) => week.week_number === weekNumber)).length;
  const progressPercent = Math.round((completedCount / Math.max(activePath.roadmap?.weeks?.length || 1, 1)) * 100);
  const executionSummary = buildExecutionSummary({
    roadmapWeeks: activePath.roadmap?.weeks || [],
    weekProgressMap: weekProgressState,
    startDate,
  });

  const toggleExpandedWeek = (weekNumber) => {
    setExpandedWeeks((prev) => (
      prev.includes(weekNumber)
        ? prev.filter((value) => value !== weekNumber)
        : [...prev, weekNumber]
    ));
  };

  const toggleWeekComplete = async (weekNumber) => {
    const current = getWeekProgressEntry(weekProgressState, weekNumber);
    const completed = !current.completed;
    setWeekProgressState((prev) => updateWeekProgressState(prev, weekNumber, {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }));
    await syncProgress(payload.reportId, {
      start_date: startDate || null,
      week_number: weekNumber,
      completed,
      notes: current.notes || '',
      action_state: current.action_state,
      proof_asset_status: current.proof_asset_status,
      manager_conversation_status: current.manager_conversation_status,
      last_active_step: current.last_active_step,
    });
  };

  const saveStartDate = async (value) => {
    setStartDate(value);
    await syncProgress(payload.reportId, { start_date: value || null });
  };

  const saveWeekNote = async (weekNumber, note) => {
    const current = getWeekProgressEntry(weekProgressState, weekNumber);
    setWeekProgressState((prev) => updateWeekProgressState(prev, weekNumber, { notes: note }));
    await syncProgress(payload.reportId, {
      start_date: startDate || null,
      week_number: weekNumber,
      completed: current.completed,
      notes: note,
      action_state: current.action_state,
      proof_asset_status: current.proof_asset_status,
      manager_conversation_status: current.manager_conversation_status,
      last_active_step: current.last_active_step,
    });
  };

  const saveWeekProgressField = async (weekNumber, patch) => {
    const current = getWeekProgressEntry(weekProgressState, weekNumber);
    const nextEntry = {
      ...current,
      ...patch,
    };
    setWeekProgressState((prev) => updateWeekProgressState(prev, weekNumber, patch));
    await syncProgress(payload.reportId, {
      start_date: startDate || null,
      week_number: weekNumber,
      completed: nextEntry.completed,
      notes: nextEntry.notes || '',
      action_state: nextEntry.action_state,
      proof_asset_status: nextEntry.proof_asset_status,
      manager_conversation_status: nextEntry.manager_conversation_status,
      last_active_step: nextEntry.last_active_step,
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginTop: '16px' }} className="three-col">
              <SignalStatCard label={messages.report.riskScore} value={summary.overall_score || 0} tone={color} />
              <SignalStatCard label={messages.report.skillGapMap} value={(pivot.skill_gaps || []).length} tone={pColor} />
              <SignalStatCard label={messages.report.week} value={pivot.roadmap?.weeks?.length || 0} tone={palette.teal} />
            </div>
            {tier === 'full' && <RecommendationWhyCard pivot={pivot} color={pColor} first30Days={first30Days} />}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {tier === 'full' && (
          <RecommendationStackCard stack={recommendationStack} pivotColor={pColor} stayColor={palette.teal} />
        )}

        {tier === 'full' && (
          <div className="piq-card" style={{ marginBottom: '18px', padding: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(249,243,235,0.98))' }}>
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
            <PaidValueSummaryCard summary={paidValueSummary} pivot={pivot} color={pColor} emailStatus={actionEmailStatus} />
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
                    {messages.report.strategicRead}
                  </div>
                  <div style={{ color: palette.text, fontSize: '28px', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: '10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                    {messages.report.strategicReadTitle}
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.8 }}>
                    {messages.report.strategicReadBody}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    [messages.report.whatWeakensFirst, summary.narrative],
                    [messages.report.whatStillCompounds, interpretation.durable_advantages?.[0] || summary.what_this_means],
                    [messages.report.whyThisPathWinsNow, pivot.why_this_path_wins || pivot.outcome || pivot.fit_summary],
                    [messages.report.whatToDoThisWeek, reportData.next_move?.explanation || messages.report.defaultWeeklyMove],
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
            <TaskExposureChart tasks={reportData.task_breakdown || []} />
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
            {tier === 'full' && <PivotMarketComparison pivots={pivots} />}
            {tier === 'full' && stayPath && (
              <div
                className="piq-card piq-card-clickable"
                onClick={() => {
                  setSelectedPlanPath(0);
                  setActiveTab('plan');
                }}
                style={{ padding: '24px', border: `1px solid ${palette.teal}33`, background: 'linear-gradient(180deg, rgba(27,111,99,0.08), rgba(255,255,255,0.92))' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(27,111,99,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MonoIcon name="decision" tone="teal" size={40} />
                  </div>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,99,0.12)', border: '1px solid rgba(27,111,99,0.24)', color: palette.teal, borderRadius: '999px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      {messages.report.stayAndAdvance}
                    </div>
                    <div style={{ color: palette.text, fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{stayPath.title}</div>
                    <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>{stayAndAdvance.recommendation || stayPath.fit_summary}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: palette.teal, fontSize: '28px', fontWeight: 900 }}>{stayPath.match_score}%</div>
                    <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{messages.report.match}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                  {[
                    [messages.report.promotionPath, stayAndAdvance.promotion_path?.next_title || stayPath.title],
                    [messages.report.pivotStats[2], stayPath.transition_time],
                    [messages.report.advance30DayLabels[2], stayAndAdvance.thirty_day_plan?.metric_to_move],
                    [messages.report.proofAssetToShip, stayAndAdvance.thirty_day_plan?.proof_asset?.title],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
                      <div style={{ color: palette.textSoft, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 700 }}>{label}</div>
                      <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="two-col">
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.leverageOpportunities}</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(stayAndAdvance.leverage_opportunities || []).slice(0, 3).map((item) => (
                        <div key={item.title} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                          <strong style={{ color: palette.text }}>{item.title}:</strong> {item.ai_shift}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(27,111,99,0.08)', border: '1px solid rgba(27,111,99,0.18)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ color: palette.teal, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.workRedesign}</div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {[
                        ...(stayAndAdvance.work_redesign?.automate || []),
                        ...(stayAndAdvance.work_redesign?.augment || []),
                        ...(stayAndAdvance.work_redesign?.lead || []),
                      ].slice(0, 4).map((item) => (
                        <div key={item} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {pivots.map((item, index) => {
              const itemColor = getPivotColor(index) || '#6366F1';
              const criticalCount = item.skill_gaps?.filter((skill) => skill.gap_priority === 'critical').length || 0;
              return (
                <div
                  key={item.id}
                  className="piq-card piq-card-clickable"
                  onClick={() => {
                    setSelectedPlanPath(stayPath && tier === 'full' ? index + 1 : index);
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

                  {item.live_market_signal && <MarketSignalCard signal={item.live_market_signal} color={itemColor} compact />}

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
              {reportPaths.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedPlanPath(index)}
                  className="chip"
                  style={{
                    background: selectedPlanPath === index ? `${index === 0 && stayPath ? palette.teal : getPivotColor(Math.max(index - (stayPath ? 1 : 0), 0))}20` : 'var(--bg-card)',
                    color: selectedPlanPath === index ? (index === 0 && stayPath ? palette.teal : getPivotColor(Math.max(index - (stayPath ? 1 : 0), 0))) : 'var(--text-muted)',
                    outline: selectedPlanPath === index ? `1.5px solid ${index === 0 && stayPath ? palette.teal : getPivotColor(Math.max(index - (stayPath ? 1 : 0), 0))}` : '1.5px solid var(--border)',
                  }}
                >
                  {index === 0 && stayPath ? 'AI' : getPivotIcon(Math.max(index - (stayPath ? 1 : 0), 0))} {item.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: '18px', marginBottom: '24px' }} className="two-col">
              <div className="piq-card" style={{ padding: '24px', background: `linear-gradient(160deg, ${planColor}12 0%, rgba(255, 255, 255, 0.94) 62%)`, border: `1px solid ${planColor}24`, boxShadow: '0 24px 50px rgba(19, 32, 42, 0.08)' }}>
                <div style={{ color: planColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{messages.report.currentFocus}</div>
                <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{currentFocus?.week?.title || activePath.title}</h2>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75, marginBottom: '14px' }}>{currentFocus?.week?.goal || activePath.fit_summary}</p>
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
                      <span style={{ padding: '8px 12px', borderRadius: '999px', background: `${statusStyles(currentFocus.status, planColor).bg}`, border: `1px solid ${statusStyles(currentFocus.status, planColor).border}`, color: statusStyles(currentFocus.status, planColor).fg, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
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
                <div style={{ color: palette.textSoft, fontSize: '13px', marginBottom: '14px' }}>{completedCount} of {activePath.roadmap?.weeks?.length || 0} milestones completed</div>
                <div style={{ height: '10px', background: 'var(--bg)', borderRadius: '999px', overflow: 'hidden', marginBottom: '18px' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, ${planColor}, ${planColor}AA)` }} />
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

            <RoadmapJourneyMap
              phases={roadmapPhases}
              planColor={planColor}
              palette={palette}
              messages={messages}
              onWeekSelect={(weekNumber) => setExpandedWeeks((prev) => (prev.includes(weekNumber) ? prev : [...prev, weekNumber]))}
            />

            <div style={{ marginBottom: '28px' }}>
              <ExecutionLoopCard summary={executionSummary} planColor={planColor} progressPercent={progressPercent} />
              {activeMarketSignal && <MarketSignalCard signal={activeMarketSignal} color={planColor} />}
              {!activeMarketSignal && isStayPlan && (
                <div className="piq-card" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(180deg, rgba(27,111,99,0.08), rgba(255,255,255,0.92))', border: `1px solid ${palette.teal}22` }}>
                  <div style={{ color: palette.teal, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Market reality check
                  </div>
                  <div style={{ color: palette.text, fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                    Stay-and-advance is still strategy-led
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
                    We currently ground adjacent pivot roles against live openings. The stay path is still generated from your current-role leverage, redesign opportunities, and AI adoption logic rather than external hiring-market samples.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>{messages.report.skillGapMap}</div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
                    {skillGapCounts.critical} critical gaps, {skillGapCounts.medium} medium gaps, {skillGapCounts.low} lower-priority gaps. Build order is designed to make this path credible as fast as possible.
                  </div>
                </div>
              </div>
              {isStayPlan && <RoleOperatingSystemCard system={roleOperatingSystem} color={planColor} />}
              {isStayPlan && <AiLeveragePlaybookCard playbook={aiLeveragePlaybook} color={planColor} />}
              <ProofAssetBuilderCard builder={isStayPlan ? stayProofAssetBuilder : proofAssetBuilder} color={planColor} />
              {isStayPlan && <PromotionConversationPackCard pack={promotionConversationPack} color={planColor} />}
              <LearningPathCard path={activePath} color={planColor} />
              <div style={{ display: 'grid', gap: '14px' }}>
                {(activePath.skill_gaps || []).map((skill) => (
                  <SkillGapCard key={`${activePath.id}-${skill.skill_name}`} skill={skill} color={planColor} messages={messages} />
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
                const styles = statusStyles(status, planColor);
                const note = weekNotes[week.week_number] || '';
                const progressEntry = getWeekProgressEntry(weekProgressState, week.week_number);

                return (
                  <div key={`${activePath.id}-week-${week.week_number}`} className="piq-card" style={{ padding: '20px', border: `1px solid ${styles.border}` }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="two-col">
                              <label style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>Execution stage</span>
                                <select
                                  className="piq-input"
                                  value={progressEntry.action_state}
                                  onChange={(event) => saveWeekProgressField(week.week_number, { action_state: event.target.value })}
                                >
                                  {ACTION_STATE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              </label>
                              <label style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>Proof asset</span>
                                <select
                                  className="piq-input"
                                  value={progressEntry.proof_asset_status}
                                  onChange={(event) => saveWeekProgressField(week.week_number, { proof_asset_status: event.target.value })}
                                >
                                  {PROOF_ASSET_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              </label>
                              <label style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>Manager conversation</span>
                                <select
                                  className="piq-input"
                                  value={progressEntry.manager_conversation_status}
                                  onChange={(event) => saveWeekProgressField(week.week_number, { manager_conversation_status: event.target.value })}
                                >
                                  {MANAGER_CONVERSATION_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              </label>
                              <div style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>Milestone read</span>
                                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>
                                  {progressOptionLabel(ACTION_STATE_OPTIONS, progressEntry.action_state)} · {progressOptionLabel(PROOF_ASSET_STATUS_OPTIONS, progressEntry.proof_asset_status)} · {progressOptionLabel(MANAGER_CONVERSATION_STATUS_OPTIONS, progressEntry.manager_conversation_status)}
                                </div>
                              </div>
                            </div>

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
                                    <div style={{ width: '22px', height: '22px', borderRadius: '8px', background: `${planColor}18`, color: planColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{actionIndex + 1}</div>
                                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{action}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                              <div style={{ background: `${planColor}10`, border: `1px solid ${planColor}22`, borderRadius: '14px', padding: '14px' }}>
                                <div style={{ color: planColor, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.successSignal}</div>
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
                              <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Last active step</div>
                              <input
                                className="piq-input"
                                placeholder="Write the one concrete step you last took here..."
                                value={progressEntry.last_active_step}
                                onChange={(event) => setWeekProgressState((prev) => updateWeekProgressState(prev, week.week_number, { last_active_step: event.target.value }))}
                                onBlur={(event) => saveWeekProgressField(week.week_number, { last_active_step: event.target.value })}
                              />
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
