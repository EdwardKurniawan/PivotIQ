const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

const SKILL_PATTERNS = [
  { label: 'SQL', regex: /\bsql\b/i, type: 'skill' },
  { label: 'Excel', regex: /\bexcel\b/i, type: 'tool' },
  { label: 'Python', regex: /\bpython\b/i, type: 'skill' },
  { label: 'R', regex: /\br\b(?=.*(analytics|statistics|modeling|analysis))/i, type: 'skill' },
  { label: 'Tableau', regex: /\btableau\b/i, type: 'tool' },
  { label: 'Power BI', regex: /\bpower\s*bi\b/i, type: 'tool' },
  { label: 'Looker', regex: /\blooker\b/i, type: 'tool' },
  { label: 'Snowflake', regex: /\bsnowflake\b/i, type: 'tool' },
  { label: 'dbt', regex: /\bdbt\b/i, type: 'tool' },
  { label: 'Salesforce', regex: /\bsalesforce\b/i, type: 'tool' },
  { label: 'HubSpot', regex: /\bhubspot\b/i, type: 'tool' },
  { label: 'NetSuite', regex: /\bnetsuite\b/i, type: 'tool' },
  { label: 'SAP', regex: /\bsap\b/i, type: 'tool' },
  { label: 'Workday', regex: /\bworkday\b/i, type: 'tool' },
  { label: 'Jira', regex: /\bjira\b/i, type: 'tool' },
  { label: 'Asana', regex: /\basana\b/i, type: 'tool' },
  { label: 'Notion', regex: /\bnotion\b/i, type: 'tool' },
  { label: 'Figma', regex: /\bfigma\b/i, type: 'tool' },
  { label: 'Google Analytics', regex: /\bgoogle analytics\b|\bga4\b/i, type: 'tool' },
  { label: 'Contract Lifecycle Management', regex: /\bclm\b|\bcontract lifecycle\b/i, type: 'skill' },
  { label: 'Vendor Management', regex: /\bvendor management\b|\bsupplier management\b/i, type: 'skill' },
  { label: 'Procurement', regex: /\bprocurement\b|\bsourcing\b/i, type: 'skill' },
  { label: 'Compliance', regex: /\bcompliance\b|\bregulatory\b/i, type: 'skill' },
  { label: 'Stakeholder Management', regex: /\bstakeholder management\b|\bcross-functional\b/i, type: 'skill' },
  { label: 'Program Management', regex: /\bprogram management\b/i, type: 'skill' },
  { label: 'Project Management', regex: /\bproject management\b/i, type: 'skill' },
  { label: 'Data Analysis', regex: /\bdata analysis\b|\banalytics\b/i, type: 'skill' },
  { label: 'Forecasting', regex: /\bforecasting\b|\bscenario planning\b/i, type: 'skill' },
  { label: 'Financial Modeling', regex: /\bfinancial modeling\b|\bfinancial model\b/i, type: 'skill' },
  { label: 'Instructional Design', regex: /\binstructional design\b|\bcurriculum\b/i, type: 'skill' },
  { label: 'Enablement', regex: /\benablement\b|\bonboarding\b/i, type: 'skill' },
  { label: 'Customer Success', regex: /\bcustomer success\b|\brenewal\b/i, type: 'skill' },
  { label: 'Marketing Operations', regex: /\bmarketing operations\b|\bdemand generation\b/i, type: 'skill' },
  { label: 'Workflow Automation', regex: /\bworkflow automation\b|\bprocess automation\b/i, type: 'skill' },
  { label: 'AI Tooling', regex: /\bgenerative ai\b|\bllm\b|\bai tools\b|\bai automation\b/i, type: 'skill' },
];

const FUNCTION_PATTERNS = [
  { label: 'legal', regex: /\blegal\b|\bcontract\b|\bcompliance\b|\bprivacy\b|\bgovernance\b/i },
  { label: 'procurement', regex: /\bprocurement\b|\bsourcing\b|\bsupplier\b|\bvendor\b|\bsupply chain\b/i },
  { label: 'education', regex: /\beducation\b|\blearning\b(?!\s+(infrastructure|engineer|engineering|platform|systems?|model))|\benablement\b|\btraining\b|\bonboarding\b|\binstructional\b/i },
  { label: 'marketing', regex: /\bmarketing\b|\bgrowth\b|\bbrand\b|\bcampaign\b|\bdemand gen\b/i },
  { label: 'finance', regex: /\bfinance\b|\bfp&a\b|\baccounting\b|\bforecast\b|\bbudget\b|\bpayments\b/i },
  { label: 'operations', regex: /\boperations\b|\bprogram\b|\bproject\b|\bprocess\b|\bworkflow\b/i },
  { label: 'customer', regex: /\bcustomer success\b|\baccount management\b|\bcustomer experience\b|\brenewal\b/i },
  { label: 'engineering', regex: /\bengineer\b|\bengineering\b|\bdeveloper\b|\bsoftware\b|\bfull stack\b|\bfrontend\b|\bbackend\b|\binfrastructure\b|\bplatform\b|\barchitecture\b/i },
  { label: 'product', regex: /\bproduct\b|\broadmap\b|\bprioritization\b|\bux\b|\buser experience\b/i },
];

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(html) {
  return normalizeWhitespace(
    String(html || '')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  );
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean).map((item) => normalizeWhitespace(item)))];
}

function tokenize(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
}

function scoreRoleFamily(text, weight, scores) {
  if (!text) return;
  for (const pattern of FUNCTION_PATTERNS) {
    if (pattern.regex.test(text)) {
      scores[pattern.label] = (scores[pattern.label] || 0) + weight;
    }
  }
}

export function inferRoleFamily({ title = '', department = '', description = '' }) {
  const scores = {};
  scoreRoleFamily(title, 4, scores);
  scoreRoleFamily(department, 2, scores);
  scoreRoleFamily(description, 1, scores);

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  if (!ranked.length) return 'general';
  if (ranked[0][1] < 3) return 'general';
  return ranked[0][0];
}

export function inferDomainFocus(value) {
  const text = normalizeWhitespace(value).toLowerCase();
  if (/\bcommercial contract\b|\bclause\b|\bcontract negotiation\b/.test(text)) return 'commercial contracts';
  if (/\bcustomer onboarding\b|\benablement program\b/.test(text)) return 'customer onboarding';
  if (/\bsupplier sourcing\b|\bstrategic sourcing\b/.test(text)) return 'supplier sourcing';
  if (/\bcompliance audit\b|\bregulatory review\b/.test(text)) return 'compliance audits';
  if (/\brenewal\b|\baccount health\b/.test(text)) return 'customer renewals';
  if (/\bforecast\b|\bvariance\b/.test(text)) return 'financial planning';
  return '';
}

function inferLocationType(locationText, bodyText) {
  const text = `${locationText} ${bodyText}`.toLowerCase();
  if (/\bhybrid\b/.test(text)) return 'hybrid';
  if (/\bon[- ]site\b|\bonsite\b/.test(text)) return 'on-site';
  if (/\bremote\b|\bwork from home\b/.test(text)) return 'remote';
  return '';
}

function inferEmploymentType(title, bodyText, suppliedType = '') {
  const text = `${title} ${suppliedType} ${bodyText}`.toLowerCase();
  if (/\bcontract\b|\bcontractor\b|\bfreelance\b/.test(text)) return 'contract';
  if (/\bpart[- ]time\b/.test(text)) return 'part-time';
  if (/\bintern(ship)?\b/.test(text)) return 'internship';
  if (/\btemporary\b|\bfixed[- ]term\b/.test(text)) return 'temporary';
  return 'full-time';
}

function inferSeniority(title, bodyText) {
  const text = `${title} ${bodyText}`.toLowerCase();
  if (/\bchief\b|\bvp\b|\bvice president\b|\bhead\b/.test(text)) return 'executive';
  if (/\bdirector\b/.test(text)) return 'director';
  if (/\bmanager\b|\blead\b|\bprincipal\b/.test(text)) return 'manager';
  if (/\bsenior\b|\bsr\b/.test(text)) return 'senior';
  if (/\bjunior\b|\bassociate\b|\bentry level\b/.test(text)) return 'junior';
  return '';
}

function extractPatternMatches(lines, matcherMode) {
  const matches = [];
  for (const line of lines) {
    const normalizedLine = line.toLowerCase();
    const lineIsPreferred = /\b(nice to have|preferred|bonus|plus|helpful)\b/.test(normalizedLine);
    const lineIsRequired = /\b(must|required|requirements|you have|experience with|proficient|expertise)\b/.test(normalizedLine);

    for (const pattern of SKILL_PATTERNS) {
      if (!pattern.regex.test(line)) continue;
      if (matcherMode === 'required' && lineIsPreferred && !lineIsRequired) continue;
      if (matcherMode === 'preferred' && !lineIsPreferred) continue;
      matches.push(pattern);
    }
  }
  return matches;
}

export function extractJobSignals(descriptionText) {
  const lines = String(descriptionText || '')
    .split(/\n+/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  const requiredMatches = extractPatternMatches(lines, 'required');
  const preferredMatches = extractPatternMatches(lines, 'preferred');
  const allMatches = extractPatternMatches(lines, 'all');

  const requiredSkills = unique(requiredMatches.filter((item) => item.type === 'skill').map((item) => item.label));
  const preferredSkills = unique(preferredMatches.filter((item) => item.type === 'skill').map((item) => item.label));
  const tools = unique(allMatches.filter((item) => item.type === 'tool').map((item) => item.label));
  const jobFunctions = unique(
    FUNCTION_PATTERNS.filter((pattern) => pattern.regex.test(descriptionText || '')).map((pattern) => pattern.label)
  );

  return {
    requiredSkills,
    preferredSkills: preferredSkills.filter((item) => !requiredSkills.includes(item)),
    tools,
    jobFunctions,
  };
}

function coerceDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': 'PivotIQ Jobs Catalog Sync',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

async function fetchGreenhouseSource(source) {
  const boardToken = source.source_config?.board_token || source.external_board_id;
  const url = source.source_url || `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
  const payload = await fetchJson(url);
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];

  return jobs.map((job) => ({
    sourceJobId: String(job.id || job.internal_job_id || ''),
    title: job.title || '',
    locationText: job.location?.name || '',
    department: Array.isArray(job.departments) ? job.departments.map((item) => item?.name).filter(Boolean).join(' / ') : '',
    employmentType: '',
    postingUrl: job.absolute_url || '',
    applyUrl: job.absolute_url || '',
    descriptionHtml: job.content || '',
    descriptionText: stripHtml(job.content || ''),
    postedAt: coerceDate(job.updated_at),
    rawPayload: job,
  })).filter((job) => job.sourceJobId && job.title);
}

async function fetchLeverSource(source) {
  const boardToken = source.source_config?.board_token || source.external_board_id;
  const url = source.source_url || `https://api.lever.co/v0/postings/${boardToken}?mode=json`;
  const payload = await fetchJson(url);
  const jobs = Array.isArray(payload) ? payload : [];

  return jobs.map((job) => {
    const descriptionHtml = [job.descriptionPlain, job.description, job.lists?.map((list) => list?.content).join('\n')].filter(Boolean).join('\n');
    return {
      sourceJobId: String(job.id || ''),
      title: job.text || job.title || '',
      locationText: job.categories?.location || '',
      department: job.categories?.team || job.categories?.department || '',
      employmentType: job.categories?.commitment || '',
      postingUrl: job.hostedUrl || '',
      applyUrl: job.applyUrl || job.hostedUrl || '',
      descriptionHtml,
      descriptionText: stripHtml(descriptionHtml),
      postedAt: coerceDate(job.createdAt || job.updatedAt),
      rawPayload: job,
    };
  }).filter((job) => job.sourceJobId && job.title);
}

async function fetchSmartRecruitersSource(source) {
  const identifier = source.source_config?.company_identifier || source.external_board_id;
  const limit = Number(source.source_config?.limit || 50);
  const baseUrl = source.source_url || `https://api.smartrecruiters.com/v1/companies/${identifier}/postings`;
  const listingPayload = await fetchJson(`${baseUrl}?limit=${limit}`);
  const jobs = Array.isArray(listingPayload?.content) ? listingPayload.content : [];

  const detailedJobs = [];
  for (const job of jobs) {
    const detailPayload = await fetchJson(`${baseUrl}/${job.id}`);
    const rawSections = detailPayload?.jobAd?.sections;
    const sections = Array.isArray(rawSections)
      ? rawSections
      : rawSections && typeof rawSections === 'object'
        ? Object.values(rawSections)
        : [];
    const descriptionHtml = sections.map((section) => section?.text || '').join('\n');
    const postingUrl = detailPayload.ref || detailPayload.jobAd?.jobAdUrl || job.ref || '';
    detailedJobs.push({
      sourceJobId: String(detailPayload.id || job.id || ''),
      title: detailPayload.name || job.name || '',
      locationText: [detailPayload.location?.city, detailPayload.location?.region, detailPayload.location?.country].filter(Boolean).join(', '),
      department: detailPayload.department?.label || job.department?.label || '',
      employmentType: detailPayload.typeOfEmployment?.label || job.typeOfEmployment?.label || '',
      postingUrl,
      applyUrl: postingUrl,
      descriptionHtml,
      descriptionText: stripHtml(descriptionHtml),
      postedAt: coerceDate(detailPayload.releasedDate || job.releasedDate),
      rawPayload: detailPayload,
    });
  }

  return detailedJobs.filter((job) => job.sourceJobId && job.title);
}

async function fetchRemoteOkSource(source) {
  const limit = Number(source.source_config?.limit || 100);
  const payload = await fetchJson(source.source_url || 'https://remoteok.com/api');
  const jobs = Array.isArray(payload) ? payload.slice(1, limit + 1) : [];

  return jobs.map((job) => ({
    sourceJobId: String(job.id || job.slug || ''),
    title: job.position || '',
    locationText: job.location || 'Remote',
    department: Array.isArray(job.tags) ? job.tags.slice(0, 2).join(' / ') : '',
    employmentType: '',
    postingUrl: job.url || '',
    applyUrl: job.apply_url || job.url || '',
    descriptionHtml: job.description || '',
    descriptionText: stripHtml(job.description || ''),
    postedAt: coerceDate(job.date || (job.epoch ? new Date(job.epoch * 1000).toISOString() : null)),
    rawPayload: job,
  })).filter((job) => job.sourceJobId && job.title);
}

async function fetchAdzunaSource(source) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const country = source.source_config?.country || source.external_board_id || 'us';
  const pages = Number(source.source_config?.pages || 1);
  const resultsPerPage = Number(source.source_config?.results_per_page || 50);
  const what = source.source_config?.what ? `&what=${encodeURIComponent(source.source_config.what)}` : '';
  const where = source.source_config?.where ? `&where=${encodeURIComponent(source.source_config.where)}` : '';

  const jobs = [];
  for (let page = 1; page <= pages; page += 1) {
    const url = `${source.source_url || `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=${resultsPerPage}${what}${where}&content-type=application/json`;
    const payload = await fetchJson(url);
    for (const job of payload?.results || []) {
      jobs.push({
        sourceJobId: String(job.id || job.redirect_url || ''),
        title: job.title || '',
        locationText: job.location?.display_name || '',
        department: job.category?.label || '',
        employmentType: job.contract_time || job.contract_type || '',
        postingUrl: job.redirect_url || '',
        applyUrl: job.redirect_url || '',
        descriptionHtml: job.description || '',
        descriptionText: stripHtml(job.description || ''),
        postedAt: coerceDate(job.created),
        salaryText: job.salary_is_predicted ? 'Predicted salary available' : '',
        rawPayload: job,
      });
    }
  }

  return jobs.filter((job) => job.sourceJobId && job.title);
}

export async function fetchJobsForSource(source) {
  const provider = String(source?.provider || '').toLowerCase();
  if (provider === 'greenhouse') return fetchGreenhouseSource(source);
  if (provider === 'lever') return fetchLeverSource(source);
  if (provider === 'smartrecruiters') return fetchSmartRecruitersSource(source);
  if (provider === 'remoteok') return fetchRemoteOkSource(source);
  if (provider === 'adzuna') return fetchAdzunaSource(source);
  throw new Error(`Unsupported provider: ${source?.provider || 'unknown'}`);
}

export function normalizeJobOpening(source, job) {
  const descriptionText = normalizeWhitespace(job.descriptionText || stripHtml(job.descriptionHtml || ''));
  const title = normalizeWhitespace(job.title);
  const companyName = normalizeWhitespace(source.company_name || job.companyName || '');
  const roleFamily = inferRoleFamily({
    title,
    department: job.department || '',
    description: descriptionText,
  });
  const domainFocus = inferDomainFocus(`${title} ${job.department || ''} ${descriptionText}`);
  const locationText = normalizeWhitespace(job.locationText || '');
  const employmentType = inferEmploymentType(title, descriptionText, job.employmentType);
  const seniority = inferSeniority(title, descriptionText);
  const signals = extractJobSignals(descriptionText);

  return {
    source_id: source.id,
    source_job_id: String(job.sourceJobId),
    provider: String(source.provider || '').toLowerCase(),
    company_name: companyName,
    title,
    normalized_title: tokenize(title).join(' '),
    slug: slugify(`${companyName}-${title}-${job.sourceJobId}`),
    department: normalizeWhitespace(job.department || ''),
    location_text: locationText,
    location_type: inferLocationType(locationText, descriptionText),
    employment_type: employmentType,
    seniority,
    salary_text: normalizeWhitespace(job.salaryText || ''),
    apply_url: normalizeWhitespace(job.applyUrl || ''),
    posting_url: normalizeWhitespace(job.postingUrl || job.applyUrl || ''),
    description_text: descriptionText,
    description_html: String(job.descriptionHtml || ''),
    domain_focus: domainFocus,
    role_family: roleFamily,
    required_skills: signals.requiredSkills,
    preferred_skills: signals.preferredSkills,
    tools: signals.tools,
    job_functions: signals.jobFunctions,
    metadata: {
      provider: source.provider,
      sync_frequency: source.sync_frequency,
    },
    raw_payload: job.rawPayload || {},
    posted_at: job.postedAt || null,
    closed_at: null,
    status: 'open',
    fetched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
