export type PlanCode = 'monthly' | 'quarterly' | 'yearly'

export const PLAN_CODES: PlanCode[] = ['monthly', 'quarterly', 'yearly']

const COMMON_FEATURES = [
  'Không giới hạn lượt định giá',
  'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
  'Xem khách từ website (leads) & cập nhật trạng thái chăm sóc',
  'Báo cáo tổng hợp & xuất PDF chi tiết',
  'Lưu lại lịch sử các xe đã định giá',
]

export const BUSINESS_PLAN_INFO: Record<
  PlanCode,
  { label: string; price: number; durationDays: number; features: string[] }
> = {
  monthly: { label: 'Gói Tháng', price: 199_000, durationDays: 30, features: COMMON_FEATURES },
  quarterly: { label: 'Gói Quý', price: 539_000, durationDays: 90, features: COMMON_FEATURES },
  yearly: { label: 'Gói Năm', price: 1_399_000, durationDays: 365, features: COMMON_FEATURES },
}

export function isPlanCode(value: unknown): value is PlanCode {
  return typeof value === 'string' && (PLAN_CODES as string[]).includes(value)
}

/**
 * Nội dung chuyển khoản xác định — dùng chung giữa client (hiển thị cho user quét QR)
 * và server (đối chiếu khi admin duyệt bill), tránh lệch nội dung.
 */
export function generateTransferContent(userId: string, planCode: PlanCode) {
  const shortId = userId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `VALUCAR ${shortId} ${planCode.toUpperCase()}`
}

export const PAYMENT_BILLS_BUCKET = 'payment-bills'

export const BANK_INFO = {
  bankName: 'TPBank',
  accountHolder: 'TRAN THI THU TRANG',
  accountNumber: '85707112005',
  qrImage: '/paymentQr/qr.jpg',
}
