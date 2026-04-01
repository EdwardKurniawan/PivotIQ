# PivotIQ Handoff

Last updated: 2026-03-31

## Current local app state
- Stable local preview runs with `next start` at `http://localhost:3002`
- Use `3002` consistently
- `next dev` is still unreliable in this workspace due to recurring `.next/server` chunk-resolution failures
- `npm run build` is passing
- Reliable local review flow:
  - `npm run build`
  - `npm run start -- -p 3002`

## Current product direction
PivotIQ is positioned as a premium, editorial-feeling career intelligence product.

Brand intent:
- calm
- premium
- credible
- human
- specific
- not hypey

Core framing:
- start with a free scan
- diagnose by task, not by title
- paid roadmap only if it earns trust
- value comes from clarity and sequencing, not “more content”

## Brand guideline summary
- Background: deep ink / dark editorial
- Accent colors:
  - orange `#FF8F4D`
  - teal `#41C2AE`
  - cream `#F4E4C7`
- Typography direction:
  - editorial serif for major headlines
  - clean sans for UI/body
- Tone:
  - concise
  - direct
  - strategic
  - grounded
- Avoid:
  - generic AI SaaS tone
  - overexplaining
  - fake urgency
  - “future-proof your career” language

## What is already implemented

### 1. Report generation architecture is now stable again
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/generate-report/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js`

Current architecture:
- live generation now uses a smaller strategic JSON contract
- the model is no longer asked to generate the full 12-week roadmap for all pivots in one shot
- the app hydrates the smaller live response into the full report structure locally
- local hydration fills in:
  - 12-week roadmap
  - top-level roadmap mirror
  - top-level skill-gap mirror
  - missing pivot structure defaults

Why this matters:
- one-shot full-report generation was too large for the tested OpenRouter models
- truncation and timeout were the main operational problem
- shrinking the model contract and generating the heavy roadmap locally restored live success

### 2. Pivot set was expanded from 3 to 5
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/generate-report/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js`

Current target decision frames:
- `safest transition`
- `strongest leverage fit`
- `fastest cash recovery`
- `highest upside`
- `long-term platform bet`

Implemented:
- prompt + schema updated for 5 pivots
- UI updated to render 5 pivot cards cleanly
- fallback/demo report updated to 5 pivots
- validation checks now reason about the 5 expected decision frames

### 3. Anti-similarity validation exists
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/generate-report/route.js`

Implemented:
- prompt explicitly asks for materially different job families
- lightweight overlap heuristics compare pivot titles and strategic logic
- one retry path exists when the live response collapses pivots too much

Current nuance:
- the route can still return a live result even if frame validation is imperfect, because local hydration can still produce a usable 5-pivot report
- this was an intentional tradeoff to avoid falling back to demo mode too aggressively once live generation became viable again

### 4. Timeout/fallback behavior is much safer now
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/generate-report/route.js`

Implemented:
- provider timeout guard
- persistence timeout guard
- graceful fallback to demo mode instead of indefinite hanging
- optional debug logging through `/tmp/pivotiq-generate-report.log`

Current behavior:
- debug logging exists but only runs when `DEBUG_GENERATE_REPORT=true`

### 5. Homepage is proof-first
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/page.js`

Implemented:
- sharper hero
- stronger sample diagnosis block
- trust markers
- “what the scan proves” section
- better free-scan-first conversion framing

### 6. Audit flow friction was reduced
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/audit/page.js`

Implemented:
- email is optional for the free scan
- CTA copy is more outcome-driven
- the free result does not feel like a disguised lead form

### 7. Report experience redesign is stronger
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js`

Implemented:
- teaser / full experience
- stronger free preview before paywall
- interpretation visible before upgrade
- stronger “strongest next move” section
- pivot cards expose:
  - decision frame
  - who this path is for
  - why it wins
  - what the user is betting on
  - tradeoffs
- full roadmap still includes:
  - skill-gap cards
  - 12-week milestone plan
  - progress tracking
  - start date
  - notes
  - sync to progress endpoint

### 8. Account system foundation is in place
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/supabase/browser.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/supabase/server.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/supabase/config.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/login/page.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/auth/callback/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/dashboard/page.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/report/[id]/page.js`

Implemented:
- Supabase auth clients
- magic-link login
- callback flow
- middleware
- dashboard
- persistent saved reports
- report detail route

Important already-fixed trust issue:
- dashboard queries are scoped to `user_id`

### 9. Dashboard is coaching-oriented
File:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/dashboard/page.js`

Implemented:
- stronger hero copy
- “continue from here” resume card
- current / upcoming / overdue milestone logic
- progress percent surfaced
- milestone date window surfaced
- saved report cards read like active work rather than storage

### 10. Progress + reminder scaffolding exists
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/reports/[id]/progress/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/reminders/run/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/supabase/schema.sql`

Implemented:
- progress update endpoint
- reminder worker route
- schema for:
  - `reports`
  - `week_progress`
  - `reminder_events`

### 11. Success / checkout copy is aligned
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/success/page.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/create-checkout/route.js`

Implemented:
- clearer unlock messaging
- stronger “what you now have” framing
- Stripe descriptions emphasize:
  - best-fit pivot
  - skill-gap actions
  - 12-week roadmap
  - next-move confidence

### 12. Email flow truthfulness fix remains in place
Files:
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/send-report/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/success/page.js`

Behavior:
- if Resend is not configured, app does not falsely claim a real email was sent
- local mode is handled honestly

## Current environment settings that matter
From `.env.local`:
- `OPENROUTER_MODEL=nvidia/nemotron-3-nano-30b-a3b:free`
- `OPENROUTER_TIMEOUT_MS=120000`
- `OPENROUTER_MAX_TOKENS=50000`

Supabase configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Notes:
- current live-generation success came from reducing the model contract, not from raw token budget alone
- the current token budget is high, but because the prompt is now much smaller the route can still complete a live response

## Verified current behavior
- `npm run build` passes
- local preview on `3002` works
- live sample generation now succeeds with `demoMode: false`
- the live sample returned 5 pivots
- the top-level roadmap still contains 12 weeks after local hydration

Verified sample output shape:
- `Safest Transition: Revenue Operations Analyst`
- `Strongest Leverage Fit: Growth Marketing Operations Lead`
- `Fastest Cash Recovery: Marketing Analytics Consultant`
- `Highest Upside: Chief Marketing Technology Officer (CMTO)`
- `Long-Term Platform Bet: AI-Enhanced Marketing Operations Platform Product Manager`

## Known current limitations
- unauthenticated sample runs are not persisted, so no permanent `/report/[id]` link is created unless a signed-in user generates the report
- live generation can still miss one of the exact target decision frames occasionally
- local hydration keeps the response usable even when the model’s raw strategic set is imperfect
- persistence can time out harmlessly if auth/report-save is slow or unavailable

## Highest-value next work

### 1. Run signed-in end-to-end QA
Still pending and high value.

Specifically:
1. log in with magic link
2. generate a report while signed in
3. confirm it appears in dashboard
4. open saved report
5. set roadmap start date
6. mark milestones complete
7. refresh and confirm persistence

### 2. Tighten live pivot-frame consistency
The model can still drift slightly from the 5 exact frames.

Best next improvement:
- map or coerce near-miss frames into the canonical 5-frame set more aggressively
- optionally reject and retry only the bad pivot set, not the whole report

### 3. Production hardening
Still pending:
- rate limiting
- logging strategy cleanup
- Next.js version upgrade
- Stripe real validation
- Resend sender/domain validation

## Important files to inspect first next session
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/HANDOFF.md`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/SESSION_STATE.md`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/api/generate-report/route.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/lib/report-data.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js`
- `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/app/dashboard/page.js`
