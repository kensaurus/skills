# Frontend fix patterns

The Phase 6 fix shapes to recommend (not apply) from `SKILL.md`: caching, optimistic updates, prefetching, error handling, Zod response validation.

## Contents

- Caching strategy
- Optimistic updates
- Prefetching
- Error handling
- Response validation (Zod)

## Caching strategy

```typescript
// Per-query staleTime based on data freshness needs
const { data } = useQuery({
 queryKey: ['user', userId],
 queryFn: () => getUser(userId),
 staleTime: 1000 * 60 * 10, // User data: 10 minutes
});

const { data: settings } = useQuery({
 queryKey: ['settings'],
 queryFn: getSettings,
 staleTime: Infinity, // Settings rarely change
});
```

## Optimistic updates

```typescript
const mutation = useMutation({
 mutationFn: updateUser,
 onMutate: async (newData) => {
 await queryClient.cancelQueries({ queryKey: ['user', userId] });
 const previous = queryClient.getQueryData(['user', userId]);
 queryClient.setQueryData(['user', userId], newData);
 return { previous };
 },
 onError: (_err, _newData, context) => {
 queryClient.setQueryData(['user', userId], context?.previous);
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: ['user', userId] });
 },
});
```

## Prefetching

```typescript
const prefetchUser = (userId: string) => {
 queryClient.prefetchQuery({
 queryKey: ['user', userId],
 queryFn: () => getUser(userId),
 });
};

// On hover or focus
<Link onMouseEnter={() => prefetchUser(userId)} to={`/users/${userId}`}>
 View User
</Link>
```

## Error handling

```typescript
const { data, error, isError, isLoading } = useQuery({
 queryKey: ['users'],
 queryFn: getUsers,
 retry: 3,
 retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

if (isLoading) return <Skeleton />;
if (isError) return <ErrorDisplay error={error} />;
if (!data?.length) return <EmptyState message="No users found" />;
```

## Response validation (Zod)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
 id: z.string().uuid(),
 email: z.string().email(),
 name: z.string(),
 createdAt: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>;

const getUser = async (id: string): Promise<User> => {
 const response = await api.get(`/api/users/${id}`);
 return UserSchema.parse(response.data);
};
```
