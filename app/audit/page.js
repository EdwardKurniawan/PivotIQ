'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const SCAN_STEPS = [
  'Scanning role patterns and workload signals...',
  'Analyzing task-level AI exposure...',
  'Mapping strengths, gaps, and pivot options...',
  'Building your personalized 90-day plan...',
];

const ROLE_BLEND_OPTIONS = [
  { value: 'execution', label: 'Mostly execution' },
  { value: 'mixed', label: 'Execution + strategy' },
  { value: 'strategy', label: 'Mostly strategy / leadership' },
];

const MANAGEMENT_SCOPE_OPTIONS = [
  { value: 'none', label: 'No direct reports' },
  { value: 'small-team', label: 'I manage a small team' },
  { value: 'larger-team', label: 'I manage a larger team' },
];

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

function TaskCard({ task, onClick, selected = false, subtle = false }) {
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
      <span style={{ color: palette.text, fontSize: '14px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.02em' }}>{task.label}</span>
      <span style={{ color: selected ? '#9A5727' : '#1B6F63', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{task.category}</span>
    </button>
  );
}

export default function AuditPage() {
  const router = useRouter();
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
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [email, setEmail] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      },
    };

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      });

      sessionStorage.setItem('pivotiq_report', reportPayload);
      localStorage.setItem('pivotiq_report', reportPayload);
      localStorage.removeItem('pivotiq_tier');

      setTimeout(() => router.push('/report'), 3600);
    } catch {
      clearInterval(interval);
      setLoading(false);
      setStep(2);
      setError('Something went wrong. Please try again.');
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
    background: palette.navy,
    color: '#FFF7F1',
    padding: '17px 22px',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 18px 40px rgba(19, 32, 42, 0.18)',
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
      <nav style={{ position: 'relative', zIndex: 2, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #F28A43, #1B6F63)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#071015', fontWeight: 900 }}>
            P
          </div>
          <div>
            <div style={{ color: palette.text, fontSize: '17px', fontWeight: 800, letterSpacing: '-0.03em' }}>PivotIQ</div>
            <div style={{ color: palette.textSoft, fontSize: '12px' }}>Free scan first</div>
          </div>
        </Link>
        <span className="hide-mobile" style={{ color: palette.textSoft, fontSize: '13px', padding: '10px 14px', borderRadius: '999px', border: `1px solid ${palette.border}`, background: 'rgba(255,255,255,0.58)' }}>
          Tell us your work. We map the pressure.
        </span>
      </nav>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '34px 24px 88px', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: '880px' }} className="anim-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: palette.textSoft, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Step {step} of 2</span>
            <span style={{ color: palette.textSoft, fontSize: '13px' }}>
              {step === 1 ? 'Your role' : 'Workload signal'}
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
            <div style={stepShell}>
              <div style={{ maxWidth: '600px', marginBottom: '30px' }}>
                <div style={{ color: '#6A7882', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Start the scan</div>
                <h1 style={{ color: palette.text, fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.96, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                  Tell us where you sit before the shift hits.
                </h1>
                <p style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.72 }}>
                  Your title is only the start. The better signal is your real workload, your industry, and where your weekly time actually goes.
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
                    <p style={{ color: palette.text, fontSize: '15px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>LinkedIn prefill is coming</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      Paste your profile for now if you want the report to reference your current positioning more cleanly.
                    </p>
                  </div>
                  <button type="button" className="btn-ghost" disabled style={{ ...secondaryButtonStyle, width: 'auto', opacity: 0.6, cursor: 'not-allowed' }}>
                    LinkedIn soon
                  </button>
                </div>
                <input
                  className="piq-input"
                  style={{ marginTop: '16px' }}
                  value={linkedinProfileUrl}
                  onChange={(event) => setLinkedinProfileUrl(event.target.value)}
                  placeholder="Optional LinkedIn profile URL"
                />
              </div>

              <label className="section-label" style={{ color: '#7A5A43' }}>YOUR JOB TITLE</label>
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <input
                  className="piq-input"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="e.g. Marketing Manager, Data Analyst, Accountant..."
                  onKeyDown={(event) => event.key === 'Enter' && goStep2()}
                  autoFocus
                />
                {titleSuggestions.length > 0 && (
                  <div
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
                    <span style={{ color: palette.teal, fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Matched title family</span>
                    <span style={{ color: palette.text, fontSize: '13px', fontWeight: 700 }}>
                      {titleRecommendationContext.titleFamily}
                    </span>
                  </div>
                )}
              </div>

              <label className="section-label" style={{ color: '#7A5A43' }}>INDUSTRY</label>
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
                Continue to workload →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={stepShell}>
              <div style={{ maxWidth: '680px', marginBottom: '28px' }}>
                <div style={{ color: '#6A7882', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Map the workload</div>
                <h1 style={{ color: palette.text, fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.05em', lineHeight: 0.98, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
                  What actually fills your week?
                </h1>
                <p style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.72, marginBottom: '6px' }}>
                  Pick the work that takes real time. Then tell us which tasks dominate your week so the report can connect the problem to the right pivot.
                </p>
                <p style={{ color: palette.textSoft, fontSize: '13px' }}>
                  Recommended target: 5–8 tasks. Minimum: 3.
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
                    <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Recommended for your role</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      Suggested from your matched title family, title wording, and industry. Start here, then search or add what is missing.
                    </p>
                    {titleProfile && (
                      <p style={{ color: palette.textSoft, fontSize: '12px', lineHeight: 1.7, margin: '8px 0 0' }}>
                        Using O*NET title family: {titleRecommendationContext.titleFamily}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    {recommendedTasks.map((task) => (
                      <TaskCard key={task.task_id} task={task} onClick={() => addTask(task, 'recommended')} />
                    ))}
                  </div>
                </div>

                <div style={{ ...panelStyle({ accent: 'rgba(19, 27, 35, 0.08)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none' }}>
                  <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Search more tasks</p>
                  <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>
                    Search for work like forecasting, stakeholder reporting, vendor coordination, QA, or policy documentation.
                  </p>
                  <input
                    className="piq-input"
                    value={taskSearch}
                    onChange={(event) => setTaskSearch(event.target.value)}
                    placeholder="Search tasks"
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
                          No exact match yet. Add it as a custom task below if it is a real part of your week.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ ...panelStyle({ accent: 'rgba(242, 138, 67, 0.16)', background: 'rgba(255,255,255,0.72)', padding: '20px' }), boxShadow: 'none', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div>
                    <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Selected workload</p>
                    <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                      {selectedTasks.length > 0
                        ? `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} selected · ${getTaskSelectionSummary(selectedTasks)}`
                        : 'Pick at least 3 tasks that truly consume time every week.'}
                    </p>
                  </div>
                  <span style={{ color: selectedTasks.length >= 3 && selectedTasks.length <= 8 ? palette.teal : '#8B4A1B', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Target 5–8
                  </span>
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
                <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Add a custom task</p>
                <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>
                  Use this if your real work is missing from the suggestions. Keep it to 3 custom tasks maximum.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    className="piq-input"
                    value={customTaskInput}
                    onChange={(event) => setCustomTaskInput(event.target.value)}
                    placeholder="e.g. board prep, vendor audits, pricing analysis"
                    style={{ flex: '1 1 320px', marginBottom: 0 }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddCustomTask();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddCustomTask} style={{ ...secondaryButtonStyle, width: 'auto' }}>
                    Add task
                  </button>
                </div>
              </div>

              {selectedTasks.length > 0 && (
                <div style={{ ...panelStyle({ accent: 'rgba(27, 111, 99, 0.16)', background: 'rgba(255,255,255,0.68)', padding: '20px' }), boxShadow: 'none', marginBottom: '24px' }}>
                  <p style={{ color: palette.text, fontSize: '16px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Quick clarifiers</p>
                  <p style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7, margin: '0 0 18px' }}>
                    These answers help us produce a roadmap that feels more specific, more believable, and more worth paying for.
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                      WHICH TASKS TAKE THE MOST TIME EACH WEEK? PICK UP TO 3.
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
                      WHICH BEST DESCRIBES YOUR ROLE?
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {ROLE_BLEND_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRoleBlend(option.value)}
                          className={`chip ${roleBlend === option.value ? 'active-primary' : ''}`}
                          style={roleBlend === option.value ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {leadershipSignals && (
                    <div>
                      <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>
                        DO YOU DIRECTLY MANAGE PEOPLE?
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {MANAGEMENT_SCOPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setManagementScope(option.value)}
                            className={`chip ${managementScope === option.value ? 'active-primary' : ''}`}
                            style={managementScope === option.value ? { background: 'rgba(27, 111, 99, 0.12)', color: palette.teal, outlineColor: 'rgba(27, 111, 99, 0.38)' } : { background: 'rgba(255,255,255,0.58)', color: palette.textMuted, outlineColor: 'rgba(19,27,35,0.08)' }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <label className="section-label" style={{ color: '#7A5A43' }}>OPTIONAL EMAIL FOR DELIVERY LATER</label>
              <input
                className="piq-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                style={{ marginBottom: '6px' }}
              />
              <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: '28px' }}>
                Leave this blank if you just want the free scan right now. Add it if you want delivery after unlock.
              </p>

              {error && (
                <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(242, 138, 67, 0.22)', background: 'rgba(242, 138, 67, 0.10)', color: '#8B4A1B', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button onClick={generate} disabled={!step2Ready || loading} style={!step2Ready || loading ? { ...ctaStyle, opacity: 0.45, cursor: 'default', boxShadow: 'none', marginBottom: '12px' } : { ...ctaStyle, marginBottom: '12px' }}>
                {loading ? <><span className="spinner" />Analyzing your career risk...</> : 'See My Free Risk Scan →'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', color: palette.textSoft, fontSize: '12px', marginBottom: '20px' }}>
                <span>Free scan (~90 sec)</span>
                <span>No card required</span>
                <span>No spam</span>
              </div>

              <button onClick={() => setStep(1)} style={secondaryButtonStyle}>
                ← Back to previous step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
