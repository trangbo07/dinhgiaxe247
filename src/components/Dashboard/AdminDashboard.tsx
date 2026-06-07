'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'

// ─── Types ────────────────────────────────────────────────────────────────────

type DailyPoint = { label: string; count: number }
type TopBrand = { brand: string; count: number }
type RecentUser = {
  id: string
  email: string | undefined
  name: string | null
  role: string | null
  created_at: string
}

type Stats = {
  totals: { users: number; leads: number; valuations: number }
  thisMonth: { leads: number; users: number }
  lastMonth: { leads: number }
  intentBreakdown: { mua: number; ban: number }
  statusBreakdown: { moi: number; da_lien_he: number; dong: number }
  topBrands: TopBrand[]
  dailyLeads: DailyPoint[]
  dailyVals: DailyPoint[]
  recentUsers: RecentUser[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
  accent = false,
}: {
  icon: string
  label: string
  value: number | string
  sub?: string
  trend?: { dir: 'up' | 'down' | 'flat'; pct: string }
  accent?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${
        accent
          ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
          : 'bg-white border border-slate-100 shadow-sm'
      }`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accent ? 'bg-white/20' : 'bg-blue-50'
          }`}>
          <Icon icon={icon} className={`text-2xl ${accent ? 'text-white' : 'text-primary'}`} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend.dir === 'up'
                ? accent
                  ? 'bg-white/20 text-white'
                  : 'bg-green-50 text-green-700'
                : trend.dir === 'down'
                ? accent
                  ? 'bg-white/20 text-white'
                  : 'bg-red-50 text-red-600'
                : accent
                ? 'bg-white/20 text-white'
                : 'bg-slate-50 text-slate-500'
            }`}>
            <Icon
              icon={
                trend.dir === 'up'
                  ? 'tabler:trending-up'
                  : trend.dir === 'down'
                  ? 'tabler:trending-down'
                  : 'tabler:minus'
              }
              className="text-xs"
            />
            {trend.pct}
          </span>
        )}
      </div>
      <p className={`mt-4 text-3xl font-black tracking-tight ${accent ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </p>
      <p className={`mt-1 text-sm font-semibold ${accent ? 'text-blue-100' : 'text-slate-500'}`}>
        {label}
      </p>
      {sub && (
        <p className={`mt-0.5 text-xs ${accent ? 'text-blue-200' : 'text-slate-400'}`}>{sub}</p>
      )}
    </div>
  )
}

function BarChart({
  data,
  color,
  label,
}: {
  data: DailyPoint[]
  color: string
  label: string
}) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex h-28 items-end gap-[3px] sm:gap-1">
        {data.map((d, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center">
            <div
              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 3)}%` }}
              className={`w-full rounded-t-[3px] transition-all ${
                d.count === 0 ? 'bg-slate-100' : color
              }`}
            />
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded-lg bg-blue-900 px-2 py-1 text-center group-hover:block">
              <p className="text-[10px] font-bold text-white">{d.count}</p>
              <p className="text-[8px] text-slate-400">{d.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* X labels — chỉ hiện ngày đầu, giữa, cuối */}
      <div className="mt-1 flex justify-between text-[9px] text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

function HBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">
          {value} <span className="font-normal text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all ${color}`} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được')
      setStats(data)
      setLastRefresh(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const leadTrend = stats
    ? stats.lastMonth.leads === 0
      ? { dir: 'flat' as const, pct: '0%' }
      : stats.thisMonth.leads >= stats.lastMonth.leads
      ? {
          dir: 'up' as const,
          pct: `+${Math.round(((stats.thisMonth.leads - stats.lastMonth.leads) / stats.lastMonth.leads) * 100)}%`,
        }
      : {
          dir: 'down' as const,
          pct: `${Math.round(((stats.thisMonth.leads - stats.lastMonth.leads) / stats.lastMonth.leads) * 100)}%`,
        }
    : undefined

  const totalLeadStatus = stats
    ? stats.statusBreakdown.moi + stats.statusBreakdown.da_lien_he + stats.statusBreakdown.dong
    : 0

  const maxBrand = stats?.topBrands?.[0]?.count ?? 1

  const quickLinks = [
    { href: '/dashboard/admin/users', icon: 'tabler:users-group', label: 'Quản lý Users' },
    { href: '/dashboard/admin/leads', icon: 'tabler:database', label: 'Tất cả Leads' },
    { href: '/dashboard/admin/valuations', icon: 'tabler:chart-bar', label: 'Tất cả Định giá' },
  ]

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden sm:space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-midnight_text via-blue-900 to-primary p-5 text-white shadow-xl sm:p-6 lg:p-8">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-400/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-blue-300/10" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200">
              <Icon icon="tabler:shield-check" className="text-sm" />
              Admin Control Center
            </div>
            <h2 className="text-xl font-black sm:text-2xl lg:text-3xl">Báo cáo hệ thống</h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Toàn bộ số liệu theo thời gian thực — Users · Leads · Định giá
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lastRefresh && (
              <p className="text-[10px] text-slate-500">
                {lastRefresh.toLocaleTimeString('vi-VN')}
              </p>
            )}
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50">
              <Icon
                icon={loading ? 'tabler:loader' : 'tabler:refresh'}
                className={`text-xl ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Quick nav */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-blue-500/30">
              <Icon icon={q.icon} className="text-blue-200" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : stats ? (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              icon="tabler:users-group"
              label="Tổng Users"
              value={stats.totals.users}
              sub={`+${stats.thisMonth.users} tháng này`}
              accent
            />
            <KpiCard
              icon="tabler:messages"
              label="Tổng Leads"
              value={stats.totals.leads}
              sub={`${stats.thisMonth.leads} tháng này`}
              trend={leadTrend}
            />
            <KpiCard
              icon="tabler:car"
              label="Tổng Định giá"
              value={stats.totals.valuations}
            />
            <KpiCard
              icon="tabler:bell-ringing"
              label="Leads mới"
              value={stats.statusBreakdown.moi}
              sub="chưa xử lý"
              trend={
                stats.statusBreakdown.moi > 0
                  ? { dir: 'up', pct: `${stats.statusBreakdown.moi} chờ` }
                  : { dir: 'flat', pct: 'Sạch' }
              }
            />
          </div>

          {/* ── Charts row ─────────────────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Leads chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Leads 14 ngày</h3>
                  <p className="text-xs text-slate-400">Guest lead từ trang chủ</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Icon icon="tabler:messages" className="text-blue-600" />
                </span>
              </div>
              <BarChart data={stats.dailyLeads} color="bg-blue-400" label="Leads / ngày" />
            </div>

            {/* Valuations chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Định giá 14 ngày</h3>
                  <p className="text-xs text-slate-400">Lượt định giá DN lưu cloud</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Icon icon="tabler:car" className="text-blue-600" />
                </span>
              </div>
              <BarChart data={stats.dailyVals} color="bg-blue-400" label="Định giá / ngày" />
            </div>
          </div>

          {/* ── Breakdown + Top brands ──────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Lead intent */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <h3 className="mb-1 font-bold text-slate-800">Nhu cầu khách</h3>
              <p className="mb-4 text-xs text-slate-400">Mua vs Bán xe</p>
              <div className="space-y-3">
                <HBar
                  label="Muốn Mua"
                  value={stats.intentBreakdown.mua}
                  total={stats.totals.leads}
                  color="bg-emerald-400"
                />
                <HBar
                  label="Muốn Bán"
                  value={stats.intentBreakdown.ban}
                  total={stats.totals.leads}
                  color="bg-orange-400"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1 rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-black text-emerald-700">{stats.intentBreakdown.mua}</p>
                  <p className="text-[10px] font-bold text-emerald-600">Mua</p>
                </div>
                <div className="flex-1 rounded-xl bg-orange-50 p-3 text-center">
                  <p className="text-xl font-black text-orange-700">{stats.intentBreakdown.ban}</p>
                  <p className="text-[10px] font-bold text-orange-600">Bán</p>
                </div>
              </div>
            </div>

            {/* Lead status */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <h3 className="mb-1 font-bold text-slate-800">Trạng thái Leads</h3>
              <p className="mb-4 text-xs text-slate-400">Xử lý lead khách</p>
              <div className="space-y-3">
                <HBar
                  label="Mới"
                  value={stats.statusBreakdown.moi}
                  total={totalLeadStatus}
                  color="bg-blue-400"
                />
                <HBar
                  label="Đã liên hệ"
                  value={stats.statusBreakdown.da_lien_he}
                  total={totalLeadStatus}
                  color="bg-blue-300"
                />
                <HBar
                  label="Đóng"
                  value={stats.statusBreakdown.dong}
                  total={totalLeadStatus}
                  color="bg-slate-300"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Mới', val: stats.statusBreakdown.moi, cls: 'bg-blue-50 text-blue-700' },
                  { label: 'Liên hệ', val: stats.statusBreakdown.da_lien_he, cls: 'bg-blue-50 text-blue-700' },
                  { label: 'Đóng', val: stats.statusBreakdown.dong, cls: 'bg-slate-100 text-slate-600' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-2 text-center ${s.cls}`}>
                    <p className="text-lg font-black">{s.val}</p>
                    <p className="text-[9px] font-bold">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top brands */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <h3 className="mb-1 font-bold text-slate-800">Top hãng xe</h3>
              <p className="mb-4 text-xs text-slate-400">Định giá nhiều nhất</p>
              {stats.topBrands.length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.topBrands.map((b, i) => (
                    <div key={b.brand}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white ${
                              i === 0
                                ? 'bg-primary'
                                : i === 1
                                ? 'bg-slate-400'
                                : 'bg-slate-300'
                            }`}>
                            {i + 1}
                          </span>
                          {b.brand}
                        </span>
                        <span className="font-bold text-slate-800">{b.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${(b.count / maxBrand) * 100}%` }}
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-primary' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Recent users ────────────────────────────────────────────────── */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-800">Users mới nhất</h3>
                <p className="text-xs text-slate-400">8 tài khoản gần đây nhất</p>
              </div>
              <Link
                href="/dashboard/admin/users"
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                Xem tất cả
                <Icon icon="tabler:arrow-right" className="text-sm" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex min-w-0 items-center gap-3 px-5 py-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                      u.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {(u.name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {u.name || u.email}
                    </p>
                    {u.name && (
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {u.role === 'admin' && (
                      <span className="mb-0.5 block rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                        Admin
                      </span>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Summary footer ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Tỉ lệ lead xử lý',
                value:
                  totalLeadStatus > 0
                    ? `${Math.round(((totalLeadStatus - stats.statusBreakdown.moi) / totalLeadStatus) * 100)}%`
                    : '—',
                icon: 'tabler:check',
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                label: 'Leads / user trung bình',
                value:
                  stats.totals.users > 0
                    ? (stats.totals.leads / stats.totals.users).toFixed(1)
                    : '—',
                icon: 'tabler:chart-pie',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                label: 'Định giá / user trung bình',
                value:
                  stats.totals.users > 0
                    ? (stats.totals.valuations / stats.totals.users).toFixed(1)
                    : '—',
                icon: 'tabler:calculator',
                color: 'text-violet-600 bg-violet-50',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon icon={s.icon} className="text-xl" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
