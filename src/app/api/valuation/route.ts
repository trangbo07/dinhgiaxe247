import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_VERSION =
  process.env.GEMINI_API_VERSION ||
  (GEMINI_MODEL.includes('preview') || GEMINI_MODEL.includes('3.1') ? 'v1beta' : 'v1')

type MarketInsight = {
  source: string
  sampleCount: number
  low: number | null
  high: number | null
  median: number | null
}

function normalizeQueryPart(v: unknown) {
  return String(v ?? '').trim()
}

function toNumberFromText(raw: string) {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

function median(values: number[]) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  return sorted[mid]
}

function extractPricesFromHtml(html: string) {
  const matches = html.match(/(\d{2,4}(?:[.,]\d{3}){1,2}|\d{2,4})\s*(?:triệu|tr|tỷ|ty|đ|vnd)/gi) || []
  const values = matches
    .map((m) => {
      const lower = m.toLowerCase()
      const n = toNumberFromText(lower)
      if (n == null) return null
      if (lower.includes('tỷ') || lower.includes('ty')) return n * 1_000_000_000
      if (lower.includes('triệu') || lower.includes('tr')) return n * 1_000_000
      return n
    })
    .filter((v): v is number => v != null && v > 40_000_000 && v < 15_000_000_000)
  return values
}

async function scrapeMarket(brand: string, model: string, year: string | number): Promise<MarketInsight[]> {
  const query = [normalizeQueryPart(brand), normalizeQueryPart(model), normalizeQueryPart(year)]
    .filter(Boolean)
    .join(' ')

  if (!query) return []

  const targets = [
    { source: 'ChoTot', url: `https://xe.chotot.com/mua-ban-oto?q=${encodeURIComponent(query)}` },
    { source: 'Bonbanh', url: `https://bonbanh.com/oto/?q=${encodeURIComponent(query)}` },
  ]

  const insights: MarketInsight[] = []
  for (const target of targets) {
    try {
      const res = await fetch(target.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        next: { revalidate: 0 },
      })
      if (!res.ok) {
        insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null })
        continue
      }
      const html = await res.text()
      const prices = extractPricesFromHtml(html).slice(0, 120)
      if (!prices.length) {
        insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null })
        continue
      }
      insights.push({
        source: target.source,
        sampleCount: prices.length,
        low: Math.min(...prices),
        high: Math.max(...prices),
        median: median(prices),
      })
    } catch {
      insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null })
    }
  }
  return insights
}

function marketAnchor(insights: MarketInsight[]) {
  const medians = insights
    .map((i) => i.median)
    .filter((n): n is number => n != null && n > 0)
  const lows = insights
    .map((i) => i.low)
    .filter((n): n is number => n != null && n > 0)
  const highs = insights
    .map((i) => i.high)
    .filter((n): n is number => n != null && n > 0)
  if (!medians.length) return null
  return {
    median: median(medians) ?? medians[0],
    low: lows.length ? Math.min(...lows) : null,
    high: highs.length ? Math.max(...highs) : null,
  }
}

function clampToMarket(
  aiLow: number | null,
  aiHigh: number | null,
  market: { median: number; low: number | null; high: number | null } | null
) {
  if (!market || aiLow == null || aiHigh == null) return { low: aiLow, high: aiHigh, adjusted: false }
  const floor = Math.round(market.median * 0.7)
  const ceil = Math.round(market.median * 1.3)
  const low = Math.max(floor, aiLow)
  const high = Math.min(ceil, aiHigh)
  if (high <= low) {
    const spread = Math.max(20_000_000, Math.round(market.median * 0.05))
    return { low: Math.max(floor, market.median - spread), high: Math.min(ceil, market.median + spread), adjusted: true }
  }
  return { low, high, adjusted: low !== aiLow || high !== aiHigh }
}

function fallbackValuation(year?: number, mileage?: number) {
  const nowYear = new Date().getFullYear()
  const safeYear = Number.isFinite(year) ? Number(year) : nowYear - 5
  const safeMileage = Number.isFinite(mileage) ? Number(mileage) : 60000

  const age = Math.max(0, nowYear - safeYear)
  const basePrice = 700_000_000
  const depreciation = Math.min(0.75, age * 0.06)
  const mileageImpact = Math.min(0.2, Math.max(0, safeMileage - 30000) / 100000 * 0.08)
  const center = Math.round(basePrice * Math.max(0.2, 1 - depreciation - mileageImpact))
  const spread = Math.max(20_000_000, Math.round(center * 0.05))

  return {
    price: center,
    priceLow: Math.max(0, center - spread),
    priceHigh: center + spread,
    explanation: `Định giá tạm theo năm xe (${safeYear}) và quãng đường (${safeMileage.toLocaleString('vi-VN')} km) do dịch vụ AI bên ngoài đang lỗi hoặc key chưa hợp lệ.`,
    source: 'fallback',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, model, year, color, mileage } = body
    const parsedYear = Number(year)
    const parsedMileage = Number(mileage)

    const marketInsights = await scrapeMarket(String(brand ?? ''), String(model ?? ''), year)
    const market = marketAnchor(marketInsights)

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ ...fallbackValuation(parsedYear, parsedMileage), marketInsights })
    }

    const prompt = `Bạn là chuyên gia định giá xe ô tô. Hãy định giá chiếc xe sau:
Thông tin xe:
- Hãng: ${brand}
- Model: ${model}
- Năm sản xuất: ${year}
- Màu sắc: ${color}
- Quãng đường chạy: ${mileage} km

Tham chiếu dữ liệu thị trường crawl (nếu có):
${marketInsights
  .map((m) => `- ${m.source}: mẫu=${m.sampleCount}, low=${m.low ?? 'N/A'}, high=${m.high ?? 'N/A'}, median=${m.median ?? 'N/A'}`)
  .join('\n')}

Trả lời đúng 3 dòng:
GIÁ_THẤP_NHẤT: 220000000
GIÁ_CAO_NHẤT: 240000000
GIẢI THÍCH: Phân tích ngắn gọn lý do định giá.

Chỉ trả về đúng 3 dòng như trên, dùng số nguyên VND.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt }
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('gemini error', response.status, errText)
      return NextResponse.json(
        {
          ...fallbackValuation(parsedYear, parsedMileage),
          warning: 'External API error',
          details: errText,
          marketInsights,
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let priceLow: number | null = null
    let priceHigh: number | null = null
    let explanation = ''

    const lowMatch = responseText.match(/GI[AÁ]_TH[AẤ]_NH[AẤ]T:\s*(\d+)/i) ?? responseText.match(/GIA_THAP_NHAT:\s*(\d+)/i)
    const highMatch = responseText.match(/GI[AÁ]_CAO_NH[AẤ]T:\s*(\d+)/i) ?? responseText.match(/GIA_CAO_NHAT:\s*(\d+)/i)
    if (lowMatch) priceLow = parseInt(lowMatch[1], 10)
    if (highMatch) priceHigh = parseInt(highMatch[1], 10)

    if (priceLow == null && priceHigh == null) {
      return NextResponse.json({
        ...fallbackValuation(parsedYear, parsedMileage),
        warning: 'Không đọc được kết quả AI, đã dùng định giá tạm.',
      })
    }
    if (priceLow == null && priceHigh != null) priceLow = Math.max(0, priceHigh - Math.max(20_000_000, Math.round(priceHigh * 0.05)))
    if (priceHigh == null && priceLow != null) priceHigh = priceLow + Math.max(20_000_000, Math.round(priceLow * 0.05))

    const explanationLineMatch = responseText.match(/GI[AẢ]I\s*TH[IÍ]CH:\s*([\s\S]+)/i) ?? responseText.match(/GIAI_THICH:\s*([\s\S]+)/i)
    if (explanationLineMatch) {
      explanation = explanationLineMatch[1].replace(/^GI[AẢ]I\s*TH[IÍ]CH:\s*/i, '').trim()
    } else {
      explanation = responseText.split('\n').slice(2).join(' ').trim() || responseText
    }

    const clamped = clampToMarket(priceLow, priceHigh, market)
    const finalLow = clamped.low
    const finalHigh = clamped.high
    const price = finalLow != null && finalHigh != null ? Math.round((finalLow + finalHigh) / 2) : (finalLow ?? finalHigh)

    const extra = clamped.adjusted
      ? ' Giá đã được chuẩn hóa theo dữ liệu tham chiếu thị trường để tránh lệch quá cao/thấp.'
      : ''

    return NextResponse.json({
      price,
      priceLow: finalLow,
      priceHigh: finalHigh,
      explanation: `${explanation || 'Không có thông tin trả về.'}${extra}`,
      source: 'gemini',
      marketInsights,
    })
  } catch (err: unknown) {
    console.error('valuation api error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
