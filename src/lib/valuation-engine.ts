import { callGemini } from '@/lib/gemini-client'

export type ValuationInput = {
  brand: string
  model: string
  year: number
  version?: string
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
  warning?: string
}

// Giá rao trên Chợ Tốt/Bonbanh thường cao hơn giá giao dịch thực 5–7%.
const TRANSACTION_DISCOUNT = Number(process.env.VALUATION_TRANSACTION_DISCOUNT_PCT ?? 6) / 100

// Người mua thường mặc cả thêm 6–8% so với giá giao dịch niêm yết.
const BUY_INTENT_DISCOUNT_PCT = Number(process.env.VALUATION_BUY_INTENT_PCT ?? 7) / 100

// Dùng priceLow AI làm neo, kéo toàn bộ khoảng hiển thị xuống dưới neo đó.
// displayHigh = anchor × (1 - HIGH_DROP) → VD 800M × 0.90 = 720M
// displayLow  = anchor × (1 - LOW_DROP)  → VD 800M × 0.875 = 700M
const DISPLAY_HIGH_DROP = Number(process.env.VALUATION_DISPLAY_HIGH_DROP ?? 10) / 100
const DISPLAY_LOW_DROP  = Number(process.env.VALUATION_DISPLAY_LOW_DROP  ?? 12.5) / 100

function applyTransactionDiscount<T extends ValuationResult>(p: T): T {
  const discount = Math.max(0.05, Math.min(0.10, TRANSACTION_DISCOUNT))
  const lo = Math.max(0, Math.round(p.priceLow * (1 - discount)))
  const hi = Math.max(lo + 5_000_000, Math.round(p.priceHigh * (1 - discount)))
  const price = Math.round((lo + hi) / 2)
  return {
    ...p,
    price,
    priceLow: lo,
    priceHigh: hi,
    explanation: `${p.explanation} (Giá đã điều chỉnh về mức giao dịch thực tế, thấp hơn giá rao niêm yết ~${Math.round(discount * 100)}%.)`,
  }
}

function isBuyIntent(intent: unknown) {
  if (typeof intent !== 'string') return false
  return ['mua', 'buy'].includes(intent.trim().toLowerCase())
}

function applyBuyIntent<T extends ValuationResult>(p: T, intent: unknown): T {
  if (!isBuyIntent(intent)) return p
  const pct = Math.max(0.05, Math.min(0.10, BUY_INTENT_DISCOUNT_PCT))
  const lo = Math.max(0, Math.round(p.priceLow * (1 - pct)))
  const hi = Math.max(lo + 5_000_000, Math.round(p.priceHigh * (1 - pct)))
  const deductedM = Math.round((p.price - Math.round((lo + hi) / 2)) / 1_000_000)
  return {
    ...p,
    price: Math.round((lo + hi) / 2),
    priceLow: lo,
    priceHigh: hi,
    explanation: `${p.explanation} Giá mua tham khảo: đã trừ thêm ~${deductedM} triệu (~${Math.round(pct * 100)}% biên thương lượng phổ biến phía người mua).`,
  }
}

function applyMinAnchorSpread<T extends ValuationResult>(r: T): T {
  const anchor = r.priceLow
  const hi = Math.round(anchor * (1 - DISPLAY_HIGH_DROP))
  const lo = Math.max(0, Math.round(anchor * (1 - DISPLAY_LOW_DROP)))
  return { ...r, price: lo, priceLow: lo, priceHigh: hi }
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
    explanation: `Định giá dự phòng theo năm (${y}) và ODO (${km.toLocaleString('vi-VN')} km) — AI không khả dụng.`,
    source: 'fallback',
  }
}

function buildValuationPrompt(input: ValuationInput): string {
  const { brand, model, year, version, color, mileage } = input
  const nowY = new Date().getFullYear()
  const age = Math.max(0, nowY - Number(year || nowY))
  const km = Number(mileage) || 0
  const expectedKm = age * 15_000
  const kmDelta = km - expectedKm
  const kmAdjPct = Math.round((-kmDelta / 10_000) * 1.5 * 10) / 10

  const colorNote =
    color === 'Trắng' || color === 'Bạc'
      ? '(màu phổ biến — thanh khoản tốt, không điều chỉnh giá)'
      : color === 'Đen'
        ? '(phổ biến, không điều chỉnh giá)'
        : '(màu ít phổ biến — giảm 1–2% so với trắng/bạc)'

  const versionNote = version
    ? `Phiên bản "${version}" — phân biệt chính xác mức trang bị so với các bản khác cùng model (ảnh hưởng 10–25% giá).`
    : ''

  return `Bạn là chuyên gia định giá xe ô tô cũ Việt Nam với 15 năm kinh nghiệm thực tế.
Dựa trên kiến thức thị trường xe cũ Việt Nam, hãy định giá xe dưới đây.

=== THÔNG TIN XE ===
Hãng / Model: ${brand} ${model}${version ? ` ${version}` : ''}
Năm sản xuất: ${year} (${age} tuổi)
Quãng đường: ${km.toLocaleString('vi-VN')} km (kỳ vọng ~${expectedKm.toLocaleString('vi-VN')} km → điều chỉnh ${kmAdjPct > 0 ? '+' : ''}${kmAdjPct}%)
Màu sắc: ${color} ${colorNote}
${versionNote}

=== HƯỚNG DẪN ĐỊNH GIÁ ===
- Áp dụng mức giá thị trường xe cũ Việt Nam thực tế (Chợ Tốt, Bonbanh, showroom).
- Khấu hao chuẩn: năm 1 ~15%, năm 2–5 ~8%/năm, sau 5 năm ~5%/năm. Điều chỉnh theo thương hiệu/phân khúc.
- Mỗi 10.000 km vượt kỳ vọng → giảm ~1.5% giá; thiếu → tăng ~1.5%.
- Đây là GIÁ RAO NIÊM YẾT (chưa trừ chiết khấu giao dịch thực tế).
- Biên độ thấp–cao: 8–12% của giá trung tâm.

=== ĐẦU RA (ĐÚNG 3 DÒNG, KHÔNG CÓ GÌ KHÁC) ===
GIÁ_THẤP_NHẤT: {số nguyên VND}
GIÁ_CAO_NHẤT: {số nguyên VND}
GIẢI THÍCH: {2–3 câu: phân tích khấu hao, ODO, phiên bản, kết luận giá}`
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
  const { year, mileage, intent } = input
  const parsedYear = Number(year)
  const parsedMileage = Number(mileage)

  // Pipeline: transaction discount → buy intent → anchor spread
  const finalise = <T extends ValuationResult>(r: T) =>
    applyMinAnchorSpread(applyBuyIntent(applyTransactionDiscount(r), intent))

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return finalise(fallback(parsedYear, parsedMileage))
  }

  const prompt = buildValuationPrompt(input)

  let geminiText = ''
  try {
    geminiText = await callGemini(prompt)
  } catch (err) {
    console.error('Gemini valuation failed', err)
    return finalise(fallback(parsedYear, parsedMileage))
  }

  const { low: rawLow, high: rawHigh, explanation } = parseGeminiResponse(geminiText)

  if (rawLow == null && rawHigh == null) {
    return finalise({ ...fallback(parsedYear, parsedMileage), warning: 'AI format error' })
  }

  let priceLow = rawLow
  let priceHigh = rawHigh
  if (priceLow == null && priceHigh != null)
    priceLow = Math.max(0, priceHigh - Math.round(priceHigh * 0.08))
  if (priceHigh == null && priceLow != null)
    priceHigh = priceLow + Math.round(priceLow * 0.08)

  const price = Math.round(((priceLow ?? 0) + (priceHigh ?? 0)) / 2)

  return finalise({
    price,
    priceLow: priceLow ?? 0,
    priceHigh: priceHigh ?? 0,
    explanation: explanation || 'Không có giải thích từ AI.',
    source: 'gemini',
  })
}
