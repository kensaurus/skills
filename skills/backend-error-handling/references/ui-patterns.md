# Client-side error patterns

Full code for form error display, Next.js error boundaries, TanStack Query error handling, and the ErrorState component referenced from `SKILL.md`.

## Contents

- Form error display (React 19+)
- React error boundaries
- TanStack Query error handling
- Error state UI components

## Form error display (React 19+)

```tsx
// components/UserForm.tsx
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createUser } from '@/features/users/server/actions'

// Separate submit button to use useFormStatus
function SubmitButton() {
 const { pending } = useFormStatus()
 return (
 <button type="submit" disabled={pending}>
 {pending ? 'Creating...' : 'Create User'}
 </button>
 )
}

export function UserForm() {
 const [state, action, isPending] = useActionState(createUser, null)

 // Get field errors from validation
 const fieldErrors = state?.success === false
 ? state.error.details as Record<string, string[]>
 : {}

 return (
 <form action={action}>
 {/* Global error */}
 {state?.success === false && state.error.code !== 'VALIDATION_ERROR' && (
 <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
 {state.error.message}
 </div>
 )}

 {/* Field with error */}
 <div>
 <label htmlFor="email">Email</label>
 <input
 id="email"
 name="email"
 type="email"
 aria-invalid={!!fieldErrors.email}
 aria-describedby={fieldErrors.email ? 'email-error' : undefined}
 className={fieldErrors.email ? 'border-red-500' : ''}
 />
 {fieldErrors.email && (
 <p id="email-error" className="text-red-600 text-sm mt-1">
 {fieldErrors.email[0]}
 </p>
 )}
 </div>

 <SubmitButton />
 </form>
 )
}
```

**React 19 Form Patterns:**
- `useActionState` - Form state with Server Actions
- `useFormStatus` - Pending state in child components
- `useOptimistic` - Optimistic UI updates

## React error boundaries

```tsx
// app/error.tsx (Next.js page error boundary)
'use client'

import { useEffect } from 'react'

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 useEffect(() => {
 // Log to error reporting service
 console.error('Page error:', error)
 }, [error])

 return (
 <div className="flex flex-col items-center justify-center min-h-[400px]">
 <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
 <p className="text-muted-foreground mb-6">
 We're sorry, but something unexpected happened.
 </p>
 <button
 onClick={reset}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
 >
 Try again
 </button>
 </div>
 )
}

// app/global-error.tsx (root error boundary)
'use client'

export default function GlobalError({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 return (
 <html>
 <body>
 <h2>Something went wrong!</h2>
 <button onClick={reset}>Try again</button>
 </body>
 </html>
 )
}
```

## TanStack Query error handling

```tsx
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useProducts() {
 return useQuery({
 queryKey: ['products'],
 queryFn: async () => {
 const res = await fetch('/api/products')
 if (!res.ok) {
 const error = await res.json()
 throw new Error(error.error?.message || 'Failed to fetch products')
 }
 return res.json()
 },
 retry: (failureCount, error) => {
 // Don't retry on 4xx errors
 if (error.message.includes('401') || error.message.includes('403')) {
 return false
 }
 return failureCount < 3
 },
 })
}

export function useCreateProduct() {
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: async (data: ProductInput) => {
 const res = await fetch('/api/products', {
 method: 'POST',
 body: JSON.stringify(data),
 })
 if (!res.ok) {
 const error = await res.json()
 throw new Error(error.error?.message || 'Failed to create product')
 }
 return res.json()
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] })
 toast.success('Product created')
 },
 onError: (error) => {
 toast.error(error.message)
 },
 })
}
```

## Error state UI components

```tsx
// components/ErrorState.tsx
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
 title?: string
 message: string
 onRetry?: () => void
}

export function ErrorState({
 title = 'Error',
 message,
 onRetry
}: ErrorStateProps) {
 return (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
 <h3 className="font-semibold text-lg mb-2">{title}</h3>
 <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
 {onRetry && (
 <button
 onClick={onRetry}
 className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
 >
 <RefreshCw className="h-4 w-4" />
 Try again
 </button>
 )}
 </div>
 )
}

// Usage with TanStack Query
function ProductList() {
 const { data, error, isLoading, refetch } = useProducts()

 if (error) {
 return (
 <ErrorState
 title="Failed to load products"
 message={error.message}
 onRetry={() => refetch()}
 />
 )
 }

 // ...
}
```
