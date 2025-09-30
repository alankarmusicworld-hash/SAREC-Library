
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"

const data = [
  { name: "Electrical", value: 450, color: "hsl(var(--primary))" },
  { name: "Electronics", value: 250, color: "hsl(var(--secondary))" },
  { name: "Computer Science", value: 300, color: "hsl(var(--destructive))" },
]

export function IssuancePieChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          formatter={(value, name) => [`${value} issues`, name]}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
          ))}
        </Pie>
        <Legend 
            iconType="circle"
            formatter={(value, entry) => (
                <span className="text-muted-foreground">{value}</span>
            )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
