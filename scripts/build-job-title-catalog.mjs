import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OCCUPATION_DATA_URL = 'https://www.onetcenter.org/dl_files/database/db_30_2_text/Occupation%20Data.txt';
const ALTERNATE_TITLES_URL = 'https://www.onetcenter.org/dl_files/database/db_30_2_text/Alternate%20Titles.txt';

const WHITE_COLLAR_MAJOR_GROUPS = {
  '11': 'Management',
  '13': 'Business and Financial Operations',
  '15': 'Computer and Mathematical',
  '17': 'Architecture and Engineering',
  '19': 'Life, Physical, and Social Science',
  '21': 'Community and Social Service',
  '23': 'Legal',
  '25': 'Educational Instruction and Library',
  '27': 'Arts, Design, Entertainment, Sports, and Media',
  '29': 'Healthcare Practitioners and Technical',
  '41': 'Sales and Related',
  '43': 'Office and Administrative Support',
};

function parseTsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split('\t');

  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeTitle(value) {
  return normalizeWhitespace(value).toLowerCase();
}

function slugify(value) {
  return normalizeTitle(value)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function getMajorGroup(code) {
  return WHITE_COLLAR_MAJOR_GROUPS[String(code || '').slice(0, 2)] || null;
}

function buildCatalog(occupations, alternateTitles) {
  const whiteCollarOccupations = occupations
    .map((occupation) => {
      const majorGroupCode = String(occupation['O*NET-SOC Code'] || '').slice(0, 2);
      const majorGroupName = getMajorGroup(occupation['O*NET-SOC Code']);

      if (!majorGroupName) {
        return null;
      }

      return {
        onet_soc_code: occupation['O*NET-SOC Code'],
        canonical_title: normalizeWhitespace(occupation.Title),
        description: normalizeWhitespace(occupation.Description),
        major_group_code: majorGroupCode,
        major_group_name: majorGroupName,
      };
    })
    .filter(Boolean);

  const occupationByCode = new Map(
    whiteCollarOccupations.map((occupation) => [occupation.onet_soc_code, occupation])
  );

  const deduped = new Map();

  function upsertTitle({
    title,
    canonicalTitle,
    onetSocCode,
    majorGroupCode,
    majorGroupName,
    sourceType,
    sourceName,
    isCanonical,
  }) {
    const cleanedTitle = normalizeWhitespace(title);

    if (!cleanedTitle) {
      return;
    }

    const normalizedTitle = normalizeTitle(cleanedTitle);
    const existing = deduped.get(normalizedTitle);

    if (existing) {
      existing.source_names = Array.from(new Set([...existing.source_names, sourceName]));

      if (existing.is_canonical) {
        return;
      }

      if (isCanonical) {
        existing.slug = slugify(cleanedTitle);
        existing.title = cleanedTitle;
        existing.canonical_title = canonicalTitle;
        existing.onet_soc_code = onetSocCode;
        existing.major_group_code = majorGroupCode;
        existing.major_group_name = majorGroupName;
        existing.source_type = sourceType;
        existing.is_canonical = true;
      }

      return;
    }

    deduped.set(normalizedTitle, {
      slug: slugify(cleanedTitle),
      title: cleanedTitle,
      normalized_title: normalizedTitle,
      canonical_title: canonicalTitle,
      onet_soc_code: onetSocCode,
      major_group_code: majorGroupCode,
      major_group_name: majorGroupName,
      source_type: sourceType,
      source_names: [sourceName],
      is_canonical: isCanonical,
    });
  }

  for (const occupation of whiteCollarOccupations) {
    upsertTitle({
      title: occupation.canonical_title,
      canonicalTitle: occupation.canonical_title,
      onetSocCode: occupation.onet_soc_code,
      majorGroupCode: occupation.major_group_code,
      majorGroupName: occupation.major_group_name,
      sourceType: 'canonical',
      sourceName: 'Occupation Data',
      isCanonical: true,
    });
  }

  for (const alternate of alternateTitles) {
    const occupation = occupationByCode.get(alternate['O*NET-SOC Code']);

    if (!occupation) {
      continue;
    }

    upsertTitle({
      title: alternate['Alternate Title'],
      canonicalTitle: occupation.canonical_title,
      onetSocCode: occupation.onet_soc_code,
      majorGroupCode: occupation.major_group_code,
      majorGroupName: occupation.major_group_name,
      sourceType: 'alternate',
      sourceName: normalizeWhitespace(alternate['Source(s)']) || 'Alternate Titles',
      isCanonical: false,
    });
  }

  const slugCounts = new Map();
  const rows = Array.from(deduped.values())
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((row) => {
      const slugBase = row.slug || slugify(row.title) || row.onet_soc_code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const seenCount = slugCounts.get(slugBase) || 0;
      slugCounts.set(slugBase, seenCount + 1);

      return {
        ...row,
        slug: seenCount === 0 ? slugBase : `${slugBase}-${seenCount + 1}`,
        source_names: row.source_names.sort(),
      };
    });

  const metadata = {
    source: 'O*NET 30.2',
    generated_at: new Date().toISOString(),
    source_urls: {
      occupation_data: OCCUPATION_DATA_URL,
      alternate_titles: ALTERNATE_TITLES_URL,
    },
    white_collar_major_groups: WHITE_COLLAR_MAJOR_GROUPS,
    canonical_occupation_count: whiteCollarOccupations.length,
    distinct_title_count: rows.length,
  };

  return { metadata, rows };
}

const [occupationResponse, alternateResponse] = await Promise.all([
  fetch(OCCUPATION_DATA_URL),
  fetch(ALTERNATE_TITLES_URL),
]);

if (!occupationResponse.ok || !alternateResponse.ok) {
  throw new Error('Failed to download O*NET title data.');
}

const [occupationText, alternateText] = await Promise.all([
  occupationResponse.text(),
  alternateResponse.text(),
]);

const output = buildCatalog(parseTsv(occupationText), parseTsv(alternateText));
const outputPath = path.join(process.cwd(), 'data', 'job-title-catalog.seed.json');

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(
  `Built ${output.rows.length} distinct white-collar job titles from ${output.metadata.canonical_occupation_count} O*NET occupations.`
);
