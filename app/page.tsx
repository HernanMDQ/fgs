import { portfolio } from "@/data/portfolio"
import { getQuote } from "@/lib/prices"

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

export default async function Page() {
  const holdings = await Promise.all(
    portfolio.map(async (h) => {
      const precio = await getQuote(h.ticker)
      const valuacion = precio !== null ? precio * h.nominales : null
      return { ...h, precio, valuacion }
    })
  )

  const total = holdings.reduce((acc, h) => acc + (h.valuacion ?? 0), 0)
  const ahora = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  })

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">FGS — Cartera de Acciones</h1>
          <p className="text-sm text-gray-500 mt-1">Actualizado: {ahora}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left uppercase">Ticker</th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Nominales</div>
                  <div className="font-normal text-gray-400">(en millones)</div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Precio</div>
                  <div className="font-normal text-gray-400">($ por acción)</div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="uppercase">Valuación</div>
                  <div className="font-normal text-gray-400">(en miles de millones $)</div>
                </th>
                <th className="px-4 py-3 text-right uppercase">% Cartera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {holdings.map((h) => (
                <tr key={h.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {h.ticker}{ASTERISCO.includes(h.ticker) ? "*" : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatMillones(h.nominales)}
                  </td>
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
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900 text-white">
              <tr>
                <td className="px-4 py-4 font-bold" colSpan={3}>Total</td>
                <td className="px-4 py-4 text-right font-bold text-lg">{formatMM(total)}</td>
                <td className="px-4 py-4 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * El FGS continuó adquiriendo acciones con posterioridad a la fecha del informe.
        </p>
      </div>
    </main>
  )
}
