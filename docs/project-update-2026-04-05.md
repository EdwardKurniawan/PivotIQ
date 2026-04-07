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
- Legacy non-OpenRouter model references have been removed from the app

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

Better workaround now in repo:

```bash
npm run reports:regenerate -- --ids=<report-id-1>,<report-id-2>
```

This script regenerates stored reports directly through `generatePivotIQReport` and writes them back to Supabase, so validation no longer depends on a flaky long-lived dev server.

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

Progress since the first note:

- `education` backfill was run with `--force --role-family=education --limit=50`
- `procurement` backfill was run with `--force --role-family=procurement --limit=50`
- this exposed more mislabeled rows in both families, which is now visible through the audit command

### 3. Report regeneration after grounding backfill

After the catalog is backfilled, regenerate the seeded reports again, especially:

- Legal Operations Manager

and inspect whether the top pivot becomes cleaner and the market-backed gaps lose contaminated skills.

Current non-legal rerun status:

- `Customer Education Manager` was regenerated successfully
  - top pivot remains `Customer Education Lead`
  - downstream plan is coherent
  - live openings still do not cleanly ground the top pivot, so the recommendation remains mostly model-led
- `Procurement Analyst` was regenerated successfully
  - top pivot shifted to `Procurement Data Analyst`
  - first-30-days plan is coherent and more specific than before
  - matched live openings are still sparse, so the top pivots remain mostly model-led

This means the next issue is not regeneration stability anymore. It is catalog coverage and role purity for procurement and education.

## Most important next steps

1. Backfill specialized-family openings beyond legal, especially `education` and `procurement`, using the same grounding normalization approach.
2. Regenerate the seeded non-legal fixtures and inspect whether live-market grounding remains credible after the broader backfill.
3. Expand deterministic job-track filtering and skill sanitation for other specialized families if similar drift appears.
4. Improve catalog quality controls so enrichment failures, polluted tracks, and weak market evidence are visible before they affect reports.

## New commands added

```bash
npm run db:audit-job-openings -- --limit=250
npm run db:reclassify-job-openings -- --limit=300
npm run reports:regenerate -- --ids=<report-id-1>,<report-id-2>
```

What they do:

- `db:audit-job-openings` highlights failed enrichments, suspicious role-family mismatches, and skill sanitation issues
- `db:reclassify-job-openings` deterministically updates stored `role_family` and sanitized skills from the track classifier, which is much cheaper than full re-enrichment
- `reports:regenerate` bypasses `next dev` and writes refreshed report payloads directly to Supabase

## Current high-priority read

1. Expand role-pure catalog coverage for procurement and education so top pivots are not forced to stay model-led.
2. Continue shrinking the remaining `general -> engineering` and `general -> legal` drift after the first deterministic cleanup pass.
3. Keep regenerating seeded fixtures with the direct script after each catalog cleanup so regressions are visible immediately.

## Latest seeded report rerun

After the engineering-vs-product cleanup, all 3 seeded reports were regenerated again with:

```bash
npm run reports:regenerate -- --ids=075b8ed5-0b26-4d1c-b904-5f886329d262,30be2b01-c0a5-4cca-a70e-1a017339896c,98172726-3059-412b-869e-119bff813e4a
```

Current stored featured pivots:

- Procurement Analyst: `Procurement Data Strategist`
- Customer Education Manager: `Operations Enablement Manager`
- Legal Operations Manager: `Contract Lifecycle Manager`

Read on current quality:

- `Customer Education Manager` now has the strongest live-market grounding of the three.
  - The featured pivot changed from a mostly model-led education title to `Operations Enablement Manager`.
  - This appears to be a real grounding effect, not engineering/product contamination.
  - Market-required skills now look much more believable:
    - `Enablement`
    - `Instructional Design`
    - `Program Design`
    - `Sales Enablement`
    - `Training Delivery`
  - Remaining tradeoff: this top pivot may be slightly less identity-consistent than `Customer Education Lead`.

- `Procurement Analyst` is coherent but still mostly model-led.
  - The report is cleaner and no longer obviously polluted by product/engineering demand.
  - Top pivot is now `Procurement Data Strategist`.
  - All top pivots still have `0` matched openings, so the procurement catalog still lacks enough role-pure demand to strongly ground the recommendation.
  - `Spend Analytics Manager` remains a more legible real-world title candidate than `Procurement Data Strategist`.

- `Legal Operations Manager` is safer than before, but still weakest.
  - `Contract Lifecycle Manager` remains the best current featured pivot.
  - Top pivots still have `0` matched openings, so the report remains mostly model-led.
  - The first skill and proof path are still too AI-generic:
    - `Prompt design`
    - `AI QA workflows`

Best-to-worst order after the latest rerun:

1. Customer Education Manager
2. Procurement Analyst
3. Legal Operations Manager

Main interpretation:

- The engineering/product cleanup worked.
- The current limiting factor is no longer obvious catalog contamination.
- The next limiting factor is thin role-pure market coverage, especially for procurement and legal.

## Latest catalog cleanup result

The largest audit problem used to be `general -> product`, mostly because engineering roles were being collapsed into product.

That is now fixed by:

- giving engineering its own canonical role family
- rejecting engineering openings as market evidence for non-engineering pivots
- adding `db:reclassify-job-openings` to rewrite noisy stored rows in bulk

After reclassifying the latest 300 open postings:

- `engineering` became a first-class stored family with `71` openings in the sample
- the old `general -> product` bucket dropped out of the top audit mismatches
- the remaining top mismatches are much smaller and clearer:
  - `general -> engineering`
  - `general -> legal`
  - `operations -> engineering`

Most recent audit snapshot after reclassification:

- `general`: `87`
- `engineering`: `71`
- `operations`: `41`
- `product`: `37`
- `legal`: `13`

Top remaining mismatch counts:

- `general -> engineering`: `3`
- `general -> legal`: `2`
- `operations -> engineering`: `1`

This is a major improvement from the earlier `general -> product` pattern.

## 2026-04-07 continuation update

The next build pass expanded role-pure market coverage and tightened the report stabilizers.

Catalog changes:

- Added role-filtered Greenhouse sources for Anthropic, Airtable, Cloudflare, Flexport, Faire, Databricks, Applied Intuition, Giga Energy, and Intercom.
- Added source-level filters in `lib/job-openings.js` using `include_title_keywords`, `exclude_title_keywords`, `include_text_keywords`, and `max_jobs`.
- Seeded and synced the new role-filtered sources.
- Ran deterministic reclassification on a broader sample.
- Latest broad audit sample showed no suspicious role-family mismatches, with much stronger legal/procurement coverage than before.
- OpenRouter enrichment hit `429` for some rows, so the deterministic grounding layer remains the safer runtime protection until enrichment is retried.

Grounding/ranking changes:

- No-opening pivots are now capped lower so model-only destinations do not dominate merely because the model liked them.
- Same-family specialized matching allows a narrow domain-token overlap, but `risk` was removed as a legal relaxation token because it was too broad.
- Market-backed pivots now get a conservative floor when there are enough close openings, while the floor is reduced by seniority stretch.
- Specialized validation now rejects off-family titles and obvious synthetic stretches before grounding.
- A final pre-grounding repair pass runs after retries so the market layer ranks repaired pivots, not stale odd titles.
- Specialized skill gaps are sanitized so legal, procurement, and education paths stop defaulting to generic AI or consulting skills when a role-native proof sprint is safer.

Latest persisted seeded report state after the final regeneration:

- Procurement Analyst `075b8ed5-0b26-4d1c-b904-5f886329d262`
  - active pivot: `Procurement Data Analyst`
  - market signal: 5 matched openings, profile fit 42
  - first skill: `SQL`
  - read: strongest improvement; now genuinely market-backed rather than purely model-led

- Customer Education Manager `30be2b01-c0a5-4cca-a70e-1a017339896c`
  - active pivot: `Learning Operations Manager`
  - market signal: 0 matched openings for the top pivot, but `Enablement Program Lead` and `Technical Enablement Lead` have live openings nearby
  - first skill: `Dashboard storytelling`
  - read: coherent and role-native; still needs more education-specific catalog coverage

- Legal Operations Manager `98172726-3059-412b-869e-119bff813e4a`
  - active pivot: `Compliance Operations Manager`
  - market signal: 4 matched openings, profile fit 15
  - first skill: `Regulatory framework mapping`
  - read: much safer than the earlier synthetic legal outputs; still lower confidence because the profile fit is modest

Best-to-worst order after this pass:

1. Procurement Analyst
2. Customer Education Manager
3. Legal Operations Manager

Current high-priority next step:

- Retry enrichment after the OpenRouter rate limit clears, especially failed legal/procurement rows.
- Add more role-pure education/customer-education sources so `Learning Operations Manager` and `Customer Education Lead` can be grounded against live postings instead of mostly model-led.
- Add one regression test for specialized-title repair so titles like `AI Adoption Consultant`, `Legal Infrastructure Entrepreneur`, and `Procurement Intelligence Director` cannot reappear as top recommendations for these seeded fixtures.

## Low-priority follow-up

- Legal report content quality can still improve even though grounding and plan coherence are now better.
- Legal pivots no longer default to `Prompt design`, but their first skills can still be sharpened further.
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
- `ef8bc84` Add report regeneration and catalog audit tooling
- `a7fe15d` Separate engineering from product grounding
