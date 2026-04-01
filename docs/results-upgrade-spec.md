# Results Upgrade Spec

## Goal
Turn the report from a smart diagnosis into a decision tool that answers three questions fast:

1. What should I do now?
2. Is this move worth it?
3. What should I do in the next 30 days to change my outcome?

## New Value Layer

### 1. Decision Clarity
- Output a clear verdict:
  - `stay-and-redesign`
  - `hybrid-transition`
  - `active-pivot`
- Include:
  - headline
  - urgency framing
  - rationale
  - confidence label
  - confidence reason

Why:
Users do not just want options. They want a recommendation they can act on.

### 2. Career ROI
- Show:
  - salary upside
  - transition time
  - estimated learning cost
  - rough payback period
  - plain-language ROI read

Why:
This makes the result feel like a career investment decision, not generic advice.

### 3. First 30 Days
- Break into:
  - next 7 days
  - next 30 days
  - what to avoid
  - one proof asset to ship

Why:
The report becomes immediately useful when it converts direction into visible proof.

## Product Principles
- Bias toward employability, not content consumption.
- Bias toward proof assets, not vague upskilling.
- Make the best-fit pivot feel like a recommendation, not just a ranked option.
- Keep the report emotionally supportive, but commercially sharp.

## Implementation Notes
- The generation prompt should request the new fields explicitly.
- The local report-normalization layer should derive fallback values so the UI is stable even when model output is partial.
- The new decision layer should appear near the top of the full report, before deeper analysis sections.
