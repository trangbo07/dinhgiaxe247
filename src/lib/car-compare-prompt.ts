import type {
  CarCompareReport,
  CompareCarInput,
  CompareValuationSnapshot,
} from '@/lib/car-compare-types'

function fmtVnd(n: number) {
  return `${n.toLocaleString('vi-VN')} VND`
}

function fmtMillion(n: number) {
  return `${(n / 1e6).toFixed(0)} triệu`
}

function carBlock(
  tag: 'A' | 'B',
  car: CompareCarInput,
  val: CompareValuationSnapshot
) {
  const nowY = new Date().getFullYear()
  const age = Math.max(0, nowY - car.year)
  const expectedKm = age * 15_000
  const kmDelta = car.mileage - expectedKm

  return `=== XE ${tag}: ${car.label} ===
Hãng / Dòng: ${car.brand} ${car.model}
Phiên bản: ${car.version}
Năm SX: ${car.year} (${age} tuổi)
Màu: ${car.color}
ODO: ${car.mileage.toLocaleString('vi-VN')} km (kỳ vọng ~${expectedKm.toLocaleString('vi-VN')} km, lệch ${kmDelta >= 0 ? '+' : ''}${kmDelta.toLocaleString('vi-VN')} km)
Giá tham chiếu ValuCar: ${fmtVnd(val.priceLow)} – ${fmtVnd(val.priceHigh)} (giữa: ${fmtVnd(val.price)})
Giá / km ước tính: ${car.mileage > 0 ? Math.round(val.price / car.mileage).toLocaleString('vi-VN') : '—'} VND/km
Ghi chú định giá: ${val.explanation}`
}

/** Prompt so sánh 2 xe — bắt buộc trả JSON theo template */
export function buildCarComparePrompt(
  carA: CompareCarInput,
  carB: CompareCarInput,
  valA: CompareValuationSnapshot,
  valB: CompareValuationSnapshot
): string {
  const midA = Math.round((valA.priceLow + valA.priceHigh) / 2)
  const midB = Math.round((valB.priceLow + valB.priceHigh) / 2)
  const gap = Math.abs(midA - midB)

  return `Bạn là chuyên gia tư vấn mua xe ô tô cũ tại Việt Nam với 15 năm kinh nghiệm thẩm định & môi giới.
Nhiệm vụ: SO SÁNH CHI TIẾT hai xe dưới đây cho người mua cá nhân, chỉ ra chênh lệch rõ ràng và khuyến nghị cụ thể.

${carBlock('A', carA, valA)}

${carBlock('B', carB, valB)}

=== BỐI CẢNH ===
Chênh lệch giá giữa (giữa khoảng): ${fmtMillion(gap)} (${fmtVnd(gap)})
Mục đích: mua xe để sử dụng cá nhân (giá đã là mức mua tham khảo, không phải giá rao).

=== YÊU CẦU PHÂN TÍCH ===
1. So sánh ít nhất 10 tiêu chí trong comparisonRows (giá mua, ODO, tuổi xe, phiên bản/option, màu sắc, chi phí/km, thanh khoản, chi phí bảo dưỡng ước tính, rủi ro hao mòn, phù hợp nhu cầu đô thị/đường dài…).
2. Mỗi dòng phải có: criteria, valueA, valueB, advantage (A|B|NGANG), gap (mô tả chênh lệch cụ thể), explanation (1–2 câu giải thích vì sao).
3. priceAnalysis: 2–4 đoạn phân tích chênh lệch giá, yếu tố làm xe A/B đắt/rẻ hơn.
4. technicalAnalysis: so sánh động cơ, hộp số, trang bị phiên bản, tuổi xe vs km.
5. ownershipCost: ước tính chi phí sở hữu 12 tháng tới (bảo dưỡng, lốp, phí đường bộ…).
6. risks: mảng 3–6 rủi ro cần kiểm tra khi đi xem xe (mỗi phần tử 1 câu).
7. negotiationA / negotiationB: mức thương lượng gợi ý cho từng xe (triệu VND hoặc %).
8. finalAdvice: lời khuyên cuối 2–3 câu, thực tế.

=== ĐẦU RA (CHỈ JSON HỢP LỆ, KHÔNG MARKDOWN, KHÔNG \`\`\`) ===
{
  "verdict": {
    "pick": "A" | "B" | "TUY_NHU_CAU",
    "headline": "câu kết luận ngắn gọn (tối đa 120 ký tự)",
    "summary": "2–3 câu tóm tắt lý do chọn",
    "priceGapVnd": ${gap},
    "priceGapLabel": "mô tả chênh lệch bằng tiếng Việt (vd: Xe A rẻ hơn ~35 triệu)"
  },
  "comparisonRows": [
    {
      "criteria": "string",
      "valueA": "string",
      "valueB": "string",
      "advantage": "A" | "B" | "NGANG",
      "gap": "string",
      "explanation": "string"
    }
  ],
  "priceAnalysis": "string",
  "technicalAnalysis": "string",
  "ownershipCost": "string",
  "risks": ["string"],
  "negotiationA": "string",
  "negotiationB": "string",
  "finalAdvice": "string"
}`
}

function extractJson(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

function normalizeAdvantage(v: unknown): 'A' | 'B' | 'NGANG' {
  const s = String(v ?? '').toUpperCase()
  if (s === 'A' || s.includes('XE A')) return 'A'
  if (s === 'B' || s.includes('XE B')) return 'B'
  return 'NGANG'
}

function normalizePick(v: unknown): 'A' | 'B' | 'TUY_NHU_CAU' {
  const s = String(v ?? '').toUpperCase()
  if (s === 'A') return 'A'
  if (s === 'B') return 'B'
  return 'TUY_NHU_CAU'
}

export function parseCarCompareReport(raw: string): CarCompareReport | null {
  try {
    const parsed = JSON.parse(extractJson(raw)) as Partial<CarCompareReport>
    if (!parsed.verdict || !Array.isArray(parsed.comparisonRows)) return null

    return {
      verdict: {
        pick: normalizePick(parsed.verdict.pick),
        headline: String(parsed.verdict.headline ?? 'Kết quả so sánh'),
        summary: String(parsed.verdict.summary ?? ''),
        priceGapVnd: Number(parsed.verdict.priceGapVnd) || 0,
        priceGapLabel: String(parsed.verdict.priceGapLabel ?? ''),
      },
      comparisonRows: parsed.comparisonRows.map((row) => ({
        criteria: String(row.criteria ?? ''),
        valueA: String(row.valueA ?? '—'),
        valueB: String(row.valueB ?? '—'),
        advantage: normalizeAdvantage(row.advantage),
        gap: String(row.gap ?? '—'),
        explanation: String(row.explanation ?? ''),
      })),
      priceAnalysis: String(parsed.priceAnalysis ?? ''),
      technicalAnalysis: String(parsed.technicalAnalysis ?? ''),
      ownershipCost: String(parsed.ownershipCost ?? ''),
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      negotiationA: String(parsed.negotiationA ?? ''),
      negotiationB: String(parsed.negotiationB ?? ''),
      finalAdvice: String(parsed.finalAdvice ?? ''),
    }
  } catch {
    return null
  }
}

/** Báo cáo dự phòng khi AI lỗi — vẫn có template đọc được */
export function buildFallbackCompareReport(
  carA: CompareCarInput,
  carB: CompareCarInput,
  valA: CompareValuationSnapshot,
  valB: CompareValuationSnapshot
): CarCompareReport {
  const midA = Math.round((valA.priceLow + valA.priceHigh) / 2)
  const midB = Math.round((valB.priceLow + valB.priceHigh) / 2)
  const gap = Math.abs(midA - midB)
  const cheaper = midA < midB ? 'A' : midB < midA ? 'B' : 'NGANG'
  const pick = cheaper === 'NGANG' ? 'TUY_NHU_CAU' : (cheaper as 'A' | 'B')

  const perKmA = carA.mileage > 0 ? Math.round(midA / carA.mileage) : 0
  const perKmB = carB.mileage > 0 ? Math.round(midB / carB.mileage) : 0

  return {
    verdict: {
      pick,
      headline:
        pick === 'TUY_NHU_CAU'
          ? 'Hai xe ngang giá — chọn theo nhu cầu sử dụng'
          : `Xe ${pick} có giá mua tham chiếu thấp hơn`,
      summary: `Chênh lệch giữa khoảng giá khoảng ${fmtMillion(gap)}. Xe A: ${carA.year} · ${carA.mileage.toLocaleString('vi-VN')} km. Xe B: ${carB.year} · ${carB.mileage.toLocaleString('vi-VN')} km.`,
      priceGapVnd: gap,
      priceGapLabel:
        cheaper === 'NGANG'
          ? 'Hai xe sát giá nhau'
          : `Xe ${cheaper} rẻ hơn khoảng ${fmtMillion(gap)}`,
    },
    comparisonRows: [
      {
        criteria: 'Giá mua tham chiếu',
        valueA: `${fmtMillion(valA.priceLow)} – ${fmtMillion(valA.priceHigh)}`,
        valueB: `${fmtMillion(valB.priceLow)} – ${fmtMillion(valB.priceHigh)}`,
        advantage: cheaper === 'NGANG' ? 'NGANG' : (cheaper as 'A' | 'B'),
        gap: fmtMillion(gap),
        explanation: 'So sánh khoảng giá ValuCar đã điều chỉnh mức mua.',
      },
      {
        criteria: 'Giá giữa (ước tính)',
        valueA: fmtMillion(midA),
        valueB: fmtMillion(midB),
        advantage: cheaper === 'NGANG' ? 'NGANG' : (cheaper as 'A' | 'B'),
        gap: fmtMillion(gap),
        explanation: 'Mức giữa khoảng thấp–cao.',
      },
      {
        criteria: 'Số km',
        valueA: `${carA.mileage.toLocaleString('vi-VN')} km`,
        valueB: `${carB.mileage.toLocaleString('vi-VN')} km`,
        advantage: carA.mileage < carB.mileage ? 'A' : carB.mileage < carA.mileage ? 'B' : 'NGANG',
        gap: `${Math.abs(carA.mileage - carB.mileage).toLocaleString('vi-VN')} km`,
        explanation: 'Km thấp hơn thường ít hao mòn hơn nếu cùng năm.',
      },
      {
        criteria: 'Năm sản xuất',
        valueA: String(carA.year),
        valueB: String(carB.year),
        advantage: carA.year > carB.year ? 'A' : carB.year > carA.year ? 'B' : 'NGANG',
        gap: `${Math.abs(carA.year - carB.year)} năm`,
        explanation: 'Xe đời mới hơn thường còn giá trị công nghệ & bảo hành.',
      },
      {
        criteria: 'Giá / km',
        valueA: perKmA ? `${Math.round(perKmA / 1000)}k đ/km` : '—',
        valueB: perKmB ? `${Math.round(perKmB / 1000)}k đ/km` : '—',
        advantage:
          perKmA && perKmB
            ? perKmA < perKmB
              ? 'A'
              : perKmB < perKmA
                ? 'B'
                : 'NGANG'
            : 'NGANG',
        gap: perKmA && perKmB ? `${Math.abs(Math.round(perKmA / 1000) - Math.round(perKmB / 1000))}k đ/km` : '—',
        explanation: 'Chỉ số tham khảo hiệu quả chi phí theo quãng đường.',
      },
      {
        criteria: 'Phiên bản',
        valueA: carA.version,
        valueB: carB.version,
        advantage: 'NGANG',
        gap: '—',
        explanation: 'Cần đối chiếu trang bị từng phiên bản khi xem xe thực tế.',
      },
    ],
    priceAnalysis: valA.explanation + '\n\n' + valB.explanation,
    technicalAnalysis:
      'Phân tích kỹ thuật chi tiết tạm thời dùng dữ liệu định giá. Nên kiểm tra động cơ, hộp số và lịch sử bảo dưỡng khi xem xe.',
    ownershipCost:
      'Ước tính bảo dưỡng định kỳ 6–12 tháng: 3–8 triệu tùy hãng. Xe km cao hoặc đời sâu có thể phát sinh thay lốp, phanh sớm hơn.',
    risks: [
      'Kiểm tra ODO có khớp lịch sử bảo dưỡng không',
      'Soát giấy tờ, biên bản sang tên',
      'Lái thử để nghe tiếng động cơ / hộp số',
    ],
    negotiationA: `Gợi ý thương lượng xe A: chốt dưới giữa khoảng ~${fmtMillion(midA * 0.97)} nếu xe zin.`,
    negotiationB: `Gợi ý thương lượng xe B: chốt dưới giữa khoảng ~${fmtMillion(midB * 0.97)} nếu xe zin.`,
    finalAdvice:
      pick === 'TUY_NHU_CAU'
        ? 'Hai xe gần giá nhau — ưu tiên xe ít km, đời mới và bản trang bị phù hợp nhu cầu.'
        : `Nếu ưu tiên tiết kiệm, cân nhắc xe ${pick}; vẫn nên đi xem và checklist trước khi cọc.`,
  }
}
