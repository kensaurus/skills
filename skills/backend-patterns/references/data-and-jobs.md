# Data, caching and background-job patterns

Full SQL, Prisma, cache, and job code referenced from `SKILL.md`, plus the Trigger.dev alternative to Inngest.

## Contents

- Optimistic locking
- Soft deletes
- Audit logging
- Next.js cache
- Redis caching
- Background jobs: Inngest
- Alternatives: Trigger.dev

## Optimistic locking

```sql
-- Add version column
ALTER TABLE orders ADD COLUMN version INT DEFAULT 1;

-- Update with version check
UPDATE orders
SET
 status = 'shipped',
 version = version + 1
WHERE id = $1 AND version = $2;
-- Returns 0 rows if version mismatch (concurrent update)
```

## Soft deletes

```prisma
model Post {
 id String @id @default(cuid())
 title String
 deletedAt DateTime?

 @@index([deletedAt])
}

// Query active records
const posts = await db.post.findMany({
 where: { deletedAt: null }
})

// Soft delete
await db.post.update({
 where: { id },
 data: { deletedAt: new Date() }
})
```

## Audit logging

```sql
-- Audit table
CREATE TABLE audit_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 table_name TEXT NOT NULL,
 record_id UUID NOT NULL,
 action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
 old_data JSONB,
 new_data JSONB,
 user_id UUID REFERENCES auth.users(id),
 created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
 VALUES (
 TG_TABLE_NAME,
 COALESCE(NEW.id, OLD.id),
 TG_OP,
 CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
 CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
 auth.uid()
 );
 RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to table
CREATE TRIGGER orders_audit
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## Next.js cache

```tsx
// Cached fetch
const data = await fetch('https://api.example.com/data', {
 next: {
 revalidate: 3600, // 1 hour
 tags: ['data']
 }
})

// Revalidate on demand
import { revalidateTag } from 'next/cache'
revalidateTag('data')

// unstable_cache for database queries
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
 async (id: string) => db.user.findUnique({ where: { id } }),
 ['user'],
 { revalidate: 3600, tags: ['users'] }
)
```

## Redis caching

```tsx
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

async function getCachedData<T>(
 key: string,
 fetcher: () => Promise<T>,
 ttl = 3600
): Promise<T> {
 // Try cache
 const cached = await redis.get<T>(key)
 if (cached) return cached

 // Fetch and cache
 const data = await fetcher()
 await redis.set(key, data, { ex: ttl })
 return data
}

// Usage
const user = await getCachedData(
 `user:${id}`,
 () => db.user.findUnique({ where: { id } }),
 600 // 10 minutes
)
```

## Background jobs: Inngest

```tsx
// inngest/functions.ts
import { inngest } from './client'

export const processOrder = inngest.createFunction(
 { id: 'process-order' },
 { event: 'order/created' },
 async ({ event, step }) => {
 // Step 1: Validate inventory
 const inventory = await step.run('check-inventory', async () => {
 return await checkInventory(event.data.items)
 })

 if (!inventory.available) {
 await step.run('notify-out-of-stock', async () => {
 await notifyCustomer(event.data.userId, 'out-of-stock')
 })
 return { status: 'cancelled' }
 }

 // Step 2: Charge payment
 const payment = await step.run('charge-payment', async () => {
 return await chargeCustomer(event.data.paymentMethod)
 })

 // Step 3: Send confirmation
 await step.run('send-confirmation', async () => {
 await sendOrderConfirmation(event.data.orderId)
 })

 return { status: 'completed', paymentId: payment.id }
 }
)

// Trigger from server action
await inngest.send({
 name: 'order/created',
 data: { orderId, userId, items, paymentMethod }
})
```

## Alternatives: Trigger.dev

```tsx
// trigger/sync.ts
import { schedules } from '@trigger.dev/sdk'

export const syncJob = schedules.task({
 id: 'sync-data',
 cron: '0 * * * *', // every hour (UTC)
 run: async () => {
 const data = await fetchExternalAPI()
 await db.externalData.upsert({
 where: { externalId: data.id },
 create: data,
 update: data,
 })
 return { synced: data.length }
 },
})
```
