# Documentation templates

Copy-and-fill templates for SKILL.md §README Template, §Documentation Types, and §Writing Guidelines › Structure Information. Inner fences are escaped (`\`\`\``) so the template renders as one block; unescape them when you paste.

## Contents

- README Template
- API Documentation
- Code Comments
- Architecture Documentation
- Structured setup steps

## README Template

```markdown
# Project Name

> One plain-English sentence: what it does and who it's for — no jargon.

**Why it exists** — the problem it solves, in one line.
**Who it's for** — the audience + stack, so a wrong-fit reader leaves early.

<!--
Newcomer on-ramp: if the project is novel or uses 3+ domain-specific terms,
add a plain-language glossary here (see "Newcomer on-ramp" pattern below) so the
features and options that follow aren't cryptic. Omit it when the domain is common.
-->

## Features

- Feature 1
- Feature 2
- Feature 3

## Quick Start

\`\`\`bash
# Install
npm install

# Run
npm start
\`\`\`

## Installation

### Prerequisites

- Node.js >= 18
- npm or pnpm

### Setup

\`\`\`bash
# Clone repository
git clone https://github.com/user/project.git
cd project

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
\`\`\`

## Usage

### Basic Example

\`\`\`typescript
import { Widget } from 'project';

const widget = new Widget({ option: 'value' });
widget.render();
\`\`\`

### Advanced Configuration

See [Configuration Guide](./docs/configuration.md)

## API Reference

See [API Documentation](./docs/api.md)

## Contributing

See [Contributing Guide](./CONTRIBUTING.md)

## License

MIT
```

## API Documentation

```markdown
## createUser

Create a new user account.

### Signature

\`\`\`typescript
function createUser(params: CreateUserParams): Promise<User>
\`\`\`

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | User's display name |
| email | string | Yes | Valid email address |
| role | 'admin' \| 'user' | No | User role (default: 'user') |

### Returns

`Promise<User>` - The created user object

### Example

\`\`\`typescript
const user = await createUser({
 name: 'John Doe',
 email: 'john@example.com',
 role: 'admin'
});
\`\`\`

### Errors

| Error | Cause |
|-------|-------|
| `ValidationError` | Invalid email format |
| `ConflictError` | Email already exists |
```

## Code Comments

```typescript
/**
 * Calculate the total price including tax and discounts.
 *
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @param discount - Optional discount code
 * @returns Total price in cents
 *
 * @example
 * const total = calculateTotal(items, 0.1, 'SAVE10');
 */
function calculateTotal(
 items: CartItem[],
 taxRate: number,
 discount?: string
): number {
 // Sum up item prices
 const subtotal = items.reduce((sum, item) => sum + item.price, 0);

 // Apply discount if valid
 const discountAmount = discount ? getDiscountAmount(discount, subtotal) : 0;

 // Calculate tax on discounted amount
 const taxableAmount = subtotal - discountAmount;
 const tax = Math.round(taxableAmount * taxRate);

 return taxableAmount + tax;
}
```

## Architecture Documentation

```markdown
# Architecture Overview

## System Components

\`\`\`
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Client │────▶│ API │────▶│ Database │
│ (React) │ │ (Node) │ │ (Postgres) │
└─────────────┘ └─────────────┘ └─────────────┘
 │
 ▼
 ┌─────────────┐
 │ Cache │
 │ (Redis) │
 └─────────────┘
\`\`\`

## Data Flow

1. Client sends request to API
2. API checks cache for data
3. If cache miss, query database
4. Store result in cache
5. Return response to client

## Key Decisions

### Why PostgreSQL?
- ACID compliance for financial data
- JSON support for flexible schemas
- Strong ecosystem

### Why Redis?
- Fast read performance
- Session storage
- Pub/sub for real-time features
```

## Structured setup steps

```markdown
# ❌ Wall of text
To install the package you need to run npm install, then create
a .env file with your configuration, then run the migrations...

# ✅ Structured steps
## Setup

1. Install dependencies
 \`\`\`bash
 npm install
 \`\`\`

2. Configure environment
 \`\`\`bash
 cp .env.example .env
 \`\`\`

3. Run migrations
 \`\`\`bash
 npm run migrate
 \`\`\`
```
