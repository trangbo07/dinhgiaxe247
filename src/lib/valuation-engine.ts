import { callGemini } from '@/lib/gemini-client'
import {
  fetchMarketInsights,
  aggregateMarket,
  formatMarketContext,
  type MarketInsight,
} from '@/lib/market-data'

export type ValuationInput = {
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  intent?: string
}

export type ValuationResult = {
  price: number
  priceLow: number
  priceHigh: number
  explanation: string
  source?: string
  marketInsights?: MarketInsight[]
  warning?: string
}

const BUY_INTENT_DEDUCTION = 65_000_000

function isBuyIntent(intent: unknown) {
  if (typeof intent !== 'string') return false
  return ['mua', 'buy'].includes(intent.trim().toLowerCase())
}

function applyBuyIntent<T extends ValuationResult>(p: T, intent: unknown): T {
  if (!isBuyIntent(intent)) return p
  const lo = Math.max(0, p.priceLow - BUY_INTENT_DEDUCTION)
  const hi = Math.max(lo + 5_000_000, p.priceHigh - BUY_INTENT_DEDUCTION)
  return {
    ...p,
    price: Math.round((lo + hi) / 2),
    priceLow: lo,
    priceHigh: hi,
    explanation: `${p.explanation} Giá mua tham khảo: đã trừ ~60–70 triệu so với giá rao (mức thương lượng phổ biến).`,
  }
}

function fallback(year?: number, mileage?: number): ValuationResult {
  const nowY = new Date().getFullYear()
  const y = Number.isFinite(year) ? Number(year) : nowY - 5
  const km = Number.isFinite(mileage) ? Number(mileage) : 60_000
  const age = Math.max(0, nowY - y)
  const dep = Math.min(0.75, age * 0.06)
  const mi = Math.min(0.2, Math.max(0, km - 30_000) / 100_000 * 0.08)
  const center = Math.round(700_000_000 * Math.max(0.2, 1 - dep - mi))
  const spread = Math.max(20_000_000, Math.round(center * 0.05))
  return {
    price: center,
    priceLow: Math.max(0, center - spread),
    priceHigh: center + spread,
    explanation: `Định giá dự phòng theo năm (${y}) và ODO (${km.toLocaleString('vi-VN')} km) — AI ngoài không khả dụng.`,
    source: 'fallback',
  }
}

function buildValuationPrompt(
  brand: string,
  model: string,
  year: unknown,
  color: string,
  mileage: unknown,
  insights: MarketInsight[],
  market: ReturnType<typeof aggregateMarket>
): string {
  const nowY = new Date().getFullYear()
  const age = Math.max(0, nowY - Number(year || nowY))
  const expectedKm = age * 15_000
  const marketBlock = formatMarketContext(insights)

  const marketInstruction = market
    ? `Sử dụng trung vị thị trường ${market.median.toLocaleString('vi-VN')} VND làm mốc trung tâm.
Dải hợp lý tham chiếu: ${market.p25.toLocaleString('vi-VN')} – ${market.p75.toLocaleString('vi-VN')} VND (tứ phân vị).
Điều chỉnh ±3-5% cho mỗi 15.000 km lệch so với mức kỳ vọng (~${expectedKm.toLocaleString('vi-VN')} km).`
    : `Không có dữ liệu thị trường. Dùng kiến thức chuyên ngành và mức khấu hao tiêu chuẩn thị trường VN.`

  return `Bạn là chuyên gia định giá xe ô tô cũ Việt Nam. Phân tích và định giá xe dưới đây.

=== THÔNG TIN XE ===
Hãng / Model: ${brand} ${model}
Năm sản xuất: ${year} (${age} tuổi)
Màu sắc: ${color}
Quãng đường: ${Number(mileage).toLocaleString('vi-VN')} km

=== DỮ LIỆU THỊ TRƯỜNG THỰC TẾ (đã lọc ngoại lệ IQR) ===
${marketBlock}

=== HƯỚNG DẪN ĐỊNH GIÁ ===
${marketInstruction}
Biên độ giá thấp–cao nên là 6–10% của giá trung tâm (phản ánh bất định về tình trạng thực tế).
Nếu có nhiều nguồn dữ liệu, trọng số theo số lượng mẫu.
Trích dẫn nguồn dữ liệu thị trường trong phần giải thích.

=== ĐẦU RA (ĐÚNG 3 DÒNG, KHÔNG CÓ GÌ KHÁC) ===
GIÁ_THẤP_NHẤT: {số nguyên VND}
GIÁ_CAO_NHẤT: {số nguyên VND}
GIẢI THÍCH: {1–2 câu tóm tắt lý do và nguồn dữ liệu tham chiếu}`
}

function parseGeminiResponse(text: string) {
  const lowM =
    text.match(/GI[AÁ]_TH[AẤ]P_NH[AẤ]T\s*:\s*(\d+)/i) ??
    text.match(/GIA_THAP_NHAT\s*:\s*(\d+)/i)
  const hiM =
    text.match(/GI[AÁ]_CAO_NH[AẤ]T\s*:\s*(\d+)/i) ??
    text.match(/GIA_CAO_NHAT\s*:\s*(\d+)/i)
  const explM =
    text.match(/GI[AẢ]I\s*TH[IÍ]CH\s*:\s*([\s\S]+)/i) ??
    text.match(/GIAI_THICH\s*:\s*([\s\S]+)/i)

  const low = lowM ? parseInt(lowM[1], 10) : null
  const high = hiM ? parseInt(hiM[1], 10) : null
  const explanation = explM
    ? explM[1].replace(/^GI[AẢ]I\s*TH[IÍ]CH\s*:\s*/i, '').trim()
    : text.split('\n').slice(2).join(' ').trim()

  return { low, high, explanation }
}

export async function runValuation(input: ValuationInput): Promise<ValuationResult> {
  const { brand, model, year, color, mileage, intent } = input
  const parsedYear = Number(year)
  const parsedMileage = Number(mileage)

  const marketInsights = await fetchMarketInsights(String(brand ?? ''), String(model ?? ''), year)
  const market = aggregateMarket(marketInsights)

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    if (market) {
      const spread = Math.max(20_000_000, Math.round(market.median * 0.07))
      const lo = Math.max(0, market.p25 ?? market.median - spread)
      const hi = market.p75 ?? market.median + spread
      return applyBuyIntent(
        {
          price: market.median,
          priceLow: lo,
          priceHigh: hi,
          explanation: `Định giá theo dữ liệu niêm yết (${market.totalSamples} tin rao). Chưa cấu hình Gemini API.`,
          source: 'market',
          marketInsights,
        },
        intent
      )
    }
    return applyBuyIntent({ ...fallback(parsedYear, parsedMileage), marketInsights }, intent)
  }

  const prompt = buildValuationPrompt(
    String(brand ?? ''),
    String(model ?? ''),
    year,
    String(color ?? ''),
    mileage,
    marketInsights,
    market
  )

  let geminiText = ''
  try {
    geminiText = await callGemini(prompt)
  } catch (err) {
    console.error('Gemini valuation failed', err)
    if (market) {
      const spread = Math.max(20_000_000, Math.round(market.median * 0.07))
      return applyBuyIntent(
        {
          price: market.median,
          priceLow: Math.max(0, market.p25 ?? market.median - spread),
          priceHigh: market.p75 ?? market.median + spread,
          explanation: `Gemini tạm thời không khả dụng. Định giá từ ${market.totalSamples} tin rao thực tế.`,
          source: 'market',
          marketInsights,
        },
        intent
      )
    }
    return applyBuyIntent({ ...fallback(parsedYear, parsedMileage), marketInsights }, intent)
  }

  const { low: rawLow, high: rawHigh, explanation } = parseGeminiResponse(geminiText)

  if (rawLow == null && rawHigh == null) {
    if (market) {
      const spread = Math.max(20_000_000, Math.round(market.median * 0.07))
      return applyBuyIntent(
        {
          price: market.median,
          priceLow: Math.max(0, market.p25 ?? market.median - spread),
          priceHigh: market.p75 ?? market.median + spread,
          explanation: `Định giá từ dữ liệu thị trường (${market.totalSamples} mẫu).`,
          source: 'market',
          marketInsights,
        },
        intent
      )
    }
    return applyBuyIntent(
      { ...fallback(parsedYear, parsedMileage), warning: 'AI format error', marketInsights },
      intent
    )
  }

  let priceLow = rawLow
  let priceHigh = rawHigh
  if (priceLow == null && priceHigh != null)
    priceLow = Math.max(0, priceHigh - Math.round(priceHigh * 0.08))
  if (priceHigh == null && priceLow != null)
    priceHigh = priceLow + Math.round(priceLow * 0.08)

  if (market && priceLow != null && priceHigh != null) {
    const floor = Math.round(market.median * 0.6)
    const ceil = Math.round(market.median * 1.4)
    priceLow = Math.max(floor, Math.min(ceil, priceLow))
    priceHigh = Math.max(floor, Math.min(ceil, priceHigh))
    if (priceHigh <= priceLow) {
      priceHigh = priceLow + Math.max(20_000_000, Math.round(market.median * 0.06))
    }
  }

  const price = Math.round(((priceLow ?? 0) + (priceHigh ?? 0)) / 2)

  return applyBuyIntent(
    {
      price,
      priceLow: priceLow ?? 0,
      priceHigh: priceHigh ?? 0,
      explanation: explanation || 'Không có giải thích từ AI.',
      source: market ? 'gemini+market' : 'gemini',
      marketInsights,
    },
    intent
  )
}
