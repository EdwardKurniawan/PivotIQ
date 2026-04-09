# PivotIQ Memory

Last updated: 2026-04-09
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
- Biggest remaining gap:
  - make refreshes and recommendations more obviously adaptive to new intake/progress signal

## Recommended Next Move
Highest-leverage next build:

1. Use the new QA fixture viewer to generate and manually inspect saved QA snapshots
- The fixture catalog is now inspectable in-product, but we still want to push a few snapshots into saved reports for account-level QA

2. Add a second fixture catalog for higher-seniority roles
- Broad-role defaults are safer now; the next protection is making sure we do not over-correct on senior operators and managers

3. Sharpen “why not this pivot yet?” explanation in paid reports
- Use the stronger confidence copy and fixture findings to explain what is missing before a riskier pivot becomes the main move

## Files Most Likely To Matter Next Session
- [`app/audit/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/audit/page.js)
- [`components/report-experience.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js)
- [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
- [`lib/report-generation.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-generation.js)
- [`lib/report-refresh.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-refresh.js)
- [`lib/recommendation-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/recommendation-quality.js)
- [`data/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/data/broad-role-fixtures.js)
- [`lib/broad-role-fixtures.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/broad-role-fixtures.js)
- [`app/internal/recommendation-quality/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/recommendation-quality/page.js)
- [`app/internal/qa-fixtures/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/internal/qa-fixtures/page.js)
- [`scripts/test-broad-role-regression.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-broad-role-regression.mjs)
- [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs)
- [`docs/project-update-2026-04-05.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md)
- [`docs/intake-upgrade-spec-2026-04-09.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/intake-upgrade-spec-2026-04-09.md)

## Verification State
Latest verified before this memory update:
- `npm run test:broad-roles`
- `npm run test:report-quality`
- `npm run test:refresh`
- `npm run test:recommendation-quality`
- `npm run build`
- `git diff --check`

## Clean Resume Prompt
Use this at the start of the next session:

`Pick up PivotIQ from /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app. First read /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/memory.md and /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md. Continue from the highest-leverage next move: use the new QA fixture viewer to generate inspectable saved snapshots, then add a higher-seniority fixture catalog and sharpen “why not this pivot yet?” copy in paid reports. Keep OpenRouter on nvidia/nemotron-3-nano-30b-a3b:free. Commit and push after code changes.`
