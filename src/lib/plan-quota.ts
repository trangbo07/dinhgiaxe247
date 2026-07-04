import type { SupabaseClient } from '@supabase/supabase-js'
import { FREE_VALUATIONS_PER_MONTH } from '@/lib/plan-limits'

export type ActiveSubscription = {
  planCode: 'monthly' | 'quarterly' | 'yearly'
  expiresAt: string
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Trả về subscription đang active (status='active' và chưa hết hạn), hoặc null. */
export async function getActiveSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<ActiveSubscription | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_code, status, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || data.status !== 'active') return null
  if (new Date(data.expires_at).getTime() <= Date.now()) return null

  return { planCode: data.plan_code, expiresAt: data.expires_at }
}

export type QuotaResult =
  | { allowed: true; unlimited: true }
  | { allowed: true; unlimited: false; used: number; remaining: number }
  | { allowed: false; unlimited: false; used: number; remaining: number }

/** Kiểm tra + trừ 1 lượt định giá miễn phí trong tháng (nếu chưa có gói active). */
export async function checkAndConsumeQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<QuotaResult> {
  const activeSub = await getActiveSubscription(supabase, userId)
  if (activeSub) return { allowed: true, unlimited: true }

  const month = currentMonthKey()
  const { data, error } = await supabase.rpc('consume_valuation_quota', {
    p_user_id: userId,
    p_month: month,
    p_limit: FREE_VALUATIONS_PER_MONTH,
  })

  if (error || !data || !data[0]) {
    // Nếu RPC lỗi (vd chưa chạy migration), fail-open để không chặn nhầm người dùng thật.
    console.error('consume_valuation_quota rpc error', error)
    return { allowed: true, unlimited: false, used: 0, remaining: FREE_VALUATIONS_PER_MONTH }
  }

  const row = data[0] as { allowed: boolean; used: number }
  const remaining = Math.max(0, FREE_VALUATIONS_PER_MONTH - row.used)
  return { allowed: row.allowed, unlimited: false, used: row.used, remaining }
}

export type PlanState = {
  hasActivePlan: boolean
  planCode: 'monthly' | 'quarterly' | 'yearly' | null
  expiresAt: string | null
  monthlyUsed: number
  monthlyLimit: number
  monthlyRemaining: number
}

/** Đọc trạng thái gói + quota hiện tại, không trừ lượt. */
export async function getPlanState(supabase: SupabaseClient, userId: string): Promise<PlanState> {
  const activeSub = await getActiveSubscription(supabase, userId)
  if (activeSub) {
    return {
      hasActivePlan: true,
      planCode: activeSub.planCode,
      expiresAt: activeSub.expiresAt,
      monthlyUsed: 0,
      monthlyLimit: Number.POSITIVE_INFINITY,
      monthlyRemaining: Number.POSITIVE_INFINITY,
    }
  }

  const month = currentMonthKey()
  const { data } = await supabase
    .from('valuation_usage')
    .select('used')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  const used = data?.used ?? 0
  return {
    hasActivePlan: false,
    planCode: null,
    expiresAt: null,
    monthlyUsed: used,
    monthlyLimit: FREE_VALUATIONS_PER_MONTH,
    monthlyRemaining: Math.max(0, FREE_VALUATIONS_PER_MONTH - used),
  }
}
