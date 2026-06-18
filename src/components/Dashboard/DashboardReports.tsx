'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import type { BusinessReportData } from '@/lib/business-report-stats'
import { downloadBusinessSummaryPdf } from '@/lib/business-report-pdf'
import {
  DonutStat,
  GrowthBarChart,
  StatCard,
  TrendLineChart,
} from '@/components/Dashboard/ReportCharts'

function fmtMillion(n: number | null) {
  if (n == null) return '—'
  return `${(n / 1e6).toFixed(0)} tr`
}

export default function DashboardReports() {
  const { data: session } = useSession()
  const router = useRouter()
  const [report, setReport] = useState<BusinessReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPersonal = session?.user?.accountType === 'personal'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reports/business')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được báo cáo')
      setReport(data as BusinessReportData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isPersonal) {
      router.replace('/dashboard')
      return
    }
    load()
  }, [isPersonal, load, router])

  const handleExportPdf = async () => {
    if (!report) return
    setExporting(true)
    try {
      await downloadBusinessSummaryPdf(report)
      toast.success('Đã tải báo cáo PDF')
    } catch {
      toast.error('Không xuất được PDF')
    } finally {
      setExporting(false)
    }
  }

  if (isPersonal) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-midnight_text sm:text-2xl">Báo cáo tổng hợp</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan định giá, lead khách, xu hướng tăng trưởng — xuất PDF cho doanh nghiệp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            <Icon icon="tabler:refresh" className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={!report || exporting}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
          >
            {exporting ? (
              <Icon icon="tabler:loader" className="animate-spin text-lg" />
            ) : (
              <Icon icon="tabler:file-type-pdf" className="text-lg" />
            )}
            Xuất PDF tổng hợp
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Tổng định giá"
              value={report.totals.valuations}
              sub={`Tháng này: ${report.totals.valuationsThisMonth}`}
              growth={report.growth.valuationsPct}
              icon="tabler:car"
              accent="blue"
            />
            <StatCard
              label="Lead khách"
              value={report.totals.leads}
              sub={`Tháng này: ${report.totals.leadsThisMonth}`}
              growth={report.growth.leadsPct}
              icon="tabler:users"
              accent="violet"
            />
            <StatCard
              label="Giá TB tham chiếu"
              value={fmtMillion(report.avgValuationMid)}
              sub="Trung bình các lần định giá"
              icon="tabler:currency-dong"
              accent="emerald"
            />
            <StatCard
              label="Lead đã xử lý"
              value={report.leadContactRate != null ? `${report.leadContactRate}%` : '—'}
              sub="Đã liên hệ + đóng"
              icon="tabler:phone-check"
              accent="amber"
            />
          </div>

          <GrowthBarChart
            title="Xu hướng 6 tháng"
            subtitle="Định giá vs lead khách website"
            series={[
              report.monthlyTrend.map((m) => ({ label: m.label, count: m.valuations })),
              report.monthlyTrend.map((m) => ({ label: m.label, count: m.leads })),
            ]}
            colors={['#2563eb', '#7c3aed']}
            legends={['Định giá', 'Lead khách']}
            height={220}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <GrowthBarChart
              title="14 ngày gần nhất — Định giá"
              series={[report.dailyValuations]}
              colors={['#2563eb']}
              legends={['Lượt/ngày']}
              height={200}
            />
            <GrowthBarChart
              title="14 ngày gần nhất — Lead"
              series={[report.dailyLeads]}
              colors={['#7c3aed']}
              legends={['Lead/ngày']}
              height={200}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DonutStat
              title="Nhu cầu khách (Mua / Bán)"
              segments={[
                { label: 'Muốn mua', value: report.intentBreakdown.mua, color: '#2563eb' },
                { label: 'Muốn bán', value: report.intentBreakdown.ban, color: '#f59e0b' },
              ]}
            />
            <DonutStat
              title="Trạng thái lead"
              segments={[
                { label: 'Mới', value: report.statusBreakdown.moi, color: '#3b82f6' },
                { label: 'Đã liên hệ', value: report.statusBreakdown.da_lien_he, color: '#8b5cf6' },
                { label: 'Đóng', value: report.statusBreakdown.dong, color: '#94a3b8' },
              ]}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TrendLineChart
              title="Tăng trưởng định giá (6 tháng)"
              data={report.monthlyTrend.map((m) => ({ label: m.label, value: m.valuations }))}
              color="#2563eb"
            />
            <TrendLineChart
              title="Tăng trưởng lead (6 tháng)"
              data={report.monthlyTrend.map((m) => ({ label: m.label, value: m.leads }))}
              color="#7c3aed"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-black text-midnight_text">Top hãng — Định giá</h3>
              <ul className="space-y-2">
                {report.topBrands.length === 0 ? (
                  <li className="text-sm text-slate-500">Chưa có dữ liệu</li>
                ) : (
                  report.topBrands.map((b, i) => (
                    <li key={b.brand} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-slate-700">{b.brand}</span>
                      <span className="text-sm font-bold text-primary">{b.count} lần</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-black text-midnight_text">Top hãng — Lead khách</h3>
              <ul className="space-y-2">
                {report.topLeadBrands.length === 0 ? (
                  <li className="text-sm text-slate-500">Chưa có dữ liệu</li>
                ) : (
                  report.topLeadBrands.map((b, i) => (
                    <li key={b.brand} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs font-black text-violet-700">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-slate-700">{b.brand}</span>
                      <span className="text-sm font-bold text-violet-600">{b.count} lead</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
            <div className="mb-3 flex items-center gap-2">
              <Icon icon="tabler:bulb" className="text-xl text-emerald-600" />
              <h3 className="font-black text-emerald-900">Nhận xét & gợi ý hành động</h3>
            </div>
            <ul className="space-y-2">
              {report.insights.map((ins, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-emerald-900/90">
                  <Icon icon="tabler:chevron-right" className="mt-0.5 shrink-0 text-emerald-500" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-slate-400">
            Cập nhật lúc {new Date(report.generatedAt).toLocaleString('vi-VN')} · Báo cáo tự động từ dữ liệu ValuCar
          </p>
        </>
      ) : null}
    </div>
  )
}
