
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

const COLORS = {
    "Electrical": "hsl(var(--primary))",
    "Electronics": "hsl(var(--secondary))",
    "Computer Science": "hsl(var(--destructive))",
    "General": "hsl(var(--muted-foreground))",
}

interface MostIssuedChartProps {
  department: string;
  data: any[];
}

export function MostIssuedChart({ department, data: mostIssuedBooksData }: MostIssuedChartProps) {
  const data = useMemo(() => {
    let filteredData;
    if (department === 'all') {
      filteredData = mostIssuedBooksData;
    } else {
      filteredData = mostIssuedBooksData.filter(book => book.department === department);
    }
    return filteredData.sort((a, b) => b.total - a.total).slice(0, 7);
  }, [department, mostIssuedBooksData]);
  
  const barColor = department !== 'all' ? COLORS[department as keyof typeof COLORS] : undefined;
  
  if (data.length === 0) {
      return (
          <div className="flex items-center justify-center h-[350px]">
              <p className="text-muted-foreground">No book issuance data to display.</p>
          </div>
      )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={150}
            tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
        />
        <Tooltip 
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ 
            background: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)' 
          }}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={barColor || COLORS[entry.department as keyof typeof COLORS] || 'hsl(var(--accent-foreground))'} 
                />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
