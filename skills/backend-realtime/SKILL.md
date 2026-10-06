---
name: backend-realtime
description: >
  Implement real-time features with WebSockets, Supabase Realtime, or
  Server-Sent Events. Use when "real-time", "live updates", "WebSocket",
  "notifications", "chat", "presence", "collaborative", "live data", or
  "instant sync".
license: MIT
---

# Real-time Features Skill

**Degree of freedom: MIXED.** Which transport and event `[HIGH freedom]`;
existing-subscription probes and unmount cleanup `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — existing channels, sockets, hooks, cleanup
2. **Interpret** — new subscription vs reuse vs transport mismatch
3. **Classify** — postgres-changes / presence / broadcast / SSE / optimistic
4. **Severity** — leaked or duplicate subscription outranks a missing typing indicator

## Worked example

> **Observe:** chat mounts `useRealtimeMessages` twice; no untrack on leave; `package.json` already has `@supabase/supabase-js`.
> **Interpret:** duplicate INSERT listeners; leftover presence.
> **Classify:** one channel hook with unmount cleanup; reuse Supabase Realtime — do not add Socket.io.
> **Verify:** one `postgres_changes` subscription; `removeChannel` on unmount; no second socket lib.

## Self-critique before reporting

- **Existing first** — grepped channels/sockets before adding a library
- **Cleanup** — every subscribe has unmount `removeChannel` / `close`
- **One listener** — no duplicate subscription for the same event
- **Right owner** — FE↔BE payload mismatch → `debug-fe-be-integration`; queue/job instead of live push → `backend-patterns`

Implement live, collaborative features using WebSockets, Supabase Realtime, and Server-Sent Events.

> Code examples assume a **Next.js App Router + Supabase** stack
> (`@/lib/supabase/client`, `'use client'`). Adapt import paths and row types to
> the detected stack.

## Check existing first  [LOW freedom — run exactly]

**Before implementing ANY real-time feature, verify:**

1. **Check for existing real-time setup:**
```bash
cat package.json | grep -i "socket\|realtime\|pusher\|ably"
rg "supabase.*channel|useSubscription|WebSocket" --type ts --type tsx
```

2. **Check for existing patterns:**
```bash
rg "on\('INSERT'\|on\('UPDATE'\|subscribe\(" --type ts
ls -la src/hooks/use*Realtime* src/lib/realtime* 2>/dev/null
```

3. **Check Supabase config:**
```bash
rg "createClient|supabaseUrl" --type ts -l
grep -oh "SUPABASE_[A-Z_]*" .env* 2>/dev/null | sort -u   # names only — never print values
```

**Why:** Real-time connections are stateful. Don't create duplicate subscriptions.

## Supabase Realtime  [HIGH freedom]

### Subscribe to Database Changes

The canonical `useRealtimeMessages` hook (initial fetch + INSERT/DELETE
subscription with unmount cleanup) is in
[`references/patterns.md`](references/patterns.md).

```tsx
useEffect(() => {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [roomId, supabase])
```

### Presence (Online Users)

- One channel per room (`presence:${roomId}`); `channel.track(currentUser)` only after `status === 'SUBSCRIBED'`.
- Read the roster from `presenceState()` on the `sync` event; `join`/`leave` are for side effects only.
- Cleanup is `channel.untrack()` then `supabase.removeChannel(channel)`.

Full `usePresence` hook: [references/patterns.md](references/patterns.md) §Presence.

### Broadcast (Custom Events)

- Hold the channel in a `useRef`; register `.on('broadcast', { event })` handlers once, then `.subscribe()`.
- Send with `channel.send({ type: 'broadcast', event, payload })`; broadcast is ephemeral, never a source of truth.
- Use for cursors and typing; use `postgres_changes` for anything that must persist.

Full `useBroadcast` hook and collaborative-cursor usage: [references/patterns.md](references/patterns.md) §Broadcast.

## TanStack Query + Real-time  [HIGH freedom]

- Keep `useQuery` as the data source; the realtime channel only calls `queryClient.invalidateQueries({ queryKey })`.
- Subscribe to `postgres_changes` with `event: '*'` on the table (optional `filter`); remove the channel on unmount.
- One hook, `useRealtimeQuery(queryKey, queryFn, table, filter?)`, so every list gets the same behaviour.

Full `useRealtimeQuery` hook: [references/patterns.md](references/patterns.md) §TanStack Query + Real-time.

## Optimistic Updates  [HIGH freedom]

- `useOptimistic(initial, reducer)` plus `useTransition`; add the optimistic row with `pending: true` and a `crypto.randomUUID()` id, then await the Server Action.
- Render pending rows at reduced opacity; the realtime INSERT or the action result replaces them.
- Disable the submit button while `isPending`.

```tsx
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  initialMessages, (state, msg: Message) => [...state, msg]
)
startTransition(async () => {
  addOptimisticMessage({ id: crypto.randomUUID(), content, pending: true, /* ... */ })
  await addMessage(content) // Server Action
})
```

Full `Chat` component: [references/patterns.md](references/patterns.md) §Optimistic Updates.

## Server-Sent Events (SSE)  [HIGH freedom]

- Route handler returns a `ReadableStream`; write `data: ${JSON.stringify(x)}\n\n` frames with `TextEncoder`.
- Headers: `text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`; heartbeat every 30 s.
- Clean up on `request.signal` `abort` (clear timers, `controller.close()`).
- Client: `new EventSource(url)`; close in the effect cleanup and on `onerror`, then reconnect with backoff.
- Pick SSE for one-way server push without Supabase; pick Realtime when the data already lives in Postgres.

Full route handler and `useSSE` hook: [references/patterns.md](references/patterns.md) §Server-Sent Events.

## Typing Indicators  [HIGH freedom]

- Broadcast `{ event: 'typing', payload: { userId } }` on keystroke; ignore your own id on receipt.
- Add the sender to `typingUsers` and drop them after 3 s of silence; debounce sends with a `timeoutRef`.

Full `useTypingIndicator` hook: [references/patterns.md](references/patterns.md) §Typing Indicators.

## Validation  [LOW freedom — do not skip]

After implementing real-time features:

1. **Connection handling** → Reconnects on disconnect, shows status
2. **Error handling** → Graceful degradation when real-time unavailable
3. **Memory leaks** → All subscriptions cleaned up on unmount
4. **Duplicate subscriptions** → No multiple listeners for same event
5. **Optimistic updates** → UI feels instant, handles conflicts
6. **Mobile** → Works on spotty connections, battery efficient
