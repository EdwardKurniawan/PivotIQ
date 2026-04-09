# Intake Upgrade Spec — 2026-04-09

## Goal
Improve recommendation quality at the system level without turning PivotIQ into a long, exhausting questionnaire.

The product problem is not mainly "the model needs to think harder." It is:

- we still do not know enough about the user's real constraints
- we still do not know enough about the user's real operating level
- we still do not know enough about the user's actual work systems and AI maturity
- we still ask too little about urgency and user intent

This spec adds the highest-signal inputs first, then uses progressive disclosure for the rest.

## Why this matters

PivotIQ is strongest when it can answer:

1. What is changing in the user's role?
2. What is the strongest next move?
3. How should the user act on it this month?

Recommendation quality drops when the engine cannot tell:

- whether the user wants to stay or pivot
- whether they are early-career or highly experienced
- whether they are an operator, manager, analyst, or decision owner
- whether they have AI proof already or are starting from zero
- whether they can realistically move into technical or systems-heavy roles

## Research-informed principles

These recommendations are grounded in the current evidence:

- [OECD: AI and the Future of Skills, Volume 2](https://www.oecd.org/en/publications/ai-and-the-future-of-skills-volume-2_a9fe53cb-en.html) and related OECD work show AI impact is best understood through tasks, capabilities, and workplace skill changes, not only titles.
- [OECD: Artificial Intelligence and the Changing Demand for Skills in the Labour Market](https://www.oecd.org/en/publications/artificial-intelligence-and-the-changing-demand-for-skills-in-the-labour-market_88684e36-en.html) points toward broader cognitive, managerial, digital, and socio-emotional skill shifts, not just narrow AI-tool fluency.
- [LinkedIn Work Change Report](https://news.linkedin.com/2025/work-change-report) and [LinkedIn Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026) suggest employers are increasingly using skills and work capability signals, not just titles and degrees.
- [O*NET occupational descriptors](https://www.onetcenter.org/database.html) provide a strong structure for combining tasks, technology skills, work context, work values, and experience expectations.
- [U.S. Department of Labor / O*NET Career Exploration Tools](https://www.dol.gov/node/157956) reinforces that career guidance improves when occupational fit includes skills, abilities, work values, and experience, not only self-reported aspirations.
- [NIST AI RMF FAQ](https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-faqs) is a good reminder that trustworthy AI systems should expose uncertainty and monitoring rather than present confident but weakly grounded advice.

## Product principles

### 1. Ask only what changes the recommendation
Every extra field should clearly influence:

- recommendation ranking
- confidence state
- skill-gap ordering
- proof asset choice
- roadmap emphasis

If a field does not move at least one of those, it should not be in intake.

### 2. Ask in layers, not all at once
The audit should feel fast and useful.

Use:

- core intake for everyone
- precision intake only when needed
- optional targeting only when the user wants more tailored results

### 3. Gather constraints before aspiration
Users often know their constraints more clearly than their ideal destination.

We should know:

- timeline
- salary tolerance
- current scope
- current systems
- current AI maturity

before over-weighting what sounds exciting.

### 4. Recommendation quality should improve by abstaining
When the engine lacks enough evidence to recommend a dramatic pivot, it should default toward:

- stay and advance
- hybrid transition
- conservative backup

instead of inventing a flashy answer.

## Recommended intake architecture

### Layer 1: Core intake
Keep this mandatory.

Use this for all users:

- current job title
- industry
- selected tasks
- primary tasks
- role blend
- management scope
- decision scope
- core systems
- location preference
- timeline urgency
- goal now
- years of experience

### Layer 2: Precision intake
Show only after the user completes core intake or when confidence is weak.

Use this for better ranking:

- AI maturity
- technical capability ladder
- salary floor / pay-cut tolerance
- work mode preference
- proof already built
- target role or direction

### Layer 3: Optional refinement
Only show when the user wants higher precision.

Use this for tie-breaking and roadmap tone:

- domain specialization
- team size
- budget ownership
- stakeholder level
- work values
- appetite for management vs specialist track

## Field ranking by impact vs friction

### Tier A: Highest impact, low-to-medium friction
These should be added first.

#### 1. Goal now
Values:

- `stay_and_advance`
- `hybrid_transition`
- `active_pivot`
- `not_sure`

Why it matters:

- changes whether the engine should prefer internal leverage or external adjacency
- reduces recommendation drift into pivots when the user actually wants to stay
- improves report tone and proof asset selection

Ranking impact:

- very high

User friction:

- low

Recommended UI:

- one segmented control near the top of the clarifiers section

#### 2. Timeline urgency
Values:

- `within_3_months`
- `within_6_months`
- `within_12_months`
- `exploring_only`

Why it matters:

- changes how much risk the user can take
- changes whether the product should recommend fastest transition, safest transition, or longer-horizon upside
- changes roadmap aggressiveness

Ranking impact:

- very high

User friction:

- low

#### 3. Years of experience
Values:

- `0_2`
- `3_5`
- `6_10`
- `11_plus`

Why it matters:

- directly affects title realism
- reduces over-senior and under-senior recommendations
- helps calibrate proof expectations and promotion path

Ranking impact:

- very high

User friction:

- low

#### 4. Location preference
Values:

- `netherlands`
- `europe`
- `united_states`
- `global_remote`
- `other`

Why it matters:

- market evidence is only as good as its geographic relevance
- improves hiring-signal interpretation
- helps avoid recommending roles that are only viable in different labor markets

Ranking impact:

- high

User friction:

- low

#### 5. Core systems used weekly
Values:

- structured multi-select plus free text
- examples: `Salesforce`, `HubSpot`, `NetSuite`, `Power BI`, `Excel`, `Workday`, `CLM`, `LMS`, `Jira`, `SQL`, `SAP`

Why it matters:

- systems often predict adjacency better than title alone
- distinguishes a “finance analyst with Excel only” from one who already works across BI / planning systems
- improves both pivot ranking and learning recommendations

Ranking impact:

- high

User friction:

- medium

#### 6. AI maturity
Values:

- `never_use_it`
- `occasionally`
- `weekly`
- `repeatable_workflows`
- `team_level_adoption`

Why it matters:

- changes whether the first move should be literacy, workflow design, governance, or leverage scaling
- improves stay-and-advance recommendations a lot
- prevents over-recommending beginner AI learning to users already shipping workflows

Ranking impact:

- high

User friction:

- low

### Tier B: High impact, medium friction
Add next, preferably through progressive disclosure.

#### 7. Technical capability ladder
Values:

- `no_code_only`
- `advanced_spreadsheets`
- `sql_bi`
- `scripting_python`
- `software_engineering`

Why it matters:

- much better than asking “can you code?”
- changes whether technical pivots are actually credible
- improves course matching and proof asset realism

Ranking impact:

- high

User friction:

- medium

#### 8. Salary floor / pay-cut tolerance
Values:

- `cannot_take_cut`
- `up_to_10_percent`
- `up_to_20_percent`
- `flexible_for_right_move`

Why it matters:

- prevents elegant but impractical transitions
- helps decide between safe internal leverage and external reinvention

Ranking impact:

- high

User friction:

- medium

#### 9. Proof already built
Values:

- `none`
- `internal_project`
- `dashboard_or_analysis`
- `workflow_or_playbook`
- `portfolio_or_case_study`

Why it matters:

- changes what proof asset should come next
- helps the engine understand whether the user needs a first artifact or a better narrative

Ranking impact:

- medium-high

User friction:

- medium

#### 10. Target role or direction
Values:

- free text plus optional suggestions

Why it matters:

- allows the engine to compare “best-fit recommendation” against “desired direction”
- supports a better “bridge vs leap” explanation

Ranking impact:

- medium-high

User friction:

- medium

### Tier C: Useful but not first
Good later. Do not block launch or first upgrade on these.

#### 11. Domain specialization
Examples:

- `regulated`
- `enterprise`
- `healthcare`
- `financial_services`
- `education`
- `manufacturing`

#### 12. Team size

#### 13. Budget ownership

#### 14. Stakeholder level
Examples:

- `mostly internal peers`
- `manager_director`
- `executive`
- `external_clients`

#### 15. Work values
Examples:

- `stability`
- `salary_growth`
- `remote_flexibility`
- `mission`
- `management_track`
- `specialist_track`

These help, but they should refine a recommendation, not determine it.

## Recommended UI flow

### Step 1: Core job and task setup
Existing fields:

- title
- industry
- selected tasks
- primary tasks

Add:

- goal now
- timeline urgency
- years of experience
- location preference

### Step 2: Clarifiers
Keep:

- role blend
- management scope
- decision scope
- core systems

Add:

- AI maturity

### Step 3: Precision block
Only show when needed or after preview unlock.

Add:

- technical capability ladder
- salary tolerance
- proof already built
- target role

## Suggested copy

### Goal now
Prompt:
`What kind of answer do you want most right now?`

Options:

- `Stay and grow in my current lane`
- `Build a hybrid transition path`
- `Actively pivot into a new role`
- `I’m not sure yet`

### Timeline urgency
Prompt:
`How quickly do you need this plan to become useful?`

### Years of experience
Prompt:
`How much experience do you bring in this career lane?`

### AI maturity
Prompt:
`How far have you already gone with AI at work?`

### Technical capability ladder
Prompt:
`What is the highest level of technical work you can comfortably do today?`

### Proof already built
Prompt:
`What visible evidence do you already have?`

## Engine changes

### 1. Ranking
Use the new fields as ranking weights, not just prompt context.

Examples:

- if `goal_now = stay_and_advance`, give the stay path a default lift and require stronger evidence for an active pivot to win
- if `years_experience = 0_2`, penalize manager/director/architect titles more heavily
- if `technical_capability = no_code_only`, penalize coding-heavy pivots
- if `timeline_urgency = within_3_months`, reward safer adjacency and internal leverage
- if `salary_floor = cannot_take_cut`, down-rank long-reset pivots
- if `ai_maturity = repeatable_workflows`, suppress beginner AI-learning-first recommendations

### 2. Confidence
Confidence state should depend on:

- market evidence
- input richness
- role-family cleanliness
- title realism
- user capability match

This means a recommendation should become more trustworthy as the intake becomes more complete.

### 3. Learning recommendations
Learning should key off:

- target skill gap
- systems already used
- technical capability level
- AI maturity
- proof already built

This prevents low-value mismatches like recommending the wrong category of course to the right user.

### 4. Proof asset builder
Proof asset choice should depend on:

- current role
- goal now
- proof already built
- stakeholder level
- AI maturity

That produces a much more useful “next artifact.”

## Data model proposal

### Add to `profile.clarifiers`

```json
{
  "goal_now": "stay_and_advance | hybrid_transition | active_pivot | not_sure",
  "timeline_urgency": "within_3_months | within_6_months | within_12_months | exploring_only",
  "years_experience_band": "0_2 | 3_5 | 6_10 | 11_plus",
  "location_preference": "netherlands | europe | united_states | global_remote | other",
  "ai_maturity": "never_use_it | occasionally | weekly | repeatable_workflows | team_level_adoption",
  "technical_capability": "no_code_only | advanced_spreadsheets | sql_bi | scripting_python | software_engineering",
  "salary_tolerance": "cannot_take_cut | up_to_10_percent | up_to_20_percent | flexible_for_right_move",
  "proof_state": "none | internal_project | dashboard_or_analysis | workflow_or_playbook | portfolio_or_case_study",
  "target_role": "string | null"
}
```

No schema migration is required if these continue to live inside `report_data.profile.clarifiers`.

## Rollout plan

### Phase 1: Highest ROI fields
Add now:

- goal now
- timeline urgency
- years of experience
- location preference
- AI maturity

Success criteria:

- fewer unrealistic titles
- fewer “why would I pivot now?” reactions
- better stay-and-advance satisfaction

### Phase 2: Capability and constraint fields
Add next:

- technical capability ladder
- salary tolerance
- proof already built

Success criteria:

- better pivot realism
- better course matching
- better proof asset relevance

### Phase 3: Goal targeting
Add next:

- target role
- optional domain specialization
- stakeholder level

Success criteria:

- better bridge-vs-leap guidance
- better narrative quality for users with a clear destination in mind

## Measurement plan

Track impact of the new intake fields on:

- report usefulness rating
- refresh usage
- proof asset completion
- manager conversation completion
- traction status
- recommendation override behavior
- refund / dissatisfaction signals if introduced later

Also track drop-off by intake step so we can prove the new questions are worth the friction.

## What not to do

- do not ask all 10+ new questions before the preview
- do not ask vague personality questions
- do not ask “Do you know AI?” as a yes/no
- do not ask coding skill as a binary
- do not ask work values early enough that they distort the task and market evidence

## Recommended immediate build order

1. Add `goal_now`, `timeline_urgency`, `years_experience_band`, and `location_preference` to the audit flow.
2. Add `ai_maturity` as part of quick clarifiers.
3. Update ranking logic to actually use these inputs before exposing them in more places.
4. Add `technical_capability`, `salary_tolerance`, and `proof_state` behind progressive disclosure.
5. Re-run QA on broad random roles after each phase and compare:
   - title realism
   - confidence state
   - stay-path quality
   - learning path quality

## Expected product effect

If implemented well, the product should become:

- more honest
- more constrained
- more personal
- less title-driven
- less likely to recommend flashy but impractical pivots
- stronger at deciding when the right answer is to stay, redesign, and gain leverage
