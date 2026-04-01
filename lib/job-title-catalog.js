import fs from 'node:fs/promises';
import path from 'node:path';

let cachedCatalogPromise;

function normalizeQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

async function loadCatalog() {
  if (!cachedCatalogPromise) {
    const seedPath = path.join(process.cwd(), 'data', 'job-title-catalog.seed.json');
    cachedCatalogPromise = fs.readFile(seedPath, 'utf8').then((raw) => JSON.parse(raw));
  }

  return cachedCatalogPromise;
}

function scoreTitleMatch(query, row) {
  if (!query) return 0;

  const title = row.normalized_title;
  const canonical = normalizeQuery(row.canonical_title);
  let score = 0;

  if (title === query) score += 100;
  if (canonical === query) score += 90;
  if (title.startsWith(query)) score += 50;
  if (canonical.startsWith(query)) score += 40;
  if (title.includes(query)) score += 25;
  if (canonical.includes(query)) score += 20;
  if (row.is_canonical) score += 8;
  score -= Math.min(title.length - query.length, 25) * 0.25;

  return score;
}

export async function searchJobTitles(query, limit = 8) {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const catalog = await loadCatalog();

  return catalog.rows
    .map((row) => ({ ...row, score: scoreTitleMatch(normalizedQuery, row) }))
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit)
    .map(({ score, ...row }) => row);
}

export async function getJobTitleCatalogStats() {
  const catalog = await loadCatalog();
  return {
    source: catalog.metadata.source,
    generatedAt: catalog.metadata.generated_at,
    occupationCount: catalog.metadata.canonical_occupation_count,
    titleCount: catalog.metadata.distinct_title_count,
  };
}
