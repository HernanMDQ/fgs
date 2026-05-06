import { portfolio } from "@/data/portfolio"
import { getQuote, getPerformance } from "@/lib/yahoo"
import SectorBars from "./components/SectorBars"
import PortfolioTreemap from "./components/PortfolioTreemap"

export const revalidate = 300

const ASTERISCO = ["GGAL", "YPFD", "LOMA"]

function formatMillones(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 1_000_000)
}

function formatMM(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 1_000_000_000)
}

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">—</span>
  const color = value >= 0 ? "text-emerald-600" : "text-red-500"
  const sign = value >= 0 ? "+" : ""
  return <span className={color}>{sign}{value.toFixed(1)}%</span>
}

export default async function Page() {
  const holdings = await Promise.all(
    portfolio.map(async (h) => {
      const [precio, perf] = await Promise.all([
        getQuote(h.ticker),
        getPerformance(h.ticker),
      ])
      const valuacion = precio !== null ? precio * h.nominales : null
      return { ...h, precio, valuacion, perf }
    })
  )

  const total = holdings.reduce((acc, h) => acc + (h.valuacion ?? 0), 0)
  const ahora = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  })

  // Datos para el donut por sector
  const sectorMap = holdings.reduce((acc, h) => {
    if (!h.valuacion) return acc
    acc[h.sector] = (acc[h.sector] ?? 0) + h.valuacion
    return acc
  }, {} as Record<string, number>)
  const sectorData = Object.entries(sectorMap)
    .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)

  // Datos para el treemap
  const treemapData = holdings
    .filter((h) => h.valuacion !== null)
    .map((h) => ({
      name: h.ticker,
      size: h.valuacion!,
      sector: h.sector,
      pct: total > 0 ? (h.valuacion! / total) * 100 : 0,
    }))
    .sort((a, b) => b.size - a.size)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">FGS — Cartera de Acciones</h1>
          <p className="text-sm text-gray-500 mt-1">Actualizado: {ahora}</p>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Composición por sector</h2>
            <SectorBars data={sectorData} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Peso en cartera por activo</h2>
            <p className="text-xs text-gray-400 mb-2">Tamaño y % = peso en cartera · Color = sector</p>
            <PortfolioTreemap data={treemapData} />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left uppercase">Ticker</th>
                <th className="px-4 py-3 text-left uppercase hidden md:table-cell">Sector</th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Nominales</div>
                  <div className="font-normal text-gray-400">(millones)</div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Precio</div>
                  <div className="font-normal text-gray-400">($ por acción)</div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Valuación</div>
                  <div className="font-normal text-gray-400">(miles de mill. $)</div>
                </th>
                <th className="px-4 py-3 text-right uppercase">% Cartera</th>
                <th className="px-4 py-3 text-right uppercase">1S</th>
                <th className="px-4 py-3 text-right uppercase">1M</th>
                <th className="px-4 py-3 text-right uppercase">1A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {holdings.map((h) => (
                <tr key={h.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {h.ticker}{ASTERISCO.includes(h.ticker) ? "*" : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{h.sector}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatMillones(h.nominales)}</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {h.precio !== null ? formatARS(h.precio) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {h.valuacion !== null ? formatMM(h.valuacion) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {h.valuacion !== null && total > 0
                      ? `${((h.valuacion / total) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right"><Pct value={h.perf.w1} /></td>
                  <td className="px-4 py-3 text-right"><Pct value={h.perf.m1} /></td>
                  <td className="px-4 py-3 text-right"><Pct value={h.perf.y1} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900 text-white">
              <tr>
                <td className="px-4 py-4 font-bold" colSpan={4}>Total</td>
                <td className="px-4 py-4 text-right font-bold text-lg">{formatMM(total)}</td>
                <td className="px-4 py-4 text-right" colSpan={4}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-gray-400">
          * El FGS continuó adquiriendo acciones con posterioridad a la fecha del informe.
        </p>
      </div>
    </main>
  )
}
