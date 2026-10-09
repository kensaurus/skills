
## Contents

- Step 6: User Flow Analysis
- Step 7: Accessibility UX (Beyond WCAG Compliance)
- Step 8: HEART Metrics Assessment
- Output Template
- UX Audit Report

### 5b. Emotional Friction Map

Walk through each core flow and note where emotions shift:

| Moment | Expected Emotion | Actual Emotion | Cause |
|--------|-----------------|----------------|-------|
| Landing | Curiosity, hope | [observed] | [what the UI communicates] |
| First input | Confidence | [observed] | [guidance quality, field clarity] |
| Waiting (loading) | Patience | [observed] | [feedback quality during wait] |
| Error | Understanding | [observed] | [error message tone, recovery path] |
| Success | Satisfaction | [observed] | [celebration quality, next action clarity] |
| Return visit | Recognition | [observed] | [remembered state, personalization] |

### 5c. Trust Signal Audit

| Signal | Present? | Quality |
|--------|----------|---------|
| Consistent branding | [y/n] | [logo, colors, voice consistent across pages] |
| Professional microcopy | [y/n] | [no typos, no placeholder text, no dev jargon] |
| Data safety indicators | [y/n] | [HTTPS badge, privacy note near sensitive inputs] |
| Social proof | [y/n] | [testimonials, user count, recognizable clients] |
| Error grace | [y/n] | [errors don't blame the user, offer help] |
| Completion feedback | [y/n] | [user knows their action succeeded and what's next] |

### 5d. Delight and Surprise Moments

Products that feel human have moments of unexpected care:

| Pattern | Example | Present? |
|---------|---------|----------|
| Contextual encouragement | "Almost there!" on step 3/4 | [y/n] |
| Smart defaults | Pre-filling from context (timezone, currency, name) | [y/n] |
| Celebrating milestones | First invoice sent, 100th customer added | [y/n] |
| Recovering gracefully | "We saved your draft" after accidental navigation | [y/n] |
| Personality in empty states | Friendly illustration + helpful copy, not just "No data" | [y/n] |
| Predictive help | Suggesting next action based on user behavior | [y/n] |

---

## Step 6: User Flow Analysis

### 6a. Core Flow Walkthrough

For each core task identified in Step 0, walk through in the browser:

```
1. Start point → Where does the user begin?
2. Steps → How many clicks/interactions to complete?
3. Friction points → Where do users get stuck or confused?
4. Success → How does the user know they succeeded?
5. Error recovery → What happens when something goes wrong?
```

### 6b. Flow Quality Criteria

| Criteria | Excellent | Poor |
|----------|-----------|------|
| Task completion | 1-3 steps for common tasks | 5+ steps, multiple page loads |
| Orientation | User always knows where they are and what's next | Lost in multi-step flow |
| Data persistence | Form data survives navigation, refresh | Data lost on back button or refresh |
| Error recovery | Inline errors, field-level, preserves input | Page-level error, form cleared |
| Success confirmation | Clear confirmation with next suggested action | No feedback, dumped to homepage |

### 6c. Edge Case Flows

Test these scenarios in browser:

- **Empty state:** First-time user with no data
- **Error state:** Network failure, validation failure, 404
- **Loading state:** Slow network, large data set
- **Boundary values:** Very long text, special characters, max items
- **Interrupted flow:** Navigate away mid-form, back button, refresh

---

## Step 7: Accessibility UX (Beyond WCAG Compliance)

This step evaluates the *experience* of accessibility, not just technical compliance.

| Aspect | What to Evaluate |
|--------|-----------------|
| Keyboard flow | Tab order follows visual flow, logical focus movement |
| Screen reader experience | Announcements make sense without visual context |
| Focus management | Focus moves to new content (modals, toasts), returns after dismissal |
| Skip navigation | Skip-to-content link for keyboard users |
| Error announcement | Errors announced to screen readers via `aria-live` or focus |
| Touch targets | ≥44px on mobile, sufficient spacing between targets |
| Motion sensitivity | Animations respect `prefers-reduced-motion` |

**Verify via browser:**

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=ux-audit open --headed "<app-url>/<page>"   # once; later pages: goto
$PW -s=ux-audit snapshot            # check tab order
$PW -s=ux-audit press Tab           # step through interactive elements
$PW -s=ux-audit snapshot            # verify focus indicator visible
```

---

## Step 8: HEART Metrics Assessment

Rate each dimension qualitatively based on audit findings.

| Dimension | What It Measures | Audit Proxy |
|-----------|-----------------|-------------|
| **Happiness** | User satisfaction, trust, confidence | Tone of microcopy, error handling grace, visual polish |
| **Engagement** | Depth of interaction, feature discovery | Progressive disclosure, clear navigation, feature visibility |
| **Adoption** | New user onboarding success | Onboarding flow quality, empty states, first-run guidance |
| **Retention** | Reasons users would return | Task completion satisfaction, notification value, habit loops |
| **Task Success** | Core task completion rate and efficiency | Steps to complete, error recovery, flow friction |

---

## Output Template

```markdown
## UX Audit Report

**Date:** [date]
**Product:** [name]
**Type:** [SaaS / e-commerce / dashboard / etc.]
**Pages Audited:** [count]
**Core Flows Tested:** [count]
**Issues Found:** [count]

---

### Nielsen's 10 Heuristics Assessment

| # | Heuristic | Score (1-5) | Key Finding |
|---|-----------|-------------|-------------|
| 1 | System status visibility | [1-5] | [finding] |
| 2 | Real world match | [1-5] | [finding] |
| 3 | User control and freedom | [1-5] | [finding] |
| 4 | Consistency and standards | [1-5] | [finding] |
| 5 | Error prevention | [1-5] | [finding] |
| 6 | Recognition over recall | [1-5] | [finding] |
| 7 | Flexibility and efficiency | [1-5] | [finding] |
| 8 | Aesthetic and minimal design | [1-5] | [finding] |
| 9 | Error recovery | [1-5] | [finding] |
| 10 | Help and documentation | [1-5] | [finding] |

**Overall Heuristic Score:** [average]/5

---

### Laws of UX Findings

| Law | Status | Evidence |
|-----|--------|----------|
| Jakob's Law | [pass/warn/fail] | [finding] |
| Fitts's Law | [pass/warn/fail] | [finding] |
| Hick's Law | [pass/warn/fail] | [finding] |
| Miller's Law | [pass/warn/fail] | [finding] |
| Cognitive Load | [pass/warn/fail] | [finding] |
| Aesthetic-Usability | [pass/warn/fail] | [finding] |
| Peak-End Rule | [pass/warn/fail] | [finding] |

---

### Content & Microcopy Quality (Intuit Principles)

| Aspect | Score (1-5) | Issues |
|--------|-------------|--------|
| Voice consistency | [1-5] | [details] |
| Clarity and precision | [1-5] | [details] |
| Error message quality | [1-5] | [details] |
| Empty state helpfulness | [1-5] | [details] |
| Button/CTA clarity | [1-5] | [details] |
| i18n readiness | [1-5] | [details] |

---

### Emotional Design Assessment

| Aspect | Score (1-5) | Evidence |
|--------|-------------|----------|
| First impression (5-sec test) | [1-5] | [clarity, trust, personality] |
| Emotional friction points | [count] | [where anxiety/confusion spikes] |
| Trust signals | [1-5] | [branding, microcopy quality, data safety] |
| Delight moments | [count] | [smart defaults, celebrations, recovery grace] |
| Human feel vs template feel | [1-5] | [specific tells] |

---

### User Flow Analysis

| Flow | Steps | Friction Points | Error Recovery | Score |
|------|-------|-----------------|----------------|-------|
| [Core task 1] | [N] | [description] | [pass/fail] | [1-5] |
| [Core task 2] | [N] | [description] | [pass/fail] | [1-5] |
| [Core task 3] | [N] | [description] | [pass/fail] | [1-5] |

---

### Accessibility UX

| Aspect | Status | Issues |
|--------|--------|--------|
| Keyboard navigation | [pass/warn/fail] | [details] |
| Focus management | [pass/warn/fail] | [details] |
| Screen reader experience | [pass/warn/fail] | [details] |
| Touch targets | [pass/warn/fail] | [details] |
| Motion sensitivity | [pass/warn/fail] | [details] |

---

### HEART Assessment

| Dimension | Rating (1-5) | Evidence |
|-----------|-------------|----------|
| Happiness | [1-5] | [what drives or harms user satisfaction] |
| Engagement | [1-5] | [feature discovery, interaction depth] |
| Adoption | [1-5] | [onboarding quality, first-run experience] |
| Retention | [1-5] | [reasons to return or churn signals] |
| Task Success | [1-5] | [completion efficiency, error recovery] |

---

### Critical Issues (Must Fix)

#### 1. [Flow/Page] — [Issue]
- **Heuristic violated:** [H# — name]
- **Problem:** [description]
- **User impact:** [what the user experiences]
- **Fix:** [specific recommendation]

---

### Research Findings Applied
- [NN/g pattern]: [how it applies to this product]
- [Intuit principle]: [gap identified]
- [Law of UX]: [violation found]

---

### Next Steps (Priority Order)

1. [ ] Fix critical usability blockers: [list]
2. [ ] Improve error messages and empty states: [list]
3. [ ] Enhance onboarding flow: [details]
4. [ ] Add keyboard shortcuts / accelerators: [list]
5. [ ] Content audit — rewrite microcopy: [pages]
```
