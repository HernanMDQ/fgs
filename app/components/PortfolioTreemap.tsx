"use client"

import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { SECTOR_COLORS } from "./SectorBars"

interface Node {
  name: string
  size: number
  pct: number
  sector: string
}

interface Props {
  data: Node[]
}

function formatMM(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 1_000_000_000) + " MM"
}

function TreemapCell(props: {
  x?: number; y?: number; width?: number; height?: number
  name?: string; pct?: number; sector?: string
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", pct = 0, sector = "" } = props
  const bg = SECTOR_COLORS[sector] ?? "#94a3b8"

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={bg} stroke="#fff" strokeWidth={2} rx={3} />
      {width > 45 && height > 22 && (
        <text
          x={x + width / 2} y={y + height / 2 - (height > 38 ? 8 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={Math.min(13, width / 5)} fontWeight="600"
        >
          {name}
        </text>
      )}
      {width > 45 && height > 38 && (
        <text
          x={x + width / 2} y={y + height / 2 + 12}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.85)" fontSize={Math.min(11, width / 6)}
        >
          {pct.toFixed(1)}%
        </text>
      )}
    </g>
  )
}

export default function PortfolioTreemap({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        content={<TreemapCell />}
      >
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null
            const d = payload[0].payload as Node
            return (
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
                <p className="font-semibold text-gray-900">{d.name}</p>
                <p className="text-gray-500 text-xs">{d.sector}</p>
                <p className="text-gray-700">Valuación: {formatMM(d.size)}</p>
                <p className="text-gray-700">% Cartera: {d.pct.toFixed(1)}%</p>
              </div>
            )
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  )
}
