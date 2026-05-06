import { getQuote as getIOLQuote } from "./iol"
import { getQuote as getYahooQuote } from "./yahoo"

export async function getQuote(ticker: string): Promise<number | null> {
  if (process.env.PRICE_SOURCE === "iol") {
    return getIOLQuote(ticker)
  }
  return getYahooQuote(ticker)
}
