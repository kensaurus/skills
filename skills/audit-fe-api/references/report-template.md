# Audit report template

The full output template for the Frontend API Audit Report produced by `SKILL.md`.

```markdown
## Frontend API Audit Report

**Audited:** [date]
**Framework:** [detected framework]
**API client:** [detected client]
**State management:** [detected library]

---

### Production Error Summary (Sentry)

| Endpoint | Error | Frequency | Has Error Handling |
|----------|-------|-----------|-------------------|
| [endpoint] | [error type] | [events/week] | [YES/NO] |

---

### Critical Issues (Must Fix)

#### 1. [Endpoint/File] — [Issue Type]
- **Current:** `[current implementation]`
- **Problem:** [description]
- **Fix:** `[correct implementation]`

---

### Warnings (Should Fix)

#### 1. [Issue description]
- **File:** `[file path]`
- **Impact:** [what could go wrong]
- **Recommendation:** [how to fix]

---

### Optimization Opportunities

#### 1. Caching
- **Missing staleTime:** [list endpoints]
- **Recommendation:** [suggested values per data type]

#### 2. Prefetching
- **Candidates:** [navigation links that could prefetch]

#### 3. Batching
- **N+1 patterns found:** [list]
- **Backend batch endpoint exists:** [YES/NO]

---

### API Inventory

| Endpoint | Method | Frontend File | Backend Route | Status | Notes |
|----------|--------|---------------|---------------|--------|-------|
| `/api/users` | GET | `user-service.ts` | `app/api/users/route.ts` | VALID | — |
| `/api/reports` | GET | `report-hook.ts` | NOT FOUND | MISSING | Remove or implement |

---

### Type Safety Status

| Service | Typed Response | Zod Validation | Notes |
|---------|---------------|----------------|-------|
| `user-service.ts` | YES | NO | Add runtime validation |
| `auth-service.ts` | Partial | NO | Missing error response types |

---

### Research Findings Applied
- [Pattern]: [how it applies]
- [Best practice]: [gap identified]

---

### Next Steps

1. [ ] Fix critical: [list]
2. [ ] Add missing parameters: [list]
3. [ ] Configure caching: [list with suggested staleTime values]
4. [ ] Add error handling: [files]
5. [ ] Add Zod validation: [services]
```
