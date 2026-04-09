import { buildOutcomeSummary, normalizeOutcomeEntry } from './outcome-tracking.js';
import { normalizeReportData } from './report-data.js';
import { createSupabaseAdminClient } from './supabase/admin.js';

function increment(map, key, amount = 1) {
  const normalized = key || 'unknown';
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function mapToCountList(map, labelKey = 'key') {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])))
    .map(([key, count]) => ({ [labelKey]: key, count }));
}

function buildBucketStats() {
  return {
    count: 0,
    proof_count: 0,
    manager_count: 0,
    traction_count: 0,
    usefulness_sum: 0,
    usefulness_count: 0,
    outcome_score_sum: 0,
    validated_count: 0,
    encouraging_count: 0,
  };
}

function addOutcomeToBucket(bucket, outcomeSummary) {
  bucket.count += 1;
  bucket.outcome_score_sum += Number(outcomeSummary.score || 0);
  if (outcomeSummary.built_proof_asset) bucket.proof_count += 1;
  if (outcomeSummary.manager_conversation_done) bucket.manager_count += 1;
  if (outcomeSummary.traction_status && outcomeSummary.traction_status !== 'no_signal') bucket.traction_count += 1;
  if (Number.isFinite(Number(outcomeSummary.usefulness_rating))) {
    bucket.usefulness_sum += Number(outcomeSummary.usefulness_rating);
    bucket.usefulness_count += 1;
  }
  if (outcomeSummary.recommendation_quality_state === 'validated') bucket.validated_count += 1;
  if (outcomeSummary.recommendation_quality_state === 'encouraging') bucket.encouraging_count += 1;
}

function finalizeBuckets(map, labelKey) {
  return [...map.entries()]
    .map(([key, bucket]) => ({
      [labelKey]: key,
      count: bucket.count,
      proof_rate: Math.round((bucket.proof_count / Math.max(bucket.count, 1)) * 100),
      manager_rate: Math.round((bucket.manager_count / Math.max(bucket.count, 1)) * 100),
      traction_rate: Math.round((bucket.traction_count / Math.max(bucket.count, 1)) * 100),
      avg_usefulness: bucket.usefulness_count ? Number((bucket.usefulness_sum / bucket.usefulness_count).toFixed(2)) : null,
      avg_outcome_score: Math.round(bucket.outcome_score_sum / Math.max(bucket.count, 1)),
      validated_count: bucket.validated_count,
      encouraging_count: bucket.encouraging_count,
    }))
    .sort((left, right) => right.avg_outcome_score - left.avg_outcome_score || right.count - left.count || String(left[labelKey]).localeCompare(String(right[labelKey])));
}

function isMeaningfulOutcome(outcome) {
  return Boolean(
    outcome
    && (
      outcome.built_proof_asset
      || outcome.manager_conversation_done
      || outcome.traction_status !== 'no_signal'
      || (outcome.usefulness_rating !== null && outcome.usefulness_rating !== undefined && outcome.usefulness_rating !== '' && Number.isFinite(Number(outcome.usefulness_rating)))
      || String(outcome.notes || '').trim()
    )
  );
}

function inferRoleBucket(jobTitle = '', industry = '') {
  const text = `${jobTitle} ${industry}`.toLowerCase();

  if (/\b(fp&a|finance|financial|accounting|controller|treasury|budget|forecast)\b/.test(text)) return 'finance';
  if (/\b(hr|human resources|people ops|people operations|talent|recruiting|employee relations)\b/.test(text)) return 'people';
  if (/\b(project manager|program manager|program management|delivery|operations manager|pmo|scrum)\b/.test(text)) return 'project-operations';
  if (/\b(legal|compliance|contract)\b/.test(text)) return 'legal-compliance';
  if (/\b(procurement|sourcing|supplier|vendor)\b/.test(text)) return 'procurement';
  if (/\b(education|enablement|learning|instructional|training)\b/.test(text)) return 'education-enablement';
  if (/\b(customer success|customer education|account management|support)\b/.test(text)) return 'customer';
  if (/\b(marketing|growth|content|brand|demand gen)\b/.test(text)) return 'marketing';
  if (/\b(data analyst|analytics|business intelligence|bi|data science)\b/.test(text)) return 'analytics';
  if (/\b(executive assistant|assistant|administrative|office manager)\b/.test(text)) return 'admin';
  if (/\b(product manager|product operations|product marketing)\b/.test(text)) return 'product';
  return 'general';
}

function buildActionItems({
  scannedReports,
  reportsWithOutcome,
  confidenceStats,
  typeStats,
  roleStats,
  proofRate,
  tractionRate,
}) {
  const items = [];
  const coverageRate = Math.round((reportsWithOutcome / Math.max(scannedReports, 1)) * 100);
  const lowConfidence = confidenceStats.find((item) => item.confidence_state === 'low-confidence');
  const strategyLed = confidenceStats.find((item) => item.confidence_state === 'strategy-led');
  const stayType = typeStats.find((item) => item.recommendation_type === 'stay');
  const pivotType = typeStats.find((item) => item.recommendation_type === 'pivot');
  const weakRoleBuckets = roleStats.filter((item) => item.count >= 3 && ((item.avg_usefulness || 0) < 3 || item.traction_rate < 20));

  if (coverageRate < 25) {
    items.push({
      priority: 'high',
      title: 'Collect more outcome feedback',
      detail: `Only ${coverageRate}% of the scanned full reports have meaningful outcome feedback. The recommendation engine needs more real-world follow-through data to improve confidently.`,
    });
  }

  if (lowConfidence && lowConfidence.count >= 3 && lowConfidence.traction_rate < 15) {
    items.push({
      priority: 'high',
      title: 'Demote low-confidence primaries faster',
      detail: `Low-confidence recommendations are converting into traction only ${lowConfidence.traction_rate}% of the time in the current sample. Lean harder on stay-path or conservative backups when evidence is thin.`,
    });
  }

  if (strategyLed && strategyLed.count >= 3 && strategyLed.proof_rate < 35) {
    items.push({
      priority: 'medium',
      title: 'Strengthen proof-building on strategy-led reports',
      detail: `Strategy-led recommendations are only reaching proof-ready status ${strategyLed.proof_rate}% of the time. The proof asset builder or first-30-days sequence likely needs to be more concrete.`,
    });
  }

  if (stayType && pivotType && stayType.avg_outcome_score >= pivotType.avg_outcome_score + 10) {
    items.push({
      priority: 'medium',
      title: 'Lean harder on stay-and-advance when it wins',
      detail: `Stay-path recommendations are outperforming pivots by ${stayType.avg_outcome_score - pivotType.avg_outcome_score} outcome-score points in this sample. Consider making stay-path the default more often when confidence is not market-backed.`,
    });
  }

  if (weakRoleBuckets.length) {
    items.push({
      priority: 'medium',
      title: 'Review weak role buckets',
      detail: `${weakRoleBuckets.map((item) => item.role_bucket).join(', ')} are underperforming on usefulness or traction. These families need closer QA or cleaner market coverage.`,
    });
  }

  if (!items.length && (proofRate >= 40 || tractionRate >= 20)) {
    items.push({
      priority: 'low',
      title: 'Recommendation outcomes look healthy',
      detail: 'Current reports are producing usable proof, manager conversations, or traction often enough to keep tuning based on what is already working.',
    });
  }

  if (!items.length) {
    items.push({
      priority: 'low',
      title: 'Outcome sample is still early',
      detail: 'No major failure pattern stands out yet, but the sample is still too small to overreact. Keep collecting feedback and watch the next cohort.',
    });
  }

  return items;
}

function buildHealthScore({ coverageRate, proofRate, managerRate, tractionRate, avgUsefulness, validatedRate, qualityPassRate }) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        coverageRate * 0.12
        + proofRate * 0.18
        + managerRate * 0.12
        + tractionRate * 0.22
        + ((avgUsefulness / 5) * 100) * 0.18
        + validatedRate * 0.10
        + qualityPassRate * 0.08
      )
    )
  );
}

export function analyzeRecommendationQualityRows(rows = []) {
  const entries = Array.isArray(rows) ? rows : [];
  const confidenceMap = new Map();
  const typeMap = new Map();
  const roleMap = new Map();
  const qualityMap = new Map();
  const tractionMap = new Map();
  const strongExamples = [];
  const weakExamples = [];
  const recentExamples = [];

  let reportsWithOutcome = 0;
  let proofCount = 0;
  let managerCount = 0;
  let tractionCount = 0;
  let usefulnessSum = 0;
  let usefulnessCount = 0;
  let validatedCount = 0;
  let qualityPassCount = 0;

  for (const row of entries) {
    const normalized = normalizeReportData(row.report_data || {}, {
      job_title: row.job_title,
      industry: row.industry,
      tasks: row.tasks || [],
    });
    const primary = normalized?.recommendation_stack?.primary || null;
    const qualityStatus = normalized?.quality_audit?.status || 'unknown';
    const rawOutcome = Array.isArray(row.report_outcomes) ? row.report_outcomes[0] : row.report_outcomes;
    const normalizedOutcome = normalizeOutcomeEntry(rawOutcome);
    const outcomeSummary = buildOutcomeSummary(normalizedOutcome);
    const roleBucket = inferRoleBucket(row.job_title, row.industry);
    const confidenceState = primary?.confidence_state || 'unknown';
    const recommendationType = primary?.type || 'unknown';

    if (qualityStatus === 'passed' || qualityStatus === 'repaired') qualityPassCount += 1;

    increment(tractionMap, outcomeSummary.traction_status || 'no_signal');
    increment(qualityMap, qualityStatus);

    const recentRow = {
      report_id: row.id,
      slug: row.slug,
      job_title: row.job_title,
      industry: row.industry,
      role_bucket: roleBucket,
      primary_title: primary?.title || normalized?.pivots?.[0]?.title || 'Unknown',
      recommendation_type: recommendationType,
      confidence_state: confidenceState,
      confidence_label: primary?.confidence_label || '',
      quality_status: qualityStatus,
      outcome_score: outcomeSummary.score,
      built_proof_asset: outcomeSummary.built_proof_asset,
      manager_conversation_done: outcomeSummary.manager_conversation_done,
      traction_status: outcomeSummary.traction_status,
      traction_label: outcomeSummary.traction_label,
      usefulness_rating: outcomeSummary.usefulness_rating,
      notes: outcomeSummary.notes,
      updated_at: row.updated_at,
    };
    recentExamples.push(recentRow);

    if (!isMeaningfulOutcome(normalizedOutcome)) {
      continue;
    }

    reportsWithOutcome += 1;
    addOutcomeToBucket(confidenceMap.get(confidenceState) || confidenceMap.set(confidenceState, buildBucketStats()).get(confidenceState), outcomeSummary);
    addOutcomeToBucket(typeMap.get(recommendationType) || typeMap.set(recommendationType, buildBucketStats()).get(recommendationType), outcomeSummary);
    addOutcomeToBucket(roleMap.get(roleBucket) || roleMap.set(roleBucket, buildBucketStats()).get(roleBucket), outcomeSummary);

    if (outcomeSummary.built_proof_asset) proofCount += 1;
    if (outcomeSummary.manager_conversation_done) managerCount += 1;
    if (outcomeSummary.traction_status !== 'no_signal') tractionCount += 1;
    if (outcomeSummary.usefulness_rating !== null && outcomeSummary.usefulness_rating !== undefined && outcomeSummary.usefulness_rating !== '' && Number.isFinite(Number(outcomeSummary.usefulness_rating))) {
      usefulnessSum += Number(outcomeSummary.usefulness_rating);
      usefulnessCount += 1;
    }
    if (outcomeSummary.recommendation_quality_state === 'validated') validatedCount += 1;

    if (outcomeSummary.score >= 70) {
      strongExamples.push(recentRow);
    }
    if (outcomeSummary.score < 35 || (Number.isFinite(Number(outcomeSummary.usefulness_rating)) && Number(outcomeSummary.usefulness_rating) <= 2)) {
      weakExamples.push(recentRow);
    }
  }

  const confidenceStats = finalizeBuckets(confidenceMap, 'confidence_state');
  const typeStats = finalizeBuckets(typeMap, 'recommendation_type');
  const roleStats = finalizeBuckets(roleMap, 'role_bucket');
  const reportsScanned = entries.length;
  const coverageRate = Math.round((reportsWithOutcome / Math.max(reportsScanned, 1)) * 100);
  const proofRate = Math.round((proofCount / Math.max(reportsWithOutcome, 1)) * 100);
  const managerRate = Math.round((managerCount / Math.max(reportsWithOutcome, 1)) * 100);
  const tractionRate = Math.round((tractionCount / Math.max(reportsWithOutcome, 1)) * 100);
  const avgUsefulness = usefulnessCount ? Number((usefulnessSum / usefulnessCount).toFixed(2)) : 0;
  const validatedRate = Math.round((validatedCount / Math.max(reportsWithOutcome, 1)) * 100);
  const qualityPassRate = Math.round((qualityPassCount / Math.max(reportsScanned, 1)) * 100);

  return {
    scanned_reports: reportsScanned,
    reports_with_outcomes: reportsWithOutcome,
    coverage_rate: coverageRate,
    proof_asset_rate: proofRate,
    manager_conversation_rate: managerRate,
    traction_rate: tractionRate,
    avg_usefulness: avgUsefulness,
    recommendation_health_score: buildHealthScore({
      coverageRate,
      proofRate,
      managerRate,
      tractionRate,
      avgUsefulness,
      validatedRate,
      qualityPassRate,
    }),
    confidence_state_counts: mapToCountList(new Map(confidenceStats.map((item) => [item.confidence_state, item.count])), 'confidence_state'),
    recommendation_type_counts: mapToCountList(new Map(typeStats.map((item) => [item.recommendation_type, item.count])), 'recommendation_type'),
    traction_status_counts: mapToCountList(tractionMap, 'traction_status'),
    quality_status_counts: mapToCountList(qualityMap, 'quality_status'),
    confidence_performance: confidenceStats,
    recommendation_type_performance: typeStats,
    role_bucket_performance: roleStats,
    strong_examples: strongExamples
      .sort((left, right) => right.outcome_score - left.outcome_score || String(right.updated_at).localeCompare(String(left.updated_at)))
      .slice(0, 12),
    weak_examples: weakExamples
      .sort((left, right) => left.outcome_score - right.outcome_score || String(right.updated_at).localeCompare(String(left.updated_at)))
      .slice(0, 12),
    recent_examples: recentExamples
      .sort((left, right) => String(right.updated_at).localeCompare(String(left.updated_at)))
      .slice(0, 20),
    action_items: buildActionItems({
      scannedReports: reportsScanned,
      reportsWithOutcome,
      confidenceStats,
      typeStats,
      roleStats,
      proofRate,
      tractionRate,
    }),
  };
}

export async function auditRecommendationQuality({ limit = 500 } = {}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      configured: false,
      scanned_reports: 0,
      reports_with_outcomes: 0,
      recommendation_health_score: 0,
      confidence_performance: [],
      recommendation_type_performance: [],
      role_bucket_performance: [],
      traction_status_counts: [],
      quality_status_counts: [],
      strong_examples: [],
      weak_examples: [],
      recent_examples: [],
      action_items: [{ priority: 'high', title: 'Supabase is not configured', detail: 'Set Supabase server credentials before auditing recommendation outcomes.' }],
    };
  }

  const cappedLimit = Math.min(Math.max(Number(limit) || 500, 50), 1500);
  const { data: reports, error } = await supabase
    .from('reports')
    .select(`
      id,
      slug,
      job_title,
      industry,
      updated_at,
      report_data,
      report_outcomes (
        built_proof_asset,
        manager_conversation_done,
        traction_status,
        usefulness_rating,
        notes,
        updated_at
      )
    `)
    .eq('access_tier', 'full')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(cappedLimit);

  if (error) {
    throw new Error(error.message || 'Failed to audit recommendation quality.');
  }

  return {
    configured: true,
    ...analyzeRecommendationQualityRows(reports || []),
  };
}
