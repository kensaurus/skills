# Real-time Reference Patterns

Longer, copy-ready implementations for `backend-realtime`. Examples assume a
**Next.js App Router + Supabase** stack (`@/lib/supabase/client`, `'use client'`,
a `Message` row type). Adapt import paths and types to the detected stack.

## Contents

- Subscribe to database changes (`useRealtimeMessages`)
- Presence (online users)
- Broadcast (custom events)
- TanStack Query + real-time
- Optimistic updates
- Server-Sent Events (SSE)
- Typing indicators

---

## Subscribe to Database Changes (`useRealtimeMessages`)

Initial fetch + INSERT/DELETE subscription for a chat room, with cleanup on
unmount.

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeMessages(roomId: string) {
 const [messages, setMessages] = useState<Message[]>([])
 const supabase = createClient()

 useEffect(() => {
 // Initial fetch
 const fetchMessages = async () => {
 const { data } = await supabase
 .from('messages')
 .select('*')
 .eq('room_id', roomId)
 .order('created_at', { ascending: true })

 if (data) setMessages(data)
 }
 fetchMessages()

 // Subscribe to changes
 const channel = supabase
 .channel(`room:${roomId}`)
 .on(
 'postgres_changes',
 {
 event: 'INSERT',
 schema: 'public',
 table: 'messages',
 filter: `room_id=eq.${roomId}`,
 },
 (payload) => {
 setMessages((prev) => [...prev, payload.new as Message])
 }
 )
 .on(
 'postgres_changes',
 {
 event: 'DELETE',
 schema: 'public',
 table: 'messages',
 filter: `room_id=eq.${roomId}`,
 },
 (payload) => {
 setMessages((prev) =>
 prev.filter((m) => m.id !== payload.old.id)
 )
 }
 )
 .subscribe()

 return () => {
 supabase.removeChannel(channel)
 }
 }, [roomId, supabase])

 return messages
}
```

## Presence (Online Users)

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePresenceState } from '@supabase/supabase-js'

interface UserPresence {
 id: string
 name: string
 avatar: string
 online_at: string
}

export function usePresence(roomId: string, currentUser: UserPresence) {
 const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
 const supabase = createClient()

 useEffect(() => {
 const channel = supabase.channel(`presence:${roomId}`)

 channel
 .on('presence', { event: 'sync' }, () => {
 const state = channel.presenceState<UserPresence>()
 const users = Object.values(state).flat()
 setOnlineUsers(users)
 })
 .on('presence', { event: 'join' }, ({ newPresences }) => {
 console.log('User joined:', newPresences)
 })
 .on('presence', { event: 'leave' }, ({ leftPresences }) => {
 console.log('User left:', leftPresences)
 })
 .subscribe(async (status) => {
 if (status === 'SUBSCRIBED') {
 await channel.track(currentUser)
 }
 })

 return () => {
 channel.untrack()
 supabase.removeChannel(channel)
 }
 }, [roomId, currentUser, supabase])

 return onlineUsers
}
```

## Broadcast (Custom Events)

```tsx
'use client'
import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBroadcast(channelName: string) {
 const supabase = createClient()
 const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

 useEffect(() => {
 channelRef.current = supabase.channel(channelName)

 channelRef.current
 .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
 // Handle cursor position updates from others
 console.log('Cursor moved:', payload)
 })
 .on('broadcast', { event: 'typing' }, ({ payload }) => {
 // Handle typing indicators
 console.log('User typing:', payload)
 })
 .subscribe()

 return () => {
 if (channelRef.current) {
 supabase.removeChannel(channelRef.current)
 }
 }
 }, [channelName, supabase])

 const broadcast = useCallback((event: string, payload: unknown) => {
 channelRef.current?.send({
 type: 'broadcast',
 event,
 payload,
 })
 }, [])

 return { broadcast }
}

// Usage: Collaborative cursors
function CollaborativeCanvas() {
 const { broadcast } = useBroadcast('canvas:123')

 const handleMouseMove = (e: React.MouseEvent) => {
 broadcast('cursor-move', {
 userId: currentUser.id,
 x: e.clientX,
 y: e.clientY,
 })
 }
}
```

## TanStack Query + Real-time

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useRealtimeQuery<T>(
 queryKey: string[],
 queryFn: () => Promise<T>,
 table: string,
 filter?: string
) {
 const queryClient = useQueryClient()
 const supabase = createClient()

 const query = useQuery({
 queryKey,
 queryFn,
 })

 useEffect(() => {
 const channel = supabase
 .channel(`${table}-changes`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table,
 filter,
 },
 () => {
 // Invalidate and refetch on any change
 queryClient.invalidateQueries({ queryKey })
 }
 )
 .subscribe()

 return () => {
 supabase.removeChannel(channel)
 }
 }, [table, filter, queryKey, queryClient, supabase])

 return query
}

// Usage
function ProductList() {
 const { data: products } = useRealtimeQuery(
 ['products'],
 () => fetchProducts(),
 'products'
 )
}
```

## Optimistic Updates

```tsx
'use client'
import { useOptimistic, useTransition } from 'react'
import { addMessage } from '@/app/actions'

function Chat({ initialMessages }: { initialMessages: Message[] }) {
 const [isPending, startTransition] = useTransition()
 const [optimisticMessages, addOptimisticMessage] = useOptimistic(
 initialMessages,
 (state, newMessage: Message) => [...state, newMessage]
 )

 async function handleSubmit(formData: FormData) {
 const content = formData.get('content') as string

 // Optimistic update - instant UI feedback
 const optimisticMessage: Message = {
 id: crypto.randomUUID(),
 content,
 created_at: new Date().toISOString(),
 user_id: currentUser.id,
 pending: true,
 }

 startTransition(async () => {
 addOptimisticMessage(optimisticMessage)
 await addMessage(content) // Server Action
 })
 }

 return (
 <div>
 {optimisticMessages.map((msg) => (
 <div key={msg.id} className={msg.pending ? 'opacity-50' : ''}>
 {msg.content}
 </div>
 ))}
 <form action={handleSubmit}>
 <input name="content" />
 <button type="submit" disabled={isPending}>Send</button>
 </form>
 </div>
 )
}
```

## Server-Sent Events (SSE)

```tsx
// app/api/events/route.ts
export async function GET(request: Request) {
 const encoder = new TextEncoder()

 const stream = new ReadableStream({
 async start(controller) {
 const send = (data: unknown) => {
 controller.enqueue(
 encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
 )
 }

 // Send initial data
 send({ type: 'connected', timestamp: Date.now() })

 // Subscribe to changes (e.g., from database)
 const interval = setInterval(() => {
 send({ type: 'heartbeat', timestamp: Date.now() })
 }, 30000)

 // Cleanup when the client disconnects
 request.signal.addEventListener('abort', () => {
 clearInterval(interval)
 controller.close()
 })
 },
 })

 return new Response(stream, {
 headers: {
 'Content-Type': 'text/event-stream',
 'Cache-Control': 'no-cache',
 'Connection': 'keep-alive',
 },
 })
}

// Client hook
function useSSE(url: string) {
 const [data, setData] = useState(null)

 useEffect(() => {
 const eventSource = new EventSource(url)

 eventSource.onmessage = (event) => {
 setData(JSON.parse(event.data))
 }

 eventSource.onerror = () => {
 eventSource.close()
 // Implement reconnection logic
 }

 return () => eventSource.close()
 }, [url])

 return data
}
```

## Typing Indicators

```tsx
function useTypingIndicator(channelName: string, userId: string) {
 const [typingUsers, setTypingUsers] = useState<string[]>([])
 const supabase = createClient()
 const timeoutRef = useRef<NodeJS.Timeout>()

 useEffect(() => {
 const channel = supabase.channel(channelName)

 channel
 .on('broadcast', { event: 'typing' }, ({ payload }) => {
 if (payload.userId !== userId) {
 setTypingUsers((prev) =>
 prev.includes(payload.userId) ? prev : [...prev, payload.userId]
 )

 // Remove after 3 seconds of no activity
 setTimeout(() => {
 setTypingUsers((prev) =>
 prev.filter((id) => id !== payload.userId)
 )
 }, 3000)
 }
 })
 .subscribe()

 return () => {
 supabase.removeChannel(channel)
 }
 }, [channelName, userId, supabase])

 const sendTyping = useCallback(() => {
 clearTimeout(timeoutRef.current)

 supabase.channel(channelName).send({
 type: 'broadcast',
 event: 'typing',
 payload: { userId },
 })
 }, [channelName, userId, supabase])

 return { typingUsers, sendTyping }
}
```
