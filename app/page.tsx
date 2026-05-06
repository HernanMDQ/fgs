import { portfolio } from "@/data/portfolio"
import { getQuote } from "@/lib/prices"

export const revalidate = 300

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
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
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-right">Nominales</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Valuación</th>
                <th className="px-4 py-3 text-right">% Cartera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {holdings.map((h) => (
                <tr key={h.ticker} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{h.ticker}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {h.nominales.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {h.precio !== null ? formatARS(h.precio) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {h.valuacion !== null ? formatARS(h.valuacion) : <span className="text-gray-400">—</span>}
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
                <td className="px-4 py-4 font-bold" colSpan={3}>
                  Total
                </td>
                <td className="px-4 py-4 text-right font-bold text-lg">{formatARS(total)}</td>
                <td className="px-4 py-4 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </main>
  )
}
