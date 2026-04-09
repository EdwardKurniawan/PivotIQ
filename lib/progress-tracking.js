export const ACTION_STATE_OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'researching', label: 'Researching' },
  { value: 'building', label: 'Building' },
  { value: 'ready_to_share', label: 'Ready to share' },
];

export const PROOF_ASSET_STATUS_OPTIONS = [
  { value: 'not_started', label: 'No proof yet' },
  { value: 'drafting', label: 'Drafting proof' },
  { value: 'ready', label: 'Proof ready' },
];

export const MANAGER_CONVERSATION_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not drafted' },
  { value: 'drafted', label: 'Draft prepared' },
  { value: 'done', label: 'Conversation done' },
];

export function buildDefaultWeekProgressEntry() {
  return {
    completed: false,
    notes: '',
    action_state: 'not_started',
    proof_asset_status: 'not_started',
    manager_conversation_status: 'not_started',
    last_active_step: '',
    completed_at: null,
    updated_at: null,
  };
}

export function buildWeekProgressMap(rows = []) {
  const entries = Array.isArray(rows) ? rows : [];
  return Object.fromEntries(entries.map((row) => [
    Number(row.week_number),
    {
      ...buildDefaultWeekProgressEntry(),
      completed: Boolean(row.completed_at),
      notes: row.notes || '',
      action_state: row.action_state || 'not_started',
      proof_asset_status: row.proof_asset_status || 'not_started',
      manager_conversation_status: row.manager_conversation_status || 'not_started',
      last_active_step: row.last_active_step || '',
      completed_at: row.completed_at || null,
      updated_at: row.updated_at || null,
    },
  ]));
}

export function hydrateLegacyWeekProgress(completedWeeks = [], weekNotes = {}, weekProgress = null) {
  if (weekProgress && typeof weekProgress === 'object' && Object.keys(weekProgress).length) {
    return Object.fromEntries(Object.entries(weekProgress).map(([key, value]) => [
      Number(key),
      {
        ...buildDefaultWeekProgressEntry(),
        ...(value || {}),
        completed: Boolean(value?.completed),
      },
    ]));
  }

  const completedSet = new Set(Array.isArray(completedWeeks) ? completedWeeks.map(Number) : []);
  const notesEntries = weekNotes && typeof weekNotes === 'object' ? Object.entries(weekNotes) : [];
  const weekNumbers = new Set([
    ...completedSet,
    ...notesEntries.map(([weekNumber]) => Number(weekNumber)),
  ]);

  return Object.fromEntries([...weekNumbers].map((weekNumber) => [
    weekNumber,
    {
      ...buildDefaultWeekProgressEntry(),
      completed: completedSet.has(weekNumber),
      notes: weekNotes?.[weekNumber] || '',
    },
  ]));
}

export function getWeekProgressEntry(weekProgressMap = {}, weekNumber) {
  return weekProgressMap?.[Number(weekNumber)] || buildDefaultWeekProgressEntry();
}

export function getCompletedWeeks(weekProgressMap = {}) {
  return Object.entries(weekProgressMap)
    .filter(([, entry]) => Boolean(entry?.completed))
    .map(([weekNumber]) => Number(weekNumber))
    .sort((left, right) => left - right);
}

export function getWeekNotes(weekProgressMap = {}) {
  return Object.fromEntries(
    Object.entries(weekProgressMap)
      .filter(([, entry]) => entry?.notes)
      .map(([weekNumber, entry]) => [Number(weekNumber), entry.notes])
  );
}

function fallbackNextAction(week) {
  return week?.actions?.[0] || week?.goal || 'Take the first visible step on this milestone.';
}

export function buildExecutionSummary({ roadmapWeeks = [], weekProgressMap = {}, startDate = '' }) {
  const weeks = Array.isArray(roadmapWeeks) ? roadmapWeeks : [];
  const completedWeeks = getCompletedWeeks(weekProgressMap);
  const nextWeek = weeks.find((week) => !completedWeeks.includes(week.week_number)) || weeks[weeks.length - 1] || null;
  const currentEntry = nextWeek ? getWeekProgressEntry(weekProgressMap, nextWeek.week_number) : buildDefaultWeekProgressEntry();
  const proofReadyCount = Object.values(weekProgressMap).filter((entry) => entry?.proof_asset_status === 'ready').length;
  const managerDoneCount = Object.values(weekProgressMap).filter((entry) => entry?.manager_conversation_status === 'done').length;

  if (!nextWeek) {
    return {
      nextWeek: null,
      title: 'Review and re-sequence',
      body: 'You completed the current roadmap. Review what worked, choose the next scope move, and decide whether to keep compounding internally or validate a new external path.',
      statusLabel: 'Roadmap complete',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (!startDate) {
    return {
      nextWeek,
      title: `Start week ${nextWeek.week_number}`,
      body: `Set your roadmap start date, then begin with: ${fallbackNextAction(nextWeek)}`,
      statusLabel: 'Set the timeline',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (currentEntry.action_state === 'not_started') {
    return {
      nextWeek,
      title: `Start week ${nextWeek.week_number}`,
      body: fallbackNextAction(nextWeek),
      statusLabel: 'Start the work',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (currentEntry.action_state === 'researching') {
    return {
      nextWeek,
      title: `Move week ${nextWeek.week_number} into build mode`,
      body: nextWeek.actions?.[1] || nextWeek.success_signal || 'Turn the research into a visible build.',
      statusLabel: 'Research is underway',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (currentEntry.action_state === 'building' && currentEntry.proof_asset_status !== 'ready') {
    return {
      nextWeek,
      title: `Turn week ${nextWeek.week_number} into proof`,
      body: nextWeek.proof_of_completion || 'Create the visible proof asset before moving on.',
      statusLabel: 'Proof still needed',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (currentEntry.manager_conversation_status !== 'done' && nextWeek.week_number >= 4) {
    return {
      nextWeek,
      title: 'Prepare the conversation that makes this visible',
      body: currentEntry.last_active_step || 'Use your manager pack, frame the workflow change in business language, and ask for broader scope.',
      statusLabel: 'Conversation prep',
      proofReadyCount,
      managerDoneCount,
    };
  }

  if (!currentEntry.completed) {
    return {
      nextWeek,
      title: `Close out week ${nextWeek.week_number}`,
      body: 'Mark the milestone complete once the work, proof, and notes are all in place so the next step becomes visible.',
      statusLabel: 'Ready to close',
      proofReadyCount,
      managerDoneCount,
    };
  }

  return {
    nextWeek,
    title: `Start week ${nextWeek.week_number + 1}`,
    body: 'You have momentum. Carry the pattern into the next milestone while the signal is still fresh.',
    statusLabel: 'Keep the momentum',
    proofReadyCount,
    managerDoneCount,
  };
}
