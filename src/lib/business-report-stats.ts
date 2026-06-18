import type { SupabaseClient } from '@supabase/supabase-js'

export type BusinessReportData = {
  generatedAt: string
  businessName: string
  totals: {
    valuations: number
    leads: number
    valuationsThisMonth: number
    leadsThisMonth: number
    valuationsLastMonth: number
    leadsLastMonth: number
  }
  growth: {
    valuationsPct: number | null
    leadsPct: number | null
  }
  intentBreakdown: { mua: number; ban: number }
  statusBreakdown: { moi: number; da_lien_he: number; dong: number }
  topBrands: { brand: string; count: number }[]
  topLeadBrands: { brand: string; count: number }[]
  dailyLeads: { label: string; count: number }[]
  dailyValuations: { label: string; count: number }[]
  monthlyTrend: { month: string; label: string; valuations: number; leads: number }[]
  avgValuationMid: number | null
  leadContactRate: number | null
  insights: string[]
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function dayLabel(d: Date) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return `T${m}/${y.slice(2)}`
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

function topN(items: { brand?: string | null }[], n = 5) {
  const map: Record<string, number> = {}
  for (const item of items) {
    const b = (item.brand ?? '').trim()
    if (!b) continue
    map[b] = (map[b] ?? 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([brand, count]) => ({ brand, count }))
}

export async function buildBusinessReport(
  supabase: SupabaseClient,
  userId: string,
  businessName: string
): Promise<BusinessReportData> {
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const start14Days = new Date(Date.now() - 13 * 86400_000).toISOString()
  const start6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  const [valsRes, leadsRes, valsMonthRes, valsLastMonthRes, leadsMonthRes, leadsLastMonthRes, vals14Res, leads14Res] =
    await Promise.all([
      supabase
        .from('valuations')
        .select('id, brand, price, price_low, price_high, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('guest_leads').select('id, brand, intent, status, created_at').limit(500),
      supabase
        .from('valuations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startThisMonth),
      supabase
        .from('valuations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startLastMonth)
        .lt('created_at', endLastMonth),
      supabase.from('guest_leads').select('id', { count: 'exact', head: true }).gte('created_at', startThisMonth),
      supabase
        .from('guest_leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startLastMonth)
        .lt('created_at', endLastMonth),
      supabase
        .from('valuations')
        .select('created_at, brand')
        .eq('user_id', userId)
        .gte('created_at', start14Days),
      supabase.from('guest_leads').select('created_at, intent, status, brand').gte('created_at', start14Days),
    ])

  const allVals = valsRes.data ?? []
  const allLeads = leadsRes.data ?? []
  const valsThisMonth = valsMonthRes.count ?? 0
  const valsLastMonth = valsLastMonthRes.count ?? 0
  const leadsThisMonth = leadsMonthRes.count ?? 0
  const leadsLastMonth = leadsLastMonthRes.count ?? 0

  const days: { label: string; date: string }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000)
    days.push({ label: dayLabel(d), date: startOfDay(d).toISOString().slice(0, 10) })
  }

  const vals14 = vals14Res.data ?? []
  const leads14 = leads14Res.data ?? []

  const dailyValuations = days.map(({ label, date }) => ({
    label,
    count: vals14.filter((v) => v.created_at.slice(0, 10) === date).length,
  }))
  const dailyLeads = days.map(({ label, date }) => ({
    label,
    count: leads14.filter((l) => l.created_at.slice(0, 10) === date).length,
  }))

  const monthBuckets: Record<string, { valuations: number; leads: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthBuckets[monthKey(d)] = { valuations: 0, leads: 0 }
  }

  const vals6 = allVals.filter((v) => v.created_at >= start6Months)
  const leads6 = allLeads.filter((l) => l.created_at >= start6Months)
  for (const v of vals6) {
    const k = v.created_at.slice(0, 7)
    if (monthBuckets[k]) monthBuckets[k].valuations++
  }
  for (const l of leads6) {
    const k = l.created_at.slice(0, 7)
    if (monthBuckets[k]) monthBuckets[k].leads++
  }

  const monthlyTrend = Object.entries(monthBuckets).map(([month, data]) => ({
    month,
    label: monthLabel(month),
    valuations: data.valuations,
    leads: data.leads,
  }))

  const mids = allVals
    .map((v) => {
      if (v.price_low != null && v.price_high != null) return (v.price_low + v.price_high) / 2
      return v.price
    })
    .filter((n): n is number => n != null && Number.isFinite(n))

  const avgValuationMid = mids.length ? Math.round(mids.reduce((a, b) => a + b, 0) / mids.length) : null

  const contacted = allLeads.filter((l) => l.status === 'da_lien_he' || l.status === 'dong').length
  const leadContactRate = allLeads.length ? Math.round((contacted / allLeads.length) * 100) : null

  const insights: string[] = []
  const valGrowth = pctChange(valsThisMonth, valsLastMonth)
  const leadGrowth = pctChange(leadsThisMonth, leadsLastMonth)
  if (valGrowth != null) {
    insights.push(
      valGrowth >= 0
        ? `Định giá tháng này tăng ${valGrowth}% so với tháng trước (${valsThisMonth} lượt).`
        : `Định giá tháng này giảm ${Math.abs(valGrowth)}% so với tháng trước.`
    )
  }
  if (leadGrowth != null) {
    insights.push(
      leadGrowth >= 0
        ? `Lead khách website tăng ${leadGrowth}% tháng này (${leadsThisMonth} lead).`
        : `Lead giảm ${Math.abs(leadGrowth)}% — nên tăng đăng tin & landing.`
    )
  }
  if (topN(allVals)[0]) {
    insights.push(`Dòng xe định giá nhiều nhất: ${topN(allVals)[0].brand} (${topN(allVals)[0].count} lần).`)
  }
  if (leadContactRate != null) {
    insights.push(`Tỉ lệ lead đã xử lý: ${leadContactRate}% (${contacted}/${allLeads.length}).`)
  }
  if (allLeads.filter((l) => l.intent === 'mua').length > allLeads.filter((l) => l.intent === 'ban').length) {
    insights.push('Đa số khách website có nhu cầu MUA — ưu tiên kho xe phổ biến & giá cạnh tranh.')
  }

  return {
    generatedAt: now.toISOString(),
    businessName,
    totals: {
      valuations: allVals.length,
      leads: allLeads.length,
      valuationsThisMonth: valsThisMonth,
      leadsThisMonth: leadsThisMonth,
      valuationsLastMonth: valsLastMonth,
      leadsLastMonth: leadsLastMonth,
    },
    growth: {
      valuationsPct: valGrowth,
      leadsPct: leadGrowth,
    },
    intentBreakdown: {
      mua: allLeads.filter((l) => l.intent === 'mua').length,
      ban: allLeads.filter((l) => l.intent === 'ban').length,
    },
    statusBreakdown: {
      moi: allLeads.filter((l) => l.status === 'moi').length,
      da_lien_he: allLeads.filter((l) => l.status === 'da_lien_he').length,
      dong: allLeads.filter((l) => l.status === 'dong').length,
    },
    topBrands: topN(allVals),
    topLeadBrands: topN(allLeads),
    dailyLeads,
    dailyValuations,
    monthlyTrend,
    avgValuationMid,
    leadContactRate,
    insights,
  }
}
