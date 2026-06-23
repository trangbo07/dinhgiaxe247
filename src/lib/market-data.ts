/**
 * Shared market data fetching for valuation and chat routes.
 * Sources: Chợ Tốt (JSON API) + Bonbanh (HTML scraping).
 * Applies IQR outlier filtering and returns p25/median/p75 statistics.
 */

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const FETCH_TIMEOUT_MS = 4_500
const MIN_PRICE = 40_000_000
const MAX_PRICE = 15_000_000_000
const MAX_AGE_DAYS = 30

export type MarketInsight = {
  source: string
  sampleCount: number
  low: number | null
  high: number | null
  p25: number | null
  median: number | null
  p75: number | null
}

export type MarketAggregate = {
  median: number
  p25: number
  p75: number
  low: number | null
  high: number | null
  totalSamples: number
}

type CacheEntry = { at: number; insights: MarketInsight[] }
const _cache = new Map<string, CacheEntry>()

// ── Utilities ────────────────────────────────────────────────────────────────

function norm(v: unknown): string {
  return String(v ?? '').trim()
}

function calcMedian(sorted: number[]): number | null {
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

function calcPercentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0
  const idx = Math.max(0, (p / 100) * (sorted.length - 1))
  const lo = Math.floor(idx)
  const hi = Math.min(sorted.length - 1, Math.ceil(idx))
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo))
}

/** IQR-based outlier removal. */
function filterOutliers(prices: number[]): number[] {
  if (prices.length < 6) return prices
  const s = [...prices].sort((a, b) => a - b)
  const q1 = calcPercentile(s, 25)
  const q3 = calcPercentile(s, 75)
  const iqr = q3 - q1
  if (iqr === 0) return s
  return s.filter((p) => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
}

function buildInsight(source: string, rawPrices: number[]): MarketInsight {
  const filtered = filterOutliers(rawPrices.filter((p) => p >= MIN_PRICE && p <= MAX_PRICE))
  if (!filtered.length) {
    return { source, sampleCount: 0, low: null, high: null, p25: null, median: null, p75: null }
  }
  const s = [...filtered].sort((a, b) => a - b)
  return {
    source,
    sampleCount: s.length,
    low: s[0],
    high: s[s.length - 1],
    p25: calcPercentile(s, 25),
    median: calcMedian(s),
    p75: calcPercentile(s, 75),
  }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function fetchRaw(url: string, headers: Record<string, string>): Promise<string | null> {
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers,
      signal: ctrl.signal,
      next: { revalidate: 0 },
    })
    clearTimeout(tid)
    if (!res.ok) return null
    return await res.text()
  } catch {
    clearTimeout(tid)
    return null
  }
}

// ── Chợ Tốt (JSON API) ────────────────────────────────────────────────────────

const CHOTOT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'vi-VN,vi;q=0.9',
  Referer: 'https://xe.chotot.com/',
  Origin: 'https://xe.chotot.com',
}

async function fetchChoTotPrices(query: string): Promise<number[]> {
  if (!query) return []
  const cutoffMs = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  const url =
    `https://gateway.chotot.com/v2/public/ad/listing?cg=2010` +
    `&q=${encodeURIComponent(query)}&limit=100&st=s,k`

  const raw = await fetchRaw(url, CHOTOT_HEADERS)
  if (!raw) return []
  try {
    type Ad = { price?: number; list_time?: number }
    const data = JSON.parse(raw) as { ads?: Ad[] }
    return (data.ads ?? [])
      .filter((ad) => typeof ad.price === 'number' && ad.price > 0 && (ad.list_time ?? 0) >= cutoffMs)
      .map((ad) => ad.price as number)
  } catch {
    return []
  }
}

// ── Bonbanh (HTML scraping) ───────────────────────────────────────────────────

const BONBANH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9',
  Referer: 'https://bonbanh.com/',
}

function parseBonbanhHtml(html: string): number[] {
  const prices: number[] = []

  // Priority 1: JSON price fields embedded in page (SSR data / Next data / LD+JSON)
  const jsonPriceRe = /"price"\s*:\s*(\d{7,12})/g
  let m: RegExpExecArray | null
  while ((m = jsonPriceRe.exec(html)) !== null) {
    prices.push(parseInt(m[1], 10))
  }

  // Priority 2: structured data with priceRange or offers
  const offerRe = /"lowPrice"\s*:\s*"?(\d+)"?|"highPrice"\s*:\s*"?(\d+)"?/g
  while ((m = offerRe.exec(html)) !== null) {
    const v = parseInt(m[1] ?? m[2], 10)
    if (v > 1000) prices.push(v) // might be in triệu (millions)
  }

  // Priority 3: Vietnamese text prices (tỷ / triệu)
  const txtRe = /(\d{1,4}(?:[.,]\d{3})*)\s*(tỷ|ty|triệu|tr)\b/gi
  while ((m = txtRe.exec(html)) !== null) {
    const digits = m[1].replace(/[.,]/g, '')
    const unit = m[2].toLowerCase()
    const n = parseInt(digits, 10)
    if (!n || n > 100000) continue
    const p = unit === 'tỷ' || unit === 'ty' ? n * 1_000_000_000 : n * 1_000_000
    prices.push(p)
  }

  // Deduplicate and convert "triệu" values stored as small ints (e.g. 850 → 850_000_000)
  return [...new Set(prices)].map((p) => {
    // Values like 450, 850, 1200 from JSON are likely in triệu
    if (p >= 100 && p <= 15000) return p * 1_000_000
    return p
  })
}

async function fetchBonbanhPrices(query: string): Promise<number[]> {
  if (!query) return []
  const url = `https://bonbanh.com/oto?q=${encodeURIComponent(query)}`
  const raw = await fetchRaw(url, BONBANH_HEADERS)
  if (!raw) return []
  return parseBonbanhHtml(raw)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch market insights from all sources (Chợ Tốt + Bonbanh).
 * Results are cached for CACHE_TTL_MS.
 * Falls back to stale cache on complete failure.
 *
 * Search strategy (most → least specific):
 *   1. brand + model + year + version  (e.g. "Toyota Camry 2020 2.5Q")
 *   2. brand + model + year            (e.g. "Toyota Camry 2020")
 *   3. brand + model                   (e.g. "Toyota Camry")
 * Each level is tried only when the previous level has < MIN_SAMPLES results.
 */
const MIN_SAMPLES = 8

export async function fetchMarketInsights(
  brand: string,
  model: string,
  year: string | number,
  version?: string
): Promise<MarketInsight[]> {
  const qVersion = [norm(brand), norm(model), norm(year), norm(version)].filter(Boolean).join(' ')
  const qYear    = [norm(brand), norm(model), norm(year)].filter(Boolean).join(' ')
  const qBase    = [norm(brand), norm(model)].filter(Boolean).join(' ')
  if (!qBase) return []

  // Cache key is the most specific query we will actually use
  const cacheKey = version ? qVersion : qYear
  const now = Date.now()
  const cached = _cache.get(cacheKey)
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.insights

  // Level 1: version-specific query (only when version is known)
  let ctPrices: number[] = []
  let bbPrices: number[] = []

  if (version && qVersion !== qYear) {
    const [ctV, bbV] = await Promise.all([
      fetchChoTotPrices(qVersion),
      fetchBonbanhPrices(qVersion),
    ])
    ctPrices = ctV
    bbPrices = bbV
  }

  // Level 2: year-specific query (broaden when version gave too few results)
  if (ctPrices.length + bbPrices.length < MIN_SAMPLES && qYear !== qVersion) {
    const [ctY, bbY] = await Promise.all([
      fetchChoTotPrices(qYear),
      fetchBonbanhPrices(qYear),
    ])
    // Merge but deduplicate; prefer version-specific hits if any
    ctPrices = [...new Set([...ctPrices, ...ctY])]
    bbPrices = [...new Set([...bbPrices, ...bbY])]
  }

  // Level 3: model-only query (last resort)
  if (ctPrices.length + bbPrices.length < MIN_SAMPLES) {
    const [ctB, bbB] = await Promise.all([
      fetchChoTotPrices(qBase),
      fetchBonbanhPrices(qBase),
    ])
    ctPrices = [...new Set([...ctPrices, ...ctB])].slice(0, 200)
    bbPrices = [...new Set([...bbPrices, ...bbB])].slice(0, 200)
  } else {
    ctPrices = ctPrices.slice(0, 200)
    bbPrices = bbPrices.slice(0, 200)
  }

  const insights: MarketInsight[] = []
  const ctInsight = buildInsight('Chợ Tốt', ctPrices)
  const bbInsight = buildInsight('Bonbanh', bbPrices)
  if (ctInsight.sampleCount > 0) insights.push(ctInsight)
  if (bbInsight.sampleCount > 0) insights.push(bbInsight)

  if (insights.length > 0) {
    _cache.set(cacheKey, { at: now, insights })
  } else if (cached) {
    return cached.insights
  }

  return insights
}

/**
 * Aggregate insights from multiple sources into a single market anchor.
 * Weights medians by sample count.
 */
export function aggregateMarket(insights: MarketInsight[]): MarketAggregate | null {
  const valid = insights.filter((i) => i.median != null && i.sampleCount > 0)
  if (!valid.length) return null

  const totalSamples = valid.reduce((s, i) => s + i.sampleCount, 0)

  // Weighted average of medians
  const median = Math.round(
    valid.reduce((s, i) => s + i.median! * i.sampleCount, 0) / totalSamples
  )

  const p25s = valid.map((i) => i.p25).filter((n): n is number => n != null)
  const p75s = valid.map((i) => i.p75).filter((n): n is number => n != null)
  const lows = valid.map((i) => i.low).filter((n): n is number => n != null)
  const highs = valid.map((i) => i.high).filter((n): n is number => n != null)

  return {
    median,
    p25: p25s.length ? Math.round(p25s.reduce((a, b) => a + b) / p25s.length) : Math.round(median * 0.9),
    p75: p75s.length ? Math.round(p75s.reduce((a, b) => a + b) / p75s.length) : Math.round(median * 1.1),
    low: lows.length ? Math.min(...lows) : null,
    high: highs.length ? Math.max(...highs) : null,
    totalSamples,
  }
}

/** Format market insights as a concise string for Gemini context. */
export function formatMarketContext(insights: MarketInsight[]): string {
  if (!insights.length) return 'Không có dữ liệu thị trường.'
  return insights
    .map((i) => {
      if (!i.sampleCount) return `[${i.source}] Không tìm thấy tin rao phù hợp.`
      const fmt = (n: number | null) => n != null ? n.toLocaleString('vi-VN') : 'N/A'
      return (
        `[${i.source}] ${i.sampleCount} tin rao (30 ngày)\n` +
        `  Trung vị: ${fmt(i.median)} VND\n` +
        `  Tứ phân vị: ${fmt(i.p25)} → ${fmt(i.p75)} VND\n` +
        `  Biên độ toàn bộ: ${fmt(i.low)} – ${fmt(i.high)} VND`
      )
    })
    .join('\n\n')
}
