
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"

const data = [
  { name: "Electrical", value: 450, color: "hsl(var(--primary))" },
  { name: "Electronics", value: 250, color: "hsl(var(--secondary))" },
  { name: "Computer Science", value: 300, color: "hsl(var(--destructive))" },
]

export function IssuancePieChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="hsl(var(--primary))"
          label={(entry) => `${entry.name} (${entry.value})`}
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
