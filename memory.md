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

1. Add refresh comparison UX
- When a report is refreshed, explicitly show:
  - what changed
  - why it changed
  - which inputs/progress signals caused the change
- This should make the richer intake and progress loop feel visible and valuable.

2. Feed outcomes back into recommendation tuning
- Use the recommendation-quality dashboard data to identify:
  - which confidence states actually create traction
  - which role families benefit most from stay-vs-pivot bias
  - which proof builders correlate with stronger follow-through

3. Expand broad-role QA fixtures
- Add persistent QA fixtures for broad white-collar roles like:
  - Data Analyst
  - Customer Success Manager
  - Executive Assistant
  - Operations Manager
  - Marketing Manager

## Files Most Likely To Matter Next Session
- [`app/audit/page.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/audit/page.js)
- [`components/report-experience.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js)
- [`lib/report-data.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js)
- [`lib/report-generation.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-generation.js)
- [`lib/report-refresh.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-refresh.js)
- [`lib/recommendation-quality.js`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/recommendation-quality.js)
- [`scripts/test-report-quality.mjs`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/scripts/test-report-quality.mjs)
- [`docs/project-update-2026-04-05.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md)
- [`docs/intake-upgrade-spec-2026-04-09.md`](/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/intake-upgrade-spec-2026-04-09.md)

## Verification State
Latest verified before this memory update:
- `npm run test:report-quality`
- `npm run test:course-catalog`
- `npm run test:market-ranking`
- `npm run test:job-grounding`
- `npm run test:progress`
- `npm run test:outcomes`
- `npm run test:recommendation-quality`
- `npm run build`
- `git diff --check`

## Clean Resume Prompt
Use this at the start of the next session:

`Pick up PivotIQ from /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app. First read /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/memory.md and /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/docs/project-update-2026-04-05.md. Continue from the highest-leverage next move: build the refresh comparison UX so users can clearly see what changed after progress logging or richer intake inputs. Keep OpenRouter on nvidia/nemotron-3-nano-30b-a3b:free. Commit and push after code changes.`
