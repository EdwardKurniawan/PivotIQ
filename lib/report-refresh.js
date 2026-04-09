import { buildExecutionSummary, getCompletedWeeks } from './progress-tracking.js';
import { buildOutcomeSummary, hasMeaningfulOutcome, normalizeOutcomeEntry } from './outcome-tracking.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function humanizeEnum(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return normalized
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function goalNowLabel(value) {
  if (value === 'stay_and_advance') return 'Stay and advance';
  if (value === 'hybrid_transition') return 'Hybrid transition';
  if (value === 'active_pivot') return 'Active pivot';
  return '';
}

function timelineLabel(value) {
  if (value === 'within_3_months') return 'Useful within 3 months';
  if (value === 'within_6_months') return 'Useful within 6 months';
  if (value === 'within_12_months') return 'Useful within 12 months';
  if (value === 'exploring_only') return 'Exploring only';
  return '';
}

function experienceLabel(value) {
  if (value === '0_2') return '0-2 years';
  if (value === '3_5') return '3-5 years';
  if (value === '6_10') return '6-10 years';
  if (value === '11_plus') return '11+ years';
  return '';
}

function locationLabel(value) {
  if (value === 'united_states') return 'United States';
  if (value === 'europe') return 'Europe';
  if (value === 'global_remote') return 'Global remote';
  if (value === 'other') return 'Other target market';
  return '';
}

function aiMaturityLabel(value) {
  if (value === 'never_used') return 'Never used AI at work';
  if (value === 'occasionally') return 'Uses AI occasionally';
  if (value === 'weekly') return 'Uses AI weekly';
  if (value === 'repeatable_workflows') return 'Has repeatable AI workflows';
  if (value === 'team_level_adoption') return 'Drives team-level AI adoption';
  return '';
}

function technicalCapabilityLabel(value) {
  if (value === 'no_code_only') return 'No-code only';
  if (value === 'advanced_spreadsheets') return 'Advanced spreadsheets';
  if (value === 'sql_bi') return 'SQL / BI';
  if (value === 'scripting_python') return 'Scripting / Python';
  if (value === 'software_engineering') return 'Software engineering';
  return '';
}

function salaryToleranceLabel(value) {
  if (value === 'cannot_take_cut') return 'Cannot take a pay cut';
  if (value === 'up_to_10_percent') return 'Can absorb up to a 10% pay cut';
  if (value === 'up_to_20_percent') return 'Can absorb up to a 20% pay cut';
  if (value === 'flexible_for_right_move') return 'Flexible for the right move';
  return '';
}

function proofStateLabel(value) {
  if (value === 'none') return 'No visible proof yet';
  if (value === 'internal_project') return 'Has an internal project';
  if (value === 'dashboard_or_analysis') return 'Has a dashboard or analysis';
  if (value === 'workflow_or_playbook') return 'Has a workflow or playbook';
  if (value === 'portfolio_or_case_study') return 'Has a portfolio or case study';
  return '';
}

function buildClarifierInputs(reportData = null) {
  const clarifiers = reportData?.profile?.clarifiers || {};
  const items = [
    ['Goal now', goalNowLabel(clarifiers.goal_now)],
    ['Timeline', timelineLabel(clarifiers.timeline_urgency)],
    ['Experience', experienceLabel(clarifiers.years_experience_band)],
    ['Target market', locationLabel(clarifiers.location_preference)],
    ['AI maturity', aiMaturityLabel(clarifiers.ai_maturity)],
    ['Technical capability', technicalCapabilityLabel(clarifiers.technical_capability)],
    ['Pay tolerance', salaryToleranceLabel(clarifiers.salary_tolerance)],
    ['Starting proof', proofStateLabel(clarifiers.proof_state)],
  ];

  return items
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .slice(0, 6);
}

function sanitizeComparisonValue(value, fallback = 'No clear change yet') {
  const text = String(value || '').trim();
  return text || fallback;
}

function getLearningFocus(reportData = null) {
  return reportData?.recommendation_stack?.primary?.learning_focus
    || reportData?.paid_value_summary?.first_learning_step
    || reportData?.stay_path?.learning_path?.[0]?.skill_name
    || reportData?.pivots?.[0]?.learning_path?.[0]?.skill_name
    || '';
}

function getProofAssetFocus(reportData = null) {
  return reportData?.recommendation_stack?.primary?.proof_asset
    || reportData?.paid_value_summary?.first_proof_asset
    || reportData?.proof_asset_builder?.title
    || '';
}

function buildComparisonRows(previousReportData = null, refreshedReportData = null) {
  const previousPrimary = getPrimaryMove(previousReportData);
  const nextPrimary = getPrimaryMove(refreshedReportData);
  const previousDecision = previousReportData?.decision?.headline || '';
  const nextDecision = refreshedReportData?.decision?.headline || '';
  const previousConfidence = previousPrimary.confidence_label || previousReportData?.decision?.confidence_label || '';
  const nextConfidence = nextPrimary.confidence_label || refreshedReportData?.decision?.confidence_label || '';
  const previousLearning = getLearningFocus(previousReportData);
  const nextLearning = getLearningFocus(refreshedReportData);
  const previousProof = getProofAssetFocus(previousReportData);
  const nextProof = getProofAssetFocus(refreshedReportData);

  return [
    {
      key: 'primary_move',
      label: 'Primary move',
      before: sanitizeComparisonValue(previousPrimary.title),
      after: sanitizeComparisonValue(nextPrimary.title),
    },
    {
      key: 'confidence',
      label: 'Confidence',
      before: sanitizeComparisonValue(previousConfidence),
      after: sanitizeComparisonValue(nextConfidence),
    },
    {
      key: 'decision_headline',
      label: 'Decision framing',
      before: sanitizeComparisonValue(previousDecision),
      after: sanitizeComparisonValue(nextDecision),
    },
    {
      key: 'learning_focus',
      label: 'First learning focus',
      before: sanitizeComparisonValue(previousLearning),
      after: sanitizeComparisonValue(nextLearning),
    },
    {
      key: 'proof_asset',
      label: 'Proof asset',
      before: sanitizeComparisonValue(previousProof),
      after: sanitizeComparisonValue(nextProof),
    },
  ].map((row) => ({
    ...row,
    changed: normalizeText(row.before) !== normalizeText(row.after),
  }));
}

function buildChangeDrivers(progressContext = {}, refreshedReportData = null) {
  const drivers = [];

  if (progressContext?.completed_weeks_count) {
    drivers.push(`${progressContext.completed_weeks_count} roadmap milestone${progressContext.completed_weeks_count === 1 ? '' : 's'} were marked complete.`);
  }

  if (progressContext?.proof_ready_count) {
    drivers.push(`${progressContext.proof_ready_count} proof-ready milestone${progressContext.proof_ready_count === 1 ? '' : 's'} told PivotIQ you have stronger visible evidence now.`);
  }

  if (progressContext?.manager_done_count) {
    drivers.push(`${progressContext.manager_done_count} manager conversation${progressContext.manager_done_count === 1 ? '' : 's'} signaled that the plan is being tested in the real environment, not just planned privately.`);
  }

  if (progressContext?.meaningful_outcome && progressContext?.outcome_summary?.traction_label) {
    drivers.push(`Outcome signal logged: ${progressContext.outcome_summary.traction_label}.`);
  }

  for (const note of (progressContext?.progress_notes || []).slice(0, 2)) {
    drivers.push(note);
  }

  const clarifierInputs = buildClarifierInputs(refreshedReportData);
  return {
    change_drivers: drivers.slice(0, 5),
    inputs_considered: clarifierInputs,
  };
}

function getPrimaryMove(reportData = null) {
  const stack = reportData?.recommendation_stack || {};
  const primary = stack?.primary || null;

  if (primary?.title) {
    return {
      title: primary.title,
      type: primary.type || 'pivot',
      confidence_label: primary.confidence_label || reportData?.decision?.confidence_label || '',
      market_evidence: primary.market_evidence || '',
    };
  }

  const firstPivot = Array.isArray(reportData?.pivots) ? reportData.pivots[0] : null;
  if (firstPivot?.title) {
    return {
      title: firstPivot.title,
      type: 'pivot',
      confidence_label: reportData?.decision?.confidence_label || '',
      market_evidence: firstPivot?.ranking_reason || '',
    };
  }

  const stayTitle = reportData?.stay_path?.title || reportData?.stay_and_advance?.promotion_path?.next_title || '';
  return {
    title: stayTitle,
    type: stayTitle ? 'stay' : 'unknown',
    confidence_label: reportData?.decision?.confidence_label || '',
    market_evidence: '',
  };
}

function collectProgressSignals(weekProgressMap = {}) {
  const entries = Object.entries(weekProgressMap || {})
    .map(([weekNumber, entry]) => ({
      week_number: Number(weekNumber),
      ...(entry || {}),
    }))
    .filter((entry) => Number.isFinite(entry.week_number));

  const touchedWeeks = entries.filter((entry) => (
    Boolean(entry.completed)
    || Boolean(String(entry.notes || '').trim())
    || entry.action_state !== 'not_started'
    || entry.proof_asset_status !== 'not_started'
    || entry.manager_conversation_status !== 'not_started'
    || Boolean(String(entry.last_active_step || '').trim())
  ));

  const progressNotes = touchedWeeks
    .sort((left, right) => {
      const rightTime = new Date(right.updated_at || 0).getTime();
      const leftTime = new Date(left.updated_at || 0).getTime();
      if (rightTime !== leftTime) return rightTime - leftTime;
      return right.week_number - left.week_number;
    })
    .slice(0, 4)
    .map((entry) => {
      const notes = String(entry.notes || entry.last_active_step || '').trim();
      return notes ? `Week ${entry.week_number}: ${notes}` : `Week ${entry.week_number}: ${entry.action_state.replaceAll('_', ' ')}`;
    });

  return {
    entries,
    touchedWeeks,
    progressNotes,
    buildModeCount: touchedWeeks.filter((entry) => ['researching', 'building', 'ready_to_share'].includes(entry.action_state)).length,
    proofReadyCount: touchedWeeks.filter((entry) => entry.proof_asset_status === 'ready').length,
    managerDoneCount: touchedWeeks.filter((entry) => entry.manager_conversation_status === 'done').length,
  };
}

function buildRefreshOpportunitySummary({ isReady, proofReadyCount, managerDoneCount, completedWeeksCount, buildModeCount, meaningfulOutcome }) {
  if (!isReady) {
    return {
      title: 'Refresh unlocks after you log real signal',
      body: 'Mark one milestone, move a week into build mode, log a proof asset, or record an outcome so PivotIQ can update the recommendation around what is actually working.',
    };
  }

  if (meaningfulOutcome) {
    return {
      title: 'You have real-world signal to refresh against',
      body: 'Outcome feedback is the strongest refresh input. PivotIQ can now tighten the recommendation around what is turning into traction instead of repeating the original guess.',
    };
  }

  if (proofReadyCount > 0 || managerDoneCount > 0) {
    return {
      title: 'Your proof and conversations can now sharpen the report',
      body: 'You already logged signal that goes beyond planning. Refreshing now should narrow the next move, update the action plan, and reflect the traction you created.',
    };
  }

  if (completedWeeksCount > 0 || buildModeCount > 0) {
    return {
      title: 'You have enough progress to refresh the plan',
      body: 'The report can now react to your actual build progress instead of staying frozen at the moment you first paid for it.',
    };
  }

  return {
    title: 'Refresh is available',
    body: 'You have enough execution signal logged for PivotIQ to tighten the recommendation and next-step plan.',
  };
}

export function buildProgressRefreshContext({
  reportData,
  weekProgressMap = {},
  startDate = '',
  outcome = null,
  createdAt = '',
  refreshedAt = '',
} = {}) {
  const primaryMove = getPrimaryMove(reportData);
  const roadmapWeeks = primaryMove.type === 'stay' && reportData?.stay_path?.roadmap?.weeks?.length
    ? reportData.stay_path.roadmap.weeks
    : reportData?.roadmap?.weeks || [];
  const completedWeeks = getCompletedWeeks(weekProgressMap);
  const {
    touchedWeeks,
    progressNotes,
    buildModeCount,
    proofReadyCount,
    managerDoneCount,
  } = collectProgressSignals(weekProgressMap);
  const normalizedOutcome = normalizeOutcomeEntry(outcome);
  const outcomeSummary = buildOutcomeSummary(normalizedOutcome);
  const meaningfulOutcome = hasMeaningfulOutcome(normalizedOutcome);
  const executionSummary = buildExecutionSummary({
    roadmapWeeks,
    weekProgressMap,
    startDate,
  });
  const completedWeeksCount = completedWeeks.length;
  const touchedWeeksCount = touchedWeeks.length;
  const isReady = Boolean(
    completedWeeksCount
    || buildModeCount
    || proofReadyCount
    || managerDoneCount
    || progressNotes.length
    || meaningfulOutcome
  );
  const opportunity = buildRefreshOpportunitySummary({
    isReady,
    proofReadyCount,
    managerDoneCount,
    completedWeeksCount,
    buildModeCount,
    meaningfulOutcome,
  });

  return {
    is_ready: isReady,
    title: opportunity.title,
    body: opportunity.body,
    primary_move: primaryMove,
    completed_weeks: completedWeeks,
    completed_weeks_count: completedWeeksCount,
    touched_weeks_count: touchedWeeksCount,
    build_mode_count: buildModeCount,
    proof_ready_count: proofReadyCount,
    manager_done_count: managerDoneCount,
    progress_notes: progressNotes,
    start_date: startDate || null,
    created_at: createdAt || null,
    refreshed_at: refreshedAt || null,
    execution_summary: executionSummary,
    outcome: normalizedOutcome,
    outcome_summary: outcomeSummary,
    meaningful_outcome: meaningfulOutcome,
  };
}

export function buildRefreshSummary({
  previousReportData,
  refreshedReportData,
  progressContext,
  refreshedAt = new Date().toISOString(),
} = {}) {
  const previousPrimary = getPrimaryMove(previousReportData);
  const nextPrimary = getPrimaryMove(refreshedReportData);
  const changedPrimary = normalizeText(previousPrimary.title) && normalizeText(previousPrimary.title) !== normalizeText(nextPrimary.title);
  const comparisonRows = buildComparisonRows(previousReportData, refreshedReportData);
  const changedRows = comparisonRows.filter((row) => row.changed);
  const sectionsUpdated = changedRows.map((row) => row.label);
  const whatChanged = [];

  if (changedPrimary) {
    whatChanged.push(`Primary move changed from ${previousPrimary.title} to ${nextPrimary.title}.`);
  } else if (nextPrimary.title) {
    whatChanged.push(`Primary move stayed on ${nextPrimary.title}, but the plan was tightened around your progress.`);
  }

  const confidenceRow = changedRows.find((row) => row.key === 'confidence');
  if (confidenceRow) {
    whatChanged.push(`Confidence changed from ${confidenceRow.before} to ${confidenceRow.after}.`);
  }

  const learningRow = changedRows.find((row) => row.key === 'learning_focus');
  if (learningRow) {
    whatChanged.push(`The first learning focus changed from ${learningRow.before} to ${learningRow.after}.`);
  }

  const proofRow = changedRows.find((row) => row.key === 'proof_asset');
  if (proofRow) {
    whatChanged.push(`The proof asset focus changed from ${proofRow.before} to ${proofRow.after}.`);
  }

  const { change_drivers, inputs_considered } = buildChangeDrivers(progressContext, refreshedReportData);

  const headline = changedPrimary
    ? 'Your report changed because your progress changed the best move'
    : 'Your report was refreshed around the progress you already created';
  const changedSectionText = sectionsUpdated.length
    ? ` It updated ${sectionsUpdated.slice(0, 3).join(', ').toLowerCase()}.`
    : '';
  const body = changedPrimary
    ? `PivotIQ saw enough new signal to move the primary recommendation away from ${previousPrimary.title || 'the old path'} and toward ${nextPrimary.title || 'a stronger path'}.${changedSectionText}`
    : `PivotIQ kept the main recommendation on ${nextPrimary.title || 'the strongest path'}, but updated the plan around the signal you logged.${changedSectionText}`;
  const nextAction = refreshedReportData?.next_move?.explanation
    || progressContext?.execution_summary?.body
    || 'Use the refreshed plan to choose the next visible step and turn it into proof before the momentum cools down.';

  return {
    headline,
    body,
    what_changed: whatChanged.slice(0, 4),
    previous_primary: previousPrimary.title || '',
    current_primary: nextPrimary.title || '',
    next_action: nextAction,
    refreshed_at: refreshedAt,
    confidence_delta: [
      previousPrimary.confidence_label || '',
      nextPrimary.confidence_label || '',
    ].filter(Boolean).join(' -> '),
    change_drivers,
    inputs_considered,
    comparison_rows: comparisonRows,
    sections_updated: sectionsUpdated,
  };
}
