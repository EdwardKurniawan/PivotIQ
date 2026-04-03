import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const apiToken = process.env.COURSERA_BUSINESS_API_TOKEN;
const orgId = process.env.COURSERA_BUSINESS_ORG_ID;
const apiBase = (process.env.COURSERA_BUSINESS_API_BASE || 'https://api.coursera.com/ent').replace(/\/$/, '');
const pageLimit = Math.min(Number(process.env.COURSERA_BUSINESS_PAGE_LIMIT || 100), 100);
const modifiedSinceTimestamp = Number(process.env.COURSERA_MODIFIED_SINCE_TIMESTAMP || 0);
const includeDetails = String(process.env.COURSERA_INCLUDE_DETAILS || 'false').toLowerCase() === 'true';
const requestTimeoutMs = Number(process.env.COURSERA_REQUEST_TIMEOUT_MS || 60000);

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

if (!apiToken) {
  console.error('COURSERA_BUSINESS_API_TOKEN is not set.');
  process.exit(1);
}

if (!orgId) {
  console.error('COURSERA_BUSINESS_ORG_ID is not set.');
  process.exit(1);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeLevel(value) {
  const level = String(value || '').trim().toLowerCase();
  if (!level) return '';
  if (level === 'beginner') return 'Beginner';
  if (level === 'intermediate') return 'Intermediate';
  if (level === 'advanced') return 'Advanced';
  if (level === 'mixed') return 'Mixed';
  return value;
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function buildCanonicalUrl(content) {
  const slug = content?.extraMetadata?.slug;
  const type = content?.extraMetadata?.contentType || content?.contentType || '';

  if (slug && type === 'Course') return `https://www.coursera.org/learn/${slug}`;
  if (slug && type === 'Specialization') return `https://www.coursera.org/specializations/${slug}`;

  const programUrl = content?.programs?.find((item) => item?.contentUrl)?.contentUrl;
  return programUrl || '';
}

function buildCatalogRow(content) {
  const externalId = content?.id || null;
  const contentId = content?.contentId || externalId?.split('~').slice(1).join('~') || '';
  const title = String(content?.name || '').trim();
  const summary = String(content?.description || '').trim();
  const url = buildCanonicalUrl(content);
  const partners = uniq((content?.partners || []).map((partner) => partner?.name));
  const providerProgramIds = uniq((content?.programs || []).map((program) => program?.programId));
  const tags = uniq([
    'coursera',
    'coursera-for-business',
    content?.extraMetadata?.contentType || content?.contentType || '',
    content?.languageCode || '',
    content?.difficultyLevel || '',
    ...partners,
  ]);
  const slugBase = content?.extraMetadata?.slug || contentId || title;

  return {
    slug: `coursera-${slugify(slugBase)}`,
    provider: 'Coursera',
    external_id: externalId,
    title,
    url,
    summary,
    skills: [],
    tags,
    is_paid: true,
    price_label: 'Included with Coursera for Business',
    level: normalizeLevel(content?.difficultyLevel),
    duration_label: '',
    resource_type: String(content?.extraMetadata?.contentType || content?.contentType || 'Course').toLowerCase(),
    role_families: [],
    pivot_frames: [],
    outcome_types: [],
    status: 'active',
    verification_status: 'verified',
    final_url: url || null,
    provider_program_ids: providerProgramIds,
    provider_partners: partners,
    language_code: String(content?.languageCode || '').trim(),
    source_metadata: {
      contentId,
      contentType: content?.extraMetadata?.contentType || content?.contentType || '',
      difficultyLevel: content?.difficultyLevel || '',
      subtitleLanguageCodes: content?.subtitleLanguageCodes || [],
      instructors: (content?.instructors || []).map((instructor) => ({
        name: instructor?.name || '',
        title: instructor?.title || '',
        department: instructor?.department || '',
      })),
      programs: content?.programs || [],
      extraMetadata: content?.extraMetadata || {},
      lastUpdatedAt: content?.lastUpdatedAt || null,
    },
  };
}

async function courseraFetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Coursera API ${response.status} for ${url}: ${body.slice(0, 500)}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchContentsPage(start) {
  const params = new URLSearchParams({
    start: String(start),
    limit: String(pageLimit),
    contentTypes: 'Course',
  });

  if (modifiedSinceTimestamp > 0) {
    params.set('modifiedSinceTimestamp', String(modifiedSinceTimestamp));
  }

  return courseraFetchJson(`${apiBase}/api/businesses.v1/${orgId}/contents?${params.toString()}`);
}

async function fetchContentDetail(id) {
  return courseraFetchJson(`${apiBase}/api/businesses.v1/${orgId}/contents/${encodeURIComponent(id)}`);
}

async function fetchAllCourses() {
  const all = [];
  let start = 0;

  while (true) {
    const page = await fetchContentsPage(start);
    const elements = Array.isArray(page?.elements) ? page.elements : [];
    all.push(...elements);

    if (elements.length < pageLimit) break;
    start += elements.length;
  }

  if (!includeDetails) return all;

  const detailed = [];
  for (const item of all) {
    const detailResponse = await fetchContentDetail(item.id);
    const detail = Array.isArray(detailResponse?.elements) ? detailResponse.elements[0] : null;
    detailed.push(detail || item);
  }

  return detailed;
}

async function upsertCourses(rows) {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    for (const row of rows) {
      await client.query(
        `
          insert into public.course_catalog (
            slug,
            provider,
            external_id,
            title,
            url,
            summary,
            skills,
            tags,
            is_paid,
            price_label,
            level,
            duration_label,
            resource_type,
            role_families,
            pivot_frames,
            outcome_types,
            status,
            verification_status,
            final_url,
            provider_program_ids,
            provider_partners,
            language_code,
            source_metadata,
            verified_at
          )
          values (
            $1, $2, $3, $4, $5,
            $6, $7::text[], $8::text[], $9, $10,
            $11, $12, $13, $14::text[], $15::text[], $16::text[],
            $17, $18, $19, $20::text[], $21::text[], $22, $23::jsonb, now()
          )
          on conflict (provider, external_id) where external_id is not null do update set
            slug = excluded.slug,
            title = excluded.title,
            url = excluded.url,
            summary = excluded.summary,
            skills = excluded.skills,
            tags = excluded.tags,
            is_paid = excluded.is_paid,
            price_label = excluded.price_label,
            level = excluded.level,
            duration_label = excluded.duration_label,
            resource_type = excluded.resource_type,
            role_families = excluded.role_families,
            pivot_frames = excluded.pivot_frames,
            outcome_types = excluded.outcome_types,
            status = excluded.status,
            verification_status = excluded.verification_status,
            final_url = excluded.final_url,
            provider_program_ids = excluded.provider_program_ids,
            provider_partners = excluded.provider_partners,
            language_code = excluded.language_code,
            source_metadata = excluded.source_metadata,
            verified_at = now(),
            updated_at = now()
        `,
        [
          row.slug,
          row.provider,
          row.external_id,
          row.title,
          row.url,
          row.summary,
          row.skills,
          row.tags,
          row.is_paid,
          row.price_label,
          row.level,
          row.duration_label,
          row.resource_type,
          row.role_families,
          row.pivot_frames,
          row.outcome_types,
          row.status,
          row.verification_status,
          row.final_url,
          row.provider_program_ids,
          row.provider_partners,
          row.language_code,
          JSON.stringify(row.source_metadata || {}),
        ]
      );
    }
  } finally {
    await client.end();
  }
}

const contents = await fetchAllCourses();
const rows = contents.map(buildCatalogRow).filter((row) => row.title && row.url && row.external_id);

await upsertCourses(rows);

console.log(`Synced ${rows.length} Coursera courses into public.course_catalog using GET /api/businesses.v1/{orgId}/contents.`);
