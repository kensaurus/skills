# Spec Writing Reference


## Contents

- Why specs matter
- Spec template
- Goal
- Background & context
- Requirements
- Acceptance criteria
- Technical notes
- Out of scope
- Writing principles
- Example inputs/outputs
- Edge cases
- Spec sizes
- Red flags in specs

## Why specs matter

Vague prompts produce vague code. A good spec gives the agent:
- **What** to build (requirements, not solutions)
- **Why** it exists (constraints, context, trade-offs)
- **How to verify** it's correct (acceptance criteria)
- **What not to do** (explicit constraints)

One well-written spec is worth 10 follow-up corrections.

---

## Spec template

```markdown
## Goal
One sentence: what should exist after this is done that doesn't exist now?

## Background & context
- Why is this needed?
- What problem does it solve?
- Any prior art or existing code to build on?
- Constraints (time, performance, backwards compatibility)?

## Requirements

### Must have
- [ ] Requirement 1 (user-visible behaviour)
- [ ] Requirement 2

### Should have
- [ ] Nice-to-have 1

### Must NOT do
- Do not change X (existing users depend on it)
- Do not add a new DB table (use existing Y)

## Acceptance criteria
How will we know it's done?
- [ ] User can do X and sees Y
- [ ] Error case Z shows message W
- [ ] Performance: page loads in <200ms
- [ ] Tests pass, no console errors

## Technical notes
- Use existing `useAuth` hook for auth checks
- Matches pattern in `features/billing/`
- Schema change: add `status` column to `orders` table
- New Zod schema needed for form validation

## Out of scope
- Feature X (future iteration)
- Mobile optimisation (separate ticket)
```

---

## Writing principles

### Behaviour, not implementation
```markdown
# Good — describes observable behaviour
"When the user submits an invalid email, show an inline error below the field."

# Bad — prescribes implementation
"Add a useState for emailError and set it in the onChange handler."
```

### Explicit constraints
```markdown
# Be explicit about what NOT to do
- Must work without JavaScript (no client-only state)
- Must not break existing /api/users endpoint
- Must use existing Button from @/components/ui
```

### Include examples
```markdown
## Example inputs/outputs

Input: User uploads a 2MB JPEG
Expected: Image compressed to <500KB, stored in Supabase storage, URL returned

Input: User uploads a 10MB PDF
Expected: Error toast "File too large. Maximum 5MB."
```

### Define edge cases
```markdown
## Edge cases
- What if the user is not authenticated?
- What if the network request times out?
- What if two users submit simultaneously?
- What if the data is empty/null?
- What happens on mobile vs desktop?
```

---

## Spec sizes

### Micro (1-2 files, <1 hour)
Just a few bullets:
```
Add a "Copy link" button to the share modal.
- Uses navigator.clipboard.writeText()
- Shows "Copied!" toast for 2s on success
- Falls back to prompt() if clipboard API unavailable
```

### Standard (1 feature, 1 day)
Use the full template above.

### Large (multi-feature, multi-day)
Break into multiple micro/standard specs. Each should be independently implementable.

---

## Red flags in specs
- "Make it better" → Specify what "better" means
- "Add AI to it" → Specify what the AI should do and when
- "Like X app" → Describe the specific behaviour you want
- No acceptance criteria → Can't know when it's done
- Acceptance criteria that test implementation → Test behaviour instead
