---
name: design-api
description: >
  Design REST and GraphQL APIs: naming, versioning, error shapes, auth. Use
  when "design an API", "create endpoints", "structure my API responses",
  "plan API architecture", "REST vs GraphQL", or "API contract".
license: MIT
effort: high
---

# API Design Skill

**Degree of freedom: MIXED.** Resource model, error shape, and REST vs
GraphQL `[HIGH freedom]`; pre-design docs/schema/grep
`[LOW freedom — run exactly]`.

Design clean, consistent, and developer-friendly APIs.

## How to reason

1. **Survey** — existing docs, schema, and similar endpoints
2. **Model** — resources, relations, REST vs GraphQL
3. **Contract** — paths, statuses, error shape, auth, pagination
4. **Check** — naming matches this repo; no duplicate endpoint

## Worked example

> **Survey:** `orders` has `user_id`; no `GET /users/:id/orders`; clients use `useQuery`.
> **Model:** order is a nested user resource, not a `/getUserOrders` RPC.
> **Contract:** `GET /users/:id/orders` → `{ data, meta }`; shared `{ error: { code, message, details } }`.
> **Check:** plural kebab-case; list paginated; 401/404/422 only from the status table.

## Self-critique before reporting

- **Pre-design stated** — docs, schema, and similar endpoints were checked out loud
- **One error shape** — every failure uses `{ error: { code, message, details } }`
- **Lists paginate** — no unbounded `GET /resources`
- **Right owner** — live 4xx/5xx repro → `debug-fe-be-integration`; product scope still fuzzy → `design-prd`

## Pre-design checks  [LOW freedom — run exactly]

**Before designing any API:**

### 1. Check Existing API Documentation
- The running backend's docs route (`/api-docs`, `/docs`, `/swagger`, `/openapi.json`)
- The repo's API README or naming-conventions doc (grep `naming` under `docs/` and `src/api/`)

### 2. Verify Database Schema
Use Supabase MCP to understand existing data structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'your_table';
```

Also check enum values (`enum_range`) and foreign keys (`information_schema.table_constraints`):
[references/examples.md](references/examples.md) §Pre-design schema probes.

### 3. Check for Existing Endpoints
Use `Grep` to search for similar endpoints already implemented:
```
Grep: "router.get|router.post" to find existing route patterns
Grep: "useQuery|useMutation" to find existing frontend integrations
```

### 4. Verification Statement (REQUIRED)
Before designing, state:
```
"Pre-design check:
- Existing API docs reviewed: [YES/NO]
- Database schema verified: [tables/enums checked]
- Similar endpoints found: [list or none]
- Naming conventions confirmed: [YES/NO]"
```

---

## REST API Design  [HIGH freedom]

### URL Structure

```
GET /resources # List
GET /resources/:id # Get one
POST /resources # Create
PUT /resources/:id # Replace
PATCH /resources/:id # Update
DELETE /resources/:id # Delete
```

### Naming Conventions

| Do | Don't |
|----|-------|
| `/users` | `/getUsers`, `/user-list` |
| `/users/:id` | `/user/:id`, `/users/get/:id` |
| `/users/:id/orders` | `/getUserOrders` |
| Plural nouns | Verbs, singular |
| kebab-case | camelCase, snake_case |

### Examples

```
GET /users # List users
GET /users/123 # Get user 123
GET /users/123/orders # User's orders
GET /users/123/orders/456 # Specific order
POST /users/123/orders # Create order for user
```

---

## Request/Response Format  [LOW freedom — run this shape]

- **Request body** — flat JSON, camelCase keys, no envelope.
- **Success** — `{ "data": { ... } }` for one resource; `{ "data": [...], "meta": { total, page, perPage, totalPages } }` for lists.
- **Error** — one shape everywhere: `{ "error": { "code", "message", "details" } }`; `code` is machine-readable, `details` is a per-field list.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

Request, single, and list bodies in full: [references/examples.md](references/examples.md) §Request body through §List response.

---

## HTTP Status Codes  [LOW freedom — use this table]

### Success (2xx)

| Code | When to Use |
|------|-------------|
| `200 OK` | GET, PUT, PATCH success |
| `201 Created` | POST created new resource |
| `204 No Content` | DELETE success, no body |

### Client Errors (4xx)

| Code | When to Use |
|------|-------------|
| `400 Bad Request` | Invalid request body |
| `401 Unauthorized` | Not authenticated |
| `403 Forbidden` | Authenticated but not allowed |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Resource conflict (duplicate) |
| `422 Unprocessable` | Validation failed |
| `429 Too Many` | Rate limited |

### Server Errors (5xx)

| Code | When to Use |
|------|-------------|
| `500 Internal Error` | Unexpected server error |
| `502 Bad Gateway` | Upstream service failed |
| `503 Unavailable` | Service temporarily down |

---

## Query Parameters

- **Filtering** — `?role=admin&status=active`, date bounds as `?createdAfter=2024-01-01`.
- **Sorting** — `?sort=name`; `-` prefix for descending; comma-separated for multiple (`?sort=role,-name`).
- **Pagination** — `?page=2&perPage=20` by default; `?cursor=abc123` for large or live lists; never an unbounded list.
- **Field selection** — `?fields=id,name,email`; relations via `?include=orders,profile`.

Example URLs for each: [references/examples.md](references/examples.md) §Query parameters.

---

## Versioning

Default: URL path (`GET /v1/users`, `GET /v2/users`). Header versioning
(`Accept: application/vnd.api+json;version=2`) is the alternative:
[references/examples.md](references/examples.md) §Versioning.

---

## Authentication

Default: `Authorization: Bearer <token>`. API key via `X-API-Key` header (or `?apiKey=`) is the
alternative for server-to-server callers: [references/examples.md](references/examples.md) §Authentication.

---

## Common Patterns

- **Bulk operations** — `POST /users/bulk` with `{ create: [...], update: [...], delete: [ids] }`.
- **Search** — `POST /users/search` with `{ query, filters, sort }` when the criteria outgrow query strings.
- **Actions (non-CRUD)** — a verb sub-resource under the noun: `POST /orders/123/cancel`, `POST /users/123/verify-email`, `POST /payments/123/refund`.

Bodies for bulk and search: [references/examples.md](references/examples.md) §Bulk operations, §Search.

---

## API Design Checklist  [LOW freedom — do not skip]

### Consistency
- [ ] Consistent naming conventions
- [ ] Consistent response format
- [ ] Consistent error format
- [ ] Consistent pagination

### Usability
- [ ] Intuitive URLs
- [ ] Clear documentation
- [ ] Meaningful error messages
- [ ] Sensible defaults

### Security
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validation
- [ ] Rate limiting

### Performance
- [ ] Pagination for lists
- [ ] Field selection available
- [ ] Efficient queries
- [ ] Caching headers

---

## Documentation Template

Per endpoint: title, one-line purpose, `**Endpoint:**`, `**Authentication:**`, request-body
table (field, type, required, description), response status with a JSON example, and the error
list. Full template: [references/examples.md](references/examples.md) §Documentation template.
