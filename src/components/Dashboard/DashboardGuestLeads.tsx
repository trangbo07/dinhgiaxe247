'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'

export type GuestLead = {
  id: string
  full_name: string
  phone: string
  intent: 'mua' | 'ban'
  brand: string
  model: string
  year: number | null
  version: string | null
  color: string | null
  mileage: number | null
  price: number | null
  price_low: number | null
  price_high: number | null
  explanation: string | null
  source: string | null
  status: 'moi' | 'da_lien_he' | 'dong'
  created_at: string
}

const statusLabels: Record<string, { label: string; className: string }> = {
  moi: { label: 'Mới', className: 'bg-blue-100 text-blue-800' },
  da_lien_he: { label: 'Đã liên hệ', className: 'bg-amber-100 text-amber-800' },
  dong: { label: 'Đóng', className: 'bg-slate-100 text-slate-600' },
}

export default function DashboardGuestLeads() {
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
      const res = await fetch(`/api/guest-leads?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filterIntent, filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/guest-leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại')
      toast.success('Đã cập nhật trạng thái')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  const formatPrice = (low: number | null, high: number | null, price: number | null) => {
    if (low != null && high != null) {
      return `${low.toLocaleString('vi-VN')} – ${high.toLocaleString('vi-VN')} đ`
    }
    if (price != null) return `${price.toLocaleString('vi-VN')} đ`
    return '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-midnight_text">Khách từ website</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Khách chưa đăng nhập đã định giá trên trang chủ — đầy đủ họ tên, SĐT, mua/bán, thông tin
            xe và kết quả giá. Dùng để sales liên hệ và chốt deal.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 font-semibold text-sm hover:bg-slate-200">
          <Icon icon="tabler:refresh" />
          Làm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold text-slate-500 self-center mr-1">Nhu cầu:</span>
        {(['all', 'mua', 'ban'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterIntent(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              filterIntent === v ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}>
            {v === 'all' ? 'Tất cả' : v === 'mua' ? 'Mua xe' : 'Bán xe'}
          </button>
        ))}
        <span className="text-xs font-bold text-slate-500 self-center mx-2">Trạng thái:</span>
        {(['all', 'moi', 'da_lien_he', 'dong'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterStatus(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              filterStatus === v ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}>
            {v === 'all' ? 'Tất cả' : statusLabels[v]?.label ?? v}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-xs">
            Chạy <code className="bg-amber-100 px-1 rounded">002_guest_leads.sql</code> và cấu hình{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="text-4xl text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed p-12 text-center text-slate-500">
          Chưa có lead khách. Lead sẽ xuất hiện khi khách định giá trên trang chủ.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((lead) => (
            <article
              key={lead.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-midnight_text">{lead.full_name}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        lead.intent === 'mua' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                      {lead.intent === 'mua' ? 'Muốn mua' : 'Muốn bán'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        statusLabels[lead.status]?.className ?? 'bg-slate-100'
                      }`}>
                      {statusLabels[lead.status]?.label ?? lead.status}
                    </span>
                  </div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                    <Icon icon="tabler:phone" />
                    {lead.phone}
                  </a>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(lead.created_at).toLocaleString('vi-VN')}
                    {lead.source ? ` · Nguồn giá: ${lead.source}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Giá tham chiếu</p>
                  <p className="text-lg font-black text-primary">{formatPrice(lead.price_low, lead.price_high, lead.price)}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4 p-4 rounded-xl bg-slate-50">
                <p>
                  <span className="text-slate-500">Xe:</span>{' '}
                  <strong>
                    {lead.brand} {lead.model}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Chi tiết:</span>{' '}
                  {[lead.year, lead.version, lead.color, lead.mileage != null ? `${lead.mileage.toLocaleString('vi-VN')} km` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {lead.explanation && (
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 border-l-4 border-primary/30 pl-3">
                  {lead.explanation}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 self-center mr-1">Cập nhật:</span>
                {(['moi', 'da_lien_he', 'dong'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={lead.status === s}
                    onClick={() => updateStatus(lead.id, s)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default">
                    {statusLabels[s].label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
