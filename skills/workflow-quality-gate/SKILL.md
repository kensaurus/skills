---
name: workflow-quality-gate
description: >
  Pre-release quality gate across red-team, security, bundle size,
  performance, and unit tests. Use when "is this ready to ship?", "quality
  gate", or "pre-release checklist". Working tree to a PR →
  workflow-release-prep.
license: MIT
metadata:
  chain: "test-red-team audit-security audit-bundle-size audit-performance test-unit"
effort: high
---

# workflow-quality-gate — Pre-Release Go/No-Go

**Degree of freedom: MIXED.** Verdict and severity `[HIGH freedom]`; gate
order, Critical pause, and report table `[LOW freedom — run exactly]`.

Run before any production release. Each skill contributes a specific defect
class. The combined result is a single verdict.

## How to reason

1. **Observe** — what did each gate actually return?
2. **Interpret** — blocker vs recommended; plan-only fork vs apply-now
3. **Classify** — GO / GO WITH CONDITIONS / NO-GO
4. **Severity** — any Critical, or 2+ High without a named mitigation, is NO-GO

## Worked example

> **Observe:** red-team finds unauthenticated `/api/export` dump; bundle 180 KB; LCP 2.1s; tests green.
> **Interpret:** export is Critical (data leak); later gates cannot make this a GO.
> **Classify:** NO-GO — pause after Gate 1 and ask fix-now vs continue-and-report.
> **Severity:** Critical outranks a clean bundle; do not paper it as GO WITH CONDITIONS.

## Self-critique before reporting

- **Gates in order** — an earlier Critical paused the remaining sweep or was explicitly continued
- **Verdict matches rubric** — Critical ⇒ NO-GO; 2+ High without owner+deadline ⇒ not GO
- **Plan-only honored** — user said plan-only ⇒ `plan-security-audit`, not `audit-security` fixes
- **Right owner** — dirty tree to a PR → `workflow-release-prep`; silent-bypass of CI → `audit-gate-logic`

---

## Gate sequence  [LOW freedom — run exactly]

```
0. EXPLORE    → test-exploratory (optional live probe: guest vs logged-in wander + diff)
1. RED-TEAM   → test-red-team    (adversarial: UX + pipeline + security + perf)
2. SECURITY   → audit-security   (static code review: OWASP, auth, RLS, secrets)
3. BUNDLE     → audit-bundle-size (JS payload: lazy loading, tree-shaking, chunks)
4. PERFORMANCE→ audit-performance (Core Web Vitals, LCP, CLS, INP)
5. UNIT TESTS → test-unit        (coverage gaps, regression suite green?)
```

Gate 0 is optional and does **not** replace Gate 1. Use it when the user asked to
wander / monkey-test / compare guest vs logged-in first. Run gates in order —
earlier gates often surface issues that make later gates redundant or change
their scope.

**Plan-only fork:** if the user asked for a burndown and no code changes,
replace Gate 2 with `plan-security-audit` (and `plan-rls-audit` /
`plan-secrets-audit` when those are the symptom). `audit-security` may
fix inline; do not use it when the user said plan-only.

---

## Gate 1: Red team (read test-red-team)  [HIGH freedom]

> Read the `test-red-team` skill and follow it.

Output: coverage matrix + severity-ranked defect list.

**Blocker for gates 2–5:** if any Critical defect is found in Gate 1, pause
and ask the user whether to fix it now or continue with the remaining gates.
Critical defects must be resolved before the verdict can be GO.

---

## Gate 2: Security audit (read audit-security)  [HIGH freedom]

> Read the `audit-security` skill and follow it.

Focus on static code patterns missed by the live red team:
- Secrets hardcoded in source
- RLS policies absent or misconfigured
- Input validation missing on server-side handlers
- Auth guards missing on API routes

---

## Gate 3: Bundle size (read audit-bundle-size)  [HIGH freedom]

> Read the `audit-bundle-size` skill and follow it.

Threshold: first-load JS > 200 KB (gzip) is a Medium defect; > 400 KB is High.

---

## Gate 4: Performance (read audit-performance)  [HIGH freedom]

> Read the `audit-performance` skill and follow it.

Thresholds (Lighthouse mobile, simulated 4G):
- LCP > 4 s → High
- CLS > 0.25 → High  
- INP > 500 ms → Medium

---

## Gate 5: Unit tests (read test-unit)  [HIGH freedom]

> Read the `test-unit` skill and follow it.

Check: does the existing test suite pass? Are there obvious coverage gaps in
the code path that was changed for this release?

---

## Verdict format  [LOW freedom — run exactly]

```markdown
## Quality Gate Report — [App] — [Date]

### Verdict: GO / NO-GO / GO WITH CONDITIONS

### Blockers (must fix before release)
| # | Gate | Finding | Severity | File | Fix |
|---|------|---------|----------|------|-----|

### Recommended (fix soon, not blockers)
| # | Gate | Finding | Severity |
|---|------|---------|----------|

### Passed
- Gate 1 (Red team): [N] defects, [N] Critical, [N] High
- Gate 2 (Security): clean / [N issues]
- Gate 3 (Bundle): [X KB] first-load JS
- Gate 4 (Performance): LCP [X]s, CLS [X], INP [X]ms
- Gate 5 (Unit tests): [pass/fail], coverage [X%]
```

**GO** = no Critical or High blockers, all gates passed
**GO WITH CONDITIONS** = High defects present but agreed to fix post-release with a named owner + deadline
**NO-GO** = any Critical defect, or 2+ High defects without mitigation plan

This skill *runs* the sweep. Whether those gates can be silently bypassed or
gamed is `audit-gate-logic`. Taking the local working tree to a merge-ready
PR is `workflow-release-prep`.
