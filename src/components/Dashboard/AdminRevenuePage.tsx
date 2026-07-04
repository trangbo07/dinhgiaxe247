'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { RevenueReportData } from '@/lib/revenue-report-stats'
import { BUSINESS_PLAN_INFO } from '@/lib/payment-bills'
import {
  DonutStat,
  GrowthBarChart,
  StatCard,
  TrendLineChart,
} from '@/components/Dashboard/ReportCharts'

function fmtVnd(n: number) {
  return `${n.toLocaleString('vi-VN')}đ`
}

const PLAN_COLORS: Record<string, string> = {
  monthly: '#2563eb',
  quarterly: '#7c3aed',
  yearly: '#f59e0b',
}

export default function AdminRevenuePage() {
  const [report, setReport] = useState<RevenueReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/revenue')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được báo cáo doanh thu')
      setReport(data as RevenueReportData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-midnight_text sm:text-2xl">Báo cáo doanh thu</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Doanh thu tính từ các bill chuyển khoản đã được duyệt (approved).
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Tổng doanh thu"
              value={fmtVnd(report.totals.revenueAll)}
              sub={`${report.totals.invoicesAll} hoá đơn`}
              icon="tabler:cash"
              accent="emerald"
            />
            <StatCard
              label="Doanh thu tháng này"
              value={fmtVnd(report.totals.revenueThisMonth)}
              sub={`${report.totals.invoicesThisMonth} hoá đơn tháng này`}
              growth={report.growth.revenuePct}
              icon="tabler:trending-up"
              accent="blue"
            />
            <StatCard
              label="Gói đang active"
              value={report.totals.activeSubscriptions}
              sub="Tài khoản còn hạn sử dụng"
              icon="tabler:crown"
              accent="violet"
            />
            <StatCard
              label="Bill chờ / từ chối"
              value={`${report.totals.pendingBills} / ${report.totals.rejectedBills}`}
              sub="Chờ duyệt / đã từ chối"
              icon="tabler:receipt"
              accent="amber"
            />
          </div>

          <GrowthBarChart
            title="Doanh thu 6 tháng gần nhất"
            subtitle="Tổng tiền các bill đã duyệt theo tháng"
            series={[report.monthlyTrend.map((m) => ({ label: m.label, count: m.revenue }))]}
            colors={['#059669']}
            legends={['Doanh thu (đ)']}
            height={220}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <TrendLineChart
              title="Doanh thu 14 ngày gần nhất"
              data={report.dailyRevenue.map((d) => ({ label: d.label, value: d.count }))}
              color="#059669"
            />
            <DonutStat
              title="Doanh thu theo gói"
              segments={report.revenueByPlan.map((p) => ({
                label: p.label,
                value: p.revenue,
                color: PLAN_COLORS[p.planCode] ?? '#94a3b8',
              }))}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-black text-midnight_text">Chi tiết theo gói</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {report.revenueByPlan.map((p) => (
                <div key={p.planCode} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-700">{p.label}</p>
                  <p className="mt-1 text-lg font-black text-primary">{fmtVnd(p.revenue)}</p>
                  <p className="text-xs text-slate-400">
                    {p.count} hoá đơn · {BUSINESS_PLAN_INFO[p.planCode].price.toLocaleString('vi-VN')}đ/gói
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-black text-midnight_text">Hoá đơn gần đây</h3>
            {report.recentInvoices.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có hoá đơn nào.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {report.recentInvoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-700">{inv.userEmail ?? inv.id}</p>
                      <p className="text-xs text-slate-400">
                        {BUSINESS_PLAN_INFO[inv.planCode].label}
                        {inv.reviewedAt && <> · {new Date(inv.reviewedAt).toLocaleDateString('vi-VN')}</>}
                      </p>
                    </div>
                    <span className="shrink-0 font-black text-primary">{fmtVnd(inv.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-center text-xs text-slate-400">
            Cập nhật lúc {new Date(report.generatedAt).toLocaleString('vi-VN')}
          </p>
        </>
      ) : null}
    </div>
  )
}
