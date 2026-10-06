### Avoid Shared Mutable State

```typescript
// Bad — tests can interfere with each other
const users = [createUser()];

// Good — fresh data per test
let users: User[];
beforeEach(() => {
  users = [createUser()];
});
```

---

## Step 6: Database-Aware Tests (Supabase Integration)

If the project uses Supabase, verify test data matches the actual schema:

```json
supabase:execute_sql
{
  "query": "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '<TABLE_BEING_TESTED>' ORDER BY ordinal_position"
}
```

Use this to ensure:
- Test factories produce data matching actual column types
- Nullable fields are tested with both values and null
- Enum values in tests match actual database enums
- Foreign key relationships are correctly represented

---

## Output: Test Plan Report

After analyzing the codebase and production errors, produce:

```markdown
## Test Plan — [Project Name]

### Environment
- Framework: [detected]
- Coverage tool: [detected]
- Current coverage: [if available]

### Production Error Coverage Gaps
| Error | Source File | Test Exists | Priority |
|-------|-----------|-------------|----------|
| [TypeError: Cannot read...] | [src/utils/parse.ts] | No | HIGH |
| [NetworkError: timeout] | [src/api/client.ts] | Yes (missing edge case) | MEDIUM |

### Recommended Tests (Priority Order)

#### 1. [file path] — [why this file needs tests]
- Test: [description of test case]
- Test: [description of test case]

#### 2. [file path] — [why]
- Test: [description]

### Research Findings Applied
- [Pattern from research]: applied to [which tests]
- [Best practice]: [how it informed the test strategy]
```

---

## Quick Reference

```bash
# Run all tests
npm test                    # or: pnpm test, yarn test
python -m pytest            # Python
go test ./...               # Go

## Contents

- Step 6: Database-Aware Tests (Supabase Integration)
- Output: Test Plan Report
- Test Plan — [Project Name]
- Quick Reference
- Checklist
- Testing patterns by category


# Run specific file
npx vitest src/utils/formatDate.test.ts
npx jest --testPathPattern formatDate
python -m pytest tests/test_format.py

# Run with coverage
npx vitest --coverage
npx jest --coverage
python -m pytest --cov=src

# Watch mode
npx vitest --watch
npx jest --watch

# Run matching pattern
npx vitest -t "should format"
npx jest -t "should format"
python -m pytest -k "test_format"
```

---

## Checklist

- [ ] Test environment auto-detected (framework, config, patterns)
- [ ] Research completed (Context7 docs, Firecrawl best practices)
- [ ] Production errors checked (Sentry coverage gaps identified)
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Descriptive test names (`should [behavior] when [condition]`)
- [ ] Edge cases covered (null, empty, boundary, error)
- [ ] Mocks reset between tests (`beforeEach` cleanup)
- [ ] No test interdependency (each test runs in isolation)
- [ ] Tests are fast (mock external dependencies)
- [ ] Tests are deterministic (no random, no time-dependent without fakes)
- [ ] Test data uses factories (no hardcoded shared state)
- [ ] Coverage gaps from Sentry addressed

## Testing patterns by category

Generic templates for repos with no precedent. Prefer the shape the existing suite already uses.

### Pure Functions

```typescript
describe('formatCurrency', () => {
  it('should format positive amounts', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });
  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  it('should handle negative amounts', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
  it('should handle very large numbers', () => {
    expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
  });
});
```

### Async Functions

```typescript
describe('fetchUser', () => {
  it('should return user data for valid id', async () => {
    const user = await fetchUser('123');
    expect(user).toEqual({ id: '123', name: 'John Doe' });
  });
  it('should throw for non-existent user', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow('User not found');
  });
  it('should handle network timeout', async () => {
    vi.useFakeTimers();
    const promise = fetchUser('123');
    vi.advanceTimersByTime(30000);
    await expect(promise).rejects.toThrow('timeout');
    vi.useRealTimers();
  });
});
```

### Mocking

```typescript
// Vitest
import { vi } from 'vitest';
vi.mock('./emailService', () => ({
 sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Jest
jest.mock('./emailService');

// MSW (API mocking — preferred for HTTP)
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
 http.get('/api/users/:id', ({ params }) => {
 return HttpResponse.json({ id: params.id, name: 'Test User' });
 })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### React Components (Testing Library)

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
 it('should submit with valid credentials', async () => {
 const onSubmit = vi.fn();
 const user = userEvent.setup();
 render(<LoginForm onSubmit={onSubmit} />);
 await user.type(screen.getByLabelText(/email/i), 'test@example.com');
 await user.type(screen.getByLabelText(/password/i), 'password123');
 await user.click(screen.getByRole('button', { name: /sign in/i }));
 await waitFor(() => {
 expect(onSubmit).toHaveBeenCalledWith({
 email: 'test@example.com', password: 'password123',
 });
 });
 });

 it('should show validation error for invalid email', async () => {
 const user = userEvent.setup();
 render(<LoginForm onSubmit={vi.fn()} />);
 await user.type(screen.getByLabelText(/email/i), 'invalid');
 await user.click(screen.getByRole('button', { name: /sign in/i }));
 expect(screen.getByText(/valid email/i)).toBeInTheDocument();
 });

 it('should disable submit button while loading', () => {
 render(<LoginForm onSubmit={vi.fn()} isLoading />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
});
```

### Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCounter', () => {
  it('should start with initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
  it('should increment', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
  it('should not go below zero', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(0);
  });
});
```

### API Route Handlers (Next.js / Node)

```typescript
describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const req = new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com' }),
    });
    const response = await POST(req);
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data).toMatchObject({ name: 'Test', email: 'test@example.com' });
  });
  it('should return 422 for invalid email', async () => {
    const req = new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'invalid' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(422);
  });
});
```
