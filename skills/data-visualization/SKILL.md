---
name: data-visualization
description: >
  Build interactive, accessible charts and dashboards with Recharts, D3, or
  Victory. Use when "chart", "graph", "data visualization", "analytics
  dashboard", "metrics display", "time-series", "D3", or "Recharts".
license: MIT
---

# Data Visualization Skill

**Degree of freedom: MIXED.** Chart type and encoding `[HIGH freedom]`;
existing-library/token probes and a11y fallback `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — existing chart library, tokens, data shape
2. **Interpret** — reuse a component vs new chart type
3. **Classify** — line / bar / area / donut / sparkline / table-fallback
4. **Severity** — inaccessible or empty-state-less chart outranks a missing gradient

## Worked example

> **Observe:** `package.json` has recharts; no `src/components/charts`; tokens define `--primary`.
> **Interpret:** reuse Recharts + tokens, not D3.
> **Classify:** `ResponsiveContainer` line chart + sr-only table; skeleton while loading.
> **Verify:** resizes; screen-reader table present; no second chart library.

## Self-critique before reporting

- **Existing lib** — grepped `package.json`; did not add a second chart library
- **Accessible** — sr-only table or text alternative present
- **States** — loading + empty handled
- **Right owner** — event taxonomy → `audit-analytics`; empty/loading frames → `audit-ui-states`

Create beautiful, accessible, and interactive data visualizations for dashboards and reports.

Product-event coverage ("are we tracking the right events?") is `audit-analytics`,
not this skill. Empty/loading chart frames are `audit-ui-states`.

## Check existing first  [LOW freedom — run exactly]

**Before creating ANY visualization, verify:**

1. **Check for existing chart libraries:**
```bash
cat package.json | grep -i "recharts\|chart\|d3\|visx\|nivo\|tremor"
rg "LineChart|BarChart|PieChart" --type tsx -l | head -10
```

2. **Check for existing chart components:**
```bash
ls -la src/components/charts/ src/components/dashboard/ 2>/dev/null
rg "ResponsiveContainer|Chart" --type tsx | head -10
```

3. **Check for design tokens:**
```bash
cat tailwind.config.* | grep -A10 "chart\|colors"
```

**Why:** Use existing chart library and styling conventions.

## Recharts (Recommended for React)  [HIGH freedom]

- Wrap every chart in `ResponsiveContainer width="100%"`; set a fixed `height`.
- Style through tokens: `hsl(var(--primary))`, `fill-muted-foreground`, `stroke-muted`; no hard-coded hex.
- Hide axis lines and tick lines (`tickLine={false} axisLine={false}`); format Y ticks (`$`, `%`).
- Custom `Tooltip` content uses `bg-background border rounded-lg` so it matches the theme.
- Chart types: line (trend over time), bar (`radius={[4,4,0,0]}`, highlight the latest `Cell`), area (gradient `<defs>` fill), donut (`innerRadius`/`outerRadius` + center `Label` for the total).

```tsx
'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip cursor={{ stroke: 'hsl(var(--muted))' }} />
        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

Full line chart with custom tooltip, bar, area-gradient and donut components: [references/recharts.md](references/recharts.md) §Line chart, §Bar chart, §Area chart, §Pie/Donut chart.

## Sparklines (Mini Charts)  [HIGH freedom]

- A `LineChart` with one `Line`, `dot={false}`, `strokeWidth={1.5}`, no axes, height ~40.
- Map a `number[]` to `{ index, value }` inside the component so callers pass plain arrays.
- Place it in a `w-20` slot beside the stat value, never as its own card.

`Sparkline` component and stats-card usage: [references/recharts.md](references/recharts.md) §Sparklines.

## Stat Cards with Trends  [HIGH freedom]

- `rounded-xl border bg-card p-6`; title in `text-muted-foreground`, value `text-3xl font-semibold`.
- Trend arrow + `Math.abs(change)%`; green for up, red for down; pass the same color to the sparkline.
- `sparklineData` is optional; render the sparkline only when present.

`StatCard` component: [references/recharts.md](references/recharts.md) §Stat cards with trends.

## Real-time Data Updates  [HIGH freedom]

- Append in `setData(prev => [...prev, point].slice(-N))`; keep a bounded window (about 20 points).
- `isAnimationActive={false}` and a fixed `YAxis domain` so the chart does not jump per tick.
- Clear the interval or socket subscription in the effect cleanup.

`RealtimeChart` component: [references/recharts.md](references/recharts.md) §Real-time data updates.

## D3.js for Custom Visualizations  [HIGH freedom]

- Reach for D3 only when Recharts cannot express the mark; never add it beside an existing chart library.
- Render into a `ref`'d `<svg>` from `useEffect`; `svg.selectAll('*').remove()` before redrawing on data change.
- `scaleBand` for categories, `scaleLinear().nice()` for values; size from `clientWidth`/`clientHeight`, with margins.
- Animate with `.transition().duration(750)` from the baseline; color with the same `hsl(var(--primary))` tokens.

Full D3 bar chart component: [references/d3-and-accessibility.md](references/d3-and-accessibility.md) §D3.js custom bar chart.

## Accessibility  [LOW freedom — run exactly]

- Wrap the chart in `<div role="img" aria-label="...">` that states what the chart shows and its range.
- Mark the SVG chart `aria-hidden="true"`; provide the data as an `sr-only` `<table>` with a `<caption>`.
- Color is never the only encoding: pair it with labels, markers, or a legend.

```tsx
<div role="img" aria-label="Revenue chart showing monthly data from January to December">
  <ResponsiveContainer><LineChart data={data} aria-hidden="true">{/* ... */}</LineChart></ResponsiveContainer>
  <table className="sr-only">
    <caption>Monthly Revenue Data</caption>
    <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
    <tbody>{data.map((d) => <tr key={d.month}><td>{d.month}</td><td>${d.revenue}</td></tr>)}</tbody>
  </table>
</div>
```

Full accessibility block: [references/d3-and-accessibility.md](references/d3-and-accessibility.md) §Accessibility.

## Validation  [LOW freedom — do not skip]

After creating visualizations:

1. **Responsive** → Charts resize properly on all screens
2. **Accessible** → Screen reader alternatives provided
3. **Performance** → Large datasets use virtualization/sampling
4. **Loading states** → Skeleton shown while data loads
5. **Empty states** → Meaningful message when no data
6. **Color contrast** → Meets WCAG guidelines
7. **Tooltips** → Provide detailed data on hover
