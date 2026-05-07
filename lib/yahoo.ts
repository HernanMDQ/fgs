import YahooFinance from "yahoo-finance2"
import { unstable_cache } from "next/cache"

const yahooFinance = new YahooFinance({
  validation: { logErrors: false, logOptionsErrors: false },
})

// Tickers cuyo símbolo en Yahoo Finance difiere del de BYMA
const TICKER_MAP: Record<string, string> = {
  CEPU2: "CEPU",
}

export async function getQuote(ticker: string): Promise<number | null> {
  try {
    const result = await yahooFinance.quote(`${TICKER_MAP[ticker] ?? ticker}.BA`, {}, { validateResult: false })
    return result?.regularMarketPrice ?? null
  } catch {
    return null
  }
}

export interface Performance {
  w1: number | null
  m1: number | null
  y1: number | null
}

const fetchHistory = unstable_cache(
  async (ticker: string) => {
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    return yahooFinance.historical(
      `${TICKER_MAP[ticker] ?? ticker}.BA`,
      { period1: oneYearAgo, period2: today, interval: "1d" },
      { validateResult: false }
    )
  },
  ["yahoo-history"],
  { revalidate: 86400 }
)

export async function getPerformance(ticker: string): Promise<Performance> {
  try {
    const history = await fetchHistory(ticker)
    if (!history || history.length === 0) return { w1: null, m1: null, y1: null }

    const today = new Date()
    const current = history[history.length - 1].close

    const priceNDaysAgo = (days: number): number | null => {
      const target = new Date(today)
      target.setDate(today.getDate() - days)
      const filtered = history.filter((h: { date: Date; close: number }) => new Date(h.date) <= target)
      return filtered.length > 0 ? filtered[filtered.length - 1].close : null
    }

    const pct = (past: number | null) =>
      past ? ((current - past) / past) * 100 : null

    return {
      w1: pct(priceNDaysAgo(7)),
      m1: pct(priceNDaysAgo(30)),
      y1: pct(priceNDaysAgo(365)),
    }
  } catch {
    return { w1: null, m1: null, y1: null }
  }
}
