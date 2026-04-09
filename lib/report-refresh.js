import { buildExecutionSummary, getCompletedWeeks } from './progress-tracking.js';
import { buildOutcomeSummary, hasMeaningfulOutcome, normalizeOutcomeEntry } from './outcome-tracking.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
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
  const whatChanged = [];

  if (changedPrimary) {
    whatChanged.push(`Primary move changed from ${previousPrimary.title} to ${nextPrimary.title}.`);
  } else if (nextPrimary.title) {
    whatChanged.push(`Primary move stayed on ${nextPrimary.title}, but the plan was tightened around your progress.`);
  }

  if (progressContext?.proof_ready_count) {
    whatChanged.push(`Refresh considered ${progressContext.proof_ready_count} proof-ready milestone${progressContext.proof_ready_count === 1 ? '' : 's'}.`);
  }

  if (progressContext?.manager_done_count) {
    whatChanged.push(`Refresh considered ${progressContext.manager_done_count} manager conversation${progressContext.manager_done_count === 1 ? '' : 's'} already logged.`);
  }

  if (progressContext?.meaningful_outcome && progressContext?.outcome_summary?.traction_label) {
    whatChanged.push(`Outcome signal logged: ${progressContext.outcome_summary.traction_label}.`);
  }

  const headline = changedPrimary
    ? 'Your report changed because your progress changed the best move'
    : 'Your report was refreshed around the progress you already created';
  const body = changedPrimary
    ? `PivotIQ saw enough new signal to move the primary recommendation away from ${previousPrimary.title || 'the old path'} and toward ${nextPrimary.title || 'a stronger path'}.`
    : `PivotIQ kept the main recommendation on ${nextPrimary.title || 'the strongest path'}, but updated the plan, confidence read, and next steps around the signal you logged.`;
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
  };
}
