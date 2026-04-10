export const TRACTION_STATUS_OPTIONS = [
  { value: 'no_signal', label: 'No traction yet' },
  { value: 'team_adoption', label: 'Team started using it' },
  { value: 'broader_scope', label: 'Won broader scope' },
  { value: 'promotion_track', label: 'Opened promotion conversations' },
  { value: 'interview', label: 'Got interview traction' },
  { value: 'offer', label: 'Got an offer or title move' },
];

export const USEFULNESS_RATING_OPTIONS = [
  { value: 1, label: '1 · Too generic' },
  { value: 2, label: '2 · Weak fit' },
  { value: 3, label: '3 · Useful' },
  { value: 4, label: '4 · Strong direction' },
  { value: 5, label: '5 · Extremely useful' },
];

export function buildDefaultOutcomeEntry() {
  return {
    built_proof_asset: false,
    manager_conversation_done: false,
    traction_status: 'no_signal',
    usefulness_rating: null,
    notes: '',
    updated_at: null,
  };
}

export function hasMeaningfulOutcome(entry = null) {
  const outcome = normalizeOutcomeEntry(entry);
  return Boolean(
    outcome.built_proof_asset
    || outcome.manager_conversation_done
    || outcome.traction_status !== 'no_signal'
    || (outcome.usefulness_rating !== null && outcome.usefulness_rating !== undefined && outcome.usefulness_rating !== '')
    || String(outcome.notes || '').trim()
  );
}

export function normalizeOutcomeEntry(entry = null) {
  if (!entry || typeof entry !== 'object') {
    return buildDefaultOutcomeEntry();
  }

  const rawUsefulness = entry.usefulness_rating;
  const usefulness = rawUsefulness !== null && rawUsefulness !== undefined && rawUsefulness !== ''
    && Number.isFinite(Number(rawUsefulness))
    ? Number(entry.usefulness_rating)
    : null;

  return {
    ...buildDefaultOutcomeEntry(),
    built_proof_asset: Boolean(entry.built_proof_asset),
    manager_conversation_done: Boolean(entry.manager_conversation_done),
    traction_status: entry.traction_status || 'no_signal',
    usefulness_rating: usefulness && usefulness >= 1 && usefulness <= 5 ? usefulness : null,
    notes: entry.notes || '',
    updated_at: entry.updated_at || null,
  };
}

export function tractionStatusLabel(value) {
  return TRACTION_STATUS_OPTIONS.find((item) => item.value === value)?.label || 'No traction yet';
}

function usefulnessLabel(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not rated yet';
  return USEFULNESS_RATING_OPTIONS.find((item) => item.value === Number(value))?.label || 'Not rated yet';
}

function tractionScore(value) {
  if (value === 'offer') return 40;
  if (value === 'interview') return 32;
  if (value === 'promotion_track') return 26;
  if (value === 'broader_scope') return 24;
  if (value === 'team_adoption') return 18;
  return 0;
}

export function buildOutcomeSummary(entry = null) {
  const outcome = normalizeOutcomeEntry(entry);
  const score = Math.min(
    100,
    (outcome.built_proof_asset ? 24 : 0)
      + (outcome.manager_conversation_done ? 20 : 0)
      + tractionScore(outcome.traction_status)
      + ((outcome.usefulness_rating || 0) * 3)
  );

  let title = 'No outcome signal logged yet';
  let body = 'Track what happened after the report so PivotIQ can separate insight from real career traction.';
  let tone = 'muted';

  if (outcome.traction_status === 'offer') {
    title = 'A concrete career move landed';
    body = 'You logged an offer or formal title move. This is the strongest validation signal the recommendation system can collect.';
    tone = 'strong';
  } else if (outcome.traction_status === 'interview') {
    title = 'External market traction is showing up';
    body = 'You are getting interview interest. That means the proof and positioning are starting to translate outside your current team.';
    tone = 'strong';
  } else if (outcome.traction_status === 'promotion_track' || outcome.traction_status === 'broader_scope') {
    title = 'Internal leverage is growing';
    body = 'You are turning the report into more scope, visibility, or promotion signal inside your current lane.';
    tone = 'positive';
  } else if (outcome.traction_status === 'team_adoption' || outcome.built_proof_asset || outcome.manager_conversation_done) {
    title = 'Early momentum is forming';
    body = 'You have at least one visible signal in motion. Keep compounding proof, conversation, and measurable adoption.';
    tone = 'positive';
  }

  return {
    ...outcome,
    score,
    title,
    body,
    tone,
    traction_label: tractionStatusLabel(outcome.traction_status),
    usefulness_label: usefulnessLabel(outcome.usefulness_rating),
    recommendation_quality_state: score >= 85 ? 'validated' : score >= 35 ? 'encouraging' : 'unproven',
  };
}

export function buildOutcomeFollowupState({ createdAt, outcome, now = new Date() } = {}) {
  if (!createdAt) {
    return {
      is_due: false,
      stage: 'not_due',
      days_since: 0,
      title: 'Outcome tracking starts after the first week',
      body: 'Use the first week to build momentum, then log what actually happened once the work has had time to land.',
    };
  }

  const created = new Date(createdAt);
  const daysSince = Math.max(0, Math.floor((new Date(now).getTime() - created.getTime()) / 86400000));
  const meaningful = hasMeaningfulOutcome(outcome);
  const normalized = normalizeOutcomeEntry(outcome);

  if (daysSince < 7) {
    return {
      is_due: false,
      stage: 'not_due',
      days_since: daysSince,
      title: 'No follow-up due yet',
      body: `Come back after the first week and record whether the plan turned into proof, a manager conversation, or traction.`,
    };
  }

  if (!meaningful && daysSince >= 21) {
    return {
      is_due: true,
      stage: 'twenty_one_day_due',
      days_since: daysSince,
      title: '21-day follow-up is due',
      body: 'Three weeks is enough time to know whether this turned into visible proof, scope, interviews, or no traction. Log the result so the report reflects reality.',
    };
  }

  if (!meaningful) {
    return {
      is_due: true,
      stage: 'seven_day_due',
      days_since: daysSince,
      title: '7-day check-in is due',
      body: 'You should have enough signal by now to log whether you built the first proof asset or moved the plan into a real conversation.',
    };
  }

  if (daysSince >= 21 && normalized.traction_status === 'no_signal') {
    return {
      is_due: true,
      stage: 'twenty_one_day_refresh',
      days_since: daysSince,
      title: '21-day follow-up is worth updating',
      body: 'You logged early movement, but now is the time to record whether it turned into broader scope, interviews, or another real outcome.',
    };
  }

  return {
    is_due: false,
    stage: 'tracked',
    days_since: daysSince,
    title: 'Outcome signal is logged',
    body: 'Keep the tracker updated as new proof, conversations, or traction show up so the recommendation stays grounded in what is actually working.',
  };
}
