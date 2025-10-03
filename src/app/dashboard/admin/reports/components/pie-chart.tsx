
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"

interface IssuancePieChartProps {
    data: any[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label for small slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
        <tspan x={x} dy="-0.5em">{`${payload.name}`}</tspan>
        <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}% (${payload.value})`}</tspan>
    </text>
  );
};


export function IssuancePieChart({ data: issuanceByDeptData }: IssuancePieChartProps) {
    if (issuanceByDeptData.length === 0) {
      return (
          <div className="flex items-center justify-center h-[350px]">
              <p className="text-muted-foreground">No departmental issuance data to display.</p>
          </div>
      )
  }

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
          data={issuanceByDeptData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={140}
          innerRadius={60}
          paddingAngle={2}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {issuanceByDeptData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
