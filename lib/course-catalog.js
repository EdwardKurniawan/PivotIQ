import { buildDemoReportData } from './report-data.js';
import { createSupabaseAdminClient } from './supabase/admin.js';

const TRUSTED_RESOURCE_HOSTS = [
  'coursera.org',
  'udemy.com',
  'datacamp.com',
  'edx.org',
  'deeplearning.ai',
  'openai.com',
  'cookbook.openai.com',
  'developers.openai.com',
  'zapier.com',
  'oreilly.com',
  'momtestbook.com',
  'learn.microsoft.com',
  'trailhead.salesforce.com',
  'academy.hubspot.com',
  'university.atlassian.com',
  'skillshop.withgoogle.com',
  'skillbuilder.aws',
  'anthropic.com',
  'claude.com',
  'docs.anthropic.com',
  'platform.claude.com',
  'anthropic.skilljar.com',
  'github.com',
  'skills.google',
  'grow.google',
  'cloudskillsboost.google',
  'kaggle.com',
  'nist.gov',
  'hipaatraining.com',
  'skillsbuild.org',
  'assessment.skillsbuild.org',
  'skills.yourlearning.ibm.com',
  'learn.mongodb.com',
  'learn.snowflake.com',
  'academy.asana.com',
  'pluralsight.com',
  'codecademy.com',
  'educative.io',
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
  { pattern: /\bcontract lifecycle\b|\bcontract management\b|\bcontract clause\b|\bclause library\b|\bclause mapping\b|\bcontract drafting\b|\bapproval routing\b|\bclm\b/i, resource_title: 'Ironclad Digital Contracting Academy', resource_url: 'https://academy.ironcladapp.com/', resource_provider: 'Ironclad' },
  { pattern: /\brisk assessment\b|\brisk framework\b|\benterprise risk\b|\bai governance\b|\bcompliance\b|\bregulatory\b|\bpolicy workflow\b|\bcustomer trust\b|\btrust kpi\b|\baml\b|\bctf\b|\bmonitoring\b/i, resource_title: 'NIST AI Risk Management Framework', resource_url: 'https://www.nist.gov/itl/ai-risk-management-framework', resource_provider: 'NIST' },
  { pattern: /\bchange management\b|\badoption leadership\b/i, resource_title: 'Digital Transformation', resource_url: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation', resource_provider: 'Coursera' },
  { pattern: /\benablement\b|\bcustomer education\b|\binstructional\b|\bcurriculum\b/i, resource_title: 'Instructional Design Foundations and Applications', resource_url: 'https://www.coursera.org/learn/instructional-design-foundations-and-applications', resource_provider: 'Coursera' },
  { pattern: /\brenewal\b|\baccount health\b|\bcustomer health\b|\bcustomer success\b|\bretention\b|\bcustomer operations\b/i, resource_title: 'Service Hub Software Certification Course', resource_url: 'https://academy.hubspot.com/courses/hubspot-service-software', resource_provider: 'HubSpot Academy' },
  { pattern: /\bmanager enablement\b|\bpeople operations\b|\bworkforce planning\b/i, resource_title: 'OpenAI Academy', resource_url: 'https://academy.openai.com/', resource_provider: 'OpenAI Academy' },
  { pattern: /\bcampaign experiment\b|\bcampaign planning\b|\bmarketing operations\b|\blaunch workflow\b/i, resource_title: 'AI for Marketing Course', resource_url: 'https://academy.hubspot.com/courses/AI-for-Marketers', resource_provider: 'HubSpot Academy' },
  { pattern: /\bforecasting\b|\bspend forecasting\b/i, resource_title: 'Global Procurement and Sourcing Specialization', resource_url: 'https://www.coursera.org/specializations/procurement-sourcing', resource_provider: 'Coursera' },
  { pattern: /\bdashboard\b|\banalytics\b|\bdata analysis\b/i, resource_title: 'Google Data Analytics Certificate', resource_url: 'https://www.coursera.org/professional-certificates/google-data-analytics', resource_provider: 'Coursera' },
  { pattern: /\bprocurement\b|\bsourcing\b|\bsupplier\b|\bvendor\b|\bcategory strategy\b|\bvendor evaluation\b/i, resource_title: 'Global Procurement and Sourcing Specialization', resource_url: 'https://www.coursera.org/specializations/procurement-sourcing', resource_provider: 'Coursera' },
  { pattern: /\bpower bi\b|\bmicrosoft fabric\b|\bsemantic model\b|\breport building\b|\bdashboard storytelling\b/i, resource_title: 'Get started with Microsoft data analytics', resource_url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/', resource_provider: 'Microsoft Learn' },
  { pattern: /\bpower automate\b|\brpa\b|\bcloud flow\b|\bworkflow automation\b|\bautomation\b|\bworkflow\b/i, resource_title: 'Build and optimize cloud flows in Power Automate', resource_url: 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/', resource_provider: 'Microsoft Learn' },
  { pattern: /\bagentforce\b|\bagent builder\b|\bautonomous agents\b|\bagent deployment\b|\bsalesforce ai\b/i, resource_title: 'Be an Agentblazer: Gain AI Agentforce Skills', resource_url: 'https://trailhead.salesforce.com/agentblazer', resource_provider: 'Salesforce Trailhead' },
  { pattern: /\bflow automation\b|\bflow troubleshooting\b|\bsalesforce flow\b/i, resource_title: 'Improve Business with Salesforce Flow Automation', resource_url: 'https://trailhead.salesforce.com/content/learn/trails/distribute-and-implement-flows', resource_provider: 'Salesforce Trailhead' },
  { pattern: /\bservice hub\b|\bhelp desk\b|\bcustomer portal\b|\bknowledge base\b|\bcustomer feedback\b/i, resource_title: 'Service Hub Software Certification Course', resource_url: 'https://academy.hubspot.com/courses/hubspot-service-software', resource_provider: 'HubSpot Academy' },
  { pattern: /\bai marketing\b|\bmarketing ai\b|\bai for marketers\b/i, resource_title: 'AI for Marketing Course', resource_url: 'https://academy.hubspot.com/courses/AI-for-Marketers', resource_provider: 'HubSpot Academy' },
  { pattern: /\bvector search\b|\brag\b|\bsemantic search\b|\batlas vector search\b/i, resource_title: 'Building GenAI Apps Learning Badge Path', resource_url: 'https://learn.mongodb.com/learning-paths/building-genai-apps-learning-badge-path', resource_provider: 'MongoDB University' },
  { pattern: /\bdata warehouse\b|\bsnowflake\b|\bsql analyst\b|\bbi manager\b/i, resource_title: 'Snowflake Learning Tracks', resource_url: 'https://learn.snowflake.com/en/', resource_provider: 'Snowflake' },
  { pattern: /\bautomation mindset\b|\bzap\b|\bzapier\b/i, resource_title: 'Learn Zapier in 14 days', resource_url: 'https://zapier.com/l/learn-14-days', resource_provider: 'Zapier' },
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
  'application',
  'applications',
  'apply',
  'build',
  'develop',
  'report',
  'kpi',
  'kpis',
  'manager',
  'operations',
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

function normalizePhrase(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPhraseSignals(skillGap) {
  const skillName = normalizePhrase(skillGap?.skill_name);
  const howToCloseGap = normalizePhrase(skillGap?.how_to_close_gap);
  const signals = new Set();

  if (skillName.split(' ').length > 1) signals.add(skillName);

  [
    'ai automation',
    'contract lifecycle',
    'contract clause',
    'dashboard storytelling',
    'enablement program',
    'instructional design',
    'clause mapping',
    'scenario modeling',
    'financial planning',
    'financial modeling',
    'forecasting',
    'power bi',
    'procurement analytics',
  ].forEach((phrase) => {
    if (skillName.includes(phrase) || howToCloseGap.includes(phrase)) {
      signals.add(phrase);
    }
  });

  return [...signals];
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

export async function fetchCourseCatalog() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('course_catalog')
    .select('slug, provider, title, url, summary, skills, tags, is_paid, price_label, level, duration_label, resource_type, role_families, pivot_frames, outcome_types, verification_status, final_url, source_metadata')
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

function inferDomainSignals(value) {
  const normalized = String(value || '').toLowerCase();
  const signals = [];

  if (/(legal|contract|contracts|clm|clause|compliance|regulatory|policy|governance|privacy|risk)/.test(normalized)) signals.push('legal');
  if (/(procurement|sourcing|supplier|vendor|spend|category|purchasing|supply chain|forecast)/.test(normalized)) signals.push('procurement');
  if (/(education|learning|enablement|training|instructional|curriculum|onboarding|lms)/.test(normalized)) signals.push('education');
  if (/(sql|python|dashboard|analytics|data|power bi|tableau|forecast)/.test(normalized)) signals.push('analytics');
  if (/(finance|financial|fp&a|fpa|budget|forecast|scenario model|planning model)/.test(normalized)) signals.push('finance');
  if (/(ai|prompt|llm|agent|automation|chatgpt|claude|copilot)/.test(normalized)) signals.push('ai-automation');
  if (/(marketing|growth|seo|campaign|ecommerce|e-commerce)/.test(normalized)) signals.push('marketing');

  return [...new Set(signals)];
}

function getCourseDomainText(entry) {
  return [
    entry?.title,
    entry?.provider,
    entry?.summary,
    Array.isArray(entry?.skills) ? entry.skills.join(' ') : '',
    Array.isArray(entry?.tags) ? entry.tags.join(' ') : '',
    Array.isArray(entry?.role_families) ? entry.role_families.join(' ') : '',
  ].join(' ');
}

function domainMismatchPenalty(skillGap, pivot, entry) {
  const queryDomains = inferDomainSignals([
    skillGap?.skill_name,
    skillGap?.category,
    skillGap?.why_it_matters,
    skillGap?.how_to_close_gap,
  ].join(' '));
  const entryDomains = inferDomainSignals(getCourseDomainText(entry));

  if (!queryDomains.length || !entryDomains.length) return 0;
  if (queryDomains.some((domain) => entryDomains.includes(domain))) return 0;

  return queryDomains.some((domain) => ['legal', 'procurement', 'education'].includes(domain)) ? 14 : 8;
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

  if (
    /\b(ai|copilot|prompt|chatgpt|claude)\b/.test(title) &&
    !/\b(ai|prompt|llm|automation|copilot|chatgpt|claude|risk|governance|compliance|regulatory)\b/.test(skillText)
  ) {
    return true;
  }

  if (
    /\b(prompt|generative ai|genai|chatgpt|claude)\b/.test(title) &&
    /\b(sql|dashboard|business intelligence|data model|data modeling|financial modeling|scenario modeling|forecast|renewal|account health|customer workflow|campaign)\b/.test(skillText) &&
    !/\b(ai|prompt|llm|automation|copilot|chatgpt|claude)\b/.test(skillText)
  ) {
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
  const roleSignals = inferRoleFamilies([pivot?.title, pivot?.decision_frame, skillGap?.why_it_matters].join(' '));
  const normalizedSkillName = normalizePhrase(skillGap?.skill_name);
  const isGenericSkillName = /^(data analysis|data visualization|project management|change management|forecasting|sql|sql basics)$/i.test(normalizedSkillName);
  const text = isGenericSkillName
    ? skillGap?.skill_name
    : [
        skillGap?.skill_name,
        skillGap?.how_to_close_gap,
      ].join(' ');

  if (
    roleSignals.includes('customer') &&
    /\b(process design|workflow design|customer workflow|renewal process|account review|customer health)\b/i.test(text)
  ) {
    return {
      resource_title: 'Improve Business with Salesforce Flow Automation',
      resource_url: 'https://trailhead.salesforce.com/content/learn/trails/distribute-and-implement-flows',
      resource_provider: 'Salesforce Trailhead',
      resource_access: 'free',
      resource_price_label: '',
      resource_type: 'course',
      resource_level: '',
      resource_duration_label: '',
      resource_verified: true,
      resource_verification_status: 'role-aware-fallback',
    };
  }

  if (
    roleSignals.includes('analytics') &&
    /\b(process design|workflow design|program management|product lifecycle|product management|business strategy)\b/i.test(text)
  ) {
    return {
      resource_title: 'Get started with Microsoft data analytics',
      resource_url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
      resource_provider: 'Microsoft Learn',
      resource_access: 'free',
      resource_price_label: '',
      resource_type: 'course',
      resource_level: '',
      resource_duration_label: '',
      resource_verified: true,
      resource_verification_status: 'role-aware-fallback',
    };
  }

  if (
    roleSignals.includes('finance') &&
    /\b(financial modeling|scenario modeling|forecasting|planning model|planning workflow|budget)\b/i.test(text)
  ) {
    return {
      resource_title: 'SQL for Data Science',
      resource_url: 'https://www.coursera.org/learn/sql-for-data-science',
      resource_provider: 'Coursera',
      resource_access: 'paid',
      resource_price_label: '',
      resource_type: 'course',
      resource_level: '',
      resource_duration_label: '',
      resource_verified: true,
      resource_verification_status: 'role-aware-fallback',
    };
  }

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

function shouldPreferSpecificFallback(match, specificFallback, skillGap, pivot) {
  if (!specificFallback) return false;
  if (!match) return true;

  const fallbackDomains = inferDomainSignals([
    specificFallback.resource_title,
    specificFallback.resource_provider,
    skillGap?.skill_name,
    pivot?.title,
  ].join(' '));
  const matchedDomains = inferDomainSignals(getCourseDomainText(match.entry));
  const fallbackIsDomainSpecific = fallbackDomains.some((domain) =>
    ['legal', 'procurement', 'education', 'analytics', 'ai-automation'].includes(domain)
  );
  const matchedDomainOverlap = fallbackDomains.some((domain) => matchedDomains.includes(domain));
  const highTrustFallbackDomains = fallbackDomains.filter((domain) => ['legal', 'procurement', 'education'].includes(domain));
  const matchedHighTrustDomainOverlap = highTrustFallbackDomains.some((domain) => matchedDomains.includes(domain));

  if (highTrustFallbackDomains.length && !matchedHighTrustDomainOverlap) return true;
  return fallbackIsDomainSpecific && (!matchedDomainOverlap || match.score < 18);
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

export function buildCatalogMatch(skillGap, pivot, catalogEntries) {
  const queryTokens = tokenize([
    skillGap?.skill_name,
    skillGap?.category,
    skillGap?.why_it_matters,
    skillGap?.how_to_close_gap,
  ].join(' '));
  const pivotTokens = tokenize([
    pivot?.title,
    pivot?.decision_frame,
  ].join(' '));
  const roleSignals = inferRoleFamilies([pivot?.title, skillGap?.category, skillGap?.why_it_matters].join(' '));
  const desiredOutcomes = inferOutcomeTypes(skillGap, pivot);
  const skillIntent = inferSkillIntent(skillGap);
  const directSkillTokens = tokenize([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '));
  const phraseSignals = buildPhraseSignals(skillGap);

  let best = null;

  for (const entry of catalogEntries) {
    const entrySearchText = normalizePhrase([
      entry.title,
      entry.provider,
      entry.summary,
      Array.isArray(entry.skills) ? entry.skills.join(' ') : '',
      Array.isArray(entry.tags) ? entry.tags.join(' ') : '',
    ].join(' '));
    const entryTokens = tokenize([
      entry.title,
      entry.provider,
      entry.summary,
      Array.isArray(entry.skills) ? entry.skills.join(' ') : '',
      Array.isArray(entry.tags) ? entry.tags.join(' ') : '',
    ].join(' '));

    let score = overlapScore(queryTokens, entryTokens);
    const directSkillOverlap = overlapScore(directSkillTokens, entryTokens);
    const pivotOverlap = overlapScore(pivotTokens, entryTokens);
    const entryIntent = inferEntryIntent(entry);

    score += directSkillOverlap * 3;
    score += Math.min(pivotOverlap, 2);

    for (const phrase of phraseSignals) {
      if (entrySearchText.includes(phrase)) {
        score += 8;
      }
    }

    if (Array.isArray(entry.pivot_frames) && entry.pivot_frames.includes(pivot?.decision_frame)) {
      score += 4;
    }

    if (
      Array.isArray(entry.role_families) &&
      entry.role_families.some((role) => roleSignals.includes(role)) &&
      (directSkillOverlap > 0 || skillIntent === entryIntent)
    ) {
      score += 3;
    }

    if (
      Array.isArray(entry.role_families) &&
      entry.role_families.some((role) => roleSignals.includes(role))
    ) {
      score += 2;
    }

    if (
      roleSignals.includes('customer') &&
      Array.isArray(entry.role_families) &&
      entry.role_families.includes('customer') &&
      /customer|service|renewal|account|crm/.test(entrySearchText)
    ) {
      score += 5;
    }

    if (
      roleSignals.includes('marketing') &&
      Array.isArray(entry.role_families) &&
      entry.role_families.includes('marketing') &&
      /marketing|campaign|growth|launch|gtm/.test(entrySearchText)
    ) {
      score += 5;
    }

    if (
      Array.isArray(entry.role_families) &&
      entry.role_families.includes('finance') &&
      roleSignals.includes('finance') &&
      (entrySearchText.includes('forecast') || entrySearchText.includes('model') || entrySearchText.includes('budget'))
    ) {
      score += 6;
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

    if (entry?.source_metadata?.collection === 'researched-expansion-pack' && entry.resource_type === 'pathway') {
      score -= 4;
    }

    if (isGenericCatalogTitle(entry.title)) {
      score -= 2;
    }

    if (isOverlyGenericLearningMatch(skillGap, {
      resource_title: entry.title,
      resource_url: entry.final_url || entry.url,
    })) {
      score -= 18;
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

    if (skillIntent === 'leadership' && entryIntent === 'technical' && directSkillOverlap === 0) {
      score -= 7;
    }

    if (skillIntent === 'operations' && entryIntent === 'technical' && directSkillOverlap === 0) {
      score -= 7;
    }

    if (skillIntent === 'technical' && entryIntent === 'communication') {
      score -= 5;
    }

    if (
      /\b(sql|dashboard|business intelligence|data model|data modeling|financial modeling|scenario modeling|forecast)\b/.test(
        normalizePhrase([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '))
      ) &&
      /\b(prompt|generative ai|genai|chatgpt|claude)\b/.test(entrySearchText) &&
      !/\b(sql|analytics|data|dashboard|forecast|finance)\b/.test(entrySearchText)
    ) {
      score -= 16;
    }

    if (
      roleSignals.includes('customer') &&
      /\b(renewal|account health|customer workflow|customer operations|customer success)\b/.test(
        normalizePhrase([skillGap?.skill_name, skillGap?.how_to_close_gap].join(' '))
      ) &&
      /\b(sql|python|data science|machine learning|prompt engineering)\b/.test(entrySearchText)
    ) {
      score -= 14;
    }

    if (
      roleSignals.includes('analytics') &&
      /\b(product|curriculum|legal|contract|customer success|service hub)\b/.test(entrySearchText) &&
      directSkillOverlap === 0
    ) {
      score -= 12;
    }

    if (skillGap?.category === 'soft_skill' && entryIntent === 'technical') {
      score -= 6;
    }

    if (skillGap?.category === 'soft_skill' && directSkillOverlap === 0) {
      score -= 4;
    }

    if (
      roleSignals.some((role) => ['customer', 'marketing', 'operations', 'hr'].includes(role)) &&
      Array.isArray(entry.role_families) &&
      !entry.role_families.some((role) => roleSignals.includes(role)) &&
      entry.role_families.some((role) => ['technical', 'analytics'].includes(role)) &&
      skillIntent !== 'technical'
    ) {
      score -= 7;
    }

    score -= domainMismatchPenalty(skillGap, pivot, entry);

    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  return best && best.score > 0 ? best : null;
}

function inferRoleFamilies(value) {
  const normalized = String(value || '').toLowerCase();
  const families = [];

  if (/(customer success|customer operations|account management|account health|renewal|customer support)/.test(normalized)) families.push('customer');
  if (/(people operations|human resources|hr|workforce|manager enablement|talent)/.test(normalized)) families.push('hr');
  if (/(procurement|sourcing|supplier|vendor|spend)/.test(normalized)) families.push('procurement');
  if (/(legal|contract|compliance|policy|governance|privacy|clm)/.test(normalized)) families.push('legal');
  if (/(education|learning|enablement|curriculum|instructional|training|onboarding)/.test(normalized)) families.push('education');
  if (/(data|analytics|sql|dashboard|bi|report)/.test(normalized)) families.push('analytics');
  if (/(finance|financial|fp&a|fpa|budget|forecast|planning model|scenario model)/.test(normalized)) families.push('finance');
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
  const specificFallback = buildSpecificResourceFallback(skillGap, pivot);

  if (trustedUrl) {
    const directResource = {
      resource_title: skillGap?.resource_title,
      resource_url: trustedUrl,
    };

    if (shouldPreferSpecificFallback({ entry: directResource, score: 0 }, specificFallback, skillGap, pivot)) {
      return {
        ...skillGap,
        ...specificFallback,
      };
    }

    if (isOverlyGenericLearningMatch(skillGap, directResource)) {
      if (specificFallback) {
        return {
          ...skillGap,
          ...specificFallback,
        };
      }
    } else {
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
  }

  const match = buildCatalogMatch(skillGap, pivot, catalogEntries);
  const shouldPreferCatalog = Boolean(
    match &&
    match.score >= (match.entry.resource_type === 'pathway' || isGenericCatalogTitle(match.entry.title) ? 8 : 4)
  );

  if (shouldPreferSpecificFallback(match, specificFallback, skillGap, pivot)) {
    return {
      ...skillGap,
      ...specificFallback,
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
