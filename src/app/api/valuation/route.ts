import { NextRequest, NextResponse } from 'next/server'

// NOTE: paste your Gemini/OpenAI API key directly here for testing
const GEMINI_API_KEY = 'AIzaSyCYEILpEhHSptp5Lt0iZLJzto5JjsFrVDM'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, model, year, color, mileage } = body

    // build a prompt for the Gemini model
    const prompt = `Bạn là chuyên gia định giá xe ô tô. Hãy định giá chiếc xe sau:
Thông tin xe:
- Hãng: ${brand}
- Model: ${model}
- Năm sản xuất: ${year}
- Màu sắc: ${color}
- Quãng đường chạy: ${mileage} km

Hãy trả lời với định dạng chính xác sau:
GIÁ: 150000000
GIẢI THÍCH: Xe có mức giá dựa trên độ cũ, quãng đường chạy và tình trạng thị trường hiện tại.

Hãy thay thế 150000000 bằng giá thực tế của xe (.... triệu VND). Chỉ trả lời theo đúng định dạng trên, không thêm gì khác.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      return NextResponse.json({ error: 'External API error', details: errText }, { status: response.status })
    }

    const data = await response.json()
    console.log('gemini response', JSON.stringify(data, null, 2))
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('response text:', responseText)

    // parse response to extract price and explanation
    // more robust parsing - look for "GIÁ:" followed by digits
    let estimatedPrice = null
    let explanation = ''

    // Extract price - look for GIÁ: followed by numbers
    const priceLineMatch = responseText.match(/GI[ÁA]:\s*(\d+)/i)
    if (priceLineMatch) {
      estimatedPrice = parseInt(priceLineMatch[1])
      console.log('extracted price:', estimatedPrice)
    }

    // Extract explanation - look for GIẢI THÍCH: or similar and remove the prefix
    const explanationLineMatch = responseText.match(/GI[ÁA]I\s*TH[ÍI]CH:\s*(.+?)(?=\n|$)/i)
    if (explanationLineMatch) {
      explanation = explanationLineMatch[1].trim()
    } else {
      // fallback: use the whole response if we can't find the explanation
      explanation = responseText.split('\n').slice(1).join(' ').trim() || responseText
    }
    
    // Clean up explanation - remove any remaining GIẢI THÍCH: prefix
    explanation = explanation.replace(/^GI[ÁA]I\s*TH[ÍI]CH:\s*/i, '').trim()

    console.log('extracted explanation:', explanation)
    console.log('final price:', estimatedPrice)

    return NextResponse.json({ price: estimatedPrice, explanation: explanation || 'Không có thông tin trả về.' })
  } catch (err: any) {
    console.error('valuation api error', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
