# Server-side error patterns

Full code for the layer diagram, shared error types, Server Action handler, and API route handler referenced from `SKILL.md`.

## Contents

- Error handling layers
- Standard error types
- Server Action error handling
- API route error handling

## Error handling layers

```
┌─────────────────────────────────────────┐
│ UI Layer │
│ - Error boundaries │
│ - Form validation errors │
│ - Toast notifications │
├─────────────────────────────────────────┤
│ Application Layer │
│ - Server Action errors │
│ - API route errors │
│ - Business logic errors │
├─────────────────────────────────────────┤
│ Data Layer │
│ - Database errors │
│ - Validation errors (Zod) │
│ - External API errors │
└─────────────────────────────────────────┘
```

## Standard error types

```typescript
// types/errors.ts

// Base error shape
interface AppError {
 code: string // Machine-readable: VALIDATION_ERROR
 message: string // User-friendly message
 details?: unknown // Additional context
}

// Action result pattern
type ActionResult<T> =
 | { success: true; data: T }
 | { success: false; error: AppError }

// Common error codes
const ErrorCode = {
 VALIDATION_ERROR: 'VALIDATION_ERROR',
 NOT_FOUND: 'NOT_FOUND',
 UNAUTHORIZED: 'UNAUTHORIZED',
 FORBIDDEN: 'FORBIDDEN',
 CONFLICT: 'CONFLICT',
 RATE_LIMITED: 'RATE_LIMITED',
 INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
```

## Server Action error handling

```typescript
// features/users/server/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const CreateUserSchema = z.object({
 email: z.string().email('Invalid email address'),
 name: z.string().min(1, 'Name is required'),
})

export async function createUser(
 prevState: ActionResult<User>,
 formData: FormData
): Promise<ActionResult<User>> {
 try {
 // 1. Validate input
 const validated = CreateUserSchema.safeParse({
 email: formData.get('email'),
 name: formData.get('name'),
 })

 if (!validated.success) {
 return {
 success: false,
 error: {
 code: 'VALIDATION_ERROR',
 message: 'Invalid input',
 details: validated.error.flatten().fieldErrors,
 },
 }
 }

 // 2. Check authorization
 const session = await auth()
 if (!session) {
 return {
 success: false,
 error: {
 code: 'UNAUTHORIZED',
 message: 'Please sign in to continue',
 },
 }
 }

 // 3. Execute business logic
 const user = await db.user.create({
 data: validated.data,
 })

 revalidatePath('/users')

 return { success: true, data: user }

 } catch (error) {
 // 4. Handle known errors
 if (error instanceof Prisma.PrismaClientKnownRequestError) {
 if (error.code === 'P2002') {
 return {
 success: false,
 error: {
 code: 'CONFLICT',
 message: 'A user with this email already exists',
 },
 }
 }
 }

 // 5. Log unknown errors, return generic message
 console.error('createUser error:', error)

 return {
 success: false,
 error: {
 code: 'INTERNAL_ERROR',
 message: 'Something went wrong. Please try again.',
 },
 }
 }
}
```

## API route error handling

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
 try {
 const body = await request.json()

 const validated = ProductSchema.safeParse(body)
 if (!validated.success) {
 return NextResponse.json(
 {
 error: {
 code: 'VALIDATION_ERROR',
 message: 'Invalid request body',
 details: validated.error.flatten().fieldErrors,
 },
 },
 { status: 400 }
 )
 }

 const product = await db.product.create({ data: validated.data })

 return NextResponse.json({ data: product }, { status: 201 })

 } catch (error) {
 if (error instanceof SyntaxError) {
 return NextResponse.json(
 { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
 { status: 400 }
 )
 }

 console.error('POST /api/products error:', error)

 return NextResponse.json(
 { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
 { status: 500 }
 )
 }
}
```
