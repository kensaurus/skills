# Recharts chart patterns

Full Recharts components referenced from `SKILL.md`: line, bar, area, donut, sparkline, stat card, and real-time chart.

## Contents

- Line chart with custom tooltip
- Bar chart
- Area chart with gradient
- Pie/Donut chart
- Sparklines (mini charts)
- Stat cards with trends
- Real-time data updates

## Line chart with custom tooltip

```tsx
'use client'
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
} from 'recharts'

const data = [
 { month: 'Jan', revenue: 4000, users: 2400 },
 { month: 'Feb', revenue: 3000, users: 1398 },
 { month: 'Mar', revenue: 2000, users: 9800 },
]

export function RevenueChart() {
 return (
 <ResponsiveContainer width="100%" height={350}>
 <LineChart data={data}>
 <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
 <XAxis
 dataKey="month"
 className="text-xs fill-muted-foreground"
 tickLine={false}
 axisLine={false}
 />
 <YAxis
 className="text-xs fill-muted-foreground"
 tickLine={false}
 axisLine={false}
 tickFormatter={(value) => `$${value}`}
 />
 <Tooltip
 content={<CustomTooltip />}
 cursor={{ stroke: 'hsl(var(--muted))' }}
 />
 <Legend />
 <Line
 type="monotone"
 dataKey="revenue"
 stroke="hsl(var(--primary))"
 strokeWidth={2}
 dot={{ fill: 'hsl(var(--primary))' }}
 activeDot={{ r: 6 }}
 />
 <Line
 type="monotone"
 dataKey="users"
 stroke="hsl(var(--secondary))"
 strokeWidth={2}
 dot={{ fill: 'hsl(var(--secondary))' }}
 />
 </LineChart>
 </ResponsiveContainer>
 )
}

function CustomTooltip({ active, payload, label }: any) {
 if (!active || !payload) return null

 return (
 <div className="rounded-lg border bg-background p-2 shadow-sm">
 <p className="text-sm font-medium">{label}</p>
 {payload.map((entry: any, index: number) => (
 <p key={index} className="text-sm" style={{ color: entry.color }}>
 {entry.name}: {entry.value}
 </p>
 ))}
 </div>
 )
}
```

## Bar chart

```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

const data = [
 { name: 'Mon', value: 12 },
 { name: 'Tue', value: 19 },
 { name: 'Wed', value: 3 },
 { name: 'Thu', value: 5 },
 { name: 'Fri', value: 2 },
]

export function WeeklyChart() {
 return (
 <ResponsiveContainer width="100%" height={200}>
 <BarChart data={data}>
 <XAxis
 dataKey="name"
 tickLine={false}
 axisLine={false}
 className="text-xs fill-muted-foreground"
 />
 <YAxis hide />
 <Bar
 dataKey="value"
 radius={[4, 4, 0, 0]}
 className="fill-primary"
 >
 {data.map((entry, index) => (
 <Cell
 key={index}
 className={index === data.length - 1 ? 'fill-primary' : 'fill-primary/60'}
 />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 )
}
```

## Area chart with gradient

```tsx
'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function GradientAreaChart({ data }: { data: any[] }) {
 return (
 <ResponsiveContainer width="100%" height={200}>
 <AreaChart data={data}>
 <defs>
 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
 <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="date" hide />
 <YAxis hide />
 <Area
 type="monotone"
 dataKey="value"
 stroke="hsl(var(--primary))"
 strokeWidth={2}
 fill="url(#colorValue)"
 />
 </AreaChart>
 </ResponsiveContainer>
 )
}
```

## Pie/Donut chart

```tsx
'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts'

const COLORS = [
 'hsl(var(--primary))',
 'hsl(var(--secondary))',
 'hsl(var(--accent))',
 'hsl(var(--muted))',
]

export function DonutChart({ data, total }: { data: any[]; total: number }) {
 return (
 <ResponsiveContainer width="100%" height={200}>
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={80}
 paddingAngle={2}
 dataKey="value"
 >
 {data.map((_, index) => (
 <Cell key={index} fill={COLORS[index % COLORS.length]} />
 ))}
 <Label
 value={total}
 position="center"
 className="fill-foreground text-2xl font-bold"
 />
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 )
}
```

## Sparklines (mini charts)

```tsx
'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
 data: number[]
 color?: string
 height?: number
}

export function Sparkline({ data, color = 'hsl(var(--primary))', height = 40 }: SparklineProps) {
 const chartData = data.map((value, index) => ({ index, value }))

 return (
 <ResponsiveContainer width="100%" height={height}>
 <LineChart data={chartData}>
 <Line
 type="monotone"
 dataKey="value"
 stroke={color}
 strokeWidth={1.5}
 dot={false}
 />
 </LineChart>
 </ResponsiveContainer>
 )
}

// Usage in stats card
<div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Revenue</p>
 <p className="text-2xl font-bold">$45,231</p>
 </div>
 <div className="w-20">
 <Sparkline data={[10, 15, 8, 22, 18, 25, 30]} />
 </div>
</div>
```

## Stat cards with trends

```tsx
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
 title: string
 value: string
 change: number
 trend: 'up' | 'down'
 sparklineData?: number[]
}

export function StatCard({ title, value, change, trend, sparklineData }: StatCardProps) {
 return (
 <div className="rounded-xl border bg-card p-6">
 <p className="text-sm font-medium text-muted-foreground">{title}</p>
 <div className="mt-2 flex items-baseline justify-between">
 <p className="text-3xl font-semibold">{value}</p>
 <div className={cn(
 'flex items-center text-sm font-medium',
 trend === 'up' ? 'text-green-600' : 'text-red-600'
 )}>
 {trend === 'up' ? (
 <ArrowUpIcon className="mr-1 h-4 w-4" />
 ) : (
 <ArrowDownIcon className="mr-1 h-4 w-4" />
 )}
 {Math.abs(change)}%
 </div>
 </div>
 {sparklineData && (
 <div className="mt-4">
 <Sparkline
 data={sparklineData}
 color={trend === 'up' ? 'rgb(22 163 74)' : 'rgb(220 38 38)'}
 />
 </div>
 )}
 </div>
 )
}
```

## Real-time data updates

```tsx
'use client'
import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

export function RealtimeChart() {
 const [data, setData] = useState<{ time: number; value: number }[]>([])

 useEffect(() => {
 const interval = setInterval(() => {
 setData((prev) => {
 const newPoint = {
 time: Date.now(),
 value: Math.random() * 100,
 }
 // Keep last 20 points
 const updated = [...prev, newPoint].slice(-20)
 return updated
 })
 }, 1000)

 return () => clearInterval(interval)
 }, [])

 return (
 <ResponsiveContainer width="100%" height={100}>
 <LineChart data={data}>
 <YAxis domain={[0, 100]} hide />
 <Line
 type="monotone"
 dataKey="value"
 stroke="hsl(var(--primary))"
 strokeWidth={2}
 dot={false}
 isAnimationActive={false}
 />
 </LineChart>
 </ResponsiveContainer>
 )
}
```
