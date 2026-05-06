"use client"

import {
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts"

export const SECTOR_COLORS: Record<string, string> = {
  "Bancos":             "#3b82f6",
  "Energía eléctrica":  "#f59e0b",
  "Gas":                "#8b5cf6",
  "Petróleo":           "#6b7280",
  "Industria":          "#f97316",
  "Materiales":         "#84cc16",
  "Real Estate":        "#14b8a6",
  "Agro/Alimentos":     "#22c55e",
  "Comunicación":       "#ec4899",
  "Otros":              "#64748b",
}

interface Props {
  data: { name: string; value: number; pct: number }[]
}

export default function SectorBars({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v) => `${v.toFixed(0)}%`}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: "#374151" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Participación"]}
          cursor={{ fill: "#f3f4f6" }}
        />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] ?? "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
