const IOL_BASE = "https://api.invertironline.com"

async function getToken(): Promise<string> {
  const res = await fetch(`${IOL_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      username: process.env.IOL_USERNAME!,
      password: process.env.IOL_PASSWORD!,
    }),
    next: { revalidate: 1500 },
  })
  if (!res.ok) throw new Error("IOL auth failed")
  const data = await res.json()
  return data.access_token
}

export async function getQuote(ticker: string): Promise<number | null> {
  try {
    const token = await getToken()
    const res = await fetch(
      `${IOL_BASE}/api/v2/titulo/bCBA/${ticker}/cotizacion`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.ultimoPrecio ?? null
  } catch {
    return null
  }
}
