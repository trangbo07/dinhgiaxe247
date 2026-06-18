import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { getClientIp } from '@/lib/client-ip'
import { rateLimitAuthChat, rateLimitGuestChat } from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/api-rate-limit-response'
import { fetchMarketInsights, aggregateMarket, formatMarketContext } from '@/lib/market-data'

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

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    const isGuest = !session?.user?.id

    if (isGuest) {
      const ip = getClientIp(request)
      const lim = rateLimitGuestChat(ip)
      if (!lim.allowed) return rateLimitResponse(lim)
    } else {
      const lim = rateLimitAuthChat(session!.user!.id)
      if (!lim.allowed) return rateLimitResponse(lim)
    }

    const body = await request.json()
    const { message, history, basePrice, priceLow, priceHigh, vehicle } = body as {
      message?: string
      history?: ChatMessage[]
      basePrice?: number | null
      priceLow?: number | null
      priceHigh?: number | null
      vehicle?: VehicleContext
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Thiếu nội dung câu hỏi.' }, { status: 400 })
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Thiếu GEMINI_API_KEY/GOOGLE_API_KEY.' }, { status: 503 })
    }

    // ── Fetch market data ────────────────────────────────────────────────
    const v = vehicle ?? {}
    const marketInsights = await fetchMarketInsights(
      String(v.brand ?? ''),
      String(v.model ?? ''),
      v.year ?? ''
    )
    const market = aggregateMarket(marketInsights)
    const marketBlock = formatMarketContext(marketInsights)

    // ── Build system context ─────────────────────────────────────────────
    const fmt = (n: unknown) =>
      typeof n === 'number' ? n.toLocaleString('vi-VN') + ' VND' : String(n ?? 'chưa có')

    const systemContext = `Bạn là chuyên gia tư vấn định giá xe ValuCar. Trả lời ngắn gọn, thực tế, bằng tiếng Việt.
${isGuest ? 'Người dùng là KHÁCH (chưa đăng nhập) — trả lời súc tích, tối đa 120 từ.' : ''}

THÔNG TIN XE ĐANG TƯ VẤN:
- Hãng / Model: ${v.brand ?? 'chưa có'} ${v.model ?? ''}
- Năm: ${v.year ?? 'chưa có'} | Màu: ${v.color ?? 'chưa có'} | ODO: ${v.mileage ? Number(v.mileage).toLocaleString('vi-VN') + ' km' : 'chưa có'}
- Định giá hiện tại: ${fmt(basePrice)} (khoảng ${fmt(priceLow)} – ${fmt(priceHigh)})

DỮ LIỆU THỊ TRƯỜNG THỰC TẾ (Chợ Tốt + Bonbanh, 30 ngày qua, đã lọc IQR):
${marketBlock}
${market ? `→ Trung vị tổng hợp: ${market.median.toLocaleString('vi-VN')} VND (${market.totalSamples} mẫu)` : '→ Chưa có dữ liệu thị trường.'}

QUY TẮC TRẢ LỜI:
- Trích dẫn nguồn "Theo Chợ Tốt/Bonbanh..." khi có dữ liệu.
- Không bịa số liệu kỹ thuật.
- Nếu thiếu thông tin, hỏi thêm 1–2 điểm cụ thể.
- Giữ câu trả lời dưới 150 từ trừ khi cần phân tích chi tiết.`

    // ── Build conversation ────────────────────────────────────────────────
    const normalizedHistory = Array.isArray(history) ? history.slice(-8) : []
    const contents = [
      { role: 'user', parts: [{ text: systemContext }] },
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
