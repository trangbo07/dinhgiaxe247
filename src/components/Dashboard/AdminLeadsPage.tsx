'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { type GuestLead, statusLabels } from './DashboardGuestLeads'

export default function AdminLeadsPage() {
  const [items, setItems] = useState<GuestLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterIntent, setFilterIntent] = useState<'all' | 'mua' | 'ban'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'moi' | 'da_lien_he' | 'dong'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (filterIntent !== 'all') params.set('intent', filterIntent)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    try {
      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [filterIntent, filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const formatPrice = (low: number | null, high: number | null, price: number | null) => {
    if (low != null && high != null) return `${low.toLocaleString('vi-VN')} – ${high.toLocaleString('vi-VN')} đ`
    if (price != null) return `${price.toLocaleString('vi-VN')} đ`
    return '—'
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex items-center gap-2 lg:hidden">
        <p className="min-w-0 flex-1 text-xs leading-snug text-slate-500">
          Tất cả leads từ toàn hệ thống.
        </p>
        <button type="button" onClick={load} disabled={loading} aria-label="Làm mới"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-midnight_text">Tất cả Leads</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Toàn bộ guest leads từ hệ thống (tối đa 500 bản ghi mới nhất).
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', 'mua', 'ban'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setFilterIntent(v)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold sm:px-4 ${filterIntent === v ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
              {v === 'all' ? 'Tất cả' : v === 'mua' ? 'Mua' : 'Bán'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', 'moi', 'da_lien_he', 'dong'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setFilterStatus(v)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold sm:px-4 ${filterStatus === v ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
              {v === 'all' ? 'Tất cả' : statusLabels[v]?.label ?? v}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
          Không có lead nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            {items.length} leads
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((lead) => (
              <div key={lead.id} className="flex min-w-0 items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-midnight_text">{lead.full_name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${lead.intent === 'mua' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {lead.intent === 'mua' ? 'Mua' : 'Bán'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabels[lead.status]?.className ?? 'bg-slate-100'}`}>
                      {statusLabels[lead.status]?.label ?? lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {lead.phone} · {lead.brand} {lead.model} {lead.year ?? ''}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {new Date(lead.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-primary">
                    {formatPrice(lead.price_low, lead.price_high, lead.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
