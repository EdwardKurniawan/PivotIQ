# TASK STATE

Last updated: 2026-04-15
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`
Worktree state: clean before this handoff refresh; `TASK_STATE.md` is now updated locally

## Completed Work

- Report visualization got a new data-UI pass:
  - added a `Decision matrix` near the top of the stay tab to compare:
    - stay path
    - primary pivot
    - backup path
  - redesigned `Use AI this week` into a clearer workflow map:
    - workflow
    - AI role
    - human checkpoint
    - shipped output
    - success signal
    - leadership readout
  - upgraded skill-gap cards with a visual `Gap shape` meter so current signal vs target scope is easier to scan
- Learning and proof sections got a second visualization pass:
  - `Learning path` now has a clearer 3-step track before the detailed cards
  - each learning step now explains whether it is for:
    - starting
    - building proof
    - going deeper
  - `Proof asset builder` now starts with a compact ship/check/share strip before the deeper detail
- `Career safety read` and `Promotion case` were compressed into more visual snapshot cards:
  - quick headline tiles
  - shorter top-line summaries
  - trimmed supporting bullets
- `AI leverage playbook` is now lighter and more visual:
  - top summary tiles
  - denser play cards with a 4-part workflow view
  - less paragraph-heavy repetition
- `Promotion conversation pack` is now compressed:
  - top quick-action tiles
  - shorter talk track
  - lighter evidence / next-scope grouping
  - trimmed `what not to say`
- `Role operating system` is now lighter and more visual:
  - top summary strip for scope move, first-week win, and leadership readout
  - denser 4-lane operating matrix for:
    - automate
    - augment
    - protect
    - lead
- The stay tab now has clearer visual section breaks:
  - `Work this role differently`
  - `Build visible leverage`
- Report tabs now support query-param deep links:
  - `/report/[id]?tab=stay`
  - `/report/[id]?tab=paths`
  - `/report/[id]?tab=plan`
- Dashboard continuity is tighter:
  - report links now open the most relevant tab for the current attention state instead of always dropping users at the default top
- Internal fixture QA now has a true full-report preview route:
  - `/internal/qa-fixtures/[catalog]/[slug]`
  - preview links from fixture cards now open:
    - default preview
    - stay tab
    - pivot paths
- Real local QA improved:
  - local fixture preview route was verified with:
    - `200 OK` on `/internal/qa-fixtures/broad/data-analyst?tab=stay`
    - rendered stay-tab markers like:
      - `Decision matrix`
      - `How to work now`
      - `AI leverage playbook`
      - `Promotion conversation pack`
- Recommendation-quality polish in normalization:
  - pivot lists are now deduped by title so repeated external recommendations do not leak through to the UI as separate paths
  - this was kept deliberately narrow so it does not collapse pivots just because they resemble the stay-path title
- Protected report-link auth behavior was fixed:
  - anonymous visits to `/report/[id]` now redirect to `/login?next=/report/[id]` instead of returning a fake `404`
  - the login page now respects `next` for:
    - magic-link sign-in
    - password sign-in
    - sign-up confirmation flow
    - recovery completion redirect
- The new visualization layer was implemented in `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app/components/report-experience.js` and verified with a clean `npm run build`.
- Result-page structure was upgraded so the top-level tabs are now:
  - `Task Breakdown`
  - `Stay and advance with AI`
  - `Pivot Paths`
  - `Milestone Plan`
- The stay path is now a first-class report section near the top instead of being buried in the plan flow.
- The results page got a trim-and-visual cleanup pass:
  - shorter summaries
  - lighter stay section
  - more compact pivot cards
  - compressed skill-gap cards
  - more collapsed milestone-plan detail
- Stay-and-advance value was strengthened with:
  - `Career safety read`
  - `Promotion case`
  - stronger proof-asset execution guidance
  - higher-visibility `Use AI this week` block
- Broad-role stay-path quality was improved for:
  - analytics
  - finance
  - customer success
  - HR
  - operations
  - executive/admin support
- `Use AI this week` now uses role-relevant systems instead of generic placeholders in broad-role reports.
- Active-pivot realism and backup-stack cleanup were improved across broad roles, including operations.
- Broad-role QA infrastructure is live and usable:
  - fixture catalogs
  - internal QA fixture viewer
  - saved QA report seeding into the founder account
- Hard-skill gap detection was improved so pivot recommendations surface concrete stack/tool gaps instead of soft filler when the target role requires real tooling fluency.
- Skill gaps are now model-driven instead of being replaced by hard-coded family bundles.
- Quality gates now sanitize and filter weak/off-family gaps instead of rewriting them into canned answers.
- Gap-to-resource matching was improved for explicit tools and platforms:
  - exact tool/platform matches are boosted much more strongly
  - mismatched tool platforms are penalized
  - targeted catalog coverage was added for:
    - `dbt`
    - `Workday`
    - `Gainsight`
    - `Marketo`
    - `NetSuite`
    - `SAP`
- The saved Data Analyst example sharpened materially:
  - `Looker` → `Looker reporting and BI paths`
  - `Power BI` → `Power BI and DAX courses`
  - `Snowflake` → `Snowflake Learning Tracks`
- Normalization now dedupes overlapping hard-skill gaps instead of showing near-duplicates like `Python` and `Python for analytics`.
- Stay-path skill gaps are now stack-aware:
  - the engine can surface a role-native hard-skill/platform gap before softer workflow layers
  - it prefers the most role-native tool in the current stack instead of blindly taking the first listed system
- Stay-path hard-skill depth was extended:
  - analytics/finance-style roles can now surface a second adjacent hard-skill layer after the primary system/platform gap
  - the adjacent layer is chosen from nearby market signal plus current stack context instead of a single authored fallback
- Broad-role fallback behavior was tightened so the second stay-path layer appears even when there is no explicit system input and the pivot signal is thin.
- Broad-role stay-path examples are now much stronger:
  - `Data Analyst`: `Dashboard QA workflow design` + `SQL`
  - `Customer Success Manager`: `Renewal risk review design` + `Customer health scoring`
  - `Executive Assistant`: `Executive workflow design` + `Meeting system automation`
  - `Operations Manager`: `Workflow automation design` + `Process instrumentation`
  - `Marketing Manager`: `Campaign experiment design` + `Marketing automation`
- Repetitive second-layer stay labels were reduced without reintroducing hard-coded skill bundles:
  - finance → `Planning model governance`
  - marketing → `Attribution and lifecycle logic`
  - operations → `Exception routing logic`
- The third stay layer and emotional framing were improved:
  - `Planning review cadence`
  - `Manager support operating standard`
  - `Executive decision cadence`
  - `Renewal playbook governance`
  - `Exception and handoff governance`
  - `Growth review operating system`
- Stay rationale and safety-case summaries are now more role-native and less templated.
- Resource precision for stronger stay skills was upgraded substantially:
  - stay skills are now typed as:
    - `system_tool`
    - `hard_skill`
    - `workflow_design`
    - `governance`
    - `decision_communication`
  - senior-role governance and operating-system skills now route to stronger role-native resources instead of generic AI literacy
  - helper text is now skill-type aware
- The course catalog was expanded and reseeded; current state after the latest seed:
  - `240` active verified entries
  - `100` health score
- First-step stay learning resources were tightened so senior-role reports now start with workflow context instead of generic intros.
- Stay learning-path selection was improved so `workflow_design` gets explicit priority for the `stay` track when it is close in value to a narrower hard-skill sub-layer.
- Second-step stay resources were tightened across senior roles:
  - `Marketing Director` now uses `Marketing Attribution and Lifecycle Analysis`
  - `Senior Program Manager` now uses `Exception Routing and Process Control`
  - `Senior HR Business Partner` now uses `People Analytics and Workforce Planning`
  - `Customer Success Director` now uses `Customer Health and Renewal Analysis`
- Finance stay learning is now split more cleanly across proof vs deeper operating work:
  - `Planning model governance` → `Finance Modeling and Planning Logic`
  - `Planning review cadence` → `Finance Planning Operating Cadence`
- The `hard_skill` branch in stay-resource routing now has family-specific role-native resources, so build-proof steps no longer fall back quickly to broad vendor/tool intros.
- Resource titles were polished to feel more premium in the UI and saved reports:
  - `Finance Workflow Design`
  - `Finance Planning Operating Cadence`
  - `People Systems and Manager Operations`
  - `Marketing Lifecycle Operating System`
  - `Process Handoff Governance Design`
  - `Executive Operations and Decision Cadence`
- Latest senior saved QA reports in the founder account now read like this:
  - `Finance Manager`
    - `Finance Workflow Design`
    - `Finance Modeling and Planning Logic`
    - `Finance Planning Operating Cadence`
  - `Senior HR Business Partner`
    - `Manager Enablement Workflow Design`
    - `People Analytics and Workforce Planning`
    - `People Systems and Manager Operations`
  - `Senior Program Manager`
    - `Workflow Design and Process Mapping`
    - `Exception Routing and Process Control`
    - `Process Handoff Governance Design`
  - `Marketing Director`
    - `Campaign Workflow and Experimentation`
    - `Marketing Attribution and Lifecycle Analysis`
    - `Marketing Lifecycle Operating System`
  - `Customer Success Director`
    - `Customer Workflow Design`
    - `Customer Health and Renewal Analysis`
    - `Customer Renewal Playbook Systems`

## In-Progress Work

- No code is currently mid-edit.
- The active frontier is now finish-quality polish on the stay tab:
  - one more pass on dense cards that still feel text-first
  - more consistent spacing/hierarchy across the full stay flow
  - stronger real-report visual QA against authenticated saved reports when convenient

## Next Steps

1. Do one more stay-tab polish pass on:
   - `Decision matrix`
   - `Career safety read`
   - any cards whose spacing still feels heavier than the new operating-system card
2. Use the new fixture preview route for deeper visual QA on:
   - `Data Analyst`
   - `Marketing Director`
   - `Customer Success Director`
   - `Executive Assistant`
3. Improve dashboard/report continuity further if needed:
   - consider explicit `Open stay tab` / `Open plan` actions on saved-report cards
4. Reassess the newest broad and senior saved reports in the founder account after the next UI pass to judge actual readability, not just structure.
5. Tighten any remaining third-step or backup-path resources that still feel like broad search placeholders rather than premium role-native learning.
6. Continue using saved-report QA as the primary quality gate, not just fixtures and unit tests.

## Blockers Or Assumptions

- OpenRouter remains on `nvidia/nemotron-3-nano-30b-a3b:free`.
- Live regeneration for report `696c14fc-dd63-4cc1-b343-228dd65893bf` has previously hung upstream instead of finishing, even when the local normalization logic was correct.
- Local UI QA against persisted report IDs is still limited unless the local runtime has matching saved-report data, but the new internal fixture preview route now provides a reliable non-auth visual QA path for the report UI itself.
- Production report URLs returning `404` were traced to auth-gated route behavior plus login flows that previously hard-coded `/dashboard`; this is now fixed in code and should stop the broken-link experience after deployment.
- The current direction is still to avoid hard-coded authored skill-gap answers and let the model plus market grounding drive the gap content.
- It is still acceptable to keep lightweight guardrails that:
  - remove off-family leakage
  - remove generic filler
  - reorder or filter low-signal gaps
  but not replace them with authored bundles.
