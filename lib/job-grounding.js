function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function unique(items, limit = 10) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))].slice(0, limit);
}

export function classifyJobTrack(job = {}) {
  const title = normalizeText(job.title);
  const department = normalizeText(job.department);
  const roleFamily = normalizeText(job.role_family);
  const domainFocus = normalizeText(job.domain_focus);
  const summary = normalizeText(job.enrichment_summary);
  const text = [title, department, roleFamily, domainFocus, summary].join(' ');

  if (/\brecruit(er|ing)\b|university recruiter|talent\b/.test(text)) return 'recruiting';
  if (/\bengineer\b|developer|software|full stack|backend|api\b/.test(text)) return 'engineering';
  if (/\bproduct manager\b|\bproduct\b.*\b(compliance|risk|privacy)\b|\bux\b/.test(text)) return 'product-compliance';
  if (/\bcounsel\b|paralegal\b|attorney\b/.test(text)) return 'legal-counsel';
  if (/\btax\b|controller\b|accounting\b/.test(text)) return 'finance-control';
  if (/\bcustoms\b/.test(text)) return 'customs-compliance';
  if (/\buser enablement\b|\bonboarding\b.*\bcompliance\b|\bcompliance\b.*\bonboarding\b/.test(text)) return 'enablement-compliance';
  if (/\bcontract(ing)? operations\b|\bclm\b|\bcontract lifecycle\b|\bsite contracts\b/.test(text)) return 'contract-ops';
  if (/\blegal operations\b|\blegal technology\b/.test(text)) return 'legal-ops';
  if (/\bgrc\b|\bgovernance\b|\brisk\b|\bcompliance analyst\b|\bcompliance\b/.test(text)) return 'compliance-risk';
  if (/\bpolicy\b/.test(text)) return 'policy-ops';
  if (/\bprocurement\b|\bsupplier\b|\bsourcing\b/.test(text)) return 'procurement';
  if (/\benablement\b|\bonboarding\b|\binstructional\b|\blearning\b|\beducation\b/.test(text)) return 'education';
  if (/\bcustomer success\b|\bcustomer\b/.test(text)) return 'customer';
  if (/\bmarketing\b|\bgrowth\b/.test(text)) return 'marketing';

  return roleFamily || 'general';
}

export function canonicalRoleFamilyForTrack(track) {
  const normalized = normalizeText(track);
  if (['contract-ops', 'legal-ops', 'compliance-risk', 'policy-ops', 'legal-counsel'].includes(normalized)) return 'legal';
  if (normalized === 'finance-control') return 'finance';
  if (normalized === 'education') return 'education';
  if (normalized === 'procurement') return 'procurement';
  if (normalized === 'customer') return 'customer';
  if (normalized === 'marketing') return 'marketing';
  if (normalized === 'product-compliance') return 'product';
  if (normalized === 'recruiting') return 'general';
  if (normalized === 'engineering') return 'product';
  return normalized || 'general';
}

const TRACK_BLOCKED_SKILLS = {
  'legal-ops': [/\benablement\b/i, /\bcustomer success\b/i, /\bmarketing operations\b/i, /\bprocurement\b/i, /\bforecasting\b/i],
  'contract-ops': [/\benablement\b/i, /\bcustomer success\b/i, /\bmarketing operations\b/i, /\bforecasting\b/i],
  'compliance-risk': [/\bcustomer success\b/i, /\bmarketing operations\b/i, /\bprocurement\b/i, /\benablement\b/i, /\bai tooling\b/i],
  'policy-ops': [/\bcustomer success\b/i, /\bmarketing operations\b/i, /\bprocurement\b/i],
  'enablement-compliance': [/\bprocurement\b/i, /\bcustomer success\b/i],
  'customs-compliance': [/\bprocurement\b/i, /\benablement\b/i, /\bai tooling\b/i],
  'legal-counsel': [/\benablement\b/i, /\bai tooling\b/i, /\bcustomer success\b/i],
  'finance-control': [/\benablement\b/i, /\bcustomer success\b/i, /\bmarketing operations\b/i],
};

export function sanitizeGroundingSkills(skills = [], track = '', title = '') {
  const normalizedTrack = normalizeText(track);
  const blockedPatterns = TRACK_BLOCKED_SKILLS[normalizedTrack] || [];
  const titleText = normalizeText(title);

  const filtered = unique(skills, 12).filter((skill) => {
    const normalizedSkill = normalizeText(skill);
    if (!normalizedSkill) return false;
    if (blockedPatterns.some((pattern) => pattern.test(skill))) {
      if (/\bprocurement\b/i.test(skill) && /\bprocurement|supplier|sourcing\b/.test(titleText)) return true;
      if (/\benablement\b/i.test(skill) && /\benablement\b/.test(titleText)) return true;
      return false;
    }
    return true;
  });

  return filtered;
}

export function isGroundingEligibleForPivot(opening = {}, pivotTitle = '', roleFamily = '') {
  const track = classifyJobTrack(opening);
  const pivotText = normalizeText(pivotTitle);
  const family = normalizeText(roleFamily);

  if (family === 'legal') {
    if (['recruiting', 'engineering', 'product-compliance', 'finance-control', 'legal-counsel', 'enablement-compliance', 'customs-compliance'].includes(track)) {
      return false;
    }

    if (/\b(contract|clm|lifecycle)\b/.test(pivotText)) {
      return ['contract-ops', 'legal-ops'].includes(track);
    }

    if (/\b(compliance|risk|grc|governance|policy)\b/.test(pivotText)) {
      return ['compliance-risk', 'policy-ops', 'legal-ops'].includes(track);
    }

    if (/\blegal operations\b|\blegal technology\b/.test(pivotText)) {
      return ['legal-ops', 'contract-ops', 'compliance-risk'].includes(track);
    }

    return ['legal-ops', 'contract-ops', 'compliance-risk', 'policy-ops'].includes(track);
  }

  return true;
}
