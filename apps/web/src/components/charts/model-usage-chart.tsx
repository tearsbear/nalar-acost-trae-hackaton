"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

type DataPoint = { model: string; cost: number; pct: number }

const COLORS = ["#000000", "#404040", "#737373", "#a1a1a1"]

export function ModelUsageChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="pct"
          nameKey="model"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 10,
            fontSize: 12,
          }}
          formatter={(v, name) => [`${v}%`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: "#737373" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
