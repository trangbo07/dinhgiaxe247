export type AccountType = 'business'

/** Số lượt định giá miễn phí mỗi tháng cho tài khoản chưa có gói Doanh nghiệp active */
export const FREE_VALUATIONS_PER_MONTH = 4

export type PlanLimits = {
  planName: string
  maxValuationsPerMonth: number
  maxChatPerValuation: number
  unlimited: boolean
}

export function getPlanLimits(opts: { isPro: boolean }): PlanLimits {
  if (opts.isPro) {
    return {
      planName: 'Doanh nghiệp',
      maxValuationsPerMonth: Number.POSITIVE_INFINITY,
      maxChatPerValuation: 999,
      unlimited: true,
    }
  }
  return {
    planName: `Miễn phí (${FREE_VALUATIONS_PER_MONTH} lượt/tháng)`,
    maxValuationsPerMonth: FREE_VALUATIONS_PER_MONTH,
    maxChatPerValuation: 5,
    unlimited: false,
  }
}

export function formatValuationQuota(remaining: number, max: number) {
  if (!Number.isFinite(max)) return 'Không giới hạn lượt định giá'
  return `Còn ${remaining}/${max} lượt định giá tháng này`
}
