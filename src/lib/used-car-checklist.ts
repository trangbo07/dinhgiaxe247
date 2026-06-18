export type CheckStatus = 'ok' | 'minor' | 'major' | 'unknown'

export type ChecklistItem = {
  id: string
  title: string
  hint: string
  icon: string
  category: string
  /** % giảm khi có vấn đề nhẹ */
  minorPct: number
  /** % giảm khi có vấn đề nặng */
  majorPct: number
}

export const USED_CAR_CHECKLIST: ChecklistItem[] = [
  { id: 'legal', title: 'Giấy tờ pháp lý', hint: 'Đăng ký, đăng kiểm, biên bản sang tên', icon: 'tabler:file-certificate', category: 'Pháp lý', minorPct: 2, majorPct: 5 },
  { id: 'odo', title: 'Đồng hồ công tơ mét (ODO)', hint: 'So sánh với lịch sử bảo dưỡng, không chỉnh', icon: 'tabler:gauge', category: 'Kỹ thuật', minorPct: 3, majorPct: 8 },
  { id: 'frame', title: 'Khung gầm & cấu trúc', hint: 'Móp, va chạm, rỉ sét khung', icon: 'tabler:car-crane', category: 'Thân vỏ', minorPct: 5, majorPct: 15 },
  { id: 'paint', title: 'Đồng sơn & ngoại thất', hint: 'Sơn lại, dặm vá, lệch khe cánh cửa', icon: 'tabler:spray', category: 'Thân vỏ', minorPct: 3, majorPct: 7 },
  { id: 'tires', title: 'Lốp & mâm xe', hint: 'Mòn không đều, mâm cong, thay lốp gần hết', icon: 'tabler:wheel', category: 'Vận hành', minorPct: 1, majorPct: 3 },
  { id: 'engine', title: 'Động cơ & hộp số', hint: 'Tiếng lạ, khói, giật côn, trễ số', icon: 'tabler:engine', category: 'Kỹ thuật', minorPct: 5, majorPct: 12 },
  { id: 'electrical', title: 'Hệ thống điện / ECU', hint: 'Báo lỗi, chập, đèn cảnh báo', icon: 'tabler:cpu', category: 'Kỹ thuật', minorPct: 4, majorPct: 10 },
  { id: 'interior', title: 'Nội thất & mùi xe', hint: 'Ẩm mốc, rách ghế, mùi khó chịu', icon: 'tabler:armchair', category: 'Tiện nghi', minorPct: 2, majorPct: 5 },
  { id: 'ac', title: 'Điều hòa & giải trí', hint: 'Lạnh yếu, màn hình, loa, camera', icon: 'tabler:air-conditioning', category: 'Tiện nghi', minorPct: 1, majorPct: 4 },
  { id: 'service', title: 'Lịch sử bảo dưỡng', hint: 'Sổ bảo dưỡng, thay dầu định kỳ', icon: 'tabler:tool', category: 'Bảo dưỡng', minorPct: 2, majorPct: 4 },
  { id: 'flood', title: 'Ngập nước / lụt', hint: 'Ngập sàn, ngập máy, mùi ẩm', icon: 'tabler:ripple', category: 'Rủi ro', minorPct: 15, majorPct: 40 },
  { id: 'accident', title: 'Tai nạn & túi khí', hint: 'Va chạm lớn, airbag bung, cấu trúc', icon: 'tabler:car-crash', category: 'Rủi ro', minorPct: 8, majorPct: 20 },
  { id: 'brakes', title: 'Phanh & lái', hint: 'Kêu rít, rung vô-lăng, trợ lực', icon: 'tabler:steering-wheel', category: 'An toàn', minorPct: 3, majorPct: 8 },
  { id: 'lights', title: 'Kính, gương & đèn', hint: 'Nứt kính, đèn mờ, gương gãy', icon: 'tabler:bulb', category: 'Ngoại thất', minorPct: 1, majorPct: 3 },
  { id: 'options', title: 'Phụ kiện & option zin', hint: 'Camera, HUD, ghế điện, cốp điện', icon: 'tabler:package', category: 'Tiện nghi', minorPct: 1, majorPct: 2 },
]

export function statusDiscount(status: CheckStatus, item: ChecklistItem): number {
  if (status === 'ok' || status === 'unknown') return 0
  if (status === 'minor') return item.minorPct
  return item.majorPct
}

export function computeChecklistDiscount(
  statuses: Record<string, CheckStatus>,
  capPct = 45
): { totalPct: number; items: { id: string; title: string; pct: number; status: CheckStatus }[] } {
  const items = USED_CAR_CHECKLIST.map((item) => {
    const status = statuses[item.id] ?? 'unknown'
    const pct = statusDiscount(status, item)
    return { id: item.id, title: item.title, pct, status }
  }).filter((i) => i.pct > 0)

  const raw = items.reduce((s, i) => s + i.pct, 0)
  const totalPct = Math.min(capPct, raw)
  return { totalPct, items }
}

export function applyDiscountToPrice(price: number, totalPct: number) {
  const factor = 1 - totalPct / 100
  return Math.max(0, Math.round(price * factor))
}
