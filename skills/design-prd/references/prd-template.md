# PRD template

The full ten-section PRD skeleton that SKILL.md §Step 4 fills in. Copy it to `tasks/prd-[feature-name].md` and replace every bracketed placeholder.

## Contents

- Template (sections 1–10: Overview, Goals, User Stories, Functional Requirements, Non-Goals, Technical Feasibility, Competitive Analysis, UI/UX Considerations, Data Model, Open Questions)

## Template

````markdown
# PRD: [Feature Name]

> **Status:** Draft
> **Created:** [Date]
> **Author:** [User] + AI co-author

---

## 1. Overview

[2-3 sentences: what this does and why it matters]

### Problem Statement
[Pain point or opportunity being addressed]

### Proposed Solution
[High-level description]

---

## 2. Goals

| Goal | Success Metric |
|------|----------------|
| [Goal 1] | [Measurable outcome] |
| [Goal 2] | [Measurable outcome] |

---

## 3. User Stories

### Primary Stories
1. As a [user], I want to [action] so that [benefit]
2. As a [user], I want to [action] so that [benefit]

### Edge Case Stories
3. As a [user], when [unusual condition], I expect [graceful behavior]

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] FR-1: [Requirement]
- [ ] FR-2: [Requirement]

### Should Have (P1)
- [ ] FR-3: [Requirement]

### Nice to Have (P2)
- [ ] FR-4: [Requirement]

---

## 5. Non-Goals (Out of Scope)

- [Thing NOT doing and why]
- [Another thing NOT doing and why]

---

## 6. Technical Feasibility

### Existing Infrastructure
- **Framework:** [detected — supports feature because...]
- **Database:** [existing tables that support this: ...]
- **Auth:** [current auth supports required permissions: YES/NO]

### New Infrastructure Needed
- **Database changes:** [new tables, columns, or migrations]
- **API endpoints:** [new routes needed]
- **New dependencies:** [libraries to add, if any]

### Complexity Assessment
| Component | Complexity | Estimate | Notes |
|-----------|-----------|----------|-------|
| Frontend UI | [Low/Med/High] | [days] | [notes] |
| API layer | [Low/Med/High] | [days] | [notes] |
| Database | [Low/Med/High] | [days] | [notes] |
| Auth/permissions | [Low/Med/High] | [days] | [notes] |

---

## 7. Competitive Analysis

### How Others Solve This
[Summary from Firecrawl research]

| Product | Approach | Strength | Weakness |
|---------|----------|----------|----------|
| [Competitor A] | [how they do it] | [what works] | [what doesn't] |
| [Competitor B] | [how they do it] | [what works] | [what doesn't] |

### Our Differentiation
[What we will do differently and why]

---

## 8. UI/UX Considerations

### Key Screens
1. [Screen name] — [purpose]
2. [Screen name] — [purpose]

### UX Patterns Borrowed
- [Pattern from research] — adapted for [our context]

### Accessibility Requirements
- Keyboard navigable
- Screen reader compatible
- Color contrast WCAG AA

---

## 9. Data Model

### Existing Tables Used
| Table | Columns Used | Purpose |
|-------|-------------|---------|
| [table] | [columns] | [why needed] |

### New Tables / Changes
```sql
-- New table or ALTER TABLE
CREATE TABLE IF NOT EXISTS [table_name] (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 [columns...],
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
```

### RLS Policies Needed
- [Policy description]

---

## 10. Open Questions

- [ ] Q1: [Unresolved question]
- [ ] Q2: [Unresolved question]
````
