# API design examples

Full schema-probe SQL, request/response bodies, query-parameter forms, alternatives for versioning and auth, bulk/search patterns, and the endpoint documentation template referenced from `SKILL.md`.

## Contents

- Pre-design schema probes (SQL)
- Request body
- Successful response
- List response (with pagination)
- Error response
- Query parameters: filtering, sorting, pagination, field selection
- Versioning: URL path (default) and header (alternative)
- Authentication: Bearer token (default) and API key (alternative)
- Bulk operations
- Search
- Actions (non-CRUD)
- Documentation template

## Pre-design schema probes (SQL)

```sql
-- Check table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'your_table';

-- Check enum values
SELECT enum_range(NULL::your_enum_name);

-- Check foreign keys
SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'your_table' AND tc.constraint_type = 'FOREIGN KEY';
```

## Request body

```json
{
 "name": "John Doe",
 "email": "john@example.com",
 "role": "admin"
}
```

## Successful response

```json
{
 "data": {
 "id": "123",
 "name": "John Doe",
 "email": "john@example.com",
 "createdAt": "2024-01-15T10:30:00Z"
 }
}
```

## List response (with pagination)

```json
{
 "data": [
 { "id": "1", "name": "John" },
 { "id": "2", "name": "Jane" }
 ],
 "meta": {
 "total": 100,
 "page": 1,
 "perPage": 20,
 "totalPages": 5
 }
}
```

## Error response

```json
{
 "error": {
 "code": "VALIDATION_ERROR",
 "message": "Invalid input data",
 "details": [
 { "field": "email", "message": "Invalid email format" },
 { "field": "name", "message": "Name is required" }
 ]
 }
}
```

## Query parameters

### Filtering

```
GET /users?role=admin
GET /users?role=admin&status=active
GET /orders?createdAfter=2024-01-01
```

### Sorting

```
GET /users?sort=name # Ascending
GET /users?sort=-createdAt # Descending (prefix with -)
GET /users?sort=role,-name # Multiple fields
```

### Pagination

```
GET /users?page=2&perPage=20
GET /users?offset=40&limit=20
GET /users?cursor=abc123 # Cursor-based
```

### Field selection

```
GET /users?fields=id,name,email
GET /users?include=orders,profile
```

## Versioning

### URL path (default)

```
GET /v1/users
GET /v2/users
```

### Alternatives: header

```
GET /users
Accept: application/vnd.api+json;version=2
```

## Authentication

### Bearer token (default)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Alternatives: API key

```
X-API-Key: your-api-key
# or
?apiKey=your-api-key
```

## Bulk operations

```
POST /users/bulk
{
 "create": [{ "name": "John" }, { "name": "Jane" }],
 "update": [{ "id": "1", "name": "Updated" }],
 "delete": ["2", "3"]
}
```

## Search

```
POST /users/search
{
 "query": "john",
 "filters": { "role": "admin" },
 "sort": { "field": "name", "order": "asc" }
}
```

## Actions (non-CRUD)

```
POST /orders/123/cancel
POST /users/123/verify-email
POST /payments/123/refund
```

## Documentation template

```markdown
## Create User

Create a new user account.

**Endpoint:** `POST /users`

**Authentication:** Required (Bearer token)

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| role | string | No | User role (default: "user") |

**Response:** `201 Created`
\`\`\`json
{
 "data": {
 "id": "123",
 "name": "John Doe",
 "email": "john@example.com",
 "role": "user",
 "createdAt": "2024-01-15T10:30:00Z"
 }
}
\`\`\`

**Errors:**
- `400` - Invalid request body
- `409` - Email already exists
- `422` - Validation failed
```
