# PivotIQ Launch Usefulness Audit

Date: 2026-04-21
Branch: main

## Executive summary

PivotIQ has a credible launchable foundation: the product promise is distinct, the free audit captures meaningful task-level signal, the full report has real decision utility, and the methodology/static pages give the product more substance than a generic AI career quiz. The strongest product idea remains the stay-and-advance path: users are not only told whether to pivot, they are shown how to make their current role safer, more promotable, or more portable through AI leverage.

The highest-priority launch risk is not visual design. It is expectation clarity and content specificity. Users need to understand exactly what they get at each stage, why the paid report is worth paying for, and whether PivotIQ is practical enough to trust with a career decision. Most of the current experience answers this, but a few places overclaim readiness, sound unfinished, or bury the practical value inside dense report modules.

Recommended launch posture: ship after fixing the obvious expectation/copy issues, the report tab bug, and the most confusing labels. Do not start another large redesign before launch. The next best work is a content pass that makes the homepage, audit, paywall, success page, and report all say the same thing: PivotIQ gives you a role-specific career-risk read, a stay-vs-pivot decision, and a concrete execution plan.

Status after implementation: the launch-readiness improvements from this audit have now been implemented without changing recommendation logic. The funnel copy now sets expectations more clearly, the paid-report UX leads with a decisive operating brief, the stay-and-advance tab reads as one operating narrative, the paywall/success flow includes support and saved-access reassurance, and methodology/role pages now show concrete input-to-output specificity.

## Highest-priority launch risks

1. Success-page expectation mismatch after payment

   Finding: the success page implied that the best-fit pivot, skill-gap map, and 12-week plan were ready immediately after checkout. In the current funnel, full-tier users still need to answer the second paid intake before the full report is generated. This is a trust risk because the user has just paid and is highly sensitive to any mismatch between promise and reality.

   Status: fixed in this pass by changing the unlocked-item copy to set up the final questions and full report generation.

   Files likely affected: `lib/i18n.js`, `app/success/page.js`

2. Free-audit email copy overpromises delivery

   Finding: the free audit asked where the result should be sent and said the email was needed to send the free result. The current flow shows the result in-app and does not automatically send the free scan email from the generate-report route. This is small but credibility-sensitive: if the product says it will send something and does not, the user may assume the rest of the product is loose too.

   Status: fixed in this pass by reframing email as the address for this result, saved access, checkout continuity, and support.

   Files likely affected: `lib/i18n.js`, `app/audit/page.js`, `app/api/generate-report/route.js`, `app/api/send-report/route.js`

3. Pivot tab URL compatibility bug

   Finding: the report UI uses the `pivots` tab key, but URL normalization accepted `paths` as a final active tab. That could land users on a state where no pivot tab content is rendered. Internal QA fixture links also used `?tab=paths`. This is a direct usability defect.

   Status: fixed in this pass by mapping legacy `paths` URLs to `pivots` and updating internal QA fixture links.

   Files likely affected: `components/report-experience.js`, `app/internal/qa-fixtures/page.js`, `app/internal/qa-fixtures/[catalog]/[slug]/page.js`

4. Paid-report value is strong but still too hidden inside dense modules

   The full report has useful content, but the report experience can feel like several strong modules rather than one decisive operating brief. The highest-leverage improvement is not more sections. It is tighter hierarchy: one dominant recommendation, one reason it wins, one stay-or-pivot operating narrative, one next-week action sequence.

   Files likely affected: `components/report-experience.js`, `lib/report-data.js`, `lib/report-quality.js`, `lib/i18n.js`

5. Trust pages exist but are underused in the funnel

   Methodology, privacy, terms, contact, and role pages exist, but the main conversion path does not consistently surface why the output is specific, what its limits are, and how users can get help. The product should not overclaim certainty. It should win trust by being clear about inputs, logic, and practical next steps.

   Files likely affected: `app/page.js`, `app/audit/page.js`, `components/report-experience.js`, `app/methodology/page.js`, `app/contact/page.js`, `lib/i18n.js`

## Journey-by-journey findings

### Homepage

User decision: "Is this worth my time, and is it specific enough for my career situation?"

What works:

- The promise is differentiated: role risk, pivot readiness, and a concrete career plan are more compelling than generic "learn AI" positioning.
- The homepage already frames PivotIQ around task-level career risk rather than broad job-title fear.
- The primary CTA is clear and appropriately low-friction: run a free scan.
- The methodology path exists, which helps users who need proof before trusting an AI-guided career tool.

Launch risks:

- The homepage could more explicitly explain the free-to-paid progression: free scan gives a first diagnosis; paid report adds deeper ranking, stay-vs-pivot decision support, proof assets, skill gaps, and execution plan.
- The value proof is more logical than concrete. Users would benefit from a compact "example output" strip showing the type of recommendation they will receive.
- Trust and limitation language should be clearer. PivotIQ should present itself as decision support, not a guaranteed career outcome predictor.

Recommended content improvements:

- Add a short "What you get" block near the first CTA:
  - Free scan: task-level risk read and first next move.
  - Full report: ranked paths, stay-and-advance plan, skill gaps, proof asset, and 30-day execution plan.
  - Methodology: built from role signals, task exposure, market transfer, and proof readiness.
- Add one sample recommendation card with specific language, for example: "If your role is heavy on reporting and stakeholder coordination, the safest move may be to become the person who owns AI-assisted operating cadence, not to jump straight into a new title."

Files likely affected: `app/page.js`, `lib/i18n.js`, `app/methodology/page.js`

### Free audit

User decision: "Can I answer this quickly, and will the output reflect my actual work?"

What works:

- The audit is appropriately lightweight for a free scan.
- Task selection is more useful than asking only for job title and industry.
- The role-shape question helps separate broad titles from how the person actually works.
- Required email and terms acceptance are now explicit.

Launch risks:

- Step 2 is dense. The user may not immediately understand that selected tasks, primary tasks, and role shape all affect the diagnosis.
- Email copy currently sounds like email delivery is the mechanism for the free result. The actual flow is in-app.
- LinkedIn copy says prefill is coming, but the input is already usable as optional profile context. That makes the product feel unfinished at the exact moment it needs confidence.

Recommended content improvements:

- Rename email framing from "send your result" to "attach this scan to your result" unless email delivery is implemented.
- Rename LinkedIn framing from "prefill is coming" to "optional LinkedIn context."
- Add small helper text above the task selectors: "Pick the work that actually fills your week. This matters more than your job title."

Files likely affected: `app/audit/page.js`, `lib/i18n.js`

### Free result and paywall

User decision: "Is the free result useful enough that I believe the paid report will be better?"

What works:

- The free result gives a controlled reward instead of only gating everything.
- The paid value is related to the user's diagnosis, not a generic upsell.
- The paywall has a good product shape: deeper ranking, skill gaps, stay-and-advance, proof, and plan.

Launch risks:

- The value gap between free and paid should be stated in practical terms: "free tells you where pressure is building; paid tells you what to do next and how to prove it."
- If the report route lands on the broken pivot tab state, users may think the paid content failed.
- If checkout or email state copy overpromises, trust can drop quickly.

Recommended content improvements:

- Add a concise paid-report framing line near the unlock CTA: "The full report does not just name a pivot. It ranks the safer path, the faster path, and the stay-and-advance path against your actual work."
- Avoid saying "roadmap ready" until the full paid intake has been completed.

Files likely affected: `components/report-experience.js`, `lib/i18n.js`, `app/api/create-checkout/route.js`

### Checkout

User decision: "Is this worth paying for, and do I understand what happens after payment?"

What works:

- Checkout is handled through Stripe, which helps trust.
- The app redirects into a success step and then the paid intake/report flow.

Launch risks:

- Pricing/value justification should be visible before Stripe handoff, not only implied by the report modules.
- Refund/support expectations are not very visible. Do not invent a refund policy, but do give a clear support/contact path.
- The user should know that the full-tier report requires one final intake after payment.

Recommended content improvements:

- Before checkout, state: "After payment, we ask a few final questions so the full report can rank paths using your urgency, experience, AI maturity, market preference, and proof state."
- Add a small contact reassurance: "Question before buying? Contact us." Link to contact.

Files likely affected: `components/report-experience.js`, `app/contact/page.js`, `lib/i18n.js`

### Success

User decision: "Did payment work, and what do I do now?"

What works:

- The success page tells full-tier users that there is one more step.
- It distinguishes full report from quick peek.

Launch risks:

- The unlocked item list implies final report components are ready before the second intake.
- The CTA label "View my report now" may be slightly misleading for full-tier users if the next destination is intake rather than the complete report.

Recommended content improvements:

- Change unlocked item labels to expectation-setting language:
  - "Deeper ranking unlocked"
  - "Final questions next"
  - "Full report after this step"
- Consider a full-tier-specific CTA later: "Continue to final questions."

Files likely affected: `lib/i18n.js`, `app/success/page.js`

### Paid intake

User decision: "Why am I answering more questions after paying?"

What works:

- The page clearly explains that the free scan was intentionally lightweight and the paid report needs deeper signal.
- Required-first framing is good.
- Optional precision inputs being hidden behind a toggle reduces friction.

Launch risks:

- The second intake is necessary, but users may feel surprised if the pre-checkout flow did not set this expectation.
- The optional fields should not look like homework. They should feel like precision boosters.

Recommended content improvements:

- Keep the "why this second step exists" language.
- Add a reassurance line: "This takes about two minutes and prevents the paid report from stretching a free preview."

Files likely affected: `components/full-report-intake.js`, `lib/i18n.js`, `components/report-experience.js`

### Full report

User decision: "Which path should I choose, why, and what should I do first?"

What works:

- The report is materially more useful than generic AI career advice.
- It includes a decision brief, recommendation stack, primary move, conservative backup, stay path, skill gaps, proof asset, milestone plan, learning path, and outcome tracking.
- The content often connects role shape, task exposure, market transfer, and proof readiness.
- Recommendation-quality tests exist and should be kept as a launch gate.

Launch risks:

- The executive summary needs to be the clearest object on the page. It should answer: "Do this first, because this tradeoff wins."
- The stay-and-advance tab has strong content, but the concepts overlap: career safety read, promotion case, AI leverage playbook, role operating system, proof assets, and operating cadence can feel like separate cards saying similar things.
- Some labels sound internal or shorthand-like. Example: "TL" for timeline is unclear.
- The report can feel long. The answer should come first, then the evidence.

Recommended content improvements:

- Make the top of the report an operating brief:
  - Recommendation: stay, pivot, or hedge.
  - Why it wins: 2-3 concrete reasons.
  - What changes in 30 days: one visible work outcome.
  - First 7 days: one proof asset or workflow to build.
- Rebuild the stay tab into a tighter narrative:
  - Safety read: what is exposed and what is defensible.
  - Operating wedge: the AI-enabled workflow to own.
  - Promotion case: how this becomes leverage with a manager.
  - Proof asset: what to show by day 30.
- Use visual decision objects sparingly: path tradeoff matrix, skill-gap delta bars, proof readiness, and next-week sequence.

Files likely affected: `components/report-experience.js`, `lib/report-data.js`, `lib/report-quality.js`, `scripts/test-report-quality.mjs`

### Dashboard and report history

User decision: "Can I come back to this, track progress, and trust that my purchase is saved?"

What works:

- Saved report/history routes exist.
- Login and dashboard routes support retention and later report access.

Launch risks:

- The product should make saved access clearer in the paid flow and success state.
- If email delivery is not configured locally, do not rely on email as the primary promise.

Recommended content improvements:

- Add a small reassurance in paid states: "Use the same email to return to your saved report."
- Make any local-only email limitation invisible to production users or clearly environment-gated.

Files likely affected: `app/login/page.js`, `app/dashboard/page.js`, `app/success/page.js`, `lib/i18n.js`

### Static trust and SEO pages

User decision: "Is this credible enough to trust, cite, or share?"

What works:

- Methodology, privacy, terms, contact, and role pages exist.
- Role pages provide SEO/supporting context for different job categories.
- Methodology gives the app a more serious product posture than a simple quiz.

Launch risks:

- Methodology should be surfaced more directly in the funnel, especially near paid conversion.
- Static pages should avoid sounding like broad AI-career content. Their best job is to prove specificity.
- Contact/support reassurance should be visible before and after payment.

Recommended content improvements:

- Add methodology snippets that map to the report:
  - task exposure
  - role-shape leverage
  - market transfer
  - proof readiness
  - execution plan
- Add role-page examples that show specific outputs, not just role descriptions.

Files likely affected: `app/methodology/page.js`, `lib/methodology-content.js`, `lib/role-pages.js`, `app/contact/page.js`, `app/page.js`

## Deep report-content findings

### Executive summary

Current usefulness: medium-high.

The summary gives context and signals, but it should behave more like the first page of an executive brief. Users should not need to scan multiple tabs to understand the recommended path.

Improve by making the summary answer:

- "Your best move is X."
- "This wins because Y."
- "The risk if you wait is Z."
- "This week, build or do A."

Files likely affected: `components/report-experience.js`, `lib/report-data.js`

### Recommendation stack

Current usefulness: high.

The ranking is one of the product's core strengths. Preserve the logic. The main improvement is copy hierarchy: make clear whether the primary recommendation is safest, fastest, or highest-upside.

Improve by adding short reason tags:

- "Best risk-adjusted move"
- "Fastest proof path"
- "Higher-upside but larger skill gap"

Files likely affected: `components/report-experience.js`, `lib/report-data.js`

### Stay-and-advance content

Current usefulness: high, but overlapping.

This is the most differentiated part of PivotIQ. The issue is not weak content. It is too many adjacent concepts competing for attention.

Recommended narrative:

1. Safety read: what work is exposed vs defensible.
2. Operating wedge: the AI-enabled workflow to own.
3. Manager case: how to frame the value.
4. Proof asset: the artifact to build in 30 days.
5. Operating cadence: weekly actions to keep it alive.

Files likely affected: `components/report-experience.js`, `lib/report-data.js`

### Pivot recommendations

Current usefulness: high.

The pivot paths are strongest when they explain transfer logic, not just title names. Continue emphasizing why the user's current work maps to the target path.

Improve by tightening every pivot card around:

- transferable advantage
- missing proof
- first proof asset
- risk tradeoff

Files likely affected: `components/report-experience.js`, `lib/report-data.js`, `lib/recommendation-quality.js`

### Backup pivot

Current usefulness: medium.

The backup pivot is useful if it is framed as a conservative hedge, not merely a second-best title.

Improve by saying when to choose it:

- choose this if the primary path feels too technical
- choose this if you need near-term internal mobility
- choose this if salary risk tolerance is low

Files likely affected: `lib/report-data.js`, `components/report-experience.js`

### Skill gaps

Current usefulness: high.

Skill gaps become actionable when they are connected to proof. "Learn X" is weak. "Use X to build Y artifact" is strong.

Improve by keeping each gap tied to:

- why it matters for the path
- the smallest credible proof artifact
- what "good enough" looks like

Files likely affected: `lib/report-data.js`, `lib/report-quality.js`, `scripts/test-report-quality.mjs`

### Proof asset builder

Current usefulness: high.

This is one of the best conversion/value sections because it turns advice into visible career evidence.

Improve by making proof asks sharper:

- avoid generic portfolio advice
- name the artifact
- name the audience
- name the before/after evidence

Example: "Build a one-page AI-assisted renewal-risk dashboard using anonymized customer segments. Show the input signals, decision rule, and manager-ready recommendation format."

Files likely affected: `lib/report-data.js`, `components/report-experience.js`

### 30-day plan

Current usefulness: medium-high.

The plan is useful, but it should be more outcome-based and less content-heavy. Every week should create evidence the user can show.

Improve by making each week answer:

- what to build
- who sees it
- what decision it supports
- how it strengthens the user's path

Files likely affected: `lib/report-data.js`, `components/report-experience.js`

### Learning resources

Current usefulness: medium.

Learning resources are useful only if they are tied to the recommended move. Generic courses can dilute the premium feel.

Improve by prefacing resources with a use case:

- "Use this to learn enough SQL to build the proof dashboard."
- "Use this to structure the manager conversation, not to become a generic AI expert."

Files likely affected: `lib/report-data.js`, `scripts/test-recommendation-quality.mjs`

### Progress and outcome tracking

Current usefulness: medium-high.

This supports retention and makes the product feel more like a system than a one-off report. The strongest framing is "refresh the recommendation when your proof changes."

Improve by making progress states map to report confidence:

- no proof yet
- internal proof
- repeatable workflow
- manager-visible asset
- market-visible asset

Files likely affected: `components/report-experience.js`, `app/api/reports/[id]/progress/route.js`, `app/api/reports/[id]/outcomes/route.js`

## Static and trust-page findings

Methodology is important and should be treated as a trust asset, not a secondary page. Its job is to prove that PivotIQ uses role-specific inputs and does not simply generate generic AI advice.

Privacy and terms pages are present, but the funnel should surface support/contact reassurance in payment-adjacent contexts. Users making career decisions may want to know who to contact if the report does not unlock or if they used the wrong email.

Role pages are useful for SEO and specificity, but they should include examples of outputs. The highest-converting role-page content would be: "For this role, PivotIQ looks at these exposed tasks, these defensible tasks, these common pivot lanes, and these proof assets."

Files likely affected: `app/methodology/page.js`, `lib/methodology-content.js`, `app/privacy/page.js`, `app/terms/page.js`, `app/contact/page.js`, `lib/role-pages.js`

## Conversion and pricing-friction findings

The paid report can justify a near-term launch price if the product consistently shows that it is more than a PDF-style assessment. The strongest value justification is:

- It identifies career-risk pressure at the task level.
- It ranks stay vs pivot paths.
- It gives a practical proof asset.
- It turns the decision into a 30-day execution plan.
- It can be revisited through saved reports/progress.

Main friction points:

- The user may not know a second intake happens after checkout.
- The user may not understand why email is required if the free result is shown immediately.
- The product does not visibly reassure users about support before payment.
- The paid-report modules are valuable but numerous; the offer needs a sharper sentence.

Recommended offer sentence:

"The full report turns your free risk scan into a ranked stay-vs-pivot decision, a proof asset to build, and a 30-day plan you can use with your manager or job search."

Files likely affected: `components/report-experience.js`, `app/page.js`, `lib/i18n.js`

## Ordered action plan

### Must fix before launch

1. Fix report tab URL normalization so legacy `paths` URLs route to the active `pivots` tab.

   Files likely affected: `components/report-experience.js`, `app/internal/qa-fixtures/page.js`, `app/internal/qa-fixtures/[catalog]/[slug]/page.js`

2. Align success-page copy with the real full-tier flow: payment unlocks the final intake and full report generation, not an already-finished plan.

   Files likely affected: `lib/i18n.js`, `app/success/page.js`

3. Remove free-audit email delivery overclaim unless automatic email delivery is added to free scan generation.

   Files likely affected: `lib/i18n.js`, `app/audit/page.js`, `app/api/generate-report/route.js`

4. Replace unfinished LinkedIn "prefill coming" copy with optional-context language.

   Files likely affected: `lib/i18n.js`, `app/audit/page.js`

5. Run launch gates: build, report-quality tests, recommendation-quality tests.

   Files likely affected: `package.json`, `scripts/test-report-quality.mjs`, `scripts/test-recommendation-quality.mjs`

### Should fix soon after launch

1. Add a compact paid-value explainer before Stripe checkout.

   Files likely affected: `components/report-experience.js`, `lib/i18n.js`

2. Make the full report executive summary more decisive.

   Files likely affected: `components/report-experience.js`, `lib/report-data.js`

3. Rebuild stay-and-advance into one operating narrative with less conceptual overlap.

   Files likely affected: `components/report-experience.js`, `lib/report-data.js`

4. Surface methodology and support links in payment-adjacent areas.

   Files likely affected: `app/page.js`, `components/report-experience.js`, `app/contact/page.js`

5. Add role-page output examples that prove specificity.

   Files likely affected: `lib/role-pages.js`, `app/roles/*`

### Nice-to-have polish

1. Add visual proof-readiness and skill-gap progression indicators.

   Files likely affected: `components/report-experience.js`

2. Add a sample report preview from the homepage.

   Files likely affected: `app/page.js`, `components/report-experience.js`

3. Add browser-based visual QA for the full funnel.

   Files likely affected: `scripts/*`, test configuration

4. Add localized copy parity checks for English, Dutch, and German launch copy.

   Files likely affected: `lib/i18n.js`, test scripts

## Specific copy and content recommendations

### Free audit email

Current issue: copy promises sending the free result.

Recommended copy:

- Label: "EMAIL FOR THIS RESULT"
- Body: "Use the same email if you unlock the full report, save access, or need support."
- Consent body: "We use your email to attach this scan to your result and support checkout or saved access. Newsletter is optional. Terms acceptance is required."
- Error: "Enter your email so we can attach it to this scan."

Files likely affected: `lib/i18n.js`

### LinkedIn context

Current issue: copy says prefill is coming even though the input can collect optional context.

Recommended copy:

- Title: "Optional LinkedIn context"
- Body: "Paste your profile URL if you want the report to consider your current positioning. You can skip this."
- Badge: "Optional"

Files likely affected: `lib/i18n.js`

### Success after payment

Current issue: copy implies the full report is already ready.

Recommended copy:

- "Deeper ranking unlocked"
- "Final questions next"
- "Full report after this step"

Files likely affected: `lib/i18n.js`, `app/success/page.js`

### Paid value sentence

Recommended copy:

"The full report turns your free risk scan into a ranked stay-vs-pivot decision, a proof asset to build, and a 30-day plan you can use with your manager or job search."

Files likely affected: `components/report-experience.js`, `app/page.js`, `lib/i18n.js`

### Methodology trust snippet

Recommended copy:

"PivotIQ does not score your job title in isolation. It looks at the work you actually do, how exposed those tasks are to AI, which parts of your role create leverage, and what proof would make a safer next move credible."

Files likely affected: `app/page.js`, `app/methodology/page.js`, `lib/methodology-content.js`

## Improvements implemented from this audit

These fixes improve usefulness without changing recommendation logic:

- Normalize legacy `paths` tab URLs to the current `pivots` tab.
- Update internal QA fixture links to use `?tab=pivots`.
- Replace unclear `TL` timeline label with `Timeline`.
- Align free-audit email copy with the actual in-app result flow.
- Reframe LinkedIn as optional context instead of unfinished prefill.
- Align success-page unlocked items with the second-intake flow.
- Add homepage value framing and a sample recommendation proof card.
- Add pre-checkout trust content, methodology links, and contact reassurance.
- Add a decisive executive-summary brief, proof-readiness card, skill-gap progression, and proof-confidence ladder to the report.
- Rebuild stay-and-advance into one operating narrative with safety, operating wedge, manager case, proof, and cadence.
- Add methodology input-to-output mapping and role-page example-output sections.

## Remaining launch verification notes

No recommendation-logic blocker was found in this audit. The main product-positioning and funnel clarity issues identified here have been addressed in the implementation pass:

- Paid-report value framing was added before checkout and on the homepage.
- Contact/support reassurance now appears near payment and after unlock.
- The full report now opens with a more decisive executive summary and proof-readiness view.
- The stay-and-advance tab now consolidates safety, operating wedge, manager case, proof asset, and cadence into one narrative.
- Before public launch, still run a real-browser funnel QA pass against production-like environment variables if browser tooling is available.
