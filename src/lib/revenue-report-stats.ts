import type { SupabaseClient } from '@supabase/supabase-js'
import { BUSINESS_PLAN_INFO, type PlanCode } from '@/lib/payment-bills'

export type RevenueReportData = {
  generatedAt: string
  totals: {
    revenueAll: number
    revenueThisMonth: number
    revenueLastMonth: number
    invoicesAll: number
    invoicesThisMonth: number
    pendingBills: number
    rejectedBills: number
    activeSubscriptions: number
  }
  growth: {
    revenuePct: number | null
  }
  revenueByPlan: { planCode: PlanCode; label: string; revenue: number; count: number }[]
  monthlyTrend: { month: string; label: string; revenue: number; invoices: number }[]
  dailyRevenue: { label: string; count: number }[]
  recentInvoices: {
    id: string
    userEmail: string | null
    planCode: PlanCode
    amount: number
    reviewedAt: string | null
  }[]
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return `T${m}/${y.slice(2)}`
}

function dayLabel(d: Date) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export async function buildRevenueReport(supabase: SupabaseClient): Promise<RevenueReportData> {
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endLastMonth = startThisMonth
  const start6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  const [approvedRes, pendingRes, rejectedRes, subsRes] = await Promise.all([
    supabase
      .from('payment_bills')
      .select('id, user_id, plan_code, amount, reviewed_at, created_at')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false })
      .limit(2000),
    supabase.from('payment_bills').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payment_bills').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', now.toISOString()),
  ])

  const approved = approvedRes.data ?? []
  const paidAt = (row: { reviewed_at: string | null; created_at: string }) => row.reviewed_at ?? row.created_at

  const revenueAll = approved.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
  const thisMonth = approved.filter((b) => paidAt(b) >= startThisMonth)
  const lastMonth = approved.filter((b) => paidAt(b) >= startLastMonth && paidAt(b) < endLastMonth)
  const revenueThisMonth = thisMonth.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
  const revenueLastMonth = lastMonth.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  const byPlan: Record<string, { revenue: number; count: number }> = {}
  for (const b of approved) {
    const code = b.plan_code as string
    if (!byPlan[code]) byPlan[code] = { revenue: 0, count: 0 }
    byPlan[code].revenue += Number(b.amount) || 0
    byPlan[code].count += 1
  }
  const revenueByPlan = (Object.keys(BUSINESS_PLAN_INFO) as PlanCode[]).map((code) => ({
    planCode: code,
    label: BUSINESS_PLAN_INFO[code].label,
    revenue: byPlan[code]?.revenue ?? 0,
    count: byPlan[code]?.count ?? 0,
  }))

  const monthBuckets: Record<string, { revenue: number; invoices: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthBuckets[monthKey(d)] = { revenue: 0, invoices: 0 }
  }
  for (const b of approved) {
    const t = paidAt(b)
    if (t < start6Months) continue
    const k = t.slice(0, 7)
    if (monthBuckets[k]) {
      monthBuckets[k].revenue += Number(b.amount) || 0
      monthBuckets[k].invoices += 1
    }
  }
  const monthlyTrend = Object.entries(monthBuckets).map(([month, data]) => ({
    month,
    label: monthLabel(month),
    revenue: data.revenue,
    invoices: data.invoices,
  }))

  const days: { label: string; date: string }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000)
    days.push({ label: dayLabel(d), date: startOfDay(d).toISOString().slice(0, 10) })
  }
  const dailyRevenue = days.map(({ label, date }) => ({
    label,
    count: approved
      .filter((b) => paidAt(b).slice(0, 10) === date)
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
  }))

  const userIds = Array.from(new Set(approved.slice(0, 20).map((b) => b.user_id)))
  const emailMap: Record<string, string | null> = {}
  await Promise.all(
    userIds.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id)
      emailMap[id] = data?.user?.email ?? null
    })
  )

  const recentInvoices = approved.slice(0, 20).map((b) => ({
    id: b.id,
    userEmail: emailMap[b.user_id] ?? null,
    planCode: b.plan_code as PlanCode,
    amount: Number(b.amount) || 0,
    reviewedAt: b.reviewed_at,
  }))

  const revenuePct = pctChange(revenueThisMonth, revenueLastMonth)

  return {
    generatedAt: now.toISOString(),
    totals: {
      revenueAll,
      revenueThisMonth,
      revenueLastMonth,
      invoicesAll: approved.length,
      invoicesThisMonth: thisMonth.length,
      pendingBills: pendingRes.count ?? 0,
      rejectedBills: rejectedRes.count ?? 0,
      activeSubscriptions: subsRes.count ?? 0,
    },
    growth: { revenuePct },
    revenueByPlan,
    monthlyTrend,
    dailyRevenue,
    recentInvoices,
  }
}
