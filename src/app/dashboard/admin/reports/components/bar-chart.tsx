
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

const allBooksData = [
  // Electrical
  { name: "Electrical Machines Ist", total: 8, department: "Electrical" },
  { name: "Power Systems", total: 6, department: "Electrical" },
  { name: "Control Systems", total: 4, department: "Electrical" },

  // Electronics
  { name: "Digital Electronics", total: 7, department: "Electronics" },
  { name: "Analog Circuits", total: 5, department: "Electronics" },
  { name: "Semiconductor Devices", total: 3, department: "Electronics" },

  // Computer Science
  { name: "Data Structures", total: 9, department: "Computer Science" },
  { name: "Operating Systems", total: 6, department: "Computer Science" },
  { name: "Clean Code", total: 4, department: "Computer Science" },

  // General
  { name: "Sense & Sensibility", total: 7, department: "General" },
  { name: "Pride and Prejudice", total: 5, department: "General" },
  { name: "The Great Gatsby", total: 4, department: "General" },
  { name: "To Kill a Mockingbird", total: 2, department: "General" },
]

const COLORS = {
    "Electrical": "hsl(var(--primary))",
    "Electronics": "hsl(var(--secondary))",
    "Computer Science": "hsl(var(--destructive))",
    "General": "hsl(var(--muted-foreground))",
}

interface MostIssuedChartProps {
  department: string;
}

export function MostIssuedChart({ department }: MostIssuedChartProps) {
  const data = useMemo(() => {
    let filteredData;
    if (department === 'all') {
      filteredData = allBooksData;
    } else {
      filteredData = allBooksData.filter(book => book.department === department);
    }
    return filteredData.sort((a, b) => b.total - a.total).slice(0, 7);
  }, [department]);
  
  const barColor = department !== 'all' ? COLORS[department as keyof typeof COLORS] : undefined;

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
            width={120}
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
                    fill={barColor || COLORS[entry.department as keyof typeof COLORS]} 
                />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
