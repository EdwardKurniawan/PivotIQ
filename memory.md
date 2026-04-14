# PivotIQ Memory

Last updated: 2026-04-13
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`

## Current Model / Core Constraint
- OpenRouter model must remain: `nvidia/nemotron-3-nano-30b-a3b:free`

## Where The Product Is Now
- PivotIQ has moved from a static report toward a career execution system.
- Full reports now include:
  - decision brief
  - primary move / conservative backup / stay-and-advance path
  - confidence states
  - AI leverage playbook
  - proof asset builder
  - promotion conversation pack
  - weekly progress loop
  - outcome tracking
  - report refresh from progress
  - internal recommendation-quality dashboard

## Most Recent Shipped Work

### `pending current commit` Tighten operations backup stacks + role-native decision brief copy
- Added missing lower-pivot repair coverage for `operations` in [`lib/report-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-quality.js)
- Added canonical operations alternative titles so weak lower pivots now repair into cleaner adjacent titles like:
  - `Delivery Operations Manager`
  - `Program Operations Manager`
  - `Project Operations Manager`
  - `Program Operations Lead`
  - `PMO Manager`
- Tightened weak-signal repair rules for operations and customer backup stacks so architect / product / consultant / head-of drift gets repaired earlier
- Made stay-first `decision_brief` copy more role-native in [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js), especially for:
  - customer success
  - operations
  - finance
  - analytics
- Added regression coverage in [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs) for:
  - operations lower-pivot cleanup
  - operations role-native decision-brief wording
- Seeded a fresh broad-role QA set into `edward.hardrianto@live.com`:
  - `bf2c0a5a-2b46-4b25-937b-8828bc103536` `Data Analyst`
  - `06f9b67e-694d-4cba-8dcb-cc377cf00c34` `Customer Success Manager`
  - `d41d304e-bab9-4c6f-af26-41c2fd9ef271` `Executive Assistant`
  - `114267cc-fd53-4e6e-8873-547ff831efe6` `Operations Manager`
  - `58f0bd10-62f5-4afd-9702-5cb44871b75f` `Marketing Manager`
- Current broad-role primary titles from those saved snapshots:
  - `Data Analyst` → `Business Intelligence Lead`
  - `Customer Success Manager` → `Customer Success Strategy Lead`
  - `Executive Assistant` → `Executive Operations Lead`
  - `Operations Manager` → `Program Operations Lead`
  - `Marketing Manager` → `Marketing Strategy Lead`

### `pending current commit` Sharpen broad-role stay-path learning resources
- Tightened [`buildStayLearningResources`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js) so broad-role stay paths rely less on generic AI-course defaults and more on role-native workflow resources
- Key improvements:
  - `Operations Manager` workflow learning now defaults to `Learn Zapier in 14 days` instead of `OpenAI Academy` when no stronger workflow tool signal is present
  - `Operations Manager` deeper steps now use `Business analysis learning paths` and `Change management learning paths` instead of generic AI/default transformation picks
  - `Finance Manager` workflow learning now points to `FP&A learning paths` or `Financial modeling paths` instead of a generic Coursera financial-modeling search result
  - `Finance Manager` governance learning now points to `Finance automation learning paths` instead of `Digital Transformation`
  - `Customer Success Manager` build-proof layer now uses `Customer success operations courses` instead of falling back too early to generic AI material
- Added regression coverage in [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs) for:
  - finance stay-path resource sharpness
  - operations stay-path avoiding generic `OpenAI Academy` fallback
- Seeded a fresh broad-role QA set into `edward.hardrianto@live.com`:
  - `a7eefe61-05be-427a-8efa-a1728ca851f9` `Data Analyst`
  - `f6cd108a-3796-4632-9f6a-7fd1aa870d28` `Customer Success Manager`
  - `7f4e9b5f-21c8-48b0-8ff4-7d2b0b9896bd` `Executive Assistant`
  - `e57f029b-030f-40f1-a022-289ffaf2a036` `Operations Manager`
  - `46fbde44-e802-4438-bb9d-f5ec6b857070` `Marketing Manager`
- Current learning-path spot check:
  - `Customer Success Manager`: `Renewal risk review design` → `Service Hub Software Certification Course`, `Customer workflow orchestration` → `Customer success operations courses`
  - `Operations Manager`: `Workflow automation design` → `Learn Zapier in 14 days`, `Team workflow governance` → `Change management learning paths`
  - `Finance Manager`: `Financial modeling and scenario review` → `Financial modeling paths`, `Planning workflow governance` → `Finance automation learning paths`

### `pending current commit` Tighten lower-ranked marketing and analytics pivots
- Tightened lower-pivot repair in [`lib/report-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-quality.js) so marketing and analytics backup stacks are now repaired and deduped the same way customer-success and finance already were
- Added canonical adjacent-title sets for `marketing` and `analytics`
- Added regression coverage in [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs) so:
  - marketing lower pivots no longer drift into `AI Program Manager`, customer-success, or consultant-style noise under weak signal
  - analytics lower pivots no longer drift into `Revenue Operations Analyst`-style weak adjacent titles
- Regenerated saved QA snapshots so the founder account reflects the cleanup:
  - `Marketing Manager` (`ae5dcf5d-0bb3-427d-8154-fbf9aa7678f6`) now reads:
    - `Marketing Operations Strategist`
    - `Marketing Operations Lead`
    - `Growth Strategy Lead`
    - `Marketing Strategy Lead`
    - `Product Marketing Manager`
  - `Data Analyst` (`545898da-08ae-41df-9156-021a937ebe95`) now reads:
    - `Analytics Manager`
    - `Analytics Operations Lead`
    - `Analytics Strategy Manager`
    - `Business Intelligence Lead`
    - `Insights Operations Manager`

### `pending current commit` Add senior fixtures + save mixed QA snapshots
- Added senior-role QA catalog in [`data/senior-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/data/senior-role-fixtures.js)
- Generalized fixture helpers in [`lib/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/broad-role-fixtures.js) so they now support grouped broad + senior snapshot generation
- Upgraded [`app/internal/qa-fixtures/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/qa-fixtures/page.js) and [`app/api/qa-fixtures/route.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/qa-fixtures/route.js) to show both fixture groups
- Added seeding script [`scripts/save-qa-fixture-reports.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/save-qa-fixture-reports.mjs)
- Added `npm run reports:seed-qa-fixtures`
- Expanded [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs) so the QA fixture regression now covers both broad and senior catalogs
- Tightened [`lib/report-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-quality.js) so marketing/customer leadership no longer get misread as finance-family reports during quality gating
- Saved mixed QA snapshots into `edward.hardrianto@live.com`:
  - `545898da-08ae-41df-9156-021a937ebe95` `Data Analyst`
  - `28325476-caa6-4a7b-a95b-ecc0f2a7e897` `Finance Manager`
  - `0eff2943-82e6-41c8-b10d-2dde56061df3` `Customer Success Manager`
  - `231107f9-3a2a-4834-b67a-0b1a38ebdc71` `Senior HR Business Partner`

### `pending current commit` Add QA fixture viewer + stronger confidence copy
- Added shared broad-role fixture helpers in [`lib/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/broad-role-fixtures.js)
- Added inspectable internal QA fixture viewer in [`app/internal/qa-fixtures/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/qa-fixtures/page.js)
- Added JSON endpoint in [`app/api/qa-fixtures/route.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/qa-fixtures/route.js)
- Refactored [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs) to use shared fixture generation/evaluation
- Tightened user-facing recommendation / refresh language in:
  - [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
  - [`lib/report-refresh.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-refresh.js)
  - [`components/report-experience.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js)
- Added nav links to the QA fixture viewer from the internal quality pages

### `pending current commit` Apply safer broad-role recommendation policies
- Tightened [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js) so the recommendation stack now:
  - suppresses low-confidence active pivots more aggressively
  - leans broader role families toward stay-and-advance when market signal is thin
  - only keeps a strategy-led active pivot primary when the user already has real proof plus some market overlap
- Added reusable QA fixtures in [`data/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/data/broad-role-fixtures.js)
- Refactored [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs) to use the shared fixture catalog
- Expanded [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs) with broader-role thin-signal and low-confidence active-pivot coverage
- Kept [`scripts/test-recommendation-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-recommendation-quality.mjs) aligned with the broader tuning-playbook surface

### `7eb474f` Outcome tuning layer + broad-role QA
- Expanded [`lib/recommendation-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/recommendation-quality.js) with a `tuning_playbook`:
  - `policy_levers`
  - `winning_patterns`
  - `watchlist_patterns`
- Upgraded [`app/internal/recommendation-quality/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/recommendation-quality/page.js) to render that playbook
- Added broad-role regression coverage in [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs)
- Added `npm run test:broad-roles`

### `fb8ed19` Refresh comparison UX
- Upgraded refresh summaries in [`lib/report-refresh.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-refresh.js) so they now persist:
  - before/after comparison rows
  - change drivers
  - inputs considered
  - updated sections
- Upgraded refresh rendering in [`components/report-experience.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js) with:
  - `Before vs after`
  - `Why PivotIQ changed this`
  - `Inputs shaping this refresh`
- Extended normalization in [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
- Added refresh regression coverage in [`scripts/test-report-refresh.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-refresh.mjs)

### `c6c6b33` Add Phase 2 intake precision inputs
- Added progressive-disclosure intake fields:
  - `technical_capability`
  - `salary_tolerance`
  - `proof_state`
- Added UI in [`app/audit/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/audit/page.js)
- Added copy in [`lib/i18n.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/i18n.js)
- Added model/schema handling in [`lib/report-generation.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-generation.js)
- Added recommendation effects in [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js):
  - technical stretch pivots now fail safer
  - strict pay protection biases toward safer stay paths when pivot payoff is thin
  - existing proof upgrades proof builders instead of pretending the user starts from zero
  - strong proof can preserve a strategy-led pivot when the user explicitly wants to pivot
- Added regression coverage in [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs)

### Earlier important recent work already live
- Phase 1 intake clarifiers:
  - `goal_now`
  - `timeline_urgency`
  - `years_experience_band`
  - `location_preference`
  - `ai_maturity`
- Weekly execution loop
- Outcome tracking
- Recommendation-quality internal dashboard
- Progress-aware report refresh flow
- Expanded learning catalog to `200+` entries with strong audit coverage

## Key Internal Pages / Tools
- Job catalog audit: `/internal/job-catalog`
- Course catalog audit: `/internal/course-catalog`
- Recommendation quality: `/internal/recommendation-quality`

## Current Quality Read
- Product structure and paid-value packaging are much stronger than before.
- Recommendation quality is materially improved by richer intake, but broad-role robustness is still the next big frontier.
- Biggest qualitative improvements:
  - fewer synthetic / over-stretched pivots
  - better stay-and-advance logic
  - proof assets now feel more useful
  - learning recommendations are much cleaner
- Latest broad-role QA pass tightened the saved report experience itself:
  - `Data Analyst` now lands on `Business Intelligence Lead` and starts with `KPI review narrative` instead of product-management drift
  - `Finance Manager` now lands on `Finance Systems Manager` and starts with `Financial Modeling`
  - `Marketing Manager` now lands on `Marketing Operations Strategist` and starts with `Campaign experiment design`
  - `Senior HR Business Partner` now lands on `HR Operations Manager` and starts with `Manager enablement workflow design`
  - `Customer Success Manager` now lands on `Customer Success Strategy Manager` and starts with `Renewal risk review design`
- The latest paid-report decision brief is now more explicit:
  - it tells the user why the winning move won now
  - it says why a flashier alternative is not leading yet
  - it states what would have to change before the riskier path becomes the main recommendation
- Lower-ranked customer-success and finance pivots are also cleaner and deduped:
  - `Finance Manager` lower pivots now read as `Finance Business Partner`, `Strategic Finance Analyst`, `Commercial Finance Manager`, and `FP&A Manager`
  - `Customer Success Manager` lower pivots now read as `Customer Success Strategy Manager`, `Customer Operations Lead`, `Renewal Strategy Lead`, and `Customer Enablement Lead`
- Biggest remaining gap:
  - some broad-role lower pivots still need the same premium-quality pass, especially customer-success, finance, and operations when market evidence is thin
  - some learning-path pairings are improved but still merely acceptable instead of obviously sharp
  - make refreshes and recommendations more obviously adaptive to new intake/progress signal

## Recommended Next Move
Highest-leverage next build:

1. Tighten the next weakest broad-role families using the saved QA snapshots
- customer success and finance are the next likely candidates after the operations cleanup
- keep marketing under review, but it is materially cleaner now

2. Keep the paid-report “why not this pivot yet?” explanation sharp
- the top recommendation now explains itself better; the next step is making that copy feel even more premium and role-native on the actual saved reports

3. Keep improving learning-path coherence
- the next product-quality win is sharper step-2 / step-3 gap-to-resource pairing for broad roles where the first step is now cleaner but the deeper steps can still be bland

4. Keep using saved QA snapshots plus `/internal/qa-fixtures`
- the saved reports are more useful than fixture JSON alone because the final recommendation stack can differ from the raw pivot ordering

## Files Most Likely To Matter Next Session
- [`app/audit/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/audit/page.js)
- [`components/report-experience.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js)
- [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
- [`lib/report-generation.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-generation.js)
- [`lib/report-refresh.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-refresh.js)
- [`lib/recommendation-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/recommendation-quality.js)
- [`data/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/data/broad-role-fixtures.js)
- [`data/senior-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/data/senior-role-fixtures.js)
- [`lib/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/broad-role-fixtures.js)
- [`app/internal/recommendation-quality/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/recommendation-quality/page.js)
- [`app/internal/qa-fixtures/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/qa-fixtures/page.js)
- [`scripts/save-qa-fixture-reports.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/save-qa-fixture-reports.mjs)
- [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs)
- [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs)
- [`docs/project-update-2026-04-05.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md)
- [`docs/intake-upgrade-spec-2026-04-09.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/intake-upgrade-spec-2026-04-09.md)

## Verification State
Latest verified before this memory update:
- `npm run test:report-quality`
- `npm run test:broad-roles`
- `npm run reports:seed-qa-fixtures -- --email=edward.hardrianto@live.com --catalog=broad --limit=5`
- `npm run test:course-catalog`
- `node --input-type=module -e '...buildQaFixtureSnapshotGroups...'` spot-check on customer / finance / operations stay learning
- `npm run reports:regenerate -- --ids=545898da-08ae-41df-9156-021a937ebe95,28325476-caa6-4a7b-a95b-ecc0f2a7e897,0eff2943-82e6-41c8-b10d-2dde56061df3,231107f9-3a2a-4834-b67a-0b1a38ebdc71,ae5dcf5d-0bb3-427d-8154-fbf9aa7678f6`
- `npm run reports:regenerate -- --ids=28325476-caa6-4a7b-a95b-ecc0f2a7e897,0eff2943-82e6-41c8-b10d-2dde56061df3`
- `npm run build`
- `git diff --check`

## Clean Resume Prompt
Use this at the start of the next session:

`Pick up PivotIQ from /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app. First read /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/memory.md and /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md. Continue from the highest-leverage next move: use the saved QA snapshots and /internal/qa-fixtures to tighten the next weakest broad-role pivots and sharpen learning-path coherence, while keeping the paid-report decision brief explicit about why the safer move won. Keep OpenRouter on nvidia/nemotron-3-nano-30b-a3b:free. Commit and push after code changes.`
