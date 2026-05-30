"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type DataPoint = { date: string; cost: number }

export function SpendTrendChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#737373" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#737373" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 10,
            fontSize: 12,
          }}
          formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#000000"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#000" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
