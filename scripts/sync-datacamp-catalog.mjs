import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const apiToken =
  process.env.DATACAMP_LMS_CATALOG_API_TOKEN ||
  process.env.DATACAMP_LMS_API_TOKEN ||
  process.env.DATACAMP_API_TOKEN;
const apiUrl = process.env.DATACAMP_LMS_CATALOG_API_URL || 'https://lms-catalog-api.datacamp.com/v1/catalog/live-courses';
const requestTimeoutMs = Number(process.env.DATACAMP_REQUEST_TIMEOUT_MS || 60000);

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

if (!apiToken) {
  console.error('DATACAMP_LMS_CATALOG_API_TOKEN is not set.');
  console.error('You can also use DATACAMP_LMS_API_TOKEN or DATACAMP_API_TOKEN for local compatibility.');
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

function uniq(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function nestedValue(object, paths) {
  for (const path of paths) {
    const value = path.split('.').reduce((current, key) => current?.[key], object);
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return '';
}

function normalizeLevel(value) {
  const level = String(value || '').trim().toLowerCase();
  if (!level) return '';
  if (/beginner|introductory|novice/.test(level)) return 'Beginner';
  if (/intermediate/.test(level)) return 'Intermediate';
  if (/advanced|expert/.test(level)) return 'Advanced';
  return String(value || '').trim();
}

function pickCourseUrl(course) {
  const direct = nestedValue(course, [
    'url',
    'course_url',
    'courseUrl',
    'public_url',
    'publicUrl',
    'public_info_url',
    'publicInfoUrl',
    'info_url',
    'infoUrl',
    'link',
    'href',
  ]);

  if (direct) return String(direct);

  const slug = nestedValue(course, ['slug', 'course_slug', 'courseSlug']);
  if (slug) return `https://www.datacamp.com/courses/${slug}`;

  return '';
}

function pickCourseId(course) {
  return String(nestedValue(course, [
    'id',
    'course_id',
    'courseId',
    'uid',
    'slug',
    'course_slug',
    'courseSlug',
  ]) || '').trim();
}

function pickNameList(course, paths) {
  return uniq(paths.flatMap((path) => asArray(path.split('.').reduce((current, key) => current?.[key], course)).map((item) => {
    if (typeof item === 'string') return item;
    return item?.name || item?.title || item?.slug || item?.id || '';
  })));
}

function inferFamilies(values) {
  const text = values.join(' ').toLowerCase();
  const families = [];

  if (/(data|analytics|sql|dashboard|bi|tableau|power bi|statistics|spreadsheet)/.test(text)) families.push('analytics');
  if (/(python|r programming|machine learning|engineering|technical|api|database|git)/.test(text)) families.push('technical');
  if (/(ai|artificial intelligence|generative|llm|prompt|automation)/.test(text)) families.push('ai-automation');
  if (/(project|program|operations|workflow|process)/.test(text)) families.push('operations');
  if (/(leadership|strategy|change|stakeholder|communication)/.test(text)) families.push('strategy');
  if (/(marketing|growth|seo|campaign)/.test(text)) families.push('marketing');
  if (/(finance|financial|accounting)/.test(text)) families.push('finance');

  return uniq(families);
}

function inferOutcomeTypes(values) {
  const text = values.join(' ').toLowerCase();
  const outcomes = [];

  if (/(sql|python| r |analysis|analytics|dashboard|data|statistics|machine learning)/.test(` ${text} `)) outcomes.push('technical-skill');
  if (/(ai|prompt|automation|generative|llm)/.test(text)) outcomes.push('ai-execution');
  if (/(project|portfolio|case study|build|hands-on)/.test(text)) outcomes.push('portfolio');
  if (/(leadership|strategy|change|stakeholder)/.test(text)) outcomes.push('strategy');

  if (!outcomes.length) outcomes.push('general-upskilling');

  return uniq(outcomes);
}

function normalizeResourceType(course) {
  const type = String(nestedValue(course, ['resource_type', 'resourceType', 'type', 'content_type', 'contentType']) || 'course').trim();
  return type ? type.toLowerCase() : 'course';
}

function buildCatalogRow(course) {
  const externalId = pickCourseId(course);
  const title = String(nestedValue(course, ['title', 'name', 'course_title', 'courseTitle']) || '').trim();
  const url = pickCourseUrl(course);
  const summary = String(nestedValue(course, ['description', 'short_description', 'shortDescription', 'summary']) || '').trim();
  const technologies = pickNameList(course, ['technologies', 'technology', 'tools', 'programming_languages', 'programmingLanguages']);
  const topics = pickNameList(course, ['topics', 'topic', 'subjects', 'categories', 'category']);
  const skills = uniq([
    ...pickNameList(course, ['skills', 'skill_names', 'skillNames']),
    ...technologies,
    ...topics,
  ]);
  const tags = uniq([
    'datacamp',
    'datacamp-lms-catalog',
    normalizeResourceType(course),
    normalizeLevel(nestedValue(course, ['difficulty', 'difficulty_level', 'difficultyLevel', 'level'])),
    ...technologies,
    ...topics,
  ]);
  const sourceValues = [title, summary, ...skills, ...tags];

  return {
    slug: `datacamp-${slugify(nestedValue(course, ['slug', 'course_slug', 'courseSlug']) || externalId || title)}`,
    provider: 'DataCamp',
    external_id: externalId,
    title,
    url,
    summary,
    skills,
    tags,
    is_paid: true,
    price_label: 'Included with DataCamp for Business',
    level: normalizeLevel(nestedValue(course, ['difficulty', 'difficulty_level', 'difficultyLevel', 'level'])),
    duration_label: String(nestedValue(course, ['duration', 'duration_label', 'durationLabel', 'time_to_complete', 'timeToComplete']) || '').trim(),
    resource_type: normalizeResourceType(course),
    role_families: inferFamilies(sourceValues),
    pivot_frames: [],
    outcome_types: inferOutcomeTypes(sourceValues),
    status: 'active',
    verification_status: 'verified',
    final_url: url || null,
    provider_program_ids: [],
    provider_partners: ['DataCamp'],
    language_code: String(nestedValue(course, ['language', 'language_code', 'languageCode']) || '').trim(),
    source_metadata: course,
  };
}

async function fetchDataCampCourses() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`DataCamp API ${response.status} for ${apiUrl}: ${body.slice(0, 500)}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.courses)) return payload.courses;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.elements)) return payload.elements;

    throw new Error(`Unexpected DataCamp API response shape: ${JSON.stringify(Object.keys(payload || {}))}`);
  } finally {
    clearTimeout(timeout);
  }
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

const courses = await fetchDataCampCourses();
const rows = courses.map(buildCatalogRow).filter((row) => row.title && row.url && row.external_id);

await upsertCourses(rows);

console.log(`Synced ${rows.length} DataCamp courses into public.course_catalog using GET ${apiUrl}.`);
