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
  - checking the real output quality of the new adjacent hard-skill layer in saved reports once regeneration is responsive again

## Next Steps

1. Regenerate and inspect the saved broad-role QA reports again once the live regeneration path is responsive, especially the Data Analyst and Finance Manager examples.
2. Reassess whether the new adjacent hard-skill layer reads as practical and premium in actual saved reports, not just tests.
3. Tighten any remaining templated-sounding stay-path or pivot-path wording in broad-role saved outputs.
4. Keep tightening lower-ranked active pivots for broad roles where the main path is solid but the backup stack still feels thinner.
5. Continue using regenerated saved reports as the main product-quality check, not just fixtures and unit tests.

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
  - sharper hard-skill resource mapping
  - more premium wording
  - more differentiated broad-role outputs
