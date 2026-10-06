# TDD Patterns Reference


## Contents

- The RED → GREEN → REFACTOR cycle
- Test patterns by type
- Writing good tests
- Runner commands
- Coverage targets

## The RED → GREEN → REFACTOR cycle

### Phase RED — write a failing test first

```typescript
// RED: tests written from the input/output pairs; no implementation exists yet.

describe('calculateDiscount', () => {
  it('applies 10% for orders over £100', () => {
    expect(calculateDiscount(120, 'standard')).toBe(108)
  })
  it('returns full price for orders under £100', () => {
    expect(calculateDiscount(80, 'standard')).toBe(80)
  })
  it('applies 20% for premium customers', () => {
    expect(calculateDiscount(120, 'premium')).toBe(96)
  })
  it('throws for negative amounts', () => {
    expect(() => calculateDiscount(-10, 'standard')).toThrow()
  })
})
```

Run and confirm failure before writing implementation:
```bash
npx vitest run src/utils/discount.test.ts
# Expected: all tests fail (function doesn't exist yet)
```

### Phase GREEN — minimal code to pass

Write the minimal code that makes these tests pass without modifying the tests.

```bash
npx vitest run --watch src/utils/discount.test.ts
```

Commit when all tests pass with minimal implementation.

### Phase REFACTOR — clean with tests green

With tests as a safety net, refactor confidently:
- Extract repeated logic
- Improve naming
- Add types / docs
- Optimise hot paths

Run tests after every change. They must stay green.

---

## Test patterns by type

### Unit test (Vitest)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('UserService', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('creates user with hashed password', async () => {
    const mockDb = { user: { create: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com' }) } }
    const service = new UserService(mockDb as any)
    const result = await service.createUser({ email: 'a@b.com', password: 'plain' })
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'a@b.com' }) })
    )
    expect(result.id).toBe('1')
  })
})
```

### Server Action (with validation)
```typescript
it('rejects invalid email', async () => {
  const result = await createUserAction({ email: 'not-an-email', name: 'Test' })
  expect(result.success).toBe(false)
  expect(result.fieldErrors?.email).toBeDefined()
})
```

### React component (Testing Library)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

it('shows error on invalid submit', async () => {
  render(<LoginForm />)
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })
})
```

### API route
```typescript
it('returns 401 without auth', async () => {
  const req = new Request('http://localhost/api/users', { method: 'GET' })
  const res = await GET(req)
  expect(res.status).toBe(401)
})
```

---

## Writing good tests

### Name tests behaviourally
```typescript
// Good — observable behaviour
it('redirects to login when session expires')
it('shows toast on network error')
it('disables submit while loading')

// Bad — describes implementation
it('sets isLoading to true')
it('calls setError with message')
```

### Arrange-Act-Assert
```typescript
it('filters active users', () => {
  // Arrange
  const users = [
    { id: '1', active: true, name: 'Alice' },
    { id: '2', active: false, name: 'Bob' },
  ]
  // Act
  const result = filterActiveUsers(users)
  // Assert
  expect(result).toHaveLength(1)
  expect(result[0].name).toBe('Alice')
})
```

### Mock at boundaries only
```typescript
// Mock external dependencies (DB, APIs, third-party services)
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }))
vi.mock('resend', () => ({ Resend: vi.fn(() => ({ emails: { send: vi.fn() } })) }))

// Don't mock your own pure functions — test them directly
```

---

## Runner commands
```bash
npx vitest run                        # All tests once
npx vitest run --changed              # Only changed files
npx vitest run src/features/auth      # Specific folder
npx vitest --coverage                 # Coverage report
npx vitest watch                      # Watch mode
```

## Coverage targets
| Type | Target |
|------|--------|
| Statements | > 80% |
| Branches | > 75% |
| Functions | > 80% |
| Lines | > 80% |

Focus coverage on: business logic, server actions, validation, auth flows.
Test behaviour, not implementation details.
