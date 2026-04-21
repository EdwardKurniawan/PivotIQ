'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './brand-logo';
import { getMessages } from '../lib/i18n';
import { hasLeadershipSignals } from '../lib/intake-data';

const GOAL_NOW_OPTIONS = ['stay_and_advance', 'hybrid_transition', 'active_pivot', 'not_sure'];
const TIMELINE_URGENCY_OPTIONS = ['within_3_months', 'within_6_months', 'within_12_months', 'exploring_only'];
const YEARS_EXPERIENCE_OPTIONS = ['0_2', '3_5', '6_10', '11_plus'];
const LOCATION_PREFERENCE_OPTIONS = ['netherlands', 'europe', 'united_states', 'global_remote', 'other'];
const AI_MATURITY_OPTIONS = ['never_use_it', 'occasionally', 'weekly', 'repeatable_workflows', 'team_level_adoption'];
const MANAGEMENT_SCOPE_OPTIONS = ['none', 'small-team', 'larger-team'];
const DECISION_SCOPE_OPTIONS = ['internal-ops', 'customer-revenue', 'regulated-high-stakes'];
const TECHNICAL_CAPABILITY_OPTIONS = ['no_code_only', 'advanced_spreadsheets', 'sql_bi', 'scripting_python', 'software_engineering'];
const SALARY_TOLERANCE_OPTIONS = ['cannot_take_cut', 'up_to_10_percent', 'up_to_20_percent', 'flexible_for_right_move'];
const PROOF_STATE_OPTIONS = ['none', 'internal_project', 'dashboard_or_analysis', 'workflow_or_playbook', 'portfolio_or_case_study'];

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255,255,255,0.82)',
  panelSoft: 'rgba(255,255,255,0.68)',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
};

function parseSignalList(value) {
  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function ChoiceChipGroup({ options, value, onSelect, labels }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            style={{
              borderRadius: '999px',
              border: '1px solid transparent',
              outline: `1px solid ${active ? 'rgba(27, 111, 99, 0.38)' : 'rgba(19,27,35,0.08)'}`,
              background: active ? 'rgba(27, 111, 99, 0.12)' : 'rgba(255,255,255,0.58)',
              color: active ? palette.teal : palette.textMuted,
              padding: '11px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {labels?.[option] || option}
          </button>
        );
      })}
    </div>
  );
}

function panelStyle(background = palette.panel) {
  return {
    borderRadius: '28px',
    border: `1px solid ${palette.border}`,
    background,
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
  };
}

export default function FullReportIntake({
  reportId = null,
  payload,
  uiLocale = 'en',
  backHref = '/report',
}) {
  const router = useRouter();
  const messages = getMessages(uiLocale || payload?.locale || 'en');
  const profile = payload?.reportData?.profile || payload?.intakeProfile || {};
  const clarifiers = profile?.clarifiers && typeof profile.clarifiers === 'object' ? profile.clarifiers : {};
  const selectedTasks = Array.isArray(profile.selected_tasks)
    ? profile.selected_tasks
    : Array.isArray(payload?.tasks)
      ? payload.tasks.map((task) => ({ task_id: task, label: task, category: 'custom', source: 'fallback' }))
      : [];
  const leadershipSignals = useMemo(() => hasLeadershipSignals(selectedTasks), [selectedTasks]);

  const [goalNow, setGoalNow] = useState(clarifiers.goal_now || '');
  const [timelineUrgency, setTimelineUrgency] = useState(clarifiers.timeline_urgency || '');
  const [yearsExperienceBand, setYearsExperienceBand] = useState(clarifiers.years_experience_band || '');
  const [locationPreference, setLocationPreference] = useState(clarifiers.location_preference || '');
  const [aiMaturity, setAiMaturity] = useState(clarifiers.ai_maturity || '');
  const [managementScope, setManagementScope] = useState(clarifiers.management_scope || '');
  const [decisionScope, setDecisionScope] = useState(clarifiers.decision_scope || '');
  const [technicalCapability, setTechnicalCapability] = useState(clarifiers.technical_capability || '');
  const [salaryTolerance, setSalaryTolerance] = useState(clarifiers.salary_tolerance || '');
  const [proofState, setProofState] = useState(clarifiers.proof_state || '');
  const [domainFocus, setDomainFocus] = useState(clarifiers.domain_focus || '');
  const [coreSystemsInput, setCoreSystemsInput] = useState(Array.isArray(clarifiers.core_systems) ? clarifiers.core_systems.join(', ') : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrecision, setShowPrecision] = useState(Boolean(
    clarifiers.technical_capability ||
    clarifiers.salary_tolerance ||
    clarifiers.proof_state ||
    clarifiers.domain_focus ||
    (Array.isArray(clarifiers.core_systems) && clarifiers.core_systems.length)
  ));

  const mergedClarifiers = useMemo(() => ({
    ...clarifiers,
    goal_now: goalNow || null,
    timeline_urgency: timelineUrgency || null,
    years_experience_band: yearsExperienceBand || null,
    location_preference: locationPreference || null,
    ai_maturity: aiMaturity || null,
    role_blend: clarifiers.role_blend || 'mixed',
    management_scope: leadershipSignals ? managementScope || null : null,
    decision_scope: decisionScope || null,
    technical_capability: technicalCapability || null,
    salary_tolerance: salaryTolerance || null,
    proof_state: proofState || null,
    domain_focus: domainFocus.trim() || null,
    core_systems: parseSignalList(coreSystemsInput),
  }), [
    aiMaturity,
    clarifiers,
    coreSystemsInput,
    decisionScope,
    domainFocus,
    goalNow,
    leadershipSignals,
    locationPreference,
    managementScope,
    proofState,
    salaryTolerance,
    technicalCapability,
    timelineUrgency,
    yearsExperienceBand,
  ]);

  const summaryItems = [
    { label: messages.audit.titleLabel, value: payload?.jobTitle || profile.job_title || 'Current role' },
    { label: messages.audit.tasksLabel, value: `${selectedTasks.length} ${selectedTasks.length === 1 ? messages.audit.selectedSummarySingle : messages.audit.selectedSummaryPlural}` },
    { label: messages.audit.rolePrompt, value: messages.audit.roleBlendOptions?.[clarifiers.role_blend || 'mixed'] || 'Execution + strategy' },
  ];

  const requiredSignalItems = [
    { label: messages.audit.goalPrompt, done: Boolean(goalNow) },
    { label: messages.audit.timelinePrompt, done: Boolean(timelineUrgency) },
    { label: messages.audit.experiencePrompt, done: Boolean(yearsExperienceBand) },
    { label: messages.audit.locationPrompt, done: Boolean(locationPreference) },
    { label: messages.audit.aiMaturityPrompt, done: Boolean(aiMaturity) },
  ];

  async function handleSubmit() {
    if (!goalNow || !timelineUrgency || !yearsExperienceBand || !locationPreference || !aiMaturity) {
      setError(messages.audit.fullIntakeRequiredError);
      return;
    }

    setError('');
    setLoading(true);

    const intakeProfile = {
      ...profile,
      clarifiers: mergedClarifiers,
      locale: payload?.locale || profile?.locale || 'en',
    };

    try {
      const taskLabels = Array.isArray(payload?.tasks) && payload.tasks.length
        ? payload.tasks
        : Array.isArray(profile?.tasks) && profile.tasks.length
          ? profile.tasks
          : selectedTasks.map((task) => task.label);

      let response;
      if (reportId) {
        response = await fetch(`/api/reports/${reportId}/intake`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: payload?.locale || profile?.locale || 'en',
            clarifiers: mergedClarifiers,
          }),
        });
      } else {
        response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'full',
            locale: payload?.locale || profile?.locale || 'en',
            jobTitle: payload?.jobTitle || profile?.job_title || '',
            industry: payload?.industry || profile?.industry || '',
            tasks: taskLabels,
            email: payload?.email || '',
            intakeProfile,
          }),
        });
      }

      const json = await response.json();
      if (!response.ok || !json.reportData) {
        throw new Error(json.error || 'Failed to generate the full report.');
      }

      const nextStoredPayload = JSON.stringify({
        ...payload,
        reportData: json.reportData,
        reportId: json.reportId || reportId || payload?.reportId || null,
        intakeProfile,
        generatedAt: new Date().toISOString(),
      });

      sessionStorage.setItem('pivotiq_report', nextStoredPayload);
      localStorage.setItem('pivotiq_report', nextStoredPayload);
      localStorage.setItem('pivotiq_tier', 'full');

      router.push(reportId ? `/report/${reportId}` : '/report');
    } catch (submitError) {
      console.error('Full intake generation failed:', submitError);
      setError(messages.audit.loadingError);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, padding: '32px 20px 72px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <BrandLogo subtitle={messages.audit.subtitle} />
        </div>

        <div style={{ ...panelStyle(), padding: '30px', marginBottom: '22px' }}>
          <div style={{ color: palette.teal, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {messages.audit.fullIntakeEyebrow}
          </div>
          <h1 style={{ color: palette.text, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 0.96, letterSpacing: '-0.05em', margin: '0 0 12px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            {messages.audit.fullIntakeTitle}
          </h1>
          <p style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.8, maxWidth: '760px', margin: 0 }}>
            {messages.audit.fullIntakeBody}
          </p>
          <div style={{ display: 'inline-flex', marginTop: '16px', borderRadius: '999px', padding: '9px 13px', background: 'rgba(27,111,99,0.10)', border: '1px solid rgba(27,111,99,0.18)', color: palette.teal, fontSize: '12px', fontWeight: 900 }}>
            {messages.audit.fullIntakeTimeNote}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 0.9fr)', gap: '20px' }} className="two-col">
          <div style={{ ...panelStyle(), padding: '26px' }}>
            <div style={{ borderRadius: '22px', border: `1px solid ${palette.border}`, background: palette.panelSoft, padding: '18px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: palette.text, fontSize: '15px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.02em' }}>
                    {messages.audit.fullIntakeCoreTitle}
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                    {messages.audit.fullIntakeCoreBody}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '999px', background: 'rgba(27,111,99,0.1)', border: '1px solid rgba(27,111,99,0.16)', color: palette.teal, padding: '8px 12px', fontSize: '12px', fontWeight: 800 }}>
                  {requiredSignalItems.filter((item) => item.done).length}/{requiredSignalItems.length} {messages.audit.fullIntakeRequiredBadge}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {requiredSignalItems.map((item) => (
                  <div key={item.label} style={{ borderRadius: '18px', border: `1px solid ${palette.border}`, background: 'rgba(255,255,255,0.7)', padding: '12px 13px' }}>
                    <div style={{ color: item.done ? palette.teal : palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {item.done ? messages.audit.fullIntakeDone : messages.audit.fullIntakeNeeded}
                    </div>
                    <div style={{ color: palette.text, fontSize: '13px', lineHeight: 1.45, fontWeight: 700 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <div style={{ color: palette.text, fontSize: '16px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {messages.audit.fullIntakeSectionTitle}
              </div>
              <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.75 }}>
                {messages.audit.fullIntakeSectionBody}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.goalPrompt}</label>
              <ChoiceChipGroup options={GOAL_NOW_OPTIONS} value={goalNow} onSelect={setGoalNow} labels={messages.audit.goalOptions} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.timelinePrompt}</label>
              <ChoiceChipGroup options={TIMELINE_URGENCY_OPTIONS} value={timelineUrgency} onSelect={setTimelineUrgency} labels={messages.audit.timelineOptions} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.experiencePrompt}</label>
              <ChoiceChipGroup options={YEARS_EXPERIENCE_OPTIONS} value={yearsExperienceBand} onSelect={setYearsExperienceBand} labels={messages.audit.experienceOptions} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.locationPrompt}</label>
              <ChoiceChipGroup options={LOCATION_PREFERENCE_OPTIONS} value={locationPreference} onSelect={setLocationPreference} labels={messages.audit.locationOptions} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.aiMaturityPrompt}</label>
              <ChoiceChipGroup options={AI_MATURITY_OPTIONS} value={aiMaturity} onSelect={setAiMaturity} labels={messages.audit.aiMaturityOptions} />
            </div>

            {leadershipSignals && (
              <div style={{ marginBottom: '20px' }}>
                <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.managementPrompt}</label>
                <ChoiceChipGroup options={MANAGEMENT_SCOPE_OPTIONS} value={managementScope} onSelect={setManagementScope} labels={messages.audit.managementScopeOptions} />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.decisionScopePrompt}</label>
              <ChoiceChipGroup options={DECISION_SCOPE_OPTIONS} value={decisionScope} onSelect={setDecisionScope} labels={messages.audit.decisionScopeOptions} />
            </div>

            <div style={{ borderRadius: '22px', border: `1px solid ${palette.border}`, background: palette.panelSoft, padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: showPrecision ? '14px' : 0 }}>
                <div>
                  <div style={{ color: palette.text, fontSize: '14px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                    {messages.audit.precisionTitle}
                  </div>
                  <div style={{ color: palette.textMuted, fontSize: '13px', lineHeight: 1.7 }}>
                    {messages.audit.precisionBody}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrecision((value) => !value)}
                  style={{
                    borderRadius: '999px',
                    border: `1px solid ${palette.border}`,
                    background: 'rgba(255,255,255,0.7)',
                    color: palette.text,
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {showPrecision ? messages.audit.precisionHide : messages.audit.precisionShow}
                </button>
              </div>

              {showPrecision && (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.technicalCapabilityPrompt}</label>
                    <ChoiceChipGroup options={TECHNICAL_CAPABILITY_OPTIONS} value={technicalCapability} onSelect={setTechnicalCapability} labels={messages.audit.technicalCapabilityOptions} />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.salaryTolerancePrompt}</label>
                    <ChoiceChipGroup options={SALARY_TOLERANCE_OPTIONS} value={salaryTolerance} onSelect={setSalaryTolerance} labels={messages.audit.salaryToleranceOptions} />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.proofStatePrompt}</label>
                    <ChoiceChipGroup options={PROOF_STATE_OPTIONS} value={proofState} onSelect={setProofState} labels={messages.audit.proofStateOptions} />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.domainFocusPrompt}</label>
                    <input
                      className="piq-input"
                      value={domainFocus}
                      onChange={(event) => setDomainFocus(event.target.value)}
                      placeholder={messages.audit.domainFocusPlaceholder}
                      style={{ marginBottom: '8px' }}
                    />
                    <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: 0 }}>{messages.audit.domainFocusBody}</p>
                  </div>

                  <div>
                    <label className="section-label" style={{ color: '#7A5A43', marginBottom: '10px' }}>{messages.audit.coreSystemsPrompt}</label>
                    <textarea
                      className="piq-input"
                      value={coreSystemsInput}
                      onChange={(event) => setCoreSystemsInput(event.target.value)}
                      placeholder={messages.audit.coreSystemsPlaceholder}
                      rows={3}
                      style={{ minHeight: '96px', resize: 'vertical', marginBottom: '8px' }}
                    />
                    <p style={{ color: palette.textSoft, fontSize: '12px', marginBottom: 0 }}>{messages.audit.coreSystemsBody}</p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div style={{ marginTop: '20px', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(242, 138, 67, 0.22)', background: 'rgba(242, 138, 67, 0.10)', color: '#8B4A1B', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  border: 'none',
                  borderRadius: '18px',
                  padding: '15px 22px',
                  background: 'linear-gradient(135deg, #FF8F4D, #FFC66C)',
                  color: '#14181F',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.65 : 1,
                  boxShadow: '0 18px 40px rgba(255, 143, 77, 0.2)',
                }}
              >
                {loading ? messages.audit.buildingPaidPlanButton : messages.audit.buildPaidPlanButton}
              </button>

              <Link
                href={backHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '18px',
                  padding: '15px 18px',
                  border: `1px solid ${palette.border}`,
                  color: palette.textMuted,
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.6)',
                }}
              >
                {messages.audit.backToPreview}
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ ...panelStyle(), padding: '22px' }}>
              <div style={{ color: palette.text, fontSize: '16px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '14px' }}>
                {messages.audit.capturedSignalTitle}
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {summaryItems.map((item) => (
                  <div key={item.label} style={{ borderRadius: '18px', border: `1px solid ${palette.border}`, background: 'rgba(255,255,255,0.68)', padding: '14px 15px' }}>
                    <div style={{ color: palette.textSoft, fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{item.label}</div>
                    <div style={{ color: palette.text, fontSize: '14px', fontWeight: 700, lineHeight: 1.5 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...panelStyle(palette.panelSoft), padding: '22px' }}>
              <div style={{ color: palette.navy, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {messages.audit.fullIntakeWhyTitle}
              </div>
              <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75 }}>
                {messages.audit.fullIntakeWhyBody}
              </div>
            </div>

            <div style={{ ...panelStyle(palette.panelSoft), padding: '22px' }}>
              <div style={{ color: palette.orange, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {messages.audit.fullIntakeNextTitle}
              </div>
              <div style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.75 }}>
                {messages.audit.fullIntakeNextBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
