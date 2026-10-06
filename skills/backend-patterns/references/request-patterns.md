# Request-path patterns

Full Server Action, tRPC router, Supabase Edge Function, and rate-limit code referenced from `SKILL.md`.

## Contents

- Server Actions: basic pattern
- Server Actions: with background tasks
- tRPC router definition
- Supabase Edge Function
- Rate limiting

## Server Actions: basic pattern

```tsx
// app/actions/users.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const CreateUserSchema = z.object({
 email: z.string().email(),
 name: z.string().min(1).max(100),
})

type ActionResult<T> =
 | { success: true; data: T }
 | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createUser(
 prevState: ActionResult<User> | null,
 formData: FormData
): Promise<ActionResult<User>> {
 // 1. Auth check
 const session = await auth()
 if (!session?.user) {
 return { success: false, error: 'Unauthorized' }
 }

 // 2. Validate input
 const result = CreateUserSchema.safeParse({
 email: formData.get('email'),
 name: formData.get('name'),
 })

 if (!result.success) {
 return {
 success: false,
 error: 'Invalid input',
 fieldErrors: result.error.flatten().fieldErrors,
 }
 }

 // 3. Execute
 try {
 const user = await db.user.create({
 data: result.data,
 })

 revalidatePath('/users')
 return { success: true, data: user }
 } catch (error) {
 if (isPrismaError(error, 'P2002')) {
 return { success: false, error: 'Email already exists' }
 }
 console.error('createUser error:', error)
 return { success: false, error: 'Failed to create user' }
 }
}
```

## Server Actions: with background tasks

```tsx
'use server'

import { after } from 'next/server'

export async function createOrder(formData: FormData) {
 const order = await db.order.create({ data: { ... } })

 // Run after response sent (Next.js 16)
 after(async () => {
 await sendOrderConfirmation(order.id)
 await updateInventory(order.items)
 await notifyWarehouse(order.id)
 })

 revalidatePath('/orders')
 return { success: true, data: order }
}
```

## tRPC router definition

```tsx
// server/api/routers/users.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
 getById: publicProcedure
 .input(z.object({ id: z.string() }))
 .query(async ({ ctx, input }) => {
 return ctx.db.user.findUnique({
 where: { id: input.id },
 })
 }),

 create: protectedProcedure
 .input(z.object({
 email: z.string().email(),
 name: z.string().min(1),
 }))
 .mutation(async ({ ctx, input }) => {
 return ctx.db.user.create({
 data: {
 ...input,
 createdById: ctx.session.user.id,
 },
 })
 }),

 list: protectedProcedure
 .input(z.object({
 limit: z.number().min(1).max(100).default(10),
 cursor: z.string().optional(),
 }))
 .query(async ({ ctx, input }) => {
 const items = await ctx.db.user.findMany({
 take: input.limit + 1,
 cursor: input.cursor ? { id: input.cursor } : undefined,
 orderBy: { createdAt: 'desc' },
 })

 let nextCursor: string | undefined
 if (items.length > input.limit) {
 const nextItem = items.pop()
 nextCursor = nextItem?.id
 }

 return { items, nextCursor }
 }),
})
```

## Supabase Edge Function

```tsx
// supabase/functions/process-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
 // Handle CORS preflight
 if (req.method === 'OPTIONS') {
 return new Response('ok', { headers: corsHeaders })
 }

 try {
 // Verify webhook signature
 const signature = req.headers.get('x-webhook-signature')
 if (!verifySignature(signature, await req.text())) {
 return new Response('Invalid signature', { status: 401 })
 }

 const payload = await req.json()

 // Create admin client (bypasses RLS)
 const supabase = createClient(
 Deno.env.get('SUPABASE_URL')!,
 Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 )

 // Process webhook
 await supabase.from('events').insert({
 type: payload.type,
 data: payload.data,
 })

 return new Response(
 JSON.stringify({ success: true }),
 { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
 )
 } catch (error) {
 console.error('Webhook error:', error)
 return new Response(
 JSON.stringify({ error: 'Internal error' }),
 { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
 )
 }
})
```

## Rate limiting

```tsx
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
 redis: Redis.fromEnv(),
 limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
 analytics: true,
})

export async function rateLimitedAction(userId: string) {
 const { success, limit, remaining, reset } = await ratelimit.limit(userId)

 if (!success) {
 return {
 success: false,
 error: 'Too many requests',
 retryAfter: Math.ceil((reset - Date.now()) / 1000),
 }
 }

 // Proceed with action...
}
```
