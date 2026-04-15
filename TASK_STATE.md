# TASK STATE

Last updated: 2026-04-15
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`
Worktree state: modified files pending commit (`TASK_STATE.md`, `lib/report-data.js`, `scripts/test-report-quality.mjs`)

## Completed Work

- Result-page structure was upgraded so the top-level tabs are now:
  - `Task Breakdown`
  - `Stay and advance with AI`
  - `Pivot Paths`
  - `Milestone Plan`
- The stay path is no longer buried inside the plan flow. It is now a first-class report section near the top.
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
- The learning catalog and learning-path coherence were tightened earlier in the session history and remain in place.
- Hard-skill gap detection was improved so pivot recommendations surface concrete stack/tool gaps instead of soft filler when the target role requires real tooling fluency.
- The latest important engine change is now live:
  - skill gaps are model-driven instead of being replaced by authored hard-coded family bundles
  - quality gates now sanitize and filter weak/off-family gaps instead of rewriting them into canned answers
  - learning-path start-step selection now prefers market-backed, tool-backed, concrete hard skills over generic BPM / prompt-engineering filler
- Report `696c14fc-dd63-4cc1-b343-228dd65893bf` was regenerated successfully after the model-driven skill-gap change.
  - current top pivot: `Analytics Manager`
  - current saved top hard-skill gaps include:
    - `Looker`
    - `Power Bi`
    - `Snowflake`
    - `Sql`
    - `Python`
- Gap-to-resource matching was improved for explicit tools and platforms:
  - the course matcher now boosts exact tool/platform matches much more strongly
  - mismatched tool platforms are penalized instead of floating to the top on generic analytics overlap
  - the course catalog now includes targeted coverage for:
    - `dbt`
    - `Workday`
    - `Gainsight`
    - `Marketo`
    - `NetSuite`
    - `SAP`
- The saved Data Analyst example now shows sharper pairings:
  - `Looker` → `Looker reporting and BI paths`
  - `Power Bi` → `Power BI and DAX courses`
  - `Snowflake` → `Snowflake Learning Tracks`
- Normalization now dedupes overlapping hard-skill gaps instead of showing near-duplicates like `Python` and `Python for analytics` side by side.
- Stay-path skill gaps are now stack-aware:
  - when the user has real systems/tooling input, the stay path can surface a role-native hard-skill/platform gap before the softer workflow layer
  - the system now prefers the most role-native tool in the current stack instead of blindly taking the first listed system
- Stay-path hard-skill depth was extended again:
  - roles like analytics and finance can now surface a second adjacent hard-skill layer after the primary system/platform gap
  - the adjacent layer is chosen from nearby market signal plus current stack context instead of a single authored fallback
  - example pattern is now closer to:
    - `Tableau` + `SQL/Data modeling`
    - `Excel/NetSuite` + `Financial modeling/Scenario planning`
- Broad-role fallback behavior was tightened so the second stay-path layer now appears even when there is no explicit system input and the pivot signal is thin.
- Broad-role saved QA snapshots were regenerated again and now show stronger second-layer stay gaps:
  - `Data Analyst`: `Dashboard QA workflow design` + `SQL`
  - `Customer Success Manager`: `Renewal risk review design` + `Customer health scoring`
  - `Executive Assistant`: `Executive workflow design` + `Meeting system automation`
  - `Operations Manager`: `Workflow automation design` + `Process instrumentation`
  - `Marketing Manager`: `Campaign experiment design` + `Marketing automation`
- The latest refinement pass reduced repetitive second-layer stay labels without reintroducing hard-coded skill bundles:
  - finance now falls back to `Planning model governance`
  - marketing now falls back to `Attribution and lifecycle logic`
  - operations now falls back to `Exception routing logic`
  - overlap detection now prevents the second layer from echoing the primary workflow too closely
- Adjacent stay-skill resource matching now understands those newer labels:
  - finance model-governance labels map to `Financial modeling paths`
  - marketing lifecycle labels map to `AI for Marketing Course`
  - operations exception-routing labels map to workflow automation resources
- Senior-role QA snapshots were seeded into the founder account and spot-checked. Current saved stay-gap patterns are:
  - `Finance Manager`: `Financial modeling and scenario review` + `Planning model governance`
  - `Senior Program Manager`: `Workflow automation design` + `Exception routing logic`
  - `Marketing Director`: `Campaign experiment design` + `Attribution and lifecycle logic`
  - `Customer Success Director`: `Renewal risk review design` + `Customer health scoring`
- English stay-path strategy copy was tightened so it reads more decisive and less templated:
  - stronger `stay` recommendation wording
  - stronger `stay` rationale wording
- Local normalization check on report `696c14fc-dd63-4cc1-b343-228dd65893bf` now yields:
  - top pivot hard-skill gaps: `Looker`, `Power BI`, `Snowflake`, `SQL`, `Python`
  - stay-path hard-skill gap: `Tableau`
  - sharper stay recommendation/rationale copy

## In-Progress Work

- No code is currently mid-edit, but there are local modifications ready to commit.
- The main active frontier is recommendation polish, especially:
  - stronger broad-role wording quality
  - continued improvement of hard-skill relevance without reintroducing hard-coded authored bundles
  - reducing the remaining repetitive third-layer governance labels and templated safety-copy phrasing

## Next Steps

1. Tighten the remaining third-layer stay labels that still feel too close to the second layer:
   - `Marketing automation governance`
   - `Customer workflow orchestration`
   - `Executive operating rhythm design`
   - `Team workflow governance`
2. Reduce templated emotional phrasing in saved reports, especially:
   - `stay_and_advance.rationale`
   - `job_safety_case.summary`
3. Reassess the newest senior saved reports in the founder account after that wording pass.
4. Keep tightening lower-ranked active pivots for broad and senior roles where the main path is solid but the backup stack still feels thinner.

## Blockers Or Assumptions

- OpenRouter remains on `nvidia/nemotron-3-nano-30b-a3b:free`.
- Live regeneration was attempted again for report `696c14fc-dd63-4cc1-b343-228dd65893bf`, but the script appeared to hang upstream instead of finishing. Local normalization verified the new behavior even though the saved DB row did not update in this pass.
- The current direction is to avoid hard-coded authored skill-gap answers and let the model + market grounding drive the gap content.
- It is still acceptable to keep lightweight guardrails that:
  - remove off-family leakage
  - remove generic filler
  - reorder or filter low-signal gaps
  but not replace them with authored bundles.
- The remaining weakness is not gross recommendation failure; it is refinement:
  - sharper third-layer skill differentiation
  - less templated safety/promotion wording
  - more differentiated broad- and senior-role outputs
