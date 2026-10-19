---
name: audit-code-quality
description: >
  Detect and fix repo-wide anti-patterns and consistency drift (naming,
  organisation, repeated smells). Use when "code smell", "anti-pattern",
  "technical debt", or "standardize the codebase". This PR/diff review →
  audit-code-review.
license: MIT
effort: high
---

# Code Quality Audit

**Degree of freedom: MIXED** — Parts 1–2 judgment `[HIGH freedom]`; convention
greps and Validation `[LOW freedom — run exactly]`.

> **Audit-and-fix exception.** Detect and then fix. Not present-then-stop.
>
> Fix the findings you reported, in the files you named; a repo-wide restyle
> or rename pass the report did not list is a different session. Edit
> surgically — the offending hook, key, or import — rather than rewriting
> whole files. Pre-existing bugs met on the way go in the report as
> follow-ups. Add or change tests only where the task asks or the repo
> already keeps them for that surface; one-off greps and scratch scripts stay
> out of the commit.

Repo-wide React/TypeScript anti-patterns plus naming, organisation, and
pattern consistency. A named PR/diff → `audit-code-review`.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-code-quality** (this) | Repo-wide anti-patterns and consistency drift, detected and fixed |
| `audit-code-review` | Review one PR or diff for correctness, security, maintainability |
| `workflow-refactor` | Scoped, behavior-preserving refactor with affected tests run |

## How to reason

1. **Observe** — quote the smell (`file:line`) and whether `git blame` / CONTRIBUTING marks it intentional
2. **Interpret** — bug/perf risk, or style-only drift?
3. **Classify** — anti-pattern / naming / organisation / pattern-split / intentional
4. **Severity** — runtime bug or data-fetch `useEffect` = High; naming-only = Low

## Worked example

> **Observe:** `components/PaymentForm.tsx` has `'use server'` and a
> `useEffect` that fetches invoices; four sortable lists use `key={i}`.
> **Interpret:** server action lives in UI; fetch refires on remount; reorder remounts rows.
> **Classify:** organisation + `useEffect`-for-data + index-as-key.
> **Severity:** High (actions-in-components); Medium (keys).
> **Finding:** `PaymentForm.tsx` | High | move action to `features/*/server/`;
> replace fetch effect with TanStack Query

## Before any change  [LOW freedom — run exactly]

```bash
cat CONTRIBUTING.md .cursor/rules/*.md 2>/dev/null | head -100 # existing conventions
git log --oneline -20 | grep -i "convention\|pattern\|style" # recent decisions
```

Verify the "inconsistency" isn't intentional. Check `git blame` before touching working code.

---

## Part 1 — Anti-patterns  [HIGH freedom]

### React

#### Props drilling → Context or composition
```tsx
// Bad: prop drilled through 5+ levels
<Layout user={user}><Sidebar user={user}><UserMenu user={user}><Avatar user={user} />

// Fix: context for global state
const UserContext = createContext<User | null>(null)
const useUser = () => useContext(UserContext)

// Fix: composition for UI concerns
<Layout><Layout.Sidebar><UserMenu /></Layout.Sidebar></Layout>
```

#### Derived state in `useState` → `useMemo`
```tsx
// Bad
const [items, setItems] = useState([])
const [filtered, setFiltered] = useState([])
useEffect(() => { setFiltered(items.filter(i => i.active)) }, [items])

// Fix
const filtered = useMemo(() => items.filter(i => i.active), [items])
```

#### `useEffect` for data fetching → Server Components or TanStack Query
```tsx
// Fix (Next.js 16 Server Component)
async function DataDisplay() {
 const data = await db.getData()
 return <div>{data.name}</div>
}

// Fix (client with TanStack Query)
const { data, isLoading } = useQuery({ queryKey: ['data'], queryFn: fetchData })
```

#### Object/array in dependency array → memoize or destructure
```tsx
// Bad: new object every render → infinite loop
useEffect(() => { doSomething(options) }, [options])

// Fix
const options = useMemo(() => ({ page, limit }), [page, limit])
useEffect(() => { doSomething(options) }, [options])
```

#### Index as key in dynamic lists → stable IDs
```tsx
// Bad
{items.map((item, i) => <Item key={i} />)}
// Fix
{items.map(item => <Item key={item.id} />)}
```

#### Giant component → composition
```tsx
// Split by responsibility
export function UserDashboard() {
 const user = useUser()
 return (
 <DashboardLayout>
 <UserHeader user={user} />
 <UserStats userId={user.id} />
 <RecentActivity userId={user.id} />
 </DashboardLayout>
 )
}
```

### TypeScript

```tsx
// Bad: any
function processData(data: any) { return data.items.map((i: any) => i.name) }

// Fix: proper types + Zod validation
const DataSchema = z.object({ items: z.array(z.object({ id: z.string(), name: z.string() })) })
function processData(data: z.infer<typeof DataSchema>) { return data.items.map(i => i.name) }

// Bad: enums (runtime object, not tree-shakeable)
enum Status { Pending = 'pending', Active = 'active' }
// Fix: union types
type Status = 'pending' | 'active'

// Fix: exhaustive switch
function handle(s: Status): string {
 switch (s) {
 case 'pending': return 'Waiting'
 case 'active': return 'Running'
 default:
 const _: never = s
 throw new Error(`Unknown: ${_}`)
 }
}
```

### State management

```tsx
// Rule of thumb:
// URL state (nuqs) → shareable, bookmarkable
// Global state (Zustand) → cross-component, persisted
// Local state (useState) → component-specific, ephemeral

// Stale closure fix
useEffect(() => {
 const id = setInterval(() => setCount(c => c + 1), 1000) // functional update
 return () => clearInterval(id)
}, [])
```

### Architecture

```
// Circular deps → extract shared code / dependency inversion
// Business logic in components → move to lib/feature/calculations.ts
// God files → feature-based organisation:
lib/
 date/format.ts
 currency/format.ts
 validation/schemas.ts
```

---

## Part 2 — Consistency audit  [HIGH freedom; greps LOW]

### Naming conventions

| Element | Expected | Check |
|---------|----------|-------|
| Components | PascalCase | `userCard` vs `UserCard` |
| Hooks | `use` prefix | `fetchData` vs `useFetchData` |
| Utils | camelCase | `format_date` vs `formatDate` |
| Constants | SCREAMING_SNAKE | `apiUrl` vs `API_URL` |
| Files | kebab-case | `UserCard.tsx` vs `user-card.tsx` |
| Boolean props | `is/has/should` | `loading` vs `isLoading` |

```bash
rg "export (function|const|class) [a-z]" --type tsx # lowercase component exports
rg "use[A-Z]" --type ts # hook patterns
rg "export default" --type tsx -l | head -20 # mixed default/named exports
```

### File organisation (feature-sliced)

```
src/
 features/{name}/
 components/ # UI only
 hooks/ # custom hooks
 server/ # server actions
 types.ts
 schemas.ts
 components/ui/ # shared primitives
 lib/ # global utilities
```

Red flags:
- Components in `/lib` or `/utils`
- Server actions in component files
- Types scattered across component files
- Zod schemas inline in components

```bash
rg "z\.object" --glob "*/components/*" # inline schemas
rg "'use server'" --glob "*/components/*" # actions in wrong place
rg "from '\.\." --type tsx | head -20 # relative imports instead of @/
```

### Pattern consistency

| Concern | Check |
|---------|-------|
| Server state | All TanStack Query, or mixed with useEffect? |
| Forms | All React Hook Form, or controlled inputs too? |
| Error handling | Consistent ActionResult shape? |
| Styling | cn() used everywhere? Dark mode via CSS vars? |
| Tests | `*.test.ts` vs `__tests__/`? Consistent mocking? |

---

## Coherency report template

```markdown
# Code Quality Audit

## Summary
- Verdict: [one line — what blocks, what is drift]
- Critical findings: X

## Anti-patterns found
| Pattern | Files | Severity |
|---------|-------|----------|
| useEffect for data | 3 files | High |
| Index as key | 2 files | Medium |

## Naming convention findings
| Element | Expected | Actual | Files |
|---------|----------|--------|-------|
| Components | PascalCase | Mixed | 4 |

## Organisation findings
- Server actions found in: components/PaymentForm.tsx
- Types scattered in: 6 component files

## Priority fixes
1. Move server actions to features/*/server/
2. Replace useEffect data fetching with TanStack Query
3. Standardise component naming to PascalCase

## Conventions to document
1. Decision on default vs named exports
2. Where Zod schemas live
```

---

## Anti-pattern detection checklist

### React checks
- [ ] No `useEffect` for derived state
- [ ] No index keys in dynamic lists
- [ ] No objects/arrays in dependency arrays
- [ ] Components under 300 lines
- [ ] No prop drilling beyond 2 levels

### TypeScript checks
- [ ] No `any` (use `unknown` + validation)
- [ ] No unsafe type assertions
- [ ] Exhaustive switch statements
- [ ] Zod schemas for all external data

### Architecture checks
- [ ] No circular dependencies
- [ ] Business logic separated from UI
- [ ] Files under 400 lines
- [ ] Clear module boundaries

## Self-critique before applying fixes  [LOW freedom — do not skip]

1. **Evidenced** — `file:line` or rg hit, not "the codebase feels messy"
2. **Reproducible** — the convention grep still finds it
3. **Severity justified** — High = bug/perf, not naming taste
4. **Right owner** — this PR/diff → `audit-code-review`
5. **No-false-safety** — `git blame` checked; working intentional code left alone

## Validation  [LOW freedom — run exactly]

1. Typecheck with the repo's own script (`package.json` → `typecheck`, else `tsc --noEmit`)
2. Lint with the repo's own script — not a generic `eslint src/`
3. Run the repo's test script and confirm no new failures
4. Document any enforced standard in `CONTRIBUTING.md` or `.cursor/rules/`
