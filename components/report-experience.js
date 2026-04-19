'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BrandLogo, BrandMarkBadge } from './brand-logo';
import { getBrowserLocale, getMessages } from '../lib/i18n';
import {
  TRACTION_STATUS_OPTIONS,
  USEFULNESS_RATING_OPTIONS,
  buildOutcomeFollowupState,
  buildOutcomeSummary,
  normalizeOutcomeEntry,
} from '../lib/outcome-tracking';
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
import { buildProgressRefreshContext } from '../lib/report-refresh';

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

function compactCopy(text, maxLength = 140) {
  if (!text) return '';
  const normalized = String(text).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength);
  const breakIndex = Math.max(sliced.lastIndexOf('. '), sliced.lastIndexOf('; '), sliced.lastIndexOf(', '), sliced.lastIndexOf(' '));
  return `${sliced.slice(0, breakIndex > 60 ? breakIndex : maxLength).trim()}...`;
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

function gapShape(priority = 'medium') {
  if (priority === 'critical') {
    return { currentSegments: 2, targetSegments: 5, label: 'Critical stretch', helper: 'Build this quickly before the path gets credible.' };
  }
  if (priority === 'low') {
    return { currentSegments: 4, targetSegments: 5, label: 'Fine-tune', helper: 'You already have signal here. Tighten it and move on.' };
  }
  return { currentSegments: 3, targetSegments: 5, label: 'Meaningful stretch', helper: 'You have a base. Now make it visible and repeatable.' };
}

function normalizeReportTab(tab = '') {
  const value = String(tab || '').toLowerCase().trim();
  if (value === 'paths') return 'pivots';
  if (['breakdown', 'stay', 'pivots', 'plan'].includes(value)) return value;
  return 'breakdown';
}

function pathSignalLabel(item, decisionLabel) {
  if (!item) return 'Not selected';
  if (item.kind === 'stay') return 'Current-lane leverage';
  const openings = Number(item.live_market_signal?.matched_openings_count || 0);
  if (openings) return marketDemandLabel(openings);
  return decisionLabel || 'Model-led direction';
}

function comparisonMetricRows(item, decisionLabel) {
  const skillGapCount = Array.isArray(item?.skill_gaps) ? item.skill_gaps.length : 0;
  return [
    {
      label: 'Confidence',
      value: decisionLabel || 'Current-lane advantage',
    },
    {
      label: 'Time to proof',
      value: item?.comparison_window || item?.transition_time || '3-9 months',
    },
    {
      label: 'Skill load',
      value: `${skillGapCount} focus ${skillGapCount === 1 ? 'area' : 'areas'}`,
    },
    {
      label: 'Signal',
      value: pathSignalLabel(item, decisionLabel),
    },
  ];
}

function StepMeter({ filled = 0, total = 5, tone = palette.orange, muted = 'rgba(19,27,35,0.08)' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`, gap: '6px' }}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          style={{
            height: '10px',
            borderRadius: '999px',
            background: index < filled ? tone : muted,
            boxShadow: index < filled ? `inset 0 0 0 1px ${tone}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function clampNumber(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function timeWindowScore(value = '') {
  const normalized = String(value || '').toLowerCase();
  if (!normalized) return 52;
  if (/\bweek|\bweeks/.test(normalized)) return 88;
  if (/0-3 months|0–3 months|1-3 months|1–3 months|2-4 months|2–4 months|4-8 weeks|6-10 weeks/.test(normalized)) return 76;
  if (/3-6 months|3–6 months|3-9 months|3–9 months|4-6 months|4–6 months/.test(normalized)) return 62;
  if (/6-9 months|6–9 months|6-12 months|6–12 months|4-7 months|4–7 months/.test(normalized)) return 46;
  return 38;
}

function skillLoadScore(skillGaps = []) {
  const critical = skillGaps.filter((skill) => skill?.gap_priority === 'critical').length;
  const medium = skillGaps.filter((skill) => skill?.gap_priority === 'medium').length;
  const low = skillGaps.filter((skill) => skill?.gap_priority === 'low').length;
  return clampNumber(100 - critical * 22 - medium * 14 - low * 8, 16, 92);
}

function demandComparisonScore(item, maxOpenings) {
  const openings = Number(item?.live_market_signal?.matched_openings_count || 0);
  if (openings && maxOpenings) return clampNumber(Math.round((openings / maxOpenings) * 100), 14, 100);
  if (item?.kind === 'stay') return 64;
  return clampNumber((item?.match_score || 0) - 8, 24, 82);
}

function decisionCardLabel(item) {
  if (item?.kind === 'stay') return 'Stay';
  if (item?.kind === 'backup') return 'Backup';
  return 'Primary';
}

function StaySectionHeader({ color, eyebrow, title, body }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{eyebrow}</div>
      <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, maxWidth: '760px' }}>{body}</div>
    </div>
  );
}

function PathDecisionMatrix({ stayPath, stayAndAdvance, bestPivot, backupPivot, messages }) {
  const decisionCards = [
    stayPath ? {
      id: `stay-${stayPath.id || stayPath.title}`,
      title: stayPath.title,
      kind: 'stay',
      accent: palette.teal,
      highlight: true,
      subtitle: compactCopy(stayAndAdvance?.recommendation || stayPath.fit_summary, 82),
      decisionLabel: messages.report.stayAndAdvance,
      comparison_window: stayAndAdvance?.promotion_path?.timeline || stayPath.transition_time || '3-9 months',
      skill_gaps: stayPath.skill_gaps || [],
      live_market_signal: stayPath.live_market_signal || null,
    } : null,
    bestPivot ? {
      ...bestPivot,
      id: `pivot-${bestPivot.id || bestPivot.title}`,
      kind: 'pivot',
      accent: palette.orange,
      subtitle: compactCopy(bestPivot.why_this_path_wins || bestPivot.fit_summary, 82),
      decisionLabel: decisionFrameLabel(bestPivot.decision_frame, messages),
    } : null,
    backupPivot ? {
      ...backupPivot,
      id: `backup-${backupPivot.id || backupPivot.title}`,
      kind: 'backup',
      accent: palette.navy,
      subtitle: compactCopy(backupPivot.who_this_is_for || backupPivot.fit_summary, 82),
      decisionLabel: decisionFrameLabel(backupPivot.decision_frame, messages),
    } : null,
  ]
    .filter(Boolean)
    .filter((item, index, list) => index === list.findIndex((candidate) => candidate.title === item.title));

  if (decisionCards.length < 2) return null;

  const maxOpenings = Math.max(...decisionCards.map((item) => Number(item?.live_market_signal?.matched_openings_count || 0)), 1);
  const tradeoffRows = [
    {
      label: 'Confidence',
      helper: 'How strongly PivotIQ can defend the move right now.',
      values: decisionCards.map((item) => ({
        score: clampNumber(item?.match_score || item?.live_market_signal?.profile_fit_score || 0),
        valueLabel: `${clampNumber(item?.match_score || item?.live_market_signal?.profile_fit_score || 0)}%`,
        tone: item.accent,
      })),
    },
    {
      label: 'Speed to proof',
      helper: 'Faster paths score higher because they become believable sooner.',
      values: decisionCards.map((item) => ({
        score: timeWindowScore(item?.comparison_window || item?.transition_time),
        valueLabel: item?.comparison_window || item?.transition_time || '3-9 months',
        tone: item.accent,
      })),
    },
    {
      label: 'Skill load',
      helper: 'Higher means fewer or lighter gaps to close before the path feels credible.',
      values: decisionCards.map((item) => ({
        score: skillLoadScore(item?.skill_gaps || []),
        valueLabel: `${(item?.skill_gaps || []).length} focus area${(item?.skill_gaps || []).length === 1 ? '' : 's'}`,
        tone: item.accent,
      })),
    },
    {
      label: 'Demand signal',
      helper: 'Compares visible market pull or, for stay paths, current-lane leverage.',
      values: decisionCards.map((item) => ({
        score: demandComparisonScore(item, maxOpenings),
        valueLabel: pathSignalLabel(item, item?.decisionLabel),
        tone: item.accent,
      })),
    },
  ];

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(244,239,231,0.92))', border: `1px solid ${palette.border}`, boxShadow: '0 20px 44px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <div style={{ color: palette.navy, fontSize: '11px', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '8px' }}>Decision matrix</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>See the safest move, the stretch move, and the backup at a glance.</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>
            Compare the current-lane option against the strongest pivot directions without reading through every paragraph first.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${decisionCards.length}, minmax(0, 1fr))`, gap: '10px', marginBottom: '12px' }} className="two-col">
        {decisionCards.map((item) => (
          <div key={`${item.id}-headline`} style={{ padding: '12px 14px', borderRadius: '16px', background: item.highlight ? `${item.accent}10` : 'rgba(255,255,255,0.8)', border: `1px solid ${item.highlight ? `${item.accent}24` : palette.border}` }}>
            <div style={{ color: item.accent, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {item.kind === 'stay' ? 'Best for safety' : item.kind === 'backup' ? 'Lower-risk alternate' : 'Stretch move'}
            </div>
            <div style={{ color: palette.text, fontSize: '14px', fontWeight: 900, lineHeight: 1.35, marginBottom: '4px' }}>{item.title}</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.5 }}>{item.subtitle}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
        {tradeoffRows.map((row) => (
          <div key={row.label} style={{ padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '10px' }}>
              <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>{row.label}</div>
              <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>{row.helper}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${decisionCards.length}, minmax(0, 1fr))`, gap: '10px' }} className="two-col">
              {row.values.map((value, index) => (
                <div key={`${row.label}-${decisionCards[index].id}`} style={{ padding: '10px 11px', borderRadius: '14px', background: index === 0 && decisionCards[index].highlight ? `${value.tone}0D` : 'rgba(244,239,231,0.6)', border: `1px solid ${index === 0 && decisionCards[index].highlight ? `${value.tone}22` : palette.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '7px' }}>
                    <span style={{ color: value.tone, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{decisionCardLabel(decisionCards[index])}</span>
                    <span style={{ color: palette.textMuted, fontSize: '11px', lineHeight: 1.4, textAlign: 'right' }}>{compactCopy(value.valueLabel, 36)}</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(19,27,35,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${value.score}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${value.tone}, ${value.tone}CC)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${decisionCards.length}, minmax(0, 1fr))`, gap: '12px' }} className="two-col">
        {decisionCards.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '18px',
              borderRadius: '22px',
              background: item.highlight ? `${item.accent}10` : 'rgba(255,255,255,0.82)',
              border: `1px solid ${item.highlight ? `${item.accent}28` : palette.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: item.accent, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {item.kind === 'stay' ? 'Stay path' : item.kind === 'backup' ? 'Backup path' : 'Primary pivot'}
              </span>
              <span style={{ padding: '5px 9px', borderRadius: '999px', background: 'rgba(255,255,255,0.84)', border: `1px solid ${palette.border}`, color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>
                {item.decisionLabel}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '10px' }}>
              {comparisonMetricRows(item, item.decisionLabel).map((row) => (
                <div key={row.label} style={{ padding: '10px 11px', borderRadius: '14px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{row.label}</div>
                  <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.45, fontWeight: 700 }}>{row.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 11px', borderRadius: '14px', background: item.highlight ? `${item.accent}0D` : 'rgba(19,32,42,0.04)', border: `1px solid ${item.highlight ? `${item.accent}22` : palette.border}` }}>
              <div style={{ color: item.highlight ? item.accent : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {item.kind === 'stay' ? 'Why this leads' : item.kind === 'backup' ? 'When to use this' : 'What you are betting on'}
              </div>
              <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>
                {item.kind === 'stay'
                  ? compactCopy(item.why || item.market_evidence || item.subtitle, 108)
                  : compactCopy(item.what_you_are_betting_on || item.why || item.subtitle, 108)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

function buildPersistedLearningPathSteps(path = null) {
  const steps = Array.isArray(path?.learning_path) ? path.learning_path : [];
  return steps
    .filter((step) => step?.resource_title && step?.resource_url)
    .map((step) => ({
      label: step.label || 'Step',
      helper: step.helper || 'Turn this into a visible output before moving deeper.',
      skill: step,
    }));
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

function RecommendationStackCard({
  stack,
  pivotColor,
  stayColor = palette.teal,
  decision = {},
  careerRoi = {},
  first30Days = {},
  stayAndAdvance = {},
  stayPath = null,
  bestPivot = null,
  summary = {},
  messages,
  emailStatus = 'idle',
}) {
  const cards = [
    stack?.primary ? { ...stack.primary, tone: stack.primary.type === 'stay' ? stayColor : pivotColor, primary: true } : null,
    stack?.conservative_backup ? { ...stack.conservative_backup, tone: palette.orange, primary: false } : null,
    stack?.stay_path ? { ...stack.stay_path, tone: stayColor, primary: false } : null,
  ]
    .filter(Boolean)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);

  const primaryCard = cards.find((item) => item.primary) || cards[0] || null;
  if (!primaryCard) return null;

  const primaryTone = primaryCard.tone;
  const primaryConfidenceStyle = recommendationConfidenceStyle(primaryCard.confidence_state);
  const primaryPath = primaryCard.type === 'stay'
    ? {
        ...(stayPath || {}),
        kind: 'stay',
        comparison_window: stayAndAdvance?.promotion_path?.timeline || stayPath?.transition_time || '3-9 months',
      }
    : (bestPivot || {});
  const primaryDecisionLabel = primaryCard.type === 'stay'
    ? (messages?.report?.stayAndAdvance || 'Stay and advance with AI')
    : decisionFrameLabel(primaryPath?.decision_frame || primaryCard.decision_frame, messages);
  const primaryMetrics = comparisonMetricRows(primaryPath, primaryDecisionLabel);
  const nextSevenDays = (
    primaryCard.type === 'stay'
      ? (Array.isArray(stayAndAdvance?.thirty_day_plan?.this_week) ? stayAndAdvance.thirty_day_plan.this_week : [])
      : (Array.isArray(first30Days?.next_7_days) ? first30Days.next_7_days : [])
  ).slice(0, 4);
  const sprintProofAsset = primaryCard.type === 'stay'
    ? stayAndAdvance?.thirty_day_plan?.proof_asset
    : first30Days?.proof_asset;
  const atGlanceRows = [
    ['Dominant move', primaryCard.title],
    ['Window', stayAndAdvance?.promotion_path?.timeline || primaryMetrics[1]?.value || '3-9 months'],
    ['First proof', sprintProofAsset?.title || primaryCard.proof_asset || 'Visible proof asset'],
    ['Confidence', primaryCard.confidence_label || primaryDecisionLabel],
  ];
  const followThroughChanges = primaryCard.type === 'stay'
    ? [
        {
          label: 'Role changes',
          value: 'Your current role becomes a stronger AI leverage lane.',
          body: stayAndAdvance?.recommendation || decision?.rationale || primaryCard.why,
        },
        {
          label: 'Proof changes',
          value: sprintProofAsset?.title || primaryCard.proof_asset || 'Internal AI leverage case',
          body: sprintProofAsset?.why_it_matters || sprintProofAsset?.description || 'Instead of sounding AI-aware, you build evidence that expands scope and promotion signal.',
        },
        {
          label: 'Trajectory changes',
          value: stayAndAdvance?.promotion_path?.timeline || primaryMetrics[1]?.value || '3-9 months',
          body: stayAndAdvance?.promotion_case?.core_message || summary?.what_this_means || 'The goal becomes broader scope, cleaner workflow ownership, and a stronger promotion case.',
        },
      ]
    : [
        {
          label: 'Focus changes',
          value: `You start building toward ${primaryCard.title}.`,
          body: decision?.rationale || primaryCard.why || 'The path gets narrower, which makes your effort compound faster.',
        },
        {
          label: 'Proof changes',
          value: sprintProofAsset?.title || primaryCard.proof_asset || `${primaryCard.title} proof asset`,
          body: sprintProofAsset?.why_it_matters || sprintProofAsset?.description || 'The move stops being theoretical once someone else can inspect the artifact.',
        },
        {
          label: 'Economics change',
          value: careerRoi?.salary_delta || careerRoi?.transition_time || primaryMetrics[1]?.value || 'Near-term upside gets clearer',
          body: careerRoi?.roi_read || summary?.what_this_means || 'You are trading broad exploration for a path with clearer proof, timing, and payoff.',
        },
      ];
  const decisionPanels = [
    stack?.decision_brief?.why_this_won
      ? {
          label: 'Why this wins now',
          color: primaryTone,
          body: stack.decision_brief.why_this_won,
        }
      : null,
    stack?.decision_brief?.not_yet_reason
      ? {
          label: stack?.decision_brief?.not_yet_title ? `Why not ${stack.decision_brief.not_yet_title} yet` : 'Why the flashier move lost',
          color: palette.textSoft,
          body: stack.decision_brief.not_yet_reason,
        }
      : null,
    stack?.decision_brief?.unlock_condition
      ? {
          label: 'What would change the answer',
          color: stayColor,
          body: stack.decision_brief.unlock_condition,
        }
      : null,
  ].filter(Boolean);

  return (
    <div
      className="piq-card"
      style={{
        marginTop: '-26px',
        marginBottom: '18px',
        padding: '26px',
        background: `linear-gradient(180deg, rgba(255,255,255,0.97), rgba(249,243,235,0.98) 34%, ${primaryTone}08 100%)`,
        border: `1px solid ${primaryTone}22`,
        boxShadow: '0 28px 70px rgba(19, 32, 42, 0.1)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.18fr) minmax(320px, 0.82fr)', gap: '18px', alignItems: 'start', marginBottom: '20px' }} className="two-col">
        <div>
          <div style={{ color: primaryTone, fontSize: '11px', fontWeight: 950, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>Executive summary</div>
          <h2 style={{ color: palette.text, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 950, letterSpacing: '-0.058em', lineHeight: 1.02, margin: '0 0 10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {stack?.decision_brief?.headline || 'Here is the clearest move from this report.'}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.8, margin: 0, maxWidth: '760px' }}>
            {stack?.decision_brief?.summary || stack?.decision_brief?.confidence_callout || 'The report is now prioritizing a narrower recommendation set so you can act with more confidence.'}
          </p>
        </div>
        <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.84)', border: `1px solid ${primaryTone}22`, boxShadow: '0 18px 36px rgba(19, 32, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: primaryTone, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>At a glance</div>
              <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.5 }}>The recommendation compressed into one operating brief.</div>
            </div>
            <span style={{ padding: '5px 9px', borderRadius: '999px', background: primaryConfidenceStyle.bg, border: `1px solid ${primaryConfidenceStyle.border}`, color: primaryConfidenceStyle.color, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {primaryDecisionLabel}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '9px', marginBottom: stack?.decision_brief?.primary_rule ? '12px' : '0' }} className="two-col">
            {atGlanceRows.map(([label, value], index) => (
              <div key={label} style={{ padding: '12px 13px', borderRadius: '16px', background: index === 0 ? `${primaryTone}0D` : 'rgba(244,239,231,0.62)', border: `1px solid ${index === 0 ? `${primaryTone}20` : palette.border}`, minHeight: '82px' }}>
                <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.5, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>
          {stack?.decision_brief?.primary_rule && (
            <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
              <div style={{ color: primaryTone, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>How to use this report</div>
              <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{stack.decision_brief.primary_rule}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)', gap: '16px', marginBottom: '16px' }} className="two-col">
        <div style={{ padding: '22px', borderRadius: '26px', background: `linear-gradient(160deg, ${primaryTone}16, rgba(255,255,255,0.92) 58%, rgba(255,249,242,0.88) 100%)`, border: `1px solid ${primaryTone}28`, boxShadow: `0 24px 56px ${primaryTone}18` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div>
              <div style={{ color: primaryTone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Primary move</div>
              <div style={{ color: palette.text, fontSize: '30px', fontWeight: 950, lineHeight: 1.02, letterSpacing: '-0.05em', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif', marginBottom: '6px' }}>
                {primaryCard.title}
              </div>
              <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75, maxWidth: '620px' }}>
                {primaryCard.why}
              </div>
            </div>
            <span style={{ padding: '7px 11px', borderRadius: '999px', background: primaryConfidenceStyle.bg, border: `1px solid ${primaryConfidenceStyle.border}`, color: primaryConfidenceStyle.color, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {primaryCard.confidence_label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }} className="two-col">
            {primaryMetrics.map((item) => (
              <div key={`${primaryCard.id}-${item.label}`} style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.74)', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>{item.label}</div>
                <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, lineHeight: 1.35 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Why PivotIQ trusts this call</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>
              {primaryCard.confidence_reason}
            </div>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>What is backing it</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
              {primaryCard.market_evidence}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ padding: '20px', borderRadius: '24px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: primaryTone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>What changes if you follow it</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {followThroughChanges.map((item) => (
                <div key={item.label} style={{ padding: '13px 14px', borderRadius: '18px', background: item.label === 'Proof changes' ? `${primaryTone}10` : 'rgba(244,239,231,0.68)', border: `1px solid ${item.label === 'Proof changes' ? `${primaryTone}22` : palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>{item.label}</div>
                  <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, lineHeight: 1.4, marginBottom: '6px' }}>{item.value}</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '24px', background: `linear-gradient(180deg, rgba(255,255,255,0.88), ${primaryTone}0C)`, border: `1px solid ${primaryTone}24` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div>
                <div style={{ color: primaryTone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Next 7 days</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>Use the first week to make the recommendation visible, not just intellectually clear.</div>
              </div>
              <div style={{ minWidth: '108px' }}>
                <StepMeter filled={nextSevenDays.length || 1} total={4} tone={primaryTone} />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '9px', marginBottom: sprintProofAsset ? '14px' : '0' }}>
              {nextSevenDays.length
                ? nextSevenDays.map((item, index) => (
                    <div key={`${primaryCard.id}-week1-${index}`} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: '12px', alignItems: 'start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '10px', background: `${primaryTone}18`, color: primaryTone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                        {index + 1}
                      </div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>{item}</div>
                    </div>
                  ))
                : (
                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                      {primaryCard.next_step || 'Choose one visible first move and complete it before expanding the plan.'}
                    </div>
                  )}
            </div>

            {sprintProofAsset && (
              <div style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${primaryTone}20` }}>
                <div style={{ color: primaryTone, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Proof to ship first</div>
                <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>{sprintProofAsset.title || primaryCard.proof_asset}</div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>
                  {sprintProofAsset.description || sprintProofAsset.why_it_matters || primaryCard.proof_asset}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {decisionPanels.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${decisionPanels.length}, minmax(0, 1fr))`, gap: '12px', marginBottom: '16px' }} className="two-col">
          {decisionPanels.map((item) => (
            <div key={item.label} style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}` }}>
              <div style={{ color: item.color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.65 }}>{item.body}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`, gap: '12px' }} className="two-col">
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
                boxShadow: item.primary ? `0 16px 38px ${item.tone}18` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div>
                  <div style={{ color: item.tone, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{item.slot_label}</div>
                  <div style={{ color: palette.text, fontSize: '19px', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em' }}>{item.title}</div>
                </div>
                <span style={{ padding: '6px 10px', borderRadius: '999px', background: confidenceStyle.bg, border: `1px solid ${confidenceStyle.border}`, color: confidenceStyle.color, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.confidence_label}
                </span>
              </div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
                {compactCopy(item.why, 126)}
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Next step</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{compactCopy(item.next_step, 115)}</div>
                </div>
                <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Proof to build</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{compactCopy(item.proof_asset, 115)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

function ProgressRing({ score, color, label = 'READY', size = 138 }) {
  const clamped = clampNumber(score);
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(19,27,35,0.08)" strokeWidth="12" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color, fontSize: size * 0.22, fontWeight: 950, lineHeight: 1 }}>{clamped}</div>
        <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em' }}>{label}</div>
      </div>
    </div>
  );
}

function proofBlueprintScore(builder = {}) {
  const proofState = String(builder?.proof_state_read || '').toLowerCase();
  let score = /existing|package|upgrade|turn an existing/.test(proofState) ? 76 : 62;
  if (builder?.execution_guide?.inputs_to_collect?.length) score += 8;
  if (builder?.sample_metrics?.length) score += 6;
  if (builder?.internal_version || builder?.external_version) score += 6;
  if (builder?.checklist?.length >= 4) score += 4;
  return clampNumber(score, 48, 94);
}

function priorityRank(priority = '') {
  if (priority === 'critical') return 0;
  if (priority === 'medium') return 1;
  if (priority === 'low') return 2;
  return 3;
}

function CapabilityDeltaCard({ path, color, title = 'Capability delta map', body = 'See which capabilities already have signal and which ones still need visible proof.' }) {
  const skillGaps = Array.isArray(path?.skill_gaps) ? path.skill_gaps : [];
  if (!skillGaps.length) return null;

  const focusSkills = [...skillGaps]
    .sort((left, right) => {
      const priorityGap = priorityRank(left?.gap_priority) - priorityRank(right?.gap_priority);
      if (priorityGap !== 0) return priorityGap;
      return String(left?.skill_name || '').localeCompare(String(right?.skill_name || ''));
    })
    .slice(0, 4);
  const strengths = uniqCompact([
    ...(path?.strengths_to_leverage || []),
    ...focusSkills.map((skill) => skill?.evidence_you_already_have),
  ]).slice(0, 4);

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: `linear-gradient(145deg, ${color}10 0%, rgba(255,255,255,0.94) 58%)`, border: `1px solid ${color}24`, boxShadow: '0 20px 44px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
          <div style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '6px' }}>See the delta before you read every skill card.</div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, maxWidth: '760px' }}>{body}</div>
        </div>
        <div style={{ display: 'grid', gap: '8px', minWidth: '210px' }}>
          <div style={{ padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Focus gaps</div>
            <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900 }}>{focusSkills.length}</div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '16px', background: `${color}0D`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Current leverage</div>
            <div style={{ color: palette.text, fontSize: '20px', fontWeight: 900 }}>{strengths.length || 1}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)', gap: '14px' }} className="two-col">
        <div style={{ display: 'grid', gap: '10px' }}>
          {focusSkills.map((skill) => {
            const shape = gapShape(skill?.gap_priority);
            const priorityColor = skillPriorityColor(skill?.gap_priority, color);
            return (
              <div key={skill.skill_name} style={{ padding: '14px 15px', borderRadius: '18px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ color: palette.text, fontSize: '14px', fontWeight: 900 }}>{skill.skill_name}</div>
                  <span style={{ color: priorityColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{skill.gap_priority}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }} className="two-col">
                  <div>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Current signal</div>
                    <StepMeter filled={shape.currentSegments} tone={palette.navy} />
                  </div>
                  <div>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Target scope</div>
                    <StepMeter filled={shape.targetSegments} tone={priorityColor} />
                  </div>
                </div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>
                  <strong style={{ color: palette.text }}>Why it matters:</strong> {compactCopy(skill?.why_it_matters, 120)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '16px', borderRadius: '18px', background: `${color}0D`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Already on your side</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {strengths.length
                ? strengths.map((item) => (
                    <span key={item} style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '12px', fontWeight: 700 }}>
                      {compactCopy(item, 42)}
                    </span>
                  ))
                : (
                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                      The report is assuming domain familiarity and adjacent execution context as your starting leverage.
                    </div>
                  )}
            </div>
          </div>
          <div style={{ padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>Fastest way to compress the gap</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {focusSkills.slice(0, 3).map((skill) => (
                <div key={`${skill.skill_name}-close`} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <strong style={{ color: palette.text }}>{skill.skill_name}:</strong> {compactCopy(skill?.how_to_close_gap, 104)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofReadinessCard({ builder, color, title = 'Proof readiness', body = 'PivotIQ has already defined most of the proof brief. The remaining work is collecting evidence and packaging it credibly.' }) {
  if (!builder?.title) return null;

  const score = proofBlueprintScore(builder);
  const pillars = [
    {
      label: 'Problem',
      report: builder.business_question || builder.objective,
      you: builder.sections?.[0] || 'Choose the real workflow or decision you want to improve.',
    },
    {
      label: 'Evidence',
      report: builder.sample_metrics?.[0] || builder.execution_guide?.inputs_to_collect?.[2],
      you: builder.execution_guide?.inputs_to_collect?.[2] || 'Capture one before/after signal or metric snapshot.',
    },
    {
      label: 'Controls',
      report: builder.execution_guide?.inputs_to_collect?.[1] || builder.sections?.[2],
      you: builder.sections?.[2] || 'Make the review logic visible so the artifact feels trustworthy.',
    },
    {
      label: 'Scope ask',
      report: builder.execution_guide?.manager_readout || builder.internal_version?.use_case || builder.external_version?.use_case,
      you: builder.execution_guide?.good_enough_bar || 'End with the broader role or scope this artifact unlocks.',
    },
  ];

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: `linear-gradient(145deg, rgba(255,255,255,0.96), ${color}0F)`, border: `1px solid ${color}22`, boxShadow: '0 20px 44px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 0.42fr) minmax(0, 1fr)', gap: '18px', alignItems: 'center', marginBottom: '16px' }} className="two-col">
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <ProgressRing score={score} color={color} label="BLUEPRINT" />
        </div>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
          <div style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '6px' }}>The artifact is mostly specified. Execution is now the constraint.</div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, marginBottom: '10px' }}>{body}</div>
          <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>
            <strong style={{ color: palette.text }}>Start from:</strong> {builder.proof_state_read || 'build your first visible proof asset'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {pillars.map((pillar, index) => (
          <div key={pillar.label} style={{ padding: '16px', borderRadius: '18px', background: index === 1 ? `${color}0D` : 'rgba(255,255,255,0.8)', border: `1px solid ${index === 1 ? `${color}22` : palette.border}` }}>
            <div style={{ color: index === 1 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{pillar.label}</div>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Defined in the report</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55, marginBottom: '8px' }}>{compactCopy(pillar.report, 112)}</div>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>You still need to show</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{compactCopy(pillar.you, 112)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {[
          ['Ship this week', builder.execution_guide?.one_week_ship || builder.first_action],
          ['Good enough bar', builder.execution_guide?.good_enough_bar || builder.good_looks_like?.credible],
          ['Shareable format', builder.execution_guide?.artifact_format || builder.internal_version?.title || builder.external_version?.title],
        ].map(([label, value], index) => (
          <div key={label} style={{ padding: '14px 15px', borderRadius: '18px', background: index === 0 ? `${color}0D` : 'rgba(255,255,255,0.8)', border: `1px solid ${index === 0 ? `${color}22` : palette.border}` }}>
            <div style={{ color: index === 0 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.58 }}>{compactCopy(value, 118)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StayOperatingNarrativeCard({
  color,
  stayAndAdvance = {},
  playbook = {},
  system = {},
  safetyCase = {},
  promotionCase = {},
  promotionConversationPack = {},
}) {
  if (!stayAndAdvance?.recommendation && !playbook?.headline && !system?.headline && !safetyCase?.headline && !promotionCase?.headline) {
    return null;
  }

  const proofTitle = stayAndAdvance?.thirty_day_plan?.proof_asset?.title
    || promotionCase?.proof_to_show?.[0]
    || playbook?.plays?.[0]?.what_to_share
    || system?.visible_scope_move
    || 'Internal AI leverage case';
  const timeline = stayAndAdvance?.promotion_path?.timeline || '3-9 months';
  const targetTitle = stayAndAdvance?.promotion_path?.next_title || promotionCase?.target_title || 'Expanded scope in current lane';
  const metric = stayAndAdvance?.thirty_day_plan?.metric_to_move || safetyCase?.metric_to_watch || 'one visible operating metric';
  const operatorShift = compactCopy(
    stayAndAdvance?.recommendation
      || playbook?.operator_shift
      || system?.summary
      || safetyCase?.summary
      || promotionCase?.why_now,
    190
  );
  const safetyReasons = uniqCompact([
    ...(safetyCase?.safer_because || []),
    ...(safetyCase?.what_changes_if_you_do_this || []),
  ]).slice(0, 4);
  const promotableSignals = uniqCompact([
    ...(playbook?.promotion_signals || []),
    ...(promotionCase?.leadership_case || []),
    ...(promotionConversationPack?.evidence_to_bring || []),
  ]).slice(0, 4);
  const operatingMoves = [
    {
      label: 'Step 1',
      title: 'Redesign one workflow',
      icon: 'task-diagnostics',
      body: stayAndAdvance?.ai_this_week_plan?.workflow || playbook?.plays?.[0]?.workflow || system?.first_week_win || 'Pick one repeated workflow and rebuild the first pass with AI.',
      helper: stayAndAdvance?.ai_this_week_plan?.ai_role || playbook?.plays?.[0]?.ai_role || (system?.automate || [])[0] || 'Use AI for the first pass, not the final judgment.',
    },
    {
      label: 'Step 2',
      title: 'Install review logic',
      icon: 'lock',
      body: stayAndAdvance?.ai_this_week_plan?.human_checkpoint || playbook?.plays?.[0]?.human_checkpoint || (system?.protect || [])[0] || 'Keep the quality checkpoint where trust and judgment still matter.',
      helper: compactCopy(uniqCompact([
        ...(system?.automate || []).slice(0, 1),
        ...(system?.augment || []).slice(0, 1),
        ...(system?.protect || []).slice(0, 1),
      ]).join(' '), 110) || 'Make the workflow faster without giving away control.',
    },
    {
      label: 'Step 3',
      title: 'Turn it into proof',
      icon: 'proof',
      body: proofTitle,
      helper: playbook?.plays?.[0]?.what_to_share || promotionCase?.proof_to_show?.[0] || 'Document the before/after change so someone else can inspect the leverage.',
    },
    {
      label: 'Step 4',
      title: 'Convert proof into scope',
      icon: 'roi',
      body: targetTitle,
      helper: promotionConversationPack?.ask || promotionCase?.manager_sentence || 'Use the case to ask for broader workflow ownership, not just credit for speed.',
    },
  ];
  const operatingSystemRows = [
    ['Automate', (system?.automate || [])[0]],
    ['Augment', (system?.augment || [])[0]],
    ['Protect', (system?.protect || [])[0]],
    ['Lead', (system?.lead || [])[0]],
  ].filter(([, value]) => value);
  const operatingRhythm = uniqCompact([
    ...(playbook?.weekly_operating_system || []),
    system?.first_week_win,
    system?.manager_read,
    promotionConversationPack?.manager_script,
  ]).slice(0, 4);
  const scopeOptions = uniqCompact([
    ...(promotionConversationPack?.next_scope_options || []),
    promotionCase?.what_changes_if_yes,
    ...(safetyCase?.what_changes_if_you_do_this || []),
  ]).slice(0, 3);

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(145deg, ${color}12 0%, rgba(255,255,255,0.96) 56%, rgba(244,239,231,0.94) 100%)`, border: `1px solid ${color}24`, boxShadow: '0 24px 54px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Operating narrative</div>
          <h3 style={{ color: palette.text, fontSize: '24px', fontWeight: 950, letterSpacing: '-0.045em', margin: '0 0 8px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Make the role safer by turning AI usage into visible operating scope.
          </h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, margin: 0 }}>{operatorShift}</p>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${color}24`, minWidth: '220px' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Promotion trajectory</div>
          <div style={{ color: palette.text, fontSize: '16px', fontWeight: 900, marginBottom: '4px' }}>{targetTitle}</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{timeline}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {[
          ['Why this gets safer', safetyReasons[0] || safetyCase?.summary || 'Move up the workflow from execution into judgment and control.'],
          ['Metric to move', metric],
          ['Proof to ship', proofTitle],
          ['What scope opens', scopeOptions[0] || `A clearer case for ${targetTitle}`],
        ].map(([label, value], index) => (
          <div key={label} style={{ padding: '14px 15px', borderRadius: '18px', background: index === 0 ? `${color}10` : 'rgba(255,255,255,0.78)', border: `1px solid ${index === 0 ? `${color}22` : palette.border}` }}>
            <div style={{ color: index === 0 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.62 }}>{compactCopy(value, 104)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.16fr) minmax(300px, 0.84fr)', gap: '14px', marginBottom: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>How this story compounds</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }} className="two-col">
            {operatingMoves.map((item) => (
              <div key={item.label} style={{ padding: '14px', borderRadius: '18px', background: item.label === 'Step 3' ? `${color}0D` : 'rgba(244,239,231,0.62)', border: `1px solid ${item.label === 'Step 3' ? `${color}22` : palette.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <MonoIcon name={item.icon} tone={item.label === 'Step 3' ? 'teal' : 'default'} />
                  <div>
                    <div style={{ color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 900, lineHeight: 1.35 }}>{item.title}</div>
                  </div>
                </div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.62, marginBottom: '8px' }}>{compactCopy(item.body, 110)}</div>
                <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.55 }}>{compactCopy(item.helper, 105)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: '22px', background: `${color}0D`, border: `1px solid ${color}20` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Safety signals leadership can see</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {safetyReasons.slice(0, 3).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Promotion signal</div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
              {promotableSignals.slice(0, 3).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {(promotionConversationPack?.manager_script || promotionCase?.manager_sentence) && (
              <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(19,32,42,0.04)', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Say this to your manager</div>
                <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(promotionConversationPack?.manager_script || promotionCase?.manager_sentence, 145)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Role operating system</div>
          <div style={{ display: 'grid', gap: '9px' }}>
            {operatingSystemRows.slice(0, 4).map(([label, value]) => (
              <div key={label} style={{ padding: '11px 12px', borderRadius: '14px', background: label === 'Lead' ? `${color}0D` : 'rgba(244,239,231,0.58)', border: `1px solid ${label === 'Lead' ? `${color}20` : palette.border}` }}>
                <div style={{ color: label === 'Lead' ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{compactCopy(value, 84)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Weekly operating rhythm</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {operatingRhythm.slice(0, 4).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0D`, border: `1px solid ${color}22` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>What broader scope this unlocks</div>
          <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            {scopeOptions.map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          {promotionConversationPack?.ask && (
            <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
              <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Specific ask</div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(promotionConversationPack.ask, 140)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleOperatingSystemCard({ system, color }) {
  if (!system?.headline) return null;

  const sections = [
    {
      label: 'Automate',
      subtitle: 'Let AI handle the first pass.',
      items: system.automate || [],
      tone: `${color}10`,
      border: `${color}22`,
    },
    {
      label: 'Augment',
      subtitle: 'Use AI to sharpen your judgment.',
      items: system.augment || [],
      tone: 'rgba(255,255,255,0.82)',
      border: palette.border,
    },
    {
      label: 'Protect',
      subtitle: 'Keep the human checkpoints here.',
      items: system.protect || [],
      tone: 'rgba(255,255,255,0.82)',
      border: palette.border,
    },
    {
      label: 'Lead',
      subtitle: 'Own the operating layer others depend on.',
      items: system.lead || [],
      tone: 'rgba(19,32,42,0.04)',
      border: palette.border,
    },
  ];

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.94) 58%)`, border: `1px solid ${color}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>How to work now</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{system.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(system.summary, 150)}</p>
        </div>
        <span style={{ borderRadius: '999px', padding: '7px 12px', background: `${color}12`, border: `1px solid ${color}24`, color, fontSize: '12px', fontWeight: 900 }}>
          {system.weekly_time_budget || '3-5 focused hours'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {[
          ['Visible scope move', system.visible_scope_move, color, `${color}10`, `${color}22`],
          ['First-week win', system.first_week_win, palette.textSoft, 'rgba(255,255,255,0.82)', palette.border],
          ['Leadership readout', system.manager_read, palette.textSoft, 'rgba(19,32,42,0.04)', palette.border],
        ].map(([label, value, labelColor, background, border]) => (
          <div key={label} style={{ padding: '15px 16px', borderRadius: '18px', background, border: `1px solid ${border}` }}>
            <div style={{ color: labelColor, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(value, 92)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="two-col">
        {sections.map((section) => (
          <div key={section.label} style={{ padding: '16px', borderRadius: '18px', background: section.tone, border: `1px solid ${section.border}` }}>
            <div style={{ color: section.label === 'Automate' ? color : palette.textSoft, fontSize: '11px', fontWeight: 900, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>{section.label}</div>
            <div style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.5, marginBottom: '10px' }}>{section.subtitle}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {section.items.slice(0, 2).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
              {section.items.length > 2 && (
                <div style={{ color: palette.textSoft, fontSize: '12px', fontWeight: 700 }}>
                  +{section.items.length - 2} more signal{section.items.length - 2 === 1 ? '' : 's'}
                </div>
              )}
            </div>
          </div>
        ))}
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
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(builder.objective, 150)}</p>
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

      {builder.execution_guide && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
          {[
            ['Ship this week', builder.execution_guide.one_week_ship],
            ['Good enough bar', builder.execution_guide.good_enough_bar],
            ['Manager readout', builder.execution_guide.manager_readout],
          ].map(([label, value], index) => (
            <div key={label} style={{ padding: '15px 16px', borderRadius: '18px', background: index === 0 ? `${color}10` : 'rgba(255,255,255,0.76)', border: `1px solid ${index === 0 ? `${color}22` : palette.border}` }}>
              <div style={{ color: index === 0 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Artifact outline</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(builder.sections || []).map((section, index) => (
              <div key={section} style={{ display: 'flex', gap: '10px', alignItems: 'start', color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
                <span style={{ color, fontWeight: 900, minWidth: '16px' }}>{index + 1}</span>
                <span>{section}</span>
              </div>
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

      {builder.execution_guide && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '14px' }} className="two-col">
          <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0F`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Ship inputs and format</div>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Artifact format</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65, marginBottom: '10px' }}>{builder.execution_guide.artifact_format}</div>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Inputs to collect</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(builder.execution_guide.inputs_to_collect || []).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Make it career-useful</div>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Resume / LinkedIn line</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{builder.execution_guide.resume_bullet_formula}</div>
          </div>
        </div>
      )}

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
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(playbook.operator_shift, 150)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {[
          ['Own this now', compactCopy(playbook.plays?.[0]?.workflow, 84)],
          ['Show leadership', compactCopy(playbook.plays?.[0]?.what_to_share, 84)],
          ['Weekly shift', compactCopy((playbook.weekly_operating_system || [])[0], 84)],
        ].map(([label, value], index) => (
          <div key={label} style={{ padding: '15px 16px', borderRadius: '18px', background: index === 0 ? `${color}10` : 'rgba(255,255,255,0.78)', border: `1px solid ${index === 0 ? `${color}22` : palette.border}` }}>
            <div style={{ color: index === 0 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{value || 'Turn one repeated workflow into visible operating leverage.'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '14px' }}>
        {(playbook.plays || []).map((play, index) => (
          <div key={`${play.title}-${index}`} style={{ borderRadius: '22px', padding: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{ color: palette.text, fontSize: '17px', fontWeight: 900 }}>{play.title}</div>
              <span style={{ padding: '6px 10px', borderRadius: '999px', background: `${color}12`, border: `1px solid ${color}22`, color, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Play {index + 1}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }} className="two-col">
              {[
                ['Workflow', compactCopy(play.workflow, 74)],
                ['AI does', compactCopy(play.ai_role, 74)],
                ['You review', compactCopy(play.human_checkpoint, 74)],
                ['Business shift', compactCopy(play.business_impact, 74)],
              ].map(([label, value], itemIndex) => (
                <div key={label} style={{ padding: '12px 13px', borderRadius: '16px', background: itemIndex === 1 ? `${color}0F` : 'rgba(255,255,255,0.82)', border: `1px solid ${itemIndex === 1 ? `${color}22` : palette.border}` }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', padding: '12px 13px', borderRadius: '16px', background: `${color}0E`, border: `1px solid ${color}20`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
              <strong style={{ color: palette.text }}>What to show leadership:</strong> {compactCopy(play.what_to_share, 120)}
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

function UseAiThisWeekCard({ plan, color }) {
  if (!plan?.headline) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}16 0%, rgba(255,255,255,0.96) 60%, rgba(255,247,237,0.92) 100%)`, border: `1px solid ${color}28`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Use AI this week</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{plan.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '760px' }}>
            Ship one visible AI-assisted workflow before you change anything bigger.
          </p>
        </div>
      </div>

      <div style={{ padding: '18px', borderRadius: '22px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}`, marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Workflow map</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(plan.systems || []).length ? (plan.systems || []).map((system) => (
              <span key={system} style={{ padding: '6px 10px', borderRadius: '999px', background: `${color}0D`, border: `1px solid ${color}22`, color: palette.textMuted, fontSize: '12px', fontWeight: 700 }}>
                {system}
              </span>
            )) : (
              <span style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>Start where the workflow already lives.</span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="two-col">
          {[
            ['Workflow to redesign', compactCopy(plan.workflow, 92)],
            ['AI does', compactCopy(plan.ai_role, 86)],
            ['You review', compactCopy(plan.human_checkpoint, 86)],
            ['Ship this', compactCopy(plan.output, 86)],
          ].map(([label, value], index) => (
            <div key={label} style={{ position: 'relative', padding: '14px', borderRadius: '18px', background: index === 1 ? `${color}0F` : 'rgba(255,255,255,0.86)', border: `1px solid ${index === 1 ? `${color}24` : palette.border}` }}>
              <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
              <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.6, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0D`, border: `1px solid ${color}20` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Success signal</div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Metric to move</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>{compactCopy(plan.metric, 88)}</div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Stop when this is true</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(plan.stop_condition, 90)}</div>
        </div>
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Leadership readout</div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Use this with your manager</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(plan.share_with_manager, 100)}</div>
        </div>
      </div>
    </div>
  );
}

function JobSafetyCaseCard({ safetyCase, color }) {
  if (!safetyCase?.headline) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.96) 58%)`, border: `1px solid ${color}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Career safety read</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{safetyCase.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(safetyCase.summary, 150)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: `${color}10`, border: `1px solid ${color}22` }}>
          <div style={{ color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Safer because</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy((safetyCase.safer_because || [])[0], 88)}</div>
        </div>
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>If you act</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy((safetyCase.what_changes_if_you_do_this || [])[0], 88)}</div>
        </div>
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Metric to watch</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy(safetyCase.metric_to_watch, 88)}</div>
        </div>
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(19,32,42,0.04)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>If you ignore this</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy(safetyCase.if_you_ignore_this, 88)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Why this makes you safer</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(safetyCase.safer_because || []).slice(0, 3).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0F`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>What changes now</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(safetyCase.what_changes_if_you_do_this || []).slice(0, 3).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Protection shift</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
              {compactCopy((safetyCase.safer_because || [])[1] || safetyCase.metric_to_watch || safetyCase.summary, 120)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionCaseCard({ promotionCase, color }) {
  if (!promotionCase?.headline) return null;

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,247,237,0.94))', border: `1px solid ${color}20`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Promotion case</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>{promotionCase.headline}</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(promotionCase.why_now, 140)}</p>
        </div>
        {promotionCase.target_title && (
          <span style={{ borderRadius: '999px', padding: '7px 12px', background: `${color}12`, border: `1px solid ${color}28`, color, fontSize: '12px', fontWeight: 900 }}>
            {promotionCase.target_title}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: `${color}10`, border: `1px solid ${color}22` }}>
          <div style={{ color, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Next title</div>
          <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.5, fontWeight: 800 }}>{promotionCase.target_title || 'Expanded scope in current lane'}</div>
        </div>
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Best proof</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy((promotionCase.proof_to_show || [])[0], 88)}</div>
        </div>
        <div style={{ padding: '15px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>If this lands</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy(promotionCase.what_changes_if_yes, 88)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Leadership case to make</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(promotionCase.leadership_case || []).slice(0, 3).map((item) => (
              <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color, fontWeight: 950 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: '20px', background: `${color}0F`, border: `1px solid ${color}22` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Proof to show</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(promotionCase.proof_to_show || []).slice(0, 3).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(19,32,42,0.04)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Say this to your manager</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{compactCopy(promotionCase.manager_sentence, 130)}</div>
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
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, margin: 0, maxWidth: '760px' }}>{compactCopy(pack.meeting_goal, 140)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        {[
          ['Open with this', compactCopy(pack.manager_script || pack.talk_track?.[0], 86)],
          ['Bring this proof', compactCopy((pack.evidence_to_bring || [])[0], 86)],
          ['Make this ask', compactCopy(pack.ask || pack.next_scope_options?.[0], 86)],
        ].map(([label, value], index) => (
          <div key={label} style={{ padding: '15px 16px', borderRadius: '18px', background: index === 0 ? `${color}10` : 'rgba(255,255,255,0.78)', border: `1px solid ${index === 0 ? `${color}22` : palette.border}` }}>
            <div style={{ color: index === 0 ? color : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.92fr)', gap: '14px' }} className="two-col">
        <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Talk track</div>
          <div style={{ display: 'grid', gap: '9px' }}>
            {(pack.talk_track || []).slice(0, 3).map((item, index) => (
              <div key={item} style={{ display: 'flex', gap: '10px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
                <span style={{ color, fontWeight: 950 }}>{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
            <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Evidence and next scope</div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '10px' }}>
              {(pack.evidence_to_bring || []).slice(0, 2).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {(pack.next_scope_options || []).slice(0, 2).map((item) => (
                <div key={item} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 950 }}>→</span>
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
            {(pack.what_not_to_say || []).slice(0, 2).map((item) => (
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
  const shape = gapShape(skill.gap_priority);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(210px, 0.85fr) minmax(0, 1fr)', gap: '10px', alignItems: 'stretch' }} className="two-col">
        <div style={{ background: 'rgba(10, 16, 24, 0.9)', border: `1px solid ${palette.border}`, borderRadius: '16px', padding: '13px' }}>
          <div style={{ color: 'rgba(244,239,231,0.72)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.currentLeverage}</div>
          <div style={{ color: '#F4EFE7', fontSize: '13px', lineHeight: 1.6 }}>{skill.current_strength}</div>
        </div>
        <div style={{ padding: '13px', borderRadius: '16px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Gap shape</div>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Current signal</div>
          <StepMeter filled={shape.currentSegments} tone={palette.navy} />
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, margin: '10px 0 6px' }}>Target scope</div>
          <StepMeter filled={shape.targetSegments} tone={priorityColor} />
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55, marginTop: '10px' }}>
            <strong style={{ color: palette.text }}>{shape.label}:</strong> {shape.helper}
          </div>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '10px' }} className="two-col">
        <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(255,255,255,0.74)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.whyThisMatters}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(skill.why_it_matters, 120)}</div>
        </div>
        <div style={{ padding: '12px 13px', borderRadius: '16px', background: `${color}10`, border: `1px solid ${color}22` }}>
          <div style={{ color: color, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{messages.report.closeGap}</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(skill.how_to_close_gap, 110)}</div>
        </div>
      </div>

      <div style={{ padding: '12px 13px', borderRadius: '16px', background: 'rgba(19,32,42,0.04)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
        <strong style={{ color: palette.text }}>{messages.report.evidenceAlready}:</strong> {compactCopy(skill.evidence_you_already_have, 120)}
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
  const persistedSteps = buildPersistedLearningPathSteps(path);
  const steps = persistedSteps.length ? persistedSteps : buildLearningPathSteps(path?.skill_gaps || []);
  if (!steps.length) return null;
  const currentSignal = uniqCompact([
    ...(path?.strengths_to_leverage || []),
    ...steps.map((step) => step?.skill?.evidence_you_already_have),
  ]);
  const progressionNodes = [
    {
      label: 'Current leverage',
      title: currentSignal[0] || 'Existing adjacent signal',
      body: currentSignal[1] || 'Start from the workflow knowledge and context you already have.',
      tone: 'rgba(19,32,42,0.06)',
      border: palette.border,
      numberBg: 'rgba(19,32,42,0.08)',
      numberColor: palette.text,
    },
    ...steps.map((step, index) => ({
      label: step.label,
      title: step.skill.skill_name,
      body: step.helper,
      tone: index === 0 ? `${color}12` : 'rgba(255,255,255,0.78)',
      border: index === 0 ? `${color}26` : palette.border,
      numberBg: index === 0 ? color : 'rgba(19,32,42,0.08)',
      numberColor: index === 0 ? '#fff' : palette.text,
    })),
    {
      label: 'Target role',
      title: path?.title || 'Target role',
      body: path?.fit_summary || 'This is the role the sequence is trying to make credible as fast as possible.',
      tone: `${color}0D`,
      border: `${color}20`,
      numberBg: `${color}18`,
      numberColor: color,
    },
  ];

  return (
    <div className="piq-card" style={{ padding: '24px', marginBottom: '18px', background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.92) 58%, rgba(255,249,242,0.9) 100%)`, border: `1px solid ${color}28`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <div style={{ color, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>Learning path</div>
          <h3 style={{ color: palette.text, fontSize: '22px', fontWeight: 950, letterSpacing: '-0.04em', margin: '0 0 6px' }}>The fastest credible learning sequence</h3>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '720px' }}>
            Learn just enough to ship proof, then go deeper.
          </p>
        </div>
        <span style={{ borderRadius: '999px', padding: '7px 12px', background: 'rgba(255,255,255,0.78)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '12px', fontWeight: 850 }}>
          {steps.length} recommended steps
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${progressionNodes.length}, minmax(0, 1fr))`, gap: '10px', marginBottom: '14px' }} className="two-col">
        {progressionNodes.map((node, index) => (
          <div key={`track-${node.label}-${node.title}`} style={{ padding: '12px 14px', borderRadius: '18px', background: node.tone, border: `1px solid ${node.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '999px', display: 'grid', placeItems: 'center', background: node.numberBg, color: node.numberColor, fontSize: '12px', fontWeight: 900 }}>
                {index + 1}
              </span>
              <span style={{ color: color, fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>{node.label}</span>
            </div>
            <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800, lineHeight: 1.4, marginBottom: '6px' }}>{compactCopy(node.title, 54)}</div>
            <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{compactCopy(node.body, 70)}</div>
          </div>
        ))}
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
              <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55, margin: '0 0 12px' }}>{compactCopy(step.helper, 88)}</p>
              <div style={{ padding: '11px 12px', borderRadius: '14px', background: `${color}0D`, border: `1px solid ${color}18`, marginBottom: '12px' }}>
                <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {index === 0 ? 'Use this to start' : index === 1 ? 'Use this to build proof' : 'Use this to go deeper'}
                </div>
                <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>
                  {index === 0
                    ? 'Create the first credible workflow in your current role.'
                    : index === 1
                      ? 'Turn the skill into something visible and reviewable.'
                      : 'Systematize the work so it becomes repeatable scope.'}
                </div>
              </div>
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

function RefreshFromProgressCard({ refreshContext, refreshSummary, status, onRefresh, locale = 'en' }) {
  if (!refreshContext) return null;

  const isLoading = status === 'loading';
  const isDone = status === 'done';
  const isFailed = status === 'failed';
  const comparisonRows = refreshSummary?.comparison_rows || [];
  const changedRows = comparisonRows.filter((row) => row.changed);
  const changeDrivers = refreshSummary?.change_drivers?.length ? refreshSummary.change_drivers : (refreshContext.progress_notes || []);
  const inputsConsidered = refreshSummary?.inputs_considered || [];
  const sectionsUpdated = refreshSummary?.sections_updated || [];
  const buttonLabel = isLoading
    ? 'Refreshing report...'
    : refreshContext.is_ready
      ? 'Refresh this report from my progress'
      : 'Log progress to unlock refresh';

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: `linear-gradient(145deg, ${palette.navy}08 0%, rgba(255,255,255,0.94) 62%)`, border: `1px solid ${palette.border}`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{ color: palette.navy, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Refresh from progress</div>
          <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '6px' }}>
            {refreshSummary?.headline || refreshContext.title}
          </div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
            {refreshSummary?.body || refreshContext.body}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={!refreshContext.is_ready || isLoading}
          onClick={onRefresh}
          style={{ width: 'auto', padding: '11px 16px', opacity: !refreshContext.is_ready && !isLoading ? 0.58 : 1 }}
        >
          {buttonLabel}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: refreshSummary?.what_changed?.length ? '14px' : '0' }} className="two-col">
        {[
          ['Milestones done', refreshContext.completed_weeks_count],
          ['Proof ready', refreshContext.proof_ready_count],
          ['Manager signal', refreshContext.manager_done_count],
          ['Outcome', refreshContext.outcome_summary?.traction_label || 'No signal yet'],
        ].map(([label, value]) => (
          <div key={label} style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ color: palette.text, fontSize: typeof value === 'number' ? '22px' : '14px', fontWeight: 900, lineHeight: 1.35 }}>{value}</div>
          </div>
        ))}
      </div>

      {refreshSummary?.what_changed?.length > 0 && (
        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}`, marginBottom: '12px' }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>What got stronger in this refresh</div>
          <div style={{ display: 'grid', gap: '7px' }}>
            {refreshSummary.what_changed.map((item) => (
              <div key={item} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{item}</div>
            ))}
          </div>
        </div>
      )}

      {(sectionsUpdated.length > 0 || changedRows.length > 0) && (
        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}`, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>What PivotIQ tightened</div>
            {sectionsUpdated.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {sectionsUpdated.map((item) => (
                  <span
                    key={item}
                    style={{
                      borderRadius: '999px',
                      padding: '5px 8px',
                      fontSize: '10px',
                      fontWeight: 900,
                      color: palette.teal,
                      background: 'rgba(27,111,99,0.10)',
                      border: '1px solid rgba(27,111,99,0.18)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {comparisonRows.map((row) => (
              <div
                key={row.key}
                style={{
                  padding: '11px 12px',
                  borderRadius: '14px',
                  background: row.changed ? 'rgba(27,111,99,0.08)' : 'rgba(19,32,42,0.04)',
                  border: `1px solid ${row.changed ? 'rgba(27,111,99,0.16)' : palette.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row.label}</div>
                  <div style={{ color: row.changed ? palette.teal : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {row.changed ? 'Tightened' : 'No change'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }} className="two-col">
                  <div style={{ padding: '10px 11px', borderRadius: '12px', background: 'rgba(255,255,255,0.62)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Before</div>
                    <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{row.before}</div>
                  </div>
                  <div style={{ padding: '10px 11px', borderRadius: '12px', background: row.changed ? 'rgba(27,111,99,0.10)' : 'rgba(255,255,255,0.62)', border: `1px solid ${row.changed ? 'rgba(27,111,99,0.18)' : palette.border}` }}>
                    <div style={{ color: row.changed ? palette.teal : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>After</div>
                    <div style={{ color: palette.text, fontSize: '12px', lineHeight: 1.55, fontWeight: row.changed ? 800 : 700 }}>{row.after}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(changeDrivers.length > 0 || inputsConsidered.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '12px' }} className="two-col">
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>Why PivotIQ shifted or stayed conservative</div>
            <div style={{ display: 'grid', gap: '7px' }}>
              {changeDrivers.slice(0, 5).map((item) => (
                <div key={item} style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{item}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
            <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>Signals shaping this refresh</div>
            {inputsConsidered.length > 0 ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {inputsConsidered.map((item) => (
                  <span
                    key={item}
                    style={{
                      color: palette.textSoft,
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '6px 9px',
                      borderRadius: '999px',
                      background: 'rgba(19,32,42,0.05)',
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                This refresh was driven mainly by the progress and outcome signal you logged.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        {refreshSummary?.previous_primary && refreshSummary?.current_primary && (
          <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>
            {refreshSummary.previous_primary === refreshSummary.current_primary
              ? `Primary move: ${refreshSummary.current_primary}`
              : `Primary move: ${refreshSummary.previous_primary} -> ${refreshSummary.current_primary}`}
          </span>
        )}
        {refreshSummary?.confidence_delta && (
          <>
            <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
            <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>Confidence: {refreshSummary.confidence_delta}</span>
          </>
        )}
        {refreshSummary?.refreshed_at && (
          <>
            <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
            <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>Refreshed {formatDate(refreshSummary.refreshed_at, locale)}</span>
          </>
        )}
        {isDone && (
          <>
            <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
            <span style={{ color: palette.teal, fontSize: '11px', fontWeight: 800 }}>Latest refresh saved</span>
          </>
        )}
        {isFailed && (
          <>
            <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
            <span style={{ color: '#8B4A1B', fontSize: '11px', fontWeight: 800 }}>Refresh failed. Try again.</span>
          </>
        )}
      </div>

      {refreshSummary?.next_action && (
        <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(19,32,42,0.05)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Next step after refresh</div>
          <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{refreshSummary.next_action}</div>
        </div>
      )}
    </div>
  );
}

function OutcomeTrackerCard({ outcome, summary, followup, onSave, locale = 'en' }) {
  if (!outcome || !summary || !onSave) return null;

  const toneColor = summary.tone === 'strong'
    ? palette.teal
    : summary.tone === 'positive'
      ? palette.orange
      : palette.textSoft;

  return (
    <div className="piq-card" style={{ padding: '22px', marginBottom: '18px', background: `linear-gradient(145deg, ${toneColor}12 0%, rgba(255,255,255,0.94) 62%)`, border: `1px solid ${toneColor}24`, boxShadow: '0 22px 46px rgba(19, 32, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{ color: toneColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Outcome tracker</div>
          <div style={{ color: palette.text, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '6px' }}>{summary.title}</div>
          <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
            {summary.body} This feeds future recommendation quality and keeps your own report honest about what is actually working.
          </div>
          {followup?.is_due && (
            <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${toneColor}30`, maxWidth: '760px' }}>
              <div style={{ color: toneColor, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>Follow-up due</div>
              <div style={{ color: palette.text, fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>{followup.title}</div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{followup.body}</div>
            </div>
          )}
        </div>
        <div style={{ minWidth: '220px', padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Recommendation signal</div>
          <div style={{ color: palette.text, fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{summary.score}/100</div>
          <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.55 }}>{summary.recommendation_quality_state}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }} className="two-col">
        <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>Proof asset shipped</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[false, true].map((value) => (
              <button
                key={`proof-${String(value)}`}
                type="button"
                className="btn-ghost"
                onClick={() => onSave({ built_proof_asset: value })}
                style={{
                  width: 'auto',
                  padding: '8px 12px',
                  background: outcome.built_proof_asset === value ? `${palette.teal}14` : 'rgba(255,255,255,0.72)',
                  borderColor: outcome.built_proof_asset === value ? `${palette.teal}35` : palette.border,
                  color: outcome.built_proof_asset === value ? palette.teal : palette.textMuted,
                }}
              >
                {value ? 'Built' : 'Not yet'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>Manager conversation</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[false, true].map((value) => (
              <button
                key={`manager-${String(value)}`}
                type="button"
                className="btn-ghost"
                onClick={() => onSave({ manager_conversation_done: value })}
                style={{
                  width: 'auto',
                  padding: '8px 12px',
                  background: outcome.manager_conversation_done === value ? `${palette.orange}14` : 'rgba(255,255,255,0.72)',
                  borderColor: outcome.manager_conversation_done === value ? `${palette.orange}35` : palette.border,
                  color: outcome.manager_conversation_done === value ? '#8B4A1B' : palette.textMuted,
                }}
              >
                {value ? 'Done' : 'Not yet'}
              </button>
            ))}
          </div>
        </div>
        <label style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>Traction so far</span>
          <select className="piq-input" value={outcome.traction_status} onChange={(event) => onSave({ traction_status: event.target.value })}>
            {TRACTION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: '6px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
          <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>How useful was this?</span>
          <select
            className="piq-input"
            value={outcome.usefulness_rating || ''}
            onChange={(event) => onSave({ usefulness_rating: event.target.value ? Number(event.target.value) : null })}
          >
            <option value="">Not rated yet</option>
            {USEFULNESS_RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={{ color: palette.text, fontSize: '12px', fontWeight: 800 }}>What changed after you used this report?</span>
        <textarea
          className="piq-input"
          rows={3}
          value={outcome.notes}
          onChange={(event) => onSave({ notes: event.target.value }, { immediate: false })}
          onBlur={(event) => onSave({ notes: event.target.value })}
          placeholder="Example: I showed the workflow map to my manager, got approval to test it on one recurring process, and now the team wants a second pass."
          style={{ resize: 'vertical' }}
        />
      </label>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>Traction: {summary.traction_label}</span>
        <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
        <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>Usefulness: {summary.usefulness_label}</span>
        {outcome.updated_at && (
          <>
            <span style={{ color: 'rgba(80,96,107,0.42)', fontSize: '11px' }}>·</span>
            <span style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800 }}>Updated {formatDate(outcome.updated_at, locale)}</span>
          </>
        )}
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

async function syncOutcome(reportId, payload) {
  if (!reportId) return null;

  try {
    const response = await fetch(`/api/reports/${reportId}/outcome`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));

    if (!response.ok || !json.success) {
      throw new Error(json.error || 'Outcome sync failed');
    }

    return json.outcome || null;
  } catch (error) {
    console.error('Outcome sync failed', error);
    return null;
  }
}

function TeaserView({ payload, onCheckout, loading }) {
  const reportData = payload.reportData;
  const { summary, task_breakdown: taskBreakdown, pivots, roadmap } = reportData;
  const color = riskColor(summary.overall_score);
  const bestPivot = pivots[0];
  const backupPivot = pivots[1] || null;
  const interpretation = reportData.interpretation || {};
  const messages = getMessages(payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale);
  const topPressureTask = [...taskBreakdown].sort((left, right) => Number(right?.risk_score || 0) - Number(left?.risk_score || 0))[0] || null;
  const immediateAction = reportData.next_move?.explanation || bestPivot?.why_this_path_wins || summary.what_this_means;
  const teaserLoopItems = [
    backupPivot?.title ? `Why ${bestPivot?.title} beats ${backupPivot.title} right now` : `Why ${bestPivot?.title || 'this pivot'} leads over the close alternatives`,
    `Which ${Math.max((bestPivot?.skill_gaps || []).length, 3)} skill gaps actually matter first`,
    'What proof makes this move credible before you commit',
  ];
  const fullUnlocks = [
    'Exact hard-skill gaps to close first',
    'Proof asset that makes the pivot believable',
    'Role-aware learning path and action plan',
    '12-week roadmap with checkpoints',
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              {[
                topPressureTask ? `Most exposed task: ${topPressureTask.task_name}` : null,
                bestPivot?.title ? `Leading direction: ${bestPivot.title}` : null,
                'Full report adds the proof and hard-skill logic',
              ].filter(Boolean).map((item) => (
                <span key={item} style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.6)', border: `1px solid ${palette.border}`, color: palette.textSoft, fontSize: '12px', fontWeight: 800 }}>
                  {item}
                </span>
              ))}
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

        <div className="hook-stats" style={{ marginBottom: '18px' }}>
          <span className="section-label">What you can act on now</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.9fr)', gap: '12px' }} className="two-col">
            <div className="hook-item" style={{ alignItems: 'flex-start' }}>
              <MonoIcon name="next-first" tone="orange" />
              <div>
                <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>
                  Start with one visible move, not a full reinvention.
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>
                  {immediateAction}
                </div>
              </div>
            </div>

            <div className="hook-item" style={{ alignItems: 'flex-start', borderColor: 'rgba(65, 194, 174, 0.18)' }}>
              <MonoIcon name="proof" tone="teal" />
              <div>
                <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>
                  This free scan gives you the direction.
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.65 }}>
                  The paid report turns that direction into the exact skill, proof, and milestone logic you would need to follow through.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hook-stats" style={{ marginBottom: '18px' }}>
          <span className="section-label">What the full report settles next</span>
          <div className="hook-grid">
            {teaserLoopItems.map((item, index) => (
              <div key={item} className="hook-item" style={{ alignItems: 'flex-start' }}>
                <MonoIcon name={index === 0 ? 'decision' : index === 1 ? 'skill-gaps' : 'roadmap'} tone={index === 0 ? 'orange' : index === 1 ? 'teal' : 'default'} />
                <div>
                  <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>{item}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.55 }}>
                    {index === 0
                      ? 'The preview gives the leading path. The full report explains the ranking and tradeoff.'
                      : index === 1
                        ? 'Not every missing skill matters equally. The paid layer ranks the ones worth closing first.'
                        : 'The full report tells you what to build, show, and test before you overcommit.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
  const [activeTab, setActiveTab] = useState(normalizeReportTab(payload.initialTab || 'breakdown'));
  const [selectedPlanPath, setSelectedPlanPath] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const [startDate, setStartDate] = useState(payload.startDate || '');
  const [weekProgressState, setWeekProgressState] = useState(
    hydrateLegacyWeekProgress(payload.completedWeeks || [], payload.weekNotes || {}, payload.weekProgress || {})
  );
  const [outcomeState, setOutcomeState] = useState(normalizeOutcomeEntry(payload.outcome));
  const [reportData, setReportData] = useState(payload.reportData);
  const [actionEmailStatus, setActionEmailStatus] = useState('idle');
  const [refreshStatus, setRefreshStatus] = useState('idle');
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
  const recommendationStack = reportData.recommendation_stack || {};
  const proofAssetBuilder = reportData.proof_asset_builder || {};
  const stayProofAssetBuilder = reportData.stay_proof_asset_builder || {};
  const refreshSummary = reportData.refresh_summary || null;
  const bestPivot = pivots[0] || null;
  const heroPath = tier === 'full' && recommendationStack?.primary?.type === 'stay'
    ? (stayPath || bestPivot || {})
    : (bestPivot || {});
  const aiLeveragePlaybook = stayAndAdvance.ai_leverage_playbook || {};
  const roleOperatingSystem = stayAndAdvance.role_operating_system || {};
  const jobSafetyCase = stayAndAdvance.job_safety_case || {};
  const promotionCase = stayAndAdvance.promotion_case || {};
  const promotionConversationPack = stayAndAdvance.promotion_conversation_pack || {};
  const storageScope = useMemo(() => getStorageScope(reportData, payload.reportId), [reportData, payload.reportId]);
  const messages = getMessages(payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale);
  const completedWeeks = useMemo(() => getCompletedWeeks(weekProgressState), [weekProgressState]);
  const weekNotes = useMemo(() => getWeekNotes(weekProgressState), [weekProgressState]);
  const outcomeSummary = useMemo(() => buildOutcomeSummary(outcomeState), [outcomeState]);
  const outcomeFollowup = useMemo(() => buildOutcomeFollowupState({
    createdAt: payload.createdAt || reportData.generated_at || '',
    outcome: outcomeState,
  }), [payload.createdAt, reportData.generated_at, outcomeState]);
  const refreshContext = useMemo(() => buildProgressRefreshContext({
    reportData,
    weekProgressMap: weekProgressState,
    startDate,
    outcome: outcomeState,
    createdAt: payload.createdAt || reportData.generated_at || '',
    refreshedAt: reportData.refreshed_at || '',
  }), [outcomeState, payload.createdAt, reportData, startDate, weekProgressState]);
  const planPaths = useMemo(() => pivots, [pivots]);
  const activePath = planPaths[selectedPlanPath] || planPaths[0] || pivot || {};
  const planColor = getPivotColor(selectedPlanPath) || pColor;
  const stayColor = palette.teal;
  const activeMarketSignal = activePath?.live_market_signal || null;
  const showOutcomeTracker = tier === 'full' && Boolean(payload.reportId);
  const staySkillGapCounts = useMemo(() => {
    return (stayPath?.skill_gaps || []).reduce((acc, skill) => {
      acc[skill.gap_priority] = (acc[skill.gap_priority] || 0) + 1;
      return acc;
    }, { critical: 0, medium: 0, low: 0 });
  }, [stayPath]);

  useEffect(() => {
    setReportData(payload.reportData);
    setWeekProgressState(hydrateLegacyWeekProgress(payload.completedWeeks || [], payload.weekNotes || {}, payload.weekProgress || {}));
    setOutcomeState(normalizeOutcomeEntry(payload.outcome));
    setStartDate(payload.startDate || '');
    setRefreshStatus('idle');
    setActiveTab(normalizeReportTab(payload.initialTab || 'breakdown'));
  }, [payload.reportData, payload.tier]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchTab = new URLSearchParams(window.location.search).get('tab');
    const normalizedTab = normalizeReportTab(payload.initialTab || searchTab || 'breakdown');
    setActiveTab((current) => (current === normalizedTab ? current : normalizedTab));
  }, [payload.initialTab]);

  useEffect(() => {
    if (embedded || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const normalizedTab = normalizeReportTab(activeTab);
    if (normalizedTab === 'breakdown') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', normalizedTab);
    }
    const nextHref = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', nextHref);
  }, [activeTab, embedded]);

  useEffect(() => {
    if (!planPaths.length) return;
    if (selectedPlanPath > planPaths.length - 1) {
      setSelectedPlanPath(0);
    }
  }, [planPaths, selectedPlanPath]);

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
            reportId: payload.reportId,
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
    const intakeHref = payload.reportId ? `/report/${payload.reportId}/intake` : '/report/intake';
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
            {messages.audit.fullIntakeTitle}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.72, margin: 0 }}>
            {messages.audit.fullIntakeBody}
          </p>
          <Link
            href={intakeHref}
            style={{
              display: 'inline-flex',
              marginTop: '18px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '18px',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #FF8F4D, #FFC66C)',
              color: '#14181F',
              fontWeight: 900,
              boxShadow: '0 18px 40px rgba(255, 143, 77, 0.2)',
            }}
          >
            {messages.audit.buildPaidPlanButton}
          </Link>
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

  const saveOutcomePatch = async (patch, options = {}) => {
    const { immediate = true } = options;
    const nextOutcome = normalizeOutcomeEntry({
      ...outcomeState,
      ...patch,
    });

    setOutcomeState(nextOutcome);

    if (!payload.reportId || !immediate) return;

    const saved = await syncOutcome(payload.reportId, nextOutcome);
    if (saved) {
      setOutcomeState(normalizeOutcomeEntry(saved));
    }
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

  const refreshReportFromProgress = async () => {
    if (!payload.reportId || tier !== 'full' || !refreshContext.is_ready) return;

    setRefreshStatus('loading');

    try {
      const response = await fetch(`/api/reports/${payload.reportId}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.reportData) {
        throw new Error(json.error || 'Failed to refresh the report.');
      }

      setReportData(json.reportData);
      setSelectedPlanPath(0);
      setExpandedWeeks([1]);
      setRefreshStatus('done');

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
      console.error('Refresh from progress failed:', error);
      setRefreshStatus('failed');
    }
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
              <SignalStatCard label={messages.report.skillGapMap} value={(heroPath.skill_gaps || []).length} tone={pColor} />
              <SignalStatCard label={messages.report.week} value={heroPath.roadmap?.weeks?.length || 0} tone={palette.teal} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {tier === 'full' && (
          <RecommendationStackCard
            stack={recommendationStack}
            pivotColor={pColor}
            stayColor={palette.teal}
            decision={decision}
            careerRoi={careerRoi}
            first30Days={first30Days}
            stayAndAdvance={stayAndAdvance}
            stayPath={stayPath}
            bestPivot={bestPivot}
            summary={summary}
            messages={messages}
            emailStatus={actionEmailStatus}
          />
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
          {[['breakdown', 'tab-breakdown', messages.report.tabs[0]], ...(tier === 'full' && stayPath ? [['stay', 'decision', messages.report.tabs[1]]] : []), ['pivots', 'tab-pivots', tier === 'full' && stayPath ? messages.report.tabs[2] : messages.report.tabs[1]], ...(tier === 'full' ? [['plan', 'tab-plan', tier === 'full' && stayPath ? messages.report.tabs[3] : messages.report.tabs[2]]] : [])].map(([key, icon, label]) => (
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
                  setActiveTab('stay');
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
                    setSelectedPlanPath(index);
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
                      <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.6 }}>{compactCopy(item.fit_summary, 120)}</div>
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }} className="two-col">
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whoThisIsFor}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(item.who_this_is_for || item.fit_summary, 100)}</div>
                    </div>
                    <div style={{ background: `${itemColor}10`, border: `1px solid ${itemColor}24`, borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: itemColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.whyThisPathWins}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(item.why_this_path_wins || item.outcome, 100)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                      <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.whatYouAreBettingOn}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(item.what_you_are_betting_on || item.next_step, 100)}</div>
                    </div>
                  </div>

                  {(item.strengths_to_leverage || []).length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(item.strengths_to_leverage || []).slice(0, 4).map((strength) => (
                        <span key={strength} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: '12px', fontWeight: 700 }}>
                          {strength}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.live_market_signal && <MarketSignalCard signal={item.live_market_signal} color={itemColor} compact />}

                  {Array.isArray(item.tradeoffs) && item.tradeoffs.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'grid', gap: '7px' }}>
                      {item.tradeoffs.slice(0, 2).map((tradeoff) => (
                        <div key={tradeoff} style={{ display: 'flex', gap: '8px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>
                          <span style={{ color: '#8B4A1B', fontWeight: 900 }}>•</span>
                          <span>{compactCopy(tradeoff, 110)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'stay' && tier === 'full' && stayPath && (
          <>
            <div className="piq-card" style={{ padding: '24px', marginBottom: '22px', background: 'linear-gradient(160deg, rgba(27,111,99,0.12) 0%, rgba(255,255,255,0.96) 64%)', border: `1px solid ${stayColor}24`, boxShadow: '0 24px 50px rgba(19, 32, 42, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '18px' }}>
                <div style={{ maxWidth: '760px' }}>
                  <div style={{ color: stayColor, fontSize: '11px', fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: '8px' }}>{messages.report.stayAndAdvance}</div>
                  <h2 style={{ color: palette.text, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1.02, margin: '0 0 10px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                    {stayPath.title}
                  </h2>
                  <p style={{ color: palette.textMuted, fontSize: '15px', lineHeight: 1.65, margin: 0 }}>
                    {compactCopy(stayAndAdvance.recommendation || stayPath.fit_summary, 155)}
                  </p>
                </div>
                <div style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${stayColor}24`, minWidth: '210px' }}>
                  <div style={{ color: stayColor, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{messages.report.promotionPath}</div>
                  <div style={{ color: palette.text, fontSize: '17px', fontWeight: 900, marginBottom: '4px' }}>{stayAndAdvance.promotion_path?.next_title || stayPath.title}</div>
                  <div style={{ color: palette.textMuted, fontSize: '12px', lineHeight: 1.6 }}>{stayAndAdvance.promotion_path?.timeline || '3-9 months'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="two-col">
                {[
                  [messages.report.match, `${stayPath.match_score || 0}%`],
                  [messages.report.transitionWindow, stayAndAdvance.promotion_path?.timeline || stayPath.transition_time],
                  [messages.report.advance30DayLabels[2], stayAndAdvance.thirty_day_plan?.metric_to_move],
                  [messages.report.proofAssetToShip, stayAndAdvance.thirty_day_plan?.proof_asset?.title],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 800, lineHeight: 1.5 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginTop: '12px' }} className="two-col">
                {[
                  ['Own this workflow', stayAndAdvance?.ai_this_week_plan?.workflow],
                  ['Ship this', stayAndAdvance?.ai_this_week_plan?.output],
                  ['Tell leadership', stayAndAdvance?.ai_this_week_plan?.share_with_manager],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
                    <div style={{ color: stayColor, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{compactCopy(value, 92)}</div>
                  </div>
                ))}
              </div>
            </div>

            <PathDecisionMatrix
              stayPath={stayPath}
              stayAndAdvance={stayAndAdvance}
              bestPivot={bestPivot}
              backupPivot={recommendationStack.conservative_backup || pivots[1] || null}
              messages={messages}
            />

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '14px' }}>
                <StaySectionHeader
                  color={stayColor}
                  eyebrow="Work this role differently"
                  title="Use AI to change the shape of the job before you chase a new title."
                  body="Start with one workflow, one visible proof point, and one leadership signal that makes your current role harder to replace."
                />
                {!stayPath.live_market_signal && (
                  <div className="piq-card" style={{ padding: '20px', background: 'linear-gradient(180deg, rgba(27,111,99,0.08), rgba(255,255,255,0.92))', border: `1px solid ${stayColor}22` }}>
                    <div style={{ color: stayColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      Market reality check
                    </div>
                    <div style={{ color: palette.text, fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                      Stay-and-advance is strategy-led for a reason
                    </div>
                    <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, marginBottom: '10px' }}>
                      We validate this path through current-role leverage, workflow ownership, and how fast you can create visible proof inside your job.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Current-lane leverage', 'Workflow redesign', 'Faster visible proof'].map((item) => (
                        <span key={item} style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.82)', border: `1px solid ${palette.border}`, color: palette.textMuted, fontSize: '12px', fontWeight: 700 }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <UseAiThisWeekCard plan={stayAndAdvance?.ai_this_week_plan} color={stayColor} />
                <JobSafetyCaseCard safetyCase={jobSafetyCase} color={stayColor} />
                <PromotionCaseCard promotionCase={promotionCase} color={stayColor} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>{messages.report.skillGapMap}</div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.6 }}>
                    {staySkillGapCounts.critical} critical, {staySkillGapCounts.medium} medium, {staySkillGapCounts.low} lower-priority. Build these in your current lane first.
                  </div>
                </div>
              </div>

              <StaySectionHeader
                color={stayColor}
                eyebrow="Build visible leverage"
                title="Make your workflow, proof, and promotion story feel like one operating system."
                body="This is the part that turns AI from a tool you use into a reason the team trusts you with broader scope."
              />
              <StayOperatingNarrativeCard
                color={stayColor}
                stayAndAdvance={stayAndAdvance}
                playbook={aiLeveragePlaybook}
                system={roleOperatingSystem}
                safetyCase={jobSafetyCase}
                promotionCase={promotionCase}
                promotionConversationPack={promotionConversationPack}
              />
              <CapabilityDeltaCard
                path={stayPath}
                color={stayColor}
                body="Use this to see which stay-and-advance capabilities already have signal and which ones still need visible evidence inside your current lane."
              />
              <ProofAssetBuilderCard builder={stayProofAssetBuilder} color={stayColor} />
              <ProofReadinessCard
                builder={stayProofAssetBuilder}
                color={stayColor}
                body="The stay path now has a defined proof brief. The remaining job is to capture one workflow change, one metric shift, and one broader-scope ask."
              />
              <PromotionConversationPackCard pack={promotionConversationPack} color={stayColor} />
              <LearningPathCard path={stayPath} color={stayColor} />
              <div style={{ display: 'grid', gap: '14px' }}>
                {(stayPath.skill_gaps || []).map((skill) => (
                  <SkillGapCard key={`${stayPath.id}-${skill.skill_name}`} skill={skill} color={stayColor} messages={messages} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'plan' && tier === 'full' && (
          <>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {planPaths.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedPlanPath(index)}
                  className="chip"
                  style={{
                    background: selectedPlanPath === index ? `${getPivotColor(index)}20` : 'var(--bg-card)',
                    color: selectedPlanPath === index ? getPivotColor(index) : 'var(--text-muted)',
                    outline: selectedPlanPath === index ? `1.5px solid ${getPivotColor(index)}` : '1.5px solid var(--border)',
                  }}
                >
                  {getPivotIcon(index)} {item.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: '18px', marginBottom: '24px' }} className="two-col">
              <div className="piq-card" style={{ padding: '24px', background: `linear-gradient(160deg, ${planColor}12 0%, rgba(255, 255, 255, 0.94) 62%)`, border: `1px solid ${planColor}24`, boxShadow: '0 24px 50px rgba(19, 32, 42, 0.08)' }}>
                <div style={{ color: planColor, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{messages.report.currentFocus}</div>
                <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{currentFocus?.week?.title || activePath.title}</h2>
                <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.65, marginBottom: '14px' }}>{compactCopy(currentFocus?.week?.goal || activePath.fit_summary, 140)}</p>
                {currentFocus?.week && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }} className="two-col">
                      <div style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                        <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whyThisWeekExists}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{compactCopy(currentFocus.week.why_this_week, 95)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${palette.border}`, borderRadius: '14px', padding: '14px' }}>
                        <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.problemThisWeekSolves}</div>
                        <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{compactCopy(currentFocus.week.problem_being_solved, 95)}</div>
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
              <RefreshFromProgressCard
                refreshContext={refreshContext}
                refreshSummary={refreshSummary}
                status={refreshStatus}
                onRefresh={refreshReportFromProgress}
                locale={payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale}
              />
              {showOutcomeTracker && (
                <OutcomeTrackerCard
                  outcome={outcomeState}
                  summary={outcomeSummary}
                  followup={outcomeFollowup}
                  onSave={saveOutcomePatch}
                  locale={payload.uiLocale || payload.locale || getBrowserLocale() || reportData.locale}
                />
              )}
              {activeMarketSignal && <MarketSignalCard signal={activeMarketSignal} color={planColor} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>{messages.report.skillGapMap}</div>
                  <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
                    {skillGapCounts.critical} critical gaps, {skillGapCounts.medium} medium gaps, {skillGapCounts.low} lower-priority gaps. Build order is designed to make this path credible as fast as possible.
                  </div>
                </div>
              </div>
              <CapabilityDeltaCard path={activePath} color={planColor} />
              <ProofAssetBuilderCard builder={proofAssetBuilder} color={planColor} />
              <ProofReadinessCard builder={proofAssetBuilder} color={planColor} />
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '10px', marginBottom: '12px' }} className="two-col">
                          <div style={{ padding: '12px 13px', borderRadius: '14px', background: 'rgba(255,255,255,0.76)', border: `1px solid ${palette.border}` }}>
                            <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Goal</div>
                            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{compactCopy(week.goal, 130)}</div>
                          </div>
                          <div style={{ padding: '12px 13px', borderRadius: '14px', background: `${planColor}10`, border: `1px solid ${planColor}22` }}>
                            <div style={{ color: planColor, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{messages.report.successSignal}</div>
                            <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.55 }}>{compactCopy(week.success_signal, 90)}</div>
                          </div>
                        </div>

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

                            <details style={{ borderRadius: '14px', background: 'rgba(19,32,42,0.04)', border: `1px solid ${palette.border}`, padding: '14px' }}>
                              <summary style={{ cursor: 'pointer', color: palette.text, fontSize: '12px', fontWeight: 800 }}>
                                See rationale and recovery notes
                              </summary>
                              <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                                  <div style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                                    <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.whyThisWeekMatters}</div>
                                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(week.why_this_week, 120)}</div>
                                  </div>
                                  <div style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                                    <div style={{ color: palette.text, fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.problemBeingSolved}</div>
                                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(week.problem_being_solved, 120)}</div>
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                                  <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '14px', padding: '14px' }}>
                                    <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.commonBlockers}</div>
                                    <ul style={{ margin: 0, paddingLeft: '18px', color: palette.textMuted, fontSize: '13px', lineHeight: 1.65 }}>
                                      {(week.common_blockers || []).slice(0, 3).map((blocker) => (
                                        <li key={blocker}>{blocker}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: '14px', padding: '14px' }}>
                                    <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.catchUpPlan}</div>
                                    <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(week.catch_up_plan, 120)}</div>
                                  </div>
                                </div>

                                <div style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '14px', padding: '14px' }}>
                                  <div style={{ color: '#5B65C6', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{messages.report.encouragement}</div>
                                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.6 }}>{compactCopy(week.encouragement, 120)}</div>
                                </div>
                              </div>
                            </details>

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
                                onChange={(event) => setWeekProgressState((prev) => updateWeekProgressState(prev, week.week_number, { notes: event.target.value }))}
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
