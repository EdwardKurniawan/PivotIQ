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
npm run db:audit-job-openings
npm run db:reclassify-job-openings
npm run reports:regenerate -- --ids=<report-id>
npm run test:job-grounding
```

To sync only one source:

```bash
node --env-file=.env.local scripts/sync-job-openings.mjs --source=stripe-greenhouse
```

To force a backfill of already-enriched legal openings after a grounding change:

```bash
npm run db:enrich-job-openings -- --force --role-family=legal --limit=50
```

To backfill other specialized families:

```bash
npm run db:enrich-job-openings -- --force --role-family=education --limit=50
npm run db:enrich-job-openings -- --force --role-family=procurement --limit=50
```

To audit catalog quality after a sync or backfill:

```bash
npm run db:audit-job-openings -- --limit=250
```

To deterministically correct noisy role-family labels without another LLM enrichment pass:

```bash
npm run db:reclassify-job-openings -- --limit=300
```

To regenerate stored reports directly without `next dev`:

```bash
npm run reports:regenerate -- --ids=075b8ed5-0b26-4d1c-b904-5f886329d262,30be2b01-c0a5-4cca-a70e-1a017339896c
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
- Live-market grounding is filtered through a deterministic job-track validator before postings are allowed to influence specialized pivots.
- Each pivot can include:
  - `live_market_signal.market_required_skills`
  - `live_market_signal.missing_required_skills`
  - `live_market_signal.model_only_skill_gaps`
  - `live_market_signal.market_only_required_skills`
  - `live_market_signal.profile_fit_score`
- Top-level report payload also includes `live_market_grounding` so we can audit what the model suggested against what live postings actually require.

## Specialized-role hardening

- `lib/job-grounding.js` now classifies openings into narrower tracks such as `legal-ops`, `contract-ops`, `compliance-risk`, `legal-counsel`, `finance-control`, `product-compliance`, `engineering`, and `recruiting`.
- Role-family grounding no longer trusts raw LLM enrichment on its own.
- Required skills are sanitized by track before they influence report pivots.
- Openings can be rejected from pivot grounding even if they still exist in the catalog, which protects reports while the catalog is being backfilled.
- Source-level filters can now be configured on `job_sources.source_config` with `include_title_keywords`, `exclude_title_keywords`, `include_text_keywords`, and `max_jobs`. This lets PivotIQ ingest only role-relevant postings from broad company ATS boards instead of syncing every engineering, sales, or product role from that company.

This was added after legal-role reports were polluted by mismatched openings like recruiters, engineers, tax/control roles, counsel roles, and compliance-adjacent product roles being treated as legal-ops evidence.

## Quality controls

- `db:audit-job-openings` now reports:
  - open-count distribution by `role_family`
  - top suspicious role-family transitions such as `general -> product`
  - failed enrichments
  - suspicious openings whose canonical family or cleaned skills do not match their stored enrichment
- This is meant to catch polluted catalog segments before they distort report grounding.

Recent audit snapshot after legal, education, and procurement backfills:

- most common suspicious transition: `general -> product`
- legal-specific drift is much lower than before, but not fully eliminated
- procurement and education still have thin role-pure coverage, which is why some seeded pivots remain model-led

Recent audit snapshot after deterministic reclassification:

- the large `general -> product` mismatch bucket was replaced by explicit `engineering` classification
- top remaining mismatch counts dropped to:
  - `general -> engineering`
  - `general -> legal`
  - `operations -> engineering`
- this means the catalog is now separating engineering demand from product demand instead of letting it pollute product grounding

## Role-filtered ATS sources

The seed file now includes targeted Greenhouse sources for legal, procurement, contracts, sourcing, compliance, privacy, vendor-risk, and supply-chain coverage:

- `anthropic-role-filtered-greenhouse`
- `airtable-role-filtered-greenhouse`
- `cloudflare-role-filtered-greenhouse`
- `flexport-role-filtered-greenhouse`
- `faire-role-filtered-greenhouse`
- `databricks-role-filtered-greenhouse`
- `appliedintuition-role-filtered-greenhouse`
- `gigaenergy-role-filtered-greenhouse`
- `intercom-role-filtered-greenhouse`

These sources are intentionally filtered at ingestion time. They are not meant to become broad company catalogs; they are meant to improve role-pure market evidence for specialized PivotIQ fixtures.

After the filtered-source sync and deterministic reclassification, the catalog sample had roughly:

- `legal`: 72 open postings
- `procurement`: 10 open postings
- `education`: 5 open postings
- no suspicious role-family mismatches in the latest broad audit sample

OpenRouter enrichment hit `429` on some rows during the backfill, so deterministic grounding remains the safer source of truth until the failed enrichment rows are retried.

## Best next upgrades

- Add LLM-based enrichment to extract proof assets, outcomes, and sharper skill taxonomies.
- Link postings to O*NET / ESCO occupation families.
- Add embeddings and search so we can compare a user profile against current live roles.
- Add a UI for exploring `/api/job-openings/search`.
