---
name: backend-error-handling
description: >
  Implement error-handling patterns: boundaries, toasts, one API error shape.
  Use when "error boundary", "error toast", or "standardize API errors".
  Plan-only audit → plan-error-handling. Sentry triage → debug-sentry-monitor.
license: MIT
---

# Error Handling Skill

**Degree of freedom: MIXED.** Which layer and message `[HIGH freedom]`;
existing-type/boundary probes `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — existing error types, boundaries, `ActionResult` / `ApiError`
2. **Interpret** — missing layer vs inconsistent shape vs swallowed catch
3. **Classify** — reuse-existing / extend-codes / add-boundary / toast-only
4. **Severity** — unhandled 500 on a mutation outranks a missing toast

## Worked example

> **Observe:** `createUser` throws Prisma `P2002`; UI shows a blank catch; `ActionResult` already lives in `types/errors.ts`.
> **Interpret:** known conflict is unmapped; no field/toast path.
> **Classify:** reuse `ActionResult` + `CONFLICT`; toast the message; do not add a second error type.
> **Verify:** duplicate email returns `{ success: false, error: { code: 'CONFLICT' } }`; form alert shown.

## Self-critique before reporting

- **Reuse shape** — searched `ActionResult` / `ApiError` / `error.tsx` before adding a type
- **User-safe** — `INTERNAL_ERROR` is generic; PII is not in the client message
- **Layered** — boundary + action result + toast, not toast-only
- **Right owner** — plan-only observability audit → `plan-error-handling`; live Sentry triage → `debug-sentry-monitor`

Layered error handling for full-stack apps: one action-result shape, boundaries, and toasts.

## When to Use

- Adding error handling to new features
- Improving error user experience
- Standardizing error responses
- Debugging error propagation
- Adding error monitoring

## Check existing first  [LOW freedom — run exactly]

**Before adding ANY error handling, verify:**

1. **Check for existing error types:**
```bash
rg "type.*Error|interface.*Error" --type ts
rg "ActionResult|ApiError" --type ts
```

2. **Check for existing error boundaries:**
```bash
ls -la app/error.tsx app/global-error.tsx
rg "ErrorBoundary" --type tsx
```

3. **Check for existing error utilities:**
```bash
rg "formatError|handleError|reportError" --type ts
ls -la src/lib/errors* src/lib/error* 2>/dev/null # @/lib/errors
```

4. **Check established error response patterns:**
```bash
rg "success: false|error:" src/features/*/server/ --type ts | head -10
```

**Why:** Inconsistent error handling confuses users and complicates debugging. Always follow established patterns.

## Error Handling Layers  [HIGH freedom]

- **UI layer** — error boundaries, form validation errors, toast notifications.
- **Application layer** — Server Action errors, API route errors, business-logic errors.
- **Data layer** — database errors, Zod validation errors, external API errors.
- Every error is caught at the lowest layer that can name it and surfaces upward as `ActionResult` or a typed API error, never as a raw throw to the UI.

Layer diagram: [references/server-patterns.md](references/server-patterns.md) §Error handling layers.

## Standard Error Types  [HIGH freedom]

- One `AppError { code, message, details? }`; `code` is machine-readable, `message` is user-safe.
- `ActionResult<T>` is a discriminated union on `success`; never return `{ data, error }` both-optional.
- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

```typescript
// types/errors.ts
interface AppError { code: string; message: string; details?: unknown }
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }
```

Full `ErrorCode` constant: [references/server-patterns.md](references/server-patterns.md) §Standard error types.

## Server Action Error Handling  [HIGH freedom]

1. `safeParse` the `FormData`; return `VALIDATION_ERROR` with `flatten().fieldErrors` as `details`.
2. Check the session; return `UNAUTHORIZED` with a "please sign in" message.
3. Run the mutation, `revalidatePath`, return `{ success: true, data }`.
4. Map known errors (Prisma `P2002` → `CONFLICT` with a specific message).
5. Log unknown errors server-side; return a generic `INTERNAL_ERROR` message, never the stack.

```typescript
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return { success: false, error: { code: 'CONFLICT', message: 'A user with this email already exists' } }
  }
  console.error('createUser error:', error)
  return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } }
}
```

Full `createUser` action: [references/server-patterns.md](references/server-patterns.md) §Server Action error handling.

## Form Error Display (React 19+)  [HIGH freedom]

- `useActionState(createUser, null)` for state; `useFormStatus` in a child `SubmitButton` for pending.
- Field errors come from `state.error.details`; render inline with `aria-invalid` and `aria-describedby`.
- Non-validation errors render once in a `role="alert"` banner above the fields.
- `useOptimistic` for optimistic UI updates.

Full `UserForm` component: [references/ui-patterns.md](references/ui-patterns.md) §Form error display.

## React Error Boundaries  [HIGH freedom]

- `app/error.tsx` per page segment: `'use client'`, receives `{ error, reset }`, logs in `useEffect`, shows a "Try again" button.
- `app/global-error.tsx` for the root: must render its own `<html>` and `<body>`.
- Boundaries catch render errors only; async and event errors go through `ActionResult` or TanStack Query.

```tsx
// app/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Page error:', error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <button onClick={reset} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Try again</button>
    </div>
  )
}
```

Both boundaries in full: [references/ui-patterns.md](references/ui-patterns.md) §React error boundaries.

## API Route Error Handling  [HIGH freedom]

- Same `{ error: { code, message, details? } }` body shape for every non-2xx response.
- `400` for `VALIDATION_ERROR` and `INVALID_JSON` (`SyntaxError` from `request.json()`), `201` on create, `500` generic.
- Log the route name with the error; never return stack traces.

Full `POST /api/products` handler: [references/server-patterns.md](references/server-patterns.md) §API route error handling.

## TanStack Query Error Handling  [HIGH freedom]

- In `queryFn`/`mutationFn`, throw `new Error(body.error?.message ?? fallback)` when `!res.ok` so the UI gets the server message.
- `retry`: no retry on 401/403; up to 3 attempts otherwise.
- Mutations: `onSuccess` invalidates the query key and `toast.success`; `onError` → `toast.error(error.message)`.

`useProducts` and `useCreateProduct` hooks: [references/ui-patterns.md](references/ui-patterns.md) §TanStack Query error handling.

## Error State UI Components  [HIGH freedom]

- One reusable `ErrorState({ title, message, onRetry? })`: icon, heading, message, optional retry button.
- Use it for query errors (`error` + `refetch`) instead of ad-hoc red text per list.

```tsx
const { data, error, isLoading, refetch } = useProducts()
if (error) return <ErrorState title="Failed to load products" message={error.message} onRetry={() => refetch()} />
```

Full `ErrorState` component: [references/ui-patterns.md](references/ui-patterns.md) §Error state UI components.

## Further reading

- [Error Logging & Monitoring and the full checklist](references/details.md)
- [Server-side error patterns](references/server-patterns.md)
- [Client-side error patterns](references/ui-patterns.md)
