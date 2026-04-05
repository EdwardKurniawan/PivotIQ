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
npm run db:enrich-job-openings
```

To sync only one source:

```bash
node --env-file=.env.local scripts/sync-job-openings.mjs --source=stripe-greenhouse
```

## Notes

- This first pass is a safe ingestion layer, not a universal scraper.
- Prefer public ATS feeds and approved APIs over brittle scraping of restricted job boards.
- `required_skills`, `preferred_skills`, and `tools` are extracted heuristically from the description text and can be upgraded later with LLM enrichment or taxonomy matching.
- `db:enrich-job-openings` uses OpenRouter with `nvidia/nemotron-3-nano-30b-a3b:free` to improve role family, domain focus, skills, tools, proof assets, and summary fields.
- `remoteok` has attribution requirements in the feed response. Respect them anywhere the data is shown externally.

## APIs

- `GET /api/job-openings/search?q=payments&skills=SQL&limit=5`
- `POST /api/job-openings/gap-analysis`

Example `gap-analysis` payload:

```json
{
  "targetTitle": "Payments Performance Strategist",
  "roleFamily": "finance",
  "profile": {
    "job_title": "Procurement Analyst",
    "tasks": ["Reporting and status updates", "Analysis and insight generation"],
    "selected_tasks": [
      { "task_id": "reporting", "label": "Reporting and status updates" },
      { "task_id": "analysis", "label": "Analysis and insight generation" }
    ],
    "primary_tasks": ["Analysis and insight generation"],
    "clarifiers": {
      "core_systems": ["Excel", "NetSuite"]
    }
  }
}
```

## Report grounding

- Full report generation now adds live-market grounding to each pivot.
- Each pivot can include:
  - `live_market_signal.market_required_skills`
  - `live_market_signal.missing_required_skills`
  - `live_market_signal.model_only_skill_gaps`
  - `live_market_signal.market_only_required_skills`
  - `live_market_signal.profile_fit_score`
- Top-level report payload also includes `live_market_grounding` so we can audit what the model suggested against what live postings actually require.

## Best next upgrades

- Add LLM-based enrichment to extract proof assets, outcomes, and sharper skill taxonomies.
- Link postings to O*NET / ESCO occupation families.
- Add embeddings and search so we can compare a user profile against current live roles.
- Add a UI for exploring `/api/job-openings/search`.
