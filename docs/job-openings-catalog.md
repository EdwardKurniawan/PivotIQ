# Job Openings Catalog

PivotIQ can now ingest live job descriptions into Supabase so we can learn from real market demand instead of relying only on static role assumptions.

## What it stores

- `job_sources`: public boards or APIs to sync from
- `job_openings`: normalized job postings, description text, skills, tools, role family, and raw payload

## Supported providers

- `greenhouse`
- `lever`
- `smartrecruiters`
- `remoteok`
- `adzuna` (optional, requires API keys)

## Commands

```bash
npm run db:apply-schema
npm run db:seed-job-sources
npm run db:sync-job-openings
```

To sync only one source:

```bash
node --env-file=.env.local scripts/sync-job-openings.mjs --source=stripe-greenhouse
```

## Notes

- This first pass is a safe ingestion layer, not a universal scraper.
- Prefer public ATS feeds and approved APIs over brittle scraping of restricted job boards.
- `required_skills`, `preferred_skills`, and `tools` are extracted heuristically from the description text and can be upgraded later with LLM enrichment or taxonomy matching.
- `remoteok` has attribution requirements in the feed response. Respect them anywhere the data is shown externally.

## Best next upgrades

- Add LLM-based enrichment to extract proof assets, outcomes, and sharper skill taxonomies.
- Link postings to O*NET / ESCO occupation families.
- Add embeddings and search so we can compare a user profile against current live roles.
