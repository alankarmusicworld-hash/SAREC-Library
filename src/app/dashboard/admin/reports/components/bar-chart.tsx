
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Electrical Machines Ist", total: 8 },
  { name: "Sense & Sensibility", total: 7 },
  { name: "General English", total: 5 },
  { name: "Pride and Prejudice", total: 5 },
  { name: "The Great Gatsby", total: 4 },
  { name: "Digital Electronics", total: 3 },
  { name: "To Kill a Mockingbird", total: 2 },
]

export function MostIssuedChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
        />
        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
