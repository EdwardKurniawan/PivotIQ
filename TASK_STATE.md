# TASK STATE

Last updated: 2026-04-13
Repo: `/Users/edwardkurniawan/Documents/Ai Fear Solution/pivotiq-app`
Branch: `main`
Worktree state: local changes present for current quality pass

## Completed Work

- PivotIQ reports now behave more like a career execution system instead of a static report.
- Full reports include:
  - decision brief
  - primary move / conservative backup / stay-and-advance path
  - confidence states
  - AI leverage playbook
  - proof asset builder
  - promotion conversation pack
  - weekly progress loop
  - outcome tracking
  - refresh-from-progress flow
  - internal recommendation-quality dashboard
- Intake quality was upgraded with Phase 1 and Phase 2 clarifiers:
  - `goal_now`
  - `timeline_urgency`
  - `years_experience_band`
  - `location_preference`
  - `ai_maturity`
  - `technical_capability`
  - `salary_tolerance`
  - `proof_state`
- Broad-role QA infrastructure is live:
  - broad-role fixture catalog
  - senior-role fixture catalog
  - internal QA fixture viewer at `/internal/qa-fixtures`
  - saved QA snapshot seeding into the founder account
- Recommendation safety for broad roles was tightened:
  - low-confidence active pivots are suppressed more aggressively
  - broader role families lean toward stay-and-advance when market signal is thin
  - strategy-led active pivots require better proof / overlap to stay primary
- Learning catalog was expanded and cleaned, with stronger matching and audit coverage.
- Broad-role learning coherence was tightened:
  - customer, analytics, finance, marketing, HR, and ops top bundles now repair more aggressively when the learning sequence is off-domain
  - prompt-engineering / generic AI resources are penalized much harder for non-AI business gaps
- Paid-report explanation quality improved:
  - the report now explains why the winning move won now
  - it explicitly explains why a flashier alternative is not leading yet
  - it explains what would need to change before the riskier path becomes the main recommendation
- Lower-ranked backup pivots were cleaned and deduped for:
  - customer success
  - finance
  - marketing
  - analytics
- Lower-ranked backup pivots are now also cleaned for `operations`, with missing repair coverage fixed in the quality gate.
- Stay-first decision-brief copy is now more role-native for broad roles, especially:
  - customer success
  - operations
  - finance
  - analytics
- Broad-role stay-path learning resources were sharpened so they default less often to generic AI courses and more often to role-native workflow resources:
  - `Operations Manager` now starts with `Learn Zapier in 14 days` instead of `OpenAI Academy`
  - `Finance Manager` now starts with `Financial modeling paths` / `FP&A learning paths` instead of generic finance search results
  - `Customer Success Manager` now gets a cleaner customer-ops sequence with `Customer success operations courses` in the build-proof layer
- Saved QA snapshots were refreshed after the latest cleanup:
  - `Data Analyst` → `Business Intelligence Lead`
  - `Customer Success Manager` → `Customer Success Strategy Lead`
  - `Executive Assistant` → `Executive Operations Lead`
  - `Operations Manager` → `Program Operations Lead`
  - `Marketing Manager` → `Marketing Strategy Lead`

## In-Progress Work

- No unfinished code path is mid-edit after this handoff update.
- The active product frontier is now recommendation polish and remaining broad-role realism, not missing platform infrastructure.

## Next Steps

1. Tighten the next weakest lower-ranked active pivots after operations:
   - customer success
   - finance
   - marketing
   Focus on premium-feeling backup stacks when market evidence is thin.
2. Continue sharpening learning-path coherence where step 2 and step 3 still lean on generic communication/AI resources instead of role-native ones.
3. Review the new saved broad QA snapshots in-account and improve wording quality on the actual rendered reports, not just fixture tests.
4. Expand the saved QA snapshot set when a new role family becomes important so recommendation feel is validated on real stored reports, not just fixture tests.
5. Keep the recommendation-quality dashboard aligned with real outcome patterns so future tuning is based on user signal, not intuition.

## Blockers Or Assumptions

- OpenRouter must remain on `nvidia/nemotron-3-nano-30b-a3b:free`.
- Reminder-email delivery exists in the product but is not the current priority.
- The strongest source of truth for report quality is now the saved in-account QA snapshots, not just fixture JSON or isolated test results.
- Broad-role quality is much safer than before, but some lower-ranked active pivots and some learning bundles can still be improved to feel more premium.
