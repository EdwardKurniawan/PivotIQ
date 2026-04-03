# Stay And Advance With AI

## Why this exists
PivotIQ has been strongest at answering two questions:

1. How exposed is my role to AI?
2. What should I pivot into next?

That leaves a major user need underserved:

3. If I want to stay in this career lane, how do I use AI to move up faster instead of getting flattened by it?

This feature adds a parallel strategy track to the paid report for users who do **not** want an exit-oriented answer.

## Product goal
Every full report should help the user evaluate two viable paths:

1. Pivot out or sideways into a stronger adjacent role.
2. Stay in the same field, redesign the role around AI, and use that redesign to gain promotion leverage.

The result should feel like a decision tool for ambition, not only a defense tool for fear.

## Core user promise
The report should answer:

- Which parts of my current work should I automate, augment, protect, or lead?
- How do I become more valuable inside the same field as AI adoption rises?
- What next-title path becomes more plausible if I use AI well?
- What should I do this week and this month to make that upward move visible?

## New report section
Add a first-class `stay_and_advance` section to the full report payload.

### Shape
```json
{
  "headline": "string",
  "recommendation": "string",
  "rationale": "string",
  "urgency_label": "string",
  "leverage_opportunities": [
    {
      "title": "string",
      "current_work": "string",
      "ai_shift": "string",
      "advantage_if_you_lead": "string"
    }
  ],
  "promotion_path": {
    "next_title": "string",
    "why_it_opens": "string",
    "timeline": "string",
    "signals_to_build": ["string"]
  },
  "work_redesign": {
    "automate": ["string"],
    "augment": ["string"],
    "protect": ["string"],
    "lead": ["string"]
  },
  "thirty_day_plan": {
    "this_week": ["string"],
    "this_month": ["string"],
    "metric_to_move": "string",
    "leadership_narrative": "string",
    "proof_asset": {
      "title": "string",
      "description": "string",
      "why_it_matters": "string"
    }
  }
}
```

## Content principles

### 1. It must reward ambition, not just caution
The section should feel like:

- how to become the person who leads AI adoption in your function
- how to convert AI usage into a promotion signal
- how to move toward a stronger scope profile

It should **not** feel like:

- generic “learn AI tools”
- vague “be adaptable”
- the same pivot advice restated with softer wording

### 2. It must stay grounded in the current role
This section is for users who do not want to leave yet.

That means it should start from:

- current task mix
- current strengths
- current visibility to leadership
- current pathways for promotion or scope expansion

### 3. It must explain how value shifts inside the same career lane
The user needs clarity on:

- what to delegate to AI
- what to keep as a human edge
- what to own as a team/system problem

The report should explicitly sort work into:

- `automate`
- `augment`
- `protect`
- `lead`

### 4. It must create visible career leverage
This is not just about working faster.

It should show how the user can become:

- the person who redesigns a workflow
- the person who standardizes AI quality
- the person who turns tool usage into team leverage
- the person who translates AI into leadership outcomes

### 5. It must produce one internal proof asset
The section should end with a practical proof asset that helps in:

- performance reviews
- promotion conversations
- scope expansion
- leadership visibility

Examples:

- a before/after workflow case
- an AI quality-review framework
- a team adoption pilot summary
- a metric-backed process improvement memo

## UX placement
Place the new section early in the paid report, directly after decision clarity / ROI.

Reason:

- users need to know both `leave` and `stay` options before they emotionally commit to the report’s direction
- this is a strategic layer, not a buried appendix

Recommended order:

1. Decision clarity
2. Career ROI
3. Stay and advance with AI
4. First 30 days for the pivot path
5. Interpretation / deeper strategy

## UX components

### Stay and Advance hero card
Show:

- headline
- recommendation
- rationale
- urgency badge

This is the high-level “yes, staying can still be a smart move” answer.

### AI leverage opportunities
Three cards showing:

- current work
- how AI changes the leverage
- what advantage the user gains if they lead the change

### Promotion path card
Show:

- likely stronger next title
- why it becomes plausible
- timeline
- signals to build

### Work redesign grid
Four buckets:

- automate
- augment
- protect
- lead

This should be visually simple and scannable.

### 30-day advancement plan
Show:

- this week
- this month
- metric to move
- leadership narrative
- proof asset

## Prompting guidance
The model should be told:

- not every user should be pushed toward leaving
- staying is valid when AI can be used to move the role upward
- the section must reflect promotion leverage, not just AI literacy
- the `next_title` should be more senior, more strategic, or more leverage-rich than the current role

## Fallback behavior
If model output is incomplete, fallback logic should still provide:

- a stay-and-advance recommendation
- three leverage opportunities
- one next-title path
- automate/augment/protect/lead buckets
- one 30-day proof plan

This keeps the section reliable even when model output is thin.

## Success criteria
The feature is working when users can say:

- “I don’t necessarily need to leave.”
- “I can see how AI helps me become more valuable in this field.”
- “I know what kind of internal win would make me promotable.”
- “This report is helping me grow, not just avoid risk.”

## Risks to avoid

### Too generic
If the section sounds like “learn AI” or “be more strategic,” it fails.

### Too repetitive
If it just repeats the pivot argument with different labels, it fails.

### Too tactical
If it focuses only on tools and misses promotion leverage, it fails.

### Too soft
If it avoids making a concrete recommendation about where internal leverage is moving, it fails.

## Implementation notes

- Added to report schema as `stay_and_advance`
- Included in model prompt for full report generation
- Fallback generated in `buildDemoReportData`
- Normalized in `normalizeReportData` and `hydrateModelReportData`
- Rendered as a dedicated paid-report section in `ReportExperience`
- Localized across supported languages
