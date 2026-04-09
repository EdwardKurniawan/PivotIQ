# Project Update — 2026-04-05

This file captures the current PivotIQ state so the next session can continue without rebuilding context.

## Recent platform upgrades — 2026-04-09

PivotIQ is no longer just a one-time report generator. The product now has a real execution and feedback loop:

- `recommendation_stack` now drives a narrower decision layer with:
  - one primary move
  - one conservative backup
  - one stay-and-advance lane
- full reports now include:
  - `decision brief`
  - richer stay-and-advance operating plays
  - proof asset builder
  - promotion conversation pack
- weekly execution tracking is live through `week_progress`, including:
  - action state
  - proof asset state
  - manager conversation state
  - last active step
- outcome tracking is live through `report_outcomes`, including:
  - proof asset built
  - manager conversation done
  - traction status
  - usefulness rating
  - notes
- an internal recommendation-quality dashboard now groups real results by:
  - confidence state
  - recommendation type
  - role bucket
- reports can now be refreshed from logged progress through:
  - `POST /api/reports/[id]/refresh`
  - progress-aware prompt context in `lib/report-generation.js`
  - report-side `Refresh from progress` UI
  - persisted `refresh_summary`, `refresh_count`, and `refreshed_at`
- dashboard cards now surface `Refresh ready` when enough progress or outcome signal exists to justify a rerun

This means the current product direction is:

- diagnose risk
- recommend a next move
- help the user execute
- capture what really happened
- refresh the plan around real-world signal

## Next recommendation-quality spec

The next major product-quality priority is intake quality, not just model prompting.

See:

- [docs/intake-upgrade-spec-2026-04-09.md](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/intake-upgrade-spec-2026-04-09.md)

Core conclusion:

- recommendation quality should improve next through better user-state inputs
- the first fields to add are:
  - `goal_now`
  - `timeline_urgency`
  - `years_experience_band`
  - `location_preference`
  - `ai_maturity`
- these should be followed by:
  - `technical_capability`
  - `salary_tolerance`
  - `proof_state`

Important product stance:

- do not add a long form up front
- use progressive disclosure
- make every new field affect ranking, confidence, learning, or proof generation

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

## 2026-04-07 internal quality visibility update

Catalog quality is no longer CLI-only.

- Added shared audit helper: `lib/job-openings-quality.js`
- Added JSON API: `GET /api/job-openings/quality?limit=1000`
- Added internal visual dashboard: `/internal/job-catalog`
- The dashboard shows health score, scanned openings, failed enrichment count, suspicious row count, watched-family coverage, suspicious transitions, failed enrichment examples, and the current action queue.
- `scripts/audit-job-openings-quality.mjs` now calls the shared helper, so the CLI and internal page use the same logic.

Report confidence wording also changed:

- `MarketSignalCard` no longer prints raw `ranking_reason` as the primary user-facing explanation.
- It now translates market evidence into clearer labels such as `Market-backed, proof needed`, `Model-led, verify with postings`, and `Early market signal`.
- The detailed grounding summary still appears in the expanded report panel for auditability.

## 2026-04-07 UX and visualization audit

Main finding:

- PivotIQ has strong underlying data, but several pages still make users read too much prose before they understand the shape of the result.
- The best immediate UX improvement is to make the report more visual, because that is where task exposure, pivot fit, live market evidence, and skill gaps already exist as structured data.

What changed in the first UX pass:

- Step 2 audit task cards now use intuitive exposure colors:
  - green = low exposure / safer work
  - orange = medium exposure
  - red = high exposure
- The confusing `FIT` badge was removed from audit task cards because it was not a real score. Task cards now show explicit exposure labels instead.
- The report Breakdown tab now includes a task exposure mix chart before the raw task list.
- The Pivot Paths tab now includes a pivot evidence map that compares:
  - model match score
  - profile fit against live postings
  - matched live openings
- The Plan tab now includes a roadmap journey map that groups the 12-week plan into three visual phases:
  - `Make the move legible`
  - `Build visible proof`
  - `Convert into signal`
- Each roadmap phase shows phase progress, clickable week chips, and a proof checkpoint so the roadmap feels more like momentum and less like a long checklist.
- The report hero now includes a compact `Why this recommendation?` explainer that connects:
  - what the user already signals
  - what live-market postings ask for
  - what proof needs to be built
  - market confidence and fit/openings meters

Remaining UX priorities:

- Add a small market-confidence badge near the active pivot title in the hero.
- Consider a lightweight onboarding tour for the report tabs: `Exposure -> Pivots -> Plan`.
- Improve `/report` empty states so users get a guided restart instead of a dead end.
- Improve the internal catalog page access control before exposing it beyond local/internal use.

Homepage elegance pass:

- Shortened the homepage by removing the repeated search-intent explainer section.
- Reduced hero height/type scale slightly so the first screen feels more premium and less crowded.
- Compressed FAQ into one card with a two-column answer grid.
- Removed the standalone role-guides block while preserving key role-guide links as compact pills in the closing CTA.
- Cleaned up unused homepage responsive selectors for deleted sections.

Learning catalog update:

- Added `npm run db:sync-datacamp`.
- The script pulls DataCamp live courses from the LMS External Catalog API and upserts them into `public.course_catalog`.
- It expects `DATACAMP_LMS_CATALOG_API_TOKEN` in `.env.local`; `DATACAMP_LMS_API_TOKEN` and `DATACAMP_API_TOKEN` are accepted as compatibility aliases.
- Learning-resource normalization now lets strong Supabase catalog matches beat hard-coded fallback links, so synced DataCamp courses can actually appear in generated report recommendations.
- Added `npm run db:audit-courses`, `GET /api/course-catalog/quality`, and `/internal/course-catalog` for learning catalog quality checks while waiting on the DataCamp API key.
- The course audit checks provider coverage, verification status, generic entries, missing skill tags, and sample learning probes. Probe matches now flag weak domain overlap, so a high-ish score cannot hide a semantically wrong recommendation like a project-management course for contract lifecycle management.
- Added `npm run test:course-catalog` to lock course matching behavior: exact tool/domain matches should beat generic reporting or AI fallback resources, weak semantic matches should be flagged, and DataCamp should win when it is the stronger catalog match.
- Added curated seed coverage for the previously weak probes: Microsoft Learn Power BI, Ironclad Digital Contracting Academy, Coursera Global Procurement and Sourcing, and Coursera Instructional Design Foundations. After reseeding, `npm run db:audit-courses -- --limit=100` reports `44` active catalog entries and `0` weak recommendation probes.
- Added a non-affiliate trusted vendor resource layer in the seed catalog: Microsoft Learn, Salesforce Trailhead, HubSpot Academy, Atlassian University, Google Skillshop, and AWS Skill Builder. These are tagged as `trusted free vendor resource` so PivotIQ can recommend credible free resources alongside affiliate providers when they are the better skill match.
- Expanded AI learning coverage with current provider-owned resources from OpenAI Academy / Cookbook, Anthropic Academy / docs / GitHub tutorials, Google Cloud Skills Boost, Google AI Essentials, Kaggle's 5-Day Gen AI Intensive, Microsoft's Generative AI for Beginners, and DeepLearning.AI's AI Agents in LangGraph. Added a course-catalog regression check so agentic-AI gaps prefer hands-on agent workflow resources over generic AI-literacy courses.
- Report UI now makes learning recommendations more transparent: skill-gap cards show `Free` / `Paid`, `Affiliate partner` / `Trusted vendor`, and `Catalog-verified` badges where possible, and the Plan tab includes a compact three-step learning path (`Start here`, `Build proof`, `Go deeper`) before the detailed gap cards.

Latest account test run:

- Regenerated the three seeded full reports for `edward.hardrianto@live.com` with `npm run reports:regenerate -- --ids=075b8ed5-0b26-4d1c-b904-5f886329d262,30be2b01-c0a5-4cca-a70e-1a017339896c,98172726-3059-412b-869e-119bff813e4a`.
- Current saved top pivots:
  - Procurement Analyst: `Procurement Intelligence Manager`
  - Customer Education Manager: `Portfolio Operations Manager`
  - Legal Operations Manager: `Contract Operations Strategist`
- Learning recommendations are now flowing into saved reports from the expanded catalog. Examples from the test run:
  - Customer Education uses Coursera `Instructional Design Foundations and Applications` for enablement/curriculum gaps.
  - Procurement uses DeepLearning.AI `AI Python for Beginners` and Ironclad `Digital Contracting Academy` alongside paid Coursera resources.
  - Legal uses Ironclad `Digital Contracting Academy` as a free trusted vendor resource.
- Quality note from the run: the learning catalog is working, but pivot/skill prioritization still deserves a follow-up pass. Customer Education drifted to `Portfolio Operations Manager`, Procurement starts with `Change management`, and Legal remains mostly model-led with `0` close openings for the top pivot.

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

## 2026-04-08 specialized ranking and learning-resource guardrails

Latest build pass focused on preventing specialized-role reports from drifting into plausible-sounding but weakly aligned titles or learning links after market grounding.

Code changes made in this pass:

- Added stronger specialized-role title penalties in `lib/job-gap-analysis.js` so broad/off-family titles do not outrank role-native legal, procurement, or education pivots unless the live-market evidence is much stronger.
- Added an architect seniority penalty so analyst-level profiles are not pushed into `Architect` titles as the featured pivot.
- Added post-market skill-gap sanitation for specialized roles so legal pivots cannot inherit gaps like sales enablement, consultative selling, or platform architecture.
- Added final ranking-copy refresh in `lib/report-data.js` so the active pivot gets positive, accurate `Why this ranks first` language after all downstream reranking/normalization.
- Added role-native tie-breakers so conventional titles like `Legal Operations Analyst` can beat equally scored but less direct variants.
- Hardened course matching in `lib/course-catalog.js` so generic AI resources and off-domain token matches do not beat specific legal/procurement/education resources.
- Added NIST AI Risk Management Framework as a trusted free course/resource seed for compliance, governance, and AI-risk learning gaps.
- Added course-catalog regression tests for legal risk, legal clause drafting, procurement forecasting, and compliance KPI matching.

Current seeded report state after regeneration:

- Procurement Analyst `075b8ed5-0b26-4d1c-b904-5f886329d262`
  - active pivot: `Procurement Intelligence Manager`
  - live evidence: `5` matched openings, `42` profile fit
  - current top learning resources include Ironclad Digital Contracting Academy, Coursera Global Procurement and Sourcing, Google Project Management, and Coursera Digital Transformation
- Customer Education Manager `30be2b01-c0a5-4cca-a70e-1a017339896c`
  - active pivot: `Learning Operations Manager`
  - live evidence: `0` matched openings, so this remains mostly model-led but role-native
  - current top learning resources include Google Data Analytics Certificate and SQL for Data Science
- Legal Operations Manager `98172726-3059-412b-869e-119bff813e4a`
  - active pivot: `Legal Operations Analyst`
  - live evidence: `2` matched openings, `13` profile fit
  - current top learning resources include Ironclad Digital Contracting Academy, OpenAI Cookbook, Google Data Analytics Certificate, and Zapier Learn

Current quality read:

1. Procurement is the strongest fixture after this pass because the top title is role-native and market-backed.
2. Legal is much safer than before because it now lands on a conventional legal-ops title instead of synthetic strategy/AI titles, but live evidence is still thin.
3. Customer Education is coherent but still the most model-led because role-pure market coverage is sparse.

Remaining high-priority product work:

1. Improve role-pure Customer Education / Learning Operations job coverage so education reports do not depend as heavily on model-led fallback ranking.
2. Keep adding deterministic course/resource rules for domain-specific gaps that are too broad for generic catalog search.
3. Add a fixture-level report audit script that can fail on off-family top titles, generic AI resources for non-AI gaps, and stale/negative top-pivot ranking copy.

## 2026-04-08 paid report value upgrade

Latest build pass focused on making the paid report feel immediately worth the `29.99` unlock.

What shipped:

- Added derived `paid_value_summary` data to full reports with a sharper `Your best move` headline, recommended move, confidence label, market evidence, first proof asset, first learning step, and one thing to avoid.
- Added deterministic `proof_asset_builder` data to full reports with artifact title, target role, objective, outline sections, checklist, first 60-minute action, and outreach/interview sharing prompt.
- Added `lib/report-quality.js` as a report quality gate that repairs off-family featured pivots when a better family-native pivot exists, stale first-30-days references, negative ranking language, confusing secondary ranking copy, generic AI resources on non-AI gaps, overlong skill names, and missing first-30-days proof assets.
- Added `npm run test:report-quality` in `scripts/test-report-quality.mjs`.
- Updated the full report UI in `components/report-experience.js` with a top `Your Best Move` card and a `Proof Asset Builder` card in the Plan tab.
- Updated the preview unlock block so the paid/free contrast explicitly names market-grounded pivot ranking, proof asset builder, learning path + emailed action plan, and 12-week roadmap.
- Updated `/api/send-report` email content indirectly through `reportDataToEmailHtml` so full-report emails start with a concise action-plan summary before the broader report details.
- Moved full-report email sending out of the success page. Full-tier action-plan email now sends from `ReportExperience` only after `generation_stage === 'full_complete'`, with a local/session idempotency key to prevent duplicate sends.
- Preserved local/demo email behavior: when `RESEND_API_KEY` is missing, `/api/send-report` returns `{ success: true, demoMode: true }`.

Verification completed:

- `npm run test:report-quality`
- `npm run test:course-catalog`
- `npm run test:market-ranking`
- `npm run test:job-grounding`
- `npm run build`
- `git diff --check`
- Local demo email route check through Next dev on port `3005`: `POST /api/send-report` returned `200` with `demoMode: true`.
- Regenerated the seeded reports for the user account and inspected `paid_value_summary`, `proof_asset_builder`, and `quality_audit` in Supabase.

Current seeded report state after the paid-value regeneration:

- Procurement Analyst `075b8ed5-0b26-4d1c-b904-5f886329d262`
  - active pivot: `Digital Procurement Specialist`
  - paid learning step: `Procurement analytics: Global Procurement and Sourcing Specialization (Coursera)`
  - proof asset builder target: `Digital Procurement Specialist`
  - quality audit: `repaired`, including role-native procurement analytics replacement and secondary ranking-copy cleanup
- Customer Education Manager `30be2b01-c0a5-4cca-a70e-1a017339896c`
  - active pivot: `Learning Experience Architect`
  - paid learning step: `Learning Analytics: Google Data Analytics Certificate (Coursera)`
  - proof asset builder target: `Learning Experience Architect`
  - quality audit: `repaired`, due to secondary ranking-copy cleanup
- Legal Operations Manager `98172726-3059-412b-869e-119bff813e4a`
  - active pivot: `Contract Management Specialist`
  - paid learning step: `Contract lifecycle management: Digital Contracting Academy (Ironclad)`
  - proof asset builder target: `Contract Management Specialist`
  - quality audit: `repaired`, due to secondary ranking-copy cleanup and overlong skill-name simplification

Current quality read:

1. The paid value packaging is now much clearer: the top of the report tells the user what to do, why, what to learn first, and what proof artifact to build.
2. The email timing bug is addressed: full emails wait for full generation instead of being sent from the success page with preview/stale data.
3. Procurement is cleaner after replacing a contract-lifecycle first step with procurement analytics.
4. Customer Education is still the fixture most likely to drift because role-pure market coverage remains thin; `Learning Experience Architect` is coherent but should be watched.
5. Legal is credible but still mostly needs richer legal-ops market coverage over time.

## 2026-04-09 intake phase 1 is live

This pass moved the first batch of higher-signal user-state inputs from spec into the product and recommendation engine.

What shipped:

- Added 5 new audit clarifiers in `app/audit/page.js`:
  - `goal_now`
  - `timeline_urgency`
  - `years_experience_band`
  - `location_preference`
  - `ai_maturity`
- Added localized copy for those fields in `lib/i18n.js` for English, Dutch, and German.
- Updated the OpenRouter report schema/prompt guides in `lib/report-generation.js` so the model now treats those clarifiers as high-signal context instead of decorative metadata.
- Updated `lib/report-data.js` so those fields now influence:
  - primary move selection in `recommendation_stack`
  - stay-vs-pivot bias
  - confidence language
  - over-senior pivot caution
  - stay-path urgency framing
  - first learning-step selection when AI maturity is already high
- Added compatibility parsing for older direct `buildDemoReportData()` fixture calls that pass clarifiers at the top level instead of inside `clarifiers`.

What changed in recommendation behavior:

- Users who choose `stay_and_advance` now require stronger external evidence before a pivot can become the primary move.
- Users who need a plan to be useful within `3 months` now bias harder toward safer, faster, proof-first moves.
- Early-career users get more caution around stretched titles and promotion-path realism.
- Users with higher `ai_maturity` no longer default as hard toward beginner AI-learning-first recommendations when stronger workflow/governance learning is available.
- Location preference is now preserved and exposed to the model/prompt layer, with extra confidence caution for narrower target markets like `global_remote` or `other`.

Verification completed:

- `npm run test:report-quality`
- `npm run test:course-catalog`
- `npm run test:market-ranking`
- `npm run test:job-grounding`
- `npm run build`
- `git diff --check`

New regression coverage added:

- the new clarifiers persist through normalization
- stay intent + high urgency can keep the stay path primary over a merely strategy-led pivot
- active pivot intent + urgency still allows a market-backed pivot to win
- low-experience users fail safer when the top title is overstretched
- advanced AI maturity can skip beginner-first learning starts when a stronger workflow-oriented skill is available

Next best product move:

1. Add Phase 2 precision inputs behind progressive disclosure:
   - `technical_capability`
   - `salary_tolerance`
   - `proof_state`
2. Use those precision inputs to improve:
   - coding/tool realism
   - pay-cut avoidance
   - proof asset selection
3. Add report refresh comparisons that explicitly tell the user how these new inputs changed the recommendation stack.

## 2026-04-09 intake phase 2 is live

This pass finished the precision-input layer and made those optional fields meaningfully change recommendation quality instead of only being stored.

What shipped:

- Added progressive-disclosure audit inputs in `app/audit/page.js` for:
  - `technical_capability`
  - `salary_tolerance`
  - `proof_state`
- Added localized copy for those fields and the precision-input toggle in `lib/i18n.js`.
- Updated the OpenRouter schema and prompt instructions in `lib/report-generation.js` so the model now treats those fields as recommendation constraints, not just profile notes.
- Updated `lib/report-data.js` so those inputs now affect:
  - pivot confidence states when a role quietly assumes more technical depth than the user declared
  - stay-vs-pivot bias when salary protection matters and the pivot payoff is still thin
  - decision-brief language so compensation risk and existing proof are reflected honestly
  - proof asset builders so users with existing internal projects, dashboards, workflows, or case studies package stronger proof instead of being told to start from scratch
  - demo fixtures and normalization so the new fields persist end to end
- Expanded `scripts/test-report-quality.mjs` with Phase 2 regression coverage.

What changed in recommendation behavior:

- Users who explicitly declare low technical capability now fail safer on systems-heavy or coding-adjacent pivots unless the market evidence is much stronger.
- Users who need to protect compensation now bias harder toward the stay path when the pivot is only strategy-led and the salary/payback story is still thin.
- Users who already have strong visible proof can keep a strategy-led pivot primary more often when they explicitly want to pivot.
- Proof asset builders now change shape based on what the user already has:
  - `internal_project` now packages internal work into visible proof
  - `dashboard_or_analysis` now upgrades existing analysis into a decision-ready case
  - `workflow_or_playbook` now packages existing workflows into reusable proof
  - `portfolio_or_case_study` now sharpens existing cases into stronger market-facing assets
- Optional precision inputs no longer penalize users who skip them; they only tighten the recommendation when the user actually provides the signal.

Verification completed:

- `npm run test:report-quality`
- `npm run test:course-catalog`
- `npm run test:market-ranking`
- `npm run test:job-grounding`
- `npm run test:progress`
- `npm run test:outcomes`
- `npm run test:recommendation-quality`
- `npm run build`
- `git diff --check`

New regression coverage added:

- Phase 2 clarifiers persist through normalization
- low technical capability can demote a technical stretch pivot to low-confidence
- strict salary tolerance can keep the safer stay path primary when the pivot payoff is thin
- strong proof can keep a strategy-led pivot primary when the user explicitly wants to pivot
- proof builders upgrade existing work instead of always starting from scratch

Next best product move:

1. Add report refresh comparisons that explicitly tell the user how the new intake clarifiers changed the recommendation stack.
2. Start measuring which clarifiers most improve recommendation usefulness and follow-through in the outcome dashboard.
3. Keep expanding broad-role QA fixtures so the richer intake layer is tested across more real white-collar role families.

## 2026-04-09 refresh comparison UX is live

This pass upgraded the refresh experience from a vague “report refreshed” state into a clearer before/after explanation layer.

What shipped:

- Expanded `buildRefreshSummary()` in `lib/report-refresh.js` so refreshes now capture:
  - before/after comparison rows
  - what changed in the report
  - why PivotIQ changed it
  - which intake inputs shaped the refresh
  - which report sections were updated
- Expanded normalized refresh-summary support in `lib/report-data.js` so those new comparison fields persist safely in stored report data.
- Upgraded the refresh UI in `components/report-experience.js` with:
  - a `Before vs after` section
  - a `Why PivotIQ changed this` section
  - an `Inputs shaping this refresh` section
  - clearer highlighting of updated sections
- Expanded refresh regression coverage in `scripts/test-report-refresh.mjs`.

What changed in product behavior:

- Users can now see the difference between the old and refreshed report on:
  - primary move
  - confidence
  - decision framing
  - first learning focus
  - proof asset
- Refreshes now explain not only what changed, but also what signal caused it:
  - milestones completed
  - proof-ready progress
  - manager conversations
  - outcome traction
  - recent progress notes
- Refreshes also surface the intake inputs that shaped the recommendation, such as:
  - goal
  - timeline
  - experience
  - AI maturity
  - technical capability
  - pay tolerance
  - proof state

Verification completed:

- `npm run test:refresh`
- `npm run test:report-quality`
- `npm run build`
- `git diff --check`

New regression coverage added:

- refresh summaries now preserve change drivers, input context, comparison rows, and updated sections
- refresh summaries now compare learning focus and proof asset, not only the primary move

Next best product move:

1. Use outcome data to tune recommendation logic more directly in the internal quality dashboard.
2. Add persistent broad-role QA fixtures for roles like Data Analyst, Customer Success Manager, Executive Assistant, Operations Manager, and Marketing Manager.
3. Consider a second refresh pass later that shows not only `before vs after`, but also `what improved because of your action` in more user-facing language.

## 2026-04-09 outcome tuning layer and broad-role QA are live

This pass turned the recommendation-quality dashboard from mostly descriptive reporting into a more prescriptive tuning surface, and added a dedicated regression pack for common broad white-collar roles.

What shipped:

- Expanded `lib/recommendation-quality.js` with a `tuning_playbook` that now derives:
  - `policy_levers`
  - `winning_patterns`
  - `watchlist_patterns`
- Upgraded `app/internal/recommendation-quality/page.js` with new sections for:
  - `Engine tuning levers`
  - `Winning patterns`
  - `Watchlist patterns`
- Added a new broad-role regression suite in `scripts/test-broad-role-regression.mjs` covering:
  - `Data Analyst`
  - `Customer Success Manager`
  - `Executive Assistant`
  - `Operations Manager`
  - `Marketing Manager`
- Added `npm run test:broad-roles` in `package.json`.
- Expanded `scripts/test-recommendation-quality.mjs` to cover the new tuning-playbook outputs.

What changed in product behavior:

- The internal recommendation-quality audit now tells us not only which report cohorts are strong or weak, but also which engine levers are the next candidates to tune:
  - confidence thresholds
  - low-confidence suppression
  - stay-path bias
  - proof-builder specificity
  - role-bucket QA priorities
- The tuning view now stays useful even when the sample is still early by surfacing an `outcome sampling` lever instead of returning an empty playbook.
- Broad-role regression coverage now protects us against embarrassing drift on common roles outside the specialized seeded fixtures.

Verification completed:

- `npm run test:recommendation-quality`
- `npm run test:broad-roles`
- `npm run test:report-quality`
- `npm run build`
- `git diff --check`

New regression coverage added:

- tuning-playbook policy levers, winning patterns, and watchlist patterns
- sanity checks for broad roles across recommendation stack, stay path, proof builders, and anti-drift title guardrails

Next best product move:

1. Use the new tuning-playbook output to start making selected recommendation-policy changes in the engine, starting with the highest-confidence levers.
2. Optionally persist a lightweight QA fixture catalog so broad-role checks can be regenerated and inspected more easily, not just tested.
3. Keep improving the user-facing refresh language so the product explains not only what changed, but what got safer, stronger, or more actionable.

## 2026-04-09 selected tuning policies are now applied

This pass moved the recommendation-quality work from observation into actual runtime behavior for broader white-collar roles.

What shipped:

- Tightened [`lib/report-data.js`](lib/report-data.js) so recommendation stacking now:
  - suppresses low-confidence active-pivot primaries more aggressively
  - biases broader role families toward stay-and-advance when external signal is thin
  - only preserves a strategy-led active pivot when the user has real proof and at least some market overlap
- Added a reusable QA fixture catalog in [`data/broad-role-fixtures.js`](data/broad-role-fixtures.js)
- Refactored [`scripts/test-broad-role-regression.mjs`](scripts/test-broad-role-regression.mjs) to use that catalog instead of inline fixtures
- Expanded [`scripts/test-report-quality.mjs`](scripts/test-report-quality.mjs) with new coverage for:
  - high-risk but low-confidence pivots still failing safe to stay
  - broader-role thin-signal reports defaulting to stay before a title jump
- Kept the recommendation-quality dashboard tests current in [`scripts/test-recommendation-quality.mjs`](scripts/test-recommendation-quality.mjs)

What changed in product behavior:

- Active-pivot users no longer get a weak stretch pivot primary just because role pressure is high.
- Broader generalist role families now need cleaner evidence before PivotIQ tells the user to chase a bigger external title.
- The broad-role QA suite is now easier to inspect and reuse for future refresh/regeneration work.

Verification completed:

- `npm run test:report-quality`
- `npm run test:recommendation-quality`
- `npm run test:broad-roles`
- `npm run build`
- `git diff --check`

Next best product move:

1. Use the broad-role fixture catalog to generate and inspect saved QA reports, not just run regression tests.
2. Start feeding recommendation-quality playbook signals back into more user-facing copy, especially around why PivotIQ stayed conservative.
3. Consider adding a second fixture catalog for higher-seniority roles so we can catch over-correction as we make broad-role defaults safer.
