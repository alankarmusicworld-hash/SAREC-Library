
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  { date: "Jul 20", issued: 3, returned: 1, fines: 50 },
  { date: "Jul 21", issued: 4, returned: 2, fines: 25 },
  { date: "Jul 22", issued: 2, returned: 3, fines: 75 },
  { date: "Jul 23", issued: 5, returned: 2, fines: 0 },
  { date: "Jul 24", issued: 1, returned: 1, fines: 100 },
  { date: "Jul 25", issued: 6, returned: 4, fines: 15 },
  { date: "Jul 26", issued: 3, returned: 5, fines: 30 },
]

export function DailyActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="issued" stroke="hsl(var(--primary))" name="Books Issued" />
        <Line type="monotone" dataKey="returned" stroke="hsl(var(--secondary))" name="Books Returned" />
        <Line type="monotone" dataKey="fines" stroke="hsl(var(--destructive))" name="Fines Collected (₹)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
