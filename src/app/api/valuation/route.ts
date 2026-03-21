import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_VERSION =
  process.env.GEMINI_API_VERSION ||
  (GEMINI_MODEL.includes('preview') || GEMINI_MODEL.includes('3.1') ? 'v1beta' : 'v1')

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

    if (!GEMINI_API_KEY) {
      return NextResponse.json(fallbackValuation(parsedYear, parsedMileage))
    }

    const prompt = `Bạn là chuyên gia định giá xe ô tô. Hãy định giá chiếc xe sau:
Thông tin xe:
- Hãng: ${brand}
- Model: ${model}
- Năm sản xuất: ${year}
- Màu sắc: ${color}
- Quãng đường chạy: ${mileage} km

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

    const price = priceLow != null && priceHigh != null ? Math.round((priceLow + priceHigh) / 2) : (priceLow ?? priceHigh)
    return NextResponse.json({ price, priceLow, priceHigh, explanation: explanation || 'Không có thông tin trả về.', source: 'gemini' })
  } catch (err: unknown) {
    console.error('valuation api error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
