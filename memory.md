# PivotIQ Memory

Last updated: 2026-04-16
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`
Latest working baseline before this handoff refresh: `e5a51e1` `Polish audit and paid intake funnel`

## Core Product State

- PivotIQ is now split into:
  - a lighter free scan
  - a stronger pre-paywall result
  - a second paid intake after checkout
  - a richer full report
- The strongest product differentiator is now the `Stay and advance with AI` path.
- The product is no longer just a report generator; it is closer to a career decision + execution system.

## Current Funnel Shape

### Homepage
- Main CTA is `Run my free scan`
- CTA has been widened to match the hero text block
- `Methodology` was removed from the hero and moved into FAQ
- Extra hero explainer container under the CTA was removed for cleaner focus

### Free Audit
- Step 1:
  - title
  - industry
  - role start
- Step 2:
  - selected tasks
  - primary tasks
  - `Which best describes your role`
  - required email
  - optional newsletter checkbox
  - required terms/privacy checkbox
- The audit now uses customer-facing promise cards:
  - `What we use`
  - `What you will see`
  - `What you leave with`

### Pre-Paywall Result
- Controlled reward:
  - one practical next move
  - strong open loops around skill gaps, proof, and roadmap
- Paywall creates curiosity without giving away the whole roadmap

### Paid Flow
- After checkout, users no longer jump directly into full report generation
- They now go to a second intake:
  - `/report/[id]/intake`
  - `/report/intake`
- Paid intake now has:
  - a visible required-first section
  - 5 core signals:
    - `goal_now`
    - `timeline_urgency`
    - `years_experience_band`
    - `location_preference`
    - `ai_maturity`
  - optional precision inputs hidden behind a toggle:
    - `technical_capability`
    - `salary_tolerance`
    - `proof_state`
    - `domain_focus`
    - `core_systems`

## Current Full Report State

The full report includes:
- decision brief
- recommendation stack
- primary move / conservative backup / stay path
- confidence states
- task breakdown
- pivot paths
- milestone plan
- stay-and-advance top-level tab
- AI leverage playbook
- role operating system
- career safety read
- promotion case
- promotion conversation pack
- learning path
- proof asset builder
- outcome tracking
- refresh from progress
- recommendation-quality internal views

## Result Page Audit Summary

I manually audited the paid result page from:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js`

### Main conclusion
- PivotIQ is now a strong report product, but it still does not yet feel like a fully premium executive-grade briefing.

### Biggest gaps
1. The page lacks one dominant narrative spine.
2. The hero is informative but not decisive enough.
3. The stay tab is the best idea in the product, but still feels too card-dense.
4. `Career safety read`, `Promotion case`, `AI leverage playbook`, and `Role operating system` still overlap too much conceptually.
5. The report underuses visualization for:
   - skill-gap deltas
   - path tradeoffs
   - proof readiness
   - capability progression
6. The report still feels like several strong modules rather than one unmistakably premium flow.

### Highest-leverage next build
1. Rebuild the top of the paid report into a stronger executive summary
2. Merge the stay-tab strategy cards into one tighter operating narrative
3. Add stronger visualization to the result page

## Recommended Next Implementation Sprint

### Phase 1
Build a stronger executive summary block at the top of the paid report:
- one dominant answer
- why it wins
- what changes if the user follows it
- what to do in the next 7 days

### Phase 2
Rebuild the stay tab into a tighter operating narrative:
- reduce overlap across:
  - `Career safety read`
  - `Promotion case`
  - `AI leverage playbook`
  - `Role operating system`

### Phase 3
Add stronger visualization:
- skill-gap delta bars
- improved path tradeoff matrix
- proof-readiness visualization
- clearer learning progression track

## Recommendation Quality State

- Recommendation quality is materially better than earlier versions.
- Broad-role recommendation quality is safer and more believable.
- Stay-path hard-skill layering is much stronger.
- Learning resources are sharper than before.
- Backup pivots and tertiary resource sharpness are still secondary improvement areas after report UX.

## New Skills Installed

Installed into `~/.codex/skills`:
- `senior-frontend`
- `react-best-practices`
- `cc-skill-frontend-patterns`
- `ui-ux-pro-max`
- `ui-visual-validator`
- `baseline-ui`
- `tailwind-design-system`
- `shadcn`
- `ux-copy`
- `frontend-developer`
- `api-endpoint-builder`
- `api-design-principles`
- `api-documentation`
- `native-data-fetching`
- `supabase-automation`
- `stripe-automation`
- `vercel-ai-sdk-expert`
- `e2e-testing`
- `testing-qa`
- `security-audit`
- `growth-engine`
- `pricing-strategy`
- `copywriting`
- `signup-flow-cro`
- `ab-test-setup`
- `lead-magnets`
- `email-sequence`
- `sendgrid-automation`
- `mailchimp-automation`
- `social-content`
- `content-marketer`
- `seo-plan`
- `seo-aeo-keyword-research`
- `seo-aeo-landing-page-writer`
- `seo-content-auditor`
- `free-tool-strategy`
- `marketing-ideas`
- `revops`
- `analytics-product`
- `apify-competitor-intelligence`

Important:
- they are installed on disk
- they are not active inside the already-running thread/session
- Codex must be restarted and a new thread started before they can be used here

## Constraints / Assumptions

- OpenRouter model remains: `nvidia/nemotron-3-nano-30b-a3b:free`
- The current session could not hot-load newly installed skills
- Browser automation CLI was not available in the shell during recent QA passes

## Best Resume Prompt For Next Thread

Use this prompt in the next thread after restarting Codex:

`We are continuing PivotIQ in /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app on main. Read /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/memory.md and /Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/TASK_STATE.md first. Then use brainstorm, senior-frontend, ui-ux-pro-max, and react-best-practices to implement Phase 1 of the result-page upgrade: rebuild the top of the paid report into a stronger executive summary with one dominant recommendation, why it wins, what changes if the user follows it, and what to do in the next 7 days. Preserve the existing recommendation logic, but make the result page feel more premium, more decisive, and more visual.`
