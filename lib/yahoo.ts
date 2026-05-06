import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance()

export async function getQuote(ticker: string): Promise<number | null> {
  try {
    const result = await yahooFinance.quote(`${ticker}.BA`)
    return result?.regularMarketPrice ?? null
  } catch {
    return null
  }
}
