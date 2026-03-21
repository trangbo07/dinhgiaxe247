import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_VERSION =
  process.env.GEMINI_API_VERSION ||
  (GEMINI_MODEL.includes('preview') || GEMINI_MODEL.includes('3.1') ? 'v1beta' : 'v1')

type ChatMessage = { role: 'user' | 'assistant'; text: string }
type VehicleContext = {
  brand?: string
  model?: string
  year?: string | number
  color?: string
  mileage?: string | number
  version?: string
}

type MarketInsight = {
  source: string
  sampleCount: number
  low: number | null
  high: number | null
  median: number | null
  note: string
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
  const maxAgeDays = 20
  const now = new Date()
  const priceRegex = /(\d{2,4}(?:[.,]\d{3}){1,2}|\d{2,4})\s*(triệu|tr|tỷ|ty|đ|vnd)/gi
  const values: number[] = []

  function parseAgeDays(context: string): number | null {
    const t = context.toLowerCase()
    if (t.includes('hôm nay') || t.includes('hom nay') || t.includes('vừa đăng') || t.includes('mới đăng')) return 0
    if (t.includes('hôm qua') || t.includes('hom qua')) return 1

    const dayAgo = t.match(/(\d+)\s*ngày\s*trước/)
    if (dayAgo) return Number(dayAgo[1])
    const weekAgo = t.match(/(\d+)\s*tuần\s*trước/)
    if (weekAgo) return Number(weekAgo[1]) * 7

    const dateMatch = t.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/)
    if (dateMatch) {
      const d = Number(dateMatch[1])
      const m = Number(dateMatch[2]) - 1
      let y = Number(dateMatch[3])
      if (y < 100) y += 2000
      const posted = new Date(y, m, d)
      const diffMs = now.getTime() - posted.getTime()
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      return Number.isFinite(days) ? days : null
    }
    return null
  }

  let match: RegExpExecArray | null
  while ((match = priceRegex.exec(html)) !== null) {
    const amountRaw = match[1]
    const unit = match[2].toLowerCase()
    const contextStart = Math.max(0, match.index - 220)
    const contextEnd = Math.min(html.length, match.index + match[0].length + 220)
    const context = html.slice(contextStart, contextEnd)
    const ageDays = parseAgeDays(context)

    if (ageDays == null || ageDays > maxAgeDays) continue

    const n = toNumberFromText(amountRaw)
    if (n == null) continue
    const price =
      unit.includes('tỷ') || unit.includes('ty')
        ? n * 1_000_000_000
        : unit.includes('triệu') || unit.includes('tr')
          ? n * 1_000_000
          : n
    if (price > 40_000_000 && price < 15_000_000_000) values.push(price)
  }

  return values
}

async function scrapeMarket(vehicle: VehicleContext): Promise<MarketInsight[]> {
  const query = [
    normalizeQueryPart(vehicle.brand),
    normalizeQueryPart(vehicle.model),
    normalizeQueryPart(vehicle.year),
  ]
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
        insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null, note: `HTTP ${res.status}` })
        continue
      }
      const html = await res.text()
      const prices = extractPricesFromHtml(html).slice(0, 120)
      if (!prices.length) {
        insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null, note: 'Khong doc duoc gia tu trang.' })
        continue
      }
      const low = Math.min(...prices)
      const high = Math.max(...prices)
      insights.push({
        source: target.source,
        sampleCount: prices.length,
        low,
        high,
        median: median(prices),
        note: 'Gia tham khao auto-crawl, can xac minh thu cong truoc khi chot giao dich.',
      })
    } catch {
      insights.push({ source: target.source, sampleCount: 0, low: null, high: null, median: null, note: 'Khong ket noi duoc nguon.' })
    }
  }
  return insights
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history, basePrice, priceLow, priceHigh, vehicle } = body as {
      message?: string
      history?: ChatMessage[]
      basePrice?: number | null
      priceLow?: number | null
      priceHigh?: number | null
      vehicle?: VehicleContext
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Thiếu nội dung câu hỏi.' }, { status: 400 })
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Thiếu GEMINI_API_KEY/GOOGLE_API_KEY.' }, { status: 503 })
    }

    const marketInsights = await scrapeMarket(vehicle || {})
    const marketContext =
      marketInsights.length === 0
        ? 'Khong co du lieu crawl thi truong.'
        : marketInsights
            .map((m) => {
              const range = m.low != null && m.high != null ? `${m.low} - ${m.high}` : 'N/A'
              return `- ${m.source}: mau=${m.sampleCount}, range=${range}, median=${m.median ?? 'N/A'}, note=${m.note}`
            })
            .join('\n')

    const context = `Bạn là trợ lý định giá xe ValuCar. Trả lời ngắn gọn, dễ hiểu, tiếng Việt.
Nếu người dùng hỏi về ảnh hưởng đến giá, hãy tham chiếu mốc sau:
- Giá giữa hiện tại: ${basePrice ?? 'chưa có'}
- Giá thấp: ${priceLow ?? 'chưa có'}
- Giá cao: ${priceHigh ?? 'chưa có'}
Thông tin xe hiện tại:
- Hãng: ${vehicle?.brand ?? 'chưa có'}
- Model: ${vehicle?.model ?? 'chưa có'}
- Năm: ${vehicle?.year ?? 'chưa có'}
- Màu: ${vehicle?.color ?? 'chưa có'}
- Km: ${vehicle?.mileage ?? 'chưa có'}
Dữ liệu crawl thị trường:
${marketContext}
Không bịa dữ liệu kỹ thuật; khi thiếu dữ kiện thì hỏi thêm 1-2 thông tin cần thiết.
Nếu có dữ liệu crawl thì phải trích dẫn ngắn theo dạng "Theo crawl Chợ Tốt/Bonbanh...".`

    const normalizedHistory = Array.isArray(history) ? history.slice(-8) : []
    const contents = [
      { role: 'user', parts: [{ text: context }] },
      ...normalizedHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message.trim() }] },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    )

    if (!response.ok) {
      const details = await response.text()
      return NextResponse.json({ error: 'External API error', details }, { status: response.status })
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!reply) {
      return NextResponse.json({ error: 'AI không trả về nội dung.' }, { status: 502 })
    }

    return NextResponse.json({ reply, source: 'gemini', marketInsights })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
