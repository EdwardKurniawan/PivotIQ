# TASK STATE

Last updated: 2026-04-15
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`
Worktree state: clean after latest verification

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

## In-Progress Work

- No code is currently mid-edit.
- The main active frontier is recommendation polish, especially:
  - stronger broad-role wording quality
  - continued improvement of hard-skill relevance without reintroducing hard-coded authored bundles
  - reducing duplicate / overly similar technical gaps when the model emits overlapping variants like `Python` and `Python for Data Science`

## Next Steps

1. Reassess the saved broad-role QA reports again and tune wording so the stay-path and pivot-path explanations feel less templated and more inevitable.
2. Keep tightening lower-ranked active pivots for broad roles where the main path is solid but the backup stack still feels thinner.
3. Extend the same model-driven hard-skill logic more deeply into the stay-path skill engine where appropriate, so “stay and advance” can also surface concrete stack/platform gaps when the job really depends on them.
4. Reduce overlapping technical gaps from the model when two gaps are near-duplicates but with different phrasing.
5. Continue using regenerated saved reports as the main product-quality check, not just fixtures and unit tests.

## Blockers Or Assumptions

- OpenRouter remains on `nvidia/nemotron-3-nano-30b-a3b:free`.
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
