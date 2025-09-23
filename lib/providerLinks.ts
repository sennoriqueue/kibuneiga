const SEARCH_BUILDERS: Record<string, (title: string) => string> = {
  Netflix: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  'Amazon Prime Video': (t) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(t)}`,
  Hulu: (t) => `https://www.hulu.jp/search?q=${encodeURIComponent(t)}`,
  'U-NEXT': (t) => `https://video.unext.jp/freeword?query=${encodeURIComponent(t)}`,
  'Disney Plus': (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}`,
  'Apple TV': (t) => `https://tv.apple.com/jp/search?term=${encodeURIComponent(t)}`,
}

type Provider = { provider_id: number; provider_name: string }

export function createProviderLinks(title: string, providers: Provider[]) {
  const seen = new Set<string>()
  const links: { name: string; url: string }[] = []
  for (const p of providers) {
    const name = normalizeName(p.provider_name)
    if (seen.has(name)) continue
    seen.add(name)
    const builder = SEARCH_BUILDERS[name]
    if (builder) {
      links.push({ name, url: builder(title) })
    }
  }
  return links
}

function normalizeName(name: string) {
  // TMDb JP provider names to our keys
  if (/amazon/i.test(name)) return 'Amazon Prime Video'
  if (name === 'Disney+') return 'Disney Plus'
  if (/appletv/i.test(name) || /Apple TV/i.test(name)) return 'Apple TV'
  return name
}

