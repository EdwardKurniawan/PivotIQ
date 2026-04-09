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

export function usefulnessLabel(value) {
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
