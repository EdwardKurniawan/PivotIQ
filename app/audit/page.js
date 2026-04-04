'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '../../components/brand-logo';
import LanguageSwitcher from '../../components/language-switcher';
import { getBrowserLocale, getMessages } from '../../lib/i18n';
import {
  createCustomTask,
  getRecommendedTasks,
  getTaskSelectionSummary,
  hasLeadershipSignals,
  getTitleRecommendationContext,
  searchTasks,
} from '../../lib/intake-data';

const INDUSTRIES = [
  'Tech', 'Finance', 'Marketing', 'Healthcare',
  'Legal', 'Education', 'Sales', 'HR',
  'Consulting', 'Media', 'Real Estate', 'Other',
];

const ROLE_BLEND_OPTIONS = ['execution', 'mixed', 'strategy'];

const MANAGEMENT_SCOPE_OPTIONS = ['none', 'small-team', 'larger-team'];

const DECISION_SCOPE_OPTIONS = ['internal-ops', 'customer-revenue', 'regulated-high-stakes'];

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255, 255, 255, 0.8)',
  panelStrong: '#13202A',
  panelSoft: 'rgba(255, 255, 255, 0.66)',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  cream: '#FFF9F2',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
};

function panelStyle({ accent = 'rgba(143, 162, 179, 0.12)', background = palette.panel, padding = '22px' } = {}) {
  return {
    borderRadius: '26px',
    border: `1px solid ${accent}`,
    background,
    padding,
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
  };
}

function taskSignal(task) {
  const category = String(task.category || '').toLowerCase();
  if (category.includes('soft')) return { tone: palette.teal, width: '48%' };
  if (category.includes('analysis')) return { tone: palette.navy, width: '72%' };
  if (category.includes('management')) return { tone: palette.orange, width: '68%' };
  return { tone: palette.orange, width: '58%' };
}

function TaskCard({ task, onClick, selected = false, subtle = false }) {
  const signal = taskSignal(task);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        borderRadius: '18px',
        border: selected
          ? '1px solid rgba(242, 138, 67, 0.4)'
          : subtle
            ? '1px solid rgba(19, 27, 35, 0.1)'
            : '1px solid rgba(27, 111, 99, 0.16)',
        background: selected
          ? 'rgba(242, 138, 67, 0.12)'
          : subtle
            ? 'rgba(255, 255, 255, 0.62)'
            : 'rgba(255, 255, 255, 0.82)',
        padding: '15px 16px',
        textAlign: 'left',
        minWidth: 0,
        transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '58%', height: '6px', borderRadius: '999px', background: 'rgba(19, 27, 35, 0.08)', overflow: 'hidden' }}>
          <div style={{ width: signal.width, height: '100%', borderRadius: '999px', background: signal.tone }} />
        </div>
        <span style={{ color: signal.tone, fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {selected ? 'Live' : 'Fit'}
        </span>
      </div>
      <span style={{ color: palette.text, fontSize: '14px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.02em' }}>{task.label}</span>
      <span style={{ color: selected ? '#9A5727' : '#1B6F63', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{task.category}</span>
    </button>
  );
}

function getSelectedTaskCountLabel(count, messages) {
  return `${count} ${count === 1 ? messages.audit.selectedSummarySingle : messages.audit.selectedSummaryPlural}`;
}

function parseSignalList(value) {
  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function AuditPage() {
  const router = useRouter();
  const [locale, setLocale] = useState(getBrowserLocale());
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [titleProfile, setTitleProfile] = useState(null);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [titleCatalogStats, setTitleCatalogStats] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [primaryTasks, setPrimaryTasks] = useState([]);
  const [roleBlend, setRoleBlend] = useState('');
  const [managementScope, setManagementScope] = useState('');
  const [decisionScope, setDecisionScope] = useState('');
  const [domainFocus, setDomainFocus] = useState('');
  const [coreSystemsInput, setCoreSystemsInput] = useState('');
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [email, setEmail] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messages = getMessages(locale);
  const SCAN_STEPS = messages.audit.scanSteps;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (!titleProfile) {
      return;
    }

    const normalizedInput = jobTitle.trim().toLowerCase();
    const normalizedProfileTitle = String(titleProfile.title || '').trim().toLowerCase();

    if (normalizedInput !== normalizedProfileTitle) {
      setTitleProfile(null);
    }
  }, [jobTitle, titleProfile]);

  useEffect(() => {
    let cancelled = false;
    const normalizedInput = jobTitle.trim().toLowerCase();
    const normalizedSelectedTitle = String(titleProfile?.title || '').trim().toLowerCase();

    if (normalizedInput && normalizedInput === normalizedSelectedTitle) {
      setTitleSuggestions([]);
      return undefined;
    }

    if (jobTitle.trim().length < 2) {
      setTitleSuggestions([]);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/job-titles/search?q=${encodeURIComponent(jobTitle)}&limit=8`);
        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setTitleSuggestions(data.results || []);
          if (data.stats) {
            setTitleCatalogStats(data.stats);
          }
        }
      } catch {
        if (!cancelled) {
          setTitleSuggestions([]);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [jobTitle, titleProfile]);

  const selectedTaskIds = useMemo(() => selectedTasks.map((task) => task.task_id), [selectedTasks]);
  const selectedTaskLabels = useMemo(() => selectedTasks.map((task) => task.label), [selectedTasks]);
  const titleRecommendationContext = useMemo(
    () => getTitleRecommendationContext({ jobTitle, titleProfile, industry }),
    [jobTitle, titleProfile, industry]
  );
  const recommendedTasks = useMemo(
    () => getRecommendedTasks({ jobTitle, industry, selectedTaskIds, titleProfile }),
    [jobTitle, industry, selectedTaskIds, titleProfile]
  );
  const searchResults = useMemo(
    () => searchTasks(taskSearch, selectedTaskIds),
    [taskSearch, selectedTaskIds]
  );
  const leadershipSignals = useMemo(() => hasLeadershipSignals(selectedTasks), [selectedTasks]);
  const customTaskCount = useMemo(
    () => selectedTasks.filter((task) => task.source === 'custom').length,
    [selectedTasks]
  );

  const addTask = (task, sourceOverride = null) => {
    setSelectedTasks((previous) => {
      if (previous.some((item) => item.task_id === task.task_id) || previous.length >= 10) {
        return previous;
      }

      return [
        ...previous,
        {
          task_id: task.task_id,
          label: task.label,
          category: task.category,
          source: sourceOverride || task.source || 'recommended',
        },
      ];
    });
  };

  const removeTask = (taskId) => {
    setSelectedTasks((previous) => previous.filter((task) => task.task_id !== taskId));
    setPrimaryTasks((previous) => previous.filter((taskIdValue) => taskIdValue !== taskId));
  };

  const togglePrimaryTask = (taskId) => {
    setPrimaryTasks((previous) => {
      if (previous.includes(taskId)) {
        return previous.filter((value) => value !== taskId);
      }
      if (previous.length >= 3) {
        return [...previous.slice(1), taskId];
      }
      return [...previous, taskId];
    });
  };

  const handleAddCustomTask = () => {
    const customTask = createCustomTask(customTaskInput);

    if (!customTask) {
      return;
    }

    if (customTaskCount >= 3) {
      setError('Keep custom tasks to 3 or fewer so the report stays focused.');
      return;
    }

    addTask(customTask, 'custom');
    setCustomTaskInput('');
    setError('');
  };

  const goStep2 = () => {
    if (!jobTitle.trim()) {
      setError('Please enter your job title.');
      return;
    }
    if (!industry) {
      setError('Please select your industry.');
      return;
    }
    setError('');
    setStep(2);
  };

  const generate = async () => {
    if (selectedTasks.length < 3) {
      setError('Choose at least 3 tasks so the report can tell the difference between your title and your real workload.');
      return;
    }
    if (selectedTasks.length > 10) {
      setError('Keep it to 10 tasks or fewer. Choose the work that truly fills your week.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      setError('Enter a valid email address, or leave it blank for now.');
      return;
    }

    setError('');
    setLoading(true);
    setStep('scanning');

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx += 1;
      setScanProgress(Math.min(stepIdx * 26, 100));
      setScanStep(Math.min(stepIdx, SCAN_STEPS.length - 1));
      if (stepIdx >= 4) clearInterval(interval);
    }, 850);

    const intakeProfile = {
      job_title_raw: jobTitle,
      job_title_normalized: jobTitle,
      industry,
      linkedin_profile_url: linkedinProfileUrl.trim() || null,
      job_title_match: titleProfile
        ? {
            title: titleProfile.title,
            canonical_title: titleProfile.canonical_title || titleProfile.canonicalTitle,
            onet_soc_code: titleProfile.onet_soc_code,
            major_group_name: titleProfile.major_group_name || titleProfile.majorGroupName,
          }
        : null,
      selected_tasks: selectedTasks,
      primary_tasks: selectedTasks
        .filter((task) => primaryTasks.includes(task.task_id))
        .map((task) => task.label),
      clarifiers: {
        role_blend: roleBlend || null,
        management_scope: leadershipSignals ? managementScope || null : null,
        decision_scope: decisionScope || null,
        domain_focus: domainFocus.trim() || null,
        core_systems: parseSignalList(coreSystemsInput),
      },
    };

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          jobTitle,
          industry,
          tasks: selectedTaskLabels,
          email,
          intakeProfile,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const reportPayload = JSON.stringify({
        reportData: data.reportData,
        reportId: data.reportId,
        reportSlug: data.reportSlug,
        demoMode: data.demoMode,
        intakeProfile,
        jobTitle,
        industry,
        tasks: selectedTaskLabels,
        email,
        generatedAt: new Date().toISOString(),
        locale,
      });

      sessionStorage.setItem('pivotiq_report', reportPayload);
      localStorage.setItem('pivotiq_report', reportPayload);
      localStorage.removeItem('pivotiq_tier');

      setTimeout(() => router.push('/report'), 3600);
    } catch {
      clearInterval(interval);
      setLoading(false);
      setStep(2);
      setError(messages.audit.loadingError);
    }
  };

  if (step === 'scanning') {
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
        <div
          style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #F28A43, #1B6F63)',
            borderRadius: '50%',
            fontSize: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            animation: 'pulse-ring 2s ease-in-out infinite',
            position: 'relative',
            zIndex: 1,
          }}
        >
          P
        </div>

        <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
          Analyzing your career
        </h2>
        <p style={{ color: palette.textSoft, fontSize: '14px', marginBottom: '36px', position: 'relative', zIndex: 1 }}>
          {jobTitle} · {industry}
        </p>

        <div style={{ width: '100%', maxWidth: '420px', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              height: '100%',
              borderRadius: '99px',
              background: 'linear-gradient(90deg, #FF8F4D, #41C2AE)',
              boxShadow: '0 0 16px rgba(65, 194, 174, 0.32)',
              transition: 'width 0.7s ease',
              width: `${scanProgress}%`,
            }}
          />
        </div>
        <p style={{ color: palette.teal, fontSize: '13px', fontWeight: 700, marginBottom: '36px', letterSpacing: '0.04em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
          {SCAN_STEPS[scanStep]}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', width: '100%', maxWidth: '380px', ...panelStyle({ accent: 'rgba(19, 27, 35, 0.08)', background: 'rgba(255,255,255,0.7)', padding: '22px' }), position: 'relative', zIndex: 1 }}>
          {SCAN_STEPS.map((label, index) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: index < scanStep ? 'rgba(65, 194, 174, 0.2)' : index === scanStep ? 'rgba(255, 143, 77, 0.16)' : 'rgba(255,255,255,0.06)',
                  border: index <= scanStep ? '1.5px solid rgba(255, 143, 77, 0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                  color: index <= scanStep ? '#8B4A1B' : '#5C6D7B',
                  transition: 'all 0.3s',
                }}
              >
                {index < scanStep ? '✓' : index === scanStep ? '●' : ''}
              </div>
              <span
                style={{
                  color: index <= scanStep ? palette.text : '#6E8090',
                  fontSize: '13px',
                  fontWeight: index === scanStep ? 600 : 400,
                  transition: 'color 0.3s',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const step1Ready = jobTitle.trim() && industry;
  const step2Ready = selectedTasks.length >= 3 && selectedTasks.length <= 10;
  const stepShell = panelStyle({ accent: 'rgba(19, 27, 35, 0.08)', background: 'rgba(255,255,255,0.76)', padding: '28px' });
  const ctaStyle = {
    width: '100%',
    border: 'none',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #F28A43, #F6C06D)',
    color: '#13202A',
    border: '1px solid rgba(242, 138, 67, 0.34)',
    padding: '17px 22px',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 22px 48px rgba(242, 138, 67, 0.24)',
  };
  const secondaryButtonStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.58)',
    border: `1px solid ${palette.border}`,
    color: palette.text,
    fontSize: '14px',
    fontWeight: 700,
  };

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)',
        }}
      />
      <nav className="audit-nav" style={{ position: 'relative', zIndex: 2, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <BrandLogo subtitle={messages.audit.subtitle} />
        <div className="audit-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="hide-mobile" style={{ color: palette.textSoft, fontSize: '13px', padding: '10px 14px', borderRadius: '999px', border: `1px solid ${palette.border}`, background: 'rgba(255,255,255,0.58)' }}>
            {messages.audit.helper}
          </span>
          <LanguageSwitcher locale={locale} onChange={setLocale} />
          <Link
            href="/login"
            style={{
              padding: '12px 18px',
              borderRadius: '999px',
              color: '#41515D',
              background: 'rgba(255,255,255,0.62)',
              border: `1px solid ${palette.border}`,
              fontSize: '14px',
              fontWeight: 800,
            }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      <div className="audit-shell" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '34px 24px 88px', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: '880px' }} className="anim-fade-in audit-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: palette.textSoft, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{messages.audit.step} {step} {messages.audit.of} 2</span>
            <span style={{ color: palette.textSoft, fontSize: '13px' }}>
              {step === 1 ? messages.audit.stepRole : messages.audit.stepTasks}
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', marginBottom: '34px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #FF8F4D, #41C2AE)',
                width: step === 1 ? '50%' : '100%',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {step === 1 && (
              <div style={stepShell} className="audit-step-shell">
              <div style={{ maxWidth: '600px', marginBottom: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '18px' }} className="three-col">
                  {[
                    ['01', 'Role'],
                    ['02', 'Industry'],
                    ['03', 'Workload'],
                  ].map(([label, value], index) => (
                    <div key={label} style={{ padding: '12px 14px', borderRadius: '18px', background: 'rgba(255,255,255,0.58)', border: `1px solid ${palette.border}` }}>
                      <div style={{ color: index === 0 ? palette.orange : index === 1 ? palette.navy : palette.teal, fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                      <div style={{ color: palette.textMuted, fontSize: '13px', fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#6A7882', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{messages.audit.startLabel}</div>
                <h1 style={{ color: palette.text, fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.96, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                  {messages.audit.startTitle}
                </h1>
                <p style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.72 }}>
                  {messages.audit.startBody}
                </p>
              </div>

              <div
                style={{
                  marginBottom: '28px',
                  ...panelStyle({ accent: 'rgba(27, 111, 99, 0.16)', background: 'rgba(255,255,255,0.66)', padding: '20px' }),
                  boxShadow: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ color: palette.text, fontSize: '15px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.linkedinTitle}</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      {messages.audit.linkedinBody}
                    </p>
                  </div>
                  <button type="button" className="btn-ghost" disabled style={{ ...secondaryButtonStyle, width: 'auto', opacity: 0.6, cursor: 'not-allowed' }}>
                    {messages.audit.linkedinSoon}
                  </button>
                </div>
                <input
                  className="piq-input"
                  style={{ marginTop: '16px' }}
                  value={linkedinProfileUrl}
                  onChange={(event) => setLinkedinProfileUrl(event.target.value)}
                  placeholder={messages.audit.linkedinPlaceholder}
                />
              </div>

              <label className="section-label" style={{ color: '#7A5A43' }}>{messages.audit.jobTitleSection}</label>
              <div className="audit-title-field" style={{ position: 'relative', marginBottom: '28px' }}>
                <input
                  className="piq-input"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder={messages.audit.titleInputPlaceholder}
                  onKeyDown={(event) => event.key === 'Enter' && goStep2()}
                  autoFocus
                />
                {titleSuggestions.length > 0 && (
                  <div
                    className="audit-title-suggestions"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      right: 0,
                      zIndex: 6,
                      borderRadius: '22px',
                      border: `1px solid ${palette.border}`,
                      background: 'rgba(255,255,255,0.96)',
                      boxShadow: '0 22px 60px rgba(19, 33, 45, 0.14)',
                      overflow: 'hidden',
                    }}
                  >
                    {titleSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.slug}-${suggestion.onet_soc_code}`}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setJobTitle(suggestion.title);
                          setTitleProfile(suggestion);
                          setTitleSuggestions([]);
                        }}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderBottom: `1px solid ${palette.border}`,
                          background: 'transparent',
                          textAlign: 'left',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ color: palette.text, fontSize: '14px', fontWeight: 700 }}>{suggestion.title}</span>
                        <span style={{ color: palette.textSoft, fontSize: '12px', flexShrink: 0 }}>{suggestion.major_group_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {titleProfile && (
                  <div style={{ marginTop: '10px', display: 'inline-flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: '999px', background: 'rgba(27, 111, 99, 0.10)', border: '1px solid rgba(27, 111, 99, 0.16)' }}>
                    <span style={{ color: palette.teal, fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{messages.audit.mappedTitleFamily}</span>
                    <span style={{ color: palette.text, fontSize: '13px', fontWeight: 700 }}>
                      {titleRecommendationContext.titleFamily}
                    </span>
                  </div>
                )}
              </div>

              <label className="section-label" style={{ color: '#7A5A43' }}>{messages.audit.industrySection}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '34px' }}>
                {INDUSTRIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIndustry(value)}
                    className={`chip ${industry === value ? 'active-primary' : ''}`}
                    style={industry === value ? { background: 'rgba(242, 138, 67, 0.14)', color: '#8B4A1B', outlineColor: 'rgba(242, 138, 67, 0.45)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(242, 138, 67, 0.22)', background: 'rgba(242, 138, 67, 0.10)', color: '#8B4A1B', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button onClick={goStep2} disabled={!step1Ready} style={step1Ready ? ctaStyle : { ...ctaStyle, opacity: 0.45, cursor: 'default', boxShadow: 'none' }}>
                {messages.audit.continueToWorkload}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={stepShell} className="audit-step-shell">
              <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
                <div style={{ color: '#6A7882', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{messages.audit.workloadLabel}</div>
                <h1 style={{ color: palette.text, fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.98, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                  {messages.audit.tasksLabel}
                </h1>
                <p style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.72, marginBottom: '6px' }}>
                  {messages.audit.tasksBody}
                </p>
                <p style={{ color: palette.textSoft, fontSize: '13px' }}>
                  {messages.audit.tasksTarget}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  alignItems: 'start',
                  marginBottom: '28px',
                }}
              >
                <div style={{ ...panelStyle({ accent: 'rgba(27, 111, 99, 0.16)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none' }}>
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.recommendedTitle}</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      {messages.audit.recommendedBody}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                    {[palette.orange, palette.navy, palette.teal].map((tone, index) => (
                      <div key={tone} style={{ width: index === 2 ? '28px' : '10px', height: '10px', borderRadius: '999px', background: tone, opacity: index === 1 ? 0.85 : 1 }} />
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    {recommendedTasks.map((task) => (
                      <TaskCard key={task.task_id} task={task} onClick={() => addTask(task, 'recommended')} />
                    ))}
                  </div>
                </div>

                <div style={{ ...panelStyle({ accent: 'rgba(19, 27, 35, 0.08)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none' }}>
                  <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.searchTitle}</p>
                  <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>
                    {messages.audit.searchBody}
                  </p>
                  <input
                    className="piq-input"
                    value={taskSearch}
                    onChange={(event) => setTaskSearch(event.target.value)}
                    placeholder={messages.audit.searchPlaceholder}
                    style={{ marginBottom: taskSearch ? '12px' : 0 }}
                  />
                  {taskSearch && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {searchResults.length > 0 ? (
                        searchResults.map((task) => (
                          <TaskCard key={task.task_id} task={task} onClick={() => addTask(task, 'search')} subtle />
                        ))
                      ) : (
                        <div style={{ color: palette.textSoft, fontSize: '13px', lineHeight: 1.7 }}>
                          {messages.audit.noSearchMatch}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ ...panelStyle({ accent: 'rgba(242, 138, 67, 0.16)', background: 'rgba(255,255,255,0.72)', padding: '20px' }), boxShadow: 'none', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div>
                    <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.selectedTitle}</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      {selectedTasks.length > 0
                        ? `${getSelectedTaskCountLabel(selectedTasks.length, messages)} · ${getTaskSelectionSummary(selectedTasks)}`
                        : messages.audit.selectedBodyEmpty}
                    </p>
                  </div>
                  <span style={{ color: selectedTasks.length >= 3 && selectedTasks.length <= 8 ? palette.teal : '#8B4A1B', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {messages.audit.selectedTarget}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '16px' }} className="three-col">
                  {[
                    ['Tasks', String(selectedTasks.length), palette.orange],
                    ['Primary', String(primaryTasks.length), palette.navy],
                    ['Custom', String(customTaskCount), palette.teal],
                  ].map(([label, value, tone]) => (
                    <div key={label} style={{ padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.66)', border: `1px solid ${palette.border}` }}>
                      <div style={{ color: palette.textSoft, fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                      <div style={{ color: tone, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {selectedTasks.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedTasks.map((task) => (
                      <div
                        key={task.task_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'rgba(242, 138, 67, 0.10)',
                          border: '1px solid rgba(242, 138, 67, 0.16)',
                          borderRadius: '999px',
                          padding: '9px 13px',
                        }}
                      >
                        <span style={{ color: palette.text, fontSize: '13px' }}>{task.label}</span>
                        <button
                          type="button"
                          onClick={() => removeTask(task.task_id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#8B4A1B',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div style={{ ...panelStyle({ accent: 'rgba(19, 27, 35, 0.08)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none', marginBottom: '24px' }}>
                <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.customTaskTitle}</p>
                <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>
                  {messages.audit.customTaskBody}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    className="piq-input"
                    value={customTaskInput}
                    onChange={(event) => setCustomTaskInput(event.target.value)}
                    placeholder={messages.audit.customTaskInput}
                    style={{ flex: '1 1 320px', marginBottom: 0 }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddCustomTask();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddCustomTask} style={{ ...secondaryButtonStyle, width: 'auto' }}>
                    {messages.audit.addTask}
                  </button>
                </div>
              </div>

              {selectedTasks.length > 0 && (
                <div style={{ ...panelStyle({ accent: 'rgba(27, 111, 99, 0.16)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none', marginBottom: '24px' }}>
                  <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{messages.audit.quickClarifiersTitle}</p>
                  <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 18px' }}>
                    {messages.audit.quickClarifiersBody}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      {messages.audit.primaryPrompt}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selectedTasks.map((task) => (
                        <button
                          key={task.task_id}
                          type="button"
                          onClick={() => togglePrimaryTask(task.task_id)}
                          className={`chip ${primaryTasks.includes(task.task_id) ? 'active-primary' : ''}`}
                          style={primaryTasks.includes(task.task_id) ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                        >
                          {task.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: leadershipSignals ? '20px' : 0 }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      {messages.audit.rolePrompt}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {ROLE_BLEND_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRoleBlend(option)}
                          className={`chip ${roleBlend === option ? 'active-primary' : ''}`}
                          style={roleBlend === option ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                        >
                          {messages.audit.roleBlendOptions[option]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {leadershipSignals && (
                    <div>
                      <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                        {messages.audit.managementPrompt}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {MANAGEMENT_SCOPE_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setManagementScope(option)}
                            className={`chip ${managementScope === option ? 'active-primary' : ''}`}
                            style={managementScope === option ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                          >
                            {messages.audit.managementScopeOptions[option]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: leadershipSignals ? '20px' : '20px', marginBottom: '20px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      {messages.audit.decisionScopePrompt}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {DECISION_SCOPE_OPTIONS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDecisionScope(value)}
                          className={`chip ${decisionScope === value ? 'active-primary' : ''}`}
                          style={decisionScope === value ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                        >
                          {messages.audit.decisionScopeOptions[value]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      {messages.audit.domainFocusPrompt}
                    </label>
                    <input
                      className="piq-input"
                      value={domainFocus}
                      onChange={(event) => setDomainFocus(event.target.value)}
                      placeholder={messages.audit.domainFocusPlaceholder}
                      style={{ marginBottom: '8px' }}
                    />
                    <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: '20px' }}>
                      {messages.audit.domainFocusBody}
                    </p>

                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      {messages.audit.coreSystemsPrompt}
                    </label>
                    <textarea
                      className="piq-input"
                      value={coreSystemsInput}
                      onChange={(event) => setCoreSystemsInput(event.target.value)}
                      placeholder={messages.audit.coreSystemsPlaceholder}
                      rows={3}
                      style={{ marginBottom: '8px', minHeight: '96px', resize: 'vertical' }}
                    />
                    <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: 0 }}>
                      {messages.audit.coreSystemsBody}
                    </p>
                  </div>
                </div>
              )}

              <label className="section-label" style={{ color: '#7A5A43' }}>{messages.audit.optionalEmailLabel}</label>
              <input
                className="piq-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={messages.audit.optionalEmailPlaceholder}
                style={{ marginBottom: '6px' }}
              />
              <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: '28px' }}>
                {messages.audit.optionalEmailBody}
              </p>

              {error && (
                <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(242, 138, 67, 0.22)', background: 'rgba(242, 138, 67, 0.10)', color: '#8B4A1B', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button onClick={generate} disabled={!step2Ready || loading} style={!step2Ready || loading ? { ...ctaStyle, opacity: 0.45, cursor: 'default', boxShadow: 'none', marginBottom: '12px' } : { ...ctaStyle, marginBottom: '12px' }}>
                {loading ? <><span className="spinner" />{messages.audit.generatingButton}</> : messages.audit.generateButton}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', color: palette.textSoft, fontSize: '12px', marginBottom: '20px' }}>
                {messages.audit.generateMeta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <button onClick={() => setStep(1)} style={secondaryButtonStyle}>
                {messages.audit.backButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
