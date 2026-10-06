# D3 custom charts and accessible fallbacks

Full D3 bar-chart component and the complete screen-reader table pattern referenced from `SKILL.md`.

## D3.js custom bar chart

```tsx
'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export function CustomD3Chart({ data }: { data: { label: string; value: number }[] }) {
 const svgRef = useRef<SVGSVGElement>(null)

 useEffect(() => {
 if (!svgRef.current || !data.length) return

 const svg = d3.select(svgRef.current)
 const width = svgRef.current.clientWidth
 const height = svgRef.current.clientHeight
 const margin = { top: 20, right: 20, bottom: 30, left: 40 }

 svg.selectAll('*').remove()

 const x = d3
 .scaleBand()
 .domain(data.map((d) => d.label))
 .range([margin.left, width - margin.right])
 .padding(0.1)

 const y = d3
 .scaleLinear()
 .domain([0, d3.max(data, (d) => d.value) || 0])
 .nice()
 .range([height - margin.bottom, margin.top])

 // Bars
 svg
 .selectAll('rect')
 .data(data)
 .join('rect')
 .attr('x', (d) => x(d.label) || 0)
 .attr('y', height - margin.bottom)
 .attr('width', x.bandwidth())
 .attr('height', 0)
 .attr('fill', 'hsl(var(--primary))')
 .attr('rx', 4)
 .transition()
 .duration(750)
 .attr('y', (d) => y(d.value))
 .attr('height', (d) => y(0) - y(d.value))

 // X Axis
 svg
 .append('g')
 .attr('transform', `translate(0,${height - margin.bottom})`)
 .call(d3.axisBottom(x).tickSize(0))
 .selectAll('text')
 .attr('class', 'fill-muted-foreground text-xs')

 }, [data])

 return <svg ref={svgRef} className="w-full h-64" />
}
```

## Accessibility: role="img" wrapper plus sr-only table

```tsx
// Always include ARIA labels and descriptions
<div role="img" aria-label="Revenue chart showing monthly data from January to December">
 <ResponsiveContainer>
 <LineChart data={data} aria-hidden="true">
 {/* Chart content */}
 </LineChart>
 </ResponsiveContainer>

 {/* Screen reader alternative */}
 <table className="sr-only">
 <caption>Monthly Revenue Data</caption>
 <thead>
 <tr><th>Month</th><th>Revenue</th></tr>
 </thead>
 <tbody>
 {data.map((d) => (
 <tr key={d.month}>
 <td>{d.month}</td>
 <td>${d.revenue}</td>
 </tr>
 ))}
 </tbody>
 </table>
</div>
```
