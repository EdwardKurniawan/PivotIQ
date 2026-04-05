import { buildDemoReportData } from './report-data';
import { createSupabaseAdminClient } from './supabase/admin';

const TRUSTED_RESOURCE_HOSTS = [
  'coursera.org',
  'udemy.com',
  'datacamp.com',
  'edx.org',
  'deeplearning.ai',
  'openai.com',
  'cookbook.openai.com',
  'zapier.com',
  'oreilly.com',
  'momtestbook.com',
];

const LIVE_PROVIDER_SEARCHES = [
  {
    provider: 'Coursera',
    searchUrl: (query) => `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
    matchers: [/https:\/\/www\.coursera\.org\/learn\/[a-z0-9-_/]+/gi, /https:\/\/www\.coursera\.org\/professional-certificates\/[a-z0-9-_/]+/gi],
  },
  {
    provider: 'Udemy',
    searchUrl: (query) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
    matchers: [/https:\/\/www\.udemy\.com\/course\/[a-z0-9-_/]+/gi],
  },
  {
    provider: 'edX',
    searchUrl: (query) => `https://www.edx.org/search?q=${encodeURIComponent(query)}`,
    matchers: [/https:\/\/www\.edx\.org\/learn\/[a-z0-9-_/]+/gi],
  },
  {
    provider: 'DataCamp',
    searchUrl: (query) => `https://www.datacamp.com/search?q=${encodeURIComponent(query)}`,
    matchers: [/https:\/\/www\.datacamp\.com\/courses\/[a-z0-9-_/]+/gi, /https:\/\/www\.datacamp\.com\/tracks\/[a-z0-9-_/]+/gi],
  },
];

const SPECIFIC_RESOURCE_RULES = [
  { pattern: /\bsql\b|\bquery\b|\bdatabase\b/i, resource_title: 'SQL for Data Science', resource_url: 'https://www.coursera.org/learn/sql-for-data-science', resource_provider: 'Coursera' },
  { pattern: /\bpython\b/i, resource_title: 'Python for Everybody', resource_url: 'https://www.coursera.org/specializations/python', resource_provider: 'Coursera' },
  { pattern: /\bdata governance\b|\bgovernance frameworks\b/i, resource_title: 'NIST AI Risk Management Framework', resource_url: 'https://www.nist.gov/itl/ai-risk-management-framework', resource_provider: 'NIST' },
  { pattern: /\blearning management system\b|\blms\b/i, resource_title: 'Instructional Design Foundations and Applications', resource_url: 'https://www.coursera.org/learn/instructional-design-foundations-and-applications', resource_provider: 'Coursera' },
  { pattern: /\bhipaa\b|\bhealthcare regulatory compliance\b|\bhealthcare compliance\b/i, resource_title: 'HIPAA Training and Certification', resource_url: 'https://www.hipaatraining.com/', resource_provider: 'HIPAA Training' },
  { pattern: /\bhealthcare reimbursement\b|\bhealthcare finance\b/i, resource_title: 'Healthcare Finance 101', resource_url: 'https://www.coursera.org/learn/healthcare-finance', resource_provider: 'Coursera' },
  { pattern: /\bproduct lifecycle management\b|\bproduct ops\b|\bproduct operations\b/i, resource_title: 'Digital Product Management', resource_url: 'https://www.coursera.org/learn/digital-product-management', resource_provider: 'Coursera' },
  { pattern: /\bcontract lifecycle\b|\bcontract management\b|\bclm\b/i, resource_title: 'Ironclad Digital Contracting Academy', resource_url: 'https://academy.ironcladapp.com/', resource_provider: 'Ironclad' },
  { pattern: /\brisk assessment\b|\brisk framework\b|\benterprise risk\b|\bai governance\b/i, resource_title: 'NIST AI Risk Management Framework', resource_url: 'https://www.nist.gov/itl/ai-risk-management-framework', resource_provider: 'NIST' },
  { pattern: /\bchange management\b|\badoption leadership\b/i, resource_title: 'Digital Transformation', resource_url: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation', resource_provider: 'Coursera' },
  { pattern: /\benablement\b|\bcustomer education\b|\binstructional\b|\bcurriculum\b/i, resource_title: 'Instructional Design Foundations and Applications', resource_url: 'https://www.coursera.org/learn/instructional-design-foundations-and-applications', resource_provider: 'Coursera' },
  { pattern: /\bdashboard\b|\banalytics\b|\bdata analysis\b/i, resource_title: 'Google Data Analytics Certificate', resource_url: 'https://www.coursera.org/professional-certificates/google-data-analytics', resource_provider: 'Coursera' },
  { pattern: /\bprocurement\b|\bsourcing\b|\bsupplier\b|\bvendor\b|\bcategory strategy\b|\bvendor evaluation\b/i, resource_title: 'Global Procurement and Sourcing Specialization', resource_url: 'https://www.coursera.org/specializations/procurement-sourcing', resource_provider: 'Coursera' },
  { pattern: /\bautomation\b|\bworkflow\b/i, resource_title: 'Zapier Learn', resource_url: 'https://zapier.com/blog/learn-automation/', resource_provider: 'Zapier' },
  { pattern: /\bprompt\b|\bai qa\b|\bai tooling\b/i, resource_title: 'OpenAI Cookbook', resource_url: 'https://cookbook.openai.com/', resource_provider: 'OpenAI' },
];

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'basics',
  'beginner',
  'course',
  'for',
  'fundamentals',
  'guide',
  'in',
  'introduction',
  'learn',
  'of',
  'the',
  'to',
  'with',
]);

function normalizeHostname(hostname) {
  return String(hostname || '').toLowerCase().replace(/^www\./, '');
}

function isAllowedHost(hostname) {
  const normalized = normalizeHostname(hostname);
  return TRUSTED_RESOURCE_HOSTS.some((host) => normalized === host || normalized.endsWith(`.${host}`));
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
}

function overlapScore(leftTokens, rightTokens) {
  const right = new Set(rightTokens);
  let score = 0;

  for (const token of leftTokens) {
    if (right.has(token)) score += 1;
  }

  return score;
}

function inferProviderFromUrl(url) {
  try {
    const hostname = normalizeHostname(new URL(url).hostname);
    if (hostname.includes('coursera')) return 'Coursera';
    if (hostname.includes('udemy')) return 'Udemy';
    if (hostname.includes('datacamp')) return 'DataCamp';
    if (hostname.includes('edx')) return 'edX';
    if (hostname.includes('deeplearning')) return 'DeepLearning.AI';
    if (hostname.includes('openai')) return 'OpenAI';
    if (hostname.includes('zapier')) return 'Zapier';
    if (hostname.includes('oreilly')) return "O'Reilly";
    if (hostname.includes('momtestbook')) return 'The Mom Test';
  } catch {}

  return '';
}

export function sanitizeTrustedResourceUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    if (!isAllowedHost(parsed.hostname)) return null;
    if (!parsed.pathname || parsed.pathname === '/') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

async function fetchCourseCatalog() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('course_catalog')
    .select('slug, provider, title, url, summary, skills, tags, is_paid, price_label, level, duration_label, resource_type, role_families, pivot_frames, outcome_types, verification_status, final_url')
    .eq('status', 'active')
    .in('verification_status', ['verified', 'restricted']);

  if (error || !Array.isArray(data)) {
    console.error('Course catalog fetch failed:', error);
    return [];
  }

  return data;
}

function inferSkillIntent(skillGap) {
  const text = [
    skillGap?.skill_name,
    skillGap?.category,
    skillGap?.why_it_matters,
    skillGap?.how_to_close_gap,
  ].join(' ').toLowerCase();

  if (/(stakeholder|communication|presentation|storytelling|narrative|executive|influence|alignment)/.test(text)) return 'communication';
  if (/(leadership|change management|facilitation|coaching|management)/.test(text)) return 'leadership';
  if (/(sql|python|dashboard|analysis|analytics|data|spreadsheet|modeling|query|database)/.test(text)) return 'technical';
  if (/(workflow|automation|process|operations|program|project)/.test(text)) return 'operations';
  if (/(product|discovery|roadmap|prioritization)/.test(text)) return 'product';

  return 'general';
}

function inferEntryIntent(entry) {
  const text = [
    entry?.title,
    entry?.summary,
    Array.isArray(entry?.skills) ? entry.skills.join(' ') : '',
    Array.isArray(entry?.tags) ? entry.tags.join(' ') : '',
  ].join(' ').toLowerCase();

  if (/(stakeholder|communication|presentation|storytelling|narrative|executive|influence|alignment)/.test(text)) return 'communication';
  if (/(leadership|change management|facilitation|coaching|management)/.test(text)) return 'leadership';
  if (/(sql|python|dashboard|analysis|analytics|data|spreadsheet|modeling|query|database)/.test(text)) return 'technical';
  if (/(workflow|automation|process|operations|program|project)/.test(text)) return 'operations';
  if (/(product|discovery|roadmap|prioritization)/.test(text)) return 'product';

  return 'general';
}

function isGenericCatalogTitle(title) {
  return /^online .+ courses$/i.test(String(title || '').trim());
}

function isOverlyGenericLearningMatch(skillGap, resource) {
  const title = String(resource?.resource_title || '').toLowerCase();
  const url = String(resource?.resource_url || '').toLowerCase();
  const skillText = [
    skillGap?.skill_name,
    skillGap?.why_it_matters,
    skillGap?.how_to_close_gap,
  ].join(' ').toLowerCase();

  if (!title && !url) return true;

  if ((title.includes('ai for everyone') || url.includes('/ai-for-everyone')) && !/\b(ai|prompt|llm|automation)\b/.test(skillText)) {
    return true;
  }

  if (title.includes('course match') && !/\b(ai|sql|python|analytics|procurement|compliance|contract|instructional|learning)\b/.test(skillText)) {
    return true;
  }

  return false;
}

function buildLiveSearchQuery(skillGap, pivot) {
  const intent = inferSkillIntent(skillGap);
  const terms = [skillGap?.skill_name];

  if (intent === 'communication') terms.push('business presentation communication');
  if (intent === 'leadership') terms.push('leadership stakeholder management');
  if (intent === 'technical') terms.push('hands-on course');
  if (pivot?.title) terms.push(pivot.title);

  return terms.filter(Boolean).join(' ');
}

function buildSpecificResourceFallback(skillGap, pivot) {
  const text = [
    skillGap?.skill_name,
    skillGap?.category,
    skillGap?.why_it_matters,
    skillGap?.how_to_close_gap,
    pivot?.title,
  ].join(' ');

  const match = SPECIFIC_RESOURCE_RULES.find((rule) => rule.pattern.test(text));
  if (!match) return null;

  return {
    resource_title: match.resource_title,
    resource_url: match.resource_url,
    resource_provider: match.resource_provider,
    resource_access: '',
    resource_price_label: '',
    resource_type: 'course',
    resource_level: '',
    resource_duration_label: '',
    resource_verified: true,
    resource_verification_status: 'rule-based-fallback',
  };
}

async function fetchLiveProviderCourse(skillGap, pivot) {
  const query = buildLiveSearchQuery(skillGap, pivot);

  for (const providerSearch of LIVE_PROVIDER_SEARCHES) {
    try {
      const response = await fetch(providerSearch.searchUrl(query), {
        headers: {
          'User-Agent': 'Mozilla/5.0 PivotIQ live course fallback',
        },
        cache: 'no-store',
      });

      if (!response.ok) continue;

      const html = await response.text();
      const rawMatches = providerSearch.matchers.flatMap((matcher) => html.match(matcher) || []);
      const trustedUrl = rawMatches
        .map((item) => sanitizeTrustedResourceUrl(item.replace(/[",\\]+$/, '')))
        .find(Boolean);

      if (trustedUrl) {
        return {
          resource_title: `${providerSearch.provider} course match`,
          resource_url: trustedUrl,
          resource_provider: providerSearch.provider,
          resource_access: '',
          resource_price_label: '',
          resource_type: 'course',
          resource_level: '',
          resource_duration_label: '',
          resource_verified: true,
          resource_verification_status: 'live-search',
        };
      }
    } catch {}
  }

  return null;
}

function buildCatalogMatch(skillGap, pivot, catalogEntries) {
  const queryTokens = tokenize([
    skillGap?.skill_name,
    skillGap?.category,
    pivot?.title,
    pivot?.decision_frame,
    skillGap?.why_it_matters,
  ].join(' '));
  const roleSignals = inferRoleFamilies([pivot?.title, skillGap?.category, skillGap?.why_it_matters].join(' '));
  const desiredOutcomes = inferOutcomeTypes(skillGap, pivot);
  const skillIntent = inferSkillIntent(skillGap);
  const directSkillTokens = tokenize([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '));

  let best = null;

  for (const entry of catalogEntries) {
    const entryTokens = tokenize([
      entry.title,
      entry.provider,
      entry.summary,
      Array.isArray(entry.skills) ? entry.skills.join(' ') : '',
      Array.isArray(entry.tags) ? entry.tags.join(' ') : '',
    ].join(' '));

    let score = overlapScore(queryTokens, entryTokens);
    const directSkillOverlap = overlapScore(directSkillTokens, entryTokens);
    const entryIntent = inferEntryIntent(entry);

    score += directSkillOverlap * 2;

    if (Array.isArray(entry.pivot_frames) && entry.pivot_frames.includes(pivot?.decision_frame)) {
      score += 4;
    }

    if (Array.isArray(entry.role_families) && entry.role_families.some((role) => roleSignals.includes(role))) {
      score += 3;
    }

    if (Array.isArray(entry.outcome_types) && entry.outcome_types.some((outcome) => desiredOutcomes.includes(outcome))) {
      score += 2;
    }

    if (entry.verification_status === 'verified') {
      score += 2;
    } else if (entry.verification_status === 'restricted') {
      score += 1;
    }

    if (skillGap?.gap_priority === 'critical' && /beginner|intermediate/i.test(entry.level || '')) {
      score += 1;
    }

    if (entry.resource_type === 'pathway') {
      score -= 3;
    }

    if (isGenericCatalogTitle(entry.title)) {
      score -= 2;
    }

    if (directSkillOverlap === 0) {
      score -= 4;
    }

    if (skillIntent !== 'general' && entryIntent === skillIntent) {
      score += 5;
    }

    if (skillIntent === 'communication' && entryIntent === 'technical') {
      score -= 8;
    }

    if (skillIntent === 'technical' && entryIntent === 'communication') {
      score -= 5;
    }

    if (skillGap?.category === 'soft_skill' && entryIntent === 'technical') {
      score -= 6;
    }

    if (skillGap?.category === 'soft_skill' && directSkillOverlap === 0) {
      score -= 4;
    }

    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  return best && best.score > 0 ? best : null;
}

function inferRoleFamilies(value) {
  const normalized = String(value || '').toLowerCase();
  const families = [];

  if (/(data|analytics|sql|dashboard|bi|report)/.test(normalized)) families.push('analytics');
  if (/(project|program|operations|workflow|process)/.test(normalized)) families.push('operations');
  if (/(product|roadmap|discovery)/.test(normalized)) families.push('product');
  if (/(marketing|growth|seo|content|campaign)/.test(normalized)) families.push('marketing');
  if (/(design|ux|user research|prototype)/.test(normalized)) families.push('design');
  if (/(ai|automation|prompt|llm|agent)/.test(normalized)) families.push('ai-automation');
  if (/(leadership|strategy|transformation|stakeholder|change)/.test(normalized)) families.push('strategy');
  if (/(engineering|python|machine learning|technical)/.test(normalized)) families.push('technical');

  return [...new Set(families)];
}

function inferOutcomeTypes(skillGap, pivot) {
  const text = [skillGap?.skill_name, skillGap?.how_to_close_gap, pivot?.decision_frame, pivot?.title].join(' ').toLowerCase();
  const outcomes = [];

  if (/(portfolio|prototype|build|workflow)/.test(text)) outcomes.push('portfolio');
  if (/(credential|certificate|certification)/.test(text)) outcomes.push('credential');
  if (/(adoption|change|leadership|strategy)/.test(text)) outcomes.push('strategy');
  if (/(query|sql|analysis|dashboard|data)/.test(text)) outcomes.push('technical-skill');
  if (/(prompt|ai|automation|agent)/.test(text)) outcomes.push('ai-execution');

  if (!outcomes.length) outcomes.push('general-upskilling');

  return outcomes;
}

async function normalizeSkillGapResource(skillGap, fallbackGap, pivot, catalogEntries) {
  const trustedUrl = sanitizeTrustedResourceUrl(skillGap?.resource_url);

  if (trustedUrl) {
    return {
      ...skillGap,
      resource_url: trustedUrl,
      resource_provider: skillGap?.resource_provider || inferProviderFromUrl(trustedUrl),
      resource_access: skillGap?.resource_access || '',
      resource_price_label: skillGap?.resource_price_label || '',
      resource_type: skillGap?.resource_type || 'resource',
      resource_level: skillGap?.resource_level || '',
      resource_duration_label: skillGap?.resource_duration_label || '',
      resource_verified: true,
      resource_verification_status: 'trusted-direct',
    };
  }

  const match = buildCatalogMatch(skillGap, pivot, catalogEntries);
  const shouldPreferCatalog = Boolean(
    match &&
    match.score >= (match.entry.resource_type === 'pathway' || isGenericCatalogTitle(match.entry.title) ? 8 : 4)
  );

  const specificFallback = buildSpecificResourceFallback(skillGap, pivot);
  if (specificFallback) {
    return {
      ...skillGap,
      ...specificFallback,
    };
  }

  const liveMatch = await fetchLiveProviderCourse(skillGap, pivot);
  if (liveMatch && !isOverlyGenericLearningMatch(skillGap, liveMatch)) {
    return {
      ...skillGap,
      ...liveMatch,
    };
  }

  if (shouldPreferCatalog) {
    return {
      ...skillGap,
      resource_title: match.entry.title,
      resource_url: match.entry.final_url || match.entry.url,
      resource_provider: match.entry.provider,
      resource_access: match.entry.is_paid ? 'paid' : 'free',
      resource_price_label: match.entry.price_label || '',
      resource_type: match.entry.resource_type || 'course',
      resource_level: match.entry.level || '',
      resource_duration_label: match.entry.duration_label || '',
      resource_verified: true,
      resource_verification_status: match.entry.verification_status || 'verified',
    };
  }

  const fallbackUrl = sanitizeTrustedResourceUrl(fallbackGap?.resource_url);
  if (fallbackUrl) {
    return {
      ...skillGap,
      resource_title: fallbackGap.resource_title,
      resource_url: fallbackUrl,
      resource_provider: inferProviderFromUrl(fallbackUrl),
      resource_access: 'free',
      resource_price_label: '',
      resource_type: 'resource',
      resource_level: '',
      resource_duration_label: '',
      resource_verified: true,
      resource_verification_status: 'fallback-trusted',
    };
  }

  return skillGap;
}

export async function enrichReportLearningResources(reportData, fallbackProfile = null) {
  if (!reportData || typeof reportData !== 'object') return reportData;

  const catalogEntries = await fetchCourseCatalog();
  if (!catalogEntries.length) return reportData;

  const fallback = buildDemoReportData(
    fallbackProfile?.job_title || fallbackProfile?.jobTitle || reportData?.profile?.job_title || '',
    fallbackProfile?.industry || reportData?.profile?.industry || '',
    Array.isArray(fallbackProfile?.tasks) ? fallbackProfile.tasks : reportData?.profile?.tasks || [],
    fallbackProfile
  );

  const fallbackPivots = Array.isArray(fallback?.pivots) ? fallback.pivots : [];
  const pivots = Array.isArray(reportData.pivots) ? reportData.pivots : [];

  return {
    ...reportData,
    pivots: await Promise.all(pivots.map(async (pivot, pivotIndex) => {
      const fallbackPivot = fallbackPivots.find((item) => item.decision_frame === pivot?.decision_frame) || fallbackPivots[pivotIndex] || {};
      const fallbackSkillGaps = Array.isArray(fallbackPivot.skill_gaps) ? fallbackPivot.skill_gaps : [];
      const skillGaps = Array.isArray(pivot?.skill_gaps) ? pivot.skill_gaps : [];

      return {
        ...pivot,
        skill_gaps: await Promise.all(skillGaps.map((skillGap, skillIndex) =>
          normalizeSkillGapResource(skillGap, fallbackSkillGaps[skillIndex] || fallbackSkillGaps[0], pivot, catalogEntries)
        )),
      };
    })),
  };
}
