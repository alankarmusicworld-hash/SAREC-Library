
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface DailyActivityChartProps {
    data: any[];
}

export function DailyActivityChart({ data: dailyActivityData }: DailyActivityChartProps) {
    if (dailyActivityData.length === 0) {
      return (
          <div className="flex items-center justify-center h-[350px]">
              <p className="text-muted-foreground">No activity data to display for the last 7 days.</p>
          </div>
      )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={dailyActivityData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
           contentStyle={{ 
            background: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)' 
          }}
        />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="issued" stroke="hsl(var(--primary))" name="Books Issued" />
        <Line yAxisId="left" type="monotone" dataKey="returned" stroke="hsl(var(--secondary))" name="Books Returned" />
        <Line yAxisId="right" type="monotone" dataKey="fines" stroke="hsl(var(--destructive))" name="Fines Collected (₹)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
