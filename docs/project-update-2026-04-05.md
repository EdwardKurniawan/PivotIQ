# Project Update — 2026-04-05

This file captures the current PivotIQ state so the next session can continue without rebuilding context.

## Current direction

PivotIQ now does more than generate model-only pivots. It:

- ingests live job postings into Supabase
- enriches postings with role family, skills, tools, proof assets, and summaries
- compares a user profile against real current openings
- grounds pivot recommendations against live market requirements
- shows model-vs-market skill gaps inside the report UI
- reranks pivots using market fit instead of raw model preference alone

## Model configuration

- OpenRouter model in use: `nvidia/nemotron-3-nano-30b-a3b:free`
- Claude references have been removed from the app

## Important seeded reports

- Procurement Analyst: `075b8ed5-0b26-4d1c-b904-5f886329d262`
- Customer Education Manager: `30be2b01-c0a5-4cca-a70e-1a017339896c`
- Legal Operations Manager: `98172726-3059-412b-869e-119bff813e4a`

## What was recently fixed

### Report coherence

- Added stronger normalization so reranked pivots are less likely to leave stale roadmap or first-30-days references behind.
- Added seniority-stretch penalties so unsupported `Head` and `Director` jumps do not dominate recommendations by default.
- Added more specific learning-resource fallbacks and reduced generic resource drift.

### Root cause of bad legal results

The main problem was not just prompt quality. The jobs database itself was polluted.

Many openings tagged as `legal` were actually:

- recruiters
- engineers
- product managers
- tax/controller roles
- counsel roles
- compliance-adjacent roles with off-track skill extraction

That bad data flowed into live-market grounding, which then injected noisy required skills like:

- `Enablement`
- `Procurement`
- `AI Tooling`

into legal pivots.

### Scalable fix added

`lib/job-grounding.js` now provides a deterministic validation layer:

- classify openings into narrower tracks like `legal-ops`, `contract-ops`, `compliance-risk`, `legal-counsel`, `finance-control`, `product-compliance`, `engineering`, and `recruiting`
- canonicalize role family from job track instead of trusting raw LLM enrichment alone
- sanitize required skills by track before they affect reports
- reject openings from specialized-role grounding when they are not truly adjacent to the pivot

This means even if the catalog is still dirty, reports are more protected at runtime.

## Validation run

Code-state checks passed:

- `npm run test:market-ranking`
- `npm run test:job-grounding`
- `npm run build`

Observed effect of the new legal filter:

- raw `role_family = legal` openings in current sample: `24`
- openings still eligible for a legal-ops-style pivot after filtering: `4`

That reduction is intentional and desirable.

## Known remaining issues

### 1. Dev server instability during repeated regeneration

Repeated `next dev` regenerations eventually hit transient vendor-chunk errors like:

- `Cannot find module './chunks/vendor-chunks/next.js'`
- `Cannot find module './chunks/vendor-chunks/@supabase.js'`

This appears to be a local Next dev/HMR artifact, not a report-logic failure.

Temporary workaround:

1. stop dev
2. `rm -rf .next`
3. restart `npm run dev`

### 2. Catalog still needs backfill

The runtime filter is better now, but many already-enriched rows in Supabase still contain bad role-family or skill data.

Backfill needed:

```bash
npm run db:enrich-job-openings -- --force --role-family=legal --limit=50
```

Potentially repeat for other specialized families later:

- procurement
- education
- finance

### 3. Report regeneration after grounding backfill

After the catalog is backfilled, regenerate the seeded reports again, especially:

- Legal Operations Manager

and inspect whether the top pivot becomes cleaner and the market-backed gaps lose contaminated skills.

## Most important next steps

1. Backfill specialized-family openings beyond legal, especially `education` and `procurement`, using the same grounding normalization approach.
2. Regenerate the seeded non-legal fixtures and inspect whether live-market grounding remains credible after the broader backfill.
3. Expand deterministic job-track filtering and skill sanitation for other specialized families if similar drift appears.
4. Improve catalog quality controls so enrichment failures, polluted tracks, and weak market evidence are visible before they affect reports.

## Low-priority follow-up

- Legal report content quality can still improve even though grounding and plan coherence are now better.
- Specifically, legal pivots like `Contract Lifecycle Manager` still get overly AI-generic first skills such as `Prompt design`.
- Low-priority content cleanup later:
  - prefer legal-first defaults like `Contract lifecycle administration`
  - `Clause library design`
  - `Legal intake workflow design`
  - `Regulatory workflow governance`

## Relevant files

- [lib/job-grounding.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/job-grounding.js)
- [lib/job-gap-analysis.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/job-gap-analysis.js)
- [lib/job-opening-enrichment.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/job-opening-enrichment.js)
- [lib/job-openings.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/job-openings.js)
- [lib/report-data.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
- [lib/report-generation.js](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-generation.js)
- [docs/job-openings-catalog.md](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/job-openings-catalog.md)

## Recent commits

- `b17f6be` Tighten report coherence and pivot realism
- `1c13855` Harden job grounding for specialized roles
