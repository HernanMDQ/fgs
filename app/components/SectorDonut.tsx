"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS: Record<string, string> = {
  "Bancos":             "#3b82f6",
  "Energía eléctrica":  "#f59e0b",
  "Gas":                "#8b5cf6",
  "Petróleo":           "#6b7280",
  "Industria":          "#f97316",
  "Materiales":         "#84cc16",
  "Real Estate":        "#14b8a6",
  "Agro/Alimentos":     "#22c55e",
  "Comunicación":       "#ec4899",
  "Concesiones":        "#64748b",
}

interface Props {
  data: { name: string; value: number }[]
}

function formatMM(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 1_000_000_000) + " MM"
}

export default function SectorDonut({ data }: Props) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={75}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${formatMM(value)} (${((value / total) * 100).toFixed(1)}%)`,
            "",
          ]}
        />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-700">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
