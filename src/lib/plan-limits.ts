export type AccountType = 'personal' | 'business'

/** Gói cá nhân duy nhất — đi kèm khi đăng ký tài khoản cá nhân */
export const PERSONAL_PLAN = {
  id: 'personal',
  name: 'Gói Cá Nhân',
  maxValuationsPerMonth: 10,
  maxChatPerValuation: 10,
  features: [
    '10 lượt định giá / tháng',
    '10 lượt hỏi đáp AI mỗi lần định giá',
    'Checklist mua xe ',
    'Báo cáo định giá xe ',
    'Lịch sử định giá xe',
    'So sánh 2 dòng xe (5 lượt/thiết bị/tháng)',
    'Dịch vụ chăm sóc khách hàng 24/7',
  ],
} as const

/** Dùng thử khi đăng ký doanh nghiệp chưa mua gói */
export const BUSINESS_TRIAL = {
  maxValuationsPerMonth: 3,
  maxChatPerValuation: 5,
} as const

export type PlanLimits = {
  planName: string
  maxValuationsPerMonth: number
  maxChatPerValuation: number
  unlimited: boolean
}

export function getPlanLimits(opts: {
  accountType: AccountType | null
  isPro: boolean
  isUltra: boolean
}): PlanLimits {
  if (opts.isPro) {
    return {
      planName: 'Doanh nghiệp',
      maxValuationsPerMonth: Number.POSITIVE_INFINITY,
      maxChatPerValuation: 999,
      unlimited: true,
    }
  }
  if (opts.isUltra) {
    return {
      planName: 'Ultra Trial',
      maxValuationsPerMonth: Number.POSITIVE_INFINITY,
      maxChatPerValuation: 999,
      unlimited: true,
    }
  }
  if (opts.accountType === 'personal') {
    return {
      planName: PERSONAL_PLAN.name,
      maxValuationsPerMonth: PERSONAL_PLAN.maxValuationsPerMonth,
      maxChatPerValuation: PERSONAL_PLAN.maxChatPerValuation,
      unlimited: false,
    }
  }
  return {
    planName: 'Dùng thử Doanh nghiệp',
    maxValuationsPerMonth: BUSINESS_TRIAL.maxValuationsPerMonth,
    maxChatPerValuation: BUSINESS_TRIAL.maxChatPerValuation,
    unlimited: false,
  }
}

export function formatValuationQuota(remaining: number, max: number) {
  if (!Number.isFinite(max)) return 'Không giới hạn lượt định giá'
  return `Còn ${remaining}/${max} lượt định giá tháng này`
}
